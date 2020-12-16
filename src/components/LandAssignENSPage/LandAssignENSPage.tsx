import * as React from 'react'
import { Link } from 'react-router-dom'
import { Loader } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import LandProviderPage from 'components/LandProviderPage'
import LandAssignENSForm from './LandAssignENSForm/LandAssignENSForm'
import LandAction from 'components/LandAction'
import { Props } from './LandAssignENSPage.types'

export default class LandAssignENSPage extends React.PureComponent<Props> {
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
      <LandProviderPage>
        {land =>
          !ens ? (
            <Loader active size="massive" />
          ) : (
            <LandAction
              land={land}
              title={t('land_assign_ens_page.title', { name: ens.subdomain })}
              subtitle={
                <T id="land_assign_ens_page.subtitle" values={{ land: <Link to={locations.landDetail(land.id)}>{land.name}</Link> }} />
              }
            >
              <LandAssignENSForm
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
          )
        }
      </LandProviderPage>
    )
  }
}
