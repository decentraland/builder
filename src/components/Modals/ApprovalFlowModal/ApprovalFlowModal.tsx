import * as React from 'react'

import { sleep } from 'decentraland-commons/dist/utils'
import { Modal } from 'decentraland-dapps/dist/containers'
import { Button, Center, Loader, ModalActions, ModalContent, ModalNavigation } from 'decentraland-ui'

import ItemImage from 'components/ItemImage'
import { ApprovalFlowModalMetadata, ApprovalFlowModalView, Props, State } from './ApprovalFlowModal.types'
import './ApprovalFlowModal.css'

export default class ApprovalFlowModal extends React.PureComponent<Props> {

  state: State = {
    isWaitingForSubgraph: false
  }

  mounted = false

  componentDidMount() {
    this.mounted = true
  }

  componentWillUnmount() {
    this.mounted = false
  }

  renderHash(hash: string) {
    return hash.slice(0, 6) + '...' + hash.slice(-6)
  }

  renderLoadingView() {
    const { metadata } = this.props
    const { collection } = metadata as ApprovalFlowModalMetadata<ApprovalFlowModalView.LOADING>
    return <>
      <ModalNavigation title={`Loading...`} subtitle={`Preparing collection ${collection.name} for review`} />
      <ModalContent className="loading">
        <Center>
          <Loader active />
        </Center>
      </ModalContent>
    </>
  }

  renderRescueView() {
    const { onClose, metadata, onRescueItems, isConfirmingRescueTx, isAwaitingRescueTx } = this.props
    const { collection, items, contentHashes } = metadata as ApprovalFlowModalMetadata<ApprovalFlowModalView.RESCUE>
    return <>
      <ModalNavigation title={`Approve hashes`} subtitle={`Please confirm the following ${contentHashes.length} hashes`} onClose={onClose} />
      <ModalContent className="rescue">
        {items.map((item, index) => (
          <div className="item" key={item.id}>
            <div className="name"><ItemImage item={item} />{item.name}</div>
            <div className="hash" title={contentHashes[index]}>{this.renderHash(contentHashes[index])}</div>
          </div>
        ))}
      </ModalContent>
      <ModalActions>
        <Button primary disabled={isConfirmingRescueTx || isAwaitingRescueTx} loading={isAwaitingRescueTx} onClick={() => onRescueItems(collection, items, contentHashes)}>Confirm</Button>
        <Button secondary onClick={onClose}>Cancel</Button>
      </ModalActions>
    </>
  }

  renderDeployView() {
    const { onClose, metadata, onDeployItems, isDeployingItems } = this.props
    const { items, entities, didRescue } = metadata as ApprovalFlowModalMetadata<ApprovalFlowModalView.DEPLOY>
    const { isWaitingForSubgraph } = this.state
    const onConfirm = async () => {
      if (didRescue) {
        this.setState({ isWaitingForSubgraph: true })
        await sleep(5000) // give some leeway to the subgraph to index after a rescue
        if (!this.mounted) return
      }
      onDeployItems(entities)
      this.setState({ isWaitingForSubgraph: false })
    }
    const isLoading = isDeployingItems || isWaitingForSubgraph
    return <>
      <ModalNavigation title={`Upload content`} subtitle={`Please upload the content for the following `} onClose={onClose} />
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
        <Button primary disabled={isLoading} loading={isLoading} onClick={onConfirm}>Confirm</Button>
        <Button secondary onClick={onClose}>Cancel</Button>
      </ModalActions>
    </>
  }

  renderApproveView() {
    const { onClose, metadata, onApproveCollection, isConfirmingApproveTx, isAwaitingApproveTx } = this.props
    const { collection } = metadata as ApprovalFlowModalMetadata<ApprovalFlowModalView.APPROVE>
    return <>
      <ModalNavigation title={`Approve collection`} subtitle={`Please approve the collection`} onClose={onClose} />
      <ModalContent className="approve">
        This will enable the items in the collection <b>{collection.name}</b> to be minted
      </ModalContent>
      <ModalActions>
        <Button primary disabled={isConfirmingApproveTx || isAwaitingApproveTx} loading={isAwaitingApproveTx} onClick={() => onApproveCollection(collection)}>Confirm</Button>
        <Button secondary onClick={onClose}>Cancel</Button>
      </ModalActions>
    </>
  }

  renderErrorView() {
    const { onClose, metadata } = this.props
    const { error } = metadata as ApprovalFlowModalMetadata<ApprovalFlowModalView.ERROR>
    return <>
      <ModalNavigation title={`Error`} subtitle={`Something went wrong...`} onClose={onClose} />
      <ModalContent className="error">
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
      <ModalContent className="success">
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
      case ApprovalFlowModalView.LOADING:
        content = this.renderLoadingView();
        break
      case ApprovalFlowModalView.RESCUE:
        content = this.renderRescueView();
        break
      case ApprovalFlowModalView.DEPLOY:
        content = this.renderDeployView();
        break
      case ApprovalFlowModalView.APPROVE:
        content = this.renderApproveView();
        break
      case ApprovalFlowModalView.ERROR:
        content = this.renderErrorView()
        break
      case ApprovalFlowModalView.SUCCESS:
        content = this.renderSuccessView()
        break
    }
    return <Modal name={name} onClose={onClose} className="ApprovalFlowModal">{content}</Modal>
  }
}