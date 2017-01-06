from celery import shared_task
import celery.signals
from celery.task.control import inspect
import redis
import functools

REDIS_CLIENT = redis.Redis()

def is_scheduled(task_name, or_running=False):
    """
    Check if a task is running or waiting.
    """
    i = inspect()

    scheduled = i.scheduled()
    for task in scheduled.values()[0] if scheduled else []:
        print task['request']['name']
        if task['request']['name'] == task_name:
            return True

    reserved = i.reserved()
    for task in reserved.values()[0] if reserved else []:
        if task['name'] == task_name:
            return True

    if(or_running):
        active = i.active()
        for task in active.values()[0] if active else []:
            if task['name'] == task_name:
                return True

def only_one(function=None, key="", timeout=None):
    """Enforce only one celery task at a time."""

    def _dec(run_func):
        """Decorator."""

        @functools.wraps(run_func)
        def wrapper(*args, **kwargs):
            """Caller."""
            ret_value = None
            have_lock = False
            lock = REDIS_CLIENT.lock(key, timeout=timeout)
            try:
                have_lock = lock.acquire(blocking=False)
                if have_lock:
                    ret_value = run_func(*args, **kwargs)
            finally:
                if have_lock:
                    lock.release()

            return ret_value

        return wrapper

    return _dec(function) if function is not None else _dec

