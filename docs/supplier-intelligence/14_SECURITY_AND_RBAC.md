# Security and RBAC

Existing admin APIs use authentication/authorization checks and supplier ingestion uses authenticated secrets with constant-time comparison. New supplier intelligence code is pure and has no credential access. Future adapters must keep secrets server-only, redact logs, enforce least privilege, and audit approvals and purchase actions.
