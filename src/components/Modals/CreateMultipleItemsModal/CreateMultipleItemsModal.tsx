import * as React from 'react'
import { ModalNavigation, Progress } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { ItemFactory, LoadedFile, loadFile, THUMBNAIL_PATH } from '@dcl/builder-client'
import ImportItemsModal from '../ImportItemsModal/ImportItemsModal'
import { ItemCreationView, LoadingFilesState, State } from './CreateMultipleItemsModal.types'
import styles from './CreateMultipleItemsModal.module.css'

export default class CreateMultipleItemsModal extends React.PureComponent<any, State> {
  state = {
    items: [],
    view: ItemCreationView.IMPORT,
    loadingFilesState: LoadingFilesState.LOADING_FILES,
    loadingFilesProgress: 0
  }

  handleFilesImport = async (acceptedFiles: File[]) => {
    if (acceptedFiles.some(file => !file.name.endsWith('.zip'))) {
      throw new Error('Multiple files must be zipped files')
    }

    this.setState({
      loadingFilesState: LoadingFilesState.LOADING_FILES,
      view: ItemCreationView.LOADING
    })

    const loadedFiles: LoadedFile<Blob>[] = await Promise.all(
      acceptedFiles.map(async file => {
        const fileArrayBuffer = await file.arrayBuffer()
        // TODO: Fix support for Blobs
        const loadedFile = await loadFile(file.name, new Blob([new Uint8Array(fileArrayBuffer)]))

        // Multiple files must contain an asset file
        if (!loadedFile.asset) {
          throw new Error(`Asset file not found in file ${file.name}`)
        }

        if (!loadedFile.content[THUMBNAIL_PATH]) {
          throw new Error('Bulk files must contain a content')
        }

        this.setState({
          loadingFilesProgress: this.state.loadingFilesProgress + 100 / acceptedFiles.length / 2
        })

        return loadedFile
      })
    )

    this.setState({
      loadingFilesState: LoadingFilesState.CREATING_ITEMS
    })

    const loadedItems = loadedFiles.map(async loadedFile => {
      // Check if this works.
      const builtItem = await new ItemFactory<Blob>().fromAsset(loadedFile.asset!, loadedFile.content).build()
      this.setState({
        loadingFilesProgress: this.state.loadingFilesProgress + 100 / acceptedFiles.length / 2
      })
      return builtItem
    })

    this.setState({
      items: [...this.state.items, ...(await Promise.all(loadedItems))],
      view: ItemCreationView.REVIEW
    })
  }

  // TODO: internationalize
  getLoadingMessage() {
    switch (this.state.loadingFilesState) {
      case LoadingFilesState.LOADING_FILES:
        return 'Loading files'
      case LoadingFilesState.CREATING_ITEMS:
        return 'Creating items'
      default:
        return 'Loading...'
    }
  }

  renderView() {
    // TODO: Add internationalized title
    const { view, loadingFilesProgress } = this.state

    switch (view) {
      case ItemCreationView.IMPORT:
        return (
          <ImportItemsModal
            onDropAccepted={this.handleFilesImport}
            onDropRejected={() => undefined}
            onClose={() => undefined}
            error={null}
            acceptedExtensions={['.zip']}
            title="Upload multiple files"
          />
        )
      case ItemCreationView.LOADING:
        return (
          <Progress percent={loadingFilesProgress} className={styles.progressBarLabel} color="red">
            {this.getLoadingMessage()}
          </Progress>
        )
      case ItemCreationView.REVIEW:
        return 'Review list'
      case ItemCreationView.UPLOAD:
        return (
          <Progress percent={loadingFilesProgress} className={styles.progressBarLabel} color="red">
            Uploading items
          </Progress>
        )
    }
  }

  render() {
    const { name, onClose } = this.props
    return (
      <Modal name={name} onClose={onClose}>
        <ModalNavigation title={'Create item'} onClose={onClose} />
        <Modal.Content>{this.renderView()}</Modal.Content>
      </Modal>
    )
  }
}
