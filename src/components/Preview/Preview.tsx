import * as React from 'react'
import './Preview.css'

type EditorWindow = typeof window & {
  isDCLInitialized: boolean
  initDCL: () => void
  editor: {
    initEngine: () => void
    resize: () => void
    getDCLCanvas: () => Promise<HTMLCanvasElement>
  }
}

const editorWindow = window as EditorWindow

class Preview extends React.PureComponent {
  private ref = React.createRef<HTMLDivElement>()

  componentDidMount() {
    if (!editorWindow.isDCLInitialized) {
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
    return <div id="preview-viewport" className="Preview" ref={this.ref} data-test-id="preview" />
  }
}

export default Preview
