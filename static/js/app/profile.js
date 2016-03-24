require(['react', 'jsx!components/edit-customer-profile'], function (React, Profile) {
  Profile = React.createElement(Profile)

	React.render(
    Profile,
    document.getElementById('profile')
  );
});