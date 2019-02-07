import * as React from 'react'
import { Loader } from 'decentraland-ui'
import { DropTarget } from 'react-dnd'

import { ASSET_TYPE } from 'components/AssetCard/AssetCard.dnd'
import { previewTarget, collect, CollectedProps } from './Preview.dnd'
import { EditorWindow, Props, State } from './Preview.types'

import './Preview.css'

const editorWindow = window as EditorWindow

class Preview extends React.Component<Props & CollectedProps, State> {
  canvas = React.createRef<HTMLDivElement>()

  componentDidMount() {
    this.startEditor().catch(error => console.error('Failed to start editor', error))
  }

  async startEditor() {
    await editorWindow.editor.initEngine(this.props.layout.rows, this.props.layout.cols)

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
    const { isLoading, connectDropTarget } = this.props

    return connectDropTarget(
      <div className="Preview-wrapper">
        <div className="Preview" id="preview-viewport" ref={this.canvas}>
          {isLoading && (
            <div className="overlay">
              <Loader active size="massive" />
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default DropTarget(ASSET_TYPE, previewTarget, collect)(Preview)
