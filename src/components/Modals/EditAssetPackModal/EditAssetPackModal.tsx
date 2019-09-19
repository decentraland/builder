import * as React from 'react'
import { Close, Button } from 'decentraland-ui'
import { RawAsset } from 'modules/asset/types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { RawAssetPack, ProgressStage } from 'modules/assetPack/types'
import AssetPackEditor from 'components/AssetPackEditor'
import { rawAssetPackToFullAssetPack } from 'modules/assetPack/utils'
import AssetImport from 'components/AssetImporter'
import AssetsEditor from 'components/AssetsEditor'

import { Props, State, EditAssetPackView } from './EditAssetPackModal.types'
import './EditAssetPackModal.css'

export default class EditAssetPackModal extends React.PureComponent<Props, State> {
  state: State = {
    view: EditAssetPackView.EDIT_ASSET_PACK,
    assetPack: this.getRawAssetPack(),
    editingAsset: null
  }

  getRawAssetPack(): RawAssetPack | null {
    const { assetPack } = this.props
    if (!assetPack) return null

    return {
      id: assetPack.id,
      title: assetPack.title,
      thumbnail: assetPack.thumbnail,
      url: '',
      assets: assetPack.assets.map(asset => ({ ...asset, contents: {} } as RawAsset))
    }
  }

  componentDidUpdate() {
    const { progress, error } = this.props
    let view: EditAssetPackView = this.state.view

    if (progress.stage === ProgressStage.UPLOAD_CONTENTS && progress.value === 100 && !error) {
      view = EditAssetPackView.SUCCESS
    } else if (progress.stage !== ProgressStage.NONE && !error) {
      view = EditAssetPackView.PROGRESS
    } else if (error) {
      view = EditAssetPackView.EDIT_ASSET_PACK
    }

    this.setState({ view })
  }

  handleAssetPackChange = (assetPack: RawAssetPack) => {
    this.setState({ assetPack })
  }

  handleAssetImportSubmit = (assetPack: RawAssetPack) => {
    this.setState({ assetPack, view: EditAssetPackView.EDIT_ASSETS })
  }

  handleAssetEditorSubmit = (assetPack: RawAssetPack) => {
    this.setState({ assetPack, view: EditAssetPackView.EDIT_ASSET_PACK, editingAsset: null })
  }

  handleAssetPackEditorSubmit = async (assetPack: RawAssetPack) => {
    const [fullAssetPack, contents] = await rawAssetPackToFullAssetPack(assetPack)
    this.props.onCreateAssetPack(fullAssetPack, contents)
  }

  handleReset = () => {
    this.setState({
      view: EditAssetPackView.IMPORT,
      assetPack: null
    })
  }

  renderAssetImport = () => {
    const { assetPack } = this.state
    return <AssetImport assetPack={assetPack || undefined} onSubmit={this.handleAssetImportSubmit} />
  }

  renderAssetEditor = () => {
    const { assetPack, editingAsset } = this.state
    return (
      <AssetsEditor
        assetPack={assetPack!}
        onChange={this.handleAssetPackChange}
        onSubmit={this.handleAssetEditorSubmit}
        isEditing={!!editingAsset}
      />
    )
  }

  renderAssetpackEditor = () => {
    const { assetPack } = this.state
    const { error } = this.props

    return (
      <AssetPackEditor
        assetPack={assetPack!}
        onChange={this.handleAssetPackChange}
        onSubmit={this.handleAssetPackEditorSubmit}
        onReset={this.handleReset}
        onAddAssets={() => {
          this.setState({
            view: EditAssetPackView.IMPORT
          })
        }}
        onEditAsset={asset => {
          this.setState({
            view: EditAssetPackView.EDIT_ASSETS,
            editingAsset: asset.id
          })
        }}
        onDeleteAssetPack={() => {
          /*a */
        }}
        error={error}
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
          {view === EditAssetPackView.IMPORT && this.renderAssetImport()}
          {view === EditAssetPackView.EDIT_ASSETS && this.renderAssetEditor()}
          {view === EditAssetPackView.EDIT_ASSET_PACK && this.renderAssetpackEditor()}
          {view === EditAssetPackView.PROGRESS && this.renderProgress()}
          {view === EditAssetPackView.SUCCESS && this.renderSuccess()}
        </Modal.Content>
      </Modal>
    )
  }
}
