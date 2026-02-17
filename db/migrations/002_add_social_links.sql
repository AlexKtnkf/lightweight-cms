-- Add social_links column to settings table
ALTER TABLE settings ADD COLUMN social_links TEXT DEFAULT '[]';

-- Set default social links for existing settings
UPDATE settings 
SET social_links = '[
  {"platform": "instagram", "url": "https://instagram.com", "icon": "instagram"},
  {"platform": "facebook", "url": "https://facebook.com", "icon": "facebook"},
  {"platform": "linkedin", "url": "https://linkedin.com", "icon": "linkedin"}
]'
WHERE social_links IS NULL OR social_links = '[]';
