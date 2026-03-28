export type Lang = "en" | "da";
export type Key = keyof typeof en;

export const en = {
  // Home
  appName: "AmbuAssist",
  homeTagline: "Minimal tools for chaotic reality",
  language: "Language",
  english: "English",
  danish: "Danish",
  open: "Open",

  // Tool cards
  tool_weightDose_title: "Weight → Joule + Doses",
  tool_weightDose_desc: "Age → weight estimate → joules + configured meds",
  tool_news2_title: "NEWS2",
  tool_news2_desc: "Vitals → NEWS2 score + escalation",
  tool_wells_title: "Wells (DVT)",
  tool_wells_desc: "DVT probability scoring",
  tool_nihss_title: "NIHSS",
  tool_nihss_desc: "Stroke severity scoring",
  tool_bvc_title: "BVC",
  tool_bvc_desc: "Brøset Violence Checklist",
  tool_settings_title: "Settings",
  tool_settings_desc: "Weight formula, default J/kg, med dose list",

  // Common
  loading: "Loading…",
  result: "Result",
  clinicalReminder:
    "Clinical reminder: this is a calculator. Your local guideline wins. Use it to reduce arithmetic errors, not judgement errors.",
  save: "Save",
  reset: "Reset",
  cancel: "Cancel",
  remove: "Remove",
  add: "Add",

  // Weight/Joule/Dose
  wjd_title: "Weight → Joule + Doses",
  wjd_sub: "Age → estimated kg → joules + your configured medication list.",
  wjd_age: "Age",
  wjd_years: "years",
  wjd_weight_override: "Weight (override)",
  wjd_kg_optional: "kg (optional)",
  wjd_jkg_override: "J/kg (override)",
  wjd_calculated: "Calculated",
  wjd_estWeight: "Est. weight",
  wjd_usingWeight: "Using weight",
  wjd_energy: "Energy",
  wjd_doses: "Doses",
  wjd_doses_sub:
    "Shown only for enabled meds. Add concentration to also get mL.",
  wjd_noMeds: "No enabled meds. Go to Settings → Medication list.",
  wjd_dose: "Dose",
  wjd_volume: "Volume",

  // NEWS2
  news2_title: "NEWS2",
  news2_sub: "Enter vitals — score and escalation update live.",
  news2_scale: "SpO₂ scale",
  news2_scale1: "Scale 1",
  news2_scale2: "Scale 2",
  news2_o2: "Supplemental O₂",
  news2_consciousness: "Consciousness (AVPU)",
  news2_rr: "Resp rate (RR)",
  news2_spo2: "SpO₂",
  news2_sbp: "Systolic BP (SBP)",
  news2_hr: "Heart rate (HR)",
  news2_temp: "Temperature",
  news2_points: "pts",
  news2_guidance_note:
    "Note: escalation thresholds and observation frequency can vary by region/hospital.",
  news2_guidance_0: "NEWS 0: Low risk (routine obs as per local policy).",
  news2_guidance_high:
    "High risk (NEWS ≥ 7): urgent clinical review / escalation.",
  news2_guidance_any3:
    "Single parameter scoring 3: urgent clinical review (even if total is lower).",
  news2_guidance_med:
    "Medium risk (NEWS 5–6): urgent review / consider escalation.",
  news2_guidance_low:
    "Low–moderate risk (NEWS 1–4): increased observation and clinical judgement.",

  // Wells
  wells_title: "Wells score (DVT)",
  wells_sub: "Tick findings — score and interpretation update instantly.",
  wells_score: "Score",
  wells_twoLevel: "Two-level",
  wells_threeLevel: "Three-level (classic)",
  wells_result_twolevel_likely: "DVT likely (≥ 2)",
  wells_result_twolevel_unlikely: "DVT unlikely (≤ 1)",
  wells_three_low: "Low",
  wells_three_moderate: "Moderate",
  wells_three_high: "High",
  wells_clinical_reminder:
    "Clinical reminder: In most pathways you combine Wells with D-dimer and/or ultrasound. AmbuAssist supports your thinking — it doesn’t replace local guidelines.",

  // NIHSS
  nihss_sub: "Select one option per item — total updates instantly.",
  nihss_noStroke: "0: No stroke symptoms",
  nihss_minor: "1–4: Minor stroke",
  nihss_moderate: "5–15: Moderate stroke",
  nihss_modSevere: "16–20: Moderate–severe stroke",
  nihss_severe: "21+: Severe stroke",
  nihss_title: "NIHSS",
  nihss_scoreLabel: "NIHSS:",

  nihss_1a_title: "1a. Level of consciousness",
  nihss_1a_opt_alert: "Alert",
  nihss_1a_opt_drowsy: "Drowsy",
  nihss_1a_opt_obtunded: "Obtunded",
  nihss_1a_opt_coma: "Coma / unresponsive",

  nihss_1b_title: "1b. LOC questions",
  nihss_1b_opt_both: "Answers both correctly",
  nihss_1b_opt_one: "Answers one correctly",
  nihss_1b_opt_neither: "Answers neither correctly",

  nihss_1c_title: "1c. LOC commands",
  nihss_1c_opt_both: "Performs both correctly",
  nihss_1c_opt_one: "Performs one correctly",
  nihss_1c_opt_neither: "Performs neither correctly",

  nihss_2_title: "2. Best gaze",
  nihss_2_opt_normal: "Normal",
  nihss_2_opt_partial: "Partial gaze palsy",
  nihss_2_opt_forced: "Forced deviation",

  nihss_3_title: "3. Visual fields",
  nihss_3_opt_none: "No visual loss",
  nihss_3_opt_partial: "Partial hemianopia",
  nihss_3_opt_complete: "Complete hemianopia",
  nihss_3_opt_bilateral: "Bilateral hemianopia / cortical blindness",

  nihss_4_title: "4. Facial palsy",
  nihss_4_opt_normal: "Normal",
  nihss_4_opt_minor: "Minor",
  nihss_4_opt_partial: "Partial",
  nihss_4_opt_complete: "Complete",

  nihss_5L_title: "5. Motor arm (Left)",
  nihss_5R_title: "5. Motor arm (Right)",
  nihss_5_opt_noDrift: "No drift",
  nihss_5_opt_drift: "Drift",
  nihss_5_opt_someEffort: "Some effort against gravity",
  nihss_5_opt_noEffort: "No effort against gravity",
  nihss_5_opt_noMovement: "No movement",

  nihss_6L_title: "6. Motor leg (Left)",
  nihss_6R_title: "6. Motor leg (Right)",
  nihss_6_opt_noDrift: "No drift",
  nihss_6_opt_drift: "Drift",
  nihss_6_opt_someEffort: "Some effort against gravity",
  nihss_6_opt_noEffort: "No effort against gravity",
  nihss_6_opt_noMovement: "No movement",

  nihss_7_title: "7. Limb ataxia",
  nihss_7_opt_absent: "Absent",
  nihss_7_opt_one: "Present in one limb",
  nihss_7_opt_two: "Present in two limbs",

  nihss_8_title: "8. Sensory",
  nihss_8_opt_normal: "Normal",
  nihss_8_opt_mild: "Mild–moderate loss",
  nihss_8_opt_severe: "Severe / total loss",

  nihss_9_title: "9. Best language",
  nihss_9_opt_none: "No aphasia",
  nihss_9_opt_mild: "Mild–moderate aphasia",
  nihss_9_opt_severe: "Severe aphasia",
  nihss_9_opt_mute: "Mute / global aphasia",

  nihss_10_title: "10. Dysarthria",
  nihss_10_opt_normal: "Normal",
  nihss_10_opt_mild: "Mild–moderate",
  nihss_10_opt_severe: "Severe / unintelligible",

  nihss_11_title: "11. Extinction & inattention (neglect)",
  nihss_11_opt_none: "No abnormality",
  nihss_11_opt_mild: "Mild (1 modality)",
  nihss_11_opt_severe: "Severe (≥2 modalities)",

  // BVC
  bvc_sub: "Brøset Violence Checklist — tick observed behaviours.",
  bvc_low: "Low risk",
  bvc_mod: "Moderate risk",
  bvc_high: "High risk",
  bvc_title: "BVC",
  bvc_scoreLabel: "BVC:",

  bvc_item_confused: "Confused",
  bvc_item_irritable: "Irritable",
  bvc_item_boisterous: "Boisterous",
  bvc_item_verbal: "Verbal threats",
  bvc_item_physical: "Physical threats",
  bvc_item_attacking: "Attacking objects",

  // Tool cards
  tool_exams_title: "Clinical exams",
  tool_exams_desc: "Quick bedside signs",

  // Exams page
  exams_title: "Clinical exams & signs",
  exams_sub:
    "Tap an item to expand. Use as a memory aid — guidelines and context win.",

  ex_label_how: "How to examine",
  ex_label_positive: "Positive sign",
  ex_label_indicates: "Indicates",
  ex_label_prehospital: "Prehospital note",

  ex_group_abdomen: "Abdomen (acute belly)",
  ex_group_cns: "CNS / meningeal irritation",
  ex_group_back: "Back / nerves",
  ex_group_thorax: "Thorax / heart",
  ex_group_uro: "Kidneys / urology",
  ex_group_ob: "Obstetrics",
  ex_group_trauma: "Head / trauma",

  // ABDOMEN
  ex_mcburney_title: "McBurney's point",
  ex_mcburney_how:
    "Palpate 1/3 of the distance from the right ASIS toward the umbilicus.",
  ex_mcburney_pos: "Localized tenderness/pain.",
  ex_mcburney_ind: "Acute appendicitis (classic).",
  ex_mcburney_pre:
    "Supports suspicion of a surgical abdomen → rapid transport and appropriate destination. Avoid masking the clinical picture without consultation.",

  ex_murphy_title: "Murphy's sign",
  ex_murphy_how:
    "Palpate under the right costal margin and ask the patient to take a deep breath in.",
  ex_murphy_pos: "Inspiratory arrest due to pain.",
  ex_murphy_ind: "Acute cholecystitis.",
  ex_murphy_pre:
    "Helps explain fever + RUQ pain and guides correct receiving specialty.",

  ex_blumberg_title: "Blumberg's sign (rebound tenderness)",
  ex_blumberg_how: "Press slowly and deeply, then release quickly.",
  ex_blumberg_pos: "Pain on release rather than on pressure.",
  ex_blumberg_ind: "Peritoneal irritation (peritonitis, perforation).",
  ex_blumberg_pre:
    "Serious abdomen → high priority, keep NPO, rapid transport.",

  ex_rovsing_title: "Rovsing's sign",
  ex_rovsing_how: "Palpate the left lower quadrant.",
  ex_rovsing_pos: "Pain in the right lower quadrant.",
  ex_rovsing_ind: "Appendicitis.",

  ex_psoas_title: "Psoas sign",
  ex_psoas_how:
    "Patient raises a straight leg against resistance OR you extend the hip.",
  ex_psoas_pos: "Abdominal pain.",
  ex_psoas_ind: "Retrocecal appendicitis / retroperitoneal irritation.",

  ex_obturator_title: "Obturator sign",
  ex_obturator_how: "Flex hip and knee, then internally rotate the hip.",
  ex_obturator_pos: "Lower abdominal/pelvic pain.",
  ex_obturator_ind: "Appendicitis located in the pelvis.",

  // CNS / MENINGEAL
  ex_brudzinski_title: "Brudzinski's sign",
  ex_brudzinski_how: "Passive neck flexion with the patient supine.",
  ex_brudzinski_pos: "Involuntary hip/knee flexion.",
  ex_brudzinski_ind: "Meningitis / meningeal irritation.",
  ex_brudzinski_pre:
    "Fever + neck stiffness + altered mental status → high urgency and early destination/alerting.",

  ex_kernig_title: "Kernig's sign",
  ex_kernig_how: "Flex hip and knee to 90°, then attempt to extend the knee.",
  ex_kernig_pos: "Pain or resistance.",
  ex_kernig_ind: "Meningitis / meningeal irritation.",

  ex_babinski_title: "Babinski reflex",
  ex_babinski_how: "Stroke the lateral sole of the foot toward the big toe.",
  ex_babinski_pos: "Upgoing big toe (± fanning of toes).",
  ex_babinski_ind: "Upper motor neuron lesion (CNS).",
  ex_babinski_pre:
    "Supports a central neurological cause (e.g., stroke, intracranial pathology).",

  // BACK / NERVES
  ex_lasegue_title: "Lasègue's sign (Straight Leg Raise)",
  ex_lasegue_how: "Passively raise the straight leg with the patient supine.",
  ex_lasegue_pos: "Radiating pain down the leg.",
  ex_lasegue_ind: "Sciatica / disc herniation.",
  ex_lasegue_pre: "Helps separate radicular pain from muscular back pain.",

  // THORAX / HEART
  ex_becks_title: "Beck's triad",
  ex_becks_how: "Assess for: hypotension, JVD, and muffled heart sounds.",
  ex_becks_pos: "Triad present (often incomplete).",
  ex_becks_ind: "Cardiac tamponade.",
  ex_becks_pre:
    "Life-threatening obstructive shock → rapid transport and pre-alert.",

  ex_pulsus_title: "Pulsus paradoxus",
  ex_pulsus_how: "Systolic BP drop >10 mmHg during inspiration.",
  ex_pulsus_pos: "Drop >10 mmHg.",
  ex_pulsus_ind: "Tamponade, severe asthma, COPD exacerbation.",

  ex_kussmaul_title: "Kussmaul's sign",
  ex_kussmaul_how: "Observe neck veins during inspiration.",
  ex_kussmaul_pos: "No collapse / increased JVP on inspiration.",
  ex_kussmaul_ind:
    "Right-sided heart failure, tamponade (and other obstructive physiology).",

  // UROLOGY
  ex_giordano_title: "Giordano's sign (CVA tenderness)",
  ex_giordano_how: "Gently percuss over the flank/kidney angle.",
  ex_giordano_pos: "Pain.",
  ex_giordano_ind: "Pyelonephritis or renal stone.",

  // OBSTETRICS
  ex_ob_painless_bleeding_title: "Painless vaginal bleeding",
  ex_ob_painless_bleeding_how:
    "History/observation: vaginal bleeding without pain.",
  ex_ob_painless_bleeding_pos: "Bleeding without abdominal pain.",
  ex_ob_painless_bleeding_ind: "Placenta previa.",

  ex_ob_boardlike_uterus_title: "Pain + “board-like” uterus",
  ex_ob_boardlike_uterus_how:
    "History/assessment: abdominal pain with a hard/rigid uterus on palpation.",
  ex_ob_boardlike_uterus_pos: "Pain + rigid, tender uterus.",
  ex_ob_boardlike_uterus_ind: "Abruptio placentae.",

  ex_ob_prev_csection_pain_title: "Sudden pain with previous C-section",
  ex_ob_prev_csection_pain_how:
    "History: sudden severe pain in a patient with prior uterine surgery (e.g., C-section).",
  ex_ob_prev_csection_pain_pos: "Sudden severe abdominal pain ± shock.",
  ex_ob_prev_csection_pain_ind: "Uterine rupture.",

  ex_ob_no_fetal_movement_title: "Absent fetal movements",
  ex_ob_no_fetal_movement_how:
    "History: patient reports reduced/absent fetal movement.",
  ex_ob_no_fetal_movement_pos: "Reported no fetal movement.",
  ex_ob_no_fetal_movement_ind: "Fetal distress or intrauterine fetal death.",
  ex_ob_no_fetal_movement_pre:
    "Always urgent → consult and transport to the correct destination.",

  // TRAUMA
  ex_battles_title: "Battle’s sign",
  ex_battles_how: "Inspect behind the ear (mastoid region).",
  ex_battles_pos: "Bruising over the mastoid.",
  ex_battles_ind: "Basilar skull fracture.",

  ex_raccoon_title: "Raccoon eyes",
  ex_raccoon_how: "Inspect around the eyes.",
  ex_raccoon_pos: "Periorbital ecchymosis (bruising).",
  ex_raccoon_ind: "Basilar skull fracture.",

  // HINTS
  tool_hints_title: "HINTS",
  tool_hints_desc: "Step through HINTS+ and positional vertigo flow",
  hints_flowchart: "Flowchart",
  hints_result: "Result",
  hints_selections: "Your selections",
  back: "Back",

  // Tool card
  tool_spine_title: "Spinal trauma",
  tool_spine_desc: "Step through spine trauma stabilization flow",

  // Page
  spine_title: "Spinal trauma flow",
  spine_sub:
    "A quick decision flow for when spinal stabilization is indicated.",

  spine_info_title: "Definitions (tap to expand)",
  spine_info_hint:
    "Trauma criteria + what counts as ABC critical, tenderness, neuro deficit.",
  spine_info_trauma:
    "Relevant trauma: within 48 hours, adult (≥18y), with risk of secondary spinal cord injury.",
  spine_info_abc_title: "Critical ABC problem",
  spine_info_abc:
    "A: blocked or threatened airway.\nB: suspected pneumothorax/haemothorax, flail chest, hypoxia.\nC: threatened or manifest circulatory instability.",
  spine_info_tender_title: "Bony midline tenderness",
  spine_info_tender:
    "Direct/indirect bony tenderness on palpation of the spinous processes. Interpret reaction (e.g., pain behavior) rather than only asking the patient.",
  spine_info_neuro_title: "Neurological deficit",
  spine_info_neuro:
    "Cannot squeeze hands and/or dorsiflex feet, or altered sensation in arms/legs/trunk (gross neuro exam).",

  spine_step1_title: "Step 1",
  spine_step1_q: "Is this an isolated penetrating trauma?",
  spine_step1_note: "If yes → no spinal stabilization in this flow.",

  spine_step2_title: "Step 2",
  spine_step2_q: "Critical ABC problem and/or GCS < 15?",
  spine_step2_note:
    "If yes → time-critical spinal stabilization (do not delay ABCDE or transport).",

  spine_step3_title: "Step 3",
  spine_step3_q:
    "Bony midline tenderness over the spine and/or neurological deficit?",
  spine_step3_note: "If yes → spinal stabilization.",

  spine_selections: "Your selections",
  spine_selections_empty: "No selections yet.",
  spine_result: "Result",
  spine_result_pending: "Complete the steps to get a recommendation.",

  spine_outcome_none_title: "No spinal stabilization",
  spine_outcome_none_body:
    "Spinal stabilization is not indicated based on the selections in this flow.",
  spine_outcome_none_practical:
    "Focus on patient comfort and safe handling. Reassess if symptoms change.",

  spine_outcome_spinal_title: "Spinal stabilization",
  spine_outcome_spinal_body: "Spinal stabilization is indicated.",
  spine_outcome_spinal_practical:
    "Prehospital: position/transport on vacuum mattress. No routine rigid cervical collar.\nExtrication: self-extrication if asymptomatic OR if spinal tenderness is the only symptom; otherwise assisted extrication with situation-dependent aids (e.g., scoop, spineboard) possibly combined with MILS.",

  spine_outcome_time_title: "Time-critical spinal stabilization",
  spine_outcome_time_body:
    "Spinal stabilization is indicated, but must not delay ABCDE interventions or transport.",
  spine_outcome_time_practical:
    "Do only the stabilization steps that do not slow down airway/breathing/circulation or transport. Use situation-dependent aids (vacuum mattress, scoop, spineboard, ambulance stretcher) possibly combined with MILS.",

  spine_disclaimer:
    "Support tool only — follow local clinical guidelines and medical direction.",

  // Common (if you don’t already have these keys)
  yes: "Yes",
  no: "No",
  answer: "Answer",

  wjd_openSettings: "Settings",
  wjd_settings_title: "Tool settings",
  wjd_settings_sub:
    "These settings affect Weight → Joule + Doses (saved on device).",
  wjd_capped120: "Capped at 120 J",
  wjd_cappedMax: "Capped at max",
  settings_med_name_placeholder: "Drug name",

  close: "Close",
  default: "default",

  // Destination
  tool_dest_title: "Destination",
  tool_dest_desc: "Pick Byen/Regionen + diagnosis → destination hospital",
  dest_title: "Destination helper",
  dest_sub: "Choose area, then street/district and diagnosis category.",
  dest_area: "Area",
  dest_byen: "Byen",
  dest_region: "Regionen",
  dest_find_street: "Street search",
  dest_find_street_sub:
    "Type a street name to resolve to a bydel (sample list in code).",
  dest_street_placeholder: "Street (e.g., Amagertorv)",
  dest_no_street_match: "No match in the current street list.",
  dest_byen_pick: "Bydel + diagnosis",
  dest_byen_pick_sub:
    "Pick a bydel and category to get the destination hospital.",
  dest_bydel: "Bydel",
  dest_region_pick: "Kommune + specialty",
  dest_region_pick_sub: "Nord scaffold (extend the mapping when you want).",
  dest_kommune: "Kommune",
  dest_category: "Category",
  dest_result: "Result",
  dest_pick_more:
    "Select area + (bydel/kommune) + category to get a destination.",
  dest_destination: "Destination",
  dest_context: "Context",
  dest_code: "Code",
  dest_unknown: "No mapping for this choice yet — add it to the dataset.",
  dest_region_note:
    "Note: Region mapping is a starter scaffold. Expand to match your official tables.",
  dest_data_title: "Data",
  dest_data_sub:
    "The mapping lives in app/tools/destination.tsx as plain objects. You can later move it to JSON.",

  // Categories (Byen)
  dest_cat_hospital: "Hospital (default)",
  dest_cat_medicin: "Medicin",
  dest_cat_reuma: "Reumatology",
  dest_cat_gaskir: "Gastro surgery",
  dest_cat_neuro_apopleksi: "Neurology: stroke",
  dest_cat_neuro_almen: "Neurology: general",
  dest_cat_kardiologi: "Cardiology",
  dest_cat_ortkir: "Orthopedic surgery",
  dest_cat_paediatri: "Pediatrics",
  dest_cat_gyn: "Gynecology",
  dest_cat_uro: "Urology",

  // Categories (Region)
  dest_reg_traumecenter: "Trauma center",
  dest_reg_akutmodtagelse: "Acute receiving",
  dest_reg_med_modtagelse: "Medical receiving",
  dest_reg_akutklinik: "Acute clinic",
  dest_reg_karkir: "Vascular surgery",
  dest_reg_thoraxkir: "Thoracic surgery",
  dest_reg_neurokir: "Neurosurgery",
  dest_reg_kardiologi: "Cardiology",
  dest_reg_neurologi: "Neurology",
  dest_reg_apopleksi: "Stroke",
  dest_reg_paediatri: "Pediatrics",
  dest_reg_gyn: "Ob/Gyn",
  dest_reg_billeddiag: "Imaging",

  // Hospital labels
  dest_h_AMH: "Amager Hospital (AMH)",
  dest_h_BBH: "Bispebjerg Hospital (BBH)",
  dest_h_FRH: "Frederiksberg Hospital (FRH)",
  dest_h_NOH: "Nordsjællands Hospital (NOH)",
  dest_h_GEH: "Gentofte Hospital (GEH)",
  dest_h_GLO: "Glostrup Hospital (GLO)",
  dest_h_HEH: "Herlev Hospital (HEH)",
  dest_h_HVH: "Hvidovre Hospital (HVH)",
  dest_h_RH: "Rigshospitalet (RH)",
  dest_h_UNKNOWN: "Unknown",

  // Tool cards
  tool_cfs_title: "CFS",
  tool_cfs_desc: "Clinical Frailty Scale (1–9)",

  // CFS
  cfs_title: "Clinical Frailty Scale (CFS)",
  cfs_sub:
    "Pick the best matching level based on baseline function (not just today’s illness).",
  cfs_pickTitle: "Select level",
  cfs_pickSub: "Choose 1–9. Tap a number to see the definition.",
  cfs_scoreLabel: "CFS:",
  cfs_noSelection: "No score selected yet.",
  cfs_note:
    "Tip: Score the patient’s usual baseline over the last weeks–months. Acute illness can temporarily worsen function, but CFS is about the underlying reserve.",

  cfs_1_title: "Very fit",
  cfs_1_desc:
    "Robust, active, energetic and motivated. Exercises regularly and among the fittest for their age.",

  cfs_2_title: "Fit",
  cfs_2_desc:
    "No active disease symptoms, but less fit than level 1. Often exercises or is very active occasionally (e.g., seasonally).",

  cfs_3_title: "Managing well",
  cfs_3_desc:
    "Medical problems are well controlled, even if occasionally symptomatic. Not regularly active beyond routine walking.",

  cfs_4_title: "Living with very mild frailty",
  cfs_4_desc:
    "Not dependent for daily help, but symptoms often limit activities. Commonly feels ‘slowed up’ and/or tired during the day.",

  cfs_5_title: "Living with mild frailty",
  cfs_5_desc:
    "More evident slowing. Needs help with higher order IADLs (finances, transport, heavy housework). Shopping, walking outside alone, meal prep and meds may be affected.",

  cfs_6_title: "Living with moderate frailty",
  cfs_6_desc:
    "Needs help with all outside activities and with keeping house. Often problems with stairs. Needs help with bathing and may need minimal assistance (cueing/standby) with dressing.",

  cfs_7_title: "Living with severe frailty",
  cfs_7_desc:
    "Completely dependent for personal care (physical or cognitive). Still appears stable and not at high risk of dying within ~6 months.",

  cfs_8_title: "Living with very severe frailty",
  cfs_8_desc:
    "Completely dependent for personal care and approaching end of life. Typically could not recover even from a minor illness.",

  cfs_9_title: "Terminally ill",
  cfs_9_desc:
    "Approaching end of life with life expectancy < 6 months, but not otherwise living with severe frailty. Many can remain active until very close to death.",

  // --- FLACC ---
  flacc_title: "FLACC score",
  flacc_sub:
    "Behavioral pain assessment (Face, Legs, Activity, Cry, Consolability). Tap one option per category.",
  flacc_face_title: "Face",
  flacc_face_0: "Disinterested",
  flacc_face_1: "Occasional grimace, withdrawn",
  flacc_face_2: "Frequent frown, clenched jaw",

  flacc_legs_title: "Legs",
  flacc_legs_0: "No position or relaxed",
  flacc_legs_1: "Uneasy, restless, tense",
  flacc_legs_2: "Kicking or legs drawn up",

  flacc_activity_title: "Activity",
  flacc_activity_0: "Normal position",
  flacc_activity_1: "Squirming, tense",
  flacc_activity_2: "Arched, rigid, or jerking",

  flacc_cry_title: "Cry",
  flacc_cry_0: "No crying",
  flacc_cry_1: "Moans or whimpers",
  flacc_cry_2: "Constant crying, screams or sobs",

  flacc_consolability_title: "Consolability",
  flacc_consolability_0: "Content, relaxed",
  flacc_consolability_1: "Distractible",
  flacc_consolability_2: "Inconsolable",

  flacc_scoreLabel: "Total:",
  flacc_needAll: "Select one option in every category to interpret the score.",
  flacc_severity_0: "0 = Relaxed and comfortable.",
  flacc_severity_mild: "1–3 = Mild discomfort/pain.",
  flacc_severity_mod: "4–6 = Moderate pain.",
  flacc_severity_severe: "7–10 = Severe pain/discomfort.",
  flacc_disclaimer:
    "Reminder: Scores support clinical judgment — reassess after intervention.",

  // --- APGAR ---
  apgar_title: "APGAR score",
  apgar_sub: "Newborn assessment. Tap one option per category (0–2).",
  apgar_appearance_title: "Appearance (skin color)",
  apgar_appearance_0: "Cyanotic / pale all over",
  apgar_appearance_1: "Peripheral cyanosis only",
  apgar_appearance_2: "Pink",

  apgar_pulse_title: "Pulse (heart rate)",
  apgar_pulse_0: "0",
  apgar_pulse_1: "<100",
  apgar_pulse_2: "100–140",

  apgar_grimace_title: "Grimace (reflex irritability)",
  apgar_grimace_0: "No response to stimulation",
  apgar_grimace_1: "Grimace or weak cry when stimulated",
  apgar_grimace_2: "Cry when stimulated",

  apgar_activity_title: "Activity (tone)",
  apgar_activity_0: "Floppy",
  apgar_activity_1: "Some flexion",
  apgar_activity_2: "Well flexed and resisting extension",

  apgar_respiration_title: "Respiration",
  apgar_respiration_0: "Apneic",
  apgar_respiration_1: "Slow, irregular breathing",
  apgar_respiration_2: "Strong cry",

  apgar_scoreLabel: "Total:",
  apgar_needAll: "Select one option in every category to interpret the score.",
  apgar_interp_ok: "7–10 = Generally normal adaptation.",
  apgar_interp_mod: "4–6 = Moderately depressed — support may be needed.",
  apgar_interp_crit:
    "0–3 = Critically low — immediate resuscitation actions likely needed.",
  apgar_disclaimer:
    "Reminder: APGAR complements (does not replace) ongoing assessment and resuscitation algorithms.",
  tool_flacc_title: "FLACC",
  tool_flacc_desc: "Pediatric pain score (0–10).",

  tool_apgar_title: "APGAR",
  tool_apgar_desc: "Newborn assessment score (0–10).",

  // Settings
  settings_title: "Settings",
  settings_sub: "These affect calculators across the app (saved on device).",
  settings_weight_title: "Weight estimation",
  settings_weight_sub: "Select a default formula for Age → estimated kg.",
  settings_apls_1_5: "APLS 1–5y",
  settings_apls_6_12: "APLS 6–12y",
  settings_custom: "Custom",
  settings_custom_hint: "weight = age*a + b",
  settings_default_energy_title: "Default defib energy",
  settings_j_per_kg: "J/kg",
  settings_meds_title: "Medication list (dose by weight)",
  settings_meds_sub:
    "Use mg/kg. Optional max mg. Optional concentration (mg/mL) enables volume calculation.",
  settings_med_name: "Name",
  settings_med_enabled: "Enabled",
  settings_med_mgkg: "mg/kg",
  settings_med_max: "Max mg (opt)",
  settings_med_conc: "Conc (opt)",
  settings_add_med: "Add med",
  settings_save: "Save settings",
  settings_reset: "Reset to defaults",
  settings_reset_confirm: "Reset settings to defaults?",
  settings_remove_confirm: "Remove this medication?",
};

export const da: typeof en = {
  // Home
  appName: "AmbuAssist",
  homeTagline: "Små værktøjer til kaotisk virkelighed",
  language: "Sprog",
  english: "Engelsk",
  danish: "Dansk",
  open: "Åbn",

  // Tool cards
  tool_weightDose_title: "Vægt → Joule + Doser",
  tool_weightDose_desc: "Alder → vægtestimat → joule + valgte lægemidler",
  tool_news2_title: "NEWS2",
  tool_news2_desc: "Vitalparametre → NEWS2-score + eskalation",
  tool_wells_title: "Wells (DVT)",
  tool_wells_desc: "Sandsynlighedsscore for DVT",
  tool_nihss_title: "NIHSS",
  tool_nihss_desc: "Sværhedsgrad ved apopleksi",
  tool_bvc_title: "BVC",
  tool_bvc_desc: "Brøset Violence Checklist",
  tool_settings_title: "Indstillinger",
  tool_settings_desc: "Vægtestimat, standard J/kg, medicinliste",

  // Common
  loading: "Indlæser…",
  result: "Resultat",
  clinicalReminder:
    "Klinisk note: Dette er en beregner. Lokale retningslinjer gælder. Brug den til at undgå regnefejl — ikke dømmekraftfejl.",
  save: "Gem",
  reset: "Nulstil",
  cancel: "Annuller",
  remove: "Fjern",
  add: "Tilføj",

  // Weight/Joule/Dose
  wjd_title: "Vægt → Joule + Doser",
  wjd_sub: "Alder → estimeret kg → joule + din konfigurerede medicinliste.",
  wjd_age: "Alder",
  wjd_years: "år",
  wjd_weight_override: "Vægt",
  wjd_kg_optional: "kg (valgfrit)",
  wjd_jkg_override: "J/kg",
  wjd_calculated: "Beregnet",
  wjd_estWeight: "Est. vægt",
  wjd_usingWeight: "Brugt vægt",
  wjd_energy: "Energi",
  wjd_doses: "Doser",
  wjd_doses_sub:
    "Vises kun for aktiverede lægemidler. Tilføj koncentration for mL.",
  wjd_noMeds:
    "Ingen aktiverede lægemidler. Gå til Indstillinger → Medicinliste.",
  wjd_dose: "Dosis",
  wjd_volume: "Volumen",

  // NEWS2
  news2_title: "NEWS2",
  news2_sub: "Indtast værdier — score og eskalation opdateres live.",
  news2_scale: "SpO₂-skala",
  news2_scale1: "Skala 1",
  news2_scale2: "Skala 2",
  news2_o2: "Supplerende O₂",
  news2_consciousness: "Bevidsthed (AVPU)",
  news2_rr: "Resp. frekvens (RF)",
  news2_spo2: "SpO₂",
  news2_sbp: "Systolisk BT",
  news2_hr: "Puls",
  news2_temp: "Temperatur",
  news2_points: "pt",
  news2_guidance_note:
    "Note: eskalationsgrænser og observationsfrekvens kan variere mellem regioner/hospitaler.",
  news2_guidance_0:
    "NEWS 0: Lav risiko (rutineobs efter lokale retningslinjer).",
  news2_guidance_high:
    "Høj risiko (NEWS ≥ 7): akut klinisk vurdering / eskalation.",
  news2_guidance_any3:
    "Enkelt-parameter score 3: akut klinisk vurdering (selv ved lav total).",
  news2_guidance_med:
    "Moderat risiko (NEWS 5–6): hurtig vurdering / overvej eskalation.",
  news2_guidance_low:
    "Lav–moderat risiko (NEWS 1–4): øget observation og klinisk vurdering.",

  // Wells
  wells_title: "Wells-score (DVT)",
  wells_sub: "Afkryds fund — score og tolkning opdateres live.",
  wells_score: "Score",
  wells_twoLevel: "To-niveau",
  wells_threeLevel: "Tre-niveau (klassisk)",
  wells_result_twolevel_likely: "DVT sandsynlig (≥ 2)",
  wells_result_twolevel_unlikely: "DVT usandsynlig (≤ 1)",
  wells_three_low: "Lav",
  wells_three_moderate: "Moderat",
  wells_three_high: "Høj",
  wells_clinical_reminder:
    "Klinisk note: I de fleste forløb kombineres Wells med D-dimer og/eller UL. AmbuAssist støtter din vurdering — den erstatter ikke lokale retningslinjer.",

  // NIHSS
  nihss_sub: "Vælg én mulighed pr. punkt — total opdateres live.",
  nihss_noStroke: "0: Ingen apopleksisymptomer",
  nihss_minor: "1–4: Let apopleksi",
  nihss_moderate: "5–15: Moderat apopleksi",
  nihss_modSevere: "16–20: Moderat-svær apopleksi",
  nihss_severe: "21+: Svær apopleksi",
  nihss_title: "NIHSS",
  nihss_scoreLabel: "NIHSS:",

  nihss_1a_title: "1a. Bevidsthedsniveau",
  nihss_1a_opt_alert: "Vågen",
  nihss_1a_opt_drowsy: "Somnolent",
  nihss_1a_opt_obtunded: "Stærkt sløvet",
  nihss_1a_opt_coma: "Koma / reagerer ikke",

  nihss_1b_title: "1b. Bevidsthedsspørgsmål",
  nihss_1b_opt_both: "Svarer korrekt på begge",
  nihss_1b_opt_one: "Svarer korrekt på én",
  nihss_1b_opt_neither: "Svarer korrekt på ingen",

  nihss_1c_title: "1c. Bevidsthedskommandoer",
  nihss_1c_opt_both: "Udfører begge korrekt",
  nihss_1c_opt_one: "Udfører én korrekt",
  nihss_1c_opt_neither: "Udfører ingen korrekt",

  nihss_2_title: "2. Blikretning",
  nihss_2_opt_normal: "Normal",
  nihss_2_opt_partial: "Delvis blikparese",
  nihss_2_opt_forced: "Tvungen deviation",

  nihss_3_title: "3. Synsfelter",
  nihss_3_opt_none: "Intet synstab",
  nihss_3_opt_partial: "Delvis hemianopsi",
  nihss_3_opt_complete: "Komplet hemianopsi",
  nihss_3_opt_bilateral: "Bilateral hemianopsi / kortikal blindhed",

  nihss_4_title: "4. Facialisparese",
  nihss_4_opt_normal: "Normal",
  nihss_4_opt_minor: "Let",
  nihss_4_opt_partial: "Delvis",
  nihss_4_opt_complete: "Komplet",

  nihss_5L_title: "5. Arm motorik (Venstre)",
  nihss_5R_title: "5. Arm motorik (Højre)",
  nihss_5_opt_noDrift: "Ingen drift",
  nihss_5_opt_drift: "Drift",
  nihss_5_opt_someEffort: "Noget kraft mod tyngde",
  nihss_5_opt_noEffort: "Ingen kraft mod tyngde",
  nihss_5_opt_noMovement: "Ingen bevægelse",

  nihss_6L_title: "6. Ben motorik (Venstre)",
  nihss_6R_title: "6. Ben motorik (Højre)",
  nihss_6_opt_noDrift: "Ingen drift",
  nihss_6_opt_drift: "Drift",
  nihss_6_opt_someEffort: "Noget kraft mod tyngde",
  nihss_6_opt_noEffort: "Ingen kraft mod tyngde",
  nihss_6_opt_noMovement: "Ingen bevægelse",

  nihss_7_title: "7. Ataksi",
  nihss_7_opt_absent: "Ingen",
  nihss_7_opt_one: "I én ekstremitet",
  nihss_7_opt_two: "I to ekstremiteter",

  nihss_8_title: "8. Sensibilitet",
  nihss_8_opt_normal: "Normal",
  nihss_8_opt_mild: "Let–moderat tab",
  nihss_8_opt_severe: "Svært / totalt tab",

  nihss_9_title: "9. Sprog",
  nihss_9_opt_none: "Ingen afasi",
  nihss_9_opt_mild: "Let–moderat afasi",
  nihss_9_opt_severe: "Svær afasi",
  nihss_9_opt_mute: "Mut / global afasi",

  nihss_10_title: "10. Dysartri",
  nihss_10_opt_normal: "Normal",
  nihss_10_opt_mild: "Let–moderat",
  nihss_10_opt_severe: "Svær / uforståelig",

  nihss_11_title: "11. Neglekt",
  nihss_11_opt_none: "Ingen",
  nihss_11_opt_mild: "Let (1 modalitet)",
  nihss_11_opt_severe: "Svær (≥2 modaliteter)",

  // BVC
  bvc_sub: "Brøset Violence Checklist — afkryds observeret adfærd.",
  bvc_low: "Lav risiko",
  bvc_mod: "Moderat risiko",
  bvc_high: "Høj risiko",
  bvc_title: "BVC",
  bvc_scoreLabel: "BVC:",

  bvc_item_confused: "Konfus",
  bvc_item_irritable: "Irritabel",
  bvc_item_boisterous: "Højlydt / støjende",
  bvc_item_verbal: "Verbale trusler",
  bvc_item_physical: "Fysiske trusler",
  bvc_item_attacking: "Angriber genstande",

  // Tool cards
  tool_exams_title: "Kliniske undersøgelser",
  tool_exams_desc: "Hurtige bedside-tegn",

  // Exams page
  exams_title: "Kliniske undersøgelser & tegn",
  exams_sub:
    "Tryk for at folde ud. Brug som huskeliste — retningslinjer og kontekst vinder.",

  ex_label_how: "Sådan undersøges",
  ex_label_positive: "Positivt tegn",
  ex_label_indicates: "Indikerer",
  ex_label_prehospital: "Præhospital note",

  ex_group_abdomen: "Akut abdomen",
  ex_group_cns: "CNS / meningeal irritation",
  ex_group_back: "Ryg / nerver",
  ex_group_thorax: "Thorax / hjerte",
  ex_group_uro: "Nyrer / urologi",
  ex_group_ob: "Obstetrik",
  ex_group_trauma: "Kranie / traume",

  // ABDOMEN
  ex_mcburney_title: "McBurneys punkt",
  ex_mcburney_how:
    "Palpér 1/3 af afstanden fra spina iliaca anterior superior mod navlen på højre side.",
  ex_mcburney_pos: "Lokaliseret smerte/ømhed.",
  ex_mcburney_ind: "Akut appendicit (klassisk).",
  ex_mcburney_pre:
    "Støtter mistanke om kirurgisk mave → hurtig visitation/transport. Undgå at maskere klinikken uden konference.",

  ex_murphy_title: "Murphys tegn",
  ex_murphy_how:
    "Palpér under højre kurvatur (leverrand) og bed patienten tage en dyb indånding.",
  ex_murphy_pos: "Inspirationsstop pga. smerte.",
  ex_murphy_ind: "Akut cholecystitis.",
  ex_murphy_pre:
    "Forklarer feber + smerter → relevant for korrekt modtagelse (kirurgisk/medicinsk).",

  ex_blumberg_title: "Blumbergs tegn (rebound)",
  ex_blumberg_how: "Tryk dybt og langsomt – slip hurtigt.",
  ex_blumberg_pos: "Smerte ved slip, ikke ved tryk.",
  ex_blumberg_ind: "Peritoneal irritation (peritonitis, perforation).",
  ex_blumberg_pre: "Alvorlig mave → høj prioritet, fastende, hurtig transport.",

  ex_rovsing_title: "Rovsings tegn",
  ex_rovsing_how: "Palpér venstre fossa iliaca.",
  ex_rovsing_pos: "Smerter i højre fossa iliaca.",
  ex_rovsing_ind: "Appendicit.",

  ex_psoas_title: "Psoas-tegn",
  ex_psoas_how:
    "Patienten løfter strakt ben mod modstand – eller du ekstenderer hoften.",
  ex_psoas_pos: "Smerter i abdomen.",
  ex_psoas_ind: "Retrocekal appendicit / retroperitoneal irritation.",

  ex_obturator_title: "Obturator-tegn",
  ex_obturator_how: "Flekter hofte og knæ → indadroter hoften.",
  ex_obturator_pos: "Smerter i underlivet.",
  ex_obturator_ind: "Appendicit beliggende i bækkenet.",

  // CNS / MENINGEAL
  ex_brudzinski_title: "Brudzinskis tegn",
  ex_brudzinski_how: "Passiv fleksion af nakken i rygleje.",
  ex_brudzinski_pos: "Ufrivillig fleksion af hofter/knæ.",
  ex_brudzinski_ind: "Meningitis / meningisme.",
  ex_brudzinski_pre:
    "Feber + nakkestivhed + ændret mental status → høj hastegrad og tidlig visitation/varsling.",

  ex_kernig_title: "Kernigs tegn",
  ex_kernig_how: "Flekter hofte og knæ 90°, forsøg at ekstendere knæet.",
  ex_kernig_pos: "Smerter/modstand.",
  ex_kernig_ind: "Meningitis / meningisme.",

  ex_babinski_title: "Babinskis refleks",
  ex_babinski_how: "Stryg lateralt langs fodsålen og ind mod storetåen.",
  ex_babinski_pos: "Dorsalfleksion af storetå (evt. spredning af tæer).",
  ex_babinski_ind: "Central motorisk læsion (CNS).",
  ex_babinski_pre:
    "Understøtter central neurologisk årsag (fx apopleksi eller intrakraniel patologi).",

  // BACK / NERVES
  ex_lasegue_title: "Lasègues tegn (Straight Leg Raise)",
  ex_lasegue_how: "Løft strakt ben passivt i rygleje.",
  ex_lasegue_pos: "Radierende smerter ned i benet.",
  ex_lasegue_ind: "Iskias / diskusprolaps.",
  ex_lasegue_pre: "Adskiller nerverodssmerter fra muskulære smerter.",

  // THORAX / HEART
  ex_becks_title: "Becks triade",
  ex_becks_how: "Vurder for: hypotension, halsvenestase og dæmpede hjertelyde.",
  ex_becks_pos: "Triaden til stede (ofte ufuldstændig).",
  ex_becks_ind: "Hjertetamponade.",
  ex_becks_pre: "Livstruende obstruktivt shock → hurtig transport og varsling.",

  ex_pulsus_title: "Pulsus paradoxus",
  ex_pulsus_how: "BT falder >10 mmHg under inspiration.",
  ex_pulsus_pos: "Fald >10 mmHg.",
  ex_pulsus_ind: "Tamponade, svær astma, KOL-exacerbation.",

  ex_kussmaul_title: "Kussmauls tegn",
  ex_kussmaul_how: "Observer halsvener under inspiration.",
  ex_kussmaul_pos: "Manglende kollaps / øget fyldning ved inspiration.",
  ex_kussmaul_ind:
    "Højresidig hjertesvigt, tamponade (og anden obstruktiv fysiologi).",

  // UROLOGY
  ex_giordano_title: "Giordanos tegn (bankeømhed)",
  ex_giordano_how: "Let bankeømhed/perkussion over flanken (nyrelogen).",
  ex_giordano_pos: "Smerter.",
  ex_giordano_ind: "Pyelonefritis eller nyresten.",

  // OBSTETRICS
  ex_ob_painless_bleeding_title: "Smertefri vaginal blødning",
  ex_ob_painless_bleeding_how:
    "Anamnese/observation: vaginal blødning uden smerter.",
  ex_ob_painless_bleeding_pos: "Blødning uden mavesmerter.",
  ex_ob_painless_bleeding_ind: "Placenta prævia.",

  ex_ob_boardlike_uterus_title: "Smerter + “stenhård” uterus",
  ex_ob_boardlike_uterus_how:
    "Anamnese/vurdering: smerter med hård/rigid uterus ved palpation.",
  ex_ob_boardlike_uterus_pos: "Smerter + stenhård, øm uterus.",
  ex_ob_boardlike_uterus_ind: "Abruptio placentae.",

  ex_ob_prev_csection_pain_title: "Pludselige smerter efter tidligere sectio",
  ex_ob_prev_csection_pain_how:
    "Anamnese: pludselige kraftige smerter hos patient med tidligere uterusoperation (fx sectio).",
  ex_ob_prev_csection_pain_pos: "Pludselige stærke smerter ± shock.",
  ex_ob_prev_csection_pain_ind: "Uterusruptur.",

  ex_ob_no_fetal_movement_title: "Manglende fosterbevægelser",
  ex_ob_no_fetal_movement_how:
    "Anamnese: patienten oplever nedsatte/manglende fosterbevægelser.",
  ex_ob_no_fetal_movement_pos: "Oplyser ingen fosterbevægelser.",
  ex_ob_no_fetal_movement_ind: "Føtal distress eller intrauterin fosterdød.",
  ex_ob_no_fetal_movement_pre:
    "Altid akut → konference og korrekt visitation/transport.",

  // TRAUMA
  ex_battles_title: "Battle’s sign",
  ex_battles_how: "Inspicér bag øret (mastoide-regionen).",
  ex_battles_pos: "Blå mærker bag øret.",
  ex_battles_ind: "Basis cranii-fraktur.",

  ex_raccoon_title: "Raccoon eyes",
  ex_raccoon_how: "Inspicér periorbitalt.",
  ex_raccoon_pos: "Periorbitale hæmatomer.",
  ex_raccoon_ind: "Basis cranii-fraktur.",

  // HINTS
  tool_hints_title: "HINTS",
  tool_hints_desc: "Gå trin for trin gennem HINTS+ og positionssvimmelhed.",
  hints_flowchart: "Flowchart",
  hints_result: "Resultat",
  hints_selections: "Dine valg",
  back: "Tilbage",

  // Tool card
  tool_spine_title: "NKR - Rygsøjletraume",
  tool_spine_desc: "Gå trinvis gennem flow for spinal stabilisering",

  // Page
  spine_title: "Flow: traume mod rygsøjlen",
  spine_sub:
    "Hurtigt beslutningsflow for hvornår spinal stabilisering er indiceret.",

  spine_info_title: "Definitioner (tryk for at udvide)",
  spine_info_hint:
    "Traumekriterier + hvad der tæller som kritisk ABC, ømhed og neurologi.",
  spine_info_trauma:
    "Relevant traume: indenfor 48 timer, voksen (≥18 år), med risiko for sekundær rygmarvsskade.",
  spine_info_abc_title: "Kritisk ABC-problem",
  spine_info_abc:
    "A: blokeret eller truet luftvej.\nB: mistanke om pneumothorax/hæmothorax, flail chest, hypoksi.\nC: truet eller manifest cirkulatorisk instabilitet.",
  spine_info_tender_title: "Ossøs palpationsømhed",
  spine_info_tender:
    "Direkte/indirekte ossøs ømhed ved palpation af proc. spinosi. Tolkes ud fra patientens reaktion (fx smertemimik) — ikke kun ved at spørge.",
  spine_info_neuro_title: "Neurologiske udfald",
  spine_info_neuro:
    "Kan ikke trykke hånden og/eller vippe med fødderne, eller påvirket sensibilitet i arme/ben/truncus (grov neurologisk undersøgelse).",

  spine_step1_title: "Trin 1",
  spine_step1_q: "Isoleret penetrerende traume?",
  spine_step1_note: "Hvis ja → ingen spinal stabilisering i dette flow.",

  spine_step2_title: "Trin 2",
  spine_step2_q: "Kritisk ABC-problem og/eller GCS < 15?",
  spine_step2_note:
    "Hvis ja → tidskritisk spinal stabilisering (må ikke forsinke ABCDE eller transport).",

  spine_step3_title: "Trin 3",
  spine_step3_q:
    "Ossøs palpationsømhed over columna og/eller neurologiske udfald?",
  spine_step3_note: "Hvis ja → spinal stabilisering.",

  spine_selections: "Dine valg",
  spine_selections_empty: "Ingen valg endnu.",
  spine_result: "Resultat",
  spine_result_pending: "Gennemfør trinene for at få en anbefaling.",

  spine_outcome_none_title: "Ingen spinal stabilisering",
  spine_outcome_none_body:
    "Spinal stabilisering er ikke indiceret ud fra de valgte svar i dette flow.",
  spine_outcome_none_practical:
    "Fokusér på patientkomfort og sikker håndtering. Revurdér ved symptomændring.",

  spine_outcome_spinal_title: "Spinal stabilisering",
  spine_outcome_spinal_body: "Spinal stabilisering er indiceret.",
  spine_outcome_spinal_practical:
    "Præhospitalt: lejring/transport på vakuummadras. Ingen standardmæssig anvendelse af stiv halskrave.\nEkstrikation: selvekstrikation ved asymptomatisk patient ELLER hvis ossøs palpationsømhed er eneste symptom; ellers assisteret ekstrikation med situationsafhængige hjælpemidler (fx scoopboard, spineboard) evt. i kombination med MILS.",

  spine_outcome_time_title: "Tidskritisk spinal stabilisering",
  spine_outcome_time_body:
    "Spinal stabilisering er indiceret, men må ikke forsinke hverken andre ABCDE-tiltag eller transport.",
  spine_outcome_time_practical:
    "Overordnet kun stabiliseringstiltag der ikke forsinker ABCDE eller transport. Brug situationsafhængige hjælpemidler (vakuummadras, scoopboard, spineboard, ambulancestretcher) evt. i kombination med MILS.",

  spine_disclaimer:
    "Støtteværktøj — følg lokale retningslinjer og medicinsk delegation.",

  // Common (if you don’t already have these keys)
  yes: "Ja",
  no: "Nej",
  answer: "Svar",

  wjd_openSettings: "Indstillinger",
  wjd_settings_title: "Værktøjsindstillinger",
  wjd_settings_sub:
    "Indstillinger for Vægt → Joule + Doser (gemmes på enheden).",
  wjd_capped120: "Begrænset til 120 J",
  wjd_cappedMax: "Begrænset til max",
  settings_med_name_placeholder: "Lægemiddelnavn",

  close: "Luk",
  default: "standard",

  // Destination
  tool_dest_title: "Destination",
  tool_dest_desc: "Vælg Byen/Regionen + diagnose → destinationshospital",
  dest_title: "Destinationshjælper",
  dest_sub: "Vælg område, derefter gade/bydel/kommune og kategori.",
  dest_area: "Område",
  dest_byen: "Byen",
  dest_region: "Regionen",
  dest_find_street: "Søg på gade",
  dest_find_street_sub:
    "Skriv en gade og få bydel (kun en lille demo-liste i koden).",
  dest_street_placeholder: "Gade (fx Amagertorv)",
  dest_no_street_match: "Ingen match i den nuværende gadeliste.",
  dest_byen_pick: "Bydel + kategori",
  dest_byen_pick_sub: "Vælg bydel og kategori for at få destinationshospital.",
  dest_bydel: "Bydel",
  dest_region_pick: "Kommune + speciale",
  dest_region_pick_sub: "Nord er en start-skabelon (udvid mapping senere).",
  dest_kommune: "Kommune",
  dest_category: "Kategori",
  dest_result: "Resultat",
  dest_pick_more:
    "Vælg område + (bydel/kommune) + kategori for at få destination.",
  dest_destination: "Destination",
  dest_context: "Kontekst",
  dest_code: "Kode",
  dest_unknown:
    "Der findes ingen mapping for dette valg endnu — tilføj det i datasættet.",
  dest_region_note:
    "Note: Regionsmapping er en start-skabelon. Udvid så den matcher de officielle tabeller.",
  dest_data_title: "Data",
  dest_data_sub:
    "Mapping ligger i app/tools/destination.tsx som simple objekter. Kan senere flyttes til JSON.",

  // Kategorier (Byen)
  dest_cat_hospital: "Hospital (standard)",
  dest_cat_medicin: "Medicin",
  dest_cat_reuma: "Reumatologi",
  dest_cat_gaskir: "Gastrokirurgi",
  dest_cat_neuro_apopleksi: "Neurologi: apopleksi",
  dest_cat_neuro_almen: "Neurologi: almen",
  dest_cat_kardiologi: "Kardiologi",
  dest_cat_ortkir: "Ortopædkirurgi",
  dest_cat_paediatri: "Pædiatri",
  dest_cat_gyn: "Gynækologi",
  dest_cat_uro: "Urologi",

  // Kategorier (Region)
  dest_reg_traumecenter: "Traumecenter",
  dest_reg_akutmodtagelse: "Akutmodtagelse",
  dest_reg_med_modtagelse: "Medicinsk modtagelse",
  dest_reg_akutklinik: "Akutklinik",
  dest_reg_karkir: "Karkirurgi",
  dest_reg_thoraxkir: "Thoraxkirurgi",
  dest_reg_neurokir: "Neurokirurgi",
  dest_reg_kardiologi: "Kardiologi",
  dest_reg_neurologi: "Neurologi",
  dest_reg_apopleksi: "Apopleksi",
  dest_reg_paediatri: "Pædiatri",
  dest_reg_gyn: "Obstetrik/Gyn",
  dest_reg_billeddiag: "Billeddiagnostik",

  // Hospital labels
  dest_h_AMH: "Amager Hospital (AMH)",
  dest_h_BBH: "Bispebjerg Hospital (BBH)",
  dest_h_FRH: "Frederiksberg Hospital (FRH)",
  dest_h_NOH: "Nordsjællands Hospital (NOH)",
  dest_h_GEH: "Gentofte Hospital (GEH)",
  dest_h_GLO: "Glostrup Hospital (GLO)",
  dest_h_HEH: "Herlev Hospital (HEH)",
  dest_h_HVH: "Hvidovre Hospital (HVH)",
  dest_h_RH: "Rigshospitalet (RH)",
  dest_h_UNKNOWN: "Ukendt",

  // Tool cards
  tool_cfs_title: "CFS",
  tool_cfs_desc: "Clinical Frailty Skala (1–9)",

  // CFS
  cfs_title: "Clinical Frailty Scale (CFS)",
  cfs_sub:
    "Vælg det niveau der passer bedst ud fra patientens baseline (ikke kun dagens sygdom).",
  cfs_pickTitle: "Vælg niveau",
  cfs_pickSub: "Vælg 1–9. Tryk på et tal for at se definitionen.",
  cfs_scoreLabel: "CFS:",
  cfs_noSelection: "Ingen score valgt endnu.",
  cfs_note:
    "Tip: Scor ud fra patientens sædvanlige funktion de sidste uger–måneder. Akut sygdom kan forværre midlertidigt, men CFS handler om den underliggende reserve.",

  cfs_1_title: "Meget fit",
  cfs_1_desc:
    "Robust, aktiv, energisk og motiveret. Træner regelmæssigt og er blandt de mest fitte for alderen.",

  cfs_2_title: "Fit",
  cfs_2_desc:
    "Ingen aktive sygdomssymptomer, men mindre fit end niveau 1. Træner ofte eller er meget aktiv lejlighedsvis (fx sæsonvist).",

  cfs_3_title: "Klarer sig godt",
  cfs_3_desc:
    "Medicinske problemer er velkontrollerede, evt. med lejlighedsvise symptomer. Ikke regelmæssigt aktiv ud over almindelig gang.",

  cfs_4_title: "Lever med meget mild skrøbelighed",
  cfs_4_desc:
    "Ikke afhængig af hjælp til daglige gøremål, men symptomer begrænser ofte aktiviteter. Typisk oplevelse af at være ‘gået ned i tempo’ og/eller være træt i løbet af dagen.",

  cfs_5_title: "Lever med mild skrøbelighed",
  cfs_5_desc:
    "Mere tydelig langsomhed. Behøver hjælp til komplekse IADL (økonomi, transport, tungt husarbejde). Indkøb, at gå ude alene, madlavning og medicinhåndtering påvirkes ofte.",

  cfs_6_title: "Lever med moderat skrøbelighed",
  cfs_6_desc:
    "Behøver hjælp til alle aktiviteter uden for hjemmet og til husholdning. Har ofte problemer med trapper. Behøver hjælp til bad og evt. minimal hjælp (guidning/standby) til påklædning.",

  cfs_7_title: "Lever med svær skrøbelighed",
  cfs_7_desc:
    "Fuldt afhængig af personlig pleje (fysisk eller kognitivt). Fremstår dog stabil og ikke i høj risiko for at dø inden for ~6 måneder.",

  cfs_8_title: "Lever med meget svær skrøbelighed",
  cfs_8_desc:
    "Fuldt afhængig af personlig pleje og nærmer sig livets afslutning. Kan typisk ikke komme sig selv efter en mindre sygdom.",

  cfs_9_title: "Terminalt syg",
  cfs_9_desc:
    "Nærmer sig livets afslutning med forventet levetid < 6 måneder, men er ellers ikke præget af svær skrøbelighed. Mange kan være aktive næsten helt til det sidste.",

  // --- FLACC ---
  flacc_title: "FLACC-score",
  flacc_sub:
    "Adfærdsbaseret smertevurdering (Ansigt, Ben, Aktivitet, Gråd, Trøstbarhed). Vælg én mulighed pr. kategori.",
  flacc_face_title: "Ansigt",
  flacc_face_0: "Uinteresseret",
  flacc_face_1: "Lejlighedsvis grimasse, tilbagetrukket",
  flacc_face_2: "Hyppig rynken, sammenbidt kæbe",

  flacc_legs_title: "Ben",
  flacc_legs_0: "Ingen særlig stilling eller afslappet",
  flacc_legs_1: "Urolig, rastløs, spændt",
  flacc_legs_2: "Sparker eller ben trukket op",

  flacc_activity_title: "Aktivitet",
  flacc_activity_0: "Normal stilling",
  flacc_activity_1: "Vridende, spændt",
  flacc_activity_2: "Krum, stiv eller rykvise bevægelser",

  flacc_cry_title: "Gråd",
  flacc_cry_0: "Ingen gråd",
  flacc_cry_1: "Stønnen eller klynken",
  flacc_cry_2: "Konstant gråd, skrig eller hulken",

  flacc_consolability_title: "Trøstbarhed",
  flacc_consolability_0: "Tilfreds, afslappet",
  flacc_consolability_1: "Kan afledes",
  flacc_consolability_2: "Utrøstelig",

  flacc_scoreLabel: "Total:",
  flacc_needAll: "Vælg én mulighed i alle kategorier for at tolke scoren.",
  flacc_severity_0: "0 = Rolig og komfortabel.",
  flacc_severity_mild: "1–3 = Let ubehag/smerte.",
  flacc_severity_mod: "4–6 = Moderat smerte.",
  flacc_severity_severe: "7–10 = Svær smerte/ubehag.",
  flacc_disclaimer:
    "Husk: Score understøtter klinisk vurdering — revurdér efter intervention.",

  // --- APGAR ---
  apgar_title: "APGAR-score",
  apgar_sub: "Vurdering af nyfødt. Vælg én mulighed pr. kategori (0–2).",
  apgar_appearance_title: "Udseende (hudfarve)",
  apgar_appearance_0: "Cyanotisk / bleg over hele kroppen",
  apgar_appearance_1: "Kun perifer cyanose",
  apgar_appearance_2: "Lyserød",

  apgar_pulse_title: "Puls (hjertefrekvens)",
  apgar_pulse_0: "0",
  apgar_pulse_1: "<100",
  apgar_pulse_2: "100–140",

  apgar_grimace_title: "Grimasse (refleksirritabilitet)",
  apgar_grimace_0: "Ingen respons på stimulation",
  apgar_grimace_1: "Grimasse eller svagt skrig ved stimulation",
  apgar_grimace_2: "Skriger ved stimulation",

  apgar_activity_title: "Aktivitet (tonus)",
  apgar_activity_0: "Slap",
  apgar_activity_1: "Noget fleksion",
  apgar_activity_2: "Vel-flekteret og modstår ekstension",

  apgar_respiration_title: "Respiration",
  apgar_respiration_0: "Apnø",
  apgar_respiration_1: "Langsom, uregelmæssig vejrtrækning",
  apgar_respiration_2: "Kraftigt skrig",

  apgar_scoreLabel: "Total:",
  apgar_needAll: "Vælg én mulighed i alle kategorier for at tolke scoren.",
  apgar_interp_ok: "7–10 = Overordnet normal adaptation.",
  apgar_interp_mod: "4–6 = Moderat påvirket — støtte kan være nødvendig.",
  apgar_interp_crit:
    "0–3 = Kritisk lav — akutte genoplivningstiltag kan være nødvendige.",
  apgar_disclaimer:
    "Husk: APGAR supplerer (erstatter ikke) løbende vurdering og genoplivningsalgoritmer.",

  tool_flacc_title: "FLACC",
  tool_flacc_desc: "Pædiatrisk smertevurdering (0–10).",

  tool_apgar_title: "APGAR",
  tool_apgar_desc: "Vurdering af nyfødt (0–10).",

  // Settings
  settings_title: "Indstillinger",
  settings_sub: "Gælder på tværs af appen (gemmes på enheden).",
  settings_weight_title: "Vægtestimat",
  settings_weight_sub: "Vælg standardformel for Alder → estimeret kg.",
  settings_apls_1_5: "APLS 1–5 år",
  settings_apls_6_12: "APLS 6–12 år",
  settings_custom: "Brugerdefineret",
  settings_custom_hint: "vægt = alder*a + b",
  settings_default_energy_title: "Standard defib-energi",
  settings_j_per_kg: "J/kg",
  settings_meds_title: "Medicinliste (dosis efter vægt)",
  settings_meds_sub:
    "Brug mg/kg. Valgfri max mg. Valgfri koncentration (mg/mL) giver også mL-beregning.",
  settings_med_name: "Navn",
  settings_med_enabled: "Aktiv",
  settings_med_mgkg: "mg/kg",
  settings_med_max: "Max mg (valgfri)",
  settings_med_conc: "Koncentration mg/mL (valgfri)",
  settings_add_med: "Tilføj medicin",
  settings_save: "Gem indstillinger",
  settings_reset: "Nulstil til standard",
  settings_reset_confirm: "Nulstil indstillinger til standard?",
  settings_remove_confirm: "Fjern denne medicin?",
};
