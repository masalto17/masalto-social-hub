create schema if not exists private;

create type public.app_role as enum ('admin', 'editor', 'reader');
create type public.event_ecosystem_mode as enum ('independent', 'accred');
create type public.website_status as enum (
  'hidden',
  'draft',
  'scheduled',
  'published',
  'private_link',
  'archived'
);
create type public.sale_status as enum (
  'coming_soon',
  'presale',
  'available',
  'last_tickets',
  'sold_out',
  'rescheduled',
  'cancelled',
  'finished'
);
create type public.campaign_status as enum (
  'draft',
  'planned',
  'active',
  'paused',
  'finished',
  'archived'
);
create type public.content_status as enum (
  'draft',
  'in_review',
  'approved',
  'scheduled',
  'published',
  'failed',
  'archived'
);
create type public.social_channel as enum (
  'instagram',
  'facebook',
  'tiktok',
  'youtube',
  'whatsapp',
  'web'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'reader',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  starts_at timestamptz not null,
  venue_name text not null check (char_length(venue_name) between 2 and 120),
  city text not null check (char_length(city) between 2 and 80),
  capacity integer check (capacity is null or capacity > 0),
  ecosystem_mode public.event_ecosystem_mode not null default 'independent',
  website_status public.website_status not null default 'draft',
  sale_status public.sale_status not null default 'coming_soon',
  ticketing_provider text not null default 'none'
    check (ticketing_provider in ('entradaweb', 'accred', 'external', 'physical', 'none')),
  external_ticket_url text check (
    external_ticket_url is null or external_ticket_url ~ '^https://'
  ),
  accred_enabled boolean not null default false,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug),
  unique (id, organization_id)
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  event_id uuid,
  name text not null check (char_length(name) between 2 and 120),
  objective text not null check (char_length(objective) between 2 and 160),
  audience text not null default '',
  creative_concept text not null default '',
  budget_amount numeric(14, 2) check (budget_amount is null or budget_amount >= 0),
  budget_currency text not null default 'ARS' check (budget_currency = 'ARS'),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.campaign_status not null default 'draft',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  unique (id, organization_id),
  constraint campaigns_event_org_fk foreign key (event_id, organization_id)
    references public.events(id, organization_id)
);

create table public.content_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  campaign_id uuid not null,
  title text not null check (char_length(title) between 2 and 160),
  base_copy text not null default '',
  format text not null default '',
  status public.content_status not null default 'draft',
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  constraint content_campaign_org_fk foreign key (campaign_id, organization_id)
    references public.campaigns(id, organization_id)
    on delete cascade,
  check (
    (status in ('approved', 'scheduled', 'published') and approved_by is not null and approved_at is not null)
    or status not in ('approved', 'scheduled', 'published')
  )
);

create table public.publishing_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  content_id uuid not null,
  channel public.social_channel not null,
  scheduled_at timestamptz not null,
  published_at timestamptz,
  status public.content_status not null default 'draft',
  provider text not null default 'manual' check (provider = 'manual'),
  provider_post_id text,
  last_error text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_id, channel, scheduled_at),
  constraint publishing_content_org_fk foreign key (content_id, organization_id)
    references public.content_assets(id, organization_id)
    on delete cascade
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  summary text not null default '',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Public event data is intentionally duplicated here so anonymous visitors never
-- receive internal campaign or workspace fields.
create table public.public_event_pages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  event_id uuid not null unique,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  headline text not null default '',
  description text not null default '',
  starts_at timestamptz not null,
  venue_name text not null,
  city text not null,
  sale_status public.sale_status not null default 'coming_soon',
  hero_image_url text check (hero_image_url is null or hero_image_url ~ '^https://'),
  social_image_url text check (social_image_url is null or social_image_url ~ '^https://'),
  ticket_url text check (ticket_url is null or ticket_url ~ '^https://'),
  offer_price numeric(14, 2) check (offer_price is null or offer_price >= 0),
  offer_currency text check (offer_currency is null or offer_currency = 'ARS'),
  website_status public.website_status not null default 'draft',
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  check (
    website_status <> 'published'
    or (published_at is not null and ticket_url is not null)
  ),
  constraint public_event_org_fk foreign key (event_id, organization_id)
    references public.events(id, organization_id)
    on delete cascade
);

create index organization_members_user_id_idx
  on public.organization_members (user_id);
create index events_organization_starts_at_idx
  on public.events (organization_id, starts_at);
create index campaigns_organization_status_idx
  on public.campaigns (organization_id, status);
create index content_assets_campaign_status_idx
  on public.content_assets (campaign_id, status);
create index publishing_tasks_organization_scheduled_at_idx
  on public.publishing_tasks (organization_id, scheduled_at);
create index activity_log_organization_created_at_idx
  on public.activity_log (organization_id, created_at desc);
create index public_event_pages_status_starts_at_idx
  on public.public_event_pages (website_status, starts_at);

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function private.set_updated_at();
create trigger events_set_updated_at
before update on public.events
for each row execute function private.set_updated_at();
create trigger campaigns_set_updated_at
before update on public.campaigns
for each row execute function private.set_updated_at();
create trigger content_assets_set_updated_at
before update on public.content_assets
for each row execute function private.set_updated_at();
create trigger publishing_tasks_set_updated_at
before update on public.publishing_tasks
for each row execute function private.set_updated_at();
create trigger public_event_pages_set_updated_at
before update on public.public_event_pages
for each row execute function private.set_updated_at();

create function private.is_org_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.organization_members membership
      where membership.organization_id = target_organization_id
        and membership.user_id = (select auth.uid())
    );
$$;

create function private.has_org_role(
  target_organization_id uuid,
  allowed_roles public.app_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.organization_members membership
      where membership.organization_id = target_organization_id
        and membership.user_id = (select auth.uid())
        and membership.role = any (allowed_roles)
    );
$$;

revoke all on schema private from public;
grant usage on schema private to authenticated;
revoke all on function private.set_updated_at() from public;
revoke all on function private.is_org_member(uuid) from public;
revoke all on function private.has_org_role(uuid, public.app_role[]) from public;
grant execute on function private.is_org_member(uuid) to authenticated;
grant execute on function private.has_org_role(uuid, public.app_role[]) to authenticated;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.events enable row level security;
alter table public.campaigns enable row level security;
alter table public.content_assets enable row level security;
alter table public.publishing_tasks enable row level security;
alter table public.activity_log enable row level security;
alter table public.public_event_pages enable row level security;

create policy "members can read their organizations"
on public.organizations for select
to authenticated
using (private.is_org_member(id));

create policy "admins can update their organizations"
on public.organizations for update
to authenticated
using (private.has_org_role(id, array['admin']::public.app_role[]))
with check (private.has_org_role(id, array['admin']::public.app_role[]));

create policy "members can read organization memberships"
on public.organization_members for select
to authenticated
using (private.is_org_member(organization_id));

create policy "admins can add organization memberships"
on public.organization_members for insert
to authenticated
with check (
  private.has_org_role(organization_id, array['admin']::public.app_role[])
);

create policy "admins can update organization memberships"
on public.organization_members for update
to authenticated
using (private.has_org_role(organization_id, array['admin']::public.app_role[]))
with check (private.has_org_role(organization_id, array['admin']::public.app_role[]));

create policy "admins can delete organization memberships"
on public.organization_members for delete
to authenticated
using (private.has_org_role(organization_id, array['admin']::public.app_role[]));

create policy "members can read events"
on public.events for select
to authenticated
using (private.is_org_member(organization_id));

create policy "editors can create events"
on public.events for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_org_role(
    organization_id,
    array['admin', 'editor']::public.app_role[]
  )
);

create policy "editors can update events"
on public.events for update
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

create policy "admins can delete events"
on public.events for delete
to authenticated
using (private.has_org_role(organization_id, array['admin']::public.app_role[]));

create policy "members can read campaigns"
on public.campaigns for select
to authenticated
using (private.is_org_member(organization_id));

create policy "editors can create campaigns"
on public.campaigns for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_org_role(
    organization_id,
    array['admin', 'editor']::public.app_role[]
  )
);

create policy "editors can update campaigns"
on public.campaigns for update
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

create policy "admins can delete campaigns"
on public.campaigns for delete
to authenticated
using (private.has_org_role(organization_id, array['admin']::public.app_role[]));

create policy "members can read content"
on public.content_assets for select
to authenticated
using (private.is_org_member(organization_id));

create policy "editors can create content"
on public.content_assets for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_org_role(
    organization_id,
    array['admin', 'editor']::public.app_role[]
  )
);

create policy "editors can update content"
on public.content_assets for update
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

create policy "admins can delete content"
on public.content_assets for delete
to authenticated
using (private.has_org_role(organization_id, array['admin']::public.app_role[]));

create policy "members can read publishing tasks"
on public.publishing_tasks for select
to authenticated
using (private.is_org_member(organization_id));

create policy "editors can create publishing tasks"
on public.publishing_tasks for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_org_role(
    organization_id,
    array['admin', 'editor']::public.app_role[]
  )
);

create policy "editors can update publishing tasks"
on public.publishing_tasks for update
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

create policy "admins can delete publishing tasks"
on public.publishing_tasks for delete
to authenticated
using (private.has_org_role(organization_id, array['admin']::public.app_role[]));

create policy "members can read activity"
on public.activity_log for select
to authenticated
using (private.is_org_member(organization_id));

create policy "anyone can read published event pages"
on public.public_event_pages for select
to anon, authenticated
using (website_status = 'published');

create policy "members can read event page drafts"
on public.public_event_pages for select
to authenticated
using (private.is_org_member(organization_id));

create policy "admins can create public event pages"
on public.public_event_pages for insert
to authenticated
with check (
  private.has_org_role(
    organization_id,
    array['admin']::public.app_role[]
  )
);

create policy "admins can update public event pages"
on public.public_event_pages for update
to authenticated
using (
  private.has_org_role(
    organization_id,
    array['admin']::public.app_role[]
  )
)
with check (
  private.has_org_role(
    organization_id,
    array['admin']::public.app_role[]
  )
);

create policy "admins can delete public event pages"
on public.public_event_pages for delete
to authenticated
using (private.has_org_role(organization_id, array['admin']::public.app_role[]));

revoke all on table
  public.organizations,
  public.organization_members,
  public.events,
  public.campaigns,
  public.content_assets,
  public.publishing_tasks,
  public.activity_log,
  public.public_event_pages
from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table
  public.organizations,
  public.organization_members,
  public.events,
  public.campaigns,
  public.content_assets,
  public.publishing_tasks,
  public.public_event_pages
to authenticated;
grant select on table public.activity_log to authenticated;
grant select on table public.public_event_pages to anon;

comment on table public.public_event_pages is
  'Public-safe event projection. Never add internal notes, tokens, PII, or provider payloads.';
comment on column public.events.accred_enabled is
  'Feature flag only. Keep false until the Accred contract and connector are approved.';
