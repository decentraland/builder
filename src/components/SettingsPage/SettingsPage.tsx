import * as React from 'react'
import { Link } from 'react-router-dom'
import CopyToClipboard from 'react-copy-to-clipboard'
import {
  Page,
  Grid,
  Blockie,
  Mana,
  Loader,
  Row,
  Field,
  InputOnChangeData,
  Dropdown,
  Button,
  Section,
  DropdownProps,
  Header
} from 'decentraland-ui'
import { isMobile } from 'decentraland-dapps/dist/lib/utils'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'

import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import Profile from 'components/Profile'
import Navigation from 'components/Navigation'
import { locations } from 'routing/locations'
import { shorten, isValid } from 'lib/address'
import { LandType } from 'modules/land/types'
import { Props, State } from './SettingsPage.types'
import './SettingsPage.css'

const BUY_MANA_URL = process.env.REACT_APP_BUY_MANA_URL

export default class SettingsPage extends React.PureComponent<Props, State> {
  timeoutId: NodeJS.Timer | null = null

  state: State = {
    hasCopiedText: false,
    type: LandType.PARCEL,
    managerAddress: ''
  }

  handleOnCopy = () => {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
    this.setState({ hasCopiedText: true })
    this.timeoutId = setTimeout(() => {
      this.timeoutId = null
      this.setState({ hasCopiedText: false })
    }, 1200)
  }

  handleAddressChange = (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    this.setState({ managerAddress: data.value })
  }

  handleTypeChange = (_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    this.setState({ type: data.value as LandType })
  }

  handleAddAuthorization = () => {
    const { onSetUpdateManager } = this.props
    const { managerAddress, type } = this.state
    onSetUpdateManager(managerAddress, type, true)
  }

  renderPage() {
    const { authorizations, mana, address, onSetUpdateManager } = this.props
    const { hasCopiedText, managerAddress, type } = this.state

    const isValidAddress = isValid(managerAddress)
    return (
      <Grid>
        <Grid.Row>
          <Grid.Column computer={4} mobile={16}>
            <div className="left-column secondary-text">{t('global.address')}</div>
          </Grid.Column>
          <Grid.Column computer={12} mobile={16}>
            <div className="blockie-container">
              <Blockie seed={address!} scale={12} />
            </div>
            <div className="address-container">
              <div className="address">{isMobile() ? shorten(address!) : address}</div>
              <CopyToClipboard text={address!} onCopy={this.handleOnCopy}>
                {hasCopiedText ? (
                  <span className="copy-text">{t('settings_page.copied')}</span>
                ) : (
                  <span className="copy-text link">{t('settings_page.copy_address')}</span>
                )}
              </CopyToClipboard>
            </div>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column computer={4} mobile={16}>
            <div className="left-column secondary-text">{t('global.balance')}</div>
          </Grid.Column>
          <Grid.Column computer={12} mobile={16}>
            <div className="balance">
              <Mana inline>{parseInt(mana!.toFixed(0), 10).toLocaleString()}</Mana>
              {BUY_MANA_URL ? (
                <a className="buy-more" href={BUY_MANA_URL} target="_blank" rel="noopener noreferrer">
                  {t('settings_page.buy_more_mana')}
                </a>
              ) : null}
            </div>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column computer={4} mobile={16}>
            <div className="left-column secondary-text">{t('settings_page.authorizations')}</div>
          </Grid.Column>
          <Grid.Column computer={12} mobile={16}>
            <Section className="authoziations-disclaimer">
              {t('settings_page.disclaimer', { emphasis: <strong>{t('settings_page.emphasis')}</strong> })}
            </Section>
            <Row className="authorization-action">
              <T
                id="settings_page.authorization_action"
                values={{
                  address: (
                    <Field
                      value={managerAddress}
                      onChange={this.handleAddressChange}
                      placeholder="0x..."
                      error={managerAddress.length > 0 && !isValidAddress}
                    />
                  ),
                  type: (
                    <Dropdown
                      options={[
                        {
                          text: 'Parcels',
                          value: LandType.PARCEL
                        },
                        {
                          text: 'Estates',
                          value: LandType.ESTATE
                        }
                      ]}
                      value={type}
                      onChange={this.handleTypeChange}
                    ></Dropdown>
                  )
                }}
              ></T>

              <Button size="small" primary disabled={managerAddress.length === 0 || !isValidAddress} onClick={this.handleAddAuthorization}>
                {t('global.submit')}
              </Button>
            </Row>

            {authorizations.length > 0 ? (
              <Section>
                <Header sub>{t('settings_page.authorizations_title')}</Header>
                {authorizations.map(authorization => (
                  <Row className="authorization">
                    <T
                      id="settings_page.authorization"
                      values={{
                        address: <Profile address={authorization.address} />,
                        type: (
                          <span>
                            &nbsp;<strong>{t(`global.${authorization.type}_plural`)}</strong>&nbsp;
                          </span>
                        )
                      }}
                    />
                    <Button basic onClick={() => onSetUpdateManager(authorization.address, authorization.type, false)}>
                      {t('global.revoke')}
                    </Button>
                  </Row>
                ))}
              </Section>
            ) : null}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  renderLogin() {
    return (
      <div className="center">
        <p>
          {
            <T
              id="wallet.sign_in_required"
              values={{
                sign_in: <Link to={locations.signIn()}>{t('wallet.sign_in')}</Link>
              }}
            />
          }
        </p>
      </div>
    )
  }

  renderLoading() {
    return (
      <div className="center">
        <Loader active size="huge" />
      </div>
    )
  }

  render() {
    const { isLoggingIn, isLoggedIn } = this.props
    return (
      <>
        <Navbar isFullscreen />
        <Navigation />
        <Page className="SettingsPage">
          {isLoggingIn ? this.renderLoading() : null}
          {!isLoggingIn && !isLoggedIn ? this.renderLogin() : null}
          {!isLoggingIn && isLoggedIn ? this.renderPage() : null}
        </Page>
        <Footer />
      </>
    )
  }
}
