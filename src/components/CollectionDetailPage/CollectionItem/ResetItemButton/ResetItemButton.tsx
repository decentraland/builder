import React from 'react'
import { Dropdown } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props } from './ResetItemButton.types'

const ResetItemButton = (props: Props) => {
  const { isEnabled } = props

  if (!isEnabled) {
    return null
  }

  return <Dropdown.Item text={t('collection_item.reset_item')} onClick={() => {}} />
}

export default React.memo(ResetItemButton)
