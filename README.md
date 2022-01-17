<img src="https://ui.decentraland.org/decentraland_256x256.png" height="128" width="128" />

# Decentraland Builder [![Coverage Status](https://coveralls.io/repos/github/decentraland/builder/badge.svg?branch=chore/add-tests-and-ci)](https://coveralls.io/github/decentraland/builder?branch=chore/add-tests-and-ci)

You can create beautiful scenes for [Decentraland](https://decentraland.org) even if you don't own a parcel.

![](https://github.com/decentraland/builder/blob/master/public/images/intro.gif)

# How to run

The builder is a SPA or single page application built with [create-react-app](https://github.com/facebook/create-react-app). It uses an [`.env`](#environment) file as configuration for a few things, you'll need to create that first.

After that, to run this app you have two options:

- **Development Server**: run `npm start` from the [`root`](https://github.com/decentraland/builder/tree/master) path
- **Production**: run `npm run build` and host the resulting index.html file with your server of choice, for example `python -m SimpleHTTPServer 5000`

For more information, check the [create-react-app](https://github.com/facebook/create-react-app) repo.

## Environment

This project depends on a few environment variables to work, as well as external services for some features.
The front-end connects to these services via URLs set via environment variables.

**Creating an environment file**

You'll need Create an `.env` file on the [`root`](https://github.com/decentraland/builder/tree/master) folder and fill it following the `.env.example` file found there.

You will need to specify `NODE_PATH` to be `src/` and you can check the [contract addresses](https://raw.githubusercontent.com/decentraland/contracts/gh-pages/addresses.json) for values like `REACT_APP_MANA_TOKEN_CONTRACT_ADDRESS`.

Here are the basic requirements to run the project:

```
# .env

NODE_PATH=src

REACT_APP_BUILDER_SERVER_URL=https://builder-api.decentraland.org/v1
REACT_APP_MARKETPLACE_URL=https://api.decentraland.org/v1

# Third party

REACT_APP_SEGMENT_API_KEY=
REACT_APP_INTERCOM_APP_ID=
REACT_APP_ROLLBAR_ACCESS_TOKEN=

# Contracts

REACT_APP_MANA_TOKEN_CONTRACT_ADDRESS=0x0f5d2fb29fb7d3cfee444a200298f468908cc942
```
