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
import { SAVE_PUBLISHED_ITEM_SUCCESS } from 'modules/item/actions'
import {
  MINT_COLLECTION_ITEMS_SUCCESS,
  SET_COLLECTION_MINTERS_SUCCESS,
  SET_COLLECTION_MANAGERS_SUCCESS,
  PUBLISH_COLLECTION_SUCCESS
} from 'modules/collection/actions'
import { SET_ENS_RESOLVER_SUCCESS, SET_ENS_CONTENT_SUCCESS, CLAIM_NAME_SUCCESS } from 'modules/ens/actions'
import Profile from 'components/Profile'
import { Props } from './Transaction.types'
import TransactionDetail from './TransactionDetail'

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
              id="transaction.create_estate"
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
              id="transaction.dissolve_estate"
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
    case SAVE_PUBLISHED_ITEM_SUCCESS: {
      const { item } = tx.payload
      return (
        <TransactionDetail
          item={item}
          text={<T id="transaction.saved_published_item" values={{ name: <Link to={locations.itemDetail(item.id)}>{item.name}</Link> }} />}
          tx={tx}
        />
      )
    }
    case PUBLISH_COLLECTION_SUCCESS: {
      const { collection } = tx.payload
      return (
        <TransactionDetail
          collection={collection}
          text={
            <T
              id="transaction.collection_published"
              values={{ name: <Link to={locations.collectionDetail(collection.id)}>{collection.name}</Link> }}
            />
          }
          tx={tx}
        />
      )
    }
    case MINT_COLLECTION_ITEMS_SUCCESS: {
      const { collection, mints } = tx.payload
      return (
        <TransactionDetail
          collection={collection}
          text={
            <T
              id="transaction.collection_items_minted"
              values={{ name: <Link to={locations.collectionDetail(collection.id)}>{collection.name}</Link>, count: mints.length }}
            />
          }
          tx={tx}
        />
      )
    }
    case SET_COLLECTION_MINTERS_SUCCESS: {
      // We're only setting the Collection Store as minter to allow sales for now
      const { collection, minters } = tx.payload
      return (
        <TransactionDetail
          collection={collection}
          text={
            <T
              id={minters.length > 0 ? 'transaction.set_collection_on_sale' : 'transaction.unset_collection_on_sale'}
              values={{
                name: <Link to={locations.collectionDetail(collection.id)}>{collection.name}</Link>
              }}
            />
          }
          tx={tx}
        />
      )
    }
    case SET_COLLECTION_MANAGERS_SUCCESS: {
      const { collection, managers } = tx.payload
      const managersCountDifference = managers.length - collection.managers.length
      return (
        <TransactionDetail
          collection={collection}
          text={
            <T
              id={managersCountDifference > 0 ? 'transaction.added_collection_managers' : 'transaction.removed_collection_managers'}
              values={{
                name: <Link to={locations.collectionDetail(collection.id)}>{collection.name}</Link>,
                count: Math.abs(managersCountDifference)
              }}
            />
          }
          tx={tx}
        />
      )
    }
    case SET_ENS_RESOLVER_SUCCESS: {
      const { address, ens } = tx.payload
      return (
        <TransactionDetail
          address={address}
          text={
            <T
              id="transaction.set_ens_resolver"
              values={{
                address: <Profile address={address} />,
                name: ens.subdomain
              }}
            />
          }
          tx={tx}
        />
      )
    }
    case SET_ENS_CONTENT_SUCCESS: {
      const { address, ens, land } = tx.payload
      return (
        <TransactionDetail
          address={address}
          text={
            land ? (
              <T
                id="transaction.set_ens_content"
                values={{
                  address: <Profile address={address} />,
                  name: ens.subdomain,
                  land_link: <Link to={locations.landDetail(land.id)}>{land.name}</Link>
                }}
              />
            ) : (
              <T
                id="transaction.unset_ens_content"
                values={{
                  address: <Profile address={address} />,
                  name: ens.subdomain
                }}
              />
            )
          }
          tx={tx}
        />
      )
    }
    case CLAIM_NAME_SUCCESS: {
      const { address, ens } = tx.payload
      return (
        <TransactionDetail
          address={address}
          text={
            <T
              id="transaction.claim_name"
              values={{
                address: <Profile address={address} />,
                name: ens.subdomain
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
