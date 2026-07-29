begin;

create extension if not exists pgtap with schema extensions;

select plan(16);

select has_table('public', 'organizations', 'organizations table exists');
select has_table('public', 'organization_members', 'memberships table exists');
select has_table('public', 'events', 'events table exists');
select has_table('public', 'campaigns', 'campaigns table exists');
select has_table('public', 'content_assets', 'content table exists');
select has_table('public', 'publishing_tasks', 'publishing tasks table exists');
select has_table('public', 'activity_log', 'activity log table exists');
select has_table('public', 'public_event_pages', 'public event projection exists');

select is(
  (
    select count(*)::integer
    from pg_catalog.pg_class relation
    join pg_catalog.pg_namespace namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relname in (
        'organizations',
        'organization_members',
        'events',
        'campaigns',
        'content_assets',
        'publishing_tasks',
        'activity_log',
        'public_event_pages'
      )
      and relation.relrowsecurity
  ),
  8,
  'RLS is enabled on every application table'
);

select ok(
  has_table_privilege('anon', 'public.public_event_pages', 'select'),
  'anonymous visitors can read the public projection'
);

select ok(
  not has_table_privilege('anon', 'public.events', 'select')
    and not has_table_privilege('anon', 'public.campaigns', 'select')
    and not has_table_privilege('anon', 'public.content_assets', 'select'),
  'anonymous visitors cannot read internal workspace tables'
);

select ok(
  not has_table_privilege('authenticated', 'public.activity_log', 'insert'),
  'clients cannot forge audit log entries'
);

select is(
  (
    select count(*)::integer
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and cmd = 'UPDATE'
      and with_check is null
  ),
  0,
  'every update policy has a WITH CHECK predicate'
);

select ok(
  not has_function_privilege(
    'anon',
    'private.is_org_member(uuid)',
    'execute'
  ),
  'anonymous visitors cannot execute membership helpers'
);

select ok(
  has_function_privilege(
    'authenticated',
    'private.is_org_member(uuid)',
    'execute'
  ),
  'authenticated users can execute membership helpers through RLS'
);

select is(
  (
    select count(*)::integer
    from pg_catalog.pg_constraint
    where conname in (
      'campaigns_event_org_fk',
      'content_campaign_org_fk',
      'publishing_content_org_fk',
      'public_event_org_fk'
    )
      and contype = 'f'
  ),
  4,
  'cross-entity references are scoped to one organization'
);

select * from finish();
rollback;
