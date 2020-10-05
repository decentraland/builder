import * as React from 'react'
import { Form, Row, Button, Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Link } from 'react-router-dom'
import { locations } from 'routing/locations'
import { Props, State } from './LandSelectNameForm.types'
import './LandSelectNameForm.css'
import { SelectNames } from 'components/SelectNames'

export default class LandSelectNameForm extends React.PureComponent<Props, State> {
  state: State = {
    selectedSubdomain: '',
  }
  componentDidMount() {
    this.props.onGetDomainList()
  }

  handleChange = (selectedSubdomain: string) => {
    const { onGetENS, land } = this.props
    onGetENS(selectedSubdomain, land)
    this.setState({ selectedSubdomain })
  }

  handleContinue = () => {
    const { selectedSubdomain } = this.state
    const { onUpdateName } = this.props
    onUpdateName(selectedSubdomain)
  }

  render() {
    const { land, ens, isLoading, subdomainList } = this.props
    const { selectedSubdomain } = this.state
    const selectOptions = subdomainList.map(subdomain => ({value: subdomain.toLowerCase(), text: subdomain.toLowerCase()}))
 
 
    if ( isLoading) {
      return <Row><Loader size="large" active /></Row>
    }

    const messageType = ens.data[selectedSubdomain] ? ens.data[selectedSubdomain].type : 'default'
    let selectMessage: string = ""
    let isButtonDisabled: boolean = false
    switch(messageType) {
      case 'EmptyResolver': 
      case 'EmptyContent': 
      case 'DifferentContent': 
        selectMessage = t('land_ens_page.select_names.message.name_available')
        isButtonDisabled = false
        break
      case 'EqualContent': 
        selectMessage = t('land_ens_page.select_names.message.name_assigned'),
        isButtonDisabled = true
        break
      default: 
        selectMessage = t('land_ens_page.select_names.message.choose_name'),
        isButtonDisabled = true
        break
    }

    return (
      <Form className="LandSelectNameForm">
        <Row>
          <SelectNames
            name={t('land_ens_page.select_names.placeholder')}
            value={selectedSubdomain}
            options={selectOptions}
            onChange={this.handleChange}
          />
        </Row>
        <Row>
          <p className="selectMessage"> {selectMessage} </p>
        </Row>
        <Row>
          <Link className="cancel" to={locations.landDetail(land.id)}>
            <Button>{t('global.cancel')}</Button>
          </Link>
          <Button type="submit" disabled={isButtonDisabled} primary onClick={this.handleContinue}> 
            {t('global.continue')} 
          </Button>
        </Row>
      </Form>
    )
  }
}
