import * as React from 'react'
import { env } from 'decentraland-commons'
import { Loader } from 'decentraland-ui'

import { EditorWindow } from './Preview.types'
import './Preview.css'

const editorWindow = window as EditorWindow

const CONTENT_SERVER = env.get('REACT_APP_CONTENT_SERVER', () => {
  throw new Error('Missing REACT_APP_CONTENT_SERVER env variable')
})

export default class Preview extends React.Component {
  private canvas = React.createRef<HTMLDivElement>()

  componentDidMount() {
    // We're adding this to the end of the stack to allow the browser to paint the rest of the DOM first
    setTimeout(() => {
      if (!editorWindow.isDCLInitialized && editorWindow.initDCL) {
        editorWindow.initDCL()
      }
      editorWindow.editor
        .getDCLCanvas()
        .then(canvas => {
          this.moveCanvas(canvas)
        })
        .catch(e => console.error('Failed to load Preview', e))
    }, 0)
  }

  shouldComponentUpdate() {
    // We don't want to lose the reference to the canvas
    return false
  }

  moveCanvas = (canvas: HTMLCanvasElement) => {
    if (this.canvas.current && canvas) {
      this.canvas.current.appendChild(canvas)
      editorWindow.editor.initEngine(CONTENT_SERVER as string)
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
