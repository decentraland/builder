import { Asset } from 'modules/asset/types'

export enum SidebarView {
  GRID = 'GRID',
  LIST = 'LIST'
}

export type Category = {
  name: string
  assets: Asset[]
}
