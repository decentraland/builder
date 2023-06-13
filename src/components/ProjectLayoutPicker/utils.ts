import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { MAX_AREA } from 'modules/template/utils'

export function getErrorMessage(rows: number | undefined, cols: number | undefined) {
  if (rows === undefined || cols === undefined) {
    return t('project_layout_picker.empty_field_error')
  }

  if (!Number.isInteger(rows) || !Number.isInteger(cols)) {
    return t('project_layout_picker.decimals_error')
  }

  if (rows * cols > MAX_AREA) {
    return t('project_layout_picker.max_area_error', { area: MAX_AREA })
  }

  if (rows < 1 || cols < 1) {
    return t('project_layout_picker.min_area_error')
  }

  return ''
}
