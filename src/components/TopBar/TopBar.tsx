import * as React from 'react'
import { Link } from 'react-router-dom'
import { Header, Grid, Icon } from 'decentraland-ui'

import { locations } from 'routing/locations'
import { Props } from './TopBar.types'
import './TopBar.css'
import EditorButton from 'components/EditorButton'

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
                <EditorButton name="move" isActive={mode === 'move'} onClick={this.handleMoveMode} />
                <EditorButton name="rotate" isActive={mode === 'rotate'} onClick={this.handleRotateMode} />
              </span>
              <EditorButton name="undo" isDisabled={!hasHistory} onClick={onUndo} />
              <EditorButton name="duplicate" isDisabled={!selectedEntityId} />
              <EditorButton name="delete" isDisabled={!selectedEntityId} />
            </div>
          </Grid.Row>
        </Grid.Column>
        <Grid.Column width="four" className="right-column">
          <Grid.Row>
            <div className="toggle-options">
              <EditorButton name="preview" isActive={isPreviewing} onClick={this.togglePreview} />
              <EditorButton name="sidebar" isActive={isSidebarOpen} onClick={this.toggleSidebar} />
            </div>
          </Grid.Row>
        </Grid.Column>
      </Grid>
    )
  }
}
