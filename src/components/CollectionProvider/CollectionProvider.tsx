import * as React from 'react'
import { Props } from './CollectionProvider.types'

export default class CollectionProvider extends React.PureComponent<Props> {
  componentDidMount() {
    const { id, collection, onFetchCollection, isConnecting } = this.props
    if (id && !collection && !isConnecting) {
      onFetchCollection(id)
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { id, onFetchCollection, isConnecting, collection } = this.props
    const justFinishedConnection = prevProps.isConnecting && !isConnecting
    if (id && justFinishedConnection) {
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
