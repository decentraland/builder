import { Contract, Network } from '@dcl/schemas'
import { ContractName } from 'decentraland-transactions'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { withAuthorizedAction } from 'decentraland-dapps/dist/containers'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib'
import { AuthorizedAction } from 'decentraland-dapps/dist/containers/withAuthorizedAction/AuthorizationModal/AuthorizationModal.types'
import { AuthorizationType } from 'decentraland-dapps/dist/modules/authorization/types'
import { t } from 'decentraland-dapps/dist/modules/translation'
import { Item } from 'modules/item/types'
import { getOffchainV2SaleAddress } from 'modules/collection/utils'
import { getError, getPutForSaleOffChainStatus } from 'modules/item/selectors'
import { Props } from './PutForSaleOffchainModal.types'
import EditPriceAndBeneficiaryModal from '../EditPriceAndBeneficiaryModal/EditPriceAndBeneficiaryModal'
import { Button, Icon, Loader, ModalActions, ModalContent } from 'decentraland-ui'
import styles from './PutForSaleOffchainModal.module.css'

function PutForSaleOffchainModal({
  item,
  collection,
  connectedChainId,
  error,
  metadata,
  isLoading,
  isLoadingCancel,
  onClose,
  onCreateItemOrder,
  onRemoveFromSale,
  onAuthorizedAction
}: Props) {
  const handlePutForSale = (_itemId: string, price: string, beneficiary: string, expiresAt = new Date()) => {
    if (!collection || !item || !collection.contractAddress) {
      console.error('Collection or item not found')
      return
    }

    const chainId = getChainIdByNetwork(Network.MATIC)

    onAuthorizedAction({
      // Override the automatic Magic sign in if the user needs to pay gas for the transaction
      manual: connectedChainId === chainId,
      targetContractName: ContractName.ERC721CollectionV2,
      authorizedContractLabel: ContractName.OffChainMarketplaceV2,
      targetContractLabel: collection.name,
      authorizationType: AuthorizationType.MINT,
      authorizedAddress: getOffchainV2SaleAddress(chainId),
      targetContract: {
        address: collection.contractAddress,
        chainId: chainId,
        name: ContractName.ERC721CollectionV2,
        network: Network.MATIC
      } as Contract,
      onAuthorized: () => onCreateItemOrder(item as Item, price, beneficiary, collection, expiresAt)
    })
  }

  const handleRemoveFromSale = () => {
    onRemoveFromSale(item.tradeId!)
  }

  if (item.tradeId) {
    return (
      <Modal name="PutForSaleOffchainModal" onClose={onClose} size="small">
        <ModalContent>
          <div className={styles.modalContent}>
            <div className={styles.modalIcon}>
              {isLoadingCancel ? <Loader active size="large" inline /> : <Icon name="tag" size="big" />}
            </div>
            <h2 className={styles.modalTitle}>{t('put_for_sale_offchain_modal.title')}</h2>
            <p className={styles.modalSubtitle}>{t('put_for_sale_offchain_modal.subtitle')}</p>
          </div>
          {error ? <span className={styles.error}>{error}</span> : null}
        </ModalContent>
        <ModalActions>
          <Button onClick={onClose} disabled={isLoadingCancel}>
            {t('put_for_sale_offchain_modal.cancel')}
          </Button>
          <Button primary onClick={handleRemoveFromSale} disabled={isLoadingCancel} loading={isLoadingCancel}>
            {t('put_for_sale_offchain_modal.reject_old_prices')}
          </Button>
        </ModalActions>
      </Modal>
    )
  }

  return (
    <EditPriceAndBeneficiaryModal
      name="EditPriceAndBeneficiaryModal"
      isOffchainPublicItemOrdersEnabledVariants={null}
      metadata={metadata}
      isLoading={isLoading}
      onSetPriceAndBeneficiary={handlePutForSale}
      error={error}
      item={item}
      onClose={onClose}
      onSave={() => undefined}
      withExpirationDate
      isOffchain
    />
  )
}

export default withAuthorizedAction(
  PutForSaleOffchainModal,
  AuthorizedAction.SELL,
  {
    title_action: 'put_for_sale_offchain_modal.authorization.title_action',
    action: 'put_for_sale_offchain_modal.authorization.action',
    confirm_transaction: {
      title: 'put_for_sale_offchain_modal.authorization.confirm_transaction_title'
    }
  },
  getPutForSaleOffChainStatus,
  getError
)
