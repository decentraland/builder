import React, { useCallback } from 'react'
import { ModalNavigation, Row, Column, Form } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { ItemType } from 'modules/item/types'
import { isSmart } from 'modules/item/utils'
import { useCreateSingleItemModal } from '../CreateSingleItemModal.context'
import { WearableDetails, EmoteDetails, SmartWearableDetails } from './index'

export const ItemDetailsStep: React.FC = () => {
  const { state, error, validationError, isDisabled, renderModalTitle, onClose } = useCreateSingleItemModal()
  const { type, contents } = state

  const renderDetailsContent = useCallback(() => {
    if (type === ItemType.EMOTE) {
      return <EmoteDetails />
    } else if (isSmart({ type, contents })) {
      return <SmartWearableDetails />
    } else {
      return <WearableDetails />
    }
  }, [type, contents])

  return (
    <>
      <ModalNavigation title={renderModalTitle()} onClose={onClose} />
      <Modal.Content>
        <Form disabled={isDisabled()}>
          <Column>
            {renderDetailsContent()}
            {validationError ? (
              <Row className="error" align="right">
                <p className="danger-text">{validationError}</p>
              </Row>
            ) : null}
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

export default React.memo(ItemDetailsStep)
