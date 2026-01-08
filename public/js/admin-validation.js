/**
 * Client-side validation for admin forms
 * Provides real-time validation feedback
 */

(function() {
  'use strict';

  // Validation rules
  const validators = {
    required: (value) => {
      if (!value || value.trim() === '') {
        return 'Ce champ est requis';
      }
      return null;
    },

    minLength: (min) => (value) => {
      if (value && value.length < min) {
        return `Minimum ${min} caractères requis`;
      }
      return null;
    },

    maxLength: (max) => (value) => {
      if (value && value.length > max) {
        return `Maximum ${max} caractères autorisés`;
      }
      return null;
    },

    url: (value) => {
      if (value && value.trim() !== '') {
        try {
          new URL(value);
        } catch (e) {
          return 'URL invalide';
        }
      }
      return null;
    },

    slug: (value) => {
      if (value && value.trim() !== '') {
        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
        if (!slugRegex.test(value)) {
          return 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets';
        }
        if (value.length < 3) {
          return 'Le slug doit contenir au moins 3 caractères';
        }
      }
      return null;
    },

    number: (value) => {
      if (value && value.trim() !== '') {
        if (isNaN(value) || value < 0) {
          return 'Veuillez entrer un nombre valide';
        }
      }
      return null;
    },

    email: (value) => {
      if (value && value.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Email invalide';
        }
      }
      return null;
    },

    metaDescription: (value) => {
      if (value && value.length > 160) {
        return 'La description SEO devrait faire moins de 160 caractères (actuellement: ' + value.length + ')';
      }
      return null;
    }
  };

  // Field configurations
  const fieldConfigs = {
    'title': [validators.required, validators.minLength(3), validators.maxLength(200)],
    'slug': [validators.slug, validators.maxLength(200)],
    'meta_title': [validators.maxLength(60)],
    'meta_description': [validators.metaDescription, validators.maxLength(160)],
    'hero_cta_url': [validators.url],
    'hero_cta_secondary_url': [validators.url],
    'logo_media_id': [validators.number],
    'username': [validators.required, validators.minLength(3)],
    'password': [validators.required, validators.minLength(6)],
    'published_at': []
  };

  /**
   * Validate a field value
   */
  function validateField(field, value) {
    const config = fieldConfigs[field] || [];
    for (const validator of config) {
      const error = validator(value);
      if (error) {
        return error;
      }
    }
    return null;
  }

  /**
   * Show error message for a field
   */
  function showError(field, message) {
    const input = field;
    const label = input.closest('label');
    
    // Remove existing error
    const existingError = label.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    // Remove invalid class
    input.classList.remove('invalid');

    if (message) {
      // Add error message
      const errorEl = document.createElement('small');
      errorEl.className = 'error-message';
      errorEl.textContent = message;
      errorEl.setAttribute('role', 'alert');
      errorEl.setAttribute('aria-live', 'polite');
      label.appendChild(errorEl);

      // Add invalid class
      input.classList.add('invalid');
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.setAttribute('aria-invalid', 'false');
    }
  }

  /**
   * Validate all fields in a form
   */
  function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[type="text"], input[type="url"], input[type="number"], textarea, input[type="datetime-local"]');

    inputs.forEach(input => {
      const fieldName = input.name;
      if (!fieldName) return;

      const value = input.value;
      let error = null;

      // Check if field has validation config
      if (fieldConfigs[fieldName]) {
        error = validateField(fieldName, value);
      } else if (input.hasAttribute('required')) {
        // Validate required fields even if not in config
        error = validators.required(value);
      }
      
      if (error) {
        showError(input, error);
        isValid = false;
      } else {
        showError(input, null);
        // Mark as valid if it was invalid before
        if (input.classList.contains('invalid')) {
          input.classList.remove('invalid');
          input.classList.add('valid');
          setTimeout(() => input.classList.remove('valid'), 2000);
        }
      }
    });

    return isValid;
  }

  /**
   * Initialize validation for a form
   */
  function initFormValidation(form) {
    if (!form) return;

    // Validate on blur (when user leaves field)
    form.addEventListener('blur', (e) => {
      if (e.target.matches('input[type="text"], input[type="url"], input[type="number"], textarea')) {
        const fieldName = e.target.name;
        if (fieldName && fieldConfigs[fieldName]) {
          const error = validateField(fieldName, e.target.value);
          showError(e.target, error);
        }
      }
    }, true);

    // Real-time validation on input (with debounce)
    let debounceTimer;
    form.addEventListener('input', (e) => {
      if (e.target.matches('input[type="text"], input[type="url"], input[type="number"], textarea, input[type="datetime-local"]')) {
        const fieldName = e.target.name;
        if (fieldName && fieldConfigs[fieldName]) {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            const error = validateField(fieldName, e.target.value);
            showError(e.target, error);
          }, 300); // Wait 300ms after user stops typing
        }
      }
    });

    // Validate on submit
    form.addEventListener('submit', (e) => {
      if (!validateForm(form)) {
        e.preventDefault();
        e.stopPropagation();
        
        // Focus first invalid field
        const firstInvalid = form.querySelector('.invalid');
        if (firstInvalid) {
          firstInvalid.focus();
        }
        
        return false;
      }
    });
  }

  /**
   * Auto-generate slug from title
   */
  function initSlugGeneration(form) {
    const titleInput = form.querySelector('input[name="title"]');
    const slugInput = form.querySelector('input[name="slug"]');
    
    if (!titleInput || !slugInput) return;

    // Only auto-generate if slug is empty
    let slugWasEmpty = !slugInput.value;

    titleInput.addEventListener('input', () => {
      if (slugWasEmpty || !slugInput.value) {
        const slug = titleInput.value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove accents
          .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
          .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
        
        slugInput.value = slug;
        
        // Trigger validation
        if (slugInput.value) {
          const error = validateField('slug', slugInput.value);
          showError(slugInput, error);
        }
      }
    });

    // Track if user manually edits slug
    slugInput.addEventListener('input', () => {
      slugWasEmpty = false;
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Initialize validation for all forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      initFormValidation(form);
      initSlugGeneration(form);
    });
  }

  // Export for manual use if needed
  window.adminValidation = {
    validateField,
    validateForm,
    showError
  };
})();
