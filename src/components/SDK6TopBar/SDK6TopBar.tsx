import { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
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
import { Props } from './SDK6TopBar.types'
import './SDK6TopBar.css'

const widget = IntercomWidget.getInstance()

export default function SDK6TopBar(props: Props) {
  const {
    gizmo,
    isPreviewing,
    isSidebarOpen,
    isLoading,
    hasHistory,
    currentProject,
    currentPoolGroup,
    selectedEntityIds,
    isUploading,
    enabledTools,
    onSetGizmo,
    onTogglePreview,
    onToggleSidebar,
    onOpenModal,
    onReset,
    onDelete,
    onDuplicate
  } = props
  const history = useHistory()

  const handleMoveMode = useCallback(() => {
    onSetGizmo(gizmo === Gizmo.MOVE ? Gizmo.NONE : Gizmo.MOVE)
  }, [gizmo, onSetGizmo])

  const handleRotateMode = useCallback(() => {
    onSetGizmo(gizmo === Gizmo.ROTATE ? Gizmo.NONE : Gizmo.ROTATE)
  }, [gizmo, onSetGizmo])

  const handleScaleMode = useCallback(() => {
    onSetGizmo(gizmo === Gizmo.SCALE ? Gizmo.NONE : Gizmo.SCALE)
  }, [gizmo, onSetGizmo])

  const handleTogglePreview = useCallback(() => {
    widget.unmount()
    onTogglePreview(!isPreviewing)
  }, [onTogglePreview, isPreviewing])

  const handleToggleSidebar = useCallback(() => {
    onToggleSidebar(!isSidebarOpen)
  }, [onToggleSidebar, isSidebarOpen])

  const handleTitleClick = useCallback(() => {
    if (!isLoading) {
      onOpenModal('EditProjectModal')
    }
  }, [isLoading, onOpenModal])

  const handleGoBack = useCallback(() => {
    if (hasHistory) {
      history.goBack()
    } else {
      history.push(currentProject ? locations.sceneDetail(currentProject.id) : locations.root())
    }
  }, [history, currentProject, hasHistory])

  const handleExport = useCallback(() => {
    onOpenModal('ExportModal', { project: currentProject })
  }, [onOpenModal, currentProject])

  return (
    <Grid className="SDK6TopBar">
      <Grid.Column mobile={4} tablet={4} computer={4} className="left-column" verticalAlign="middle">
        <Header size="medium" className="project-title-header">
          <div className="go-back" onClick={handleGoBack}>
            <Icon name="chevron left" />
          </div>
          {currentProject ? (
            <>
              <div className={`project-title ${isLoading ? 'disabled' : ''}`} onClick={handleTitleClick} title={currentProject.title}>
                {currentProject.title}
              </div>
              {isUploading ? (
                <OwnIcon name="cloud-upload" className="cloud-upload-indicator is-uploading" />
              ) : (
                <OwnIcon name="edit" className="edit-project-icon" onClick={handleTitleClick} />
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
                  onClick={handleMoveMode}
                />
              </ShortcutTooltip>
              <ShortcutTooltip shortcut={Shortcut.ROTATE} position="bottom center" className="tool" popupClassName="top-bar-popup">
                <Chip
                  icon="rotate"
                  isActive={gizmo === Gizmo.ROTATE && selectedEntityIds.length > 0}
                  isDisabled={!enabledTools.rotate}
                  onClick={handleRotateMode}
                />
              </ShortcutTooltip>
              <ShortcutTooltip shortcut={Shortcut.SCALE} position="bottom center" className="tool" popupClassName="top-bar-popup">
                <Chip
                  icon="scale"
                  isActive={gizmo === Gizmo.SCALE && selectedEntityIds.length > 0}
                  isDisabled={!enabledTools.scale}
                  onClick={handleScaleMode}
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
          {currentProject ? <DeploymentStatus projectId={currentProject.id} /> : null}
          <ShortcutTooltip shortcut={Shortcut.PREVIEW} position="bottom center" className="tool" popupClassName="top-bar-popup">
            <Chip icon="preview" isActive={isPreviewing} isDisabled={isLoading} onClick={handleTogglePreview} />
          </ShortcutTooltip>
          <ShortcutTooltip shortcut={Shortcut.EXPORT_SCENE} position="bottom center" className="tool" popupClassName="top-bar-popup">
            <Chip icon="export" isDisabled={isLoading} onClick={handleExport} />
          </ShortcutTooltip>
          <ShortcutTooltip shortcut={Shortcut.TOGGLE_SIDEBAR} position="bottom center" className="tool" popupClassName="top-bar-popup">
            <Chip icon="sidebar" isActive={isSidebarOpen} onClick={handleToggleSidebar} />
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
