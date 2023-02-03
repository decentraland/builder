Smart Items
===

- [Definition](#definition)
  - [Manifest](#manifest)
    - [Model](#model)
    - [Parameters](#parameters)
    - [Actions](#actions)
  - [Script](#script)
    - [init](#init)
    - [spawn](#spawn)
    - [channel](#channel)
      - [Send actions](#send-actions)
      - [Handle actions](#handle-actions)
      - [Sync state](#sync-state)
    - [inventory](#inventory)
- [Execution](#execution)
  - [Distribution](#distribution)
  - [Importing](#importing)
  - [Running](#running)
- [Development & Debugging](#development--debugging)

# Definition

Smart Items are Builder items that can be configured by the user. They may expose parameters and actions, and these actions can be connected between items to create interactivity (ie. a lever that opens a door).

![example-smart-item](https://user-images.githubusercontent.com/2781777/101214934-a00c0c00-365b-11eb-8a89-c3a2c097729d.gif)

Each smart item contains a manifest (aka `asset.json`) that defines its configuration parameters (it's useful to generate UIs), and a script (aka `item.ts`) that executes its behavior on runtime.

## Manifest

Each smart item contains an `asset.json` manifest where it defines its static properties:

- `id`: Just a uuid
- `name`: the name of the smart item
- `category`: one of the following categories: `"nature"`, `"structures"` or `"decorations"`
- `tags`: an array of tags used for search, like `["button", "sci-fi"]`
- `model`: this is a path to the GLFT or GLB that will be used as a placeholder, when the user is in editor mode
- `parameters`: A list of parameters that will later generate a UI in the builder
- `actions`: A list of actions that can be connected by other smart items

### Model

The model, also known as "placeholder", is just a path to a GLB or GLTF model that the Builder will use while the user is in Editor mode to show the placement of the smart item. The user will be able to drag around the placeholder to position the smart item where desired, and then this X, Y, Z position will be used to create the `Transform` component where we will spawn the smart item instance on runtime.

### Parameters

A parameter is a value that the user can configure externally (ie. via the Builder UI). Every parameter has an `id` (that must be unique within the asset's parameters), a `label`, a `type` and optionally have a `default` value and a `description`, for example:

```
{
  id: "message",
  label: "Sign Post Message",
  type: "text"
}
``` 

#### Types

There are 9 types of parameters, and some of them can have some extra properties:

1) `boolean`: It will render a toggle UI, allowing the user to select a `true` or `false` value.
2) `text`: It will render a single line text input field that will take a `string` value.
3) `textarea`: It will render a text area (multi-line) input field that will take a `string` value.
4) `float`: It will render a numeric input field that will take a `number` value.
5) `integer`: It will render a numeric input field that will take a `number` value and they will always be integers.
6) `slider`: It will render a slider that will take a `number` value. It needs the following extra properties: `min`, `max` and `step`, for example:

```
// asset.json
{
  ...
  "parameters": [
    {
      "id": "speed",
      "label": "Speed",
      "type": "slider",
      "default": 2,
      "min": 1,
      "max": 5,
      "step": 0.5
    },
  ]
}
```

7) `options`: It will render a dropdown where the user can pick an option that will take a `string` value. It needs an extra property `options` where you must specify an array of options with `label` and `value` , for example:

```
{
  "parameters": [
    {
      "id": "size",
      "label": "T-Shirt Size",
      "type": "options",
      "default": "M",
      "options": [
        {
          "label": "Extra Large",
          "value": "XL"
        },
        {
          "label": "Large",
          "value": "L"
        },
        {
          "label": "Medium",
          "value": "M"
        },
        {
          "label": "Small",
          "value": "S"
        }
      ]
    },
  ]
}
```

8) `entity`: It will render an entity selector, which is a dropdown with all the entities in the scene with a search filter. The value of this parameter will be a `string` that will consist on the `entity.name` selected by the user.

9) `actions`: This is one of the most important parameters, because it's what allows smart items to interact with each other. It will render an action selector, which consists on two dropdowns: The first one will list all the smart items in the scene, and once one is selected, the second dropdown will list all the actions exposed by that smart item. Finally once the action is selected, if the action has `parameters` as well, a UI will be rendered for the user to configure those parameters, that will follow the same rules as the `asset.json` parameters described in this section.

The `default` value of a parameter of type `actions` can be the `id` of an action from the asset itself (how to define actions is explained in the next section). For example if we have a `Door` smart item, with two actions (`open` and `close`) and a parameter `onClick` of type `actions` we can set its `default` value to be `open`, so by default the door will open when clicked, but it can be changed by removing the action using the UI, like this:

```
// asset.json for Door
{
  ...
  "parameters": [
    {
      "id": "onClick",
      "label": "When Clicked",
      "type": "actions",
      "default": "open"
  ],
  "actions": [
    {
      "id": "open",
      "label": "Open",
      "parameters": []
    },
    {
      "id": "close",
      "label": "Close",
      "parameters": []
    }
  ]
}
```

The value of this parameter will be an array of objects (aka `AssetActionValue[]`), each object containing the following:

- `entityName`: The `entity.name` of the smart item to which we want to trigger an action from.
- `actionId`: The `id` of the action from that smart item that we want to trigger.
- `values`: An object that contains the values for the parameters of that action. Since any of those parameters could be of type `actions` this is a recursive definition.

These would be the TypeScript typings for that object:

```ts
type AssetActionValue = {
  entityName: string
  actionId: string
  values: Record<string, AssetParameterValue>
}

type AssetParameterValue = string | number | boolean | AssetActionValue[]
```

For example, the Fantasy Lever smart item has an `onActivate` parameter that is of type `actions`:

```
// asset.json for Fantasy Lever
{
  "parameters": [
    {
      "id": "onActivate",
      "label": "When Activated",
      "type": "actions"
  ]
}
```

And this Toolbox smart item has an action with the following parameters (actions are explained in depth in the next section):

```
// asset.json for Toolbox
 {
  ...
  "actions": [
    {
      "id": "rotate",
      "label": "Rotate Item",
      "parameters": [
        {
          "id": "target",
          "label": "Item",
          "type": "entity"
        },
        {
          "id": "x",
          "label": "X",
          "type": "float",
          "default": 0
        },
        {
          "id": "y",
          "label": "Y",
          "type": "float",
          "default": 0
        },
        {
          "id": "z",
          "label": "Z",
          "type": "float",
          "default": 0
        },
        ...
    ]
  }
}
```

And that generates the following UI:

![example-parameters](https://user-images.githubusercontent.com/2781777/101219321-d731eb80-3662-11eb-86d6-563487157621.gif)

Notice that this parameter type is called `actions` in plural and the value is an `AssetActionValue[]` which means we could add more than one action to it. In the UI to do this we would click on the red `+` icon to the right to keep stacking more actions for when that lever activates.

### Actions

An action is something that a smart item can do, that can be triggered by another smart item. For instance we could create a `Door` smart item that has the actions `open` and `close`, which can then be triggered by another smart item (or by the Door itself).

Every `action` has an `id`, a `label` and a list of `parameters`, for example a `Door` smart item could have actions to open and close:

```
// asset.json
{
  ...
  "actions": [
    {
      "id": "open",
      "label": "Open",
      "parameters": []
    },
    {
      "id": "close",
      "label": "Close",
      "parameters": []
    }
  ]
}
```

Notice that those actions don't have any parameters, but if we wanted for instance make the `speed` on which the `Door` opens configurable, we could do it by adding a parameter:

```
// asset.json
{
  ...
  "actions": [
    {
      "id": "open",
      "label": "Open",
      "parameters": [
        {
          "id": "speed",
          "label": "Speed",
          "type": "integer",
          "default": 2
        }
      ]
    },
    {
      "id": "close",
      "label": "Close",
      "parameters": []
    }
  ]
}
```

Now, if we used Fantasy Lever `onActivate` parameter, we could pick an action from our `Door` smart item, and once we do, the Builder will generate a UI for us to configure the `speed` parameter of that action:

![example-actions](https://user-images.githubusercontent.com/2781777/101222549-bc627580-3668-11eb-8b1b-7945965e80fd.gif)

## Script

Each smart item contains a script file, which is written in TypeScript using Decentraland's SDK (usually called `item.ts`). This script must do a default export of the following interface:

```ts
interface IScript<T extends {}> {
  init(args: { inventory: IInventory }): void
  spawn(host: Entity, props: T, channel: IChannel): void
}
```

This interface exposes the two lifecycles of a smart item, and it can be imported from the `decentraland-builder-scripts` package:

```ts
import { IScript } from 'decentraland-builder-scripts/types`

type Props = {
  // some configuration properties for my item
}

export default class MySmartItem extends IScript<Props> {
  init({ inventory }) {
    //...
  }
  
  spawn(host, props, channel) {
    //...
  }
}
```

### init

The `init` method of a script is called only once, no matter how many instances of the smart item are present in the scene, and should be called as soon as the scene is loaded, providing the required arguments, which consist of an object with an `inventory` instance inside. In order to create an `inventory` instance you can import the implementation from the `decentraland-builder-scripts` package as follows:

```ts
import { createInventory } from 'decentraland-builder-scripts/inventory'

const inventory = createInventory(UICanvas, UIContainerStack, UIImage) // UICanvas, UIContainerStack and UIImage are globally accessible classes from the SDK
```

For a smart item developer, the `init` lifecycle is the time to start systems if needed, and also to make use of the `inventory` if necessary (we will dig into how to use the `inventory` in a later section). For example this is a

### spawn

The `spawn` method of a script is called once per instance of the smart item in the scene (for example if I have a scene with 3 `Door` smart item the scene will need to call `Door.spawn(...)` three times, one for each instance). The arguments provided to the `spawn` method are:

- `host`: an SDK `Entity` that the smart item will have at disposal to do whatever it wants. This entity should be already positioned in the right place with a `Transform` component, so the smart item script doesn't need to worry about where in the scene it should be, it can just use that entity (ie, add a `GLTFShape` to it), or create new entities and attach them as children of the `host` entity. The script could also choose not to use this entity at all, for example the `Tools` smart item only starts different systems that can be used as helpers to create some interactivity, but it doesn't appear as _something_ in the scene.

- `props`: these are the values for the [parameters](#parameters) configured by the user (ie, using the Builder UI). So for instance lets say our `Door` smart item has a parameter `isLocked` that is of type `boolean` and is used to determine if the door can be opened or not, and the user used the Builder UI to toggle this parameter on, then when we spawn that smart item from our scene we should provide the argument props as `{ isLocked: true }`.

- `channel`: The channel is an abstraction that's used to orchestrate actions between smart items and across peers in the same scene. In order to spawn a smart item we always need to provide a channel instance (the next section explains how to use the `channel` from within a smart item).
In order to instantiate a `channel` to be able to `spawn` a smart item, we can use the `createChannel` implementation from `decentraland-builder-scripts`. We will need the following arguments:  
  - `peerId`: This is an `id` that should be that same for all the channels in the scene, but different between scenes running on different peers (browsers). We can just create a random id when the scene is started and use that one on all our channels for that scene.  
  - `host`: The `entity` that's used as host for the smart item instance.  
  - `bus`: a `MessageBus` instance, it should be the same for all the channels in a scene.
 
  Let's see a full example of the life cycles of our `Door` smart item, with two instances on the same scene:  
  
  ```ts  
  /* src/game.ts */

  // import helpers
  import { createInventory } from 'decentraland-builder-scripts/inventory'
  import { createChannel } from 'decentraland-builder-scripts/channel'

  // import smart item script
  import Door from './path/to/door/item.ts`

  // these are the things that we only need 1 for the whole scene
  const peerId = Math.random().toString() // or create a UUID, or use the user identity, as long as it's unique per user session per scene it will be fine
  const bus = new MessageBus()
  const inventory = createInventory(UICanvas, UIContainerStack, UIImage)

  // init the smart items' scripts. If we had other smart items in the scene we would init them all here
  Door.init({ inventory })

  // now we can spawn the instances for all the smart items in the scene, here we will spawn two doors:

  // spawn the front door
  const frontDoor = new Entity('frontDoor') // create the host entity
  frontDoor.addComponent(new Transform({ position: new Vector3(4, 0, 2) })) // position the host entity
  Door.spawn(frontDoor, { isLocked: true }, createChannel(peerId, frontDoor, bus)) // spawn front door

  // spawn the back door
  const backDoor = new Entity('backDoor') // create the host entity
  backDoor.addComponent(new Transform({ position: new Vector3(4, 0, 10) }))
  Door.spawn(backDoor, { isLocked: false }, createChannel(peerId, backDoor, bus))
  ```  
    
### channel

The `channel` is what is used to send and handle actions between smart items and peers connected to the same scene, and also it can be used to sync the initial state of a smart item by requesting data to the other connected peers (if any).

#### Send actions

If we want our smart item to be able to trigger actions from other smart items, we learned we can do so by defining [parameters](#parameters) of type `actions`, for example, let's say we have a `Button` smart item that can trigger actions from other smart items when it's clicked. We could define the following parameters for it:

```
// asset.json
{
  ...
  name: "Button",
  parameters: [
    {
      id: 'onClick',
      label: 'When Clicked',
      type: 'actions'
    }
  ]
}
```

Then we need to code this actual behaviour into our `item.ts` script file, and we can do so using the `channel.sendActions()` helper:

```ts
// item.ts
import { IScript, Actions } from 'decentraland-builder-scripts/types'

type Props = {
  onClick: Actions
}

export default class Button extends IScript<Props> {
  init({ inventory }) {
    // this item doesn't have systems and doesn't use the inventory so nothing to do here
  }
  
  spawn(host, props, channel) {
    const button = new Entity() // create entity for the button
    button.setParent(host) // attach to host to inherit it's position
    button.addComponent(new GLTFShape('path/to/button.glb')) // add a model to the entity
    host.addComponent(
      new OnPointerDown(
        () => channel.sendActions(props.onClick), // send actions using the channel when button is clicked
        {
          button: ActionButton.POINTER,
          hoverText: 'Press',
          distance: 6
        }
      )
    )
    
  }
}
```

#### Handle actions

The `channel` is also the abstraction used to handle an action when it's triggered by another smart item. For example lets go back to the `Door` smart item, it has two actions: `open` and `close`. Those actions can be triggered by any smart item (could be the `Door` instance itself or another smart item, like a Lever that when pulled opens a Door). 

We use the `channel.handleAction` helper for this:

```ts
// item.ts

export default class Door extends IScript<{ /* ... */ }> {
  init() { /* ... */  }
  spawn(host, props, channel) {
    // ...
    channel.handleAction('open', ({ sender }) => {
      // play open animation
    })
    
    channel.handleAction('close', ({ sender }) => {
      // play open animation
    })
  }
}
```

This will handle an action when it's broadcasted through a channel using `channel.sendActions(...)` (see [section above](#send-actions)). Since actions that are broadcasted that way will not only reach other smart items in the scene for the current user, but also other users in the scene, the callback that we pass to `channel.handleActions` receives a `sender` that can be used to know if that actions is coming from the same user or a different one. When we open a door we don't care about who opened it, because we want everybody else on the scene to see that the door just opened. But there are other actions that we want to keep just for the player who triggered it, for example, let's say we create a smart item that can be equipped, we want to make sure only the user who triggered that action actually gets the item equipped, so we can do so like this:

```ts
channel.handleAction('equip', ({ sender }) => {
  if (sender === channel.id) {
    // this will only be run by the channel who sent this action
  }
})
```

#### Sync state

We can also use the `channel` to sync the initial state of our smart item instances. For example, let's say a user visits a scene with a Door smart item, and it opens it. Then another user teleports to the scene. The second user will see the Door closed and the first one will see it open. We can use the `channel` to synchronize the state of the second user with first one by using `channel.request` and `channel.reply` helpers:

```ts
// item.ts

export default class Door extends IScript<{ /* ... */ }> {
  isOpen = false
  toggle(isOpen: boolean) {
    this.isOpen = isOpen
    if (isOpen) {
      // play open animation
    } else {
      // play close animation
    }
  }
  init() { /* ... */  }
  spawn(host, props, channel) {
    // ...
    channel.handleAction('open', () => this.toggle(true))
    channel.handleAction('close', () => this.toggle(false))
    
    // sync initial state
    
    // this will be executed by the second user, once other user replies back with their value for "isOpen", to update the initial state of its own "isOpen"
    channel.request<boolean>('isOpen', value => this.toggle(value)) 
    // this will be executed by the first user replying with their current value for "isOpen"
    channel.reply<boolean>('isOpen', () => this.isOpen) 
  }
}
```

## inventory

The inventory is an abstraction used to orchestrate the UI space and prevent some smart items to overlap with other when adding stuff to the user's screen. It is especially useful for example for items that can be equipped, and when doing so, they display some image on the screen indicating that the user is carrying it.

It is passed to each smart item via the [init](#init) lifecycle, and it has the following methods:

- `inventory.add(key: string, texture: UITexture): void`: This will add an item to the inventory. You need to provide a `key` that can be used to check if an item is equipped or to remote it, and a `texture`, which is the image used to display this equipped item on screen, it has to be a 256x256px `.png` file, ie:  
  ```ts
  const swordImage = new Texture('images/sword.png')
  inventory.add('sword', swordImage)
  ```

- `inventory.has(key: string): boolean`: Return either `true` or `false` if a `key` is currently added to the inventory.

- `inventory.remove(key: string): void`: Removes an item from the inventory by `key`.

# Execution

This section aims to explain how smart item scripts are distributed, loaded and executed in runtime.

## Distribution

Smart item's script files are compiled into AMD JavaScript files. That means that the `item.ts` is converted into `.js` file that looks like this:

```js
define('item', [], () => {
  class MySmartItem { /* ... */ }
  // ...
  return MySmartItem
})
```

That file is then uploaded along with all the other scene assets to a Catalyst peer when the scene is deployed.
If you create a scene with the CLI using `dcl init` and then create a `src/item.ts` file with a smart item in that scene, you can compile it by running `dcl pack` and that will generate an `item.zip` file with all the assets required to distribute that smart item, including the `.js` file in AMD format.

## Importing

In order to import the smart item script in runtime we need to fetch it from the content server and the load it using an AMD loader. 
We inject this [tiny AMD loader](https://github.com/decentraland/builder/blob/master/src/ecsScene/amd-loader.js.raw) at the beginning of the scene file when we deploy it, and then this [remote loader](https://github.com/decentraland/builder/blob/master/src/ecsScene/remote-loader.js.raw) to do the fetching + loading of the module (on next section there's a full example that shows how to use this helper).

## Running

Finally once we have imported the smart item scripts we can [init](#init) them and [spawn](#spawn) all the instances. 
This is an example the one in the [channel](#channel) section where we spawn two `Door` instances, but instead of importing the scripts from the file system, we load and run them from a deployed scene:

```js
/* bin/game.js */

/* At the beginning of the scene we inject: the SDK, the AMD loader, and the remote loader helper described in the previous section, and the createChannel and createInvetory helpers from the `decentraland-builder-scripts` package */

async function main() {
  // load the smart item script
  const hash = 'Qmabcd' // this is the hash of the smart item script js file in the content server
  const Door = await getScriptInstance(hash) // this helper comes from the remote loader helper injected at the beginning 

  // these are the things that we only need 1 for the whole scene
  const peerId = Math.random().toString() // or create a UUID, or use the user identity, as long as it's unique per user session per scene it will be fine
  const bus = new MessageBus()
  const inventory = createInventory(UICanvas, UIContainerStack, UIImage)

  // init the smart items' scripts. If we had other smart items in the scene we would init them all here
  Door.init({ inventory })

  // now we can spawn the instances for all the smart items in the scene, here we will spawn two door:

  // spawn the front door
  const frontDoor = new Entity('frontDoor') // create the host entity
  frontDoor.addComponent(new Transform({ position: new Vector3(4, 0, 2) })) // position the host entity
  Door.spawn(frontDoor, { isLocked: true }, createChannel(peerId, frontDoor, bus)) // spawn front door

  // spawn the back door
  const backDoor = new Entity('backDoor') // create the host entity
  backDoor.addComponent(new Transform({ position: new Vector3(4, 0, 10) }))
  Door.spawn(backDoor, { isLocked: false }, createChannel(peerId, backDoor, bus))
}

main()
```

# Development & Debugging

In order to develop and debug a smart item, you should start creating an empty decentraland project.

First, install/updated the Decentraland CLI if you haven't already:

```
npm install -g decentraland
```

Create an empty folder and initialize the project

```
mkdir my-smart-item
cd my-smart-item
dcl init
```

Install the `decentraland-builder-scripts` package

```
npm install decentraland-builder-scripts
```

Add the typings to the `tsconfig.json` file

```
{
  "compilerOptions": {
    "outFile": "./bin/game.js",
    "allowJs": true
  },
  "include": [
    "src/**/*.ts",
    "./node_modules/decentraland-builder-scripts/types.d.ts"
  ],
  "extends": "./node_modules/decentraland-ecs/types/tsconfig.json"
}
```

Create an `asset.json` file where we will write the manifest for our smart item. Let's create a button that can trigger another smart item actions, with a custom hover text.

```
{
  "id": "51ff7609-407f-481d-991b-8449ef59b390",
  "name": "My Button",
  "tags": ["button"],
  "category": "decorations",
  "parameters": [
    {
      "id": "onClick",
      "label": "When clicked",
      "type": "actions"
    },
    {
      "id": "hoverText",
      "label": "Hover Text",
      "type": "text",
      "default": "Click Me"
    }
  ]
}
```

Create an `src/item.ts` file where you will create and export default a smart item following the `IScript` interface, for example a Button:

```
// src/item.ts

export type Props = {
  hoverText: string
  onClick?: Actions
}

export default class Button implements IScript<Props> {

  init() {}

  spawn(host: Entity, props: Props, channel: IChannel) {
    const button = new Entity()
    button.setParent(host)

    button.addComponent(new GLTFShape('models/button.glb'))

    button.addComponent(
      new OnPointerDown(
        () => channel.sendActions(props.onClick),
        {
          button: ActionButton.POINTER,
          hoverText: props.hoverText',
          distance: 6
        }
      )
    )
  }
}
```

Now in order to be able to debug our smart item, we can use the `Spawner` helper in the `src/game.ts` file should already be created:

```
// src/game.ts

import { Spawner } from '../node_modules/decentraland-builder-scripts/spawner'
import Button, { Props } from './item'

const button = new Button()
const spawner = new Spawner<Props>(button)

spawner.spawn(
  'button',
  new Transform({
    position: new Vector3(4, 0, 8)
  }),
  {
    hoverText: "Testing"
  }
)
```

Finally we can run `dcl start` and we should be taken to a browser with the Decentraland client running, and we should see our button in the middle of the scene. If we get close to it and hover it we should see the text `"Testing"` that we configured in out `game.ts` file!

If you want to see real world examples of smart items you can always check the [smart items repo](https://github.com/decentraland/smart-items)
