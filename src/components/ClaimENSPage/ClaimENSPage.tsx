import * as React from 'react'
import { Row, Column, Section, Narrow, InputOnChangeData, Header, Form, Field, Button, Mana, Popup } from 'decentraland-ui'
import { Network } from '@dcl/schemas'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { NetworkButton } from 'decentraland-dapps/dist/containers'
import { locations } from 'routing/locations'
import { FromParam } from 'modules/location/types'
import Back from 'components/Back'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import { MAX_NAME_SIZE, PRICE, isNameValid, isNameAvailable, hasNameMinLength, isEnoughClaimMana } from 'modules/ens/utils'
import { Props, State } from './ClaimENSPage.types'
import './ClaimENSPage.css'

export default class ClaimENSPage extends React.PureComponent<Props, State> {
  state: State = {
    name: '',
    isLoading: false,
    isAvailable: true,
    isError: false
  }

  handleClaim = async () => {
    const { wallet, mana, onOpenModal } = this.props
    const { name } = this.state

    const isValid = isNameValid(name)
    const isEnoughMana = wallet && isEnoughClaimMana(mana.toString())

    if (!isValid || !isEnoughMana) return

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
    if (this.props.isFromDeployToWorld && this.props.projectId) {
      this.props.onNavigate(locations.sceneEditor(this.props.projectId), {
        fromParam: FromParam.CLAIM_NAME,
        claimedName: ''
      })
    } else {
      this.props.onNavigate(locations.root())
    }
  }

  handleAction = () => {
    /* noop */
  }

  render() {
    const { wallet, mana, onBack } = this.props
    const { name, isError, isAvailable, isLoading } = this.state

    const isValid = isNameValid(name)
    const isEnoughMana = wallet && isEnoughClaimMana(mana.toString())

    const isDisabled = !isValid || !isAvailable || !isEnoughMana

    let message = ''
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
                      exampleLink: <i>https://name.dcl.eth</i>,
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
                      ),
                      symbol: <Mana size="small" />
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
                <Row className="actions">
                  <Button className="cancel" onClick={onBack} type="button">
                    {t('global.cancel')}
                  </Button>
                  {!isLoading && !isEnoughMana ? (
                    <Popup
                      className="modal-tooltip"
                      content={t('claim_ens_page.not_enough_mana')}
                      position="top center"
                      trigger={
                        <div className="popup-button">
                          <NetworkButton type="submit" primary disabled={isDisabled} loading={isLoading} network={Network.ETHEREUM}>
                            {t('claim_ens_page.claim_button')} <Mana inline>{PRICE.toLocaleString()}</Mana>
                          </NetworkButton>
                        </div>
                      }
                      hideOnScroll={true}
                      on="hover"
                      inverted
                    />
                  ) : (
                    <NetworkButton type="submit" primary disabled={isDisabled} loading={isLoading} network={Network.ETHEREUM}>
                      {t('claim_ens_page.claim_button')} <Mana inline>{PRICE.toLocaleString()}</Mana>
                    </NetworkButton>
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
