import * as React from 'react'
import LandAction from 'components/LandAction'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Link } from 'react-router-dom'
import { locations } from 'routing/locations'
import { findBySubdomain } from 'modules/ens/utils'
import LandProviderPage from 'components/LandProviderPage'
import LandSelectNameForm from './LandSelectNameForm/LandSelectNameForm'
import LandSetNameForm from './LandSetNameForm/LandSetNameForm'
import { Props, State } from './LandEnsPage.types'

export default class LandEnsPage extends React.PureComponent<Props> {
  state: State = {
    selectedSubdomain: ''
  }

  handleUpdateSubdomain = (selectedSubdomain: string) => {
    this.setState({ selectedSubdomain })
  }

  restartForm = () => {
    this.setState({ selectedSubdomain: '' })
  }

  render() {
    const {
      ensList,
      isLoading,
      error,
      isWaitingTxSetContent,
      isWaitingTxSetResolver,
      onFetchENS,
      onFetchDomainList,
      onSetENSResolver,
      onSetENSContent,
      onNavigate
    } = this.props
    const { selectedSubdomain } = this.state
    const selectedENS = findBySubdomain(ensList, selectedSubdomain)

    return (
      <LandProviderPage className="LandEditPage">
        {land => (
          <LandAction
            land={land}
            title={t('land_ens_page.title')}
            subtitle={<T id="land_ens_page.subtitle" values={{ name: <Link to={locations.landDetail(land.id)}>{land.name}</Link> }} />}
          >
            {!selectedENS ? (
              <LandSelectNameForm
                land={land}
                ensList={ensList}
                onUpdateSubdomain={this.handleUpdateSubdomain}
                onFetchDomainList={onFetchDomainList}
                onFetchENS={onFetchENS}
                error={error}
                isLoading={isLoading}
              />
            ) : (
              <LandSetNameForm
                land={land}
                ens={selectedENS}
                selectedSubdomain={selectedSubdomain}
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
