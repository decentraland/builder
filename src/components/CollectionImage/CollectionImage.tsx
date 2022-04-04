import * as React from 'react'
import { Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import CollectionProvider from 'components/CollectionProvider'
import { Item } from 'modules/item/types'
import ItemImage from 'components/ItemImage'
import { Props } from './CollectionImage.types'
import './CollectionImage.css'

const MAX_IMAGES_TO_SHOW = 4

export default class CollectionImage extends React.PureComponent<Props> {
  renderItemRow(items: Item[]) {
    return items.map((item, index) => <ItemImage key={index} item={item} />)
  }

  renderItemRows(items: Item[]) {
    const firstItemRow = items.slice(0, 2)
    const secondItemRow = items.slice(2, MAX_IMAGES_TO_SHOW)
    const itemRowStyle = { height: secondItemRow.length ? '50%' : '100%' }
    return (
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
    )
  }

  render() {
    const { items, itemCount, collectionId, isLoading } = this.props

    if (isLoading || itemCount === null) {
      return (
        <div className="CollectionImage is-image">
          <div className="item-row loading">
            <Loader active size="tiny" inline />
          </div>
        </div>
      )
    }
    const hasNoItems = itemCount === 0
    const needsToFetchMoreImages =
      (itemCount >= MAX_IMAGES_TO_SHOW && items.length < MAX_IMAGES_TO_SHOW) || (itemCount < MAX_IMAGES_TO_SHOW && items.length < itemCount)

    return (
      <div className="CollectionImage is-image">
        {hasNoItems ? (
          <div className="item-row empty">
            <div className="sparkles" />
            <div>{t('collection_image.no_items')}</div>
          </div>
        ) : needsToFetchMoreImages ? (
          <CollectionProvider id={collectionId} itemsPageSize={MAX_IMAGES_TO_SHOW}>
            {({ items, isLoading }) => {
              return isLoading ? (
                <div className="item-row loading">
                  <Loader active size="tiny" inline />
                </div>
              ) : (
                this.renderItemRows(items)
              )
            }}
          </CollectionProvider>
        ) : (
          this.renderItemRows(items)
        )}
      </div>
    )
  }
}
