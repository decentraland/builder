import * as React from 'react'
import { EditorWindow } from './Preview.types'
import './Preview.css'

const editorWindow = window as EditorWindow

const CONTENT_SERVER = 'https://content.decentraland.today/contents/'

export default class Preview extends React.PureComponent {
  private ref = React.createRef<HTMLDivElement>()

  componentDidMount() {
    if (!editorWindow.isDCLInitialized && editorWindow.initDCL) {
      editorWindow.initDCL()
    }
    editorWindow.editor
      .getDCLCanvas()
      .then(canvas => {
        this.moveCanvas(canvas)
      })
      .catch(e => console.error('Failed to load Preview', e))
  }

  moveCanvas = (canvas: HTMLCanvasElement) => {
    if (this.ref.current && canvas) {
      this.ref.current.appendChild(canvas)
      editorWindow.editor.initEngine(CONTENT_SERVER)
      editorWindow.editor.resize()
    }
  }

  render() {
    return <div id="preview-viewport" className="Preview" ref={this.ref} />
  }
}
