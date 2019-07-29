import { RootState } from 'modules/common/types'
import { SyncState } from './reducer'

export const getState: (state: RootState) => SyncState = state => state.sync

export const getLocalProjectIds: (state: RootState) => string[] = state => getState(state).localProjectIds
