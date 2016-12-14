#!/usr/bin/env python
import os
import sys

def yes_or_no(question):
    reply = str(raw_input(question+' (y/n): ')).lower().strip() or ''
    if len(reply) and reply[0] == 'y':
        return True
    if len(reply) and reply[0] == 'n':
        return False
    else:
        return yes_or_no("Please enter y or n")

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "market.settings")

    from django.core.management import execute_from_command_line

    from django.conf import settings
    #if not settings.LOCAL_DB and 'migrate' in sys.argv:
    #    if not yes_or_no("LOCAL_DB is set to False - are you sure you want to migrate the dev database?"):
    #        exit()

    execute_from_command_line(sys.argv)
