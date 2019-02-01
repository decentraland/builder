import * as React from 'react'
import { Link } from 'react-router-dom'
import { Header, Grid, Icon } from 'decentraland-ui'

import { locations } from 'routing/locations'
import Chip from 'components/Chip'
import { Props } from './TopBar.types'
import './TopBar.css'

export default class TopBar extends React.PureComponent<Props> {
  handleMoveMode = () => {
    const { onSetMode } = this.props
    onSetMode('move')
  }

  handleRotateMode = () => {
    const { onSetMode } = this.props
    onSetMode('rotate')
  }

  togglePreview = () => {
    const { onTogglePreview, isPreviewing } = this.props
    onTogglePreview(!isPreviewing)
  }

  toggleSidebar = () => {
    const { onToggleSidebar, isSidebarOpen } = this.props
    onToggleSidebar(!isSidebarOpen)
  }

  render() {
    const { currentProject, mode, isPreviewing, isSidebarOpen, hasHistory, selectedEntityId, onUndo } = this.props
    return (
      <Grid className="TopBar">
        <Grid.Column width="four" className="left-column" verticalAlign="middle">
          <Header size="medium">
            <Link className="text" to={locations.root()}>
              <Icon name="chevron left" />
            </Link>
            {currentProject ? currentProject.title : null}
          </Header>
        </Grid.Column>
        <Grid.Column width="eight" className="middle-column">
          <Grid.Row>
            <div className="editor-actions">
              <span className="editor-modes">
                <Chip icon="move" isActive={mode === 'move'} onClick={this.handleMoveMode} />
                <Chip icon="rotate" isActive={mode === 'rotate'} onClick={this.handleRotateMode} />
              </span>
              <Chip icon="undo" isDisabled={!hasHistory} onClick={onUndo} />
              <Chip icon="duplicate" isDisabled={!selectedEntityId} />
              <Chip icon="delete" isDisabled={!selectedEntityId} />
            </div>
          </Grid.Row>
        </Grid.Column>
        <Grid.Column width="four" className="right-column">
          <Grid.Row>
            <div className="toggle-options">
              <Chip icon="preview" isActive={isPreviewing} onClick={this.togglePreview} />
              <Chip icon="sidebar" isActive={isSidebarOpen} onClick={this.toggleSidebar} />
            </div>
          </Grid.Row>
        </Grid.Column>
      </Grid>
    )
  }
}
