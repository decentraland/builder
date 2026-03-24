import { BoneNode, SpringBoneParams } from 'modules/editor/types'

export type Props = {
  bones: BoneNode[]
  springBoneParams: Record<string, SpringBoneParams>
  onParamChange: (boneName: string, field: keyof SpringBoneParams, value: SpringBoneParams[typeof field]) => void
  onAddSpringBoneParams: (boneName: string) => void
  onDeleteSpringBoneParams: (boneName: string) => void
}
