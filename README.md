![](https://ui.decentraland.org/decentraland_128x128.png)

# Decentraland Builder

You can create beautiful scenes for [Decentraland](https://decentraland.org) even if you don't own a parcel.

![](https://github.com/decentraland/builder/blob/master/public/images/intro.gif)

# How to run

The builder is a SPA or single page application built with [create-react-app](https://github.com/facebook/create-react-app). It uses an [`.env`](#environment) file as configuration for a few things, you'll need to create that first.

After that, to run this app you have two options:

- **Development server**: run `npm start` from the [`root`](https://github.com/decentraland/builder/tree/master) path
- **Production**: run `npm run build` and host the resulting index.html file with your server of choice, for example `python -m SimpleHTTPServer 5000`

For more information, check the [create-react-app](https://github.com/facebook/create-react-app) repo.

## Environment

This project depends on a few environment variables to work, aswell as external services for some features.
The front-end connects to these services via URLs set via environment variables.

**Creating an environment file**

You'll need Create an `.env` file on the [`root`](https://github.com/decentraland/builder/tree/master) folder and fill it following the `.env.example` file found there.

You will need to specify `NODE_PATH` to be `src/` and you can check the [contract addresses](https://raw.githubusercontent.com/decentraland/contracts/gh-pages/addresses.json) for values like `REACT_APP_MANA_TOKEN_CONTRACT_ADDRESS`.

Here are the basic requirements to run the project:

```
# .env

NODE_PATH=src

REACT_APP_ASSETS_URL=https://builder-pack.now.sh
REACT_APP_CONTEST_URL= # Only useful if you want to run your own contest. If you do read the contest server section below
REACT_APP_CONTENT_SERVER_URL=https://content.decentraland.today/contents/

REACT_APP_LOCAL_STORAGE_KEY=builder-storage

# Third party

REACT_APP_SEGMENT_API_KEY=
REACT_APP_INTERCOM_APP_ID=
REACT_APP_ROLLBAR_ACCESS_TOKEN=

# Contracts

REACT_APP_MANA_TOKEN_CONTRACT_ADDRESS=0x2a8fd99c19271f4f04b1b7b9c4f7cf264b626edb # Ropsten address
```

## Contest server

If you want to run your own [contest](https://contest.decentraland.org/), you'll have to deploy your own [contest server](https://github.com/decentraland/builder-contest-server) to store the entries. You can find how to run the server on the [repo](https://github.com/decentraland/builder-contest-server).

Once you get that running, add the server URL to `REACT_APP_CONTEST_URL` on your `.env` file

## Asset packs

Every asset you're able to place on your scene (from the builder sidebar) belongs to an asset pack. An asset pack is a json file which points to a collection of assets.

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

## Content server

As noted above, the content server holds the actual assets, which might be comprised of `.glb` and `.png` files. This server is found on the `REACT_APP_CONTENT_SERVER_URL` environment variable.
