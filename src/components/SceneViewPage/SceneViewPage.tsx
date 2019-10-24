import * as React from 'react'
import { Loader, Page } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import Chip from 'components/Chip'
import Footer from 'components/Footer'
import Icon from 'components/Icon'
import Navbar from 'components/Navbar'
import NotFoundPage from 'components/NotFoundPage'
import ShortcutTooltip from 'components/ShortcutTooltip'
import ViewPort from 'components/ViewPort'

import { Shortcut } from 'modules/keyboard/types'
import { Project } from 'modules/project/types'
import { ComponentType } from 'modules/scene/types'

import SceneViewMenu from './SceneViewMenu'
import { Props, State } from './SceneViewPage.types'

import './SceneViewPage.css'

export default class SceneViewPage extends React.PureComponent<Props, State> {
  componentDidMount() {
    const { currentProject, match, onLoadProject } = this.props
    if (!currentProject && match.params.projectId) {
      onLoadProject(match.params.projectId, match.params.type || 'public')
    }
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

    let componentCount = 0
    for (let component of Object.values(currentScene.components)) {
      switch (component.type) {
        case ComponentType.GLTFShape:
        case ComponentType.NFTShape:
          componentCount++
          break
        default:
        // ignore
      }
    }

    if (componentCount < parcelCount) {
      return 0
    }

    return componentCount - parcelCount
  }

  renderPreview() {
    return <ViewPort />
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

    if (isPreviewing) {
      return this.renderPreview()
    }

    const project = currentProject as Project
    const { currentAuthor: author } = this.props

    return (
      <>
        <Navbar isFullscreen rightMenu={<SceneViewMenu />} />
        <Page>
          <div className="SceneViewPage">
            <div className="thumbnail">
              <ViewPort />
            </div>
            <div className="scene-action-list">
              <div style={{ flex: 1 }}/>
              <div className="scene">
                <ShortcutTooltip shortcut={Shortcut.PREVIEW} position="bottom center" className="tool" popupClassName="top-bar-popup">
                  <Chip icon="preview" isActive={isPreviewing} onClick={this.handlePreview} />
                </ShortcutTooltip>
              </div>
            </div>
            <div className="detail">
              <div className="title">
                <h1>{project.title}</h1>
              </div>
              {author && (
                <div className="author">
                  {t('public_page.made_by')} {' '} <span className="author-name">{author.name}</span>
                </div>
              )}
              {author && (
                <div className="avatar">
                  <img width="24" height="24" src={author.avatar.snapshots.face} />
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
        </Page>
        <Footer isFullscreen />
      </>
    )
  }
}
