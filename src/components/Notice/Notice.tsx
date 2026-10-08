import { useCallback, useEffect, useState } from 'react'
import classNames from 'classnames'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Icon from 'components/Icon'
import { Props } from './Notice.types'
import './Notice.css'

function isStoredAsClosed(storageKey: string): boolean {
  try {
    return localStorage.getItem(storageKey) !== null
  } catch {
    return false
  }
}

export default function Notice({ storageKey, className, children }: Props) {
  const [isClosed, setIsClosed] = useState(() => isStoredAsClosed(storageKey))

  useEffect(() => {
    setIsClosed(isStoredAsClosed(storageKey))
  }, [storageKey])

  const handleClose = useCallback(() => {
    setIsClosed(true)
    try {
      localStorage.setItem(storageKey, '1')
    } catch {
      // Storage unavailable: closed until the next mount
    }
  }, [storageKey])

  if (isClosed) {
    return null
  }

  return (
    <div className={classNames('Notice', className)}>
      <div className="text">{children}</div>
      <button type="button" className="close" aria-label={t('global.close')} onClick={handleClose}>
        <Icon name="close" />
      </button>
    </div>
  )
}
