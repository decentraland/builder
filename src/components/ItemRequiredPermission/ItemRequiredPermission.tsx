import React from 'react'
import classNames from 'classnames'
import { TagField } from 'decentraland-ui/dist/components/TagField/TagField'
import { Props } from './ItemRequiredPermission.types'
import './ItemRequiredPermission.css'

const ItemRequiredPermission: React.FC<Props> = ({ requiredPermissions = [], basic = false }: Props) => {
  const transformedPermissions = requiredPermissions.map(permission => permission.replaceAll('_', ' '))
  return (
    <div className={classNames('ItemRequiredPermission', { basic })}>
      <TagField value={transformedPermissions} search={false} disabled={true} multiple selection={false} />
    </div>
  )
}

export default React.memo(ItemRequiredPermission)
