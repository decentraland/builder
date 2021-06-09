import * as React from 'react'
import { ToastType } from 'decentraland-ui'
import { env } from 'decentraland-commons'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { toMB } from 'lib/file'
import { MAX_FILE_SIZE } from 'modules/item/utils'
import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'

const DISCORD_URL = env.get('REACT_APP_DISCORD_URL', '')

export function getMetaTransactionFailureToast() {
  return {
    type: ToastType.ERROR,
    title: t('toast.meta_transaction_failure.title'),
    body: (
      <T
        id="toast.meta_transaction_failure.body"
        values={{
          br: <br />,
          discord_link: (
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
              Discord
            </a>
          )
        }}
      />
    ),
    timeout: 6000,
    closable: true
  }
}

export function getDeployItemFailureToast(item: Item, collection: Collection) {
  return {
    type: ToastType.ERROR,
    title: t('toast.deploy_item_failure.title'),
    body: (
      <T
        id="toast.deploy_item_failure.body"
        values={{
          br: <br />,
          itemName: item.name,
          collectionName: collection.name,
          size: `${toMB(MAX_FILE_SIZE)}MB`
        }}
      />
    ),
    timeout: 6000,
    closable: true
  }
}
