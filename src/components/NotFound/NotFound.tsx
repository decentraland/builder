import * as React from 'react'
import { Center } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

export default class NotFound extends React.PureComponent {
  render() {
    return (
      <Center>
        <span className="secondary-text">{t('global.not_found')}&hellip;</span>
      </Center>
    )
  }
}
