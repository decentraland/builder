import * as React from 'react'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Button } from 'decentraland-ui'
import { Props } from './PushCollectionChangesModal.types'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import './PushCollectionChangesModal.css'

const PushCollectionChangesModal = ({ onClose }: Props) => {
  return (
    <Modal className="PushCollectionChangesModal" size="tiny" onClose={onClose}>
      <Modal.Header>{t('push_collection_changes_modal.title')}</Modal.Header>
      <Modal.Description>
        <T
          id="push_collection_changes_modal.description"
          values={{
            br: (
              <>
                <br />
                <br />
              </>
            )
          }}
        />
      </Modal.Description>
      <Modal.Content>
        <div className="authorization">
          {/* <Form.Field className={hasPendingTransaction ? 'is-pending' : ''}>
            <Popup
              content={t('authorization_modal.pending_tx')}
              position="top left"
              trigger={
                <Link to={locations.activity()} className="loader-tooltip">
                  <Loader active size="mini" />
                </Link>
              }
            />
            <ChainCheck chainId={authorization.chainId}>
              {isEnabled => (
                <Radio checked={isAuthorized} label={tokenSymbol} onClick={handleAuthorizationChange} disabled={isLoading || !isEnabled} />
              )}
            </ChainCheck>
            <div className="radio-description secondary-text">
              <T
                id="authorization_modal.authorize"
                values={{
                  contract_link: (
                    <TransactionLink address={authorizedAddress} txHash="">
                      {tokenSymbol}
                    </TransactionLink>
                  ),
                  symbol: tokenSymbol
                }}
              />
            </div>
          </Form.Field> */}
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose}>{t('global.cancel')}</Button>
        <Button
          primary
          // loading={isLoading}
          // disabled={!isAuthorized}
          // onClick={onProceed}
        >
          {t('global.proceed')}
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

export default React.memo(PushCollectionChangesModal)
