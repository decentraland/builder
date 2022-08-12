import * as React from 'react'
import { Props } from './LandProvider.types'

export default class LandProvider extends React.PureComponent<Props> {
  render() {
    const { id, land, isLoading, deployments, rental, children } = this.props
    return <>{children(id, land, isLoading, { deployments, rental })}</>
  }
}
