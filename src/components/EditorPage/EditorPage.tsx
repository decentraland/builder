import { useEffect, useCallback, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Grid } from 'decentraland-ui'
import { ClaimNameLocationStateProps, FromParam } from 'modules/location/types'
import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'
import experiments, { EXPERIMENT_TUTORIAL_OPEN } from 'experiments'

import NotFoundPage from 'components/NotFoundPage'
import LoadingPage from 'components/LoadingPage'
import SDK6TopBar from 'components/SDK6TopBar'
import ViewPort from 'components/ViewPort'
import SideBar from 'components/SideBar'
import LocalStorageToast from 'components/LocalStorageToast'
import { DeployModalView } from 'components/Modals/DeployModal/DeployModal.types'
import { DeployToWorldModalMetadata } from 'components/Modals/DeployModal/DeployToWorld/DeployToWorld.types'
import Tools from './Tools'
import Metrics from './Metrics'
import ItemDragLayer from './ItemDragLayer'
import { ToolName } from './Tools/Tools.types'
import { Props } from './EditorPage.types'

import './EditorPage.css'

export const LOCALSTORAGE_TUTORIAL_KEY = 'builder-tutorial'
export const LOCALSTORAGE_INCENTIVE_BANNER_KEY = 'builder-incentive-banner'
const TOAST_ITEMS_THRESHOLD = 5 // local storage toast will show when a user has at least this amount of items

const localStorage = getLocalStorage()

export default function EditorPage(props: Props) {
  const [isIncentiveBannerOpen] = useState(false)
  const [isDeployModalOpened, setIsDeployModalOpened] = useState(false)
  const location = useLocation()
  const isFromClaimName = (location.state as ClaimNameLocationStateProps)?.fromParam === FromParam.CLAIM_NAME
  const claimedName = isFromClaimName ? (location.state as ClaimNameLocationStateProps).claimedName : undefined
  const {
    currentProject,
    isReady,
    isLoading,
    isPreviewing,
    isScreenshotReady,
    onOpenModal,
    onTakeScreenshot,
    isSidebarOpen,
    onCloseEditor,
    isLoggedIn,
    numItems,
    isFetching,
    onZoomIn,
    onZoomOut,
    onResetCamera
  } = props

  const handleMouseWheel = useCallback((e: Event) => {
    if ((e as WheelEvent)['ctrlKey']) {
      e.preventDefault()
      e.stopImmediatePropagation()
    }
  }, [])

  useEffect(() => {
    if (currentProject && !localStorage.getItem(LOCALSTORAGE_TUTORIAL_KEY)) {
      const showTutorial = experiments.getCurrentValueFor(EXPERIMENT_TUTORIAL_OPEN, true)
      if (showTutorial) {
        onOpenModal('TutorialModal')
      }
    }

    document.body.scrollTop = 0
    document.body.classList.add('lock-scroll')
    document.body.addEventListener('mousewheel', handleMouseWheel)
    return () => {
      onCloseEditor()
      document.body.classList.remove('lock-scroll')
      document.body.removeEventListener('mousewheel', handleMouseWheel)
    }
  }, [])

  const handleToolClick = useCallback(
    (toolName: ToolName) => {
      switch (toolName) {
        case 'shortcuts':
          onOpenModal('ShortcutsModal')
          break
        case 'zoom-out':
          onZoomOut()
          break
        case 'zoom-in':
          onZoomIn()
          break
        case 'reset-camera':
          onResetCamera()
          break
        default:
          break
      }
    },
    [onOpenModal, onZoomOut, onZoomIn, onResetCamera]
  )

  useEffect(() => {
    // When it fails to take the screenshot, try again
    if (!(isLoading || isPreviewing) && isScreenshotReady && currentProject && !currentProject.thumbnail) {
      onTakeScreenshot()
    }

    // When it fails to save the screenshot after duplicating a project, take a new screenshot
    if (!isLoading && isReady && currentProject && !currentProject.thumbnail) {
      onTakeScreenshot()
    }

    if (!(isLoading || isPreviewing) && currentProject && isFromClaimName && !isDeployModalOpened) {
      onOpenModal('DeployModal', {
        view: DeployModalView.DEPLOY_TO_WORLD,
        projectId: currentProject.id,
        claimedName
      } as DeployToWorldModalMetadata)
      setIsDeployModalOpened(true)
    }
  }, [
    currentProject,
    claimedName,
    isFromClaimName,
    isReady,
    isLoading,
    isPreviewing,
    isScreenshotReady,
    onOpenModal,
    onTakeScreenshot,
    isDeployModalOpened
  ])

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
      {isPreviewing ? null : <SDK6TopBar />}
      <Grid className={gridClasses}>
        <Grid.Row className={wrapperClasses}>
          <ViewPort />
          {isLoading || isPreviewing ? null : (
            <div className={toolbarClasses}>
              <>
                <Metrics />
                <Tools isSidebarOpen={isSidebarOpen} onClick={handleToolClick} />
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
