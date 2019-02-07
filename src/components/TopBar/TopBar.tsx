import * as React from 'react'
import { Link } from 'react-router-dom'
import { Header, Grid, Icon, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import Chip from 'components/Chip'
import { locations } from 'routing/locations'
import { Props } from './TopBar.types'
import { Gizmo } from 'modules/editor/types'
import './TopBar.css'

export default class TopBar extends React.PureComponent<Props> {
  handleMoveMode = () => {
    const { onSetGizmo } = this.props
    onSetGizmo(Gizmo.MOVE)
  }

  handleRotateMode = () => {
    const { onSetGizmo } = this.props
    onSetGizmo(Gizmo.ROTATE)
  }

  handleTogglePreview = () => {
    const { onTogglePreview, isPreviewing } = this.props
    onTogglePreview(!isPreviewing)
  }

  handleToggleSidebar = () => {
    const { onToggleSidebar, isSidebarOpen } = this.props
    onToggleSidebar(!isSidebarOpen)
  }

  handleAddToContestClick = () => {
    this.props.onOpenModal('ContestModal')
  }

  handleTitleClick = () => {
    this.props.onOpenModal('EditProjectModal')
  }

  render() {
    const { currentProject, gizmo, isPreviewing, isSidebarOpen, selectedEntityId, onReset, onDelete, onDuplicate } = this.props
    return (
      <Grid className="TopBar">
        <Grid.Column mobile={4} tablet={4} computer={4} className="left-column" verticalAlign="middle">
          <Header size="medium">
            <Link className="text" to={locations.root()}>
              <Icon name="chevron left" />
            </Link>
            {currentProject ? (
              <span className="project-title" onClick={this.handleTitleClick}>
                {currentProject.title}
              </span>
            ) : null}
          </Header>
        </Grid.Column>
        <Grid.Column mobile={6} tablet={6} computer={7} className="middle-column">
          <Grid.Row>
            <div className="editor-actions">
              <span className="editor-modes">
                <Chip icon="move" isActive={gizmo === Gizmo.MOVE} onClick={this.handleMoveMode} />
                <Chip icon="rotate" isActive={gizmo === Gizmo.ROTATE} onClick={this.handleRotateMode} />
              </span>
              <Chip icon="undo" isDisabled={!selectedEntityId} onClick={onReset} />
              <Chip icon="duplicate" isDisabled={!selectedEntityId} onClick={onDuplicate} />
              <Chip icon="delete" isDisabled={!selectedEntityId} onClick={onDelete} />
            </div>
          </Grid.Row>
        </Grid.Column>
        <Grid.Column mobile={6} tablet={6} computer={5} className="right-column">
          <Grid.Row>
            <Chip icon="preview" isActive={isPreviewing} onClick={this.handleTogglePreview} />
            <Chip icon="sidebar" isActive={isSidebarOpen} onClick={this.handleToggleSidebar} />

            <Button className="add-to-contest" size="mini" onClick={this.handleAddToContestClick}>
              {t('topbar.add_to_contest')}
            </Button>
          </Grid.Row>
        </Grid.Column>
      </Grid>
    )
  }
}
