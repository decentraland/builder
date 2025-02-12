import { useState, FC, useMemo, useCallback, useEffect } from 'react'
import { ethers } from 'ethers'
import PQueue from 'p-queue'
import {
  ItemFactory,
  loadFile,
  LocalItem,
  MAX_SKIN_FILE_SIZE,
  MAX_THUMBNAIL_FILE_SIZE,
  MAX_WEARABLE_FILE_SIZE,
  Rarity,
  THUMBNAIL_PATH,
  FileTooBigError as FileTooBigErrorBuilderClient,
  FileType,
  MAX_EMOTE_FILE_SIZE
} from '@dcl/builder-client'
import Dropzone, { DropzoneState } from 'react-dropzone'
import { Button, Icon, Loader, Message, ModalNavigation, Progress, Table } from 'decentraland-ui'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { config } from 'config'
import { EngineType, getModelData } from 'lib/getModelData'
import { getExtension, toMB } from 'lib/file'
import {
  buildThirdPartyURN,
  decodedCollectionsUrnAreEqual,
  DecodedURN,
  decodeURN,
  getDefaultThirdPartyUrnSuffix,
  isThirdPartyCollectionDecodedUrn,
  URNType
} from 'lib/urn'
import { convertImageIntoWearableThumbnail, dataURLToBlob, getImageType } from 'modules/media/utils'
import { ImageType } from 'modules/media/types'
import { MultipleItemsSaveState } from 'modules/ui/createMultipleItems/reducer'
import { BuiltFile, IMAGE_PATH } from 'modules/item/types'
import { generateCatalystImage, getModelPath } from 'modules/item/utils'
import { ThumbnailFileTooBigError } from 'modules/item/errors'
import ItemImport from 'components/ItemImport'
import { InfoIcon } from 'components/InfoIcon'
import standardKindImage from '../../../images/standard.webp'
import programmaticKindImage from '../../../images/programmatic.webp'
import { useThirdPartyPrice } from '../PublishWizardCollectionModal/hooks'
import {
  CreateOrEditMultipleItemsModalType,
  ImportedFile,
  ImportedFileType,
  ItemCreationView,
  Props,
  RejectedFile
} from './CreateAndEditMultipleItemsModal.types'
import styles from './CreateAndEditMultipleItemsModal.module.css'

const WEARABLES_ZIP_INFRA_URL = config.get('WEARABLES_ZIP_INFRA_URL', '')
const AMOUNT_OF_FILES_TO_PROCESS_SIMULTANEOUSLY = 4

export const CreateAndEditMultipleItemsModal: FC<Props> = (props: Props) => {
  const {
    thirdParty,
    collection,
    metadata,
    isLinkedWearablesV2Enabled,
    isLinkedWearablesPaymentsEnabled,
    saveMultipleItemsState,
    savedItemsFiles,
    notSavedItemsFiles,
    cancelledItemsFiles,
    saveItemsProgress,
    error,
    onCancelSaveMultipleItems,
    onModalUnmount,
    onSaveMultipleItems,
    onSetThirdPartyType,
    onClose
  } = props
  const analytics = getAnalytics()
  const [view, setView] = useState(ItemCreationView.IMPORT)
  const [loadingFilesProgress, setLoadingFilesProgress] = useState(0)
  const [importedFiles, setImportedFiles] = useState<Record<string, ImportedFile<Blob>>>({})
  const [finishedState, setFinishedState] = useState<{
    state: MultipleItemsSaveState
    savedFiles: string[]
    notSavedFiles: string[]
    cancelledFiles: string[]
  }>()
  const { thirdPartyPrice, isFetchingPrice, fetchThirdPartyPrice } = useThirdPartyPrice()

  const isViewClosable = useMemo(() => view === ItemCreationView.IMPORTING || view === ItemCreationView.COMPLETED, [])
  const validFiles = useMemo(
    () => Object.values(importedFiles).filter(file => file.type === ImportedFileType.ACCEPTED) as BuiltFile<Blob>[],
    [importedFiles]
  )
  const rejectedFiles = useMemo(
    () => Object.values(importedFiles).filter(file => file.type === ImportedFileType.REJECTED) as RejectedFile[],
    [importedFiles]
  )
  const isCreating = useMemo(
    () => (metadata.type ?? CreateOrEditMultipleItemsModalType.CREATE) === CreateOrEditMultipleItemsModalType.CREATE,
    [metadata.type]
  )
  const operationTypeKey = useMemo(() => (isCreating ? 'create' : 'edit'), [isCreating])
  const modalTitle = useMemo(() => t(`create_and_edit_multiple_items_modal.${operationTypeKey}.title`), [operationTypeKey, t])
  const modalSubtitle = useMemo(() => (isCreating ? null : t('create_and_edit_multiple_items_modal.edit.subtitle')), [isCreating, t])
  useEffect(() => {
    const isCancelled = saveMultipleItemsState === MultipleItemsSaveState.CANCELLED
    const hasFinished =
      saveMultipleItemsState === MultipleItemsSaveState.FINISHED_SUCCESSFULLY ||
      saveMultipleItemsState === MultipleItemsSaveState.FINISHED_UNSUCCESSFULLY
    if (view !== ItemCreationView.COMPLETED && (isCancelled || hasFinished)) {
      setFinishedState({
        state: saveMultipleItemsState,
        savedFiles: savedItemsFiles,
        notSavedFiles: notSavedItemsFiles,
        cancelledFiles: cancelledItemsFiles
      })
      setView(ItemCreationView.COMPLETED)
    }

    return () => {
      onModalUnmount()
    }
  }, [saveMultipleItemsState, savedItemsFiles, notSavedItemsFiles, cancelledItemsFiles, view, onModalUnmount])

  useEffect(() => {
    if (isLinkedWearablesPaymentsEnabled && view === ItemCreationView.THIRD_PARTY_KIND_SELECTOR && !thirdPartyPrice && !isFetchingPrice) {
      return fetchThirdPartyPrice() as unknown as void
    }
  }, [view, isLinkedWearablesPaymentsEnabled, thirdPartyPrice, isFetchingPrice, fetchThirdPartyPrice])

  const handleRejectedFiles = useCallback((rejectedFiles: File[]): void => {
    setImportedFiles(prev => ({
      ...prev,
      ...rejectedFiles.reduce((accum, file) => {
        accum[file.name] = {
          type: ImportedFileType.REJECTED,
          fileName: file.name,
          reason: t('create_and_edit_multiple_items_modal.wrong_file_extension')
        }
        return accum
      }, {} as Record<string, ImportedFile<Blob>>)
    }))

    setView(ItemCreationView.REVIEW)
  }, [])

  const handleSetThirdPartyType = useCallback(
    (type: boolean) => {
      if (thirdParty && thirdParty.isProgrammatic !== type) {
        onSetThirdPartyType(thirdParty.id, type)
      } else {
        onClose()
      }
    },
    [thirdParty, onSetThirdPartyType, onClose]
  )

  const processAcceptedFile = useCallback(
    async (file: File) => {
      try {
        const fileArrayBuffer = await file.arrayBuffer()
        const loadedFile = await loadFile(file.name, new Blob([new Uint8Array(fileArrayBuffer)]))
        // Multiple files must contain an asset file
        if (!loadedFile.wearable) {
          throw new Error(t('create_and_edit_multiple_items_modal.wearable_file_not_found'))
        }

        const itemFactory = new ItemFactory<Blob>().fromConfig(loadedFile.wearable, loadedFile.content)

        let thumbnail: Blob | null = loadedFile.content[THUMBNAIL_PATH]

        if (!thumbnail) {
          const modelPath = getModelPath(loadedFile.wearable.data.representations)
          const url = URL.createObjectURL(loadedFile.content[modelPath])
          const data = await getModelData(url, {
            width: 1024,
            height: 1024,
            extension: getExtension(modelPath) || undefined,
            engine: EngineType.BABYLON
          })
          URL.revokeObjectURL(url)
          thumbnail = dataURLToBlob(data.image)
          if (!thumbnail) {
            throw new Error(t('create_and_edit_multiple_items_modal.thumbnail_file_not_generated'))
          }
        } else {
          const thumbnailImageType = await getImageType(thumbnail)
          if (thumbnailImageType !== ImageType.PNG) {
            throw new Error(t('create_and_edit_multiple_items_modal.wrong_thumbnail_format'))
          }
        }

        // Process the thumbnail so it fits our requirements
        thumbnail = dataURLToBlob(await convertImageIntoWearableThumbnail(thumbnail))

        if (!thumbnail) {
          throw new Error(t('create_and_edit_multiple_items_modal.thumbnail_file_not_generated'))
        }

        if (thumbnail.size > MAX_THUMBNAIL_FILE_SIZE) {
          throw new ThumbnailFileTooBigError()
        }

        itemFactory.withThumbnail(thumbnail)

        // Set the UNIQUE rarity so all items have this rarity as default although TP items don't require rarity
        itemFactory.withRarity(Rarity.UNIQUE)

        // Override collection id if specified in the modal's metadata
        if (metadata.collectionId) {
          itemFactory.withCollectionId(metadata.collectionId)
        }

        // Generate or set the correct URN for the items taking into consideration the selected collection
        const decodedCollectionUrn: DecodedURN<any> | null = collection?.urn ? decodeURN(collection.urn) : null
        // Check if the collection is a third party collection
        if (decodedCollectionUrn && isThirdPartyCollectionDecodedUrn(decodedCollectionUrn)) {
          const decodedUrn: DecodedURN<any> | null = loadedFile.wearable.id ? decodeURN(loadedFile.wearable.id) : null
          const thirdPartyTokenId =
            loadedFile.wearable.id && decodedUrn && decodedUrn.type === URNType.COLLECTIONS_THIRDPARTY
              ? decodedUrn.thirdPartyTokenId ?? null
              : null

          // Check if the decoded collections match a the collection level
          if (decodedUrn && !decodedCollectionsUrnAreEqual(decodedCollectionUrn, decodedUrn)) {
            throw new Error(t('create_and_edit_multiple_items_modal.invalid_urn'))
          }

          // In case the collection is linked to a smart contract, the mappings must be present
          if (isLinkedWearablesV2Enabled && collection?.linkedContractAddress && collection.linkedContractNetwork) {
            if (!loadedFile.wearable.mapping) {
              throw new Error(t('create_and_edit_multiple_items_modal.missing_mapping'))
            }
            // Build the mapping with the linked contract address and network
            itemFactory.withMappings({
              [collection.linkedContractNetwork]: {
                [collection.linkedContractAddress]: [loadedFile.wearable.mapping]
              }
            })
          }

          // Build the third party item URN in accordance ot the collection URN
          if (isThirdPartyCollectionDecodedUrn(decodedCollectionUrn)) {
            itemFactory.withUrn(
              buildThirdPartyURN(
                decodedCollectionUrn.thirdPartyName,
                decodedCollectionUrn.thirdPartyCollectionId,
                thirdPartyTokenId ?? getDefaultThirdPartyUrnSuffix(loadedFile.wearable.name)
              )
            )
          }
        }

        const builtItem = await itemFactory.build()
        if (!isCreating) {
          const { id: _id, ...itemWithoutId } = builtItem.item
          builtItem.item = itemWithoutId as LocalItem
        }

        // Generate catalyst image as part of the item
        const catalystImage = await generateCatalystImage(builtItem.item, { thumbnail: builtItem.newContent[THUMBNAIL_PATH] })
        builtItem.newContent[IMAGE_PATH] = catalystImage.content
        builtItem.item.contents[IMAGE_PATH] = catalystImage.hash

        return { type: ImportedFileType.ACCEPTED, ...builtItem, fileName: file.name }
      } catch (error) {
        if (!(error instanceof FileTooBigErrorBuilderClient)) {
          return {
            type: ImportedFileType.REJECTED,
            fileName: file.name,
            reason: isErrorWithMessage(error) ? error.message : 'Unknown error'
          }
        }

        const fileName = error.geFileName()
        const maxSize = error.getMaxFileSize()
        const type = error.getType()
        let reason: string = ''

        if (type === FileType.THUMBNAIL) {
          reason = t('create_single_item_modal.error.thumbnail_file_too_big', {
            maxSize: `${toMB(maxSize)}MB`
          })
        } else if (type === FileType.WEARABLE) {
          reason = t('create_and_edit_multiple_items_modal.max_file_size', {
            name: fileName,
            max: `${toMB(MAX_WEARABLE_FILE_SIZE)}`
          })
        } else if (type === FileType.SKIN) {
          reason = t('create_and_edit_multiple_items_modal.max_file_size_skin', {
            name: fileName,
            max: `${toMB(MAX_SKIN_FILE_SIZE)}`
          })
        } else if (type === FileType.EMOTE) {
          reason = t('create_and_edit_multiple_items_modal.max_file_size_emote', {
            name: fileName,
            max: `${toMB(MAX_EMOTE_FILE_SIZE)}`
          })
        }

        return {
          type: ImportedFileType.REJECTED,
          fileName,
          reason: reason
        }
      }
    },
    [collection, metadata, isLinkedWearablesV2Enabled, isCreating]
  )

  const handleFilesImport = useCallback(
    async (acceptedFiles: File[]) => {
      setView(ItemCreationView.IMPORTING)
      const queue = new PQueue({ concurrency: AMOUNT_OF_FILES_TO_PROCESS_SIMULTANEOUSLY })
      queue.on('next', () => {
        setLoadingFilesProgress(Math.round(((acceptedFiles.length - (queue.size + queue.pending)) * 100) / acceptedFiles.length))
      })
      const promisesToProcess = acceptedFiles.map(file => () => processAcceptedFile(file))
      const importedFiles: ImportedFile<Blob>[] = await queue.addAll(promisesToProcess)
      setImportedFiles(prev => ({
        ...prev,
        ...importedFiles.reduce((accum, file) => {
          accum[file.fileName] = file
          return accum
        }, {} as Record<string, ImportedFile<Blob>>)
      }))
      setView(ItemCreationView.REVIEW)
    },
    [processAcceptedFile]
  )

  const handleFilesUpload = useCallback((): void => {
    onSaveMultipleItems(validFiles)
    setView(ItemCreationView.UPLOADING)
    analytics?.track(`${isCreating ? 'Create' : 'Edit'} TP Items`, {
      items: validFiles.map(file => file.item.id),
      collectionId: collection?.id
    })
  }, [validFiles, collection, isCreating, onSaveMultipleItems])

  const onRejectedFilesClear = useCallback((): void => {
    setImportedFiles({
      ...Object.entries(importedFiles)
        .filter(entry => entry[1].type !== ImportedFileType.REJECTED)
        .reduce((accum, entry) => {
          accum[entry[0]] = entry[1]
          return accum
        }, {} as Record<string, ImportedFile<Blob>>)
    })
  }, [importedFiles])

  const renderDropZone = useCallback(
    (props: DropzoneState) => {
      // TODO: Upgrade react-dropzone to a newer version to avoid the linting error: unbound-method
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const { open, getRootProps, getInputProps } = props

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
                              onClick={onRejectedFilesClear}
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
            <Button primary disabled={validFiles.length === 0} onClick={handleFilesUpload}>
              {t('create_and_edit_multiple_items_modal.upload_items_button')}
            </Button>
          </Modal.Actions>
        </>
      )
    },
    [onRejectedFilesClear, rejectedFiles, validFiles, handleFilesUpload, t]
  )

  const renderReviewTable = useCallback(
    () => (
      <>
        <ModalNavigation title={modalTitle} subtitle={modalSubtitle} onClose={onClose} />
        <Dropzone
          children={renderDropZone}
          onDropAccepted={handleFilesImport}
          onDropRejected={handleRejectedFiles}
          accept={['.zip']}
          noClick
        />
      </>
    ),
    [modalTitle, modalSubtitle, onClose, handleFilesImport, handleRejectedFiles, renderDropZone]
  )

  const renderImportView = useCallback(
    () => (
      <>
        <ModalNavigation title={modalTitle} subtitle={modalSubtitle} onClose={onClose} />
        <Modal.Content>
          <ItemImport
            onDropAccepted={handleFilesImport}
            onDropRejected={handleRejectedFiles}
            acceptedExtensions={['.zip']}
            moreInformation={
              WEARABLES_ZIP_INFRA_URL ? (
                <span>
                  <T
                    id="create_and_edit_multiple_items_modal.import_information"
                    values={{
                      link: (
                        <a rel="noopener noreferrer" target="_blank" href={WEARABLES_ZIP_INFRA_URL}>
                          {t('create_and_edit_multiple_items_modal.import_information_link_label')}
                        </a>
                      )
                    }}
                  />
                </span>
              ) : undefined
            }
          />
        </Modal.Content>
      </>
    ),
    [modalTitle, modalSubtitle, onClose, handleFilesImport, handleRejectedFiles, t]
  )

  const renderThirdPartyKindSelector = useCallback(
    () => (
      <>
        <ModalNavigation title={modalTitle} subtitle={modalSubtitle} onClose={onClose} />
        <Modal.Content>
          {isFetchingPrice || !thirdPartyPrice ? (
            <div className={styles.loader}>
              <Loader active size="medium" />
            </div>
          ) : (
            <div className={styles.selector}>
              {[
                {
                  title: t('create_and_edit_multiple_items_modal.third_party_kind_selector.standard.title'),
                  subtitle: t('create_and_edit_multiple_items_modal.third_party_kind_selector.standard.subtitle', {
                    price: ethers.utils.formatEther(thirdPartyPrice?.item.usd ?? 0)
                  }),
                  img: standardKindImage,
                  action: () => handleSetThirdPartyType(false)
                },
                {
                  title: t('create_and_edit_multiple_items_modal.third_party_kind_selector.programmatic.title'),
                  subtitle: t('create_and_edit_multiple_items_modal.third_party_kind_selector.programmatic.subtitle', {
                    price: ethers.utils.formatEther(thirdPartyPrice?.programmatic.usd ?? 0)
                  }),
                  img: programmaticKindImage,
                  action: () => handleSetThirdPartyType(true)
                }
              ].map(({ title, subtitle, img, action }, index) => (
                <div className={styles.item} key={index}>
                  <img src={img} />
                  <div className={styles.description}>
                    <h2 className={styles.title}>{title}</h2>
                    <div className={styles.subtitle}>{subtitle}</div>
                    <div className={styles.action}>
                      <Button primary size="small" onClick={action}>
                        {t('create_and_edit_multiple_items_modal.third_party_kind_selector.action')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Content>
      </>
    ),
    [modalTitle, modalSubtitle, isFetchingPrice, thirdPartyPrice, onClose, handleSetThirdPartyType, t]
  )

  const renderProgressBar = useCallback(
    (progress: number, label: string, cancel?: () => void) => (
      <>
        <ModalNavigation title={modalTitle} subtitle={modalSubtitle} />
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
    ),
    [modalTitle, modalSubtitle, t]
  )

  const renderItemsTableSection = useCallback(
    (title: string, items: string[]) => (
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
    ),
    []
  )

  const handleDone = useCallback(() => {
    if (isLinkedWearablesPaymentsEnabled && thirdParty && !thirdParty.published) {
      setView(ItemCreationView.THIRD_PARTY_KIND_SELECTOR)
    } else {
      onClose()
    }
  }, [onClose, isLinkedWearablesPaymentsEnabled, thirdParty])

  const renderCompleted = useCallback(() => {
    const hasFinishedSuccessfully = finishedState?.state === MultipleItemsSaveState.FINISHED_SUCCESSFULLY
    const hasBeenCancelled = finishedState?.state === MultipleItemsSaveState.CANCELLED
    const hasFailed = finishedState?.state === MultipleItemsSaveState.FINISHED_UNSUCCESSFULLY

    const notSavedItemsFiles = finishedState?.notSavedFiles ?? []
    const savedItemsFiles = finishedState?.savedFiles ?? []
    const cancelledItemsFiles = finishedState?.cancelledFiles ?? []

    let title: string
    if (hasFinishedSuccessfully) {
      title = t(`create_and_edit_multiple_items_modal.${operationTypeKey}.successful_title`)
    } else if (hasFailed) {
      title = t(`create_and_edit_multiple_items_modal.${operationTypeKey}.failed_title`)
    } else {
      title = t(`create_and_edit_multiple_items_modal.${operationTypeKey}.cancelled_title`)
    }

    return (
      <>
        <ModalNavigation title={title} onClose={onClose} />
        <Modal.Content>
          <p className={styles.createdItems}>
            {!notSavedItemsFiles.length
              ? t(`create_and_edit_multiple_items_modal.${operationTypeKey}.finished_successfully_subtitle`, {
                  number_of_items: savedItemsFiles.length
                })
              : t(`create_and_edit_multiple_items_modal.${operationTypeKey}.finished_partial_successfully_subtitle`, {
                  number_of_items: savedItemsFiles.length,
                  number_of_failed_items: notSavedItemsFiles.length
                })}
          </p>
          {hasFailed ? <Message error size="tiny" visible content={error} header={t('global.error_ocurred')} /> : null}
          {hasBeenCancelled && cancelledItemsFiles.length > 0
            ? renderItemsTableSection(t('create_and_edit_multiple_items_modal.cancelled_items_table_title'), cancelledItemsFiles)
            : null}
          {hasBeenCancelled || notSavedItemsFiles.length > 0
            ? renderItemsTableSection(t('create_and_edit_multiple_items_modal.not_saved_items_table_title'), notSavedItemsFiles)
            : null}
          {savedItemsFiles.length > 0
            ? renderItemsTableSection(
                t(`create_and_edit_multiple_items_modal.${operationTypeKey}.saved_items_table_title`),
                savedItemsFiles
              )
            : null}
        </Modal.Content>
        <Modal.Actions>
          <Button primary onClick={handleDone}>
            {t('create_and_edit_multiple_items_modal.done_button')}
          </Button>
        </Modal.Actions>
      </>
    )
  }, [onClose, handleDone, operationTypeKey, finishedState, error])

  const renderedView = useMemo(() => {
    switch (view) {
      case ItemCreationView.IMPORT:
        return renderImportView()
      case ItemCreationView.IMPORTING:
        return renderProgressBar(loadingFilesProgress, t('create_and_edit_multiple_items_modal.importing_files_progress_label'))
      case ItemCreationView.REVIEW:
        return renderReviewTable()
      case ItemCreationView.UPLOADING:
        return renderProgressBar(
          saveItemsProgress,
          t('create_and_edit_multiple_items_modal.uploading_items_progress_label', { number_of_items: validFiles.length }),
          onCancelSaveMultipleItems
        )
      case ItemCreationView.COMPLETED:
        return renderCompleted()
      case ItemCreationView.THIRD_PARTY_KIND_SELECTOR:
        return renderThirdPartyKindSelector()
    }
  }, [
    view,
    loadingFilesProgress,
    validFiles,
    onCancelSaveMultipleItems,
    saveItemsProgress,
    renderImportView,
    renderProgressBar,
    renderReviewTable,
    renderCompleted,
    renderThirdPartyKindSelector
  ])

  return (
    <Modal name={name} closeOnEscape={isViewClosable} closeOnDimmerClick={isViewClosable} onClose={onClose}>
      {renderedView}
    </Modal>
  )
}
