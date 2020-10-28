import * as React from 'react'
import LandAction from 'components/LandAction'
import LandProviderPage from 'components/LandProviderPage'
import { Props, State } from './LandEnsPage.types'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import LandSelectNameForm from './LandSelectNameForm/LandSelectNameForm'
import LandSetNameForm from './LandSetNameForm/LandSetNameForm'
import { locations } from 'routing/locations'
import { Link } from 'react-router-dom'

export default class LandEnsPage extends React.PureComponent<Props> {
  state: State = {
    selectedName: ''
  }

  updateSelectedName = (selectedName: string) => {
    this.setState({ selectedName })
  }

  restartForm = () => {
    this.setState({ selectedName: '' })
  }

  render() {
    const {
      onFetchENS,
      onFetchDomainList,
      onSetENSResolver,
      onSetENSContent,
      onNavigate,
      subdomainList,
      error,
      isLoading,
      isWaitingTxSetContent,
      isWaitingTxSetResolver,
      ens
    } = this.props
    const { selectedName } = this.state

    return (
      <LandProviderPage className="LandEditPage">
        {land => (
          <LandAction
            land={land}
            title={t('land_ens_page.title')}
            subtitle={<T id="land_ens_page.subtitle" values={{ name: <Link to={locations.landDetail(land.id)}> {land.name}</Link> }} />}
          >
            {selectedName === '' ? (
              <LandSelectNameForm
                land={land}
                ens={ens}
                onUpdateName={this.updateSelectedName}
                onFetchDomainList={onFetchDomainList}
                onFetchENS={onFetchENS}
                subdomainList={subdomainList}
                error={error}
                isLoading={isLoading}
              />
            ) : (
              <LandSetNameForm
                land={land}
                ens={ens}
                selectedName={selectedName}
                error={error}
                isLoading={isLoading}
                isWaitingTxSetResolver={isWaitingTxSetResolver}
                isWaitingTxSetContent={isWaitingTxSetContent}
                onSetENSContent={onSetENSContent}
                onSetENSResolver={onSetENSResolver}
                onRestartForm={this.restartForm}
                onNavigate={onNavigate}
              />
            )}
          </LandAction>
        )}
      </LandProviderPage>
    )
  }
}
