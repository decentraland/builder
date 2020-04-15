import * as React from 'react'
import uuidv4 from 'uuid/v4'
import { Button, ModalNavigation, Row } from 'decentraland-ui'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { RawAsset, Asset } from 'modules/asset/types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { ProgressStage, MixedAssetPack } from 'modules/assetPack/types'
import AssetPackEditor from 'components/AssetPackEditor'
import { convertToFullAssetPack } from 'modules/assetPack/utils'
import AssetImporter from 'components/AssetImporter'
import AssetsEditor from 'components/AssetsEditor'

import { Props, State, EditAssetPackView } from './EditAssetPackModal.types'
import './EditAssetPackModal.css'

export default class EditAssetPackModal extends React.PureComponent<Props, State> {
  state: State = {
    view: EditAssetPackView.EDIT_ASSET_PACK,
    back: EditAssetPackView.EDIT_ASSET_PACK,
    assetPack: this.getRawAssetPack(),
    editingAsset: null,
    ignoredAssets: this.getRemoteAssetIds(),
    isDirty: false
  }

  analytics = getAnalytics()

  getRawAssetPack(): MixedAssetPack {
    const { assetPack, ethAddress } = this.props

    if (!assetPack) {
      const id = uuidv4()
      return {
        id,
        title: '',
        thumbnail: '',
        ethAddress: ethAddress || null,
        assets: []
      }
    }

    return {
      id: assetPack.id,
      title: assetPack.title,
      thumbnail: assetPack.thumbnail,
      ethAddress: assetPack.ethAddress,
      assets: assetPack.assets.map(asset => ({ ...asset, model: asset.model.replace(`${asset.id}/`, '') }))
    }
  }

  getRemoteAssetIds() {
    const remotePack = this.props.assetPack
    if (!remotePack) return []
    return remotePack.assets.map(asset => asset.id)
  }

  componentDidUpdate() {
    const { progress, error, isLoading } = this.props
    let view: EditAssetPackView = this.state.view

    if (progress.stage === ProgressStage.UPLOAD_CONTENTS && progress.value === 100 && !error && !isLoading) {
      view = EditAssetPackView.SUCCESS
    } else if (progress.stage !== ProgressStage.NONE && !error) {
      view = EditAssetPackView.PROGRESS
    } else if (error) {
      view = EditAssetPackView.EDIT_ASSET_PACK
    }

    this.setState({ view })
  }

  handleAssetPackChange = (assetPack: MixedAssetPack) => {
    const { ignoredAssets } = this.state
    this.setState({ assetPack, ignoredAssets: ignoredAssets.filter(id => assetPack.assets.some(asset => asset.id === id)), isDirty: true })
  }

  handleAssetImportSubmit = (assetPack: MixedAssetPack) => {
    this.analytics.track('Edit Asset Pack Assets Review')
    this.setState({ assetPack, view: EditAssetPackView.EDIT_ASSETS, isDirty: true })
  }

  handleAssetEditorSubmit = (assetPack: MixedAssetPack) => {
    this.analytics.track('Edit Asset Pack Review')
    this.setState({ assetPack, view: EditAssetPackView.EDIT_ASSET_PACK, editingAsset: null, isDirty: true })
  }

  handleAssetPackEditorSubmit = async (assetPack: MixedAssetPack) => {
    const { ignoredAssets } = this.state
    // Convert to FullAssetPack but ignore all the original remote Assets
    const [fullAssetPack, contents] = await convertToFullAssetPack(assetPack, ignoredAssets)
    this.props.onCreateAssetPack(fullAssetPack, contents)
  }

  handleAddAssets = () => {
    this.setState({
      view: EditAssetPackView.IMPORT
    })
  }

  handleEditAsset = (asset: RawAsset | Asset) => {
    this.setState({
      view: EditAssetPackView.EDIT_ASSETS,
      editingAsset: asset.id
    })
  }

  handleDeleteAssetPack = async () => {
    const { ignoredAssets, assetPack } = this.state
    const [fullAssetPack] = await convertToFullAssetPack(assetPack, ignoredAssets)
    this.props.onDeleteAssetPack(fullAssetPack)
    this.props.onClose()
  }

  handleConfirmDeleteAssetPack = async () => {
    this.setState({
      view: EditAssetPackView.CONFIRM_DELETE
    })
  }

  handleReset = () => {
    const { assetPack } = this.props
    if (assetPack) {
      this.setState({
        view: EditAssetPackView.IMPORT,
        assetPack: {
          id: assetPack.id,
          title: assetPack.title,
          thumbnail: assetPack.thumbnail,
          ethAddress: assetPack.ethAddress,
          assets: []
        },
        isDirty: true
      })
    }
  }

  handleBackToStart = () => {
    this.setState({
      view: EditAssetPackView.EDIT_ASSET_PACK,
      editingAsset: null
    })
  }

  handleClose = () => {
    const { view, isDirty } = this.state
    const { onClose } = this.props
    switch (view) {
      case EditAssetPackView.SUCCESS:
      case EditAssetPackView.IMPORT:
        onClose()
        break
      case EditAssetPackView.EDIT_ASSETS:
      case EditAssetPackView.EDIT_ASSET_PACK:
        if (isDirty) {
          this.setState({ view: EditAssetPackView.EXIT, back: view })
        } else {
          onClose()
        }
        break
      case EditAssetPackView.EXIT:
      case EditAssetPackView.PROGRESS:
        // can't close here
        break
    }
  }

  handleBack = () => {
    this.setState({ view: this.state.back })
  }

  renderAssetImport = () => {
    const { assetPack } = this.state
    const { onClose } = this.props

    return (
      <>
        <ModalNavigation
          title={t('asset_pack.edit_assetpack.title_edit')}
          subtitle={t('asset_pack.edit_assetpack.description_edit')}
          onClose={onClose}
          onBack={this.handleBackToStart}
        />
        <Modal.Content>
          <AssetImporter assetPack={assetPack} onSubmit={this.handleAssetImportSubmit} />
        </Modal.Content>
      </>
    )
  }

  renderAssetEditor = () => {
    const { assetPack, editingAsset, ignoredAssets } = this.state

    return (
      <>
        <ModalNavigation
          title={t('asset_pack.edit_asset.title_edit')}
          subtitle={t('asset_pack.edit_asset.description_edit')}
          onClose={this.handleClose}
          onBack={editingAsset ? this.handleBackToStart : undefined}
        />
        <Modal.Content>
          <AssetsEditor
            assetPack={assetPack}
            onChange={this.handleAssetPackChange}
            onSubmit={this.handleAssetEditorSubmit}
            startingAsset={editingAsset || undefined}
            ignoredAssets={!editingAsset ? ignoredAssets : []}
            isEditing={!!editingAsset}
          />
        </Modal.Content>
      </>
    )
  }

  renderAssetpackEditor = () => {
    const { assetPack, ignoredAssets } = this.state
    const { error } = this.props

    return (
      <>
        <ModalNavigation
          title={t('asset_pack.edit_assetpack.title_edit')}
          subtitle={t('asset_pack.edit_assetpack.description_edit')}
          onClose={this.handleClose}
        />
        <Modal.Content>
          <AssetPackEditor
            assetPack={assetPack!}
            remoteAssets={ignoredAssets}
            onChange={this.handleAssetPackChange}
            onSubmit={this.handleAssetPackEditorSubmit}
            onReset={this.handleReset}
            onAddAssets={this.handleAddAssets}
            onEditAsset={this.handleEditAsset}
            onDeleteAssetPack={this.handleConfirmDeleteAssetPack}
            error={error}
          />
        </Modal.Content>
      </>
    )
  }

  renderProgress = () => {
    const { progress } = this.props
    let className = 'progress-bar'

    if (progress.value === 100) {
      className += ' active'
    }

    return (
      <>
        <ModalNavigation title={t('asset_pack.progress.updating_asset_pack')} subtitle={t('asset_pack.progress.uploading_contents')} />
        <Modal.Content>
          <div className="progress-bar-container">
            <div className={className} style={{ width: `${progress.value}%` }} />
          </div>
        </Modal.Content>
      </>
    )
  }

  renderSuccess = () => {
    return (
      <>
        <ModalNavigation title={t('asset_pack.success.title')} subtitle={t('asset_pack.success.description')} />
        <Modal.Content>
          <Row center>
            <Button primary onClick={this.props.onClose}>
              {t('asset_pack.success.continue')}
            </Button>
          </Row>
        </Modal.Content>
      </>
    )
  }

  renderExit() {
    const { onClose } = this.props
    return (
      <>
        <ModalNavigation title={t('asset_pack.exit.title_edit')} subtitle={t('asset_pack.exit.description_edit')} />
        <Modal.Actions className="exit-actions">
          <Button primary onClick={onClose}>
            {t('asset_pack.exit.action')}
          </Button>
          <Button onClick={this.handleBack}>{t('asset_pack.exit.back')}</Button>
        </Modal.Actions>
      </>
    )
  }

  renderDeleteConfirmation() {
    return (
      <>
        <ModalNavigation title={t('asset_pack.confirm_delete.title')} subtitle={t('asset_pack.confirm_delete.description')} />
        <Modal.Actions className="exit-actions">
          <Button primary onClick={this.handleDeleteAssetPack}>
            {t('asset_pack.confirm_delete.action')}
          </Button>
          <Button onClick={this.handleBack}>{t('asset_pack.confirm_delete.back')}</Button>
        </Modal.Actions>
      </>
    )
  }

  render() {
    const { name } = this.props
    const { view } = this.state

    let content
    let className = name
    switch (view) {
      case EditAssetPackView.IMPORT:
        content = this.renderAssetImport()
        break
      case EditAssetPackView.EDIT_ASSETS:
        content = this.renderAssetEditor()
        break
      case EditAssetPackView.EDIT_ASSET_PACK:
        content = this.renderAssetpackEditor()
        break
      case EditAssetPackView.PROGRESS:
        content = this.renderProgress()
        break
      case EditAssetPackView.SUCCESS:
        content = this.renderSuccess()
        break
      case EditAssetPackView.EXIT:
        content = this.renderExit()
        className += ' narrow'
        break
      case EditAssetPackView.CONFIRM_DELETE:
        content = this.renderDeleteConfirmation()
        className += ' narrow'
        break
      default:
        content = null
    }

    return (
      <Modal name={name} className={className} onClose={this.handleClose}>
        {content}
      </Modal>
    )
  }
}
