import React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import './NoResults.css'
import Watermelon from 'components/Watermelon'

export default class NoResults extends React.PureComponent {
  render() {
    return (
      <div className="NoResults">
        <Watermelon />
        <span className="text">{t('itemdrawer.no_results')}</span>
      </div>
    )
  }
}
