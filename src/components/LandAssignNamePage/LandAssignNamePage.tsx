import * as React from 'react'
import LandAction from 'components/LandAction'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Link } from 'react-router-dom'
import { locations } from 'routing/locations'
import LandProviderPage from 'components/LandProviderPage'
import LandAssignNameForm from './LandAssignNameForm/LandAssignNameForm'
import { Props } from './LandAssignNamePage.types'

export default class LandAssignNamePage extends React.PureComponent<Props> {
  handleGoBack = () => {
    this.props.onBack()
  }

  render() {
    const {
      ens,
      isLoading,
      error,
      isWaitingTxSetContent,
      isWaitingTxSetResolver,
      onSetENSResolver,
      onSetENSContent,
      onNavigate
    } = this.props

    return (
      <LandProviderPage className="LandEditPage">
        {land => (
          <LandAction
            land={land}
            title={t('land_ens_page.assign_name_title', { name: ens.subdomain })}
            subtitle={<T id="land_ens_page.subtitle" values={{ land: <Link to={locations.landDetail(land.id)}>{land.name}</Link> }} />}
          >
            <LandAssignNameForm
              land={land}
              ens={ens}
              error={error}
              isLoading={isLoading}
              isWaitingTxSetResolver={isWaitingTxSetResolver}
              isWaitingTxSetContent={isWaitingTxSetContent}
              onSetENSContent={onSetENSContent}
              onSetENSResolver={onSetENSResolver}
              onBack={this.handleGoBack}
              onNavigate={onNavigate}
            />
          </LandAction>
        )}
      </LandProviderPage>
    )
  }
}
