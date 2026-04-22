import * as React from 'react'
import { BodyShape } from '@dcl/schemas'
import { getEmoteData } from 'lib/getModelData'
import { parseSpringBones } from 'lib/parseSpringBones'
import { isWearable, getRepresentationMainFile, hasMultipleModels } from 'modules/item/utils'
import { Props, State } from './ItemProvider.types'
import { Item } from 'modules/item/types'
import { BoneNode } from 'modules/editor/types'

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
    const { id, item, collection, onFetchItem, onFetchCollection, isConnected } = this.props
    const { loadedItemId } = this.state

    if (isConnected && id && !item && loadedItemId !== id) {
      this.setState({ loadedItemId: id }, () => onFetchItem(id))
    }
    if (isConnected && id && item?.collectionId && !collection) {
      onFetchCollection(item.collectionId)
    }

    if (isConnected && id && item && item.id !== prevProps.item?.id && item.type === 'emote') {
      void this.loadAnimationData(item)
    }

    // Reload spring bone data if wearable item changes
    if (isConnected && id && item && item.type === 'wearable') {
      const modelChanged = prevProps.item != null && this.hasModelContentChanged(prevProps.item, item)
      if (item.id !== prevProps.item?.id || modelChanged) {
        void this.loadAnimationData(item)
        void this.loadSpringBonesData(item)
      }
    }
  }

  private hasModelContentChanged(prevItem: Item, nextItem: Item): boolean {
    if (prevItem.contents === nextItem.contents) return false
    for (const [path, hash] of Object.entries(nextItem.contents)) {
      if ((path.endsWith('.glb') || path.endsWith('.gltf')) && hash !== prevItem.contents[path]) {
        return true
      }
    }
    return false
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

  private async getSpringBonesForBodyShape(item: Item, bodyShape: BodyShape): Promise<BoneNode[] | null> {
    const mainFile = getRepresentationMainFile(item, bodyShape)
    const hash = mainFile ? item.contents[mainFile] : null
    if (!mainFile || !hash) {
      return null
    }

    try {
      const blob = await this.fetchGlbBlob(hash)
      const buffer = await blob.arrayBuffer()
      const { bones } = parseSpringBones(buffer)
      return bones
    } catch (error) {
      console.warn(`Failed to parse spring bones for ${bodyShape}:`, error)
      return null
    }
  }

  private async loadSpringBonesData(item: Item) {
    const { bodyShape, onSetCurrentBones, onSetBonesForShape, onClearSpringBones } = this.props
    onClearSpringBones() // Clear previous spring bone data while loading new one

    if (!isWearable(item)) {
      return
    }

    if (hasMultipleModels(item)) {
      // Eagerly parse both body shapes so tab badges are correct and tab switches skip re-fetch
      await Promise.all(
        [BodyShape.MALE, BodyShape.FEMALE].map(async shape => {
          const bones = await this.getSpringBonesForBodyShape(item, shape)
          if (bones !== null && this.props.item?.id === item.id) {
            onSetBonesForShape(shape, bones, item.id)
            if (shape === bodyShape) {
              onSetCurrentBones(bones, item.id)
            }
          }
        })
      )
    } else {
      // Single GLB path, parse once and use for both body shapes
      const bones = await this.getSpringBonesForBodyShape(item, bodyShape)
      if (bones !== null && this.props.item?.id === item.id) {
        onSetCurrentBones(bones, item.id)
      }
    }
  }

  render() {
    const { item, collection, isLoading, children } = this.props
    const { animationData } = this.state
    return <>{children(item, collection, isLoading, animationData)}</>
  }
}
