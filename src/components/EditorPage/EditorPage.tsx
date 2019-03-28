import * as React from 'react'
import { Grid, Close } from 'decentraland-ui'
import App from 'decentraland-dapps/dist/containers/App'
import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import NotFoundPage from 'components/NotFoundPage'
import TopBar from 'components/TopBar'
import ViewPort from 'components/ViewPort'
import SideBar from 'components/SideBar'
import Tools from './Tools'
import Metrics from './Metrics'
import LocalStorageToast from './LocalStorageToast'
import ItemDragLayer from './ItemDragLayer'
import { ToolName } from './Tools/Tools.types'
import { Props, State } from './EditorPage.types'

import './EditorPage.css'
import { EditorWindow } from 'components/Preview/Preview.types'

export const LOCALSTORAGE_TUTORIAL_KEY = 'builder-tutorial'
export const LOCALSTORAGE_INCENTIVE_BANNER_KEY = 'builder-incentive-banner'

const localStorage = getLocalStorage()

const editorWindow = window as EditorWindow

export default class EditorPage extends React.PureComponent<Props, State> {
  state = {
    isIncentiveBannerOpen: false
  }

  componentWillMount() {
    const { currentProject, onLoadAssetPacks, onOpenModal } = this.props

    onLoadAssetPacks()

    if (currentProject && !localStorage.getItem(LOCALSTORAGE_TUTORIAL_KEY)) {
      onOpenModal('TutorialModal')
    }

    if (!localStorage.getItem(LOCALSTORAGE_INCENTIVE_BANNER_KEY)) {
      this.setState({
        isIncentiveBannerOpen: true
      })
    }

    document.body.scrollTop = 0
    document.body.addEventListener('mousewheel', this.handleMouseWheel)
  }

  componentWillUnmount() {
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

  handleCloseBanner = () => {
    localStorage.setItem(LOCALSTORAGE_INCENTIVE_BANNER_KEY, '1')
    this.setState({
      isIncentiveBannerOpen: false
    })

    requestAnimationFrame(() => editorWindow.editor.resize())
  }

  render() {
    const { currentProject, isPreviewing, isSidebarOpen, isLoading } = this.props
    const { isIncentiveBannerOpen } = this.state
    const gridClasses = isPreviewing ? 'fullscreen' : 'horizontal-layout'
    const toolbarClasses = isSidebarOpen ? 'toolbar open' : 'toolbar'

    if (!currentProject) {
      return (
        <App isFullscreen>
          <NotFoundPage />
        </App>
      )
    }

    return (
      <div className="EditorPage">
        {isIncentiveBannerOpen && (
          <div className="incentive-banner">
            <span>{t('contest.incentive_banner')}</span>
            <Close onClick={this.handleCloseBanner} small />
          </div>
        )}
        {isPreviewing ? null : <TopBar />}
        <Grid className={gridClasses}>
          <Grid.Row className={'wrapper' + (isIncentiveBannerOpen ? ' with-banner' : '')}>
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
