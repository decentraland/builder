import { BodyShape, WearableCategory } from '@dcl/schemas'
import type { Wearable } from 'decentraland-ecs'
import { anotherWearable, convertWearable, wearable } from 'specs/editor'
import { fetchBaseWearablesFailure, fetchBaseWearablesRequest, fetchBaseWearablesSuccess, setBaseWearable } from './actions'
import { editorReducer, EditorState, INITIAL_STATE } from './reducer'

let state: EditorState

beforeEach(() => {
  state = {
    ...INITIAL_STATE
  }
})

describe('when reducing the action that sets the selected base wearable', () => {
  beforeEach(() => {
    state = {
      ...state,
      selectedBaseWearablesByBodyShape: {
        [BodyShape.FEMALE]: {
          [anotherWearable.category]: anotherWearable
        }
      } as Record<BodyShape, Record<string, Wearable | null>>
    }
  })

  it('should return a state with the new wearable set with the given category and body shape', () => {
    expect(editorReducer(state, setBaseWearable(wearable.category as WearableCategory, BodyShape.MALE, wearable))).toEqual({
      ...state,
      selectedBaseWearablesByBodyShape: {
        ...state.selectedBaseWearablesByBodyShape,
        [BodyShape.MALE]: {
          [wearable.category]: wearable
        }
      }
    })
  })
})

describe('when reducing the action that starts the fetching of the base wearables', () => {
  it('should set the request as loading and clear the error', () => {
    expect(editorReducer(state, fetchBaseWearablesRequest())).toEqual({
      ...state,
      fetchingBaseWearablesError: null,
      loading: [fetchBaseWearablesRequest()]
    })
  })
})

describe('when reducing the action that signals a successful fetching of the base wearables', () => {
  let femaleHairWearable: Wearable
  let femaleUpperBodyWearable: Wearable
  let femaleLowerBodyWearable: Wearable
  let maleHairWearable: Wearable
  let maleFacialHairWearable: Wearable
  let maleUpperBodyWearable: Wearable
  let maleLowerBodyWearable: Wearable
  let wearables: Wearable[]

  beforeEach(() => {
    femaleHairWearable = convertWearable(wearable, WearableCategory.HAIR, BodyShape.FEMALE)
    femaleUpperBodyWearable = convertWearable(wearable, WearableCategory.UPPER_BODY, BodyShape.FEMALE)
    femaleLowerBodyWearable = convertWearable(wearable, WearableCategory.LOWER_BODY, BodyShape.FEMALE)
    maleHairWearable = convertWearable(wearable, WearableCategory.HAIR, BodyShape.MALE)
    maleFacialHairWearable = convertWearable(wearable, WearableCategory.FACIAL_HAIR, BodyShape.MALE)
    maleUpperBodyWearable = convertWearable(wearable, WearableCategory.UPPER_BODY, BodyShape.MALE)
    maleLowerBodyWearable = convertWearable(wearable, WearableCategory.LOWER_BODY, BodyShape.MALE)
    wearables = [
      femaleHairWearable,
      femaleUpperBodyWearable,
      femaleLowerBodyWearable,
      maleHairWearable,
      maleFacialHairWearable,
      maleUpperBodyWearable,
      maleLowerBodyWearable
    ]
  })

  it('should set the wearables, the selectedBaseWearables with the given wearables and clear the loading and error', () => {
    expect(editorReducer(state, fetchBaseWearablesSuccess(wearables))).toEqual({
      ...state,
      fetchingBaseWearablesError: null,
      loading: [],
      baseWearables: wearables,
      selectedBaseWearablesByBodyShape: {
        [BodyShape.FEMALE]: {
          [WearableCategory.HAIR]: femaleHairWearable,
          [WearableCategory.FACIAL_HAIR]: null,
          [WearableCategory.UPPER_BODY]: femaleUpperBodyWearable,
          [WearableCategory.LOWER_BODY]: femaleLowerBodyWearable
        },
        [BodyShape.MALE]: {
          [WearableCategory.HAIR]: maleHairWearable,
          [WearableCategory.FACIAL_HAIR]: maleFacialHairWearable,
          [WearableCategory.UPPER_BODY]: maleUpperBodyWearable,
          [WearableCategory.LOWER_BODY]: maleLowerBodyWearable
        }
      }
    })
  })
})

describe('when reducing the action that signals a failing fetching of the base wearables', () => {
  it('should set the error and clear the loading', () => {
    expect(editorReducer(state, fetchBaseWearablesFailure('anError'))).toEqual({
      ...state,
      fetchingBaseWearablesError: 'anError',
      loading: []
    })
  })
})
