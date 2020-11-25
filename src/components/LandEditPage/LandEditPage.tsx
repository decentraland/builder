import * as React from 'react'
import { Link } from 'react-router-dom'
import { Field, InputOnChangeData, Form, Row, Button } from 'decentraland-ui'
import LandAction from 'components/LandAction'
import LandProviderPage from 'components/LandProviderPage'
import { Props, State } from './LandEditPage.types'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { RoleType, Land } from 'modules/land/types'
import { locations } from 'routing/locations'
import './LandEditPage.css'

export default class LandEditPage extends React.PureComponent<Props, State> {
  state: State = {}

  getName(land: Land) {
    return typeof this.state.name === 'undefined' ? land.name : this.state.name
  }

  getDescription(land: Land) {
    return typeof this.state.description === 'undefined' ? land.description || '' : this.state.description
  }

  handleNameChange = (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    this.setState({ name: data.value })
  }

  handleDescriptionChange = (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    this.setState({ description: data.value })
  }

  render() {
    const { onEdit } = this.props
    const { name, description } = this.state
    const isPristine = !name && !description
    return (
      <LandProviderPage className="LandEditPage">
        {land => (
          <LandAction
            land={land}
            title={t('edit_page.title')}
            subtitle={<T id="edit_page.subtitle" values={{ name: <strong>{land.name}</strong> }} />}
          >
            <Form onSubmit={() => onEdit(land, this.getName(land), this.getDescription(land))}>
              <Field label="Name" value={this.getName(land)} onChange={this.handleNameChange} />
              <Field label="Description" value={this.getDescription(land)} onChange={this.handleDescriptionChange} />
              <Row>
                <Link className="cancel" to={locations.landDetail(land.id)}>
                  <Button>{t('global.cancel')}</Button>
                </Link>
                <Button type="submit" primary disabled={isPristine || !this.getName(land) || land.role !== RoleType.OWNER}>
                  {t('global.submit')}
                </Button>
              </Row>
            </Form>
          </LandAction>
        )}
      </LandProviderPage>
    )
  }
}
