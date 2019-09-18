import * as React from 'react'
import { Button, ModalNavigation, Row } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { RawAssetPack, ProgressStage } from 'modules/assetPack/types'
import AssetPackEditor from 'components/AssetPackEditor'
import { rawAssetPackToFullAssetPack } from 'modules/assetPack/utils'
import AssetImport from 'components/AssetImporter'
import AssetsEditor from 'components/AssetsEditor'

import { Props, State, CreateAssetPackView } from './CreateAssetPackModal.types'
import './CreateAssetPackModal.css'

export default class CreateAssetPackModal extends React.PureComponent<Props, State> {
  state: State = {
    view: CreateAssetPackView.IMPORT,
    assetPack: null
  }

  componentDidUpdate() {
    const { progress, error } = this.props
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
    const { onClose } = this.props
    return (
      <>
        <ModalNavigation
          title={t('asset_pack.import.title_create')}
          subtitle={t('asset_pack.import.description_create')}
          onClose={onClose}
        />
        <Modal.Content>
          <AssetImport onSubmit={this.handleAssetImportSubmit} />
        </Modal.Content>
      </>
    )
  }

  renderAssetEditor = () => {
    const { onClose } = this.props
    const { assetPack } = this.state
    return (
      <>
        <ModalNavigation
          title={t('asset_pack.edit_asset.title_create')}
          subtitle={t('asset_pack.edit_asset.description_create')}
          onClose={onClose}
        />
        <Modal.Content>
          <AssetsEditor assetPack={assetPack!} onChange={this.handleAssetPackChange} onSubmit={this.handleAssetEditorSubmit} />
        </Modal.Content>
      </>
    )
  }

  renderAssetpackEditor = () => {
    const { onClose, error } = this.props
    const { assetPack } = this.state
    return (
      <>
        <ModalNavigation
          title={t('asset_pack.edit_asset.title_create')}
          subtitle={t('asset_pack.edit_asset.description_create')}
          onClose={onClose}
        />
        <Modal.Content>
          <AssetPackEditor
            assetPack={assetPack!}
            onChange={this.handleAssetPackChange}
            onSubmit={this.handleAssetPackEditorSubmit}
            onReset={this.handleReset}
            error={error}
          />
        </Modal.Content>
      </>
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
        <ModalNavigation title={t('asset_pack.progress.creating_asset_pack')} subtitle={t('asset_pack.progress.uploading_contents')} />
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

  handleClose = () => {
    let { view } = this.state
    const { onClose } = this.props
    if (view !== CreateAssetPackView.PROGRESS) {
      onClose()
    }
  }

  render() {
    let { view } = this.state

    let content
    switch (view) {
      case CreateAssetPackView.IMPORT:
        content = this.renderAssetImport()
        break
      case CreateAssetPackView.EDIT_ASSETS:
        content = this.renderAssetEditor()
        break
      case CreateAssetPackView.EDIT_ASSET_PACK:
        content = this.renderAssetpackEditor()
        break
      case CreateAssetPackView.PROGRESS:
        content = this.renderProgress()
        break
      case CreateAssetPackView.SUCCESS:
        content = this.renderSuccess()
        break
      default:
        content = null
    }

    return (
      <Modal name={name} onClose={this.handleClose}>
        {content}
      </Modal>
    )
  }
}
