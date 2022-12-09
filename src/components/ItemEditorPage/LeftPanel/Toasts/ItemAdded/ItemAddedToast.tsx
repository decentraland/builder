import React, { useEffect, useState } from 'react'
import { Button, Toast, ToastType } from 'decentraland-ui'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { locations } from 'routing/locations'
import { Item } from 'modules/item/types'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'

import ItemAddedLogo from '../../../../../icons/check.svg'

import { Props } from './ItemAddedToast.types'
import './ItemAddedToast.css'

const ItemAddedToast: React.FC<Props> = props => {
  const { items } = props
  const [shouldShowToast, setShouldShowToast] = useState(false)
  const [item, setItem] = useState<Item | undefined>()
  const search = useLocation().search
  const history = useHistory()

  useEffect(() => {
    const searchParams = new URLSearchParams(search)
    const newItemId = searchParams.get('newItemId')
    if (newItemId) {
      setShouldShowToast(true)
      const newItem = items.find(({ id }) => id === newItemId)
      setItem(newItem)
    }
  }, [search, items])

  function handleRemoveItemAddedToast() {
    setShouldShowToast(false)
    const searchParams = new URLSearchParams(search)
    searchParams.delete('newItemId')
    history.replace({ search: searchParams.toString() })
  }

  return shouldShowToast && item ? (
    <Toast
      type={ToastType.INFO}
      title={t('sagas.item.item_added_toast.title')}
      closable
      icon={
        <div className="ItemAddedToast icon-container">
          <img src={ItemAddedLogo} alt={t('sagas.item.item_added_toast.title')} />
        </div>
      }
      onClose={handleRemoveItemAddedToast}
      body={
        <T
          id="sagas.item.item_added_toast.body"
          values={{
            name: item.name,
            br: () => <br />,
            b: (chunks: string) => <strong>{chunks}</strong>,
            'collection-link': (chunks: string) => (
              <Link to={locations.collectionDetail(item.collectionId)}>
                <Button className="ItemAddedToast view-collection-link" basic>
                  {chunks}
                </Button>
              </Link>
            )
          }}
        />
      }
    />
  ) : null
}

export default React.memo(ItemAddedToast)
