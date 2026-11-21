# Deployment runbook

This foundation requires no schema migration, production credential change, deployment, or background job registration. Before enabling automation: review provider contracts, configure secrets in the target environment, run isolated tests, back up the database, apply reviewed migrations if any, canary with manual approval, and monitor outbox/provider failures.
