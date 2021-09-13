import React, { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Modal, Button, Form, CheckboxProps, Radio, Loader, Popup } from 'decentraland-ui'
import { getContractName } from 'decentraland-transactions'
import { ChainCheck, TransactionLink } from 'decentraland-dapps/dist/containers'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { hasAuthorization } from 'decentraland-dapps/dist/modules/authorization/utils'
import { locations } from 'routing/locations'
import { getContractSymbol } from '../../modules/contract/utils'
import { Props } from './AuthorizationModal.types'
import './AuthorizationModal.css'

const AuthorizationModal = (props: Props) => {
  const { open, authorization, authorizations, isLoading, hasPendingTransaction, onGrant, onRevoke, onCancel, onProceed } = props
  const { contractAddress, authorizedAddress } = authorization

  const isAuthorized = hasAuthorization(authorizations, authorization)
  const contractName = getContractName(authorizedAddress)
  const tokenSymbol = getContractSymbol(contractAddress)

  const handleAuthorizationChange = useCallback(
    (_, data: CheckboxProps) => (data.checked ? onGrant(authorization) : onRevoke(authorization)),
    []
  )

  return (
    <Modal open={open} size="small" className="AuthorizationModal">
      <Modal.Header>
        {t('authorization_modal.title', {
          token: tokenSymbol
        })}
      </Modal.Header>
      <Modal.Description>
        <T
          id="authorization_modal.description"
          values={{
            contract: contractName,
            token: tokenSymbol
          }}
        />
      </Modal.Description>
      <Modal.Content>
        <div className="authorization">
          <Form.Field className={hasPendingTransaction ? 'is-pending' : ''}>
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
                <Radio
                  checked={isAuthorized}
                  label={tokenSymbol}
                  onClick={handleAuthorizationChange}
                  disabled={isLoading || !isEnabled}
                />
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
          </Form.Field>
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onCancel}>{t('global.cancel')}</Button>
        <Button primary loading={isLoading} disabled={!isAuthorized} onClick={onProceed}>
          {t('global.proceed')}
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

export default React.memo(AuthorizationModal)
