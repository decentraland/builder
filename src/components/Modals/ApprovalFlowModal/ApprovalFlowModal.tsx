import * as React from 'react'

import { Modal } from 'decentraland-dapps/dist/containers'
import { ApprovalFlowModalMetadata, ApprovalFlowModalView, Props } from './ApprovalFlowModal.types'

import './ApprovalFlowModal.css'
import { Button, ModalActions, ModalContent, ModalNavigation } from 'decentraland-ui'
import ItemImage from 'components/ItemImage'

export default class ApprovalFlowModal extends React.PureComponent<Props> {
  renderRescueView() {
    const { onClose, metadata, onRescueItems, isConfirmingRescueTx, isAwaitingRescueTx } = this.props
    const { items, contentHashes } = metadata as ApprovalFlowModalMetadata<ApprovalFlowModalView.RESCUE>
    return <>
      <ModalNavigation title={`Approve hashes`} subtitle={`Please confirm the following ${contentHashes.length} hashes`} onClose={onClose} />
      <ModalContent className="rescue">
        {items.map((item, index) => <div className="item">
          <div className="name"><ItemImage item={item} />{item.name}</div>:<div className="hash">{contentHashes[index]}</div></div>
        )}
      </ModalContent>
      <ModalActions>
        <Button primary disabled={isConfirmingRescueTx} loading={isAwaitingRescueTx} onClick={() => onRescueItems(items, contentHashes)}>Confirm</Button>
        <Button secondary onClick={onClose}>Cancel</Button>
      </ModalActions>
    </>
  }

  renderDeployView() {
    const { onClose, metadata, onDeployItems, isDeployingItems } = this.props
    const { entities } = metadata as ApprovalFlowModalMetadata<ApprovalFlowModalView.DEPLOY>
    return <>
      <ModalNavigation title={`Upload content`} subtitle={`Please upload the content for the following `} onClose={onClose} />
      <ModalContent className="rescue">
        {entities.map(entity =>
          <div className="entity">
            <div className="id">{entity.entityId}</div>:
            <div className="size">{Array.from(entity.files.values()).reduce<number>((size, file) => size + file.content.length, 0)} bytes</div>
          </div>
        )}
      </ModalContent>
      <ModalActions>
        <Button primary loading={isDeployingItems} onClick={() => onDeployItems(entities)}>Confirm</Button>
        <Button secondary onClick={onClose}>Cancel</Button>
      </ModalActions>
    </>
  }

  renderApproveView() {
    const { onClose, metadata, onApproveCollection, isConfirmingApproveTx, isAwaitingApproveTx } = this.props
    const { collection } = metadata as ApprovalFlowModalMetadata<ApprovalFlowModalView.APPROVE>
    return <>
      <ModalNavigation title={`Upload content`} subtitle={`Please upload the content for the following `} onClose={onClose} />
      <ModalContent className="rescue">
        This will enable the items in the collection <b>{collection.name}</b> to be minted
      </ModalContent>
      <ModalActions>
        <Button primary disabled={isConfirmingApproveTx} loading={isAwaitingApproveTx} onClick={() => onApproveCollection(collection)}>Confirm</Button>
        <Button secondary onClick={onClose}>Cancel</Button>
      </ModalActions>
    </>
  }

  renderErrorView() {
    const { onClose, metadata } = this.props
    const { error } = metadata as ApprovalFlowModalMetadata<ApprovalFlowModalView.ERROR>
    return <>
      <ModalNavigation title={`Error`} subtitle={`Something went wrong...`} onClose={onClose} />
      <ModalContent className="rescue">
        {error}
      </ModalContent>
      <ModalActions>
        <Button secondary onClick={onClose}>Close</Button>
      </ModalActions>
    </>
  }

  renderSuccessView() {
    const { onClose, metadata } = this.props
    const { collection } = metadata as ApprovalFlowModalMetadata<ApprovalFlowModalView.SUCCESS>
    return <>
      <ModalNavigation title={`Success`} onClose={onClose} />
      <ModalContent className="rescue">
        The collection {collection.name} is approved!
      </ModalContent>
      <ModalActions>
        <Button secondary onClick={onClose}>Close</Button>
      </ModalActions>
    </>
  }

  render() {
    const { name, onClose, metadata } = this.props
    const { view } = metadata as ApprovalFlowModalMetadata
    let content: React.ReactNode
    switch (view) {
      case ApprovalFlowModalView.RESCUE:
        content = this.renderRescueView();
      case ApprovalFlowModalView.DEPLOY:
        content = this.renderDeployView();
      case ApprovalFlowModalView.APPROVE:
        content = this.renderApproveView();
      case ApprovalFlowModalView.ERROR:
        content = this.renderErrorView()
      case ApprovalFlowModalView.SUCCESS:
        content = this.renderSuccessView()
    }
    return <Modal name={name} onClose={onClose} className="ApprovalModal">{content}</Modal>
  }
}