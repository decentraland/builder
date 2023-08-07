export type Props = {
  className?: string
  error?: ErrorMessage | React.ReactNode
}

export type ErrorMessage = {
  title?: string
  message: string
}
