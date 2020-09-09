import * as React from 'react'

import { getBodyShapeType } from 'modules/item/utils'
import { Props } from './ItemBadge.types'
import './ItemBadge.css'

export default class ItemBadge extends React.PureComponent<Props> {
  render() {
    const { item } = this.props
    return <div className={`ItemBadge ${getBodyShapeType(item)}`} />
  }
}
