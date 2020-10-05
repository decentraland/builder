import * as React from 'react'
import { Form, Row, Button, Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { Props, State } from './LandSetNameForm.types'
import './LandSetNameForm.css'
import {Link} from 'react-router-dom';

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

  render() {
    const { isLoading, isWaitingConfirmationTx, land } = this.props
    const { isSetContentDisabled, isSetResolverDisabled, isSetContentDone, isSetResolverDone } = this.state
    const isSubmitDisabled = !(isSetContentDisabled && isSetResolverDisabled) 
 
    if (isLoading) {
      return (
        <Row className="centered">
          <Loader size="large" active />
          <p> {t('land_ens_page.loading')} </p>
        </Row>
      )
    }

    if (isWaitingConfirmationTx) {
      return (
        <Row className="centered">
          <Loader size="large" active />
          <p> {t('land_ens_page.waiting_confirmation_tx')} </p>
        </Row>
      )
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
          <Button onClick={this.handleBack} disabled={!isSubmitDisabled}>
            { t('global.back') }
          </Button>
          <Link className="cancel" to={locations.landDetail(land.id)}>
            <Button disabled={isSubmitDisabled} primary> 
              { t('global.finish') }
            </Button>
          </Link>
        </Row>
      </Form>
    )
  }
}
