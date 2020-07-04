# News Generator

## Overview

This folder manages the generation of news for insemble clients.

```md
.
├── NewsManager.py
├── README.md
├── email_builder.py
├── newsemailer.py
├── rss
│   ├── email_builder.py
│   ├── emailer.py
│   ├── feeds.py
│   ├── rssnewsfeeds.csv
│   ├── storage
│   │   └── map.csv
│   ├── util
│   │   └── stateabbreviations.csv
│   └── zip-codes.csv
├── sources
│   ├── terminal_sources.csv
│   ├── test_source.csv
│   └── test_source_nenye.csv
├── storage
│   └── map.csv
└── templates
    ├── base-update.html
    ├── base.html
    ├── generated.html
    └── test.html
```

## Generating News

News is generated ahead of time using a custom news generator and stored in the `OpenNewsTable` table on the node backend.

The news reports are generated from a csv of contacts that contain cities using the `News Manager` class.

When generating a report, the process is to use to:

1. Ensure that you are in the right database environment on both the node and python backend. (`.env` file in both `insemble-terminal/backend` and `insemble-terminal/backend-node`).
2. Instantiate a NewsManager for a specific report.
3. Generate news
4. Convert news links into insemble branded links
5. Send news emails, either regularly (safer but slower in the event of failure) - `generator.email()`
6. Or asynchronously (faster, but less safe) `generator.email_async()` may send double emails occasionally in the event of early cancellation or failure.

Overall the requests should look like the following: 

```python
generator = NewsManager('Email-Campaign-7/2', 'contact_list.csv', national_news=False)
generator.generate()
generator.convert_links()
generator.email()
```
