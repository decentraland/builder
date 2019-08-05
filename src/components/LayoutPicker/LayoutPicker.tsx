import * as React from 'react'
import { Icon } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import SquaresGrid from 'components/SquaresGrid'
import { preventDefault } from 'lib/preventDefault'
import { Props } from './LayoutPicker.types'

import './LayoutPicker.css'

export default class LayoutPicker extends React.PureComponent<Props> {
  getValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    // TODO review this
    return value ? Math.floor(Number(value) || 1) : 1
  }

  handleChangeCols = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { rows, onChange } = this.props
    const cols = this.getValue(e)
    onChange(rows, cols)
  }

  handleChangeRows = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { cols, onChange } = this.props
    const rows = this.getValue(e)
    onChange(rows, cols)
  }

  disableScroll = (ref: HTMLInputElement | null) => {
    if (ref) {
      ref.addEventListener('mousewheel', preventDefault())
    }
  }

  getSize = () => {
    const { rows, cols } = this.props
    const size = Math.max(rows, cols)
    if (size <= 4) {
      return 'big'
    } else if (size <= 6) {
      return 'medium'
    } else if (size <= 12) {
      return 'small'
    } else {
      return 'tiny'
    }
  }

  render() {
    const { rows, cols, errorMessage, showGrid } = this.props
    let classes = 'LayoutPicker'
    if (errorMessage) {
      classes += ' error'
    }
    return (
      <>
        <div className={classes}>
          {showGrid ? (
            errorMessage ? (
              <div className="layout-error">
                <Icon name="warning sign" />
              </div>
            ) : (
              <SquaresGrid size={this.getSize()} rows={rows} cols={cols} />
            )
          ) : null}
          <div className="inputs">
            <div className="input">
              <label htmlFor="rows-input">{t('layout_picker.rows')}</label>
              <input
                id="rows-input"
                type="number"
                defaultValue={rows.toString()}
                onChange={this.handleChangeRows}
                ref={this.disableScroll}
              />
            </div>
            <i className="times" />
            <div className="input">
              <label htmlFor="cols-input">{t('layout_picker.columns')}</label>
              <input
                id="cols-input"
                type="number"
                defaultValue={cols.toString()}
                onChange={this.handleChangeCols}
                ref={this.disableScroll}
              />
            </div>
          </div>
        </div>
        {errorMessage ? <div className="LayoutPickerError">{errorMessage}</div> : null}
      </>
    )
  }
}
