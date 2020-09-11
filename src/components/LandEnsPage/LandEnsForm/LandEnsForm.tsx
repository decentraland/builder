import * as React from 'react'
import { Form, Field, Row, Button, InputOnChangeData } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Link } from 'react-router-dom'
import { getSelection, getCenter, coordsToId } from 'modules/land/utils'
import { locations } from 'routing/locations'
import { Props, State } from './LandEnsForm.types'
import './LandEnsForm.css'
import { isEqual } from 'lib/address'
import { RoleType } from 'modules/land/types'
import * as contentHash from 'content-hash'
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { namehash } from "@ethersproject/hash";
import { Eth } from 'web3x-es/eth';
import { Net } from 'web3x-es/net';

export default class LandEnsForm extends React.PureComponent<Props, State> {
  state: State = {
    name: '',
    initial: '',
    loading: false,
    editing: false,
    dirty: false,
    revoked: false
  }


  handleChange = (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    this.setState({ name: data.value, dirty: true, revoked: false })
  }

  handleRevoke = () => {
    this.setState({ revoked: true, dirty: true })
  }

  handleUndo = () => {
    this.setState({ revoked: false, dirty: false })
  }

  render() {
    const { land, onSetOperator } = this.props
    const { name, loading, dirty, revoked, editing, initial } = this.state
    const selection = getSelection(land)
    const [x, y] = getCenter(selection)
 
    const isRevokable = editing && isEqual(name, initial)
    const hasError = !loading && !!name 
    const isDisabled = loading || !dirty || ((isEqual(name, initial) || hasError) && !revoked) || land.role !== RoleType.OWNER

    const classes = []
    if (revoked) {
      classes.push('revoked')
    }
    if (editing) {
      classes.push('editing')
    }
    if (isRevokable) {
      classes.push('is-revokable')
    }

    return (
      <Form className="LandEnsForm">
        <Field
          placeholder=""
          label={t('land_ens_page.name')}
          className={classes.join(' ')}
          value={name}
          onChange={this.handleChange}
          loading={loading}
          action={isRevokable ? (revoked ? t('operator_page.undo') : t('operator_page.revoke')) : undefined}
          onAction={isRevokable ? (revoked ? this.handleUndo : this.handleRevoke) : undefined}
          error={hasError}
          message={hasError ? t('operator_page.invalid_name') : undefined}
        />
        <Row>
          <Button type="submit" primary disabled={isDisabled} onClick={() => onSetOperator(land, revoked ? null : name)}>
            {t('global.submit')}
          </Button>
          <Link className="cancel" to={locations.landDetail(land.id)}>
            <Button>{t('global.cancel')}</Button>
          </Link>
        </Row>
        <Row>
          <Button primary onClick={async () => {
            const formData = new FormData()

            const html:string = `<html>
              <head>
                <meta http-equiv="refresh" content="0; URL=https://play.decentraland.org?position=${coordsToId(x, y)} />
              </head>
              <body>
                <p>
                  If you are not redirected 
                  <a href="https://play.decentraland.org?position=${coordsToId(x, y)}">click here</a>.
                </p>
              </body>
            </html>`

            formData.append('blob', new Blob([html]), 'index.html')
            const result = await fetch('https://ipfs.infura.io:5001/api/v0/add?pin=false' , {
              method: 'POST',
              body: formData
            })
            const json = await result.json()
            console.log(json)

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

            const accountProvider = Eth.fromCurrentProvider() // puede fallar
            if (!accountProvider) {
              console.log('No web3 found.');
              return;
            }
            const net = new Net(accountProvider);
            const network = await net.getNetworkType();
            const addressAccount = (await accountProvider.getAccounts())[0]
            console.log(`Connected to network: ${network}`)
            console.log(`Provider Info: ${await accountProvider.getNodeInfo()}`)
            console.log(`Account: ${(await accountProvider.getAccounts())[0]}`)
            const query = `
              query getUserNames($owner: String) {
                nfts(where: { owner: $owner, category: ens }) {
                  ens {
                    labelHash
                    subdomain
                  }
                }
              }
            `;

            const body = JSON.stringify({ query, variables: { owner: addressAccount.toString().toLowerCase() } });
            const res = await fetch('https://api.thegraph.com/subgraphs/name/decentraland/marketplace-ropsten', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body // ETH ADDRESS
            })      
            const { data } = await res.json()
            if (data.nfts.length === 0) {
              console.log(`Error: empty result - ${JSON.stringify({data})}`)
              return;
            }

            const {ens} = data.nfts[0]
            console.log(`Result: ${JSON.stringify({data})}`)
            const domain = `${ens.subdomain.toLowerCase()}.dcl.eth`
            console.log({domain}, {data})

            const nodehash = namehash(domain)
            console.log({nodehash})
            const ensAddress = '0x112234455c3a32fd11230c42e7bccd4a84e02010'


            const ethersAccountProvider = new Web3Provider((window as any).ethereum)

            console.log({ethersAccountProvider})

            const ensContract = new Contract(ensAddress, ensAbi, ethersAccountProvider.getSigner(0))
            let resolverAddress = await ensContract.resolver(nodehash)

            const ownerOf = await ensContract.owner(nodehash)
            console.log({ownerOf})
            if (resolverAddress !== '0x0000000000000000000000000000000000000000') {
              console.log(resolverAddress)
              return ;
            }
            resolverAddress = '0x12299799a50340FB860D276805E78550cBaD3De3' 
            const resolverContract = new Contract(resolverAddress, resolverAbi, ethersAccountProvider.getSigner(0))

            const hash = contentHash.fromIpfs(json.Hash)
            const resultSetContentHash = await resolverContract.setContenthash(nodehash, `0x${hash}`)
            console.log(resultSetContentHash)
            let resultSetResolver = await ensContract.setResolver(nodehash, resolverAddress)
            console.log(domain, resultSetResolver)
          }}> 
            Send index.html to ipfs
          </Button>

        </Row>
      </Form>
    )
  }
}

/*
usamos ens contracts viejos
ENS Registry -> to set a resolver to the node. Also, to check if the node has a resolver already set
mainnet: 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e
ropsten: 0x112234455c3a32fd11230c42e7bccd4a84e02010

Public resolver
mainnet: 0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41
ropsten: 0x12299799a50340FB860D276805E78550cBaD3De3
*/
