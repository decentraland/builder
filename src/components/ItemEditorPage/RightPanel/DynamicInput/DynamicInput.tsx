import { FC, memo, useState, useCallback, ChangeEvent, KeyboardEvent } from 'react'
import classNames from 'classnames'
import { Button } from 'decentraland-ui'
import { Props } from './DynamicInput.types'
import styles from './DynamicInput.module.css'

const DynamicInput: FC<Props> = ({ value, disabled = false, placeholder = '', editable = false, className = '', maxLength, onChange }) => {
  const [isEditing, setIsEditing] = useState(false)

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value

      if (value !== newValue && onChange) {
        onChange(maxLength ? newValue.slice(0, maxLength) : newValue)
      }
    },
    [value, maxLength, onChange]
  )

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setIsEditing(false)
    }
  }, [])

  const handleBlur = useCallback(() => {
    setIsEditing(false)
  }, [])

  const handleEdit = useCallback(() => {
    setIsEditing(true)
  }, [])

  const calculateInputWidth = useCallback(() => {
    const text = value || placeholder
    const textLength = text.length

    if (textLength === 0) return '1em'

    const baseWidth = textLength * 0.55
    return `${Math.max(baseWidth, 0.5)}em`
  }, [value, placeholder])

  const inputWidth = calculateInputWidth()
  const canEdit = editable && !disabled

  return (
    <div className={classNames(styles.dynamicInput, { [styles.isEditing]: isEditing }, className)}>
      <input
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={disabled || !isEditing}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{ width: inputWidth }}
        className={styles.dynamicInputField}
      />
      {canEdit && (
        <Button
          className={styles.dynamicInputEditButton}
          icon="pencil alternate"
          size="tiny"
          basic
          onClick={handleEdit}
          disabled={disabled}
        />
      )}
    </div>
  )
}

export default memo(DynamicInput)
