import * as React from 'react'
import { Header, Grid, Icon } from 'decentraland-ui'
import { IntercomWidget } from 'decentraland-dapps/dist/components/Intercom/IntercomWidget'

import DeploymentStatus from 'components/DeploymentStatus'
import ShortcutTooltip from 'components/ShortcutTooltip'
import Chip from 'components/Chip'
import OwnIcon from 'components/Icon'
import DeployButton from 'components/DeployButton'
import DeployContestButton from 'components/DeployContestButton'
import ShareButton from 'components/ShareButton'
import { locations } from 'routing/locations'

import { Gizmo } from 'modules/editor/types'
import { Shortcut } from 'modules/keyboard/types'
import { Props } from './TopBar.types'
import './TopBar.css'

const widget = IntercomWidget.getInstance()

export default class TopBar extends React.PureComponent<Props> {
  handleMoveMode = () => {
    const { gizmo, onSetGizmo } = this.props
    onSetGizmo(gizmo === Gizmo.MOVE ? Gizmo.NONE : Gizmo.MOVE)
  }

  handleRotateMode = () => {
    const { gizmo, onSetGizmo } = this.props
    onSetGizmo(gizmo === Gizmo.ROTATE ? Gizmo.NONE : Gizmo.ROTATE)
  }

  handleScaleMode = () => {
    const { gizmo, onSetGizmo } = this.props
    onSetGizmo(gizmo === Gizmo.SCALE ? Gizmo.NONE : Gizmo.SCALE)
  }

  handleTogglePreview = () => {
    const { onTogglePreview, isPreviewing } = this.props
    widget.unmount()
    onTogglePreview(!isPreviewing)
  }

  handleToggleSidebar = () => {
    const { onToggleSidebar, isSidebarOpen } = this.props
    onToggleSidebar(!isSidebarOpen)
  }

  handleTitleClick = () => {
    const { isLoading, onOpenModal } = this.props
    if (!isLoading) {
      onOpenModal('EditProjectModal')
    }
  }

  handleGoBack = () => {
    const { currentProject, onNavigate, onBack, hasHistory } = this.props
    if (hasHistory) {
      onBack()
    } else {
      onNavigate(currentProject ? locations.sceneDetail(currentProject.id) : locations.root())
    }
  }

  handleExport = () => {
    this.props.onOpenModal('ExportModal', { project: this.props.currentProject })
  }

  isSceneLoading() {
    const { metrics, isLoading } = this.props
    return isLoading || (metrics.entities > 0 && metrics.triangles === 0)
  }

  render() {
    const {
      gizmo,
      currentProject,
      currentPoolGroup,
      isPreviewing,
      isUploading,
      isSidebarOpen,
      selectedEntityIds: selectedEntityIds,
      enabledTools,
      isLoading,
      onReset,
      onDelete,
      onDuplicate
    } = this.props

    return (
      <Grid className="TopBar">
        <Grid.Column mobile={4} tablet={4} computer={4} className="left-column" verticalAlign="middle">
          <Header size="medium" className="project-title-header">
            <div className="go-back" onClick={this.handleGoBack}>
              <Icon name="chevron left" />
            </div>
            {currentProject ? (
              <>
                <DeploymentStatus projectId={currentProject.id} />
                <div
                  className={`project-title ${isLoading ? 'disabled' : ''}`}
                  onClick={this.handleTitleClick}
                  title={currentProject.title}
                >
                  {currentProject.title}
                </div>
                {isUploading ? (
                  <OwnIcon name="cloud-upload" className="cloud-upload-indicator is-uploading" />
                ) : (
                  <OwnIcon name="edit" className="edit-project-icon" onClick={this.handleTitleClick} />
                )}
              </>
            ) : null}
          </Header>
        </Grid.Column>
        <Grid.Column mobile={6} tablet={6} computer={7} className="middle-column">
          <Grid.Row>
            <div className="editor-actions">
              <span className="editor-modes">
                <ShortcutTooltip shortcut={Shortcut.MOVE} position="bottom center" className="tool" popupClassName="top-bar-popup">
                  <Chip
                    icon="move"
                    isActive={gizmo === Gizmo.MOVE && selectedEntityIds.length > 0}
                    isDisabled={!enabledTools.move}
                    onClick={this.handleMoveMode}
                  />
                </ShortcutTooltip>
                <ShortcutTooltip shortcut={Shortcut.ROTATE} position="bottom center" className="tool" popupClassName="top-bar-popup">
                  <Chip
                    icon="rotate"
                    isActive={gizmo === Gizmo.ROTATE && selectedEntityIds.length > 0}
                    isDisabled={!enabledTools.rotate}
                    onClick={this.handleRotateMode}
                  />
                </ShortcutTooltip>
                <ShortcutTooltip shortcut={Shortcut.SCALE} position="bottom center" className="tool" popupClassName="top-bar-popup">
                  <Chip
                    icon="scale"
                    isActive={gizmo === Gizmo.SCALE && selectedEntityIds.length > 0}
                    isDisabled={!enabledTools.scale}
                    onClick={this.handleScaleMode}
                  />
                </ShortcutTooltip>
              </span>
              <ShortcutTooltip shortcut={Shortcut.RESET_ITEM} position="bottom center" className="tool" popupClassName="top-bar-popup">
                <Chip icon="undo" isDisabled={!enabledTools.reset} onClick={onReset} />
              </ShortcutTooltip>
              <ShortcutTooltip shortcut={Shortcut.DUPLICATE_ITEM} position="bottom center" className="tool" popupClassName="top-bar-popup">
                <Chip icon="duplicate" isDisabled={!enabledTools.duplicate} onClick={onDuplicate} />
              </ShortcutTooltip>
              <ShortcutTooltip shortcut={Shortcut.DELETE_ITEM} position="bottom center" className="tool" popupClassName="top-bar-popup">
                <Chip icon="delete" isDisabled={!enabledTools.delete} onClick={onDelete} />
              </ShortcutTooltip>
            </div>
          </Grid.Row>
        </Grid.Column>
        <Grid.Column mobile={6} tablet={6} computer={5} className="right-column">
          <Grid.Row>
            <ShortcutTooltip shortcut={Shortcut.PREVIEW} position="bottom center" className="tool" popupClassName="top-bar-popup">
              <Chip icon="preview" isActive={isPreviewing} isDisabled={isLoading} onClick={this.handleTogglePreview} />
            </ShortcutTooltip>
            <ShortcutTooltip shortcut={Shortcut.EXPORT_SCENE} position="bottom center" className="tool" popupClassName="top-bar-popup">
              <Chip icon="export" isDisabled={isLoading} onClick={this.handleExport} />
            </ShortcutTooltip>
            <ShortcutTooltip shortcut={Shortcut.TOGGLE_SIDEBAR} position="bottom center" className="tool" popupClassName="top-bar-popup">
              <Chip icon="sidebar" isActive={isSidebarOpen} onClick={this.handleToggleSidebar} />
            </ShortcutTooltip>
            <span className="contest-button-wrapper">
              {!currentPoolGroup && <ShareButton />}
              <DeployButton />
              {currentPoolGroup && <DeployContestButton />}
            </span>
          </Grid.Row>
        </Grid.Column>
      </Grid>
    )
  }
}
