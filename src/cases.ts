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
    evidence: [],
    suspects: [],
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
    evidence: [],
    suspects: [],
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
