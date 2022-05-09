import * as React from 'react'
import uuid from 'uuid'
import { FileTooBigError, ItemFactory, loadFile, MAX_FILE_SIZE, Rarity, THUMBNAIL_PATH } from '@dcl/builder-client'
import Dropzone, { DropzoneState } from 'react-dropzone'
import { env } from 'decentraland-commons'
import { Button, Icon, Message, ModalNavigation, Progress, Table } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { omit } from 'decentraland-commons/dist/utils'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { EngineType, getModelData } from 'lib/getModelData'
import { getExtension } from 'lib/file'
import { buildThirdPartyURN, DecodedURN, decodeURN, URNType } from 'lib/urn'
import { dataURLToBlob } from 'modules/media/utils'
import { MultipleItemsSaveState } from 'modules/ui/createMultipleItems/reducer'
import { BuiltFile, IMAGE_PATH } from 'modules/item/types'
import { generateCatalystImage } from 'modules/item/utils'
import ItemImport from 'components/ItemImport'
import { InfoIcon } from 'components/InfoIcon'
import {
  CreateOrEditMultipleItemsModalType,
  ImportedFile,
  ImportedFileType,
  ItemCreationView,
  Props,
  RejectedFile,
  State
} from './CreateAndEditMultipleItemsModal.types'
import styles from './CreateAndEditMultipleItemsModal.module.css'

const REACT_APP_WEARABLES_ZIP_INFRA_URL = env.get('REACT_APP_WEARABLES_ZIP_INFRA_URL', '')
export default class CreateAndEditMultipleItemsModal extends React.PureComponent<Props, State> {
  state = {
    view: ItemCreationView.IMPORT,
    loadingFilesProgress: 0,
    importedFiles: {} as Record<string, ImportedFile<Blob>>
  }

  private isViewClosable = (): boolean => {
    const { view } = this.state
    return view === ItemCreationView.IMPORTING || view === ItemCreationView.COMPLETED
  }

  private getValidFiles = (): BuiltFile<Blob>[] => {
    const { importedFiles } = this.state
    return Object.values(importedFiles).filter(file => file.type === ImportedFileType.ACCEPTED) as BuiltFile<Blob>[]
  }

  private getRejectedFiles = (): RejectedFile[] => {
    const { importedFiles } = this.state
    return Object.values(importedFiles).filter(file => file.type === ImportedFileType.REJECTED) as RejectedFile[]
  }

  static getDerivedStateFromProps(props: Props, state: State): State | null {
    const isCancelled = props.saveMultipleItemsState === MultipleItemsSaveState.CANCELLED
    const hasFinished =
      props.saveMultipleItemsState === MultipleItemsSaveState.FINISHED_SUCCESSFULLY ||
      props.saveMultipleItemsState === MultipleItemsSaveState.FINISHED_UNSUCCESSFULLY

    if (state.view !== ItemCreationView.COMPLETED && (isCancelled || hasFinished)) {
      return { ...state, view: ItemCreationView.COMPLETED }
    }

    return null
  }

  componentWillUnmount(): void {
    const { onModalUnmount } = this.props
    onModalUnmount()
  }

  private handleRejectedFiles = (rejectedFiles: File[]): void => {
    this.setState({
      importedFiles: {
        ...this.state.importedFiles,
        ...rejectedFiles.reduce((accum, file) => {
          accum[file.name] = {
            type: ImportedFileType.REJECTED,
            fileName: file.name,
            reason: t('create_and_edit_multiple_items_modal.wrong_file_extension')
          }
          return accum
        }, {} as Record<string, ImportedFile<Blob>>)
      }
    })

    this.setState({
      view: ItemCreationView.REVIEW
    })
  }

  private handleFilesImport = async (acceptedFiles: File[]): Promise<void> => {
    const { metadata, collection } = this.props
    this.setState({
      view: ItemCreationView.IMPORTING
    })

    const importedFiles: ImportedFile<Blob>[] = await Promise.all(
      acceptedFiles.map(async file => {
        try {
          if (file.size > MAX_FILE_SIZE) {
            throw new FileTooBigError(file.name, file.size)
          }

          const fileArrayBuffer = await file.arrayBuffer()
          const loadedFile = await loadFile(file.name, new Blob([new Uint8Array(fileArrayBuffer)]))

          // Multiple files must contain an asset file
          if (!loadedFile.asset) {
            throw new Error(t('create_and_edit_multiple_items_modal.asset_file_not_found'))
          }

          this.setState({
            loadingFilesProgress: this.state.loadingFilesProgress + 100 / acceptedFiles.length
          })
          const itemFactory = new ItemFactory<Blob>().fromAsset(loadedFile.asset!, loadedFile.content)

          if (!loadedFile.content[THUMBNAIL_PATH]) {
            const modelPath = loadedFile.asset.representations[0].mainFile
            const url = URL.createObjectURL(loadedFile.content[modelPath])
            const data = await getModelData(url, {
              width: 512,
              height: 512,
              extension: getExtension(modelPath) || undefined,
              engine: EngineType.BABYLON
            })
            URL.revokeObjectURL(url)
            const imageBlob = await dataURLToBlob(data.image)
            if (!imageBlob) {
              throw new Error(t('create_and_edit_multiple_items_modal.thumbnail_file_not_generated'))
            }
            itemFactory.withThumbnail(imageBlob)
          }

          // Set the UNIQUE rarity so all items have this rarity as default although TP items don't require rarity
          itemFactory.withRarity(Rarity.UNIQUE)

          // Override collection id if specified in the modal's metadata
          if (metadata.collectionId) {
            itemFactory.withCollectionId(metadata.collectionId)
          }

          // Generate or set the correct URN for the items taking into consideration the selected collection
          let decodedCollectionUrn: DecodedURN<any> | null = collection?.urn ? decodeURN(collection.urn) : null

          if (
            decodedCollectionUrn &&
            decodedCollectionUrn.type === URNType.COLLECTIONS_THIRDPARTY &&
            decodedCollectionUrn.thirdPartyCollectionId
          ) {
            const decodedUrn: DecodedURN<any> | null = loadedFile.asset.urn ? decodeURN(loadedFile.asset.urn) : null
            if (loadedFile.asset.urn && decodedUrn && decodedUrn.type === URNType.COLLECTIONS_THIRDPARTY) {
              const { thirdPartyName, thirdPartyCollectionId } = decodedUrn
              if (
                (thirdPartyCollectionId && thirdPartyCollectionId !== decodedCollectionUrn.thirdPartyCollectionId) ||
                (thirdPartyName && thirdPartyName !== decodedCollectionUrn.thirdPartyName)
              ) {
                throw new Error(t('create_and_edit_multiple_items_modal.invalid_urn'))
              }
              if (decodedUrn.thirdPartyTokenId) {
                itemFactory.withUrn(
                  buildThirdPartyURN(
                    decodedCollectionUrn.thirdPartyName,
                    decodedCollectionUrn.thirdPartyCollectionId,
                    decodedUrn.thirdPartyTokenId
                  )
                )
              }
            } else {
              itemFactory.withUrn(
                buildThirdPartyURN(decodedCollectionUrn.thirdPartyName, decodedCollectionUrn.thirdPartyCollectionId, uuid.v4())
              )
            }
          }

          const builtItem = await itemFactory.build()
          if (!this.isCreating()) {
            builtItem.item = omit(builtItem.item, ['id'])
          }

          // Generate catalyst image as part of the item
          const catalystImage = await generateCatalystImage(builtItem.item, { thumbnail: builtItem.newContent[THUMBNAIL_PATH] })
          builtItem.newContent[IMAGE_PATH] = catalystImage.content
          builtItem.item.contents[IMAGE_PATH] = catalystImage.hash

          return { type: ImportedFileType.ACCEPTED, ...builtItem, fileName: file.name }
        } catch (error) {
          return { type: ImportedFileType.REJECTED, fileName: file.name, reason: error.message }
        }
      })
    )

    this.setState({
      importedFiles: {
        ...this.state.importedFiles,
        ...importedFiles.reduce((accum, file) => {
          accum[file.fileName] = file
          return accum
        }, {} as Record<string, ImportedFile<Blob>>)
      },
      view: ItemCreationView.REVIEW
    })
  }

  private handleFilesUpload = (): void => {
    const { onSaveMultipleItems } = this.props
    onSaveMultipleItems(this.getValidFiles())
    this.setState({
      view: ItemCreationView.UPLOADING
    })
  }

  private onRejectedFilesClear = (): void => {
    this.setState({
      importedFiles: {
        ...Object.entries(this.state.importedFiles)
          .filter(entry => entry[1].type !== ImportedFileType.REJECTED)
          .reduce((accum, entry) => {
            accum[entry[0]] = entry[1]
            return accum
          }, {} as Record<string, ImportedFile<Blob>>)
      }
    })
  }

  private renderDropZone = (props: DropzoneState) => {
    const { open, getRootProps, getInputProps } = props

    const validFiles = this.getValidFiles()
    const rejectedFiles = this.getRejectedFiles()

    return (
      <>
        <Modal.Content scrolling>
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <div>
              <div className={`${styles.tablesContainer} ${styles.itemDropZoneContainer}`}>
                {rejectedFiles.length > 0 ? (
                  <Table basic="very" compact="very">
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>{t('create_and_edit_multiple_items_modal.invalid_title')}</Table.HeaderCell>
                        <Table.HeaderCell textAlign="right">
                          <Icon
                            className={styles.trashIcon}
                            aria-label="clear rejected files"
                            name="trash"
                            onClick={this.onRejectedFilesClear}
                          />
                        </Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {rejectedFiles.map(({ fileName, reason }, index) => {
                        return (
                          <Table.Row key={index}>
                            <Table.Cell>
                              <Icon name="warning circle" size="small" color="red" /> {fileName}
                            </Table.Cell>
                            <Table.Cell textAlign="right">{reason}</Table.Cell>
                          </Table.Row>
                        )
                      })}
                    </Table.Body>
                  </Table>
                ) : null}
                {validFiles.length > 0 ? (
                  <Table basic="very" compact="very">
                    {rejectedFiles.length > 0 ? (
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>{t('create_and_edit_multiple_items_modal.valid_title')}</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                    ) : null}
                    <Table.Body>
                      {validFiles.map(({ fileName }, index) => {
                        return (
                          <Table.Row key={index}>
                            <Table.Cell colSpan="2">{fileName}</Table.Cell>
                          </Table.Row>
                        )
                      })}
                    </Table.Body>
                  </Table>
                ) : null}
              </div>
            </div>
            {rejectedFiles.length > 0 ? (
              <div className={styles.rejectedFilesInfo}>
                <InfoIcon className={styles.infoIcon} />
                {t('create_and_edit_multiple_items_modal.only_valid_items_info')}
              </div>
            ) : null}
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button secondary onClick={open}>
            {t('create_and_edit_multiple_items_modal.add_more_button')}
          </Button>
          <Button primary disabled={validFiles.length === 0} onClick={this.handleFilesUpload}>
            {t('create_and_edit_multiple_items_modal.upload_items_button')}
          </Button>
        </Modal.Actions>
      </>
    )
  }

  private renderReviewTable = () => {
    const { onClose } = this.props
    return (
      <>
        <ModalNavigation title={this.getModalTitle()} subtitle={this.getModalSubtitle()} onClose={onClose} />
        <Dropzone
          children={this.renderDropZone}
          onDropAccepted={this.handleFilesImport}
          onDropRejected={this.handleRejectedFiles}
          accept={['.zip']}
          noClick
        />
      </>
    )
  }

  private isCreating = () => {
    const {
      metadata: { type = CreateOrEditMultipleItemsModalType.CREATE }
    } = this.props
    return type === CreateOrEditMultipleItemsModalType.CREATE
  }

  private getOperationTypeKey = () => {
    return this.isCreating() ? 'create' : 'edit'
  }

  private getModalTitle = () => {
    return t(`create_and_edit_multiple_items_modal.${this.getOperationTypeKey()}.title`)
  }

  private getModalSubtitle = () => {
    return this.isCreating() ? null : t('create_and_edit_multiple_items_modal.edit.subtitle')
  }

  private renderImportView = () => {
    const { onClose } = this.props
    return (
      <>
        <ModalNavigation title={this.getModalTitle()} subtitle={this.getModalSubtitle()} onClose={onClose} />
        <Modal.Content>
          <ItemImport
            onDropAccepted={this.handleFilesImport}
            onDropRejected={this.handleRejectedFiles}
            acceptedExtensions={['.zip']}
            moreInformation={
              REACT_APP_WEARABLES_ZIP_INFRA_URL ? (
                <span>
                  <T
                    id="create_and_edit_multiple_items_modal.import_information"
                    values={{
                      link: (
                        <a rel="noopener noreferrer" target="_blank" href={REACT_APP_WEARABLES_ZIP_INFRA_URL}>
                          {t('create_and_edit_multiple_items_modal.import_information_link_label')}
                        </a>
                      )
                    }}
                  />
                </span>
              ) : (
                undefined
              )
            }
          />
        </Modal.Content>
      </>
    )
  }

  private renderProgressBar(progress: number, label: string, cancel?: () => void) {
    return (
      <>
        <ModalNavigation title={this.getModalTitle()} subtitle={this.getModalSubtitle()} />
        <Modal.Content className={styles.modalContent}>
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBarLabel}>{label}</div>
            <Progress percent={progress} className={styles.progressBar} progress />
            {cancel ? (
              <div onClick={cancel} className={styles.progressBarCancel}>
                {t('global.cancel')}
              </div>
            ) : null}
          </div>
        </Modal.Content>
      </>
    )
  }

  private renderItemsTableSection(title: string, items: string[]) {
    return (
      <div className={styles.tablesContainer}>
        <Table basic="very" compact="very">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{title}</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items.map((item, index) => (
              <Table.Row key={index}>
                <Table.Cell>{item}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    )
  }

  private renderCompleted() {
    const { onClose, savedItemsFiles, notSavedItemsFiles, cancelledItemsFiles, saveMultipleItemsState, error } = this.props
    const hasFinishedSuccessfully = saveMultipleItemsState === MultipleItemsSaveState.FINISHED_SUCCESSFULLY
    const hasBeenCancelled = saveMultipleItemsState === MultipleItemsSaveState.CANCELLED
    const hasFailed = saveMultipleItemsState === MultipleItemsSaveState.FINISHED_UNSUCCESSFULLY

    let title: string
    if (hasFinishedSuccessfully) {
      title = t(`create_and_edit_multiple_items_modal.${this.getOperationTypeKey()}.successful_title`)
    } else if (hasFailed) {
      title = t(`create_and_edit_multiple_items_modal.${this.getOperationTypeKey()}.failed_title`)
    } else {
      title = t(`create_and_edit_multiple_items_modal.${this.getOperationTypeKey()}.cancelled_title`)
    }

    return (
      <>
        <ModalNavigation title={title} onClose={onClose} />
        <Modal.Content>
          <p className={styles.createdItems}>
            {!notSavedItemsFiles.length
              ? t(`create_and_edit_multiple_items_modal.${this.getOperationTypeKey()}.finished_successfully_subtitle`, {
                  number_of_items: savedItemsFiles.length
                })
              : t(`create_and_edit_multiple_items_modal.${this.getOperationTypeKey()}.finished_partial_successfully_subtitle`, {
                  number_of_items: savedItemsFiles.length,
                  number_of_failed_items: notSavedItemsFiles.length
                })}
          </p>
          {hasFailed ? <Message error size="tiny" visible content={error} header={t('global.error_ocurred')} /> : null}
          {hasBeenCancelled && cancelledItemsFiles.length > 0
            ? this.renderItemsTableSection(t('create_and_edit_multiple_items_modal.cancelled_items_table_title'), cancelledItemsFiles)
            : null}
          {hasBeenCancelled || notSavedItemsFiles.length > 0
            ? this.renderItemsTableSection(t('create_and_edit_multiple_items_modal.not_saved_items_table_title'), notSavedItemsFiles)
            : null}
          {savedItemsFiles.length > 0
            ? this.renderItemsTableSection(
                t(`create_and_edit_multiple_items_modal.${this.getOperationTypeKey()}.saved_items_table_title`),
                savedItemsFiles
              )
            : null}
        </Modal.Content>
        <Modal.Actions>
          <Button primary onClick={onClose}>
            {t('create_and_edit_multiple_items_modal.done_button')}
          </Button>
        </Modal.Actions>
      </>
    )
  }

  private renderView() {
    const { view, loadingFilesProgress } = this.state
    const { onCancelSaveMultipleItems, saveItemsProgress } = this.props
    const validFiles = this.getValidFiles()

    switch (view) {
      case ItemCreationView.IMPORT:
        return this.renderImportView()
      case ItemCreationView.IMPORTING:
        return this.renderProgressBar(loadingFilesProgress, t('create_and_edit_multiple_items_modal.importing_files_progress_label'))
      case ItemCreationView.REVIEW:
        return this.renderReviewTable()
      case ItemCreationView.UPLOADING:
        return this.renderProgressBar(
          saveItemsProgress,
          t('create_and_edit_multiple_items_modal.uploading_items_progress_label', { number_of_items: validFiles.length }),
          onCancelSaveMultipleItems
        )
      case ItemCreationView.COMPLETED:
        return this.renderCompleted()
    }
  }

  public render() {
    const { name, onClose } = this.props

    return (
      <Modal name={name} closeOnEscape={this.isViewClosable()} closeOnDimmerClick={this.isViewClosable()} onClose={onClose}>
        {this.renderView()}
      </Modal>
    )
  }
}
