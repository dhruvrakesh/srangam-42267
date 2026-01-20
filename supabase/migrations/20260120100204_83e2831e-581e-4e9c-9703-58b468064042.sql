ALTER TABLE srangam_article_evidence 
ADD CONSTRAINT unique_article_evidence 
UNIQUE (article_id, date_approx, place, event_description);