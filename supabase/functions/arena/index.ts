// Supabase Edge Function: arena
// Deploy with: supabase functions deploy arena --no-verify-jwt=false

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-arena-admin',
};

async function signAdminToken(secret: string): Promise<string> {
  const exp = Date.now() + 24 * 60 * 60 * 1000;
  const payload = String(exp);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const sigHex = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${payload}.${sigHex}`;
}

async function verifyAdminToken(token: string, secret: string): Promise<boolean> {
  const [payload, sigHex] = token.split('.');
  if (!payload || !sigHex) return false;
  const exp = Number(payload);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const expectedBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const expectedHex = Array.from(new Uint8Array(expectedBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return expectedHex === sigHex;
}

const caseAnswerKeys: Record<
  string,
  { correctTimeline: string[]; debriefNotes: string[]; maxHints?: number }
> = {
  'case-01': {
    maxHints: 2,
    correctTimeline: [
      '18:00 — Aarav punches out at the CS block biometric scanner and leaves campus.',
      '23:40 — Rohan connects his Windows laptop to the canteen Wi-Fi access point.',
      '23:41 — Sneha pushes code to GitHub from her MacBook in the hostel.',
      '23:42 — os_midsem.pdf is downloaded from local IP 192.168.14.88.',
    ],
    debriefNotes: [
      'Culprit: Rohan — Connected to campus local Wi-Fi (192.168.14.88) at the canteen on a Windows laptop at the exact download timestamp.',
      'DHCP logs restrict 192.168.14.1–254 to Campus & Hostel Wi-Fi, ruling out Prof. Kulkarni on home broadband.',
      'Sneha committed from a MacBook (MacIntel) while the download User-Agent was Windows NT 10.0 Chrome/128.',
    ],
  },
  'case-02': {
    maxHints: 2,
    correctTimeline: [
      '01:10 AM — Karthik accidentally commits his GitHub Personal Access Token inside the .env file.',
      '02:15 AM — Vikram borrows a 65W USB-C charger from the volunteer desk.',
      '03:12 AM — User vikram_codes clones the repository and extracts the exposed token.',
      '03:17 AM — A force push wipes the main branch using the stolen Personal Access Token.',
    ],
    debriefNotes: [
      "Culprit: Vikram — Lied about not having a charger, cloned the repo at 03:12 AM, and used Karthik's leaked PAT in .env to force-push wipe the code.",
      'Volunteer equipment logs confirm Vikram held a 65W USB-C charger from 02:15 AM until 03:45 AM.',
    ],
  },
  'case-03': {
    maxHints: 2,
    correctTimeline: [
      "16:00 — Rahul hands over the physical attendance sheets in the faculty room and notes Prof. Sharma's email ID.",
      '16:05 — Two failed password attempts are logged on prof_sharma@bec.edu.',
      '16:07 — The attacker answers "Bruno" (found on Instagram) to reset the faculty password.',
      "16:09 — Aditya's attendance record is updated from 42% to 85% from a CR-bookmarked browser.",
    ],
    debriefNotes: [
      'Culprit: Rahul — Used OSINT from Prof. Sharma\'s Instagram ("Bruno") to reset the password and modified Aditya\'s attendance using his CR laptop.',
      'Browser bookmarks BEC_CR_Notices and Attendance_Upload tied the reset directly to the Class Representative browser profile.',
    ],
  },
  'case-04': {
    maxHints: 2,
    correctTimeline: [
      '21:10 — Pooja finishes her test and walks over to the exit door.',
      '21:12 — Tanmay boots Kali-Live-USB from his pendrive directly beneath AP-LAB04.',
      '21:14 — MAC 98:E7:F4:22:10:8A sends deauth packets at -32 dBm signal strength.',
      '21:15 — AP-LAB04 overloads and disconnects all 40 lab systems.',
    ],
    debriefNotes: [
      'Culprit: Tanmay — Sat directly beneath the router and booted a Kali Live USB (98:E7:F4:22:10:8A) to jam the Wi-Fi.',
      'An RSSI of -32 dBm places the transmitting adapter within 3 meters of AP-LAB04, matching Desk A1 on CCTV.',
    ],
  },
  'case-05': {
    maxHints: 2,
    correctTimeline: [
      '13:40 — manoj_k logs into Canteen Wi-Fi and receives public IP 103.21.58.190.',
      '13:45 — Typosquatted domain bec-placemnts.in is registered by dev_manoj99.',
      '14:30 — Phishing emails are sent out from 103.21.58.190.',
      '14:35 — Manoj urges students on WhatsApp to quickly submit their credentials.',
    ],
    debriefNotes: [
      'Culprit: Manoj — Registered the typosquatted domain and dispatched the phishing emails from Canteen Wi-Fi before hyping the link on WhatsApp.',
      "Both the WHOIS handle (dev_manoj99) and X-Originating-IP (103.21.58.190) point straight to Manoj's canteen session.",
    ],
  },
  'case-06': {
    maxHints: 2,
    correctTimeline: [
      '15:00 — Arjun accidentally commits ADMIN_KEY_77 inside a public frontend JS file.',
      '18:10 — Kiran signs into Desk 09 in the computer lab.',
      "18:18 — Desk 09's browser views the public GitHub repository containing the hardcoded key.",
      "18:22 — A PUT request via Postman updates Team Phoenix's score to 950.",
    ],
    debriefNotes: [
      "Culprit: Kiran — Found the hardcoded ADMIN_KEY_77 on GitHub from Desk 09 and sent a Postman PUT request to inflate his team's score.",
      'API gateway logs flagged PostmanRuntime/7.39 rather than the official React scorekeeper dashboard.',
    ],
  },
  'case-07': {
    maxHints: 2,
    correctTimeline: [
      '22:10 — dev_nikhil authenticates via SSH key from Hostel Block B (172.16.5.44).',
      '22:14 — Binary /tmp/.hidden/xmrig_miner is created under owner dev_nikhil.',
      '22:15 — A root cron job is scheduled to launch the miner every 5 minutes.',
      '22:15 — Nikhil messages Slack pretending to be surprised by the loud server fans.',
    ],
    debriefNotes: [
      'Culprit: Nikhil — Logged in from his own hostel IP (172.16.5.44) and deployed the miner under his own user account before feigning ignorance on Slack.',
      'The file creation timestamp (22:14:08) and owner (dev_nikhil) match his SSH session started 4 minutes earlier.',
    ],
  },
  'case-08': {
    maxHints: 2,
    correctTimeline: [
      '10:02:50 — Rohan plugs his SanDisk pendrive (4C5300012908) into the podium PC.',
      "10:04:12 — Final_Demo.pptx is deleted while Rohan's USB drive is still mounted.",
      '10:05:10 — Rohan ejects his USB drive and returns to his seat.',
      '10:10:00 — Prof. Desai enters the hall and starts the viva presentations.',
    ],
    debriefNotes: [
      "Culprit: Rohan M. — Deleted Team Vega's slides at 10:04:12 AM while his identified SanDisk USB drive was plugged into the podium PC.",
      'USBDeview mount times (10:02:50–10:05:10 AM) and serial 4C5300012908 uniquely identify Rohan M. at the podium.',
    ],
  },
  'case-09': {
    maxHints: 2,
    correctTimeline: [
      '17:45 PM — Prof. Nair leaves campus with his original physical RFID card.',
      '02:25 AM — Siddharth walks toward the electronics block on hostel CCTV.',
      '02:31 AM — A cloned RFID signal matching UID A4-91-0C-77 unlocks the hardware lab.',
      '02:34 AM — The Raspberry Pi 5 kit is removed from the lab shelf.',
    ],
    debriefNotes: [
      "Culprit: Siddharth — Cloned Prof. Nair's RFID card UID using his RFID tool and unlocked the lab at 02:31 AM.",
      'Gate biometrics prove Prof. Nair left campus at 17:45 PM and never returned overnight.',
    ],
  },
  'case-10': {
    maxHints: 2,
    correctTimeline: [
      '20:10 — Account prankster_01 is verified on free-smtp-relay.xyz using a phone ending in **89.',
      '20:15 — Spoofed email forging dean@bec.edu is sent (failing SPF/DKIM checks).',
      '20:16 — Chetan immediately announces the fake holiday in the student Telegram group.',
      '20:30 — IT Admin Divya issues an official notice warning students about the spoofed header.',
    ],
    debriefNotes: [
      "Culprit: Chetan — Used his phone (**89) to register on free-smtp-relay.xyz and spoofed the Dean's email address.",
      'Raw email headers show SPF: FAIL and DKIM: NONE with an external Return-Path.',
    ],
  },
  'case-11': {
    maxHints: 2,
    correctTimeline: [
      '11:00 — Rohit commits RAZORPAY_SECRET into the public repo in commit a81f9c.',
      '11:02 — Rohit deletes the line in commit b92e1d without rotating the key.',
      '11:45 — tarun_sec clones the repo and inspects git log -p to recover the deleted secret.',
      '12:10 — Fifteen merch vouchers are generated and sent to tarun.gamer99@gmail.com.',
    ],
    debriefNotes: [
      'Culprit: Tarun — Cloned the repo and read the Git commit history (a81f9c) to extract the unrevoked Razorpay secret key.',
      'Removing a secret in a follow-up commit never purges it from prior Git history—secrets must be rotated immediately.',
    ],
  },
  'case-12': {
    maxHints: 2,
    correctTimeline: [
      '14:00 — Harsh starts a local HTTP listener on port 8080 at IP 192.168.50.99.',
      '14:15 — Harsh distributes the trojanized .vsix theme file via USB pendrive.',
      '14:25 — Pranav installs the extension, triggering extension.js to read ~/.ssh/id_rsa.',
      '14:26 — Victim SSH keys are transmitted to 192.168.50.99:8080/collect.',
    ],
    debriefNotes: [
      'Culprit: Harsh — Built the malicious VS Code extension to exfiltrate SSH keys straight to his own laptop (192.168.50.99).',
      'DHCP lease mapping ties 192.168.50.99 directly to Host Harsh-kali-box.',
    ],
  },
  'case-13': {
    maxHints: 2,
    correctTimeline: [
      '13:05 — Nitin connects his Pixel 7 to the campus Wi-Fi network.',
      "13:10 — Payload ' OR 1=1 -- bypasses OTP authentication and issues session_id=991a2b.",
      '13:12 — Fifty free burger coupons are generated under session_id=991a2b.',
      '13:20 — The coupons are scanned and redeemed at Canteen Counter 2.',
    ],
    debriefNotes: [
      'Culprit: Nitin Verma — Exploited the SQL injection vulnerability from his Pixel 7 phone to generate and redeem 50 free coupons.',
      'Campus Wi-Fi registry confirms Nitin Verma owns the only registered Pixel 7.',
    ],
  },
  'case-14': {
    maxHints: 2,
    correctTimeline: [
      '15:00:00 — Sahil K. starts the 10-minute MCQ quiz on Lab PC 12.',
      '15:10:00 — The actual 10-minute window expires, but Sahil pauses/ignores the client timer while searching answers.',
      '15:45:05 — Sahil runs window.timerSeconds = 130 in Chrome DevTools Console.',
      '15:45:12 — The server records a 45-minute total duration alongside a spoofed "02:10 remaining".',
    ],
    debriefNotes: [
      'Culprit: Sahil K. — Took 45 minutes to complete a 10-minute test and spoofed window.timerSeconds via Chrome DevTools before submitting.',
      'Client-side timers must always be validated against server-side start and submission timestamps.',
    ],
  },
  'case-15': {
    maxHints: 2,
    correctTimeline: [
      '11:10 — Yashwant enables Mobile Hotspot on his Windows laptop (gateway 192.168.137.1) cloned as BEC-Campus-Free.',
      '11:12 — Rogue BSSID 7A:99:11:44:22:01 begins broadcasting on Channel 11 in the auditorium.',
      "11:15 — Nidhi's device auto-connects to the stronger rogue signal and loads the fake login page.",
      '11:20 — Network Engineer Pallavi detects the unauthorized BSSID on the wireless controller.',
    ],
    debriefNotes: [
      'Culprit: Yashwant — Launched a Windows Mobile Hotspot (192.168.137.1) spoofing the BEC-Campus-Free SSID to harvest passwords.',
      'Official campus Cisco APs use OUI 00:1A:2B, whereas 192.168.137.1 is the default Windows 10/11 Mobile Hotspot gateway.',
    ],
  },
  'case-16': {
    maxHints: 2,
    correctTimeline: [
      '16:00 — Prof. Rao saves marks_cse.csv (hash e3b0c442...) onto his USB pendrive.',
      '16:05 — Prof. Rao leaves his cabin for tea, leaving the pendrive on the desk.',
      '16:10 — Abhishek enters the cabin and edits line 19 using DESKTOP-ABHI07, altering the SHA-256 hash.',
      "16:25 — The exam cell detects the SHA-256 mismatch when comparing against Prof. Rao's 16:00 email backup.",
    ],
    debriefNotes: [
      "Culprit: Abhishek — Plugged Prof. Rao's pendrive into his laptop (DESKTOP-ABHI07) at 16:10 and changed his own marks from 14 to 24.",
      'Comparing cryptographic hashes (SHA-256) against the emailed baseline proved file tampering immediately.',
    ],
  },
  'case-17': {
    maxHints: 2,
    correctTimeline: [
      '10:30 AM — Kunal accidentally shares a screenshot exposing the Discord webhook URL.',
      "10:42 AM — A curl POST request hits the webhook URL from Room 204's IP (10.12.4.77).",
      '10:42 AM — The Avon-Announcer bot posts fake cancellation messages in the channel.',
      '10:45 AM — Moderator Sneha revokes the compromised webhook token.',
    ],
    debriefNotes: [
      "Culprit: Prateek — Copied the webhook URL from Kunal's screenshot and sent a POST request from his room (10.12.4.77) to spam the server.",
      'Campus proxy logs recorded the exact outbound webhook POST coming from Room 204.',
    ],
  },
  'case-18': {
    maxHints: 2,
    correctTimeline: [
      '14:05 PM — Meera uploads an Instagram story inadvertently revealing the Zoom Meeting ID and Passcode.',
      '14:12 PM — Guest_99 joins the Zoom call from IP 106.51.74.22 and annotates the slides.',
      "14:15 PM — The same IP address (106.51.74.22) authenticates into Devansh K.'s student portal.",
      '14:16 PM — Host Raghav disables participant annotation and removes Guest_99.',
    ],
    debriefNotes: [
      "Culprit: Devansh K. — Grabbed the Zoom passcode from Meera's Instagram story and joined from his mobile data IP (106.51.74.22) to disrupt the lecture.",
      'IP correlation across the Zoom participant log and college portal login proves ownership of 106.51.74.22.',
    ],
  },
  'case-19': {
    maxHints: 2,
    correctTimeline: [
      '11:20 AM — Chetana logs into lab_user14 from System #14 (192.168.2.114).',
      '11:31 AM — Chetana compiles and executes linkedlist.c.',
      "11:32 AM — The bash fork bomb :(){ :|:& };: is executed in lab_user14's shell.",
      '11:33 AM — The server runs out of PIDs and crashes, requiring a hard reboot by Manish.',
    ],
    debriefNotes: [
      'Culprit: Chetana — Executed the bash fork bomb from her assigned terminal (192.168.2.114), crashing the shared lab server.',
      '.bash_history on lab_user14 recorded the exact sequence right after compiling linkedlist.c.',
    ],
  },
  'case-20': {
    maxHints: 2,
    correctTimeline: [
      "23:08 — Roshan logs into Ananya's Figma/Google account from IP 157.48.12.90 using a credential-stuffed password.",
      "23:10 — The Avon_UI_Final.fig file is exported from Ananya's workspace.",
      "23:25 — Roshan uploads the stolen .fig file as Team Nova's entry from the same IP.",
      "09:00 — Judge Chitra spots Ananya's author metadata inside Team Nova's submission.",
    ],
    debriefNotes: [
      "Culprit: Roshan — Compromised Ananya's account via password reuse from IP 157.48.12.90 and submitted her exported Figma file as his own.",
      'Matching IP telemetry and Original Author: ananya_p metadata disproved Team Nova’s originality claim.',
    ],
  },
  'case-21': {
    maxHints: 2,
    correctTimeline: [
      '16:38 — Harish B. starts a Netcat listener on port 4444 on his machine (192.168.8.45).',
      '16:40 — Team #19 submits solution.py containing nc 192.168.8.45 4444 -e /bin/sh.',
      '16:40 — The Docker sandbox firewall blocks the outbound reverse shell connection.',
      '16:42 — Judge Admin Sandeep flags Team #19 for attempting remote code execution.',
    ],
    debriefNotes: [
      "Culprit: Harish B. — Hardcoded his own local IP (192.168.8.45) into a Netcat reverse shell payload to dump the judge's test cases.",
      'Outbound egress filtering in the judge Docker container prevented the reverse shell from connecting.',
    ],
  },
  'case-22': {
    maxHints: 2,
    correctTimeline: [
      '00:04:00 — Suraj edits meme_2030.jpg on his Redmi K50i phone.',
      '00:05:11 — User logs into the CMS panel with default credentials admin/admin123 from IP 172.16.9.21.',
      '00:06:30 — meme_2030.jpg is uploaded as the main homepage banner.',
      '00:15:00 — Web Lead Neha restores the original banner and updates the admin password.',
    ],
    debriefNotes: [
      'Culprit: Suraj — Guessed the default admin/admin123 password from his phone (172.16.9.21) and uploaded the meme he edited on his Redmi K50i.',
      'Both the hostel DHCP lease and the uploaded image EXIF software tag match Suraj.',
    ],
  },
  'case-23': {
    maxHints: 2,
    correctTimeline: [
      '19:35:00 — Rajat spots the public S3 URL in the README and posts a warning comment on GitHub.',
      '19:40:12 — Using aws-cli from his home BSNL IP (117.204.88.14), Rajat downloads registrations_all.csv.',
      '19:45:00 — Cloud Lead Deepa locks down the S3 bucket permissions.',
      "20:00:00 — S3 server access logs reveal the 200 OK download from Rajat's residential IP.",
    ],
    debriefNotes: [
      'Culprit: Rajat — Even though he reported the misconfiguration, he still downloaded the private registrations_all.csv file via aws-cli from his home IP.',
      'S3 access logs showed aws-cli/2.15.0 retrieving the full CSV five minutes after his GitHub comment.',
    ],
  },
  'case-24': {
    maxHints: 2,
    correctTimeline: [
      '08:50 AM — Soumya taps into Seminar Hall-A and takes a front-row seat.',
      "09:02 AM — Roommate Pavan taps both his own ID card and Karthikeya's ID card at HALL-A-DOOR.",
      "09:05 AM — Karthikeya's phone uploads a photo with GPS metadata in Goa (260 km away).",
      '09:30 AM — Faculty cross-checks the RFID logs against the live stream and flags the impossible travel.',
    ],
    debriefNotes: [
      "Culprit: Pavan (in collusion with Karthikeya) — Pavan physically tapped his roommate Karthikeya's ID card at the door scanner while Karthikeya was in Goa.",
      'Hall-A CCTV footage captured Pavan swiping two badges back-to-back at 09:02 AM.',
    ],
  },
  'case-25': {
    maxHints: 2,
    correctTimeline: [
      '10:00 AM — Ritesh sits at Stage PC #02 for Match 1.',
      '10:15 AM — Ritesh copies win_audio_helper.exe from his Kingston USB into C:\\Users\\Public\\Documents.',
      '10:45 AM — Aryan logs into his Riot Games account during Match 2, and his keystrokes are logged to keys.txt.',
      '12:30 PM — The keylogger emails keys.txt to ritesh.val@proton.me.',
    ],
    debriefNotes: [
      "Culprit: Ritesh — Planted the keylogger on Stage PC #02 during Match 1 via his Kingston USB to capture subsequent players' passwords.",
      'Both the file creation time (10:15 AM) and the exfiltration target (ritesh.val@proton.me) implicate Ritesh.',
    ],
  },
  'case-26': {
    maxHints: 2,
    correctTimeline: [
      '17:00 — Gaurav launches a local HTTP redirect server on 172.16.1.55 in Room 108.',
      "17:02 — Gaurav's machine begins sending spoofed DNS replies for results.bec.edu across Hostel-A's LAN.",
      '17:05 — Hostel-A students trying to check grades get redirected to the Rickroll video.',
      "17:20 — Wireshark capture traces the spoofed DNS IP back to Room 108's MAC address.",
    ],
    debriefNotes: [
      'Culprit: Gaurav — Performed LAN DNS spoofing from Room 108 (172.16.1.55) to redirect results.bec.edu traffic to his local server.',
      'ARP resolution maps 172.16.1.55 to MAC D8:BB:C1:44:90:12 assigned to Room 108.',
    ],
  },
  'case-27': {
    maxHints: 2,
    correctTimeline: [
      '15:17:00 — Dr. Hegde steps out of the jury room, leaving his laptop unlocked.',
      '15:18:10 — Volunteer Naveen enters the jury room with water bottles.',
      '15:18:40 — Judging_Rubric_2026.pdf is transferred via Bluetooth to OnePlus_Nord_Naveen.',
      '15:20:00 — Dr. Hegde returns to the jury room.',
    ],
    debriefNotes: [
      'Culprit: Naveen — Transferred the confidential rubric PDF to his own phone (OnePlus_Nord_Naveen) via Bluetooth while refilling water bottles.',
      'Disabling USB ports did not stop Bluetooth OBEX transfers logged by Windows fsquirt.',
    ],
  },
  'case-28': {
    maxHints: 2,
    correctTimeline: [
      '17:59:55 — Siddharth P. starts a Python script from IP 10.5.22.19 polling the ticket endpoint.',
      '18:00:00 — Registrations open; the script sends 200 automated python-requests POST calls in 4 seconds.',
      '18:00:04 — All 200 passes are issued to siddhu+1@gmail.com ... siddhu+200@gmail.com.',
      '18:00:05 — Human users like Manoj B. receive a "Sold Out" message.',
    ],
    debriefNotes: [
      'Culprit: Siddharth P. — Wrote a Python script using python-requests from his room (10.5.22.19) to hoard all 200 passes under his Gmail aliases.',
      'Absence of rate limiting and CAPTCHA allowed 50 scripted POST requests per second.',
    ],
  },
  'case-29': {
    maxHints: 2,
    correctTimeline: [
      '14:10 — Varsha logs into the portal and captures her standard student JWT ("role":"student").',
      '14:18 — Varsha brute-forces the weak HMAC secret (bagalkot123) offline.',
      '14:22 — Varsha signs a forged JWT with "role":"admin" and calls /api/approve_refund/404.',
      '14:25 — Treasurer Pooja M. notices an unauthorized ₹2,500 refund approved without her login.',
    ],
    debriefNotes: [
      'Culprit: Varsha — Cracked the weak JWT signing secret (bagalkot123) and forged an admin token to approve her own ₹2,500 refund.',
      'Always use high-entropy random secrets for HMAC JWT signing so tokens cannot be brute-forced offline.',
    ],
  },
  'case-30': {
    maxHints: 2,
    correctTimeline: [
      '16:55 — MacBook-Pro-Advait connects to the arena Wi-Fi and receives IP 192.168.99.64.',
      "17:02 — Team Titan's match begins and their ESP32 subscribes to bots/titan/cmd.",
      '17:04 — Client mqtt-explorer-91 from 192.168.99.64 publishes STOP_ALL to the unprotected MQTT broker.',
      "17:04 — Team Titan's robot freezes completely in the arena.",
    ],
    debriefNotes: [
      "Culprit: Advait — Connected his MacBook (192.168.99.64) to the open arena MQTT broker and published STOP_ALL to disable Team Titan's robot.",
      'Setting allow_anonymous true exposed safety-critical MQTT control topics to every device on arena Wi-Fi.',
    ],
  },
  'shadow-trace': {
    maxHints: 3,
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
    maxHints: 3,
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

const summaryCriteria: Record<string, { culprit: string[]; clues: string[] }> = {
  'case-01': { culprit: ['rohan'], clues: ['192.168.14.88', '192.168.14', 'canteen', 'wi-fi', 'wifi', 'windows', 'dhcp', 'macbook', 'os_midsem', 'chrome', 'router'] },
  'case-02': { culprit: ['vikram'], clues: ['vikram_codes', 'pat', 'token', '.env', 'charger', '65w', 'usb-c', 'force', 'clone', '03:12', '03:17'] },
  'case-03': { culprit: ['rahul'], clues: ['bruno', 'instagram', 'osint', 'security question', 'reset', 'cr', 'bookmark', 'aditya', '85%', 'attendance', 'prof_sharma'] },
  'case-04': { culprit: ['tanmay'], clues: ['kali', 'usb', 'pendrive', 'deauth', '-32', 'rssi', 'dbm', 'ap-lab04', '98:e7:f4:22:10:8a', 'jam', 'desk a1'] },
  'case-05': { culprit: ['manoj'], clues: ['manoj_k', 'dev_manoj99', '103.21.58.190', 'canteen', 'wi-fi', 'wifi', 'whois', 'bec-placemnts', 'typosquat', 'phish', 'x-originating-ip', 'whatsapp'] },
  'case-06': { culprit: ['kiran'], clues: ['admin_key_77', 'postman', 'desk 09', 'github', 'hardcoded', 'put', 'phoenix', '950', '18:18', '18:22'] },
  'case-07': { culprit: ['nikhil'], clues: ['dev_nikhil', '172.16.5.44', 'ssh', 'xmrig', 'miner', 'cron', 'hostel', '/tmp/.hidden', 'crypto', '22:10', '22:14'] },
  'case-08': { culprit: ['rohan'], clues: ['sandisk', 'pendrive', 'usb', '4c5300012908', 'usbdeview', 'podium', 'final_demo', 'vega', '10:02', '10:04', 'delete'] },
  'case-09': { culprit: ['siddharth'], clues: ['rfid', 'clone', 'a4-91-0c-77', 'uid', 'biometric', 'nair', 'raspberry', '02:31', 'electronics', 'cctv'] },
  'case-10': { culprit: ['chetan'], clues: ['free-smtp-relay', 'prankster_01', '89', 'spf', 'dkim', 'spoof', 'dean@bec.edu', 'return-path', 'telegram', 'header', 'smtp'] },
  'case-11': { culprit: ['tarun'], clues: ['tarun_sec', 'tarun.gamer99', 'git log', 'history', 'a81f9c', 'b92e1d', 'razorpay', 'voucher', 'commit', 'secret', 'rotate'] },
  'case-12': { culprit: ['harsh'], clues: ['vsix', 'extension', '192.168.50.99', '8080', 'id_rsa', 'ssh', 'harsh-kali-box', 'dhcp', 'usb', 'pendrive', 'collect'] },
  'case-13': { culprit: ['nitin'], clues: ['sql', 'sqli', 'injection', 'or 1=1', 'pixel 7', 'pixel', '991a2b', 'coupon', 'burger', 'otp', 'wi-fi', 'wifi'] },
  'case-14': { culprit: ['sahil'], clues: ['timerseconds', 'devtools', 'console', '45', '10-minute', '10 minute', 'client', 'tamper', 'spoof', 'lab pc 12'] },
  'case-15': { culprit: ['yashwant'], clues: ['192.168.137.1', 'hotspot', 'evil twin', 'bec-campus-free', 'bssid', '7a:99:11:44:22:01', '00:1a:2b', 'cisco', 'channel 11', 'rogue', 'windows'] },
  'case-16': { culprit: ['abhishek'], clues: ['desktop-abhi07', 'sha-256', 'sha256', 'hash', 'e3b0c442', 'pendrive', 'usb', 'marks_cse', '14 to 24', 'line 19', 'tamper'] },
  'case-17': { culprit: ['prateek'], clues: ['webhook', 'discord', '10.12.4.77', 'room 204', 'curl', 'post', 'screenshot', 'proxy', 'avon-announcer'] },
  'case-18': { culprit: ['devansh'], clues: ['106.51.74.22', 'zoom', 'instagram', 'story', 'guest_99', 'passcode', 'portal', 'mobile data', 'annotate'] },
  'case-19': { culprit: ['chetana'], clues: ['fork bomb', ':(){ :|:& };:', 'bash_history', 'lab_user14', '192.168.2.114', 'linkedlist', 'pid', 'system #14', 'crash'] },
  'case-20': { culprit: ['roshan'], clues: ['157.48.12.90', 'figma', '.fig', 'ananya_p', 'metadata', 'author', 'credential', 'password reuse', 'nova', 'avon_ui_final'] },
  'case-21': { culprit: ['harish'], clues: ['192.168.8.45', '4444', 'netcat', 'nc', 'reverse shell', 'docker', 'sandbox', 'egress', 'firewall', 'solution.py', '/bin/sh'] },
  'case-22': { culprit: ['suraj'], clues: ['redmi', 'k50i', 'exif', 'admin123', 'default', '172.16.9.21', 'meme_2030', 'cms', 'dhcp', 'banner'] },
  'case-23': { culprit: ['rajat'], clues: ['s3', 'aws-cli', 'aws', '117.204.88.14', 'registrations_all', 'bsnl', 'bucket', '200 ok', 'download', 'readme'] },
  'case-24': { culprit: ['pavan', 'karthikeya'], clues: ['rfid', 'goa', 'gps', '260 km', 'hall-a', 'cctv', 'swipe', 'badge', 'id card', 'impossible travel', 'roommate'] },
  'case-25': { culprit: ['ritesh'], clues: ['keylogger', 'win_audio_helper', 'kingston', 'usb', 'keys.txt', 'ritesh.val@proton.me', 'proton', 'stage pc', 'match 1', '10:15'] },
  'case-26': { culprit: ['gaurav'], clues: ['dns', 'spoof', '172.16.1.55', 'room 108', 'd8:bb:c1:44:90:12', 'mac', 'arp', 'wireshark', 'results.bec.edu', 'rickroll', 'redirect'] },
  'case-27': { culprit: ['naveen'], clues: ['bluetooth', 'oneplus', 'obex', 'fsquirt', 'judging_rubric', 'rubric', 'water', 'usb', 'transfer'] },
  'case-28': { culprit: ['siddharth'], clues: ['python', 'python-requests', '10.5.22.19', 'siddhu+', 'alias', '200', 'bot', 'rate limit', 'captcha', 'script'] },
  'case-29': { culprit: ['varsha'], clues: ['jwt', 'hmac', 'bagalkot123', 'brute', 'secret', 'role', 'admin', 'forge', '2,500', '2500', 'refund'] },
  'case-30': { culprit: ['advait'], clues: ['mqtt', '192.168.99.64', 'stop_all', 'allow_anonymous', 'anonymous', 'macbook-pro-advait', 'mqtt-explorer', 'esp32', 'titan', 'broker'] },
  'shadow-trace': { culprit: ['usb', '.cache-sync', 'cron'], clues: ['42 seconds', '02:15', '02:19', 'dns', 'txt', '640', 'backup', '01:00', 'ws-14', 'ssh', 'exfil'] },
  'encrypted-truth': { culprit: ['reg-2023', 'signing_backup_2023.pem', 'jwks'], clues: ['c81e4a', 'commit', 'git', 'retired', 'revoke', 'kid', 'reg-2026', 'hsm', 'forged', '03:42'] },
};

function matchesSummaryTerm(text: string, term: string): boolean {
  const normalized = term.toLowerCase();
  if (/^[a-z0-9]{1,5}$/i.test(normalized)) {
    const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
  }
  return text.includes(normalized);
}

function evaluateAnswerSummary(caseId: string, report: string) {
  const trimmed = report.trim();
  const criteria = summaryCriteria[caseId];
  if (!trimmed || !criteria) {
    return { summaryScore: 0, culpritMatched: false, culpritPoints: 0, clueHits: 0, cluePoints: 0 };
  }
  const lower = trimmed.toLowerCase();
  const culpritMatched = criteria.culprit.some((term) => matchesSummaryTerm(lower, term));
  const clueHits = criteria.clues.filter((term) => matchesSummaryTerm(lower, term)).length;
  const culpritPoints = culpritMatched ? 25 : 0;
  const cluePoints = Math.round(Math.min(1, clueHits / 3) * 25);
  return {
    summaryScore: culpritPoints + cluePoints,
    culpritMatched,
    culpritPoints,
    clueHits,
    cluePoints,
  };
}

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

    if (action === 'adminLogin') {
      const passcode = String(payload.passcode || '').trim();
      const expectedPasscode = Deno.env.get('ADMIN_PASSCODE') || 'ARENA-ADMIN-2026';
      if (!passcode || passcode !== expectedPasscode) {
        return json({ error: 'Invalid organizer passcode.' }, 403);
      }
      const adminToken = await signAdminToken(serviceRoleKey);
      return json({ adminToken, isAdmin: true });
    }

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
      return json(
        { error: 'Only one player can play per team. Invite codes are disabled.' },
        403
      );
    }

    if (action === 'leaveTeam') {
      const teamId = String(payload.teamId || '');
      let query = adminClient
        .from('teams')
        .select('*')
        .contains('member_ids', [user.id]);
      if (teamId) {
        query = query.eq('id', teamId);
      }
      const { data: team } = await query.maybeSingle();
      if (!team) {
        return json({ left: true });
      }
      const members = Array.isArray(team.member_ids) ? team.member_ids : [];
      const nextMembers = members.filter((id: string) => id !== user.id);
      if (nextMembers.length === 0) {
        await adminClient.from('teams').delete().eq('id', team.id);
      } else {
        await adminClient.from('teams').update({ member_ids: nextMembers }).eq('id', team.id);
        await adminClient
          .from('rankings')
          .update({ member_ids: nextMembers })
          .eq('team_id', team.id);
      }
      const { count } = await adminClient
        .from('teams')
        .select('id', { count: 'exact', head: true });
      await adminClient.from('stats').upsert({ id: 1, registered_teams: count ?? 0 });
      return json({ left: true });
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
      const maxHints = caseAnswerKeys[caseId]?.maxHints ?? 2;
      const nextHints = Math.min(maxHints, (session.hints_used || 0) + 1);
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
      const reportText = typeof payload.report === 'string' ? payload.report : '';
      const totalSteps = key.correctTimeline.length;
      let timelineMatches = 0;
      for (let i = 0; i < totalSteps; i += 1) {
        if (timelineOrder[i] === key.correctTimeline[i]) timelineMatches += 1;
      }

      const perStepPoints = totalSteps > 0 ? 50 / totalSteps : 0;
      const sequenceScore = Number((timelineMatches * perStepPoints).toFixed(2));
      const summaryEval = evaluateAnswerSummary(caseId, reportText);
      const rawScore = sequenceScore + summaryEval.summaryScore - hintsUsed * 5;
      const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));
      const perStepLabel = Number(perStepPoints.toFixed(1)).toString();

      const explanations = [
        {
          title: 'Sequence recognition (50%)',
          correct: timelineMatches === totalSteps,
          explanation: `${timelineMatches} of ${totalSteps} orders matched (${sequenceScore} / 50 pts · ${perStepLabel} pts each).`,
        },
        {
          title: 'Answer summary (50%)',
          correct: summaryEval.summaryScore >= 25,
          explanation: `${summaryEval.summaryScore} / 50 pts — Culprit ${
            summaryEval.culpritMatched ? 'identified' : 'missing'
          } (${summaryEval.culpritPoints}/25) · ${summaryEval.clueHits} key clue indicator${
            summaryEval.clueHits === 1 ? '' : 's'
          } cited (${summaryEval.cluePoints}/25).`,
        },
        ...key.debriefNotes.map((note, idx) => ({
          title: `Forensic finding 0${idx + 1}`,
          correct: true,
          explanation: note,
        })),
      ];

      const caseResult = {
        score: finalScore,
        sequenceScore,
        summaryScore: summaryEval.summaryScore,
        timelineMatches,
        totalTimeline: totalSteps,
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
      const totalScore = Math.round(
        Object.values(caseScores).reduce(
          (sum: number, item: unknown) => sum + ((item as { score?: number }).score || 0),
          0
        )
      );
      const totalElapsed = Math.round(
        Object.values(caseScores).reduce(
          (sum: number, item: unknown) =>
            sum + ((item as { elapsedSeconds?: number }).elapsedSeconds || 0),
          0
        )
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
        message: `Sequence ${sequenceScore}/50 (${timelineMatches}/${totalSteps} × ${perStepLabel} pts) + Summary ${summaryEval.summaryScore}/50.`,
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
      if (game.status === 'ended') {
        return json({ error: 'This event lobby has already ended.' }, 400);
      }
      const { data: myTeam } = await adminClient
        .from('teams')
        .select('id')
        .contains('member_ids', [user.id])
        .maybeSingle();
      if (myTeam) {
        const existingParticipants = Array.isArray(game.participant_team_ids)
          ? game.participant_team_ids
          : [];
        if (!existingParticipants.includes(myTeam.id)) {
          const nextParticipants = [...existingParticipants, myTeam.id];
          await adminClient
            .from('games')
            .update({
              participant_team_ids: nextParticipants,
              participant_count: nextParticipants.length,
            })
            .eq('id', game.id);
        }
      }
      return json({
        id: game.id,
        name: game.name || game.title,
        caseId: game.case_id,
        status: game.status,
      });
    }

    const tokenAdmin = await verifyAdminToken(
      req.headers.get('x-arena-admin') || String(payload.adminToken || ''),
      serviceRoleKey
    );
    const isAdmin = Boolean(
      tokenAdmin || user.app_metadata?.role === 'admin' || user.app_metadata?.admin === true
    );
    if (!isAdmin) return json({ error: 'Administrator access required.' }, 403);

    if (action === 'adminCreateGame') {
      const name = String(payload.name || '').trim();
      if (!name) return json({ error: 'Event name is required.' }, 400);
      const inviteCode =
        String(payload.inviteCode || '').trim().toUpperCase() || generateInviteCode(6);
      const { data: game, error } = await adminClient
        .from('games')
        .insert({
          name,
          case_id: String(payload.caseId || 'case-01'),
          invite_code: inviteCode,
          status: 'open',
        })
        .select('*')
        .single();
      if (error) return json({ error: error.message }, 400);
      return json({
        id: game.id,
        name: game.name,
        caseId: game.case_id,
        inviteCode: game.invite_code,
        status: game.status,
        participantCount: game.participant_count ?? 0,
        createdAt: game.created_at,
      });
    }

    if (action === 'adminSetGameStatus') {
      const { error } = await adminClient
        .from('games')
        .update({ status: String(payload.status || 'open') })
        .eq('id', String(payload.gameId || ''));
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (action === 'adminAnnounce') {
      const { error } = await adminClient.from('announcements').insert({
        title: String(payload.title || '').trim(),
        message: String(payload.message || '').trim(),
      });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (action === 'adminListTeams') {
      const { data, error } = await adminClient.from('teams').select('id, name, member_ids');
      if (error) return json({ error: error.message }, 400);
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
