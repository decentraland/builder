import * as React from 'react'
import { Grid } from 'decentraland-ui'

import TopBar from 'components/TopBar'
import ViewPort from 'components/ViewPort'
import SideBar from 'components/SideBar'
import Tools from './Tools'
import Metrics from './Metrics'

import { Props } from './EditorPage.types'
import { ToolName } from './Tools/Tools.types'
import './EditorPage.css'

export default class EditorPage extends React.PureComponent<Props> {
  componentWillMount() {
    this.props.onLoadAssetPacks()
    this.props.onBindKeyboardShortcuts()
    document.body.classList.add('lock-scroll')
    document.body.scrollTop = 0
  }

  componentWillUnmount() {
    this.props.onUnbindKeyboardShortcuts()
    this.props.onCloseEditor()
    document.body.classList.remove('lock-scroll')
  }

  handleToolClick = (toolName: ToolName) => {
    switch (toolName) {
      case 'shortcuts':
        this.props.onOpenModal('ShortcutsModal')
        break
      case 'zoom-out':
        this.props.onZoomOut()
        break
      case 'zoom-in':
        this.props.onZoomIn()
        break
      case 'reset-camera':
        this.props.onResetCamera()
        break
      default:
        break
    }
  }

  render() {
    const { isPreviewing, isSidebarOpen } = this.props
    const gridClasses = isPreviewing ? 'fullscreen' : 'horizontal-layout'
    const toolbarClasses = isSidebarOpen ? 'toolbar open' : 'toolbar'
    return (
      <div className="EditorPage">
        {isPreviewing ? null : <TopBar />}
        <Grid className={gridClasses}>
          <Grid.Row className="wrapper">
            <ViewPort />
            <div className={toolbarClasses}>
              {isPreviewing ? null : (
                <>
                  <Metrics />
                  <Tools onClick={this.handleToolClick} />
                </>
              )}
            </div>
            {isPreviewing || !isSidebarOpen ? null : <SideBar />}
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}
