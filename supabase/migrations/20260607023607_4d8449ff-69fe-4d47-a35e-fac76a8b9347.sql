ALTER TABLE public.srangam_purana_references
  ADD CONSTRAINT srangam_purana_references_dedup_key
  UNIQUE (article_id, purana_name, reference_text, adhyaya);