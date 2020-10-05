import * as React from 'react'
import { Form, Row, Button, Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { Props, State } from './LandSetNameForm.types'
import './LandSetNameForm.css'

export default class LandSetNameForm extends React.PureComponent<Props, State> {
  state: State = {
    isSetResolverDone: false,
    isSetContentDone: false,
    isSetResolverDisabled: false,
    isSetContentDisabled: true
  }

  handleSetResolver = () => {
    const { onSetENSResolver, land, selectedName } = this.props
    onSetENSResolver(selectedName, land)
    this.setState({isSetResolverDone: true, isSetResolverDisabled: true, isSetContentDisabled: false})
  }
  
  handleSetContent = () => {
    const { onSetENSContent, land, selectedName } = this.props
    onSetENSContent(selectedName, land)
    this.setState({isSetContentDone: true, isSetResolverDisabled: true, isSetContentDisabled: true})
  }
 
  handleBack = () => {
    this.props.onRestartForm()
  }

  handleFinish = () => {
    const { land } = this.props
    locations.landDetail(land.id)
  }

  render() {
    const { isLoading } = this.props
    const { isSetContentDisabled, isSetResolverDisabled, isSetContentDone, isSetResolverDone } = this.state
    const isSubmitDisabled = !(isSetContentDisabled && isSetResolverDisabled) 
 
    if ( isLoading) {
      return <Row><Loader size="large" active /></Row>
    }

    return (
      <Form className="LandSetNameForm">
        <Row>
          <p className="message"> {t('land_ens_page.set_name_message')}</p>
        </Row>
        <Row>
          <div className="box">
            <h3>{t('land_ens_page.set_resolver')}</h3>
            <p>{t('land_ens_page.set_resolver_explanation')}</p>
            <Button 
              type="submit"
              disabled={isSetResolverDisabled}
              onClick={this.handleSetResolver}
              className={isSetResolverDone ? 'grey-button' : ''}
              primary
            >
              {isSetResolverDone? t('global.approved_tx') : t('global.send_tx')}
            </Button>
          </div>
        </Row>
        <Row>
          <div className="box">
            <h3>{t('land_ens_page.set_content')}</h3>
            <p>{t('land_ens_page.set_content_explanation')}</p>
            <Button
              type="submit"
              disabled={isSetContentDisabled}
              onClick={this.handleSetContent}
              className={isSetContentDone ? 'grey-button' : ''}
              primary 
            > 
              {isSetContentDone? t('global.approved_tx') : t('global.send_tx')}
            </Button>
          </div>
        </Row>
        <Row className="confirmationButtons">
          <Button onClick={this.handleBack}>
            { t('global.back') }
          </Button>
          <Button type="submit" disabled={isSubmitDisabled} primary onClick={this.handleFinish}> 
            { t('global.finish') }
          </Button>
        </Row>
      </Form>
    )
  }
}
