import type { History } from 'history'
import type { Wearable } from 'decentraland-ecs'
import { takeLatest, select, put, call, delay, take, getContext } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import { IPreviewController, PreviewEmoteEventType } from '@dcl/schemas'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import {
  setItems,
  SET_BODY_SHAPE,
  SetBodyShapeAction,
  FETCH_BASE_WEARABLES_REQUEST,
  fetchBaseWearablesSuccess,
  fetchBaseWearablesFailure,
  setEmotePlaying,
  SET_WEARABLE_PREVIEW_CONTROLLER,
  SET_SPRING_BONE_PARAM,
  PUSH_SPRING_BONE_PARAMS,
  ADD_SPRING_BONE_PARAMS,
  DELETE_SPRING_BONE_PARAMS,
  LOAD_SPRING_BONES_REQUEST,
  LoadSpringBonesRequestAction,
  clearSpringBones,
  setBones,
  loadSpringBonesSuccess,
  loadSpringBonesFailure
} from 'modules/editor/actions'
import { BoneNode, CatalystWearable } from 'modules/editor/types'
import { SAVE_ITEM_SUCCESS } from 'modules/item/actions'
import { Item } from 'modules/item/types'
import { PEER_URL } from 'lib/api/peer'
import {
  getWearablePreviewController,
  getVisibleItemsFromUrl,
  getSpringBoneParamsForCurrentShape,
  getSpringBonesForCurrentShape,
  getSelectedItemId
} from './selectors'
import { fromCatalystWearableToWearable, fetchGlbBlob } from './utils'
import { isWearable, getRepresentationsModelHashes } from 'modules/item/utils'
import { parseSpringBones } from 'lib/parseSpringBones'

export function* editorSaga() {
  yield takeLatest(SET_WEARABLE_PREVIEW_CONTROLLER, handleSetWearablePreviewController)
  yield takeLatest(SET_BODY_SHAPE, handleSetBodyShape)
  yield takeLatest(FETCH_BASE_WEARABLES_REQUEST, handleFetchBaseWearables)
  yield takeLatest(SET_SPRING_BONE_PARAM, handleSpringBoneParamDebounced)
  yield takeLatest(PUSH_SPRING_BONE_PARAMS, handlePushSpringBoneParams)
  yield takeLatest(ADD_SPRING_BONE_PARAMS, handlePushSpringBoneParams)
  yield takeLatest(DELETE_SPRING_BONE_PARAMS, handlePushSpringBoneParams)
  yield takeLatest(LOAD_SPRING_BONES_REQUEST, handleLoadSpringBones)
  yield takeLatest(SAVE_ITEM_SUCCESS, handleLoadSpringBones)
}

function createWearablePreviewChannel(controller: IPreviewController) {
  return eventChannel(emit => {
    const handleAnimationPlay = () => {
      emit(PreviewEmoteEventType.ANIMATION_PLAY)
    }
    const handleAnimationPause = () => {
      emit(PreviewEmoteEventType.ANIMATION_PAUSE)
    }
    const handleAnimationEnd = () => {
      emit(PreviewEmoteEventType.ANIMATION_END)
    }

    controller.emote.events.on(PreviewEmoteEventType.ANIMATION_PLAY, handleAnimationPlay)
    controller.emote.events.on(PreviewEmoteEventType.ANIMATION_PAUSE, handleAnimationPause)
    controller.emote.events.on(PreviewEmoteEventType.ANIMATION_END, handleAnimationEnd)

    const unsubscribe = () => {
      controller.emote.events.off(PreviewEmoteEventType.ANIMATION_PLAY, handleAnimationPlay)
      controller.emote.events.off(PreviewEmoteEventType.ANIMATION_PAUSE, handleAnimationPause)
      controller.emote.events.off(PreviewEmoteEventType.ANIMATION_END, handleAnimationEnd)
    }

    return unsubscribe
  })
}

function* handleSetWearablePreviewController() {
  const controller: IPreviewController = yield select(getWearablePreviewController)

  if (controller) {
    const emotesChannel = createWearablePreviewChannel(controller)

    try {
      while (true) {
        try {
          const event: string = yield take(emotesChannel)
          switch (event) {
            case PreviewEmoteEventType.ANIMATION_PLAY:
              yield put(setEmotePlaying(true))
              break
            case PreviewEmoteEventType.ANIMATION_PAUSE:
              yield put(setEmotePlaying(false))
              break
            case PreviewEmoteEventType.ANIMATION_END:
              yield put(setEmotePlaying(false))
              break
          }
        } catch (error) {
          yield put(setEmotePlaying(false))
        }
      }
    } finally {
      emotesChannel.close()
    }
  }
}

function* handleSetBodyShape(_action: SetBodyShapeAction) {
  const history: History = yield getContext('history')
  const visibleItems: Item[] = yield select(getVisibleItemsFromUrl, history.location.search)
  yield put(setItems(visibleItems))
}

function* handleFetchBaseWearables() {
  try {
    const response: Response = yield call(
      fetch,
      `${PEER_URL}/lambdas/collections/wearables?collectionId=urn:decentraland:off-chain:base-avatars`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch base wearables')
    }
    const json: { wearables: CatalystWearable[] } = yield response.json()
    const wearables: Wearable[] = json.wearables
      .filter(wearable => {
        const hidesWearables = wearable.data.hides && wearable.data.hides.length > 0
        const replacesWearables = wearable.data.replaces && wearable.data.replaces.length > 0
        return !hidesWearables && !replacesWearables
      })
      .map(fromCatalystWearableToWearable)
    yield put(fetchBaseWearablesSuccess(wearables))
  } catch (e) {
    yield put(fetchBaseWearablesFailure(isErrorWithMessage(e) ? e.message : 'Unknown error'))
  }
}

function* pushSpringBoneParamsToPreview() {
  const controller: IPreviewController | null = yield select(getWearablePreviewController)
  const selectedItemId: string | null = yield select(getSelectedItemId)
  const springBones: ReturnType<typeof getSpringBonesForCurrentShape> = yield select(getSpringBonesForCurrentShape)
  const springBoneParams: ReturnType<typeof getSpringBoneParamsForCurrentShape> = yield select(getSpringBoneParamsForCurrentShape)

  if (!controller || !selectedItemId || springBones.length === 0) {
    return
  }

  try {
    yield call([controller.physics, 'setSpringBonesParams'], selectedItemId, springBoneParams)
  } catch (error) {
    console.warn('Failed to push spring bones params to preview:', error)
  }
}

function* handleSpringBoneParamDebounced() {
  yield delay(1000)
  yield call(pushSpringBoneParamsToPreview)
}

function* handlePushSpringBoneParams() {
  yield call(pushSpringBoneParamsToPreview)
}

function* parseSpringBonesForHash(item: Item, hash: string) {
  try {
    const blob: Blob = yield call(fetchGlbBlob, hash)
    const buffer: ArrayBuffer = yield call([blob, 'arrayBuffer'])
    const { bones }: ReturnType<typeof parseSpringBones> = yield call(parseSpringBones, buffer)

    const metadataParams = item.data.springBones?.models[hash]
    if (metadataParams) {
      for (const bone of bones) {
        if (bone.type === 'spring' && metadataParams[bone.name]) {
          bone.params = metadataParams[bone.name]
        }
      }
    }

    return bones
  } catch (error) {
    console.warn(`Failed to parse spring bones for hash ${hash}:`, error)
    return null
  }
}

function* handleLoadSpringBones(action: LoadSpringBonesRequestAction) {
  const { item } = action.payload

  try {
    yield put(clearSpringBones())

    if (!isWearable(item)) {
      yield put(loadSpringBonesSuccess(item.id))
      return
    }

    const reachableHashes = getRepresentationsModelHashes(item)
    for (const hash of reachableHashes) {
      const bones: BoneNode[] | null = yield call(parseSpringBonesForHash, item, hash)
      if (bones === null) continue
      yield put(setBones(hash, bones, item.id))
    }

    yield put(loadSpringBonesSuccess(item.id))
  } catch (error) {
    yield put(loadSpringBonesFailure(item.id, isErrorWithMessage(error) ? error.message : 'Unknown error'))
  }
}
