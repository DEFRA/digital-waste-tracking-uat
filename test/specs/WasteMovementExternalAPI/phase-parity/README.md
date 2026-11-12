# Phase parity

Phase 1 (Receipt of Waste) and phase 2 (National Waste Movements) are exercised from this pack today. Those phases will move into separate repositories. These tests stay here so one suite can still call both services after that split.

The checks would sit most naturally beside the schema in each service. This pack is the shared place that can send the same value to both, which is what we need in order to keep moving once the code is no longer in one repo.

## What these tests are

They are integration tests against the external API. Each case builds a phase 1 payload and a phase 2 payload with that phase's generators and helpers, sends the same value to both, and expects the same accept or reject.

`npm run test:uat` leaves this folder out. Run it on its own:

```bash
source ./env.sh && NODE_OPTIONS='--experimental-vm-modules --no-warnings' npm run test:uat:phase-parity
```

## Tickets

When a parity gap is found, raise a ticket and add a row here, then tag the test with `@allure.label.tag:<TICKET>` and `addAllureLink`.

| Ticket   | Coverage                                                                   |
| -------- | -------------------------------------------------------------------------- |
| DWTC-370 | Create-receipt patterns shared by phase 1 and phase 2. See findings below. |

## Findings

`create-receipt-regex.test.js` compares `POST /movements/receive` with `POST /beta-2/receipts`. The values come from the phase 1 parity lists in `waste-movement-backend`.

Both phases agree on these patterns:

- Carrier registration number
- Receiver authorisation number
- UK receipt postcode
- Consignment code
- EWC code format (`^\d{6}$`, using codes from the official list)

The same registration pattern is also used for a broker or dealer, and the same postcode pattern is used on a carrier or broker address. Those fields are not set in this file.

These are not shared rules, so they are not in the comparison:

- Phone number. Phase 2 checks a pattern. Phase 1 stores it as plain text.
- Email. Both check an email format. That check is not one of these patterns.
- Movement IDs, delivery IDs, and SIC codes. Those patterns are not on a phase 1 create receipt.

These are real differences. The tests do not send them, because the phases do not agree:

- An Irish Eircode is rejected on a phase 1 receipt address and accepted on a phase 2 address.
- A carrier registration number with surrounding whitespace is rejected by phase 1 and accepted by phase 2.
- A lower-case UK postcode, and a postcode with surrounding whitespace, are still unchecked. The phase 2 postcode pattern allows both.

A phase 2 rejection is asserted as a 400 problem response. The error list is not matched exactly yet ([DWTC-221](https://eaflood.atlassian.net/browse/DWTC-221)).
