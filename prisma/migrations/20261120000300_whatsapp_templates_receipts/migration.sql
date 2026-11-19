CREATE TABLE whatsapp_templates (
  id VARCHAR(64) PRIMARY KEY, accountId VARCHAR(64) NOT NULL,
  name VARCHAR(100) NOT NULL, body TEXT NOT NULL,
  UNIQUE INDEX(accountId,name),
  FOREIGN KEY(accountId) REFERENCES whatsapp_accounts(id) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE whatsapp_jobs ADD destination VARCHAR(191) NULL, ADD INDEX(messageId);
