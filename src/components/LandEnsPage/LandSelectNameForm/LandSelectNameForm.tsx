import * as React from 'react'
import { env } from 'decentraland-commons'
import { Form, Row, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Link } from 'react-router-dom'
import { locations } from 'routing/locations'
import { SelectNames } from 'components/SelectNames'
import { findBySubdomain, isEqualContent } from 'modules/ens/utils'
import { Props, State } from './LandSelectNameForm.types'
import './LandSelectNameForm.css'

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
    const { onUpdateSubdomain } = this.props
    onUpdateSubdomain(selectedSubdomain)
  }

  render() {
    const { land, ensList, isLoading } = this.props
    const { selectedSubdomain } = this.state

    const selectOptions = ensList.map(({ subdomain }) => ({ value: subdomain.toLowerCase(), text: subdomain.toLowerCase() }))
    const selectedENS = findBySubdomain(ensList, selectedSubdomain)

    let selectMessage: string = ''
    let isButtonDisabled: boolean = false

    if (!selectedENS) {
      selectMessage = t('land_ens_page.select_names.message.choose_name')
      isButtonDisabled = true
    } else if (isEqualContent(selectedENS, land)) {
      selectMessage = t('land_ens_page.select_names.message.name_assigned')
      isButtonDisabled = true
    } else {
      selectMessage = t('land_ens_page.select_names.message.name_available')
      isButtonDisabled = false
    }

    return (
      <Form className="LandSelectNameForm">
        {!isLoading && selectOptions.length === 0 ? (
          <>
            <Row>
              <p className="emptyOptions">{t('land_ens_page.empty_options_message')}</p>
            </Row>
            <Row>
              <Link className="cancel" to={locations.landDetail(land.id)}>
                <Button>{t('global.cancel')}</Button>
              </Link>
              <Link to={CLAIM_NAME_URL}>
                <Button primary>{t('land_ens_page.claim_new_name')}</Button>
              </Link>
            </Row>
          </>
        ) : (
          <>
            <Row>
              <SelectNames
                name={t('land_ens_page.select_names.placeholder')}
                value={selectedSubdomain}
                options={selectOptions}
                onChange={this.handleChange}
              />
            </Row>
            <Row>
              <p className="selectMessage">{selectMessage}</p>
            </Row>
            <Row>
              <Link className="cancel" to={locations.landDetail(land.id)}>
                <Button>{t('global.cancel')}</Button>
              </Link>
              <Button type="submit" disabled={isButtonDisabled || isLoading} primary onClick={this.handleContinue} loading={isLoading}>
                {t('global.continue')}
              </Button>
            </Row>
          </>
        )}
      </Form>
    )
  }
}
