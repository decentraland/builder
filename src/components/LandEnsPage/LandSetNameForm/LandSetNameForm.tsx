import * as React from 'react'
import { Form, Row, Button, Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Link } from 'react-router-dom'
import { locations } from 'routing/locations'
import { Props, State } from './LandSetNameForm.types'
import './LandSetNameForm.css'

export default class LandSetNameForm extends React.PureComponent<Props, State> {
  state: State = {
    isSetResolverDone: false,
    isSetContentDone: false,
    isSetResolverDisabled: false,
    isSetContentDisabled: true
  }

  handleSetResolver = () => {
    const { onSetENSResolver, land, selectedName } = this.props
    onSetENSResolver(selectedName, land)
    this.setState({isSetResolverDone: true, isSetResolverDisabled: true, isSetContentDisabled: true})
  }
  
  handleSetContent = () => {
    const { onSetENSContent, land, selectedName } = this.props
    onSetENSContent(selectedName, land)
    this.setState({isSetContentDone: true, isSetResolverDisabled: false, isSetContentDisabled: true})
  }
 
  handleFinish = () => {
    console.log(this.props.selectedName)
  }

  render() {
    const { land, isLoading } = this.props
    const { isSetContentDisabled, isSetResolverDisabled } = this.state
    const isSubmitDisabled = !(isSetContentDisabled && isSetResolverDisabled) 
 
    if ( isLoading) {
      return <Row><Loader size="large" active /></Row>
    }

    return (
      <Form className="LandSetNameForm">
        <Row>
          <p className="message"> In order to link this name to your parcel you first need to approve 2 transactions.</p>
        </Row>
        <Row>
          <div className="box">
            <h3> Set Resolver </h3>
            <p>Brief explanation why they need to approve this.</p>
            <Button type="submit" disabled={isSetResolverDisabled} primary onClick={this.handleSetResolver}> 
              SEND TX
            </Button>
          </div>
        </Row>
        <Row>
          <div className="box">
            <h3> Set Content </h3>
            <p>Brief explanation why they need to approve this.</p>
            <Button type="submit" disabled={isSetContentDisabled} primary onClick={this.handleSetContent}> 
              SEND TX
            </Button>
          </div>
        </Row>
        <Row className="confirmationButtons">
          <Link className="cancel" to={locations.landDetail(land.id)}>
            <Button>{t('global.cancel')}</Button>
          </Link>
          <Button type="submit" disabled={isSubmitDisabled} primary onClick={this.handleFinish}> 
            Finish
          </Button>
        </Row>
      </Form>
    )
  }
}
