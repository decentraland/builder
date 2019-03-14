import * as React from 'react'
import { IntercomWidget } from 'decentraland-dapps/dist/components/Intercom/IntercomWidget'

import Icon from 'components/Icon'
import Preview from 'components/Preview'
import './ViewPort.css'
import { Props } from './ViewPort.types'

const widget = IntercomWidget.getInstance()

export default class ViewPort extends React.PureComponent<Props> {
  handleClose = () => {
    const { onClosePreview } = this.props
    widget.render()
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
