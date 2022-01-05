import { RootState } from 'modules/common/types'

export const getState = (state: RootState) => state.ui.itemEditor

export const getSelectedThirdPartyItemIds = (state: RootState) => getState(state).selectedThirdPartyItemIds
