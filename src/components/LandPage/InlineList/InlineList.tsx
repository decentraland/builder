import * as React from 'react'
import { Props } from './InlineList.types'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'

export default class InlineList extends React.PureComponent<Props> {
  render() {
    const { list } = this.props

    switch (list.length) {
      case 0:
        return null
      case 1:
        return list[0]
      case 2:
        return <T id="list.two" values={{ first: list[0], second: list[1] }} />
      default:
        return <T id="list.two" values={{ first: list[0], second: t('list.more', { count: list.length - 1 }) }} />
    }
  }
}
