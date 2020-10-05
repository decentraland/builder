import * as React from 'react'
import LandAction from 'components/LandAction'
import LandProviderPage from 'components/LandProviderPage'
import { Props, State } from './LandEnsPage.types'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import LandSelectNameForm from './LandSelectNameForm/LandSelectNameForm'
import LandSetNameForm from './LandSetNameForm/LandSetNameForm'

export default class LandEnsPage extends React.PureComponent<Props> {
  state:State = {
    selectedName: '',
  }

  updateSelectedName(selectedName:string) {
    this.setState({selectedName})
    console.log({selectedName})
  }

  restartForm() {
    this.setState({ selectedName: '' })
  }

  render() {
    const { onGetENS, onGetDomainList, onSetENSResolver, onSetENSContent, subdomainList, error, isLoading, ens } = this.props
    const { selectedName } = this.state

    return (
      <LandProviderPage className="LandEditPage">
        {land => (
          <LandAction
            land={land}
            title={t('land_ens_page.title')}
            subtitle={<T id="land_ens_page.subtitle" values={{ name: <strong>{land.name}</strong> }} />}
          >
            {
              (selectedName === '') ? (
                <LandSelectNameForm 
                  land={land} 
                  ens={ens}
                  onUpdateName={this.updateSelectedName.bind(this)}
                  onGetDomainList={onGetDomainList}
                  onGetENS={onGetENS} 
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
                  onSetENSContent={onSetENSContent}
                  onSetENSResolver={onSetENSResolver}
                  onRestartForm={this.restartForm.bind(this)}
                />
              )
            }
          </LandAction>
        )}
      </LandProviderPage>
    )
  }
}
