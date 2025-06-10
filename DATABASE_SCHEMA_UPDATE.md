# Database Schema Update Required for MC Support

## Required Changes to Supabase Database

The MC support implementation requires the following schema changes to be made in the Supabase dashboard:

### 1. Update `setlists` table

Add a new column to the `setlists` table:

```sql
ALTER TABLE setlists 
ADD COLUMN item_type VARCHAR(10) DEFAULT 'song' NOT NULL;
```

### 2. Make `song_id` nullable (if not already)

Ensure the `song_id` column can accept NULL values for MC entries:

```sql
ALTER TABLE setlists 
ALTER COLUMN song_id DROP NOT NULL;
```

### 3. Add check constraint (optional but recommended)

Add a constraint to ensure item_type is either 'song' or 'mc':

```sql
ALTER TABLE setlists 
ADD CONSTRAINT check_item_type 
CHECK (item_type IN ('song', 'mc'));
```

### 4. Add constraint for data integrity (optional but recommended)

Ensure that song entries have a song_id and MC entries don't:

```sql
ALTER TABLE setlists 
ADD CONSTRAINT check_song_mc_integrity 
CHECK (
  (item_type = 'song' AND song_id IS NOT NULL) OR 
  (item_type = 'mc' AND song_id IS NULL)
);
```

## Current Implementation Status

✅ **Code Changes Complete**:
- Import page detects "MC" entries and creates records with `item_type='mc'` and `song_id=null`
- Register page handles MC entries in the same way
- Event listing page displays MC entries with italic styling to distinguish from songs
- All TypeScript interfaces updated to support nullable song references

⚠️ **Database Schema Changes Required**:
- The above SQL commands need to be executed in Supabase dashboard
- Without these changes, the application will fail when trying to insert MC entries

## Testing After Schema Update

Once the schema changes are applied:

1. Test import functionality with sample data:
```
2025.6.8(日)
HYPE IDOL！× AGE FES!
@ 品川グランドホール

#しえるセットリスト
Yakusoku
We Can
MC
僕らの未来へ
閃光Believer
```

2. Test register functionality by manually entering MC in setlist text
3. Verify MC entries appear in event listing with italic styling
4. Confirm existing events continue to work normally

## Migration Strategy

Since this codebase doesn't use local migration files, the schema changes must be applied directly in Supabase:

1. Go to Supabase Dashboard → SQL Editor
2. Execute the SQL commands above
3. Verify the changes in the Table Editor
4. Test the application functionality

The implementation is backward compatible - existing setlist entries will default to `item_type='song'` and continue working normally.
