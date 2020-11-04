import React from 'react'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Link } from 'react-router-dom'
import { locations } from 'routing/locations'
import {
  TRANSFER_LAND_SUCCESS,
  EDIT_LAND_SUCCESS,
  SET_OPERATOR_SUCCESS,
  CREATE_ESTATE_SUCCESS,
  EDIT_ESTATE_SUCCESS,
  DISSOLVE_ESTATE_SUCCESS,
  SET_UPDATE_MANAGER_SUCCESS
} from 'modules/land/actions'
import { SET_ENS_RESOLVER_SUCCESS, SET_ENS_CONTENT_SUCCESS } from 'modules/ens/actions'
import Profile from 'components/Profile'
import TransactionDetail from './TransactionDetail'
import { Props } from './Transaction.types'

const Transaction = (props: Props) => {
  const { tx } = props
  switch (tx.actionType) {
    case TRANSFER_LAND_SUCCESS: {
      const { name, address, selection } = tx.payload
      return (
        <TransactionDetail
          selection={selection}
          text={
            <T
              id="transaction.transfer"
              values={{
                name: <strong>{name}</strong>,
                address: <Profile address={address} />
              }}
            />
          }
          tx={tx}
        />
      )
    }
    case EDIT_LAND_SUCCESS: {
      const { name, selection } = tx.payload
      return (
        <TransactionDetail
          selection={selection}
          text={
            <T
              id="transaction.edit"
              values={{
                name: <strong>{name}</strong>
              }}
            />
          }
          tx={tx}
        />
      )
    }
    case SET_OPERATOR_SUCCESS: {
      const { name, address, selection } = tx.payload
      return (
        <TransactionDetail
          selection={selection}
          text={
            <T
              id={address ? 'transaction.set_operator_assigned' : 'transaction.set_operator_revoked'}
              values={{
                name: <strong>{name}</strong>,
                address: <Profile address={address} />
              }}
            />
          }
          tx={tx}
        />
      )
    }
    case CREATE_ESTATE_SUCCESS: {
      const { name, selection } = tx.payload
      return (
        <TransactionDetail
          selection={selection}
          text={
            <T
              id={'transaction.create_estate'}
              values={{
                name: <strong>{name}</strong>
              }}
            />
          }
          tx={tx}
        />
      )
    }
    case EDIT_ESTATE_SUCCESS: {
      const { name, count, type, selection } = tx.payload
      return (
        <TransactionDetail
          selection={selection}
          text={
            <T
              id={`transaction.edit_estate_${type}`}
              values={{
                name: <strong>{name}</strong>,
                count
              }}
            />
          }
          tx={tx}
        />
      )
    }
    case DISSOLVE_ESTATE_SUCCESS: {
      const { name, selection } = tx.payload
      return (
        <TransactionDetail
          selection={selection}
          text={
            <T
              id={'transaction.dissolve_estate'}
              values={{
                name: <strong>{name}</strong>
              }}
            />
          }
          tx={tx}
        />
      )
    }
    case SET_UPDATE_MANAGER_SUCCESS: {
      const { address, type, isApproved } = tx.payload
      return (
        <TransactionDetail
          address={address}
          text={
            <T
              id={isApproved ? 'transaction.set_manager_assigned' : 'transaction.set_manager_revoked'}
              values={{
                address: <Profile address={address} textOnly />,
                type: t(`global.${type}_plural`)
              }}
            />
          }
          tx={tx}
        />
      )
    }
    case SET_ENS_RESOLVER_SUCCESS: {
      const { address, subdomain } = tx.payload
      return (
        <TransactionDetail
          address={address}
          text={
            <T
              id={'transaction.set_ens_resolver'}
              values={{
                address: <Profile address={address} />,
                name: subdomain
              }}
            />
          }
          tx={tx}
        />
      )
    }
    case SET_ENS_CONTENT_SUCCESS: {
      const { address, subdomain, land } = tx.payload
      return (
        <TransactionDetail
          address={address}
          text={
            <T
              id={'transaction.set_ens_content'}
              values={{
                address: <Profile address={address} />,
                name: subdomain,
                land_link: <Link to={locations.landDetail(land.id)}>{land.name}</Link>
              }}
            />
          }
          tx={tx}
        />
      )
    }
    default:
      return null
  }
}

export default React.memo(Transaction)
