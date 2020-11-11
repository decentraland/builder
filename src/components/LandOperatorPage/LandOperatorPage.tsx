import * as React from 'react'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import LandAction from 'components/LandAction'
import LandProviderPage from 'components/LandProviderPage'
import LandOperatorForm from './LandOperatorForm/LandOperatorForm'
import { Props } from './LandOperatorPage.types'

export default class LandOperatorPage extends React.PureComponent<Props> {
  render() {
    const { onSetOperator } = this.props
    return (
      <LandProviderPage>
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
