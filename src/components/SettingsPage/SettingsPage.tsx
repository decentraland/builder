import * as React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Grid, Blockie, Loader, Row, Field, InputOnChangeData, Dropdown, Button, Section, DropdownProps, Header } from 'decentraland-ui'
import { isMobile } from 'decentraland-dapps/dist/lib/utils'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'

import Profile from 'components/Profile'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import SignInRequired from 'components/SignInRequired'
import { shorten, isValid } from 'lib/address'
import { LandType } from 'modules/land/types'
import { Props, State } from './SettingsPage.types'
import './SettingsPage.css'

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
    const { authorizations, wallet, onSetUpdateManager } = this.props
    const { hasCopiedText, managerAddress, type } = this.state

    const isValidAddress = isValid(managerAddress)

    return (
      <Grid>
        {wallet === null ? (
          <Loader size="big" active />
        ) : (
          <>
            <Grid.Row>
              <Grid.Column computer={4} mobile={16}>
                <div className="left-column secondary-text">{t('global.address')}</div>
              </Grid.Column>
              <Grid.Column computer={12} mobile={16}>
                <div className="blockie-container">
                  <Blockie seed={wallet.address} scale={12} />
                </div>
                <div className="address-container">
                  <div className="address">{isMobile() ? shorten(wallet.address!) : wallet.address}</div>
                  <CopyToClipboard text={wallet.address} onCopy={this.handleOnCopy}>
                    {hasCopiedText ? (
                      <span>{t('settings_page.copied')}</span>
                    ) : (
                      <span className="link">{t('settings_page.copy_address')}</span>
                    )}
                  </CopyToClipboard>
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

                  <Button
                    size="small"
                    primary
                    disabled={managerAddress.length === 0 || !isValidAddress}
                    onClick={this.handleAddAuthorization}
                  >
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
          </>
        )}
      </Grid>
    )
  }

  renderLogin() {
    return <SignInRequired />
  }

  renderLoading() {
    return (
      <div className="center">
        <Loader active size="huge" />
      </div>
    )
  }

  render() {
    return <LoggedInDetailPage className="SettingsPage">{this.renderPage()}</LoggedInDetailPage>
  }
}
