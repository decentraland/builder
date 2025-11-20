import { FC, memo, useState, useCallback, useRef, useLayoutEffect, ChangeEvent, KeyboardEvent, CompositionEvent } from 'react'
import classNames from 'classnames'
import { Button } from 'decentraland-ui'
import { Props } from './DynamicInput.types'
import styles from './DynamicInput.module.css'

const EXTRA_CURSOR_SPACE = 6 // px
const ALLOWED_CHARS = 'a-zA-Z0-9\\s_-'
const ALLOWED_CHARS_REGEX = new RegExp(`^[${ALLOWED_CHARS}]*$`)
const INVALID_CHARS_REGEX = new RegExp(`[^${ALLOWED_CHARS}]`, 'g')

const DynamicInput: FC<Props> = ({ value, disabled = false, placeholder = '', editable = false, className = '', maxLength, onChange }) => {
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const mirrorRef = useRef<HTMLSpanElement>(null)
  const typingTimerRef = useRef<number | null>(null)
  const isComposingRef = useRef(false)

  const applyNoTransitionBriefly = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    el.classList.add(styles.noTransition)
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current)
    typingTimerRef.current = window.setTimeout(() => {
      el.classList.remove(styles.noTransition)
      typingTimerRef.current = null
    }, 120) as unknown as number
  }, [])

  const measureAndApplyWidth = useCallback(() => {
    const mirror = mirrorRef.current
    const input = inputRef.current
    if (!mirror || !input) return

    if (isComposingRef.current) return

    mirror.textContent = value && value.length > 0 ? value : placeholder || '\u200B'
    const rect = mirror.getBoundingClientRect()
    const width = rect.width + EXTRA_CURSOR_SPACE
    input.style.width = `${width}px`
  }, [value, placeholder])

  useLayoutEffect(() => {
    measureAndApplyWidth()
  }, [measureAndApplyWidth])

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      let newValue = event.target.value

      // Filter out invalid characters
      newValue = newValue.replace(INVALID_CHARS_REGEX, '')

      if (value !== newValue && onChange) {
        onChange(maxLength ? newValue.slice(0, maxLength) : newValue)
      }
      applyNoTransitionBriefly()
      requestAnimationFrame(measureAndApplyWidth)
    },
    [value, maxLength, onChange, applyNoTransitionBriefly, measureAndApplyWidth]
  )

  const handleCompositionStart = useCallback((_: CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = true
  }, [])

  const handleCompositionEnd = useCallback(
    (_: CompositionEvent<HTMLInputElement>) => {
      isComposingRef.current = false
      requestAnimationFrame(measureAndApplyWidth)
    },
    [measureAndApplyWidth]
  )

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setIsEditing(false)
      return
    }

    // Allow control keys (navigation, deletion, etc.)
    if (
      event.key.length > 1 || // Control keys like Backspace, Delete, ArrowLeft, etc.
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return
    }

    // Prevent invalid characters
    if (!ALLOWED_CHARS_REGEX.test(event.key)) {
      event.preventDefault()
    }
  }, [])

  const handleBlur = useCallback(() => setIsEditing(false), [])
  const handleEdit = useCallback(() => {
    setIsEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [])

  const canEdit = editable && !disabled

  return (
    <div className={classNames(styles.dynamicInput, { [styles.isEditing]: isEditing }, className)}>
      <input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        disabled={disabled || !isEditing}
        placeholder={placeholder}
        maxLength={maxLength}
        className={styles.dynamicInputField}
      />

      <span ref={mirrorRef} className={styles.mirrorSpan} aria-hidden="true" />

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
