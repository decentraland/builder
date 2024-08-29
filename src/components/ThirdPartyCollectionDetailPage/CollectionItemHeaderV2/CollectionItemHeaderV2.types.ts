import { CheckboxProps } from 'decentraland-ui'

export type Props = {
  areAllSelected: boolean
  onSelectedAllClick: (_event: React.MouseEvent<HTMLInputElement>, data: CheckboxProps) => unknown
}
