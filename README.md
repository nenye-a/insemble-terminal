# insemble-terminal-Terminal


### Installation

If you've already installed the system, please skip this section and go to the **Re-running** section.

To set-up and platform on your system

- Clone repository
- Open a command line window and go to the project's directory. /insemble-terminal-terminal
- `cd frontend && yarn install` to install
- `pip install -r requirements.txt && pip install -r dev-requirements.txt` to install python dependencies. You will likely want to do this in a virtual environment (see [pyenv](https://github.com/pyenv/pyenv) and [pyenv-virtualenv](https://github.com/pyenv/pyenv-virtualenv)). If you run into installation issues, please refer to the **Python Issues** section below.
- Ensure that you have redis installed. Detailed Installation instructions can be found at [Redis.io](https://redis.io/topics/quickstart), but the folllowing should do the trick ***(Please make sure to do this outside of the root project directory)***.


- To install backend-node: `cd backend-node`
- Install all packages with yarn: `yarn install`
- Ensure that you have [docker](https://www.docker.com/?utm_source=google&utm_medium=cpc&utm_campaign=dockerhomepage&utm_content=namer&utm_term=dockerhomepage&utm_budget=growth&gclid=EAIaIQobChMI-ObJicaM6AIVSdbACh3pBQMuEAAYASAAEgI98PD_BwE) installed.
- Try the `prisma2` command to ensure that you have prisma installed. If you don't, you will need to add `export PATH=./node_modules/.bin:$PATH` to your shell profile or `./node_modules/.bin` to your ENV path (windows).

### Running

- Contact administrator for .env keys (file should replace .env.example present in backend)
- Ensure that .env file has all necessary keys.

Start the python backend:
- `cd backend`
- In backend folder: `python manage.py runserver` to start backend server

Start the node backend (refer to backend-node folder readme for more information):

- go to the backend node folder:`cd backend-node`
- Ensure that you have your docker process running: `docker-compose up -d` (you may have to kill any existing docker processes running on the port). If you already have this process running, there's no need to re-run this command.
- Migrate your database to local: `prisma2 migrate up --experimental`
- Start the backend server: `yarn start:watch`

#### Re-Running

To re-run the latest code:

Ensure that you have the latest code and updates:
1. Unless you've recently downloaded your python environment, re-run the `pip install -r requirements.txt && pip install -r dev-requirements.txt` in the `insemble-terminal` folder.
2. In `insemble-terminal/frontend` folder run `yarn install` to ensure that you have the latest code.
3. In `backend-node` folder run `yarn install` to ensure that the latest node dependencies have been updated. Please note that current backend is not compatible with node v13. If you have node v13, you are suggested to download nvm to switch to v12.
4. Start the python backend (refer either to the backend text above "Start the python backend", or the `backend` ReadMe)
5. Start the node backend (refer to the backend-node text above "Start the node backend")
6. Start the frontend process

### Issues w. Python
If you run into installation issues with python, it will likely be because of versioning or because of *psycopg2* (the postgres interface for python).

- Insure that you have postgres installed on your system: `brew install postgresql`
- Try installing again. If this still had not worked, then you will need to manually install psycopg2 first, with a spetial env key: `env LDFLAGS="-I/usr/local/opt/openssl/include -L/usr/local/opt/openssl/lib" pip install psycopg2`
- Try installing the requirements.txt and dev-requirements.txt again.