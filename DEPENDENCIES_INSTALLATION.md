# Installation des Dépendances Manquantes

## Problèmes Détectés

L'IDE a détecté plusieurs modules manquants. Voici comment les résoudre :

---

## 🔧 Backend Dependencies

### 1. Sentry (Monitoring)

```bash
cd backend
npm install @sentry/node @sentry/profiling-node
npm install --save-dev @types/node
```

### 2. Stripe (Paiements)

```bash
npm install stripe
npm install --save-dev @types/stripe
```

### 3. NestJS Schedule (Cron Jobs)

```bash
npm install @nestjs/schedule
```

### 4. Tesseract.js (OCR)

```bash
npm install tesseract.js
npm install --save-dev @types/tesseract.js
```

### 5. PDF Generation

```bash
npm install pdfkit
npm install --save-dev @types/pdfkit
```

### 6. QR Code

```bash
npm install qrcode
npm install --save-dev @types/qrcode
```

### 7. AWS SDK (S3)

```bash
npm install @aws-sdk/client-s3
npm install @aws-sdk/lib-storage
```

### 8. Testing

```bash
npm install --save-dev @types/jest @types/supertest jest supertest ts-jest
```

---

## 🎨 Frontend Dependencies

### 1. Sentry (Monitoring)

```bash
cd ..  # Retour à la racine
npm install @sentry/react @sentry/tracing
```

### 2. Recharts (Graphiques)

```bash
npm install recharts
```

### 3. React Router

```bash
npm install react-router-dom
npm install --save-dev @types/react-router-dom
```

### 4. Axios (HTTP Client)

```bash
npm install axios
```

### 5. React Toastify (Notifications)

```bash
npm install react-toastify
```

### 6. Lucide React (Icons)

```bash
npm install lucide-react
```

---

## 📦 Installation Complète

### Backend (Tout en une fois)

```bash
cd backend

# Production dependencies
npm install \
  @sentry/node \
  @sentry/profiling-node \
  stripe \
  @nestjs/schedule \
  tesseract.js \
  pdfkit \
  qrcode \
  @aws-sdk/client-s3 \
  @aws-sdk/lib-storage

# Dev dependencies
npm install --save-dev \
  @types/node \
  @types/stripe \
  @types/tesseract.js \
  @types/pdfkit \
  @types/qrcode \
  @types/jest \
  @types/supertest \
  jest \
  supertest \
  ts-jest
```

### Frontend (Tout en une fois)

```bash
cd ..  # Retour à la racine

# Production dependencies
npm install \
  @sentry/react \
  @sentry/tracing \
  recharts \
  react-router-dom \
  axios \
  react-toastify \
  lucide-react

# Dev dependencies
npm install --save-dev \
  @types/react-router-dom
```

---

## 🔍 Vérification

### Backend

```bash
cd backend
npm list @sentry/node
npm list stripe
npm list @nestjs/schedule
npm list tesseract.js
```

### Frontend

```bash
cd ..
npm list @sentry/react
npm list recharts
npm list react-router-dom
```

---

## 🛠️ Corrections TypeScript

### Fix: Type 'unknown' pour error

Dans tous les fichiers avec `'error' is of type 'unknown'`, ajouter :

```typescript
// Avant
} catch (error) {
  console.error(error);
}

// Après
} catch (error: any) {
  console.error(error);
}

// Ou mieux (type-safe)
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Fix: Object is possibly 'undefined'

Dans `migration.service.ts`, ajouter des vérifications :

```typescript
// Avant
await this.connection.db.collection('users').updateMany(...)

// Après
if (!this.connection.db) {
  throw new Error('Database connection not available');
}
await this.connection.db.collection('users').updateMany(...)
```

### Fix: Parameter implicitly has 'any' type

Ajouter les types explicites :

```typescript
// Avant
beforeSend(event, hint) {

// Après
beforeSend(event: any, hint: any) {

// Ou avec types Sentry
import { Event, EventHint } from '@sentry/types';
beforeSend(event: Event, hint: EventHint) {
```

---

## 📋 Package.json Scripts

### Backend

Ajouter dans `backend/package.json` :

```json
{
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "migration:run": "ts-node src/database/migrations/migration.service.ts",
    "seed:premium-quotas": "ts-node src/database/seeds/premium-quota.seed.ts"
  }
}
```

### Frontend

Ajouter dans `package.json` (racine) :

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

---

## 🚀 Après Installation

### 1. Rebuild

```bash
# Backend
cd backend
npm run build

# Frontend
cd ..
npm run build
```

### 2. Vérifier Erreurs

```bash
# Backend
cd backend
npx tsc --noEmit

# Frontend
cd ..
npx tsc --noEmit
```

### 3. Lancer Dev Servers

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd ..
npm run dev
```

---

## 📝 Notes Importantes

### Versions Recommandées

```json
{
  "@sentry/node": "^7.100.0",
  "@sentry/react": "^7.100.0",
  "stripe": "^14.0.0",
  "@nestjs/schedule": "^4.0.0",
  "tesseract.js": "^5.0.0",
  "recharts": "^2.10.0",
  "react-router-dom": "^6.20.0"
}
```

### Compatibilité

- Node.js: >= 18.0.0
- npm: >= 9.0.0
- TypeScript: >= 5.0.0

### Troubleshooting

Si des erreurs persistent :

```bash
# Nettoyer cache npm
npm cache clean --force

# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install

# Rebuild native modules
npm rebuild
```

---

## ✅ Checklist

- [ ] Installer dépendances backend
- [ ] Installer dépendances frontend
- [ ] Vérifier versions
- [ ] Corriger types TypeScript
- [ ] Rebuild projets
- [ ] Vérifier compilation
- [ ] Lancer dev servers
- [ ] Tester fonctionnalités

---

## 🆘 Support

Si problèmes persistent :

1. Vérifier versions Node.js/npm
2. Consulter logs d'erreur complets
3. Vérifier compatibilité packages
4. Nettoyer et réinstaller

**Commande de diagnostic** :

```bash
node --version
npm --version
npm list --depth=0
```
