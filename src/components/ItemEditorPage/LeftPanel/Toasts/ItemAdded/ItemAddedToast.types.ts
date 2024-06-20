export type Props = {
  collectionId: string | null
  itemName: string | null
}

export type MapStateProps = Pick<Props, 'itemName'>
