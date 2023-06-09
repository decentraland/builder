import * as React from 'react'

import { ProjectLayout } from 'modules/project/types'
import LayoutPicker from 'components/LayoutPicker'
import { Props, State } from './ProjectLayoutPicker.types'
import { getErrorMessage } from './utils'

export default class ProjectLayoutPicker extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      layout: {
        rows: props.rows,
        cols: props.cols
      }
    }
  }

  handleChange = (rows: number | undefined, cols: number | undefined) => {
    const newLayout: ProjectLayout = {
      rows: rows || 0,
      cols: cols || 0,
      hasError: !!getErrorMessage(rows, cols)
    }
    this.setState({ layout: { rows, cols } })
    this.props.onChange(newLayout)
  }

  render() {
    const {
      layout: { rows, cols }
    } = this.state
    const errorMessage = getErrorMessage(rows, cols)
    return <LayoutPicker {...this.props} rows={rows} cols={cols} errorMessage={errorMessage} onChange={this.handleChange} />
  }
}
