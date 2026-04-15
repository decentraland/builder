import { AnimationClip, Object3D } from 'three'
import { BodyShape } from '@dcl/schemas'
import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { BoneNode } from 'modules/editor/types'

export type AnimationData = {
  animations: AnimationClip[]
  armatures: Object3D[]
  isLoaded: boolean
  error?: string
}

export type Props = {
  item: Item | null
  collection: Collection | null
  bodyShape: BodyShape
  isLoading: boolean
  isConnected: boolean
  id: string | null
  onFetchItem: (id: string) => void
  onFetchCollection: (id: string) => void
  onClearSpringBones: () => void
  onSetCurrentBones: (bones: BoneNode[], selectedItemId: string | null) => void
  onSetBonesForShape: (bodyShape: BodyShape, bones: BoneNode[], selectedItemId: string | null) => void
  children: (item: Item | null, collection: Collection | null, isLoading: boolean, animationData: AnimationData) => React.ReactNode
}
export type State = {
  loadedItemId: string | undefined
  animationData: AnimationData
}

export type ContainerProps = Pick<Props, 'id' | 'children'>
