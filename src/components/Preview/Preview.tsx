import * as React from 'react'
import { DropTarget } from 'react-dnd'
import Lottie from 'lottie-react'
import { config } from 'config'
import { Link } from 'react-router-dom'

import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Button } from 'decentraland-ui'
import { locations } from 'routing/locations'
import { ASSET_TYPE } from 'components/AssetCard/AssetCard.dnd'
import { PreviewType } from 'modules/editor/types'
import { convertToUnityKeyboardEvent, injectSceneEditorScripts } from 'modules/editor/utils'
import { previewTarget, collect, CollectedProps } from './Preview.dnd'
import { EditorWindow, Props } from './Preview.types'
import animationData from './loader.json'
import './Preview.css'

const editorWindow = window as EditorWindow
const unityDebugParams = config.get('UNITY_DEBUG_PARAMS')
const PUBLIC_URL = process.env.VITE_BASE_URL

let canvas: HTMLCanvasElement | null = null
let isDCLInitialized = false

class Preview extends React.Component<Props & CollectedProps> {
  canvasContainer = React.createRef<HTMLDivElement>()

  state = {
    hasError: false
  }

  componentDidMount() {
    if (unityDebugParams) {
      window.history.replaceState('', 'Unity Debug', `?${unityDebugParams}`)
    }

    window.addEventListener('error', this.handleUnityError)

    if (!isDCLInitialized) {
      this.startEditor().catch(error => console.error('Failed to start editor', error))
    } else {
      this.moveCanvas()
      this.openEditor()
      this.subscribeKeyDownEvent()
    }
  }

  componentWillUnmount() {
    if (canvas) {
      const gl = canvas.getContext('webgl')
      gl && gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
    window.removeEventListener('error', this.handleUnityError)
    this.unsubscribeKeyDownEvent()
  }

  handleUnityError = (event: any) => {
    event.stopImmediatePropagation()
    this.setState({ hasError: true })
  }

  moveCanvas = () => {
    if (this.canvasContainer.current && canvas) {
      this.canvasContainer.current.appendChild(canvas)
    }
  }

  subscribeKeyDownEvent = () => {
    editorWindow.addEventListener('keydown', this.handleKeyDownEvent)
  }

  unsubscribeKeyDownEvent = () => {
    editorWindow.removeEventListener('keydown', this.handleKeyDownEvent)
  }

  handleKeyDownEvent = (e: KeyboardEvent) => {
    const unityEvt = convertToUnityKeyboardEvent(e)
    if (unityEvt) {
      editorWindow.editor.onKeyDown(unityEvt)
    }
  }

  openEditor = () => {
    const { isReadOnly, type } = this.props
    this.props.onOpenEditor({ isReadOnly: isReadOnly === true, type: type || PreviewType.PROJECT })
  }

  async startEditor() {
    if (!this.canvasContainer.current) {
      throw new Error('Missing canvas container')
    }
    try {
      isDCLInitialized = true
      window.devicePixelRatio = 1 // without this unity blows up majestically 💥🌈🦄🔥🤷🏼‍♂️
      if (!editorWindow.editor) {
        await injectSceneEditorScripts()
      }
      await editorWindow.editor.initEngine(this.canvasContainer.current, PUBLIC_URL + '/unity/Build/unity.json')
      if (!unityDebugParams) {
        canvas = await editorWindow.editor.getDCLCanvas()
        canvas && canvas.classList.add('dcl-canvas')
      }

      this.moveCanvas()
      this.openEditor()

      this.subscribeKeyDownEvent()
    } catch (error) {
      isDCLInitialized = false
      console.error('Failed to load Preview', error)
    }
  }

  getLoadingText() {
    const { isLoadingEditor } = this.props
    if (isLoadingEditor) {
      return isLoadingEditor ? t('editor_preview.loading_unity') : null
    }
    return null
  }

  renderError() {
    const { project } = this.props
    return (
      <Modal name="SceneEditorErrorModal" size="tiny">
        <Modal.Content>{t('editor_preview.loading_unity_error', { br: <br /> })}</Modal.Content>
        <Modal.Actions>
          <Button secondary as={Link} to={locations.sceneDetail(project.id)}>
            {t('global.back')}
          </Button>
          <Button primary as={Link} to={locations.sceneEditor(project.id)}>
            {t('global.reload')}
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }

  render() {
    const { isLoadingEditor, connectDropTarget } = this.props
    const isLoadingResources = isLoadingEditor

    return connectDropTarget(
      <div className="Preview-wrapper">
        {isLoadingResources && (
          <div className="overlay">
            <Lottie
              loop={true}
              autoplay={true}
              animationData={animationData}
              style={{
                height: 100,
                width: 100
              }}
            />
            <div id="progress-bar" className="progress ingame">
              <div className="full"></div>
            </div>
            <div className="loading-text">{this.getLoadingText()}</div>
          </div>
        )}
        <div className={`Preview ${isLoadingResources ? 'loading' : ''}`} id="preview-viewport" ref={this.canvasContainer} />
        {this.state.hasError && this.renderError()}
      </div>
    )
  }
}

export default DropTarget<Props, CollectedProps>(ASSET_TYPE, previewTarget, collect)(Preview)
