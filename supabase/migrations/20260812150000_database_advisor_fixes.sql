create index activity_log_actor_id_idx
  on public.activity_log (actor_id);

create index campaigns_event_organization_id_idx
  on public.campaigns (event_id, organization_id);
create index campaigns_created_by_idx
  on public.campaigns (created_by);

create index campaign_phases_campaign_organization_id_idx
  on public.campaign_phases (campaign_id, organization_id);
create index campaign_phases_organization_id_idx
  on public.campaign_phases (organization_id);
create index campaign_phases_created_by_idx
  on public.campaign_phases (created_by);

create index content_assets_campaign_organization_id_idx
  on public.content_assets (campaign_id, organization_id);
create index content_assets_organization_id_idx
  on public.content_assets (organization_id);
create index content_assets_approved_by_idx
  on public.content_assets (approved_by);
create index content_assets_created_by_idx
  on public.content_assets (created_by);

create index events_created_by_idx
  on public.events (created_by);

create index public_event_pages_event_organization_id_idx
  on public.public_event_pages (event_id, organization_id);
create index public_event_pages_organization_id_idx
  on public.public_event_pages (organization_id);

create index publishing_tasks_content_organization_id_idx
  on public.publishing_tasks (content_id, organization_id);
create index publishing_tasks_created_by_idx
  on public.publishing_tasks (created_by);

create index sales_snapshots_event_organization_id_idx
  on public.sales_snapshots (event_id, organization_id);
create index sales_snapshots_organization_id_idx
  on public.sales_snapshots (organization_id);
create index sales_snapshots_created_by_idx
  on public.sales_snapshots (created_by);

drop policy "anyone can read published event pages"
  on public.public_event_pages;
drop policy "members can read event page drafts"
  on public.public_event_pages;

create policy "anonymous can read published event pages"
on public.public_event_pages for select
to anon
using (website_status = 'published');

create policy "authenticated users can read accessible event pages"
on public.public_event_pages for select
to authenticated
using (
  website_status = 'published'
  or private.is_org_member(organization_id)
);
