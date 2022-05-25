import * as React from 'react'
import { Props } from './ItemProvider.types'

export default class ItemProvider extends React.PureComponent<Props> {
  componentDidMount() {
    const { id, item, onFetchItem, isConnected } = this.props
    if (isConnected && id && !item) {
      onFetchItem(id)
    }
  }

  componentDidUpdate() {
    const { id, item, onFetchItem, isConnected } = this.props
    if (isConnected && id && !item) {
      onFetchItem(id)
    }
  }

  render() {
    const { item, collection, isLoading, children } = this.props
    return <>{children(item, collection, isLoading)}</>
  }
}
