import React from 'react'
import { Dropdown } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props } from './ResetItemButton.types'

const ResetItemButton = ({ isEnabled, onClick }: Props) => {
  if (!isEnabled) {
    return null
  }

  return <Dropdown.Item text={t('collection_item.reset_item')} onClick={onClick} />
}

export default React.memo(ResetItemButton)
