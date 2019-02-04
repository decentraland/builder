import * as React from 'react'
import { Link } from 'react-router-dom'
import { Header, Grid, Icon, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

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

  render() {
    const { currentProject, mode, isPreviewing, isSidebarOpen, hasHistory, selectedEntityId, onUndo } = this.props
    return (
      <Grid className="TopBar">
        <Grid.Column mobile={4} tablet={4} computer={4} className="left-column" verticalAlign="middle">
          <Header size="medium">
            <Link className="text" to={locations.root()}>
              <Icon name="chevron left" />
            </Link>
            {currentProject ? currentProject.title : null}
          </Header>
        </Grid.Column>
        <Grid.Column mobile={6} tablet={6} computer={7} className="middle-column">
          <Grid.Row>
            <span className="editor-modes">
              <Chip icon="move" isActive={mode === 'move'} onClick={this.handleMoveMode} />
              <Chip icon="rotate" isActive={mode === 'rotate'} onClick={this.handleRotateMode} />
            </span>
            <Chip icon="undo" isDisabled={!hasHistory} onClick={onUndo} />
            <Chip icon="duplicate" isDisabled={!selectedEntityId} />
            <Chip icon="delete" isDisabled={!selectedEntityId} />
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
