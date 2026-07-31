begin;

select plan(7);

select has_column(
  'public',
  'publishing_tasks',
  'copy',
  'publishing tasks preserve channel-specific copy'
);

select has_table(
  'public',
  'campaign_phases',
  'campaign phases table exists'
);

select has_column(
  'public',
  'campaign_phases',
  'channels',
  'campaign phases include planned channels'
);

select ok(
  (
    select relation.relrowsecurity
    from pg_catalog.pg_class relation
    join pg_catalog.pg_namespace namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relname = 'campaign_phases'
  ),
  'RLS is enabled on campaign phases'
);

select ok(
  not has_table_privilege('anon', 'public.campaign_phases', 'select'),
  'anonymous visitors cannot read campaign phases'
);

select ok(
  has_table_privilege('authenticated', 'public.campaign_phases', 'insert'),
  'authenticated editors can reach the insert policy'
);

select is(
  (
    select count(*)::integer
    from pg_catalog.pg_constraint
    where conname = 'campaign_phases_campaign_org_fk'
      and contype = 'f'
  ),
  1,
  'campaign phase references are scoped to one organization'
);

select * from finish();
rollback;
