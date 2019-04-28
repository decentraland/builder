import React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import './NoResults.css'

export default class NoResults extends React.PureComponent {
  render() {
    return <div className="NoResults">{t('itemdrawer.no_results')}</div>
  }
}
