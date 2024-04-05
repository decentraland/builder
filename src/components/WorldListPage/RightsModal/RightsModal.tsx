import React, { useCallback, useState } from 'react'
import { Button, ButtonProps, Field, InputOnChangeData, Modal } from 'decentraland-ui'
import LoadingText from 'decentraland-ui/dist/components/Loader/LoadingText'
import { RightsModalProps } from './RightsModal.types'

const RightsModal = (props: RightsModalProps) => {
  const { show, addresses, loading, worldPermissionsEssentials, onClear, onCancel, onSave } = props
  const [newAddress, setNewAddress] = useState('')

  const localLoading = loading || !worldPermissionsEssentials
  const handleClear = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
      onClear(event, data)
    },
    [onClear]
  )

  const handleCancel = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
      onCancel(event, data)
    },
    [onCancel]
  )

  const handleSave = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, _data: ButtonProps) => {
      worldPermissionsEssentials && onSave(event, worldPermissionsEssentials, newAddress)
    },
    [onSave, newAddress, worldPermissionsEssentials]
  )

  const handleOnChange = useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
      setNewAddress(data.value || '')
    },
    [setNewAddress]
  )

  return (
    <Modal size="tiny" open={show}>
      <Modal.Header>{localLoading && <LoadingText type="h1" size="large"></LoadingText>}</Modal.Header>
      <Modal.Content>
        {localLoading && <LoadingText type="p" size="large" lines={5}></LoadingText>}
        {!localLoading && addresses.map((address, index) => <p key={index}>{address}</p>)}
        {!localLoading && <Field className="name" label="New Address" value={newAddress} onChange={handleOnChange} />}
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button primary onClick={handleClear}>
          Clear
        </Button>
        <Button primary inverted onClick={handleSave}>
          Save
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

export default RightsModal
