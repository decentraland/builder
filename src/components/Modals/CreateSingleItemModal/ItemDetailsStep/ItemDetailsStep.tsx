import React from 'react'
import { ModalNavigation, Row, Column, Form } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { ItemType } from 'modules/item/types'
import { isSmart } from 'modules/item/utils'
import { useCreateSingleItemModal } from '../CreateSingleItemModal.context'
import { WearableDetails, EmoteDetails, SmartWearableDetails } from './index'

export const ItemDetailsStep: React.FC = () => {
  const { state, error, isDisabled, renderModalTitle, onClose } = useCreateSingleItemModal()
  const { type, contents } = state

  const renderDetailsContent = () => {
    if (type === ItemType.EMOTE) {
      return <EmoteDetails />
    } else if (isSmart({ type, contents })) {
      return <SmartWearableDetails />
    } else {
      return <WearableDetails />
    }
  }

  return (
    <>
      <ModalNavigation title={renderModalTitle()} onClose={onClose} />
      <Modal.Content>
        <Form disabled={isDisabled()}>
          <Column>
            {renderDetailsContent()}
            {state.error ? (
              <Row className="error" align="right">
                <p className="danger-text">{state.error}</p>
              </Row>
            ) : null}
            {error ? (
              <Row className="error" align="right">
                <p className="danger-text">{error}</p>
              </Row>
            ) : null}
          </Column>
        </Form>
      </Modal.Content>
    </>
  )
}

export default ItemDetailsStep
