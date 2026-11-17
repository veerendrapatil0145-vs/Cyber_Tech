export interface QuestionAnswerKey {
  questionId: string;
  correctIndex: number;
  explanation: string;
}

export interface CaseAnswerKey {
  caseId: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: QuestionAnswerKey[];
  correctTimeline: string[];
  keyEvidenceIndices: number[];
}

export const caseAnswerKeys: Record<string, CaseAnswerKey> = {
  'case-01': {
    caseId: 'case-01',
    difficulty: 'Easy',
    questions: [
      {
        questionId: 'c1-q1',
        correctIndex: 0,
        explanation:
          'The Return-Path pointed to the lookalike domain campxs-portal.example and failed SPF from 198.51.100.44.',
      },
      {
        questionId: 'c1-q2',
        correctIndex: 1,
        explanation:
          'False. The proxy trace shows a 302 redirect back to the legitimate campus payroll page to avoid arousing suspicion.',
      },
      {
        questionId: 'c1-q3',
        correctIndex: 0,
        explanation:
          'After an initial MFA denial, the attacker repeated the push prompt (MFA fatigue) until Prof. Vance approved it.',
      },
      {
        questionId: 'c1-q4',
        correctIndex: 0,
        explanation:
          'Revoking active SSO sessions and resetting both password and MFA stops token reuse.',
      },
    ],
    correctTimeline: [
      'Lookalike domain campxs-portal.example registered',
      'Payroll verification email arrives at 00:42 UTC',
      'Prof. Vance approves second MFA prompt',
      'Browser redirects to real campus payroll page after credential capture',
    ],
    keyEvidenceIndices: [0, 2, 3],
  },
  'case-02': {
    caseId: 'case-02',
    difficulty: 'Easy',
    questions: [
      {
        questionId: 'c2-q1',
        correctIndex: 0,
        explanation:
          'Raw string concatenation on /kiosk/books?q= allowed stacked SQL queries to reach PostgreSQL.',
      },
      {
        questionId: 'c2-q2',
        correctIndex: 1,
        explanation:
          'False. Prof. Patel’s token remained offline; the UPDATE executed under svc_library_kiosk.',
      },
      {
        questionId: 'c2-q3',
        correctIndex: 0,
        explanation:
          'The library kiosk account had been granted schema-wide UPDATE rights on registrar.* during a migration.',
      },
      {
        questionId: 'c2-q4',
        correctIndex: 0,
        explanation:
          'Parameterized queries prevent SQL injection, and least-privilege DB roles limit blast radius.',
      },
    ],
    correctTimeline: [
      'Summer migration grants svc_library_kiosk broad registrar.* privileges',
      'URL-encoded SQL payload hits /kiosk/books endpoint at 02:10:44 UTC',
      'PostgreSQL executes stacked UPDATE on registrar.grades',
      'Registrar audit flags unexpected A+ entries in CS-402',
    ],
    keyEvidenceIndices: [0, 1, 2],
  },
  'case-03': {
    caseId: 'case-03',
    difficulty: 'Easy',
    questions: [
      {
        questionId: 'c3-q1',
        correctIndex: 1,
        explanation:
          'False. Transit telemetry confirmed Maya Lin tapped into North Station 12 miles away 5.5 minutes earlier.',
      },
      {
        questionId: 'c3-q2',
        correctIndex: 0,
        explanation:
          '125kHz Prox cards emit an unencrypted static UID that any close-range reader can clone.',
      },
      {
        questionId: 'c3-q3',
        correctIndex: 0,
        explanation:
          'The SIEM correctly fired an Impossible Travel alert, but it went to an unmonitored mailbox.',
      },
      {
        questionId: 'c3-q4',
        correctIndex: 0,
        explanation:
          'Cryptographic challenge-response credentials (e.g., DESFire EV3) cannot be cloned via simple UID replay.',
      },
    ],
    correctTimeline: [
      'Maya leaves lanyard unattended near shared coffee counter at 14:10',
      'Maya taps mobile NFC pass at North Station at 22:08:31',
      'Cloned 125kHz Prox badge opens Lab B-204 at 22:14:09',
      'Impossible travel alert fires to unmonitored inbox',
    ],
    keyEvidenceIndices: [0, 1, 3],
  },
  'case-04': {
    caseId: 'case-04',
    difficulty: 'Medium',
    questions: [
      {
        questionId: 'c4-q1',
        correctIndex: 0,
        explanation:
          'jwt.decode() parses the token payload without verifying any cryptographic signature, allowing alg:none.',
      },
      {
        questionId: 'c4-q2',
        correctIndex: 0,
        explanation:
          'Without checking record ownership on sequential integer IDs, any caller can iterate /1001../2420 (IDOR).',
      },
      {
        questionId: 'c4-q3',
        correctIndex: 1,
        explanation:
          'False. Raising rate limits makes scraping faster and does not enforce authentication or ownership.',
      },
      {
        questionId: 'c4-q4',
        correctIndex: 0,
        explanation:
          'Enforcing jwt.verify() with an explicit algorithm allowlist plus server-side ownership checks closes both flaws.',
      },
    ],
    correctTimeline: [
      'Developer leaves jwt.decode() placeholder in authMiddleware.ts',
      'Attacker crafts unsigned JWT with alg:none and role:admin',
      'Script enumerates /api/v1/aid-letters/1001 through 2420',
      '1,400+ scholarship PDFs exfiltrated in 90 seconds',
    ],
    keyEvidenceIndices: [0, 1, 2],
  },
  'case-05': {
    caseId: 'case-05',
    difficulty: 'Medium',
    questions: [
      {
        questionId: 'c5-q1',
        correctIndex: 0,
        explanation:
          'Setting acl = "public-read" (Principal: "*", s3:GetObject) exposed every object in the bucket publicly.',
      },
      {
        questionId: 'c5-q2',
        correctIndex: 1,
        explanation:
          'False. Server-side encryption decrypts automatically for any caller permitted by the bucket policy.',
      },
      {
        questionId: 'c5-q3',
        correctIndex: 0,
        explanation:
          'Automated scanners probe predictable bucket names continuously for open public-read policies.',
      },
      {
        questionId: 'c5-q4',
        correctIndex: 0,
        explanation:
          'Account-level Block Public Access paired with blocking CI/CD policy checks prevents accidental exposure.',
      },
    ],
    correctTimeline: [
      'Developer adds acl = "public-read" in Terraform PR #114',
      'Non-blocking tfsec warning is ignored and PR #114 merges',
      'Automated bucket-indexer discovers and downloads batch_09.tar.gz',
      'Unpublished dataset surfaces on external public mirror',
    ],
    keyEvidenceIndices: [0, 1, 2],
  },
  'case-06': {
    caseId: 'case-06',
    difficulty: 'Medium',
    questions: [
      {
        questionId: 'c6-q1',
        correctIndex: 0,
        explanation:
          'The cron agent encoded data into hex subdomain queries forwarded outward by the internal DNS resolver.',
      },
      {
        questionId: 'c6-q2',
        correctIndex: 0,
        explanation:
          '18,400 unique high-entropy subdomains to a single domain at 03:14 is a classic DNS tunneling signature.',
      },
      {
        questionId: 'c6-q3',
        correctIndex: 1,
        explanation:
          'False. Because TCP egress is already denied, blocking WS-CHEM-19 from reaching 10.0.0.53 breaks the DNS tunnel completely.',
      },
      {
        questionId: 'c6-q4',
        correctIndex: 0,
        explanation:
          'Combining resolver RPZ allowlists, endpoint quarantine, and entropy alerting blocks the covert channel.',
      },
    ],
    correctTimeline: [
      'Cron triggers unsigned binary sync-helper at 03:14',
      'Binary encodes local research data into 62-char hex subdomains',
      'Campus resolver 10.0.0.53 forwards queries to authoritative server for exfil-cdn.example',
      '18,400 queries transfer 48 MB without triggering TCP egress blocks',
    ],
    keyEvidenceIndices: [0, 1, 2],
  },
  'case-07': {
    caseId: 'case-07',
    difficulty: 'Medium',
    questions: [
      {
        questionId: 'c7-q1',
        correctIndex: 1,
        explanation:
          'False. Previous commits remain in Git object history unless rewritten and every exposed key is revoked.',
      },
      {
        questionId: 'c7-q2',
        correctIndex: 0,
        explanation:
          'The validator checked only whether kid existed in JWKS and ignored status:"retired" and issuance dates.',
      },
      {
        questionId: 'c7-q3',
        correctIndex: 0,
        explanation:
          'Any private key ever committed to Git must be treated as compromised and revoked immediately.',
      },
      {
        questionId: 'c7-q4',
        correctIndex: 0,
        explanation:
          'Removing key-2022 from JWKS while archiving/re-signing validated 2022 records protects current issuance.',
      },
    ],
    correctTimeline: [
      'Private key test_private_key.pem committed to repo in 2022',
      'File deleted in follow-up commit c4092c without key revocation',
      'Validator keeps key-2022 in active JWKS and ignores retired status',
      'Attacker extracts key from Git history and signs new 2026 diploma',
    ],
    keyEvidenceIndices: [0, 1, 2],
  },
  'case-08': {
    caseId: 'case-08',
    difficulty: 'Hard',
    questions: [
      {
        questionId: 'c8-q1',
        correctIndex: 0,
        explanation:
          'A malicious postinstall lifecycle hook inside the bumped dependency ran during npm ci.',
      },
      {
        questionId: 'c8-q2',
        correctIndex: 1,
        explanation:
          'False. Unit tests run after npm install/ci, so an install-time script can exfiltrate secrets even when all tests pass.',
      },
      {
        questionId: 'c8-q3',
        correctIndex: 0,
        explanation:
          'Mounting SIGNING_TOKEN into the same runner environment as untrusted package install exposed it to process.env.',
      },
      {
        questionId: 'c8-q4',
        correctIndex: 0,
        explanation:
          'Disabling install scripts, isolating signing secrets from build steps, and checking lockfile diffs defeats the attack.',
      },
    ],
    correctTimeline: [
      'Malicious patch @campus-ui/colors@1.2.1 adds postinstall script',
      'Auto-merge rule accepts lockfile bump after unit tests pass',
      'CI runner mounts SIGNING_TOKEN and runs npm ci',
      'postinstall script exfiltrates SIGNING_TOKEN to pkg-metrics.example',
    ],
    keyEvidenceIndices: [0, 1, 3],
  },
  'case-09': {
    caseId: 'case-09',
    difficulty: 'Hard',
    questions: [
      {
        questionId: 'c9-q1',
        correctIndex: 0,
        explanation:
          'Both the 48-hour scheduled delay and the FINAID-* hostname check kept the payload dormant during the 300s sandbox.',
      },
      {
        questionId: 'c9-q2',
        correctIndex: 0,
        explanation:
          'Environment keying restricts second-stage decryption to the intended target department workstations.',
      },
      {
        questionId: 'c9-q3',
        correctIndex: 0,
        explanation:
          'True. Blocking macros from internet-originated Office files prevents Workbook_Open from running.',
      },
      {
        questionId: 'c9-q4',
        correctIndex: 0,
        explanation:
          'Full host isolation, removing persistence, blocking C2 egress, and disabling external macros stops recurrence.',
      },
    ],
    correctTimeline: [
      'Aid_Adjustment_2026.xlsm passes 5-minute dynamic sandbox as CLEAN',
      'Staff member opens workbook and enables macros on FINAID-WS04',
      'Workbook_Open registers scheduled task FontCacheUpdate (+48h)',
      'Scheduled task launches encoded PowerShell to C2 staging URL 48 hours later',
    ],
    keyEvidenceIndices: [0, 1, 2],
  },
  'case-10': {
    caseId: 'case-10',
    difficulty: 'Hard',
    questions: [
      {
        questionId: 'c10-q1',
        correctIndex: 0,
        explanation:
          'Expensive leading-wildcard ILIKE queries tied up all 100 DB connections while app CPU sat idle waiting on I/O.',
      },
      {
        questionId: 'c10-q2',
        correctIndex: 1,
        explanation:
          'False. Adding more app servers creates even more contention against the single saturated database.',
      },
      {
        questionId: 'c10-q3',
        correctIndex: 0,
        explanation:
          'Throttling or disabling the unauthenticated search route and killing stuck queries frees the DB pool immediately.',
      },
      {
        questionId: 'c10-q4',
        correctIndex: 0,
        explanation:
          'Authentication, rate limits, indexed full-text search with query timeouts, and read replicas isolate search load.',
      },
    ],
    correctTimeline: [
      'Attacker targets unauthenticated /api/exams/search with wildcard queries',
      'Leading-wildcard ILIKE queries trigger 14.2s sequential table scans',
      'All 100 DB connections saturate, starving exam login and submission routes',
      'Exam portal appears down despite app server CPU sitting at 8%',
    ],
    keyEvidenceIndices: [0, 1, 2],
  },
};
