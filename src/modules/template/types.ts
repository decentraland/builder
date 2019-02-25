import { Layout } from 'modules/project/types'

export type Template = {
  title: string
  description: string
  thumbnail: string
  layout?: Layout
  custom?: boolean
}
