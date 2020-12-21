import * as React from 'react'
import { Row, Column, Section, Narrow, InputOnChangeData, Header, Form, Field, Button, Mana, Radio } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { EtherscanLink } from 'decentraland-dapps/dist/containers'
import { locations } from 'routing/locations'
import { getMaximumValue } from 'lib/mana'
import Back from 'components/Back'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import { MAX_NAME_SIZE, PRICE, isNameValid, isNameAvailable, hasNameMinLength, isAllowed } from 'modules/ens/utils'
import { CONTROLLER_ADDRESS } from 'modules/common/contracts'
import { Props, State } from './ClaimENSPage.types'

import './ClaimENSPage.css'

export default class ClaimENSPage extends React.PureComponent<Props, State> {
  state: State = {
    name: '',
    isLoading: false,
    isAvailable: true,
    isError: false
  }

  handleManaApprove = async () => {
    const { allowance, onAllowMana } = this.props
    const manaToAllow = isAllowed(allowance) ? 0 : getMaximumValue()
    onAllowMana(manaToAllow.toString())
  }

  handleClaim = async () => {
    const { onOpenModal } = this.props
    const { name } = this.state
    this.setState({ isLoading: true })
    try {
      const isAvailable = await isNameAvailable(name)
      if (isAvailable) {
        onOpenModal('ClaimNameFatFingerModal', { originalName: name })
        this.setState({ isLoading: false })
      } else {
        this.setState({ isAvailable: false, isLoading: false })
      }
    } catch (error) {
      this.setState({ isLoading: false, isAvailable: true, isError: true })
    }
  }

  handleNameChange = (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    const { isAvailable } = this.state
    if (isAvailable) {
      this.setState({ name: data.value, isError: false })
    } else {
      this.setState({ name: data.value, isAvailable: true, isError: false })
    }
  }

  handleBack = () => {
    this.props.onNavigate(locations.root())
  }

  render() {
    const { allowance, onBack } = this.props
    const { name, isError, isAvailable } = this.state

    const isValid = isNameValid(name)
    const isLoading = this.props.isLoading || this.state.isLoading
    const isManaAllowed = isAllowed(allowance)

    return (
      <LoggedInDetailPage className="ClaimENSPage" hasNavigation={false}>
        <Row height={48}>
          <Back absolute onClick={this.handleBack} />
        </Row>
        <Narrow>
          <Row className="main">
            <Column>
              <div className="avatar-friends"></div>
            </Column>
            <Column className="content">
              <Section>
                <Header className="title" size="large">
                  {t('claim_ens_page.title')}
                </Header>
                <span className="subtitle">{t('claim_ens_page.subtitle')}</span>
              </Section>
              <Form onSubmit={this.handleClaim}>
                <Section>
                  <Field
                    label={t('claim_ens_page.form.name_label')}
                    value={name}
                    message={
                      isError
                        ? t('claim_ens_page.form.error_message')
                        : isAvailable
                        ? t('claim_ens_page.form.name_message')
                        : t('claim_ens_page.form.repeated_message')
                    }
                    action={`${name.length}/${MAX_NAME_SIZE}`}
                    error={isError || (hasNameMinLength(name) && !isValid) || !isAvailable}
                    onChange={this.handleNameChange}
                    onAction={undefined}
                  />
                </Section>
                <Section className="field">
                  <Header sub={true}>MANA Approved</Header>
                  <Radio toggle disabled={isLoading} checked={isManaAllowed} onChange={this.handleManaApprove} />
                  <p className="message">
                    <T
                      id="claim_ens_page.form.need_mana_message"
                      values={{
                        contract_link: (
                          <EtherscanLink address={CONTROLLER_ADDRESS} txHash="">
                            DCLController
                          </EtherscanLink>
                        )
                      }}
                    />
                  </p>
                </Section>
                <Row className="actions">
                  <Button className="cancel" onClick={onBack}>
                    {t('global.cancel')}
                  </Button>
                  <Button type="submit" primary disabled={isManaAllowed || !isValid || !isAvailable} loading={isLoading}>
                    {t('claim_ens_page.form.claim_button')} <Mana>{PRICE.toLocaleString()}</Mana>
                  </Button>
                </Row>
              </Form>
            </Column>
          </Row>
        </Narrow>
      </LoggedInDetailPage>
    )
  }
}
