import * as React from 'react'
import { FileTooBigError, ItemFactory, loadFile, MAX_FILE_SIZE, THUMBNAIL_PATH } from '@dcl/builder-client'
import Dropzone, { DropzoneState } from 'react-dropzone'
import { Button, Icon, Message, ModalNavigation, Progress, Table } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { MultipleItemsSaveState } from 'modules/ui/createMultipleItems/reducer'
import { BuiltFile } from 'modules/item/types'
import ItemImport from 'components/ItemImport'
import { InfoIcon } from 'components/InfoIcon'
import { ImportedFile, ImportedFileType, ItemCreationView, Props, RejectedFile, State } from './CreateMultipleItemsModal.types'
import styles from './CreateMultipleItemsModal.module.css'
import { buildThirdPartyURN, DecodedURN, decodeURN, URNType } from 'lib/urn'
import uuid from 'uuid'

export default class CreateMultipleItemsModal extends React.PureComponent<Props, State> {
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
            reason: t('create_multiple_items_modal.wrong_file_extension')
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
    const { metadata, collectionUrn } = this.props
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
            throw new Error(t('create_multiple_items_modal.asset_file_not_found'))
          }

          if (!loadedFile.content[THUMBNAIL_PATH]) {
            throw new Error(t('create_multiple_items_modal.thumbnail_file_not_found'))
          }

          this.setState({
            loadingFilesProgress: this.state.loadingFilesProgress + 100 / acceptedFiles.length
          })
          const itemFactory = new ItemFactory<Blob>().fromAsset(loadedFile.asset!, loadedFile.content)

          // Override collection id if specified in the modal's metadata
          if (metadata.collectionId) {
            itemFactory.withCollectionId(metadata.collectionId)
          }

          // Generate or set the correct URN for the items taking into consideration the selected collection
          let decodedCollectionUrn: DecodedURN<any> | null = collectionUrn ? decodeURN(collectionUrn) : null

          if (
            decodedCollectionUrn &&
            decodedCollectionUrn.type === URNType.COLLECTIONS_THIRDPARTY &&
            decodedCollectionUrn.thirdPartyCollectionId
          ) {
            let decodedUrn = loadedFile.asset.urn ? decodeURN(loadedFile.asset.urn) : null
            if (loadedFile.asset.urn && decodedUrn && decodedUrn.type === URNType.COLLECTIONS_THIRDPARTY && decodedUrn.thirdPartyTokenId) {
              itemFactory.withUrn(
                buildThirdPartyURN(
                  decodedCollectionUrn.thirdPartyName,
                  decodedCollectionUrn.thirdPartyCollectionId,
                  decodedUrn.thirdPartyTokenId
                )
              )
            } else {
              itemFactory.withUrn(
                buildThirdPartyURN(decodedCollectionUrn.thirdPartyName, decodedCollectionUrn.thirdPartyCollectionId, uuid.v4())
              )
            }
          }

          const builtItem = await itemFactory.build()

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
              <div className={styles.tablesContainer}>
                {rejectedFiles.length > 0 ? (
                  <Table basic="very" compact="very">
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>{t('create_multiple_items_modal.invalid_title')}</Table.HeaderCell>
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
                          <Table.HeaderCell>{t('create_multiple_items_modal.valid_title')}</Table.HeaderCell>
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
                {t('create_multiple_items_modal.only_valid_items_info')}
              </div>
            ) : null}
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button secondary onClick={open}>
            {t('create_multiple_items_modal.add_more_button')}
          </Button>
          <Button primary disabled={validFiles.length === 0} onClick={this.handleFilesUpload}>
            {t('create_multiple_items_modal.upload_items_button')}
          </Button>
        </Modal.Actions>
      </>
    )
  }

  private renderReviewTable = () => {
    const { onClose } = this.props
    return (
      <>
        <ModalNavigation title={t('create_multiple_items_modal.title')} onClose={onClose} />
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

  private renderImportView = () => {
    const { onClose } = this.props
    return (
      <>
        <ModalNavigation title={t('create_multiple_items_modal.title')} onClose={onClose} />
        <Modal.Content>
          <ItemImport
            onDropAccepted={this.handleFilesImport}
            onDropRejected={this.handleRejectedFiles}
            acceptedExtensions={['.zip']}
            moreInformation={
              <span>
                <T
                  id="create_multiple_items_modal.import_information"
                  values={{
                    link: <a href="http://google.com">{t('create_multiple_items_modal.import_information_link_label')}</a>
                  }}
                />
              </span>
            }
          />
        </Modal.Content>
      </>
    )
  }

  private renderProgressBar(progress: number, label: string, cancel?: () => void) {
    return (
      <>
        <ModalNavigation title={t('create_multiple_items_modal.title')} />
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

  private renderCompleted() {
    const { onClose, savedItemsFiles, saveMultipleItemsState, error } = this.props
    const hasFinishedSuccessfully = saveMultipleItemsState === MultipleItemsSaveState.FINISHED_SUCCESSFULLY
    const hasBeenCancelled = saveMultipleItemsState === MultipleItemsSaveState.CANCELLED
    const hasFailed = saveMultipleItemsState === MultipleItemsSaveState.FINISHED_UNSUCCESSFULLY
    const hasFinishedUnsuccessfully = hasFailed || hasBeenCancelled

    let title: string
    if (hasFinishedSuccessfully) {
      title = t('create_multiple_items_modal.successful_title')
    } else if (hasFailed) {
      title = t('create_multiple_items_modal.failed_title')
    } else {
      title = t('create_multiple_items_modal.cancelled_title')
    }

    return (
      <>
        <ModalNavigation title={title} onClose={onClose} />
        <Modal.Content>
          <p className={styles.createdItems}>
            {hasFinishedSuccessfully
              ? t('create_multiple_items_modal.finished_successfully_subtitle', { number_of_items: savedItemsFiles.length })
              : t('create_multiple_items_modal.finished_unsuccessfully_subtitle', { number_of_items: savedItemsFiles.length })}
          </p>
          {hasFailed ? <Message error size="tiny" visible content={error} header={t('global.error_ocurred')} /> : null}
          {hasFinishedUnsuccessfully && savedItemsFiles.length > 0 ? (
            <>
              <p>{t('create_multiple_items_modal.saved_items_table_title')}</p>
              <Table basic="very" compact="very">
                <Table.Body>
                  {savedItemsFiles.map((item, index) => (
                    <Table.Row key={index}>
                      <Table.Cell>{item}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </>
          ) : null}
        </Modal.Content>
        <Modal.Actions>
          <Button primary onClick={onClose}>
            {t('create_multiple_items_modal.done_button')}
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
        return this.renderProgressBar(loadingFilesProgress, t('create_multiple_items_modal.importing_files_progress_label'))
      case ItemCreationView.REVIEW:
        return this.renderReviewTable()
      case ItemCreationView.UPLOADING:
        return this.renderProgressBar(
          saveItemsProgress,
          t('create_multiple_items_modal.uploading_items_progress_label', { number_of_items: validFiles.length }),
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
