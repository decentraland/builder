import * as React from 'react'
import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import Icon from 'components/Icon'
import { Props, State } from './LocalStorageToast.types'

import './LocalStorageToast.css'

export const LOCALSTORAGE_TOAST_KEY = 'builder-localstorage-toast'
const localStorage = getLocalStorage()

export default class LocalStorageToast extends React.PureComponent<Props, State> {
  state = {
    visible: !localStorage.getItem(LOCALSTORAGE_TOAST_KEY)
  }

  handleClick = () => {
    this.setState({ visible: false })
    localStorage.setItem(LOCALSTORAGE_TOAST_KEY, '1')
  }

  render() {
    if (!this.state.visible) {
      return null
    }
    return (
      <div className="LocalStorageToast">
        {t('toasts.localstorage')}
        <div className="close" onClick={this.handleClick} title={t('global.dismiss')}>
          <Icon name="erase" />
        </div>
      </div>
    )
  }
}
