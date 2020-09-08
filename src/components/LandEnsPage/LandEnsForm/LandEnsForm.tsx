import * as React from 'react'
import { Form, Field, Row, Button, InputOnChangeData } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Link } from 'react-router-dom'
import { getSelection, getCenter, coordsToId } from 'modules/land/utils'
import { locations } from 'routing/locations'
import { Props, State } from './LandEnsForm.types'
import './LandEnsForm.css'
import { isEqual } from 'lib/address'
import { RoleType } from 'modules/land/types'

export default class LandEnsForm extends React.PureComponent<Props, State> {
  state: State = {
    name: '',
    initial: '',
    loading: false,
    editing: false,
    dirty: false,
    revoked: false
  }


  handleChange = (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    this.setState({ name: data.value, dirty: true, revoked: false })
  }

  handleRevoke = () => {
    this.setState({ revoked: true, dirty: true })
  }

  handleUndo = () => {
    this.setState({ revoked: false, dirty: false })
  }

  render() {
    const { land, onSetOperator } = this.props
    const { name, loading, dirty, revoked, editing, initial } = this.state
    const selection = getSelection(land)
    const [x, y] = getCenter(selection)
 
    const isRevokable = editing && isEqual(name, initial)
    const hasError = !loading && !!name 
    const isDisabled = loading || !dirty || ((isEqual(name, initial) || hasError) && !revoked) || land.role !== RoleType.OWNER

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
      <Form className="LandEnsForm">
        <Field
          placeholder="0x..."
          label={t('land_ens_page.name')}
          className={classes.join(' ')}
          value={name}
          onChange={this.handleChange}
          loading={loading}
          action={isRevokable ? (revoked ? t('operator_page.undo') : t('operator_page.revoke')) : undefined}
          onAction={isRevokable ? (revoked ? this.handleUndo : this.handleRevoke) : undefined}
          error={hasError}
          message={hasError ? t('operator_page.invalid_name') : undefined}
        />
        <Row>
          <Button type="submit" primary disabled={isDisabled} onClick={() => onSetOperator(land, revoked ? null : name)}>
            {t('global.submit')}
          </Button>
          <Link className="cancel" to={locations.landDetail(land.id)}>
            <Button>{t('global.cancel')}</Button>
          </Link>
        </Row>
        <Row>
          <Button primary onClick={async () => {
            const formData = new FormData()

            const html:string = `<html>
              <head>
                <meta http-equiv="refresh" content="0; URL=https://play.decentraland.org?position=${coordsToId(x, y)} />
              </head>
              <body>
                <p>
                  If you are not redirected 
                  <a href="https://play.decentraland.org?position=${coordsToId(x, y)}">click here</a>.
                </p>
              </body>
            </html>`

            formData.append('blob', new Blob([html]), 'index.html')
            const result = await fetch('https://ipfs.infura.io:5001/api/v0/add?pin=false' , {
              method: 'POST',
              body: formData
            })
            const json = await result.json()
            console.log(json)
          }}> 
            Send index.html to ipfs
          </Button>

        </Row>
      </Form>
    )
  }
}
