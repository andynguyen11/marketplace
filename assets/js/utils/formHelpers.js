import React from 'react';
import ReactDOM from 'react-dom';
import parseFormat from 'moment-parseformat';

const piiFilters = [
	{
		regex: /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9:%_\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/ig,
		description: 'Web links'
	},
	{
		regex: /[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?/ig,
		description: 'Email addresses'
	},
	{
		regex: /((\+\d{1,4}(-| |\.|.{1,3})?\(?\d\)?(-| |\.|.{1,3})?\d{1,5})|(\(?\d{2,6}\)?))(-| |\.|.{1,3})?(\d{3,6})(-| |\.|.{1,3})?(\d{4,6})(( x| ext)\d{1,5}){0,1}/ig,
		description: 'Formatted and non-formatted phone numbers with area/country codes'
	},
	{
		regex: /@(\w){1,30}/ig,
		description: '@ handles'
	},
	{
		regex: /(gmail|hotmail|yahoo)/ig,
		description: 'Email Site names'
	},
	{
		regex: /(skype|upwork|linkedin|angellist)/ig,
		description: 'Social Site names'
	},
	{
		regex: /(at .{2,} dot)|(. . . . .)/ig,
		description: 'Emails or phone numbers with deliberate spaces or spelled out special characters'
	}
];

const FormHelpers = {
	checks: {
		isRequired(value) {
			// TODO This fails if an int is passed in
			let check = value.toString().trim();
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
  doesStringContainPII(string) {
		let hasPii = false;

		piiFilters.some((filter) => {
			if(string.match(filter.regex)) {
				hasPii = true;
				return true;
			}
		});

		return hasPii;
	}
};

export default FormHelpers;
