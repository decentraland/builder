import { Dispatch } from 'react'
import { Location } from 'history'
import { LocationChangeAction } from 'modules/location/actions'

export type Props = {
  onLocationChange: (location: Location) => void
}

export type MapDispatchProps = Pick<Props, 'onLocationChange'>
export type MapDispatch = Dispatch<LocationChangeAction>
