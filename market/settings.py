
"""
Django settings for market project.
Generated by 'django-admin startproject' using Django 1.8.2.
For more information on this file, see
https://docs.djangoproject.com/en/1.8/topics/settings/
For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.8/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os, sys, datetime

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

ADMINS = ()
SERVER_EMAIL = 'info@joinloom.com'

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
    'sorl.thumbnail',
    'guardian',
    'easy_timezones',
    'haystack',
    'generics',
    'notifications',
    'social.apps.django_app.default',
    'collectfast',
    'password_reset',
    'storages',
    'corsheaders',
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_docs',
    'jsonify',
    'tagulous',
    'crispy_forms',
    'raven.contrib.django.raven_compat',
    'accounts',
    'business',
    'api',
    'docusign',
    'expertratings',
    'payment',
    'postman',
    'reviews',
    'fixture_magic',
    'django_extensions'
)

MIDDLEWARE_CLASSES = (
    'accounts.middleware.CheckJWT',
    #'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.flatpages.middleware.FlatpageFallbackMiddleware',
    'easy_timezones.middleware.EasyTimezoneMiddleware',
)

AUTHENTICATION_BACKENDS = (
    'social.backends.linkedin.LinkedinOAuth2',
    'accounts.auth.CaseInsensitiveModelBackend',
    'django.contrib.auth.backends.ModelBackend',
    'guardian.backends.ObjectPermissionBackend',
)

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://loom-redis-001.kkhbg2.0001.usw2.cache.amazonaws.com",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

# CELERY SETTINGS
BROKER_URL = 'redis://loom-redis-001.kkhbg2.0001.usw2.cache.amazonaws.com:6379/1' if ENVIRONMENT == 'prod' else 'redis://loom-redis-001.kkhbg2.0001.usw2.cache.amazonaws.com:6379/2'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'

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

    if not DEBUG:
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
GEOIP_DATABASE = os.path.join(BASE_DIR, 'market/GeoLiteCity.dat')
GEOIPV6_DATABASE = os.path.join(BASE_DIR, 'market/GeoLiteCityv6.dat')

REST_FRAMEWORK = {
    'DATETIME_FORMAT': '%b %d, %Y (%a)',
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
}

JWT_AUTH = {
    'JWT_RESPONSE_PAYLOAD_HANDLER':
    'api.utils.jwt_response_payload_handler',
    'JWT_EXPIRATION_DELTA': datetime.timedelta(seconds=108000),
    'JWT_ALLOW_REFRESH': True
}

USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.8/howto/static-files/
PROJECT_ROOT = os.path.dirname(os.path.dirname(__file__))
STATICFILES_DIRS = (
    os.path.join(PROJECT_ROOT, 'static'),
)
STATICFILES_LOCATION = os.environ.get('STATIC_LOCATION', 'static-dev')
STATICFILES_STORAGE = 'market.custom_storages.StaticStorage'
STATIC_URL = "https://%s/%s/" % ('devquity.s3.amazonaws.com', STATICFILES_LOCATION)

MEDIAFILES_LOCATION = 'media'
MEDIA_URL = "https://%s/%s/" % ('devquity.s3.amazonaws.com', MEDIAFILES_LOCATION)
DEFAULT_FILE_STORAGE = 'market.custom_storages.MediaStorage'

STRIPE_KEY = os.environ.get('STRIPE_API_KEY', 'sk_test_W0tpg5Cv7AZ1jzhWxRkJgr4u')
STRIPE_PUBLIC_KEY = os.environ.get('STRIPE_PUBLIC_KEY', 'pk_test_PhUrky9HrJfcAQvmstWpEna6')
MANDRILL_API_KEY = os.environ.get('MANDRILL_API_KEY', 'VzOGiohfxEjbDlX0ekKDlg')

DEFAULT_FROM_EMAIL = "Loom <info@joinloom.com>"
EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.mandrillapp.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'Loom'
EMAIL_HOST_PASSWORD = MANDRILL_API_KEY

CRISPY_TEMPLATE_PACK = "bootstrap3"

SITE_ID = 1

MARKITUP_SET = 'markitup/sets/markdown'
MARKITUP_SKIN = 'markitup/skins/markitup'
MARKITUP_FILTER = ('markdown.markdown', {'safe_mode': True})

LOGIN_URL = '/login/'

BASE_URL = os.environ.get('BASE_URL', 'localhost:8000')

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

SOCIAL_AUTH_REDIRECT_IS_HTTPS = True
SOCIAL_AUTH_LINKEDIN_OAUTH2_SCOPE = ['r_basicprofile', 'r_emailaddress', 'rw_company_admin', ]
SOCIAL_AUTH_LOGIN_REDIRECT_URL = '/social/complete/'
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
POSTMAN_SHOW_USER_AS = 'first_name'

def prefixed_env_var_getter(prefix):
    def get(subvar, default=''):
        return os.environ.get(prefix + '_' + subvar, default)
    return get

SYNC_RECORD_DELTA = datetime.timedelta(1)

docusign_ = prefixed_env_var_getter('DOCUSIGN') 
DOCUSIGN = {
    'root_url': docusign_('ROOT_URL', 'https://demo.docusign.net/restapi/v2'),
    'integrator_key': docusign_('API_KEY'),
    'username': docusign_('USERNAME'),
    'password': docusign_('PASSWORD')
}

expert_rating_ = prefixed_env_var_getter('EXPERT_RATING') 
EXPERT_RATING = {
    'root_url': expert_rating_('ROOT_URL', 'http://www.expertrating.com/loom/webservices'),
    'auth': {
        'partnerid': expert_rating_('PARTNERID', '1218278'),
        'password': expert_rating_('PASSWORD', 'd1e2v1q8u2i7t8y'),
        'partneruserid': expert_rating_('PARTNERUSERID'),
    }
}
WEBHOOK_BASE_URL = os.environ.get('WEBHOOK_BASE_URL', BASE_URL)

MAX_FILE_SIZE = 5242880
FILE_CONTENT_TYPES = ['image/jpeg', 'application/pdf', 'image/bmp',
                     'image/pjpeg', 'image/png', 'application/x-excel', 'text/html',
                     'application/excel', 'application/x-msexcel', 'application/vnd.ms-excel',
                     'application/mspowerpoint', 'application/vnd.ms-powerpoint', 'application/powerpoint',
                     'application/x-mspowerpoint', 'application/msword', 'text/plain', 'text/richtext',
                     'application/x-rtf', 'text/vnd.rn-realtext', 'text/csv', 'application/x-iwork-keynote-sffkey',
                     'application/x-iwork-numbers-sffnumbers', 'application/x-iwork-pages-sffpages',
                     'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                     'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
                     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ]

LOOM_FEE = 3

DOCUSIGN_TEMPLATE_ID = os.environ.get('DOCUSIGN_TEMPLATE_ID', '054c2981-9e38-42ac-8451-f8b43230ccea')

CORS_ORIGIN_WHITELIST = (
    'www.joinloom.com',
    'joinloom.com',
    'dev.joinloom.com',
    'localhost:8000',
    '127.0.0.1:9000'
)

GULP_PRODUCTION_COMMAND = 'gulp dist-dev' if ENVIRONMENT == 'dev' else 'gulp dist'

GULP_DEVELOP_COMMAND = 'gulp dist-dev' if ENVIRONMENT == 'dev' else 'gulp dist'

try:
    from local_settings import *
except ImportError:
    pass
