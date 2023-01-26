import { Link } from 'react-router-dom'
import { ToastType } from 'decentraland-ui'
import { T } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { Collection } from 'modules/collection/types'
import { Item } from './types'

export const getSuccessfulMoveItemToAnotherCollectionToast = (item: Item, collection: Collection) => {
  return {
    type: ToastType.INFO,
    className: 'CollectionDetailPage move-item-to-another-collection',
    icon: <div className="two-way-arrow-icon"></div>,
    title: <T id="toast.collection_detail_page.move_item_to_another_collection.title" />,
    body: (
      <>
        <span className="description">
          <T
            id={'toast.collection_detail_page.move_item_to_another_collection.body'}
            values={{
              item_name: <strong>{item.name}</strong>,
              collection_name: <strong>{collection.name}</strong>
            }}
          />
        </span>
        <Link className="cta" to={locations.collectionDetail(collection.id)}>
          {<T id="toast.collection_detail_page.move_item_to_another_collection.cta" />}
        </Link>
      </>
    ),
    timeout: 10000,
    closable: true
  }
}

export const getSuccessfulDeletedItemToast = (item: Item) => {
  return {
    type: ToastType.INFO,
    className: 'CollectionDetailPage deleted-item',
    icon: <div className="delete-icon"></div>,
    title: <T id="toast.collection_detail_page.item_deleted.title" />,
    body: (
      <>
        <span className="description">
          <T
            id={'toast.collection_detail_page.item_deleted.body'}
            values={{
              name: <strong>{item.name}</strong>
            }}
          />
        </span>
      </>
    ),
    timeout: 10000,
    closable: true
  }
}
