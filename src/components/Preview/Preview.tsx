import * as React from 'react'
import { DropTarget } from 'react-dnd'
import Lottie from 'react-lottie'
import { env } from 'decentraland-commons'

import animationData from './loader.json'

import { ASSET_TYPE } from 'components/AssetCard/AssetCard.dnd'
import { convertToUnityKeyboardEvent } from 'modules/editor/utils'
import { previewTarget, collect, CollectedProps } from './Preview.dnd'
import { EditorWindow, Props, State } from './Preview.types'
import './Preview.css'

const editorWindow = window as EditorWindow
const unityDebugParams = env.get('REACT_APP_UNITY_DEBUG_PARAMS')

let canvas: HTMLCanvasElement | null = null
let isDCLInitialized: boolean = false

class Preview extends React.Component<Props & CollectedProps, State> {
  canvasContainer = React.createRef<HTMLDivElement>()

  componentDidMount() {
    if (unityDebugParams) {
      history.replaceState('', 'Unity Debug', `?${unityDebugParams}`)
    }

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
      document.getElementsByTagName('body')[0].appendChild(canvas)
    }
    this.unsubscribeKeyDownEvent()
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

  handleKeyDownEvent(e: KeyboardEvent) {
    const unityEvt = convertToUnityKeyboardEvent(e)
    if (unityEvt) {
      editorWindow.editor.onKeyDown(unityEvt)
    }
  }

  openEditor = () => {
    const { isReadOnly, type } = this.props
    this.props.onOpenEditor({ isReadOnly: isReadOnly === true, type: type || 'project' })
  }

  async startEditor() {
    if (!this.canvasContainer.current) {
      throw new Error('Missing canvas container')
    }
    try {
      isDCLInitialized = true
      await editorWindow.editor.initEngine(this.canvasContainer.current, '/unity/Build/unity.json')
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

  render() {
    const { isLoading, connectDropTarget } = this.props

    return connectDropTarget(
      <div className="Preview-wrapper">
        {isLoading && (
          <div className="overlay">
            <Lottie
              height={100}
              width={100}
              options={{
                loop: true,
                autoplay: true,
                animationData: animationData,
                rendererSettings: {
                  preserveAspectRatio: 'xMidYMid slice'
                }
              }}
            />
            <div id="progress-bar" className="progress ingame">
              <div className="full"></div>
            </div>
          </div>
        )}
        <div className={`Preview ${isLoading ? 'loading' : ''}`} id="preview-viewport" ref={this.canvasContainer} />
      </div>
    )
  }
}

export default DropTarget<Props, CollectedProps>(ASSET_TYPE, previewTarget, collect)(Preview)
