# Bug review — 16 November 2026

This is a source review with targeted regression tests, not a claim that every defect has been found. Reviewed authentication, account management, chat, classes, editor files, WebSocket routing, metrics and deployment hooks. Existing workspace edits were retained. Building also regenerated compiled output under `dist/`.

## Fixed

| Area | Defect and resulting change |
| --- | --- |
| Email login | The browser received the approval token and could approve its own login without email access. Approval and polling now use different signed tokens and explicit purposes. |
| Email login | Approval was keyed only by email and could authorize a different request. Requests now have unique nonces, expire in memory, and are consumed once; approval replay after consumption fails. |
| Google One Tap | Credentials were decoded without signature verification. Now uses Google's ID-token verification with the configured audience and requires a verified email. The redirect flow also checks failed provider responses and email verification. |
| Token confusion | Password-reset tokens and email-login tokens were interchangeable in email-based flows. Reset tokens now have their own purpose; auth helpers require an application issuer, role, and a valid user ID. Previously issued reset/email-login links must be requested again. |
| Email verification | Caller-controlled account IDs allowed a valid code proof to target another account and then issue a login cookie. Both endpoints now require the authenticated account to match; proofs also bind the account ID and email. Verification codes now use cryptographic randomness. |
| Middleware | Missing tokens continued after a 401; verified JWT objects were incorrectly passed to JSON.parse; role failures could hang requests. All outcomes now terminate correctly or call next. |
| Sensitive user data | Class student detail responses included password hashes; other user responses could include OAuth tokens in authId. Those fields are omitted in the reviewed class/user-data queries. |
| Project deletion | An unauthenticated GET deleted the underlying project, potentially affecting multiple saved references. Disabled this legacy route with 405; did not invent replacement deletion semantics. |
| Chat access | History and sends did not check conversation membership. Both paths now scope lookup to the authenticated participant. |
| Chat reliability | Malformed messages, missing conversations and offline recipients could throw from async callbacks. Inputs are validated and errors are handled. Offline messages remain saved; multiple sockets per user are tracked and removed on close. The unfinished POST route now responds with 405 instead of hanging. |
| Chat client | Compared conversation ID with an object, so messages in the open conversation did not render. Clearing used a textarea property on a container. Grouping also checked the wrong message. Fixed these, unread clearing and sends while disconnected/empty. |
| Classes | Class data required no membership, and any caller could create assignments. Added authenticated membership checks and owner-only assignment creation. |
| Assignments | Only the newest 20 assignments were searched, hiding older assignments. Now queries the requested assignment within its class. Statistics also use that class scope. |
| Assignment statistics | Attempts were calculated as a square root of a product, and empty results divided by zero. Now computes attempts per participating user and returns zero for empty results. |
| Class errors | Error handling called startsWith on undefined or numeric error codes and threw a second error. HTTP status selection now checks the type and range. |
| Filenames | Creation/rename accepted traversal and Windows special paths. A shared validator now rejects non-flat filenames, device names and invalid characters. HTTP file preview also validates names and checks session existence. |
| File rename/close | Rename ignored filesystem errors, allowed collisions and updated only one client's names. It now validates first, handles failures, updates all connected clients and refreshes the language mode. Repeated close no longer removes an unrelated array entry through splice(-1). |
| Editor content | Empty files could be replaced by starter text, and empty saves fell back to old content. Full-content updates tried to process missing deltas. Fixed all three cases. |
| Editor positions | First-row edits dereferenced an absent previous line, offsets omitted newlines, empty documents were rejected, removal deleted one extra character and exposed document versions stayed stale. Added explicit offset calculation, exclusive removal endpoints and version synchronization. |
| Editor permissions | Public-session options sent new permissions to clients but left server permissions stale. Server permissions now update too. |
| Language detection | Used the second dot-separated filename segment. Now uses the final extension. |
| HTTP failures | Invalid download requests continued writing after an error response; sharing an unknown session dereferenced undefined. Added early exits. |
| Metrics | Public HTTP metrics/feedback and the /api WebSocket exposed operational data. Both entry points now require ADMIN. PM2 connection failure no longer terminates the application; polling stops on disconnect, and captured log buffers are bounded. |
| WebSocket routing | Unknown routes destroyed the socket then dereferenced a missing server. Added return; RTC upgrades now use the RTC server. |
| Deployment webhook | Used a hardcoded secret, logged signatures, crashed on empty commits or malformed signature lengths, mishandled paths containing spaces and had a response precedence bug. Now uses GITHUB_WEBHOOK_SECRET, SHA-256 signatures, length checks, staging-push filtering and cwd. Without a configured secret it returns 503. |
| Signup/profile | Public signup could claim an external login method; failed account creation retried incorrectly; keepLoggedIn=false was forced true. Fixed these. New/reset password hashes use bcrypt cost 12 instead of 4. Profile deletion only reports success after completion; color validation now requires six hex digits. |
| HMAC | Malformed proof lengths caused timingSafeEqual to throw. Verification now returns false. |

## Still requires attention

These are concrete source findings or explicitly marked risks. They were not addressed by pretending a small patch could replace the missing design.

| Priority | Finding | Evidence / next work |
| --- | --- | --- |
| Critical | Submitted C++ runs directly on the host. | `server/src/problemManager.ts`, createProblem/testProblem: host g++ and executable spawning. Move compilation/execution into a constrained sandbox with resource limits, no host mounts or credentials, and controlled networking. |
| Critical | Shell command construction includes editor-controlled filenames. | `problemManager.ts` interpolates filePath into execSync and uses shell:true. Flat-name validation is not shell escaping; use argument-array process APIs and sandbox the execution. |
| High | Problem updates lack an author ownership constraint. | `/editor/problem/update` checks login, then createProblem upserts by caller-selected problemId. Authorize against the existing problem before running code or changing it. |
| High | Session UUID possession is treated as authorization by several HTTP editor routes. | startsession, sharesession, file preview and download do not prove caller ownership/membership. Define how anonymous editor clients authenticate across HTTP and WebSocket before adding consistent owner/member checks. |
| High | Email code proofs allow offline guessing and have no expiry. | The browser receives an HMAC of a six-digit code. It can enumerate possible codes offline. Replace this with expiring server-side, account-bound challenges and attempt limits. The account-binding patch prevents cross-account reuse but does not solve offline guessing. |
| High | Google redirect flow has no OAuth state validation. | GET /login/google and GET /login/callback need per-browser state generation/verification to prevent login CSRF. |
| High | Password reset is not single-use and does not invalidate existing sessions. | Signed reset JWTs remain usable until expiry; existing auth JWTs are stateless. Add persistent challenge consumption and session/token revocation. |
| High | Concurrent editing can still corrupt content. | OT_EditorFile.calculateDelta skips a log entry and transformDelta mutates logged delta objects and shifts coordinates without checking relative positions. First-row/current-version edits are tested; concurrent rebase semantics still need replacement or a dedicated correctness suite. |
| High | HTML/script interpolation permits injection. | server.ts interpolates usernames into HTML/JavaScript; profile.ts interpolates project names and Spotify preferences into HTML. Add context-appropriate escaping or structured rendering. Log output also reaches metrics innerHTML. |
| High | SMTP certificate verification is explicitly disabled. | usersManager.updateTransporter uses rejectUnauthorized:false. Install/configure the correct CA trust and enable verification. |
| Medium | Several state changes use GET and authentication/email routes lack attempt limits. | Friend creation, class joining and reset-email initiation are examples. Use mutation methods, CSRF protection where applicable and rate limits. |
| Medium | File deletion and creation throw inside asynchronous fs callbacks. | EditorFile.delete/create: outer try/catch cannot catch callback throws. Deletion also mutates in-memory state before disk success. Make file operations transactional from the client's perspective. |
| Medium | Class activity WebSockets have unhandled async failures and leaked timers. | activeCheckWSS connection throws on missing auth and creates an interval without clearing it on close. |
| Medium | Friend request direction is lost. | friendManager/add stores min/max IDs as initiator/receiver, so a request from the larger ID appears to originate from the smaller ID. Use separate normalized uniqueness and actual sender fields; reject self-requests. |
| Medium | Test runner failures can hang or save misleading results. | createProblem starts asynchronous work without returning its completion, logs process errors without rejecting, and calculates time/timeIndex even when no timing exists. Response success can precede persistence failure. |
| Medium | Remember-me cookie lifetime exceeds JWT lifetime. | Cookie is 31 days; JWT expires after 1,000,000 seconds (about 11.6 days). Align lifetimes or implement refresh tokens. |
| Medium | Windows startup still executes Linux-only cleanup/services. | onServerStart/cleanUp call sudo, turnserver and xargs. Gate by platform and move service/container lifecycle out of request-serving startup. |
| Medium | Webhook deployment still blocks the event loop and discards local changes. | Retained existing git reset --hard behavior behind a secure signature. Replace it with a queued build/deploy workflow; do not use a working tree with valuable local edits as the deployment target. |

## Verification and operational changes

- `npm.cmd test`: seven regression groups pass, covering request binding/replay, Google verification, chat authorization/offline handling, filename traversal, malformed HMACs, class authorization/old assignments and editor content operations.
- `npm.cmd run build`: TypeScript project build passes and regenerates compiled output.
- Tests isolate database, SMTP and provider dependencies; they do not establish live Redis/PostgreSQL/Docker/Google integration health.
- Configure a strong `GITHUB_WEBHOOK_SECRET` matching GitHub's webhook secret; signatures must use `x-hub-signature-256`. The old hardcoded secret no longer works.
- Request fresh password-reset, email-login and email-verification links/codes after rollout. Old proof formats are intentionally rejected.
- New filenames are flat; projects that intentionally depended on subdirectories will need a separately designed safe directory model.
- Existing workspace changes were not reverted. No deployment or database migration was performed.
