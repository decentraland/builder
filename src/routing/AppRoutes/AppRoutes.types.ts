import { Dispatch } from 'react'
import { SaveLastLocationAction } from 'modules/ui/location/action'

export type Props = {
  saveLastLocation: (location: string) => void
}

export type MapDispatchProps = Pick<Props, 'saveLastLocation'>
export type MapDispatch = Dispatch<SaveLastLocationAction>
