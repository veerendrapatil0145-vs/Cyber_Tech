export interface CaseAnswerKey {
  caseId: string;
  correctTimeline: string[];
  keyEvidenceIndices: number[];
  culpritKeywords: string[];
  evidenceKeywords: string[];
  debriefNotes: string[];
  maxHints?: number;
}

export const caseAnswerKeys: Record<string, CaseAnswerKey> = {
  'case-01': {
    caseId: 'case-01',
    maxHints: 2,
    correctTimeline: [
      'Lab Assistant Aarav scans his biometric ID and leaves the CS block.',
      'Rohan sits near the canteen Wi-Fi router and opens his Windows laptop.',
      '11:42 PM: The OS mid-semester question paper PDF is downloaded from the HOD portal.',
      'The leaked question paper appears on a public Telegram channel.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['rohan'],
    evidenceKeywords: [
      '192.168.14.88',
      '192.168.14',
      'canteen',
      'wi-fi',
      'wifi',
      'windows',
      'windows nt 10.0',
      'dhcp',
      'macbook',
      'os_midsem',
      'chrome',
      'router',
    ],
    debriefNotes: [
      'Culprit: Rohan — Connected to campus local Wi-Fi (192.168.14.88) at the canteen on a Windows laptop at the exact download timestamp.',
      'DHCP logs assign 192.168.14.1–254 exclusively to Campus & Hostel Wi-Fi, while Sneha pushed from a MacBook (MacIntel).',
    ],
  },
  'case-02': {
    caseId: 'case-02',
    maxHints: 2,
    correctTimeline: [
      'Karthik accidentally pushes his secret GitHub access token inside the .env file.',
      '02:15 AM: Vikram borrows a 65W laptop charger from the volunteer desk.',
      "Vikram clones the leading team's repository and copies their secret token.",
      "The team's main code branch is wiped clean using a force push.",
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['vikram'],
    evidenceKeywords: [
      'vikram_codes',
      'pat',
      'token',
      '.env',
      'charger',
      '65w',
      'usb-c',
      'force',
      'clone',
      '03:12',
      '03:17',
      'backend_deploy',
    ],
    debriefNotes: [
      "Culprit: Vikram — Lied about not having a charger, cloned the repo at 03:12 AM, and used Karthik's leaked PAT in .env to force-push wipe the code.",
      'Volunteer desk logs confirm Vikram borrowed a 65W USB-C charger at 02:15 AM and returned it at 03:45 AM.',
    ],
  },
  'case-03': {
    caseId: 'case-03',
    maxHints: 2,
    correctTimeline: [
      'Class Rep Rahul collects the attendance sheets and hands them to Prof. Sharma.',
      "04:05 PM: Someone tries to log into Prof. Sharma's ERP account twice with the wrong password.",
      'The attacker resets the password using the pet name "Bruno" from a browser with CR bookmarks.',
      "Aditya's attendance is manually updated from 42% to 85% in the database.",
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['rahul'],
    evidenceKeywords: [
      'bruno',
      'instagram',
      'osint',
      'security question',
      'reset',
      'cr',
      'bec_cr_notices',
      'attendance_upload',
      'bookmark',
      'aditya',
      '85%',
      'prof_sharma',
    ],
    debriefNotes: [
      'Culprit: Rahul — Used OSINT from Prof. Sharma\'s Instagram ("Bruno") to reset the password and modified Aditya\'s attendance using his CR laptop.',
      'Browser bookmarks BEC_CR_Notices and Attendance_Upload tied the reset directly to the Class Representative browser profile.',
    ],
  },
  'case-04': {
    caseId: 'case-04',
    maxHints: 2,
    correctTimeline: [
      'Pooja submits her coding solution and walks over to the exit door.',
      'Tanmay plugs in a blue USB drive and boots a live Linux OS right below the router.',
      '09:14 PM: A flood of disconnect signals hits the lab Wi-Fi from a laptop within 3 meters of the router.',
      'The lab Wi-Fi crashes and disconnects all 40 participants.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['tanmay'],
    evidenceKeywords: [
      'kali',
      'kali-live-usb',
      'usb',
      'pendrive',
      'deauth',
      '-32',
      'rssi',
      'dbm',
      'ap-lab04',
      '98:e7:f4:22:10:8a',
      'jam',
      'desk a1',
    ],
    debriefNotes: [
      'Culprit: Tanmay — Sat directly beneath the router and booted a Kali Live USB (98:E7:F4:22:10:8A) to jam the Wi-Fi.',
      'Signal strength (-32 dBm) places the source within 3 meters of AP-LAB04, matching Desk A1 on Lab-04 CCTV.',
    ],
  },
  'case-05': {
    caseId: 'case-05',
    maxHints: 2,
    correctTimeline: [
      'Manoj logs into the Canteen Free Wi-Fi on his device.',
      '01:45 PM: The fake lookalike website bec-placemnts.in is registered online.',
      'Fake internship shortlist emails are sent out to students from the canteen IP address.',
      'Manoj messages the class group telling everyone to open the link quickly.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['manoj'],
    evidenceKeywords: [
      'manoj_k',
      'dev_manoj99',
      '103.21.58.190',
      'canteen',
      'wi-fi',
      'wifi',
      'whois',
      'bec-placemnts',
      'typosquat',
      'phish',
      'x-originating-ip',
      'whatsapp',
    ],
    debriefNotes: [
      'Culprit: Manoj — Registered the typosquatted domain and dispatched the phishing emails from Canteen Wi-Fi before hyping the link on WhatsApp.',
      "Both the WHOIS handle (dev_manoj99) and X-Originating-IP (103.21.58.190) match Manoj's canteen Wi-Fi session.",
    ],
  },
  'case-06': {
    caseId: 'case-06',
    maxHints: 2,
    correctTimeline: [
      'The Deep Learning lab officially closes and the biometric door locks for the night.',
      '08:45 PM: Nithin logs into LAB-GPU-03 remotely over SSH using his student ID.',
      'A hidden mining script starts running in the background and pushes GPU usage to 99%.',
      'The server temperature crosses 88°C and triggers a thermal overheat alert.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['nithin'],
    evidenceKeywords: [
      'dev_nithin',
      '172.16.5.44',
      'ssh',
      'xmrig',
      'xmrig_miner',
      'cron',
      'hostel',
      'hostel-block-b',
      '/tmp/.hidden',
      'crypto',
      '20:45',
      '20:47',
    ],
    debriefNotes: [
      'Culprit: Nithin — Logged in from his own hostel IP (172.16.5.44) and deployed the miner under his own user account before feigning ignorance on Slack.',
      'The file owner (dev_nithin) and birth timestamp (20:47:08) align with his SSH login two minutes earlier.',
    ],
  },
  'case-07': {
    caseId: 'case-07',
    maxHints: 2,
    correctTimeline: [
      "Kiran uses his laptop inside the library to inspect the quiz website's network requests.",
      '03:58 PM: Kiran sends a fake POST request claiming a perfect score of 100/100 in just 4 seconds.',
      'The server accepts the unverified score and puts Kiran at #1 on the leaderboard.',
      'The online quiz timer ends and the final results lock.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['kiran'],
    evidenceKeywords: [
      'kiran_07',
      'postman',
      'postmanruntime',
      '10.20.4.18',
      'library',
      'dhcp',
      'devtools',
      'post',
      '/api/v1/submit',
      '100',
      '4 seconds',
    ],
    debriefNotes: [
      'Culprit: Kiran — Intercepted the submission endpoint in the library and sent a forged POST request via Postman to claim 100/100.',
      'Both the API gateway User-Agent (PostmanRuntime/7.39) and Library Wi-Fi IP (10.20.4.18) match Kiran.',
    ],
  },
  'case-08': {
    caseId: 'case-08',
    maxHints: 2,
    correctTimeline: [
      'Treasurer Varun leaves his unlocked laptop on the fest desk while going to buy tea.',
      "Pranav sits at Varun's laptop and adds a fake vendor account in the payment portal.",
      "10:05 AM: Pranav approves a ₹25,000 transfer from Varun's browser session to his own UPI ID.",
      'Varun returns to his desk and notices the missing money alert.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['pranav'],
    evidenceKeywords: [
      'pranav.99@okicici',
      'pranav.99',
      'upi',
      'techsupplies_blr',
      'varun_chrome',
      'unlocked',
      'cctv',
      '10:04',
      '10:05',
      '192.168.1.50',
      '25,000',
      '25000',
    ],
    debriefNotes: [
      "Culprit: Pranav — Used Varun's unlocked browser session to add his own UPI ID as a vendor and transfer ₹25,000.",
      'CCTV places Pranav alone at Varun’s chair from 10:03 AM to 10:06 AM, spanning both beneficiary creation and transfer.',
    ],
  },
  'case-09': {
    caseId: 'case-09',
    maxHints: 2,
    correctTimeline: [
      'Club President Tara leaves her phone on the auditorium stage during rehearsal.',
      "06:15 PM: Sahil opens the OTP SMS on Tara's phone and logs into the club Instagram on his iPhone.",
      'Sahil removes Tara’s email from the account and posts a fake event cancellation notice.',
      'Students start panicking and messaging the club group about the cancelled fest.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['sahil'],
    evidenceKeywords: [
      "sahil's iphone 14",
      'iphone 14',
      'sahil.dark@gmail.com',
      'otp',
      'sms',
      'lockscreen',
      'backstage',
      'cctv',
      '18:14',
      '18:15',
      'recovery email',
    ],
    debriefNotes: [
      "Culprit: Sahil — Read the SMS OTP from Tara's unattended phone lockscreen, logged in on his iPhone, and changed the recovery email.",
      'Backstage CCTV shows Sahil reading Tara’s lockscreen notification at 18:14 PM—one minute before login from "Sahil\'s iPhone 14".',
    ],
  },
  'case-10': {
    caseId: 'case-10',
    maxHints: 2,
    correctTimeline: [
      'Teammate Omkar shares his screen on Discord with his AWS secret keys visible in VS Code.',
      '10:30 PM: Rival student Vivek logs into the AWS account from his hostel room using those leaked keys.',
      "Vivek permanently deletes the project's cloud storage bucket (final-year-ml-data).",
      'The project team tries to run their demo and gets a "Bucket Not Found" error.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['vivek'],
    evidenceKeywords: [
      '10.14.8.92',
      'room 112',
      'cloudtrail',
      'deletebucket',
      'final-year-ml-data',
      'aws_secret_access_key',
      'discord',
      'akiaiosfodnn7example',
      'iam',
      's3',
      '22:32',
    ],
    debriefNotes: [
      "Culprit: Vivek — Copied Omkar's AWS keys from the Discord stream and deleted the S3 bucket from his hostel room (10.14.8.92).",
      'Hostel Block A DHCP records map CloudTrail SourceIP 10.14.8.92 directly to Vivek in Room 112.',
    ],
  },
  'case-11': {
    caseId: 'case-11',
    maxHints: 2,
    correctTimeline: [
      'Yash walks past the library turnstile with a hidden RFID scanner inside his backpack.',
      "02:01 PM: Yash's scanner copies the card ID number of Senior Student Arjun.",
      'Yash walks into the library using the cloned card ID while Arjun is at the sports ground.',
      "Three rare GATE exam books are checked out under Arjun's library account.",
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['yash'],
    evidenceKeywords: [
      'rfid',
      'rc522',
      '8f-22-19-b4',
      'cloned',
      'clone',
      'skim',
      '14:01',
      'football',
      'gate',
      'backpack',
      'blank',
      'cctv',
    ],
    debriefNotes: [
      "Culprit: Yash — Skimmed Arjun's RFID card UID at 14:01 PM using his RC522 module and cloned it onto a blank card to check out books.",
      'Sports ground CCTV proves Arjun was playing football at 18:30 PM when the cloned card scanned at the library.',
    ],
  },
  'case-12': {
    caseId: 'case-12',
    maxHints: 2,
    correctTimeline: [
      'The placement coordinator uploads the shortlist CSV file to a shared Google Drive folder.',
      "12:20 PM: Someone opens the file and types Abhishek's USN into Row 14 using a Linux computer.",
      'The updated shortlist is downloaded by the HR team for afternoon interviews.',
      'The coordinator notices an extra student sitting in the interview waiting room.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['abhishek'],
    evidenceKeywords: [
      'ubuntu',
      'linux',
      'x86_64',
      'lab-01',
      '2ba22cs009',
      'row 14',
      'placement_guest_link',
      'google drive',
      'revision',
      '12:20',
      'dual-boot',
    ],
    debriefNotes: [
      'Culprit: Abhishek — Exploited the open edit permissions on the Drive link from his Ubuntu session in Lab-01 to insert his own USN.',
      'The OS fingerprint (Ubuntu Linux x86_64) in Google Drive revisions matches only Abhishek’s active Lab-01 login at 12:20 PM.',
    ],
  },
  'case-13': {
    caseId: 'case-13',
    maxHints: 2,
    correctTimeline: [
      'Student Secretary Naveen submits the official room booking request from his hostel room.',
      '09:32 AM: A fake email pretending to be from the Dean is sent using an online email-spoofing tool.',
      'The security guard receives the fake email approving the auditorium for the esports club.',
      'The esports club sets up their gaming PCs inside the main auditorium.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['naveen'],
    evidenceKeywords: [
      '10.12.4.77',
      'emkei-spoof.cz',
      'emkei',
      'spf',
      'fail',
      'return-path',
      'dean@bec.edu',
      'dns',
      '09:30',
      '09:31',
      '09:32',
      'spoof',
    ],
    debriefNotes: [
      "Culprit: Naveen — Used an online email-spoofing tool from his IP (10.12.4.77) to forge the Dean's approval and trick the security guard.",
      'Firewall DNS logs show 10.12.4.77 querying emkei-spoof.cz at 09:31 AM right after Naveen submitted his booking request.',
    ],
  },
  'case-14': {
    caseId: 'case-14',
    maxHints: 2,
    correctTimeline: [
      'Hostel maintenance turns off the corridor lights, leaving the smart meter box unattended.',
      "01:30 AM: Gaurav connects his phone to the meter's default Wi-Fi hotspot (ESP8266_Config).",
      'Gaurav resets the power unit counter of Room 304 back to zero.',
      'The hostel warden sees a zero electricity bill for Room 304 despite heavy AC usage.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['gaurav'],
    evidenceKeywords: [
      'a2:44:90:11:7c:02',
      'esp8266',
      'esp8266_config',
      'admin/admin',
      'reset_kwh',
      'room 304',
      'oneplus 11',
      '01:29',
      '01:30',
      '0.0 kwh',
      'mac',
    ],
    debriefNotes: [
      "Culprit: Gaurav — Connected to the smart meter's unprotected ESP8266_Config Wi-Fi from his phone and reset Room 304's usage counter.",
      'MAC A2:44:90:11:7C:02 in the meter serial log belongs to Gaurav’s OnePlus 11, matching corridor CCTV at 01:29 AM.',
    ],
  },
  'case-15': {
    caseId: 'case-15',
    maxHints: 2,
    correctTimeline: [
      '04:00 PM: Developer Swati accidentally uploads her OpenAI API key in a public GitHub commit.',
      "Automated bots scan public GitHub repositories and find Swati's exposed key.",
      "Hundreds of API calls are made from an overseas server using Swati's account.",
      'Swati receives an email alert that her $50 API credit balance has hit zero.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['swati'],
    evidenceKeywords: [
      'swati-ml',
      'chatbot.py',
      'sk-proj-9981xyz',
      'openai',
      'github',
      'hardcoded',
      'public',
      '185.220.101.4',
      'bot',
      '16:00',
      '4,200',
    ],
    debriefNotes: [
      'Culprit: Swati (Accidental Leak) — Hardcoded and pushed the live OpenAI key into a public repository, allowing automated scrapers to drain the credits.',
      'Teammates Sagar and Nidhi never pushed to GitHub; automated bots scraped chatbot.py immediately after Swati’s 16:00 commit.',
    ],
  },
  'case-16': {
    caseId: 'case-16',
    maxHints: 2,
    correctTimeline: [
      'Faculty member Dr. Hegde connects his laptop to the smart projector over Wi-Fi.',
      '11:05 AM: Shreyas connects to the open projector screen-share using the default PIN 0000.',
      'A loud Rickroll video suddenly plays on the classroom projector screen.',
      'Dr. Hegde unplugs the projector power cable and checks the connected device list.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['shreyas'],
    evidenceKeywords: [
      'shreyas-rog-strix',
      'rog strix',
      '0000',
      'miracast',
      '6c:2b:59:11:8e:04',
      'pin',
      'epson',
      'back row',
      '11:05',
      'hostname',
    ],
    debriefNotes: [
      'Culprit: Shreyas — Manually paired his ASUS ROG Strix laptop to the projector using the default PIN 0000 to play the prank video.',
      'Miracast requires manual PIN entry (0000) and logged the exact device hostname Shreyas-ROG-Strix.',
    ],
  },
  'case-17': {
    caseId: 'case-17',
    maxHints: 2,
    correctTimeline: [
      'The fest food stall app generates simple numbered QR codes like COUPON_101 and COUPON_102.',
      '12:40 PM: Tarun notices the pattern and types COUPON_105 manually into the URL bar on his phone.',
      'Tarun claims four free burgers at the food counter using unissued coupon numbers.',
      'Real ticket holders complain that their food coupons show "Already Redeemed."',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['tarun'],
    evidenceKeywords: [
      '10.18.3.44',
      'coupon_105',
      'coupon_106',
      'coupon_107',
      'idor',
      'sequential',
      'nothing phone',
      '12:40',
      '12:45',
      'qr',
      'burger',
    ],
    debriefNotes: [
      "Culprit: Tarun — Exploited sequential IDOR coupon URLs from his phone (10.18.3.44) to redeem other students' meal vouchers.",
      'Web access logs show 10.18.3.44 enumerating COUPON_105–107 five minutes before Tarun scanned 4 QR codes on Counter 1 CCTV.',
    ],
  },
  'case-18': {
    caseId: 'case-18',
    maxHints: 2,
    correctTimeline: [
      '03:10 PM: Bhargav plugs a USB rubber ducky drive into PC-01 during the lab break.',
      'A script copies a fake lock-screen program across all 20 PCs over the shared lab folder.',
      'Every computer monitor in the lab turns red with a fake "Files Encrypted" message.',
      'The lab instructor restarts the PCs and finds the batch file in the startup folder.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['bhargav'],
    evidenceKeywords: [
      'badusb',
      'rubber ducky',
      'arduino',
      'leonardo',
      'vid_1b4f',
      'prank_lock.bat',
      'pc-01',
      '15:10',
      '15:11',
      'startup',
      'cctv',
    ],
    debriefNotes: [
      'Culprit: Bhargav — Used an Arduino BadUSB device on PC-01 during break to deploy a fake ransomware batch script across the shared lab folder.',
      'USB event logs recorded an Arduino Leonardo HID keyboard (VID_1B4F) at 15:10:04 PM while CCTV caught Bhargav plugging a circuit board into PC-01.',
    ],
  },
  'case-19': {
    caseId: 'case-19',
    maxHints: 2,
    correctTimeline: [
      'The cultural team pairs their phone with the main stage Bluetooth speaker for soundcheck.',
      '05:25 PM: While the stage phone disconnects briefly, Chirag pairs his Samsung phone to the speaker.',
      'Loud siren sounds blast across the auditorium right as the chief guest starts speaking.',
      'The sound engineer checks the speaker and sees Chirag_S23 in the paired list.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['chirag'],
    evidenceKeywords: [
      'chirag_s23',
      '48:2c:a0:99:12:ef',
      'bluetooth',
      'jbl',
      'partybox',
      '17:25',
      '17:30',
      's23',
      'row 3',
      'paired',
    ],
    debriefNotes: [
      'Culprit: Chirag — Manually paired his Samsung Galaxy S23 to the open stage speaker at 17:25 PM and streamed the siren sound during the speech.',
      'A new device cannot "auto-connect" without first completing manual pairing at 17:25:10 as logged by JBL PartyBox.',
    ],
  },
  'case-20': {
    caseId: 'case-20',
    maxHints: 2,
    correctTimeline: [
      'The IT admin saves a plain-text file vouchers.txt inside an open shared network folder.',
      '11:20 AM: Mohit browses the campus local network and downloads vouchers.txt to his laptop.',
      'Mohit sells 15 high-speed internet voucher codes to his hostel friends for ₹50 each.',
      'Guest speakers arrive at the seminar hall and find all their Wi-Fi codes already used.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['mohit'],
    evidenceKeywords: [
      '172.16.4.88',
      'vip_vouchers.txt',
      'vouchers',
      'smb',
      'it-share',
      'bec-vip-5g',
      '11:20',
      'whatsapp',
      'mohan',
      'dell',
    ],
    debriefNotes: [
      'Culprit: Mohit — Downloaded the plaintext vip_vouchers.txt file from the open SMB network share (172.16.4.88) and sold the codes on WhatsApp.',
      'DHCP maps 172.16.4.88 to Mohit’s Dell laptop, and Mohan verified the purchased ₹50 code connected directly to BEC-VIP-5G.',
    ],
  },
  'case-21': {
    caseId: 'case-21',
    maxHints: 2,
    correctTimeline: [
      'Event winners receive official digital certificates with a verification QR link.',
      '04:30 PM: Lokesh edits his name onto a winner certificate PDF using an online PDF editor.',
      'Lokesh uploads the fake certificate to LinkedIn, leaving the original QR link intact.',
      "A recruiter scans the QR code and sees that it belongs to another student's name.",
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['lokesh'],
    evidenceKeywords: [
      'ilovepdf',
      'cert_8821',
      'qr',
      'metadata',
      'canva',
      'neha',
      '16:30',
      'linkedin',
      'winner_cert_lokesh.pdf',
    ],
    debriefNotes: [
      "Culprit: Lokesh M. — Took Neha's shared winner PDF, overwrote her name with his own using an online PDF editor, and forgot the QR code still verified Neha.",
      'PDF metadata shows modification at 16:30 PM in "iLovePDF Text Editor", whereas official certificates only come from Canva.',
    ],
  },
  'case-22': {
    caseId: 'case-22',
    maxHints: 2,
    correctTimeline: [
      'A junior developer builds an admin delete link using a simple URL (?delete_id=5).',
      'Akash opens the page source, spots the hidden admin URL, and tests it in his browser.',
      '02:27 PM: Akash runs a loop script that visits delete_id=1 through 50, wiping all team registrations.',
      'The registration page suddenly displays "0 Teams Registered."',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['akash'],
    evidenceKeywords: [
      '10.9.3.14',
      'python-urllib',
      'urllib',
      'remove_team.php',
      'delete_id',
      'html comment',
      'index.html',
      'ctrl+u',
      '14:27',
      '50',
    ],
    debriefNotes: [
      'Culprit: Akash — Found the unauthenticated delete endpoint in the HTML source comments and ran a Python loop from IP 10.9.3.14 to wipe all 50 records.',
      'Apache logs confirm python-urllib/3.11 iterated delete_id=1..50 from Akash’s assigned hostel IP 10.9.3.14.',
    ],
  },
  'case-23': {
    caseId: 'case-23',
    maxHints: 2,
    correctTimeline: [
      'Club Coordinator Anusha posts a 2-minute speech reel on her public Instagram page.',
      '08:15 PM: An attacker clones Anusha’s voice using an AI tool and calls the event vendor.',
      'The fake voice instructs the vendor to deliver the sound equipment to the wrong gate.',
      'The real Anusha calls the vendor asking why the speakers haven’t arrived at the main hall.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['prateek'],
    evidenceKeywords: [
      'prateek.ai@gmail.com',
      'anusha_insta_reel.mp3',
      'voip',
      'deepfake',
      'voice cloning',
      '10.12.4.77',
      '20:08',
      '20:15',
      'principal',
      'instagram',
    ],
    debriefNotes: [
      "Culprit: Prateek — Downloaded Anusha's public Instagram reel, cloned her voice using his AI account, and spoofed a VoIP call to mislead the vendor.",
      'SaaS logs prove prateek.ai@gmail.com uploaded anusha_insta_reel.mp3 at 20:08 PM—seven minutes before the VoIP call while Anusha was speaking with the Principal.',
    ],
  },
  'case-24': {
    caseId: 'case-24',
    maxHints: 2,
    correctTimeline: [
      '08:45 AM: Before the workshop starts, Suraj plugs a tiny black USB adapter behind the podium PC.',
      'The guest speaker types his cloud portal password on the podium keyboard.',
      'During lunch break, Suraj returns to the stage and unplugs the hardware keylogger.',
      "Unauthorized logins from Suraj's hostel IP appear on the guest speaker's account.",
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['suraj'],
    evidenceKeywords: [
      'keylogger',
      'hardware',
      '172.16.9.21',
      'usb',
      'pass-through',
      'adapter',
      '08:45',
      '13:02',
      '14:15',
      'podium',
      'cctv',
    ],
    debriefNotes: [
      'Culprit: Suraj — Planted a hardware USB keylogger on the podium keyboard before the workshop, retrieved it at lunch, and logged in from his hostel IP.',
      'Physical pass-through keyloggers operate completely outside Windows OS, explaining why wiping the hard drive found no malware.',
    ],
  },
  'case-25': {
    caseId: 'case-25',
    maxHints: 2,
    correctTimeline: [
      'The canteen wallet app stores user balance locally inside browser localStorage.',
      '01:10 PM: Pradeep opens Chrome Developer Tools on his phone and edits his balance from ₹20 to ₹2000.',
      'Pradeep orders snacks for his entire group using the edited wallet screen.',
      'Daily accounting shows ₹1,980 worth of food issued without any actual UPI payment.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['pradeep'],
    evidenceKeywords: [
      'localstorage',
      'user_wallet_bal',
      'wallet.js',
      '20.00',
      '2000',
      '2,000',
      '1,980',
      'devtools',
      '2ba22ec044',
      'upi',
    ],
    debriefNotes: [
      'Culprit: Pradeep — Modified user_wallet_bal in browser localStorage from ₹20 to ₹2,000 to order free food for his group.',
      'Because wallet.js trusted client-side localStorage at checkout, editing the balance bypassed server-side UPI verification.',
    ],
  },
  'case-26': {
    caseId: 'case-26',
    maxHints: 2,
    correctTimeline: [
      "The robotics team uploads their autonomous flight code to the drone's microSD card.",
      '03:20 PM: While the team goes for testing clearance, Ritesh swaps the altitude value from 5m to 0m.',
      'During the live demo, the drone refuses to lift off and spins on the ground.',
      'Checking the SD card file properties shows it was modified during the testing break.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['ritesh'],
    evidenceKeywords: [
      'mission.py',
      'target_alt',
      '0.0',
      'microsd',
      'card reader',
      '15:20:44',
      '15:20',
      'cctv',
      'skyhawk',
      'last modified',
    ],
    debriefNotes: [
      "Culprit: Ritesh — Edited TARGET_ALT to 0.0 on Team Skyhawk's microSD card at 15:20 PM while they were at the judge inspection desk.",
      'The file modification timestamp (15:20:44 PM) matches pit area CCTV showing Ritesh at Skyhawk’s workbench with a USB microSD card reader.',
    ],
  },
  'case-27': {
    caseId: 'case-27',
    maxHints: 2,
    correctTimeline: [
      '10:15 AM: Nikhil sets up a fake hotspot named BEC_Campus_Free_5G near the main canteen.',
      'Twelve students connect to the fake Wi-Fi and type their college roll number and password.',
      'Nikhil captures the saved passwords in a text file on his laptop.',
      'Students notice they have no internet access even after logging into the fake portal.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['nikhil'],
    evidenceKeywords: [
      'bec_campus_free_5g',
      'b4:2e:99:10:44:88',
      'evil twin',
      'rogue',
      'bssid',
      'alfa',
      'antenna',
      'channel 6',
      'captive portal',
      'lenovo legion',
      '10:15',
    ],
    debriefNotes: [
      'Culprit: Nikhil — Hosted a rogue Evil Twin hotspot (BEC_Campus_Free_5G) from his laptop to harvest student ERP passwords.',
      'Campus network registry maps the rogue BSSID (B4:2E:99:10:44:88) directly to Nikhil’s Lenovo Legion laptop seen with an Alfa USB Wi-Fi antenna on CCTV.',
    ],
  },
  'case-28': {
    caseId: 'case-28',
    maxHints: 2,
    correctTimeline: [
      'The digital notice board in the lobby runs on a Raspberry Pi with default SSH credentials.',
      '04:25 PM: Darshan scans the local Wi-Fi, logs into the Raspberry Pi, and replaces the notice image.',
      'The lobby screen suddenly displays "Tomorrow is a Holiday" in giant red letters.',
      'The HOD walks past the lobby screen and calls the IT department immediately.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['darshan'],
    evidenceKeywords: [
      '192.168.12.71',
      'pi/raspberry',
      'raspberry',
      'scp',
      'holiday.png',
      'banner.png',
      'bash',
      'ssh',
      '16:25',
      'hp pavilion',
    ],
    debriefNotes: [
      'Culprit: Darshan — Logged into the lobby Raspberry Pi using default pi/raspberry SSH credentials from 192.168.12.71 and copied over the fake holiday banner.',
      'Bash history on the Pi records scp darshan@192.168.12.71:~/holiday.png directly from Darshan’s assigned IP.',
    ],
  },
  'case-29': {
    caseId: 'case-29',
    maxHints: 2,
    correctTimeline: [
      'The hackathon judges save their final Excel score sheet on the seminar hall desktop.',
      '05:25 PM: Tejas plugs his USB drive into the desktop PC while pretending to adjust the HDMI cable.',
      "Tejas shares photos of the judges' secret scores in his team's private WhatsApp group.",
      'Windows USB history confirms a SanDisk drive was connected during the break.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['tejas'],
    evidenceKeywords: [
      'tejas_usb',
      'usbstor',
      'sandisk',
      'final_scores.xlsx',
      '17:25:18',
      '17:25:40',
      '17:25',
      'hdmi',
      'cctv',
      'registry',
    ],
    debriefNotes: [
      'Culprit: Tejas — Plugged his TEJAS_USB pendrive into the unattended seminar PC at 17:25 PM while feigning an HDMI check and copied Final_Scores.xlsx.',
      'Windows USBSTOR registry logs and file access logs confirm TEJAS_USB mounted at 17:25:18 and copied Final_Scores.xlsx 22 seconds later.',
    ],
  },
  'case-30': {
    caseId: 'case-30',
    maxHints: 2,
    correctTimeline: [
      'Two minutes before concert tickets go live, Chetan runs a Python auto-clicker script.',
      '07:00 PM: The ticket booking website opens, and Chetan’s script submits 30 bookings in 3 seconds.',
      'Regular students see "Sold Out" within sixty seconds of the launch.',
      'Server logs show 30 bookings came from the exact same browser session ID.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['chetan'],
    evidenceKeywords: [
      'usr_chetan_881',
      'session_id',
      'python-selenium',
      'selenium',
      '10.5.19.33',
      'book_vip',
      '30',
      '3 seconds',
      'cookie',
      '19:00',
    ],
    debriefNotes: [
      'Culprit: Chetan — Used a Python Selenium automation script from his laptop (10.5.19.33) to book all 30 VIP passes in 3 seconds.',
      'Web logs reveal 30 POST /book_vip calls in 3 seconds carrying session_id=usr_chetan_881 and User-Agent Python-Selenium/4.18 from Chetan’s hostel IP.',
    ],
  },
};

const CASE_OTHER_SUSPECTS: Record<string, string[]> = {
  'case-01': ['aarav', 'sneha', 'kulkarni'],
  'case-02': ['meera', 'karthik', 'ananya'],
  'case-03': ['aditya', 'divya', 'neha'],
  'case-04': ['siddharth', 'pooja', 'harsha'],
  'case-05': ['kavya', 'rakesh', 'deepak'],
  'case-06': ['priya', 'sameer', 'tanya'],
  'case-07': ['arjun', 'shreya', 'varun'],
  'case-08': ['varun', 'aditi', 'rohan'],
  'case-09': ['tara', 'nandini', 'akash'],
  'case-10': ['omkar', 'bhavna', 'divya'],
  'case-11': ['arjun', 'megha', 'suresh'],
  'case-12': ['isha', 'pranav', 'gautam'],
  'case-13': ['riya', 'kabir', 'omkar'],
  'case-14': ['ankita', 'devansh', 'lakshmi'],
  'case-15': ['pallavi', 'sagar', 'nidhi'],
  'case-16': ['hegde', 'venkatesh', 'abhishek'],
  'case-17': ['kunal', 'sneha', 'vikash'],
  'case-18': ['manish', 'darshan', 'spoorthi'],
  'case-19': ['ananya', 'roshan', 'chitra'],
  'case-20': ['sandeep', 'kavita', 'mohan'],
  'case-21': ['neha', 'prashanth', 'vikas'],
  'case-22': ['deepa', 'anil', 'shweta'],
  'case-23': ['anusha', 'mahesh', 'soumya'],
  'case-24': ['aryan', 'nikhita', 'tarun'],
  'case-25': ['pramod', 'anusha', 'rakesh'],
  'case-26': ['tejas', 'aishwarya', 'harish'],
  'case-27': ['rhea', 'manoj', 'anup'],
  'case-28': ['charan', 'pooja', 'dinesh'],
  'case-29': ['rohan', 'shashank', 'keerthi'],
  'case-30': ['advait', 'meera', 'devansh'],
};

const ALL_CULPRIT_NAMES = Array.from(
  new Set(Object.values(caseAnswerKeys).flatMap((entry) => entry.culpritKeywords))
);

const SUMMARY_FILLER_WORDS = new Set([
  'the',
  'and',
  'for',
  'are',
  'was',
  'were',
  'has',
  'have',
  'had',
  'did',
  'does',
  'not',
  'but',
  'she',
  'her',
  'his',
  'him',
  'they',
  'them',
  'their',
  'this',
  'that',
  'with',
  'from',
  'who',
  'what',
  'why',
  'how',
  'only',
  'name',
  'culprit',
  'suspect',
  'guilty',
  'hacker',
  'attacker',
  'person',
  'answer',
  'summary',
  'case',
  'think',
  'guess',
  'maybe',
  'probably',
  'definitely',
  'real',
  'true',
  'one',
  'because',
  'therefore',
]);

function matchesTerm(text: string, term: string): boolean {
  const normalizedTerm = term.toLowerCase();
  if (/^[a-z0-9]{1,5}$/i.test(normalizedTerm)) {
    const escaped = normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
  }
  return text.includes(normalizedTerm);
}

function isExtraSuspectAccused(lowerText: string, name: string): boolean {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\b${escaped}\\b`, 'gi');
  for (const match of lowerText.matchAll(pattern)) {
    const idx = match.index ?? -1;
    if (idx < 0) continue;
    const before = lowerText.slice(Math.max(0, idx - 24), idx);
    const after = lowerText.slice(idx + name.length, idx + name.length + 6);
    if (/^['’]s\b/i.test(after)) continue;
    if (/\b(?:from|of|for|to|victim|not|innocent|unlike|against)\s+$/i.test(before)) continue;
    return true;
  }
  return false;
}

export function evaluateAnswerSummary(key: CaseAnswerKey, report: string) {
  const trimmed = report.trim();
  if (!trimmed) {
    return {
      summaryScore: 0,
      culpritMatched: false,
      culpritPoints: 0,
      clueHits: 0,
      cluePoints: 0,
      extraSuspectCount: 0,
      multiCulpritPenalty: 0,
      hasInfo: false,
    };
  }
  const lower = trimmed.toLowerCase();
  const culpritMatched = key.culpritKeywords.some((term) => matchesTerm(lower, term));
  const clueHits = key.evidenceKeywords.filter((term) => matchesTerm(lower, term)).length;

  const caseOthers = CASE_OTHER_SUSPECTS[key.caseId] || [];
  const candidateExtraNames = Array.from(
    new Set([...caseOthers, ...ALL_CULPRIT_NAMES])
  ).filter((name) => !key.culpritKeywords.includes(name));

  const extraSuspectNames = candidateExtraNames.filter((name) =>
    isExtraSuspectAccused(lower, name)
  );
  const extraSuspectCount = extraSuspectNames.length;
  const multiCulpritPenalty = extraSuspectCount * 15;

  const nameTokensToExclude = new Set([
    ...key.culpritKeywords,
    ...candidateExtraNames,
  ]);
  const meaningfulInfoWords = lower
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(
      (word) =>
        word.length >= 3 &&
        !nameTokensToExclude.has(word) &&
        !SUMMARY_FILLER_WORDS.has(word)
    );

  const hasInfo = clueHits >= 1 || meaningfulInfoWords.length >= 2;
  const culpritPoints = culpritMatched ? 25 : 0;
  const cluePoints = culpritMatched
    ? hasInfo
      ? 25
      : meaningfulInfoWords.length === 1
      ? 15
      : 0
    : clueHits > 0
    ? Math.min(15, clueHits * 5)
    : meaningfulInfoWords.length >= 3
    ? 5
    : 0;

  const summaryScore = Math.max(
    0,
    Math.min(50, culpritPoints + cluePoints - multiCulpritPenalty)
  );

  return {
    summaryScore,
    culpritMatched,
    culpritPoints,
    clueHits,
    cluePoints,
    extraSuspectCount,
    multiCulpritPenalty,
    hasInfo,
  };
}

export function gradeCaseVerdict(
  caseId: string,
  timelineOrder: string[],
  report: string,
  hintsUsed: number,
  elapsedSeconds: number
) {
  const key = caseAnswerKeys[caseId];
  if (!key) return null;

  const totalSteps = key.correctTimeline.length;
  let timelineMatches = 0;
  for (let i = 0; i < totalSteps; i += 1) {
    if (timelineOrder[i] === key.correctTimeline[i]) timelineMatches += 1;
  }

  const perStepPoints = totalSteps > 0 ? 50 / totalSteps : 0;
  const sequenceScore = Number((timelineMatches * perStepPoints).toFixed(2));
  const summaryEval = evaluateAnswerSummary(key, report);
  const rawScore = sequenceScore + summaryEval.summaryScore - hintsUsed * 5;
  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));
  const perStepLabel = Number(perStepPoints.toFixed(1)).toString();

  const summaryDetailParts = [
    `Culprit ${summaryEval.culpritMatched ? 'identified' : 'missing'} (${summaryEval.culpritPoints}/25)`,
    `Info & clues (${summaryEval.cluePoints}/25)`,
  ];
  if (summaryEval.extraSuspectCount > 0) {
    summaryDetailParts.push(
      `Multiple culprit names penalty (-${summaryEval.multiCulpritPenalty} pts for ${summaryEval.extraSuspectCount} extra suspect${summaryEval.extraSuspectCount === 1 ? '' : 's'})`
    );
  }

  return {
    score: finalScore,
    sequenceScore,
    summaryScore: summaryEval.summaryScore,
    timelineMatches,
    totalTimeline: totalSteps,
    hintsUsed,
    elapsedSeconds: Math.max(1, elapsedSeconds),
    submittedAt: new Date().toISOString(),
    explanations: [
      {
        title: 'Sequence recognition (50%)',
        correct: timelineMatches === totalSteps,
        explanation: `${timelineMatches} of ${totalSteps} orders matched (${sequenceScore} / 50 pts · ${perStepLabel} pts each).`,
      },
      {
        title: 'Answer summary (50%)',
        correct: summaryEval.summaryScore >= 35,
        explanation: `${summaryEval.summaryScore} / 50 pts — ${summaryDetailParts.join(' · ')}.`,
      },
      ...key.debriefNotes.map((note, idx) => ({
        title: `Forensic finding 0${idx + 1}`,
        correct: true,
        explanation: note,
      })),
    ],
    message: `Sequence ${sequenceScore}/50 (${timelineMatches}/${totalSteps} × ${perStepLabel} pts) + Summary ${summaryEval.summaryScore}/50.`,
  };
}

export function gradeCaseVerdictLocally(
  caseId: string,
  timelineOrder: string[],
  report: string,
  hintsUsed: number,
  elapsedSeconds: number
) {
  return gradeCaseVerdict(caseId, timelineOrder, report, hintsUsed, elapsedSeconds);
}
