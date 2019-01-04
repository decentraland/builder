import * as React from 'react'
import { Props } from './ViewPort.types'
import Preview from 'components/Preview'
import './ViewPort.css'

export default class ViewPort extends React.PureComponent<Props> {
  render() {
    const { view } = this.props
    return view === 'preview' ? <Preview /> : <div>Editor</div>
  }
}
