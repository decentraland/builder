import { createFetchComponent } from '@well-known-components/fetch-component'
import { CatalystClient, ContentClient, createContentClient } from 'dcl-catalyst-client'
import { Authenticator, AuthIdentity } from '@dcl/crypto'
import { Entity, EntityType } from '@dcl/schemas'
import cryptoFetch from 'decentraland-crypto-fetch'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { buildEntity } from 'dcl-catalyst-client/dist/client/utils/DeploymentBuilder'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import { takeLatest, put, select, call, take, all } from 'redux-saga/effects'
import { config } from 'config'
import { BuilderAPI, getEmptySceneUrl, getPreviewUrl } from 'lib/api/builder'
import { Deployment, SceneDefinition, Placement } from 'modules/deployment/types'
import { takeScreenshot } from 'modules/editor/actions'
import { fetchENSWorldStatusRequest } from 'modules/ens/actions'
import { isLoggedIn } from 'modules/identity/selectors'
import { getIdentity } from 'modules/identity/utils'
import { FETCH_LANDS_SUCCESS, FetchLandsSuccessAction } from 'modules/land/actions'
import { getCoordsByEstateId } from 'modules/land/selectors'
import { coordsToId, idToCoords } from 'modules/land/utils'
import { LandType } from 'modules/land/types'
import { recordMediaRequest, RECORD_MEDIA_SUCCESS, RecordMediaSuccessAction } from 'modules/media/actions'
import { getMedia } from 'modules/media/selectors'
import { objectURLToBlob } from 'modules/media/utils'
import { Media } from 'modules/media/types'
import { getName } from 'modules/profile/selectors'
import { createFiles, EXPORT_PATH } from 'modules/project/export'
import { getCurrentProject, getData as getProjects } from 'modules/project/selectors'
import { getData as getDeployments } from 'modules/deployment/selectors'
import { Project } from 'modules/project/types'
import { getSceneByProjectId } from 'modules/scene/utils'
import { Scene } from 'modules/scene/types'
import { store } from 'modules/common/store' // PREVENTS IMPORT UNDEFINED
import { getParcelOrientation } from 'modules/project/utils'
import {
  DEPLOY_TO_POOL_REQUEST,
  deployToPoolFailure,
  deployToPoolSuccess,
  setProgress,
  DEPLOY_TO_LAND_REQUEST,
  deployToLandFailure,
  DeployToLandRequestAction,
  DeployToPoolRequestAction,
  deployToLandSuccess,
  CLEAR_DEPLOYMENT_REQUEST,
  ClearDeploymentRequestAction,
  clearDeploymentFailure,
  clearDeploymentSuccess,
  FETCH_DEPLOYMENTS_REQUEST,
  FetchDeploymentsRequestAction,
  fetchDeploymentsRequest,
  fetchDeploymentsSuccess,
  fetchDeploymentsFailure,
  deployToWorldSuccess,
  deployToWorldFailure,
  DeployToWorldRequestAction,
  DEPLOY_TO_WORLD_REQUEST,
  FetchWorldDeploymentsRequestAction,
  FETCH_WORLD_DEPLOYMENTS_REQUEST,
  fetchWorldDeploymentsSuccess,
  fetchWorldDeploymentsFailure,
  fetchWorldDeploymentsRequest
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

export function* deploymentSaga(builder: BuilderAPI, catalystClient: CatalystClient) {
  yield takeLatest(DEPLOY_TO_POOL_REQUEST, handleDeployToPoolRequest)
  yield takeLatest(DEPLOY_TO_LAND_REQUEST, handleDeployToLandRequest)
  yield takeLatest(CLEAR_DEPLOYMENT_REQUEST, handleClearDeploymentRequest)
  yield takeLatest(FETCH_DEPLOYMENTS_REQUEST, handleFetchDeploymentsRequest)
  yield takeLatest(FETCH_LANDS_SUCCESS, handleFetchLandsSuccess)
  yield takeLatest(DEPLOY_TO_WORLD_REQUEST, handleDeployToWorldRequest)
  yield takeLatest(FETCH_WORLD_DEPLOYMENTS_REQUEST, handleFetchWorldDeploymentsRequest)

  function* handleDeployToPoolRequest(action: DeployToPoolRequestAction) {
    const { projectId, additionalInfo } = action.payload
    const rawProject: Project | null = yield select(getCurrentProject)

    if (rawProject && rawProject.id === projectId) {
      const { thumbnail: _thumbnail, ...project } = rawProject

      try {
        yield put(setProgress(ProgressStage.NONE, 1))
        yield put(recordMediaRequest())
        const successAction: RecordMediaSuccessAction = yield take(RECORD_MEDIA_SUCCESS)
        const { north, east, south, west, preview } = successAction.payload.media

        if (!north || !east || !south || !west || !preview) {
          throw new Error('Failed to capture scene preview')
        }

        yield put(setProgress(ProgressStage.NONE, 30))
        yield call(() => builder.uploadMedia(rawProject.id, preview, { north, east, south, west }))

        yield put(setProgress(ProgressStage.NONE, 60))
        yield put(takeScreenshot())

        yield put(setProgress(ProgressStage.NONE, 90))
        yield call(() => builder.deployToPool(project.id, additionalInfo))

        yield put(setProgress(ProgressStage.NONE, 100))
        yield put(deployToPoolSuccess(window.URL.createObjectURL(preview)))
      } catch (e) {
        yield put(deployToPoolFailure(isErrorWithMessage(e) ? e.message : 'Unknown error'))
      }
    } else if (rawProject) {
      yield put(deployToPoolFailure('Unable to Publish: Not current project'))
    } else {
      yield put(deployToPoolFailure('Unable to Publish: Invalid project'))
    }
  }

  function* deployScene(
    deployFailure: typeof deployToWorldFailure | typeof deployToLandFailure,
    contentClient: ContentClient,
    projectId: string,
    placement: Placement,
    world?: string
  ) {
    const projects: ReturnType<typeof getProjects> = yield select(getProjects)

    const project = projects[projectId]
    if (!project) {
      yield put(deployFailure('Unable to Publish: Invalid project'))
      return
    }

    const scene: Scene = yield call(getSceneByProjectId, project.id)
    if (!scene) {
      yield put(deployFailure('Unable to Publish: Invalid scene'))
      return
    }

    if (scene.sdk6) {
      const identity: AuthIdentity = yield call(getIdentity)
      if (!identity) {
        yield put(deployFailure('Unable to Publish: Invalid identity'))
        return
      }

      const author: ReturnType<typeof getName> = yield select(getName)

      // upload media if logged in
      let previewUrl: string | null = null
      const isLoggedInResult: boolean = yield select(isLoggedIn)
      if (isLoggedInResult) {
        const media: Media | null = yield select(getMedia)
        if (media) {
          const [north, east, south, west, thumbnail]: Array<Blob> = yield all([
            call(objectURLToBlob, media.north),
            call(objectURLToBlob, media.east),
            call(objectURLToBlob, media.south),
            call(objectURLToBlob, media.west),
            call(objectURLToBlob, media.preview)
          ])

          yield call(
            [builder, 'uploadMedia'],
            project.id,
            thumbnail,
            { north, east, south, west },
            handleProgress(ProgressStage.UPLOAD_RECORDING)
          )

          previewUrl = getPreviewUrl(project.id)
        } else {
          console.warn('Failed to upload scene preview')
        }
      }

      const files: Record<string, string> = yield call(createFiles, {
        project,
        scene: scene.sdk6,
        point: placement.point,
        rotation: placement.rotation,
        author,
        thumbnail: previewUrl,
        isDeploy: true,
        onProgress: handleProgress(ProgressStage.CREATE_FILES),
        world
      })

      const contentFiles: Map<string, Buffer> = yield call(makeContentFiles, files)

      // Remove the old communications property if it exists
      const sceneDefinition: SceneDefinition = JSON.parse(files[EXPORT_PATH.SCENE_FILE])

      const { entityId, files: hashedFiles } = yield call(buildEntity, {
        type: EntityType.SCENE,
        pointers: [...sceneDefinition.scene.parcels],
        metadata: sceneDefinition,
        files: contentFiles
      })

      const authChain = Authenticator.signPayload(identity, entityId)
      yield call([contentClient, 'deploy'], { entityId, files: hashedFiles, authChain })
      // generate new deployment
      const address: string = yield select(getAddress) || ''

      return {
        id: entityId,
        placement,
        owner: address,
        timestamp: +new Date(),
        layout: project.layout,
        name: project.title,
        thumbnail: previewUrl,
        projectId: project.id,
        base: sceneDefinition.scene.base,
        parcels: sceneDefinition.scene.parcels,
        world
      }
    } else {
      const identity: AuthIdentity = yield call(getIdentity)
      if (!identity) {
        yield put(deployFailure('Unable to Publish: Invalid identity'))
        return
      }

      const address: ReturnType<typeof getAddress> = yield select(getAddress)
      const name: ReturnType<typeof getName> = yield select(getName)

      const files: Record<string, string | Blob> = {}

      files['bin/index.js'] = yield call([builder, 'fetchMain'], project.id)
      files['main.crdt'] = yield call([builder, 'fetchCrdt'], project.id)

      const promises: Promise<{ path: string; blob: Blob }>[] = []
      for (const path of Object.keys(scene.sdk7.mappings)) {
        const hash = scene.sdk7.mappings[path]
        const promise = builder.fetchContent(hash).then(blob => ({ path, blob }))
        promises.push(promise)
      }
      const results: { path: string; blob: Blob }[] = yield call([Promise, 'all'], promises)
      for (const { path, blob } of results) {
        files[path] = blob
      }

      let previewUrl: string | null = null
      const media: Media | null = yield select(getMedia)
      if (media) {
        const thumbnail: Blob = yield call(objectURLToBlob, media.preview)
        yield call(
          [builder, 'uploadMedia'],
          project.id,
          thumbnail,
          { north: thumbnail, east: thumbnail, south: thumbnail, west: thumbnail },
          handleProgress(ProgressStage.UPLOAD_RECORDING)
        )
        files['scene-thumbnail.png'] = thumbnail
        previewUrl = getPreviewUrl(project.id)
      } else {
        console.warn('Failed to upload scene preview')
      }

      const parcels = getParcelOrientation(project.layout, placement.point, placement.rotation)
      const base = parcels.reduce((base, parcel) => (parcel.x <= base.x && parcel.y <= base.y ? parcel : base), parcels[0])

      const toString = ({ x, y }: { x: number; y: number }) => `${x},${y}`

      const componentNames = scene.sdk7.composite.components.reduce(
        (components, component) => components.add(component.name),
        new Set<string>()
      )
      const smartItemComponents = ['asset-packs::Actions', 'asset-packs::Triggers']
      const hasSmartItems = Array.from(componentNames).some(componentName => smartItemComponents.includes(componentName))

      const definition: SceneDefinition = {
        allowedMediaHostnames: [],
        owner: address || '',
        main: 'bin/index.js',
        contact: {
          name: name || '',
          email: ''
        },
        display: {
          title: project.title,
          favicon: 'favicon_asset',
          navmapThumbnail: 'scene-thumbnail.png'
        },
        tags: hasSmartItems ? ['is_smart'] : [],
        scene: {
          base: toString(base),
          parcels: parcels.map(toString)
        },
        ecs7: true,
        runtimeVersion: '7',
        source: {
          version: 1,
          origin: 'builder',
          point: base,
          projectId: project.id,
          layout: {
            rows: project.layout.rows,
            cols: project.layout.cols
          }
        }
      }

      if (world) {
        definition.worldConfiguration = {
          name: world
        }
      }

      const contents: Map<string, Buffer> = yield call(makeContentFiles, files)

      const { entityId, files: hashedFiles } = yield call(buildEntity, {
        type: EntityType.SCENE,
        pointers: definition.scene.parcels,
        metadata: definition,
        files: contents
      })

      const authChain = Authenticator.signPayload(identity, entityId)
      yield call([contentClient, 'deploy'], { entityId, files: hashedFiles, authChain })

      return {
        id: entityId,
        placement,
        owner: address,
        timestamp: +new Date(),
        layout: project.layout,
        name: project.title,
        thumbnail: previewUrl,
        projectId: project.id,
        base: definition.scene.base,
        parcels: definition.scene.parcels,
        world
      }
    }
  }

  function* handleDeployToWorldRequest(action: DeployToWorldRequestAction) {
    const { world, projectId } = action.payload
    const contentClient = createContentClient({
      url: getWorldsContentServerUrl(),
      fetcher: createFetchComponent()
    })
    try {
      const deployment: Deployment = yield call(
        deployScene,
        deployToWorldFailure,
        contentClient,
        projectId,
        { point: { x: 0, y: 0 }, rotation: 'north' },
        world
      )
      yield put(fetchENSWorldStatusRequest(world))
      yield put(fetchWorldDeploymentsRequest([world]))
      yield put(deployToWorldSuccess(deployment))
    } catch (e) {
      yield put(deployToWorldFailure(isErrorWithMessage(e) ? e.message.split('\n')[0] : 'Unknown error'))
    }
  }

  function* handleDeployToLandRequest(action: DeployToLandRequestAction) {
    const { placement, projectId, overrideDeploymentId } = action.payload
    try {
      const contentClient: ContentClient = yield call([catalystClient, 'getContentClient'])
      const deployment: Deployment = yield call(deployScene, deployToLandFailure, contentClient, projectId, placement)
      yield put(deployToLandSuccess(deployment, overrideDeploymentId))
    } catch (e) {
      yield put(deployToLandFailure(isErrorWithMessage(e) ? e.message.split('\n')[0] : 'Unknown error'))
    }
  }

  function* handleClearDeploymentRequest(action: ClearDeploymentRequestAction) {
    const { deploymentId } = action.payload

    try {
      const deployments: ReturnType<typeof getDeployments> = yield select(getDeployments)
      const deployment = deployments[deploymentId]

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
        const [emptyProject, emptyScene] = getEmptyDeployment(deployment.projectId || UNPUBLISHED_PROJECT_ID)
        const files: UnwrapPromise<ReturnType<typeof createFiles>> = yield call(createFiles, {
          project: emptyProject,
          scene: emptyScene,
          point: placement.point,
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
    const worldContentClient = createContentClient({ url: getWorldsContentServerUrl(), fetcher: createFetchComponent() })
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
