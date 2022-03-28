import * as React from 'react'
import classNames from 'classnames'
import Dropzone, { DropzoneState } from 'react-dropzone'
import { Props } from './FileImport.types'
import './FileImport.css'

export default class FileImport<T> extends React.Component<Props<T>> {
  renderDropZone = (props: DropzoneState) => {
    const { open, isDragActive, getRootProps, getInputProps } = props
    const { items, renderFiles, renderAction, className } = this.props

    const classes = classNames('dropzone', className, { active: isDragActive })

    return (
      <div {...getRootProps()} className={classes}>
        <input {...getInputProps()} />

        {items && items.length > 0 && renderFiles && renderFiles(items)}

        {(!items || items.length === 0) && renderAction && (
          <span className="cta">
            <div className="image" />
            <div>{renderAction(open)}</div>
          </span>
        )}
      </div>
    )
  }

  handleDropAccepted = (acceptedFiles: File[]) => {
    this.props.onAcceptedFiles(acceptedFiles)
  }

  handleDropRejected = (rejectedFiles: File[]) => {
    this.props.onRejectedFiles(rejectedFiles)
  }

  render() {
    const { accept } = this.props
    return (
      <div className="FileImport">
        <Dropzone
          children={this.renderDropZone}
          onDropAccepted={this.handleDropAccepted}
          onDropRejected={this.handleDropRejected}
          accept={accept}
          noClick
        />
      </div>
    )
  }
}
