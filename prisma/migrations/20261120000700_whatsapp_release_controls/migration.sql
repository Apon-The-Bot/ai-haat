ALTER TABLE whatsapp_jobs
  ADD COLUMN groupReceipts JSON NULL,
  ADD COLUMN claimToken VARCHAR(64) NULL,
  ADD COLUMN claimUntil DATETIME(3) NULL,
  ADD COLUMN mediaExpired BOOLEAN NOT NULL DEFAULT FALSE,
  ADD INDEX whatsapp_jobs_submission_destination_idx(submittedAt,destination);
