import * as React from 'react'

import { Modal } from 'decentraland-dapps/dist/containers'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button, Center, Loader, ModalActions, ModalContent, ModalNavigation } from 'decentraland-ui'

import ItemImage from 'components/ItemImage'
import { ApprovalFlowModalMetadata, ApprovalFlowModalView, Props, State } from './ApprovalFlowModal.types'
import './ApprovalFlowModal.css'

export default class ApprovalFlowModal extends React.PureComponent<Props> {

  state: State = {
    didRescue: false,
  }

  renderHash(hash: string) {
    return hash.slice(0, 6) + '...' + hash.slice(-6)
  }

  renderLoadingView() {
    return <>
      <ModalNavigation title={t('approval_flow.loading.title')} subtitle={t('approval_flow.loading.subtitle')} />
      <ModalContent className="loading">
        <Center>
          <Loader active size="huge" />
        </Center>
      </ModalContent>
    </>
  }

  renderRescueView() {
    const { onClose, metadata, onRescueItems, isConfirmingRescueTx } = this.props
    const { collection, items, contentHashes } = metadata as ApprovalFlowModalMetadata<ApprovalFlowModalView.RESCUE>
    const { didRescue } = this.state
    const onConfirm = () => {
      this.setState({ didRescue: true })
      onRescueItems(collection, items, contentHashes)
    }
    return <>
      <ModalNavigation title={t('approval_flow.rescue.title')} subtitle={t('approval_flow.rescue.subtitle')} onClose={onClose} />
      <ModalContent className="rescue">
        {items.map((item, index) => (
          <div className="item" key={item.id}>
            <div className="name"><ItemImage item={item} />{item.name}</div>
            <div className="hash" title={contentHashes[index]}>{this.renderHash(contentHashes[index])}</div>
          </div>
        ))}
      </ModalContent>
      <ModalActions>
        <Button primary disabled={didRescue || isConfirmingRescueTx} loading={didRescue} onClick={onConfirm}>{t('approval_flow.rescue.confirm')}</Button>
        <Button secondary onClick={onClose}>{t('global.cancel')}</Button>
      </ModalActions>
    </>
  }

  renderDeployView() {
    const { onClose, metadata, onDeployItems, isDeployingItems } = this.props
    const { items, entities } = metadata as ApprovalFlowModalMetadata<ApprovalFlowModalView.DEPLOY>
    return <>
      <ModalNavigation title={t('approval_flow.upload.title')} subtitle={t('approval_flow.upload.subtitle')} onClose={onClose} />
      <ModalContent className="deploy">
        {items.map((item, index) =>
          <div className="item" key={item.id}>
            <div className="name"><ItemImage item={item} />{item.name}</div>
            <div className="size">
              {Array.from(
                entities[index].files.values()
              ).reduce<number>((size, file) => size + file.content.length, 0)
                .toLocaleString()} bytes</div>
          </div>
        )}
      </ModalContent>
      <ModalActions>
        <Button primary disabled={isDeployingItems} loading={isDeployingItems} onClick={() => onDeployItems(entities)}>{t('approval_flow.upload.confirm')}</Button>
        <Button secondary onClick={onClose}>{t('global.cancel')}</Button>
      </ModalActions>
    </>
  }

  renderApproveView() {
    const { onClose, metadata, onApproveCollection, isConfirmingApproveTx, isAwaitingApproveTx } = this.props
    const { collection } = metadata as ApprovalFlowModalMetadata<ApprovalFlowModalView.APPROVE>
    return <>
      <ModalNavigation title={t('approval_flow.approve.title')} subtitle={t('approval_flow.approve.subtitle')} onClose={onClose} />
      <ModalActions>
        <Button primary disabled={isConfirmingApproveTx || isAwaitingApproveTx} loading={isAwaitingApproveTx} onClick={() => onApproveCollection(collection)}>{t('approval_flow.approve.confirm')}</Button>
        <Button secondary onClick={onClose}>{t('global.cancel')}</Button>
      </ModalActions>
    </>
  }

  renderErrorView() {
    const { onClose, metadata } = this.props
    const { error } = metadata as ApprovalFlowModalMetadata<ApprovalFlowModalView.ERROR>
    return <>
      <ModalNavigation title={t('approval_flow.error.title')} subtitle={t('approval_flow.error.subtitle')} onClose={onClose} />
      <ModalContent className="error">
        {error}
      </ModalContent>
      <ModalActions>
        <Button secondary onClick={onClose}>{t('global.close')}</Button>
      </ModalActions>
    </>
  }

  renderSuccessView() {
    const { onClose } = this.props
    return <>
      <ModalNavigation title={t('approval_flow.success.title')} subtitle={t('approval_flow.success.subtitle')} onClose={onClose} />
      <ModalActions>
        <Button secondary onClick={onClose}>{t('global.close')}</Button>
      </ModalActions>
    </>
  }

  render() {
    const { name, onClose, metadata } = this.props
    const { view } = metadata as ApprovalFlowModalMetadata
    let content: React.ReactNode
    let size: string = "small"
    switch (view) {
      case ApprovalFlowModalView.LOADING:
        content = this.renderLoadingView();
        size = "tiny"
        break
      case ApprovalFlowModalView.RESCUE:
        content = this.renderRescueView();
        break
      case ApprovalFlowModalView.DEPLOY:
        content = this.renderDeployView();
        break
      case ApprovalFlowModalView.APPROVE:
        content = this.renderApproveView();
        size = "tiny"
        break
      case ApprovalFlowModalView.ERROR:
        content = this.renderErrorView()
        break
      case ApprovalFlowModalView.SUCCESS:
        content = this.renderSuccessView()
        size = "tiny"
        break
    }
    return <Modal name={name} onClose={onClose} className="ApprovalFlowModal" size={size}>{content}</Modal>
  }
}