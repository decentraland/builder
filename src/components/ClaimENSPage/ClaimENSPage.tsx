import * as React from 'react'
import { Row, Column, Section, Narrow, InputOnChangeData, Header, Form, Field, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import Back from 'components/Back'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import { MAX_NAME_SIZE, isNameValid } from 'modules/ens/utils'
import { Props, State } from './ClaimENSPage.types'
import './ClaimENSPage.css'

export default class ClaimENSPage extends React.PureComponent<Props, State> {
  state: State = {
    name: ''
  }

  handleClaim = () => {
    console.log('claim', this.state.name)
  }

  handleNameChange = (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    this.setState({ name: data.value })
  }

  handleOnAction = () => {}

  handleBack = () => {
    this.props.onNavigate(locations.root())
  }

  render() {
    const { onBack } = this.props
    const { name } = this.state
    const isValid = isNameValid(name)

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
                  Claim a Name
                </Header>
                <span className="subtitle">
                  You can claim names and assign them to Profiles or Land, and they can also be used as a quick link to access the world.
                  Learn more
                </span>
              </Section>
              <Form onSubmit={this.handleClaim}>
                <Field
                  label="Name"
                  value={name}
                  message="Names cannot contain non-alphanumeric characters or spaces."
                  action={`${name.length}/${MAX_NAME_SIZE}`}
                  error={name.length > 1 && !isValid}
                  onChange={this.handleNameChange}
                  onAction={this.handleOnAction}
                />
                <Row className="actions">
                  <Button className="cancel" onClick={onBack}>
                    {t('global.cancel')}
                  </Button>
                  <Button type="submit" primary disabled={!isValid}>
                    {t('global.submit')}
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
