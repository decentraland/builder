import * as React from 'react'
import { Form, Row, Button, Icon } from 'decentraland-ui'
import { Network } from '@dcl/schemas'
import { NetworkButton } from 'decentraland-dapps/dist/containers'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { isResolverEmpty, isContentEmpty, isEqualContent } from 'modules/ens/utils'
import { ENSOrigin } from 'modules/ens/types'
import { Props } from './LandAssignENSForm.types'
import './LandAssignENSForm.css'

export default class LandAssignENSForm extends React.PureComponent<Props> {
  handleFinish = () => {
    const { onNavigate } = this.props
    onNavigate(locations.ens())
  }

  handleSetResolver = () => {
    const { onSetENSResolver, ens } = this.props
    onSetENSResolver(ens)
  }

  handleSetContent = () => {
    const { onSetENSContent, ens, land } = this.props
    onSetENSContent(ens, land)
  }

  handleBack = () => {
    this.props.onBack()
  }

  render() {
    const { ens, land, isLoading, isWaitingTxSetContent, isWaitingTxSetResolver, error } = this.props

    const hasResolver = !isResolverEmpty(ens)
    const hasContent = !isContentEmpty(ens) && isEqualContent(ens, land)
    const hasData = hasResolver || hasContent

    const hasError = error && error.code === 4001
    const hasResolverError = hasError && error!.origin === ENSOrigin.RESOLVER
    const hasContentError = hasError && error!.origin === ENSOrigin.CONTENT

    const setResolverButtonClassName = hasResolver && !isWaitingTxSetResolver && !hasResolverError ? 'grey-button' : ''
    const setContentButtonClassName = hasContent && !isWaitingTxSetContent && !hasContentError ? 'grey-button' : ''

    const isSetResolverButtonDisabled = hasResolverError ? false : hasData || isWaitingTxSetResolver
    const isSetContentButtonDisabled = hasContentError ? false : hasResolverError || !hasResolver || hasContent || isWaitingTxSetContent

    return (
      <Form className="LandAssignENSForm">
        <Row>
          <p className="message">{t('land_assign_ens_page.set_name_message')}</p>
        </Row>
        <Row>
          <div className={isSetResolverButtonDisabled ? 'box box-disabled' : 'box'}>
            <h3>{t('land_assign_ens_page.set_resolver')}</h3>
            <div className="message-box">
              <p>{t('land_assign_ens_page.set_resolver_explanation')}</p>
              <NetworkButton
                type="submit"
                disabled={isSetResolverButtonDisabled}
                onClick={this.handleSetResolver}
                className={setResolverButtonClassName}
                loading={isWaitingTxSetResolver}
                primary
                network={Network.ETHEREUM}
              >
                {hasResolverError ? (
                  t('global.retry_tx')
                ) : hasResolver ? (
                  <>
                    {t('global.approved_tx')}
                    {!isWaitingTxSetResolver ? <Icon name="check" /> : null}
                  </>
                ) : (
                  t('global.submit')
                )}
              </NetworkButton>
            </div>
          </div>
        </Row>
        <Row>
          <div className={isSetContentButtonDisabled ? 'box box-disabled' : 'box'}>
            <h3>{t('land_assign_ens_page.set_content')}</h3>
            <div className="message-box">
              <p>{t('land_assign_ens_page.set_content_explanation')}</p>
              <NetworkButton
                type="submit"
                disabled={isSetContentButtonDisabled}
                onClick={this.handleSetContent}
                className={setContentButtonClassName}
                loading={isWaitingTxSetContent}
                primary
                network={Network.ETHEREUM}
              >
                {hasContentError ? (
                  t('global.retry_tx')
                ) : hasContent ? (
                  <>
                    {t('global.approved_tx')}
                    {!isWaitingTxSetContent ? <Icon name="check" /> : null}
                  </>
                ) : (
                  t('global.submit')
                )}
              </NetworkButton>
            </div>
          </div>
        </Row>
        <Row className="confirmation-buttons">
          <Button onClick={this.handleBack} disabled={hasData}>
            {t('global.back')}
          </Button>
          <Button
            disabled={!hasResolver || !hasContent || isLoading || isWaitingTxSetContent || isWaitingTxSetResolver}
            onClick={this.handleFinish}
            primary
          >
            {t('global.finish')}
          </Button>
        </Row>
      </Form>
    )
  }
}
