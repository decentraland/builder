import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { MAX_AREA } from 'modules/template/utils'
import { Layout, ProjectLayout } from 'modules/project/types'
import LayoutPicker from 'components/LayoutPicker'
import { Props, State } from './ProjectLayoutPicker.types'

export default class ProjectLayoutPicker extends React.PureComponent<Props, State> {
  state = {
    hasMaxError: false,
    hasMinError: false
  }

  handleChange = (layout: Layout) => {
    const { rows, cols } = layout

    const hasMaxError = rows * cols > MAX_AREA
    const hasMinError = rows < 1 || cols < 1 || !Number(rows) || !Number(cols)

    const newLayout: ProjectLayout = {
      rows: rows >= 1 ? rows : this.props.rows,
      cols: cols >= 1 ? cols : this.props.cols,
      hasError: hasMaxError || hasMinError
    }
    this.setState({ hasMaxError, hasMinError })
    this.props.onChange(newLayout)
  }

  render() {
    const { rows, cols, ...pickerProps } = this.props
    const { hasMaxError, hasMinError } = this.state

    let errorMessage
    if (hasMaxError) {
      errorMessage = t('project_layout_picker.max_area_error', { area: MAX_AREA })
    }
    if (hasMinError) {
      errorMessage = t('project_layout_picker.min_area_error')
    }
    return <LayoutPicker rows={rows} cols={cols} errorMessage={errorMessage} {...pickerProps} onChange={this.handleChange} />
  }
}
