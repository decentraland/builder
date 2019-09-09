import * as React from 'react'
import { Close } from 'decentraland-ui'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
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
    return <AssetImport onSubmit={this.handleAssetPackChange} />
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
