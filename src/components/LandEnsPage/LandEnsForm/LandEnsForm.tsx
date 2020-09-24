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

  handleSubmit = () => {
    const { onSetENS, land } = this.props
    const { selectedSubdomain } = this.state
    onSetENS(selectedSubdomain, land)
    this.setState({done: true})
  }
  
  render() {
    const { land, ens, isLoading, error } = this.props
    const { subdomainList, selectedSubdomain, done } = this.state
    const selectOptions = subdomainList.map(x => ({value: x.toLowerCase(), text: x.toLowerCase()}))
 
 
    if ( isLoading) {
      return <Row><Loader size="large" active /></Row>
    }

    const messageType = ens.data[selectedSubdomain] ? ens.data[selectedSubdomain].type : 'default'
    const { message: selectMessage, disable: disableButton } = ((type) => {
      switch(type) {
        case 'EmptyResolver': 
        case 'EmptyContent': 
        case 'DifferentContent': return {
          message: t('land_ens_page.select_names.message.name_available'),
          disable: false
        }
        case 'EqualContent': return {
          message: t('land_ens_page.select_names.message.name_assigned'),
          disable: true
        }
        default: return {
          message: t('land_ens_page.select_names.message.choose_name'),
          disable: true
        }
      }
    })(messageType)

    const submitMessage = error? error: t('land_ens_page.submit_message.success')
    return (
      <Form className="LandEnsForm">
        { 
          done ? <>
            <Row>
              <p style={{paddingTop: '20px'}}> {submitMessage} </p>
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
              <p style={{paddingBottom: '20px'}}> {selectMessage} </p>
            </Row>
            <Row>
              <Button type="submit" disabled={disableButton} primary onClick={this.handleSubmit}>
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
