export type Props = {
  className: string
  name?: string
  isClosable: boolean
  onClose: () => void
  children?: React.ReactNode
}

export type State = {
  isClosed: boolean
}

export type LocalStorageState = string[]
