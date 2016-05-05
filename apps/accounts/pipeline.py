def username(strategy, user=None, *args, **kwargs):
    if user:
        username = user.username
    else:
        username = strategy.session_get('saved_username')
    return {'username': username}