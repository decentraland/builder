import * as React from 'react'
import LandAction from 'components/LandAction'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Link } from 'react-router-dom'
import { locations } from 'routing/locations'
import { findBySubdomain } from 'modules/ens/utils'
import LandProviderPage from 'components/LandProviderPage'
import LandSelectNameForm from './LandSelectNameForm/LandSelectNameForm'
import LandAssignNameForm from './LandAssignNameForm/LandAssignNameForm'
import { Props, State } from './LandSelectNamePage.types'

export default class LandSelectNamePage extends React.PureComponent<Props> {
  state: State = {
    selectedSubdomain: ''
  }

  handleUpdateSubdomain = (selectedSubdomain: string) => {
    this.setState({ selectedSubdomain })
  }

  handleRestartForm = () => {
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
            title={selectedENS ? t('land_ens_page.assign_name_title', { name: selectedSubdomain }) : t('land_ens_page.title')}
            subtitle={<T id="land_ens_page.subtitle" values={{ land: <Link to={locations.landDetail(land.id)}>{land.name}</Link> }} />}
          >
            {!selectedENS ? (
              <LandSelectNameForm
                land={land}
                ensList={ensList}
                error={error}
                isLoading={isLoading}
                onUpdateSubdomain={this.handleUpdateSubdomain}
                onFetchENS={onFetchENS}
              />
            ) : (
              <LandAssignNameForm
                land={land}
                ens={selectedENS}
                error={error}
                isLoading={isLoading}
                isWaitingTxSetResolver={isWaitingTxSetResolver}
                isWaitingTxSetContent={isWaitingTxSetContent}
                onSetENSContent={onSetENSContent}
                onSetENSResolver={onSetENSResolver}
                onRestartForm={this.handleRestartForm}
                onNavigate={onNavigate}
              />
            )}
          </LandAction>
        )}
      </LandProviderPage>
    )
  }
}
