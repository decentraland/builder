import * as React from 'react'
import { Form, Row, Button, Icon } from 'decentraland-ui'
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
  componentDidMount() {
    const { ens, selectedName, isWaitingTxSetResolver, isWaitingTxSetContent } = this.props
    const { type } = ens.data[selectedName]
    if (isWaitingTxSetResolver) {
      this.setState({ isSetResolverDone: true })
    }

    if (type && ['DifferentContent', 'EmptyContent'].includes(type)) {
      this.setState({
        isSetResolverDone: true,
        isSetResolverDisabled: true,
        isSetContentDisabled: false
      })
    }
    if (isWaitingTxSetContent) {
      this.setState({
        isSetResolverDone: true,
        isSetContentDone: true,
        isSetResolverDisabled: true,
        isSetContentDisabled: true
      })
    }
  }

  handleSetResolver = () => {
    const { onSetENSResolver, land, selectedName } = this.props
    onSetENSResolver(selectedName, land)
    this.setState({
      isSetResolverDone: true,
      isSetResolverDisabled: true,
      isSetContentDisabled: false
    })
  }

  handleSetContent = () => {
    const { onSetENSContent, land, selectedName } = this.props
    onSetENSContent(selectedName, land)
    this.setState({
      isSetContentDone: true,
      isSetResolverDisabled: true,
      isSetContentDisabled: true
    })
  }

  handleBack = () => {
    this.props.onRestartForm()
  }

  isAnythingLoading() {
    const { isLoading, isWaitingTxSetResolver, isWaitingTxSetContent } = this.props
    return isLoading || isWaitingTxSetContent || isWaitingTxSetResolver
  }

  render() {
    const { isLoading, isWaitingTxSetContent, isWaitingTxSetResolver, land, error, onNavigate } = this.props
    const { isSetContentDisabled, isSetResolverDisabled, isSetContentDone, isSetResolverDone } = this.state

    const isSubmitDisabled = !(isSetContentDisabled && isSetResolverDisabled) || this.isAnythingLoading()
    const isBackDisabled = isSetResolverDone || isSetContentDone
    const isResolverLoading = (isLoading && isSetResolverDone && !isSetContentDone) || isWaitingTxSetResolver
    const isContentLoading = (isLoading && isSetResolverDone && isSetContentDone) || isWaitingTxSetContent

    let buttonSetResolver = (
      <>
        {isSetResolverDone ? t('global.approved_tx') : t('global.send_tx')}
        {!(isResolverLoading && (isLoading || isWaitingTxSetResolver)) && isSetResolverDone && <Icon name="check" />}
      </>
    )
    let buttonSetContent = (
      <>
        {isSetContentDone ? t('global.approved_tx') : t('global.send_tx')}
        {!isContentLoading && isSetContentDone && <Icon name="check" />}
      </>
    )
    let setResolverButtonClassName = (isSetResolverDone && !(isLoading || isWaitingTxSetResolver)) || isSetContentDone ? 'grey-button' : ''
    let setContentButtonClassName = isSetContentDone && !(isLoading || isWaitingTxSetContent) ? 'grey-button' : ''
    let isSetResolverButtonDisabled = isSetResolverDisabled || this.isAnythingLoading()
    let isSetContentButtonDisabled = isSetContentDisabled || this.isAnythingLoading()
    if (error && error.code === 4001) {
      if (error.origin === 'SET_ENS_RESOLVER') {
        buttonSetResolver = <> {t('global.retry_tx')} </>
        isSetResolverButtonDisabled = false
        isSetContentButtonDisabled = true
        setResolverButtonClassName = ''
      } else if (error.origin === 'SET_ENS_CONTENT') {
        buttonSetContent = <> {t('global.retry_tx')} </>
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
          <div className={isSetResolverButtonDisabled ? 'box boxDisabled' : 'box'}>
            <h3>{t('land_ens_page.set_resolver')}</h3>
            <div className="messageBox">
              <p>{t('land_ens_page.set_resolver_explanation')}</p>
              <Button
                type="submit"
                disabled={isSetResolverButtonDisabled}
                onClick={this.handleSetResolver}
                className={setResolverButtonClassName}
                loading={isResolverLoading}
                primary
              >
                {buttonSetResolver}
              </Button>
            </div>
          </div>
        </Row>
        <Row>
          <div className={isSetContentButtonDisabled ? 'box boxDisabled' : 'box'}>
            <h3>{t('land_ens_page.set_content')}</h3>
            <div className="messageBox">
              <p>{t('land_ens_page.set_content_explanation')}</p>
              <Button
                type="submit"
                disabled={isSetContentButtonDisabled}
                onClick={this.handleSetContent}
                className={setContentButtonClassName}
                loading={isContentLoading}
                primary
              >
                {buttonSetContent}
              </Button>
            </div>
          </div>
        </Row>
        <Row className="confirmationButtons">
          <Button onClick={this.handleBack} disabled={isBackDisabled}>
            {t('global.back')}
          </Button>
          <Button disabled={isSubmitDisabled || isLoading} onClick={() => onNavigate(locations.landDetail(land.id))} primary>
            {t('global.finish')}
          </Button>
        </Row>
      </Form>
    )
  }
}
