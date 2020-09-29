import * as React from 'react'
import LandAction from 'components/LandAction'
import LandProviderPage from 'components/LandProviderPage'
import { Props } from './LandEnsPage.types'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import LandEnsForm from './LandEnsForm/LandEnsForm'

export default class LandEnsPage extends React.PureComponent<Props> {
  render() {
    const { onSetENSResolver, onSetENSContent, onGetENS, onGetDomainList, subdomainList, error, isLoading, ens } = this.props
    return (
      <LandProviderPage className="LandEditPage">
        {land => (
          <LandAction
            land={land}
            title={t('land_ens_page.title')}
            subtitle={<T id="land_ens_page.subtitle" values={{ name: <strong>{land.name}</strong> }} />}
          >
            <LandEnsForm 
              land={land} 
              ens={ens}
              onGetDomainList={onGetDomainList}
              onSetENSResolver={onSetENSResolver} 
              onSetENSContent={onSetENSContent} 
              onGetENS={onGetENS} 
              subdomainList={subdomainList}
              error={error} 
              isLoading={isLoading} 
            />
          </LandAction>
        )}
      </LandProviderPage>
    )
  }
}
