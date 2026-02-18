import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { FETCH_ENS_REQUEST, fetchENSRequest } from 'modules/ens/actions'
import { getAvatar, getName } from 'modules/profile/selectors'
import { getWallet } from 'modules/wallet/selectors'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { getENSBySubdomain, getLoading, getENSErrorMessage } from 'modules/ens/selectors'
import { RootState } from 'modules/common/types'
import { useGetENSNameFromCurrentUrl } from 'modules/location/hooks'
import ENSDetailPage from './ENSDetailPage'

export default function ENSDetailPageContainer() {
  const dispatch = useDispatch()
  const name = useGetENSNameFromCurrentUrl()

  const ens = useSelector((state: RootState) => (name ? getENSBySubdomain(state, `${name}.dcl.eth`) : null))
  const isLoading = useSelector((state: RootState) => isLoadingType(getLoading(state), FETCH_ENS_REQUEST))
  const error = useSelector(getENSErrorMessage)
  const alias = useSelector(getName)
  const avatar = useSelector(getAvatar)
  const wallet = useSelector(getWallet)

  const handleFetchENS: ActionFunction<typeof fetchENSRequest> = useCallback(name => dispatch(fetchENSRequest(name)), [dispatch])
  const handleOpenModal: ActionFunction<typeof openModal> = useCallback((name, metadata) => dispatch(openModal(name, metadata)), [dispatch])

  return (
    <ENSDetailPage
      name={name}
      ens={ens}
      isLoading={isLoading}
      error={error}
      alias={alias}
      avatar={avatar}
      wallet={wallet}
      onFetchENS={handleFetchENS}
      onOpenModal={handleOpenModal}
    />
  )
}
