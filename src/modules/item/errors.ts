import { ReactNode, createElement } from 'react'
import { WearableCategory } from '@dcl/schemas'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { toMB } from 'lib/file'
import { MAX_EMOTE_DURATION, MAX_FILE_SIZE, MAX_THUMBNAIL_FILE_SIZE } from 'modules/item/utils'
import { getWearableTexturesLimit, getWearableTrianglesLimit } from 'components/Modals/CreateSingleItemModal/utils'

class CustomError {
  message: ReactNode
  constructor(message: ReactNode) {
    this.message = message
  }
}

export class ItemTooBigError extends Error {
  constructor() {
    super(t('create_single_item_modal.error.item_too_big', { size: `${toMB(MAX_FILE_SIZE)}MB` }))
  }
}

export class FileTooBigError extends CustomError {
  constructor() {
    super(
      t('create_single_item_modal.error.file_too_big', {
        title: createElement('b', null, t('create_single_item_modal.error.file_too_big_title')),
        enter: createElement('br'),
        size: `${toMB(MAX_FILE_SIZE)}MB`
      })
    )
  }
}

export class ThumbnailFileTooBigError extends Error {
  constructor() {
    super(t('create_single_item_modal.error.thumbnail_file_too_big', { size: `${toMB(MAX_THUMBNAIL_FILE_SIZE)}MB` }))
  }
}

export class WrongExtensionError extends Error {
  constructor() {
    super(t('create_single_item_modal.error.wrong_extension'))
  }
}

export class InvalidFilesError extends Error {
  constructor() {
    super(t('create_single_item_modal.error.invalid_files'))
  }
}

export class MissingModelFileError extends Error {
  constructor() {
    super(t('create_single_item_modal.error.missing_model_file'))
  }
}

export class InvalidModelFilesRepresentation extends Error {
  constructor() {
    super(t('create_single_item_modal.error.invalid_model_files_representation'))
  }
}

export class EmoteDurationTooLongError extends CustomError {
  constructor() {
    super(
      t('create_single_item_modal.error.emote_duration_too_long', {
        title: createElement('b', null, t('create_single_item_modal.error.emote_duration_too_long_title')),
        enter: createElement('br'),
        duration: MAX_EMOTE_DURATION
      })
    )
  }
}

export class WearableExceedsMaxTrianglesError extends CustomError {
  constructor(category: WearableCategory) {
    super(
      t('create_single_item_modal.error.wearable_exceeds_max_triangles', {
        title: createElement('b', null, t('create_single_item_modal.error.wearable_exceeds_max_triangles_title')),
        enter: createElement('br'),
        category: t(`wearable.category.${category}`),
        limit: getWearableTrianglesLimit(category)
      })
    )
  }
}

export class WearableExceedsMaxTexturesError extends CustomError {
  constructor(category: WearableCategory) {
    super(
      t('create_single_item_modal.error.wearable_exceeds_max_textures', {
        title: createElement('b', null, t('create_single_item_modal.error.wearable_exceeds_max_textures_title')),
        enter: createElement('br'),
        category: t(`wearable.category.${category}`),
        limit: getWearableTexturesLimit(category)
      })
    )
  }
}

export class MultipleFilesDetectedError extends CustomError {
  constructor() {
    super(
      t('create_single_item_modal.error.multiple_files_detected', {
        title: createElement('b', null, t('create_single_item_modal.error.multiple_files_detected_title')),
        enter: createElement('br')
      })
    )
  }
}
