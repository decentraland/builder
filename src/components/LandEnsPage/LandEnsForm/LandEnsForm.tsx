import * as React from 'react'
import { Form, Row, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Link } from 'react-router-dom'
import { locations } from 'routing/locations'
import { Props, State } from './LandEnsForm.types'
import './LandEnsForm.css'
import * as contentHash from 'content-hash'
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { namehash } from "@ethersproject/hash";
import { marketplace } from 'lib/api/marketplace'
import { ipfs } from 'lib/api/ipfs'
import { store } from 'modules/common/store'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { env } from 'decentraland-commons'
import { SelectNames } from 'components/SelectNames'

export const ENS_CONTRACT_ADDRESS = env.get('REACT_APP_ENS_CONTRACT_ADDRESS', '')
export const RESOLVER_CONTRACT_ADDRESS = env.get('REACT_APP_RESOLVER_CONTRACT_ADDRESS', '')


const ensAbi = [
  "function setOwner(bytes32 node, address owner) external @500000",
  "function setSubnodeOwner(bytes32 node, bytes32 label, address owner) external @500000",
  "function setResolver(bytes32 node, address resolver) external @500000",
  "function owner(bytes32 node) external view returns (address)",
  "function resolver(bytes32 node) external view returns (address)"
];

const resolverAbi = [
  "function interfaceImplementer(bytes32 nodehash, bytes4 interfaceId) view returns (address)",
  "function addr(bytes32 nodehash) view returns (address)",
  "function setAddr(bytes32 nodehash, address addr) @500000",
  "function name(bytes32 nodehash) view returns (string)",
  "function setName(bytes32 nodehash, string name) @500000",
  "function text(bytes32 nodehash, string key) view returns (string)",
  "function setText(bytes32 nodehash, string key, string value) @500000",
  "function contenthash(bytes32 nodehash) view returns (bytes)",
  "function setContenthash(bytes32 nodehash, bytes contenthash) @500000",
];

export default class LandEnsForm extends React.PureComponent<Props, State> {
  state: State = {
    selectedSubdomain: '',
    subdomainList: [],
    loading: false,
    done: false,
    message: ''
  }

  componentDidMount() {
    (async () => {
     const state = store.getState()
     const address = getAddress(state)
     
     if (address) {
       const subdomainList = await marketplace.fetchDomainList(address)
       this.setState({subdomainList})
     }
    })()

  }

  handleSubmit = async () => {

    const ethersAccountProvider = new Web3Provider((window as any).ethereum)
    console.log(ethersAccountProvider)

    const domain = this.state.selectedSubdomain
    const nodehash = namehash(domain)


    console.log({ENS_CONTRACT_ADDRESS, ensAbi, provider:ethersAccountProvider.getSigner(0)})
    const ensContract = new Contract(ENS_CONTRACT_ADDRESS, ensAbi, ethersAccountProvider.getSigner(0))
    let resolverAddress = await ensContract.resolver(nodehash)


    const ownerOf = await ensContract.owner(nodehash)
    console.log({ownerOf})
    if (resolverAddress !== '0x0000000000000000000000000000000000000000') {
      console.log(resolverAddress)
      this.setState({done: true, message: 'Your name has been setted previously. Please choose another one.'})
      return ;
    }
    const resolverContract = new Contract(RESOLVER_CONTRACT_ADDRESS, resolverAbi, ethersAccountProvider.getSigner(0))

    const ipfsHash = await ipfs.uploadRedirectionFile(this.props.land)
    const hash = contentHash.fromIpfs(ipfsHash)
    const resultSetContentHash = await resolverContract.setContenthash(nodehash, `0x${hash}`)
    console.log(resultSetContentHash)
    let resultSetResolver = await ensContract.setResolver(nodehash, resolverAddress)
    console.log(domain, resultSetResolver)
    this.setState({done: true, message: 'Your Name as been setted as expected.'})
    
  }

  handleChange = (selectedSubdomain: string) => {
    this.setState({ selectedSubdomain })
  }

  
  render() {
    const { land } = this.props
    const { subdomainList, selectedSubdomain, done, message } = this.state
    const selectOptions = subdomainList.map(x => ({value: x.toLowerCase(), text: x.toLowerCase()}))
 
    
    return (
      <Form className="LandEnsForm">

        { 
          done ? <>
            <Row>
              <p> {message} </p>
            </Row>
            <Row>
              <Link className="cancel" to={locations.landDetail(land.id)}>
                <Button>{t('global.cancel')}</Button>
              </Link>
            </Row>
          </> : <>
            <Row>
              <SelectNames
                name={t('land_ens_page.select_names.name')}
                value={selectedSubdomain}
                options={selectOptions}
                onChange={this.handleChange}
              />
            </Row>
            <Row>
              <Button type="submit" primary onClick={() => this.handleSubmit()}>
                {t('global.submit')}
              </Button>
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


