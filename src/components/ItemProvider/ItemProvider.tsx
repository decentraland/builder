import * as React from 'react'
import { getEmoteData } from 'lib/getModelData'
import { parseSpringBones } from 'lib/parseSpringBones'
import { isWearable, getRepresentationMainFile } from 'modules/item/utils'
import { Props, State } from './ItemProvider.types'
import { Item } from 'modules/item/types'

export default class ItemProvider extends React.PureComponent<Props, State> {
  state: State = {
    loadedItemId: undefined,
    animationData: {
      animations: [],
      armatures: [],
      isLoaded: false
    }
  }

  componentDidMount() {
    const { id, item, onFetchItem, onFetchCollection, isConnected, collection } = this.props

    if (isConnected && id && !item) {
      this.setState({ loadedItemId: id }, () => onFetchItem(id))
    }
    if (isConnected && id && item?.collectionId && !collection) {
      onFetchCollection(item.collectionId)
    }

    // Load animation data if item is available
    if (isConnected && id && item) {
      void this.loadAnimationData(item)
      void this.loadSpringBonesData(item)
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { id, item, collection, bodyShape, onFetchItem, onFetchCollection, isConnected } = this.props
    const { loadedItemId } = this.state

    if (isConnected && id && !item && loadedItemId !== id) {
      this.setState({ loadedItemId: id }, () => onFetchItem(id))
    }
    if (isConnected && id && item?.collectionId && !collection) {
      onFetchCollection(item.collectionId)
    }

    // Load animation data when item changes
    if (isConnected && id && item && item.id !== prevProps.item?.id) {
      void this.loadAnimationData(item)
    }

    // Re-parse spring bones when item or body shape changes (different GLB)
    if (isConnected && item && (item.id !== prevProps.item?.id || bodyShape !== prevProps.bodyShape)) {
      void this.loadSpringBonesData(item)
    }
  }

  private findGlbFile(contents: Record<string, string>): { path: string; hash: string } | null {
    // Look for GLB/GLTF files in the contents
    for (const [path, hash] of Object.entries(contents)) {
      if (path.endsWith('.glb') || path.endsWith('.gltf')) {
        return { path, hash }
      }
    }
    return null
  }

  private async fetchGlbBlob(hash: string): Promise<Blob> {
    const { getContentsStorageUrl } = await import('lib/api/builder')
    const url = getContentsStorageUrl(hash)
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch GLB file: ${response.statusText}`)
    }
    return response.blob()
  }

  private async loadAnimationData(item: Item) {
    if (item.type !== 'emote') {
      return
    }

    this.setState(prev => ({
      ...prev,
      animationData: {
        animations: [],
        armatures: [],
        isLoaded: false
      }
    }))

    try {
      const glbFile = this.findGlbFile(item.contents)
      if (!glbFile) {
        this.setState(prev => ({
          ...prev,
          animationData: {
            animations: [],
            armatures: [],
            isLoaded: true,
            error: 'No GLB/GLTF file found'
          }
        }))
        return
      }

      // Fetch the blob and get emote data
      const blob = await this.fetchGlbBlob(glbFile.hash)
      const data = await getEmoteData(URL.createObjectURL(blob))

      this.setState(prev => ({
        ...prev,
        animationData: {
          animations: data.animations || [],
          armatures: data.armatures || [],
          isLoaded: true
        }
      }))
    } catch (error) {
      this.setState(prev => ({
        ...prev,
        animationData: {
          animations: [],
          armatures: [],
          isLoaded: true,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }))
    }
  }

  private async loadSpringBonesData(item: Item) {
    const { bodyShape, onSetBones, onClearSpringBones } = this.props
    onClearSpringBones() // Clear previous spring bone data while loading new one

    if (!isWearable(item)) {
      return
    }

    const mainFile = getRepresentationMainFile(item, bodyShape)
    const hash = mainFile ? item.contents[mainFile] : null
    if (!mainFile || !hash) {
      return
    }

    try {
      const blob = await this.fetchGlbBlob(hash)
      const buffer = await blob.arrayBuffer()
      const { bones } = parseSpringBones(buffer)
      onSetBones(bones, item.id)
    } catch (error) {
      console.warn("Failed to parse model's spring bones:", error)
    }
  }

  render() {
    const { item, collection, isLoading, children } = this.props
    const { animationData } = this.state
    return <>{children(item, collection, isLoading, animationData)}</>
  }
}
