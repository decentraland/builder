export type Props<T> = {
  assetPack: T
  startingAsset?: string
  ignoredAssets?: string[] // Ignored Asset IDs
  isEditing?: boolean
  onChange: (assetPack: T) => void
  onSubmit: (assetPack: T) => void
}

export type State = {
  currentAsset: number
  errors: Record<string, Record<string, string>>
  isDirty: boolean
}
