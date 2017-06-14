'use strict';

var FormValidityState = require('./../../../');

var state = new FormValidityState();
var reporter = document.getElementById('reporter');

state.on('submit-allowed', function (data) {
	reporter.innerHTML = ' "submit-allowed" form event<hr>' + reporter.innerHTML;
});

state.on('submit-blocked', function (data) {
	reporter.innerHTML = ' "submit-blocked" form event<hr>' + reporter.innerHTML;
});

state.on('field-validated', function (data) {
	reporter.innerHTML = ' "field-validated" field event<hr>' + reporter.innerHTML;
});

state.on('field-invalidated', function (data) {
	reporter.innerHTML = ' "field-invalidated" field event<hr>' + reporter.innerHTML;
});

state.on('form-invalidated', function (data) {
	reporter.innerHTML = ' "invalidated" form event<hr>' + reporter.innerHTML;
});

state.on('form-validated', function (data) {
	reporter.innerHTML = ' "validated" form event<hr>' + reporter.innerHTML;
});
