export type Props = {
  email: string
  isLoading: boolean
  hasMobileEmail: boolean
  onWatchVideo: () => void
  onSubmit: () => void
  onChange: (event: React.FormEvent<HTMLInputElement>) => void
}
