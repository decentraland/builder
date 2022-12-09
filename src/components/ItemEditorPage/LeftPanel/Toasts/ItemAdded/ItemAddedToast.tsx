import React, { useEffect, useState } from 'react'
import { Button, Toast, ToastType } from 'decentraland-ui'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { locations } from 'routing/locations'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'

import ItemAddedLogo from '../../../../../icons/check.svg'

import { Props } from './ItemAddedToast.types'
import './ItemAddedToast.css'

const ItemAddedToast: React.FC<Props> = props => {
  const { collectionId } = props
  const [shouldShowToast, setShouldShowToast] = useState(false)
  const [item, setItem] = useState<string | undefined>()
  const search = useLocation().search
  const history = useHistory()

  useEffect(() => {
    const searchParams = new URLSearchParams(search)
    const newItem = searchParams.get('newItem')
    if (newItem) {
      setShouldShowToast(true)
      setItem(newItem)
    }
  }, [search])

  function handleRemoveItemAddedToast() {
    setShouldShowToast(false)
    const searchParams = new URLSearchParams(search)
    searchParams.delete('newItem')
    history.replace({ search: searchParams.toString() })
  }

  return shouldShowToast && item && collectionId ? (
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
            name: item,
            br: () => <br />,
            b: (chunks: string) => <strong>{chunks}</strong>,
            'collection-link': (chunks: string) => (
              <Link to={locations.collectionDetail(collectionId)}>
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
