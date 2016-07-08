def load_existing_user(user, *args, **kwargs):
    if user:
        return {
            'username': user.email,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'biography': user.biography,
            'role': user.role,
            'capacity': user.capacity,
            'photo': user.photo,
        }


def save_profile(backend, user, response, is_new, *args, **kwargs):
    # Save data that was not on required onboarding form linkedin
    if backend.name == 'linkedin-oauth2':
        if user and not is_new:
            user.first_name = kwargs.get('first_name')
            user.last_name = kwargs.get('last_name')
            user.biography = kwargs.get('biography')
            user.role = kwargs.get('role')
            user.capacity = kwargs.get('capacity')
            user.city, user.state = response.get('location')['name'].split(', ') or None
            user.location = response.get('location')['name']
            user.save()
