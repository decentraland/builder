import React, { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { CustomErrorWithTitle } from 'modules/item/errors'
import { Props, ErrorMessage as ErrorMessageType } from './ErrorMessage.types'
import styles from './ErrorMessage.module.css'

const CLEAR_ERROR_DELAY = 6000

function isErrorMessage(error: unknown): error is ErrorMessageType {
  return (error instanceof Error || error instanceof CustomErrorWithTitle) && 'message' in error
}

const ErrorMessage: React.FC<Props> = ({ error, className }: Props) => {
  const [showError, setShowError] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (error) {
      timeout.current = setTimeout(() => setShowError(false), CLEAR_ERROR_DELAY)
      setShowError(true)
    }

    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current)
      }
    }
  }, [error])

  if (!showError || !error) {
    return null
  }

  const { title = null, message } = isErrorMessage(error) ? error : { message: error }

  return (
    <div className={classNames(styles.errorContainer, className)}>
      <div className={styles.errorIcon} />
      <div className={styles.errorMessageContainer}>
        {title ? <span className={styles.errorTitle}>{title}</span> : null}
        <span className={styles.errorMessage}>{message}</span>
      </div>
    </div>
  )
}

export default React.memo(ErrorMessage)
