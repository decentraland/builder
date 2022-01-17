import { ItemFactory, loadFile, THUMBNAIL_PATH } from '@dcl/builder-client'
import * as React from 'react'
import { LoadingFilesState } from './CreateMultipleItemsModal.types'

export default class CreateItemModal extends React.PureComponent<any, any> {
  handleMultipleFiles = async (acceptedFiles: File[]) => {
    if (acceptedFiles.some(file => !file.name.endsWith('.zip'))) {
      throw new Error('Multiple files must be zipped files')
    }

    this.setState({
      loadingFilesState: LoadingFilesState.LOADING_FILES
    })

    const loadedFiles = await Promise.all(
      acceptedFiles.map(async file => {
        const fileArrayBuffer = await file.arrayBuffer()
        const loadedFile = await loadFile(file.name, new Uint8Array(fileArrayBuffer))

        // Multiple files must contain an asset file
        if (!loadedFile.asset) {
          throw new Error(`Asset file not found in file ${file.name}`)
        }

        if (!loadedFile.content[THUMBNAIL_PATH]) {
          throw new Error('Bulk files must contain a content')
        }

        this.setState({
          loadingFileProgress: this.state.loadingFileProgress + 100 / acceptedFiles.length / 2
        })

        return loadedFile
      })
    )

    this.setState({
      loadingFilesState: LoadingFilesState.CREATING_ITEMS
    })

    const loadedItems = loadedFiles.map(async loadedFile => {
      // Check if this works.
      const builtItem = await new ItemFactory<Uint8Array>().fromAsset(loadedFile.asset!, loadedFile.content).build()
      this.setState({
        loadingFilesProgress: this.state.loadingFileProgress + 100 / acceptedFiles.length / 2
      })
      return builtItem
    })

    this.setState({
      loadingFilesState: LoadingFilesState.FINISHED,
      items: [...this.state.items, await Promise.all(loadedItems)]
    })
  }

  render() {}
}
