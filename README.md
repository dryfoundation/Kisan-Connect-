# KisanConnect — Farmer + Buyer + Admin Prototype

## New in this version
- Farmer + Buyer main website
- Separate Admin portal
- Farmer verification detail screen
- Admin listing moderation with farmer notifications
- Add Produce now opens a choice: Create new listing OR continue from saved drafts
- Save as draft persists the listing in browser localStorage
- Existing drafts can be continued or deleted
- Publishing a draft removes it from the draft list

## Run
1. Extract the ZIP completely.
2. Open `index.html` for the main website.
3. Open `admin/admin.html` only for the separate admin portal if present; in this package the admin files remain alongside the main files from the earlier prototype.

## Demo only
No real SMS, Aadhaar/UIDAI, payments, government procurement, logistics-provider API, or production AI is connected. Drafts, listings, orders and notifications use browser localStorage.


## Notifications
Farmer notifications are shown from the header notification button. The badge shows the number of unread notifications. Opening the button shows unread admin/system messages; Mark all read hides them from the notification menu and clears the badge. Prototype data uses localStorage.

## v20 buyer-side upgrade
The buyer portal now includes a stronger marketplace experience:
- Freshness, distance, farmer rating and verified-source indicators on listing cards.
- Search, category, location and sorting filters.
- Multi-item shopping cart with quantity controls and free-delivery threshold messaging.
- Smart Buy matcher for natural-language style requests such as “50 kg tomatoes under ₹35/kg”.
- Bulk Buyer mode for retail shops, restaurants, institutions and wholesale buyers.
- Improved checkout with multiple farmer listings, delivery option and demo payment messaging.
- Existing order tracking/logistics workflow remains connected to buyer orders.
- Buyer-side demo data is local-browser state only; no real payments are processed.


### Trust & risk controls (latest update)
- Buyer Trust Center explains farmer verification, produce transparency, price/delivery transparency, dispute handling and privacy-by-design.
- Buyer Trust Center includes a demo “Report a problem” flow that creates a local dispute record.
- Admin panel includes a separate Risk & Dispute Center with risk signals, dispute queue, evidence/source fields and demo Monitor/Resolve actions.
- Risk signals are presented as prompts for human review, not automatic guilt or fraud determinations.
- Dispute records are local browser demo data under `kcDisputes`; production should use authenticated backend storage, access controls, audit logs, evidence retention rules and a documented dispute/refund policy.
