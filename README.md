# insemble-terminal-Terminal

## Installation

If you've already installed the system, please skip this section and go to the **Re-running** section.

To set-up and platform on your system

- Clone repository
- Open a command line window and go to the project's directory. `/insemble-terminal-terminal`
- `cd frontend && yarn install` to install

### Python Install

In the main project working folder (`insemble-terminal`):

- `pip install -r requirements.txt && pip install -r dev-requirements.txt`. (**Strongly recommended**) Please use a virtual environment. See [pyenv](https://github.com/pyenv/pyenv) + [pyenv-virtualenv](https://github.com/pyenv/pyenv-virtualenv).

- (Optional) If you run into issues with installing `psycopg2`, ensure that you have postgres installed on your system. If not, please install (`brew postgresql`) and try installing the requirements. again. If still running into issues, run `env LDFLAGS="-I/usr/local/opt/openssl/include -L/usr/local/opt/openssl/lib" pip install psycopg2` prior to installing the requirements.

- Install [Redis](https://redis.io/topics/quickstart). **Please install outside of the project directory**.

### Node Install

In the main project working folder (`insemble-terminal`)

- Ensure that you have [docker](https://www.docker.com/?utm_source=google&utm_medium=cpc&utm_campaign=dockerhomepage&utm_content=namer&utm_term=dockerhomepage&utm_budget=growth&gclid=EAIaIQobChMI-ObJicaM6AIVSdbACh3pBQMuEAAYASAAEgI98PD_BwE) installed.
- Try the `prisma2` command to ensure that you have prisma installed. If you don't, you will need to add `export PATH=./node_modules/.bin:$PATH` to your shell profile or `./node_modules/.bin` to your ENV path (windows)
- `yarn`
- Ensure that you have your docker process running: `docker-compose up -d` (you may have to kill any existing docker processes running on the port). If you already have this process running, there's no need to re-run this command.

## Running

- Contact administrator for .env keys (file should replace .env.example present in backend)
- Ensure that .env file has all necessary keys.

### Quickstart

- `yarn migrate` -> Migrate the prisma database
- `yarn dev:all` -> Start all services (React FE, Node BE, Python BE)

---
or

### Migrate Database

- `yarn migrate`
  
### Start Python Backend

- `yarn dev:backend-python` or `python backend/manage.py runserver`

### Start Node & Frontend

To start the node and frontend side, run any one of the following:

Development Mode

- `yarn:dev` (hot reloading dev server for both FE and BE - tends to be slow)

Production Style

- `yarn start:build` (production build frontend and backend, then run)
- `yarn start` (if build files have alraedy been created.)

### Re-Running

To re-run the latest code:

In the `insemble-terminal` folder

1. `pip install -r requirements.txt && pip install -r dev-requirements.txt`
2. `yarn`
3. `yarn migrate`
4. `yarn dev:all` or `yarn dev:backend-python` + (`yarn dev` or `yarn start:build`)
5. (Optional) When finished with testing, you can run `yarn clean` to delete build directories.

## Deployment

Insemble production and staging site are both deployed on digitial ocean. Build management is performed via [dokku](http://dokku.viewdocs.io/dokku/). To access deployed site, you will need an ssh key. Deployment is currently managed by adminstrator [Nenye](mailto:nenye@insemblegroup.com).

Both python and node, both staging and production are hosted on the same digital ocean droplet (IP `64.227.12.21`).

Deployment is done first through staging, and then through to production. Please make sure to merge the latest changes into these branches first before pushing.

To Deploy

1. `ssh {{user}}@64.227.12.21` or `ssh -i path/to/ssh-key {{user}}@64.227.12.21`
2. `git push {{remote}} staging:master` (Staging) and `git push {{remote}} production:master` (Production)
3. To successfully deploy, you need to push to both the node and python sides of each app.

Dokku Remotes:

- Python Production -- `dokku@64.227.12.21:pybackend`
- Node Production -- `dokku@64.227.12.21:terminal`
- Python Staging -- `dokku@64.227.12.21:pybackend-staging`
- Node Staging -- `dokku@64.227.12.21:terminal-staging`
