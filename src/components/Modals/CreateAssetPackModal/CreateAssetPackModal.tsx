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

const preventClose = () => {
  // make linter happy
}

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
    const { name, onClose } = this.props
    return (
      <Modal name={name} onClose={onClose}>
        <ModalNavigation
          title={t('asset_pack.import.title_create')}
          subtitle={t('asset_pack.import.description_create')}
          onClose={onClose}
        />
        <Modal.Content>
          <AssetImport onSubmit={this.handleAssetImportSubmit} />
        </Modal.Content>
      </Modal>
    )
  }

  renderAssetEditor = () => {
    const { name, onClose } = this.props
    const { assetPack } = this.state
    return (
      <Modal name={name} onClose={onClose}>
        <ModalNavigation
          title={t('asset_pack.edit_asset.title_create')}
          subtitle={t('asset_pack.edit_asset.description_create')}
          onClose={onClose}
        />
        <Modal.Content>
          <AssetsEditor assetPack={assetPack!} onChange={this.handleAssetPackChange} onSubmit={this.handleAssetEditorSubmit} />
        </Modal.Content>
      </Modal>
    )
  }

  renderAssetpackEditor = () => {
    const { name, onClose, error } = this.props
    const { assetPack } = this.state
    return (
      <Modal name={name} onClose={onClose}>
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
      </Modal>
    )
  }

  renderProgress = () => {
    const { name, progress } = this.props
    let className = 'progress-bar'

    if (progress.value === 0) {
      className += ' active'
    }

    return (
      <Modal name={name} onClose={preventClose}>
        <ModalNavigation title={t('asset_pack.progress.creating_asset_pack')} subtitle={t('asset_pack.progress.uploading_contents')} />
        <Modal.Content>
          <div className="progress-bar-container">
            <div className={className} style={{ width: `${progress.value}%` }} />
          </div>
        </Modal.Content>
      </Modal>
    )
  }

  renderSuccess = () => {
    const { name, onClose } = this.props
    return (
      <Modal name={name} onClose={onClose}>
        <ModalNavigation title={t('asset_pack.success.title')} subtitle={t('asset_pack.success.description')} />
        <Modal.Content>
          <Row center>
            <Button primary onClick={this.props.onClose}>
              {t('asset_pack.success.continue')}
            </Button>
          </Row>
        </Modal.Content>
      </Modal>
    )
  }

  preventDismiss = () => {
    // do nothing, prevent dismiss
  }

  render() {
    let { view } = this.state

    switch (view) {
      case CreateAssetPackView.IMPORT:
        return this.renderAssetImport()
      case CreateAssetPackView.EDIT_ASSETS:
        return this.renderAssetEditor()
      case CreateAssetPackView.EDIT_ASSET_PACK:
        return this.renderAssetpackEditor()
      case CreateAssetPackView.PROGRESS:
        return this.renderProgress()
      case CreateAssetPackView.SUCCESS:
        return this.renderSuccess()
      default:
        return null
    }
  }
}
