import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { GET_ENS_REQUEST } from './actions'
import {getLoading} from 'modules/auth/selectors';
import {ENSState} from './reducer';

export const getEns = (state: RootState):ENSState => state.ens
export const isLoading = (state: RootState) => isLoadingType(getLoading(state), GET_ENS_REQUEST)


