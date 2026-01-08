/**
 * Generate JSON-LD structured data for SEO
 * Compliant with schema.org specifications
 */

class JSONLD {
  /**
   * Generate Organization/WebSite schema for homepage
   */
  static organization(baseUrl, settings) {
    const siteTitle = settings?.site_title || 'My Site';
    const siteDescription = settings?.site_tagline || '';
    
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': siteTitle,
      'url': baseUrl
    };
    
    if (siteDescription) {
      schema.description = siteDescription;
    }
    
    if (settings?.logo_media_id) {
      schema.logo = {
        '@type': 'ImageObject',
        'url': `${baseUrl}/api/media/${settings.logo_media_id}`
      };
    }
    
    return schema;
  }

  /**
   * Generate WebSite schema with search action
   */
  static website(baseUrl, settings) {
    const siteTitle = settings?.site_title || 'My Site';
    
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': siteTitle,
      'url': baseUrl,
      'potentialAction': {
        '@type': 'SearchAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': `${baseUrl}/blog?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    };
  }

  /**
   * Generate Article schema for blog posts
   */
  static article(baseUrl, article, settings) {
    const siteTitle = settings?.site_title || 'My Site';
    const articleUrl = `${baseUrl}/blog/${article.slug}`;
    const publishedDate = article.published_at || article.created_at;
    const modifiedDate = article.updated_at || publishedDate;
    
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': article.title,
      'description': article.meta_description || '',
      'url': articleUrl,
      'datePublished': publishedDate,
      'dateModified': modifiedDate,
      'author': {
        '@type': 'Organization',
        'name': siteTitle
      },
      'publisher': {
        '@type': 'Organization',
        'name': siteTitle,
        'url': baseUrl
      }
    };

    // Add image if available
    if (article.og_image_id) {
      schema.image = {
        '@type': 'ImageObject',
        'url': `${baseUrl}/api/media/${article.og_image_id}`
      };
    } else if (settings?.logo_media_id) {
      schema.image = {
        '@type': 'ImageObject',
        'url': `${baseUrl}/api/media/${settings.logo_media_id}`
      };
    }

    // Add mainEntityOfPage
    schema.mainEntityOfPage = {
      '@type': 'WebPage',
      '@id': articleUrl
    };

    return schema;
  }

  /**
   * Generate WebPage schema for regular pages
   */
  static webPage(baseUrl, page, settings) {
    const siteTitle = settings?.site_title || 'My Site';
    const pageUrl = `${baseUrl}/${page.slug}`;
    
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': page.title,
      'description': page.meta_description || '',
      'url': pageUrl,
      'inLanguage': 'fr-FR',
      'isPartOf': {
        '@type': 'WebSite',
        'name': siteTitle,
        'url': baseUrl
      }
    };

    // Add date if available
    if (page.published_at) {
      schema.datePublished = page.published_at;
    }
    if (page.updated_at) {
      schema.dateModified = page.updated_at;
    }

    return schema;
  }

  /**
   * Generate CollectionPage schema for blog listing
   */
  static collectionPage(baseUrl, settings) {
    const siteTitle = settings?.site_title || 'My Site';
    
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      'name': 'Blog',
      'url': `${baseUrl}/blog`,
      'description': `Articles du blog de ${siteTitle}`,
      'isPartOf': {
        '@type': 'WebSite',
        'name': siteTitle,
        'url': baseUrl
      }
    };
  }

  /**
   * Generate BreadcrumbList schema
   */
  static breadcrumbList(baseUrl, items) {
    // items should be array of {name, url}
    const breadcrumbItems = items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }));

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbItems
    };
  }

  /**
   * Render JSON-LD script tag
   */
  static render(schema) {
    return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
  }

  /**
   * Render multiple schemas
   */
  static renderMultiple(schemas) {
    return schemas.map(schema => this.render(schema)).join('\n');
  }
}

module.exports = JSONLD;
