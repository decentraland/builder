import * as React from 'react'
import { Form, Row, Button, Section, Header, Dropdown, DropdownProps } from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { Link } from 'react-router-dom'
import { locations } from 'routing/locations'
import { isEqualContent } from 'modules/ens/utils'
import { Props, State } from './LandSelectENSForm.types'
import './LandSelectENSForm.css'

export default class LandSelectENSForm extends React.PureComponent<Props, State> {
  state: State = {
    selectedName: ''
  }

  handleChange = (_: React.SyntheticEvent, data: DropdownProps) => {
    const { onFetchENS, land } = this.props
    const selectedName = data.value as string
    onFetchENS(selectedName, land)
    this.setState({ selectedName })
  }

  handleContinue = () => {
    const { selectedName } = this.state
    const { onUpdateSubdomain, ensList } = this.props
    const selectedENS = ensList.find(ens => ens.name === selectedName)!
    onUpdateSubdomain(selectedENS.subdomain)
  }

  render() {
    const { land, ensList, isLoading } = this.props
    const { selectedName } = this.state

    const selectOptions = ensList.map(({ name, subdomain }) => ({ value: name, text: subdomain }))
    const selectedENS = ensList.find(ens => ens.name === selectedName)

    const isButtonDisabled: boolean = !selectedENS || isEqualContent(selectedENS, land)

    return (
      <Form className="LandSelectENSForm">
        {!isLoading && selectOptions.length === 0 ? (
          <>
            <Section size="large">{t('land_select_ens_page.empty_options_message')}</Section>
            <Row>
              <Link className="cancel" to={locations.landDetail(land.id)}>
                <Button>{t('global.cancel')}</Button>
              </Link>
              <Link to={locations.claimENS()}>
                <Button primary>{t('land_select_ens_page.claim_new_name')}</Button>
              </Link>
            </Row>
          </>
        ) : (
          <>
            <Section size="large">
              <div className="select-names">
                <Header sub className="name">
                  {t('land_select_ens_page.select_name_title')}
                </Header>
                <Dropdown
                  value={selectedName}
                  options={selectOptions}
                  placeholder={t('land_select_ens_page.select_name_placeholder')}
                  onChange={this.handleChange}
                />
              </div>

              <div className="select-message">
                {selectedENS && isEqualContent(selectedENS, land) ? (
                  <span className="danger-text">{t('land_select_ens_page.name_assigned')}</span>
                ) : (
                  <T
                    id="land_select_ens_page.click_to_claim_new_name"
                    values={{
                      click_here: <Link to={locations.claimENS()}>{t('global.click_here')}</Link>
                    }}
                  />
                )}
              </div>
            </Section>
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
