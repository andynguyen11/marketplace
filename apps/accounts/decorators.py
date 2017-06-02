import pytz

from datetime import datetime, timedelta

from django.contrib.auth import authenticate, login
from django.shortcuts import redirect
from django.contrib import messages
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import AuthenticationFailed


def check_token(view_func):
    def _wrapped_view_func(request, *args, **kwargs):
        request_token = request.GET.get('token', '')
        if not request_token:
            messages.add_message(request, messages.ERROR,
                                 'The page you are trying to reach has expired. Please log in again.')
            return redirect('login')

        try:
            token = Token.objects.get(key=request_token)
        except Token.DoesNotExist:
            if request.user.is_authenticated():
                return view_func(request, *args, **kwargs)
            else:
                messages.add_message(request, messages.ERROR,
                                     'The page you are trying to reach has expired. Please log in again.')
                return redirect('login')

        if not token.user.is_active:
            messages.add_message(request, messages.ERROR,
                                 'The page you are trying to reach has expired. Please log in again.')
            return redirect('login')

        # This is required for the time comparison
        utc_now = datetime.utcnow()
        utc_now = utc_now.replace(tzinfo=pytz.utc)

        if token.created < utc_now - timedelta(hours=48):
            token.delete()
            messages.add_message(request, messages.ERROR,
                                 'The page you are trying to reach has expired. Please log in again.')
            return redirect('login')

        token.user.backend = 'django.contrib.auth.backends.ModelBackend'
        login(request, token.user)

        return view_func(request, *args, **kwargs)
    return _wrapped_view_func


def email_confirmation_required(view_func):
    def _wrapped_view_func(request, *args, **kwargs):
        if not request.user.email_confirmed:
            return redirect('confirm_email')
        if not request.user.tos:
            return redirect('onboard-entry')
        return view_func(request, *args, **kwargs)
    return _wrapped_view_func
