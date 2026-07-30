-- Approval metadata is database-owned so editors cannot impersonate an approver.
create function private.enforce_content_approval()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  changes_protected_status boolean :=
    new.status is distinct from old.status
    and (
      new.status in ('approved', 'scheduled', 'published')
      or old.status in ('approved', 'scheduled', 'published')
    );
  changes_approval_identity boolean :=
    new.approved_by is distinct from old.approved_by
    or new.approved_at is distinct from old.approved_at;
begin
  if changes_protected_status or changes_approval_identity then
    if not private.has_org_role(
      new.organization_id,
      array['admin']::public.app_role[]
    ) then
      raise exception 'content approval requires an organization admin'
        using errcode = '42501';
    end if;

    if new.status in ('approved', 'scheduled', 'published') then
      new.approved_by := (select auth.uid());
      new.approved_at := now();
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_content_approval() from public;

create trigger content_assets_enforce_approval
before update on public.content_assets
for each row execute function private.enforce_content_approval();
