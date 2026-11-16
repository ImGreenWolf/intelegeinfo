# Server error log review — 16 November 2026

Reviewed `/root/.pm2/logs/server-error.log`: 128,179 lines, approximately 7.3 MB. The file contains errors from several older deployments as well as recent editor errors. The log has not been erased or truncated.

## Fixes deployed

- Fixed document versions on file open and rapid typing. Local edits advance their version immediately; older acknowledgements no longer move it backwards.
- Replaced the broken stale-edit rebase path. It now processes every intervening committed operation, preserves concurrent inserted text during deletion, and does not mutate operation history.
- Invalid or unavailable document versions now request an authoritative client resync instead of repeatedly throwing `Invalid edit position`.
- Empty document snapshots are now applied correctly. Document updates carry checksums when appropriate.
- Opening or saving an unchanged file no longer creates spurious document revisions. File watcher events no longer apply the same update twice.
- Compiler-created files, null watcher filenames, and files removed during a filesystem notification no longer dereference an absent editor file.
- Missing/malformed login and signup bodies are rejected with 400 before decryption or database access. Invalid ciphertext also returns 400 without logging a server exception.
- Added HTTP error handling for bad JSON, oversized bodies, missing resources, expired tokens and invalid Prisma requests. Expected client errors return suitable 4xx responses; unexpected server failures are still logged.
- WebSocket messages are parsed once; invalid JSON is closed with 1007. Commands received before session initialization are ignored safely.
- Added guards for anonymous saved-project loading, missing projects/files, absent debugger instances, file operations targeting missing files and anonymous class listing.
- Fixed language fallback when `Accept-Language` or the language cookie is absent.
- Subject search now validates its query; missing exam PDFs return 404. Rendering tolerates missing answer keys, and refreshing the subject index clears its previous entries.
- File creation/deletion callbacks no longer throw outside their surrounding try/catch. Deletion updates the in-memory file model after the filesystem operation succeeds.
- Successful TTY shutdown and cache-directory reuse no longer appear as errors.
- Enabled SMTP certificate verification after verifying the current SMTP connection with certificate checking enabled.
- Startup preserves editor working files and no longer runs global Docker pruning.
- Newly written PM2 log entries include timestamps. The scoped watcher and WebSocket heartbeat were preserved.

## Verification

- 17 local regression tests pass; the full TypeScript build passes.
- Live editor test: 30 rapid edits acknowledged, a stale concurrent edit rebased correctly, an invalid future edit resynchronized, and the temporary test file was deleted.
- Live HTTP checks: normal pages/assets return 200; anonymous class listing returns 401; missing/malformed auth input and subject search return 400; missing PDF returns 404; oversized JSON returns 413.
- Database authentication and SMTP authentication/certificate verification pass. No email was sent during verification.
- Dependencies named in historical missing-module errors are installed; `g++`, Docker, websockify and turnserver are present.
- After deployment and these live checks, **zero new bytes** had been added to the error log. PM2 was online with zero unexpected restarts.

## Historical entries and limits

Old errors about missing modules, Node native-module ABI mismatches, WebSocket server initialization, database credentials, Git HTTPS credentials and the earlier wildcard watcher belong to previous deployments. Current dependency, database and runtime checks do not reproduce them.

Historical virtual-camera/device and Python/OpenSSL errors were not exercised: no camera session was started. The old Google email refresh-token `invalid_grant` path is no longer the current SMTP authentication path; the current SMTP connection passes verification. This review does not claim to have repaired or tested every optional hardware/provider integration appearing in the historical file.

Further errors discovered under other workloads should remain visible: the changes do not suppress unexpected 5xx failures or filesystem failures.

## Backup and rollback reference

Original code, PM2 configuration and the complete pre-deployment error log are stored in:

`/root/deploy-backups/error-log-fixes-1794859546/`

The original log snapshot is `server-error-before.log`; existing source/compiled files are under `files/`. No database schema or data migration was performed. Compiled modules were built locally and uploaded; no full compilation ran on the 2 GB server.
