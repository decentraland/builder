import { Collection } from 'modules/collection/types'
import { hasReviews } from 'modules/collection/utils'
import { CurationStatus } from '../types'
import { CollectionCuration } from './types'

export const getCollectionCurationState = (collection: Collection, curation: CollectionCuration | null) => {
  if (collection.isApproved) {
    if (!curation || curation.status === 'approved') {
      return CurationStatus.APPROVED
    } else if (curation.status === 'rejected') {
      return CurationStatus.REJECTED
    }
  } else {
    if (!curation && hasReviews(collection)) {
      return CurationStatus.DISABLED
    } else if (curation && curation.status === 'rejected') {
      return CurationStatus.REJECTED
    }
  }
  if (curation && curation.status === 'pending' && curation.assignee) {
    return CurationStatus.UNDER_REVIEW
  }
  return CurationStatus.TO_REVIEW
}
