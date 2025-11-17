-- Reset policies per poter ri-eseguire lo script
drop policy if exists "service_role_full_access_customers" on public.customers;
drop policy if exists "service_role_full_access_services" on public.services;
drop policy if exists "service_role_full_access_appointments" on public.appointments;

-- Pieno accesso al ruolo di servizio (solo lato server)
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

-- Nessuna policy di lettura per anon: tutto è privato.

