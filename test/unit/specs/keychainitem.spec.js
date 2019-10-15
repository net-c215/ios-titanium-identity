const isIOS = Ti.Platform.osname === 'iphone' || Ti.Platform.osname === 'ipad';
const Identity = require('ti.identity');

let KeychainItem;

describe('ti.identity.KeychainItem', () => {
	it('can be created', () => {
		KeychainItem = Identity.createKeychainItem({ identifier: 'password' });

		expect(KeychainItem).toBeDefined();
	});

	it('.apiName', () => {
		expect(KeychainItem.apiName).toBe('Ti.Identity.KeychainItem');
	});

	describe('methods', () => {
		describe('#save()', () => {
			it('is a Function', () => {
				expect(KeychainItem.save).toEqual(jasmine.any(Function));
			});

			it('first save event with success if initial value', finish => {
				// reset first just to make sure, then save a value
				function reset(obj) {
					KeychainItem.removeEventListener('reset', reset);

					// Now save the value
					function save(obj) {
						KeychainItem.removeEventListener('save', save);
						try {
							expect(obj.success).toEqual(true);
							expect(obj.code).toEqual(0);
							expect(obj.identifier).toEqual('password');
							finish();
						} catch (err) {
							finish(err);
						}
					}

					KeychainItem.addEventListener('save', save);
					KeychainItem.save('s3cr3t_p4$$w0rd');
				}
				KeychainItem.addEventListener('reset', reset);
				KeychainItem.reset();
			});

			if (isIOS) {
				it('fires save event with error if a value already exists', finish => {
					function save(obj) {
						KeychainItem.removeEventListener('save', save);
						try {
							expect(obj.success).toEqual(false);
							expect(obj.code).not.toEqual(0);
							// expect(obj.identifier).toEqual('password'); // undefined on iOS
							finish();
						} catch (err) {
							finish(err);
						}
					}

					KeychainItem.addEventListener('save', save);
					KeychainItem.save('s3cr3t_p4$$w0rd');
				});
			}

			// TODO: Test with other types like numbers?

			it('throws with no arguments', () => {
				function foo () {
					KeychainItem.save();
				}

				expect(foo).toThrow();
			});
		});

		describe('#read()', () => {
			it('is a Function', () => {
				expect(KeychainItem.read).toEqual(jasmine.any(Function));
			});

			it('fires read event with value', finish => {
				function read (obj) {
					try {
						expect(obj.success).toEqual(true);
						expect(obj.code).toEqual(0);
						expect(obj.identifier).toEqual('password');
						expect(obj.value).toEqual('s3cr3t_p4$$w0rd');
						finish();
					} catch (err) {
						finish(err);
					}
				}
				KeychainItem.addEventListener('read', read);
				KeychainItem.read();
			});
			// TODO: Reset and then read?
		});

		describe('#update()', () => {
			it('is a Function', () => {
				expect(KeychainItem.update).toEqual(jasmine.any(Function));
			});

			it('does not throw when invoked with no arguments', finish => {
				function update(obj) {
					KeychainItem.removeEventListener('update', update);
					try {
						expect(obj.success).toEqual(true);
						expect(obj.code).toEqual(0);
						expect(obj.identifier).toEqual('password');
						finish();
					} catch (err) {
						finish(err);
					}
				}

				KeychainItem.addEventListener('update', update);
				KeychainItem.update('new_p455w0rd');
			});
		});

		describe('#reset()', () => {
			it('is a Function', () => {
				expect(KeychainItem.reset).toEqual(jasmine.any(Function));
			});

			it('returns undefined', () => {
				expect(KeychainItem.reset()).not.toBeDefined();
				// TODO: Verify it "resets" the value?
			});
		});

		describe('#fetchExistence()', () => {
			it('is a Function', () => {
				expect(KeychainItem.fetchExistence).toEqual(jasmine.any(Function));
			});

			it('throws when invoked with no arguments', () => {
				function foo () {
					KeychainItem.fetchExistence();
				}

				expect(foo).toThrow();
			});

			it('returns true for exists when value has been saved', finish => {
				// save a value, then check existence
				function save(obj) {
					KeychainItem.removeEventListener('save', save);

					KeychainItem.fetchExistence(e => {
						try {
							expect(e.exists).toEqual(true);
							finish();
						} catch (err) {
							finish(err);
						}
					});
				}

				KeychainItem.addEventListener('save', save);
				KeychainItem.save('s3cr3t_p4$$w0rd');

			});

			it('returns false for exists after being reset', finish => {
				// reset first just to make sure, then save a value
				function reset(obj) {
					KeychainItem.removeEventListener('reset', reset);
					KeychainItem.fetchExistence(e => {
						try {
							expect(e.exists).toEqual(false);
							finish();
						} catch (err) {
							finish(err);
						}
					});
				}
				KeychainItem.addEventListener('reset', reset);
				KeychainItem.reset();

			});
		});
	});
});
