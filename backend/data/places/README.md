# Places

## Overview

This folder manages the uploading and storage of all the locations in the database.

The functional steps to updating the datbase are as follows:

1. Search new locations for places (optional) - managed by `searcher.py`
2. Search existing locations for additional places (optional) - managed by `updater.py`
3. Update new locations with details - managed by `detailupdate.py`
4. Store activity data revisions & reflect activity changes to the `activity_volume`, `avg_activity`, and `brand_volume` fields  - managed in `activityupdater.py`
5. Update the `local_retail_volume` and `local_category_volume` fields with the latest data - managed in `updatepipeline.py`
6. Re-balance in versioning inconsistencies - managed in `versions.py`

## Searching & Updating

Searching is performed primarily by msa regions that have been identiefied. It searches using a variety of search terms. This should never have to be done more than once for a region of the united states for a specific term at specific zoom.

Updating on the other hand may be run every 2 weeks to 1 month.

## Example Update Structure

After updating regions using the `searcher.search_region` or `updater.update_locations` functions:

```python
## In detailupdate.py

# creates a seperate collection to update from. Please ONLY
# DO THIS ONCE (otherwise, you may erase progress on your updating).
setup()
google_detailer(wait=False)  # can be done withi multiple terminals (8 recommended)


## In  activityupdater.py
revise_activity()  # store revisions
update_activity()  # reflect activity updates
update_brand_volume()  # udpate brand activity

# In updatepipeline.py
setup()  # only do this once (same as avoce bove)
proximity_update('volume', wait=False)
```
