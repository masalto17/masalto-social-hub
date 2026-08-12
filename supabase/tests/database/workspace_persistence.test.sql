begin;

select plan(9);

select has_table('public', 'sales_snapshots', 'sales snapshots table exists');

select ok(
  (
    select relation.relrowsecurity
    from pg_catalog.pg_class relation
    join pg_catalog.pg_namespace namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relname = 'sales_snapshots'
  ),
  'RLS is enabled on sales snapshots'
);

select ok(
  not has_table_privilege('anon', 'public.sales_snapshots', 'select'),
  'anonymous visitors cannot read sales snapshots'
);

select ok(
  has_table_privilege('authenticated', 'public.sales_snapshots', 'insert'),
  'authenticated editors can reach the insert policy'
);

select matches(
  (
    select qual
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename = 'sales_snapshots'
      and policyname = 'members can read sales snapshots'
  ),
  'is_org_member',
  'sales reads are isolated by organization membership'
);

select matches(
  (
    select with_check
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename = 'sales_snapshots'
      and policyname = 'editors can create sales snapshots'
  ),
  'has_org_role',
  'sales writes are isolated by organization role'
);

select ok(
  not has_table_privilege('authenticated', 'public.sales_snapshots', 'update'),
  'snapshots are immutable'
);

select is(
  (
    select count(*)::integer
    from pg_catalog.pg_constraint
    where conname = 'sales_snapshots_event_org_fk'
      and contype = 'f'
  ),
  1,
  'sales snapshot references are scoped to one organization'
);

select is(
  (
    select count(*)::integer
    from pg_catalog.pg_trigger
    where tgname in (
      'events_log_change',
      'campaigns_log_change',
      'campaign_phases_log_change',
      'content_assets_log_change',
      'publishing_tasks_log_change',
      'sales_snapshots_log_change'
    )
      and not tgisinternal
  ),
  6,
  'workspace writes generate database-owned audit records'
);

select * from finish();
rollback;
