import parseFormat from 'moment-parseformat';

const filters = {
  'pii': {
    'error': 'Words',
    'list': [
      /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i
    ]
  },
  'badWords': {
    'error': 'Bad Words',
    'list': [
      'fuck',
      'shit'
    ]
  }
}

const FormHelpers = {
	checks: {
		isRequired(value) {
			// TODO This fails if an int is passed in
			let check = value.toString();
			return !!check.length;
		},
		isRequiredString(value) {
			let check = value.toString();
			return !!check.length;
		},
		isRequiredInt(value) {
			return !!value && value > 0;
		},
		isEmail(value) {
			return /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.test(value)
		},
		maxLength(value, max) {
			let check = value.toString();
			return check.length <= max;
		},
		minLength(value, min) {
			let check = value.toString();
			return check.length >= min;
		},
		isMomentFormat(value, format) {
			const valueFormat = parseFormat(value);
			return format === valueFormat;
		}
	},
	validateForm: function(elements, callback) {
		let formIsValid = true;

		Object.keys(elements).forEach(elementName => {
			const element = elements[elementName];
			const { value, validator } = element;

			if(validator && !validator(value)) {
				formIsValid = false;
			}
		});

		callback && callback(formIsValid, elements);
	},
  filterInput: function(string) {
    for (var filter in filters) {
      for (var i = 0; i < filters[filter]['list'].length; i++) {
        if (string.toLowerCase().search(filters[filter]['list'][i]) != -1) {
          return filters[filter]['error'];
        }
      }
    }
    return false;
  }
};

export default FormHelpers;