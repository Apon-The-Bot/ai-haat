# EPS qa report

Payment authorization fixtures, EPS signing and response fixtures, and isolated MySQL initialization and finalization tests passed. Sandbox authentication, initialization, and unpaid status were observed. Paid sandbox scenarios, live checkout, merchant IPN, and production cutover remain unverified. Fresh MySQL migration replay stopped at a historical non-EPS migration. See [EPS rollout](EPS_ROLLOUT.md) for evidence and exact limitations.

## Provider evidence needed

- A sandbox buyer payment instrument or a simulator procedure enabled for the demo merchant. The supplied file contains merchant API login credentials, which were used to create and query an unpaid checkout.
- A merchant-specific IPN contract covering authentication, key encoding, retry behavior, and sample requests. The public [EPS IPN guide](https://www.eps.com.bd/public/ipn) describes the encrypted envelope.
- The approved production hosted checkout origin and the merchant refund and settlement procedure.

The [EPS sandbox demo](https://sandboxpg.eps.com.bd/PaymentLink?id=66FF3A8C) is a public test payment link. It cannot validate the AI Haat application and ledger for a transaction initiated under the demo merchant credentials.

The supplied seven-page sandbox integration guide confirms the merchant status endpoint and its `merchantTransactionId` query parameter. Text extraction found no test card, test wallet, test OTP, or simulator procedure in the guide.
