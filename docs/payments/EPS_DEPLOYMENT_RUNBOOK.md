# EPS deployment runbook

Follow the [EPS rollout](EPS_ROLLOUT.md) sequence. Confirm the intended database and its migration history, then apply reviewed migrations through the authorized deployment workflow. Configure the verified EPS origin and credentials, enable checkout only after release gates pass, and preserve reconciliation for outstanding EPS and legacy attempts during rollback.

The authorized host scheduler can run `node --env-file=/path/to/deployment.env scripts/eps-reconcile-cron.mjs` from the deployed application directory. The runner calls the authenticated reconciliation endpoint and reports attempt counts. Validate the schedule in the sandbox deployment before registering a production job.
