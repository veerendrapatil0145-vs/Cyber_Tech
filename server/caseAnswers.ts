export interface CaseAnswerKey {
  caseId: string;
  correctTimeline: string[];
  keyEvidenceIndices: number[];
  debriefNotes: string[];
}

export const caseAnswerKeys: Record<string, CaseAnswerKey> = {
  'shadow-trace': {
    caseId: 'shadow-trace',
    correctTimeline: [
      'Unregistered USB drive mounts for 42 seconds and writes /tmp/.cache-sync',
      'Nightly campus backup finishes cleanly at 01:00 UTC',
      'Cron triggers /tmp/.cache-sync to stage /srv/lab/designs at 02:15 UTC',
      'WS-14 begins tunneling hex chunks via DNS queries at 02:19 UTC',
    ],
    keyEvidenceIndices: [],
    debriefNotes: [
      'Physical USB access three days earlier planted /tmp/.cache-sync and scheduled the hidden 02:15 UTC cron task.',
      'Because execution came from local cron persistence, zero overnight SSH logins appeared in auth logs.',
      'The 01:00 UTC campus backup was legitimate noise; exfiltration occurred via 640 DNS TXT chunks at 02:19 UTC.',
    ],
  },
  'encrypted-truth': {
    caseId: 'encrypted-truth',
    correctTimeline: [
      'Backup private key committed to repository in commit c81e4a',
      'Developer deletes signing_backup_2023.pem in follow-up commit without revoking key',
      'Validator retains retired reg-2023 in public JWKS without status enforcement',
      'Forged tokens signed with reg-2023 pass /api/verify at 03:42 UTC',
    ],
    keyEvidenceIndices: [],
    debriefNotes: [
      'The active HSM key (reg-2026) was never used overnight; all 18 forged tokens carried kid="reg-2023".',
      'Removing a private key in a later Git commit leaves the secret recoverable in prior Git commit objects.',
      'Keeping retired keys in JWKS without enforcing status:"retired" allowed old signatures to validate new 2026 tokens.',
    ],
  },
};
