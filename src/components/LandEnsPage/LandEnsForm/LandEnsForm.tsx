import * as React from 'react'
import { Form, Row, Button, Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Link } from 'react-router-dom'
import { locations } from 'routing/locations'
import { Props, State } from './LandEnsForm.types'
import './LandEnsForm.css'
import { marketplace } from 'lib/api/marketplace'
import { store } from 'modules/common/store'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { env } from 'decentraland-commons'
import { SelectNames } from 'components/SelectNames'

export const ENS_CONTRACT_ADDRESS = env.get('REACT_APP_ENS_CONTRACT_ADDRESS', '')
export const RESOLVER_CONTRACT_ADDRESS = env.get('REACT_APP_RESOLVER_CONTRACT_ADDRESS', '')

export default class LandEnsForm extends React.PureComponent<Props, State> {
  state: State = {
    selectedSubdomain: '',
    subdomainList: [],
    done: false
  }

  componentDidMount() {
    (async () => {
     const state = store.getState()
     const address = getAddress(state)
     
     if (address) {
       const subdomainList = await marketplace.fetchDomainList(address)
       this.setState({subdomainList})
     }
    })()

  }
    
  handleChange = (selectedSubdomain: string) => {
    const { onGetENS, land } = this.props
    onGetENS(selectedSubdomain, land)
    this.setState({ selectedSubdomain })
  }
  
  render() {
    const { land, onSetNameResolver, error, ens, isLoading } = this.props
    const { subdomainList, selectedSubdomain, done } = this.state
    const selectOptions = subdomainList.map(x => ({value: x.toLowerCase(), text: x.toLowerCase()}))
 
 
    if (!error && isLoading) {
      return <Row><Loader size="large" active /></Row>
    }

    const message = error ? error : 'Name saved correctly'
    const messageType = ens.data[selectedSubdomain] ? ens.data[selectedSubdomain].type : 'default'
    let selectMessage = ((type) => {
      switch(type) {
        case 'EqualContent' : return 'The name has been assign to the current land'
        default             : return 'Choose a name to assign to this land'
      }
    })(messageType)

    return (
      <Form className="LandEnsForm">
        { 
          done ? <>
            <Row>
              <p> {message} </p>
            </Row>
            <Row>
              <Link className="cancel" to={locations.landDetail(land.id)}>
                <Button>{t('global.done')}</Button>
              </Link>
            </Row>
          </> : <>
            <Row>
              <SelectNames
                name={t('land_ens_page.select_names.placeholder')}
                value={selectedSubdomain}
                options={selectOptions}
                onChange={this.handleChange}
              />
            </Row>
            <Row>
              <p> {selectMessage} </p>
            </Row>
            <Row>
              <Button type="submit" primary onClick={async () => {
                await onSetNameResolver(selectedSubdomain, land)
                this.setState({done: true})
              }}>
                {t('global.submit')}
              </Button>
              <Link className="cancel" to={locations.landDetail(land.id)}>
                <Button>{t('global.cancel')}</Button>
              </Link>
            </Row>
          </>
        }
      </Form>
    )
  }
}


