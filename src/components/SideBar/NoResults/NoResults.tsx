import React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Watermelon from 'components/Watermelon'

import './NoResults.css'

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
