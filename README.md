<img src="https://ui.decentraland.org/decentraland_256x256.png" height="128" width="128" />

# Decentraland Builder

[![Coverage Status](https://coveralls.io/repos/github/decentraland/builder/badge.svg?branch=master)](https://coveralls.io/github/decentraland/builder?branch=master)

This UI allows users to create beautiful scenes for [Decentraland](https://decentraland.org), manage wearables and emotes, handle LAND parcels and Estates, and deploy content to Worlds.

![](https://github.com/decentraland/builder/blob/master/public/images/intro.gif)

## Table of Contents

- [Features](#features)
- [Dependencies & Related Services](#dependencies--related-services)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the UI](#running-the-ui)
- [Testing](#testing)

## Features

- **Scene Editor (SDK6)**: Drag-and-drop scene editor for creating 3D scenes with pre-built assets
- **Web Editor (SDK7)**: Advanced scene editor using the Inspector for SDK7 scenes
- **Wearables & Emotes Editor**: Create, edit, and publish wearables and emotes for avatars
- **Collection Management**: Manage standard and third-party collections of items
- **Land Management**: View, edit, transfer, and manage LAND parcels and Estates
- **Worlds Deployment**: Deploy scenes to personal Worlds with custom permissions
- **DCL Names Management**: Manage Decentraland Names (claim, transfer, link to LAND, Worlds, Avatars, or addresses)
- **ENS Domain Management**: Link external ENS domains to LAND parcels and Worlds
- **Templates**: Browse and use pre-built scene templates
- **Curation Workflow**: Review and curate submitted collections (for curators)

## Dependencies & Related Services

This UI interacts with the following services:

- **[Builder API](https://github.com/decentraland/builder-server)**: Backend service for storing projects, items, collections, and deployments
- **[Peer/Catalyst Server](https://github.com/decentraland/catalyst)**: Decentraland content server for scene deployments and profile data
- **[Marketplace API](https://github.com/decentraland/marketplace)**: Retrieval of items on sale and marketplace data
- **[Worlds Content Server](https://github.com/decentraland/worlds-content-server)**: Deployment and management of personal Worlds
- **[Land Manager Subgraph](https://subgraph.decentraland.org/land-manager)**: GraphQL API for LAND and Estate data
- **[Marketplace Subgraph](https://subgraph.decentraland.org/marketplace)**: GraphQL API for marketplace transactions
- **[Rentals Subgraph](https://subgraph.decentraland.org/rentals-ethereum-mainnet)**: GraphQL API for LAND rentals data
- **[ENS Subgraph](https://subgraph.decentraland.org/ens)**: GraphQL API for ENS domain ownership
- **[Transactions API](https://github.com/decentraland/transactions-server)**: Meta-transactions service for gasless transactions
- **[DCL Lists Server](https://github.com/decentraland/dcl-lists)**: Lists and bans management

## Getting Started

### Prerequisites

Before running this UI, ensure you have the following installed:

- **Node.js**: Version 24.x (as specified in `engines`)
- **npm**: Latest version compatible with Node.js 24.x

### Installation

1. Clone the repository:

```bash
git clone https://github.com/decentraland/builder.git
cd builder
```

2. Install dependencies:

```bash
npm install
```

### Configuration

The UI uses the `@dcl/ui-env` module to configure the environment in which the UI will run.

All of these different configurations are located under the `/src/config/env` directory, where a `json` file can be found for each environment (`dev.json`, `stg.json`, `prod.json`).

This package automatically loads the environment file for each site in production (zone, today, org) and can be configured to run on a different environment while live by using the `?env=` query parameter with the desired environment, i.e: `?env=prod`.

**Creating an environment file**

Create an `.env` file on the root folder. The basic requirement to run the project:

```
# .env
VITE_REACT_APP_DCL_DEFAULT_ENV=dev
VITE_BASE_URL=""
```

### Running the UI

Running the start command will result in the Vite development server to start along with the scene compiler in watch mode:

```bash
npm run start
```

To run only the website without the scene compiler:

```bash
npm run start:website
```

## Testing

This UI contains tests that assert the behavior of components, stores, and business logic.

### Running tests

Run all tests:

```bash
npm run test
```

Run all tests with coverage:

```bash
npm run test:coverage
```

### Test Structure

Tests are written in files named along the file they're testing, with a `.spec.ts` or `.spec.tsx` extension:

```
src/
  modules/
    collection/
      reducer.ts
      reducer.spec.ts
      sagas.ts
      sagas.spec.ts
```

## AI Agent Context

For detailed AI Agent context, see [docs/ai-agent-context.md](docs/ai-agent-context.md).

---

