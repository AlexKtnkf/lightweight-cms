-- Backfill default social_links for existing settings rows (column is defined in 001_initial.sql)
UPDATE settings 
SET social_links = '[
  {"platform": "instagram", "url": "https://instagram.com", "icon": "instagram"},
  {"platform": "facebook", "url": "https://facebook.com", "icon": "facebook"},
  {"platform": "linkedin", "url": "https://linkedin.com", "icon": "linkedin"}
]'
WHERE social_links IS NULL OR social_links = '[]';
