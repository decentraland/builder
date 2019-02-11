import { GridProps } from 'decentraland-ui'
import { Asset } from 'modules/asset/types'
import { ModelById } from 'decentraland-dapps/dist/lib/types'

export type Props = {
  columnCount: GridProps['columns']
  selectedGround: string | null
  grounds: ModelById<Asset>
  onClick: (id: string) => void
}

export type State = {}
