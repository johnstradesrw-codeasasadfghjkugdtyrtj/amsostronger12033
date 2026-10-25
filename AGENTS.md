<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Paid access is decided only by `subscriptions` rows (not revoked, not expired) created by the `review_payment` SQL function; never grant it from the client. Why: RLS + server-side checks are the security boundary.
- Admin role is granted only manually in user_roles (auto-confirm is on, so email ownership is unverified); never from user-editable data or signup. Why: prevents privilege escalation.
- Use subscription_entitlement() as the single paid-access authority, with server time, approved payment ownership, suspension and plan snapshots; protected feature handlers recheck it per request. Why: stale browser state cannot authorize trading.
- Keep TanStack file routing and existing URLs; use safe same-origin auth return paths and server role checks for admin deep links. Why: refresh and external links must preserve authorization without SPA rewrites.
- Serve app media from `src/assets/*.asset.json` CDN pointers, and when embedding video put the MP4 source first with a WebM fallback source. Why: browsers that cannot decode H.264 (including headless checks) otherwise show a dead player.
- Super-admin membership is manually provisioned separately and checked by database functions; account suspension cannot target admins. Why: client controls and signup email cannot confer management authority.
- MT5 setup records contain only non-secret broker/server/account details and never establish a connection or bypass subscription entitlement. Why: no secure execution bridge is configured.
- Public membership metrics expose aggregate counts only; never fabricate growth or connection telemetry. Why: preserve privacy and truthful activity reporting.
- Bot marketplace orders, payments, entitlements and audit are independent of subscription tables; authenticated SQL RPCs snapshot prices and review payments, while server functions reauthorize private downloads and admin operations. Why: one-time file purchases cannot confer subscription access or leak paid assets.
- Validate bot uploads by content as ZIP, PDF or MQL source; distribute compiled EX4/EX5 inside ZIP, never pretend their undocumented binary formats are validated. Why: filenames and browser MIME types are not evidence of actual file type.
