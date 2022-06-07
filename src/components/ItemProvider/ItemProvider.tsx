import * as React from 'react'
import { Props, State } from './ItemProvider.types'

export default class ItemProvider extends React.PureComponent<Props, State> {
  state: State = {
    loadedItemId: undefined
  }

  componentDidMount() {
    const { id, item, onFetchItem, isConnected } = this.props

    if (isConnected && id && !item) {
      this.setState({ loadedItemId: id }, () => onFetchItem(id))
    }
  }

  componentDidUpdate() {
    const { id, item, onFetchItem, isConnected } = this.props
    const { loadedItemId } = this.state

    if (isConnected && id && !item && loadedItemId !== id) {
      this.setState({ loadedItemId: id }, () => onFetchItem(id))
    }
  }

  render() {
    const { item, collection, isLoading, children } = this.props
    return <>{children(item, collection, isLoading)}</>
  }
}
