import * as React from 'react'
import { Props } from './CollectionProvider.types'

export default class CollectionProvider extends React.PureComponent<Props> {
  componentDidMount() {
    const { id, collection } = this.props
    if (id && !collection) {
      this.fetchCollection(id)
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { id, collection } = this.props
    if (id && id !== prevProps.id && !collection) {
      this.fetchCollection(id)
    }
  }

  fetchCollection(id: string) {
    const { onFetchCollection, onFetchCollectionItems } = this.props
    onFetchCollection(id)
    onFetchCollectionItems(id)
  }

  render() {
    const { collection, items, isLoading, children } = this.props
    return <>{children(collection, items, isLoading)}</>
  }
}
