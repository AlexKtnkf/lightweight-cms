# Domain-Oriented Implementation Guide

## Step-by-Step Migration

### Step 1: Create Domain Layer Structure

```bash
mkdir -p src/domains/{content,media,settings,auth}/{domain,application,infrastructure}
mkdir -p src/infrastructure/{database,static,storage}
mkdir -p src/presentation/{api/{admin,public},web}
mkdir -p src/shared/{errors,utils}
```

### Step 2: Extract Domain Models

**File: `src/shared/errors/DomainError.js`**
```javascript
class DomainError extends Error {
  constructor(message, code = 'DOMAIN_ERROR') {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}

module.exports = DomainError;
```

**File: `src/domains/content/domain/Slug.js`** (Value Object)
```javascript
class Slug {
  constructor(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('Slug must be a non-empty string');
    }
    if (!/^[a-z0-9-]+$/.test(value)) {
      throw new Error('Slug must contain only lowercase letters, numbers, and hyphens');
    }
    this.value = value;
  }

  static create(value) {
    return new Slug(value);
  }

  equals(other) {
    return other instanceof Slug && this.value === other.value;
  }

  toString() {
    return this.value;
  }
}

module.exports = Slug;
```

**File: `src/domains/content/domain/Page.js`** (Domain Model)
```javascript
const Slug = require('./Slug');
const DomainError = require('../../../shared/errors/DomainError');

class Page {
  constructor({ id, title, slug, published = false, blocks = [], meta = {} }) {
    this.id = id;
    this.title = title?.trim() || '';
    this.slug = slug ? Slug.create(slug) : null;
    this.published = published;
    this.blocks = blocks || [];
    this.meta = {
      title: meta.title || null,
      description: meta.description || null,
      og_title: meta.og_title || null,
      og_description: meta.og_description || null,
      og_image_id: meta.og_image_id || null,
    };
  }

  publish() {
    this.published = true;
  }

  unpublish() {
    this.published = false;
  }

  addBlock(block) {
    if (!block || !block.block_type) {
      throw new DomainError('Block must have a type');
    }
    this.blocks.push(block);
  }

  removeBlock(index) {
    if (index < 0 || index >= this.blocks.length) {
      throw new DomainError('Invalid block index');
    }
    this.blocks.splice(index, 1);
  }

  updateBlock(index, block) {
    if (index < 0 || index >= this.blocks.length) {
      throw new DomainError('Invalid block index');
    }
    this.blocks[index] = block;
  }

  validate() {
    if (!this.title || this.title.trim().length === 0) {
      throw new DomainError('Page title is required');
    }
    if (!this.slug) {
      throw new DomainError('Page slug is required');
    }
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      slug: this.slug?.toString(),
      published: this.published,
      blocks: this.blocks,
      meta: this.meta,
    };
  }
}

module.exports = Page;
```

### Step 3: Create Use Cases

**File: `src/domains/content/application/CreatePage.js`**
```javascript
const Page = require('../domain/Page');
const slugify = require('../../../shared/utils/slugify');

class CreatePage {
  constructor(pageRepository, blockRepository, staticGenerator) {
    this.pageRepository = pageRepository;
    this.blockRepository = blockRepository;
    this.staticGenerator = staticGenerator;
  }

  async execute(pageData) {
    // Create domain model
    const slug = pageData.slug || slugify(pageData.title);
    const page = new Page({
      ...pageData,
      slug,
      blocks: pageData.blocks || [],
    });

    // Validate
    page.validate();

    // Persist
    const savedPageData = await this.pageRepository.save(page.toJSON());
    const savedPage = new Page(savedPageData);

    // Save blocks
    if (page.blocks.length > 0) {
      await this.blockRepository.saveBlocks('page', savedPage.id, page.blocks);
      // Reload with blocks
      const blocks = await this.blockRepository.findByContent('page', savedPage.id);
      savedPage.blocks = blocks;
    }

    // Generate static file if published
    if (savedPage.published) {
      await this.staticGenerator.generatePage(savedPage.slug.toString());
    }

    return savedPage.toJSON();
  }
}

module.exports = CreatePage;
```

**File: `src/domains/content/application/UpdatePage.js`**
```javascript
const Page = require('../domain/Page');

class UpdatePage {
  constructor(pageRepository, blockRepository, staticGenerator) {
    this.pageRepository = pageRepository;
    this.blockRepository = blockRepository;
    this.staticGenerator = staticGenerator;
  }

  async execute(id, pageData) {
    // Load existing page
    const existing = await this.pageRepository.findById(id);
    if (!existing) {
      const error = new Error('Page not found');
      error.status = 404;
      throw error;
    }

    // Create domain model with updates
    const page = new Page({
      ...existing,
      ...pageData,
      id, // Ensure ID doesn't change
    });

    // Validate
    page.validate();

    // Prevent deleting homepage (id = 1)
    if (id === 1 && pageData.deleted) {
      throw new Error('Cannot delete homepage');
    }

    // Persist
    const savedPageData = await this.pageRepository.update(id, page.toJSON());
    const savedPage = new Page(savedPageData);

    // Update blocks
    if (pageData.blocks !== undefined) {
      await this.blockRepository.deleteByContent('page', id);
      if (page.blocks.length > 0) {
        await this.blockRepository.saveBlocks('page', id, page.blocks);
      }
      // Reload with blocks
      const blocks = await this.blockRepository.findByContent('page', id);
      savedPage.blocks = blocks;
    }

    // Regenerate static file if published
    if (savedPage.published) {
      await this.staticGenerator.generatePage(savedPage.slug.toString());
    }

    return savedPage.toJSON();
  }
}

module.exports = UpdatePage;
```

**File: `src/domains/content/application/GetPage.js`**
```javascript
const Page = require('../domain/Page');

class GetPage {
  constructor(pageRepository, blockRepository) {
    this.pageRepository = pageRepository;
    this.blockRepository = blockRepository;
  }

  async execute(id) {
    const pageData = await this.pageRepository.findById(id);
    if (!pageData) {
      const error = new Error('Page not found');
      error.status = 404;
      throw error;
    }

    // Load blocks
    const blocks = await this.blockRepository.findByContent('page', id);
    
    const page = new Page({
      ...pageData,
      blocks,
    });

    return page.toJSON();
  }
}

module.exports = GetPage;
```

**File: `src/domains/content/application/ListPages.js`**
```javascript
class ListPages {
  constructor(pageRepository) {
    this.pageRepository = pageRepository;
  }

  async execute(options = {}) {
    const { limit = 50, offset = 0, excludeHomepage = true } = options;
    const pages = await this.pageRepository.findAllAdmin(limit, offset, excludeHomepage);
    return pages;
  }
}

module.exports = ListPages;
```

### Step 4: Create API Controllers

**File: `src/presentation/api/admin/pagesController.js`**
```javascript
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
      res.status(201).json(page);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const page = await this.updatePage.execute(parseInt(id), req.body);
      res.json(page);
    } catch (error) {
      next(error);
    }
  }

  async get(req, res, next) {
    try {
      const { id } = req.params;
      const page = await this.getPage.execute(parseInt(id));
      res.json(page);
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const pages = await this.listPages.execute({ limit, offset });
      res.json(pages);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await this.deletePage.execute(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PagesController;
```

### Step 5: Wire Up Dependencies

**File: `routes/admin-api.js`**
```javascript
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');

// Repositories (infrastructure)
const pageRepository = require('../repositories/pageRepository');
const blockRepository = require('../repositories/blockRepository');
const staticGenerator = require('../utils/staticGenerator');

// Use cases (application)
const CreatePage = require('../src/domains/content/application/CreatePage');
const UpdatePage = require('../src/domains/content/application/UpdatePage');
const GetPage = require('../src/domains/content/application/GetPage');
const ListPages = require('../src/domains/content/application/ListPages');
const DeletePage = require('../src/domains/content/application/DeletePage');

// Controllers (presentation)
const PagesController = require('../src/presentation/api/admin/pagesController');

// Instantiate use cases
const createPage = new CreatePage(pageRepository, blockRepository, staticGenerator);
const updatePage = new UpdatePage(pageRepository, blockRepository, staticGenerator);
const getPage = new GetPage(pageRepository, blockRepository);
const listPages = new ListPages(pageRepository);
const deletePage = new DeletePage(pageRepository, staticGenerator);

// Instantiate controller
const pagesController = new PagesController(
  createPage,
  updatePage,
  deletePage,
  getPage,
  listPages
);

// Routes
router.use(requireAuth);

router.get('/pages', (req, res, next) => pagesController.list(req, res, next));
router.get('/pages/:id', (req, res, next) => pagesController.get(req, res, next));
router.post('/pages', (req, res, next) => pagesController.create(req, res, next));
router.put('/pages/:id', (req, res, next) => pagesController.update(req, res, next));
router.delete('/pages/:id', (req, res, next) => pagesController.delete(req, res, next));

module.exports = router;
```

### Step 6: Update Server

**File: `server.js`** (add to existing)
```javascript
const adminApiRoutes = require('./routes/admin-api');

// ... existing code ...

app.use('/api/admin', adminApiRoutes);
```

### Step 7: React Admin Setup

**File: `admin/src/domains/content/types.ts`** (TypeScript)
```typescript
export interface Page {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  blocks: Block[];
  meta: {
    title?: string;
    description?: string;
    og_title?: string;
    og_description?: string;
    og_image_id?: number;
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

**Note:** All React admin code will be TypeScript (`.ts`/`.tsx`), backend remains plain JavaScript (`.js`).

**File: `admin/src/shared/api/pages.ts`**
```typescript
import api from './client';
import { Page } from '../../domains/content/types';

export const pagesApi = {
  list: (): Promise<Page[]> => 
    api.get('/api/admin/pages').then(r => r.data),
  
  get: (id: number): Promise<Page> => 
    api.get(`/api/admin/pages/${id}`).then(r => r.data),
  
  create: (data: Partial<Page>): Promise<Page> => 
    api.post('/api/admin/pages', data).then(r => r.data),
  
  update: (id: number, data: Partial<Page>): Promise<Page> => 
    api.put(`/api/admin/pages/${id}`, data).then(r => r.data),
  
  delete: (id: number): Promise<void> => 
    api.delete(`/api/admin/pages/${id}`).then(() => undefined),
};
```

**File: `admin/src/features/pages/PageEditor.tsx`** (TypeScript)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Page } from '../../domains/content/types';
import { pagesApi } from '../../shared/api/pages';
import { BlockEditor } from '../blocks/BlockEditor';

const pageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string(),
  published: z.boolean(),
  meta: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
  blocks: z.array(z.any()).default([]),
});

type PageForm = z.infer<typeof pageSchema>;

export function PageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: page, isLoading } = useQuery<Page>({
    queryKey: ['page', id],
    queryFn: () => pagesApi.get(Number(id!)),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (data: PageForm) => 
      id ? pagesApi.update(Number(id), data) : pagesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      navigate('/admin/pages');
    },
  });

  const form = useForm<PageForm>({
    resolver: zodResolver(pageSchema),
    defaultValues: page || {
      title: '',
      slug: '',
      published: false,
      blocks: [],
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <form onSubmit={form.handleSubmit(mutation.mutate)}>
      <input {...form.register('title')} />
      <BlockEditor 
        blocks={form.watch('blocks')} 
        onChange={(blocks) => form.setValue('blocks', blocks)}
      />
      <button type="submit">Save</button>
    </form>
  );
}
```

## 🎯 Migration Order

1. **Week 1**: Extract domain models, create use cases
2. **Week 2**: Create API controllers, wire up routes
3. **Week 3**: Build React admin frontend
4. **Week 4**: Migrate remaining domains, cleanup

## ✅ Benefits

- **Clear separation** - Domain logic isolated
- **Testable** - Each layer can be tested independently
- **Maintainable** - Changes localized to domains
- **Scalable** - Easy to add new features/domains
- **Type-safe** - TypeScript in frontend, clear contracts
