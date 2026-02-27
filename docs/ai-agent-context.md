# AI Agent Context

**Service Purpose:**

The Decentraland Builder is a web-based application that enables users to create, edit, and publish content for the Decentraland metaverse. It provides tools for building 3D scenes, designing wearables and emotes, managing LAND parcels and Estates, and deploying content to personal Worlds.

**Key Capabilities:**

- Scene creation and editing using SDK6 (drag-and-drop) and SDK7 (Inspector-based)
- Wearable and emote item creation with 3D model preview using Babylon.js
- Collection management for standard DCL collections and third-party (linked) collections
- LAND and Estate management including transfers, operators, and ENS linking
- Worlds deployment with permission management (access, deployment, streaming)
- DCL Names management (claim, transfer, link to LAND, Worlds, Avatars, or addresses)
- ENS domain management and linking to LAND parcels
- Template browsing and scene creation from templates
- Curation workflow for reviewing submitted collections

**Communication Pattern:**

- REST APIs for Builder Server, Marketplace API, Worlds Content Server
- GraphQL via Apollo Client for subgraph queries (Land Manager, Marketplace, Rentals, ENS)
- Blockchain interactions via ethers.js for smart contract calls (LAND, Collections, ENS)
- Signed fetch requests using `decentraland-crypto-fetch` for authenticated API calls

**Technology Stack:**

- Runtime: Node.js 24
- Framework: React 17 with Redux and Redux-Saga for state management
- Build Tool: Vite with SWC
- Language: TypeScript
- 3D Rendering: Babylon.js for item previews
- UI Libraries: decentraland-ui, decentraland-ui2 (MUI-based)
- Blockchain: ethers.js v5, typechain for contract types
- Testing: Jest with React Testing Library

**External Dependencies:**

- Builder API (`BUILDER_SERVER_URL`): Projects, items, collections, asset packs storage
- Peer/Catalyst Server (`PEER_URL`): Scene deployments, profile data, content storage
- Marketplace API (`MARKETPLACE_API`): Items on sale, marketplace data
- Worlds Content Server (`WORLDS_CONTENT_SERVER`): Worlds deployment and permissions
- Subgraphs for on-chain data queries:
  - Land Manager (`https://subgraph.decentraland.org/land-manager`): LAND and Estate data
  - Marketplace (`https://subgraph.decentraland.org/marketplace`): Marketplace transactions
  - Rentals (`https://subgraph.decentraland.org/rentals-ethereum-mainnet`): LAND rentals data
  - ENS (`https://subgraph.decentraland.org/ens`): ENS domain ownership
- Transactions API: Meta-transactions for gasless blockchain operations

**Key Concepts:**

- **Project/Scene**: A 3D scene with entities, components, and assets that can be deployed to LAND or Worlds
- **Item**: A wearable or emote with 3D models, metadata, and rarity that belongs to a collection
- **Collection**: A group of items (standard or third-party) that can be published on-chain
- **LAND/Estate**: Virtual real estate in Decentraland represented as NFTs; Estates are groups of adjacent LANDs
- **World**: A personal space where users can deploy scenes without owning LAND
- **DCL Name**: Decentraland's native naming system; names can be linked to LAND, Worlds, Avatars, or wallet addresses, and can be transferred between users
- **ENS Domain**: External Ethereum Name Service domains that can be linked to LAND or Worlds for custom URLs
- **Curation**: The review process for collections before they are approved for publication
- **Third-Party Collection**: Linked wearables from external NFT contracts mapped to Decentraland items
