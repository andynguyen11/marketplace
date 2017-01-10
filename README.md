## Getting a Local Development Environment Running (on OS X)

##### Install PostgreSQL:
* http://postgresapp.com/

##### Set up virtual environment:
* `sudo easy_install pip`
* `pip install virutalenv`
* `cd 'my_project_folder'`
* `virtualenv venv`

##### Start virutal environment:
* `source venv/bin/activate`

##### Install dependencies:
* `pip install -r /path/to/requirements.txt`
* `npm install`
* redis for queueing `brew install redis; brew services start redis`


##### Problems install pyscopg2?
* `export PATH=$PATH:/Applications/Postgres.app/Contents/Versions/9.3/bin`
* `pip install -r /path/to/requirements.txt`

##### Create local database:
* Open psql from Postgres.app menu
* `CREATE DATABASE dbname;`

##### Create local_settings.py:
* Copy local_settings.base to local_settings.py
* Replace database settings with your local database credentials and test database

##### Setup database:
* `python /path/to/manage.py migrate`

##### Fire up local environment:
* `python /path/to/manage.py runserver`
* `celery -A makret worker -l info` for celery tasks
* `gulp` in another terminal (to run css/js tasks)
* Hit localhost:8000 in browser to access local environment

##### Having trouble?
Try `python /path/to/manage.py migrate`

##### to use `/api/search`, install and run elasticsearch:
* `brew install elasticsearch`
* to run with [brew services](https://github.com/Homebrew/homebrew-services): `brew services start elasticsearch`
* `python ./manage.py rebuild_index` to recreate the index,  
  `python ./manage.py update_index` to update

##### testing:
* `npm run test` to run API tests
* `npm run generate_fixtures` runs tests and outputs fixtures to `./fixtures`
* `npm run testserver` runs a testserver with the generated fixtures
