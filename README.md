![](https://ui.decentraland.org/decentraland_128x128.png)

# Decentraland Builder

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

REACT_APP_ASSETS_URL=https://builder-packs-prod.now.sh
REACT_APP_CONTENT_SERVER_URL=https://content.decentraland.org
REACT_APP_DAR_URL=https://schema-api-staging.now.sh/dar
REACT_APP_BUILDER_SERVER_URL=https://builder-api.decentraland.org/v1
REACT_APP_MARKETPLACE_URL=https://api.decentraland.org/v1
REACT_APP_AVATARS_API_URL=https://avatars-api.decentraland.org/api

# Third party

REACT_APP_SEGMENT_API_KEY=
REACT_APP_INTERCOM_APP_ID=
REACT_APP_ROLLBAR_ACCESS_TOKEN=

# Contracts

REACT_APP_MANA_TOKEN_CONTRACT_ADDRESS=0x0f5d2fb29fb7d3cfee444a200298f468908cc942
```

## Asset packs

Every asset you're able to place on your scene (from the builder sidebar) belongs to an asset pack. An asset pack is a JSON file which points to a collection of assets.

To populate the builder sidebar the front-end needs to fetch these asset packs from a remote server. This remote server is represented by the `REACT_APP_ASSETS_URL` environment variable. For example an asset pack might look like this:

```javascript
{
  "id": "a6fa9602-3e47-4dff-9a84-e8e017add15b",
  "version": 1,
  "title": "MiniTown",
  "assets": [
    {
      "id": "127727a7e8d9d265cc55ce4dcbbad3caa582d792a8792d1ff07cc36ab2c3b045",
      "name": "Barbacue",
      "thumbnail": "https://content.decentraland.today/contents/QmRBuZoF2TiD8Egonw5Y6g7AfqgVKGihPwtE4pG5uxLtHX",
      "url": "Barbacue_01/Barbacue_01.glb",
      "tags": ["decoration", "sausage", "sausages", "hamburger", "hamburgers", "backyard", "eggplant", "charcoal", "fire"],
      "category": "decorations",
      "variations": [],
      "contents": {
        "Barbacue_01/Barbacue_01.glb": "QmR1QAy5PWKUGho2fzt7NBLNobGwUT3ghFz9DxXGoGLvQn",
        "Barbacue_01/file1.png": "QmYACL8SnbXEonXQeRHdWYbfm8vxvaFAWnsLHUaDG4ABp5",
        "Barbacue_01/thumbnail.png": "QmRBuZoF2TiD8Egonw5Y6g7AfqgVKGihPwtE4pG5uxLtHX"
      }
    }
    // more assets (...)
  ]
}
```

As you can see, the assets themselves are pointers to a location on the [content server](#content-server), which holds the actual textures needed to render them on a scene.

### Multiple asset packs

The Builder is capable of using multiple asset packs at the same time. A JSON file is used for easy discovery
of the supported ones to be loaded by the application.
Each of the asset-pack entries points to the corresponding asset-pack definition file and supports and
thumbnail for display in the asset drawer.

```javascript
{
  "version": 1,
  "packs": [
    {
      "id": "e6fa9601-3e47-4dff-9a84-e8e017add15a",
      "name": "MiniTown",
      "url": "/e6fa9601-3e47-4dff-9a84-e8e017add15a.json",
      "thumbnail": "/d184ef93-07f6-4fa5-bbac-0c3b6e4c5899.png"
    },
    {
      "id": "d184ef93-07f6-4fa5-bbac-0c3b6e4c5899",
      "name": "Pirates",
      "url": "/d184ef93-07f6-4fa5-bbac-0c3b6e4c5899.json",
      "thumbnail": "/d184ef93-07f6-4fa5-bbac-0c3b6e4c5899.png"
    }
  ]
}
```

## Content server

As noted above, the content server holds the actual assets, which might be comprised of `.glb` and `.png` files. This server is found on the `REACT_APP_CONTENT_SERVER_URL` environment variable.
