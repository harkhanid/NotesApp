# Database Migration for Admin Approval System

This document contains SQL commands to migrate your database from email verification to manual admin approval.

## Step 1: Add New Columns to Users Table

The User entity has been updated to include `account_approved` and `account_rejected` columns. These will be automatically created when the application starts (assuming you're using JPA's DDL auto mode).

If you need to manually add these columns:

```sql
ALTER TABLE users
ADD COLUMN account_approved BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN account_rejected BOOLEAN NOT NULL DEFAULT FALSE;
```

## Step 2: Migrate Existing Users

### Auto-approve all existing verified users

This will automatically approve all users who have previously verified their email:

```sql
UPDATE users
SET account_approved = TRUE,
    account_rejected = FALSE
WHERE email_verified = TRUE;
```

### Auto-approve all OAuth users

OAuth users should be auto-approved (this is also handled in code, but good to run for existing users):

```sql
UPDATE users
SET account_approved = TRUE,
    account_rejected = FALSE
WHERE provider = 'GOOGLE';
```

## Step 3: Create Your First Admin User

You need at least one admin user to access the admin panel. Replace `your-email@example.com` with the email of the user you want to make an admin:

```sql
UPDATE users
SET roles = 'ROLE_ADMIN,ROLE_USER',
    account_approved = TRUE,
    account_rejected = FALSE
WHERE email = 'your-email@example.com';
```

## Step 4: Verify the Changes

Check that the migration worked:

```sql
-- Count pending users (not approved, not rejected)
SELECT COUNT(*) as pending_users
FROM users
WHERE account_approved = FALSE AND account_rejected = FALSE;

-- Count approved users
SELECT COUNT(*) as approved_users
FROM users
WHERE account_approved = TRUE;

-- List all admin users
SELECT id, email, name, roles, account_approved
FROM users
WHERE roles LIKE '%ROLE_ADMIN%';
```

## Complete Migration Script

If you want to run all commands at once:

```sql
-- Step 1: Add new columns (if not already added by JPA)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS account_approved BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS account_rejected BOOLEAN NOT NULL DEFAULT FALSE;

-- Step 2: Auto-approve existing verified users
UPDATE users
SET account_approved = TRUE,
    account_rejected = FALSE
WHERE email_verified = TRUE;

-- Step 3: Auto-approve OAuth users
UPDATE users
SET account_approved = TRUE,
    account_rejected = FALSE
WHERE provider = 'GOOGLE';

-- Step 4: Create first admin (REPLACE EMAIL!)
UPDATE users
SET roles = 'ROLE_ADMIN,ROLE_USER',
    account_approved = TRUE,
    account_rejected = FALSE
WHERE email = 'your-email@example.com';

-- Step 5: Verify
SELECT
    'Pending' as status, COUNT(*) as count
FROM users
WHERE account_approved = FALSE AND account_rejected = FALSE
UNION ALL
SELECT
    'Approved' as status, COUNT(*) as count
FROM users
WHERE account_approved = TRUE
UNION ALL
SELECT
    'Rejected' as status, COUNT(*) as count
FROM users
WHERE account_rejected = TRUE
UNION ALL
SELECT
    'Admins' as status, COUNT(*) as count
FROM users
WHERE roles LIKE '%ROLE_ADMIN%';
```

## Notes

- **IMPORTANT**: Make sure to backup your database before running these commands!
- The `email_verified` column is kept for historical purposes but is no longer used in the authentication flow
- New JWT users will have `account_approved = FALSE` by default and require admin approval
- New OAuth (Google) users will have `account_approved = TRUE` by default (auto-approved)
- Admin users need the `ROLE_ADMIN` role in their `roles` column
- User roles are stored as comma-separated strings (e.g., "ROLE_ADMIN,ROLE_USER")
