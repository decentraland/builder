import * as React from 'react'
import { Grid } from 'decentraland-ui'
import App from 'decentraland-dapps/dist/containers/App'
import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'

import NotFoundPage from 'components/NotFoundPage'
import TopBar from 'components/TopBar'
import ViewPort from 'components/ViewPort'
import SideBar from 'components/SideBar'
import Tools from './Tools'
import Metrics from './Metrics'

import { Props } from './EditorPage.types'
import { ToolName } from './Tools/Tools.types'
import ItemDragLayer from './ItemDragLayer'

import './EditorPage.css'

const localStorage = getLocalStorage()

export default class EditorPage extends React.PureComponent<Props> {
  componentWillMount() {
    this.props.onLoadAssetPacks()
    this.props.onBindKeyboardShortcuts()

    if (this.props.project && !localStorage.getItem('builder-tutorial')) {
      this.props.onOpenModal('TutorialModal')
    }

    document.body.classList.add('lock-scroll')
    document.body.scrollTop = 0
    document.body.addEventListener('mousewheel', this.handleMouseWheel)
  }

  componentWillUnmount() {
    this.props.onUnbindKeyboardShortcuts()
    this.props.onCloseEditor()
    document.body.classList.remove('lock-scroll')
    document.body.removeEventListener('mousewheel', this.handleMouseWheel)
  }

  handleMouseWheel = (e: Event) => {
    if ((e as MouseWheelEvent)['ctrlKey']) {
      e.preventDefault()
      e.stopImmediatePropagation()
    }
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

    if (!this.props.project) {
      return (
        <App>
          <NotFoundPage />
        </App>
      )
    }

    return (
      <div className="EditorPage">
        {isPreviewing ? null : <TopBar />}
        <Grid className={gridClasses}>
          <Grid.Row className="wrapper">
            <ViewPort />
            {isPreviewing ? null : (
              <div className={toolbarClasses}>
                <>
                  <Metrics />
                  <Tools onClick={this.handleToolClick} />
                  <ItemDragLayer />
                </>
              </div>
            )}
            {isPreviewing || !isSidebarOpen ? null : <SideBar />}
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}
