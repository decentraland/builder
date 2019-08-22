import * as React from 'react'
import { FooterProps } from 'decentraland-ui'
import { Footer as DappsFooter } from 'decentraland-dapps/dist/containers'

import { locales } from 'modules/translation/utils'

export default class Footer extends React.PureComponent<FooterProps> {
  render() {
    return <DappsFooter locales={locales} {...this.props} />
  }
}
