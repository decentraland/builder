import * as React from 'react'
import { Form, Row, Button, Icon } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { isResolverEmpty, isContentEmpty } from 'modules/ens/utils'
import { ENSOrigin } from 'modules/ens/types'
import { Props } from './LandSetNameForm.types'
import './LandSetNameForm.css'

export default class LandSetNameForm extends React.PureComponent<Props> {
  handleNavigateToLand = () => {
    const { land, onNavigate } = this.props
    onNavigate(locations.landDetail(land.id))
  }

  handleSetResolver = () => {
    const { onSetENSResolver, selectedSubdomain } = this.props
    onSetENSResolver(selectedSubdomain)
  }

  handleSetContent = () => {
    const { onSetENSContent, land, selectedSubdomain } = this.props
    onSetENSContent(selectedSubdomain, land)
  }

  handleBack = () => {
    this.props.onRestartForm()
  }

  render() {
    const { ens, isLoading, isWaitingTxSetContent, isWaitingTxSetResolver, error } = this.props

    const hasResolver = !isResolverEmpty(ens)
    const hasContent = !isContentEmpty(ens)
    const hasData = hasResolver || hasContent

    const hasError = error && error.code === 4001
    const hasResolverError = hasError && error!.origin === ENSOrigin.RESOLVER
    const hasContentError = hasError && error!.origin === ENSOrigin.CONTENT

    const setResolverButtonClassName = hasResolver && !isWaitingTxSetResolver && !hasResolverError ? 'grey-button' : ''
    const setContentButtonClassName = hasContent && !isWaitingTxSetContent && !hasContentError ? 'grey-button' : ''

    const isSetResolverButtonDisabled = hasResolverError ? false : hasData || isWaitingTxSetResolver
    const isSetContentButtonDisabled = hasContentError ? false : hasResolverError || !hasResolver || hasContent || isWaitingTxSetContent

    return (
      <Form className="LandSetNameForm">
        <Row>
          <p className="message">{t('land_ens_page.set_name_message')}</p>
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
                loading={isWaitingTxSetResolver}
                primary
              >
                {hasResolverError ? (
                  t('global.retry_tx')
                ) : hasResolver ? (
                  <>
                    {t('global.approved_tx')}
                    {!isWaitingTxSetResolver ? <Icon name="check" /> : null}
                  </>
                ) : (
                  t('global.send_tx')
                )}
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
                loading={isWaitingTxSetContent}
                primary
              >
                {hasContentError ? (
                  t('global.retry_tx')
                ) : hasContent ? (
                  <>
                    {t('global.approved_tx')}
                    {!isWaitingTxSetContent ? <Icon name="check" /> : null}
                  </>
                ) : (
                  t('global.send_tx')
                )}
              </Button>
            </div>
          </div>
        </Row>
        <Row className="confirmationButtons">
          <Button onClick={this.handleBack}>{t('global.back')}</Button>
          <Button
            disabled={!hasResolver || !hasContent || isLoading || isWaitingTxSetContent || isWaitingTxSetResolver}
            onClick={this.handleNavigateToLand}
            primary
          >
            {t('global.finish')}
          </Button>
        </Row>
      </Form>
    )
  }
}
