import { Radio, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

let CompanyForm = React.createClass({

  getInitialState() {
    return {
      active: 1
    };
  },

  _toggleActive(e) {
    this.setState({
      active: parseInt(e.target.value)
    });
  },

  _handleFormChange(e) {
    let company = this.props.company;
    company[$(e.currentTarget).attr('name')] = $(e.currentTarget).val();
    this.props.update_company(company);
  },

  _setCompanyType(e) {
    let updated_company = this.props.company;
    updated_company.type = e.currentTarget.value;
    this.props.update_company(updated_company);
  },

  render() {

      return (
        <div>
          <div className="section-header text-center col-md-8 col-md-offset-2">
            Do you need to set up a company profile?
          </div>

          <FormGroup
            bsClass="form-group col-md-8 col-md-offset-2"
          >
            <Radio name='company_bool' onChange={this._toggleActive} value='1' >
              Yes, I need to set up a new company profile.
            </Radio>
            <Radio name='company_bool' onChange={this._toggleActive} value='0' >
              No, I'm an individual looking to hire developers.
            </Radio>
          </FormGroup>

          <div className={this.state.active ? '' : 'hidden'} >
            <div className='section-header text-center col-md-8 col-md-offset-2'>Company Info</div>

            <FormGroup
              bsClass='form-group col-md-8 col-md-offset-2'
            >
              <ControlLabel>Company Name</ControlLabel>
              <FormControl
                type='text'
                name='name'
                value={this.props.company.name}
                onChange={this._handleFormChange}
              />
            </FormGroup>

            <FormGroup
              bsClass='form-group col-md-8 col-md-offset-2'
            >
              <ControlLabel>Company Bio (This is what developers will see)</ControlLabel>
              <FormControl
                name='description'
                componentClass='textarea'
                placeholder='Think of this as your elevator pitch to developers.  Get them excited in 250 characters or less.'
                value={this.props.company.description}
                onChange={this._handleFormChange}
              />
            </FormGroup>

            <FormGroup
              bsClass='form-group col-md-8 col-md-offset-2'
            >
              <ControlLabel>Company Type</ControlLabel>
              <Radio name='company_type' onChange={this._setCompanyType} value='llc'>
                Limited Liability Company (LLC)
              </Radio>
              <Radio name='company_type' onChange={this._setCompanyType} value='inc'>
                Corporation (Inc)
              </Radio>
              <Radio name='company_type' onChange={this._setCompanyType} value='sp'>
                Sole Proprietorship
              </Radio>
              <Radio name='company_type' onChange={this._setCompanyType} value='lp'>
                Limited Partnership
              </Radio>
              <Radio name='company_type' onChange={this._setCompanyType} value='llp'>
                Limited Liability Partnership
              </Radio>
              <Radio name='company_type' onChange={this._setCompanyType} value='nonprofit'>
                Non-Profit
              </Radio>
            </FormGroup>
            <FormGroup
              bsClass='form-group col-md-8 col-md-offset-2'
            >
              <ControlLabel>State Filing Location</ControlLabel>
              <FormControl
                type='text'
                name='filing_location'
                placeholder='State/Province'
                value={this.props.company.filing_location}
                onChange={this._handleFormChange}
              />
            </FormGroup>

          </div>

        </div>
      );
  }

});

module.exports = CompanyForm;

