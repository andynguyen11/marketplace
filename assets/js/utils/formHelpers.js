import React from 'react';
import ReactDOM from 'react-dom';
import parseFormat from 'moment-parseformat';

const filters = {
  "pii": {
    "error":
      <span>
        Message was not sent.  Please remove personal identifiers like email, phone numbers, or external links. <br /> <br />
        Sharing of personal information prior to engaging in a work contract violates Loom's <a target='_blank' href='/terms-of-service/'>Terms of Service</a>. Sharing personal
        information to meet outside of Loom is considered an offline hire and is subject to a $3,000.00 recruiting fee.
        Personal contact information is provided to both parties after a Loom work contract has been paid for.
      </span>,
    "list": [
      /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i,
      /^[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i,
      /^\+?\d{2}[- ]?\d{3}[- ]?\d{5}/,
	  /(twitter|facebook|gmail|skype|upwork|linkedin|angellist)/ig, 	// Site names.
	  /http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)/g,		// Twiter urls
	  /https?\:\/\/(?:www\.)?facebook\.com\/(\d+|[A-Za-z0-9\.]+)\/?/, 	// Facebook urls
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
        const searchString = string.toLowerCase().replace(/\s+/g, '').replace(/[,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
        if (searchString.search(filters[filter]['list'][i]) != -1) {
          return filters[filter]['error'];
        }
      }
    }
    return false;
  }
};

export default FormHelpers;