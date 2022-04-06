import * as React from 'react'
import { Props } from './CollectionProvider.types'

export default class CollectionProvider extends React.PureComponent<Props> {
  componentDidMount() {
    const { id, onFetchCollection, isConnected } = this.props
    if (id && isConnected) {
      onFetchCollection(id)
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { id, onFetchCollection, isConnected, collection } = this.props
    const justFinishedConnecting = !prevProps.isConnected && isConnected
    if (id && justFinishedConnecting) {
      onFetchCollection(id)
    }

    if (id && id !== prevProps.id && !collection) {
      onFetchCollection(id)
    }
  }

  render() {
    const { collection, items, curation, itemCurations, isLoading, children } = this.props
    return <>{children({ collection, items, curation, itemCurations, isLoading })}</>
  }
}
