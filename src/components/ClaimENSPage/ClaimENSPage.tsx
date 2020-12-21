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
import { MAX_NAME_SIZE, PRICE, isNameValid, isNameRepeated } from 'modules/ens/utils'
import { ERC20 as MANAToken } from 'contracts/ERC20'
import { CONTROLLER_ADDRESS, MANA_ADDRESS } from 'modules/common/contracts'
import { Props, State } from './ClaimENSPage.types'

import './ClaimENSPage.css'

export default class ClaimENSPage extends React.PureComponent<Props, State> {
  state: State = {
    name: '',
    amountApproved: -1,
    isLoading: false
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

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { address } = this.props
    const { isLoading } = this.state

    if (prevState.isLoading !== isLoading || prevProps.address !== address) {
      this.getAllowance()
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

    this.setState({ isLoading: true })

    const manaToApprove = this.isManaApproved() ? 0 : getMaximumValue()
    await contractMANA.methods
      .approve(Address.fromString(CONTROLLER_ADDRESS), manaToApprove)
      .send({ from: Address.fromString(address) })
      .getReceipt()
    this.setState({ isLoading: false })
  }

  handleClaim = () => {
    const { onOpenModal } = this.props
    const { name } = this.state
    onOpenModal('ClaimNameFatFingerModal', { originalName: name })
  }

  handleNameChange = (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    this.setState({ name: data.value })
  }

  handleBack = () => {
    this.props.onNavigate(locations.root())
  }

  isManaApproved = () => {
    const { amountApproved } = this.state
    return amountApproved >= 100
  }

  render() {
    const { onBack, ensList } = this.props
    const { name, isLoading } = this.state
    const isValid = isNameValid(name)

    // this need to be checked due peformance issues
    // in the `handleClaim` function before `onOpenModal`
    const isRepeated = isNameRepeated(name, ensList)

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
                    message={isRepeated ? t('claim_ens_page.form.repeated_message') : t('claim_ens_page.form.name_message')}
                    action={`${name.length}/${MAX_NAME_SIZE}`}
                    error={(name.length > 1 && !isValid) || (name.length > 1 && isRepeated)}
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
                  <Button type="submit" primary disabled={!isValid || !this.isManaApproved() || isRepeated} loading={isLoading}>
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
