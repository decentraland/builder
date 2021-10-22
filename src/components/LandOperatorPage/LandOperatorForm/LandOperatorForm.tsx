import * as React from 'react'
import { Network } from '@dcl/schemas'
import { Form, Field, Row, Button, InputOnChangeData } from 'decentraland-ui'
import { NetworkButton } from 'decentraland-dapps/dist/containers'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Link } from 'react-router-dom'
import { getUpdateOperator } from 'modules/land/utils'
import { locations } from 'routing/locations'
import { Props, State } from './LandOperatorForm.types'
import './LandOperatorForm.css'
import { isEqual, isValid } from 'lib/address'
import { RoleType } from 'modules/land/types'

export default class LandOperatorForm extends React.PureComponent<Props, State> {
  state: State = {
    address: '',
    initial: '',
    loading: false,
    editing: false,
    dirty: false,
    revoked: false
  }

  async componentWillMount() {
    this.setState({ loading: true })
    const { land } = this.props
    const address = await getUpdateOperator(land)
    if (address !== null) {
      this.setState({ address, initial: address, loading: false, editing: true })
    } else {
      this.setState({ loading: false })
    }
  }

  handleSetOperator = () => {
    const { land, onSetOperator } = this.props
    const { address, revoked } = this.state
    onSetOperator(land, revoked ? null : address)
  }

  handleChange = (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    this.setState({ address: data.value, dirty: true, revoked: false })
  }

  handleRevoke = () => {
    this.setState({ revoked: true, dirty: true })
  }

  handleUndo = () => {
    this.setState({ revoked: false, dirty: false })
  }

  render() {
    const { land } = this.props
    const { address, loading, dirty, revoked, editing, initial } = this.state

    const isRevokable = editing && isEqual(address, initial)
    const hasError = !loading && !!address && !isValid(address)
    const isDisabled = loading || !dirty || ((isEqual(address, initial) || hasError) && !revoked) || land.role !== RoleType.OWNER

    const classes = []
    if (revoked) {
      classes.push('revoked')
    }
    if (editing) {
      classes.push('editing')
    }
    if (isRevokable) {
      classes.push('is-revokable')
    }

    return (
      <Form className="LandOperatorForm">
        <Field
          placeholder="0x..."
          label={t('operator_page.address')}
          className={classes.join(' ')}
          value={address}
          onChange={this.handleChange}
          loading={loading}
          action={isRevokable ? (revoked ? t('operator_page.undo') : t('operator_page.revoke')) : undefined}
          onAction={isRevokable ? (revoked ? this.handleUndo : this.handleRevoke) : undefined}
          error={hasError}
          message={hasError ? t('operator_page.invalid_address') : undefined}
        />
        <Row>
          <Link className="cancel" to={locations.landDetail(land.id)}>
            <Button>{t('global.cancel')}</Button>
          </Link>
          <NetworkButton type="submit" primary disabled={isDisabled} onClick={this.handleSetOperator} network={Network.ETHEREUM}>
            {t('global.submit')}
          </NetworkButton>
        </Row>
      </Form>
    )
  }
}
