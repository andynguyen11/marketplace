
"""
Django settings for market project.
Generated by 'django-admin startproject' using Django 1.8.2.
For more information on this file, see
https://docs.djangoproject.com/en/1.8/topics/settings/
For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.8/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, "apps"))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.8/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'vw+$3h65lpj&jta8-(0%$wu8csj9+no0=k-*m2nbyme=og8r!p'

ENVIRONMENT = os.environ.get('ENVIRONMENT', 'local')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True if ENVIRONMENT != 'prod' else False

GENERATE_TEST_FIXTURES = os.environ.get('GENERATE_TEST_FIXTURES', False)
FIXTURES_DIR = os.environ.get('FIXTURES_DIR', './fixtures')

ALLOWED_HOSTS = ['*']

ADMINS = (('Server Errors', 'admin@lawncall.com'), )
SERVER_EMAIL = 'info@devquity.com'

AUTH_USER_MODEL = 'accounts.Profile'

# Application definition

INSTALLED_APPS = (
    'django_gulp',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'django.contrib.flatpages',
    'haystack',
    'generics',
    'notifications',
    'social.apps.django_app.default',
    'collectfast',
    'password_reset',
    'storages',
    'rest_framework',
    'rest_framework.authtoken',
    'tagulous',
    'crispy_forms',
    'raven.contrib.django.raven_compat',
    'accounts',
    'business',
    'api',
    'docusign',
    'reviews',
    'postman',
    'fixture_magic',
    'django_extensions'
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.flatpages.middleware.FlatpageFallbackMiddleware',
)

AUTHENTICATION_BACKENDS = (
    'social.backends.linkedin.LinkedinOAuth2',
    'accounts.auth.CaseInsensitiveModelBackend',
    'django.contrib.auth.backends.ModelBackend',
)


ROOT_URLCONF = 'market.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates'),],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'market.context_processors.global_settings',
                'social.apps.django_app.context_processors.backends',
                'social.apps.django_app.context_processors.login_redirect',
                'postman.context_processors.inbox',
                'django.template.context_processors.media',
            ],
        },
    },
]

WSGI_APPLICATION = 'market.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases
database_backend = 'django.db.backends.postgresql_psycopg2'

if 'RDS_DB_NAME' in os.environ:
    DATABASES = {
        'default': {
            'ENGINE': database_backend,
            'NAME': os.environ['RDS_DB_NAME'],
            'USER': os.environ['RDS_USERNAME'],
            'PASSWORD': os.environ['RDS_PASSWORD'],
            'HOST': os.environ['RDS_HOSTNAME'],
            'PORT': os.environ['RDS_PORT'],
        }
    }

    if DEBUG:
        LOGGING = {
            'version': 1,
            'disable_existing_loggers': False,
            'formatters': {
                'verbose': {
                    'format': '%(levelname)s %(asctime)s %(module)s '
                              '%(process)d %(thread)d %(message)s'
                }
              },
            'require_debug_true': {
                '()': 'django.utils.log.RequireDebugTrue',
            },
            'handlers': {
                'console': {
                    'level': 'DEBUG',
                    'class': 'logging.StreamHandler',
                    'formatter': 'simple',
                },
            },
            'loggers': {
                'django.db.backends': {
                    'level': 'ERROR',
                    'handlers': ['console'],
                    'propagate': False,
                },
                'django': {
                    'handlers': ['stderr'],
                    'propagate': True,
                    'level': 'DEBUG',
                },
            }
        }
    else:
        RAVEN_CONFIG = {
            'dsn': os.environ.get('RAVEN_DSN', ''),
        }
        LOGGING = {
            'version': 1,
            'disable_existing_loggers': False,
            'root': {
                'level': 'WARNING',
                'handlers': ['sentry'],
            },
            'formatters': {
                'verbose': {
                    'format': '%(levelname)s %(asctime)s %(module)s '
                              '%(process)d %(thread)d %(message)s'
                },
            },
            'handlers': {
                'sentry': {
                    'level': 'ERROR',
                    'class': 'raven.contrib.django.raven_compat.handlers.SentryHandler',
                    'tags': {'custom-tag': 'x'},
                },
                'console': {
                    'level': 'DEBUG',
                    'class': 'logging.StreamHandler',
                    'formatter': 'verbose'
                }
            },
            'loggers': {
                'django.db.backends': {
                    'level': 'ERROR',
                    'handlers': ['console'],
                    'propagate': False,
                },
                'raven': {
                    'level': 'DEBUG',
                    'handlers': ['console'],
                    'propagate': False,
                },
                'sentry.errors': {
                    'level': 'DEBUG',
                    'handlers': ['console'],
                    'propagate': False,
                },
            },
        }



AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID', '')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_KEY', '')
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME', '')
AWS_PRELOAD_METADATA = True
AWS_QUERYSTRING_AUTH = False

# Internationalization
# https://docs.djangoproject.com/en/1.8/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

REST_FRAMEWORK = {
    'DATETIME_FORMAT': '%b %d, %Y (%a)',
}

USE_I18N = True

USE_L10N = True

USE_TZ = True

STATICFILES_DIRS = (
    os.path.join(BASE_DIR, "static"),
)

STATIC_ROOT = os.path.join(BASE_DIR, '/static/')

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.8/howto/static-files/
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto.S3BotoStorage'
STATICFILES_STORAGE = 'storages.backends.s3boto.S3BotoStorage'
STATIC_URL = 'https://devquity.s3.amazonaws.com/'

#TODO Make these environment variables
STRIPE_KEY = "sk_test_W0tpg5Cv7AZ1jzhWxRkJgr4u" if ENVIRONMENT != 'prod' else 'sk_live_BeJIGPEO3OPDg8YwG5gIqyvg'
PUBLIC_STRIPE_KEY = 'pk_test_CANPk8WGjQh2GpvfIDNhxsyy' if ENVIRONMENT != 'prod' else 'pk_live_n4vOSxsAJdUWl8hLmtqPQmyC'
MANDRILL_API_KEY = "MTNrjQJntOmZLGNkjPetLw" if ENVIRONMENT == 'prod' else "exv8qBKcFIaKPVZa-Hhm8A"

#EMAIL_BACKEND = "djrill.mail.backends.djrill.DjrillBackend"
DEFAULT_FROM_EMAIL = "Sarah from DevQuity <service@devquity.com>"
EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.mandrillapp.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'info@devquity.com'
EMAIL_HOST_PASSWORD = MANDRILL_API_KEY

CRISPY_TEMPLATE_PACK = "bootstrap3"

SITE_ID = 1

MARKITUP_SET = 'markitup/sets/markdown'
MARKITUP_SKIN = 'markitup/skins/markitup'
MARKITUP_FILTER = ('markdown.markdown', {'safe_mode': True})

LOGIN_URL = '/login/'

BASE_URL = 'https://dev.devquity.com' if ENVIRONMENT != 'prod' else 'https://devquity.com'

SOCIAL_AUTH_LINKEDIN_OAUTH2_KEY = '786yjyq5pud726'
SOCIAL_AUTH_LINKEDIN_OAUTH2_SECRET = 'UmgWxvWjPKYYGTJo'
SOCIAL_AUTH_LINKEDIN_OAUTH2_FIELD_SELECTORS = [
    'public-profile-url',
    'email-address',
    'location',
    'headline',
    'skills',
    'summary',
    'positions',
    'industry',
    'specialties',
    'picture-url',
    'picture-urls::(original)',
]
SOCIAL_AUTH_LINKEDIN_OAUTH2_EXTRA_DATA = [('id', 'id'),
                                   ('firstName', 'first_name'),
                                   ('lastName', 'last_name'),
                                   ('emailAddress', 'email_address'),
                                   ('headline', 'headline'),
                                   ('summary', 'summary'),
                                   ('skills', 'skills'),
                                   ('positions', 'positions'),
                                   ('specialties', 'specialties'),
                                   ('pictureUrl', 'picture_url'),
                                   ('pictureUrls', 'picture_urls'),
                                   ('location', 'location'),
                                   ('industry', 'industry'),
                                   ('name', 'name'),]

SOCIAL_AUTH_LINKEDIN_OAUTH2_SCOPE = ['r_basicprofile', 'r_emailaddress', 'rw_company_admin', ]
SOCIAL_AUTH_LOGIN_REDIRECT_URL = '/profile/dashboard/'
SOCIAL_AUTH_NEW_USER_REDIRECT_URL = '/profile/confirm/'
SOCIAL_AUTH_LOGIN_URL = '/'
SOCIAL_AUTH_PIPELINE = (
    'social.pipeline.social_auth.social_details',
    'social.pipeline.social_auth.social_uid',
    'social.pipeline.social_auth.auth_allowed',
    'social.pipeline.social_auth.social_user',
    'social.pipeline.user.get_username',
    'accounts.pipeline.load_existing_user',
    'social.pipeline.user.create_user',
    'social.pipeline.social_auth.associate_user',
    'social.pipeline.social_auth.load_extra_data',
    'social.pipeline.user.user_details',
    'accounts.pipeline.save_profile',
)

HAYSTACK_CONNECTIONS = {
    'default': {
        'ENGINE': 'generics.search_backend.FuzzyElasticSearchEngine',
        'URL': 'http://127.0.0.1:9200/',
        'INDEX_NAME': 'haystack',
    },
}

POSTMAN_DISALLOW_ANONYMOUS = True
POSTMAN_DISALLOW_MULTIRECIPIENTS = True
POSTMAN_DISALLOW_COPIES_ON_REPLY = True
POSTMAN_AUTO_MODERATE_AS = True

 
DOCUSIGN = {
    'root_url': os.environ.get('DOCUSIGN_ROOT_URL', 'https://demo.docusign.net/restapi/v2'),
    'integrator_key': os.environ.get('DOCUSIGN_API_KEY', ''),
    'username': os.environ.get('DOCUSIGN_USERNAME', ''),
    'password': os.environ.get('DOCUSIGN_PASSWORD', ''),
}

WEBHOOK_BASE_URL = ''


try:
    from local_settings import *
except ImportError:
    pass
