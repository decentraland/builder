import * as React from 'react'
import { Props } from './LandProvider.types'

export default class LandProvider extends React.PureComponent<Props> {
  render() {
    const { id, land, isLoading, projects, children } = this.props
    return <>{children(id, land, projects, isLoading)}</>
  }
}
