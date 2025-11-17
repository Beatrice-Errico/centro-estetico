-- Reset policies to make the script idempotente (ri-eseguibile)
drop policy if exists "service_role_full_access_customers" on public.customers;
drop policy if exists "service_role_full_access_services" on public.services;
drop policy if exists "service_role_full_access_appointments" on public.appointments;

drop policy if exists "public_read_services" on public.services;
drop policy if exists "public_read_customers" on public.customers;
drop policy if exists "public_read_appointments" on public.appointments;

-- Concedi pieno accesso al ruolo di servizio (usato solo lato server)
create policy "service_role_full_access_customers"
  on public.customers
  for all
  to service_role
  using (true)
  with check (true);

create policy "service_role_full_access_services"
  on public.services
  for all
  to service_role
  using (true)
  with check (true);

create policy "service_role_full_access_appointments"
  on public.appointments
  for all
  to service_role
  using (true)
  with check (true);

-- Lettura pubblica (opzionale). Rimuovi se vuoi tutto privato.
create policy "public_read_services"
  on public.services
  for select
  to anon
  using (true);

create policy "public_read_customers"
  on public.customers
  for select
  to anon
  using (true);

create policy "public_read_appointments"
  on public.appointments
  for select
  to anon
  using (true);
