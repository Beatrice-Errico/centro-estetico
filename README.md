# Centro Estetico — Next.js + Supabase (Starter)

Starter minimale per gestire **Servizi**, **Clienti** e **Appuntamenti** con Next.js (App Router) e Supabase (PostgreSQL + RLS).

## Requisiti
- Node 18+
- Account Supabase (scegli regione EU)

## Setup rapido
1. **Crea progetto Supabase** e copia `URL`, `anon key` e `service role key`.
2. **Esegui lo schema SQL** in `supabase/schema.sql` (SQL Editor di Supabase).
3. **Configura le variabili ambiente**:
   ```bash
   cp .env.example .env.local
   # incolla le tue chiavi
   ```
4. **Installa e avvia**:
   ```bash
   npm i
   npm run dev
   ```
5. Apri `http://localhost:3000`

> Nota: le operazioni di scrittura passano da **Server Actions** usando la **service role key**; l'accesso in lettura avviene dal client con `anon key` e **RLS** attive.

## Sicurezza (RLS)
- Le tabelle hanno **Row Level Security** attiva.
- Le policy incluse consentono al ruolo `service_role` (server) di fare tutto; dal client (anon) **di default** è sola lettura.
- Modifica/aggiungi policy in base al tuo modello di auth (es: login staff).

## Struttura
```
src/
  app/
    appointments/
    customers/
    services/
  components/
  lib/
supabase/
  schema.sql
  policies.sql
```

## TODO e idee
- Autenticazione staff con Supabase Auth.
- Pagina pubblica per prenotare (solo lettura listino + creare richiesta).
- Notifiche email/SMS (es. integrazione Resend/Twilio).
- Reportistica (fatturato, presenze) e calendario mensile.
# centro-estetico
