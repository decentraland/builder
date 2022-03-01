import * as React from 'react'
import { Loader, Page, Responsive, Container } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import Chip from 'components/Chip'
import Footer from 'components/Footer'
import Icon from 'components/Icon'
import Navbar from 'components/Navbar'
import NotFoundPage from 'components/NotFoundPage'
import ViewPort from 'components/ViewPort'
import Back from 'components/Back'
import { PreviewType } from 'modules/editor/types'
import { Props, State } from './SceneViewPage.types'

import './SceneViewPage.css'

export default class SceneViewPage extends React.PureComponent<Props, State> {
  componentDidMount() {
    const { match, onLoadProject } = this.props
    if (match.params.projectId) {
      onLoadProject(match.params.projectId, this.getType())
    }
  }

  componentWillUnmount() {
    this.props.onCloseEditor()
  }

  handlePreview = () => {
    this.props.onPreview()
  }

  handleLike = () => {
    const { currentPool, isLoggedIn, onOpenModal } = this.props

    if (currentPool) {
      if (isLoggedIn) {
        this.props.onLikePool(currentPool.id, !currentPool.like)
      } else {
        onOpenModal('LikeModal', {})
      }
    }
  }

  getType() {
    return (this.props.match && this.props.match.params && this.props.match.params.type) || PreviewType.PUBLIC
  }

  getCurrentProject() {
    const { currentProject, currentPool } = this.props

    switch (this.getType()) {
      case 'pool':
        return currentPool
      default:
        return currentProject
    }
  }

  getCurrentPool() {
    const { currentPool } = this.props

    switch (this.getType()) {
      case 'pool':
        return currentPool
      default:
        return null
    }
  }

  getParcelCount() {
    const currentProject = this.getCurrentProject()
    if (!currentProject) {
      return 0
    }

    return currentProject.layout.cols * currentProject.layout.rows
  }

  getObjectCount() {
    const { currentScene } = this.props
    if (!currentScene) {
      return 0
    }

    const parcelCount = this.getParcelCount()
    if (parcelCount === 0) {
      return 0
    }

    const entitiesCount = Object.keys(currentScene.entities).length
    if (entitiesCount < parcelCount) {
      return 0
    }

    return entitiesCount - parcelCount
  }

  renderNotFount() {
    return <NotFoundPage />
  }

  renderLoading() {
    return (
      <>
        <Navbar isFullscreen />
        <Page isFullscreen>
          <Loader active size="huge" />
        </Page>
        <Footer isFullscreen />
      </>
    )
  }

  render() {
    const { isFetching, isPreviewing, isReady } = this.props

    if (isFetching) {
      return this.renderLoading()
    }

    const currentProject = this.getCurrentProject()
    if (!currentProject) {
      return this.renderNotFount()
    }

    const currentPool = this.getCurrentPool()
    const { currentAuthor: author, onBack } = this.props

    return (
      <>
        {!isPreviewing && (
          <>
            <Navbar isFullscreen />
            <Container className="back-container">
              <Back absolute onClick={onBack}></Back>
            </Container>
          </>
        )}

        <div className={'SceneViewPage' + (isPreviewing ? ' preview' : ' mini')}>
          <div className="thumbnail" style={{ backgroundImage: `url("${currentProject.thumbnail}")` }}>
            <Responsive minWidth={1025} as={React.Fragment}>
              <ViewPort key={currentProject.id} isReadOnly={true} type={this.getType()} />
            </Responsive>
          </div>
          <div className="scene-action-list">
            {currentPool && (
              <div className="scene-action">
                <Chip
                  text={
                    <>
                      <Icon name={currentPool.like ? 'heart-full' : 'heart'} />
                      {currentPool.likes > 0 && <span className="LikeCount">{currentPool.likes}</span>}
                    </>
                  }
                  type="circle"
                  onClick={this.handleLike}
                />
              </div>
            )}
            <div style={{ flex: 1 }} />
            <Responsive minWidth={1025} as={React.Fragment}>
              <div className="scene-action">
                <Chip icon="view" type="circle" isActive={isPreviewing} isDisabled={!isReady} onClick={this.handlePreview} />
              </div>
            </Responsive>
          </div>
          <div className="detail">
            <div className="title">
              <h1>{currentProject.title}</h1>
            </div>
            {author && (
              <div className="author">
                {t('public_page.made_by')}
                <span className="author-name"> {author.avatars.length > 0 ? author.avatars[0].name : t('user_menu.guest')}</span>
                <div className="avatar">
                  <img width="24" height="24" src={author.avatars.length > 0 ? author.avatars[0].avatar.snapshots.face256 : ''} />
                </div>
              </div>
            )}
            {currentProject.description && (
              <div className="description">
                <p>{currentProject.description}</p>
              </div>
            )}
            <div className="component-list">
              <div className="component">
                <Icon name="scene-parcel" /> {t('public_page.parcel_count', { parcels: this.getParcelCount() })}
              </div>
              <div className="component">
                <Icon name="scene-object" /> {t('public_page.item_count', { items: this.getObjectCount() })}
              </div>
            </div>
          </div>
        </div>
        {!isPreviewing && <Footer />}
      </>
    )
  }
}
