import * as React from 'react'
import { Button, Responsive } from 'decentraland-ui'

import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import UserInformation from 'components/UserInformation'
import { Props } from './SceneViewMenu.types'

import './SceneViewMenu.css'

export default class SceneViewMenu extends React.PureComponent<Props> {
  handleTryItOut = () => {
    this.props.onTryItOut()
  }

  render() {
    const { isLoggedIn } = this.props

    if (isLoggedIn) {
      return <UserInformation />
    }

    return (
      <div className="SceneViewMenu">
        <Responsive minWidth={1025} as={React.Fragment}>
          <span className="made-with">{t('public_page.made_with')}</span>
        </Responsive>
        <Button primary onClick={this.handleTryItOut}>
          {t('public_page.try_it_out')}
        </Button>
      </div>
    )
  }
}
