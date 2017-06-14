'use strict';

const beforeEach = (test, handler) => {
	return (name, listener) => {
		test(name, assert => {
			const _end = assert.end;

			assert.end = () => {
				assert.end = _end;
				listener(assert);
			};

			handler(assert);
		});
	};
};

const afterEach = (test, handler) => {
	return (name, listener) => {
		test(name, assert => {
			const _end = assert.end;

			assert.end = () => {
				assert.end = _end;
				handler(assert);
			};

			listener(assert);
		});
	};
};

module.exports = {
	afterEach,
	beforeEach
};
