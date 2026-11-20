USE smart_travel_planner;

-- Add column if you have not run migration yet (skip if column already exists)
ALTER TABLE activities
  ADD COLUMN age_category VARCHAR(50) DEFAULT 'All Ages' AFTER image_url;

-- Map all activities to 3 categories: Kids | Adults | All Ages
UPDATE activities SET age_category = 'Adults' WHERE name IN ('Rock Fortress Climb', 'Nine Arch Bridge Hike', 'Snorkeling');
UPDATE activities SET age_category = 'Kids' WHERE name IN ('Kandyan Dance Show', 'Tea Factory Tour', 'Whale Watching');
UPDATE activities SET age_category = 'All Ages' WHERE name IN (
  'Village Safari',
  'Temple of the Tooth Visit',
  'Galle Fort Walking Tour',
  'Tea Plantation Walk'
);

-- Fix any old values from previous migration
UPDATE activities SET age_category = 'All Ages'
WHERE age_category NOT IN ('Kids', 'Adults', 'All Ages') OR age_category IS NULL;
