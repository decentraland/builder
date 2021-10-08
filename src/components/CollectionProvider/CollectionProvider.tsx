import * as React from 'react'
import { Props } from './CollectionProvider.types'

export default class CollectionProvider extends React.PureComponent<Props> {
  componentDidMount() {
    const { id, collection, onFetchCollection } = this.props
    if (id && !collection) {
      onFetchCollection(id)
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { id, collection, onFetchCollection } = this.props
    if (id && id !== prevProps.id && !collection) {
      onFetchCollection(id)
    }
  }

  render() {
    const { collection, items, curation, isLoading, children } = this.props
    return <>{children(collection, items, curation, isLoading)}</>
  }
}
