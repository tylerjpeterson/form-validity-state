module.exports = [
	['<form id="valid-form" data-validation-state novalidate>',
		'<input type="checkbox" name="checkbox-input">',
		'<input type="text" name="text-input">',
		'<select name="select-input" required>',
			'<option value="">invalid</option>',
			'<option value="select-valid" selected>valid</option>',
		'</select>',
		'<input type="number" name="number-input" min="0" max="10" step="1">',
		'<input type="date" name="date-input" value="">',
		'<input type="email" name="email-input" value="">',
		'<input type="submit" value="submit form">',
	'</form>'].join(''),
	['<form id="invalid-form" data-validation-state novalidate onsubmit="window.location.hash=\'submitted\'; return false;">',
		'<input type="checkbox" name="checkbox-input" required>',
		'<input type="text" name="text-input" required>',
		'<select name="select-input" required>',
			'<option value="">invalid</option>',
			'<option value="select-valid">valid</option>',
		'</select>',
		'<input type="number" name="number-input" min="0" max="10" step="1" value="12" required>',
		'<input type="date" name="date-input" value="" required>',
		'<input type="email" name="email-input" value="" required>',
		'<input type="submit" value="submit form">',
	'</form>'].join('')].join('\n');