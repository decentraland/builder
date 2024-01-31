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
      isWaitingTxReclaim,
      isWaitingTxSetResolver,
      isEnsAddressEnabled,
      onSetENSResolver,
      onSetENSContent,
      onReclaimName,
      onNavigate
    } = this.props

    return (
      <LandProviderPage>
        {land =>
          !ens ? (
            <Loader active size="large" />
          ) : (
            <LandAction
              land={land}
              title={t('land_assign_ens_page.title', { name: ens.subdomain })}
              subtitle={
                <T id="land_assign_ens_page.subtitle" values={{ land: <Link to={locations.landDetail(land.id)}>{land.name}</Link> }} />
              }
            >
              <LandAssignENSForm
                isEnsAddressEnabled={isEnsAddressEnabled}
                land={land}
                ens={ens}
                error={error}
                isLoading={isLoading}
                isWaitingTxSetResolver={isWaitingTxSetResolver}
                isWaitingTxSetContent={isWaitingTxSetContent}
                isWaitingTxReclaim={isWaitingTxReclaim}
                onSetENSContent={onSetENSContent}
                onSetENSResolver={onSetENSResolver}
                onReclaimName={onReclaimName}
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
