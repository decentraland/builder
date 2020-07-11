import { locations } from 'routing/locations'
import { createMatchSelector } from 'connected-react-router'
import { RootState } from 'modules/common/types'

const landIdMatchSelector = createMatchSelector<
  RootState,
  {
    landId: string
  }
>(locations.landDetail())

export const getLandId = (state: RootState) => {
  const result = landIdMatchSelector(state)
  return result ? result.params.landId : null
}
