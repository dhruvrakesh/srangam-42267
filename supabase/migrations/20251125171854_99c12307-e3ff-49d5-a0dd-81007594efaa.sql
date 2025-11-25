-- Clean ** and other markdown formatting from existing titles
UPDATE srangam_articles 
SET title = jsonb_set(
  title::jsonb,
  '{en}',
  to_jsonb(
    TRIM(BOTH '**' FROM TRIM(BOTH '*' FROM TRIM(BOTH '__' FROM TRIM(BOTH '_' FROM (title->>'en')))))
  )
)
WHERE title->>'en' LIKE '%**%' OR title->>'en' LIKE '%__%' OR title->>'en' LIKE '**%' OR title->>'en' LIKE '%**';

-- Clean ** from Hindi titles
UPDATE srangam_articles 
SET title = jsonb_set(
  title::jsonb,
  '{hi}',
  to_jsonb(
    TRIM(BOTH '**' FROM TRIM(BOTH '*' FROM TRIM(BOTH '__' FROM TRIM(BOTH '_' FROM (title->>'hi')))))
  )
)
WHERE title->>'hi' IS NOT NULL 
AND (title->>'hi' LIKE '%**%' OR title->>'hi' LIKE '%__%');

-- Clean ** from Punjabi titles  
UPDATE srangam_articles 
SET title = jsonb_set(
  title::jsonb,
  '{pa}',
  to_jsonb(
    TRIM(BOTH '**' FROM TRIM(BOTH '*' FROM TRIM(BOTH '__' FROM TRIM(BOTH '_' FROM (title->>'pa')))))
  )
)
WHERE title->>'pa' IS NOT NULL 
AND (title->>'pa' LIKE '%**%' OR title->>'pa' LIKE '%__%');

-- Generate excerpts for existing articles without dek
-- Extract first 200 chars from content, removing HTML tags
UPDATE srangam_articles 
SET dek = jsonb_build_object(
  'en',
  SUBSTRING(
    REGEXP_REPLACE(
      REGEXP_REPLACE(content->>'en', '<[^>]+>', ' ', 'g'),
      '\s+', ' ', 'g'
    ),
    1, 200
  ) || '...'
)
WHERE (dek IS NULL OR dek::text = 'null') 
AND content->>'en' IS NOT NULL;

-- Generate Hindi excerpts if Hindi content exists but no Hindi dek
UPDATE srangam_articles 
SET dek = COALESCE(dek, '{}'::jsonb) || jsonb_build_object(
  'hi',
  SUBSTRING(
    REGEXP_REPLACE(
      REGEXP_REPLACE(content->>'hi', '<[^>]+>', ' ', 'g'),
      '\s+', ' ', 'g'
    ),
    1, 200
  ) || '...'
)
WHERE content->>'hi' IS NOT NULL
AND (dek IS NULL OR dek->>'hi' IS NULL);

-- Generate Punjabi excerpts if Punjabi content exists but no Punjabi dek
UPDATE srangam_articles 
SET dek = COALESCE(dek, '{}'::jsonb) || jsonb_build_object(
  'pa',
  SUBSTRING(
    REGEXP_REPLACE(
      REGEXP_REPLACE(content->>'pa', '<[^>]+>', ' ', 'g'),
      '\s+', ' ', 'g'
    ),
    1, 200
  ) || '...'
)
WHERE content->>'pa' IS NOT NULL
AND (dek IS NULL OR dek->>'pa' IS NULL);