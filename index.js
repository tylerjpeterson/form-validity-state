'use strict';

var EventEmitter = require('events').EventEmitter;

/**
 * Constructor parses DOM and creates form objects collection used by instance
 *
 * @class FormValidityState
 *
 * @classdesc EventEmitter that monitors a form element's validity, applying classes and emitting events accordingly.
 *
 * @param {object} options Object instantiation options
 * @param {string} [options.invalidClass="invalid"] Class to be applied to invalid forms and inputs
 * @param {string} [options.selector="form[data-validation-state]"] Selector used to query participating form elements
 * @param {boolean} [options.autoInitialize=true] DOM is queried upon instantiation; set to false if you need to capture the initial "invalidated" event
 */
function FormValidityState(options) {
	/* istanbul ignore if  */
	if (!this._hasInlineValidation()) {
		return;
	}

	EventEmitter.call(this);

	this.forms = null;

	this.options = Object.assign({},
		FormValidityState.DEFAULTS,
		options || {});

	if (this.options.autoInitialize) {
		this.forms = this._collectForms();
	}
}

Object.assign(FormValidityState.prototype, EventEmitter.prototype);
module.exports = FormValidityState;

FormValidityState.DEFAULTS = {
	autoInitialize: true,
	invalidClass: 'invalid',
	selector: 'form'
};

/**
 * Determine if browser supports form field validation
 * @private
 * @return {boolean} Whether or not the browser supports form field validation
 */
FormValidityState.prototype._hasInlineValidation = function () {
	var f = document.createElement('input');
	return (f && f.validity);
};

/**
 * Manually initializes module in case event listeners should be tethered before initial validity state is established
 * @return {null}
 */
FormValidityState.prototype.initialize = function () {
	this.forms = this._collectForms();
};

/**
 * Destroys the instance, removing all event listeners and DOM references
 * @return {null}
 */
FormValidityState.prototype.destroy = function () {
	this.removeAllListeners();

	this.forms = this.forms.map(function (formObject) {
		formObject.inputs = formObject.inputs.map(function (input) {
			input.removeEventListener('change', formObject.bound.change);
			input.removeEventListener('input', formObject.bound.input);
			return null;
		});

		formObject.element.removeEventListener('submit', formObject.bound.submit);
		formObject.element = null;
		return null;
	});
};

/**
 * Query DOM for all matching form elements, create forms collection, and initialize state for each
 * @private
 * @return {array} Collection of form objects
 */
FormValidityState.prototype._collectForms = function () {
	var formObject = null;
	var inputs = null;
	var valid = null;

	var forms = Array.prototype.slice.call(
		document.querySelectorAll(this.options.selector));

	return forms.map(function (form) {
		inputs = Array.prototype.slice.call(form.elements);
		valid = true;

		formObject = {
			invalidClass: this.options.invalidClass,
			instance: this,
			inputs: inputs,
			element: form,
			valid: valid
		};

		formObject.bound = {
			change: this._change.bind(formObject),
			submit: this._submit.bind(formObject),
			input: this._input.bind(formObject)
		};

		inputs.forEach(function (input) {
			input.addEventListener('change', formObject.bound.change);
			input.addEventListener('input', formObject.bound.input);

			if (!input.validity.valid) {
				input.classList.add(this.options.invalidClass);
				valid = false;
			}
		}.bind(this));

		if (!valid) {
			formObject.element.classList.add(this.options.invalidClass);
			formObject.valid = false;

			/**
		     * The form-invalidated event is broadcast when a form's validity state changes from valid to invalid
		     * @event FormValidityState#form-invalidated
		     * @type {object}
		     *
		     * @property {object} data Emitted data object
		     * @property {event} data.evt Original event
		     * @property {object} data.formObject formObject of input that event was triggered from
		     */
			this.emit('form-invalidated', formObject);
		}

		form.addEventListener('submit', formObject.bound.submit);

		return formObject;
	}.bind(this));
};

/**
 * Submit event listener blocks form submission if any inputs have an invalid state
 * @private
 * @param  {event} evt Original submit event
 * @return {null}
 */
FormValidityState.prototype._submit = function (evt) {
	if (!this.valid) {
		/**
	     * The submit-blocked event is broadcast when a form's submission is prevented because it is in an invalid state
	     * @event FormValidityState#submit-blocked
	     * @type {object}
	     *
	     * @property {object} data Emitted data object
	     * @property {event} data.evt Original event
	     * @property {object} data.formObject formObject of input that event was triggered from
	     */
		this.instance.emit('submit-blocked', {evt: evt, formObject: this});
		evt.preventDefault();
		return;
	}

	/**
     * The submit-allowed event is broadcast when a form's submission is allowed because it is in a valid state
     * @event FormValidityState#submit-allowed
     * @type {object}
     *
     * @property {object} data Emitted data object
     * @property {event} data.evt Original event
     * @property {object} data.formObject formObject of input that event was triggered from
     */
	this.instance.emit('submit-allowed', {evt: evt, formObject: this});
};

/**
 * Change event listener to apply state-informed classes
 * @private
 * @param  {event} evt Original change event
 * @return {null}
 */
FormValidityState.prototype._change = function (evt) {
	FormValidityState.prototype._setStateClasses(evt, this);
	/**
     * The change event is broadcast when a field's "change" event is triggered
     * @event FormValidityState#change
     * @type {object}
     *
     * @property {object} data Emitted data object
     * @property {event} data.evt Original event
     * @property {object} data.formObject formObject of input that event was triggered from
     */
	this.instance.emit('change', {evt: evt, formObject: this});
};

/**
 * Input event listener to apply state-informed classes
 * @private
 * @param  {event} evt Original input event
 * @return {null}
 */
FormValidityState.prototype._input = function (evt) {
	FormValidityState.prototype._setStateClasses(evt, this);
	/**
     * The input event is broadcast when a field's "input" event is triggered
     * @event FormValidityState#input
     * @type {object}
     *
     * @property {object} data Emitted data object
     * @property {event} data.evt Original event
     * @property {object} data.formObject formObject of input that event was triggered from
     */
	this.instance.emit('input', {evt: evt, formObject: this});
};

/**
 * Sets an element's class based on its updated validity state
 * Updates element's containing form's classes if necessary
 * @private
 * @param {event} evt [description]
 * @param {object} obj [description]
 */
FormValidityState.prototype._setStateClasses = function (evt, obj) {
	var valid = obj.element.checkValidity();
	var method = valid ? 'remove' : 'add';
	obj.valid = method === 'remove';

	if (obj.valid && obj.element.classList.contains(obj.invalidClass)) {
		obj.element.classList[method](obj.invalidClass);
		/**
	     * The form-validated event is broadcast when a form's validity state changes from invalid to valid
	     * @event FormValidityState#form-validated
	     * @type {object}
	     *
	     * @property {object} data Emitted data object
	     * @property {event} data.evt Original event
	     * @property {object} data.formObject formObject of input that event was triggered from
	     */
		obj.instance.emit('form-validated', {evt: evt, formObject: obj});
	} else if (!obj.valid && !obj.element.classList.contains(obj.invalidClass)) {
		obj.element.classList[method](obj.invalidClass);
		/**
	     * The form-invalidated event is broadcast when a form's validity state changes from valid to invalid
	     * @event FormValidityState#form-invalidated
	     * @type {object}
	     *
	     * @property {object} data Emitted data object
	     * @property {event} data.evt Original event
	     * @property {object} data.formObject formObject of input that event was triggered from
	     */
		obj.instance.emit('form-invalidated', {evt: evt, formObject: obj});
	}

	/* istanbul ignore else if  */
	if (evt.target.validity.valid && evt.target.classList.contains(obj.invalidClass)) {
		evt.target.classList.remove(obj.invalidClass);
		/**
	     * The field-validated event is broadcast when a field's validity state changes from invalid to valid
	     * @event FormValidityState#field-validated
	     * @type {object}
	     *
	     * @property {object} data Emitted data object
	     * @property {event} data.evt Original event
	     * @property {object} data.formObject formObject of input that event was triggered from
	     */
		obj.instance.emit('field-validated', {evt: evt, formObject: obj});
	} else if (!evt.target.validity.valid && !evt.target.classList.contains(obj.invalidClass)) {
		evt.target.classList.add(obj.invalidClass);
		/**
	     * The field-invalidated event is broadcast when a field's validity state changes from valid to invalid
	     * @event FormValidityState#field-invalidated
	     * @type {object}
	     *
	     * @property {object} data Emitted data object
	     * @property {event} data.evt Original event
	     * @property {object} data.formObject formObject of input that event was triggered from
	     */
		obj.instance.emit('field-invalidated', {evt: evt, formObject: obj});
	}
};
