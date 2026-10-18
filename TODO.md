# Delivery outcomes

## 1. Public local-agent identity and visual system

- [ ] The site presents Jhenaidah Pourshova Bank Asia Agent Bank as a local Bank Asia agent-banking outlet.
- [ ] The site clearly states that this is not a Bank Asia branch and not the official Bank Asia corporate website.
- [ ] The interface is modern, responsive, and visually aligned with the main Bank Asia website’s blue/indigo design language without copying its corporate information architecture.
- [ ] The public page has clear navigation, mobile-friendly layout, accessible focus states, and practical customer actions.

## 2. Verified local contact and location details

- [ ] The site uses the Google Maps listing name “Jhenaidah Pourshova Bank Asia Agent Bank”.
- [ ] The site publishes “Municipality Building, Jhenaidah 7300, Bangladesh”.
- [ ] The site publishes “+880 1717-098287” with a tap-to-call link.
- [ ] The site communicates the available listing-hours detail that it opens at 9:00 AM on Sunday, while avoiding unsupported full-week hours.
- [ ] The site links users to the provided Google Maps listing for directions.

## 3. Agent-banking and partnership content

- [ ] The site explains practical services available through the local agent outlet without implying full branch capabilities.
- [ ] The site explains that Bank Asia agent banking works with a2i / Aspire to Innovate, a Government of Bangladesh initiative.
- [ ] The site includes a Digital Centre option/section describing the Digital Centre-based agent-banking model under a2i and Bank Asia PLC.
- [ ] The content links to the official Bank Asia agent-banking page and the official Digital Centre/a2i reference.

## 4. Customer query workflow

- [ ] Customers can submit a query from the public site.
- [ ] The form captures name, phone, email (optional), query type, and message.
- [ ] The form validates required fields and displays an understandable success or failure state.
- [ ] The form includes clear consent/privacy wording.
- [ ] Successful submissions persist in the managed database with a new status of “new”.

## 5. Authorized admin dashboard

- [ ] `/admin` requires authorized staff access through the real Manus OAuth flow.
- [ ] `/admin` also supports a local username/password login using protected project secrets, with signed HTTP-only sessions and logout.
- [ ] Unauthorized visitors see a clear sign-in or access-denied state rather than query data.
- [ ] Authorized staff can view query records and summary counts.
- [ ] Authorized staff can filter/query by status, open a record, update status, and add internal notes.
- [ ] Authorized staff can export all customer queries as an Excel-compatible CSV file.
- [ ] Authorized staff can remove a record when appropriate.
- [ ] Admin procedures enforce the `admin` role server-side, not only in the UI.

## 6. Pre-handover verification

- [ ] The app type-checks and builds successfully.
- [ ] `/api/health` returns success.
- [ ] `/manus-routes.json` is served as valid JSON with `/` and `/admin`.
- [ ] The public page, navigation anchors, responsive layout, query validation, query submission, admin access state, and query-management flows are checked before handover.
- [ ] The final version is checkpointed to the canonical project repository and the delivered URL is labeled accurately as preview or published.
