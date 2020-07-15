import * as React from 'react'
import LandAction from 'components/LandAction'
import LandProviderPage from 'components/LandProviderPage'
import { Props } from './LandOperatorPage.types'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import LandOperatorForm from './LandOperatorForm/LandOperatorForm'

export default class LandEditPage extends React.PureComponent<Props> {
  render() {
    const { onSetOperator } = this.props
    return (
      <LandProviderPage className="LandEditPage">
        {land => (
          <LandAction
            land={land}
            title={t('operator_page.title')}
            subtitle={<T id="operator_page.subtitle" values={{ name: <strong>{land.name}</strong> }} />}
          >
            <LandOperatorForm land={land} onSetOperator={onSetOperator} />
          </LandAction>
        )}
      </LandProviderPage>
    )
  }
}
