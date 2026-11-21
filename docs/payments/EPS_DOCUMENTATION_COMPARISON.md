# EPS documentation comparison

The bundled Postman sample used transaction type 10. The guide's web type 1 succeeded in sandbox with a 14-digit merchant reference and explicit merchant and store IDs. The sample omits merchant ID. Initialization returns `TransactionId`, while the published paid status example uses `EpsTransactionId`. These references are stored separately. Sandbox initialization also returned provider code 500 on other attempts. Paid status and the merchant IPN contract remain unverified.
