import * as React from 'react'
//import { Loader } from 'decentraland-ui'
import { DropTarget } from 'react-dnd'

import { ASSET_TYPE } from 'components/AssetCard/AssetCard.dnd'
import { previewTarget, collect, CollectedProps } from './Preview.dnd'
import { EditorWindow, Props, State } from './Preview.types'

import './Preview.css'

const editorWindow = window as EditorWindow
let canvas: HTMLCanvasElement | null = null

class Preview extends React.Component<Props & CollectedProps, State> {
  canvasContainer = React.createRef<HTMLDivElement>()

  componentDidMount() {
    if (!editorWindow.isDCLInitialized) {
      this.startEditor().catch(error => console.error('Failed to start editor', error))
    } else {
      this.moveCanvas()
      this.props.onOpenEditor()
    }
  }

  componentWillUnmount() {
    if (canvas) {
      document.getElementsByTagName('body')[0].appendChild(canvas)
    }
  }

  moveCanvas = () => {
    if (this.canvasContainer.current && canvas) {
      this.canvasContainer.current.appendChild(canvas)
      editorWindow.editor.resize()
    }
  }

  async startEditor() {
    if (!this.canvasContainer.current) {
      throw new Error('Missing canvas container')
    }

    await editorWindow.editor.initEngine(this.canvasContainer.current, this.props.layout.rows, this.props.layout.cols)
    try {
      canvas = await editorWindow.editor.getDCLCanvas()
      canvas.classList.add('dcl-canvas')

      this.moveCanvas()
      this.props.onOpenEditor()
    } catch (error) {
      console.error('Failed to load Preview', error)
    }
  }

  render() {
    const { isLoading, connectDropTarget } = this.props

    return connectDropTarget(
      <div className="Preview-wrapper">
        <div className={`Preview ${isLoading ? 'loading' : ''}`} id="preview-viewport" ref={this.canvasContainer}>
          {
            //isLoading && (
            //<div className="overlay">
            //  <Loader active size="massive" />
            //</div>
            // )
          }
        </div>
      </div>
    )
  }
}

export default DropTarget(ASSET_TYPE, previewTarget, collect)(Preview)
