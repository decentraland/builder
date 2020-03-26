import * as React from 'react'
import { Grid } from 'decentraland-ui'
import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'
// import Ad from 'decentraland-ad/lib/Ad/Ad'
import experiments, { EXPERIMENT_TUTORIAL_OPEN } from 'experiments'

import NotFoundPage from 'components/NotFoundPage'
import LoadingPage from 'components/LoadingPage'
import TopBar from 'components/TopBar'
import ViewPort from 'components/ViewPort'
import SideBar from 'components/SideBar'
import LocalStorageToast from 'components/LocalStorageToast'
import Tools from './Tools'
import Metrics from './Metrics'
import ItemDragLayer from './ItemDragLayer'
import { ToolName } from './Tools/Tools.types'
import { Props, State } from './EditorPage.types'

import './EditorPage.css'

export const LOCALSTORAGE_TUTORIAL_KEY = 'builder-tutorial'
export const LOCALSTORAGE_INCENTIVE_BANNER_KEY = 'builder-incentive-banner'
const TOAST_ITEMS_THRESHOLD = 5 // local storage toast will show when a user has at least this amount of items

const localStorage = getLocalStorage()

export default class EditorPage extends React.PureComponent<Props, State> {
  state = {
    isIncentiveBannerOpen: false
  }

  componentWillMount() {
    const { currentProject, onOpenModal } = this.props

    if (currentProject && !localStorage.getItem(LOCALSTORAGE_TUTORIAL_KEY)) {
      const showTutorial = experiments.getCurrentValueFor(EXPERIMENT_TUTORIAL_OPEN, true)
      if (showTutorial) {
        onOpenModal('TutorialModal')
      }
    }

    document.body.scrollTop = 0
    document.body.classList.add('lock-scroll')
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

  handleBannerShow = () => {
    this.setState({ isIncentiveBannerOpen: true })
  }
  handleBannerClose = () => {
    this.setState({ isIncentiveBannerOpen: false })
  }

  render() {
    const { isIncentiveBannerOpen } = this.state
    const { currentProject, isPreviewing, isSidebarOpen, isLoading, isFetching, isLoggedIn, numItems } = this.props
    const gridClasses = isPreviewing ? 'fullscreen' : 'horizontal-layout'
    const toolbarClasses = isSidebarOpen ? 'toolbar open' : 'toolbar'
    let wrapperClasses = 'wrapper'

    if (isPreviewing) {
      wrapperClasses += ' fullscreen'
    }
    if (isIncentiveBannerOpen && !isPreviewing) {
      wrapperClasses += ' with-banner'
    }
    if (isFetching) {
      return <LoadingPage />
    }
    if (!currentProject) {
      return <NotFoundPage />
    }

    const showLocalStorageToast = !isLoggedIn && numItems >= TOAST_ITEMS_THRESHOLD

    return (
      <div className="EditorPage">
        {/* {isPreviewing ? null : (
          <Ad slot="BUILDER_TOP_BANNER" type="full" advertisingDidMount={this.handleBannerShow} onClose={this.handleBannerClose} />
        )} */}
        {isPreviewing ? null : <TopBar />}
        <Grid className={gridClasses}>
          <Grid.Row className={wrapperClasses}>
            <ViewPort />
            {isLoading || isPreviewing ? null : (
              <div className={toolbarClasses}>
                <>
                  <Metrics />
                  <Tools isSidebarOpen={isSidebarOpen} onClick={this.handleToolClick} />
                  <ItemDragLayer />
                  <LocalStorageToast isVisible={showLocalStorageToast} />
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
