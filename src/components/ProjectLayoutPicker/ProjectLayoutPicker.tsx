import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { MAX_AREA } from 'modules/template/utils'
import { Layout, ProjectLayout } from 'modules/project/types'
import LayoutPicker from 'components/LayoutPicker'
import { Props, State } from './ProjectLayoutPicker.types'

export default class ProjectLayoutPicker extends React.PureComponent<Props, State> {
  state = {
    hasMaxError: false
  }

  handleChange = (layout: Partial<Layout>) => {
    const { rows, cols } = layout

    const hasEmptyFields = !rows || !cols
    let hasMaxError = false
    let hasMinError = false

    if (!hasEmptyFields) {
      hasMaxError = rows! * cols! > MAX_AREA
      hasMinError = rows! < 1 || cols! < 1
    }

    const newLayout: ProjectLayout = {
      rows: rows || 0,
      cols: cols || 0,
      hasError: hasMaxError || hasMinError || hasEmptyFields
    }
    this.setState({ hasMaxError })
    this.props.onChange(newLayout)
  }

  render() {
    const { rows, cols, ...pickerProps } = this.props
    const { hasMaxError } = this.state

    const errorMessage = hasMaxError ? t('project_layout_picker.max_area_error', { area: MAX_AREA }) : ''
    return <LayoutPicker rows={rows} cols={cols} errorMessage={errorMessage} {...pickerProps} onChange={this.handleChange} />
  }
}
