GET /items
GET /collections
GET /collections/:id/items
PUT /items/:id
PUT /collections/:id
POST /items/:id/files
GET /storage/items/:hash

enum ItemType
enum ItemRarity

enum WearableCategory
enum WearableRepresentation

```
Item {
  id: string // uuid
  name: string
  description: string
  collection_id?: string
  blockchain_item_id?: string
  price?: number
  beneficiary?: string
  rarity?: ItemRarity
  type: ItemType
  data: WearableData
}


WearableData {
  category:? WearableCategory
  representation?: WearableRepresentation
  replaces?: WearableCategory[]
  hides?: WearableCategory[]
  tags?: string[]
}

Collection {
  id: string // uuid
  hash: string
  name: string
  eth_address: string
  contract_address: string
  published: boolean
}
```

GET /collections

req.auth -> eth_address del user

1. le pido a la db mis collections, filtro solo las que no estan en el grafo
2. le pido al grafo collections donde yo tengo permiso

GET /items

req.auth -> eth_address del user

1. le pido a la db mis items, filtro solo las que no estan en el grafo
2. le pido al grafo items donde yo tengo permiso

// dashboard
items = items.filters(item => !item.collectionId) // items sin collection
results = [...items, ...collections].sort()
