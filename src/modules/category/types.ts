import { Asset } from 'modules/asset/types'

export type Category = {
  name: string
  assets: string[]
}

export type FullCategory = {
  name: string
  assets: Asset[]
}
