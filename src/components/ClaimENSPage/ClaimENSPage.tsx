import * as React from 'react'
import { Row, Column, Section, Narrow, InputOnChangeData, Header, Form, Field, Button, Mana, Radio, Popup } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { EtherscanLink } from 'decentraland-dapps/dist/containers'
import { locations } from 'routing/locations'
import { getMaximumValue } from 'lib/mana'
import Back from 'components/Back'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import { MAX_NAME_SIZE, PRICE, isNameValid, isNameAvailable, hasNameMinLength, isEnoughClaimMana } from 'modules/ens/utils'
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
    const manaToAllow = isEnoughClaimMana(allowance) ? 0 : getMaximumValue()
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
    if (data.value.length <= MAX_NAME_SIZE) {
      if (!isAvailable) {
        this.setState({ name: data.value, isAvailable: true, isError: false })
      } else {
        this.setState({ name: data.value, isError: false })
      }
    }
  }

  handleBack = () => {
    this.props.onNavigate(locations.root())
  }

  handleAction = () => {
    /* noop */
  }

  render() {
    const { wallet, allowance, onBack } = this.props
    const { name, isError, isAvailable } = this.state

    const isLoading = this.props.isLoading || this.state.isLoading

    const isValid = isNameValid(name)
    const isEnoughMana = wallet && isEnoughClaimMana(wallet.mana.toString())
    const isManaAllowed = isEnoughClaimMana(allowance)

    const isDisabled = !isValid || !isAvailable || !isEnoughMana || !isManaAllowed

    let message: string = ''
    if (isError) {
      message = t('claim_ens_page.error_message')
    } else if (!isAvailable) {
      message = t('claim_ens_page.repeated_message')
    } else if (name.length <= 2) {
      message = ''
    } else if (!isValid) {
      message = t('claim_ens_page.name_message')
    }

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
                <span className="subtitle">
                  <T
                    id="claim_ens_page.subtitle"
                    values={{
                      exampleLink: <i>http://name.dcl.eth.link</i>,
                      br: (
                        <>
                          <br />
                          <br />
                        </>
                      ),
                      dclWorldLink: (
                        <a href="http://play.decentraland.org" rel="noopener noreferrer" target="_blank">
                          {t('claim_ens_page.world')}
                        </a>
                      )
                    }}
                  />
                </span>
              </Section>
              <Form onSubmit={this.handleClaim}>
                <Section className={name.length === MAX_NAME_SIZE ? 'red' : ''}>
                  <Field
                    label={t('claim_ens_page.name_label')}
                    value={name}
                    message={message}
                    placeholder={t('claim_ens_page.name_placeholder')}
                    action={`${name.length}/${MAX_NAME_SIZE}`}
                    error={isError || (hasNameMinLength(name) && !isValid) || !isAvailable}
                    onChange={this.handleNameChange}
                    onAction={this.handleAction}
                  />
                </Section>
                <Section className="field">
                  <Header sub={true}>MANA Approved</Header>
                  <Radio toggle disabled={isLoading} checked={isManaAllowed} onChange={this.handleManaApprove} />
                  <p className="message">
                    <T
                      id="claim_ens_page.need_mana_message"
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
                  {!isLoading && (!isEnoughMana || !isManaAllowed) ? (
                    <Popup
                      className="modal-tooltip"
                      content={
                        !isEnoughMana ? t('claim_ens_page.not_enough_mana') : !isManaAllowed ? t('claim_ens_page.mana_not_allowed') : ''
                      }
                      position="top center"
                      trigger={
                        <div className="popup-button">
                          <Button type="submit" primary disabled={isDisabled} loading={isLoading}>
                            {t('claim_ens_page.claim_button')} <Mana>{PRICE.toLocaleString()}</Mana>
                          </Button>
                        </div>
                      }
                      hideOnScroll={true}
                      on="hover"
                      inverted
                    />
                  ) : (
                    <Button type="submit" primary disabled={isDisabled} loading={isLoading}>
                      {t('claim_ens_page.claim_button')} <Mana>{PRICE.toLocaleString()}</Mana>
                    </Button>
                  )}
                </Row>
              </Form>
            </Column>
          </Row>
        </Narrow>
      </LoggedInDetailPage>
    )
  }
}
