import React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button, Popup } from 'decentraland-ui'
import { Props } from './UnderReview.types'

const UnderReview = ({ type }: Props) => (
  <Popup
    content={t(type === 'publish' ? 'collection_detail_page.cant_mint' : 'collection_detail_page.cant_push')}
    position="top center"
    trigger={
      <div className="popup-button">
        <Button secondary compact disabled={true}>
          {t('collection_detail_page.under_review')}
        </Button>
      </div>
    }
    hideOnScroll={true}
    on="hover"
    inverted
    flowing={type === 'publish'}
  />
)

export default React.memo(UnderReview)
