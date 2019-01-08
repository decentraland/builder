import { RootState } from 'modules/common/types'
import { createSelector } from 'reselect'
import { SceneState } from 'modules/scene/reducer'
import { SceneDefinition } from './types'

export const getState: (state: RootState) => SceneState = state => state.scene

export const getData: (state: RootState) => SceneState['data'] = state => getState(state).data
