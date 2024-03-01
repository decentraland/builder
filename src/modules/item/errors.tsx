import { ReactNode, createElement } from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { toMB } from 'lib/file'
import { MAX_EMOTE_DURATION, MAX_VIDEO_FILE_SIZE } from 'modules/item/utils'
import { MAX_SKIN_FILE_SIZE, MAX_WEARABLE_FILE_SIZE, MAX_THUMBNAIL_FILE_SIZE } from '@dcl/builder-client'

class CustomError {
  message: ReactNode
  constructor(message: ReactNode) {
    this.message = message
  }
}

export class CustomErrorWithTitle {
  title: ReactNode
  message: ReactNode

  constructor(title: ReactNode, message: ReactNode) {
    this.title = title
    this.message = message
  }
}

export class ItemTooBigError extends Error {
  constructor() {
    super(
      t('create_single_item_modal.error.item_too_big', {
        size: `${toMB(MAX_WEARABLE_FILE_SIZE)}MB`,
        size_skin: `${toMB(MAX_SKIN_FILE_SIZE)}MB`
      })
    )
  }
}

// TODO: review default maxSize
export class FileTooBigError extends CustomError {
  constructor(maxSize: number = MAX_WEARABLE_FILE_SIZE) {
    super(
      t('create_single_item_modal.error.file_too_big', {
        title: createElement('b', null, t('create_single_item_modal.error.file_too_big_title')),
        enter: createElement('br'),
        size: `${toMB(maxSize)}MB`
      })
    )
  }
}

export class ThumbnailFileTooBigError extends Error {
  constructor() {
    super(t('create_single_item_modal.error.thumbnail_file_too_big', { size: `${toMB(MAX_THUMBNAIL_FILE_SIZE)}MB` }))
  }
}

export class VideoFileTooBigError extends Error {
  public title: string

  constructor() {
    super(t('upload_video.error.video_file_too_big.message', { size: `${toMB(MAX_VIDEO_FILE_SIZE)}MB` }))
    this.title = t('upload_video.error.video_file_too_big.title')
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

export class InvalidVideoError extends Error {
  public title: string

  constructor() {
    super(t('upload_video.error.invalid_video.message'))
    this.title = t('upload_video.error.invalid_video.title')
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

export class InvalidModelFileType extends CustomError {
  constructor(type: string) {
    super(
      t('create_single_item_modal.error.invalid_model_file_type', {
        type: createElement('b', null, t(`item.type.${type}`))
      })
    )
  }
}

export class ItemNotAllowedInThirdPartyCollections extends CustomError {
  constructor(type: string) {
    super(
      t('create_single_item_modal.error.item_not_allowed_in_third_party_collections', {
        type: createElement('b', null, t(`item.type.${type}`))
      })
    )
  }
}

export class EmoteAnimationsSyncError extends CustomError {
  constructor() {
    super(
      t('create_single_item_modal.error.emote_animations_sync_error', {
        br: () => <br />,
        b: (text: string) => <b>{text}</b>
      })
    )
  }
}

export class EmoteWithMeshError extends CustomError {
  constructor() {
    super(
      t('create_single_item_modal.error.emote_with_mesh', {
        br: () => <br />,
        b: (text: string) => <b>{text}</b>
      })
    )
  }
}
