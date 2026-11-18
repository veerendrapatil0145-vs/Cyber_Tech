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
      'Lab Assistant Aarav scans his biometric ID and leaves the CS block.',
      'Rohan sits near the canteen Wi-Fi router and opens his Windows laptop.',
      '11:42 PM: The OS mid-semester question paper PDF is downloaded from the HOD portal.',
      'The leaked question paper appears on a public Telegram channel.',
    ],
    debriefNotes: [
      'Culprit: Rohan — Connected to campus local Wi-Fi (192.168.14.88) at the canteen on a Windows laptop at the exact download timestamp.',
      'DHCP logs assign 192.168.14.1–254 exclusively to Campus & Hostel Wi-Fi, while Sneha pushed from a MacBook (MacIntel).',
    ],
  },
  'case-02': {
    maxHints: 2,
    correctTimeline: [
      'Karthik accidentally pushes his secret GitHub access token inside the .env file.',
      '02:15 AM: Vikram borrows a 65W laptop charger from the volunteer desk.',
      "Vikram clones the leading team's repository and copies their secret token.",
      "The team's main code branch is wiped clean using a force push.",
    ],
    debriefNotes: [
      "Culprit: Vikram — Lied about not having a charger, cloned the repo at 03:12 AM, and used Karthik's leaked PAT in .env to force-push wipe the code.",
      'Volunteer desk logs confirm Vikram borrowed a 65W USB-C charger at 02:15 AM and returned it at 03:45 AM.',
    ],
  },
  'case-03': {
    maxHints: 2,
    correctTimeline: [
      'Class Rep Rahul collects the attendance sheets and hands them to Prof. Sharma.',
      "04:05 PM: Someone tries to log into Prof. Sharma's ERP account twice with the wrong password.",
      'The attacker resets the password using the pet name "Bruno" from a browser with CR bookmarks.',
      "Aditya's attendance is manually updated from 42% to 85% in the database.",
    ],
    debriefNotes: [
      'Culprit: Rahul — Used OSINT from Prof. Sharma\'s Instagram ("Bruno") to reset the password and modified Aditya\'s attendance using his CR laptop.',
      'Browser bookmarks BEC_CR_Notices and Attendance_Upload tied the reset directly to the Class Representative browser profile.',
    ],
  },
  'case-04': {
    maxHints: 2,
    correctTimeline: [
      'Pooja submits her coding solution and walks over to the exit door.',
      'Tanmay plugs in a blue USB drive and boots a live Linux OS right below the router.',
      '09:14 PM: A flood of disconnect signals hits the lab Wi-Fi from a laptop within 3 meters of the router.',
      'The lab Wi-Fi crashes and disconnects all 40 participants.',
    ],
    debriefNotes: [
      'Culprit: Tanmay — Sat directly beneath the router and booted a Kali Live USB (98:E7:F4:22:10:8A) to jam the Wi-Fi.',
      'Signal strength (-32 dBm) places the source within 3 meters of AP-LAB04, matching Desk A1 on Lab-04 CCTV.',
    ],
  },
  'case-05': {
    maxHints: 2,
    correctTimeline: [
      'Manoj logs into the Canteen Free Wi-Fi on his device.',
      '01:45 PM: The fake lookalike website bec-placemnts.in is registered online.',
      'Fake internship shortlist emails are sent out to students from the canteen IP address.',
      'Manoj messages the class group telling everyone to open the link quickly.',
    ],
    debriefNotes: [
      'Culprit: Manoj — Registered the typosquatted domain and dispatched the phishing emails from Canteen Wi-Fi before hyping the link on WhatsApp.',
      "Both the WHOIS handle (dev_manoj99) and X-Originating-IP (103.21.58.190) match Manoj's canteen Wi-Fi session.",
    ],
  },
  'case-06': {
    maxHints: 2,
    correctTimeline: [
      'The Deep Learning lab officially closes and the biometric door locks for the night.',
      '08:45 PM: Nithin logs into LAB-GPU-03 remotely over SSH using his student ID.',
      'A hidden mining script starts running in the background and pushes GPU usage to 99%.',
      'The server temperature crosses 88°C and triggers a thermal overheat alert.',
    ],
    debriefNotes: [
      'Culprit: Nithin — Logged in from his own hostel IP (172.16.5.44) and deployed the miner under his own user account before feigning ignorance on Slack.',
      'The file owner (dev_nithin) and birth timestamp (20:47:08) align with his SSH login two minutes earlier.',
    ],
  },
  'case-07': {
    maxHints: 2,
    correctTimeline: [
      "Kiran uses his laptop inside the library to inspect the quiz website's network requests.",
      '03:58 PM: Kiran sends a fake POST request claiming a perfect score of 100/100 in just 4 seconds.',
      'The server accepts the unverified score and puts Kiran at #1 on the leaderboard.',
      'The online quiz timer ends and the final results lock.',
    ],
    debriefNotes: [
      'Culprit: Kiran — Intercepted the submission endpoint in the library and sent a forged POST request via Postman to claim 100/100.',
      'Both the API gateway User-Agent (PostmanRuntime/7.39) and Library Wi-Fi IP (10.20.4.18) match Kiran.',
    ],
  },
  'case-08': {
    maxHints: 2,
    correctTimeline: [
      'Treasurer Varun leaves his unlocked laptop on the fest desk while going to buy tea.',
      "Pranav sits at Varun's laptop and adds a fake vendor account in the payment portal.",
      "10:05 AM: Pranav approves a ₹25,000 transfer from Varun's browser session to his own UPI ID.",
      'Varun returns to his desk and notices the missing money alert.',
    ],
    debriefNotes: [
      "Culprit: Pranav — Used Varun's unlocked browser session to add his own UPI ID as a vendor and transfer ₹25,000.",
      'CCTV places Pranav alone at Varun’s chair from 10:03 AM to 10:06 AM, spanning both beneficiary creation and transfer.',
    ],
  },
  'case-09': {
    maxHints: 2,
    correctTimeline: [
      'Club President Tara leaves her phone on the auditorium stage during rehearsal.',
      "06:15 PM: Sahil opens the OTP SMS on Tara's phone and logs into the club Instagram on his iPhone.",
      'Sahil removes Tara’s email from the account and posts a fake event cancellation notice.',
      'Students start panicking and messaging the club group about the cancelled fest.',
    ],
    debriefNotes: [
      "Culprit: Sahil — Read the SMS OTP from Tara's unattended phone lockscreen, logged in on his iPhone, and changed the recovery email.",
      'Backstage CCTV shows Sahil reading Tara’s lockscreen notification at 18:14 PM—one minute before login from "Sahil\'s iPhone 14".',
    ],
  },
  'case-10': {
    maxHints: 2,
    correctTimeline: [
      'Teammate Omkar shares his screen on Discord with his AWS secret keys visible in VS Code.',
      '10:30 PM: Rival student Vivek logs into the AWS account from his hostel room using those leaked keys.',
      "Vivek permanently deletes the project's cloud storage bucket (final-year-ml-data).",
      'The project team tries to run their demo and gets a "Bucket Not Found" error.',
    ],
    debriefNotes: [
      "Culprit: Vivek — Copied Omkar's AWS keys from the Discord stream and deleted the S3 bucket from his hostel room (10.14.8.92).",
      'Hostel Block A DHCP records map CloudTrail SourceIP 10.14.8.92 directly to Vivek in Room 112.',
    ],
  },
  'case-11': {
    maxHints: 2,
    correctTimeline: [
      'Yash walks past the library turnstile with a hidden RFID scanner inside his backpack.',
      "02:01 PM: Yash's scanner copies the card ID number of Senior Student Arjun.",
      'Yash walks into the library using the cloned card ID while Arjun is at the sports ground.',
      "Three rare GATE exam books are checked out under Arjun's library account.",
    ],
    debriefNotes: [
      "Culprit: Yash — Skimmed Arjun's RFID card UID at 14:01 PM using his RC522 module and cloned it onto a blank card to check out books.",
      'Sports ground CCTV proves Arjun was playing football at 18:30 PM when the cloned card scanned at the library.',
    ],
  },
  'case-12': {
    maxHints: 2,
    correctTimeline: [
      'The placement coordinator uploads the shortlist CSV file to a shared Google Drive folder.',
      "12:20 PM: Someone opens the file and types Abhishek's USN into Row 14 using a Linux computer.",
      'The updated shortlist is downloaded by the HR team for afternoon interviews.',
      'The coordinator notices an extra student sitting in the interview waiting room.',
    ],
    debriefNotes: [
      'Culprit: Abhishek — Exploited the open edit permissions on the Drive link from his Ubuntu session in Lab-01 to insert his own USN.',
      'The OS fingerprint (Ubuntu Linux x86_64) in Google Drive revisions matches only Abhishek’s active Lab-01 login at 12:20 PM.',
    ],
  },
  'case-13': {
    maxHints: 2,
    correctTimeline: [
      'Student Secretary Naveen submits the official room booking request from his hostel room.',
      '09:32 AM: A fake email pretending to be from the Dean is sent using an online email-spoofing tool.',
      'The security guard receives the fake email approving the auditorium for the esports club.',
      'The esports club sets up their gaming PCs inside the main auditorium.',
    ],
    debriefNotes: [
      "Culprit: Naveen — Used an online email-spoofing tool from his IP (10.12.4.77) to forge the Dean's approval and trick the security guard.",
      'Firewall DNS logs show 10.12.4.77 querying emkei-spoof.cz at 09:31 AM right after Naveen submitted his booking request.',
    ],
  },
  'case-14': {
    maxHints: 2,
    correctTimeline: [
      'Hostel maintenance turns off the corridor lights, leaving the smart meter box unattended.',
      "01:30 AM: Gaurav connects his phone to the meter's default Wi-Fi hotspot (ESP8266_Config).",
      'Gaurav resets the power unit counter of Room 304 back to zero.',
      'The hostel warden sees a zero electricity bill for Room 304 despite heavy AC usage.',
    ],
    debriefNotes: [
      "Culprit: Gaurav — Connected to the smart meter's unprotected ESP8266_Config Wi-Fi from his phone and reset Room 304's usage counter.",
      'MAC A2:44:90:11:7C:02 in the meter serial log belongs to Gaurav’s OnePlus 11, matching corridor CCTV at 01:29 AM.',
    ],
  },
  'case-15': {
    maxHints: 2,
    correctTimeline: [
      '04:00 PM: Developer Swati accidentally uploads her OpenAI API key in a public GitHub commit.',
      "Automated bots scan public GitHub repositories and find Swati's exposed key.",
      "Hundreds of API calls are made from an overseas server using Swati's account.",
      'Swati receives an email alert that her $50 API credit balance has hit zero.',
    ],
    debriefNotes: [
      'Culprit: Swati (Accidental Leak) — Hardcoded and pushed the live OpenAI key into a public repository, allowing automated scrapers to drain the credits.',
      'Teammates Sagar and Nidhi never pushed to GitHub; automated bots scraped chatbot.py immediately after Swati’s 16:00 commit.',
    ],
  },
  'case-16': {
    maxHints: 2,
    correctTimeline: [
      'Faculty member Dr. Hegde connects his laptop to the smart projector over Wi-Fi.',
      '11:05 AM: Shreyas connects to the open projector screen-share using the default PIN 0000.',
      'A loud Rickroll video suddenly plays on the classroom projector screen.',
      'Dr. Hegde unplugs the projector power cable and checks the connected device list.',
    ],
    debriefNotes: [
      'Culprit: Shreyas — Manually paired his ASUS ROG Strix laptop to the projector using the default PIN 0000 to play the prank video.',
      'Miracast requires manual PIN entry (0000) and logged the exact device hostname Shreyas-ROG-Strix.',
    ],
  },
  'case-17': {
    maxHints: 2,
    correctTimeline: [
      'The fest food stall app generates simple numbered QR codes like COUPON_101 and COUPON_102.',
      '12:40 PM: Tarun notices the pattern and types COUPON_105 manually into the URL bar on his phone.',
      'Tarun claims four free burgers at the food counter using unissued coupon numbers.',
      'Real ticket holders complain that their food coupons show "Already Redeemed."',
    ],
    debriefNotes: [
      "Culprit: Tarun — Exploited sequential IDOR coupon URLs from his phone (10.18.3.44) to redeem other students' meal vouchers.",
      'Web access logs show 10.18.3.44 enumerating COUPON_105–107 five minutes before Tarun scanned 4 QR codes on Counter 1 CCTV.',
    ],
  },
  'case-18': {
    maxHints: 2,
    correctTimeline: [
      '03:10 PM: Bhargav plugs a USB rubber ducky drive into PC-01 during the lab break.',
      'A script copies a fake lock-screen program across all 20 PCs over the shared lab folder.',
      'Every computer monitor in the lab turns red with a fake "Files Encrypted" message.',
      'The lab instructor restarts the PCs and finds the batch file in the startup folder.',
    ],
    debriefNotes: [
      'Culprit: Bhargav — Used an Arduino BadUSB device on PC-01 during break to deploy a fake ransomware batch script across the shared lab folder.',
      'USB event logs recorded an Arduino Leonardo HID keyboard (VID_1B4F) at 15:10:04 PM while CCTV caught Bhargav plugging a circuit board into PC-01.',
    ],
  },
  'case-19': {
    maxHints: 2,
    correctTimeline: [
      'The cultural team pairs their phone with the main stage Bluetooth speaker for soundcheck.',
      '05:25 PM: While the stage phone disconnects briefly, Chirag pairs his Samsung phone to the speaker.',
      'Loud siren sounds blast across the auditorium right as the chief guest starts speaking.',
      'The sound engineer checks the speaker and sees Chirag_S23 in the paired list.',
    ],
    debriefNotes: [
      'Culprit: Chirag — Manually paired his Samsung Galaxy S23 to the open stage speaker at 17:25 PM and streamed the siren sound during the speech.',
      'A new device cannot "auto-connect" without first completing manual pairing at 17:25:10 as logged by JBL PartyBox.',
    ],
  },
  'case-20': {
    maxHints: 2,
    correctTimeline: [
      'The IT admin saves a plain-text file vouchers.txt inside an open shared network folder.',
      '11:20 AM: Mohit browses the campus local network and downloads vouchers.txt to his laptop.',
      'Mohit sells 15 high-speed internet voucher codes to his hostel friends for ₹50 each.',
      'Guest speakers arrive at the seminar hall and find all their Wi-Fi codes already used.',
    ],
    debriefNotes: [
      'Culprit: Mohit — Downloaded the plaintext vip_vouchers.txt file from the open SMB network share (172.16.4.88) and sold the codes on WhatsApp.',
      'DHCP maps 172.16.4.88 to Mohit’s Dell laptop, and Mohan verified the purchased ₹50 code connected directly to BEC-VIP-5G.',
    ],
  },
  'case-21': {
    maxHints: 2,
    correctTimeline: [
      'Event winners receive official digital certificates with a verification QR link.',
      '04:30 PM: Lokesh edits his name onto a winner certificate PDF using an online PDF editor.',
      'Lokesh uploads the fake certificate to LinkedIn, leaving the original QR link intact.',
      "A recruiter scans the QR code and sees that it belongs to another student's name.",
    ],
    debriefNotes: [
      "Culprit: Lokesh M. — Took Neha's shared winner PDF, overwrote her name with his own using an online PDF editor, and forgot the QR code still verified Neha.",
      'PDF metadata shows modification at 16:30 PM in "iLovePDF Text Editor", whereas official certificates only come from Canva.',
    ],
  },
  'case-22': {
    maxHints: 2,
    correctTimeline: [
      'A junior developer builds an admin delete link using a simple URL (?delete_id=5).',
      'Akash opens the page source, spots the hidden admin URL, and tests it in his browser.',
      '02:27 PM: Akash runs a loop script that visits delete_id=1 through 50, wiping all team registrations.',
      'The registration page suddenly displays "0 Teams Registered."',
    ],
    debriefNotes: [
      'Culprit: Akash — Found the unauthenticated delete endpoint in the HTML source comments and ran a Python loop from IP 10.9.3.14 to wipe all 50 records.',
      'Apache logs confirm python-urllib/3.11 iterated delete_id=1..50 from Akash’s assigned hostel IP 10.9.3.14.',
    ],
  },
  'case-23': {
    maxHints: 2,
    correctTimeline: [
      'Club Coordinator Anusha posts a 2-minute speech reel on her public Instagram page.',
      '08:15 PM: An attacker clones Anusha’s voice using an AI tool and calls the event vendor.',
      'The fake voice instructs the vendor to deliver the sound equipment to the wrong gate.',
      'The real Anusha calls the vendor asking why the speakers haven’t arrived at the main hall.',
    ],
    debriefNotes: [
      "Culprit: Prateek — Downloaded Anusha's public Instagram reel, cloned her voice using his AI account, and spoofed a VoIP call to mislead the vendor.",
      'SaaS logs prove prateek.ai@gmail.com uploaded anusha_insta_reel.mp3 at 20:08 PM—seven minutes before the VoIP call while Anusha was speaking with the Principal.',
    ],
  },
  'case-24': {
    maxHints: 2,
    correctTimeline: [
      '08:45 AM: Before the workshop starts, Suraj plugs a tiny black USB adapter behind the podium PC.',
      'The guest speaker types his cloud portal password on the podium keyboard.',
      'During lunch break, Suraj returns to the stage and unplugs the hardware keylogger.',
      "Unauthorized logins from Suraj's hostel IP appear on the guest speaker's account.",
    ],
    debriefNotes: [
      'Culprit: Suraj — Planted a hardware USB keylogger on the podium keyboard before the workshop, retrieved it at lunch, and logged in from his hostel IP.',
      'Physical pass-through keyloggers operate completely outside Windows OS, explaining why wiping the hard drive found no malware.',
    ],
  },
  'case-25': {
    maxHints: 2,
    correctTimeline: [
      'The canteen wallet app stores user balance locally inside browser localStorage.',
      '01:10 PM: Pradeep opens Chrome Developer Tools on his phone and edits his balance from ₹20 to ₹2000.',
      'Pradeep orders snacks for his entire group using the edited wallet screen.',
      'Daily accounting shows ₹1,980 worth of food issued without any actual UPI payment.',
    ],
    debriefNotes: [
      'Culprit: Pradeep — Modified user_wallet_bal in browser localStorage from ₹20 to ₹2,000 to order free food for his group.',
      'Because wallet.js trusted client-side localStorage at checkout, editing the balance bypassed server-side UPI verification.',
    ],
  },
  'case-26': {
    maxHints: 2,
    correctTimeline: [
      "The robotics team uploads their autonomous flight code to the drone's microSD card.",
      '03:20 PM: While the team goes for testing clearance, Ritesh swaps the altitude value from 5m to 0m.',
      'During the live demo, the drone refuses to lift off and spins on the ground.',
      'Checking the SD card file properties shows it was modified during the testing break.',
    ],
    debriefNotes: [
      "Culprit: Ritesh — Edited TARGET_ALT to 0.0 on Team Skyhawk's microSD card at 15:20 PM while they were at the judge inspection desk.",
      'The file modification timestamp (15:20:44 PM) matches pit area CCTV showing Ritesh at Skyhawk’s workbench with a USB microSD card reader.',
    ],
  },
  'case-27': {
    maxHints: 2,
    correctTimeline: [
      '10:15 AM: Nikhil sets up a fake hotspot named BEC_Campus_Free_5G near the main canteen.',
      'Twelve students connect to the fake Wi-Fi and type their college roll number and password.',
      'Nikhil captures the saved passwords in a text file on his laptop.',
      'Students notice they have no internet access even after logging into the fake portal.',
    ],
    debriefNotes: [
      'Culprit: Nikhil — Hosted a rogue Evil Twin hotspot (BEC_Campus_Free_5G) from his laptop to harvest student ERP passwords.',
      'Campus network registry maps the rogue BSSID (B4:2E:99:10:44:88) directly to Nikhil’s Lenovo Legion laptop seen with an Alfa USB Wi-Fi antenna on CCTV.',
    ],
  },
  'case-28': {
    maxHints: 2,
    correctTimeline: [
      'The digital notice board in the lobby runs on a Raspberry Pi with default SSH credentials.',
      '04:25 PM: Darshan scans the local Wi-Fi, logs into the Raspberry Pi, and replaces the notice image.',
      'The lobby screen suddenly displays "Tomorrow is a Holiday" in giant red letters.',
      'The HOD walks past the lobby screen and calls the IT department immediately.',
    ],
    debriefNotes: [
      'Culprit: Darshan — Logged into the lobby Raspberry Pi using default pi/raspberry SSH credentials from 192.168.12.71 and copied over the fake holiday banner.',
      'Bash history on the Pi records scp darshan@192.168.12.71:~/holiday.png directly from Darshan’s assigned IP.',
    ],
  },
  'case-29': {
    maxHints: 2,
    correctTimeline: [
      'The hackathon judges save their final Excel score sheet on the seminar hall desktop.',
      '05:25 PM: Tejas plugs his USB drive into the desktop PC while pretending to adjust the HDMI cable.',
      "Tejas shares photos of the judges' secret scores in his team's private WhatsApp group.",
      'Windows USB history confirms a SanDisk drive was connected during the break.',
    ],
    debriefNotes: [
      'Culprit: Tejas — Plugged his TEJAS_USB pendrive into the unattended seminar PC at 17:25 PM while feigning an HDMI check and copied Final_Scores.xlsx.',
      'Windows USBSTOR registry logs and file access logs confirm TEJAS_USB mounted at 17:25:18 and copied Final_Scores.xlsx 22 seconds later.',
    ],
  },
  'case-30': {
    maxHints: 2,
    correctTimeline: [
      'Two minutes before concert tickets go live, Chetan runs a Python auto-clicker script.',
      '07:00 PM: The ticket booking website opens, and Chetan’s script submits 30 bookings in 3 seconds.',
      'Regular students see "Sold Out" within sixty seconds of the launch.',
      'Server logs show 30 bookings came from the exact same browser session ID.',
    ],
    debriefNotes: [
      'Culprit: Chetan — Used a Python Selenium automation script from his laptop (10.5.19.33) to book all 30 VIP passes in 3 seconds.',
      'Web logs reveal 30 POST /book_vip calls in 3 seconds carrying session_id=usr_chetan_881 and User-Agent Python-Selenium/4.18 from Chetan’s hostel IP.',
    ],
  },
};

const summaryCriteria: Record<string, { culprit: string[]; clues: string[] }> = {
  'case-01': { culprit: ['rohan'], clues: ['192.168.14.88', '192.168.14', 'canteen', 'wi-fi', 'wifi', 'windows', 'windows nt 10.0', 'dhcp', 'macbook', 'os_midsem', 'chrome', 'router'] },
  'case-02': { culprit: ['vikram'], clues: ['vikram_codes', 'pat', 'token', '.env', 'charger', '65w', 'usb-c', 'force', 'clone', '03:12', '03:17', 'backend_deploy'] },
  'case-03': { culprit: ['rahul'], clues: ['bruno', 'instagram', 'osint', 'security question', 'reset', 'cr', 'bec_cr_notices', 'attendance_upload', 'bookmark', 'aditya', '85%', 'prof_sharma'] },
  'case-04': { culprit: ['tanmay'], clues: ['kali', 'kali-live-usb', 'usb', 'pendrive', 'deauth', '-32', 'rssi', 'dbm', 'ap-lab04', '98:e7:f4:22:10:8a', 'jam', 'desk a1'] },
  'case-05': { culprit: ['manoj'], clues: ['manoj_k', 'dev_manoj99', '103.21.58.190', 'canteen', 'wi-fi', 'wifi', 'whois', 'bec-placemnts', 'typosquat', 'phish', 'x-originating-ip', 'whatsapp'] },
  'case-06': { culprit: ['nithin'], clues: ['dev_nithin', '172.16.5.44', 'ssh', 'xmrig', 'xmrig_miner', 'cron', 'hostel', 'hostel-block-b', '/tmp/.hidden', 'crypto', '20:45', '20:47'] },
  'case-07': { culprit: ['kiran'], clues: ['kiran_07', 'postman', 'postmanruntime', '10.20.4.18', 'library', 'dhcp', 'devtools', 'post', '/api/v1/submit', '100', '4 seconds'] },
  'case-08': { culprit: ['pranav'], clues: ['pranav.99@okicici', 'pranav.99', 'upi', 'techsupplies_blr', 'varun_chrome', 'unlocked', 'cctv', '10:04', '10:05', '192.168.1.50', '25,000', '25000'] },
  'case-09': { culprit: ['sahil'], clues: ["sahil's iphone 14", 'iphone 14', 'sahil.dark@gmail.com', 'otp', 'sms', 'lockscreen', 'backstage', 'cctv', '18:14', '18:15', 'recovery email'] },
  'case-10': { culprit: ['vivek'], clues: ['10.14.8.92', 'room 112', 'cloudtrail', 'deletebucket', 'final-year-ml-data', 'aws_secret_access_key', 'discord', 'akiaiosfodnn7example', 'iam', 's3', '22:32'] },
  'case-11': { culprit: ['yash'], clues: ['rfid', 'rc522', '8f-22-19-b4', 'cloned', 'clone', 'skim', '14:01', 'football', 'gate', 'backpack', 'blank', 'cctv'] },
  'case-12': { culprit: ['abhishek'], clues: ['ubuntu', 'linux', 'x86_64', 'lab-01', '2ba22cs009', 'row 14', 'placement_guest_link', 'google drive', 'revision', '12:20', 'dual-boot'] },
  'case-13': { culprit: ['naveen'], clues: ['10.12.4.77', 'emkei-spoof.cz', 'emkei', 'spf', 'fail', 'return-path', 'dean@bec.edu', 'dns', '09:30', '09:31', '09:32', 'spoof'] },
  'case-14': { culprit: ['gaurav'], clues: ['a2:44:90:11:7c:02', 'esp8266', 'esp8266_config', 'admin/admin', 'reset_kwh', 'room 304', 'oneplus 11', '01:29', '01:30', '0.0 kwh', 'mac'] },
  'case-15': { culprit: ['swati'], clues: ['swati-ml', 'chatbot.py', 'sk-proj-9981xyz', 'openai', 'github', 'hardcoded', 'public', '185.220.101.4', 'bot', '16:00', '4,200'] },
  'case-16': { culprit: ['shreyas'], clues: ['shreyas-rog-strix', 'rog strix', '0000', 'miracast', '6c:2b:59:11:8e:04', 'pin', 'epson', 'back row', '11:05', 'hostname'] },
  'case-17': { culprit: ['tarun'], clues: ['10.18.3.44', 'coupon_105', 'coupon_106', 'coupon_107', 'idor', 'sequential', 'nothing phone', '12:40', '12:45', 'qr', 'burger'] },
  'case-18': { culprit: ['bhargav'], clues: ['badusb', 'rubber ducky', 'arduino', 'leonardo', 'vid_1b4f', 'prank_lock.bat', 'pc-01', '15:10', '15:11', 'startup', 'cctv'] },
  'case-19': { culprit: ['chirag'], clues: ['chirag_s23', '48:2c:a0:99:12:ef', 'bluetooth', 'jbl', 'partybox', '17:25', '17:30', 's23', 'row 3', 'paired'] },
  'case-20': { culprit: ['mohit'], clues: ['172.16.4.88', 'vip_vouchers.txt', 'vouchers', 'smb', 'it-share', 'bec-vip-5g', '11:20', 'whatsapp', 'mohan', 'dell'] },
  'case-21': { culprit: ['lokesh'], clues: ['ilovepdf', 'cert_8821', 'qr', 'metadata', 'canva', 'neha', '16:30', 'linkedin', 'winner_cert_lokesh.pdf'] },
  'case-22': { culprit: ['akash'], clues: ['10.9.3.14', 'python-urllib', 'urllib', 'remove_team.php', 'delete_id', 'html comment', 'index.html', 'ctrl+u', '14:27', '50'] },
  'case-23': { culprit: ['prateek'], clues: ['prateek.ai@gmail.com', 'anusha_insta_reel.mp3', 'voip', 'deepfake', 'voice cloning', '10.12.4.77', '20:08', '20:15', 'principal', 'instagram'] },
  'case-24': { culprit: ['suraj'], clues: ['keylogger', 'hardware', '172.16.9.21', 'usb', 'pass-through', 'adapter', '08:45', '13:02', '14:15', 'podium', 'cctv'] },
  'case-25': { culprit: ['pradeep'], clues: ['localstorage', 'user_wallet_bal', 'wallet.js', '20.00', '2000', '2,000', '1,980', 'devtools', '2ba22ec044', 'upi'] },
  'case-26': { culprit: ['ritesh'], clues: ['mission.py', 'target_alt', '0.0', 'microsd', 'card reader', '15:20:44', '15:20', 'cctv', 'skyhawk', 'last modified'] },
  'case-27': { culprit: ['nikhil'], clues: ['bec_campus_free_5g', 'b4:2e:99:10:44:88', 'evil twin', 'rogue', 'bssid', 'alfa', 'antenna', 'channel 6', 'captive portal', 'lenovo legion', '10:15'] },
  'case-28': { culprit: ['darshan'], clues: ['192.168.12.71', 'pi/raspberry', 'raspberry', 'scp', 'holiday.png', 'banner.png', 'bash', 'ssh', '16:25', 'hp pavilion'] },
  'case-29': { culprit: ['tejas'], clues: ['tejas_usb', 'usbstor', 'sandisk', 'final_scores.xlsx', '17:25:18', '17:25:40', '17:25', 'hdmi', 'cctv', 'registry'] },
  'case-30': { culprit: ['chetan'], clues: ['usr_chetan_881', 'session_id', 'python-selenium', 'selenium', '10.5.19.33', 'book_vip', '30', '3 seconds', 'cookie', '19:00'] },
};

const caseOtherSuspects: Record<string, string[]> = {
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

const allCulpritNames = Array.from(
  new Set(Object.values(summaryCriteria).flatMap((entry) => entry.culprit))
);

const summaryFillerWords = new Set([
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

function matchesSummaryTerm(text: string, term: string): boolean {
  const normalized = term.toLowerCase();
  if (/^[a-z0-9]{1,5}$/i.test(normalized)) {
    const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
  }
  return text.includes(normalized);
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

function evaluateAnswerSummary(caseId: string, report: string) {
  const trimmed = report.trim();
  const criteria = summaryCriteria[caseId];
  if (!trimmed || !criteria) {
    return {
      summaryScore: 0,
      culpritMatched: false,
      culpritPoints: 0,
      clueHits: 0,
      cluePoints: 0,
      extraSuspectCount: 0,
      multiCulpritPenalty: 0,
    };
  }
  const lower = trimmed.toLowerCase();
  const culpritMatched = criteria.culprit.some((term) => matchesSummaryTerm(lower, term));
  const clueHits = criteria.clues.filter((term) => matchesSummaryTerm(lower, term)).length;

  const caseOthers = caseOtherSuspects[caseId] || [];
  const candidateExtraNames = Array.from(
    new Set([...caseOthers, ...allCulpritNames])
  ).filter((name) => !criteria.culprit.includes(name));

  const extraSuspectNames = candidateExtraNames.filter((name) =>
    isExtraSuspectAccused(lower, name)
  );
  const extraSuspectCount = extraSuspectNames.length;
  const multiCulpritPenalty = extraSuspectCount * 15;

  const nameTokensToExclude = new Set([...criteria.culprit, ...candidateExtraNames]);
  const meaningfulInfoWords = lower
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(
      (word) =>
        word.length >= 3 &&
        !nameTokensToExclude.has(word) &&
        !summaryFillerWords.has(word)
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

      const summaryDetailParts = [
        `Culprit ${summaryEval.culpritMatched ? 'identified' : 'missing'} (${summaryEval.culpritPoints}/25)`,
        `Info & clues (${summaryEval.cluePoints}/25)`,
      ];
      if (summaryEval.extraSuspectCount > 0) {
        summaryDetailParts.push(
          `Multiple culprit names penalty (-${summaryEval.multiCulpritPenalty} pts for ${summaryEval.extraSuspectCount} extra suspect${summaryEval.extraSuspectCount === 1 ? '' : 's'})`
        );
      }

      const explanations = [
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
      const updates: Record<string, unknown> = { status: String(payload.status || 'open') };
      if (typeof payload.name === 'string' && payload.name.trim()) {
        updates.name = payload.name.trim();
      }
      const { error } = await adminClient
        .from('games')
        .update(updates)
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
