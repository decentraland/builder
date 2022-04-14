import * as React from 'react'
import { Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Item } from 'modules/item/types'
import ItemImage from 'components/ItemImage'
import { Props } from './CollectionImage.types'
import './CollectionImage.css'

const MAX_IMAGES_TO_SHOW = 4

export default class CollectionImage extends React.PureComponent<Props> {
  componentDidMount() {
    const { itemCount } = this.props
    if (itemCount) {
      this.fetchItemsIfNeeded(itemCount)
    }
  }
  componentDidUpdate(prevProps: Props) {
    const { itemCount } = this.props
    if (prevProps.itemCount !== itemCount && itemCount) {
      this.fetchItemsIfNeeded(itemCount)
    }
  }

  fetchItemsIfNeeded(itemCount: number) {
    const { collectionId, items, onFetchCollectionItems } = this.props
    const needsToFetchMoreImages =
      (itemCount >= MAX_IMAGES_TO_SHOW && items.length < MAX_IMAGES_TO_SHOW) || (itemCount < MAX_IMAGES_TO_SHOW && items.length < itemCount)
    if (needsToFetchMoreImages) {
      onFetchCollectionItems(collectionId, { page: 1, limit: MAX_IMAGES_TO_SHOW }) // fetch just the first page and 4 items to show the images
    }
  }

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
    const { items, itemCount, isLoading } = this.props

    if (isLoading || itemCount === undefined) {
      return (
        <div className="CollectionImage is-image">
          <div className="item-row loading">
            <Loader active size="tiny" inline />
          </div>
        </div>
      )
    }
    const hasNoItems = itemCount === 0

    return (
      <div className="CollectionImage is-image">
        {hasNoItems ? (
          <div className="item-row empty">
            <div className="sparkles" />
            <div>{t('collection_image.no_items')}</div>
          </div>
        ) : isLoading ? (
          <div className="item-row loading">
            <Loader active size="tiny" inline />
          </div>
        ) : (
          this.renderItemRows(items)
        )}
      </div>
    )
  }
}
