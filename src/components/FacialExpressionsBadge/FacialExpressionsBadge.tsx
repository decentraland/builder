import * as React from 'react'
import { Icon, Popup } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { hasFacialExpressions } from 'modules/item/utils'
import { Props } from './FacialExpressionsBadge.types'
import './FacialExpressionsBadge.css'

const FacialExpressionsBadge: React.FC<Props> = ({ contents, size = 'normal', className }) => {
  if (!hasFacialExpressions(contents)) {
    return null
  }

  return (
    <Popup
      content={t('facial_expressions_badge.tooltip')}
      position="top center"
      on="hover"
      inverted
      trigger={
        <div className={`FacialExpressionsBadge ${size} ${className ?? ''}`.trim()} aria-label={t('facial_expressions_badge.tooltip')}>
          <Icon name="smile outline" />
        </div>
      }
    />
  )
}

export default React.memo(FacialExpressionsBadge)
