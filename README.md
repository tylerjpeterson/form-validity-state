# formValidityState
> EventEmitter that monitors a form element's validity, applying classes and emitting events accordingly.

This module will monitor all forms on a page matching the `selector` option, applying a class name `invalidClass` to invalid fields and the form itself.
The module also augments `EventEmitter`, providing more granular control to manage a form's state.

Form and field validity states are determined as fields are updated with native HTML5 form validation.
Therefore all validation rules (such as `required`, min/max values, and pattern matching) should be set directly in the HTML as they would be normally.

Form submission is prevented if a form is in an invalid state when submitted.
An event is emitted providing the original submit event as a parameter.
This allows the developer to prevent submission regardless of the form's state.


## Installation
Install via npm:

```sh
$ npm i form-validity-state -S
```


## Usage
Default implementation (auto-initialization):
```javascript
var FormState = require('form-validity-state');
var formState = new FormState();
```

Manual initialization:
```javascript
var FormState = require('form-validity-state');
var formState = new FormState({autoInitialize: false});

// Attach your listeners or whatever 
// else needs doing before the module
// queries the DOM and begins monitoring
formState.initialize();
```


## Options
| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options.invalidClass | <code>string</code> | <code>"invalid"</code> | Class to be applied to invalid forms and inputs |
| options.selector | <code>string</code> | <code>"form[data-validation-state]"</code> | Selector used to query participating form elements |
| options.autoInitialize | <code>boolean</code> | <code>true</code> | DOM is queried upon instantiation; set to false if you need to capture the initial "invalidated" event |



## Methods
#### `initialize()` ➝ null
Manually initializes module in case event listeners should be tethered before initial validity state is established


#### `destroy()` ➝ null
Destroys the instance, removing all event listeners and DOM references


## Events
#### `invalidated`
The invalidated event is broadcast when a form's validity state changes from valid to invalid

| Name | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | Emitted data object |
| data.evt | <code>event</code> | Original event |
| data.formObject | <code>object</code> | formObject of input that event was triggered from |

***

#### `submit-blocked`
The submit-blocked event is broadcast when a form's submission is prevented because it is in an invalid state

| Name | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | Emitted data object |
| data.evt | <code>event</code> | Original event |
| data.formObject | <code>object</code> | formObject of input that event was triggered from |

***

#### `submit-allowed`
The submit-allowed event is broadcast when a form's submission is allowed because it is in a valid state

| Name | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | Emitted data object |
| data.evt | <code>event</code> | Original event |
| data.formObject | <code>object</code> | formObject of input that event was triggered from |

***

#### `change`
The change event is broadcast when a field's "change" event is triggered

| Name | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | Emitted data object |
| data.evt | <code>event</code> | Original event |
| data.formObject | <code>object</code> | formObject of input that event was triggered from |

***

#### `input`
The input event is broadcast when a field's "input" event is triggered

| Name | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | Emitted data object |
| data.evt | <code>event</code> | Original event |
| data.formObject | <code>object</code> | formObject of input that event was triggered from |

***

#### `form-validated`
The form-validated event is broadcast when a form's validity state changes from invalid to valid

| Name | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | Emitted data object |
| data.evt | <code>event</code> | Original event |
| data.formObject | <code>object</code> | formObject of input that event was triggered from |

***

#### `form-invalidated`
The form-invalidated event is broadcast when a form's validity state changes from valid to invalid

| Name | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | Emitted data object |
| data.evt | <code>event</code> | Original event |
| data.formObject | <code>object</code> | formObject of input that event was triggered from |

***

#### `field-validated`
The field-validated event is broadcast when a field's validity state changes from invalid to valid

| Name | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | Emitted data object |
| data.evt | <code>event</code> | Original event |
| data.formObject | <code>object</code> | formObject of input that event was triggered from |

***

#### `field-invalidated`
The field-invalidated event is broadcast when a field's validity state changes from valid to invalid

| Name | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | Emitted data object |
| data.evt | <code>event</code> | Original event |
| data.formObject | <code>object</code> | formObject of input that event was triggered from |
