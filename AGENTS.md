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
- Admin role comes only from the `handle_auth_user` trigger for verified allow-listed emails; never from user-editable data. Why: prevents privilege escalation.
