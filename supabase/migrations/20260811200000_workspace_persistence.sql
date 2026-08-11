create table public.sales_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  event_id uuid not null,
  source text not null check (source = 'entradaweb'),
  buyer_rows integer not null check (buyer_rows >= 0),
  total_tickets integer not null check (total_tickets >= 0),
  rejected_rows integer not null check (rejected_rows >= 0),
  by_device jsonb not null default '{}'::jsonb check (jsonb_typeof(by_device) = 'object'),
  by_province jsonb not null default '{}'::jsonb check (jsonb_typeof(by_province) = 'object'),
  by_locality jsonb not null default '{}'::jsonb check (jsonb_typeof(by_locality) = 'object'),
  imported_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id),
  unique (id, organization_id),
  constraint sales_snapshots_event_org_fk
    foreign key (event_id, organization_id)
    references public.events(id, organization_id)
    on delete cascade
);

create index sales_snapshots_event_imported_at_idx
  on public.sales_snapshots (event_id, imported_at desc);

alter table public.sales_snapshots enable row level security;

create policy "members can read sales snapshots"
on public.sales_snapshots for select
to authenticated
using (private.is_org_member(organization_id));

create policy "editors can create sales snapshots"
on public.sales_snapshots for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_org_role(
    organization_id,
    array['admin', 'editor']::public.app_role[]
  )
);

create policy "admins can delete sales snapshots"
on public.sales_snapshots for delete
to authenticated
using (private.has_org_role(organization_id, array['admin']::public.app_role[]));

revoke all on table public.sales_snapshots from anon, authenticated;
grant select, insert, delete on table public.sales_snapshots to authenticated;

create function private.log_workspace_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  record_id uuid;
  record_organization_id uuid;
begin
  if tg_op = 'UPDATE'
    and (to_jsonb(new) - 'updated_at') is not distinct from
      (to_jsonb(old) - 'updated_at') then
    return new;
  end if;

  if tg_op = 'DELETE' then
    record_id := old.id;
    record_organization_id := old.organization_id;
  else
    record_id := new.id;
    record_organization_id := new.organization_id;
  end if;

  insert into public.activity_log (
    organization_id,
    actor_id,
    entity_type,
    entity_id,
    action,
    summary
  ) values (
    record_organization_id,
    (select auth.uid()),
    tg_table_name,
    record_id,
    lower(tg_op),
    ''
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function private.log_workspace_change() from public;

create trigger events_log_change
after insert or update or delete on public.events
for each row execute function private.log_workspace_change();
create trigger campaigns_log_change
after insert or update or delete on public.campaigns
for each row execute function private.log_workspace_change();
create trigger campaign_phases_log_change
after insert or update or delete on public.campaign_phases
for each row execute function private.log_workspace_change();
create trigger content_assets_log_change
after insert or update or delete on public.content_assets
for each row execute function private.log_workspace_change();
create trigger publishing_tasks_log_change
after insert or update or delete on public.publishing_tasks
for each row execute function private.log_workspace_change();
create trigger sales_snapshots_log_change
after insert or delete on public.sales_snapshots
for each row execute function private.log_workspace_change();

comment on table public.sales_snapshots is
  'Aggregated EntradaWeb imports only. Buyer identity and raw provider rows are forbidden.';
