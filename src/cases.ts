export type CaseDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface CaseEvidence {
  type: string;
  title: string;
  detail: string;
  image?: string;
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
  difficulty: CaseDifficulty;
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

export function getCaseMaxScore(difficulty: CaseDifficulty): number {
  if (difficulty === 'Easy') return 50;
  if (difficulty === 'Medium') return 75;
  return 100;
}

export const cases: InvestigationCase[] = [
  // =========================================================================
  // LEVEL 1: EASY CASES (CASES 01 - 05 • CONFIDENCE BOOSTERS • NO TIMELINE)
  // =========================================================================
  {
    id: 'case-01',
    title: 'The Dropped ID Lanyard',
    subtitle: 'Dropped Item & Color-Code Register',
    category: 'Physical Clue & Color Code',
    difficulty: 'Easy',
    duration: 5,
    icon: 'key',
    color: 'cyan',
    briefing:
      'Someone unlocked the Avon registration laptop during break and changed team names to memes. A red IEEE committee lanyard was found dropped right beside the laptop.',
    incident: 'Dropped red IEEE lanyard and volunteer logistics color register.',
    evidence: [
      {
        type: 'DROPPED ITEM',
        title: 'Dropped Item at Scene',
        detail:
          'A red lanyard with a badge holder that has a fresh coffee stain on the corner.',
      },
      {
        type: 'LOGISTICS NOTE',
        title: 'Volunteer Logistics Note',
        detail:
          'Only IEEE Executive Committee members wear red lanyards; general volunteers wear blue lanyards, and participants wear green lanyards.',
      },
    ],
    suspects: [
      {
        name: 'Kiran',
        role: 'IEEE Committee Member',
        note: 'I was at the registration desk earlier, yeah, and I spilled coffee on my red lanyard before walking to the auditorium!',
      },
      {
        name: 'Pranav',
        role: 'General Volunteer',
        note: 'I wear a blue lanyard and was handing out water bottles near the main gate all morning.',
      },
      {
        name: 'Sneha',
        role: '1st-Year Participant',
        note: 'I wear a green participant lanyard and was sitting in the third row waiting for the event to start.',
      },
      {
        name: 'Arjun',
        role: 'Sound Technician',
        note: 'I wear a black staff tag and was up in the balcony testing the speakers.',
      },
    ],
    timeline: [],
    hints: [
      'Check which team wears red lanyards according to the Volunteer Logistics Note.',
      "Match the coffee-stained red lanyard to Kiran's statement.",
    ],
  },
  {
    id: 'case-02',
    title: 'The Rogue Bluetooth Speaker',
    subtitle: 'Dropped Phone Case & Bluetooth Device Name',
    category: 'Bluetooth & Device Forensics',
    difficulty: 'Easy',
    duration: 5,
    icon: 'scan',
    color: 'indigo',
    briefing:
      "Right before the chief guest's speech, loud DJ horn sounds blasted from the main stage Bluetooth speaker. A black silicone phone case was found dropped near the stage curtain.",
    incident: 'Dropped Samsung S23 silicone case and speaker paired device log.',
    evidence: [
      {
        type: 'DROPPED ITEM',
        title: 'Dropped Item at Scene',
        detail: 'A black Samsung S23 silicone phone case found behind the stage curtain.',
      },
      {
        type: 'DEVICE LOG',
        title: 'Speaker Paired Device Log',
        detail: 'Last Connected Device: "Chirag_S23" | Connected at: 10:42 AM',
      },
    ],
    suspects: [
      {
        name: 'Chirag',
        role: 'Stage Volunteer',
        note: 'I use a Samsung S23, yeah, I was standing near the stage curtain checking my playlist!',
      },
      {
        name: 'Meera',
        role: 'Event Anchor',
        note: 'I use an iPhone 14 and was holding the cue cards on stage.',
      },
      {
        name: 'Varun',
        role: 'Photography Lead',
        note: 'I was outside taking photos of the welcome banner.',
      },
      {
        name: 'Divya',
        role: 'Hospitality Lead',
        note: 'I was at the entrance welcoming the guests with bouquets.',
      },
    ],
    timeline: [],
    hints: [
      'Look at the device name shown in the Speaker Paired Device Log (Chirag_S23).',
      'Match the dropped Samsung S23 case and device name to the suspects.',
    ],
  },
  {
    id: 'case-03',
    title: 'The Dropped Canteen Receipt',
    subtitle: 'Dropped Food Bill & Counter Register',
    category: 'Physical Clue & Order Match',
    difficulty: 'Easy',
    duration: 5,
    icon: 'footprints',
    color: 'amber',
    briefing:
      "Someone snuck into the judges' room during lunch and snapped a photo of the winner list. A crumpled canteen receipt was found dropped under the judges' table.",
    incident: 'Crumpled 01:20 PM canteen receipt and lunch counter register.',
    evidence: [
      {
        type: 'DROPPED ITEM',
        title: 'Dropped Item at Scene',
        detail: 'Canteen receipt stamped today at 01:20 PM for 2x Paneer Puff + 1x Mango Juice.',
      },
      {
        type: 'COUNTER REGISTER',
        title: 'Canteen Counter Register',
        detail: 'Only Rohan ordered 2x Paneer Puff + 1x Mango Juice during the lunch break.',
      },
    ],
    suspects: [
      {
        name: 'Rohan',
        role: 'Catering Volunteer',
        note: "I bought two paneer puffs and a mango juice at 1:20 PM and walked past the judges' corridor!",
      },
      {
        name: 'Ananya',
        role: 'Scorekeeper',
        note: 'I brought homemade chapatis for lunch and ate in the green room.',
      },
      {
        name: 'Siddharth',
        role: 'Decoration Head',
        note: 'I was busy fixing balloons at the main entrance during lunch.',
      },
      {
        name: 'Pooja',
        role: 'Event Host',
        note: 'I stayed on stage rehearsing the prize announcement.',
      },
    ],
    timeline: [],
    hints: [
      'Check the food items printed on the dropped canteen receipt.',
      'Match that exact order to the Canteen Counter Register.',
    ],
  },
  {
    id: 'case-04',
    title: 'The Dropped USB Pen Drive',
    subtitle: 'Dropped Flash Drive & Folder Name',
    category: 'USB & Media Forensics',
    difficulty: 'Easy',
    duration: 5,
    icon: 'database',
    color: 'emerald',
    briefing:
      'The Avon promo video on the lobby TV was replaced with a funny cartoon clip. A blue SanDisk 32GB USB drive was found dropped right below the lobby TV.',
    incident: 'Dropped blue SanDisk USB drive and lobby TV external media history.',
    evidence: [
      {
        type: 'DROPPED ITEM',
        title: 'Dropped Item at Scene',
        detail: 'Blue SanDisk USB drive containing a single folder named Manoj_Sem1_Notes.',
      },
      {
        type: 'MEDIA LOG',
        title: 'Lobby TV Media History',
        detail: 'Last Played File: cartoon_prank.mp4 (Source: External USB)',
      },
    ],
    suspects: [
      {
        name: 'Manoj',
        role: '1st-Year Participant',
        note: 'I lost my blue SanDisk pen drive with my Sem 1 notes near the lobby earlier today!',
      },
      {
        name: 'Kavya',
        role: 'Media Coordinator',
        note: 'I only use the official silver metal pendrive kept in the control room.',
      },
      {
        name: 'Deepak',
        role: 'Security Volunteer',
        note: 'I was stationed at the parking gate all morning.',
      },
      {
        name: 'Neha',
        role: 'Helpdesk Volunteer',
        note: 'I never left the registration counter.',
      },
    ],
    timeline: [],
    hints: [
      'Look at the folder name stored inside the dropped USB drive.',
      'Match Manoj_Sem1_Notes to the suspect list.',
    ],
  },
  {
    id: 'case-05',
    title: 'The Dropped Sticky Note',
    subtitle: 'Dropped Handwritten Note & Pen Color',
    category: 'Physical Evidence & Ink Match',
    difficulty: 'Easy',
    duration: 5,
    icon: 'fingerprint',
    color: 'violet',
    briefing:
      "Someone logged into the coordinator's Wi-Fi router and changed the hotspot password, disconnecting everyone. A yellow sticky note was found dropped near the router shelf.",
    incident: 'Signed green-ink sticky note and stationery distribution log.',
    evidence: [
      {
        type: 'DROPPED ITEM',
        title: 'Dropped Item at Scene',
        detail:
          'A yellow sticky note with green-ink handwriting: "Remind me to buy drawing sheets — Tarun".',
      },
      {
        type: 'STATIONERY LOG',
        title: 'Stationery Log',
        detail: 'Only the Decoration Team uses green gel pens for poster labeling.',
      },
    ],
    suspects: [
      {
        name: 'Tarun',
        role: 'Decoration Team',
        note: 'I always write reminders with my green pen on yellow sticky notes! I was hanging banners near the router shelf earlier.',
      },
      {
        name: 'Riya',
        role: 'Quiz Master',
        note: 'I was inside the seminar hall preparing the buzzer rounds.',
      },
      {
        name: 'Harsha',
        role: 'Tech Volunteer',
        note: 'I was fixing projector cables in Lab 2.',
      },
      {
        name: 'Nikhil',
        role: 'Sponsorship Lead',
        note: 'I was escorting sponsors to the VIP lounge.',
      },
    ],
    timeline: [],
    hints: [
      'Read the signature written at the bottom of the dropped yellow sticky note.',
      'Confirm which suspect belongs to the Decoration Team and uses green pens.',
    ],
  },

  // =========================================================================
  // LEVEL 2: MEDIUM CASES (CASES 06 - 15 • TWO-CLUE DETECTIVE WORK • NO TIMELINE)
  // =========================================================================
  {
    id: 'case-06',
    title: 'The Fake Food Stall UPI Receipt',
    subtitle: 'Visual Screenshot Inspection & CCTV Battery Check',
    category: 'Visual Forensics & Payment Fraud',
    difficulty: 'Medium',
    duration: 5,
    icon: 'scan',
    color: 'rose',
    briefing:
      'At 2:15 PM, a student ordered ₹1,200 worth of snacks at the fest food stall and showed a "Payment Successful" UPI screenshot. At closing, the stall\'s bank account showed zero ₹1,200 credit.',
    incident: 'UPI payment screenshot image, Food Stall CCTV battery observation, and bank statement.',
    evidence: [
      {
        type: 'IMAGE EVIDENCE',
        title: 'UPI Payment Screenshot (02:15 PM)',
        detail: 'UPI payment screenshot shown to the food stall volunteer at 02:15 PM.',
        image: '/assets/cases/case-06-upi.png',
      },
      {
        type: 'CCTV LOG',
        title: 'Food Stall CCTV Log (02:15 PM)',
        detail:
          'A student in a black hoodie shows his phone at 02:15 PM; his screen clearly displays a red low-battery warning (9%) before dimming.',
      },
      {
        type: 'BANK STATEMENT',
        title: 'Stall Bank Statement',
        detail: '02:10 PM: ₹150 (Priya_K) | 02:22 PM: ₹300 (Siddharth_M). No ₹1,200 payment received.',
      },
    ],
    suspects: [
      {
        name: 'Rohan',
        role: '1st-Year Mech',
        note: 'I paid ₹1,200 at 2:15 PM! My phone battery was at 9% and died right after I walked away.',
      },
      {
        name: 'Priya',
        role: '1st-Year CSE',
        note: 'I only bought one sandwich for ₹150 at 2:10 PM. Check the bank statement!',
      },
      {
        name: 'Siddharth',
        role: '2nd-Year Civil',
        note: 'I paid ₹300 for coffees at 2:22 PM. My phone had 85% battery from my power bank.',
      },
      {
        name: 'Neha',
        role: 'Stall Volunteer',
        note: 'The rush was huge at 2:15 PM, so I only glanced at the green checkmark on his phone.',
      },
    ],
    timeline: [],
    hints: [
      'Look at the phone battery percentage (85%) in the top-right corner of the UPI receipt image.',
      "Compare that 85% battery against the CCTV note at 02:15 PM, which confirms the buyer's phone was at 9%.",
    ],
  },
  {
    id: 'case-07',
    title: 'The Leaked Avon Poster Reflection',
    subtitle: 'Screen Reflection & Instagram Story Matching',
    category: 'Visual Reflection & OSINT',
    difficulty: 'Medium',
    duration: 5,
    icon: 'globe',
    color: 'cyan',
    briefing:
      'The official Avon Fest 2026 launch poster was leaked on an anonymous Instagram page before the reveal. Only four design team volunteers had the file.',
    incident: 'Leaked laptop screen photo with glass reflection and 04:00 PM Instagram stories.',
    evidence: [
      {
        type: 'IMAGE EVIDENCE',
        title: 'Leaked Poster Laptop Photo',
        detail: 'Leaked photo of the Avon Fest 2026 poster open on a laptop screen.',
        image: '/assets/cases/case-07-reflection.png',
      },
      {
        type: 'OSINT / STORIES',
        title: 'Suspect Instagram Stories (04:00 PM)',
        detail:
          'Ananya: Photo of her study desk featuring a yellow ceramic mug and a blue spiral notebook. | Vikram: Selfie sitting outside on the library steps reading a paperback novel. | Kavya: Boomerang holding a paper tea cup at the main gate stall. | Deepak: Photo from the outdoor basketball court during practice.',
      },
    ],
    suspects: [
      {
        name: 'Ananya',
        role: 'Design Volunteer',
        note: "I was at my hostel desk drinking coffee and studying at 4:00 PM! I didn't open the poster.",
      },
      {
        name: 'Vikram',
        role: 'Poster Lead',
        note: 'My laptop was inside my backpack while I was sitting on the library steps.',
      },
      {
        name: 'Kavya',
        role: 'Social Media',
        note: 'I was at the main gate tea stall from 3:45 PM to 4:30 PM.',
      },
      {
        name: 'Deepak',
        role: 'Video Editor',
        note: 'I was playing basketball all afternoon; my laptop was locked in my room.',
      },
    ],
    timeline: [],
    hints: [
      'Zoom into the dark glass reflection on the laptop screen—what two items are sitting in front of the laptop?',
      "Match the yellow mug and blue spiral notebook with the suspects' 04:00 PM Instagram stories.",
    ],
  },
  {
    id: 'case-08',
    title: 'The Torn VIP Backstage Pass',
    subtitle: 'Dropped QR Pass & Issue Register',
    category: 'Visual Inspection & Pass Audit',
    difficulty: 'Medium',
    duration: 5,
    icon: 'key',
    color: 'indigo',
    briefing:
      'Someone sneaked into the VIP backstage lounge during the evening concert. Security found a torn paper pass lying on the floor outside the backstage door.',
    incident: 'Torn VIP pass photo, pass issue register, and 07:30 PM WhatsApp group message.',
    evidence: [
      {
        type: 'IMAGE EVIDENCE',
        title: 'Torn Paper Pass Photo',
        detail: 'Torn paper pass found on the floor outside the backstage door.',
        image: '/assets/cases/case-08-vip-pass.png',
      },
      {
        type: 'REGISTER',
        title: 'VIP Pass Issue Register',
        detail: '#407: Harsha | #408: Meghana | #409: Tarun | #410: Divya',
      },
      {
        type: 'CHAT LOG',
        title: 'WhatsApp Group Chat (07:30 PM)',
        detail:
          'Tarun: "Bro I\'m stuck at the back gate with the general crowd, security isn\'t letting anyone backstage!"',
      },
    ],
    suspects: [
      {
        name: 'Tarun',
        role: '1st-Year ISE',
        note: 'I never went near the backstage door! I was standing at the back gate all evening.',
      },
      {
        name: 'Harsha',
        role: '1st-Year ECE',
        note: 'I used my pass (#407) at the front VIP entrance and stayed in the front row.',
      },
      {
        name: 'Meghana',
        role: '2nd-Year CSE',
        note: 'I still have my pass (#408) clipped right here on my lanyard!',
      },
      {
        name: 'Divya',
        role: '2nd-Year ISE',
        note: 'I returned my pass (#410) to the coordinator at 6:00 PM before leaving early.',
      },
    ],
    timeline: [],
    hints: [
      'Read the pass number printed below the QR code on the torn pass image (#409).',
      'Look up Pass #409 in the VIP Pass Issue Register.',
    ],
  },
  {
    id: 'case-09',
    title: 'The Voice Note Alibi & Dropped Library Slip',
    subtitle: 'Background Audio Clue & Dropped Book Slip',
    category: 'Audio Clue & Alibi Check',
    difficulty: 'Medium',
    duration: 5,
    icon: 'footprints',
    color: 'emerald',
    briefing:
      'Someone scribbled spoilers on the Cyber Mystery clue board in Hall B at 4:45 PM. A blue library book due-date slip was found dropped under the clue board.',
    incident: 'Stamped 16:30 PM library due-date slip and 04:45 PM voice note audio.',
    evidence: [
      {
        type: 'DROPPED ITEM',
        title: 'Dropped Item at Scene',
        detail: 'Library slip stamped today (16:30 PM) for "Engineering Mathematics-I".',
      },
      {
        type: 'AUDIO CLIP',
        title: 'Voice Note Clip (04:45 PM)',
        detail:
          'Suspected culprit sent a voice note saying "I\'m at the railway station picking up my cousin!"—but background audio clearly plays the college 4:45 PM bell chime (no train sounds).',
      },
    ],
    suspects: [
      {
        name: 'Nithin',
        role: '1st-Year CSE',
        note: 'I issued Engineering Maths-I from the library at 4:30 PM, then walked past Hall B right when the 4:45 PM bell rang!',
      },
      {
        name: 'Swati',
        role: '1st-Year ECE',
        note: 'I was at Bagalkote railway station from 4:15 PM to 5:15 PM—you can hear trains in the background of my calls!',
      },
      {
        name: 'Harsha',
        role: '1st-Year Mech',
        note: "I didn't visit the library today; I was in the mechanical workshop.",
      },
      {
        name: 'Kavya',
        role: '2nd-Year ISE',
        note: 'I was hosting the quiz inside Hall A the entire afternoon.',
      },
    ],
    timeline: [],
    hints: [
      'Check what sound is heard in the background of the 04:45 PM voice note—is it trains or the college bell?',
      'Match the 16:30 PM library slip to the suspect who checked out Engineering Maths-I.',
    ],
  },
  {
    id: 'case-10',
    title: 'The Dropped Power Bank & Fake Wi-Fi',
    subtitle: 'Dropped Item & Canteen CCTV Cross-Check',
    category: 'Rogue Wi-Fi & Hardware Clue',
    difficulty: 'Medium',
    duration: 5,
    icon: 'globe',
    color: 'amber',
    briefing:
      'Someone created a fake Wi-Fi hotspot named BEC_Free_5G in the canteen to trick students into typing their portal passwords. A black 20,000mAh power bank with a red cable was found dropped under Canteen Table #6.',
    incident: 'Dropped Mi power bank with red cable and Canteen CCTV at 02:10 PM.',
    evidence: [
      {
        type: 'DROPPED ITEM',
        title: 'Dropped Item at Scene',
        detail: 'Black Mi 20,000mAh power bank with a red braided USB-C cable under Table #6.',
      },
      {
        type: 'CCTV LOG',
        title: 'Canteen CCTV (02:10 PM)',
        detail:
          'Shows Abhishek sitting alone at Table #6 with two phones plugged into a black power bank with a red cable.',
      },
    ],
    suspects: [
      {
        name: 'Abhishek',
        role: '1st-Year CSE',
        note: 'I was sitting at Canteen Table #6 charging my two phones with my red cable, yeah—I forgot my power bank when I left!',
      },
      {
        name: 'Priya',
        role: '1st-Year ISE',
        note: "I ate lunch at Table #1 with my friends and didn't carry a power bank.",
      },
      {
        name: 'Tejas',
        role: '2nd-Year Mech',
        note: 'I was in the auditorium helping set up chairs.',
      },
      {
        name: 'Divya',
        role: '1st-Year Civil',
        note: "My phone was at 100% charge all day; I don't even own a power bank.",
      },
    ],
    timeline: [],
    hints: [
      'Check the canteen CCTV log at 02:10 PM for Table #6.',
      'Match the black power bank and red cable to the suspect at Table #6.',
    ],
  },
  {
    id: 'case-11',
    title: 'The Leaked Fest Headliner',
    subtitle: 'OSINT Background Matching & Cafe Receipt',
    category: 'OSINT & Background Analysis',
    difficulty: 'Medium',
    duration: 5,
    icon: 'sun',
    color: 'violet',
    briefing:
      "An anonymous account leaked the concert headliner's flight ticket on Instagram at 4:00 PM. Only four coordinators knew the artist's name.",
    incident: 'Leaked ticket background items and 03:50 PM suspect Instagram stories.',
    evidence: [
      {
        type: 'PHOTO EVIDENCE',
        title: 'Leaked Ticket Photo (04:00 PM)',
        detail:
          'In the background corner, a purple table mat and a cold coffee glass with a green straw are visible.',
      },
      {
        type: 'OSINT / STORIES',
        title: 'Suspect Instagram Stories (03:50 PM)',
        detail:
          'Arjun: Posted an iced Americano at Bean & Brew Cafe (Cafe uses purple table mats and green straws). | Meghana: Mirror selfie in her hostel room. | Sana: Boomerang on the auditorium stage doing mic checks. | Varun: Strava GPS map showing a 5 km run around town from 03:30 to 04:15 PM.',
      },
    ],
    suspects: [
      {
        name: 'Arjun',
        role: 'Sponsorship Head',
        note: 'I grabbed a quick coffee at Bean & Brew at 3:50 PM, yes, but kept my phone in my pocket!',
      },
      {
        name: 'Meghana',
        role: 'Design Head',
        note: 'I was in my hostel room getting ready until 4:30 PM.',
      },
      {
        name: 'Sana',
        role: 'Stage Coord',
        note: 'I was on stage doing sound checks from 3:30 PM onward.',
      },
      {
        name: 'Varun',
        role: 'Media Head',
        note: 'My Strava running map proves I was jogging 5 km away.',
      },
    ],
    timeline: [],
    hints: [
      'Look at the background items in the leaked ticket photo (purple table mat and green straw).',
      "Match those cafe items to Arjun's 03:50 PM Instagram story at Bean & Brew Cafe.",
    ],
  },
  {
    id: 'case-12',
    title: 'The Fake Internship WhatsApp Link',
    subtitle: 'Misspelled Domain Link & Group Chat Timestamps',
    category: 'Phishing & Link Analysis',
    difficulty: 'Medium',
    duration: 5,
    icon: 'mail',
    color: 'rose',
    briefing:
      'Ten 1st-year students typed their college passwords into a fake summer internship link shared on the batch WhatsApp group.',
    incident: 'WhatsApp chat log, official college domain rule, and Canteen Wi-Fi connection log.',
    evidence: [
      {
        type: 'CHAT LOG',
        title: 'WhatsApp Chat Log (02:30 PM)',
        detail: "Manoj shared: https://bec-placemnts.in/apply (Missing 'e' in placements)",
      },
      {
        type: 'OFFICIAL NOTICE',
        title: 'Official Placement Notice',
        detail: 'Real college links always end in .edu.in, never .in with spelling errors.',
      },
      {
        type: 'WI-FI LOG',
        title: 'Canteen Wi-Fi Log',
        detail:
          'Manoj was the only suspect connected to Canteen Wi-Fi when the fake link went live at 02:28 PM.',
      },
    ],
    suspects: [
      {
        name: 'Manoj',
        role: '1st-Year CSE',
        note: "I only forwarded the link on WhatsApp so friends wouldn't miss the deadline!",
      },
      {
        name: 'Kavya',
        role: '1st-Year CSE',
        note: 'I warned the group chat that the link was misspelled and fake.',
      },
      {
        name: 'Rakesh',
        role: '1st-Year Civil',
        note: 'I clicked the link from my hostel room at 2:35 PM and lost my account.',
      },
      {
        name: 'Deepak',
        role: '1st-Year Mech',
        note: 'My phone was locked in my bag during workshop lab from 1:00 to 4:00 PM.',
      },
    ],
    timeline: [],
    hints: [
      'Notice the spelling mistake in bec-placemnts.in shared at 02:30 PM.',
      'Check who posted the fake link first and was online at the canteen when it went live.',
    ],
  },
  {
    id: 'case-13',
    title: 'The Fake Food Coupon Numbers',
    subtitle: 'Sequential Coupon Guessing & Stall CCTV',
    category: 'IDOR & Sequential Coupon Abuse',
    difficulty: 'Medium',
    duration: 5,
    icon: 'code',
    color: 'cyan',
    briefing:
      'Four students found their fest food coupons already marked "Redeemed" after someone manually typed sequential coupon numbers on their phone.',
    incident: 'Coupon app redemption log and 12:45 PM Food Stall CCTV footage.',
    evidence: [
      {
        type: 'APP LOG',
        title: 'Coupon App Log (12:40 PM)',
        detail:
          'Coupons #105, #106, #107, and #108 redeemed back-to-back from Phone Model: Nothing Phone (2)',
      },
      {
        type: 'CCTV LOG',
        title: 'Food Stall CCTV (12:45 PM)',
        detail: 'Shows Tarun holding a Nothing Phone (2) and collecting 4 burgers at Counter 1.',
      },
    ],
    suspects: [
      {
        name: 'Tarun',
        role: '1st-Year ECE',
        note: 'I bought 4 coupons for my friends! Yes, I use a Nothing Phone (2).',
      },
      {
        name: 'Kunal',
        role: 'App Volunteer',
        note: 'I numbered coupons #101, #102, #103 in order—anyone could guess the next number!',
      },
      {
        name: 'Sneha',
        role: 'Stall Volunteer',
        note: 'Our scanner just checks if the coupon number is valid and hands over the food.',
      },
      {
        name: 'Vikash',
        role: '1st-Year Civil',
        note: 'My real ticket had Coupon #105 and it showed already used at 1:15 PM!',
      },
    ],
    timeline: [],
    hints: [
      'Check which phone model redeemed coupons #105 through #108 at 12:40 PM.',
      'Match the Nothing Phone (2) and CCTV footage at 12:45 PM to Tarun.',
    ],
  },
  {
    id: 'case-14',
    title: 'The Forged Certificate QR Code',
    subtitle: 'Edited PDF Name vs. Original QR Verification',
    category: 'Document Forensics & QR Verification',
    difficulty: 'Medium',
    duration: 5,
    icon: 'shield',
    color: 'indigo',
    briefing:
      'A student posted a "1st Place Hackathon Winner" certificate on Instagram, but scanning the QR code on the certificate displays another student\'s name.',
    incident: 'Certificate PDF edit metadata and official QR code verification result.',
    evidence: [
      {
        type: 'FILE METADATA',
        title: 'Certificate File Info',
        detail:
          'Winner_Cert_Lokesh.pdf | Edited at 04:30 PM using "iLovePDF Text Editor"',
      },
      {
        type: 'QR VERIFICATION',
        title: 'QR Scan Result',
        detail:
          'Scanning the QR code opens the official verification page: "1st Place Winner: Neha Kulkarni (Cert #8821)".',
      },
    ],
    suspects: [
      {
        name: 'Lokesh',
        role: '1st-Year Mech',
        note: 'The organizers must have printed the wrong QR code on my winner certificate!',
      },
      {
        name: 'Neha',
        role: '1st-Year CSE',
        note: 'I won 1st place and posted my certificate in our class WhatsApp group at 4:05 PM!',
      },
      {
        name: 'Prashanth',
        role: 'Design Lead',
        note: 'We never edit certificates in iLovePDF; every QR code is uniquely generated.',
      },
      {
        name: 'Vikas',
        role: 'Event Head',
        note: "Lokesh didn't even participate in the final round.",
      },
    ],
    timeline: [],
    hints: [
      'Look at the file history showing it was modified in iLovePDF Text Editor at 04:30 PM.',
      "The QR code still verifies Neha Kulkarni's original certificate shared in the class group.",
    ],
  },
  {
    id: 'case-15',
    title: 'The Dropped Bus Ticket & Fake Merch Payment',
    subtitle: 'Dropped Commuter Ticket & Stall Log',
    category: 'Physical Clue & CCTV Verification',
    difficulty: 'Medium',
    duration: 5,
    icon: 'footprints',
    color: 'emerald',
    briefing:
      'Two Avon hoodies were taken from the merchandise stall using a fake payment screen, and a red KSRTC bus ticket was found dropped right at the counter.',
    incident: 'Dropped morning Indi-to-Bagalkote KSRTC bus ticket and 03:10 PM Stall CCTV.',
    evidence: [
      {
        type: 'DROPPED ITEM',
        title: 'Dropped Item at Scene',
        detail: 'Red KSRTC bus ticket from Indi to Bagalkote issued at 07:30 AM today.',
      },
      {
        type: 'CCTV LOG',
        title: 'Stall CCTV (03:10 PM)',
        detail: 'Buyer wearing a blue backpack takes two hoodies without completing the UPI transfer.',
      },
    ],
    suspects: [
      {
        name: 'Prashanth',
        role: '1st-Year Civil',
        note: 'I commute daily by the 7:30 AM bus from Indi to Bagalkote and carry a blue backpack, yeah—I visited the merch stall at 3:10 PM!',
      },
      {
        name: 'Sagar',
        role: '1st-Year Mech',
        note: 'I live in the campus hostel right across the road—I never take KSRTC buses!',
      },
      {
        name: 'Divya',
        role: '1st-Year CSE',
        note: 'I live locally in Navanagar and never visited the merch stall.',
      },
      {
        name: 'Kiran',
        role: '2nd-Year EEE',
        note: 'I travel from Solapur by train, not by bus.',
      },
    ],
    timeline: [],
    hints: [
      'Check the route printed on the dropped KSRTC bus ticket (Indi to Bagalkote).',
      'Match the 7:30 AM Indi bus commuter and blue backpack to Prashanth.',
    ],
  },

  // =========================================================================
  // LEVEL 3: HARD CASES (CASES 16 - 30 • TWISTS, LOGIC GRIDS & TIMELINE BUILDER)
  // =========================================================================
  {
    id: 'case-16',
    title: 'The Midnight Lab CCTV Snapshot',
    subtitle: 'Visual CCTV Inspection & Lanyard Color Code',
    category: 'Visual CCTV & Access Forensics',
    difficulty: 'Hard',
    duration: 5,
    icon: 'scan',
    color: 'cyan',
    briefing:
      'At 11:15 PM, someone used the lab admin password on a local computer to wipe the event backup logs after the main doors locked.',
    incident: 'CAM-04 CCTV snapshot inside the computer lab and lanyard logistics color code.',
    evidence: [
      {
        type: 'IMAGE EVIDENCE',
        title: 'CAM-04 CCTV Snapshot (23:14:08)',
        detail: 'CAM-04 CCTV snapshot captured at 23:14:08 inside the computer lab.',
        image: '/assets/cases/case-16-cctv.jpg',
      },
      {
        type: 'LOGISTICS NOTE',
        title: 'Lanyard Logistics Note',
        detail:
          'Only IEEE Executive Committee members wear red lanyards; general students wear blue lanyards and staff wear green.',
      },
    ],
    suspects: [
      {
        name: 'Kiran',
        role: 'IEEE Exec (Red)',
        note: 'I was working late on my black laptop with my red lanyard, yeah, but stepped out at 11:10 PM!',
      },
      {
        name: 'Pranav',
        role: '1st-Year (Blue)',
        note: 'I left the lab at 9:45 PM before the doors locked. Check the entrance register.',
      },
      {
        name: 'Meera',
        role: 'IEEE Exec (Red)',
        note: 'I was in the hostel by 10:00 PM, and I use a silver MacBook, not a black laptop.',
      },
      {
        name: 'Suresh',
        role: 'Staff (Green)',
        note: 'I wrote the admin password on a sticky note earlier, and I wear a green staff lanyard.',
      },
    ],
    timeline: [
      '11:14 PM: CCTV captures the open laptop, sticky note password, and red IEEE lanyard on the desk.',
      'Suresh writes the admin password on a yellow sticky note and sticks it onto the monitor.',
      'Someone uses the sticky note password on the open terminal to wipe the server backup logs.',
      'Kiran plugs a glowing blue USB drive into his black laptop and steps away for coffee.',
    ],
    hints: [
      'Zoom into the CCTV image to inspect the sticky note on the screen, the glowing blue USB, and the red lanyard on the desk.',
      'Match the red IEEE lanyard and black laptop to the suspect list.',
    ],
  },
  {
    id: 'case-17',
    title: 'The Wi-Fi Signal Coverage Map',
    subtitle: 'Visual Map Overlap Deduction',
    category: 'Signal Triangulation & Map Logic',
    difficulty: 'Hard',
    duration: 5,
    icon: 'globe',
    color: 'indigo',
    briefing:
      "During the online coding quiz in Lab-04, an unknown laptop overloaded the room's Wi-Fi and crashed the quiz page.",
    incident: 'Lab-04 Wi-Fi signal map image and 03:42 PM router connection log.',
    evidence: [
      {
        type: 'IMAGE EVIDENCE',
        title: 'Lab-04 Wi-Fi Signal Coverage Map',
        detail:
          'Lab-04 floor plan showing the dashed Wi-Fi signal circles for Router A, Router B, and Router C.',
        image: '/assets/cases/case-17-wifi-map.jpg',
      },
      {
        type: 'ROUTER LOG',
        title: 'Wi-Fi Router Log (03:42 PM)',
        detail:
          'Router A: CONNECTED (Inside Circle) | Router B: CONNECTED (Inside Circle) | Router C: NO SIGNAL (Outside Circle)',
      },
    ],
    suspects: [
      {
        name: 'Vikram',
        role: 'Seat 3',
        note: 'I was sitting in the middle seat—my laptop barely reached Router C from there!',
      },
      {
        name: 'Rohan',
        role: 'Seat 1',
        note: 'I was sitting in the bottom-left corner; my quiz was running normally.',
      },
      {
        name: 'Sneha',
        role: 'Seat 2',
        note: 'I was in the top-right seat; my laptop stayed connected to Router B cleanly.',
      },
      {
        name: 'Ananya',
        role: 'Seat 4',
        note: 'I was at the bottom-right desk right next to Router C.',
      },
    ],
    timeline: [
      "Router logs confirm the culprit's laptop is inside Router A and Router B's circles, but outside Router C.",
      'All four participants take their assigned seats in Lab-04 before the quiz begins.',
      'Checking the floor plan pinpoints Seat 3 as the exact location of the culprit.',
      '03:42 PM: The Wi-Fi system detects a traffic overload crashing the quiz portal.',
    ],
    hints: [
      'Look at the dashed circles on the Lab-04 map: find where Router A and Router B overlap.',
      "Make sure the seat you choose is outside Router C's dashed circle.",
    ],
  },
  {
    id: 'case-18',
    title: 'The Frame-Job Unlocked MacBook',
    subtitle: 'Frame-Job Twist & Stage Livestream Alibi',
    category: 'Frame-Job & Physical Access',
    difficulty: 'Hard',
    duration: 5,
    icon: 'shield',
    color: 'rose',
    briefing:
      "At 5:30 PM, someone deleted the live hackathon scoreboard from Tech Lead Ananya's account. Every log points to Ananya—who insists she is innocent.",
    incident: 'Admin activity log, main stage livestream video record, and backstage CCTV.',
    evidence: [
      {
        type: 'ADMIN LOG',
        title: 'Admin Activity Log (17:30:12)',
        detail:
          "17:30:12 | Account: Ananya_Admin | Action: Delete All Scores | Device: Ananya's Silver MacBook",
      },
      {
        type: 'LIVESTREAM',
        title: 'Main Stage Live Stream (17:20–17:40)',
        detail:
          'From 17:20 to 17:40 PM, Ananya is live on stage holding a microphone explaining the rules.',
      },
      {
        type: 'CCTV LOG',
        title: 'Backstage CCTV (17:29 PM)',
        detail:
          "Ananya's unlocked MacBook sits on the backstage table; Tushar walks up, types on her keyboard for 10 seconds, and leaves.",
      },
    ],
    suspects: [
      {
        name: 'Tushar',
        role: 'Team Alpha',
        note: 'My team was in 9th place at 5:25 PM, so I went backstage to ask a volunteer for water!',
      },
      {
        name: 'Ananya',
        role: 'Tech Lead',
        note: 'I rushed onto the stage for my speech and left my MacBook unlocked backstage!',
      },
      {
        name: 'Vikram',
        role: 'Score Co-Lead',
        note: "I was sitting in the front row watching Ananya's speech from my phone.",
      },
      {
        name: 'Priya',
        role: 'Event Host',
        note: 'I was standing right beside Ananya on stage holding cue cards the whole time.',
      },
    ],
    timeline: [
      "The scoreboard wipe executes from Ananya's silver MacBook under her admin account.",
      'Ananya rushes onto the auditorium stage, accidentally leaving her MacBook unlocked backstage.',
      'Ananya finishes her stage announcement and discovers the scoreboard has been deleted.',
      "05:29 PM: Tushar walks up to the backstage table and types on Ananya's MacBook for 10 seconds.",
    ],
    hints: [
      'Check where Ananya was at 17:30 PM according to the Main Stage Live Stream.',
      "Look at Backstage CCTV at 17:29 PM to see who touched Ananya's unlocked MacBook.",
    ],
  },
  {
    id: 'case-19',
    title: 'The Planted Smartwatch Frame-Job',
    subtitle: 'Planted Dropped Item & WhatsApp Timestamp',
    category: 'Evidence Tampering & CCTV',
    difficulty: 'Hard',
    duration: 5,
    icon: 'fingerprint',
    color: 'amber',
    briefing:
      "Someone wiped the quiz scoreboard from the coordinator's laptop at 4:40 PM. A black boAt smartwatch with a snapped strap was found dropped under the desk.",
    incident: 'Planted smartwatch pairing info, 04:15 PM WhatsApp alert, and registration CCTV.',
    evidence: [
      {
        type: 'DROPPED ITEM',
        title: 'Dropped Item at Scene',
        detail: 'Black boAt smartwatch displaying: Paired Phone: "Darshan_Phone".',
      },
      {
        type: 'CHAT LOG',
        title: 'WhatsApp Group Message (04:15 PM)',
        detail:
          'Darshan: "Guys my watch strap snapped near the registration desk! Has anyone seen my black boAt watch?"',
      },
      {
        type: 'CCTV LOG',
        title: 'Registration CCTV (04:20 PM)',
        detail:
          "Shows Nikhil picking up a black smartwatch from the registration floor and walking toward the coordinator's room at 04:38 PM.",
      },
    ],
    suspects: [
      {
        name: 'Nikhil',
        role: 'Quiz Participant',
        note: 'I walked past the registration desk at 4:20 PM, then went straight to the library!',
      },
      {
        name: 'Darshan',
        role: 'Decoration Lead',
        note: 'My watch strap broke at 4:15 PM near the registration desk! I even asked the group if anyone found it.',
      },
      {
        name: 'Meghana',
        role: 'Score Operator',
        note: 'I stepped out for 5 minutes at 4:35 PM and came back to find the scoreboard wiped.',
      },
      {
        name: 'Harsha',
        role: 'Hall Volunteer',
        note: 'I was guarding the main entrance door from 4:00 PM to 5:00 PM.',
      },
    ],
    timeline: [
      "04:38 PM: Nikhil walks into the coordinator's room while Meghana is away and wipes the scoreboard.",
      "Darshan's smartwatch strap snaps near the registration desk, and he asks about it on WhatsApp.",
      "Nikhil drops Darshan's watch under the desk to frame him while rushing out.",
      "Nikhil picks up Darshan's lost watch from the registration desk floor.",
    ],
    hints: [
      "Read Darshan's 04:15 PM WhatsApp message about losing his broken watch at the registration desk.",
      "Check Registration CCTV at 04:20 PM to see who picked up the watch and carried it toward the coordinator's room.",
    ],
  },
  {
    id: 'case-20',
    title: 'The Emoji Cipher Group Chat',
    subtitle: 'Emoji Code Decoding & Locker Register',
    category: 'Cipher Decoding & Key Register',
    difficulty: 'Hard',
    duration: 5,
    icon: 'key',
    color: 'violet',
    briefing:
      "Twenty VIP food coupons went missing from the organizers' locker during break. A dropped torn paper note with an emoji sequence was found outside the locker room.",
    incident: 'Emoji cipher note, Room 304 spare key register, and 01:05 PM Corridor CCTV.',
    evidence: [
      {
        type: 'DROPPED ITEM',
        title: 'Dropped Item at Scene',
        detail:
          'Crumpled slip with emojis: 🔑 + 3️⃣0️⃣4️⃣ ➡️ 🍔 ➡️ 🎒🔵 (Key + Room 304 → Burger Coupons → Blue Backpack).',
      },
      {
        type: 'KEY REGISTER',
        title: 'Locker Key Register',
        detail: 'Only Siddharth signed out the Room 304 spare key at 12:50 PM.',
      },
      {
        type: 'CCTV LOG',
        title: 'Corridor CCTV (01:05 PM)',
        detail: 'Shows a student carrying a blue backpack walking out of Room 304.',
      },
    ],
    suspects: [
      {
        name: 'Siddharth',
        role: 'Logistics Member',
        note: 'I signed out the Room 304 key at 12:50 PM to store extra banners, and yes, I carry a blue backpack!',
      },
      {
        name: 'Kavya',
        role: 'Food Coord',
        note: 'I locked the 20 VIP burger coupons inside Room 304 at 12:30 PM.',
      },
      {
        name: 'Rohan',
        role: '1st-Year Mech',
        note: 'I carry a black laptop bag and was at the canteen from 12:45 to 1:30 PM.',
      },
      {
        name: 'Ananya',
        role: 'Anchor',
        note: "I don't carry a backpack—only a small handbag—and was on stage rehearsing.",
      },
    ],
    timeline: [
      'Siddharth walks out of Room 304 carrying his blue backpack with the missing coupons.',
      'Kavya locks the 20 VIP burger coupons inside Room 304.',
      'Volunteers find the dropped emoji cipher slip outside the locker room.',
      '12:50 PM: Siddharth signs out the spare key for Room 304 from the register.',
    ],
    hints: [
      'Decode the emojis: Key + 304 → Burger Coupons → Blue Backpack.',
      'Match the Room 304 key register (12:50 PM) and blue backpack to Siddharth.',
    ],
  },
  {
    id: 'case-21',
    title: 'The 4-Slot Storage Room Logic Grid',
    subtitle: 'Pure Alibi Deduction Grid (Zero Tech)',
    category: 'Logic Grid & Shift Deduction',
    difficulty: 'Hard',
    duration: 5,
    icon: 'database',
    color: 'emerald',
    briefing:
      'The champion trophy disappeared from the storage room between 5:00 PM and 9:00 PM. Four volunteers entered the room one by one in 1-hour slots (5–6, 6–7, 7–8, 8–9), and the trophy was stolen at 07:30 PM.',
    incident: 'Four sequential 1-hour room entry slots and volunteer shift statements.',
    evidence: [
      {
        type: 'CLUE 1',
        title: 'Clue 1 — 07:00 PM Lockup Check',
        detail: 'The trophy was still sitting on the shelf at 07:00 PM when the 6–7 PM volunteer locked up.',
      },
      {
        type: 'CLUE 2',
        title: 'Clue 2 — Relative Shift Order',
        detail: 'Meera entered immediately after Aarav, and neither of them took the first (5–6 PM) slot.',
      },
      {
        type: 'CLUE 3',
        title: 'Clue 3 — Final Slot Report',
        detail: 'Varun took the very last slot (8–9 PM) and immediately reported the trophy missing at 08:05 PM.',
      },
    ],
    suspects: [
      {
        name: 'Meera',
        role: 'Prize Volunteer',
        note: 'I entered right after Aarav finished his shift, checked the boxes, and locked the door!',
      },
      {
        name: 'Sneha',
        role: 'Decor Volunteer',
        note: 'I took the earliest shift from 5:00 to 6:00 PM to drop off ribbons.',
      },
      {
        name: 'Aarav',
        role: 'Sound Volunteer',
        note: 'I was inside right before Meera, and the trophy was definitely there when I left at 7:00 PM!',
      },
      {
        name: 'Varun',
        role: 'Stage Lead',
        note: 'I entered at 8:00 PM for the final shift and saw the empty trophy stand right away!',
      },
    ],
    timeline: [
      '07:30 PM: Meera is alone inside the storage room during the 7:00–8:00 PM shift when the trophy vanishes.',
      'Sneha takes the 5:00–6:00 PM shift to store decoration ribbons.',
      'Varun enters at 8:00 PM and reports the trophy missing.',
      'Aarav takes the 6:00–7:00 PM shift and leaves the trophy untouched on the shelf.',
    ],
    hints: [
      'Fill the 4 slots: Sneha = 5–6 PM, Varun = 8–9 PM. That leaves 6–7 PM and 7–8 PM for Aarav and Meera.',
      'Since Meera entered after Aarav, Aarav = 6–7 PM and Meera = 7–8 PM (when the 07:30 PM theft occurred).',
    ],
  },
  {
    id: 'case-22',
    title: 'The Doctored Wedding Selfie Alibi',
    subtitle: 'Visual AI/Photoshop Error Detection',
    category: 'AI Media Forensics & Alibi Audit',
    difficulty: 'Hard',
    duration: 5,
    icon: 'scan',
    color: 'cyan',
    briefing:
      'Someone leaked the final tie-breaker question paper at 3:00 PM. All four coordinators claim they were out of town—and sent selfies as proof.',
    incident: 'Forensic audit of four out-of-town travel selfies and boarding/ticket proofs.',
    evidence: [
      {
        type: 'AUDIT REPORT',
        title: 'Selfie Audit Report',
        detail:
          "Priya: Selfie at Hubballi Airport departure gate; flight boarding pass timestamp matches 02:55 PM. | Rohan: Selfie at a relative's wedding—zooming in reveals a 6-fingered hand and garbled gibberish letters on the wedding banner (classic AI-generated fake image). | Kavya: Selfie outside Mysuru Palace with today's dated entry ticket. | Deepak: Video call screenshot from his hometown train with live GPS location in Belagavi.",
      },
    ],
    suspects: [
      {
        name: 'Rohan',
        role: 'Question Setter',
        note: "I was at my cousin's wedding all afternoon—look at the selfie I sent in the group!",
      },
      {
        name: 'Priya',
        role: 'Event Head',
        note: 'I was boarding my flight at Hubballi Airport at 3:00 PM.',
      },
      {
        name: 'Kavya',
        role: 'Coordinator',
        note: "I was visiting Mysuru with my family; my ticket has today's date.",
      },
      {
        name: 'Deepak',
        role: 'Tech Volunteer',
        note: 'I was on the Belagavi train and even shared my live WhatsApp location.',
      },
    ],
    timeline: [
      'Rohan generates a fake AI wedding selfie to pretend he was out of town.',
      'Priya, Kavya, and Deepak travel out of town for the weekend.',
      'Inspecting the selfie reveals garbled banner text and six fingers, exposing the fake alibi.',
      '03:00 PM: The final tie-breaker question paper is leaked online.',
    ],
    hints: [
      "Check which suspect's alibi photo shows classic AI generation mistakes (six fingers and unreadable banner text).",
      'Rohan is the only coordinator who faked being out of town.',
    ],
  },
  {
    id: 'case-23',
    title: 'The Fake Stage-Lighting UPI Receipt',
    subtitle: 'UTR Digit Count & Bank Statement Audit',
    category: 'Financial & Payment Forensics',
    difficulty: 'Hard',
    duration: 5,
    icon: 'database',
    color: 'rose',
    briefing:
      'The co-treasurer shared a screenshot showing ₹18,000 paid to Apex Stage Lights, yet the lighting vendor cancelled because zero money arrived.',
    incident: 'Shared 9-digit UTR screenshot, official fest bank statement, and UTR banking rule.',
    evidence: [
      {
        type: 'SCREENSHOT',
        title: 'Shared UPI Screenshot',
        detail: 'Amount: ₹18,000 | Time: 02:14 PM | UTR No: 632284910 (9 digits)',
      },
      {
        type: 'BANK STATEMENT',
        title: 'Official Fest Bank Statement',
        detail: '02:14 PM | Debit ₹18,000 | UTR: 632284910447 (12 digits) | Paid To: Karan_Personal_UPI',
      },
      {
        type: 'BANKING RULE',
        title: 'Banking Rule',
        detail: 'Real Indian UPI Transaction IDs (UTRs) are always 12 digits long.',
      },
    ],
    suspects: [
      {
        name: 'Karan',
        role: 'Co-Treasurer',
        note: "I made the ₹18,000 payment at 2:14 PM sharp! Maybe the vendor's bank is delayed.",
      },
      {
        name: 'Divya',
        role: 'President',
        note: 'I approved the budget verbally, but Karan controls the UPI account.',
      },
      {
        name: 'Manish',
        role: 'Logistics Lead',
        note: 'I only handled the ₹2,500 banner printing payment earlier at 1:50 PM.',
      },
      {
        name: 'Riya',
        role: 'Vendor Coord',
        note: "I sent Karan the vendor's QR code at 1:00 PM; I don't have bank access.",
      },
    ],
    timeline: [
      '02:14 PM: ₹18,000 is transferred from the fest account to Karan_Personal_UPI.',
      "Riya shares the lighting vendor's official QR code with the finance team.",
      'Karan crops and edits the UTR number on a fake receipt screenshot to hide his UPI ID.',
      'Manish completes the ₹2,500 banner payment to PrintHub Posters.',
    ],
    hints: [
      'Compare the 9-digit UTR on the screenshot against the real 12-digit UTR in the bank statement at 02:14 PM.',
      'Check the recipient UPI ID listed in the bank statement for that exact transaction.',
    ],
  },
  {
    id: 'case-24',
    title: 'The Phantom Attendance Proxy',
    subtitle: 'Instagram Pet Clue & Browser Bookmarks',
    category: 'OSINT & Session Forensics',
    difficulty: 'Hard',
    duration: 5,
    icon: 'footprints',
    color: 'indigo',
    briefing:
      "A student with 42% attendance jumped to 85% overnight in the college portal using Prof. Sharma's account.",
    incident: 'Portal security question reset log, Prof. Sharma Instagram caption, and browser bookmarks.',
    evidence: [
      {
        type: 'PORTAL LOG',
        title: 'Portal Reset Log (prof_sharma@bec.edu)',
        detail:
          '04:07 PM — Password Reset via Security Question: "Name of your first pet?" → Answer: "Bruno"',
      },
      {
        type: 'OSINT',
        title: "Prof. Sharma's Public Instagram",
        detail: 'Photo from last month captioned "Happy birthday to my first pet, Bruno!"',
      },
      {
        type: 'BROWSER ARTIFACT',
        title: 'Device Clues',
        detail:
          'The reset came from a laptop with saved bookmarks BEC_CR_Notices and Class_Attendance_Sheet.',
      },
    ],
    suspects: [
      {
        name: 'Rahul',
        role: 'Class Rep (CR)',
        note: 'I collected paper attendance sheets and handed them to Prof. Sharma at 4:00 PM.',
      },
      {
        name: 'Aditya',
        role: 'Student (42% Att.)',
        note: "I don't know how the portal works! I was in the auditorium watching a fest movie.",
      },
      {
        name: 'Divya',
        role: 'Portal Intern',
        note: 'I only work on the practice website, not live student attendance.',
      },
      {
        name: 'Neha',
        role: 'Lab Partner',
        note: 'I was in the chemistry lab until 5:00 PM.',
      },
    ],
    timeline: [
      'The attacker resets the password using the pet name "Bruno" from a browser with CR bookmarks.',
      'Class Rep Rahul collects the attendance sheets and hands them to Prof. Sharma.',
      "Aditya's attendance is manually updated from 42% to 85% in the portal.",
      "04:05 PM: Someone tries to log into Prof. Sharma's portal account twice with the wrong password.",
    ],
    hints: [
      "Look at how the culprit guessed the security question answer using Prof. Sharma's public Instagram post.",
      'Match the browser bookmarks (BEC_CR_Notices) to the Class Representative.',
    ],
  },
  {
    id: 'case-25',
    title: 'The Spoofed Dean Approval Email',
    subtitle: 'Fake Sender Address & Browser History',
    category: 'Email Header & Spoof Analysis',
    difficulty: 'Hard',
    duration: 5,
    icon: 'mail',
    color: 'amber',
    briefing:
      'Campus security unlocked the main auditorium for an unauthorized gaming night after receiving a fake approval email pretending to be from dean@bec.edu.',
    incident: 'Email actual sender domain, auditorium booking timestamp, and Wi-Fi DNS history.',
    evidence: [
      {
        type: 'EMAIL HEADER',
        title: 'Email Details',
        detail:
          'Shown Name: Dean BEC | Actual Sender Address: mailer@free-fake-mail.cz | Time: 09:32 AM',
      },
      {
        type: 'WI-FI HISTORY',
        title: 'Booking & Wi-Fi History',
        detail:
          "09:30 AM: Room request submitted by Naveen | 09:31 AM: Naveen's phone visited free-fake-mail.cz.",
      },
    ],
    suspects: [
      {
        name: 'Naveen',
        role: 'Student Secretary',
        note: "I submitted the booking request at 9:30 AM and got the Dean's approval email two minutes later!",
      },
      {
        name: 'Riya',
        role: 'Portal Admin',
        note: 'Official college emails never come from free-fake-mail.cz.',
      },
      {
        name: 'Kabir',
        role: 'Security Guard',
        note: "Naveen showed me the Dean's email on his phone, so I unlocked the auditorium.",
      },
      {
        name: 'Omkar',
        role: '1st-Year Civil',
        note: 'I was in drawing lab from 9:00 AM to 12:00 PM.',
      },
    ],
    timeline: [
      "The security guard reads the fake email on Naveen's phone and unlocks the auditorium.",
      'Student Secretary Naveen submits the official auditorium booking request.',
      'The esports group sets up their gaming laptops inside the main auditorium.',
      '09:32 AM: A fake email pretending to be from the Dean is sent using an online fake-email website.',
    ],
    hints: [
      'Look at the actual sender domain (free-fake-mail.cz) in the email details.',
      "Check whose phone visited free-fake-mail.cz at 09:31 AM right before showing the email to the guard.",
    ],
  },
  {
    id: 'case-26',
    title: 'The Hidden Keylogger on the Podium PC',
    subtitle: 'Physical USB Adapter & Podium CCTV',
    category: 'Hardware Keylogger & CCTV',
    difficulty: 'Hard',
    duration: 5,
    icon: 'key',
    color: 'violet',
    briefing:
      "After a morning workshop, the guest speaker's cloud account was opened from a campus hostel room.",
    incident: 'Seminar Hall podium CCTV and 02:15 PM Hostel Room 204 Wi-Fi log.',
    evidence: [
      {
        type: 'CCTV LOG',
        title: 'Seminar Hall CCTV',
        detail:
          'At 08:45 AM, Suraj plugs a tiny black USB adapter between the podium keyboard cable and the PC; at 01:02 PM during lunch, he unplugs it.',
      },
      {
        type: 'WI-FI LOG',
        title: 'Hostel Wi-Fi Log (02:15 PM)',
        detail:
          "02:15 PM — Suraj's laptop logged into the guest speaker's cloud portal from Hostel Room 204.",
      },
    ],
    suspects: [
      {
        name: 'Suraj',
        role: '1st-Year Mech',
        note: 'I was only fixing a loose keyboard wire behind the podium at 8:45 AM!',
      },
      {
        name: 'Aryan',
        role: 'Stage Volunteer',
        note: 'I reset the podium PC after the event, so no software was installed on the computer.',
      },
      {
        name: 'Nikhita',
        role: '1st-Year CSE',
        note: 'I sat in the second row taking notes during the morning session.',
      },
      {
        name: 'Tarun',
        role: 'AV Coordinator',
        note: 'We never use black USB adapters on our podium keyboards.',
      },
    ],
    timeline: [
      'During lunch break, Suraj returns to the stage and unplugs the USB adapter.',
      '08:45 AM: Before the workshop starts, Suraj plugs a tiny black USB keylogger behind the podium PC.',
      "Unauthorized logins from Suraj's hostel room appear on the guest speaker's account.",
      'The guest speaker types his cloud portal password on the podium keyboard.',
    ],
    hints: [
      'A hardware keylogger sits physically on the keyboard wire and saves every key typed—even if the PC is reset later.',
      'Match the CCTV footage at 08:45 AM and 01:02 PM with the 02:15 PM hostel login.',
    ],
  },
  {
    id: 'case-27',
    title: 'The Sabotaged Drone Flight Code',
    subtitle: 'Memory Card Modification Time & Pit CCTV',
    category: 'File Timestamp & Pit Tampering',
    difficulty: 'Hard',
    duration: 5,
    icon: 'code',
    color: 'emerald',
    briefing:
      "During the autonomous drone demo, Team Skyhawk's drone refused to fly upward because its target height was secretly changed from 5 meters to 0 meters.",
    incident: 'flight_plan.txt Last Edited timestamp and 03:20 PM Pit Area CCTV.',
    evidence: [
      {
        type: 'FILE METADATA',
        title: 'Drone Memory Card Info',
        detail: 'File: flight_plan.txt | Saved at: 03:00 PM | Last Edited: 03:20 PM (Target Height = 0m)',
      },
      {
        type: 'CCTV LOG',
        title: 'Pit Area CCTV (03:20 PM)',
        detail:
          "While Team Skyhawk is at the judge table getting safety clearance, rival pilot Ritesh leans over Skyhawk's desk holding a memory card reader.",
      },
    ],
    suspects: [
      {
        name: 'Ritesh',
        role: 'Rival Drone Pilot',
        note: "I only walked past Skyhawk's table to borrow a screwdriver at 3:20 PM!",
      },
      {
        name: 'Tejas',
        role: 'Skyhawk Coder',
        note: 'I set the flight height to 5 meters at 3:00 PM and went straight to the judge desk.',
      },
      {
        name: 'Aishwarya',
        role: 'Safety Judge',
        note: 'All members of Team Skyhawk were standing at my inspection table from 3:15 to 3:25 PM.',
      },
      {
        name: 'Harish',
        role: 'Arena Marshal',
        note: 'The drone propellers spun normally at 3:30 PM, so the battery was fine.',
      },
    ],
    timeline: [
      'During the live demo, the drone refuses to lift off and spins on the ground.',
      "The robotics team saves their 5-meter flight plan onto the drone's memory card.",
      'Checking the memory card file properties shows it was edited during the 3:20 PM break.',
      '03:20 PM: While the team goes for safety clearance, Ritesh edits the target height from 5m to 0m.',
    ],
    hints: [
      'Check the Last Edited timestamp on the memory card (03:20 PM).',
      "Match 03:20 PM with the CCTV footage showing Ritesh holding a memory card reader at Skyhawk's desk.",
    ],
  },
  {
    id: 'case-28',
    title: 'The Hijacked Smart Notice Board',
    subtitle: 'Default Password Login & File Transfer History',
    category: 'Default Credentials & Display Logs',
    difficulty: 'Hard',
    duration: 5,
    icon: 'sun',
    color: 'cyan',
    briefing:
      'The digital lobby display screen suddenly replaced the fest schedule with a giant red banner reading "TOMORROW IS A HOLIDAY".',
    incident: 'Display screen default credential connection log and 04:25 PM Lobby Seating CCTV.',
    evidence: [
      {
        type: 'SCREEN LOG',
        title: 'Lobby Display Screen Log (04:25 PM)',
        detail:
          '04:25 PM — Connected by "Darshan-HP-Laptop" using default password "raspberry" | Uploaded: holiday.png',
      },
      {
        type: 'CCTV LOG',
        title: 'Lobby Seating CCTV (04:25 PM)',
        detail: 'Shows Darshan sitting on the lobby sofa with his HP laptop open.',
      },
    ],
    suspects: [
      {
        name: 'Darshan',
        role: '1st-Year CSE',
        note: "I was just sitting on the lobby sofa checking my HP laptop! I didn't change the notice board!",
      },
      {
        name: 'Charan',
        role: 'Display Volunteer',
        note: "We forgot to change the screen's default factory password (raspberry) when setting it up.",
      },
      {
        name: 'Pooja',
        role: 'Office Clerk',
        note: 'I update the notice board using a USB stick, never over Wi-Fi.',
      },
      {
        name: 'Dinesh',
        role: '2nd-Year Mech',
        note: 'I left campus at 3:30 PM on the early bus.',
      },
    ],
    timeline: [
      'The lobby screen suddenly displays "Tomorrow is a Holiday" in giant red letters.',
      'The digital notice board in the lobby is set up with its default factory password.',
      'The HOD walks past the lobby screen and calls the organizers immediately.',
      '04:25 PM: Darshan connects to the lobby display from his HP laptop and uploads holiday.png.',
    ],
    hints: [
      'Look at the laptop name recorded in the display screen log (Darshan-HP-Laptop).',
      'Match the 04:25 PM upload time with the lobby sofa CCTV.',
    ],
  },
  {
    id: 'case-29',
    title: 'The Leaked Judge Score Sheet',
    subtitle: 'USB Volume Label & Podium CCTV',
    category: 'USB Registry & Insider Leak',
    difficulty: 'Hard',
    duration: 5,
    icon: 'database',
    color: 'indigo',
    briefing:
      'Confidential final scores for the hackathon leaked into a participant WhatsApp group 15 minutes before the prize ceremony.',
    incident: 'Seminar PC USB history (TEJAS_USB) and 05:25 PM Seminar Hall podium CCTV.',
    evidence: [
      {
        type: 'USB HISTORY',
        title: 'Seminar PC USB History (05:25 PM)',
        detail:
          '05:25 PM — USB Drive Connected: SanDisk 32GB | Drive Name: "TEJAS_USB" | Copied: Final_Scores.xlsx',
      },
      {
        type: 'CCTV LOG',
        title: 'Seminar Hall CCTV (05:25 PM)',
        detail:
          'While judges are outside having coffee, Tejas walks up to the podium pretending to adjust a loose HDMI cable.',
      },
    ],
    suspects: [
      {
        name: 'Tejas',
        role: 'Team Falcon Lead',
        note: "The projector was flickering, so I walked up to check the HDMI cable! I didn't copy any files!",
      },
      {
        name: 'Rohan K.',
        role: 'Stage Volunteer',
        note: 'I was outside serving coffee to the judges from 5:15 to 5:35 PM.',
      },
      {
        name: 'Shashank',
        role: 'Panel Judge',
        note: 'We saved Final_Scores.xlsx on the desktop at 5:10 PM and stepped out for coffee.',
      },
      {
        name: 'Keerthi',
        role: 'Event Anchor',
        note: "I was backstage practicing the winners' announcement script with cue cards.",
      },
    ],
    timeline: [
      "Tejas shares photos of the judges' secret scores in his team's private WhatsApp group.",
      'The hackathon judges save their final Excel score sheet on the seminar hall desktop.',
      'Windows USB history confirms TEJAS_USB was connected during the coffee break.',
      '05:25 PM: Tejas plugs his USB drive into the desktop PC while pretending to adjust the HDMI cable.',
    ],
    hints: [
      'Look at the USB drive name recorded in the seminar PC history (TEJAS_USB).',
      'Match 05:25 PM with the CCTV footage of Tejas standing at the podium.',
    ],
  },
  {
    id: 'case-30',
    title: 'The Automated Concert Pass Grabber',
    subtitle: 'Rapid Auto-Clicker Flood & Hostel Wi-Fi Match',
    category: 'Automation Abuse & Request Flood',
    difficulty: 'Hard',
    duration: 5,
    icon: 'code',
    color: 'rose',
    briefing:
      'All 30 VIP front-row passes for the Avon concert night sold out in 3 seconds, with every pass booked by a single account.',
    incident: 'Ticketing website 3-second burst log and Hostel Block C Wi-Fi connection record.',
    evidence: [
      {
        type: 'WEBSITE LOG',
        title: 'Ticketing Website Log (07:00:00–07:00:03)',
        detail:
          '07:00:00 – 07:00:03 PM | 30 VIP Passes booked in 3 seconds | Account: usr_chetan_881 | Tool: Auto-Clicker Script',
      },
      {
        type: 'WI-FI LOG',
        title: 'Hostel Block C Wi-Fi Log',
        detail: "Booking connection traced to Chetan's Asus Laptop in Hostel Block C.",
      },
    ],
    suspects: [
      {
        name: 'Chetan',
        role: '1st-Year CSE',
        note: 'I just refreshed the page really fast at 7:00 PM! I only wanted 1 pass for myself!',
      },
      {
        name: 'Advait',
        role: 'Ticketing Volunteer',
        note: 'We forgot to put a 1-pass-per-person limit, so an auto-clicker grabbed all 30 passes!',
      },
      {
        name: 'Meera',
        role: 'Cultural Lead',
        note: 'I was on stage announcing that ticket bookings were live at 7:00 PM.',
      },
      {
        name: 'Devansh',
        role: '1st-Year ISE',
        note: 'I opened the link at 7:01 PM and all 30 VIP passes were already gone!',
      },
    ],
    timeline: [
      'Regular students see "Sold Out" within sixty seconds of the launch.',
      'Two minutes before concert tickets go live, Chetan starts an auto-clicker script on his laptop.',
      'Website logs confirm all 30 bookings came from usr_chetan_881.',
      "07:00 PM: The ticket booking page opens, and Chetan's script grabs all 30 passes in 3 seconds.",
    ],
    hints: [
      'Check the account ID (usr_chetan_881) that booked all 30 passes in 3 seconds.',
      'No human can click and fill 30 forms in 3 seconds without an auto-clicker script.',
    ],
  },
];
