import * as React from 'react'
import { Loader } from 'decentraland-ui'
import { DropTarget } from 'react-dnd'

import { ASSET_TYPE } from 'components/AssetCard/AssetCard.dnd'
import { previewTarget, collect, CollectedProps } from './Preview.dnd'
import { EditorWindow, Props, State } from './Preview.types'

import './Preview.css'

const editorWindow = window as EditorWindow
let canvas: HTMLCanvasElement | null = null
let isDCLInitialized: boolean = false

class Preview extends React.Component<Props & CollectedProps, State> {
  canvasContainer = React.createRef<HTMLDivElement>()

  componentDidMount() {
    if (!isDCLInitialized) {
      this.startEditor().catch(error => console.error('Failed to start editor', error))
    } else {
      this.moveCanvas()
      this.props.onOpenEditor()
    }
    editorWindow.addEventListener('keydown', this.handleKeyDownEvent)
  }

  componentWillUnmount() {
    if (canvas) {
      document.getElementsByTagName('body')[0].appendChild(canvas)
    }
    editorWindow.removeEventListener('keydown', this.handleKeyDownEvent)
  }

  moveCanvas = () => {
    if (this.canvasContainer.current && canvas) {
      this.canvasContainer.current.appendChild(canvas)
      editorWindow.editor.resize()
    }
  }

  handleKeyDownEvent(event: KeyboardEvent) {
    let key = ''
    switch (event.key) {
      case "Down":
      case "ArrowDown":
        key = 'DownArrow'
        break
      case "Up":
      case "ArrowUp":
        key = 'UpArrow'
        break
      case "Left":
      case "ArrowLeft":
        key = 'LeftArrow'
        break
      case "Right":
      case "ArrowRight":
        key = 'RightArrow'
        break
    }
    if (key !== '') {
      editorWindow.editor.setArrowKeyDown(key)
    }
  }

  async startEditor() {
    const { rows, cols } = this.props.project.layout
    if (!this.canvasContainer.current) {
      throw new Error('Missing canvas container')
    }
    try {
      await editorWindow.editor.initEngine(this.canvasContainer.current, rows, cols)
      canvas = await editorWindow.editor.getDCLCanvas()
      canvas.classList.add('dcl-canvas')

      this.moveCanvas()
      this.props.onOpenEditor()
      isDCLInitialized = true
    } catch (error) {
      console.error('Failed to load Preview', error)
    }
  }

  render() {
    const { isLoading, connectDropTarget } = this.props

    return connectDropTarget(
      <div className="Preview-wrapper">
        {isLoading && (
          <div className="overlay">
            <Loader active size="massive" />
          </div>
        )}
        <div className={`Preview ${isLoading ? 'loading' : ''}`} id="preview-viewport" ref={this.canvasContainer} />
      </div>
    )
  }
}

export default DropTarget(ASSET_TYPE, previewTarget, collect)(Preview)
