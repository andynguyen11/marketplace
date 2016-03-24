var Appointments = React.createClass({
  render: function () {
    var appointments = this.props.appointments.map(function(appointment, i) {
      return(
        <li key={i}>
          <div className='date center pull-left'>
            <h4>{appointment.date}</h4>
            <p className='small text-muted'>{appointment.time}</p>
          </div>
          <div className='pull-left'>
            <h4>{appointment.service}</h4>
            <a href='#'>{appointment.company}</a>
          </div>
          <div className='clearfix'></div>
        </li>
      )
    });
    return(
      <div>
        <h3>Upcoming Services</h3>
        <ul className='upcoming-services'>
          {appointments}
        </ul>
      </div>
    )
  }
});

var ServicePicker = React.createClass({
  getInitialState: function() {
    return {
      appointments: hm_fixtures.appointments,
      categories: hm_fixtures.categories,
      services: [],
      price: 0,
      current_step: '',
      current_category: '',
      current_service: '',
      meals: hm_fixtures.meals,
      profile: {
        first_name: '',
        last_name: '',
        email: '',
        address: '2520 Bluebonnet Ln',
        address2: '',
        city: 'Austin',
        state: 'TX',
        zipcode: '78704',
        house_size: '',
        lot_size: '',
        bedrooms: '',
        bathrooms: '',
        pets: [],
        cars: [],
        stripe: false
      }
    };
  },
  componentDidMount: function() {
    var wrap = $('.price-container');
    if ($(document).scrollTop() > 260) {
      wrap.addClass("fix-container");
    }
    $(window).on('scroll', function() {
      if ($(document).scrollTop() > 260) {
        wrap.addClass("fix-container");
      } else {
        wrap.removeClass("fix-container");
      }
    });
  },
  setCategory: function(e) {
    this.resetService();
    var category = $(e.currentTarget).data('category');
    if(this.state.current_category == category) {
      return;
    }
    $('.category-picker li').addClass('hidden');
    if(category == 'Meals') {
      $('#meals').removeClass('hidden');
    } else {
      $('#meals').addClass('hidden');
    }
    this.setState({
      services: hm_fixtures.services[category].options,
      current_category: category
    });
  },
  getPrice: function(e) {
    var service = _.where(this.state.services, {name: $('#service').val()});
    this.setState({
      current_service: $('#service').val(),
      price: service[0].price
    })
  },
  applyPromo: function(e) {
    if($(e.currentTarget).val().length == 5) {
      var discount_price = this.state.price - 5;
      this.setState({
        price: discount_price
      });
    }
  },
  applyFrequency: function() {

  },
  addMeal: function(e) {
    var meals = this.state.meals;
    meals[$(e.currentTarget).data('index')].amount = meals[$(e.currentTarget).data('index')].amount + 1;
    this.setState({
      meals: meals,
      price: this.state.price + 10
    });
  },
  removeMeal: function(e) {
    var meals = this.state.meals;
    meals[$(e.currentTarget).data('index')].amount = meals[$(e.currentTarget).data('index')].amount - 1;
    this.setState({
      meals: meals,
      price: this.state.price - 10
    });
  },
  confirmBooking: function() {
    $('#booking').addClass('hidden');
    $('#confirmation').removeClass('hidden');
  },
  addAppointment: function() {
    this.resetService();
    $('#confirmation').addClass('hidden');
    var appointments = this.state.appointments;
    appointments.push({
      date: $('#date').val(),
      time: $('#time').val(),
      service: $('#service').val(),
      company: 'Pending'
    });
    this.setState({
      appointments: appointments
    });
  },
  updateProfile: function(e) {
    var updated_profile = this.state.profile;
    updated_profile[$(e.currentTarget).attr('name')] = $(e.currentTarget).val()
    this.setState({
      profile: updated_profile
    });

  },
  signUp: function(e) {
    e.preventDefault();
    var new_profile = this.state.profile;
    new_profile.first_name = $('#first_name').val();
    new_profile.last_name = $('#last_name').val();
    new_profile.email = $('#email').val();
    this.setState({
      profile: new_profile
    });
  },
  togglePayment: function(e) {
    $('#payment').toggleClass('hidden');
    $('#confirmation').toggleClass('hidden');
    if($(e.currentTarget).data('paid')) {
      console.log('hi')
      this.setState({
        stripe: 4444
      });
    }
  },
  resetService: function() {
    $('.category-picker li').removeClass('hidden').addClass('col-md-6');
    this.setState({
      current_service: '',
      current_category: '',
      services: [],
      price: 0
    });
  },
  render: function() {
    var categories = this.state.categories.map(function(category, i) {
      return (
        <div></div>
      )
    }.bind(this));
    var services = this.state.services.map(function(service, i) {
      return(
        <option value={service.name} key={i} >{service.name}</option>
      )
    });
    var meals = this.state.meals.map(function(meal, i) {
      return(
        <li key={i}>
          <img src={meal.img} />
          <div className='meal-controls text-center alpha60'>
            <h3>
              <button data-index={i} onClick={this.addMeal} className={meal.amount == 0 ? 'btn btn-success' : 'hidden'}>Add Meal</button>
              <div className={meal.amount > 0 ? 'text-orange' : 'hidden'}>
                <i data-index={i} onClick={this.removeMeal} className='fa fa-minus-square'></i> {meal.amount} <i data-index={i} onClick={this.addMeal} className='fa fa-plus-square'></i>
              </div>
            </h3>
          </div>
          <h4 className='text-center'>{meal.name}</h4>
        </li>
      )
    }.bind(this));

    return(
      <div>
        <h3>Book Service</h3>
        <ul className='category-picker text-center'>
          <li className={this.state.current_category == 'Lawn Care' ? 'lawn-icon col-md-12' : 'lawn-icon col-md-6'} onClick={this.setCategory} data-category='Lawn Care'>
            <div className='overlay'></div>
            <img src='../static/images/lawn-icon-green.png' /><br />
            <span>Lawn Care</span>
          </li>
          <li className={this.state.current_category == 'Home Cleaning' ? 'clean-icon col-md-12' : 'clean-icon col-md-6'} onClick={this.setCategory} data-category='Home Cleaning'>
            <div className='overlay'></div>
            <img src='../static/images/home-icon-green.png' /><br />
            Home Cleaning
          </li>
          <li className={this.state.current_category == 'Meals' ? 'meal-icon col-md-12' : 'meal-icon col-md-6'} onClick={this.setCategory} data-category='Meals'>
            <div className='overlay'></div>
            <img src='../static/images/meal-icon-green.png' /><br />
            Meals
          </li>
          <li className={this.state.current_category == 'Groceries' ? 'grocery-icon col-md-12' : 'grocery-icon col-md-6'} onClick={this.setCategory} data-category='Groceries'>
            <div className='overlay'></div>
            <img src='../static/images/grocery-icon-green.png' /><br />
            Groceries
          </li>
          <li className={this.state.current_category == 'Car Care' ? 'car-icon col-md-12' : 'car-icon col-md-6'} onClick={this.setCategory} data-category='Car Care'>
            <div className='overlay'></div>
            <img src='../static/images/car-icon-green.png' /><br />
            Car Care
          </li>
          <li className={this.state.current_category == 'Pet Care' ? 'dog-icon col-md-12' : 'dog-icon col-md-6'} onClick={this.setCategory} data-category='Pet Care'>
            <div className='overlay'></div>
            <img src='../static/images/pet-icon-green.png' /><br />
            Pet Care
          </li>
        </ul>
        <div className='clearfix'></div>
        <div id='booking' data-step='booking' className={this.state.services.length || this.state.current_step == 'booking' ? 'panel panel-default' : 'hidden'}>
          <ul className='booking-details'>
            <li className={this.state.price ? 'price-container' : 'hidden'}>
              <h2 className='pull-left'>Price</h2>
              <h2 className='pull-right'><strong>{'$'+this.state.price}</strong></h2>
              <div className='clearfix'></div>
            </li>
            <li>
              <h4 className='pull-left'>How can we help?</h4>
              <span className='hm-dropdown hm-dropdown--white pull-right'>
                <select onChange={this.getPrice} id='service' className='hm-dropdown__select hm-dropdown__select--white'>
                  <option>Choose Service... </option>
                  {services}
                </select>
              </span>
              <div className='clearfix'></div>
              <div className={this.state.current_service ? 'bg-info' : 'hidden'}>
                <h4 className='col-md-12'>We need a little more info from you to correctly price this service</h4>
                <div className={this.state.current_category == 'Home Cleaning' ? '' : 'hidden'}>
                  <div className='form-group'>
                    <div className='col-md-4'>
                      <input className='form-control' type='text' name='bedrooms' id='bedrooms' onChange={this.updateProfile} value={this.state.profile.bedrooms} placeholder='Number of Bedrooms'  />
                    </div>
                  </div>
                  <div className='form-group'>
                    <div className='col-md-4'>
                      <input className='form-control' type='text' name='bathrooms' id='bathrooms' onChange={this.updateProfile} value={this.state.profile.bathrooms} placeholder='Number of Bathrooms' />
                    </div>
                  </div>
                  <div className='form-group'>
                    <div className='col-md-4'>
                      <input className='form-control' type='text' name='house_size' id='house_size' onChange={this.updateProfile} value={this.state.profile.house_size} placeholder='Size of Home (square feet)' />
                    </div>
                    <div className='clearfix'></div>
                  </div>
                  <div className='clearfix'></div>
                </div>
                <div className={this.state.current_category == 'Pet Care' ? '' : 'hidden'}>
                  <div className='form-group'>
                    <div className='col-md-4'>
                      <span className='hm-dropdown hm-dropdown--white'>
                        <select id='pet_type' className='hm-dropdown__select hm-dropdown__select--white'>
                          <option>Type of Pet ...</option>
                          <option>Dog</option>
                          <option>Cat</option>
                        </select>
                      </span>
                    </div>
                  </div>
                  <div className='form-group'>
                    <div className='col-md-4'>
                      <input className='form-control' type='text' name='breed' id='breed' placeholder='Breed' />
                    </div>
                  </div>
                  <div className='form-group'>
                    <div className='col-md-4'>
                      <input className='form-control' type='text' name='weight' id='weight' placeholder='Weight' />
                    </div>
                    <div className='clearfix'></div>
                  </div>
                  <div className='clearfix'></div>
                </div>
                <div className={this.state.current_category == 'Car Care' ? '' : 'hidden'}>
                  <div className='form-group'>
                    <div className='col-md-4'>
                      <input className='form-control' type='text' name='make' id='make' placeholder='Make' />
                    </div>
                  </div>
                  <div className='form-group'>
                    <div className='col-md-4'>
                      <input className='form-control' type='text' name='model' id='model' placeholder='Model' />
                    </div>
                  </div>
                  <div className='form-group'>
                    <div className='col-md-4'>
                      <input className='form-control' type='text' name='year' id='year' placeholder='Year' />
                    </div>
                    <div className='clearfix'></div>
                  </div>
                  <div className='clearfix'></div>
                </div>
                <div className={this.state.current_category == 'Lawn Care' ? '' : 'hidden'}>
                  <div className='form-group'>
                    <div className='col-sm-12'>
                      <input className='form-control' type='text' name='address' onChange={this.updateProfile} value={this.state.profile.address} placeholder='Address' />
                    </div>
                    <div className='clearfix'></div>
                  </div>
                  <div className='form-group'>
                    <div className='col-sm-12'>
                      <input className='form-control' type='text' name='address2' onChange={this.updateProfile} value={this.state.profile.address2} placeholder='Address 2' />
                    </div>
                    <div className='clearfix'></div>
                  </div>
                  <div className='form-group'>
                    <div className='col-sm-4'>
                      <input className='form-control' type='text' name='city' onChange={this.updateProfile} value={this.state.profile.city} placeholder='City' />
                    </div>
                    <div className='col-sm-4'>
                      <input className='form-control' type='text' name='state' onChange={this.updateProfile} value={this.state.profile.state} placeholder='State' />
                    </div>
                    <div className='col-sm-4'>
                      <input className='form-control' type='text' name='zipcode' onChange={this.updateProfile} value={this.state.profile.zipcode} placeholder='Zipcode' />
                    </div>
                    <div className='clearfix'></div>
                  </div>
                  <div className='clearfix'></div>
                </div>
              </div>
            </li>
            <li>
              <h4 className='pull-left'>How often?</h4>
              <span className='hm-dropdown hm-dropdown--white pull-right'>
                <select id='frequency' onChange={this.applyFrequency} className='hm-dropdown__select hm-dropdown__select--white'>
                  <option>One Time</option>
                  <option>Weekly</option>
                  <option>Every other week</option>
                  <option>Monthly</option>
                </select>
              </span>
              <div className='clearfix'></div>
            </li>
            <li>
              <h4 className='pull-left'>What day?</h4>
              <span className='hm-dropdown hm-dropdown--white pull-right'>
                <select id='date' className='hm-dropdown__select hm-dropdown__select--white'>
                  <option value='ASAP'>As soon as possible</option>
                  <option>11/18/2015 (Wed)</option>
                  <option>11/19/2015 (Thurs)</option>
                  <option>11/20/2015 (Fri)</option>
                  <option>11/23/2015 (Mon)</option>
                  <option>11/24/2015 - (Tues)</option>
                </select>
              </span>
              <div className='clearfix'></div>
            </li>
            <li>
              <h4 className='pull-left'>What time?</h4>
              <span className='hm-dropdown hm-dropdown--white pull-right'>
                <select id='time' className='hm-dropdown__select hm-dropdown__select--white'>
                  <option value='Morning'>Morning (8:00 AM - Noon)</option>
                  <option value='Afternoon'>Afternoon (Noon - 4:00 PM)</option>
                  <option value='Evening'>Evening (4:00 PM - 8:00 PM)</option>
                </select>
              </span>
              <div className='clearfix'></div>
            </li>
            <li>
              <h4 className='pull-left'>Notes</h4>
              <textarea className='form-control' placeholder='Please leave us notes regarding any special needs or circumstances (e.g. gate codes, pets, etc.)'></textarea>
              <div className='clearfix'></div>
            </li>
            <li>
              <h4 className='pull-left'>Promo Code</h4>
              <input type='text' onChange={this.applyPromo} className='form-control' id='promo' />
            </li>
          </ul>
          <button onClick={this.confirmBooking} className='btn btn-success pull-right'><h4>Book Service</h4></button>
          <div className='clearfix'></div>
        </div>

        <div id='meals' className='panel panel-default hidden'>
          <div className={this.state.price ? 'price-container' : 'hidden'}>
              <h2 className='pull-left'>Price</h2>
              <h2 className='pull-right'>Starting at {'$'+this.state.price}</h2>
              <div className='clearfix'></div>
          </div>
          <ul className='meals-container'>
            {meals}
            <div className='clearfix'></div>
          </ul>
        </div>

        <div id='confirmation' data-step='confirmation' className='panel panel-default hidden'>
          <h3>Booking Confirmation</h3>
          <ul className='booking-details'>
            <li>
              <h2 className='pull-left'><i className='fa fa-check-circle text-success'></i> </h2>
              <div className='pull-left'>
                <h4>Price</h4>
                <h5 className='text-muted'>
                  ${this.state.price}
                </h5>
              </div>
              <div className='clearfix'></div>
            </li>
            <li>
              <h2 className='pull-left'><i className='fa fa-check-circle text-success'></i> </h2>
              <div className='pull-left'>
                <h4>Service Address</h4>
                <h5 className='text-muted'>
                  {this.state.profile.address} {this.state.profile.address2}, {this.state.profile.city}, {this.state.profile.state} {this.state.profile.zipcode}
                </h5>
              </div>
              <div className='clearfix'></div>
            </li>
            <li onClick={this.togglePayment}>
              <h2 className='pull-left'><i className={this.state.stripe ? 'fa fa-check-circle text-success' : 'fa fa-exclamation-circle text-danger'}></i> </h2>
              <div className='pull-left'>
                <h4>Payment Info</h4>
                <h5 className='text-muted'>
                  Please add payment method
                </h5>
              </div>
              <h2 className={this.state.stripe ? 'hidden' : 'pull-right'}><i className='fa fa-chevron-right'></i></h2>
              <div className='clearfix'></div>
            </li>
            <li>
              <h2 className='pull-left'><i className='fa fa-check-circle text-success'></i> </h2>
              <div className='pull-left'>
                <h4>Service Summary</h4>
                <h5 className='text-muted'>
                  One time {this.state.current_service} in the Morning As Soon As Possible.
                </h5>
              </div>
              <div className='clearfix'></div>
            </li>
            <h5 className='pull-left'>
              Once your dedicated service concierge has selected a compatible service professional, we will notify you of
              the exact time they should be expected.
            </h5>
            <button onClick={this.addAppointment} className='btn btn-success pull-right'><h4>Confirm Booking</h4></button>
            <div className='clearfix'></div>
          </ul>
        </div>
        
        <div data-step='signup' className='panel panel-default hidden'>
          <h4>Create Account</h4>
          <p className='text-muted'>Choose one of the following sign up methods</p>
          <button className='btn btn-google'><i className='fa fa-google-plus'></i> Google</button>
          <button className='btn btn-facebook'><i className='fa fa-facebook'></i> Facebook</button>
          <p className='text-muted'>Or sign up with your email address</p>
          <form>
            <div className='form-group'>
              <div className='col-sm-6'>
                <input className='form-control' type='text' id='first_name' name='first_name' placeholder='First Name' />
              </div>
              <div className='col-sm-6'>
                <input className='form-control' type='text' id='last_name' name='last_name' placeholder='Last Name' />
              </div>
              <div className='clearfix'></div>
            </div>
            <div className='form-group'>
              <div className='col-sm-12'>
                <input className='form-control' type='text' id='email' name='email' placeholder='Email' />
              </div>
              <div className='clearfix'></div>
            </div>
            <div className='form-group'>
              <div className='col-sm-12'>
                <input className='form-control' type='password' name='password' placeholder='Create Password' />
              </div>
              <div className='clearfix'></div>
            </div>
            <button className='btn btn-success' onClick={this.signUp}>Create Account</button>
          </form>
        </div>

        <div id='payment' className='panel panel-default hidden'>
          <h4>Add payment information</h4>
          <div className="form-group">
            <div className="col-xs-6">
              <input className="form-control" type="text" name="first_name" placeholder="First Name" />
            </div>
            <div className="col-xs-6">
              <input className="form-control" type="text" name="last_name" placeholder="Last Name" />
            </div>
            <div className='clearfix'></div>
          </div>
          <div className="form-group">
            <div className="col-md-12">
              <input className="form-control" type="text" data-stripe="number" name="number" placeholder="Credit Card Number"/>
            </div>
            <div className='clearfix'></div>
          </div>
          <div className="form-group">
            <div className="col-xs-4">
              <input className="form-control" type="text" data-stripe="exp-month" name="month" placeholder="MM"/>
            </div>
            <div className="col-xs-4">
              <input className="form-control" type="text" data-stripe="exp-year" name="year" placeholder="YYYY"/>
            </div>
            <div className="col-xs-4">
              <input className="form-control" type="text" data-stripe="cvc" name="cvc" placeholder="CVC"/>
            </div>
            <div className='clearfix'></div>
          </div>
          <div className="security text-center pull-left">
            Secured by
            <img src='../static/images/comodo_secure_76x26_transp.png' />
          </div>
          <button className='btn btn-success pull-right' data-paid='true' onClick={this.togglePayment}><h4>Add Payment Info</h4></button>
          <div className='clearfix'></div>
        </div>
      </div>
    )
  }
});

React.render(
  <ServicePicker />,
  document.getElementById('app-container')
);