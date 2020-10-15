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
    const { id, onFetchCollection } = this.props
    if (id && id !== prevProps.id) {
      onFetchCollection(id)
    }
  }

  render() {
    const { collection, items, isLoading, children } = this.props
    return <>{children(collection, items, isLoading)}</>
  }
}
