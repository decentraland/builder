import * as React from 'react'

import { Modal } from 'decentraland-dapps/dist/containers'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button, Center, Loader, Message, ModalActions, ModalContent, ModalNavigation, Table } from 'decentraland-ui'
import ItemImage from 'components/ItemImage'
import { formatBytes } from 'lib/number'
import { MAX_ITEMS } from 'modules/collection/constants'
import { getBodyShapes, toBodyShapeType } from 'modules/item/utils'
import { ApprovalFlowModalMetadata, ApprovalFlowModalView, Props, State } from './ApprovalFlowModal.types'
import './ApprovalFlowModal.css'

export default class ApprovalFlowModal extends React.PureComponent<Props> {
  state: State = {
    didRescue: false
  }

  handleConfirm = () => {
    const { metadata, onRescueItems } = this.props
    const { collection, items, contentHashes } = metadata as ApprovalFlowModalMetadata<ApprovalFlowModalView.RESCUE>
    this.setState({ didRescue: true })
    onRescueItems(collection, items, contentHashes)
  }

  renderHash(hash: string) {
    return hash.slice(0, 6) + '...' + hash.slice(-6)
  }

  renderLoadingView() {
    return (
      <>
        <ModalNavigation title={t('approval_flow.loading.title')} subtitle={t('approval_flow.loading.subtitle')} />
        <ModalContent className="loading">
          <Center>
            <Loader active size="huge" />
          </Center>
        </ModalContent>
      </>
    )
  }

  renderRescueView() {
    const { onClose, metadata, isConfirmingRescueTx } = this.props
    const { items, contentHashes } = metadata as ApprovalFlowModalMetadata<ApprovalFlowModalView.RESCUE>
    const { didRescue } = this.state

    return (
      <>
        <ModalNavigation title={t('approval_flow.rescue.title')} subtitle={t('approval_flow.rescue.subtitle')} onClose={onClose} />
        <ModalContent>
          {items.length > MAX_ITEMS ? (
            <Message
              warning
              size="tiny"
              visible
              content={t('approval_flow.rescue.items_exceed_limit.content')}
              header={t('approval_flow.rescue.items_exceed_limit.title')}
            />
          ) : null}
          <Table basic="very">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t('global.name')}</Table.HeaderCell>
                <Table.HeaderCell>{t('global.category')}</Table.HeaderCell>
                <Table.HeaderCell>{t('global.body_shape_plural')}</Table.HeaderCell>
                <Table.HeaderCell textAlign="right">{t('global.hash')}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {items.map((item, index) => (
                <Table.Row key={item.id} className="item">
                  <Table.Cell className="name">
                    <ItemImage item={item} />
                    {item.name}
                  </Table.Cell>
                  <Table.Cell>{t('wearable.category.' + item.data.category)}</Table.Cell>
                  <Table.Cell>
                    {getBodyShapes(item)
                      .map(bodyShape => t(`body_shapes.${toBodyShapeType(bodyShape)}`))
                      .join(', ')}
                  </Table.Cell>
                  <Table.Cell textAlign="right">{this.renderHash(contentHashes[index])}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </ModalContent>
        <ModalActions>
          <Button primary disabled={didRescue || isConfirmingRescueTx} loading={didRescue} onClick={this.handleConfirm}>
            {t('approval_flow.rescue.confirm')}
          </Button>
          <Button secondary onClick={onClose}>
            {t('global.cancel')}
          </Button>
        </ModalActions>
      </>
    )
  }

  renderDeployView() {
    const { onClose, metadata, onDeployItems, isDeployingItems } = this.props
    const { items, entities } = metadata as ApprovalFlowModalMetadata<ApprovalFlowModalView.DEPLOY>
    return (
      <>
        <ModalNavigation title={t('approval_flow.upload.title')} subtitle={t('approval_flow.upload.subtitle')} onClose={onClose} />
        <ModalContent>
          <Table basic="very">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t('global.name')}</Table.HeaderCell>
                <Table.HeaderCell textAlign="right">{t('global.size')}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {items.map((item, index) => (
                <Table.Row key={item.id} className="item">
                  <Table.Cell className="name">
                    <ItemImage item={item} />
                    {item.name}
                  </Table.Cell>
                  <Table.Cell textAlign="right">
                    {formatBytes(Array.from(entities[index].files.values()).reduce<number>((size, file) => size + file.content.length, 0))}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </ModalContent>
        <ModalActions>
          <Button primary disabled={isDeployingItems} loading={isDeployingItems} onClick={() => onDeployItems(entities)}>
            {t('approval_flow.upload.confirm')}
          </Button>
          <Button secondary onClick={onClose}>
            {t('global.cancel')}
          </Button>
        </ModalActions>
      </>
    )
  }

  renderApproveView() {
    const { onClose, metadata, onApproveCollection, isConfirmingApproveTx, isAwaitingApproveTx } = this.props
    const { collection } = metadata as ApprovalFlowModalMetadata<ApprovalFlowModalView.APPROVE>
    return (
      <>
        <ModalNavigation title={t('approval_flow.approve.title')} subtitle={t('approval_flow.approve.subtitle')} onClose={onClose} />
        <ModalActions>
          <Button
            primary
            disabled={isConfirmingApproveTx || isAwaitingApproveTx}
            loading={isAwaitingApproveTx}
            onClick={() => onApproveCollection(collection)}
          >
            {t('approval_flow.approve.confirm')}
          </Button>
          <Button secondary onClick={onClose}>
            {t('global.cancel')}
          </Button>
        </ModalActions>
      </>
    )
  }

  renderErrorView() {
    const { onClose, metadata } = this.props
    const { error } = metadata as ApprovalFlowModalMetadata<ApprovalFlowModalView.ERROR>
    return (
      <>
        <ModalNavigation title={t('approval_flow.error.title')} subtitle={t('approval_flow.error.subtitle')} onClose={onClose} />
        <ModalContent className="error">{error}</ModalContent>
        <ModalActions>
          <Button secondary onClick={onClose}>
            {t('global.close')}
          </Button>
        </ModalActions>
      </>
    )
  }

  renderSuccessView() {
    const { onClose } = this.props
    return (
      <>
        <ModalNavigation title={t('approval_flow.success.title')} subtitle={t('approval_flow.success.subtitle')} onClose={onClose} />
        <ModalActions>
          <Button secondary onClick={onClose}>
            {t('global.close')}
          </Button>
        </ModalActions>
      </>
    )
  }

  render() {
    const { name, onClose, metadata } = this.props
    const { view } = metadata as ApprovalFlowModalMetadata
    let content: React.ReactNode
    let size: string = 'small'
    switch (view) {
      case ApprovalFlowModalView.LOADING:
        content = this.renderLoadingView()
        size = 'tiny'
        break
      case ApprovalFlowModalView.RESCUE:
        content = this.renderRescueView()
        break
      case ApprovalFlowModalView.DEPLOY:
        content = this.renderDeployView()
        break
      case ApprovalFlowModalView.APPROVE:
        content = this.renderApproveView()
        size = 'tiny'
        break
      case ApprovalFlowModalView.ERROR:
        content = this.renderErrorView()
        break
      case ApprovalFlowModalView.SUCCESS:
        content = this.renderSuccessView()
        size = 'tiny'
        break
    }
    return (
      <Modal name={name} onClose={onClose} className="ApprovalFlowModal" size={size}>
        {content}
      </Modal>
    )
  }
}
