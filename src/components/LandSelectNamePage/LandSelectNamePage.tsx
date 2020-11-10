import * as React from 'react'
import LandAction from 'components/LandAction'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Link } from 'react-router-dom'
import { locations } from 'routing/locations'
import { Land } from 'modules/land/types'
import LandProviderPage from 'components/LandProviderPage'
import LandSelectNameForm from './LandSelectNameForm/LandSelectNameForm'
import { Props } from './LandSelectNamePage.types'

export default class LandSelectNamePage extends React.PureComponent<Props> {
  handleUpdateSubdomain = (land: Land, selectedSubdomain: string) => {
    const { onNavigate } = this.props
    onNavigate(locations.landAssignName(land.id, selectedSubdomain))
  }

  render() {
    const { ensList, isLoading, onFetchENS } = this.props

    return (
      <LandProviderPage className="LandEditPage">
        {land => (
          <LandAction
            land={land}
            title={t('land_ens_page.title')}
            subtitle={<T id="land_ens_page.subtitle" values={{ land: <Link to={locations.landDetail(land.id)}>{land.name}</Link> }} />}
          >
            <LandSelectNameForm
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
