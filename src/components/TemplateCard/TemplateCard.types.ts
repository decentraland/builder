import { Template } from 'modules/template/types'

export type DefaultProps = {
  onClick: (project: Template) => any
}

export type Props = DefaultProps & {
  template: Template
}
