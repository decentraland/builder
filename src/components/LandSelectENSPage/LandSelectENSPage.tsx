import * as React from 'react'
import LandAction from 'components/LandAction'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Link } from 'react-router-dom'
import { locations } from 'routing/locations'
import { Land } from 'modules/land/types'
import LandProviderPage from 'components/LandProviderPage'
import LandSelectENSForm from './LandSelectENSForm/LandSelectENSForm'
import { Props } from './LandSelectENSPage.types'

export default class LandSelectENSPage extends React.PureComponent<Props> {
  handleUpdateSubdomain = (land: Land, selectedSubdomain: string) => {
    const { onNavigate } = this.props
    onNavigate(locations.landAssignENS(land.id, selectedSubdomain))
  }

  render() {
    const { ensList, isLoading, onFetchENS } = this.props

    return (
      <LandProviderPage>
        {land => (
          <LandAction
            land={land}
            title={t('land_select_ens_page.title')}
            subtitle={
              <T id="land_select_ens_page.subtitle" values={{ land: <Link to={locations.landDetail(land.id)}>{land.name}</Link> }} />
            }
          >
            <LandSelectENSForm
              land={land}
              ensList={ensList}
              isLoading={isLoading}
              onUpdateSubdomain={subdomain => this.handleUpdateSubdomain(land, subdomain)}
              onFetchENS={onFetchENS}
            />
          </LandAction>
        )}
      </LandProviderPage>
    )
  }
}
