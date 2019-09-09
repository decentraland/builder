import * as React from 'react'
import { Close, Button } from 'decentraland-ui'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import AssetImport from 'components/AssetImporter'
import { RawAssetPack } from 'modules/assetPack/types'

import './CreateAssetPackModal.css'

export enum CreateAssetPackStep {
  IMPORT
}

export type State = {
  view: CreateAssetPackStep
  assetPack: RawAssetPack | null
}

export default class CreateAssetPackModal extends React.PureComponent<ModalProps, State> {
  state: State = {
    view: CreateAssetPackStep.IMPORT,
    assetPack: null
  }

  handleAssetPackChange = (assetPack: RawAssetPack) => {
    this.setState({ assetPack })
  }

  renderAssetImport = () => {
    const { assetPack } = this.state
    const buttonText =
      assetPack && assetPack.assets && assetPack.assets.length > 1
        ? t('asset_pack.import.action_many', { count: assetPack.assets.length })
        : t('asset_pack.import.action')

    const buttonDisabled = !assetPack || !assetPack.assets.length

    return (
      <>
        <AssetImport onAssetPack={this.handleAssetPackChange} />
        <div className="actions">
          <Button disabled={buttonDisabled} primary={!buttonDisabled}>
            {buttonText}
          </Button>
        </div>
      </>
    )
  }

  render() {
    const { name, onClose } = this.props
    const { view } = this.state

    return (
      <Modal name={name} closeIcon={<Close onClick={onClose} />}>
        <Modal.Header>Alto asset pack</Modal.Header>
        <Modal.Content>{view === CreateAssetPackStep.IMPORT && this.renderAssetImport()}</Modal.Content>
      </Modal>
    )
  }
}
