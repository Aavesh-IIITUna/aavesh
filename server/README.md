# Aavesh backend operations

## Provision the first Developer account

Public registration always creates a `member`; it cannot grant privileged roles. To provision the initial Developer, first register that account normally, then run this one-time operator script from the `server` directory:

```powershell
node src/scripts/provision-first-developer.js --email developer@example.com
```

The script refuses to run unless `DATABASE_URL` names exactly `aavesh_prisma_dev`, requires an interactive confirmation that repeats the normalized email, requires the account to exist and be active, and refuses if any Developer already exists. It atomically claims a fixed `_id` in the `developerprovisioningclaims` collection before promotion. MongoDB's unique `_id` index ensures concurrent runs for different accounts cannot both claim provisioning; after a process interruption, only the same account can resume. It adds only the `developer` role key to that account. It is a local CLI tool, not an HTTP endpoint. Do not put passwords or database credentials in the command. Do not run it against the existing `aavesh` database.

The application loads `server/.env` when started from this directory. Keep that file private and untracked.
