import * as React from 'react'
import { Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Item } from 'modules/item/types'
import ItemImage from 'components/ItemImage'
import { Props } from './CollectionImage.types'
import './CollectionImage.css'

export default class CollectionImage extends React.PureComponent<Props> {
  renderItemRow(items: Item[]) {
    return items.map((item, index) => <ItemImage key={index} item={item} />)
  }

  render() {
    let { items, isLoading } = this.props

    const firstItemRow = items.slice(0, 2)
    const secondItemRow = items.slice(2, 4)
    const itemRowStyle = { height: secondItemRow.length ? '50%' : '100%' }

    return (
      <div className="CollectionImage is-image">
        {isLoading ? (
          <div className='item-row loading'>
            <Loader active size="tiny" inline />
          </div>
        ) : items.length === 0 ? (
          <div className="item-row empty">
            <div className="sparkles" />
            <div>{t('collection_image.no_items')}</div>
          </div>
        ) : (
          <>
            {firstItemRow.length > 0 ? (
              <div className="item-row" style={itemRowStyle}>
                {this.renderItemRow(firstItemRow)}
              </div>
            ) : null}
            {secondItemRow.length > 0 ? (
              <div className="item-row" style={itemRowStyle}>
                {this.renderItemRow(secondItemRow)}
              </div>
            ) : null}
          </>
        )}
      </div>
    )
  }
}
