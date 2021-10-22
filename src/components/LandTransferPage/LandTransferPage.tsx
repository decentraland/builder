import * as React from 'react'
import { Link } from 'react-router-dom'
import { Field, InputOnChangeData, Form, Row, Button, Section } from 'decentraland-ui'
import { Network } from '@dcl/schemas'
import { NetworkButton } from 'decentraland-dapps/dist/containers'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import LandAction from 'components/LandAction'
import LandProviderPage from 'components/LandProviderPage'
import { RoleType } from 'modules/land/types'
import { locations } from 'routing/locations'
import { isValid, isEqual } from 'lib/address'
import { Props, State } from './LandTransferPage.types'
import './LandTransferPage.css'

export default class LandTransferPage extends React.PureComponent<Props, State> {
  state = {
    address: '',
    isValid: true
  }

  handleChange = (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    this.setState({ isValid: !data.value || isValid(data.value), address: data.value })
  }

  render() {
    const { onTransfer } = this.props
    const { address, isValid } = this.state
    return (
      <LandProviderPage className="LandTransferPage">
        {land => {
          let message
          const isOwner = isEqual(land.owner, address)
          if (isOwner) {
            message = t('transfer_page.same_owner')
          } else if (!isValid) {
            message = t('transfer_page.invalid_address')
          }
          return (
            <LandAction
              land={land}
              title={t('transfer_page.title')}
              subtitle={<T id="transfer_page.subtitle" values={{ name: <strong>{land.name}</strong> }} />}
            >
              <Form onSubmit={() => onTransfer(land, address)}>
                <Field
                  label="Address"
                  type="address"
                  value={address}
                  onChange={this.handleChange}
                  placeholder="0x..."
                  error={!isValid || isOwner}
                  message={message}
                />
                <Section className="disclaimer">
                  <p className="danger-text">
                    <T id="transfer_page.disclaimer" values={{ br: <br /> }} />
                  </p>
                </Section>
                <Row>
                  <Link className="cancel" to={locations.landDetail(land.id)}>
                    <Button>{t('global.cancel')}</Button>
                  </Link>
                  <NetworkButton
                    type="submit"
                    primary
                    disabled={!address || !isValid || land.role !== RoleType.OWNER || isEqual(land.owner, address)}
                    network={Network.ETHEREUM}
                  >
                    {t('global.submit')}
                  </NetworkButton>
                </Row>
              </Form>
            </LandAction>
          )
        }}
      </LandProviderPage>
    )
  }
}
