import * as React from 'react'
import { Address } from 'web3x-es/address'
import { Eth } from 'web3x-es/eth'
import { Row, Column, Section, Narrow, InputOnChangeData, Header, Form, Field, Button, Mana, Radio } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { EtherscanLink } from 'decentraland-dapps/dist/containers'
import { createEth } from 'decentraland-dapps/dist/lib/eth'
import { locations } from 'routing/locations'
import { getMaximumValue } from 'lib/mana'
import Back from 'components/Back'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import { MAX_NAME_SIZE, PRICE, isNameValid, isNameAvailable, hasNameMinLength } from 'modules/ens/utils'
import { ERC20 as MANAToken } from 'contracts/ERC20'
import { CONTROLLER_ADDRESS, MANA_ADDRESS } from 'modules/common/contracts'
import { Props, State } from './ClaimENSPage.types'

import './ClaimENSPage.css'

export default class ClaimENSPage extends React.PureComponent<Props, State> {
  state: State = {
    name: '',
    amountApproved: -1,
    isLoading: false,
    isAvailable: true,
    isError: false
  }

  async getManaContract() {
    const eth: Eth | null = await createEth()
    if (!eth) return
    return new MANAToken(eth, Address.fromString(MANA_ADDRESS))
  }

  componentDidMount() {
    if (this.state.amountApproved === -1) {
      this.getAllowance()
    }
  }

  componentDidUpdate(prevProps: Props, _prevState: State) {
    const { address } = this.props

    if (prevProps.address !== address) {
      this.setState({ isLoading: true })
      this.getAllowance().then(() => this.setState({ isLoading: false }))
    }
  }

  async getAllowance() {
    const { address } = this.props

    try {
      const contractMANA = await this.getManaContract()
      if (contractMANA && address) {
        const allowance: string = await contractMANA.methods
          .allowance(Address.fromString(address), Address.fromString(CONTROLLER_ADDRESS))
          .call()
        this.setState({ amountApproved: +allowance })
      }
    } catch (error) {
      throw error
    }
  }

  handleManaApprove = async () => {
    const { address } = this.props
    const contractMANA = await this.getManaContract()

    if (!contractMANA || !address) return

    const manaToApprove = this.isManaApproved() ? 0 : getMaximumValue()
    try {
      this.setState({ isLoading: true })

      await contractMANA.methods
        .approve(Address.fromString(CONTROLLER_ADDRESS), manaToApprove)
        .send({ from: Address.fromString(address) })
        .getReceipt()
      this.setState({ isLoading: false })
    } catch (error) {
      this.setState({ isLoading: false })
    }
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
      this.setState({ name: data.value })
    } else {
      this.setState({ name: data.value, isAvailable: true })
    }
  }

  handleBack = () => {
    this.props.onNavigate(locations.root())
  }

  isManaApproved = () => {
    const { amountApproved } = this.state
    return amountApproved >= 100
  }

  render() {
    const { onBack } = this.props
    const { name, isLoading, isError, isAvailable } = this.state
    const isValid = isNameValid(name)

    // this need to be checked due peformance issues
    // in the `handleClaim` function before `onOpenModal`

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
                  <Radio toggle disabled={isLoading} checked={this.isManaApproved()} onChange={this.handleManaApprove} />
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
                  <Button type="submit" primary disabled={!isValid || !this.isManaApproved() || !isAvailable} loading={isLoading}>
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
