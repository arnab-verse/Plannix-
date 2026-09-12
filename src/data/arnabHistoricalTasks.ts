/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Historical Task Dataset for Arnab (arnab.bhtt06@gmail.com)
 * Spans from Sep 20, 2025 through Sep 10, 2026.
 * All tasks logged with randomized entry/completion times and marked as completed on time.
 */

import { DailyTask } from '../types';

interface RawHistoricalDay {
  date: string; // YYYY-MM-DD
  tasks: string[];
}

const rawSchedule: RawHistoricalDay[] = [
  // Page 1: Sep 2025 - Oct 2025
  {
    date: '2025-09-20',
    tasks: [
      'IIT Lecture ① → 9–11',
      'IIT Lecture ② → 11–1',
      'IIT Lecture ③ → 2–4',
      'IIT Lecture ④ → 4–6',
    ],
  },
  {
    date: '2025-09-21',
    tasks: [
      'IIT Lecture ① → 9–11',
      'IIT Lecture ② → 11–1',
      'IIT Lecture ③ → 2–4',
    ],
  },
  {
    date: '2025-09-22',
    tasks: [
      'PPS Record',
      'Bio Assignment (ATA)',
      'ATA Assignment',
      'Gemini AI Trend',
    ],
  },
  {
    date: '2025-09-23',
    tasks: [
      'LANA (w② Full Completion)',
      'KNIME Assignment',
      'BDA Lec/Quiz',
      'POE Chart',
      'Student Record',
    ],
  },
  {
    date: '2025-09-24',
    tasks: [
      'BDA (w②) Full Completion',
      'ESP Assignment/Quiz (w② Completion)',
      'Julius AI Assignment',
      'Mechanical Record',
      'POE Chart',
    ],
  },
  {
    date: '2025-09-25',
    tasks: [
      'Physics Record',
      'ATA w② completion',
    ],
  },
  {
    date: '2025-09-26',
    tasks: [
      'IIT Lecture ① → 5–7',
      'IIT Lecture ② → 7–9',
      'FSP Completion',
      'BDA Vdo Complete',
    ],
  },
  {
    date: '2025-09-27',
    tasks: [
      'IIT Lecture ① → 9–11',
      'IIT Lecture ② → 11–1',
      'IIT Lecture ③ → 2–4',
      'IIT Lecture ④ → 4–6',
      'ATA Vdo Less w③',
      'LANA Vdo Less w③',
      'Voiceover',
      'Q/R Poster',
    ],
  },
  {
    date: '2025-09-28',
    tasks: [
      'IIT Lecture ① → 11–1',
      'IIT Lecture ② → 2–4',
    ],
  },
  {
    date: '2025-09-29',
    tasks: [
      'English Test (SRM)',
      'Prep for Presentation',
    ],
  },
  {
    date: '2025-09-30',
    tasks: [
      'Presentation',
      'FSP w③ video lec (Completion)',
    ],
  },
  {
    date: '2025-10-01',
    tasks: [
      'ATA Flowgorithm Assignment',
      'BDA KNIME Assignment',
      'LANA Numpy Assignment',
      'FSP Highlights Assignment',
      'BDA Quiz Completion',
      'FSP Quiz Completion',
      'LANA Quiz Completion',
      'Bio Project (Add HGP program)',
    ],
  },
  {
    date: '2025-10-03',
    tasks: [
      'Matrices One Shot + Notes',
      'Questions',
      'Partial derivatives',
      'IIT Lecture ② → 7–9',
      'IIT Lecture ① 5–7',
    ],
  },
  {
    date: '2025-10-04',
    tasks: [
      'Taylor series',
      'Maxima and Minima',
      'Lagrange\'s series',
      'IIT Lecture ①',
      'IIT Lecture ②',
      'IIT Lecture ③',
      'IIT Lecture ④',
    ],
  },
  {
    date: '2025-10-05',
    tasks: [
      'IIT Lecture ① → 11–1',
      'IIT Lecture ② 2–4',
      'BDA Assignment codes list',
      'BDA End Module Quiz 9–10p',
      'Physics Ch ①',
      'ATA w④ Complete',
      'BDA w④ Complete',
      'FANA w④ Complete',
      'PSP Assignment from',
      'FSP w④ Complete',
    ],
  },

  // Page 2: Oct 2025
  {
    date: '2025-10-06',
    tasks: [
      'PSP Assignment',
      'Math rev',
      'Calculator Tricks',
    ],
  },
  {
    date: '2025-10-07',
    tasks: [
      'Eng Revision',
      'IIT Assignments',
    ],
  },
  {
    date: '2025-10-08',
    tasks: [
      'Phy Revision (SRM)',
    ],
  },
  {
    date: '2025-10-09',
    tasks: [
      'Bio Ut ① (Full) (SRM)',
    ],
  },
  {
    date: '2025-10-10',
    tasks: [
      'Bio Ut ② (Full) (SRM)',
      'IIT Lecture ① 5–7',
      'IIT Lecture ② 7–9',
    ],
  },
  {
    date: '2025-10-11',
    tasks: [
      'IIT Lecture ① 9–11',
      'IIT Lecture ② 11–1',
      'IIT Lecture ③ 2–4',
      'IIT Lecture ④ 4–6',
      'PPS Assignment (SRM)',
    ],
  },
  {
    date: '2025-10-12',
    tasks: [
      'IIT Lecture ① 11–1',
      'IIT Lecture ② 2–4',
      'POE Prep',
      'ATA End Module Test',
    ],
  },
  {
    date: '2025-10-13',
    tasks: [
      'POE MCQ',
      'PPS Prep',
      'Example Run (PPS Assignment)',
    ],
  },
  {
    date: '2025-10-14',
    tasks: [
      'ATA Assignment (IIT)',
    ],
  },
  {
    date: '2025-10-15',
    tasks: [
      'ATA Vdo Lec',
      'FSP Vdo Lec',
      'LANA Vdo Lec (IIT)',
    ],
  },
  {
    date: '2025-10-16',
    tasks: [
      'BDA Vdo Lec',
      'ATA Quiz/Assignment',
      'BDA Quiz/Assignment',
      'FSP Quiz/Assignment',
      'LANA Quiz/Assignment',
      'Physics Record',
    ],
  },
  {
    date: '2025-10-19',
    tasks: [
      'Maths Assignment (SRM)',
    ],
  },
  {
    date: '2025-10-21',
    tasks: [
      'Phy Assignment (SRM)',
      'Phy Proj (SRM)',
      'Maths Proj (SRM)',
    ],
  },
  {
    date: '2025-10-22',
    tasks: [
      'IIT All Sub Vdo Lec complete',
      'Mech Record Cycle ③ (Karphanav?)',
    ],
  },
  {
    date: '2025-10-23',
    tasks: [
      'MLP Assignment Coverpage (Submit)',
      'Phy Record Cycle ② Completion',
      'IIT All Sub Quiz completion',
      'Phy Record XRD Exp (SRM)',
    ],
  },
  {
    date: '2025-10-24',
    tasks: [
      'IIT Lec ① 5–7',
      'IIT Lec ② 7–9',
      'Math/Phy/Eng Proj Submit',
    ],
  },
  {
    date: '2025-10-25',
    tasks: [
      'IIT Lecture ① 9–11',
      'IIT Lecture ② 11–1',
      'IIT Lecture ③ 2–4',
      'IIT Lecture ④ 4–6',
      'Physics Assignment (SRM)',
    ],
  },

  // Page 3: Oct 2025 - Nov 2025
  {
    date: '2025-10-26',
    tasks: [
      'IIT Lecture ① 11–1',
      'IIT Lecture ② 2–4',
      'FSP End Module Test (IIT)',
    ],
  },
  {
    date: '2025-10-27',
    tasks: [
      'Mechanical Record (Sheet metal)',
      'PPS Record (Exp ⑥) (SRM)',
    ],
  },
  {
    date: '2025-10-28',
    tasks: [
      'ATA w① Vdo lec + Quiz (IIT)',
      'BDA w① Vdo lec + Quiz (IIT)',
      'FSP w① Vdo lec + Quiz (IIT)',
      'LANA w① Vdo lec + Quiz (IIT)',
      'Phy Record Completion (SRM)',
    ],
  },
  {
    date: '2025-10-29',
    tasks: [
      'Mech Record Completion',
      'PPS Record (Exp ⑦) (SRM)',
    ],
  },
  {
    date: '2025-10-30',
    tasks: [
      'Physics Practical Prep (SRM)',
    ],
  },
  {
    date: '2025-10-31',
    tasks: [
      'IIT Lecture ① 5–7',
      'IIT Lecture ② 7–9',
    ],
  },
  {
    date: '2025-11-01',
    tasks: [
      'IIT Lecture ① 9–11',
      'IIT Lecture ② 11–1',
      'IIT Lecture ③ 3–5',
      'IIT Lecture ④ 5–7',
    ],
  },
  {
    date: '2025-11-02',
    tasks: [
      'IIT Lecture ① 11–1',
      'IIT Lecture ② 2–4',
      'Bio Assignment Print PDF (layout)',
      'POE Assignment',
      'Eng Assignment',
      'BDA End Module Test',
    ],
  },
  {
    date: '2025-11-03',
    tasks: [
      'Assignment Printouts',
      'PPS Record Complete',
      'PPS Lab Qs (50+) (SRM)',
    ],
  },
  {
    date: '2025-11-04',
    tasks: [
      'MECH Practical Prep (SRM)',
    ],
  },
  {
    date: '2025-11-05',
    tasks: [
      'IIT All Sub Assignment complete',
      'English CLA ② Prep (SRM)',
    ],
  },
  {
    date: '2025-11-06',
    tasks: [
      'Maths Unit ③',
      'Maths Unit ④',
    ],
  },
  {
    date: '2025-11-07',
    tasks: [
      'IIT Lecture ① 5–7',
      'IIT Lecture ② 7–9',
    ],
  },
  {
    date: '2025-11-08',
    tasks: [
      'IIT Lecture ① 9–11',
      'IIT Lecture ② 11–1',
      'IIT Lecture ③ 3–5',
      'IIT Lecture ④ 5–7',
      'Phy CLA ② Prep',
      'POE CLA ② Prep',
    ],
  },
  {
    date: '2025-11-09',
    tasks: [
      'IIT Lecture ① 11–1',
      'IIT Lecture ② 2–4',
      'Bio CLA ② Prep (SRM)',
    ],
  },
  {
    date: '2025-11-10',
    tasks: [
      'PPS CLA ② Prep (SRM)',
    ],
  },

  // Page 4: Nov 2025
  {
    date: '2025-11-12',
    tasks: [
      'IIT All Sub Vdo Lec w①',
      'IIT All Sub Assignment/Quiz w①',
    ],
  },
  {
    date: '2025-11-14',
    tasks: [
      'IIT Lec ① 5–7',
      'IIT Lec ② 7–9',
    ],
  },
  {
    date: '2025-11-15',
    tasks: [
      'IIT Lec ① 9–11',
      'IIT Lec ② 11–1',
      'IIT Lec ③ 3–5',
      'IIT Lec ④ 5–7',
      'Elab Python Qs (30+)',
    ],
  },
  {
    date: '2025-11-17',
    tasks: [
      'IIT All Sub Vdo lec w①',
      'IIT All Sub Assignment/Quiz w①',
    ],
  },
  {
    date: '2025-11-18',
    tasks: [
      'POE UT ①',
      'POE UT ③',
    ],
  },
  {
    date: '2025-11-19',
    tasks: [
      'POE UT ④',
      'Phy UT ①',
      'Phy UT ② (SRM)',
    ],
  },
  {
    date: '2025-11-20',
    tasks: [
      'Phy UT ③',
      'Phy UT ④',
      'Phy UT ⑤',
      'POE UT ③',
    ],
  },
  {
    date: '2025-11-21',
    tasks: [
      'POE UT ⑤',
      'PPS UT ①',
      'PPS UT ②',
      'PPS UT ③',
      'IIT All Sub Vdo Lec w①',
      'IIT Lec ① 5–7',
      'IIT Lec ② 7–9',
    ],
  },
  {
    date: '2025-11-22',
    tasks: [
      'IIT All Sub Assignment/Quiz w②',
      'PPS UT ①',
      'PPS UT ③',
      'Maths UT ①',
      'IIT Lec ① 9–11',
      'IIT Lec ② 11–1',
      'IIT Lec ③ 3–5',
      'IIT Lec ④ 5–7',
    ],
  },
  {
    date: '2025-11-23',
    tasks: [
      'IIT Lec ① 11–1',
      'IIT Lec ② 2–4',
      'Maths UT ②',
      'Maths UT ③ (SRM)',
      'Maths UT ④',
      'Bio UT ① (SRM)',
    ],
  },
  {
    date: '2025-11-24',
    tasks: [
      'Maths UT ⑤',
      'Bio UT ② (SRM)',
      'Bio UT ③',
      'Bio UT ④ (SRM)',
      'ATA Coding Test (8pm IIT)',
    ],
  },
  {
    date: '2025-11-25',
    tasks: [
      'IIT All Sub Vdo Lec w②',
      'IIT All Sub Assignment/Quiz w②',
      'Physics All UT Revision (SRM)',
    ],
  },
  {
    date: '2025-11-26',
    tasks: [
      'POE All UT Revision (SRM)',
      'PPS UT ① and UT ② Revision',
    ],
  },
  {
    date: '2025-11-27',
    tasks: [
      'PPS All UT Revision (SRM)',
      'Pandas and Numpy (SRM)',
    ],
  },

  // Page 5: Nov 2025 - Jan 2026
  {
    date: '2025-11-28',
    tasks: [
      'IIT All Sub Vdo Lec w③',
      'IIT Lec ① 5–7',
      'IIT Lec ② 7–9',
    ],
  },
  {
    date: '2025-11-29',
    tasks: [
      'IIT Lec ① 9–11',
      'IIT Lec ② 11–1',
      'IIT Lec ③ 2–4',
      'IIT Lec ④ 4–6',
      'BDA End Module Test (8pm)',
      'IIT All Sub Quiz/Assignment w③',
    ],
  },
  {
    date: '2025-11-30',
    tasks: [
      'IIT Lec ① 9–11',
      'IIT Lec ② 11–1',
      'ATA Coding Test (8pm)',
      'FSP End Module Quiz (7pm)',
      'Maths All UT Revision (SRM)',
    ],
  },
  {
    date: '2025-12-02',
    tasks: [
      'Bio UT ⑤',
      'Eng UT ⑤ (SRM)',
    ],
  },
  {
    date: '2025-12-03',
    tasks: [
      'Bio All UT Revision (SRM)',
      'Bio All Diagrams, MCQs',
    ],
  },
  {
    date: '2025-12-07',
    tasks: [
      'BDA End Module Test (7pm)',
    ],
  },
  {
    date: '2025-12-08',
    tasks: [
      'BDA End Module Test (7pm)',
      'ATA Coding Test (8pm) (IIT)',
    ],
  },
  {
    date: '2025-12-09',
    tasks: [
      'LANA All UT Revision (IIT)',
    ],
  },
  {
    date: '2025-12-10',
    tasks: [
      'FSP All UT Revision (IIT)',
    ],
  },
  {
    date: '2025-12-11',
    tasks: [
      'ATA All UT Revision (IIT)',
    ],
  },
  {
    date: '2025-12-12',
    tasks: [
      'BDA All UT Revision (IIT)',
    ],
  },
  {
    date: '2025-12-17',
    tasks: [
      'LANA Capstone Project (IIT)',
    ],
  },
  {
    date: '2025-12-18',
    tasks: [
      'BDA Capstone Project (IIT)',
    ],
  },
  {
    date: '2025-12-19',
    tasks: [
      'FSP Capstone Project (IIT)',
      'Upload all Capstone Projs',
    ],
  },
  {
    date: '2026-01-19',
    tasks: [
      'Chem Record Exp 2 (SRM)',
    ],
  },
  {
    date: '2026-01-20',
    tasks: [
      'Chem Record Exp 1 (SRM)',
    ],
  },
  {
    date: '2026-01-21',
    tasks: [
      'EG Record Exp 2? (SRM)',
    ],
  },
  {
    date: '2026-01-26',
    tasks: [
      'Chem Assignment (SRM)',
      'German notes (SRM)',
    ],
  },

  // Page 6: Jan 2026 - Feb 2026
  {
    date: '2026-01-28',
    tasks: [
      'Chem Record Exp 3 (SRM)',
    ],
  },
  {
    date: '2026-01-29',
    tasks: [
      'EG Record Exp 3 (SRM)',
      'Chem CT Prep (Octahedral)',
    ],
  },
  {
    date: '2026-02-02',
    tasks: [
      'Maths CT Prep (Triple Integration)',
      'EEE CT Prep (SRM)',
    ],
  },
  {
    date: '2026-02-05',
    tasks: [
      'EG Record Exp 3 (SRM)',
      'Chem CT Prep (Tetrahedral)',
      'Chem Lab Man Viva & Exp',
    ],
  },
  {
    date: '2026-02-07',
    tasks: [
      'IIT LMS Orientation 11am',
      'FAI w① Vdo Lec (IIT)',
      'NMO2 w① Vdo Lec (IIT)',
      'PRP w① Vdo Lec (IIT)',
      'VSD w① Vdo Lec (IIT)',
      'FAI w① Quiz/Assignment (IIT)',
      'NMO2 w① Quiz/Assignment (IIT)',
      'PRP w① Quiz/Assignment (IIT)',
      'VSD w① Quiz/Assignment (IIT)',
    ],
  },
  {
    date: '2026-02-10',
    tasks: [
      'Chem Lab Man, Rec Readings',
      'EG Record Exp 4 (SRM)',
    ],
  },
  {
    date: '2026-02-11',
    tasks: [
      'EEE Assignment (SRM)',
    ],
  },
  {
    date: '2026-02-13',
    tasks: [
      'FAI w② Vdo Lec (IIT)',
      'NMO2 w② Vdo Lec (IIT)',
      'PRP w② Vdo Lec (IIT)',
      'VSD w② Vdo Lec (IIT)',
      'IIT Lec ① 7–9',
    ],
  },
  {
    date: '2026-02-14',
    tasks: [
      'IIT Lec ① 11–1',
      'IIT Lec ② 2–4',
      'IIT Lec ③ 5–7',
      'FAI w② Assignment/Quiz (IIT)',
      'PRP w② Assignment/Quiz (IIT)',
      'VSD w② Assignment/Quiz (IIT)',
    ],
  },
  {
    date: '2026-02-15',
    tasks: [
      'IIT Lec ① 9–11',
      'IIT Lec ② 3–5',
      'IIT Lec ③ 5–7',
      'NMO2 w② Assignment/Quiz (IIT)',
      'Chem CT Prep (Nernst Eq) (SRM)',
    ],
  },
  {
    date: '2026-02-16',
    tasks: [
      'IIT Assignment (SRM)',
      'EVS PPT Presentation (SRM)',
      'EG Exp 5? FHS, AutoCAD PO (SRM)',
      'German Assignment (SRM)',
      'OOP Assignment (C++) (SRM)',
    ],
  },
  {
    date: '2026-02-18',
    tasks: [
      'Maths (NB) Assignment (SRM)',
    ],
  },

  // Page 7: Feb 2026 - Mar 2026
  {
    date: '2026-02-20',
    tasks: [
      'FAI w③ Vdo Lec (IIT)',
      'NMO2 w③ Vdo Lec (IIT)',
      'PRP w③ Vdo Lec (IIT)',
      'VSD w③ Vdo Lec (IIT)',
      'IIT Lec ① 7–9',
    ],
  },
  {
    date: '2026-02-21',
    tasks: [
      'COI Test 11 (SRM)',
      'IIT Lec ① 12–2',
      'IIT Lec ② 2–4',
      'IIT Lec ③ 6–8',
      'FAI w③ Assignment/Quiz (IIT)',
      'NMO2 w③ Assignment/Quiz (IIT)',
      'PRP w③ Assignment/Quiz (IIT)',
      'VSD w③ Assignment/Quiz (IIT)',
      'OOP CT (SRM)',
    ],
  },
  {
    date: '2026-02-22',
    tasks: [
      'IIT Lec ① 9–11',
      'IIT Lec ② 3–5',
      'IIT Lec ③ 5–7',
      'EG Record Exp 5 (SRM)',
      'Chem Record Exp 4 (SRM)',
      'Chem Lab Man Viva, Readings',
    ],
  },
  {
    date: '2026-02-24',
    tasks: [
      'EEE CT (SRM)',
      'EG Exp ⑤ FHS, AutoCAD PO (SRM)',
    ],
  },
  {
    date: '2026-02-25',
    tasks: [
      'FAI NetworkX Assignment w③ (IIT)',
      'PRP Weka SS Assignment w③ (IIT)',
      'FAI AI Timeline Assignment w③ (IIT)',
      'PRP Weka Interface Assignment w③ (IIT)',
      'GA CT @ 6:30 PM (SRM)',
    ],
  },
  {
    date: '2026-02-27',
    tasks: [
      'FAI w④ Vdo Lec (IIT)',
      'NMO2 w④ Vdo Lec (IIT)',
      'PRP w④ Vdo Lec (IIT)',
      'VSD w④ Vdo Lec (IIT)',
      'IIT Lec ① 5–7',
      'IIT Lec ② 7–9',
      'FAI w④ Assignment/Quiz (IIT)',
      'NMO2 w④ Assignment/Quiz (IIT)',
      'PRP w④ Assignment/Quiz (IIT)',
      'VSD w④ Assignment/Quiz (IIT)',
    ],
  },
  {
    date: '2026-02-28',
    tasks: [
      'IIT Lec ① 12–2',
      'IIT Lec ② 2–4',
      'IIT Lec ③ 6–8',
    ],
  },
  {
    date: '2026-03-01',
    tasks: [
      'IIT Lec ① 9–11',
      'IIT Lec ② 3–5',
      'IIT Lec ③ 5–7',
      'EG Record Exp 6 (SRM)',
    ],
  },
  {
    date: '2026-03-03',
    tasks: [
      'EG Record Exp 6 (SRM)',
    ],
  },
  {
    date: '2026-03-04',
    tasks: [
      'German Assignment (SRM)',
      'Graphonline: top FAI Assignment w③ (IIT)',
      'PRP Weka SS Assignment w③ (IIT)',
      'Scala Potential UT ② Maths (SRM)',
      'Green\'s Theorem UT ② Maths (SRM)',
      'Volume based Qs UT ① Maths (SRM)',
    ],
  },

  // Page 8: Mar 2026
  {
    date: '2026-03-05',
    tasks: [
      'Gauss Div Thm UT ② Maths',
      'Area Based Qs UT ② Maths',
    ],
  },
  {
    date: '2026-03-06',
    tasks: [
      'IIT Lec ① 5–7',
      'IIT Lec ② 7–9',
      'FAI w⑤ Vdo Lec (IIT)',
    ],
  },
  {
    date: '2026-03-07',
    tasks: [
      'IIT Lec ① 2–4',
      'IIT Lec ② 2–4',
      'IIT Lec ③ 6–8',
      'Chem UT ② Prep (SRM)',
      'NMO2 w⑤ Vdo Lec (IIT)',
      'PRP w⑤ Vdo Lec (IIT)',
      'VSD w⑤ Vdo Lec (IIT)',
      'IGDT/IEEE/??, MASIET, SCR',
    ],
  },
  {
    date: '2026-03-08',
    tasks: [
      'IIT Lec ① 9–11',
      'IIT Lec ② 3–5',
      'IIT Lec ③ 5–7',
      'NPY/NPY',
      'SMPS, LVR, Rectifiers (H/E)',
    ],
  },
  {
    date: '2026-03-09',
    tasks: [
      'Polar coordinate',
      'Cardiod',
      'Triple Integrals',
      'IIT All Subs Assignment w⑤',
    ],
  },
  {
    date: '2026-03-10',
    tasks: [
      'German Unit ① (SRM)',
      'German Unit ② (SRM)',
      'EG Record Exp 7 (SRM)',
    ],
  },
  {
    date: '2026-03-11',
    tasks: [
      'Corrosion, Gibbs Eqn, Nernst Eq',
      'Galvanic cell, Entropy, Enthalpy',
    ],
  },
  {
    date: '2026-03-12',
    tasks: [
      'FAI w⑤ Quiz',
      'PRP w⑤ Quiz (IIT)',
      'VSD w⑤ Quiz',
      'NMO2 w⑤ Quiz (IIT)',
      'K-map',
      'EEE Unit ① (SRM)',
      'FAI (minimax Visualizer) Assignment (IIT)',
      'PRP (Weka Weather Data) Assignment (IIT)',
    ],
  },
  {
    date: '2026-03-13',
    tasks: [
      'IIT Lec ① 5–7',
      'IIT Lec ② 7–9',
      'FAI w⑥ Vdo Lec (IIT)',
    ],
  },
  {
    date: '2026-03-14',
    tasks: [
      'OOP UT ② (SRM)',
      'IIT Lec ① 12–2',
      'IIT Lec ② 6–8',
    ],
  },
  {
    date: '2026-03-15',
    tasks: [
      'IIT Lec ① 9–11',
      'IIT Lec ② 1–3',
      'IIT Lec ③ 3–5',
      'IIT Lec ④',
      'OOP UT ② (SRM)',
    ],
  },
  {
    date: '2026-03-17',
    tasks: [
      'NMO2 w⑥ Vdo Lec (IIT)',
      'PRP w⑥ Vdo Lec (IIT)',
    ],
  },
  {
    date: '2026-03-18',
    tasks: [
      'VSD w⑥ Vdo Lec (IIT)',
      'PRP (NaiveBayes) Assignment w⑥',
      'VSD (Dataset Graph) Assignment w⑥ (IIT)',
    ],
  },

  // Page 9: Mar 2026
  {
    date: '2026-03-19',
    tasks: [
      'FAI w⑥ Quiz/Assignment (IIT)',
      'NMO2 w⑥ Quiz/Assignment (IIT)',
      'PRP w⑥ Quiz/Assignment (IIT)',
      'VSD w⑥ Quiz/Assignment (IIT)',
      'FAI (Unicode Function) Assignment (IIT)',
      'Chem Record Exp 8 (SRM)',
      'EG Record Exp 8 (SRM)',
    ],
  },
  {
    date: '2026-03-20',
    tasks: [
      'EG Exp ⑨ AutoCAD PO, FHS (SRM)',
      'IIT Lec ① 7–9',
    ],
  },
  {
    date: '2026-03-21',
    tasks: [
      'IIT Lec ① 12–2',
      'IIT Lec ② 2–4',
      'IIT Lec ③ 6–8',
    ],
  },
  {
    date: '2026-03-22',
    tasks: [
      'NMO2 Assignment ① (NB) (IIT)',
      'NMO2 Assignment ② Quiz (IIT)',
      'IIT Lec ① 9–11',
      'IIT Lec ② 1–3',
      'IIT Lec ③ 3–5',
      'IIT Lec ④ 5–7',
      'Chem Record Exp ⑥ (SRM)',
      'Chem Record Exp ⑥ (SRM)',
      'NMO2 Quiz ② (Lab Type) (IIT)',
      'Chem Lab Manual Readings',
    ],
  },
  {
    date: '2026-03-23',
    tasks: [
      'Chem Lab Man Viva (SRM)',
      'COI College Assignment (SRM)',
    ],
  },
  {
    date: '2026-03-24',
    tasks: [
      'German Notes (SRM)',
      'COI Writing Assignment (ROP) (SRM)',
      'FAI w⑦ Vdo Lec (IIT)',
      'NMO2 w⑦ Vdo Lec (IIT)',
      'VSD w⑦ Vdo Lec (IIT)',
      'PRP w⑦ Vdo Lec (IIT)',
      'FAI (Chatbot) Assignment w⑦ (IIT)',
    ],
  },
  {
    date: '2026-03-25',
    tasks: [
      'EEE Assignment (Motors) (SRM)',
      'EEE Poster Assignment (SRM)',
      'PRP Weka Assignment w⑦ (IIT)',
      'VSD (Geospatial Map) Assignment w⑦ (IIT)',
      'FAI w⑦ Quiz/Assignment (IIT)',
      'NMO2 w⑦ Quiz/Assignment (IIT)',
      'PRP w⑦ Quiz/Assignment (IIT)',
    ],
  },
  {
    date: '2026-03-26',
    tasks: [
      'VSD w⑦ Quiz/Assignment (IIT)',
      'NMO2 (Google Collab) Assignment w⑦ (IIT)',
      'Maths CLA ③ (SRM)',
      'Chem Record Exp 9 (SRM)',
    ],
  },
  {
    date: '2026-03-27',
    tasks: [
      'IIT Lec ① 7–9',
      'IIT Lec ② 5–7',
      'PRP Weekly Quiz (8pm) (IIT)',
      'EVS CT ① (6:30 pm) (SRM)',
    ],
  },
  {
    date: '2026-03-28',
    tasks: [
      'IIT Lec ① 12–2',
      'IIT Lec ② 2–4',
      'IIT Lec ③ 6–8',
    ],
  },
  {
    date: '2026-03-29',
    tasks: [
      'IIT Lec ① 9–11',
      'IIT Lec ② 3–5',
      'IIT Lec ③ 5–7',
      'FAI w⑧ Vdo Lec (IIT)',
    ],
  },
  {
    date: '2026-03-30',
    tasks: [
      'EG Record Exp ⑨ (SRM)',
      'EG Record Exp ⑩ (SRM)',
      'NMO2 w⑧ Vdo Lec (IIT)',
    ],
  },
  {
    date: '2026-03-31',
    tasks: [
      'PRP w⑧ Vdo Lec (IIT)',
      'VSD w⑧ Vdo Lec (IIT)',
      'OOP (Data arrays) Seminar (SRM)',
      'FAI (Chatbot) Assignment w⑧ (IIT)',
    ],
  },

  // Page 10: Apr 2026
  {
    date: '2026-04-01',
    tasks: [
      'VSD (Chatbot) w⑧ Assignment (IIT)',
    ],
  },
  {
    date: '2026-04-02',
    tasks: [
      'EG Record Exp ⑩ (SRM)',
      'EG Record Exp ⑪ (SRM)',
      'FAI w⑧ Quiz/Assignment (IIT)',
      'NMO2 w⑧ Quiz/Assignment (IIT)',
      'PRP w⑧ Quiz/Assignment (IIT)',
      'VSD w⑧ Quiz/Assignment (IIT)',
    ],
  },
  {
    date: '2026-04-03',
    tasks: [
      'FAI w⑨ Vdo Lec (IIT)',
      'NMO2 w⑨ Vdo Lec (IIT)',
      'PRP w⑨ Vdo Lec (IIT)',
      'VSD w⑨ Vdo Lec (IIT)',
      'FAI w⑨ Quiz/Assignment (IIT)',
      'NMO2 w⑨ Quiz/Assignment (IIT)',
      'PRP w⑨ Quiz/Assignment (IIT)',
      'VSD w⑨ Quiz/Assignment (IIT)',
      'IIT Lec ① 5–7',
      'IIT Lec ② 7–9',
      'PRP Weekly Quiz (8pm) (IIT)',
    ],
  },
  {
    date: '2026-04-04',
    tasks: [
      'Chemistry HOTS Assignment (SRM)',
      'NMO2 Insertion Practical Assignment (IIT)',
      'EEE Assignment (DSA, LCD) (SRM)',
      'IIT Lec ① 12–2',
      'IIT Lec ② 2–4',
      'IIT Lec ③ 6–8',
      'FAI Insertion (Chatbot) Assignment (IIT)',
    ],
  },
  {
    date: '2026-04-05',
    tasks: [
      'Chemistry Assignment (SRM)',
      'IIT Lec ① 9–11',
      'IIT Lec ② 3–5',
      'IIT Lec ③ 5–7',
      'VSD Insertion (Sample Dataset) Practical Assignment (IIT)',
    ],
  },
  {
    date: '2026-04-06',
    tasks: [
      'EG Exp ⑩ AutoCAD PO, FHS (SRM)',
      'EG Exp ⑪ AutoCAD PO, FHS (SRM)',
    ],
  },
  {
    date: '2026-04-08',
    tasks: [
      'OOP Mini Project (SRM)',
      'Chem Practical Exam Exp ⑤ (SRM)',
    ],
  },
  {
    date: '2026-04-09',
    tasks: [
      'Chem Practical Exam Exp ⑤ (SRM)',
      'Chem Practical Viva Prep (SRM)',
    ],
  },
  {
    date: '2026-04-10',
    tasks: [
      'IIT Lec ① 5–7',
      'IIT Lec ② 7–9',
      'PRP Weekly Quiz (8pm) (IIT)',
      'VSD Vdo Lec w⑩ (IIT)',
      'PRP Vdo Lec w⑩ (IIT)',
    ],
  },
  {
    date: '2026-04-11',
    tasks: [
      'IIT Lec ① 12–2',
      'IIT Lec ② 2–4',
      'IIT Lec ③ 6–8',
      'NMO2 Vdo Lec w⑩ (IIT)',
      'FAI Vdo Lec w⑩ (IIT)',
      'Maths Webinar (2pm) (SRM)',
      'FAI w⑩ Quiz/Assignment (IIT)',
    ],
  },
  {
    date: '2026-04-12',
    tasks: [
      'IIT Lec ① 9–11',
      'IIT Lec ② 3–5',
      'FAI w⑩ Quiz/Assignment (IIT)',
    ],
  },
  {
    date: '2026-04-13',
    tasks: [
      'German Assignment (SRM)',
      'Chemistry Surprise Test (SRM)',
      'PRP Mini Project (IIT)',
      'NMO2 w⑩ Practical Assignment (IIT)',
    ],
  },
  {
    date: '2026-04-14',
    tasks: [
      'NMO2 w⑩ Quiz/Assignment (IIT)',
      'PRP w⑩ Quiz/Assignment (IIT)',
      'VSD w⑩ Quiz/Assignment (IIT)',
      'FAI w⑩ (Sarvar/Mat) Practical Assignment (IIT)',
    ],
  },
  {
    date: '2026-04-15',
    tasks: [
      'EG Practical Preparation (SRM)',
      'EVS CLA ③ (6:30 pm) (SRM)',
    ],
  },
  {
    date: '2026-04-16',
    tasks: [
      'CLA ② Maths Prep (SRM)',
      'CLA ② German Prep (SRM)',
    ],
  },
  {
    date: '2026-04-17',
    tasks: [
      'IIT Lec ① 5–7',
      'IIT Lec ② 7–9',
    ],
  },
  {
    date: '2026-04-18',
    tasks: [
      'IIT Lec ① 12–2',
      'IIT Lec ② 2–4',
      'IIT Lec ③ 6–8',
      'CLA ② EEE (All 3 Uts) Prep (SRM)',
    ],
  },
  {
    date: '2026-04-19',
    tasks: [
      'CLA ② Chem (All 3 Uts) Prep (SRM)',
      'IIT Lec ① 9–11',
      'IIT Lec ② 3–5',
      'IIT Lec ③ 5–7',
    ],
  },
  {
    date: '2026-04-20',
    tasks: [
      'CLA ② OOP (All 3 Uts) Prep (SRM)',
    ],
  },
  {
    date: '2026-04-22',
    tasks: [
      'FAI w⑩ (Bayes Thm) Practical Assignment (IIT)',
    ],
  },

  // Page 11: Apr 2026 - May 2026
  {
    date: '2026-04-23',
    tasks: [
      'FAI w⑪ Vdo Lec (IIT)',
      'NMO2 w⑪ Vdo Lec (IIT)',
      'PRP w⑪ Vdo Lec (IIT)',
      'VSD w⑪ Vdo Lec (IIT)',
    ],
  },
  {
    date: '2026-04-24',
    tasks: [
      'PRP TA Special Assignment (IIT)',
      'VSD w⑪ Assignment/Quiz (IIT)',
      'PRP w⑪ Assignment/Quiz (IIT)',
      'FAI w⑪ Assignment/Quiz (IIT)',
      'NMO2 w⑪ Assignment/Quiz (IIT)',
    ],
  },
  {
    date: '2026-04-25',
    tasks: [
      'FAI w⑪ Vdo Lec (IIT)',
      'NMO2 w⑪ Vdo Lec (IIT)',
      'IIT Lec ① 12–2',
      'IIT Lec ② 2–4',
      'IIT Lec ③ 6–8',
    ],
  },
  {
    date: '2026-04-26',
    tasks: [
      'IIT Lec ① 9–11',
      'IIT Lec ② 3–5',
      'IIT Lec ③ 5–7',
      'IIT Lec ④ 7–9',
    ],
  },
  {
    date: '2026-04-27',
    tasks: [
      'PRP w⑪ Vdo Lec (IIT)',
      'VSD w⑪ Vdo Lec (IIT)',
    ],
  },
  {
    date: '2026-04-29',
    tasks: [
      'FAI w⑪ Assignment/Quiz (IIT)',
      'NMO2 w⑪ Assignment/Quiz (IIT)',
      'PRP w⑪ Assignment/Quiz (IIT)',
      'VSD w⑪ Assignment/Quiz (IIT)',
    ],
  },
  {
    date: '2026-04-30',
    tasks: [
      'PRP TA Special Assignment ② (IIT)',
    ],
  },
  {
    date: '2026-05-01',
    tasks: [
      'FAI In Session Assignment (IIT)',
      'FAI w⑪ Vdo Lec (IIT)',
      'NMO2 w⑪ Vdo Lec (IIT)',
      'PRP w⑪ Vdo Lec (IIT)',
      'VSD w⑪ Vdo Lec (IIT)',
      'FAI w⑪ Assignment/Quiz (IIT)',
      'NMO2 w⑪ Assignment/Quiz (IIT)',
      'PRP w⑪ Assignment/Quiz (IIT)',
      'PRP Weekly Quiz (8pm) (IIT)',
    ],
  },
  {
    date: '2026-05-02',
    tasks: [
      'IIT Lec ① 12–2',
      'IIT Lec ② 2–4',
      'IIT Lec ③ 6–8',
      'NMO2 (Optimal Shading) Assignment (IIT)',
    ],
  },
  {
    date: '2026-05-05',
    tasks: [
      'Chem End Sem Prep (SRM)',
      'IIT End Sem Prep (Uts 3,4,5) (SRM)',
    ],
  },
  {
    date: '2026-05-06',
    tasks: [
      'Maths UT ① End Sem Prep (SRM)',
      'EEE UT ① Revision (SRM)',
      'German UT ① End Sem Prep (SRM)',
    ],
  },
  {
    date: '2026-05-07',
    tasks: [
      'Chem All Uts Revision (SRM)',
      'Maths UT ① End Sem Prep (SRM)',
      'German UT ② End Sem (SRM)',
    ],
  },

  // Page 12: May 2026
  {
    date: '2026-05-08',
    tasks: [
      'IIT Lec ① 5–7',
      'IIT Lec ② 7–9',
      'PRP Weekly Quiz (8pm)',
    ],
  },
  {
    date: '2026-05-09',
    tasks: [
      'IIT Lec ① 12–2',
      'IIT Lec ② 2–4',
      'IIT Lec ③ 6–8',
      'FAI In-Session Assignment (IIT)',
      'FAI w⑫ Vdo Lec (IIT)',
      'NMO2 w⑫ Vdo Lec (IIT)',
      'PRP w⑫ Vdo Lec (IIT)',
      'VSD w⑫ Vdo Lec (IIT)',
    ],
  },
  {
    date: '2026-05-10',
    tasks: [
      'IIT Lec ① 9–11',
      'IIT Lec ② 3–5',
      'IIT Lec ③ 5–7',
      'IIT Lec ④ 7–9',
      'FAI w⑫ Quiz/Assignment (IIT)',
      'NMO2 w⑫ Quiz/Assignment (IIT)',
      'PRP w⑫ Quiz/Assignment (IIT)',
      'VSD w⑫ Quiz/Assignment (IIT)',
    ],
  },
  {
    date: '2026-05-11',
    tasks: [
      'Maths (ACCA) End Sem Exam (SRM)',
      'Chem End Sem Revision (SRM)',
    ],
  },
  {
    date: '2026-05-12',
    tasks: [
      'Chem End Sem Exam (SRM)',
      'OOP UT ③, ② Revision (SRM)',
    ],
  },
  {
    date: '2026-05-13',
    tasks: [
      'OOP UT ③, ⑤ Revision (SRM)',
    ],
  },
  {
    date: '2026-05-14',
    tasks: [
      'OOP End Sem Exam (SRM)',
      'EEE All Uts Revision (SRM)',
    ],
  },
  {
    date: '2026-05-15',
    tasks: [
      'EEE End Sem Exam (SRM)',
      'IIT Lec ① 5–7',
      'IIT Lec ② 7–9',
      'PRP Weekly Quiz (8pm) (IIT)',
    ],
  },
  {
    date: '2026-05-16',
    tasks: [
      'IIT Lec ① 12–2',
      'IIT Lec ② 2–4',
      'IIT Lec ③ 6–8',
    ],
  },
  {
    date: '2026-05-17',
    tasks: [
      'IIT Lec ① 9–11',
      'IIT Lec ② 3–5',
      'IIT Lec ③ 5–7',
      'IIT Lec ④ 7–9',
      'German UT ①,② Revision (SRM)',
    ],
  },
  {
    date: '2026-05-18',
    tasks: [
      'German UT ③,④,⑤ Revision (SRM)',
    ],
  },
  {
    date: '2026-05-19',
    tasks: [
      'German End Sem Exam (SRM)',
    ],
  },
  {
    date: '2026-05-26',
    tasks: [
      'NMO2 Quiz ① (Exam) (IIT)',
    ],
  },
  {
    date: '2026-05-27',
    tasks: [
      'NMO2 Quiz ② (Exam) (IIT)',
    ],
  },
  {
    date: '2026-05-29',
    tasks: [
      'FAI Capstone Project (IIT)',
    ],
  },

  // Page 13: May 2026 - Aug 2026
  {
    date: '2026-05-30',
    tasks: [
      'NMO2 Quiz ③ (Exam) (IIT)',
      'VSD Graded Assignment (IIT)',
    ],
  },
  {
    date: '2026-06-02',
    tasks: [
      'VSD Graded Assignment (IIT)',
    ],
  },
  {
    date: '2026-06-09',
    tasks: [
      'NMO2 All Uts Prep (IIT)',
      'PRP All Uts Prep (IIT)',
    ],
  },
  {
    date: '2026-06-10',
    tasks: [
      'FAI All Uts Prep (IIT)',
      'VSD All Uts Prep (IIT)',
    ],
  },
  {
    date: '2026-06-11',
    tasks: [
      'NMO2 All Uts Rev (IIT)',
      'PRP All Uts Rev (IIT)',
    ],
  },
  {
    date: '2026-06-12',
    tasks: [
      'NMO2 End Sem Exam',
      'PRP End Sem Exam',
      'FAI All Uts Rev (IIT)',
      'VSD All Uts Rev (IIT)',
    ],
  },
  {
    date: '2026-06-13',
    tasks: [
      'FAI End Sem Exam',
      'VSD End Sem Exam',
    ],
  },
  {
    date: '2026-07-22',
    tasks: [
      'OS Exp 1A PO (SRM)',
      'DSA Exp 1 Note (SRM)',
    ],
  },
  {
    date: '2026-07-23',
    tasks: [
      'UHV Presentation Prep',
    ],
  },
  {
    date: '2026-07-24',
    tasks: [
      'DSA Exp 2 Note (SRM)',
    ],
  },
  {
    date: '2026-07-25',
    tasks: [
      'STH Prototype model',
      'NPTEL Course Registration',
    ],
  },
  {
    date: '2026-07-28',
    tasks: [
      'DSA Exp 3 Note (SRM)',
    ],
  },
  {
    date: '2026-07-29',
    tasks: [
      'DSA Exp 4 Note (SRM)',
      'OS Exp 1 (B.C.) Note (SRM)',
    ],
  },
  {
    date: '2026-07-30',
    tasks: [
      'LinkedIn Profile Update',
    ],
  },
  {
    date: '2026-07-31',
    tasks: [
      'GitHub Repositories',
    ],
  },
  {
    date: '2026-08-01',
    tasks: [
      'NPTEL Assignment w①',
      'NPTEL Assignment w②',
      'NPTEL Assignment w③',
    ],
  },

  // Page 14: Aug 2026
  {
    date: '2026-08-03',
    tasks: [
      'DSA Notes (SRM)',
    ],
  },
  {
    date: '2026-08-04',
    tasks: [
      'APP Exp No 1 Note (SRM)',
      'APP Exp No 2 Note (SRM)',
      'APP Exp No 3 Note (SRM)',
    ],
  },
  {
    date: '2026-08-05',
    tasks: [
      'OS Exp No 2 Note (SRM)',
      'OS Exp No 3A Note (SRM)',
      'OS Exp No 3B Note (SRM)',
    ],
  },
  {
    date: '2026-08-07',
    tasks: [
      'LinkedIn (Certificate Upload)',
      'IBM SkillsBuild Certification',
      'IBM SkillsBuild Certification',
    ],
  },
  {
    date: '2026-08-08',
    tasks: [
      'KTC Quiz (TIT-GW) (Unstop)',
      'AI Arena 2026 Quiz (Unstop)',
      'IBM SkillsBuild Certification',
    ],
  },
  {
    date: '2026-08-09',
    tasks: [
      'QuestOP 2026 Quiz (Unstop)',
      'Adobe Round ① (Unstop)',
    ],
  },
  {
    date: '2026-08-10',
    tasks: [
      'Operations Blueprint (Unstop) (Pre-Assessment)',
      'Elite Quiz S.O (Unstop)',
      'CSS with AI Cert (Unstop)',
    ],
  },
  {
    date: '2026-08-11',
    tasks: [
      'Operating Systems Cert (Unstop)',
      'AI/ML Mastery Cert (Unstop)',
    ],
  },
  {
    date: '2026-08-12',
    tasks: [
      'Omnikon 2026 Quiz (Unstop)',
      'DSA Exp No 5 Note (SRM)',
      'OS Exp No 4A Note (SRM)',
      'OS Exp No 4B Note (SRM)',
      'APP Exp No 4 Note (SRM)',
      'MERN Fullstack Cert (Unstop)',
      'Node JS Cert (Unstop)',
    ],
  },
  {
    date: '2026-08-13',
    tasks: [
      'Unstop Quizverse 2026 R1 (8–10pm)',
      'JavaScript ES6 Cert (Unstop)',
      'ReactJS Cert (Unstop)',
      'JQuery Cert (Unstop)',
      'HTML with AI Cert (Unstop)',
      'C++ DSA Cert (Unstop)',
      'Power BI Cert (Unstop)',
    ],
  },
  {
    date: '2026-08-14',
    tasks: [
      'Java Programming Cert (Unstop)',
      'Data Analytics Cert (Unstop)',
      'Database Management Cert (DBMS)',
      'Java DSA Cert (Unstop)',
      'Unstop Quizverse 2026 R2 (8–10pm)',
      'C++ Programming Cert (Unstop)',
      'AWS with AI Cert (Unstop)',
      'Tableau Analytics Cert (Unstop)',
    ],
  },

  // Page 15: Aug 2026 - Sep 2026
  {
    date: '2026-08-15',
    tasks: [
      'Unstop Quizverse R3',
    ],
  },
  {
    date: '2026-08-16',
    tasks: [
      'Unstop Quizverse R4',
      'Adobe Round ② (Unstop)',
    ],
  },
  {
    date: '2026-08-17',
    tasks: [
      'OS Case Study Assignment (SRM)',
    ],
  },
  {
    date: '2026-08-18',
    tasks: [
      'APP Exp 1,2,3,4 (SRM)',
    ],
  },
  {
    date: '2026-08-19',
    tasks: [
      'APP Exp No 5 Note (SRM)',
      'OS Exp 5,6 Note (SRM)',
    ],
  },
  {
    date: '2026-08-20',
    tasks: [
      'Intro To OS Cert (Scalar)',
      'Hardlock Registration',
      'LeetCode (10 Problems)',
    ],
  },
  {
    date: '2026-08-22',
    tasks: [
      'NPTEL w 4,5 Assignment',
    ],
  },
  {
    date: '2026-08-24',
    tasks: [
      'UHV Assignment (SRM)',
      'DSA Assignment (SRM)',
      'Maths Assignment (SRM)',
    ],
  },
  {
    date: '2026-08-25',
    tasks: [
      'COA Assignment (SRM)',
      'STH Mob App Prototype (P1)',
    ],
  },
  {
    date: '2026-08-26',
    tasks: [
      'DSA UT ① CLA Prep (SRM)',
      'STH Mob App Prototype (P2)',
    ],
  },
  {
    date: '2026-08-27',
    tasks: [
      'PE PPT (SRM)',
      'PE Digital Poster (SRM)',
    ],
  },
  {
    date: '2026-08-28',
    tasks: [
      'OS UT ① CLA Prep (SRM)',
      'APP Assignment (SRM)',
      'COA Quiz (6pm) (SRM)',
    ],
  },
  {
    date: '2026-08-29',
    tasks: [
      'Maths UT ① CLA Prep (SRM)',
    ],
  },
  {
    date: '2026-08-30',
    tasks: [
      'Maths UT ② CLA Prep (SRM)',
    ],
  },
  {
    date: '2026-08-31',
    tasks: [
      'Maths UT ①, UT ② Revision',
      'DSA UT ① CLA Prep (SRM)',
    ],
  },
  {
    date: '2026-09-01',
    tasks: [
      'DSA UT ② CLA Prep (SRM)',
      'OS UT ① Prep (SRM)',
    ],
  },

  // Page 16: Sep 2026
  {
    date: '2026-09-02',
    tasks: [
      'OS UT ② Prep (SRM)',
      'OS UT ②, UT ③ Revision',
    ],
  },
  {
    date: '2026-09-03',
    tasks: [
      'STH Prototype Meet (7pm)',
      'IIT Lecture ① 7–9',
      'ML1 w① Vdo Lec (IIT)',
      'ML1 w① Assignment/Quiz (IIT)',
      'OS w① Vdo Lec (IIT)',
      'PDS w① Vdo Lec (IIT)',
      'IDB w① Vdo Lec (IIT)',
    ],
  },
  {
    date: '2026-09-04',
    tasks: [
      'OS w① Assignment/Quiz (IIT)',
      'PDS w① Assignment/Quiz (IIT)',
      'IDB w① Assignment/Quiz (IIT)',
      'OS w② Vdo Lec (IIT)',
      'ML1 w② Vdo Lec (IIT)',
      'PDS w② Vdo Lec (IIT)',
      'IDB w② Vdo Lec (IIT)',
      'iMap (UT Fix) (SRM)',
    ],
  },
  {
    date: '2026-09-05',
    tasks: [
      'STH Internal Hackathon',
      'IIT Lec ① 8–10',
      'IIT Lec ② 12–2',
      'IIT Lec ③ 5–7',
      'IIT Lec ④ 7–9',
    ],
  },
  {
    date: '2026-09-06',
    tasks: [
      'IIT Lec ① 11–1',
      'IIT Lec ② 2–4',
      'IIT Lec ③ 7–9',
      'COA UT ①, ② Prep (SRM)',
    ],
  },
  {
    date: '2026-09-09',
    tasks: [
      'PDS w② Assignment/Quiz (IIT)',
      'IDB w② Assignment/Quiz (IIT)',
      'ML1 w② Assignment/Quiz (IIT)',
      'OS Exp 7 Note (SRM)',
      'OS w② Assignment/Quiz (IIT)',
      'DSA Exp 6 Note (SRM)',
      'Quizquest Quiz (Unstop)',
    ],
  },
  {
    date: '2026-09-10',
    tasks: [
      'DSA Exp 7A Note (SRM)',
    ],
  },
];

// Helper to pseudo-randomly generate realistic timestamps for each date
function generateRandomTaskTimes(dateStr: string, index: number, isLate: boolean = false) {
  // Parse date
  const [year, month, day] = dateStr.split('-').map(Number);
  
  // Seed random variation based on date and index for consistency
  const pseudoSeed = (year * 365 + month * 31 + day * 13 + index * 17) % 100;
  
  // Created time: between 07:15 AM and 11:45 AM on assigned date (local time)
  const createHour = 7 + Math.floor((pseudoSeed % 5));
  const createMinute = ((pseudoSeed * 7) % 60);
  const createdDate = new Date(year, month - 1, day, createHour, createMinute, 0);
  
  let completedDate: Date;
  if (isLate) {
    // Completed late: after midnight on the following day (e.g. 02:15 to 11:30 AM next day)
    const lateHour = 2 + Math.floor(((pseudoSeed + index) % 10));
    const lateMinute = (((pseudoSeed + index) * 13) % 60);
    // Next day (day + 1)
    completedDate = new Date(year, month - 1, day + 1, lateHour, lateMinute, 0);
  } else {
    // Completed time: between 14:30 and 22:45 PM on the same date (completed on time before midnight)
    const completeHour = 14 + Math.floor(((pseudoSeed + index) % 8));
    const completeMinute = (((pseudoSeed + index) * 11) % 60);
    completedDate = new Date(year, month - 1, day, completeHour, completeMinute, 0);
  }

  return {
    createdAt: createdDate.toISOString(),
    completedAt: completedDate.toISOString(),
  };
}

// 13 specific tasks across the timeline marked as completed after midnight deadline
const lateTaskKeys = new Set([
  '2025-10-16_LANA Quiz/Assignment',
  '2025-11-05_IIT All Sub Assignment complete',
  '2025-11-22_IIT All Sub Assignment/Quiz w②',
  '2025-12-19_Upload all Capstone Projs',
  '2026-02-16_OOP Assignment (C++) (SRM)',
  '2026-02-25_PRP Weka Interface Assignment w③ (IIT)',
  '2026-03-12_PRP (Weka Weather Data) Assignment (IIT)',
  '2026-03-26_NMO2 (Google Collab) Assignment w⑦ (IIT)',
  '2026-04-04_Chemistry HOTS Assignment (SRM)',
  '2026-04-24_PRP TA Special Assignment (IIT)',
  '2026-05-09_FAI In-Session Assignment (IIT)',
  '2026-08-12_MERN Fullstack Cert (Unstop)',
  '2026-08-20_LeetCode (10 Problems)',
]);

export function getArnabHistoricalTasks(): DailyTask[] {
  const generatedTasks: DailyTask[] = [];

  for (const day of rawSchedule) {
    day.tasks.forEach((taskTitle, idx) => {
      const cleanTitle = taskTitle.trim();
      const taskKey = `${day.date}_${cleanTitle}`;
      const isLate = lateTaskKeys.has(taskKey);

      const { createdAt, completedAt } = generateRandomTaskTimes(day.date, idx, isLate);
      const taskId = `arnab_hist_${day.date.replace(/-/g, '')}_${idx + 1}`;

      generatedTasks.push({
        id: taskId,
        title: cleanTitle,
        assignedDate: day.date,
        createdAt,
        completedAt,
        status: isLate ? 'completed_late' : 'completed_on_time',
        originalStatus: 'pending',
        isCompletedOnTime: !isLate,
        isCompletedLate: isLate,
        lastModified: completedAt,
        historyLog: [
          {
            timestamp: createdAt,
            action: 'Task Created',
            details: `Assigned for ${day.date}`,
          },
          {
            timestamp: completedAt,
            action: isLate ? 'Completed Late' : 'Completed On Time',
            details: isLate
              ? 'Finished and marked complete after midnight deadline'
              : 'Finished and marked complete before midnight deadline',
          },
        ],
      });
    });
  }

  return generatedTasks;
}
