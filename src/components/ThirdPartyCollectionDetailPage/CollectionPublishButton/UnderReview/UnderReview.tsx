import React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button, Popup } from 'decentraland-ui'
import { Props } from './UnderReview.types'

const UnderReview = ({ content }: Props) => (
  <Popup
    content={content}
    position="bottom center"
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
  />
)

export default React.memo(UnderReview)
