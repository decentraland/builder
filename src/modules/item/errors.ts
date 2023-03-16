import { ReactNode, createElement } from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { toMB } from 'lib/file'
import { MAX_EMOTE_DURATION, MAX_FILE_SIZE, MAX_THUMBNAIL_FILE_SIZE } from 'modules/item/utils'

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

export class EmoteCreationTPCollectionError extends Error {
  constructor() {
    super(t('create_single_item_modal.error.emote_creation_tp_collection'))
  }
}

export class InvalidModelFileType extends CustomError {
  constructor(type: string) {
    super(
      t('create_single_item_modal.error.invalid_model_file_type', {
        type: createElement('b', null, t(`item.type.${type}`))
      })
    )
  }
}
