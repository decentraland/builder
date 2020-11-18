import * as React from 'react'
import { Props } from './ItemProvider.types'

export default class ItemProvider extends React.PureComponent<Props> {
  componentDidMount() {
    const { id, item, onFetchItem } = this.props
    if (id && !item) {
      onFetchItem(id)
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { id, item, onFetchItem } = this.props
    if (id && id !== prevProps.id && !item) {
      onFetchItem(id)
    }
  }

  render() {
    const { item, collection, isLoading, children } = this.props
    return <>{children(item, collection, isLoading)}</>
  }
}
