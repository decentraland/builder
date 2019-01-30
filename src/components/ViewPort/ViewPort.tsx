import * as React from 'react'

import Icon from 'components/Icon'
import Preview from 'components/Preview'
import './ViewPort.css'
import { Props } from './ViewPort.types'

export default class ViewPort extends React.PureComponent<Props> {
  handleClose = () => {
    const { onClosePreview } = this.props
    onClosePreview()
  }

  render() {
    const { isPreviewing } = this.props
    return (
      <>
        <Preview />
        {isPreviewing ? (
          <div className="close-preview" onClick={this.handleClose}>
            <Icon name="close" />
          </div>
        ) : null}
      </>
    )
  }
}
