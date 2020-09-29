import * as React from 'react'
import { Props } from './CenterPanel.types'
import './CenterPanel.css'
import ViewPort from 'components/ViewPort'
import { PreviewType } from 'modules/editor/types'

export default class CenterPanel extends React.PureComponent<Props> {
  render() {
    return (
      <div className="CenterPanel">
        <ViewPort type={PreviewType.WEARABLE} />
      </div>
    )
  }
}
