let loomEnv = location.hostname === 'www.joinloom.com' ? 'prod' : 'dev';

const loomKeys = {
  stripe: loomEnv === 'dev' ? 'pk_test_PhUrky9HrJfcAQvmstWpEna6' : 'pk_live_K6fVA1aNP7MSLpAZjf0EfuhX'
}

module.exports = loomKeys;