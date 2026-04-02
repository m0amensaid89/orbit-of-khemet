# Pending Migrations

Run this in Supabase SQL editor:

```sql
ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_chat_threads_archived ON chat_threads(archived);
```
