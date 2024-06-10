export type Props = {
  isLoggingIn: boolean
  isLoggedIn: boolean
}

export type MapStateProps = Pick<Props, 'isLoggedIn' | 'isLoggingIn'>
