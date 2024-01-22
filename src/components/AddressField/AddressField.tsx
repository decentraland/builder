import { useCallback, useRef, useState } from 'react'
import { Field, FieldProps, Icon, InputOnChangeData } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { isValid } from 'lib/address'
import { resolveName } from './utils'
import './AddressField.css'

export default function AddressField(props: FieldProps) {
  const { onChange } = props
  const [inputValue, setInputValue] = useState('')
  const [address, setAddress] = useState('')
  const timeout = useRef<NodeJS.Timeout>()
  const [valid, setValid] = useState<boolean>()
  const [loading, setLaoding] = useState<boolean>()

  const handleChange = useCallback(
    (evt, data: InputOnChangeData) => {
      setInputValue(data.value)
      setValid(undefined)
      setAddress('')
      if (timeout.current) {
        clearTimeout(timeout.current)
      }

      timeout.current = setTimeout(async () => {
        if (isValid(data.value)) {
          setValid(true)
          if (onChange) {
            onChange(evt, data)
          }
          return
        }

        setLaoding(true)
        const resolvedAddress = await resolveName(data.value)
        if (resolvedAddress) {
          setValid(true)
          setAddress(resolvedAddress)
          if (onChange) {
            onChange(evt, { value: resolvedAddress })
          }
        } else {
          setValid(false)
        }
        setLaoding(false)
      }, 800)
    },
    [onChange]
  )

  const additionalProps = valid
    ? {
        icon: <Icon color="green" size="large" name="check circle" />
      }
    : {}

  return (
    <div className="dui-address-field">
      <label className="ui sub header" htmlFor="address">
        {t('global.address')}
      </label>
      {address && <span className="dui-address-field__address">{address}</span>}
      <Field
        {...props}
        type="text"
        placeholder="Address or name"
        value={inputValue || ''}
        message={valid === false ? 'This is not a valid name or address' : undefined}
        error={valid === false}
        loading={loading}
        info={address}
        input={{ autocomplete: 'off', name: 'address', id: 'address' }}
        onChange={handleChange}
        {...additionalProps}
      />
    </div>
  )
}
