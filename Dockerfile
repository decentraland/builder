## Build Stage

FROM node:10.15.1 as base

# env vars for building
ENV NODE_PATH src
ENV REACT_APP_ASSETS_URL https://builder-packs-stg.now.sh
ENV REACT_APP_CONTENT_SERVER_URL https://content.decentraland.today/contents
ENV REACT_APP_DAR_URL https://schema-api-staging.now.sh/dar
ENV REACT_APP_INTERCOM_APP_ID z0h94kay
ENV REACT_APP_LOCAL_STORAGE_KEY builder
ENV REACT_APP_MANA_TOKEN_CONTRACT_ADDRESS 0x2a8fd99c19271f4f04b1b7b9c4f7cf264b626edb
ENV REACT_APP_ROLLBAR_ACCESS_TOKEN 46e4b7e45c844b9ab81315c8b0919e99
ENV REACT_APP_SEGMENT_API_KEY H21EgRI4eYwICDZf5uW6ek2BiykIR6wA
ENV REACT_BUILDER_SERVER_URL asd


# base packages
RUN \
  apt-get update && apt-get upgrade -y && \
  apt-get install -y build-essential g++

# use cached layer for node modules
ADD . /tmp
RUN mkdir -p /app
RUN cd /tmp && npm install && cp /tmp/node_modules/decentraland-ecs/artifacts/editor.js /tmp/public
RUN cp -a /tmp/node_modules /app/
RUN cp -a /tmp/public /app/
ADD . /app
ADD package.json /app/package.json
WORKDIR /app

# build and export the app
RUN npm run build

## Deploy Stage

FROM node:10.15.1

COPY  --from=base /app/build /public
