import * as React from 'react'
import { Link } from 'react-router-dom'
import { Header, Grid, Icon } from 'decentraland-ui'
import { IntercomWidget } from 'decentraland-dapps/dist/components/Intercom/IntercomWidget'

import ShortcutTooltip from 'components/ShortcutTooltip'
import Chip from 'components/Chip'
import OwnIcon from 'components/Icon'
import DeployButton from 'components/DeployButton'
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
    this.props.onOpenModal('EditProjectModal')
  }

  handleOpenDeployModal = () => {
    this.props.onOpenModal('DeployModal')
  }

  isSceneLoading() {
    const { metrics, isLoading } = this.props
    return isLoading || (metrics.entities > 0 && metrics.triangles === 0)
  }

  render() {
    const { gizmo, currentProject, isLoading, isPreviewing, isSidebarOpen, selectedEntityId, onReset, onDelete, onDuplicate } = this.props

    return (
      <Grid className="TopBar">
        <Grid.Column mobile={4} tablet={4} computer={4} className="left-column" verticalAlign="middle">
          <Header size="medium" className="project-title-header">
            <Link className="text" to={locations.root()}>
              <Icon name="chevron left" />
            </Link>
            {currentProject ? (
              <>
                <div className="project-title" onClick={this.handleTitleClick} title={currentProject.title}>
                  {currentProject.title}
                </div>
                <OwnIcon name="edit" className="edit-project-icon" onClick={this.handleTitleClick} />
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
                    isActive={gizmo === Gizmo.MOVE && !!selectedEntityId}
                    isDisabled={!selectedEntityId}
                    onClick={this.handleMoveMode}
                  />
                </ShortcutTooltip>
                <ShortcutTooltip shortcut={Shortcut.ROTATE} position="bottom center" className="tool" popupClassName="top-bar-popup">
                  <Chip
                    icon="rotate"
                    isActive={gizmo === Gizmo.ROTATE && !!selectedEntityId}
                    isDisabled={!selectedEntityId}
                    onClick={this.handleRotateMode}
                  />
                </ShortcutTooltip>
              </span>
              <ShortcutTooltip shortcut={Shortcut.RESET_ITEM} position="bottom center" className="tool" popupClassName="top-bar-popup">
                <Chip icon="undo" isDisabled={!selectedEntityId} onClick={onReset} />
              </ShortcutTooltip>
              <ShortcutTooltip shortcut={Shortcut.DUPLICATE_ITEM} position="bottom center" className="tool" popupClassName="top-bar-popup">
                <Chip icon="duplicate" isDisabled={!selectedEntityId} onClick={onDuplicate} />
              </ShortcutTooltip>
              <ShortcutTooltip shortcut={Shortcut.DELETE_ITEM} position="bottom center" className="tool" popupClassName="top-bar-popup">
                <Chip icon="delete" isDisabled={!selectedEntityId} onClick={onDelete} />
              </ShortcutTooltip>
            </div>
          </Grid.Row>
        </Grid.Column>
        <Grid.Column mobile={6} tablet={6} computer={5} className="right-column">
          <Grid.Row>
            <ShortcutTooltip shortcut={Shortcut.PREVIEW} position="bottom center" className="tool" popupClassName="top-bar-popup">
              <Chip icon="preview" isActive={isPreviewing} isDisabled={isLoading} onClick={this.handleTogglePreview} />
            </ShortcutTooltip>
            <ShortcutTooltip shortcut={Shortcut.TOGGLE_SIDEBAR} position="bottom center" className="tool" popupClassName="top-bar-popup">
              <Chip icon="sidebar" isActive={isSidebarOpen} onClick={this.handleToggleSidebar} />
            </ShortcutTooltip>
            <span className="tool">
              <DeployButton onClick={this.handleOpenDeployModal} />
            </span>
          </Grid.Row>
        </Grid.Column>
      </Grid>
    )
  }
}
