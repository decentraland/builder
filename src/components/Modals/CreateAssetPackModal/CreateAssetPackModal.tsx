import * as React from 'react'
import { Close } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { RawAssetPack } from 'modules/assetPack/types'
import AssetPackEditor from 'components/AssetPackEditor'
import { rawAssetPackToFullAssetPack } from 'modules/assetPack/utils'
import AssetImport from 'components/AssetImporter'
import AssetsEditor from 'components/AssetsEditor'

import { Props, State, CreateAssetPackStep } from './CreateAssetPackModal.types'
import './CreateAssetPackModal.css'

export default class CreateAssetPackModal extends React.PureComponent<Props, State> {
  state: State = {
    view: CreateAssetPackStep.IMPORT,
    assetPack: null
  }

  handleAssetPackChange = (assetPack: RawAssetPack) => {
    this.setState({ assetPack })
  }

  handleAssetImportSubmit = (assetPack: RawAssetPack) => {
    this.setState({ assetPack, view: CreateAssetPackStep.EDIT_ASSETS })
  }

  handleAssetEditorSubmit = (assetPack: RawAssetPack) => {
    this.setState({ assetPack, view: CreateAssetPackStep.EDIT_ASSET_PACK })
  }

  handleAssetPackEditorSubmit = async (assetPack: RawAssetPack) => {
    const [fullAssetPack, contents] = await rawAssetPackToFullAssetPack(assetPack)
    this.props.onCreateAssetPack(fullAssetPack, contents)
  }

  renderAssetImport = () => {
    return <AssetImport onSubmit={this.handleAssetImportSubmit} />
  }

  renderAssetEditor = () => {
    const { assetPack } = this.state
    return <AssetsEditor assetPack={assetPack!} onChange={this.handleAssetPackChange} onSubmit={this.handleAssetEditorSubmit} />
  }

  renderAssetpackEditor = () => {
    const { assetPack } = this.state
    return <AssetPackEditor assetPack={assetPack!} onChange={this.handleAssetPackChange} onSubmit={this.handleAssetPackEditorSubmit} />
  }

  render() {
    const { name, onClose } = this.props
    const { view } = this.state

    return (
      <Modal name={name} closeIcon={<Close onClick={onClose} />}>
        <Modal.Header>Alto asset pack</Modal.Header>
        <Modal.Content>
          {view === CreateAssetPackStep.IMPORT && this.renderAssetImport()}
          {view === CreateAssetPackStep.EDIT_ASSETS && this.renderAssetEditor()}
          {view === CreateAssetPackStep.EDIT_ASSET_PACK && this.renderAssetpackEditor()}
        </Modal.Content>
      </Modal>
    )
  }
}
