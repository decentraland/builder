export type Option = {
  text: string
  handler: () => unknown
}

export type Props = {
  options: Array<Option>
  className?: string
}
