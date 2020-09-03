import * as React from 'react'

import { WearableData, WearableBodyShape } from 'modules/item/types'
import { Props } from './ItemBadge.types'
import './ItemBadge.css'

export default class ItemBadge extends React.PureComponent<Props> {
  getClassName() {
    const { item } = this.props
    const data = item.data as WearableData

    const classNames = new Set()

    for (const representation of data.representations) {
      const bodyShape = representation.bodyShape[0]
      if (bodyShape) {
        switch (bodyShape) {
          case WearableBodyShape.MALE:
            classNames.add('male')
            break
          case WearableBodyShape.FEMALE:
            classNames.add('female')
            break
          default:
            continue
        }
      }
    }

    return `ItemBadge ${Array.from(classNames).join(' ')}`
  }

  render() {
    return <div className={this.getClassName()} />
  }
}
