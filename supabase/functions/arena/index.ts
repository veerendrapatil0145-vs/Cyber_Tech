// Supabase Edge Function: arena
// Deploy with: supabase functions deploy arena --no-verify-jwt=false

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const caseAnswerKeys: Record<
  string,
  { correctTimeline: string[]; debriefNotes: string[] }
> = {
  'shadow-trace': {
    correctTimeline: [
      'Unregistered USB drive mounts for 42 seconds and writes /tmp/.cache-sync',
      'Nightly campus backup finishes cleanly at 01:00 UTC',
      'Cron triggers /tmp/.cache-sync to stage /srv/lab/designs at 02:15 UTC',
      'WS-14 begins tunneling hex chunks via DNS queries at 02:19 UTC',
    ],
    debriefNotes: [
      'Physical USB access three days earlier planted /tmp/.cache-sync and scheduled the hidden 02:15 UTC cron task.',
      'Because execution came from local cron persistence, zero overnight SSH logins appeared in auth logs.',
      'The 01:00 UTC campus backup was legitimate noise; exfiltration occurred via 640 DNS TXT chunks at 02:19 UTC.',
    ],
  },
  'encrypted-truth': {
    correctTimeline: [
      'Backup private key committed to repository in commit c81e4a',
      'Developer deletes signing_backup_2023.pem in follow-up commit without revoking key',
      'Validator retains retired reg-2023 in public JWKS without status enforcement',
      'Forged tokens signed with reg-2023 pass /api/verify at 03:42 UTC',
    ],
    debriefNotes: [
      'The active HSM key (reg-2026) was never used overnight; all 18 forged tokens carried kid="reg-2023".',
      'Removing a private key in a later Git commit leaves the secret recoverable in prior Git commit objects.',
      'Keeping retired keys in JWKS without enforcing status:"retired" allowed old signatures to validate new 2026 tokens.',
    ],
  },
};

function generateInviteCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') || '';

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return json({ error: 'Authentication required.' }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json();
    const { action, ...payload } = body || {};

    if (action === 'listMyTeams') {
      const { data, error } = await adminClient
        .from('teams')
        .select('id, name, invite_code')
        .contains('member_ids', [user.id]);
      if (error) return json({ error: error.message }, 400);
      return json({
        teams: (data || []).map((t) => ({
          id: t.id,
          name: t.name,
          inviteCode: t.invite_code,
        })),
      });
    }

    if (action === 'createTeam') {
      const name = String(payload.name || '').trim();
      if (name.length < 2 || name.length > 30) {
        return json({ error: 'Team name must be between 2 and 30 characters.' }, 400);
      }
      const inviteCode = generateInviteCode(6);
      const { data: team, error } = await adminClient
        .from('teams')
        .insert({
          name,
          invite_code: inviteCode,
          owner_id: user.id,
          member_ids: [user.id],
        })
        .select('id, name, invite_code')
        .single();
      if (error) return json({ error: error.message }, 400);

      const { count } = await adminClient
        .from('teams')
        .select('id', { count: 'exact', head: true });
      await adminClient.from('stats').upsert({ id: 1, registered_teams: count ?? 1 });

      return json({ id: team.id, name: team.name, inviteCode: team.invite_code });
    }

    if (action === 'joinTeam') {
      const inviteCode = String(payload.inviteCode || '').trim().toUpperCase();
      const { data: team, error } = await adminClient
        .from('teams')
        .select('*')
        .eq('invite_code', inviteCode)
        .maybeSingle();
      if (error || !team) return json({ error: 'No team found with that invitation code.' }, 404);
      const members = Array.isArray(team.member_ids) ? team.member_ids : [];
      if (!members.includes(user.id)) {
        if (members.length >= 4) return json({ error: 'This team already has 4 members.' }, 400);
        const nextMembers = [...members, user.id];
        await adminClient.from('teams').update({ member_ids: nextMembers }).eq('id', team.id);
        await adminClient
          .from('rankings')
          .update({ member_ids: nextMembers })
          .eq('team_id', team.id);
      }
      return json({ id: team.id, name: team.name, inviteCode: team.invite_code });
    }

    if (action === 'beginInvestigation') {
      const caseId = String(payload.caseId || '');
      const teamId = String(payload.teamId || '');
      if (!caseAnswerKeys[caseId]) return json({ error: 'Case file not found.' }, 404);

      const { data: existing } = await adminClient
        .from('sessions')
        .select('*')
        .eq('team_id', teamId)
        .eq('case_id', caseId)
        .maybeSingle();

      if (existing) {
        const elapsedSeconds = Math.max(
          0,
          Math.floor((Date.now() - new Date(existing.started_at).getTime()) / 1000)
        );
        return json({
          progress: existing.progress || {},
          hintsUsed: existing.hints_used || 0,
          elapsedSeconds,
        });
      }

      const { data: created, error } = await adminClient
        .from('sessions')
        .insert({
          team_id: teamId,
          case_id: caseId,
          last_writer: user.id,
          progress: { report: '', selectedEvidence: [], timelineOrder: [] },
        })
        .select('*')
        .single();
      if (error) return json({ error: error.message }, 400);
      return json({ progress: created.progress, hintsUsed: 0, elapsedSeconds: 0 });
    }

    if (action === 'saveInvestigationProgress') {
      const caseId = String(payload.caseId || '');
      const teamId = String(payload.teamId || '');
      await adminClient
        .from('sessions')
        .update({
          last_writer: user.id,
          progress: {
            report: String(payload.report || '').slice(0, 500),
            selectedEvidence: Array.isArray(payload.selectedEvidence)
              ? payload.selectedEvidence
              : [],
            timelineOrder: Array.isArray(payload.timelineOrder) ? payload.timelineOrder : [],
          },
        })
        .eq('team_id', teamId)
        .eq('case_id', caseId)
        .eq('completed', false);
      return json({ ok: true });
    }

    if (action === 'useInvestigationHint') {
      const caseId = String(payload.caseId || '');
      const teamId = String(payload.teamId || '');
      const { data: session } = await adminClient
        .from('sessions')
        .select('*')
        .eq('team_id', teamId)
        .eq('case_id', caseId)
        .maybeSingle();
      if (!session) return json({ error: 'Start the investigation first.' }, 404);
      const nextHints = Math.min(3, (session.hints_used || 0) + 1);
      await adminClient
        .from('sessions')
        .update({ hints_used: nextHints, last_writer: user.id })
        .eq('id', session.id);
      return json({ hintsUsed: nextHints });
    }

    if (action === 'submitInvestigation') {
      const caseId = String(payload.caseId || '');
      const teamId = String(payload.teamId || '');
      const key = caseAnswerKeys[caseId];
      if (!key) return json({ error: 'Case answer key not found.' }, 404);

      const { data: team } = await adminClient
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();
      if (!team) return json({ error: 'Team not found.' }, 404);

      const { data: session } = await adminClient
        .from('sessions')
        .select('*')
        .eq('team_id', teamId)
        .eq('case_id', caseId)
        .maybeSingle();

      const hintsUsed = session?.hints_used || 0;
      const elapsedSeconds = session
        ? Math.max(1, Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000))
        : 60;
      const timelineOrder = Array.isArray(payload.timelineOrder) ? payload.timelineOrder : [];
      let timelineMatches = 0;
      for (let i = 0; i < key.correctTimeline.length; i += 1) {
        if (timelineOrder[i] === key.correctTimeline[i]) timelineMatches += 1;
      }

      const rawScore = Math.round(
        (timelineMatches / key.correctTimeline.length) * 100 - hintsUsed * 5
      );
      const finalScore = Math.max(0, Math.min(100, rawScore));

      const explanations = [
        {
          title: 'Chronological timeline reconstruction',
          correct: timelineMatches === key.correctTimeline.length,
          explanation: `${timelineMatches} of ${key.correctTimeline.length} events placed in exact chronological order.`,
        },
        ...key.debriefNotes.map((note, idx) => ({
          title: `Forensic finding 0${idx + 1}`,
          correct: true,
          explanation: note,
        })),
      ];

      const caseResult = {
        score: finalScore,
        hintsUsed,
        elapsedSeconds,
        submittedAt: new Date().toISOString(),
        explanations,
      };

      const { data: existingRank } = await adminClient
        .from('rankings')
        .select('*')
        .eq('team_id', team.id)
        .maybeSingle();

      const caseScores = {
        ...(existingRank?.case_scores || {}),
        [caseId]: caseResult,
      };
      const totalScore = Object.values(caseScores).reduce(
        (sum: number, item: unknown) => sum + ((item as { score?: number }).score || 0),
        0
      );
      const totalElapsed = Object.values(caseScores).reduce(
        (sum: number, item: unknown) =>
          sum + ((item as { elapsedSeconds?: number }).elapsedSeconds || 0),
        0
      );

      await adminClient.from('rankings').upsert(
        {
          team_id: team.id,
          team_name: team.name,
          owner_id: team.owner_id,
          member_ids: team.member_ids,
          mode: 'Team',
          score: totalScore,
          elapsed_seconds: totalElapsed,
          case_scores: caseScores,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'team_id' }
      );

      if (session) {
        await adminClient.from('sessions').update({ completed: true }).eq('id', session.id);
      }

      return json({
        ...caseResult,
        message: `Scored ${timelineMatches}/${key.correctTimeline.length} timeline positions.`,
      });
    }

    if (action === 'joinGame') {
      const inviteCode = String(payload.inviteCode || '').trim().toUpperCase();
      const { data: game } = await adminClient
        .from('games')
        .select('*')
        .eq('invite_code', inviteCode)
        .maybeSingle();
      if (!game) return json({ error: 'No event lobby matches that code.' }, 404);
      return json({ id: game.id, name: game.name, caseId: game.case_id, status: game.status });
    }

    const isAdmin = Boolean(
      user.app_metadata?.role === 'admin' || user.app_metadata?.admin === true
    );
    if (!isAdmin) return json({ error: 'Administrator access required.' }, 403);

    if (action === 'adminCreateGame') {
      const inviteCode =
        String(payload.inviteCode || '').trim().toUpperCase() || generateInviteCode(6);
      const { data: game, error } = await adminClient
        .from('games')
        .insert({
          name: String(payload.name || '').trim(),
          case_id: String(payload.caseId || 'shadow-trace'),
          invite_code: inviteCode,
          status: 'open',
        })
        .select('*')
        .single();
      if (error) return json({ error: error.message }, 400);
      return json({ id: game.id, name: game.name, inviteCode: game.invite_code });
    }

    if (action === 'adminSetGameStatus') {
      await adminClient
        .from('games')
        .update({ status: String(payload.status || 'open') })
        .eq('id', String(payload.gameId || ''));
      return json({ ok: true });
    }

    if (action === 'adminAnnounce') {
      await adminClient.from('announcements').insert({
        title: String(payload.title || '').trim(),
        message: String(payload.message || '').trim(),
      });
      return json({ ok: true });
    }

    if (action === 'adminListTeams') {
      const { data } = await adminClient.from('teams').select('id, name, member_ids');
      return json({
        teams: (data || []).map((t) => ({
          id: t.id,
          name: t.name,
          memberCount: Array.isArray(t.member_ids) ? t.member_ids.length : 0,
        })),
      });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Server error' }, 500);
  }
});
