# Srangam Database Migration Scripts

## Overview
This directory contains scripts for migrating content from TypeScript files to the Srangam Supabase database.

## Scripts

### `migrate-to-srangam-db.ts`
Migrates existing articles and cultural terms from TypeScript data files to the database.

**What it does:**
- Migrates 24+ articles from `src/data/articles/` to `srangam_articles` table
- Migrates 800+ cultural terms to `srangam_cultural_terms` table
- Preserves multilingual JSONB structure
- Handles batch inserts for performance
- Provides verification and progress logging

**Usage:**
```bash
# Install tsx for TypeScript execution
npm install -D tsx

# Run migration (environment variables loaded automatically from .env)
npx tsx scripts/migrate-to-srangam-db.ts
```

## Expected Output

```
╔══════════════════════════════════════════════════════╗
║   🚀 SRANGAM DATABASE MIGRATION                      ║
║   Phase 3: Content Migration                         ║
╚══════════════════════════════════════════════════════╝

📝 Migrating Articles...
   Total articles to migrate: 24
   ✅ Successfully migrated 24 articles

📚 Migrating Cultural Terms...
   Total terms to migrate: 850
   ⏳ Progress: 100/850 terms
   ⏳ Progress: 200/850 terms
   ...
   ✅ Successfully migrated 850 cultural terms

🔍 Verifying Migration...
   ✅ Articles in database: 24
   ✅ Cultural terms in database: 850

╔══════════════════════════════════════════════════════╗
║   ✅ MIGRATION COMPLETE!                             ║
╚══════════════════════════════════════════════════════╝
```

## Next Steps

After successful migration:
1. Run edge functions for AI analysis
2. Generate embeddings for semantic search
3. Update frontend to use database queries

## Support

For issues, refer to:
- [DATABASE_SCHEMA.md](../docs/DATABASE_SCHEMA.md)
- [DATABASE_CONTEXT.md](../docs/DATABASE_CONTEXT.md)
