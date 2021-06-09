import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { toMB } from 'lib/file'
import { MAX_FILE_SIZE } from 'modules/item/utils'

export class ItemTooBigError extends Error {
  constructor() {
    super(t('create_item_modal.error.item_too_big', { size: `${toMB(MAX_FILE_SIZE)}MB` }))
  }
}

export class FileTooBigError extends Error {
  constructor() {
    super(t('create_item_modal.error.file_too_big', { size: `${toMB(MAX_FILE_SIZE)}MB` }))
  }
}

export class WrongExtensionError extends Error {
  constructor() {
    super(t('create_item_modal.error.wrong_extension'))
  }
}

export class InvalidFilesError extends Error {
  constructor() {
    super(t('create_item_modal.error.invalid_files'))
  }
}

export class MissingModelFileError extends Error {
  constructor() {
    super(t('create_item_modal.error.missing_model_file'))
  }
}
