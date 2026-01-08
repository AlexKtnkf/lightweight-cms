# Admin Panel Rework - Domain-Oriented Architecture

## 🎯 Goals
- **Simplify admin building** - Remove EJS/Alpine.js complexity
- **Focus on frontend design** - Keep frontend dead simple
- **Clean architecture** - Domain-oriented, clear boundaries
- **Maintain static generation** - Keep current static gen for pages/homepage

## 🏗️ Domain-Oriented Architecture

### Core Domains

1. **Content Domain** - Pages, Articles, Blocks
2. **Media Domain** - File uploads, image optimization
3. **Settings Domain** - Site configuration
4. **Auth Domain** - Authentication & authorization
5. **Static Generation** - Infrastructure concern

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  - Admin UI (React SPA)                                     │
│  - Public Frontend (EJS templates)                         │
│  - API Controllers (HTTP handlers)                          │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                  Application Layer                          │
│  - Use Cases (CreatePage, UpdatePage, etc.)                 │
│  - Application Services (orchestrate domain services)      │
│  - DTOs (Data Transfer Objects)                             │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│  - Domain Models (Page, Article, Block, Media, Settings)    │
│  - Domain Services (business logic)                         │
│  - Domain Events (optional, for future)                     │
│  - Value Objects (Slug, BlockType, etc.)                    │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                        │
│  - Repositories (data access)                               │
│  - Static Generator                                         │
│  - File System (media storage)                              │
│  - Database (SQLite)                                        │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Domain-Oriented Structure

```
lightweight-cms/
├── src/
│   ├── domains/
│   │   ├── content/
│   │   │   ├── domain/
│   │   │   │   ├── Page.js              # Domain model
│   │   │   │   ├── Article.js            # Domain model
│   │   │   │   ├── Block.js              # Domain model
│   │   │   │   ├── BlockType.js          # Value object
│   │   │   │   └── Slug.js               # Value object
│   │   │   ├── application/
│   │   │   │   ├── CreatePage.js         # Use case
│   │   │   │   ├── UpdatePage.js         # Use case
│   │   │   │   ├── DeletePage.js          # Use case
│   │   │   │   ├── GetPage.js            # Use case
│   │   │   │   └── ListPages.js          # Use case
│   │   │   └── infrastructure/
│   │   │       └── PageRepository.js     # Data access
│   │   ├── media/
│   │   │   ├── domain/
│   │   │   │   └── Media.js              # Domain model
│   │   │   ├── application/
│   │   │   │   ├── UploadMedia.js        # Use case
│   │   │   │   └── DeleteMedia.js        # Use case
│   │   │   └── infrastructure/
│   │   │       └── MediaRepository.js    # Data access
│   │   ├── settings/
│   │   │   ├── domain/
│   │   │   │   └── Settings.js           # Domain model
│   │   │   ├── application/
│   │   │   │   └── UpdateSettings.js     # Use case
│   │   │   └── infrastructure/
│   │   │       └── SettingsRepository.js # Data access
│   │   └── auth/
│   │       ├── domain/
│   │       │   └── User.js               # Domain model
│   │       ├── application/
│   │       │   ├── Login.js               # Use case
│   │       │   └── Authenticate.js       # Use case
│   │       └── infrastructure/
│   │           └── UserRepository.js     # Data access
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── Database.js               # DB connection
│   │   ├── static/
│   │   │   └── StaticGenerator.js       # Static generation
│   │   └── storage/
│   │       └── FileStorage.js            # File system operations
│   ├── presentation/
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── pagesController.js    # HTTP handlers
│   │   │   │   ├── articlesController.js
│   │   │   │   ├── mediaController.js
│   │   │   │   └── settingsController.js
│   │   │   └── public/
│   │   │       └── publicController.js  # Public API
│   │   └── web/
│   │       └── pageController.js        # EJS rendering
│   └── shared/
│       ├── errors/
│       │   └── DomainError.js            # Domain errors
│       └── utils/
│           ├── slugify.js
│           └── sanitize.js
├── admin/                                 # React admin panel
│   ├── src/
│   │   ├── domains/                      # Frontend domain models
│   │   │   ├── content/
│   │   │   │   └── types.ts             # TypeScript types
│   │   │   └── media/
│   │   │       └── types.ts
│   │   ├── features/                     # Feature modules
│   │   │   ├── pages/
│   │   │   │   ├── PagesList.tsx
│   │   │   │   ├── PageEditor.tsx
│   │   │   │   └── hooks/
│   │   │   │       └── usePages.ts
│   │   │   ├── articles/
│   │   │   │   └── ...
│   │   │   └── media/
│   │   │       └── ...
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── api/
│   │   │       └── client.ts
│   │   └── App.tsx
│   └── package.json
├── views/                                 # Public frontend (unchanged)
│   ├── pages/
│   ├── partials/
│   └── layouts/
└── package.json
```

## 🎯 Domain Models

### Content Domain

**Page.js** (Domain Model)
```javascript
class Page {
  constructor({ id, title, slug, published, blocks, meta }) {
    this.id = id;
    this.title = title;
    this.slug = Slug.create(slug || slugify(title));
    this.published = published;
    this.blocks = blocks || [];
    this.meta = meta || {};
  }

  publish() {
    this.published = true;
  }

  unpublish() {
    this.published = false;
  }

  addBlock(block) {
    this.blocks.push(block);
  }

  removeBlock(index) {
    this.blocks.splice(index, 1);
  }

  validate() {
    if (!this.title || this.title.trim().length === 0) {
      throw new DomainError('Page title is required');
    }
    if (!this.slug.isValid()) {
      throw new DomainError('Invalid slug');
    }
  }
}
```

**CreatePage.js** (Use Case)
```javascript
class CreatePage {
  constructor(pageRepository, blockRepository, staticGenerator) {
    this.pageRepository = pageRepository;
    this.blockRepository = blockRepository;
    this.staticGenerator = staticGenerator;
  }

  async execute(pageData) {
    // Create domain model
    const page = new Page(pageData);
    page.validate();

    // Persist
    const savedPage = await this.pageRepository.save(page);
    
    // Save blocks
    if (page.blocks.length > 0) {
      await this.blockRepository.saveBlocks('page', savedPage.id, page.blocks);
    }

    // Generate static file if published
    if (page.published) {
      await this.staticGenerator.generatePage(page.slug.value);
    }

    return savedPage;
  }
}
```

### Media Domain

**Media.js** (Domain Model)
```javascript
class Media {
  constructor({ id, filename, path, mimeType, size, dimensions }) {
    this.id = id;
    this.filename = filename;
    this.path = path;
    this.mimeType = mimeType;
    this.size = size;
    this.dimensions = dimensions;
  }

  isImage() {
    return this.mimeType?.startsWith('image/');
  }

  getUrl() {
    return `/api/media/${this.id}`;
  }
}
```

## 🔄 Application Flow

### Example: Creating a Page

```
1. HTTP Request → pagesController.create()
2. Controller → CreatePage.execute(pageData)
3. Use Case → Page domain model (validation)
4. Use Case → PageRepository.save()
5. Use Case → BlockRepository.saveBlocks()
6. Use Case → StaticGenerator.generatePage()
7. Use Case → Return saved page
8. Controller → Return JSON response
```

## 📦 API Structure

### Admin API Endpoints

```javascript
// presentation/api/admin/pagesController.js
class PagesController {
  constructor(createPage, updatePage, deletePage, getPage, listPages) {
    this.createPage = createPage;
    this.updatePage = updatePage;
    this.deletePage = deletePage;
    this.getPage = getPage;
    this.listPages = listPages;
  }

  async create(req, res, next) {
    try {
      const page = await this.createPage.execute(req.body);
      res.json(page);
    } catch (error) {
      next(error);
    }
  }

  // ... other methods
}
```

### Routes

```javascript
// routes/admin-api.js
const pagesController = require('../src/presentation/api/admin/pagesController');
const createPage = require('../src/domains/content/application/CreatePage');
// ... wire up dependencies

router.post('/api/admin/pages', requireAuth, (req, res, next) => {
  pagesController.create(req, res, next);
});
```

## 🎨 Admin Frontend (React)

### Domain Types

```typescript
// admin/src/domains/content/types.ts
export interface Page {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  blocks: Block[];
  meta: {
    title?: string;
    description?: string;
  };
}

export interface Block {
  block_type: BlockType;
  block_data: Record<string, any>;
}

export type BlockType = 
  | 'rich_text' 
  | 'hero' 
  | 'encart_principal' 
  | 'question_reponse'
  | 'pin_grid'
  | 'numbered_cards'
  | 'lead_magnet'
  | 'contact_form';
```

### Feature Module

```typescript
// admin/src/features/pages/PageEditor.tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Page } from '../../domains/content/types';
import { pagesApi } from '../../shared/api/pages';

const pageSchema = z.object({
  title: z.string().min(1),
  slug: z.string(),
  published: z.boolean(),
  blocks: z.array(z.any()),
});

export function PageEditor({ pageId }: { pageId?: number }) {
  const { data: page } = useQuery<Page>({
    queryKey: ['page', pageId],
    queryFn: () => pagesApi.get(pageId!),
    enabled: !!pageId,
  });

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof pageSchema>) => 
      pageId ? pagesApi.update(pageId, data) : pagesApi.create(data),
  });

  const form = useForm({
    resolver: zodResolver(pageSchema),
    defaultValues: page || { blocks: [] },
  });

  return (
    <form onSubmit={form.handleSubmit(mutation.mutate)}>
      {/* Form fields */}
    </form>
  );
}
```

## 🚀 Benefits of Domain-Oriented Architecture

1. **Clear Boundaries** - Each domain is self-contained
2. **Testability** - Domain logic isolated from infrastructure
3. **Maintainability** - Changes in one domain don't affect others
4. **Scalability** - Easy to add new domains or features
5. **Business Logic** - Lives in domain models, not scattered
6. **Type Safety** - Clear contracts between layers

## 📋 Migration Strategy

### Phase 1: Refactor Backend (Domain Layer)
1. Extract domain models from services
2. Create use cases (application layer)
3. Keep repositories as-is (infrastructure)
4. Create API controllers (presentation)

### Phase 2: Build Admin Frontend
1. Setup React + Vite
2. Create domain types (TypeScript)
3. Build feature modules
4. Connect to API

### Phase 3: Cleanup
1. Remove old admin EJS templates
2. Remove Alpine.js
3. Simplify CSP
4. Update documentation

## 🎯 Principles

1. **Domain First** - Business logic in domain models
2. **Dependency Inversion** - Infrastructure depends on domain, not vice versa
3. **Single Responsibility** - Each class/function has one job
4. **Explicit Dependencies** - No hidden dependencies
5. **Keep It Simple** - Don't over-engineer

## 📦 Stack

### Backend
- **Express.js** - HTTP server
- **JavaScript** - Plain JavaScript (no TypeScript, no JSDoc)
- **Domain Models** - Plain JavaScript classes
- **Use Cases** - Application services
- **Repositories** - Data access (keep existing)

### Admin Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety (TypeScript only, no JavaScript)
- **Vite** - Build tool
- **shadcn/ui** - UI components
- **React Query** - Data fetching
- **Zod** - Validation

### Public Frontend
- **EJS** - Templates (unchanged)
- **HTML/CSS** - Simple, no JS framework

---

**Estimated Time:** 3-4 days for full migration
**Complexity:** Medium (domain modeling) → Low (maintenance)
**Risk:** Low (incremental migration, frontend untouched)
