ALTER TABLE whatsapp_jobs
  ADD recurrence VARCHAR(16) NOT NULL DEFAULT 'none',
  ADD intervalDays INTEGER NOT NULL DEFAULT 1,
  ADD anchorDay INTEGER NULL;
