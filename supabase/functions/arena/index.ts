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
  // =========================================================================
  // LEVEL 1: EASY CASES (01 - 05 • NO TIMELINE BUILDER)
  // =========================================================================
  'case-01': {
    maxHints: 2,
    correctTimeline: [],
    debriefNotes: [
      'Culprit: Kiran — Left his coffee-stained red IEEE lanyard right beside the tampered registration laptop.',
      'Only IEEE Executive Committee members wear red lanyards, matching Kiran’s statement about spilling coffee on his red lanyard at the registration desk.',
    ],
  },
  'case-02': {
    maxHints: 2,
    correctTimeline: [],
    debriefNotes: [
      'Culprit: Chirag — Paired his Samsung S23 to the stage speaker and dropped his phone case behind the curtain.',
      'The speaker paired log records Last Connected Device "Chirag_S23" at 10:42 AM, matching the dropped black Samsung S23 silicone case.',
    ],
  },
  'case-03': {
    maxHints: 2,
    correctTimeline: [],
    debriefNotes: [
      'Culprit: Rohan — Dropped his 1:20 PM canteen receipt right under the judges’ table.',
      'The Canteen Counter Register confirms only Rohan ordered 2x Paneer Puff + 1x Mango Juice at 01:20 PM.',
    ],
  },
  'case-04': {
    maxHints: 2,
    correctTimeline: [],
    debriefNotes: [
      'Culprit: Manoj — Dropped his personal USB drive containing Manoj_Sem1_Notes right under the lobby TV.',
      'The lobby TV media history shows cartoon_prank.mp4 played from External USB right beside the dropped blue SanDisk drive.',
    ],
  },
  'case-05': {
    maxHints: 2,
    correctTimeline: [],
    debriefNotes: [
      'Culprit: Tarun — Dropped his signed green-ink reminder note right beneath the Wi-Fi router shelf.',
      'The handwritten note is signed "Tarun" in green ink, matching the Decoration Team’s green gel pens.',
    ],
  },

  // =========================================================================
  // LEVEL 2: MEDIUM CASES (06 - 15 • NO TIMELINE BUILDER)
  // =========================================================================
  'case-06': {
    maxHints: 2,
    correctTimeline: [],
    debriefNotes: [
      'Culprit: Rohan — Showed a doctored/reused screenshot (85% battery) while his actual phone was dying at 9% battery on CCTV.',
      'The UPI screenshot image displays 85% battery and "From: Ritesh Luppatti", contradicting Food Stall CCTV showing Rohan’s phone at 9% battery and zero ₹1,200 bank credit.',
    ],
  },
  'case-07': {
    maxHints: 2,
    correctTimeline: [],
    debriefNotes: [
      "Culprit: Ananya — The yellow mug and blue notebook reflected in the leaked laptop photo match Ananya's study desk story.",
      "Zooming into the dark laptop screen reflection reveals a yellow ceramic mug and blue spiral notebook matching Ananya's 04:00 PM Instagram story.",
    ],
  },
  'case-08': {
    maxHints: 2,
    correctTimeline: [],
    debriefNotes: [
      'Culprit: Tarun — Dropped his assigned VIP Pass (#409) outside the backstage door while lying in the WhatsApp group about being at the back gate.',
      'The torn paper pass image clearly reads VIP BACKSTAGE PASS - #409, issued exclusively to Tarun in the register.',
    ],
  },
  'case-09': {
    maxHints: 2,
    correctTimeline: [],
    debriefNotes: [
      'Culprit: Nithin — Dropped his 16:30 PM library slip beneath the Hall B clue board right when the 4:45 PM college bell rang.',
      'The background audio in the 04:45 PM voice note plays the campus bell chime (disproving the railway station claim) and matches Nithin checking out Engineering Maths-I.',
    ],
  },
  'case-10': {
    maxHints: 2,
    correctTimeline: [],
    debriefNotes: [
      'Culprit: Abhishek — Hosted the fake Wi-Fi hotspot from Table #6 and left his power bank behind.',
      'Canteen CCTV at 02:10 PM confirms Abhishek sat alone at Table #6 with two phones plugged into the exact black power bank and red USB-C cable.',
    ],
  },
  'case-11': {
    maxHints: 2,
    correctTimeline: [],
    debriefNotes: [
      'Culprit: Arjun — Snapped and leaked the ticket photo while sitting at Bean & Brew Cafe at 03:50 PM.',
      "The purple table mat and green straw in the leaked photo background match Bean & Brew Cafe from Arjun's 03:50 PM Instagram story.",
    ],
  },
  'case-12': {
    maxHints: 2,
    correctTimeline: [],
    debriefNotes: [
      'Culprit: Manoj — Created and shared the misspelled phishing link in the 1st-year WhatsApp group.',
      'Manoj was the only suspect connected to Canteen Wi-Fi at 02:28 PM when the fake bec-placemnts.in domain went live before sharing it at 02:30 PM.',
    ],
  },
  'case-13': {
    maxHints: 2,
    correctTimeline: [],
    debriefNotes: [
      'Culprit: Tarun — Guessed sequential coupon numbers (#105–#108) on his Nothing Phone (2) to claim free burgers.',
      'App logs show coupons #105–#108 redeemed back-to-back at 12:40 PM from a Nothing Phone (2), matching Tarun on CCTV five minutes later.',
    ],
  },
  'case-14': {
    maxHints: 2,
    correctTimeline: [],
    debriefNotes: [
      "Culprit: Lokesh — Took Neha's certificate PDF from the class group and typed his own name over hers.",
      'File history shows Winner_Cert_Lokesh.pdf was edited in iLovePDF Text Editor at 04:30 PM while the QR code still verifies Neha Kulkarni (#8821).',
    ],
  },
  'case-15': {
    maxHints: 2,
    correctTimeline: [],
    debriefNotes: [
      'Culprit: Prashanth — Dropped his morning Indi-to-Bagalkote bus ticket right in front of the merchandise stall.',
      'The 07:30 AM Indi–Bagalkote KSRTC bus ticket and the blue backpack on Stall CCTV (03:10 PM) match Prashanth.',
    ],
  },

  // =========================================================================
  // LEVEL 3: HARD CASES (16 - 30 • WITH 4-STEP TIMELINE BUILDER)
  // =========================================================================
  'case-16': {
    maxHints: 2,
    correctTimeline: [
      'Suresh writes the admin password on a yellow sticky note and sticks it onto the monitor.',
      'Kiran plugs a glowing blue USB drive into his black laptop and steps away for coffee.',
      '11:14 PM: CCTV captures the open laptop, sticky note password, and red IEEE lanyard on the desk.',
      'Someone uses the sticky note password on the open terminal to wipe the server backup logs.',
    ],
    debriefNotes: [
      'Culprit: Kiran — His red IEEE lanyard, black laptop, and blue USB drive appear on CAM-04 right before the log wipe.',
      'Although Suresh wrote the sticky note earlier, Kiran stayed past 11:10 PM as confirmed by the 23:14:08 CCTV snapshot.',
    ],
  },
  'case-17': {
    maxHints: 2,
    correctTimeline: [
      'All four participants take their assigned seats in Lab-04 before the quiz begins.',
      '03:42 PM: The Wi-Fi system detects a traffic overload crashing the quiz portal.',
      "Router logs confirm the culprit's laptop is inside Router A and Router B's circles, but outside Router C.",
      'Checking the floor plan pinpoints Seat 3 as the exact location of the culprit.',
    ],
    debriefNotes: [
      "Culprit: Vikram — Seat 3 is the only desk inside both Router A and B's circles while remaining outside Router C's range.",
      'Router logs at 03:42 PM show CONNECTED to Router A & B and NO SIGNAL on Router C, eliminating Seats 1, 2, and 4.',
    ],
  },
  'case-18': {
    maxHints: 2,
    correctTimeline: [
      'Ananya rushes onto the auditorium stage, accidentally leaving her MacBook unlocked backstage.',
      "05:29 PM: Tushar walks up to the backstage table and types on Ananya's MacBook for 10 seconds.",
      "The scoreboard wipe executes from Ananya's silver MacBook under her admin account.",
      'Ananya finishes her stage announcement and discovers the scoreboard has been deleted.',
    ],
    debriefNotes: [
      "Culprit: Tushar — Used Ananya's unlocked MacBook backstage while she was speaking live on stage, framing her account.",
      'The stage livestream confirms Ananya held the microphone from 17:20 to 17:40, while backstage CCTV shows Tushar typing on her MacBook at 17:29 PM.',
    ],
  },
  'case-19': {
    maxHints: 2,
    correctTimeline: [
      "Darshan's smartwatch strap snaps near the registration desk, and he asks about it on WhatsApp.",
      "Nikhil picks up Darshan's lost watch from the registration desk floor.",
      "04:38 PM: Nikhil walks into the coordinator's room while Meghana is away and wipes the scoreboard.",
      "Nikhil drops Darshan's watch under the desk to frame him while rushing out.",
    ],
    debriefNotes: [
      "Culprit: Nikhil — Picked up Darshan's lost watch and dropped it at the crime scene to frame him.",
      "Darshan reported his broken watch at 04:15 PM on WhatsApp, and CCTV shows Nikhil picking it up at 04:20 PM before walking into the coordinator's room at 04:38 PM.",
    ],
  },
  'case-20': {
    maxHints: 2,
    correctTimeline: [
      'Kavya locks the 20 VIP burger coupons inside Room 304.',
      '12:50 PM: Siddharth signs out the spare key for Room 304 from the register.',
      'Siddharth walks out of Room 304 carrying his blue backpack with the missing coupons.',
      'Volunteers find the dropped emoji cipher slip outside the locker room.',
    ],
    debriefNotes: [
      'Culprit: Siddharth — Signed out the Room 304 key and hid the coupons inside his blue backpack.',
      'The emoji cipher decodes to Key + Room 304 -> Burger Coupons -> Blue Backpack, matching the 12:50 PM key register and 01:05 PM corridor CCTV.',
    ],
  },
  'case-21': {
    maxHints: 2,
    correctTimeline: [
      'Sneha takes the 5:00–6:00 PM shift to store decoration ribbons.',
      'Aarav takes the 6:00–7:00 PM shift and leaves the trophy untouched on the shelf.',
      '07:30 PM: Meera is alone inside the storage room during the 7:00–8:00 PM shift when the trophy vanishes.',
      'Varun enters at 8:00 PM and reports the trophy missing.',
    ],
    debriefNotes: [
      'Culprit: Meera — Alibi elimination proves Meera was the only person inside the storage room during the 7:00–8:00 PM slot.',
      'Since Sneha took 5–6 PM, Varun took 8–9 PM, and Meera entered right after Aarav (6–7 PM), only Meera was present at 07:30 PM.',
    ],
  },
  'case-22': {
    maxHints: 2,
    correctTimeline: [
      'Priya, Kavya, and Deepak travel out of town for the weekend.',
      '03:00 PM: The final tie-breaker question paper is leaked online.',
      'Rohan generates a fake AI wedding selfie to pretend he was out of town.',
      'Inspecting the selfie reveals garbled banner text and six fingers, exposing the fake alibi.',
    ],
    debriefNotes: [
      'Culprit: Rohan — Generated an AI fake wedding selfie to cover up leaking the tie-breaker paper.',
      'Only Rohan’s selfie shows AI artifacts (a 6-fingered hand and garbled banner text), while Priya, Kavya, and Deepak have verified travel timestamps.',
    ],
  },
  'case-23': {
    maxHints: 2,
    correctTimeline: [
      "Riya shares the lighting vendor's official QR code with the finance team.",
      'Manish completes the ₹2,500 banner payment to PrintHub Posters.',
      '02:14 PM: ₹18,000 is transferred from the fest account to Karan_Personal_UPI.',
      'Karan crops and edits the UTR number on a fake receipt screenshot to hide his UPI ID.',
    ],
    debriefNotes: [
      'Culprit: Karan — Transferred ₹18,000 to his personal UPI ID and fabricated a receipt with a shortened 9-digit UTR.',
      'Genuine Indian UPI UTRs are 12 digits (632284910447); the fest bank statement shows the 02:14 PM debit actually went to Karan_Personal_UPI.',
    ],
  },
  'case-24': {
    maxHints: 2,
    correctTimeline: [
      'Class Rep Rahul collects the attendance sheets and hands them to Prof. Sharma.',
      "04:05 PM: Someone tries to log into Prof. Sharma's portal account twice with the wrong password.",
      'The attacker resets the password using the pet name "Bruno" from a browser with CR bookmarks.',
      "Aditya's attendance is manually updated from 42% to 85% in the portal.",
    ],
    debriefNotes: [
      "Culprit: Rahul — Used Prof. Sharma's public Instagram post to reset the password and edit Aditya's attendance.",
      'Browser bookmarks BEC_CR_Notices and Class_Attendance_Sheet tie the 04:07 PM password reset directly to the Class Representative laptop.',
    ],
  },
  'case-25': {
    maxHints: 2,
    correctTimeline: [
      'Student Secretary Naveen submits the official auditorium booking request.',
      '09:32 AM: A fake email pretending to be from the Dean is sent using an online fake-email website.',
      "The security guard reads the fake email on Naveen's phone and unlocks the auditorium.",
      'The esports group sets up their gaming laptops inside the main auditorium.',
    ],
    debriefNotes: [
      'Culprit: Naveen — Sent himself a fake approval email from free-fake-mail.cz to trick the security guard.',
      "Wi-Fi logs show Naveen's phone visited free-fake-mail.cz at 09:31 AM, one minute before the spoofed email arrived.",
    ],
  },
  'case-26': {
    maxHints: 2,
    correctTimeline: [
      '08:45 AM: Before the workshop starts, Suraj plugs a tiny black USB keylogger behind the podium PC.',
      'The guest speaker types his cloud portal password on the podium keyboard.',
      'During lunch break, Suraj returns to the stage and unplugs the USB adapter.',
      "Unauthorized logins from Suraj's hostel room appear on the guest speaker's account.",
    ],
    debriefNotes: [
      'Culprit: Suraj — Attached a physical USB keylogger to the podium keyboard before the talk and retrieved the password at lunch.',
      'Because a hardware keylogger sits inline on the cable, resetting the PC software afterward did not erase the captured credentials.',
    ],
  },
  'case-27': {
    maxHints: 2,
    correctTimeline: [
      "The robotics team saves their 5-meter flight plan onto the drone's memory card.",
      '03:20 PM: While the team goes for safety clearance, Ritesh edits the target height from 5m to 0m.',
      'During the live demo, the drone refuses to lift off and spins on the ground.',
      'Checking the memory card file properties shows it was edited during the 3:20 PM break.',
    ],
    debriefNotes: [
      "Culprit: Ritesh — Edited Team Skyhawk's memory card at 03:20 PM while they were away at the judge inspection desk.",
      'File timestamps confirm flight_plan.txt was modified at 03:20 PM when CCTV shows Ritesh with a memory card reader at Skyhawk’s desk.',
    ],
  },
  'case-28': {
    maxHints: 2,
    correctTimeline: [
      'The digital notice board in the lobby is set up with its default factory password.',
      '04:25 PM: Darshan connects to the lobby display from his HP laptop and uploads holiday.png.',
      'The lobby screen suddenly displays "Tomorrow is a Holiday" in giant red letters.',
      'The HOD walks past the lobby screen and calls the organizers immediately.',
    ],
    debriefNotes: [
      'Culprit: Darshan — Logged into the lobby screen with its default password from his HP laptop and uploaded the fake holiday banner.',
      'The screen log records Darshan-HP-Laptop using default password "raspberry" at 04:25 PM while CCTV shows Darshan on the lobby sofa with his HP laptop.',
    ],
  },
  'case-29': {
    maxHints: 2,
    correctTimeline: [
      'The hackathon judges save their final Excel score sheet on the seminar hall desktop.',
      '05:25 PM: Tejas plugs his USB drive into the desktop PC while pretending to adjust the HDMI cable.',
      "Tejas shares photos of the judges' secret scores in his team's private WhatsApp group.",
      'Windows USB history confirms TEJAS_USB was connected during the coffee break.',
    ],
    debriefNotes: [
      'Culprit: Tejas — Plugged his TEJAS_USB drive into the unattended PC while feigning an HDMI check and copied the scores.',
      'Windows USB history records volume TEJAS_USB copying Final_Scores.xlsx at 05:25 PM, matching Seminar Hall CCTV.',
    ],
  },
  'case-30': {
    maxHints: 2,
    correctTimeline: [
      'Two minutes before concert tickets go live, Chetan starts an auto-clicker script on his laptop.',
      "07:00 PM: The ticket booking page opens, and Chetan's script grabs all 30 passes in 3 seconds.",
      'Regular students see "Sold Out" within sixty seconds of the launch.',
      'Website logs confirm all 30 bookings came from usr_chetan_881.',
    ],
    debriefNotes: [
      'Culprit: Chetan — Used an auto-clicker script from his hostel laptop to grab all 30 VIP passes in 3 seconds.',
      'All 30 bookings executed between 07:00:00 and 07:00:03 under account usr_chetan_881 traced to Chetan’s laptop in Hostel Block C.',
    ],
  },
};

const summaryCriteria: Record<
  string,
  { culprit: string[]; others: string[]; clues: string[] }
> = {
  'case-01': { culprit: ['kiran'], others: ['pranav', 'sneha', 'arjun'], clues: ['red', 'lanyard', 'ieee', 'coffee', 'stain', 'registration', 'desk'] },
  'case-02': { culprit: ['chirag'], others: ['meera', 'varun', 'divya'], clues: ['chirag_s23', 'samsung', 's23', 'bluetooth', 'silicone', 'case', 'curtain', '10:42'] },
  'case-03': { culprit: ['rohan'], others: ['ananya', 'siddharth', 'pooja'], clues: ['paneer', 'puff', 'mango', 'juice', 'canteen', 'receipt', '01:20', '1:20', 'judges'] },
  'case-04': { culprit: ['manoj'], others: ['kavya', 'deepak', 'neha'], clues: ['manoj_sem1_notes', 'sandisk', 'blue', 'usb', 'pendrive', 'cartoon', 'lobby', '32gb'] },
  'case-05': { culprit: ['tarun'], others: ['riya', 'harsha', 'nikhil'], clues: ['yellow', 'sticky', 'note', 'green', 'drawing sheets', 'decoration', 'router', 'ink'] },
  'case-06': { culprit: ['rohan'], others: ['priya', 'siddharth', 'neha'], clues: ['85%', '9%', 'battery', 'doctored', 'reused', 'screenshot', '1,200', '1200', '02:15', '2:15', 'cctv', 'ritesh'] },
  'case-07': { culprit: ['ananya'], others: ['vikram', 'kavya', 'deepak'], clues: ['reflection', 'yellow', 'mug', 'blue', 'notebook', 'spiral', 'hostel', 'desk', 'instagram', '04:00'] },
  'case-08': { culprit: ['tarun'], others: ['harsha', 'meghana', 'divya'], clues: ['409', '#409', 'vip', 'pass', 'backstage', 'torn', 'whatsapp', 'register', 'back gate'] },
  'case-09': { culprit: ['nithin'], others: ['swati', 'harsha', 'kavya'], clues: ['library', 'slip', '16:30', '4:45', 'bell', 'chime', 'mathematics', 'maths', 'voice note', 'railway'] },
  'case-10': { culprit: ['abhishek'], others: ['priya', 'tejas', 'divya'], clues: ['power bank', '20,000mah', '20000', 'red', 'cable', 'table #6', 'table 6', 'bec_free_5g', 'cctv', 'two phones'] },
  'case-11': { culprit: ['arjun'], others: ['meghana', 'sana', 'varun'], clues: ['purple', 'mat', 'green', 'straw', 'bean & brew', 'bean', 'cafe', 'coffee', '03:50', 'instagram'] },
  'case-12': { culprit: ['manoj'], others: ['kavya', 'rakesh', 'deepak'], clues: ['bec-placemnts', 'misspelled', 'phishing', 'whatsapp', 'canteen', 'wi-fi', 'wifi', '.edu.in', '02:28', '02:30'] },
  'case-13': { culprit: ['tarun'], others: ['kunal', 'sneha', 'vikash'], clues: ['nothing phone', 'nothing', '105', '#105', '108', 'sequential', 'coupon', 'burgers', '12:40', '12:45', 'cctv'] },
  'case-14': { culprit: ['lokesh'], others: ['neha', 'prashanth', 'vikas'], clues: ['ilovepdf', 'qr', 'cert #8821', '8821', 'metadata', 'edited', 'whatsapp', 'pdf', '04:30'] },
  'case-15': { culprit: ['prashanth'], others: ['sagar', 'divya', 'kiran'], clues: ['ksrtc', 'bus', 'ticket', 'indi', 'bagalkote', '07:30', '7:30', 'backpack', 'blue', 'hoodies'] },
  'case-16': { culprit: ['kiran'], others: ['pranav', 'meera', 'suresh'], clues: ['red', 'lanyard', 'sticky', 'lab@2026', 'usb', 'blue', 'cam-04', '23:14', 'laptop', 'coffee'] },
  'case-17': { culprit: ['vikram'], others: ['rohan', 'sneha', 'ananya'], clues: ['seat 3', 'router a', 'router b', 'router c', 'outside', 'overlap', 'circle', '03:42', 'map'] },
  'case-18': { culprit: ['tushar'], others: ['ananya', 'vikram', 'priya'], clues: ['unlocked', 'macbook', 'backstage', 'cctv', '17:29', '5:29', 'livestream', 'stage', 'framed', 'scoreboard'] },
  'case-19': { culprit: ['nikhil'], others: ['darshan', 'meghana', 'harsha'], clues: ['smartwatch', 'boat', 'watch', 'strap', 'planted', 'frame', '04:20', '04:38', 'cctv', 'whatsapp'] },
  'case-20': { culprit: ['siddharth'], others: ['kavya', 'rohan', 'ananya'], clues: ['304', 'room 304', 'blue backpack', 'backpack', 'key', '12:50', '01:05', 'emoji', 'coupons', 'burger'] },
  'case-21': { culprit: ['meera'], others: ['sneha', 'aarav', 'varun'], clues: ['7-8', '7–8', '7:00', '07:30', 'slot', 'shift', 'trophy', 'after aarav', 'storage'] },
  'case-22': { culprit: ['rohan'], others: ['priya', 'kavya', 'deepak'], clues: ['ai', 'fake', 'selfie', 'wedding', '6-finger', 'six', 'fingers', 'gibberish', 'banner', 'garbled'] },
  'case-23': { culprit: ['karan'], others: ['divya', 'manish', 'riya'], clues: ['utr', '9-digit', '9 digits', '12', '632284910', 'karan_personal_upi', '18,000', '18000', '02:14', 'cropped'] },
  'case-24': { culprit: ['rahul'], others: ['aditya', 'divya', 'neha'], clues: ['bruno', 'instagram', 'pet', 'security question', 'bec_cr_notices', 'bookmark', 'class_attendance_sheet', '85%', '04:07'] },
  'case-25': { culprit: ['naveen'], others: ['riya', 'kabir', 'omkar'], clues: ['free-fake-mail.cz', 'free-fake-mail', 'spoof', '09:31', '09:32', 'mailer', 'dean', 'auditorium', 'wi-fi'] },
  'case-26': { culprit: ['suraj'], others: ['aryan', 'nikhita', 'tarun'], clues: ['keylogger', 'adapter', 'usb', 'keyboard', '08:45', '01:02', '02:15', 'room 204', 'podium', 'cctv'] },
  'case-27': { culprit: ['ritesh'], others: ['tejas', 'aishwarya', 'harish'], clues: ['flight_plan', '03:20', '3:20', 'card reader', 'memory card', '0m', 'target height', 'cctv', 'edited'] },
  'case-28': { culprit: ['darshan'], others: ['charan', 'pooja', 'dinesh'], clues: ['darshan-hp-laptop', 'hp laptop', 'raspberry', 'default', 'holiday.png', '04:25', 'sofa', 'cctv'] },
  'case-29': { culprit: ['tejas'], others: ['rohan', 'shashank', 'keerthi'], clues: ['tejas_usb', 'sandisk', 'final_scores', 'hdmi', '05:25', '5:25', 'usb', 'podium', 'cctv'] },
  'case-30': { culprit: ['chetan'], others: ['advait', 'meera', 'devansh'], clues: ['usr_chetan_881', 'auto-clicker', 'script', '3 seconds', '30', 'hostel block c', '07:00', 'asus'] },
};

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

function getCaseMaxScoreById(caseId: string): number {
  const num = Number(caseId.replace(/\D+/g, ''));
  if (num >= 1 && num <= 5) return 50;
  if (num >= 6 && num <= 15) return 75;
  return 100;
}

function evaluateAnswerSummary(caseId: string, report: string, maxPoints = 50) {
  const trimmed = report.trim();
  const criteria = summaryCriteria[caseId];
  const halfPoints = Math.round(maxPoints / 2);
  if (!trimmed || !criteria) {
    return {
      summaryScore: 0,
      maxPoints,
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

  const extraSuspectNames = criteria.others.filter((name) =>
    isExtraSuspectAccused(lower, name)
  );
  const extraSuspectCount = extraSuspectNames.length;
  const penaltyPerExtra = maxPoints >= 100 ? 30 : maxPoints >= 75 ? 25 : 15;
  const multiCulpritPenalty = extraSuspectCount * penaltyPerExtra;

  const nameTokensToExclude = new Set([...criteria.culprit, ...criteria.others]);
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
      const [{ data, error }, { data: orderedTeams }] = await Promise.all([
        adminClient
          .from('teams')
          .select('id, name, invite_code')
          .contains('member_ids', [user.id]),
        adminClient
          .from('teams')
          .select('id')
          .order('created_at', { ascending: true }),
      ]);
      if (error) return json({ error: error.message }, 400);
      const slotById = new Map((orderedTeams || []).map((row, idx) => [row.id, idx]));
      return json({
        teams: (data || []).map((t) => ({
          id: t.id,
          name: t.name,
          inviteCode: t.invite_code,
          slot: slotById.get(t.id) ?? 0,
        })),
      });
    }

    if (action === 'createTeam') {
      const accessCode = String(payload.accessCode || '').trim();
      const expectedCode = Deno.env.get('REGISTRATION_ACCESS_CODE') || 'Avion@2026';
      if (!accessCode || accessCode !== expectedCode) {
        return json(
          { error: 'Invalid access code. Please contact the organizer for the valid access code.' },
          403
        );
      }
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

      const [{ count }, { data: orderedTeams }] = await Promise.all([
        adminClient.from('teams').select('id', { count: 'exact', head: true }),
        adminClient.from('teams').select('id').order('created_at', { ascending: true }),
      ]);
      await adminClient.from('stats').upsert({ id: 1, registered_teams: count ?? 1 });
      const slotIndex = (orderedTeams || []).findIndex((row) => row.id === team.id);

      return json({
        id: team.id,
        name: team.name,
        inviteCode: team.invite_code,
        slot: slotIndex >= 0 ? slotIndex : Math.max(0, (count ?? 1) - 1),
      });
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

      const { data: team } = await adminClient
        .from('teams')
        .select('id')
        .eq('id', teamId)
        .contains('member_ids', [user.id])
        .maybeSingle();
      if (!team) return json({ error: 'Team membership required.' }, 403);

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
      const { data: team } = await adminClient
        .from('teams')
        .select('id')
        .eq('id', teamId)
        .contains('member_ids', [user.id])
        .maybeSingle();
      if (!team) return json({ error: 'Team membership required.' }, 403);
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
      const { data: team } = await adminClient
        .from('teams')
        .select('id')
        .eq('id', teamId)
        .contains('member_ids', [user.id])
        .maybeSingle();
      if (!team) return json({ error: 'Team membership required.' }, 403);
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
        .contains('member_ids', [user.id])
        .maybeSingle();
      if (!team) return json({ error: 'Team membership required.' }, 403);

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
      const hasTimeline = totalSteps > 0;
      const maxScore = getCaseMaxScoreById(caseId);
      const summaryMax = hasTimeline ? 50 : maxScore;
      let timelineMatches = 0;
      for (let i = 0; i < totalSteps; i += 1) {
        if (timelineOrder[i] === key.correctTimeline[i]) timelineMatches += 1;
      }

      const perStepPoints = hasTimeline ? 50 / totalSteps : 0;
      const sequenceScore = hasTimeline
        ? Number((timelineMatches * perStepPoints).toFixed(2))
        : undefined;
      const summaryEval = evaluateAnswerSummary(caseId, reportText, summaryMax);
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

      const caseResult = {
        score: finalScore,
        maxScore,
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

      const { error: rankError } = await adminClient.from('rankings').upsert(
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
      if (rankError) return json({ error: rankError.message }, 400);

      if (session) {
        await adminClient.from('sessions').update({ completed: true }).eq('id', session.id);
      }

      const message = hasTimeline
        ? `Sequence ${sequenceScore}/50 (${timelineMatches}/${totalSteps} × ${perStepLabel} pts) + Summary ${summaryEval.summaryScore}/50.`
        : `Answer summary ${summaryEval.summaryScore}/${summaryMax} (No timeline required for this case).`;

      return json({
        ...caseResult,
        message,
      });
    }

    if (action === 'syncLocalScores') {
      const teamId = String(payload.teamId || '');
      const { data: team } = await adminClient
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .contains('member_ids', [user.id])
        .maybeSingle();
      if (!team) return json({ error: 'Team membership required.' }, 403);

      const incoming =
        payload.caseScores && typeof payload.caseScores === 'object'
          ? (payload.caseScores as Record<string, Record<string, unknown>>)
          : {};

      const { data: existingRank } = await adminClient
        .from('rankings')
        .select('*')
        .eq('team_id', team.id)
        .maybeSingle();

      const caseScores: Record<string, unknown> = { ...(existingRank?.case_scores || {}) };
      let changed = false;

      for (const [caseId, item] of Object.entries(incoming)) {
        if (!caseAnswerKeys[caseId] || !item || typeof item !== 'object') continue;
        if (Object.hasOwn(caseScores, caseId)) continue;
        const maxScore = getCaseMaxScoreById(caseId);
        const safeScore =
          typeof item.score === 'number' && Number.isFinite(item.score)
            ? Math.max(0, Math.min(maxScore, Math.round(item.score)))
            : 0;
        const safeElapsed =
          typeof item.elapsedSeconds === 'number' && Number.isFinite(item.elapsedSeconds)
            ? Math.max(1, Math.min(3600, Math.round(item.elapsedSeconds)))
            : 60;
        caseScores[caseId] = {
          score: safeScore,
          maxScore,
          sequenceScore:
            typeof item.sequenceScore === 'number' ? item.sequenceScore : undefined,
          summaryScore:
            typeof item.summaryScore === 'number' ? item.summaryScore : undefined,
          hintsUsed:
            typeof item.hintsUsed === 'number' ? Math.max(0, Math.round(item.hintsUsed)) : 0,
          elapsedSeconds: safeElapsed,
          submittedAt:
            typeof item.submittedAt === 'string' ? item.submittedAt : new Date().toISOString(),
          timelineMatches:
            typeof item.timelineMatches === 'number' ? item.timelineMatches : 0,
          totalTimeline:
            typeof item.totalTimeline === 'number'
              ? item.totalTimeline
              : caseAnswerKeys[caseId].correctTimeline.length,
          explanations: Array.isArray(item.explanations) ? item.explanations : [],
        };
        changed = true;
      }

      if (changed) {
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
        const { error: rankError } = await adminClient.from('rankings').upsert(
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
        if (rankError) return json({ error: rankError.message }, 400);
      }

      return json({ synced: changed });
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
      const [teamsRes, rankingsRes] = await Promise.all([
        adminClient.from('teams').select('id, name, member_ids'),
        adminClient.from('rankings').select('*').order('score', { ascending: false }).limit(500),
      ]);
      if (teamsRes.error) return json({ error: teamsRes.error.message }, 400);
      return json({
        teams: (teamsRes.data || []).map((t) => ({
          id: t.id,
          name: t.name,
          memberCount: Array.isArray(t.member_ids) ? t.member_ids.length : 0,
        })),
        rankings: rankingsRes.error ? [] : rankingsRes.data || [],
      });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Server error' }, 500);
  }
});
