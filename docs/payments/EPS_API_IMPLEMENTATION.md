# EPS api implementation

The server client uses explicit sandbox and live origins, bounded timeouts, HMAC-SHA512, and bearer authentication. Checkout URLs must match the environment-specific origin. Authentication, initialization, and unpaid status lookup succeeded in sandbox. Other initialization probes returned application code 500. Paid status and live API behavior remain unverified.
