import * as React from 'react'
import { Loader, Page, Responsive } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Ad from 'decentraland-ad/lib/Ad/Ad'

import Chip from 'components/Chip'
import Footer from 'components/Footer'
import Icon from 'components/Icon'
import Navbar from 'components/Navbar'
import NotFoundPage from 'components/NotFoundPage'
import ViewPort from 'components/ViewPort'

import { Project } from 'modules/project/types'

import SceneViewMenu from './SceneViewMenu'
import { Props, State } from './SceneViewPage.types'

import './SceneViewPage.css'

export default class SceneViewPage extends React.PureComponent<Props, State> {
  componentDidMount() {
    const { currentProject, match, onLoadProject, onReadOnly } = this.props
    onReadOnly(true)
    if (!currentProject && match.params.projectId) {
      onLoadProject(match.params.projectId, match.params.type || 'public')
    }
  }

  componentWillUnmount() {
    this.props.onReadOnly(false)
  }

  handlePreview = () => {
    this.props.onPreview()
  }

  getParcelCount() {
    const { currentProject } = this.props
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
        <Navbar isFullscreen rightMenu={<SceneViewMenu />} />
        <Page isFullscreen>
          <Loader active size="huge" />
        </Page>
        <Footer isFullscreen />
      </>
    )
  }

  render() {
    const { currentProject, isFetching, isPreviewing } = this.props

    if (isFetching) {
      return this.renderLoading()
    }

    if (!currentProject) {
      return this.renderNotFount()
    }

    const project = currentProject as Project
    const { currentAuthor: author } = this.props

    return (
      <>
        {!isPreviewing && <Ad slot="BUILDER_TOP_BANNER" type="full" />}
        {!isPreviewing && <Navbar isFullscreen rightMenu={<SceneViewMenu />} />}
          <div className={'SceneViewPage' + (isPreviewing ? ' preview' : '') }>
            <div className="thumbnail" style={{ backgroundImage: `url("${project.thumbnail}")` }}>
            <Responsive minWidth={1025} as={React.Fragment}>
              <ViewPort key="SceneView" />
            </Responsive>
            </div>
            <div className="scene-action-list">
              <div style={{ flex: 1 }} />
              <Responsive minWidth={1025} as={React.Fragment}>
                <div className="scene-action">
                  <Chip icon="preview" isActive={isPreviewing} onClick={this.handlePreview} />
                </div>
              </Responsive>
            </div>
            <div className="detail">
              <div className="title">
                <h1>{project.title}</h1>
              </div>
              {author && (
                <div className="author">
                  {t('public_page.made_by')}
                  <span className="author-name"> {author.name}</span>
                  <div className="avatar">
                    <img width="24" height="24" src={author.avatar.snapshots.face} />
                  </div>
                </div>
              )}
              {project.description && (
                <div className="description">
                  <p>{project.description}</p>
                </div>
              )}
              <div className="component-list">
                <div className="component">
                  <Icon name="scene-parcel" /> {t('public_page.parcel_count', { parcels: this.getParcelCount() })}
                </div>
                <div className="component">
                  <Icon name="scene-object" /> {t('public_page.object_count', { objects: this.getObjectCount() })}
                </div>
              </div>
            </div>
          </div>
        {!isPreviewing && <Footer isFullscreen />}
      </>
    )
  }
}
