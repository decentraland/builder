import React from 'react'
import { Dropdown } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

const ResetItemButton = () => {
  return <Dropdown.Item text={t('collection_item.reset_item')} onClick={() => {}} />
}

export default React.memo(ResetItemButton)
