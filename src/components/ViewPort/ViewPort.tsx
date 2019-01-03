import * as React from 'react'
import './ViewPort.css'
import { Props } from './ViewPort.types'
import Preview from 'components/Preview'

export default class ViewPort extends React.Component<Props> {
  render() {
    const { view } = this.props
    return view === 'preview' ? <Preview /> : <div>Editor</div>
  }
}
