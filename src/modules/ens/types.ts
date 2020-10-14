export type ENSData = {
  resolver?: string
  content?: string
  error?: string
  type?: string
}

export enum FetchEnsTypeResult {
  EmptyResolver = 'EmptyResolver',
  EmptyContent = 'EmptyContent',
  EqualContent = 'EqualContent',
  DifferentContent = 'DifferentContent'
}
