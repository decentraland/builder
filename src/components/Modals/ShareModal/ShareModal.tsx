import * as React from 'react'
import { env } from 'decentraland-commons'
import { Loader, ModalNavigation } from 'decentraland-ui'

import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Icon from 'components/Icon'
import { ShareTarget } from 'modules/ui/share/types'
import LoginModal from '../LoginModal'
import { Props, ShareModalType, State } from './ShareModal.types'

import './ShareModal.css'

const SHARE_SCENE_URL = env.get('REACT_APP_SHARE_SCENE_URL', '')

export default class ShareModal extends React.PureComponent<Props, State> {
  state: State = {
    copied: false,
    type: ShareModalType.PROJECT,
    id: null
  }

  input = React.createRef<HTMLInputElement>()

  componentDidMount() {
    const { metadata, onUpdate, isLoggedIn } = this.props
    if (metadata) {
      this.setState({
        type: metadata.type,
        id: metadata.id
      })

      if (isLoggedIn) {
        onUpdate(metadata.id)
      }
    }
  }

  handleClose = () => {
    this.props.onClose()
  }

  handleFocusLink = () => {
    if (this.input.current) {
      this.input.current.select()
    }
  }

  handleCopyLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (this.input.current) {
      const input = this.input.current
      input.select()
      document.execCommand('copy')
      const selection = document.getSelection()
      if (selection) {
        selection.removeAllRanges()
        input.blur()
        this.setState({ copied: true })
      }
      this.props.onShare(ShareTarget.LINK)
    }
  }

  handleShare = (e: React.MouseEvent<HTMLAnchorElement>, target: ShareTarget) => {
    e.preventDefault()
    const width = 600
    const height = 250
    const top = Math.ceil(window.outerHeight / 2 - height / 2)
    const left = Math.ceil(window.outerWidth / 2 - width / 2)
    window.open(
      e.currentTarget.href,
      'targetWindow',
      `toolbar=no,location=0,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${width},height=${height},top=${top},left=${left}`
    )
    this.props.onShare(target)
  }

  handleShareWithFacebook = (e: React.MouseEvent<HTMLAnchorElement>) => this.handleShare(e, ShareTarget.FACEBOOK)
  handleShareWithTwitter = (e: React.MouseEvent<HTMLAnchorElement>) => this.handleShare(e, ShareTarget.TWITTER)

  handleLogin = () => {
    const { onLogin } = this.props
    onLogin()
  }

  getFacebookLink = () => {
    const { project } = this.props
    const url = this.getShareLink()
    return encodeURI(t('share_modal.uri.facebook', { ...project, url }))
  }

  getTwitterLink = () => {
    const { project } = this.props
    const url = this.getShareLink()
    return encodeURI(t('share_modal.uri.twitter', { ...project, url }))
  }

  getShareLink = () => {
    const { project } = this.props
    const { type } = this.state

    switch (type) {
      case ShareModalType.PROJECT:
        return SHARE_SCENE_URL + `/scene/${project.id}`

      default:
        return SHARE_SCENE_URL + `/${type}/${project.id}`
    }
  }

  renderLogin() {
    return (
      <LoginModal
        name={this.props.name}
        onClose={this.props.onClose}
        onLogin={this.handleLogin}
        title={t('share_modal.sign_in.title')}
        subtitle={t('share_modal.sign_in.subtitle')}
      />
    )
  }

  renderLoading() {
    const { name } = this.props
    return (
      <Modal name={name} onClose={this.handleClose}>
        <Loader size="large" />
      </Modal>
    )
  }

  render() {
    const { name, project, isLoading, isLoggedIn, isScreenshotReady } = this.props
    const { copied } = this.state

    if (!isLoggedIn) {
      return this.renderLogin()
    }

    if (isLoading || !project.isPublic) {
      return this.renderLoading()
    }

    return (
      <Modal name={name} onClose={this.handleClose}>
        <ModalNavigation title={t('share_modal.title')} subtitle={t('share_modal.description')} onClose={this.handleClose} />
        <div className="share-modal">
          <div
            className="thumbnail"
            style={{
              backgroundImage: isScreenshotReady ? `url("${project.thumbnail}")` : '',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {!isScreenshotReady && <Loader size="small" />}
          </div>
          <div className="button-group">
            <a className="button facebook" onClick={this.handleShareWithFacebook} href={this.getFacebookLink()}>
              <Icon name="facebook" /> {t(`global.share`)}
            </a>
            <a className="button twitter" onClick={this.handleShareWithTwitter} href={this.getTwitterLink()}>
              <Icon name="twitter" /> {t(`global.share`)}
            </a>
          </div>
          <div className="copy-group">
            <input ref={this.input} className="copy-input" readOnly={true} value={this.getShareLink()} onFocus={this.handleFocusLink} />
            <a className="copy-button" onClick={this.handleCopyLink} href={this.getShareLink()}>
              {copied ? t(`share_modal.copied`) : t(`share_modal.copy`)}
            </a>
          </div>
        </div>
      </Modal>
    )
  }
}
