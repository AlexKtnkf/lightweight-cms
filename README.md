# Lightweight CMS

Un CMS léger et moderne pour le site d'AH, construit avec une stack minimaliste pour des performances optimales.

## 🚀 Stack Technique

- **Frontend**: HTML/CSS/JavaScript vanilla + Alpine.js
- **Backend**: Express.js + SQLite
- **Admin**: Pico CSS + Alpine.js
- **Sécurité**: Helmet, bcrypt, express-session, DOMPurify, rate limiting
- **Performance**: Génération statique pour pages et homepage
- **Accessibilité**: WCAG 2.1 AA compliant

## 📦 Installation

1. **Installer les dépendances:**
```bash
npm install
```

2. **Créer le fichier `.env`:**
```bash
cp .env.example .env
# Puis éditer .env avec vos valeurs
# (EXEMPLE)
# PORT=3000
# NODE_ENV=development
# SESSION_SECRET=your-secret-key-here
# DB_PATH=./database.db
# GA_ID=your-google-analytics-id
# SITE_HOST=localhost:3000
```

4. **Initialiser la base de données:**
```bash
npm run migrate
```

5. **Créer un utilisateur admin:**
```bash
npm run create-admin
```

6. **Démarrer le serveur:**
```bash
npm run dev
```

Le site sera accessible sur http://localhost:3000  
L'admin sera accessible sur http://localhost:3000/admin

## 📁 Structure du Projet

```
lightweight-cms/
├── config/          # Configuration (database, security, upload)
├── controllers/     # Gestionnaires de requêtes HTTP
├── services/        # Logique métier
├── repositories/    # Accès aux données
├── routes/          # Définition des routes
├── middleware/      # Middleware Express
├── views/           # Templates EJS
├── public/          # Fichiers statiques
│   ├── static/      # Pages statiques générées
│   └── uploads/     # Images uploadées
├── db/              # Base de données
│   ├── migrations/  # Scripts de migration SQL
│   └── seeds/       # Données de test (optionnel)
└── utils/           # Utilitaires (logger, sanitize, etc.)
```

## 🔒 Sécurité

- ✅ **Authentification par session** avec express-session
- ✅ **Hashage des mots de passe** avec bcrypt (10 rounds)
- ✅ **Validation des entrées** avec express-validator
- ✅ **Sanitization HTML** avec DOMPurify
- ✅ **Headers de sécurité** avec Helmet
- ✅ **Rate limiting** (100 req/15min général, 5 req/15min pour login)
- ✅ **Requêtes SQL paramétrées** (protection contre injection SQL)
- ⚠️ **CSRF protection** - À implémenter (voir section "Améliorations futures")

## ✨ Fonctionnalités

### Contenu
- **Articles de blog** avec système de blocs (rich_text, encart_principal, hero, question_reponse)
- **Pages statiques** avec génération statique automatique
- **Page d'accueil** avec hero section et accroches
- **Accroches** : blocs de type `accroche` dans la homepage, cohérents avec le système de blocs

### Performance
- **Génération statique** : Pages et homepage pré-générées en HTML (< 10ms de réponse)
- **Optimisation d'images** : Resize automatique, génération WebP et thumbnails
- **Lazy loading** : Images chargées à la demande (3 écrans de distance)

### SEO
- Meta tags (title, description)
- Open Graph tags
- **JSON-LD structured data** (Schema.org compliant) pour Organization, Article, WebPage, BreadcrumbList
- Sitemap.xml généré automatiquement
- Robots.txt
- RSS feed pour les articles

### Accessibilité (WCAG 2.1 AA)
- Navigation au clavier complète
- Attributs ARIA appropriés
- Structure sémantique HTML5
- Contraste des couleurs suffisant (4.5:1 minimum)
- Images avec alt text
- Lien "Aller au contenu principal"
- Support de `prefers-reduced-motion`

### Admin
- Interface simple avec Pico CSS
- Gestion CRUD pour articles, pages, homepage
- **Paramètres du site** : Configuration du titre, logo, menus (header/footer), texte du pied de page
- Upload et gestion de médias

## 🎯 Architecture

### Séparation des responsabilités
```
Routes → Controllers → Services → Repositories → Database
```

- **Routes** : Définition des endpoints
- **Controllers** : Gestion des requêtes HTTP (req/res)
- **Services** : Logique métier (validation, transformation)
- **Repositories** : Accès aux données (requêtes SQL)
- **Database** : SQLite avec requêtes paramétrées

## ⚡ Performance

### Génération Statique

Les **pages** et la **homepage** sont pré-générées en fichiers HTML statiques :

- **Génération automatique** lors de la publication/mise à jour
- **Serving direct** : Fichiers servis directement par Express (< 10ms)
- **Cache-friendly** : Headers de cache pour CDN
- **Articles dynamiques** : Restent dynamiques pour flexibilité

**Commandes:**
```bash
# Générer toutes les pages statiques
npm run generate-static
```

**Flux:**
```
Page publiée/mise à jour
    ↓
pageService.update() ou create()
    ↓
staticGenerator.generatePage()
    ↓
Rendu EJS avec tous les blocs
    ↓
Fichier HTML dans public/static/{slug}.html
    ↓
Requête utilisateur → Serve directement (< 10ms)
```

## ♿ Accessibilité

Le site est conforme aux standards WCAG 2.1 niveau AA :

- ✅ Navigation clavier complète
- ✅ Attributs ARIA (role, aria-label, aria-expanded, etc.)
- ✅ Structure sémantique (nav, main, article, section, footer)
- ✅ Contraste suffisant (4.5:1 pour texte normal)
- ✅ Images avec alt text descriptifs
- ✅ Lien "Aller au contenu principal"
- ✅ Support `prefers-reduced-motion`
- ✅ Zones cliquables minimum 44x44px
- ✅ Focus visible sur tous les éléments interactifs

## 📝 Scripts Disponibles

```bash
npm run dev          # Démarrer en mode développement
npm run start        # Démarrer en production
npm run migrate      # Exécuter les migrations
npm run create-admin # Créer un utilisateur admin
npm run generate-static # Régénérer toutes les pages statiques
```

## 🔧 Configuration

### Variables d'environnement (.env)

```env
# Serveur
PORT=3000
NODE_ENV=development

# Base de données
DB_PATH=./database.db

# Sécurité
SESSION_SECRET=your-secret-key-change-in-production

# Analytics
GA_ID=your-google-analytics-id

# Site
SITE_HOST=localhost:3000
```

## 🚧 Améliorations Futures

### Priorité Haute
- [ ] **CSRF Protection** : Ajouter middleware csurf pour les routes admin
- [ ] **Backup automatique** : Scripts de sauvegarde de la base de données

### Priorité Moyenne
- [ ] **Tests** : Tests unitaires et d'intégration
- [ ] **Classes d'erreur personnalisées** : NotFoundError, ValidationError, etc.
- [ ] **Monitoring** : Intégration avec service de monitoring (Sentry, etc.)

### Priorité Basse
- [ ] **Internationalisation** : Support multi-langues

