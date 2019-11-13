import * as React from 'react'
import { Button } from 'decentraland-ui'

import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import UserMenu from 'components/UserMenu'
import { Props, State } from './SceneViewMenu.types'

import "./SceneViewMenu.css"

export default class SceneViewMenu extends React.PureComponent<Props, State> {

  handleTryItOut = () => {
    this.props.onTryItOut()
  }

  render () {
    const { isLoggedIn } = this.props

    if (isLoggedIn) {
      return <UserMenu />
    }

    return <div className="SceneViewMenu">
      <span className="made-with">{t("public_page.made_with")}</span>
      <Button primary onClick={this.handleTryItOut}>{t("public_page.try_it_out")}</Button>
    </div>
  }
}
