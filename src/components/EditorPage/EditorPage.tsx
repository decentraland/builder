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
import LocalStorageToast from './LocalStorageToast'
import ItemDragLayer from './ItemDragLayer'
import { Props } from './EditorPage.types'
import { ToolName } from './Tools/Tools.types'

import './EditorPage.css'

export const LOCALSTORAGE_TUTORIAL_KEY = 'builder-tutorial'
const localStorage = getLocalStorage()

export default class EditorPage extends React.PureComponent<Props> {
  componentWillMount() {
    const { currentProject, onLoadAssetPacks, onBindKeyboardShortcuts, onOpenModal } = this.props

    onLoadAssetPacks()
    onBindKeyboardShortcuts()

    if (currentProject && !localStorage.getItem(LOCALSTORAGE_TUTORIAL_KEY)) {
      onOpenModal('TutorialModal')
    }

    document.body.classList.add('lock-scroll')
    document.body.scrollTop = 0
    document.body.addEventListener('mousewheel', this.handleMouseWheel)
  }

  componentWillUnmount() {
    const { onUnbindKeyboardShortcuts, onCloseEditor } = this.props

    onUnbindKeyboardShortcuts()
    onCloseEditor()
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
    const { currentProject, isPreviewing, isSidebarOpen, isLoading } = this.props
    const gridClasses = isPreviewing ? 'fullscreen' : 'horizontal-layout'
    const toolbarClasses = isSidebarOpen ? 'toolbar open' : 'toolbar'

    if (!currentProject) {
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
            {isLoading || isPreviewing ? null : (
              <div className={toolbarClasses}>
                <>
                  <Metrics />
                  <Tools isSidebarOpen={isSidebarOpen} onClick={this.handleToolClick} />
                  <ItemDragLayer />
                  <LocalStorageToast />
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
