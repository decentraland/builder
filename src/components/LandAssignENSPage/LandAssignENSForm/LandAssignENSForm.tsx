import * as React from 'react'
import { Form, Row, Button, Icon } from 'decentraland-ui'
import { Network } from '@dcl/schemas'
import { NetworkButton } from 'decentraland-dapps/dist/containers'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { ENS_RESOLVER_ADDRESS } from 'modules/common/contracts'
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

  handleReclaim = () => {
    const { onReclaimName, ens } = this.props
    onReclaimName(ens)
  }

  handleSetContent = () => {
    const { onSetENSContent, ens, land } = this.props
    onSetENSContent(ens, land)
  }

  handleBack = () => {
    this.props.onBack()
  }

  render() {
    const { ens, land, isLoading, isWaitingTxSetContent, isWaitingTxSetResolver, isWaitingTxReclaim, error, isEnsAddressEnabled } =
      this.props

    const needsReclaiming = ens.ensOwnerAddress !== ens.nftOwnerAddress
    const hasResolver = !isResolverEmpty(ens) && ens.resolver.toLowerCase() === ENS_RESOLVER_ADDRESS.toLowerCase()
    const hasContent = !isContentEmpty(ens) && isEqualContent(ens, land)
    const hasData = hasResolver || hasContent

    const hasError = error && error.code === 4001
    const hasResolverError = hasError && error.origin === ENSOrigin.RESOLVER
    const hasContentError = hasError && error.origin === ENSOrigin.CONTENT
    // Set reclaim error
    const hasReclaimError = hasError

    const setResolverButtonClassName = hasResolver && !isWaitingTxSetResolver && !hasResolverError ? 'grey-button' : ''
    const setContentButtonClassName = hasContent && !isWaitingTxSetContent && !hasContentError ? 'grey-button' : ''
    const reclaimContentButtonClassName = !needsReclaiming && !isWaitingTxReclaim && !hasReclaimError ? 'grey-button' : ''

    const isReclaimButtonDisabled = hasReclaimError || !needsReclaiming
    const isSetResolverButtonDisabled = hasResolverError || hasData || needsReclaiming || isWaitingTxSetResolver || isWaitingTxReclaim
    const isSetContentButtonDisabled =
      hasContentError ||
      hasResolverError ||
      hasReclaimError ||
      !hasResolver ||
      needsReclaiming ||
      hasContent ||
      isWaitingTxSetResolver ||
      isWaitingTxSetContent ||
      isWaitingTxReclaim

    return (
      <Form className="LandAssignENSForm">
        <Row>
          <p className="message">
            {t('land_assign_ens_page.set_name_message', { strong: (children: React.ReactElement) => <strong>{children}</strong> })}
          </p>
        </Row>
        {!isEnsAddressEnabled ? (
          <Row>
            <div className={isReclaimButtonDisabled ? 'box box-disabled' : 'box'}>
              <h3>{t('land_assign_ens_page.reclaim')}</h3>
              <div className="message-box">
                <p>{t('land_assign_ens_page.reclaim_explanation')}</p>
                <NetworkButton
                  type="submit"
                  disabled={isReclaimButtonDisabled}
                  onClick={this.handleReclaim}
                  className={reclaimContentButtonClassName}
                  loading={isWaitingTxReclaim}
                  primary
                  network={Network.ETHEREUM}
                >
                  {hasReclaimError ? (
                    t('global.retry_tx')
                  ) : !needsReclaiming ? (
                    <>
                      {t('global.approved_tx')}
                      {!isWaitingTxReclaim ? <Icon name="check" /> : null}
                    </>
                  ) : (
                    t('global.submit')
                  )}
                </NetworkButton>
              </div>
            </div>
          </Row>
        ) : null}
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
