import * as React from 'react'
import uuidv4 from 'uuid/v4'
import { Button, ModalNavigation, Row } from 'decentraland-ui'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { RawAssetPack, ProgressStage } from 'modules/assetPack/types'
import AssetPackEditor from 'components/AssetPackEditor'
import { convertToFullAssetPack } from 'modules/assetPack/utils'
import AssetImporter from 'components/AssetImporter'
import AssetsEditor from 'components/AssetsEditor'
import { locations } from 'routing/locations'

import { Props, State, CreateAssetPackView } from './CreateAssetPackModal.types'
import './CreateAssetPackModal.css'

export default class CreateAssetPackModal extends React.PureComponent<Props, State> {
  state: State = {
    view: this.props.isLoggedIn ? CreateAssetPackView.IMPORT : CreateAssetPackView.LOGIN,
    back: CreateAssetPackView.IMPORT,
    assetPack: this.getAssetPack()
  }

  analytics = getAnalytics()

  getDefaultAssetPackName() {
    const { assetPacks } = this.props
    const defaultName = t('asset_pack.default_name')
    let name = defaultName
    let suffix = 2
    while (assetPacks.some(assetPack => assetPack.title === name)) {
      name = `${defaultName} (${suffix})`
      suffix++
    }
    return name
  }

  getAssetPack() {
    const existingAssetPack = this.state ? this.state.assetPack : null
    const id = uuidv4()
    return {
      id,
      title: existingAssetPack ? existingAssetPack.title : this.getDefaultAssetPackName(),
      thumbnail: existingAssetPack ? existingAssetPack.thumbnail : '',
      url: `${id}.json`,
      assets: []
    }
  }

  componentDidUpdate() {
    const { progress, error, isLoading } = this.props
    let view: CreateAssetPackView = this.state.view

    if (progress.stage === ProgressStage.UPLOAD_CONTENTS && progress.value === 100 && !error && !isLoading) {
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
    this.analytics.track('Create Asset Pack Assets Review')
    this.setState({ assetPack, view: CreateAssetPackView.EDIT_ASSETS })
  }

  handleAssetEditorSubmit = (assetPack: RawAssetPack) => {
    this.analytics.track('Create Asset Pack Review')
    this.setState({ assetPack, view: CreateAssetPackView.EDIT_ASSET_PACK })
  }

  handleAssetPackEditorSubmit = async (assetPack: RawAssetPack) => {
    const [fullAssetPack, contents] = await convertToFullAssetPack(assetPack)
    this.props.onCreateAssetPack(fullAssetPack, contents)
  }

  handleReset = () => {
    this.setState({
      view: CreateAssetPackView.IMPORT,
      assetPack: this.getAssetPack()
    })
  }

  handleLogin = () => {
    const { project, onLogin } = this.props
    if (project) {
      onLogin({
        returnUrl: locations.editor(project.id),
        openModal: {
          name: 'CreateAssetPackModal'
        }
      })
    }
  }

  handleClose = () => {
    const { view } = this.state
    const { onClose } = this.props
    switch (view) {
      case CreateAssetPackView.LOGIN:
      case CreateAssetPackView.SUCCESS:
      case CreateAssetPackView.IMPORT:
        onClose()
        break
      case CreateAssetPackView.EDIT_ASSETS:
      case CreateAssetPackView.EDIT_ASSET_PACK:
        this.setState({ view: CreateAssetPackView.EXIT, back: view })
        break
      case CreateAssetPackView.EXIT:
      case CreateAssetPackView.PROGRESS:
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
        <ModalNavigation title={t('asset_pack.title_create')} subtitle={t('asset_pack.import.description_create')} onClose={onClose} />
        <Modal.Content>
          <AssetImporter assetPack={assetPack} onSubmit={this.handleAssetImportSubmit} />
        </Modal.Content>
      </>
    )
  }

  renderAssetEditor = () => {
    const { assetPack } = this.state
    return (
      <>
        <ModalNavigation
          title={t('asset_pack.title_create')}
          subtitle={t('asset_pack.edit_asset.description_create')}
          onClose={this.handleClose}
        />
        <Modal.Content>
          <AssetsEditor assetPack={assetPack!} onChange={this.handleAssetPackChange} onSubmit={this.handleAssetEditorSubmit} />
        </Modal.Content>
      </>
    )
  }

  renderAssetpackEditor = () => {
    const { error } = this.props
    const { assetPack } = this.state
    return (
      <>
        <ModalNavigation
          title={t('asset_pack.title_create')}
          subtitle={t('asset_pack.edit_asset.description_create')}
          onClose={this.handleClose}
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

    if (progress.value === 100) {
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

  renderLogin() {
    return (
      <>
        <ModalNavigation title={t('asset_pack.login.title')} subtitle={t('asset_pack.login.description_create')} />
        <Modal.Content>
          <Row center>
            <Button primary onClick={this.handleLogin}>
              {t('asset_pack.login.action')}
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
        <ModalNavigation title={t('asset_pack.exit.title_create')} subtitle={t('asset_pack.exit.description_create')} />
        <Modal.Actions className="exit-actions">
          <Button primary onClick={onClose}>
            {t('asset_pack.exit.action')}
          </Button>
          <Button onClick={this.handleBack}>{t('asset_pack.exit.back')}</Button>
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
      case CreateAssetPackView.LOGIN:
        content = this.renderLogin()
        className += ' narrow'
        break
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
      case CreateAssetPackView.EXIT:
        content = this.renderExit()
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
