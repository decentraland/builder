import * as React from 'react'
import { EditorWindow } from './Preview.types'
import './Preview.css'

const editorWindow = window as EditorWindow

export default class Preview extends React.PureComponent {
  private ref = React.createRef<HTMLDivElement>()

  componentDidMount() {
    if (!editorWindow.isDCLInitialized && editorWindow.initDCL) {
      editorWindow.initDCL()
    }
    editorWindow.editor.getDCLCanvas().then(canvas => {
      this.moveCanvas(canvas)
    })
  }

  moveCanvas = (canvas: HTMLCanvasElement) => {
    if (this.ref.current && canvas) {
      this.ref.current.appendChild(canvas)
      editorWindow.editor.initEngine()
      editorWindow.editor.resize()
    }
  }

  render() {
    return <div id="preview-viewport" className="Preview" ref={this.ref} />
  }
}
