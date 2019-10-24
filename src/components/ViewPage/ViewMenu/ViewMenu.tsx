import * as React from 'react'
import { Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props, State } from './ViewMenu.types'
import UserMenu from 'components/UserMenu'

import "./ViewMenu.css"

export default class ViewMenu extends React.PureComponent<Props, State> {

  handleTryItOut = () => {
    const { onTryItOut } = this.props
    if (onTryItOut) {
      onTryItOut()
    }
  }

  render () {
    const { isLoggedIn } = this.props

    if (isLoggedIn) {
      return <UserMenu />
    }

    return <div className="ViewPageMenu">
      <span className="made-with">{t("public_page.made_with")}</span>
      <Button primary>{t("public_page.try_it_out")}</Button>
    </div>
  }
}
