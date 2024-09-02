import { RootState } from 'modules/common/types'

export const getLastLocation = (state: RootState) => state.ui.location.lastLocation
