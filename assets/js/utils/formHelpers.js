const FormHelpers = {
	checks: {
		isRequired(value) {
			return !!value.length;
		},
		isEmail(value) {
			return /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.test(value)
		}
	},
	validateForm: function(elements, callback) {
		let formIsValid = true;

		Object.keys(elements).forEach(elementName => {
			const element = elements[elementName]
			const { value, validator } = element;

			if(validator && !validator(value)) {
				formIsValid = false;
			}
		});

		callback && callback(formIsValid, elements);
	}
};

export default FormHelpers;