import { AssetParameter } from 'modules/asset/types'
import { ComponentDefinition, ComponentType } from 'modules/scene/types'

export type Props = {
  parameters: AssetParameter[]
  values: ComponentDefinition<ComponentType.Script>['data']['parameters']
  onChange(id: string, value: any): void
}
