# Backup and Recovery Procedures

## Overview

This document outlines the backup and recovery procedures for SimpliFi's production database hosted on Supabase.

## Automated Backups

### Supabase Automated Backups

Supabase provides automated daily backups for all projects on paid plans. For free tier projects, you must enable manual backups.

#### Enabling Automated Backups (Paid Plans)

1. Navigate to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **Database** → **Backups**
4. Verify automated backups are enabled
5. Configure retention period (recommended: 7 days minimum)

#### Backup Schedule
- **Frequency**: Daily at 2:00 AM UTC
- **Retention**: 7 days (configurable up to 30 days)
- **Storage**: Encrypted at rest in Supabase infrastructure

---

## Point-in-Time Recovery (PITR)

> **Note**: PITR is available on Pro plan and above

Point-in-Time Recovery allows you to restore your database to any point within the last 7 days.

### When to Use PITR
- Accidental data deletion
- Unwanted schema changes
- Data corruption
- Testing rollback scenarios

### How to Perform PITR

1. Go to Supabase Dashboard → **Settings** → **Database** → **Backups**
2. Click **Point-in-Time Recovery**
3. Select the restore point (date and time)
4. Choose restore target:
   - **New project** (recommended for testing)
   - **Current project** (overwrites existing data)
5. Click **Restore**
6. Wait for restoration to complete (5-30 minutes depending on size)
7. Verify data integrity
8. Update application connection string if restored to new project

---

## Manual Backup Procedures

### Full Database Backup

Use `pg_dump` to create manual backups:

```bash
# Set environment variables
export SUPABASE_DB_HOST="db.your-project.supabase.co"
export SUPABASE_DB_PASSWORD="your-db-password"

# Create full backup
pg_dump \\
  --host=$SUPABASE_DB_HOST \\
  --port=5432 \\
  --username=postgres \\
  --format=custom \\
  --file=backup_$(date +%Y%m%d_%H%M%S).dump \\
  postgres

# Compress backup (optional)
gzip backup_*.dump
```

### Schema-Only Backup

```bash
pg_dump \\
  --host=$SUPABASE_DB_HOST \\
  --port=5432 \\
  --username=postgres \\
  --schema-only \\
  --file=schema_$(date +%Y%m%d).sql \\
  postgres
```

### Data-Only Backup

```bash
pg_dump \\
  --host=$SUPABASE_DB_HOST \\
  --port=5432 \\
  --username=postgres \\
  --data-only \\
  --file=data_$(date +%Y%m%d).sql \\
  postgres
```

---

## Recovery Procedures

### Restoring from Manual Backup

```bash
# Restore full backup
pg_restore \\
  --host=$SUPABASE_DB_HOST \\
  --port=5432 \\
  --username=postgres \\
  --dbname=postgres \\
  --clean \\
  --if-exists \\
  backup_20260214.dump

# Or from SQL dump
psql \\
  --host=$SUPABASE_DB_HOST \\
  --port=5432 \\
  --username=postgres \\
  --dbname=postgres \\
  --file=backup_20260214.sql
```

### Partial Data Recovery

To restore specific tables:

```bash
# Restore single table
pg_restore \\
  --host=$SUPABASE_DB_HOST \\
  --port=5432 \\
  --username=postgres \\
  --dbname=postgres \\
  --table=profiles \\
  backup_20260214.dump
```

---

## Testing Recovery

### Quarterly Recovery Test Procedure

Perform recovery tests every quarter to ensure backup integrity.

1. **Schedule Test**: First Monday of every quarter
2. **Create Test Instance**: Restore backup to new Supabase project
3. **Verify Data Integrity**:
   - Check row counts match production
   - Verify recent data is present
   - Test critical queries
   - Check foreign key constraints
4. **Document Results**: Record test date, success/failure, duration
5. **Clean Up**: Delete test instance after verification

### Test Checklist

- [ ] Backup file accessible and not corrupted
- [ ] Restoration completes without errors
- [ ] All tables present
- [ ] Row counts match expected values
- [ ] Recent transactions are present
- [ ] Application can connect to restored database
- [ ] Critical features work correctly
- [ ] RLS policies are intact

---

## Disaster Recovery Plan

### Severity Levels

**P0 - Critical (Complete Data Loss)**
- **Response Time**: Immediate
- **Procedure**: Restore from most recent automated backup
- **Notification**: Alert all stakeholders

**P1 - Major (Partial Data Loss)**
- **Response Time**: Within 1 hour
- **Procedure**: PITR to last known good state
- **Notification**: Alert technical team

**P2 - Minor (Schema Issues)**
- **Response Time**: Within 4 hours
- **Procedure**: Restore schema from backup, preserve data
- **Notification**: Log and monitor

### Emergency Contact List

- **Primary**: Technical Lead
- **Secondary**: DevOps/Infrastructure
- **Escalation**: Supabase Support (support@supabase.com)

### Recovery Time Objective (RTO)

- **Target**: 4 hours maximum downtime
- **Automated Backup**: ~30 minutes to restore
- **Manual Backup**: ~1-2 hours to restore
- **PITR**: ~15-30 minutes to restore

### Recovery Point Objective (RPO)

- **Target**: Maximum 24 hours of data loss
- **Automated Backups**: Up to 24 hours
- **PITR (if available)**: Virtually zero data loss

---

## Backup Monitoring

### Health Checks

Weekly verification:
1. Check last backup timestamp
2. Verify backup file size is reasonable
3. Test backup file integrity
4. Monitor storage usage

### Alerts to Configure

1. **Backup Failure**: Email notification if daily backup fails
2. **Storage Warning**: Alert when backup storage >80% full
3. **Restoration Test Overdue**: Reminder 1 week before quarterly test

---

## Best Practices

1. **3-2-1 Rule**: 
   - 3 copies of data
   - 2 different media types
   - 1 off-site copy

2. **Encryption**: All backups encrypted at rest and in transit

3. **Access Control**: Limit backup access to authorized personnel only

4. **Documentation**: Keep this document updated with any changes

5. **Regular Testing**: Test recovery procedures quarterly minimum

---

## Backup Storage Locations

### Primary (Supabase)
- Automated daily backups
- 7-day retention
- Encrypted storage

### Secondary (Local/S3 - Recommended)
- Manual weekly backups
- 30-day retention
- Off-site storage

---

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-02-14 | 1.0 | Initial documentation | System |

---

## Next Steps

- [ ] Enable Supabase automated backups
- [ ] Configure backup retention policy
- [ ] Set up backup monitoring alerts
- [ ] Schedule first quarterly recovery test
- [ ] Create off-site backup storage (S3/equivalent)
- [ ] Document database credentials in secure vault
