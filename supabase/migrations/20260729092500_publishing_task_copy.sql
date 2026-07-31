alter table public.publishing_tasks
add column copy text not null default '';

comment on column public.publishing_tasks.copy is
  'Effective approved copy for this channel. Falls back to the content base copy in the application.';
