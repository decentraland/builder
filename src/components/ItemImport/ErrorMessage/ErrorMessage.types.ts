export type Props = {
  className?: string
  error?: ErrorMessage | React.ReactNode
}

export type ErrorMessage = {
  title?: React.ReactNode
  message: React.ReactNode
}
