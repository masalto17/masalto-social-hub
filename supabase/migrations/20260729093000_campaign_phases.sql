create type public.campaign_phase_type as enum (
  'intrigue',
  'announcement',
  'desire',
  'conversion',
  'urgency',
  'custom'
);

create table public.campaign_phases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  campaign_id uuid not null,
  type public.campaign_phase_type not null,
  name text not null check (char_length(name) between 2 and 120),
  objective text not null check (char_length(objective) between 2 and 600),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  channels public.social_channel[] not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (cardinality(channels) > 0),
  unique (id, organization_id),
  constraint campaign_phases_campaign_org_fk
    foreign key (campaign_id, organization_id)
    references public.campaigns(id, organization_id)
    on delete cascade
);

create index campaign_phases_campaign_starts_at_idx
  on public.campaign_phases (campaign_id, starts_at);

create function private.validate_campaign_phase_window()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.campaigns campaign
    where campaign.id = new.campaign_id
      and campaign.organization_id = new.organization_id
      and new.starts_at >= campaign.starts_at
      and new.ends_at <= campaign.ends_at
  ) then
    raise exception 'campaign phase must fit inside its campaign window';
  end if;
  return new;
end;
$$;

create trigger campaign_phases_validate_window
before insert or update on public.campaign_phases
for each row execute function private.validate_campaign_phase_window();

create trigger campaign_phases_set_updated_at
before update on public.campaign_phases
for each row execute function private.set_updated_at();

revoke all on function private.validate_campaign_phase_window() from public;

alter table public.campaign_phases enable row level security;

create policy "members can read campaign phases"
on public.campaign_phases for select
to authenticated
using (private.is_org_member(organization_id));

create policy "editors can create campaign phases"
on public.campaign_phases for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_org_role(
    organization_id,
    array['admin', 'editor']::public.app_role[]
  )
);

create policy "editors can update campaign phases"
on public.campaign_phases for update
to authenticated
using (
  private.has_org_role(
    organization_id,
    array['admin', 'editor']::public.app_role[]
  )
)
with check (
  private.has_org_role(
    organization_id,
    array['admin', 'editor']::public.app_role[]
  )
);

create policy "admins can delete campaign phases"
on public.campaign_phases for delete
to authenticated
using (
  private.has_org_role(
    organization_id,
    array['admin']::public.app_role[]
  )
);

revoke all on table public.campaign_phases from anon, authenticated;
grant select, insert, update, delete on table public.campaign_phases
to authenticated;

comment on table public.campaign_phases is
  'Campaign stages with organization-scoped access and campaign-bounded dates.';
