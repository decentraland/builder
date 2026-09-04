import { CatalystClient, ContentClient, createContentClient } from 'dcl-catalyst-client'
import { Authenticator, AuthIdentity } from '@dcl/crypto'
import { Entity, EntityType } from '@dcl/schemas'
import cryptoFetch from 'decentraland-crypto-fetch'
import { buildEntity } from 'dcl-catalyst-client/dist/client/utils/DeploymentBuilder'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import { takeLatest, takeEvery, put, select, call } from 'redux-saga/effects'
import { config } from 'config'
import { getEmptySceneUrl } from 'lib/api/builder'
import { Deployment, SceneDefinition, Placement, Coordinate } from 'modules/deployment/types'
import { getIdentity } from 'modules/identity/utils'
import { FETCH_LANDS_SUCCESS, FetchLandsSuccessAction } from 'modules/land/actions'
import { getCoordsByEstateId, getLandTiles } from 'modules/land/selectors'
import { coordsToId, idToCoords } from 'modules/land/utils'
import { LandType } from 'modules/land/types'
import { createFiles, EXPORT_PATH } from 'modules/project/export'
import { getData as getDeployments } from 'modules/deployment/selectors'
import { store } from 'modules/common/store' // PREVENTS IMPORT UNDEFINED
import {
  setProgress,
  CLEAR_DEPLOYMENT_REQUEST,
  ClearDeploymentRequestAction,
  clearDeploymentFailure,
  clearDeploymentSuccess,
  FETCH_DEPLOYMENTS_REQUEST,
  FetchDeploymentsRequestAction,
  fetchDeploymentsRequest,
  fetchDeploymentsSuccess,
  fetchDeploymentsFailure,
  FetchWorldDeploymentsRequestAction,
  FETCH_WORLD_DEPLOYMENTS_REQUEST,
  fetchWorldDeploymentsSuccess,
  fetchWorldDeploymentsFailure
} from './actions'
import { makeContentFiles } from './contentUtils'
import { UNPUBLISHED_PROJECT_ID, getEmptyDeployment, getThumbnail } from './utils'
import { ProgressStage } from './types'

const getWorldsContentServerUrl = () => config.get('WORLDS_CONTENT_SERVER', '')

type UnwrapPromise<T> = T extends PromiseLike<infer U> ? U : T

// TODO: Remove this. This is using the store directly which it shouldn't and causes a circular dependency.
const handleProgress = (type: ProgressStage) => (args: { loaded: number; total: number }) => {
  const { loaded, total } = args
  const progress = ((loaded / total) * 100) | 0
  store.dispatch(setProgress(type, progress))
}

export function* deploymentSaga(catalystClient: CatalystClient) {
  yield takeLatest(CLEAR_DEPLOYMENT_REQUEST, handleClearDeploymentRequest)
  yield takeLatest(FETCH_DEPLOYMENTS_REQUEST, handleFetchDeploymentsRequest)
  yield takeLatest(FETCH_LANDS_SUCCESS, handleFetchLandsSuccess)
  yield takeEvery(FETCH_WORLD_DEPLOYMENTS_REQUEST, handleFetchWorldDeploymentsRequest)

  function* handleClearDeploymentRequest(action: ClearDeploymentRequestAction) {
    const { deploymentId } = action.payload

    try {
      const deployments: ReturnType<typeof getDeployments> = yield select(getDeployments)
      const deployment = deployments[deploymentId]
      const landsOperatedByTheUser = (yield select(getLandTiles)) as ReturnType<typeof getLandTiles>

      if (!deployment) {
        throw new Error('Unable to clear deployment: Invalid deployment')
      }

      const identity: AuthIdentity = yield call(getIdentity)

      if (!identity) {
        throw new Error('Unable to clear deployment: Invalid identity')
      }

      if (deployment.world) {
        const response: Response = yield call(cryptoFetch, `${getWorldsContentServerUrl()}/entities/${deployment.world}`, {
          method: 'DELETE',
          identity
        })

        if (!response.ok) {
          throw new Error(`Unable to clear deployment: Response is not ok, status ${response.status}`)
        }
      } else {
        const contentClient: ContentClient = yield call([catalystClient, 'getContentClient'])
        const { placement } = deployment

        // If deployment was done with a placement point not owned by the user, we need to find a point that is currently own by them.
        // This could happen if a estate has a deployment, the estate gets dissolved and the lands sent to different users.
        const landsBelongingToTheDeployment = deployments[deploymentId].parcels
          .filter(landId => landsOperatedByTheUser[landId])
          .map(landId => {
            // LandTiles can be either parcels or estates.
            // Parcels can be used as is, but estates need to be converted to a structure with the parcel information.
            if (landsOperatedByTheUser[landId].land.type === LandType.PARCEL) {
              return landsOperatedByTheUser[landId].land
            } else {
              // Craft a land object with the same structure as a parcel
              const [x, y] = landId.split(',').map(Number)
              return { id: landId, x, y }
            }
          })
        let placementPoint: Coordinate = placement.point
        const isPlacementPointOwnedByUser = landsBelongingToTheDeployment.some(
          land => land.x === placement.point.x && land.y === placement.point.y
        )
        if (!isPlacementPointOwnedByUser && landsBelongingToTheDeployment[0]) {
          placementPoint = { x: landsBelongingToTheDeployment[0].x ?? 0, y: landsBelongingToTheDeployment[0].y ?? 0 }
        }

        const [emptyProject, emptyScene] = getEmptyDeployment(deployment.projectId || UNPUBLISHED_PROJECT_ID)
        const files: UnwrapPromise<ReturnType<typeof createFiles>> = yield call(createFiles, {
          project: emptyProject,
          scene: emptyScene,
          point: placementPoint,
          rotation: placement.rotation,
          thumbnail: getEmptySceneUrl(),
          author: null,
          isDeploy: true,
          isEmpty: true,
          onProgress: handleProgress(ProgressStage.CREATE_FILES),
          world: deployment.world ?? undefined
        })
        const contentFiles: Map<string, Buffer> = yield call(makeContentFiles, files)
        const sceneDefinition: SceneDefinition = JSON.parse(files[EXPORT_PATH.SCENE_FILE])
        const { entityId, files: hashedFiles } = yield call(buildEntity, {
          type: EntityType.SCENE,
          pointers: [...sceneDefinition.scene.parcels],
          metadata: sceneDefinition,
          files: contentFiles
        })
        const authChain = Authenticator.signPayload(identity, entityId)
        yield call([contentClient, 'deploy'], { entityId, files: hashedFiles, authChain })
      }

      yield put(clearDeploymentSuccess(deploymentId))
    } catch (e) {
      yield put(clearDeploymentFailure(deploymentId, isErrorWithMessage(e) ? e.message : 'Unknown error'))
    }
  }

  function* handleFetchLandsSuccess(action: FetchLandsSuccessAction) {
    const coords: string[] = []
    for (const land of action.payload.lands) {
      switch (land.type) {
        case LandType.PARCEL: {
          coords.push(coordsToId(land.x!, land.y!))
          break
        }
        case LandType.ESTATE: {
          const coordsByEstateId: ReturnType<typeof getCoordsByEstateId> = yield select(getCoordsByEstateId)
          if (land.id in coordsByEstateId) {
            for (const coord of coordsByEstateId[land.id]) {
              coords.push(coord)
            }
          }
        }
      }
    }
    yield put(fetchDeploymentsRequest(coords))
  }

  function formatDeployments(entities: Entity[], getDeploymentId: (entity: Entity) => string): Deployment[] {
    const deployments = new Map<string, Deployment>()
    for (const entity of entities.sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1))) {
      const id = getDeploymentId(entity)
      if (id) {
        const [x, y] = idToCoords(entity.pointers[0])
        const content = entity.content
        const definition = entity.metadata as SceneDefinition
        let name = 'Untitled Scene'
        if (definition && definition.display && definition.display.title && definition.display.title !== 'interactive-text') {
          name = definition.display.title
        }
        const thumbnail: string | null = getThumbnail(definition, content)
        const placement: Placement = {
          point: { x, y },
          rotation: (definition && definition.source && definition.source.rotation) || 'north'
        }
        const projectId = (definition && definition.source && definition.source.projectId) || null
        const layout = (definition && definition.source && definition.source.layout) || null
        const { base, parcels } = definition.scene
        const isEmpty = !!(definition && definition.source && definition.source.isEmpty)
        if (!isEmpty) {
          deployments.set(id, {
            id: entity.id,
            timestamp: entity.timestamp,
            projectId,
            name,
            thumbnail,
            placement,
            owner: definition.owner,
            layout,
            base,
            parcels,
            world: definition.worldConfiguration?.name
          })
        } else {
          deployments.delete(id)
        }
      }
    }

    return Array.from(deployments.values())
  }

  function* handleFetchDeploymentsRequest(action: FetchDeploymentsRequestAction) {
    const { coords } = action.payload

    try {
      let entities: Entity[] = []

      if (coords.length > 0) {
        const contentClient: ContentClient = yield call([catalystClient, 'getContentClient'])
        entities = yield call([contentClient, 'fetchEntitiesByPointers'], coords)
      }
      const getSceneDeploymentId = (entity: Entity) => entity.pointers[0]
      yield put(fetchDeploymentsSuccess(coords, formatDeployments(entities, getSceneDeploymentId)))
    } catch (error) {
      yield put(fetchDeploymentsFailure(coords, isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }

  function* handleFetchWorldDeploymentsRequest(action: FetchWorldDeploymentsRequestAction) {
    const { worlds } = action.payload
    const worldContentClient = createContentClient({
      url: getWorldsContentServerUrl(),
      // The browser/node-fetch type mismatch this used to suppress is gone as of the
      // dependency bump this change carries; tsc errors on the directive if it returns.
      fetcher: { fetch: (url, init) => fetch(url, init) }
    })
    try {
      const entities: Entity[] = []

      if (worlds.length > 0) {
        for (const world of worlds) {
          // At the moment, worlds content server only support one pointer per entity

          const entity: Entity[] = yield call([worldContentClient, 'fetchEntitiesByPointers'], [world])
          entities.push(entity[0])
        }
      }
      const getWorldDeploymentId = (entity: Entity) => entity.id
      yield put(fetchWorldDeploymentsSuccess(worlds, formatDeployments(entities, getWorldDeploymentId)))
    } catch (error) {
      yield put(fetchWorldDeploymentsFailure(worlds, isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }
}
