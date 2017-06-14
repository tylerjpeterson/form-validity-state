'use strict';

let test = require('tape');
const markup = require('./markup');
const beforeEach = require('./before-after').beforeEach;
const afterEach = require('./before-after').afterEach;
const FormValidityState = require('./../../');

let formValidityState = null;
let invalidForm = null;
let validForm = null;

test = beforeEach(test, assert => {
	document.body.innerHTML = markup;
	invalidForm = document.getElementById('invalid-form');
	validForm = document.getElementById('valid-form');
	formValidityState = new FormValidityState();
	assert.end();
});

test = afterEach(test, assert => {
	document.body.innerHTML = '';
	assert.end();
});

test('Should export a constructor', assert => {
	assert.equal(typeof FormValidityState, 'function', 'exports a constructor');
	assert.equal(typeof formValidityState, 'object', 'instantiates to an object');
	assert.end();
});

test('Should initialize with proper state', assert => {
	const invalidInputs = invalidForm.querySelectorAll('.invalid');
	assert.equal(invalidInputs.length, 6, 'all invalid fields have invalid class');
	assert.equal(invalidForm.classList.contains('invalid'), true, 'invalid form has invalid class');
	assert.equal(validForm.classList.contains('invalid'), false, 'valid form does not have invalid class');
	assert.end();
});

test('Should validate / invalidate fields properly', assert => {
	const textInput = invalidForm.querySelector('input[name="text-input"]');
	const changeEvt = document.createEvent('HTMLEvents');
	const inputEvt = document.createEvent('HTMLEvents');
	let inputs = null;

	changeEvt.initEvent('change', false, true);
	inputEvt.initEvent('input', false, true);

	textInput.value = 'valid';
	textInput.dispatchEvent(changeEvt);
	inputs = invalidForm.querySelectorAll('.invalid');
	assert.equal(inputs.length, 5, 'number of invalid elements reduced by 1');

	invalidForm.querySelector('input[name="text-input"]').value = 'valid';
	invalidForm.querySelector('select[name="select-input"]').getElementsByTagName('option')[1].selected = 'selected';
	invalidForm.querySelector('input[name="number-input"]').value = 1;
	invalidForm.querySelector('input[name="date-input"]').value = '2017-12-31';
	invalidForm.querySelector('input[name="email-input"]').value = 'test@test.com';
	invalidForm.querySelector('input[name="checkbox-input"]').checked = true;

	invalidForm.querySelector('input[name="text-input"]').dispatchEvent(changeEvt);
	invalidForm.querySelector('select[name="select-input"]').dispatchEvent(changeEvt);
	invalidForm.querySelector('input[name="number-input"]').dispatchEvent(changeEvt);
	invalidForm.querySelector('input[name="date-input"]').dispatchEvent(inputEvt);
	invalidForm.querySelector('input[name="email-input"]').dispatchEvent(changeEvt);
	invalidForm.querySelector('input[name="checkbox-input"]').dispatchEvent(inputEvt);

	inputs = invalidForm.querySelectorAll('.invalid');
	assert.equal(inputs.length, 0, 'newly valid fields do not have invalid class');

	changeEvt.initEvent('change', false, true);

	validForm.querySelector('input[name="number-input"]').value = 100;
	validForm.querySelector('input[name="number-input"]').dispatchEvent(changeEvt);

	inputs = validForm.querySelectorAll('.invalid');
	assert.equal(inputs.length, 1, 'newly invalid fields do have invalid class');
	assert.end();
});

test('Should block and allow form submissions', assert => {
	const location = window.location.url;
	const submitEvt = document.createEvent('HTMLEvents');
	submitEvt.initEvent('submit', false, true);

	invalidForm.dispatchEvent(submitEvt);
	assert.equal(location, window.location.url, 'submission blocked, url unchanged');

	validForm.dispatchEvent(submitEvt);
	assert.equal(window.location.hash, '#submitted', 'submission allowed, url updated');
	assert.end();
});

test('Should not initialize if not auto-initialized', assert => {
	formValidityState = new FormValidityState({autoInitialize: false});

	assert.equal(formValidityState.forms, null, 'initialization has not occurred');
	formValidityState.initialize();

	assert.equal(formValidityState.forms.length, 2, 'initialization has occurred');
	assert.end();
});

test('Should emit form state events', assert => {
	const submitEvt = document.createEvent('HTMLEvents');
	submitEvt.initEvent('submit', false, true);
	assert.plan(2);

	formValidityState = new FormValidityState({autoInitialize: false});

	formValidityState.on('form-invalidated', data => {
		assert.equal(data.valid, false, '"invalidated" emitted');
	});

	formValidityState.on('submit-blocked', data => {
		assert.equal(data.evt.defaultPrevented, true, '"submit-blocked" emitted');
	});

	formValidityState.initialize();
	invalidForm.dispatchEvent(submitEvt);
});

test('Should emit field events', assert => {
	const checkboxField = invalidForm.querySelector('input[name="checkbox-input"]');
	const textField = invalidForm.querySelector('input[name="text-input"]');
	const changeEvt = document.createEvent('HTMLEvents');
	const inputEvt = document.createEvent('HTMLEvents');

	assert.plan(2);

	formValidityState.on('change', data => {
		assert.equal(data.evt.target,
			textField, '"change" event emitted');
	});

	formValidityState.on('input', data => {
		assert.equal(data.evt.target,
			checkboxField, '"input" event emitted');
	});

	changeEvt.initEvent('change', false, true);
	inputEvt.initEvent('input', false, true);
	checkboxField.dispatchEvent(inputEvt);
	textField.dispatchEvent(changeEvt);
});

test('Should destroy properly', assert => {
	formValidityState.on('form-invalidated', data => {});
	formValidityState.destroy();

	assert.looseEqual(formValidityState.forms, [null, null], 'form collections are un-referenced');
	assert.equal(formValidityState.listenerCount(), 0, 'all event listeners are removed');
	assert.end();
});

window.close();
