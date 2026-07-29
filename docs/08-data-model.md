# Modelo de datos MVP

Fuente: Documento Funcional Maestro del MVP, seccion 11.

> Este documento conserva el modelo conceptual completo. La implementacion segura
> vigente del primer corte esta en
> `supabase/migrations/20260729080655_core_workspace.sql`: usa tablas en `public`,
> RLS, membresias por organizacion y una proyeccion publica separada. No aplicar los
> ejemplos SQL de este documento directamente.

## Esquemas

```sql
create schema if not exists core;
create schema if not exists campaigns;
create schema if not exists integrations;
create schema if not exists analytics;
create schema if not exists audit;
```

## Tipos base

```sql
create type core.event_ecosystem_mode as enum (
  'independent',
  'accred'
);

create type core.website_status as enum (
  'hidden',
  'draft',
  'scheduled',
  'published',
  'private_link',
  'archived'
);

create type core.sale_status as enum (
  'coming_soon',
  'presale',
  'available',
  'last_tickets',
  'sold_out',
  'rescheduled',
  'cancelled',
  'finished'
);

create type integrations.sync_status as enum (
  'none',
  'configured',
  'syncing',
  'linked',
  'error',
  'archived'
);
```

## Tablas principales

```sql
create table core.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  created_at timestamptz not null default now()
);

create table core.people (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references core.organizations(id),
  display_name text,
  email text,
  phone text,
  instagram_handle text,
  relation_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table core.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references core.organizations(id),
  name text not null,
  slug text unique,
  starts_at timestamptz not null,
  doors_at timestamptz,
  venue_name text,
  city text,
  capacity integer,
  age_restriction text,
  ecosystem_mode core.event_ecosystem_mode not null default 'independent',
  website_status core.website_status not null default 'draft',
  sale_status core.sale_status not null default 'coming_soon',
  ticketing_provider text not null default 'none',
  external_ticket_url text,
  accred_event_id text,
  hero_image_url text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table integrations.accred_event_modules (
  event_id uuid primary key references core.events(id) on delete cascade,
  ticketing boolean not null default false,
  accreditation boolean not null default false,
  access_control boolean not null default false,
  invitations boolean not null default false,
  canteen boolean not null default false,
  sales_reporting boolean not null default false,
  post_event_loyalty boolean not null default false,
  sync_status integrations.sync_status not null default 'none',
  last_synced_at timestamptz,
  last_error text
);

create table campaigns.campaigns (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references core.events(id),
  name text not null,
  objective text not null,
  audience text,
  creative_concept text,
  budget_amount numeric(12,2),
  budget_currency text default 'ARS',
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'draft',
  owner_id uuid references core.people(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table campaigns.content_assets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns.campaigns(id) on delete cascade,
  title text not null,
  asset_type text not null,
  master_url text,
  base_copy text,
  status text not null default 'draft',
  created_by uuid references core.people(id),
  approved_by uuid references core.people(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table campaigns.publishing_tasks (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references campaigns.content_assets(id) on delete cascade,
  channel text not null,
  format text,
  scheduled_at timestamptz,
  published_at timestamptz,
  status text not null default 'draft',
  provider text,
  provider_post_id text,
  error text,
  created_at timestamptz not null default now()
);

create table campaigns.touchpoints (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references core.events(id),
  campaign_id uuid references campaigns.campaigns(id),
  person_id uuid references core.people(id),
  source text not null,
  channel text not null,
  intent text,
  payload jsonb not null default '{}',
  occurred_at timestamptz not null default now()
);

create table campaigns.giveaways (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns.campaigns(id) on delete cascade,
  name text not null,
  prize text not null,
  keyword text,
  rules text,
  closes_at timestamptz,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table campaigns.giveaway_entries (
  id uuid primary key default gen_random_uuid(),
  giveaway_id uuid references campaigns.giveaways(id) on delete cascade,
  person_id uuid references core.people(id),
  external_comment_id text,
  is_valid boolean not null default true,
  is_winner boolean not null default false,
  is_backup boolean not null default false,
  created_at timestamptz not null default now(),
  unique(giveaway_id, external_comment_id)
);

create table core.consents (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references core.people(id) on delete cascade,
  channel text not null,
  purpose text not null,
  granted boolean not null,
  source text,
  granted_at timestamptz,
  revoked_at timestamptz
);

create table integrations.sync_jobs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id uuid references core.events(id),
  operation text not null,
  idempotency_key text not null unique,
  payload jsonb not null,
  status text not null default 'pending',
  attempts integer not null default 0,
  next_attempt_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references core.people(id),
  entity_type text not null,
  entity_id text not null,
  action text not null,
  summary text,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);
```

## Reglas importantes

- `core.events` es el punto comun entre Social Hub, web y Accred.
- `accred_event_id` es opcional y no debe existir en eventos independientes.
- Datos sensibles de pago no se almacenan en Social Hub.
- Personas de prensa, proveedores, tecnica o staff no entran automaticamente en audiencias comerciales.
- Las fusiones de identidad ambiguas requieren revision humana.
