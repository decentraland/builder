Smart Items
===

- [Definition](#definition)
  - [Manifest](#manifest)
    - [Model](#model)
    - [Parameters](#parameters)
    - [Actions](#actions)
  - Script
    - init
    - spawn
    - channel
      - Send Actions
      - Handle Actions
      - Sync State
    - inventory
- Execution
  - How to distribute
  - How to load
  - How to run
- Development & Debugging 

# Definition

Smart Items are Builder items that can be configured by the user. They may expose parameters and actions, and these action can be connected between items to create interactivity (ie. a lever that opens a door).

![example-smart-item](https://user-images.githubusercontent.com/2781777/101214934-a00c0c00-365b-11eb-8a89-c3a2c097729d.gif)

Each smart items contains a manifest (aka `asset.json`) that defines its static characteristics (it's useful to generate UIs to configure it), and a script (aka `item.ts`) that executes its behavior on runtime.

## Manifest

Each smart item contains an `asset.json` manifest where it defines its static properties:

- `id`: Just a uuid
- `name`: the name of the smart item
- `model`: this is a path to the GLFT or GLB that will be used as a placeholder, when the user is in editor mode
- `parameters`: A list of parameters that will later generate a UI in the builder
- `actions`: A list of action that can be connected by other smart items

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
  "paramters": [
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
  "paramters": [
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

9) `actions`: This is one of the most important parameters, because it what allows smart items to interact with each other. It will render an action selector, which consists on two dropdowns: The first one will list all the smart items in the scene, and once one is selected, the second dropdown will list all the actions exposed by that smart item. Finally once the action is selected, if the action has `parameters` as well, a UI will be rendered for the user to configure those parameters, that will follow the same rules as the `asset.json` parameters described in this section.

The `default` value of a parameter of this type can be the `id` of an action from this asset (how to define actions is explained in the next section).

The value of this parameter will be an array of objects (aka `AssetActionValue[]), each object containing the following:

- `entityName`: The `entity.name` of the smart item to which we want to trigger an action from.
- `actionId`: The `id` of the action from that smart item that we want to trigger.
- `values`: An object that contains the values for the parameters of that action. Since any of those parameters could be of type `actions` this is a recursive definition.

These would be the TypeScript typing for that object:

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
  "paramters": [
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
