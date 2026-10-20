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
