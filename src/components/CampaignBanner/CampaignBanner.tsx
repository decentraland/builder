import { Component, ErrorInfo } from 'react'
import { Banner } from 'decentraland-dapps/dist/containers/Banner'
import { Props, State } from './CampaignBanner.types'

// A broken campaign banner (e.g. malformed Contentful content) should not take down the whole app.
export default class CampaignBanner extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Failed to render campaign banner', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return null
    }
    return <Banner id={this.props.id} />
  }
}
