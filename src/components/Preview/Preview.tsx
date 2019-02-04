import * as React from 'react'
import { Loader } from 'decentraland-ui'

import { EditorWindow, Props, State } from './Preview.types'
import './Preview.css'
import { isLoading } from 'modules/project/selectors'

const editorWindow = window as EditorWindow

export default class Preview extends React.Component<Props, State> {
  canvas = React.createRef<HTMLDivElement>()

  componentDidMount() {
    this.startEditor().catch(error => console.error('Failed to start editor', error))
  }

  async startEditor() {
    await editorWindow.editor.initEngine()

    try {
      const canvas = await editorWindow.editor.getDCLCanvas()

      if (this.canvas.current && canvas) {
        this.canvas.current!.appendChild(canvas)
        editorWindow.editor.resize()
        this.props.onOpenEditor()
      }
    } catch (error) {
      console.error('Failed to load Preview', error)
    }
  }

  render() {
    return (
      <div className="Preview" id="preview-viewport" ref={this.canvas}>
        {isLoading && (
          <div className="overlay">
            <Loader active size="massive" />
          </div>
        )}
      </div>
    )
  }
}
