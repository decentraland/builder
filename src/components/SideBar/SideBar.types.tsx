import { AssetState } from 'modules/asset/reducer'

export type Props = {
  assets?: AssetState['data']
}

export type MapStateProps = Pick<Props, 'assets'>
export type MapDispatchProps = {}
