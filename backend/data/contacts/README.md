# Contacts

## Overview

This folder is primarily for managing contacts, and generating automatic reports for them. In the future, automatic reports may be generated from outside this folder as an official endpoint data source.

```md
.
├── autoreport_emailer.py  #sends out automatic reports
├── contactmanager.py  # manages and imports contacts
└── personal_reports.py  # auto generates reports
```

## Generating Reports

Contacts are stored in mongodb, within the `contacts` collection. The primary contact database is `main_contact_db`, which contains all our main contacts.

When generating a report, the process is to use to:

1. Determine name for the report campaign. This will be used to add a key to the contacts showing whether they have received that email or not.
2. Ensure that you adjust the `.env` in both the `insemble-terminal/backend` and `insemble-terminal/backend-` folders to point to what site you want to host the reports.
   - If hosting reports locally this should point to local postgress database. 
   - Otherwise if making reports for production, these should be pointed towards the `https://insemble.co` and `https://api.insemble.co` websites, and the respective production databases. Please contact [Nenye](mailto:nenye@insemblegroup.com) if you have any questions.
3. Run the functions within `autoreport_emailer` to generate reports.

Example:

```python
# In autoreport_emailer
import contactmanager as cm

generate_reports('campaign_1', cm.get_contacts_collection('collection_name'))
send_emails('campaign_1', cm.get_contacts_collection('collection_name'))
```
