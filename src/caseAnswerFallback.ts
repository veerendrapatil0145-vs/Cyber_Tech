export interface CaseAnswerKey {
  caseId: string;
  correctTimeline: string[];
  keyEvidenceIndices: number[];
  culpritKeywords: string[];
  otherSuspects: string[];
  evidenceKeywords: string[];
  debriefNotes: string[];
  maxHints?: number;
}

export const caseAnswerKeys: Record<string, CaseAnswerKey> = {
  // =========================================================================
  // LEVEL 1: EASY CASES (01 - 05 • NO TIMELINE BUILDER)
  // =========================================================================
  'case-01': {
    caseId: 'case-01',
    maxHints: 2,
    correctTimeline: [],
    keyEvidenceIndices: [],
    culpritKeywords: ['kiran'],
    otherSuspects: ['pranav', 'sneha', 'arjun'],
    evidenceKeywords: ['red', 'lanyard', 'ieee', 'coffee', 'stain', 'registration', 'desk'],
    debriefNotes: [
      'Culprit: Kiran — Left his coffee-stained red IEEE lanyard right beside the tampered registration laptop.',
      'Only IEEE Executive Committee members wear red lanyards, matching Kiran’s statement about spilling coffee on his red lanyard at the registration desk.',
    ],
  },
  'case-02': {
    caseId: 'case-02',
    maxHints: 2,
    correctTimeline: [],
    keyEvidenceIndices: [],
    culpritKeywords: ['chirag'],
    otherSuspects: ['meera', 'varun', 'divya'],
    evidenceKeywords: ['chirag_s23', 'samsung', 's23', 'bluetooth', 'silicone', 'case', 'curtain', '10:42'],
    debriefNotes: [
      'Culprit: Chirag — Paired his Samsung S23 to the stage speaker and dropped his phone case behind the curtain.',
      'The speaker paired log records Last Connected Device "Chirag_S23" at 10:42 AM, matching the dropped black Samsung S23 silicone case.',
    ],
  },
  'case-03': {
    caseId: 'case-03',
    maxHints: 2,
    correctTimeline: [],
    keyEvidenceIndices: [],
    culpritKeywords: ['rohan'],
    otherSuspects: ['ananya', 'siddharth', 'pooja'],
    evidenceKeywords: ['paneer', 'puff', 'mango', 'juice', 'canteen', 'receipt', '01:20', '1:20', 'judges'],
    debriefNotes: [
      'Culprit: Rohan — Dropped his 1:20 PM canteen receipt right under the judges’ table.',
      'The Canteen Counter Register confirms only Rohan ordered 2x Paneer Puff + 1x Mango Juice at 01:20 PM.',
    ],
  },
  'case-04': {
    caseId: 'case-04',
    maxHints: 2,
    correctTimeline: [],
    keyEvidenceIndices: [],
    culpritKeywords: ['manoj'],
    otherSuspects: ['kavya', 'deepak', 'neha'],
    evidenceKeywords: ['manoj_sem1_notes', 'sandisk', 'blue', 'usb', 'pendrive', 'cartoon', 'lobby', '32gb'],
    debriefNotes: [
      'Culprit: Manoj — Dropped his personal USB drive containing Manoj_Sem1_Notes right under the lobby TV.',
      'The lobby TV media history shows cartoon_prank.mp4 played from External USB right beside the dropped blue SanDisk drive.',
    ],
  },
  'case-05': {
    caseId: 'case-05',
    maxHints: 2,
    correctTimeline: [],
    keyEvidenceIndices: [],
    culpritKeywords: ['tarun'],
    otherSuspects: ['riya', 'harsha', 'nikhil'],
    evidenceKeywords: ['yellow', 'sticky', 'note', 'green', 'drawing sheets', 'decoration', 'router', 'ink'],
    debriefNotes: [
      'Culprit: Tarun — Dropped his signed green-ink reminder note right beneath the Wi-Fi router shelf.',
      'The handwritten note is signed "Tarun" in green ink, matching the Decoration Team’s green gel pens.',
    ],
  },

  // =========================================================================
  // LEVEL 2: MEDIUM CASES (06 - 15 • NO TIMELINE BUILDER)
  // =========================================================================
  'case-06': {
    caseId: 'case-06',
    maxHints: 2,
    correctTimeline: [],
    keyEvidenceIndices: [],
    culpritKeywords: ['rohan'],
    otherSuspects: ['priya', 'siddharth', 'neha'],
    evidenceKeywords: ['85%', '9%', 'battery', 'doctored', 'reused', 'screenshot', '1,200', '1200', '02:15', '2:15', 'cctv', 'ritesh'],
    debriefNotes: [
      'Culprit: Rohan — Showed a doctored/reused screenshot (85% battery) while his actual phone was dying at 9% battery on CCTV.',
      'The UPI screenshot image displays 85% battery and "From: Ritesh Luppatti", contradicting Food Stall CCTV showing Rohan’s phone at 9% battery and zero ₹1,200 bank credit.',
    ],
  },
  'case-07': {
    caseId: 'case-07',
    maxHints: 2,
    correctTimeline: [],
    keyEvidenceIndices: [],
    culpritKeywords: ['ananya'],
    otherSuspects: ['vikram', 'kavya', 'deepak'],
    evidenceKeywords: ['reflection', 'yellow', 'mug', 'blue', 'notebook', 'spiral', 'hostel', 'desk', 'instagram', '04:00'],
    debriefNotes: [
      "Culprit: Ananya — The yellow mug and blue notebook reflected in the leaked laptop photo match Ananya's study desk story.",
      "Zooming into the dark laptop screen reflection reveals a yellow ceramic mug and blue spiral notebook matching Ananya's 04:00 PM Instagram story.",
    ],
  },
  'case-08': {
    caseId: 'case-08',
    maxHints: 2,
    correctTimeline: [],
    keyEvidenceIndices: [],
    culpritKeywords: ['tarun'],
    otherSuspects: ['harsha', 'meghana', 'divya'],
    evidenceKeywords: ['409', '#409', 'vip', 'pass', 'backstage', 'torn', 'whatsapp', 'register', 'back gate'],
    debriefNotes: [
      'Culprit: Tarun — Dropped his assigned VIP Pass (#409) outside the backstage door while lying in the WhatsApp group about being at the back gate.',
      'The torn paper pass image clearly reads VIP BACKSTAGE PASS - #409, issued exclusively to Tarun in the register.',
    ],
  },
  'case-09': {
    caseId: 'case-09',
    maxHints: 2,
    correctTimeline: [],
    keyEvidenceIndices: [],
    culpritKeywords: ['nithin'],
    otherSuspects: ['swati', 'harsha', 'kavya'],
    evidenceKeywords: ['library', 'slip', '16:30', '4:45', 'bell', 'chime', 'mathematics', 'maths', 'voice note', 'railway'],
    debriefNotes: [
      'Culprit: Nithin — Dropped his 16:30 PM library slip beneath the Hall B clue board right when the 4:45 PM college bell rang.',
      'The background audio in the 04:45 PM voice note plays the campus bell chime (disproving the railway station claim) and matches Nithin checking out Engineering Maths-I.',
    ],
  },
  'case-10': {
    caseId: 'case-10',
    maxHints: 2,
    correctTimeline: [],
    keyEvidenceIndices: [],
    culpritKeywords: ['abhishek'],
    otherSuspects: ['priya', 'tejas', 'divya'],
    evidenceKeywords: ['power bank', '20,000mah', '20000', 'red', 'cable', 'table #6', 'table 6', 'bec_free_5g', 'cctv', 'two phones'],
    debriefNotes: [
      'Culprit: Abhishek — Hosted the fake Wi-Fi hotspot from Table #6 and left his power bank behind.',
      'Canteen CCTV at 02:10 PM confirms Abhishek sat alone at Table #6 with two phones plugged into the exact black power bank and red USB-C cable.',
    ],
  },
  'case-11': {
    caseId: 'case-11',
    maxHints: 2,
    correctTimeline: [],
    keyEvidenceIndices: [],
    culpritKeywords: ['arjun'],
    otherSuspects: ['meghana', 'sana', 'varun'],
    evidenceKeywords: ['purple', 'mat', 'green', 'straw', 'bean & brew', 'bean', 'cafe', 'coffee', '03:50', 'instagram'],
    debriefNotes: [
      'Culprit: Arjun — Snapped and leaked the ticket photo while sitting at Bean & Brew Cafe at 03:50 PM.',
      "The purple table mat and green straw in the leaked photo background match Bean & Brew Cafe from Arjun's 03:50 PM Instagram story.",
    ],
  },
  'case-12': {
    caseId: 'case-12',
    maxHints: 2,
    correctTimeline: [],
    keyEvidenceIndices: [],
    culpritKeywords: ['manoj'],
    otherSuspects: ['kavya', 'rakesh', 'deepak'],
    evidenceKeywords: ['bec-placemnts', 'misspelled', 'phishing', 'whatsapp', 'canteen', 'wi-fi', 'wifi', '.edu.in', '02:28', '02:30'],
    debriefNotes: [
      'Culprit: Manoj — Created and shared the misspelled phishing link in the 1st-year WhatsApp group.',
      'Manoj was the only suspect connected to Canteen Wi-Fi at 02:28 PM when the fake bec-placemnts.in domain went live before sharing it at 02:30 PM.',
    ],
  },
  'case-13': {
    caseId: 'case-13',
    maxHints: 2,
    correctTimeline: [],
    keyEvidenceIndices: [],
    culpritKeywords: ['tarun'],
    otherSuspects: ['kunal', 'sneha', 'vikash'],
    evidenceKeywords: ['nothing phone', 'nothing', '105', '#105', '108', 'sequential', 'coupon', 'burgers', '12:40', '12:45', 'cctv'],
    debriefNotes: [
      'Culprit: Tarun — Guessed sequential coupon numbers (#105–#108) on his Nothing Phone (2) to claim free burgers.',
      'App logs show coupons #105–#108 redeemed back-to-back at 12:40 PM from a Nothing Phone (2), matching Tarun on CCTV five minutes later.',
    ],
  },
  'case-14': {
    caseId: 'case-14',
    maxHints: 2,
    correctTimeline: [],
    keyEvidenceIndices: [],
    culpritKeywords: ['lokesh'],
    otherSuspects: ['neha', 'prashanth', 'vikas'],
    evidenceKeywords: ['ilovepdf', 'qr', 'cert #8821', '8821', 'metadata', 'edited', 'whatsapp', 'pdf', '04:30'],
    debriefNotes: [
      "Culprit: Lokesh — Took Neha's certificate PDF from the class group and typed his own name over hers.",
      'File history shows Winner_Cert_Lokesh.pdf was edited in iLovePDF Text Editor at 04:30 PM while the QR code still verifies Neha Kulkarni (#8821).',
    ],
  },
  'case-15': {
    caseId: 'case-15',
    maxHints: 2,
    correctTimeline: [],
    keyEvidenceIndices: [],
    culpritKeywords: ['prashanth'],
    otherSuspects: ['sagar', 'divya', 'kiran'],
    evidenceKeywords: ['ksrtc', 'bus', 'ticket', 'indi', 'bagalkote', '07:30', '7:30', 'backpack', 'blue', 'hoodies'],
    debriefNotes: [
      'Culprit: Prashanth — Dropped his morning Indi-to-Bagalkote bus ticket right in front of the merchandise stall.',
      'The 07:30 AM Indi–Bagalkote KSRTC bus ticket and the blue backpack on Stall CCTV (03:10 PM) match Prashanth.',
    ],
  },

  // =========================================================================
  // LEVEL 3: HARD CASES (16 - 30 • WITH 4-STEP TIMELINE BUILDER)
  // =========================================================================
  'case-16': {
    caseId: 'case-16',
    maxHints: 2,
    correctTimeline: [
      'Suresh writes the admin password on a yellow sticky note and sticks it onto the monitor.',
      'Kiran plugs a glowing blue USB drive into his black laptop and steps away for coffee.',
      '11:14 PM: CCTV captures the open laptop, sticky note password, and red IEEE lanyard on the desk.',
      'Someone uses the sticky note password on the open terminal to wipe the server backup logs.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['kiran'],
    otherSuspects: ['pranav', 'meera', 'suresh'],
    evidenceKeywords: ['red', 'lanyard', 'sticky', 'lab@2026', 'usb', 'blue', 'cam-04', '23:14', 'laptop', 'coffee'],
    debriefNotes: [
      'Culprit: Kiran — His red IEEE lanyard, black laptop, and blue USB drive appear on CAM-04 right before the log wipe.',
      'Although Suresh wrote the sticky note earlier, Kiran stayed past 11:10 PM as confirmed by the 23:14:08 CCTV snapshot.',
    ],
  },
  'case-17': {
    caseId: 'case-17',
    maxHints: 2,
    correctTimeline: [
      'All four participants take their assigned seats in Lab-04 before the quiz begins.',
      '03:42 PM: The Wi-Fi system detects a traffic overload crashing the quiz portal.',
      "Router logs confirm the culprit's laptop is inside Router A and Router B's circles, but outside Router C.",
      'Checking the floor plan pinpoints Seat 3 as the exact location of the culprit.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['vikram'],
    otherSuspects: ['rohan', 'sneha', 'ananya'],
    evidenceKeywords: ['seat 3', 'router a', 'router b', 'router c', 'outside', 'overlap', 'circle', '03:42', 'map'],
    debriefNotes: [
      "Culprit: Vikram — Seat 3 is the only desk inside both Router A and B's circles while remaining outside Router C's range.",
      'Router logs at 03:42 PM show CONNECTED to Router A & B and NO SIGNAL on Router C, eliminating Seats 1, 2, and 4.',
    ],
  },
  'case-18': {
    caseId: 'case-18',
    maxHints: 2,
    correctTimeline: [
      'Ananya rushes onto the auditorium stage, accidentally leaving her MacBook unlocked backstage.',
      "05:29 PM: Tushar walks up to the backstage table and types on Ananya's MacBook for 10 seconds.",
      "The scoreboard wipe executes from Ananya's silver MacBook under her admin account.",
      'Ananya finishes her stage announcement and discovers the scoreboard has been deleted.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['tushar'],
    otherSuspects: ['ananya', 'vikram', 'priya'],
    evidenceKeywords: ['unlocked', 'macbook', 'backstage', 'cctv', '17:29', '5:29', 'livestream', 'stage', 'framed', 'scoreboard'],
    debriefNotes: [
      "Culprit: Tushar — Used Ananya's unlocked MacBook backstage while she was speaking live on stage, framing her account.",
      'The stage livestream confirms Ananya held the microphone from 17:20 to 17:40, while backstage CCTV shows Tushar typing on her MacBook at 17:29 PM.',
    ],
  },
  'case-19': {
    caseId: 'case-19',
    maxHints: 2,
    correctTimeline: [
      "Darshan's smartwatch strap snaps near the registration desk, and he asks about it on WhatsApp.",
      "Nikhil picks up Darshan's lost watch from the registration desk floor.",
      "04:38 PM: Nikhil walks into the coordinator's room while Meghana is away and wipes the scoreboard.",
      "Nikhil drops Darshan's watch under the desk to frame him while rushing out.",
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['nikhil'],
    otherSuspects: ['darshan', 'meghana', 'harsha'],
    evidenceKeywords: ['smartwatch', 'boat', 'watch', 'strap', 'planted', 'frame', '04:20', '04:38', 'cctv', 'whatsapp'],
    debriefNotes: [
      "Culprit: Nikhil — Picked up Darshan's lost watch and dropped it at the crime scene to frame him.",
      "Darshan reported his broken watch at 04:15 PM on WhatsApp, and CCTV shows Nikhil picking it up at 04:20 PM before walking into the coordinator's room at 04:38 PM.",
    ],
  },
  'case-20': {
    caseId: 'case-20',
    maxHints: 2,
    correctTimeline: [
      'Kavya locks the 20 VIP burger coupons inside Room 304.',
      '12:50 PM: Siddharth signs out the spare key for Room 304 from the register.',
      'Siddharth walks out of Room 304 carrying his blue backpack with the missing coupons.',
      'Volunteers find the dropped emoji cipher slip outside the locker room.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['siddharth'],
    otherSuspects: ['kavya', 'rohan', 'ananya'],
    evidenceKeywords: ['304', 'room 304', 'blue backpack', 'backpack', 'key', '12:50', '01:05', 'emoji', 'coupons', 'burger'],
    debriefNotes: [
      'Culprit: Siddharth — Signed out the Room 304 key and hid the coupons inside his blue backpack.',
      'The emoji cipher decodes to Key + Room 304 -> Burger Coupons -> Blue Backpack, matching the 12:50 PM key register and 01:05 PM corridor CCTV.',
    ],
  },
  'case-21': {
    caseId: 'case-21',
    maxHints: 2,
    correctTimeline: [
      'Sneha takes the 5:00–6:00 PM shift to store decoration ribbons.',
      'Aarav takes the 6:00–7:00 PM shift and leaves the trophy untouched on the shelf.',
      '07:30 PM: Meera is alone inside the storage room during the 7:00–8:00 PM shift when the trophy vanishes.',
      'Varun enters at 8:00 PM and reports the trophy missing.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['meera'],
    otherSuspects: ['sneha', 'aarav', 'varun'],
    evidenceKeywords: ['7-8', '7–8', '7:00', '07:30', 'slot', 'shift', 'trophy', 'after aarav', 'storage'],
    debriefNotes: [
      'Culprit: Meera — Alibi elimination proves Meera was the only person inside the storage room during the 7:00–8:00 PM slot.',
      'Since Sneha took 5–6 PM, Varun took 8–9 PM, and Meera entered right after Aarav (6–7 PM), only Meera was present at 07:30 PM.',
    ],
  },
  'case-22': {
    caseId: 'case-22',
    maxHints: 2,
    correctTimeline: [
      'Priya, Kavya, and Deepak travel out of town for the weekend.',
      '03:00 PM: The final tie-breaker question paper is leaked online.',
      'Rohan generates a fake AI wedding selfie to pretend he was out of town.',
      'Inspecting the selfie reveals garbled banner text and six fingers, exposing the fake alibi.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['rohan'],
    otherSuspects: ['priya', 'kavya', 'deepak'],
    evidenceKeywords: ['ai', 'fake', 'selfie', 'wedding', '6-finger', 'six', 'fingers', 'gibberish', 'banner', 'garbled'],
    debriefNotes: [
      'Culprit: Rohan — Generated an AI fake wedding selfie to cover up leaking the tie-breaker paper.',
      'Only Rohan’s selfie shows AI artifacts (a 6-fingered hand and garbled banner text), while Priya, Kavya, and Deepak have verified travel timestamps.',
    ],
  },
  'case-23': {
    caseId: 'case-23',
    maxHints: 2,
    correctTimeline: [
      "Riya shares the lighting vendor's official QR code with the finance team.",
      'Manish completes the ₹2,500 banner payment to PrintHub Posters.',
      '02:14 PM: ₹18,000 is transferred from the fest account to Karan_Personal_UPI.',
      'Karan crops and edits the UTR number on a fake receipt screenshot to hide his UPI ID.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['karan'],
    otherSuspects: ['divya', 'manish', 'riya'],
    evidenceKeywords: ['utr', '9-digit', '9 digits', '12', '632284910', 'karan_personal_upi', '18,000', '18000', '02:14', 'cropped'],
    debriefNotes: [
      'Culprit: Karan — Transferred ₹18,000 to his personal UPI ID and fabricated a receipt with a shortened 9-digit UTR.',
      'Genuine Indian UPI UTRs are 12 digits (632284910447); the fest bank statement shows the 02:14 PM debit actually went to Karan_Personal_UPI.',
    ],
  },
  'case-24': {
    caseId: 'case-24',
    maxHints: 2,
    correctTimeline: [
      'Class Rep Rahul collects the attendance sheets and hands them to Prof. Sharma.',
      "04:05 PM: Someone tries to log into Prof. Sharma's portal account twice with the wrong password.",
      'The attacker resets the password using the pet name "Bruno" from a browser with CR bookmarks.',
      "Aditya's attendance is manually updated from 42% to 85% in the portal.",
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['rahul'],
    otherSuspects: ['aditya', 'divya', 'neha'],
    evidenceKeywords: ['bruno', 'instagram', 'pet', 'security question', 'bec_cr_notices', 'bookmark', 'class_attendance_sheet', '85%', '04:07'],
    debriefNotes: [
      "Culprit: Rahul — Used Prof. Sharma's public Instagram post to reset the password and edit Aditya's attendance.",
      'Browser bookmarks BEC_CR_Notices and Class_Attendance_Sheet tie the 04:07 PM password reset directly to the Class Representative laptop.',
    ],
  },
  'case-25': {
    caseId: 'case-25',
    maxHints: 2,
    correctTimeline: [
      'Student Secretary Naveen submits the official auditorium booking request.',
      '09:32 AM: A fake email pretending to be from the Dean is sent using an online fake-email website.',
      "The security guard reads the fake email on Naveen's phone and unlocks the auditorium.",
      'The esports group sets up their gaming laptops inside the main auditorium.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['naveen'],
    otherSuspects: ['riya', 'kabir', 'omkar'],
    evidenceKeywords: ['free-fake-mail.cz', 'free-fake-mail', 'spoof', '09:31', '09:32', 'mailer', 'dean', 'auditorium', 'wi-fi'],
    debriefNotes: [
      'Culprit: Naveen — Sent himself a fake approval email from free-fake-mail.cz to trick the security guard.',
      "Wi-Fi logs show Naveen's phone visited free-fake-mail.cz at 09:31 AM, one minute before the spoofed email arrived.",
    ],
  },
  'case-26': {
    caseId: 'case-26',
    maxHints: 2,
    correctTimeline: [
      '08:45 AM: Before the workshop starts, Suraj plugs a tiny black USB keylogger behind the podium PC.',
      'The guest speaker types his cloud portal password on the podium keyboard.',
      'During lunch break, Suraj returns to the stage and unplugs the USB adapter.',
      "Unauthorized logins from Suraj's hostel room appear on the guest speaker's account.",
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['suraj'],
    otherSuspects: ['aryan', 'nikhita', 'tarun'],
    evidenceKeywords: ['keylogger', 'adapter', 'usb', 'keyboard', '08:45', '01:02', '02:15', 'room 204', 'podium', 'cctv'],
    debriefNotes: [
      'Culprit: Suraj — Attached a physical USB keylogger to the podium keyboard before the talk and retrieved the password at lunch.',
      'Because a hardware keylogger sits inline on the cable, resetting the PC software afterward did not erase the captured credentials.',
    ],
  },
  'case-27': {
    caseId: 'case-27',
    maxHints: 2,
    correctTimeline: [
      "The robotics team saves their 5-meter flight plan onto the drone's memory card.",
      '03:20 PM: While the team goes for safety clearance, Ritesh edits the target height from 5m to 0m.',
      'During the live demo, the drone refuses to lift off and spins on the ground.',
      'Checking the memory card file properties shows it was edited during the 3:20 PM break.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['ritesh'],
    otherSuspects: ['tejas', 'aishwarya', 'harish'],
    evidenceKeywords: ['flight_plan', '03:20', '3:20', 'card reader', 'memory card', '0m', 'target height', 'cctv', 'edited'],
    debriefNotes: [
      "Culprit: Ritesh — Edited Team Skyhawk's memory card at 03:20 PM while they were away at the judge inspection desk.",
      'File timestamps confirm flight_plan.txt was modified at 03:20 PM when CCTV shows Ritesh with a memory card reader at Skyhawk’s desk.',
    ],
  },
  'case-28': {
    caseId: 'case-28',
    maxHints: 2,
    correctTimeline: [
      'The digital notice board in the lobby is set up with its default factory password.',
      '04:25 PM: Darshan connects to the lobby display from his HP laptop and uploads holiday.png.',
      'The lobby screen suddenly displays "Tomorrow is a Holiday" in giant red letters.',
      'The HOD walks past the lobby screen and calls the organizers immediately.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['darshan'],
    otherSuspects: ['charan', 'pooja', 'dinesh'],
    evidenceKeywords: ['darshan-hp-laptop', 'hp laptop', 'raspberry', 'default', 'holiday.png', '04:25', 'sofa', 'cctv'],
    debriefNotes: [
      'Culprit: Darshan — Logged into the lobby screen with its default password from his HP laptop and uploaded the fake holiday banner.',
      'The screen log records Darshan-HP-Laptop using default password "raspberry" at 04:25 PM while CCTV shows Darshan on the lobby sofa with his HP laptop.',
    ],
  },
  'case-29': {
    caseId: 'case-29',
    maxHints: 2,
    correctTimeline: [
      'The hackathon judges save their final Excel score sheet on the seminar hall desktop.',
      '05:25 PM: Tejas plugs his USB drive into the desktop PC while pretending to adjust the HDMI cable.',
      "Tejas shares photos of the judges' secret scores in his team's private WhatsApp group.",
      'Windows USB history confirms TEJAS_USB was connected during the coffee break.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['tejas'],
    otherSuspects: ['rohan', 'shashank', 'keerthi'],
    evidenceKeywords: ['tejas_usb', 'sandisk', 'final_scores', 'hdmi', '05:25', '5:25', 'usb', 'podium', 'cctv'],
    debriefNotes: [
      'Culprit: Tejas — Plugged his TEJAS_USB drive into the unattended PC while feigning an HDMI check and copied the scores.',
      'Windows USB history records volume TEJAS_USB copying Final_Scores.xlsx at 05:25 PM, matching Seminar Hall CCTV.',
    ],
  },
  'case-30': {
    caseId: 'case-30',
    maxHints: 2,
    correctTimeline: [
      'Two minutes before concert tickets go live, Chetan starts an auto-clicker script on his laptop.',
      "07:00 PM: The ticket booking page opens, and Chetan's script grabs all 30 passes in 3 seconds.",
      'Regular students see "Sold Out" within sixty seconds of the launch.',
      'Website logs confirm all 30 bookings came from usr_chetan_881.',
    ],
    keyEvidenceIndices: [],
    culpritKeywords: ['chetan'],
    otherSuspects: ['advait', 'meera', 'devansh'],
    evidenceKeywords: ['usr_chetan_881', 'auto-clicker', 'script', '3 seconds', '30', 'hostel block c', '07:00', 'asus'],
    debriefNotes: [
      'Culprit: Chetan — Used an auto-clicker script from his hostel laptop to grab all 30 VIP passes in 3 seconds.',
      'All 30 bookings executed between 07:00:00 and 07:00:03 under account usr_chetan_881 traced to Chetan’s laptop in Hostel Block C.',
    ],
  },
};

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

function getCaseMaxScoreById(caseId: string): number {
  const num = Number(caseId.replace(/\D+/g, ''));
  if (num >= 1 && num <= 5) return 50;
  if (num >= 6 && num <= 15) return 75;
  return 100;
}

export function evaluateAnswerSummary(key: CaseAnswerKey, report: string, maxPoints = 50) {
  const trimmed = report.trim();
  const halfPoints = Math.round(maxPoints / 2);
  if (!trimmed) {
    return {
      summaryScore: 0,
      maxPoints,
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

  const extraSuspectNames = key.otherSuspects.filter((name) => isExtraSuspectAccused(lower, name));
  const extraSuspectCount = extraSuspectNames.length;
  const penaltyPerExtra = maxPoints >= 100 ? 30 : maxPoints >= 75 ? 25 : 15;
  const multiCulpritPenalty = extraSuspectCount * penaltyPerExtra;

  const nameTokensToExclude = new Set([...key.culpritKeywords, ...key.otherSuspects]);
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
  const culpritPoints = culpritMatched ? halfPoints : 0;
  const infoMax = maxPoints - halfPoints;
  const singleWordCredit = Math.round(infoMax * 0.6);
  const cluePoints = culpritMatched
    ? hasInfo
      ? infoMax
      : meaningfulInfoWords.length === 1
      ? singleWordCredit
      : 0
    : clueHits > 0
    ? Math.min(Math.round(maxPoints * 0.3), clueHits * Math.max(5, Math.round(maxPoints * 0.1)))
    : meaningfulInfoWords.length >= 3
    ? Math.round(maxPoints * 0.1)
    : 0;

  const summaryScore = Math.max(
    0,
    Math.min(maxPoints, culpritPoints + cluePoints - multiCulpritPenalty)
  );

  return {
    summaryScore,
    maxPoints,
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
  const hasTimeline = totalSteps > 0;
  const maxScore = getCaseMaxScoreById(caseId);
  const summaryMax = hasTimeline ? 50 : maxScore;

  let timelineMatches = 0;
  for (let i = 0; i < totalSteps; i += 1) {
    if (timelineOrder[i] === key.correctTimeline[i]) timelineMatches += 1;
  }

  const perStepPoints = hasTimeline ? 50 / totalSteps : 0;
  const sequenceScore = hasTimeline ? Number((timelineMatches * perStepPoints).toFixed(2)) : undefined;
  const summaryEval = evaluateAnswerSummary(key, report, summaryMax);
  const rawScore = (sequenceScore ?? 0) + summaryEval.summaryScore - hintsUsed * 5;
  const finalScore = Math.max(0, Math.min(maxScore, Math.round(rawScore)));
  const perStepLabel = hasTimeline ? Number(perStepPoints.toFixed(1)).toString() : '0';
  const halfMax = Math.round(summaryMax / 2);

  const summaryDetailParts = [
    `Culprit ${summaryEval.culpritMatched ? 'identified' : 'missing'} (${summaryEval.culpritPoints}/${halfMax})`,
    `Info & clues (${summaryEval.cluePoints}/${summaryMax - halfMax})`,
  ];
  if (summaryEval.extraSuspectCount > 0) {
    summaryDetailParts.push(
      `Multiple culprit names penalty (-${summaryEval.multiCulpritPenalty} pts for ${summaryEval.extraSuspectCount} extra suspect${summaryEval.extraSuspectCount === 1 ? '' : 's'})`
    );
  }

  const explanations = [
    ...(hasTimeline
      ? [
          {
            title: 'Sequence recognition (50 pts)',
            correct: timelineMatches === totalSteps,
            explanation: `${timelineMatches} of ${totalSteps} orders matched (${sequenceScore} / 50 pts · ${perStepLabel} pts each).`,
          },
        ]
      : []),
    {
      title: hasTimeline ? 'Answer summary (50 pts)' : `Answer summary (${summaryMax} pts)`,
      correct: summaryEval.summaryScore >= Math.round(summaryMax * 0.7),
      explanation: `${summaryEval.summaryScore} / ${summaryMax} pts — ${summaryDetailParts.join(' · ')}.`,
    },
    ...key.debriefNotes.map((note, idx) => ({
      title: `Forensic finding 0${idx + 1}`,
      correct: true,
      explanation: note,
    })),
  ];

  const message = hasTimeline
    ? `Sequence ${sequenceScore}/50 (${timelineMatches}/${totalSteps} × ${perStepLabel} pts) + Summary ${summaryEval.summaryScore}/50.`
    : `Answer summary ${summaryEval.summaryScore}/${summaryMax} (No timeline required for this case).`;

  return {
    score: finalScore,
    maxScore,
    sequenceScore,
    summaryScore: summaryEval.summaryScore,
    timelineMatches,
    totalTimeline: totalSteps,
    hintsUsed,
    elapsedSeconds: Math.max(1, elapsedSeconds),
    submittedAt: new Date().toISOString(),
    explanations,
    message,
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
