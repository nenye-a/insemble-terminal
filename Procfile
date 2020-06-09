web: yarn --cwd backend-node start
pyapi: gunicorn terminal.wsgi --chdir backend --limit-request-line 8188 --log-file - -b localhost:8000
worker: celery worker --workdir backend --app=terminal -B --loglevel=info 
