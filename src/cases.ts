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
    title: 'The Leaked Question Paper',
    subtitle: 'Local IP Addresses & User-Agent Strings',
    category: 'Network & Access Forensics',
    duration: 5,
    icon: 'scan',
    color: 'cyan',
    briefing:
      'At 11:42 PM, the Operating Systems mid-sem PDF was downloaded from the HOD portal using an active session token and leaked on Telegram.',
    incident: 'Server access log, DHCP table, GitHub commit log, and canteen CCTV.',
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
      '11:42 PM: The OS mid-semester question paper PDF is downloaded from the HOD portal.',
      'Lab Assistant Aarav scans his biometric ID and leaves the CS block.',
      'The leaked question paper appears on a public Telegram channel.',
      'Rohan sits near the canteen Wi-Fi router and opens his Windows laptop.',
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
    incident: 'GitHub audit log, Discord chat export, volunteer desk log, and repo clone telemetry.',
    evidence: [
      {
        type: 'AUDIT LOG',
        title: 'GitHub Audit Log',
        detail: '03:17:04 AM | Event: repo.force_push | Auth: Personal Access Token ("backend_deploy")',
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
        type: 'GIT LOG',
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
      '02:15 AM: Vikram borrows a 65W laptop charger from the volunteer desk.',
      "The team's main code branch is wiped clean using a force push.",
      'Karthik accidentally pushes his secret GitHub access token inside the .env file.',
      "Vikram clones the leading team's repository and copies their secret token.",
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
    category: 'Identity & OSINT',
    duration: 5,
    icon: 'globe',
    color: 'emerald',
    briefing:
      'A student with 42% attendance jumped to 85% overnight in the ERP database via a legitimate faculty login—no SQL injection occurred.',
    incident: 'ERP authentication log, security question log, Instagram OSINT, and browser fingerprint.',
    evidence: [
      {
        type: 'AUTH LOG',
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
      'The attacker resets the password using the pet name "Bruno" from a browser with CR bookmarks.',
      'Class Rep Rahul collects the attendance sheets and hands them to Prof. Sharma.',
      "Aditya's attendance is manually updated from 42% to 85% in the database.",
      "04:05 PM: Someone tries to log into Prof. Sharma's ERP account twice with the wrong password.",
    ],
    hints: [
      'How did the attacker guess the security question answer without hacking the database?',
      "Look at the saved bookmarks on the attacker's browser fingerprint (BEC_CR_Notices).",
    ],
  },
  {
    id: 'case-04',
    title: 'The Wi-Fi Jammer at the Coding Lab',
    subtitle: 'MAC Addresses & Signal Strength (RSSI)',
    category: 'Wireless Forensics',
    duration: 5,
    icon: 'scan',
    color: 'rose',
    briefing:
      'During the final 15 minutes of an online coding qualifier in Lab-04, router AP-LAB04 crashed from a deauthentication flood.',
    incident: 'Router syslog, DHCP lease table, and Lab-04 CCTV.',
    evidence: [
      {
        type: 'SYSLOG',
        title: 'Router Syslog',
        detail: '21:14:05 | Deauth flood on Ch 6 | Source MAC: 98:E7:F4:22:10:8A | Signal: -32 dBm (Within 3m of router)',
      },
      {
        type: 'NETWORK',
        title: 'DHCP Lease Table',
        detail: '192.168.10.14 (Siddharth-PC) | 192.168.10.22 (MAC 98:E7:F4:22:10:8A - Kali-Live-USB)',
      },
      {
        type: 'CCTV',
        title: 'Lab CCTV (21:13)',
        detail: 'Tanmay is seated at Desk A1 directly below the wall router with a USB pendrive plugged into his laptop.',
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
      'Tanmay plugs in a blue USB drive and boots a live Linux OS right below the router.',
      'The lab Wi-Fi crashes and disconnects all 40 participants.',
      'Pooja submits her coding solution and walks over to the exit door.',
      '09:14 PM: A flood of disconnect signals hits the lab Wi-Fi from a laptop within 3 meters of the router.',
    ],
    hints: [
      'A signal strength of -32 dBm means the attacker was within 3 meters of the wall router.',
      'Match MAC 98:E7:F4:22:10:8A in the DHCP table to the USB-booted OS on CCTV.',
    ],
  },
  {
    id: 'case-05',
    title: 'The Fake Internship Portal Phish',
    subtitle: 'Typosquatting & Email Headers',
    category: 'Phishing & Email Forensics',
    duration: 5,
    icon: 'mail',
    color: 'amber',
    briefing:
      'Ten students entered their ERP passwords into a fake Google Summer Internship portal shared on the batch WhatsApp group.',
    incident: 'Email headers, WHOIS lookup, canteen Wi-Fi logs, and WhatsApp messages.',
    evidence: [
      {
        type: 'EMAIL HEADER',
        title: 'Email Header',
        detail: 'From: internship@bec-placemnts.in | X-Originating-IP: 103.21.58.190 | Time: 14:30 IST',
      },
      {
        type: 'WHOIS',
        title: 'WHOIS Lookup',
        detail: "Domain: bec-placemnts.in (Missing 'e') | Registered: Today 13:45 IST | Handle: dev_manoj99",
      },
      {
        type: 'WIFI LOG',
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
      'Fake internship shortlist emails are sent out to students from the canteen IP address.',
      'Manoj logs into the Canteen Free Wi-Fi on his device.',
      'Manoj messages the class group telling everyone to open the link quickly.',
      '01:45 PM: The fake lookalike website bec-placemnts.in is registered online.',
    ],
    hints: [
      'Inspect the spelling of bec-placemnts.in and check the WHOIS registrant handle.',
      'Match X-Originating-IP: 103.21.58.190 with the Canteen Wi-Fi user session.',
    ],
  },
  {
    id: 'case-06',
    title: 'The Crypto Miner on the Lab GPU',
    subtitle: 'Linux Cron Jobs & SSH Logs',
    category: 'Linux & Persistence Forensics',
    duration: 5,
    icon: 'shield',
    color: 'violet',
    briefing:
      'The Deep Learning lab server LAB-GPU-03 triggered a thermal overheat alert at night because an unauthorized mining script was running at 99% GPU usage.',
    incident: 'Root crontab entry, file stat metadata, SSH auth logs, and Slack chat.',
    evidence: [
      {
        type: 'CRONTAB',
        title: 'Crontab Entry (/var/spool/cron/crontabs/root)',
        detail: '*/5 * * * * /tmp/.hidden/xmrig_miner --wallet=48x9...',
      },
      {
        type: 'FILE STAT',
        title: 'File Stat (stat /tmp/.hidden/xmrig_miner)',
        detail: 'Birth: 2026-11-17 20:47:08 | Owner: dev_nithin',
      },
      {
        type: 'AUTH LOG',
        title: 'Auth Log (/var/log/auth.log)',
        detail: '20:45:02 Accepted publickey for dev_nithin from 172.16.5.44 (Hostel-Block-B)',
      },
      {
        type: 'CHAT LOG',
        title: 'Slack Message (23:31)',
        detail: 'Nithin: "Hey guys, why is LAB-GPU-03 throwing an 88°C overheat warning right now?"',
      },
    ],
    suspects: [
      {
        name: 'Nithin',
        role: 'Student Sysadmin',
        note: 'Someone must have stolen my SSH key! I only logged in to check CUDA drivers.',
      },
      {
        name: 'Priya',
        role: 'Lab Assistant',
        note: 'I locked the biometric lab door at 20:00 and went home.',
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
      '08:45 PM: Nithin logs into LAB-GPU-03 remotely over SSH using his student ID.',
      'The server temperature crosses 88°C and triggers a thermal overheat alert.',
      'The Deep Learning lab officially closes and the biometric door locks for the night.',
      'A hidden mining script starts running in the background and pushes GPU usage to 99%.',
    ],
    hints: [
      'Check the file owner and creation timestamp of /tmp/.hidden/xmrig_miner.',
      "Notice the SSH connection came from Hostel Block B—Nithin's own hostel subnet.",
    ],
  },
  {
    id: 'case-07',
    title: 'The Altered Leaderboard Score',
    subtitle: 'Unverified API Requests & Burp/Postman',
    category: 'API & Application Security',
    duration: 5,
    icon: 'database',
    color: 'cyan',
    briefing:
      'In the online coding quiz, one student jumped to #1 on the leaderboard by submitting a perfect 100/100 score in just 4 seconds.',
    incident: 'API gateway logs, library Wi-Fi DHCP logs, and library CCTV.',
    evidence: [
      {
        type: 'API LOG',
        title: 'API Gateway Log',
        detail: '15:58:19 | POST /api/v1/submit {"user": "kiran_07", "score": 100, "time": 4} | Tool: PostmanRuntime/7.39',
      },
      {
        type: 'DHCP LOG',
        title: 'Library Wi-Fi DHCP Log',
        detail: '15:40:00 — Kiran-Laptop assigned IP 10.20.4.18 (Matches POST request source IP)',
      },
      {
        type: 'CCTV',
        title: 'Library CCTV (15:45)',
        detail: 'Kiran is seen sitting in the reading hall with Chrome DevTools and Postman open side-by-side.',
      },
    ],
    suspects: [
      {
        name: 'Arjun',
        role: 'Quiz Developer',
        note: 'I built the quiz backend, but I was on stage anchoring from 15:30 to 16:30.',
      },
      {
        name: 'Kiran',
        role: '3rd Year CSE',
        note: "I just finished the quiz super fast in the library! I don't know backend coding.",
      },
      {
        name: 'Shreya',
        role: 'Event Coordinator',
        note: 'I only monitor the admin dashboard on Chrome, never Postman.',
      },
      {
        name: 'Varun',
        role: '2nd Year ISE',
        note: 'I submitted at 15:59 from Hostel Block C and scored 78/100.',
      },
    ],
    timeline: [
      'The server accepts the unverified score and puts Kiran at #1 on the leaderboard.',
      "Kiran uses his laptop inside the library to inspect the quiz website's network requests.",
      'The online quiz timer ends and the final results lock.',
      '03:58 PM: Kiran sends a fake POST request claiming a perfect score of 100/100 in just 4 seconds.',
    ],
    hints: [
      'Notice the submission came from PostmanRuntime, not a standard web browser.',
      'Match the source IP 10.20.4.18 with the Library Wi-Fi DHCP log.',
    ],
  },
  {
    id: 'case-08',
    title: 'The Missing Fest Sponsorship Funds',
    subtitle: 'Session Hijacking & Unattended Terminals',
    category: 'Session & Insider Forensics',
    duration: 5,
    icon: 'key',
    color: 'amber',
    briefing:
      "₹25,000 in fest sponsorship funds was transferred to an unknown vendor UPI ID from Treasurer Varun's account while he stepped away for tea.",
    incident: 'Payment portal audit log, transfer log, and fest desk CCTV.',
    evidence: [
      {
        type: 'AUDIT LOG',
        title: 'Payment Portal Audit Log',
        detail:
          '10:04:12 AM | New Beneficiary Added: "TechSupplies_Blr" (UPI: pranav.99@okicici) | Session: Varun_Chrome',
      },
      {
        type: 'TRANSFER LOG',
        title: 'Transfer Log',
        detail: "10:05:30 AM | ₹25,000 transferred to pranav.99@okicici | IP: 192.168.1.50 (Varun's Laptop)",
      },
      {
        type: 'CCTV',
        title: 'Fest Desk CCTV',
        detail: "Varun leaves his unlocked laptop at 10:00 AM; Pranav sits in Varun's chair from 10:03 AM to 10:06 AM.",
      },
    ],
    suspects: [
      {
        name: 'Varun',
        role: 'Fest Treasurer',
        note: 'I foolishly left my laptop unlocked while getting tea at 10:00 AM!',
      },
      {
        name: 'Pranav',
        role: 'Logistics Member',
        note: "I only sat at Varun's desk for 2 minutes to charge my phone!",
      },
      {
        name: 'Aditi',
        role: 'Sponsorship Head',
        note: 'I was at the main gate welcoming sponsors from 09:45 AM to 10:30 AM.',
      },
      {
        name: 'Rohan',
        role: 'Faculty Advisor',
        note: "I don't have login credentials for the student fest payment portal.",
      },
    ],
    timeline: [
      "Pranav sits at Varun's laptop and adds a fake vendor account in the payment portal.",
      'Varun returns to his desk and notices the missing money alert.',
      'Treasurer Varun leaves his unlocked laptop on the fest desk while going to buy tea.',
      "10:05 AM: Pranav approves a ₹25,000 transfer from Varun's browser session to his own UPI ID.",
    ],
    hints: [
      'Look at the UPI ID of the newly added beneficiary (pranav.99@okicici).',
      "Match the transfer timestamp (10:05:30 AM) with the CCTV footage of Varun's desk.",
    ],
  },
  {
    id: 'case-09',
    title: 'The Hijacked College Instagram Page',
    subtitle: 'SMS OTP Interception & Device Logs',
    category: 'Account Takeover Forensics',
    duration: 5,
    icon: 'fingerprint',
    color: 'rose',
    briefing:
      'The official Avon Instagram page was taken over and used to post a fake cancellation notice, causing panic among participants.',
    incident: 'Instagram login activity, recovery email audit, and auditorium backstage CCTV.',
    evidence: [
      {
        type: 'AUTH LOG',
        title: 'Instagram Login Activity',
        detail: '18:15 PM | New Login: "Sahil\'s iPhone 14" | Method: SMS OTP Code | IP: 49.36.88.12',
      },
      {
        type: 'ACCOUNT LOG',
        title: 'Email Change Notification',
        detail: '18:20 PM | Recovery email changed from tara.club@bec.edu to sahil.dark@gmail.com',
      },
      {
        type: 'CCTV',
        title: 'Auditorium Backstage CCTV',
        detail: 'Tara leaves her phone on the table at 18:00 PM; Sahil picks it up, reads the lockscreen notification at 18:14 PM, and puts it back.',
      },
    ],
    suspects: [
      {
        name: 'Tara',
        role: 'Club President',
        note: "I left my phone backstage during soundcheck and didn't have lockscreen previews hidden!",
      },
      {
        name: 'Sahil',
        role: 'Media Team',
        note: "I only picked up Tara's phone to see whose phone was buzzing!",
      },
      {
        name: 'Nandini',
        role: 'Content Writer',
        note: 'I use an Android phone and was at the registration desk all evening.',
      },
      {
        name: 'Akash',
        role: '2nd Year Mech',
        note: "I don't even follow the club page; I was in the workshop.",
      },
    ],
    timeline: [
      'Sahil removes Tara’s email from the account and posts a fake event cancellation notice.',
      'Club President Tara leaves her phone on the auditorium stage during rehearsal.',
      'Students start panicking and messaging the club group about the cancelled fest.',
      "06:15 PM: Sahil opens the OTP SMS on Tara's phone and logs into the club Instagram on his iPhone.",
    ],
    hints: [
      "Check the device name in the Instagram login activity (Sahil's iPhone 14).",
      "Notice how lockscreen SMS previews allowed Sahil to read the OTP without unlocking Tara's phone.",
    ],
  },
  {
    id: 'case-10',
    title: 'The Deleted Final Year Project',
    subtitle: 'Leaked Cloud IAM Keys & CloudTrail Logs',
    category: 'Cloud & IAM Forensics',
    duration: 5,
    icon: 'database',
    color: 'indigo',
    briefing:
      "The night before project evaluation, a team's AWS S3 bucket containing all their trained ML models (final-year-ml-data) was permanently deleted.",
    incident: 'AWS CloudTrail logs, Discord stream screenshot, and Hostel Block A DHCP log.',
    evidence: [
      {
        type: 'CLOUDTRAIL',
        title: 'AWS CloudTrail Log',
        detail:
          '22:32:10 | Event: DeleteBucket | Bucket: final-year-ml-data | AccessKeyId: AKIAIOSFODNN7EXAMPLE | SourceIP: 10.14.8.92',
      },
      {
        type: 'SCREENSHOT',
        title: 'Discord Stream Screenshot (21:15)',
        detail: 'Omkar shared his VS Code window in a public voice channel with AWS_SECRET_ACCESS_KEY visible on line 8.',
      },
      {
        type: 'DHCP LOG',
        title: 'Hostel Block A DHCP Log',
        detail: 'IP 10.14.8.92 belongs to Room 112, occupied by Vivek.',
      },
    ],
    suspects: [
      {
        name: 'Omkar',
        role: 'Project Lead',
        note: 'I accidentally showed my .env file while streaming on Discord at 21:15!',
      },
      {
        name: 'Vivek',
        role: 'Rival Group',
        note: 'I joined the Discord voice channel to say hi, then went to sleep in Room 112!',
      },
      {
        name: 'Bhavna',
        role: 'Teammate',
        note: "I was working on the frontend slides; I don't even have AWS CLI installed.",
      },
      {
        name: 'Divya',
        role: 'Lab Mentor',
        note: 'My IP is 10.14.2.10 and I always tell students never to hardcode AWS keys.',
      },
    ],
    timeline: [
      '10:30 PM: Rival student Vivek logs into the AWS account from his hostel room using those leaked keys.',
      'The project team tries to run their demo and gets a "Bucket Not Found" error.',
      'Teammate Omkar shares his screen on Discord with his AWS secret keys visible in VS Code.',
      "Vivek permanently deletes the project's cloud storage bucket (final-year-ml-data).",
    ],
    hints: [
      'Trace the SourceIP: 10.14.8.92 in the AWS CloudTrail deletion log.',
      'Match IP 10.14.8.92 to Hostel Room 112.',
    ],
  },
  {
    id: 'case-11',
    title: 'The RFID Library Gate Bypass',
    subtitle: 'RFID Skimming & Card Cloning',
    category: 'Hardware & Physical Security',
    duration: 5,
    icon: 'key',
    color: 'emerald',
    briefing:
      "Three expensive GATE preparation books were checked out under Senior Student Arjun's library ID while Arjun was playing football across campus.",
    incident: 'Library turnstile logs, sports ground CCTV, and library entrance CCTV.',
    evidence: [
      {
        type: 'KIOSK LOG',
        title: 'Library Turnstile & Kiosk Log',
        detail: '18:30 PM | Entry & Checkout: 3 GATE Books | Card UID: 8F-22-19-B4 (Arjun)',
      },
      {
        type: 'CCTV',
        title: 'Sports Ground CCTV (18:00–19:00)',
        detail: 'Arjun is clearly visible playing a football match during the entire hour.',
      },
      {
        type: 'CCTV',
        title: 'Library Entrance CCTV (14:01 PM)',
        detail:
          'Yash brushes closely behind Arjun at the turnstile while holding a modified RFID reader module in his backpack side pocket.',
      },
    ],
    suspects: [
      {
        name: 'Arjun',
        role: '4th Year CSE',
        note: 'My ID card was in my gym bag at the football ground at 18:30!',
      },
      {
        name: 'Yash',
        role: '2nd Year ECE',
        note: "I built an RC522 RFID reader for my mini-project, I didn't steal anyone's card!",
      },
      {
        name: 'Megha',
        role: 'Librarian',
        note: "Our self-checkout kiosk only reads the RFID tag UID; it doesn't ask for a PIN.",
      },
      {
        name: 'Suresh',
        role: 'Library Guard',
        note: 'A student wearing a blue hoodie scanned a white blank RFID card at 18:30.',
      },
    ],
    timeline: [
      'Yash walks into the library using the cloned card ID while Arjun is at the sports ground.',
      'Yash walks past the library turnstile with a hidden RFID scanner inside his backpack.',
      "Three rare GATE exam books are checked out under Arjun's library account.",
      "02:01 PM: Yash's scanner copies the card ID number of Senior Student Arjun.",
    ],
    hints: [
      'Since Arjun had his original card at the football ground, the culprit used a cloned blank RFID card.',
      'Check who was caught on CCTV brushing behind Arjun at 14:01 PM with an RFID reader.',
    ],
  },
  {
    id: 'case-12',
    title: 'The Manipulated Placement Shortlist',
    subtitle: 'Cloud File Revision History & OS Fingerprints',
    category: 'Cloud & Document Forensics',
    duration: 5,
    icon: 'shield',
    color: 'cyan',
    briefing:
      "Right before HR interviews began, an unshortlisted student's USN appeared on Row 14 of the shared placement shortlist CSV.",
    incident: 'Google Drive revision history and Lab-01 Linux login telemetry.',
    evidence: [
      {
        type: 'REVISION LOG',
        title: 'Google Drive Revision Log',
        detail:
          '12:20 PM | Edited by: "Placement_Guest_Link" | OS: Ubuntu Linux x86_64 | Change: Inserted 2BA22CS009 (Abhishek) at Row 14',
      },
      {
        type: 'AUTH LOG',
        title: 'Lab-01 Login Log',
        detail:
          'Only one student in the department dual-boots Ubuntu Linux and was logged into Lab-01 at 12:20 PM: Abhishek.',
      },
    ],
    suspects: [
      {
        name: 'Abhishek',
        role: '4th Year CSE',
        note: 'I was shocked to see my name on the list too! I just showed up for the interview.',
      },
      {
        name: 'Isha',
        role: 'Placement Coord',
        note: "I uploaded the file from my Windows 11 laptop and accidentally left link-sharing set to 'Anyone can edit'.",
      },
      {
        name: 'Pranav',
        role: 'Student Volunteer',
        note: 'I use a MacBook and was escorting the HR panel from the guest house at 12:20 PM.',
      },
      {
        name: 'Gautam',
        role: '4th Year ISE',
        note: 'My name was already at Row 3 from the original aptitude test results.',
      },
    ],
    timeline: [
      "12:20 PM: Someone opens the file and types Abhishek's USN into Row 14 using a Linux computer.",
      'The coordinator notices an extra student sitting in the interview waiting room.',
      'The placement coordinator uploads the shortlist CSV file to a shared Google Drive folder.',
      'The updated shortlist is downloaded by the HR team for afternoon interviews.',
    ],
    hints: [
      'Look at the OS fingerprint in the Google Drive revision history (Ubuntu Linux x86_64).',
      'Check who was logged into Lab-01 on Ubuntu Linux at 12:20 PM and added their own USN.',
    ],
  },
  {
    id: 'case-13',
    title: 'The Spoofed Dean Email',
    subtitle: 'Email Header Spoofing & Return-Path',
    category: 'Email & DNS Forensics',
    duration: 5,
    icon: 'mail',
    color: 'violet',
    briefing:
      'Campus security unlocked the main auditorium for an unauthorized late-night gaming event after receiving a forged approval email from dean@bec.edu.',
    incident: 'Raw email headers, auditorium portal logs, and campus firewall DNS logs.',
    evidence: [
      {
        type: 'EMAIL HEADER',
        title: 'Raw Email Source',
        detail: 'From: dean@bec.edu | Return-Path: mailer@emkei-spoof.cz | SPF: FAIL | Time: 09:32 AM',
      },
      {
        type: 'PORTAL LOG',
        title: 'Auditorium Booking Portal Log',
        detail: '09:30 AM — Request submitted by Student Secretary Naveen (IP: 10.12.4.77)',
      },
      {
        type: 'DNS LOG',
        title: 'Campus Firewall DNS Log',
        detail: 'IP 10.12.4.77 queried emkei-spoof.cz at 09:31 AM.',
      },
    ],
    suspects: [
      {
        name: 'Naveen',
        role: 'Student Secretary',
        note: "I submitted the normal booking request at 09:30 AM and got the Dean's approval email two minutes later!",
      },
      {
        name: 'Riya',
        role: 'Portal Admin',
        note: 'Official emails never fail SPF checks or route through emkei-spoof.cz.',
      },
      {
        name: 'Kabir',
        role: 'Security Guard',
        note: 'Naveen showed me the email on his phone saying the Dean approved it, so I unlocked the hall.',
      },
      {
        name: 'Omkar',
        role: '2nd Year Civil',
        note: 'I was in structural lab from 09:00 AM to 12:00 PM.',
      },
    ],
    timeline: [
      'The security guard receives the fake email approving the auditorium for the esports club.',
      'Student Secretary Naveen submits the official room booking request from his hostel room.',
      'The esports club sets up their gaming PCs inside the main auditorium.',
      '09:32 AM: A fake email pretending to be from the Dean is sent using an online email-spoofing tool.',
    ],
    hints: [
      'Check which IP address queried the email-spoofing website emkei-spoof.cz at 09:31 AM.',
      'Match IP 10.12.4.77 with the booking request submitted at 09:30 AM.',
    ],
  },
  {
    id: 'case-14',
    title: 'The Tampered Smart Meter Reading',
    subtitle: 'Default IoT Wi-Fi AP & Hardcoded Passwords',
    category: 'IoT & Embedded Forensics',
    duration: 5,
    icon: 'scan',
    color: 'amber',
    briefing:
      "Despite running a portable air cooler all month, Hostel Room 304's IoT electricity meter reported 0.0 kWh consumed.",
    incident: 'ESP8266 serial log, hostel Wi-Fi MAC registry, and corridor CCTV.',
    evidence: [
      {
        type: 'SERIAL LOG',
        title: 'ESP8266 Smart Meter Serial Log',
        detail:
          '01:30:12 AM | AP Client Connected: MAC A2:44:90:11:7C:02 | Command: POST /reset_kwh (Default Auth: admin/admin)',
      },
      {
        type: 'WIFI REGISTRY',
        title: 'Hostel Wi-Fi Registry',
        detail: "MAC A2:44:90:11:7C:02 belongs to Gaurav's OnePlus 11 (Resident of Room 304).",
      },
      {
        type: 'CCTV',
        title: 'Corridor CCTV (01:29 AM)',
        detail: 'Gaurav steps out of Room 304 with his phone near the corridor meter box.',
      },
    ],
    suspects: [
      {
        name: 'Gaurav',
        role: 'Room 304 Resident',
        note: 'Our smart meter must be faulty! Why would I hack the meter in the middle of the night?',
      },
      {
        name: 'Ankita',
        role: 'IoT Project Lead',
        note: 'We left the ESP8266 config hotspot enabled with default admin/admin credentials—huge mistake!',
      },
      {
        name: 'Devansh',
        role: 'Room 305 Resident',
        note: "My room's meter showed 140 kWh normally; I was asleep at 01:30 AM.",
      },
      {
        name: 'Lakshmi',
        role: 'Hostel Warden',
        note: 'Room 304 was the only room in the entire wing with a 0.0 kWh reading.',
      },
    ],
    timeline: [
      "01:30 AM: Gaurav connects his phone to the meter's default Wi-Fi hotspot (ESP8266_Config).",
      'The hostel warden sees a zero electricity bill for Room 304 despite heavy AC usage.',
      'Hostel maintenance turns off the corridor lights, leaving the smart meter box unattended.',
      'Gaurav resets the power unit counter of Room 304 back to zero.',
    ],
    hints: [
      'Match the MAC address that connected to the ESP8266 hotspot (A2:44:90:11:7C:02) with the Wi-Fi registry.',
      'Check who lives in Room 304 and was seen near the meter box at 01:29 AM.',
    ],
  },
  {
    id: 'case-15',
    title: 'The Leaked API Key on Public GitHub',
    subtitle: 'Automated Secret Scanning & API Abuse',
    category: 'DevSecOps & Secret Leaks',
    duration: 5,
    icon: 'code',
    color: 'rose',
    briefing:
      "A student team's $50 OpenAI API credit balance was drained to $0.00 within 30 minutes of pushing their hackathon code.",
    incident: 'GitHub commit history, OpenAI usage telemetry, and teammate git logs.',
    evidence: [
      {
        type: 'GIT HISTORY',
        title: 'GitHub Commit History',
        detail: '16:00 PM | Author: swati-ml | File: chatbot.py | Added line: openai.api_key = "sk-proj-9981xYz..."',
      },
      {
        type: 'USAGE LOG',
        title: 'OpenAI Usage Log',
        detail: '16:05 PM – 16:28 PM | 4,200 GPT-4 requests from IP 185.220.101.4 (Frankfurt Botnet Node)',
      },
      {
        type: 'GIT LOG',
        title: 'Teammate Logs',
        detail: 'Teammates Sagar and Nidhi only made local commits and never pushed to GitHub.',
      },
    ],
    suspects: [
      {
        name: 'Swati',
        role: 'ML Developer',
        note: 'I wanted to make our repo public so judges could see it! I forgot my API key was hardcoded in chatbot.py.',
      },
      {
        name: 'Pallavi',
        role: 'Team Lead',
        note: 'I told everyone to use environment variables, not hardcoded strings!',
      },
      {
        name: 'Sagar',
        role: 'Frontend Dev',
        note: 'I only worked on React CSS files locally on my laptop.',
      },
      {
        name: 'Nidhi',
        role: 'UI Designer',
        note: "I don't even have write access to the GitHub repository.",
      },
    ],
    timeline: [
      "Hundreds of API calls are made from an overseas server using Swati's account.",
      '04:00 PM: Developer Swati accidentally uploads her OpenAI API key in a public GitHub commit.',
      'Swati receives an email alert that her $50 API credit balance has hit zero.',
      "Automated bots scan public GitHub repositories and find Swati's exposed key.",
    ],
    hints: [
      'Who authored the 16:00 PM GitHub commit that exposed sk-proj-9981xYz... publicly?',
      'Automated scraper bots find leaked GitHub keys within seconds—check who caused the leak.',
    ],
  },
  {
    id: 'case-16',
    title: 'The Classroom Projector Prank',
    subtitle: 'Wireless Display PINs & Device Hostnames',
    category: 'Wireless & Device Forensics',
    duration: 5,
    icon: 'globe',
    color: 'indigo',
    briefing:
      "During a morning DBMS lecture, the smart classroom projector suddenly hijacked the professor's slides and played a loud Rickroll video.",
    incident: 'Epson smart projector connection log and classroom attendance & seating chart.',
    evidence: [
      {
        type: 'PROJECTOR LOG',
        title: 'Epson Smart Projector Connection Log',
        detail:
          '11:05:14 AM | Miracast Override: "Shreyas-ROG-Strix" (MAC: 6C:2B:59:11:8E:04) | PIN Used: 0000',
      },
      {
        type: 'SEATING CHART',
        title: 'Classroom Attendance & Seating',
        detail: 'Shreyas was seated in the back row with his ASUS ROG Strix gaming laptop open.',
      },
    ],
    suspects: [
      {
        name: 'Shreyas',
        role: '2nd Year CSE',
        note: 'I was just trying to connect to my Bluetooth headphones! My laptop must have cast to the projector by accident!',
      },
      {
        name: 'Dr. Hegde',
        role: 'DBMS Professor',
        note: 'I was connected via HDMI, and suddenly a wireless Miracast session overrode my screen!',
      },
      {
        name: 'Venkatesh',
        role: 'AV Technician',
        note: "We left the projector's default Miracast PIN set to 0000 without moderator approval.",
      },
      {
        name: 'Abhishek',
        role: '2nd Year CSE',
        note: 'I use a Dell Inspiron and was taking notes in my notebook.',
      },
    ],
    timeline: [
      '11:05 AM: Shreyas connects to the open projector screen-share using the default PIN 0000.',
      'Dr. Hegde unplugs the projector power cable and checks the connected device list.',
      'Faculty member Dr. Hegde connects his laptop to the smart projector over Wi-Fi.',
      'A loud Rickroll video suddenly plays on the classroom projector screen.',
    ],
    hints: [
      "Look at the device hostname recorded in the Epson projector's connection log (Shreyas-ROG-Strix).",
      'Miracast requires manually entering the 4-digit PIN (0000)—it does not connect automatically like Bluetooth headphones.',
    ],
  },
  {
    id: 'case-17',
    title: 'The Fake Food Coupon Generator',
    subtitle: 'IDOR (Insecure Direct Object Reference)',
    category: 'Web & Authorization Flaws',
    duration: 5,
    icon: 'database',
    color: 'emerald',
    briefing:
      'Four students who paid for fest tickets found their food coupons marked "Already Redeemed" because someone guessed sequential coupon URLs.',
    incident: 'Web server access log, campus Wi-Fi lease, and food stall CCTV.',
    evidence: [
      {
        type: 'WEB LOG',
        title: 'Web Server Access Log',
        detail:
          '12:40:01 GET /coupon?id=COUPON_105 | IP: 10.18.3.44 • 12:40:08 GET /coupon?id=COUPON_106 | IP: 10.18.3.44 • 12:40:15 GET /coupon?id=COUPON_107 | IP: 10.18.3.44',
      },
      {
        type: 'WIFI LOG',
        title: 'Campus Wi-Fi Lease',
        detail: "IP 10.18.3.44 is assigned to Tarun's Nothing Phone (2).",
      },
      {
        type: 'CCTV',
        title: 'Food Stall CCTV (12:45 PM)',
        detail: 'Tarun scans 4 different QR codes on his phone screen at Counter 1 and collects 4 burgers.',
      },
    ],
    suspects: [
      {
        name: 'Tarun',
        role: '2nd Year ECE',
        note: 'I bought 4 coupons for my friends! Why would I hack a burger coupon?',
      },
      {
        name: 'Kunal',
        role: 'App Developer',
        note: 'I used sequential IDs like COUPON_101 instead of random UUIDs—my bad!',
      },
      {
        name: 'Sneha',
        role: 'Food Stall Volunteer',
        note: 'The scanner app just checks if the coupon ID exists in the database and marks it redeemed.',
      },
      {
        name: 'Vikash',
        role: '3rd Year Civil',
        note: 'My coupon was COUPON_105 and it already showed redeemed when I went at 13:15!',
      },
    ],
    timeline: [
      'Tarun claims four free burgers at the food counter using unissued coupon numbers.',
      'The fest food stall app generates simple numbered QR codes like COUPON_101 and COUPON_102.',
      'Real ticket holders complain that their food coupons show "Already Redeemed."',
      '12:40 PM: Tarun notices the pattern and types COUPON_105 manually into the URL bar on his phone.',
    ],
    hints: [
      'Check which IP address enumerated COUPON_105, 106, and 107 in the web server logs.',
      'Match IP 10.18.3.44 with the Campus Wi-Fi lease and food stall CCTV.',
    ],
  },
  {
    id: 'case-18',
    title: 'The Locked Lab Computers (Ransomware Prank)',
    subtitle: 'BadUSB / Rubber Ducky & Startup Persistence',
    category: 'Hardware Payload & Endpoint Forensics',
    duration: 5,
    icon: 'shield',
    color: 'rose',
    briefing:
      'Every monitor in Computer Lab-03 suddenly turned bright red displaying a fake "YOUR FILES ARE ENCRYPTED" screen after the afternoon break.',
    incident: 'Windows startup folder logs, PC-01 USB event log, and Lab-03 CCTV.',
    evidence: [
      {
        type: 'STARTUP LOG',
        title: 'Windows Startup Folder (All 20 PCs)',
        detail: 'File prank_lock.bat copied from network share \\\\LAB-SERVER\\Public at 15:11 PM.',
      },
      {
        type: 'USB LOG',
        title: 'PC-01 USB Event Log',
        detail: '15:10:04 PM | HID Keyboard Device (VID_1B4F / Arduino Leonardo BadUSB) connected to PC-01',
      },
      {
        type: 'CCTV',
        title: 'Lab-03 CCTV (15:10 PM)',
        detail: 'While the lab was empty during tea break, Bhargav walks up to PC-01, plugs in a small circuit board for 5 seconds, and walks out.',
      },
    ],
    suspects: [
      {
        name: 'Bhargav',
        role: '3rd Year CSE',
        note: 'I only went back into Lab-03 during break to grab my forgotten water bottle!',
      },
      {
        name: 'Manish',
        role: 'Lab Instructor',
        note: 'I restarted all 20 PCs and deleted prank_lock.bat from the shared folder; no files were actually encrypted.',
      },
      {
        name: 'Darshan',
        role: '2nd Year CSE',
        note: 'I was at the canteen having samosas with the whole batch from 15:00 to 15:15.',
      },
      {
        name: 'Spoorthi',
        role: '3rd Year ISE',
        note: 'I sit at PC-18; my screen turned red right when I logged back in at 15:15.',
      },
    ],
    timeline: [
      'A script copies a fake lock-screen program across all 20 PCs over the shared lab folder.',
      'The lab instructor restarts the PCs and finds the batch file in the startup folder.',
      '03:10 PM: Bhargav plugs a USB rubber ducky drive into PC-01 during the lab break.',
      'Every computer monitor in the lab turns red with a fake "Files Encrypted" message.',
    ],
    hints: [
      'Look at the USB event log on PC-01 at 15:10 PM (Arduino BadUSB HID keyboard).',
      'Check who was caught on CCTV plugging a circuit board into PC-01 at 15:10 PM.',
    ],
  },
  {
    id: 'case-19',
    title: 'The Rogue Bluetooth Speaker',
    subtitle: 'Unauthenticated Bluetooth Pairing & MAC Logs',
    category: 'Bluetooth & Proximity Forensics',
    duration: 5,
    icon: 'scan',
    color: 'cyan',
    briefing:
      'Right as the Chief Guest began his keynote speech in the auditorium, loud police siren audio blasted from the main stage Bluetooth speakers.',
    incident: 'JBL PartyBox diagnostic pairing log and auditorium seating chart.',
    evidence: [
      {
        type: 'BLUETOOTH LOG',
        title: 'JBL PartyBox Diagnostic Log',
        detail: '17:25:10 | Paired Device: "Chirag_S23" (BT MAC: 48:2C:A0:99:12:EF) | Audio Stream Started: 17:30:02',
      },
      {
        type: 'SEATING CHART',
        title: 'Auditorium Seating Chart',
        detail: 'Chirag was seated in Row 3 (6 meters from the stage speaker) with his Samsung Galaxy S23.',
      },
    ],
    suspects: [
      {
        name: 'Chirag',
        role: '2nd Year Mech',
        note: "My phone auto-connected to the speaker when I turned on Bluetooth! I didn't play any siren!",
      },
      {
        name: 'Ananya P.',
        role: 'Cultural Lead',
        note: 'Our stage phone disconnected at 17:24, leaving the speaker in open pairing mode.',
      },
      {
        name: 'Roshan',
        role: 'Sound Engineer',
        note: 'I immediately pulled the XLR audio cable and checked the Bluetooth paired list.',
      },
      {
        name: 'Chitra',
        role: 'Faculty Anchor',
        note: 'I was standing at the podium introducing the Chief Guest when the siren went off.',
      },
    ],
    timeline: [
      'Loud siren sounds blast across the auditorium right as the chief guest starts speaking.',
      'The cultural team pairs their phone with the main stage Bluetooth speaker for soundcheck.',
      'The sound engineer checks the speaker and sees Chirag_S23 in the paired list.',
      '05:25 PM: While the stage phone disconnects briefly, Chirag pairs his Samsung phone to the speaker.',
    ],
    hints: [
      'Check the paired device name in the JBL speaker diagnostic log (Chirag_S23).',
      'A brand-new Bluetooth device cannot "auto-connect" without first being manually paired at 17:25 PM.',
    ],
  },
  {
    id: 'case-20',
    title: 'The Stolen Wi-Fi Voucher Codes',
    subtitle: 'Open SMB Shares & Plaintext Credentials',
    category: 'Network Share & Access Forensics',
    duration: 5,
    icon: 'key',
    color: 'amber',
    briefing:
      "Guest speakers at the seminar hall couldn't connect to the high-speed VIP Wi-Fi because all 20 single-use voucher codes had already been redeemed.",
    incident: 'SMB file server audit log, Hostel Block A DHCP log, and WhatsApp chat.',
    evidence: [
      {
        type: 'SMB LOG',
        title: 'SMB File Server Audit Log',
        detail: '11:20:08 AM | File Read: \\\\IT-SHARE\\Public\\vip_vouchers.txt | Client IP: 172.16.4.88',
      },
      {
        type: 'DHCP LOG',
        title: 'Hostel Block A DHCP Log',
        detail: "IP 172.16.4.88 is assigned to Mohit's Dell Laptop.",
      },
      {
        type: 'CHAT LOG',
        title: 'Hostel WhatsApp Group Chat (11:30 AM)',
        detail: 'Mohit: "Selling unlimited 100 Mbps VIP Wi-Fi codes for ₹50! DM fast, 15 left!"',
      },
    ],
    suspects: [
      {
        name: 'Mohit',
        role: '3rd Year CSE',
        note: 'Those ₹50 codes were from my own mobile hotspot data plan, not the IT server!',
      },
      {
        name: 'Sandeep',
        role: 'IT Admin',
        note: 'I accidentally saved vip_vouchers.txt in the public read-only SMB share instead of my private folder.',
      },
      {
        name: 'Kavita',
        role: 'Hospitality Head',
        note: 'I went to print the voucher list at 13:45 and every single code was already active!',
      },
      {
        name: 'Mohan',
        role: '2nd Year Civil',
        note: 'I bought one code from Mohit for ₹50 and it connected to BEC-VIP-5G!',
      },
    ],
    timeline: [
      '11:20 AM: Mohit browses the campus local network and downloads vouchers.txt to his laptop.',
      'Guest speakers arrive at the seminar hall and find all their Wi-Fi codes already used.',
      'The IT admin saves a plain-text file vouchers.txt inside an open shared network folder.',
      'Mohit sells 15 high-speed internet voucher codes to his hostel friends for ₹50 each.',
    ],
    hints: [
      'Trace the client IP that downloaded vip_vouchers.txt at 11:20 AM (172.16.4.88).',
      'Notice Mohan confirmed the ₹50 code he bought from Mohit connected directly to BEC-VIP-5G.',
    ],
  },
  {
    id: 'case-21',
    title: 'The Forged Certificate QR Code',
    subtitle: 'PDF Metadata & QR Verification Integrity',
    category: 'Document & Metadata Forensics',
    duration: 5,
    icon: 'fingerprint',
    color: 'violet',
    briefing:
      'A recruiter flagged a student\'s LinkedIn post after scanning the QR code on his "1st Place Hackathon Winner" certificate and seeing another student\'s name.',
    incident: 'PDF metadata, verification QR URL payload, and LinkedIn post timestamp.',
    evidence: [
      {
        type: 'METADATA',
        title: 'PDF Document Metadata',
        detail: 'File: Winner_Cert_Lokesh.pdf | Created: 16:00 PM (Canva Official) | Modified: 16:30 PM via "iLovePDF Text Editor"',
      },
      {
        type: 'QR PAYLOAD',
        title: 'QR Code Payload URL',
        detail: 'https://avon.bec.edu/verify/cert_8821 → Resolves to: "1st Place: Neha Kulkarni".',
      },
      {
        type: 'SOCIAL LOG',
        title: 'LinkedIn Post Log',
        detail: 'Posted at 16:45 PM by Lokesh M. with caption "Thrilled to win 1st place at Avon!"',
      },
    ],
    suspects: [
      {
        name: 'Lokesh M.',
        role: '3rd Year Mech',
        note: 'The organizing team must have printed the wrong QR code on my winner certificate!',
      },
      {
        name: 'Neha K.',
        role: '3rd Year CSE',
        note: 'I actually won 1st place and posted my certificate in the batch group at 16:05 PM!',
      },
      {
        name: 'Prashanth',
        role: 'Design Lead',
        note: 'Our official certificates are exported directly from Canva and never edited in iLovePDF.',
      },
      {
        name: 'Vikas',
        role: 'Event Head',
        note: "Lokesh wasn't even registered as a finalist in the hackathon.",
      },
    ],
    timeline: [
      'Lokesh uploads the fake certificate to LinkedIn, leaving the original QR link intact.',
      'Event winners receive official digital certificates with a verification QR link.',
      "A recruiter scans the QR code and sees that it belongs to another student's name.",
      '04:30 PM: Lokesh edits his name onto a winner certificate PDF using an online PDF editor.',
    ],
    hints: [
      'Look at the PDF metadata showing modification via iLovePDF Text Editor at 16:30 PM.',
      "The QR code still points to Neha Kulkarni's legitimate certificate ID (cert_8821).",
    ],
  },
  {
    id: 'case-22',
    title: 'The Database Wipe via URL Parameter',
    subtitle: 'Unauthenticated GET Endpoints & Access Logs',
    category: 'Web & Database Forensics',
    duration: 5,
    icon: 'database',
    color: 'rose',
    briefing:
      'All 50 registered teams disappeared from the Avon event database in 10 seconds after someone discovered an unprotected admin delete URL.',
    incident: 'Apache access log, HTML comment in index.html, and hostel Wi-Fi lease.',
    evidence: [
      {
        type: 'ACCESS LOG',
        title: 'Apache Access Log',
        detail:
          '14:27:01 GET /admin/remove_team.php?delete_id=1 | IP: 10.9.3.14 | UA: python-urllib/3.11 • 14:27:02 GET /admin/remove_team.php?delete_id=2 ... through delete_id=50',
      },
      {
        type: 'SOURCE CODE',
        title: 'HTML Comment in Public index.html',
        detail: '<!-- TODO: add auth check to /admin/remove_team.php?delete_id=5 -->',
      },
      {
        type: 'WIFI LOG',
        title: 'Hostel Wi-Fi Lease',
        detail: "IP 10.9.3.14 is assigned to Akash's Lenovo IdeaPad.",
      },
    ],
    suspects: [
      {
        name: 'Akash',
        role: '2nd Year CSE',
        note: "I only pressed Ctrl+U to view the page source! I didn't delete 50 teams!",
      },
      {
        name: 'Deepa',
        role: 'Junior Web Dev',
        note: 'I left that HTML comment in index.html by mistake without adding session checks.',
      },
      {
        name: 'Anil',
        role: 'Event Manager',
        note: 'Fortunately we had a database backup from 14:00 PM so we restored all 50 teams.',
      },
      {
        name: 'Shweta',
        role: '2nd Year ISE',
        note: 'I was in the library reading room; my laptop IP is 10.20.1.9.',
      },
    ],
    timeline: [
      '02:27 PM: Akash runs a loop script that visits delete_id=1 through 50, wiping all team registrations.',
      'The registration page suddenly displays "0 Teams Registered."',
      'A junior developer builds an admin delete link using a simple URL (?delete_id=5).',
      'Akash opens the page source, spots the hidden admin URL, and tests it in his browser.',
    ],
    hints: [
      'Match the IP address running the python-urllib delete loop (10.9.3.14) with the Wi-Fi lease table.',
      'Akash admitted viewing the page source where the delete_id URL comment was hidden.',
    ],
  },
  {
    id: 'case-23',
    title: 'The Deepfake Voice Call Scam',
    subtitle: 'AI Voice Cloning & VoIP Call Logs',
    category: 'Social Engineering & AI Forensics',
    duration: 5,
    icon: 'globe',
    color: 'indigo',
    briefing:
      'The sound equipment vendor delivered all speakers to the wrong campus gate after receiving a phone call that sounded identical to Club Coordinator Anusha.',
    incident: 'Vendor VoIP call log, Cloud AI Voice SaaS audit log, and Anusha’s call history.',
    evidence: [
      {
        type: 'CALL LOG',
        title: 'Vendor Call Log',
        detail: '20:15 PM | Incoming Call from Virtual VoIP Number +91-80-4412-9900 (Caller claimed to be Anusha)',
      },
      {
        type: 'SAAS LOG',
        title: 'Cloud AI Voice SaaS Audit Log',
        detail:
          '20:08 PM | Audio sample "anusha_insta_reel.mp3" uploaded | Account: prateek.ai@gmail.com | IP: 10.12.4.77',
      },
      {
        type: 'CALL HISTORY',
        title: "Anusha's Call History",
        detail: 'Anusha was on a continuous call with the Principal from 20:00 PM to 20:30 PM.',
      },
    ],
    suspects: [
      {
        name: 'Anusha',
        role: 'Club Coordinator',
        note: 'I was talking to the Principal at 20:15 PM! Someone cloned my voice from my Instagram reel!',
      },
      {
        name: 'Prateek',
        role: '3rd Year AI/ML',
        note: 'I only tested an open-source voice cloning model for my seminar presentation!',
      },
      {
        name: 'Mahesh',
        role: 'Sound Vendor',
        note: 'The voice sounded 100% like Anusha, so I unloaded the speakers at Gate 3 like she asked!',
      },
      {
        name: 'Soumya',
        role: '3rd Year CSE',
        note: 'I was at Gate 1 waiting for the vendor truck from 20:00 PM onward.',
      },
    ],
    timeline: [
      '08:15 PM: An attacker clones Anusha’s voice using an AI tool and calls the event vendor.',
      'Club Coordinator Anusha posts a 2-minute speech reel on her public Instagram page.',
      'The real Anusha calls the vendor asking why the speakers haven’t arrived at the main hall.',
      'The fake voice instructs the vendor to deliver the sound equipment to the wrong gate.',
    ],
    hints: [
      'Look at the email address that uploaded anusha_insta_reel.mp3 to the AI voice cloning service at 20:08 PM.',
      'Match prateek.ai@gmail.com with the suspect list.',
    ],
  },
  {
    id: 'case-24',
    title: 'The Hidden Keylogger on the Podium PC',
    subtitle: 'Hardware USB Keyloggers & Physical Access',
    category: 'Hardware & Credential Forensics',
    duration: 5,
    icon: 'key',
    color: 'cyan',
    briefing:
      "After a morning cloud workshop, the guest speaker's AWS sandbox account was accessed from a campus hostel IP to spin up expensive GPU instances.",
    incident: 'Seminar hall CCTV captures and AWS sign-in logs.',
    evidence: [
      {
        type: 'CCTV',
        title: 'Seminar Hall CCTV (08:45 AM)',
        detail:
          'Before the event starts, Suraj reaches behind the podium PC and plugs a small black USB pass-through adapter between the keyboard cable and USB port.',
      },
      {
        type: 'CCTV',
        title: 'Seminar Hall CCTV (13:02 PM)',
        detail: 'During lunch break, Suraj retrieves the black USB adapter from behind the podium PC.',
      },
      {
        type: 'AWS LOG',
        title: 'AWS Sign-In Log',
        detail: "14:15 PM | Successful login from Hostel IP 172.16.9.21 (Assigned to Suraj's Laptop)",
      },
    ],
    suspects: [
      {
        name: 'Suraj',
        role: '2nd Year Mech',
        note: 'I was only fixing a loose keyboard wire behind the podium at 08:45 AM!',
      },
      {
        name: 'Aryan',
        role: 'Workshop Volunteer',
        note: 'I wiped the podium PC hard drive after the event, so there was no malware on Windows.',
      },
      {
        name: 'Nikhita',
        role: '2nd Year CSE',
        note: 'I sat in the second row taking notes during the morning session.',
      },
      {
        name: 'Tarun',
        role: 'AV Coordinator',
        note: "We don't use any black USB adapters on our podium keyboards.",
      },
    ],
    timeline: [
      'The guest speaker types his cloud portal password on the podium keyboard.',
      "Unauthorized logins from Suraj's hostel IP appear on the guest speaker's account.",
      '08:45 AM: Before the workshop starts, Suraj plugs a tiny black USB adapter behind the podium PC.',
      'During lunch break, Suraj returns to the stage and unplugs the hardware keylogger.',
    ],
    hints: [
      'Hardware keyloggers sit physically between the keyboard plug and the PC port—no software is installed on Windows.',
      'Match the CCTV footage at 08:45 AM and 13:02 PM with the AWS login IP (172.16.9.21).',
    ],
  },
  {
    id: 'case-25',
    title: 'The Altered Canteen Balance App',
    subtitle: 'Client-Side Storage (localStorage) Tampering',
    category: 'Client-Side Web Tampering',
    duration: 5,
    icon: 'code',
    color: 'emerald',
    briefing:
      'At the end of the fest, the canteen web app showed ₹1,980 worth of food redeemed by one student who had only paid ₹20 via UPI.',
    incident: 'UPI payment gateway log, canteen redemption log, and frontend JS source.',
    evidence: [
      {
        type: 'PAYMENT LOG',
        title: 'UPI Payment Gateway Log',
        detail: '13:02 PM | Roll 2BA22EC044 (Pradeep) | Amount Paid: ₹20.00',
      },
      {
        type: 'REDEMPTION LOG',
        title: 'Canteen Redemption Log',
        detail:
          '13:12 PM | Roll 2BA22EC044 (Pradeep) | Redeemed ₹2,000 worth of snacks | Reported Wallet Balance: ₹2000',
      },
      {
        type: 'SOURCE CODE',
        title: 'Frontend JS Source (wallet.js)',
        detail: "let balance = localStorage.getItem('user_wallet_bal'); // Trusted directly on checkout!",
      },
    ],
    suspects: [
      {
        name: 'Pradeep',
        role: '3rd Year ECE',
        note: 'The app glitched and showed ₹2,000 in my wallet, so I thought I won a lucky cashback!',
      },
      {
        name: 'Pramod',
        role: 'App Developer',
        note: 'I stored the wallet balance in browser localStorage instead of verifying it on the backend server.',
      },
      {
        name: 'Anusha',
        role: 'Cashier',
        note: 'Pradeep showed his phone screen displaying ₹2,000 balance and ordered 20 burgers and juices!',
      },
      {
        name: 'Rakesh',
        role: '2nd Year Civil',
        note: 'I paid ₹100 via UPI and bought one sandwich at 13:30 PM.',
      },
    ],
    timeline: [
      '01:10 PM: Pradeep opens Chrome Developer Tools on his phone and edits his balance from ₹20 to ₹2000.',
      'The canteen wallet app stores user balance locally inside browser localStorage.',
      'Daily accounting shows ₹1,980 worth of food issued without any actual UPI payment.',
      'Pradeep orders snacks for his entire group using the edited wallet screen.',
    ],
    hints: [
      "Compare Pradeep's actual UPI payment (₹20.00) with his redeemed snacks (₹2,000).",
      'Because wallet.js read the balance from client-side localStorage, Pradeep edited the value in his browser.',
    ],
  },
  {
    id: 'case-26',
    title: 'The Sabotaged Drone Flight Code',
    subtitle: 'File Modification Timestamps & Physical Access',
    category: 'Embedded & File Forensics',
    duration: 5,
    icon: 'footprints',
    color: 'amber',
    briefing:
      "During the autonomous drone race, Team Skyhawk's quadcopter refused to lift off because its target altitude parameter was secretly changed from 5.0 to 0.0.",
    incident: 'microSD card file stat metadata and pit area CCTV.',
    evidence: [
      {
        type: 'FILE STAT',
        title: 'microSD Card File Stat (mission.py)',
        detail: 'Created: 15:00:10 PM | Last Modified: 15:20:44 PM | Diff: TARGET_ALT = 0.0',
      },
      {
        type: 'CCTV',
        title: 'Pit Area CCTV (15:20 PM)',
        detail:
          "While Team Skyhawk is at the judge table getting safety clearance, rival team member Ritesh leans over Skyhawk's workbench with a USB microSD card reader.",
      },
    ],
    suspects: [
      {
        name: 'Ritesh',
        role: 'Rival Drone Pilot',
        note: "I only walked past Skyhawk's table to borrow a screwdriver at 15:20 PM!",
      },
      {
        name: 'Tejas',
        role: 'Skyhawk Coder',
        note: 'I set TARGET_ALT = 5.0 at 15:00 PM and went straight to the judge desk for safety inspection.',
      },
      {
        name: 'Aishwarya',
        role: 'Safety Judge',
        note: 'All three members of Team Skyhawk were standing at my inspection desk from 15:15 to 15:25 PM.',
      },
      {
        name: 'Harish B.',
        role: 'Arena Marshal',
        note: "The drone motors armed normally at 15:30 PM, so it wasn't a battery failure.",
      },
    ],
    timeline: [
      '03:20 PM: While the team goes for testing clearance, Ritesh swaps the altitude value from 5m to 0m.',
      'Checking the SD card file properties shows it was modified during the testing break.',
      "The robotics team uploads their autonomous flight code to the drone's microSD card.",
      'During the live demo, the drone refuses to lift off and spins on the ground.',
    ],
    hints: [
      'Check the Last Modified timestamp on mission.py (15:20:44 PM).',
      "Match 15:20 PM with the pit area CCTV showing Ritesh holding a microSD card reader at Skyhawk's table.",
    ],
  },
  {
    id: 'case-27',
    title: 'The Fake College Wi-Fi Login Page',
    subtitle: 'Evil Twin Captive Portal & MAC OUI',
    category: 'Wireless Evil Twin Forensics',
    duration: 5,
    icon: 'scan',
    color: 'rose',
    briefing:
      'Twelve students near the main canteen lost access to their ERP accounts after logging into a fake Wi-Fi portal named BEC_Campus_Free_5G.',
    incident: 'Wi-Fi analyzer capture, campus network registry, and canteen CCTV.',
    evidence: [
      {
        type: 'WIRELESS',
        title: 'Wi-Fi Analyzer Capture',
        detail: 'Rogue SSID BEC_Campus_Free_5G broadcasting on Channel 6 | BSSID: B4:2E:99:10:44:88.',
      },
      {
        type: 'REGISTRY',
        title: 'Campus Network Registry',
        detail:
          "Official campus Wi-Fi is named BEC-Student-WiFi (Cisco APs). MAC B4:2E:99:10:44:88 belongs to Nikhil's Lenovo Legion Laptop.",
      },
      {
        type: 'CCTV',
        title: 'Canteen CCTV (10:15 AM)',
        detail: 'Nikhil is seated at a corner table with an external Alfa USB Wi-Fi antenna attached to his laptop.',
      },
    ],
    suspects: [
      {
        name: 'Nikhil',
        role: '3rd Year CSE',
        note: "I was just using my Alfa Wi-Fi adapter to get better canteen signal! I didn't host a fake portal.",
      },
      {
        name: 'Rhea',
        role: 'Network Admin',
        note: 'We never use the SSID BEC_Campus_Free_5G; that was a rogue captive portal!',
      },
      {
        name: 'Manoj B.',
        role: '2nd Year Civil',
        note: 'I connected to BEC_Campus_Free_5G at 10:20 AM, typed my ERP password, and got zero internet!',
      },
      {
        name: 'Anup',
        role: '1st Year ECE',
        note: 'I was in physics lab from 09:00 AM to 12:00 PM.',
      },
    ],
    timeline: [
      'Nikhil captures the saved passwords in a text file on his laptop.',
      '10:15 AM: Nikhil sets up a fake hotspot named BEC_Campus_Free_5G near the main canteen.',
      'Students notice they have no internet access even after logging into the fake portal.',
      'Twelve students connect to the fake Wi-Fi and type their college roll number and password.',
    ],
    hints: [
      'Match the rogue BSSID MAC address (B4:2E:99:10:44:88) in the Campus Network Registry.',
      'Check who was seen on canteen CCTV at 10:15 AM using an external USB Wi-Fi antenna.',
    ],
  },
  {
    id: 'case-28',
    title: 'The Hijacked Smart Notice Board',
    subtitle: 'Default SSH Credentials (pi/raspberry)',
    category: 'IoT & Default Credentials',
    duration: 5,
    icon: 'shield',
    color: 'violet',
    briefing:
      'The digital lobby display screen suddenly replaced the seminar schedule with a giant red banner reading "TOMORROW IS A HOLIDAY".',
    incident: 'Raspberry Pi auth log, bash history, and lobby Wi-Fi DHCP lease.',
    evidence: [
      {
        type: 'AUTH LOG',
        title: 'Raspberry Pi Auth Log (/var/log/auth.log)',
        detail: '16:25:04 | Accepted password for pi from 192.168.12.71 (Default password "raspberry" used)',
      },
      {
        type: 'BASH HISTORY',
        title: 'Bash History on Notice Board Pi',
        detail: 'scp darshan@192.168.12.71:~/holiday.png /home/pi/display/banner.png',
      },
      {
        type: 'WIFI LOG',
        title: 'Lobby Wi-Fi Lease',
        detail: "IP 192.168.12.71 is assigned to Darshan's HP Pavilion.",
      },
    ],
    suspects: [
      {
        name: 'Darshan',
        role: '2nd Year CSE',
        note: "I was just running an Nmap scan on the lobby Wi-Fi to practice networking! I didn't change the screen!",
      },
      {
        name: 'Charan',
        role: 'IoT Club Lead',
        note: 'We forgot to change the default pi / raspberry SSH login when mounting the lobby screen.',
      },
      {
        name: 'Pooja M.',
        role: 'Office Clerk',
        note: 'I update the notice board using a USB stick, never SSH or Linux commands.',
      },
      {
        name: 'Dinesh',
        role: '3rd Year Mech',
        note: 'I left campus at 15:30 PM on the early bus.',
      },
    ],
    timeline: [
      '04:25 PM: Darshan scans the local Wi-Fi, logs into the Raspberry Pi, and replaces the notice image.',
      'The HOD walks past the lobby screen and calls the IT department immediately.',
      'The digital notice board in the lobby runs on a Raspberry Pi with default SSH credentials.',
      'The lobby screen suddenly displays "Tomorrow is a Holiday" in giant red letters.',
    ],
    hints: [
      "Look at the scp command in the Raspberry Pi's bash history (darshan@192.168.12.71).",
      'Match IP 192.168.12.71 with the Lobby Wi-Fi lease table.',
    ],
  },
  {
    id: 'case-29',
    title: 'The Leaked Judge Score Sheet',
    subtitle: 'Windows USB Registry Forensics',
    category: 'Windows Registry & USB Forensics',
    duration: 5,
    icon: 'fingerprint',
    color: 'cyan',
    briefing:
      'Confidential final scores for the hackathon leaked into a participant WhatsApp group 15 minutes before the prize ceremony.',
    incident: 'Windows USBSTOR registry log, file access log, and seminar hall CCTV.',
    evidence: [
      {
        type: 'REGISTRY',
        title: 'Windows USBSTOR Registry Log (Seminar PC)',
        detail: '17:25:18 PM | USB Device Mounted: SanDisk Ultra 32GB | Volume Label: "TEJAS_USB"',
      },
      {
        type: 'FILE LOG',
        title: 'File Access Log',
        detail: '17:25:40 PM | C:\\Users\\Judges\\Desktop\\Final_Scores.xlsx copied to E:\\Final_Scores.xlsx',
      },
      {
        type: 'CCTV',
        title: 'Seminar Hall CCTV (17:25 PM)',
        detail: 'While judges are outside having coffee, Tejas walks up to the podium pretending to adjust a loose HDMI cable.',
      },
    ],
    suspects: [
      {
        name: 'Tejas',
        role: 'Team Falcon Lead',
        note: "The projector was flickering, so I walked up to check the HDMI cable! I didn't touch the mouse!",
      },
      {
        name: 'Rohan K.',
        role: 'Stage Volunteer',
        note: 'I was outside serving coffee to the judges from 17:15 to 17:35 PM.',
      },
      {
        name: 'Shashank',
        role: 'Panel Judge',
        note: 'We saved Final_Scores.xlsx on the desktop at 17:10 PM and stepped out for coffee.',
      },
      {
        name: 'Keerthi',
        role: 'Anchor',
        note: "I was backstage practicing the winners' announcement script with cue cards.",
      },
    ],
    timeline: [
      "Tejas shares photos of the judges' secret scores in his team's private WhatsApp group.",
      'The hackathon judges save their final Excel score sheet on the seminar hall desktop.',
      'Windows USB history confirms a SanDisk drive was connected during the break.',
      '05:25 PM: Tejas plugs his USB drive into the desktop PC while pretending to adjust the HDMI cable.',
    ],
    hints: [
      'Look at the USB volume label recorded in the Windows registry (TEJAS_USB).',
      'Match the copy timestamp (17:25:40 PM) with the CCTV footage of Tejas at the podium.',
    ],
  },
  {
    id: 'case-30',
    title: 'The Automated Ticket Scalping Bot',
    subtitle: 'Session Cookies & Automated Request Floods',
    category: 'Automation & Web Abuse Forensics',
    duration: 5,
    icon: 'sun',
    color: 'indigo',
    briefing:
      'All 30 VIP front-row passes for the Avon concert night sold out in 3 seconds, with every pass booked under a single session ID.',
    incident: 'Web server access log and Hostel Block C DHCP lease log.',
    evidence: [
      {
        type: 'WEB LOG',
        title: 'Web Server Access Log',
        detail:
          '19:00:00 – 19:00:03 | 30 POST /book_vip requests | Cookie: session_id=usr_chetan_881 | UA: Python-Selenium/4.18',
      },
      {
        type: 'DHCP LOG',
        title: 'Hostel Block C DHCP Log',
        detail: "Request source IP 10.5.19.33 is assigned to Chetan's Asus VivoBook.",
      },
    ],
    suspects: [
      {
        name: 'Chetan',
        role: '3rd Year CSE',
        note: 'I just clicked F5 really fast at 19:00 PM! I only wanted 1 pass for myself!',
      },
      {
        name: 'Advait',
        role: 'Ticketing Dev',
        note: "We didn't limit bookings per session ID or add a CAPTCHA, so a Selenium script grabbed all 30!",
      },
      {
        name: 'Meera',
        role: 'Cultural Convenor',
        note: 'I was on stage announcing that ticket registrations were live at 19:00 PM.',
      },
      {
        name: 'Devansh K.',
        role: '2nd Year ISE',
        note: 'I opened the link at 19:01 PM and all 30 VIP passes were already gone!',
      },
    ],
    timeline: [
      '07:00 PM: The ticket booking website opens, and Chetan’s script submits 30 bookings in 3 seconds.',
      'Server logs show 30 bookings came from the exact same browser session ID.',
      'Two minutes before concert tickets go live, Chetan runs a Python auto-clicker script.',
      'Regular students see "Sold Out" within sixty seconds of the launch.',
    ],
    hints: [
      'Look at the session cookie (session_id=usr_chetan_881) and User-Agent (Python-Selenium) in the server logs.',
      'Match source IP 10.5.19.33 with the Hostel Block C DHCP log.',
    ],
  },
];
