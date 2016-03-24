#!/usr/bin/env python
import django

from apps.accounts.models import Profile

# load app registry for models.
django.setup()

if Profile.objects.count() == 0:
  print "No user. Creating one!"
  admin = Profile.objects.create(username='admin')
  admin.set_password('admin')
  admin.is_superuser = True
  admin.is_staff = True
  admin.save()