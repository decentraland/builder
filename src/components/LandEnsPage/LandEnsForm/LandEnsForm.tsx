import * as React from 'react'
import { Form, Row, Button, Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Link } from 'react-router-dom'
import { locations } from 'routing/locations'
import { Props, State } from './LandEnsForm.types'
import './LandEnsForm.css'
import { SelectNames } from 'components/SelectNames'

export default class LandEnsForm extends React.PureComponent<Props, State> {
  state: State = {
    selectedSubdomain: '',
    isSetResolverDone: false,
    isSetContentDone: false
  }
  componentDidMount() {
    this.props.onGetDomainList()
  }

  handleChange = (selectedSubdomain: string) => {
    const { onGetENS, land } = this.props
    onGetENS(selectedSubdomain, land)
    this.setState({ selectedSubdomain })
  }

  handleSubmitResolver = () => {
    const { onSetENSResolver, land } = this.props
    const { selectedSubdomain } = this.state
    onSetENSResolver(selectedSubdomain, land)
    this.setState({isSetResolverDone: true})
  }
  
  handleSubmitContent = () => {
    const { onSetENSContent, land } = this.props
    const { selectedSubdomain } = this.state
    onSetENSContent(selectedSubdomain, land)
    this.setState({isSetContentDone: true})
  }
 
  render() {
    const { land, ens, isLoading, error, subdomainList } = this.props
    const { selectedSubdomain, isSetResolverDone, isSetContentDone } = this.state
    const selectOptions = subdomainList.map(subdomain => ({value: subdomain.toLowerCase(), text: subdomain.toLowerCase()}))
 
 
    if ( isLoading) {
      return <Row><Loader size="large" active /></Row>
    }

    const messageType = ens.data[selectedSubdomain] ? ens.data[selectedSubdomain].type : 'default'
    let selectMessage: string = ""
    let isButtonDisabled: boolean = false
    switch(messageType) {
      case 'EmptyResolver': 
      case 'EmptyContent': 
      case 'DifferentContent': 
        selectMessage = t('land_ens_page.select_names.message.name_available')
        isButtonDisabled = false
        break
      case 'EqualContent': 
        selectMessage = t('land_ens_page.select_names.message.name_assigned'),
        isButtonDisabled = true
        break
      default: 
        selectMessage = t('land_ens_page.select_names.message.choose_name'),
        isButtonDisabled = true
        break
    }

    const submitMessage = error? error: t('land_ens_page.submit_message.success')
    const isDone = isSetResolverDone && isSetContentDone
    return (
      <Form className="LandEnsForm">
        { 
          isDone ? <>
            <Row>
              <p> {submitMessage} </p>
            </Row>
            <Row>
              <Link className="cancel" to={locations.landDetail(land.id)}>
                <Button>{t('global.done')}</Button>
              </Link>
            </Row>
          </> : <>
            <Row>
              <SelectNames
                name={t('land_ens_page.select_names.placeholder')}
                value={selectedSubdomain}
                options={selectOptions}
                onChange={this.handleChange}
              />
            </Row>
            <Row>
              <p> {selectMessage} </p>
            </Row>
            <Row>
              { 
                isSetResolverDone ? <>
                  <Button type="submit" primary onClick={this.handleSubmitContent}>
                    Set Content
                  </Button>
                </> : <>
                  <Button type="submit" disabled={isButtonDisabled} primary onClick={this.handleSubmitResolver}>
                    Set Resolver
                  </Button>
                </>
              }
              <Link className="cancel" to={locations.landDetail(land.id)}>
                <Button>{t('global.cancel')}</Button>
              </Link>
            </Row>
          </>
        }
      </Form>
    )
  }
}
