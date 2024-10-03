import { Props } from './PutForSaleOffchainModal.types'
import EditPriceAndBeneficiaryModal from '../EditPriceAndBeneficiaryModal/EditPriceAndBeneficiaryModal'
import { Item } from 'modules/item/types'

export default function PutForSaleOffchainModal({ item, collection, error, metadata, isLoading, onClose, onCreateItemOrder }: Props) {
  const handlePutForSale = (_itemId: string, price: string, beneficiary: string, expiresAt = new Date()) => {
    if (!collection || !item) {
      console.error('Collection or item not found')
      return
    }
    onCreateItemOrder(item as Item, price, beneficiary, collection, expiresAt)
  }

  return (
    <EditPriceAndBeneficiaryModal
      name="EditPriceAndBeneficiaryModal"
      metadata={metadata}
      isLoading={isLoading}
      onSetPriceAndBeneficiary={handlePutForSale}
      error={error}
      item={item}
      onClose={onClose}
      onSave={() => undefined}
      withExpirationDate
    />
  )
}
