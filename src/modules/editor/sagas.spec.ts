import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { select } from 'redux-saga/effects'
import { BodyShape } from '@dcl/schemas'
import { mockedItem } from 'specs/item'
import { Item, ItemType } from 'modules/item/types'
import { editorSaga } from './sagas'
import { fetchGlbBlob } from './utils'
import {
  clearSpringBones,
  loadSpringBonesFailure,
  loadSpringBonesRequest,
  loadSpringBonesSuccess,
  setBones,
  setBonesByShape
} from './actions'
import { saveItemSuccess } from 'modules/item/actions'
import { getBodyShape } from './selectors'
import { parseSpringBones } from 'lib/parseSpringBones'

const aHash = 'aHash'
const otherHash = 'otherHash'

function makeBlob(): Blob {
  return {
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
  } as unknown as Blob
}

describe('when handling the load spring bones request', () => {
  describe('and the item is not a wearable', () => {
    let item: Item

    beforeEach(() => {
      item = { ...mockedItem, type: ItemType.EMOTE } as unknown as Item
    })

    it('should dispatch clearSpringBones and loadSpringBonesSuccess without parsing', () => {
      return expectSaga(editorSaga as any)
        .put(clearSpringBones())
        .not.call(fetchGlbBlob, expect.any(String))
        .put(loadSpringBonesSuccess(item.id))
        .dispatch(loadSpringBonesRequest(item))
        .silentRun()
    })
  })

  describe('and the item has a single representation', () => {
    let item: Item
    const blob = makeBlob()

    beforeEach(() => {
      item = {
        ...mockedItem,
        contents: { 'anItemContent.glb': aHash },
        data: {
          ...mockedItem.data,
          representations: [
            {
              bodyShapes: [BodyShape.MALE],
              mainFile: 'anItemContent.glb',
              contents: ['anItemContent.glb'],
              overrideReplaces: [],
              overrideHides: []
            }
          ]
        }
      }
    })

    it('should fetch the GLB once and dispatch setBones for the active body shape', () => {
      return expectSaga(editorSaga as any)
        .provide([
          [select(getBodyShape), BodyShape.MALE],
          [matchers.call.fn(fetchGlbBlob), blob],
          [matchers.call.fn(parseSpringBones), { bones: [] }]
        ])
        .put(clearSpringBones())
        .put(setBones([], item.id))
        .put(loadSpringBonesSuccess(item.id))
        .dispatch(loadSpringBonesRequest(item))
        .silentRun()
    })
  })

  describe('and the item has both male and female representations', () => {
    let item: Item
    const blob = makeBlob()

    beforeEach(() => {
      item = {
        ...mockedItem,
        contents: { 'male.glb': aHash, 'female.glb': otherHash },
        data: {
          ...mockedItem.data,
          representations: [
            {
              bodyShapes: [BodyShape.MALE],
              mainFile: 'male.glb',
              contents: ['male.glb'],
              overrideReplaces: [],
              overrideHides: []
            },
            {
              bodyShapes: [BodyShape.FEMALE],
              mainFile: 'female.glb',
              contents: ['female.glb'],
              overrideReplaces: [],
              overrideHides: []
            }
          ]
        }
      }
    })

    it('should dispatch setBonesByShape for both shapes, setBones for the active one and loadSpringBonesSuccess', () => {
      return expectSaga(editorSaga as any)
        .provide([
          [select(getBodyShape), BodyShape.FEMALE],
          [matchers.call.fn(fetchGlbBlob), blob],
          [matchers.call.fn(parseSpringBones), { bones: [] }]
        ])
        .put(clearSpringBones())
        .put(setBonesByShape(BodyShape.MALE, [], item.id))
        .put(setBonesByShape(BodyShape.FEMALE, [], item.id))
        .put(setBones([], item.id))
        .put(loadSpringBonesSuccess(item.id))
        .dispatch(loadSpringBonesRequest(item))
        .silentRun()
    })
  })

  describe('and metadata params are present for a spring bone', () => {
    let item: Item
    const blob = makeBlob()
    const metadataParams = {
      stiffness: 3,
      gravityPower: 1,
      gravityDir: [0, -1, 0] as [number, number, number],
      drag: 0.4,
      center: undefined
    }

    beforeEach(() => {
      item = {
        ...mockedItem,
        contents: { 'anItemContent.glb': aHash },
        data: {
          ...mockedItem.data,
          representations: [
            {
              bodyShapes: [BodyShape.MALE],
              mainFile: 'anItemContent.glb',
              contents: ['anItemContent.glb'],
              overrideReplaces: [],
              overrideHides: []
            }
          ],
          springBones: {
            version: 1,
            models: { [aHash]: { springbone_hair: metadataParams } }
          }
        }
      }
    })

    it('should overlay metadata params onto the parsed spring bone', () => {
      const parsed = { bones: [{ name: 'springbone_hair', nodeId: 1, type: 'spring' as const, children: [] }] }
      return expectSaga(editorSaga as any)
        .provide([
          [select(getBodyShape), BodyShape.MALE],
          [matchers.call.fn(fetchGlbBlob), blob],
          [matchers.call.fn(parseSpringBones), parsed]
        ])
        .put(clearSpringBones())
        .put(setBones([{ name: 'springbone_hair', nodeId: 1, type: 'spring', children: [], params: metadataParams }], item.id))
        .put(loadSpringBonesSuccess(item.id))
        .dispatch(loadSpringBonesRequest(item))
        .silentRun()
    })
  })

  describe('and a single GLB is shared across male and female representations', () => {
    let item: Item
    const blob = makeBlob()
    const metadataParams = {
      stiffness: 2.81,
      gravityPower: 0,
      gravityDir: [0, -1, 0] as [number, number, number],
      drag: 0.31,
      isRoot: true
    }

    beforeEach(() => {
      // Same hash under two prefixed paths — builder adds male/ and female/ prefixes
      // on upload, but both point to the same GLB bytes.
      item = {
        ...mockedItem,
        contents: { 'male/shared.glb': aHash, 'female/shared.glb': aHash },
        data: {
          ...mockedItem.data,
          representations: [
            {
              bodyShapes: [BodyShape.MALE],
              mainFile: 'male/shared.glb',
              contents: ['male/shared.glb'],
              overrideReplaces: [],
              overrideHides: []
            },
            {
              bodyShapes: [BodyShape.FEMALE],
              mainFile: 'female/shared.glb',
              contents: ['female/shared.glb'],
              overrideReplaces: [],
              overrideHides: []
            }
          ],
          springBones: {
            version: 1,
            models: { [aHash]: { Hair_springBone: metadataParams } }
          }
        }
      }
    })

    it('should resolve metadata params via the shared content hash for the female body shape', () => {
      const parsed = { bones: [{ name: 'Hair_springBone', nodeId: 1, type: 'spring' as const, children: [] }] }
      return expectSaga(editorSaga as any)
        .provide([
          [select(getBodyShape), BodyShape.FEMALE],
          [matchers.call.fn(fetchGlbBlob), blob],
          [matchers.call.fn(parseSpringBones), parsed]
        ])
        .put(clearSpringBones())
        .put(setBones([{ name: 'Hair_springBone', nodeId: 1, type: 'spring', children: [], params: metadataParams }], item.id))
        .put(loadSpringBonesSuccess(item.id))
        .dispatch(loadSpringBonesRequest(item))
        .silentRun()
    })
  })

  describe('and the per-shape GLB fetch fails', () => {
    let item: Item

    beforeEach(() => {
      item = {
        ...mockedItem,
        contents: { 'anItemContent.glb': aHash }
      }
    })

    it('should swallow the per-shape error and still dispatch loadSpringBonesSuccess', () => {
      return expectSaga(editorSaga as any)
        .provide([
          [select(getBodyShape), BodyShape.MALE],
          [matchers.call.fn(fetchGlbBlob), Promise.reject(new Error('boom'))]
        ])
        .put(clearSpringBones())
        .not.put(setBones(expect.anything(), item.id))
        .put(loadSpringBonesSuccess(item.id))
        .dispatch(loadSpringBonesRequest(item))
        .silentRun()
    })
  })

  describe('and an unexpected error happens during orchestration', () => {
    let item: Item

    beforeEach(() => {
      item = {
        ...mockedItem,
        contents: { 'anItemContent.glb': aHash }
      }
    })

    it('should dispatch loadSpringBonesFailure with the error message', () => {
      return expectSaga(editorSaga as any)
        .provide([[select(getBodyShape), Promise.reject(new Error('selector blew up'))]])
        .put(clearSpringBones())
        .put(loadSpringBonesFailure(item.id, 'selector blew up'))
        .dispatch(loadSpringBonesRequest(item))
        .silentRun()
    })
  })
})

describe('when an item save succeeds', () => {
  describe('and the saved item is a wearable', () => {
    let item: Item
    const blob = makeBlob()

    beforeEach(() => {
      item = { ...mockedItem, contents: { 'anItemContent.glb': aHash } }
    })

    it('should reload spring bones for the saved item', () => {
      return expectSaga(editorSaga as any)
        .provide([
          [select(getBodyShape), BodyShape.MALE],
          [matchers.call.fn(fetchGlbBlob), blob],
          [matchers.call.fn(parseSpringBones), { bones: [] }]
        ])
        .put(clearSpringBones())
        .put(loadSpringBonesSuccess(item.id))
        .dispatch(saveItemSuccess(item, {}))
        .silentRun()
    })
  })

  describe('and the saved item is an emote', () => {
    let item: Item

    beforeEach(() => {
      item = { ...mockedItem, type: ItemType.EMOTE, contents: { 'anItemContent.glb': aHash } } as unknown as Item
    })

    it('should clear spring bones and finish without parsing', () => {
      return expectSaga(editorSaga as any)
        .put(clearSpringBones())
        .not.call(fetchGlbBlob, expect.any(String))
        .put(loadSpringBonesSuccess(item.id))
        .dispatch(saveItemSuccess(item, {}))
        .silentRun()
    })
  })
})
