import React, { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Modal, Button, Form, CheckboxProps, Radio, Loader, Popup } from 'decentraland-ui'
import { TransactionLink } from 'decentraland-dapps/dist/containers'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { hasAuthorization } from 'decentraland-dapps/dist/modules/authorization/utils'
import { locations } from 'routing/locations'
import { getContractName, getContractSymbol } from '../../modules/contract/utils'
import { Props } from './AuthorizationModal.types'

const AuthorizationModal = (props: Props) => {
  const { open, wallet, authorization, authorizations, hasPendingTransaction, onGrant, onRevoke, onCancel, onProceed } = props
  const { tokenAddress, authorizedAddress } = authorization

  const isAuthorized = hasAuthorization(authorizations, authorization)
  const contractName = getContractName(authorizedAddress)
  const tokenSymbol = getContractSymbol(tokenAddress, wallet.networks.MATIC.chainId)

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
            token: tokenSymbol,
            settings_link: <Link to={locations.settings()}>{t('global.settings')}</Link>,
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
        <div className="Authorization">
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
            <Radio checked={isAuthorized} label={tokenSymbol} onClick={handleAuthorizationChange} />
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
        <Button disabled={!isAuthorized} primary onClick={onProceed}>
          {t('global.proceed')}
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

export default React.memo(AuthorizationModal)
