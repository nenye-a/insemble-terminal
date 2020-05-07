web: gunicorn insemble-terminal.wsgi --chdir backend --limit-request-line 8188 --log-file -
worker: celery worker --workdir backend --app=insemble-terminal -B --loglevel=info
