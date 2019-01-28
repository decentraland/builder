import * as React from 'react'
import { Loader } from 'decentraland-ui'

import { EditorWindow } from './Preview.types'
import './Preview.css'

const editorWindow = window as EditorWindow

export default class Preview extends React.Component {
  private canvas = React.createRef<HTMLDivElement>()

  componentDidMount() {
    // We're adding this to the end of the stack to allow the browser to paint the rest of the DOM first
    setTimeout(() => this.startEditor(), 0)
  }

  shouldComponentUpdate() {
    // We don't want to lose the reference to the canvas
    return false
  }

  async startEditor() {
    if (!editorWindow.isDCLInitialized && editorWindow.initDCL) {
      editorWindow.initDCL()
    }
    try {
      const canvas = await editorWindow.editor.getDCLCanvas()
      this.moveCanvas(canvas)
    } catch (error) {
      console.error('Failed to load Preview', error)
    }
  }

  moveCanvas = (canvas: HTMLCanvasElement) => {
    if (this.canvas.current && canvas) {
      this.canvas.current.appendChild(canvas)
      editorWindow.editor.initEngine()
      editorWindow.editor.resize()
    }
  }

  render() {
    return (
      <div className="Preview" id="preview-viewport" ref={this.canvas}>
        <Loader active size="massive" />
      </div>
    )
  }
}
