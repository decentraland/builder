import React from 'react'
import { T } from 'decentraland-dapps/dist/modules/translation/utils'
import { AssignModalOperationType } from 'components/Modals/EditCurationAssigneeModal/EditCurationAssigneeModal.types'
import Profile from 'components/Profile'

export const getSuccessfulAssignmentToastBody = (assignee: string | null, address: string | undefined, collectionName: string) => (
  <T
    id={
      assignee
        ? `curation_page.assign_modal.${
            assignee === address ? AssignModalOperationType.SELF_ASSIGN : AssignModalOperationType.REASSIGN
          }.success`
        : 'curation_page.assign_modal.collection_unassigned'
    }
    values={{
      collection_name: <strong>{collectionName}</strong>,
      assignee: assignee ? (
        <strong>
          <Profile textOnly address={assignee} />
        </strong>
      ) : null
    }}
  />
)
