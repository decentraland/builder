import * as React from 'react'
import { env } from 'decentraland-commons'
import { Form, Row, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Link } from 'react-router-dom'
import { locations } from 'routing/locations'
import { Props, State } from './LandSelectNameForm.types'
import './LandSelectNameForm.css'
import { SelectNames } from 'components/SelectNames'
import {FetchEnsTypeResult} from 'modules/ens/types';

export const CLAIM_NAME_URL = env.get('REACT_APP_CLAIM_NAME_URL', '')

export default class LandSelectNameForm extends React.PureComponent<Props, State> {
  state: State = {
    selectedSubdomain: ''
  }
  componentDidMount() {
    this.props.onFetchDomainList()
  }

  handleChange = (selectedSubdomain: string) => {
    const { onFetchENS, land } = this.props
    onFetchENS(selectedSubdomain, land)
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
    const selectOptions = subdomainList.map(subdomain => ({ value: subdomain.toLowerCase(), text: subdomain.toLowerCase() }))

    const messageType = ens.data[selectedSubdomain] ? ens.data[selectedSubdomain].type : 'default'
    let selectMessage: string = ""
    let isButtonDisabled: boolean = false
    switch (messageType) {
      case FetchEnsTypeResult.EmptyResolver:
      case FetchEnsTypeResult.EmptyContent:
      case FetchEnsTypeResult.DifferentContent:
        selectMessage = t('land_ens_page.select_names.message.name_available')
        isButtonDisabled = false
        break
      case FetchEnsTypeResult.EqualContent:
        selectMessage = t('land_ens_page.select_names.message.name_assigned')
        isButtonDisabled = true
        break
      default:
        selectMessage = t('land_ens_page.select_names.message.choose_name')
        isButtonDisabled = true
        break
    }

    if (!isLoading && selectOptions.length === 0) {
      return (
        <Form className="LandSelectNameForm">
          <Row>
            <p className="emptyOptions">{t('land_ens_page.empty_options_message')}</p>
          </Row>
          <Row>
            <Link className="cancel" to={locations.landDetail(land.id)}>
              <Button>{t('global.cancel')}</Button>
            </Link>
            <Button
              primary
              onClick={() => {
                window.location.href = CLAIM_NAME_URL
              }}>
              {t('land_ens_page.claim_new_name')}
            </Button>
          </Row>
        </Form>
      )
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
          <Button type="submit" disabled={isButtonDisabled} primary onClick={this.handleContinue} loading={isLoading}>
            {t('global.continue')}
          </Button>
        </Row>
      </Form>
    )
  }
}
