import { Wearable } from 'decentraland-ecs'
import { WearableBodyShape, WearableCategory } from 'modules/item/types'
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
      selectedBaseWearables: {
        [WearableBodyShape.FEMALE]: {
          [anotherWearable.category]: anotherWearable
        }
      } as Record<WearableBodyShape, Record<string, Wearable | null>>
    }
  })

  it('should return a state with the new wearable set with the given category and body shape', () => {
    expect(editorReducer(state, setBaseWearable(wearable.category as WearableCategory, WearableBodyShape.MALE, wearable))).toEqual({
      ...state,
      selectedBaseWearables: {
        ...state.selectedBaseWearables,
        [WearableBodyShape.MALE]: {
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
    femaleHairWearable = convertWearable(wearable, WearableCategory.HAIR, WearableBodyShape.FEMALE)
    femaleUpperBodyWearable = convertWearable(wearable, WearableCategory.UPPER_BODY, WearableBodyShape.FEMALE)
    femaleLowerBodyWearable = convertWearable(wearable, WearableCategory.LOWER_BODY, WearableBodyShape.FEMALE)
    maleHairWearable = convertWearable(wearable, WearableCategory.HAIR, WearableBodyShape.MALE)
    maleFacialHairWearable = convertWearable(wearable, WearableCategory.FACIAL_HAIR, WearableBodyShape.MALE)
    maleUpperBodyWearable = convertWearable(wearable, WearableCategory.UPPER_BODY, WearableBodyShape.MALE)
    maleLowerBodyWearable = convertWearable(wearable, WearableCategory.LOWER_BODY, WearableBodyShape.MALE)
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
      selectedBaseWearables: {
        [WearableBodyShape.FEMALE]: {
          [WearableCategory.HAIR]: femaleHairWearable,
          [WearableCategory.FACIAL_HAIR]: null,
          [WearableCategory.UPPER_BODY]: femaleUpperBodyWearable,
          [WearableCategory.LOWER_BODY]: femaleLowerBodyWearable
        },
        [WearableBodyShape.MALE]: {
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
