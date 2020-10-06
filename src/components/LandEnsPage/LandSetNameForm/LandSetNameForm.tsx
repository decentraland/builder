import * as React from 'react'
import { Form, Row, Button } from 'decentraland-ui'
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
    isSetContentDisabled: true,
    isResolverLoading: false,
    isContentLoading: false
  }

  handleSetResolver = () => {
    const { onSetENSResolver, land, selectedName } = this.props
    onSetENSResolver(selectedName, land)
    this.setState({
      isSetResolverDone: true,
      isSetResolverDisabled: true,
      isSetContentDisabled: false,
      isResolverLoading: true,
      isContentLoading: false
    })
  }
  
  handleSetContent = () => {
    const { onSetENSContent, land, selectedName } = this.props
    onSetENSContent(selectedName, land)
    this.setState({
      isSetContentDone: true,
      isSetResolverDisabled: true,
      isSetContentDisabled: true,
      isContentLoading: true,
      isResolverLoading: false
    })
  }
 
  handleBack = () => {
    this.props.onRestartForm()
  }

  render() {
    const { isLoading, isWaitingConfirmationTx, land, error } = this.props
    const { 
      isSetContentDisabled,
      isSetResolverDisabled,
      isSetContentDone,
      isSetResolverDone,
      isContentLoading,
      isResolverLoading
    } = this.state
    const isSubmitDisabled = !(isSetContentDisabled && isSetResolverDisabled) || isLoading ||isWaitingConfirmationTx 
    const isBackDisabled = isSetResolverDone || isSetContentDone
 
    let buttonSetResolver = isSetResolverDone? t('global.approved_tx'): t('global.send_tx');
    let buttonSetContent = isSetContentDone? t('global.approved_tx'): t('global.send_tx');
    let setResolverButtonClassName = isSetResolverDone ? 'grey-button': ''
    let setContentButtonClassName = isSetContentDone ? 'grey-button': ''
    let isSetContentButtonDisabled = isSetContentDisabled
    let isSetResolverButtonDisabled = isSetResolverDisabled
    if (error && error.code === 4001) {
      if (error.origin === 'SET_ENS_RESOLVER') {
        buttonSetResolver = 'Retry TX'
        isSetResolverButtonDisabled = false
        setResolverButtonClassName = ''
      } else if (error.origin === 'SET_ENS_CONTENT') {
        buttonSetContent = 'Retry TX'
        isSetContentButtonDisabled = false
        setContentButtonClassName = ''
      }
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
              disabled={isSetResolverButtonDisabled}
              onClick={this.handleSetResolver}
              className={setResolverButtonClassName}
              loading={isResolverLoading && (isLoading || isWaitingConfirmationTx)}
              primary
            >
              {buttonSetResolver}
            </Button>
          </div>
        </Row>
        <Row>
          <div className="box">
            <h3>{t('land_ens_page.set_content')}</h3>
            <p>{t('land_ens_page.set_content_explanation')}</p>
            <Button
              type="submit"
              disabled={isSetContentButtonDisabled}
              onClick={this.handleSetContent}
              className={setContentButtonClassName}
              loading={isContentLoading && (isLoading || isWaitingConfirmationTx)}
              primary 
            > 
              {buttonSetContent}
            </Button>
          </div>
        </Row>
        <Row className="confirmationButtons">
          <Button onClick={this.handleBack} disabled={isBackDisabled}>
            { t('global.back') }
          </Button>
          <Link className="cancel" to={locations.landDetail(land.id)}>
            <Button disabled={isSubmitDisabled || isLoading} primary> 
              { t('global.finish') }
            </Button>
          </Link>
        </Row>
      </Form>
    )
  }
}
