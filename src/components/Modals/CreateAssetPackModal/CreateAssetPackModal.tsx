import * as React from 'react'
import { Close, Button } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { RawAssetPack, ProgressStage } from 'modules/assetPack/types'
import AssetPackEditor from 'components/AssetPackEditor'
import { rawAssetPackToFullAssetPack } from 'modules/assetPack/utils'
import AssetImport from 'components/AssetImporter'
import AssetsEditor from 'components/AssetsEditor'

import { Props, State, CreateAssetPackView } from './CreateAssetPackModal.types'
import './CreateAssetPackModal.css'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

export default class CreateAssetPackModal extends React.PureComponent<Props, State> {
  state: State = {
    view: CreateAssetPackView.IMPORT,
    assetPack: null
  }

  componentDidUpdate() {
    const { progress } = this.props
    const error = null
    let view: CreateAssetPackView = this.state.view

    if (progress.stage === ProgressStage.UPLOAD_CONTENTS && progress.value === 100 && !error) {
      view = CreateAssetPackView.SUCCESS
    } else if (progress.stage !== ProgressStage.NONE && !error) {
      view = CreateAssetPackView.PROGRESS
    } else if (error) {
      view = CreateAssetPackView.EDIT_ASSET_PACK
    }

    this.setState({ view })
  }

  handleAssetPackChange = (assetPack: RawAssetPack) => {
    this.setState({ assetPack })
  }

  handleAssetImportSubmit = (assetPack: RawAssetPack) => {
    this.setState({ assetPack, view: CreateAssetPackView.EDIT_ASSETS })
  }

  handleAssetEditorSubmit = (assetPack: RawAssetPack) => {
    this.setState({ assetPack, view: CreateAssetPackView.EDIT_ASSET_PACK })
  }

  handleAssetPackEditorSubmit = async (assetPack: RawAssetPack) => {
    const [fullAssetPack, contents] = await rawAssetPackToFullAssetPack(assetPack)
    this.props.onCreateAssetPack(fullAssetPack, contents)
  }

  handleReset = () => {
    this.setState({
      view: CreateAssetPackView.IMPORT,
      assetPack: null
    })
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
    return (
      <AssetPackEditor
        assetPack={assetPack!}
        onChange={this.handleAssetPackChange}
        onSubmit={this.handleAssetPackEditorSubmit}
        onReset={this.handleReset}
      />
    )
  }

  renderProgress = () => {
    const { progress } = this.props
    let className = 'progress-bar'

    if (progress.value === 0) {
      className += ' active'
    }

    return (
      <>
        {progress.stage === ProgressStage.CREATE_ASSET_PACK && t('asset_pack.progress.creating_asset_pack')}
        {progress.stage === ProgressStage.UPLOAD_CONTENTS && t('asset_pack.progress.uploading_contents')}
        <div className="progress-bar-container">
          <div className={className} style={{ width: `${progress.value}%` }} />
        </div>
      </>
    )
  }

  renderSuccess = () => {
    return (
      <>
        {t('asset_pack.success.title')}
        {t('asset_pack.success.description')}
        <Button primary onClick={this.props.onClose}>
          {t('asset_pack.success.continue')}
        </Button>
      </>
    )
  }

  render() {
    const { name, onClose } = this.props
    const { view } = this.state

    return (
      <Modal name={name} closeIcon={<Close onClick={onClose} />}>
        <Modal.Header>Alto asset pack</Modal.Header>
        <Modal.Content>
          {view === CreateAssetPackView.IMPORT && this.renderAssetImport()}
          {view === CreateAssetPackView.EDIT_ASSETS && this.renderAssetEditor()}
          {view === CreateAssetPackView.EDIT_ASSET_PACK && this.renderAssetpackEditor()}
          {view === CreateAssetPackView.PROGRESS && this.renderProgress()}
          {view === CreateAssetPackView.SUCCESS && this.renderSuccess()}
        </Modal.Content>
      </Modal>
    )
  }
}
