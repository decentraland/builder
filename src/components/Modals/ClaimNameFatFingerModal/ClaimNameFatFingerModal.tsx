import React from 'react'
import { ModalNavigation, Field, Button, Form } from 'decentraland-ui'
import { ContractName } from 'decentraland-transactions'
import { NFTCategory, Network } from '@dcl/schemas'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { AuthorizationType } from 'decentraland-dapps/dist/modules/authorization/types'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { PRICE_IN_WEI } from 'modules/ens/utils'
import { CONTROLLER_V2_ADDRESS, MANA_ADDRESS } from 'modules/common/contracts'
import { Props, State } from './ClaimNameFatFingerModal.types'
import './ClaimNameFatFingerModal.css'

export default class ClaimNameFatFingerModal extends React.PureComponent<Props, State> {
  state: State = {
    currentName: ''
  }

  handleClaim = () => {
    const { onClaim, onAuthorizedAction, onClaimNameClear } = this.props
    const { currentName } = this.state

    const manaContract = {
      name: ContractName.MANAToken,
      address: MANA_ADDRESS,
      chainId: getChainIdByNetwork(Network.ETHEREUM),
      network: Network.ETHEREUM,
      category: NFTCategory.ENS
    }

    onClaimNameClear()
    onAuthorizedAction({
      authorizedAddress: CONTROLLER_V2_ADDRESS,
      authorizedContractLabel: 'DCLControllerV2',
      targetContract: manaContract,
      targetContractName: ContractName.MANAToken,
      requiredAllowanceInWei: PRICE_IN_WEI,
      authorizationType: AuthorizationType.ALLOWANCE,
      onAuthorized: () => onClaim(currentName)
    })
  }

  handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value
    this.setState({ currentName: name.replace(/\s/g, '') })
  }

  handleClose = () => {
    const { onClose } = this.props
    onClose()
  }

  render() {
    const { name, metadata, isLoading } = this.props
    const { originalName } = metadata
    const { currentName } = this.state
    const areNamesDifferent = currentName !== originalName
    const hasError = areNamesDifferent && currentName.length > 0
    return (
      <Modal name={name} onClose={isLoading ? undefined : this.handleClose}>
        <ModalNavigation title={t('claim_name_fat_finger_modal.title')} onClose={isLoading ? undefined : this.handleClose} />
        <Form onSubmit={this.handleClaim}>
          <Modal.Content>
            <div className="details">
              <T id="claim_name_fat_finger_modal.description" values={{ name: <strong>{originalName}</strong> }} />
            </div>
            <Field
              placeholder={t('claim_name_fat_finger_modal.name_placeholder')}
              value={currentName}
              error={hasError}
              disabled={isLoading}
              message={hasError ? t('claim_name_fat_finger_modal.names_different') : ''}
              onChange={this.handleChangeName}
            />
          </Modal.Content>
          <Modal.Actions>
            <Button secondary onClick={this.handleClose} disabled={isLoading} type="button">
              {t('global.cancel')}
            </Button>
            <Button primary type="submit" disabled={areNamesDifferent || isLoading} loading={isLoading}>
              {t('global.confirm')}
            </Button>
          </Modal.Actions>
        </Form>
      </Modal>
    )
  }
}
