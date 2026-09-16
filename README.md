# PsyCare MVP — cabinet de psychiatrie

Starter full-stack pour un cabinet de psychiatrie : site vitrine, disponibilités, prise de rendez-vous et back-office praticienne.

## Stack

- Frontend : Next.js 16.3.3 + React 19 + TypeScript + Tailwind CSS 4
- Backend : NestJS 11 + TypeScript
- ORM : Prisma 7.10 + PostgreSQL
- Auth admin : JWT dans cookie HttpOnly
- Fuseau métier : `Africa/Casablanca`
- Infra : Docker / Docker Compose / Nginx

## Fonctionnalités incluses

- Accueil professionnel responsive
- Page de prise de rendez-vous
- Génération automatique des créneaux depuis les horaires hebdomadaires
- Stockage UTC + affichage en heure du Maroc
- Protection contre la double réservation via `activeSlotKey @unique`
- Rendez-vous cabinet ou téléconsultation
- Connexion admin
- Dashboard avec rendez-vous et changement de statut
- Gestion des plages horaires hebdomadaires
- API de périodes bloquées / congés
- Helmet, validation DTO, cookie HttpOnly, CORS configuré

## Important : périmètre médical

Ce MVP ne collecte volontairement **pas** le motif de consultation, diagnostic, traitement, notes psychiatriques ou dossier clinique. Avant d'ajouter ces données, il faut faire une revue complète : conformité CNDP / loi 09-08, base légale, information/consentement, hébergement, contrôle d'accès, chiffrement, journalisation, sauvegardes, conservation et procédure d'incident.

Ce code est un starter technique, pas une certification de conformité ni un système médical prêt pour la production.

## Démarrage local — méthode simple

Prérequis : Node.js 22+, npm et Docker.

### 1. PostgreSQL

À la racine :

```bash
docker compose up -d db
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

API : `http://localhost:4000/api`

Healthcheck : `http://localhost:4000/api/health`

### 3. Frontend

Dans un second terminal :

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Application : `http://localhost:3000`

Admin : `http://localhost:3000/admin/login`

Identifiants de développement présents dans `.env.example` :

- email : `admin@cabinet.local`
- mot de passe : `ChangeMeNow123!`

Change-les immédiatement.

## Mot de passe admin en production

Génère un hash bcrypt :

```bash
cd backend
npm run hash-password -- "UnMotDePasseTresLongEtUnique"
```

Puis mets le résultat dans :

```env
ADMIN_PASSWORD_HASH=$2b$12$...
```

et supprime `ADMIN_PASSWORD`.

## API principale

### Publique

```text
GET  /api/health
GET  /api/availability?date=2026-09-01
POST /api/appointments
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Exemple de création :

```json
{
  "patientName": "Nom Patient",
  "phone": "+212600000000",
  "email": "patient@example.com",
  "startAt": "2026-09-01T09:00:00.000Z",
  "type": "CABINET"
}
```

N'utilise pas une heure arbitraire : le frontend envoie un `startAt` retourné par `/availability`.

### Admin

```text
GET    /api/admin/appointments
PATCH  /api/admin/appointments/:id/status
GET    /api/admin/availability-rules
PUT    /api/admin/availability-rules
GET    /api/admin/blocked-periods
POST   /api/admin/blocked-periods
DELETE /api/admin/blocked-periods/:id
```

## Docker complet

Le `docker-compose.yml` est volontairement orienté démonstration locale. Avant production, remplace tous les secrets et évite d'exposer PostgreSQL publiquement.

```bash
docker compose build
docker compose up -d db
```

Il faut ensuite appliquer la migration Prisma avant de lancer le backend la première fois. En production, utilise une étape CI/CD dédiée avec :

```bash
npx prisma migrate deploy
```

## Production recommandée

Sur un VPS/cloud approprié :

```text
Internet
   |
HTTPS / Nginx
   |-------------------|
Next.js :3000     NestJS :4000
                       |
                 PostgreSQL privé
```

- TLS obligatoire
- PostgreSQL non exposé à Internet
- sauvegardes chiffrées et testées
- pare-feu
- MFA admin à ajouter avant production
- rate limiting à ajouter sur login et réservation
- journal d'audit des actions admin
- secrets via gestionnaire de secrets, pas dans Git
- monitoring et alertes
- revue juridique/CNDP avant collecte de données de santé

Un exemple Nginx est fourni dans `deploy/nginx.conf.example`.

## Extensions suggérées

1. Email/SMS de confirmation et rappel
2. Blocage de congés depuis l'interface admin
3. MFA/TOTP pour la praticienne
4. calendrier FullCalendar
5. paiement en ligne si nécessaire
6. téléconsultation via un prestataire adapté
7. audit log append-only
8. tests unitaires/e2e
9. CI/CD GitHub Actions

## Personnalisation

Remplace dans le frontend :

- `Dr. Prénom Nom`
- téléphone
- adresse
- spécialités
- biographie
- photo professionnelle
- horaires
- mentions légales / politique de confidentialité
