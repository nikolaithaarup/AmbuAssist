export type Lang = "en" | "da";
export type Key = keyof typeof en;

export const en = {
  // =========================================================
  // SHARED / APP
  // =========================================================
  appName: "AmbuAssist",
  homeTagline: "Minimal tools for chaotic reality",
  language: "Language",
  english: "English",
  danish: "Danish",
  open: "Open",

  loading: "Loading…",
  save: "Save",
  reset: "Reset",
  cancel: "Cancel",
  remove: "Remove",
  add: "Add",
  close: "Close",
  default: "default",
  yes: "Yes",
  no: "No",
  answer: "Answer",
  back: "Back",

  clinicalReminder:
    "Clinical reminder: This tool supports assessment only. Always follow local guidelines and clinical judgment.",

  tool_disclaimer_title: "Medical disclaimer",
  tool_sources_title: "Sources and references",
  tool_answered: "Answered:",
  tool_filled: "Filled values:",

  // =========================================================
  // HOME TOOL CARDS
  // =========================================================
  tool_dest_title: "Destination",
  tool_dest_desc: "Pick Byen/Regionen + diagnosis → destination hospital",

  tool_trombolysis_title: "Thrombolysis",
  tool_trombolysis_desc:
    "Automatically shows the responsible hospital and phone number.",

  tool_weightDose_title: "Weight → Joule + Doses",
  tool_weightDose_desc: "Age → weight estimate → joules + configured meds",

  tool_exams_title: "Clinical exams",
  tool_exams_desc: "Quick bedside signs",

  tool_assessment_title: "Assessment tools",
  tool_assessment_desc: "Clinical scores, scales, and structured assessments",

  tool_meddisc_title: "Medical disclaimer",
  tool_meddisc_desc: "Important use, safety, and source information.",

  tool_contact_title: "Contact & feedback",
  tool_contact_desc: "Report bugs, suggest improvements, or get in touch.",

  tool_about_title: "About",
  tool_about_desc: "What AmbuAssist is, what it does, and what it does not do.",

  // =========================================================
  // ASSESSMENT SECTION CARDS
  // =========================================================

  tool_bloodgas_title: "Blood gas & patterns",
  tool_bloodgas_desc:
    "Interpret blood gas, lactate, glucose and infection indicators",

  tool_bvc_title: "BVC",
  tool_bvc_desc: "Brøset Violence Checklist",

  tool_spine_title: "Spinal trauma",
  tool_spine_desc: "Step through spine trauma stabilization flow",

  tool_flacc_title: "FLACC",
  tool_flacc_desc: "Pediatric pain score (0–10).",

  tool_apgar_title: "APGAR",
  tool_apgar_desc: "Newborn assessment score (0–10).",

  tool_cfs_title: "CFS",
  tool_cfs_desc: "Clinical Frailty Scale (1–9)",

  tool_hints_title: "HINTS",
  tool_hints_desc: "Step through HINTS+ and positional vertigo flow",

  tool_neuro_title: "Neurological",
  tool_neuro_desc: "NIHSS, PreSS and HINTS",

  tool_news2_title: "NEWS2",
  tool_news2_desc: "Vitals → NEWS2 score + escalation",

  tool_wells_title: "Wells (DVT)",
  tool_wells_desc: "DVT probability scoring",

  tool_behaviouralGeriatric_title: "Behavioural & Geriatric",
  tool_behaviouralGeriatric_desc: "BVC, ABC-STAMP and CFS",

  tool_paediatric_title: "Paediatric",
  tool_paediatric_desc: "APGAR, FLACC and paediatric assessments",

  // =========================================================
  // SECTION PAGES
  // =========================================================
  behaviouralGeriatric_title: "Behavioural & Geriatric",
  behaviouralGeriatric_sub:
    "Choose a behavioural or geriatric assessment tool.",

  paediatric_title: "Paediatric",
  paediatric_sub: "Choose a paediatric scoring system.",

  neurological_title: "Neurological",
  neurological_sub: "Choose a neurological scoring system.",

  // =========================================================
  // BLOOD GAS / LAB
  // =========================================================

  bg_label_po2: "pO₂ (kPa)",
  bg_label_be: "Base excess, BE(b) (mmol/L)",
  bg_label_so2: "cSO₂ (%)",
  bg_label_na: "Na+ (mmol/L)",
  bg_label_k: "K+ (mmol/L)",
  bg_label_ca: "Ca++ (mmol/L)",
  bg_label_cl: "Cl- (mmol/L)",
  bg_label_urea: "Urea (mmol/L)",
  bg_label_creatinine: "Creatinine (µmol/L)",
  bg_label_hct: "Hct (%)",
  bg_label_hgb: "cHgb (mmol/L)",

  bg_pattern_hhs:
    "Possible HHS pattern – marked hyperglycaemia without clear severe ketoacidosis pattern.",
  bg_pattern_metabolic_acidosis:
    "Metabolic acidosis pattern – low HCO₃⁻ / negative base excess with acidaemia.",
  bg_pattern_hyponatremia: "Hyponatraemia pattern – sodium is reduced.",
  bg_pattern_hypoxemia: "Hypoxaemia pattern – pO₂ is reduced.",
  bg_pattern_low_so2: "Low oxygen saturation pattern – cSO₂ is reduced.",
  bg_pattern_renal_impairment:
    "Possible renal impairment pattern – urea and creatinine are elevated.",

  bg_infection_lactate_elevated:
    "Elevated lactate – consider hypoperfusion, sepsis, or significant physiological stress.",
  bg_infection_stress_hyperglycemia:
    "Hyperglycaemia may be stress-related, but should be interpreted clinically.",

  bg_disclaimer: "Support tool only – not for diagnosis",
  bg_no_pattern_found:
    "No clear pattern suggestion based on the entered values.",

  tool_bg_acidbase_title: "Acid-base helper",
  tool_bg_acidbase_desc:
    "Simple acid-base pattern support using pH, pCO₂, and HCO₃⁻.",

  tool_bg_patterns_title: "Pattern recognition",
  tool_bg_patterns_desc: "Identify common blood gas and lab patterns.",

  tool_bg_infection_title: "Infection helper",
  tool_bg_infection_desc:
    "Simple support for infection-related blood and urine findings.",

  bg_label_ph: "pH",
  bg_label_pco2: "pCO₂ (kPa)",
  bg_label_hco3: "HCO₃⁻ (mmol/L)",
  bg_label_glucose: "Glucose (mmol/L)",
  bg_label_lactate: "Lactate (mmol/L)",
  bg_label_crp: "CRP (mg/L)",
  bg_label_nitrite: "Nitrite",
  bg_label_leukocytes: "Leukocytes",

  bg_acidbase_enter_values:
    "Enter pH, pCO₂, and HCO₃⁻ to see an interpretation.",
  bg_acidbase_disclaimer:
    "Support tool only. Acid-base interpretation must always be verified against the full clinical picture, other laboratory values, and current local guidelines.",
  bg_acidbase_sources_sub:
    "Review the underlying references and verify against local guidelines.",

  bg_acidbase_resp_acidosis_title: "Acidosis – respiratory pattern",
  bg_acidbase_resp_acidosis_body:
    "Low pH with elevated pCO₂ suggests a primary respiratory acidosis pattern.",
  bg_acidbase_met_acidosis_title: "Acidosis – metabolic pattern",
  bg_acidbase_met_acidosis_body:
    "Low pH with low HCO₃⁻ suggests a primary metabolic acidosis pattern.",
  bg_acidbase_mixed_acidosis_title: "Acidosis – mixed/combined pattern",
  bg_acidbase_mixed_acidosis_body:
    "Low pH with both elevated pCO₂ and low HCO₃⁻ suggests a mixed respiratory and metabolic acidosis.",
  bg_acidbase_unclear_acidosis_title: "Acidosis – unclear pattern",
  bg_acidbase_unclear_acidosis_body:
    "Acidaemia is present, but the values do not fit a simple single-process pattern.",

  bg_acidbase_resp_alkalosis_title: "Alkalosis – respiratory pattern",
  bg_acidbase_resp_alkalosis_body:
    "High pH with low pCO₂ suggests a primary respiratory alkalosis pattern.",
  bg_acidbase_met_alkalosis_title: "Alkalosis – metabolic pattern",
  bg_acidbase_met_alkalosis_body:
    "High pH with elevated HCO₃⁻ suggests a primary metabolic alkalosis pattern.",
  bg_acidbase_mixed_alkalosis_title: "Alkalosis – mixed/combined pattern",
  bg_acidbase_mixed_alkalosis_body:
    "High pH with both low pCO₂ and elevated HCO₃⁻ suggests a mixed respiratory and metabolic alkalosis.",
  bg_acidbase_unclear_alkalosis_title: "Alkalosis – unclear pattern",
  bg_acidbase_unclear_alkalosis_body:
    "Alkalaemia is present, but the values do not fit a simple single-process pattern.",

  bg_acidbase_comp_resp_acidosis_title:
    "Near-normal pH – compensated respiratory acidosis possible",
  bg_acidbase_comp_resp_acidosis_body:
    "A near-normal pH with elevated pCO₂ and elevated HCO₃⁻ may reflect compensation.",
  bg_acidbase_comp_resp_alkalosis_title:
    "Near-normal pH – compensated respiratory alkalosis possible",
  bg_acidbase_comp_resp_alkalosis_body:
    "A near-normal pH with low pCO₂ and low HCO₃⁻ may reflect compensation.",
  bg_acidbase_near_normal_title: "Acid-base status appears near normal",
  bg_acidbase_near_normal_body:
    "pH is within the normal range and the overall pattern is not obviously deranged.",

  bg_acidbase_comp_metabolic_present:
    "HCO₃⁻ may suggest metabolic/renal compensation.",
  bg_acidbase_comp_metabolic_limited:
    "Little or no metabolic compensation is apparent.",
  bg_acidbase_comp_respiratory_present:
    "pCO₂ may suggest respiratory compensation.",
  bg_acidbase_comp_respiratory_limited:
    "Little or no respiratory compensation is apparent.",
  bg_acidbase_mixed_compensation:
    "This may represent combined processes rather than simple compensation.",
  bg_acidbase_verify_context:
    "Interpret together with the clinical picture and the full blood gas.",
  bg_acidbase_compensated_note:
    "Consider compensation and correlate clinically.",
  bg_acidbase_severe_acidemia: "Marked acidaemia",
  bg_acidbase_severe_alkalemia: "Marked alkalaemia",

  bg_acidbase_source_fallback_1_title: "Acid-base interpretation reference",
  bg_acidbase_source_fallback_1_sub:
    "Use approved local blood gas guidance, SOPs, and teaching materials.",
  bg_acidbase_source_fallback_2_title: "Clinical verification required",
  bg_acidbase_source_fallback_2_sub:
    "This tool is advisory only and must be verified against the full blood gas and patient presentation.",

  bg_patterns_enter_values:
    "Enter one or more values to look for common patterns.",
  bg_patterns_disclaimer:
    "Support tool only. Pattern recognition is simplified and must always be interpreted with the full clinical picture and current local guidelines.",
  bg_patterns_sources_sub:
    "Review the underlying references and verify against local guidelines.",

  bg_pattern_dka: "Possible DKA pattern – consider ketoacidosis.",
  bg_pattern_lactate_elevated:
    "Elevated lactate – consider infection, hypoperfusion, or metabolic stress.",
  bg_pattern_lactate_high:
    "High lactate – urgent assessment for shock or significant hypoperfusion is relevant.",
  bg_pattern_dehydration: "Pattern may fit dehydration or stress response.",
  bg_pattern_respiratory_acidosis:
    "Respiratory acidosis pattern – low pH with elevated pCO₂.",

  bg_patterns_source_fallback_1_title: "Pattern recognition reference",
  bg_patterns_source_fallback_1_sub:
    "Use approved local blood gas and laboratory guidance.",
  bg_patterns_source_fallback_2_title: "Clinical verification required",
  bg_patterns_source_fallback_2_sub:
    "Patterns shown here are simplified and must always be verified clinically.",

  bg_infection_enter_values:
    "Enter CRP and/or urine findings to see supportive interpretation.",
  bg_infection_disclaimer:
    "Support tool only. CRP and urine findings are nonspecific and must always be interpreted together with history, examination, vital signs, and local guidelines.",
  bg_infection_sources_sub:
    "Review the underlying references and verify against local guidelines.",

  bg_infection_crp_high:
    "High CRP – consider significant inflammatory or infectious process.",
  bg_infection_crp_moderate:
    "Moderate CRP elevation – possible inflammatory or infectious process.",
  bg_infection_uti_pattern:
    "Nitrite and leukocytes present – consider UTI pattern.",
  bg_infection_leukocytes_only:
    "Leukocytes present – possible inflammation or infection.",
  bg_infection_nitrite_only:
    "Nitrite present – bacterial UTI may be relevant depending on symptoms.",

  bg_infection_source_fallback_1_title: "Infection interpretation reference",
  bg_infection_source_fallback_1_sub:
    "Use approved local infection guidance and urinalysis interpretation guidance.",
  bg_infection_source_fallback_2_title: "Clinical verification required",
  bg_infection_source_fallback_2_sub:
    "This tool is advisory only and must be verified against symptoms, examination, and local guidance.",

  // =========================================================
  // ABC-STAMP
  // =========================================================
  abcstamp_title: "ABC-STAMP",
  abcstamp_sub: "Structured psychiatric assessment support",
  abcstamp_completedLabel: "Completed sections:",
  abcstamp_result_text:
    "Use this as a structured observational support tool together with clinical judgement and local procedure.",
  abcstamp_result_disclaimer:
    "ABC-STAMP is documentation and assessment support only. It must not replace full psychiatric assessment, escalation, or local guidelines.",
  abcstamp_page_disclaimer:
    "Use the official local or regional ABC-STAMP structure where applicable. This page should be adapted to approved Danish clinical wording before release.",
  abcstamp_sources_sub: "References and approved sources for ABC-STAMP.",
  abcstamp_source_1_title: "Official Danish ABC-STAMP source",
  abcstamp_source_1_sub:
    "Replace with your approved regional or psychiatric source.",
  abcstamp_source_2_title: "Local / regional psychiatric guidance",
  abcstamp_source_2_sub: "Replace with your approved operational source.",
  abcstamp_source_3_title: "AmbuAssist disclaimer",
  abcstamp_source_3_sub: "Assessment support only.",

  abcstamp_notes_label: "Short notes",
  abcstamp_notes_placeholder: "Add short observations...",

  abcstamp_a_title: "A",
  abcstamp_a_sub: "Appearance",
  abcstamp_b_title: "B",
  abcstamp_b_sub: "Behaviour",
  abcstamp_c_title: "C",
  abcstamp_c_sub: "Communication",
  abcstamp_s_title: "S",
  abcstamp_s_sub: "Speech",
  abcstamp_t_title: "T",
  abcstamp_t_sub: "Thought",
  abcstamp_m_title: "M",
  abcstamp_m_sub: "Mood",
  abcstamp_p_title: "P",
  abcstamp_p_sub: "Perception",

  abcstamp_a_opt_appearance_calm: "Calm / appropriate appearance",
  abcstamp_a_opt_appearance_agitated: "Agitated / tense appearance",
  abcstamp_a_opt_appearance_dishevelled: "Dishevelled / neglected appearance",

  abcstamp_b_opt_behaviour_cooperative: "Cooperative behaviour",
  abcstamp_b_opt_behaviour_restless: "Restless / unsettled behaviour",
  abcstamp_b_opt_behaviour_aggressive: "Aggressive / threatening behaviour",

  abcstamp_c_opt_communication_clear: "Clear communication",
  abcstamp_c_opt_communication_disorganised: "Disorganised communication",
  abcstamp_c_opt_communication_minimal: "Minimal / absent communication",

  abcstamp_s_opt_speech_normal: "Normal speech",
  abcstamp_s_opt_speech_pressured: "Pressured / rapid speech",
  abcstamp_s_opt_speech_slow: "Slow / reduced speech",

  abcstamp_t_opt_thought_linear: "Linear / coherent thought",
  abcstamp_t_opt_thought_racing: "Racing thoughts",
  abcstamp_t_opt_thought_disorganised: "Disorganised / incoherent thought",

  abcstamp_m_opt_mood_euthymic: "Neutral / stable mood",
  abcstamp_m_opt_mood_low: "Low / depressed mood",
  abcstamp_m_opt_mood_elevated: "Elevated / labile mood",

  abcstamp_p_opt_perception_none: "No abnormal perceptions reported",
  abcstamp_p_opt_perception_voices: "Auditory hallucinations / voices reported",
  abcstamp_p_opt_perception_other: "Other perceptual disturbance",

  // =========================================================
  // PRESS
  // =========================================================
  press_title: "PreSS",
  press_sub: "Prehospital Stroke Score",

  press_part1_title: "PreSS Part 1",
  press_part1_sub: "Stroke / TIA suspicion screening",
  press_part2_title: "PreSS Part 2",
  press_part2_sub: "Severity / LVO-oriented assessment",

  press_p1_face_title: "Facial palsy",
  press_p1_arm_title: "Arm weakness",
  press_p1_speech_title: "Speech disturbance",
  press_p1_other_title: "Other neurological symptoms",

  press_p2_armDrift_title: "Arm drift",
  press_p2_loc_title: "Incorrect month and/or age",
  press_p2_gaze_title: "Gaze palsy / deviation",

  press_opt_yes: "Yes",
  press_opt_no: "No",

  press_part1_score: "PreSS Part 1:",
  press_part2_score: "PreSS Part 2:",
  press_part1_positive:
    "Positive screening for suspected stroke/TIA. Use together with clinical judgement and local protocol.",
  press_part1_negative: "No positive items selected.",
  press_needAll: "Complete all items to view the result.",
  press_result_disclaimer:
    "PreSS is decision support only and must not replace clinical assessment, local guidelines, or neurologist consultation when indicated.",

  press_page_disclaimer:
    "This tool is for structured prehospital neurological assessment support only. Always follow local guidelines and use clinical judgement.",
  press_sources_sub: "Key references and protocol sources for PreSS.",
  press_source_1_title: "Prehospital Stroke Score (PreSS)",
  press_source_1_sub: "Two-part Danish prehospital stroke assessment model.",
  press_source_2_title: "The Prehospital Stroke Score and telephone conference",
  press_source_2_sub: "Prospective validation study.",
  press_source_3_title: "Local / regional guideline",
  press_source_3_sub: "Replace with your approved operational source.",

  // =========================================================
  // WEIGHT / JOULE / DOSES
  // =========================================================
  wjd_title: "Weight → Joule + Doses",
  wjd_sub: "Age → estimated kg → joules + your configured medication list.",
  wjd_age: "Age",
  wjd_years: "years",
  wjd_weight_override: "Weight",
  wjd_kg_optional: "kg (optional)",
  wjd_jkg_override: "J/kg",
  wjd_calculated: "Calculated",
  wjd_estWeight: "Estimated weight",
  wjd_usingWeight: "Using weight",
  wjd_energy: "Energy",
  wjd_doses: "Doses",
  wjd_doses_sub:
    "Shown only for enabled medicines. Add concentration to also get mL.",
  wjd_noMeds: "No enabled medicines. Go to Settings → Medication list.",
  wjd_dose: "Dose",
  wjd_volume: "Volume",
  wjd_openSettings: "Settings",
  wjd_settings_title: "Tool settings",
  wjd_settings_sub:
    "These settings affect Weight → Joule + Doses (saved on device).",
  wjd_capped120: "Capped at 120 J",
  wjd_cappedMax: "Capped at max",

  wjd_page_disclaimer:
    "This tool is intended as calculation support only. It must not be used as the sole basis for medication administration, choosing defibrillation energy, or other treatment decisions. Always verify dose, concentration, indication, route, contraindications, local instructions, and clinical responsibility before treatment.",
  wjd_settings_disclaimer:
    "Medication information and concentrations must be checked carefully against approved local references. Errors in settings can produce incorrect dose or volume calculations.",
  wjd_result_disclaimer:
    "Calculated values are advisory only and must always be checked against local guidelines, approved medication references, and the full clinical situation.",
  wjd_sources_sub:
    "Weight estimates, energy choices, and medication data should be checked against approved pediatric and local treatment references.",
  wjd_source_1_title: "Local pediatric medication and resuscitation guidance",
  wjd_source_1_sub:
    "Use approved local dose tables, formularies, and resuscitation instructions.",
  wjd_source_2_title:
    "Validated references for weight estimation and pediatric emergency care",
  wjd_source_2_sub:
    "Age-to-weight estimation should only be used when an actual or better estimated weight is not available.",
  wjd_source_3_title: "Approved references for medication concentration",
  wjd_source_3_sub:
    "Always verify concentration, formulation, route, and maximum dose before medication administration.",

  // =========================================================
  // NEWS2
  // =========================================================
  news2_title: "NEWS2",
  news2_sub: "Enter values — score and escalation update live.",
  news2_scale: "SpO₂ scale",
  news2_scale1: "Scale 1",
  news2_scale2: "Scale 2",
  news2_o2: "Supplemental O₂",
  news2_consciousness: "Consciousness (AVPU)",
  news2_rr: "Respiratory rate (RR)",
  news2_spo2: "SpO₂",
  news2_sbp: "Systolic BP",
  news2_hr: "Heart rate",
  news2_temp: "Temperature",
  news2_points: "pts",
  news2_rr_placeholder: "breaths/min",
  news2_spo2_placeholder: "%",
  news2_sbp_placeholder: "mmHg",
  news2_hr_placeholder: "beats/min",
  news2_temp_placeholder: "°C",
  news2_guidance_note:
    "Note: escalation thresholds and observation frequency can vary between regions and hospitals.",
  news2_guidance_0: "NEWS 0: Low risk (routine obs as per local policy).",
  news2_guidance_high:
    "High risk (NEWS ≥ 7): urgent clinical review / escalation.",
  news2_guidance_any3:
    "Single-parameter score of 3: urgent clinical review (even if total is lower).",
  news2_guidance_med:
    "Moderate risk (NEWS 5–6): urgent review / consider escalation.",
  news2_guidance_low:
    "Low–moderate risk (NEWS 1–4): increased observation and clinical judgement.",

  news2_page_disclaimer:
    "NEWS2 supports a structured assessment of acute illness, but it does not replace clinical judgement, local escalation instructions, or medical assessment. The score must not stand alone when making decisions about diagnosis, treatment, or destination.",
  news2_sources_sub:
    "NEWS2 should be used in accordance with the Royal College of Physicians NEWS2 report and local escalation guidance.",
  news2_source_1_title:
    "Royal College of Physicians – National Early Warning Score (NEWS2), 2017",
  news2_source_1_sub:
    "Official NEWS2 report describing the validated scoring system for acute illness severity.",
  news2_source_2_title:
    "Royal College of Physicians – NEWS2 thresholds, oxygen scoring, and escalation principles",
  news2_source_2_sub:
    "Reference for SpO₂ Scale 1 and Scale 2, supplemental oxygen scoring, and response/escalation structure.",
  news2_source_3_title: "Local observation and escalation guidance",
  news2_source_3_sub:
    "Use together with current local instructions for monitoring frequency, escalation, and referral pathways.",

  // =========================================================
  // WELLS (DVT)
  // =========================================================
  wells_title: "Wells score (DVT)",
  wells_sub: "Tick findings — score and interpretation update live.",
  wells_score: "Score",
  wells_twoLevel: "Two-level",
  wells_threeLevel: "Three-level (classic)",
  wells_result_twolevel_likely: "DVT likely (≥ 2)",
  wells_result_twolevel_unlikely: "DVT unlikely (≤ 1)",
  wells_three_low: "Low",
  wells_three_moderate: "Moderate",
  wells_three_high: "High",
  wells_clinical_reminder:
    "Clinical reminder: In most pathways Wells is combined with D-dimer and/or ultrasound. AmbuAssist supports your thinking — it does not replace local guidelines.",

  wells_page_disclaimer:
    "The Wells DVT score is a clinical prediction tool and must not be used alone to confirm or exclude deep vein thrombosis. The score must always be interpreted together with history, examination, differential diagnoses, and local diagnostic guidance.",
  wells_result_disclaimer:
    "The result is advisory only and does not replace imaging, D-dimer strategy, medical assessment, or local instructions.",
  wells_sources_sub:
    "The Wells DVT score should be used with validated pre-test probability references and current diagnostic guidance.",
  wells_source_1_title:
    "Wells et al. – Evaluation of D-dimer in the diagnosis of suspected deep-vein thrombosis (2003)",
  wells_source_1_sub:
    "Key publication supporting Wells-based clinical probability assessment combined with D-dimer testing.",
  wells_source_2_title:
    "NICE guideline NG158 – Venous thromboembolic diseases: diagnosis and management",
  wells_source_2_sub:
    "Current guideline resource for DVT diagnostic pathways, including structured workup and management.",
  wells_source_3_title: "Local VTE / referral guidance",
  wells_source_3_sub:
    "Use together with current local instructions for D-dimer strategy, ultrasound referral, escalation, and anticoagulation decisions.",

  // =========================================================
  // NIHSS
  // =========================================================
  nihss_title: "NIHSS",
  nihss_sub: "Select one option per item — total updates live.",
  nihss_scoreLabel: "NIHSS:",
  nihss_needAll:
    "Complete all NIHSS items before interpreting the score group.",
  nihss_noStroke: "0: No stroke symptoms",
  nihss_minor: "1–4: Minor stroke",
  nihss_moderate: "5–15: Moderate stroke",
  nihss_modSevere: "16–20: Moderate-severe stroke",
  nihss_severe: "21+: Severe stroke",

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

  nihss_page_disclaimer:
    "NIHSS is a structured neurological assessment tool and must not be used as the sole basis for diagnosis, destination choice, thrombolysis considerations, or other treatment decisions. The score must always be interpreted together with the overall clinical picture, local stroke guidance, and clinical judgement.",
  nihss_result_disclaimer:
    "Severity groups are advisory only and do not replace local stroke assessment or medical guidance.",
  nihss_sources_sub:
    "NIHSS content should follow the original NIH Stroke Scale publication, stroke guideline material, and local stroke pathways.",
  nihss_source_1_title:
    "Brott et al. – Measurements of acute cerebral infarction: a clinical examination scale (1989)",
  nihss_source_1_sub:
    "Original publication describing the NIH Stroke Scale as a 15-item neurologic examination scale for acute stroke.",
  nihss_source_2_title:
    "American Heart Association / American Stroke Association – Acute ischemic stroke guideline material",
  nihss_source_2_sub:
    "Guideline material supporting structured stroke severity assessment, including use of the NIHSS.",
  nihss_source_3_title:
    "Local or regional stroke triage / destination guidance",
  nihss_source_3_sub:
    "Use together with current prehospital stroke triage, destination, imaging, and escalation procedures.",

  // =========================================================
  // BVC
  // =========================================================
  bvc_title: "BVC",
  bvc_sub: "Brøset Violence Checklist — tick observed behaviours.",
  bvc_scoreLabel: "BVC:",
  bvc_low: "Low risk",
  bvc_mod: "Moderate risk",
  bvc_high: "High risk",

  bvc_item_confused: "Confused",
  bvc_item_irritable: "Irritable",
  bvc_item_boisterous: "Boisterous",
  bvc_item_verbal: "Verbal threats",
  bvc_item_physical: "Physical threats",
  bvc_item_attacking: "Attacking objects",

  bvc_page_disclaimer:
    "BVC is a short-term violence-risk screening tool and should support, not replace, dynamic clinical assessment, de-escalation, and local safety procedures. It must not be used alone to justify coercion, diagnosis, or treatment decisions.",
  bvc_result_disclaimer:
    "The BVC score is advisory only and must be interpreted together with behaviour, history, environment, and local safety guidance.",
  bvc_sources_sub:
    "BVC should be used together with validated short-term violence-risk references and local safety procedures.",
  bvc_source_1_title:
    "Woods & Almvik et al. – The Brøset Violence Checklist (2002)",
  bvc_source_1_sub:
    "Original publication describing the Brøset Violence Checklist as a short-term violence prediction instrument.",
  bvc_source_2_title:
    "Short-term risk prediction: the Brøset Violence Checklist",
  bvc_source_2_sub:
    "Supporting literature on short-term prediction of threatening or violent behaviour in psychiatric settings.",
  bvc_source_3_title: "Local psychiatric / prehospital safety guidance",
  bvc_source_3_sub:
    "Use together with current local procedures for de-escalation, scene safety, observation, escalation, and staff protection.",

  // =========================================================
  // EXAMS
  // =========================================================
  exams_title: "Clinical exams & signs",
  exams_sub:
    "Tap an item to expand. Use as a memory aid — guidelines and context win.",

  ex_label_how: "How to examine",
  ex_label_positive: "Positive sign",
  ex_label_indicates: "Indicates",
  ex_label_prehospital: "Prehospital note",

  ex_group_abdomen: "Abdomen (acute abdomen)",
  ex_group_cns: "CNS / meningeal irritation",
  ex_group_back: "Back / nerves",
  ex_group_thorax: "Thorax / heart",
  ex_group_uro: "Kidneys / urology",
  ex_group_ob: "Obstetrics",
  ex_group_trauma: "Head / trauma",

  ex_mcburney_title: "McBurney's point",
  ex_mcburney_how:
    "Palpate one-third of the distance from the right ASIS toward the umbilicus.",
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
    "Helps explain fever + RUQ pain and guides the correct receiving specialty.",

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
    "The patient raises a straight leg against resistance OR you extend the hip.",
  ex_psoas_pos: "Abdominal pain.",
  ex_psoas_ind: "Retrocecal appendicitis / retroperitoneal irritation.",

  ex_obturator_title: "Obturator sign",
  ex_obturator_how: "Flex hip and knee, then internally rotate the hip.",
  ex_obturator_pos: "Lower abdominal/pelvic pain.",
  ex_obturator_ind: "Appendicitis located in the pelvis.",

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
    "Supports a central neurological cause (e.g. stroke or intracranial pathology).",

  ex_lasegue_title: "Lasègue's sign (Straight Leg Raise)",
  ex_lasegue_how: "Passively raise the straight leg with the patient supine.",
  ex_lasegue_pos: "Radiating pain down the leg.",
  ex_lasegue_ind: "Sciatica / disc herniation.",
  ex_lasegue_pre: "Helps separate radicular pain from muscular back pain.",

  ex_becks_title: "Beck's triad",
  ex_becks_how: "Assess for hypotension, JVD, and muffled heart sounds.",
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

  ex_giordano_title: "Giordano's sign (CVA tenderness)",
  ex_giordano_how: "Gently percuss over the flank/kidney angle.",
  ex_giordano_pos: "Pain.",
  ex_giordano_ind: "Pyelonephritis or renal stone.",

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
    "History: sudden severe pain in a patient with prior uterine surgery (e.g. C-section).",
  ex_ob_prev_csection_pain_pos: "Sudden severe abdominal pain ± shock.",
  ex_ob_prev_csection_pain_ind: "Uterine rupture.",

  ex_ob_no_fetal_movement_title: "Absent fetal movements",
  ex_ob_no_fetal_movement_how:
    "History: patient reports reduced/absent fetal movement.",
  ex_ob_no_fetal_movement_pos: "Reported no fetal movement.",
  ex_ob_no_fetal_movement_ind: "Fetal distress or intrauterine fetal death.",
  ex_ob_no_fetal_movement_pre:
    "Always urgent → consult and transport to the correct destination.",

  ex_battles_title: "Battle’s sign",
  ex_battles_how: "Inspect behind the ear (mastoid region).",
  ex_battles_pos: "Bruising over the mastoid.",
  ex_battles_ind: "Basilar skull fracture.",

  ex_raccoon_title: "Raccoon eyes",
  ex_raccoon_how: "Inspect around the eyes.",
  ex_raccoon_pos: "Periorbital ecchymosis (bruising).",
  ex_raccoon_ind: "Basilar skull fracture.",

  ex_dix_hallpike_title: "Dix-Hallpike test",
  ex_dix_hallpike_how:
    "Turn the patient's head 45° to one side, then quickly lower them from sitting to supine with the head extended about 20° below horizontal. Observe the eyes for nystagmus and ask about vertigo. Repeat on the other side.",
  ex_dix_hallpike_pos:
    "Reproduction of vertigo with characteristic positional nystagmus after a short latency, typically fatigable and worse on one side.",
  ex_dix_hallpike_ind:
    "Suggests benign paroxysmal positional vertigo (BPPV), usually involving the posterior semicircular canal on the affected side.",
  ex_dix_hallpike_pre:
    "Use with caution in patients with neck pain, cervical spine instability, vascular risk, trauma, or inability to tolerate positioning. A negative test does not exclude central causes of vertigo.",

  exams_page_disclaimer:
    "These examination signs are intended as teaching and support content only. They must not be used alone to confirm a diagnosis, exclude serious illness, or determine treatment. Findings must always be interpreted in the full clinical context and according to local guidance.",
  exams_item_disclaimer:
    "Single examination signs may have limited sensitivity or specificity and must be interpreted together with history, the overall examination, vital signs, and clinical judgement.",
  exams_sources_sub:
    "Physical examination findings should be interpreted using standard clinical examination references and local guidance.",
  exams_source_1_title: "Standard references in clinical examination",
  exams_source_1_sub:
    "Use established textbooks and validated teaching material for bedside examination.",
  exams_source_2_title: "Acute and prehospital assessment guidance",
  exams_source_2_sub:
    "Combine examination findings with structured ABCDE assessment and recognition of red flags.",
  exams_source_3_title: "Local clinical guidelines",
  exams_source_3_sub:
    "Follow current local guidance for referral, escalation, and acute management.",

  // =========================================================
  // HINTS
  // =========================================================
  hints_flowchart: "Flowchart",
  hints_result: "Result",
  hints_selections: "Your selections",

  hints_page_disclaimer:
    "HINTS+ is intended for selected patients with Acute Vestibular Syndrome and requires correct examination technique together with the appropriate clinical context. It does not replace broader neurological assessment, stroke evaluation, imaging pathways, or senior clinical judgement when indicated.",
  hints_result_disclaimer:
    "This result is advisory only. If examination quality is uncertain, symptoms are atypical, or risk is high, follow the higher-risk pathway and local stroke or neurological guidance.",
  hints_sources_sub:
    "HINTS+ and related dizziness assessment should be used in accordance with the original AVS literature, modern dizziness guidance, and local stroke pathways.",
  hints_source_1_title:
    "Kattah et al. – HINTS to Diagnose Stroke in the Acute Vestibular Syndrome (2009)",
  hints_source_1_sub:
    "Foundational HINTS paper describing the three-step bedside oculomotor examination in acute vestibular syndrome.",
  hints_source_2_title:
    "GRACE-3 – Acute dizziness and vertigo in the emergency department (2023)",
  hints_source_2_sub:
    "Guideline emphasizing training, timing/triggers-based assessment, and appropriate use of bedside eye-movement examination.",
  hints_source_3_title: "Local stroke / neurology escalation guidance",
  hints_source_3_sub:
    "Follow current local procedures for escalation, imaging, and specialist assessment when a central cause is suspected.",

  // =========================================================
  // SPINAL TRAUMA
  // =========================================================
  spine_title: "Spinal trauma flow",
  spine_sub: "Quick decision flow for when spinal stabilization is indicated.",

  spine_info_title: "Definitions (tap to expand)",
  spine_info_hint:
    "Trauma criteria + what counts as critical ABC, tenderness, and neurological deficit.",
  spine_info_trauma:
    "Relevant trauma: within 48 hours, adult (≥18 years), with risk of secondary spinal cord injury.",
  spine_info_abc_title: "Critical ABC problem",
  spine_info_abc:
    "A: blocked or threatened airway.\nB: suspected pneumothorax/haemothorax, flail chest, hypoxia.\nC: threatened or manifest circulatory instability.",
  spine_info_tender_title: "Bony midline tenderness",
  spine_info_tender:
    "Direct/indirect bony tenderness on palpation of the spinous processes. Interpret the patient’s reaction (e.g. pain behaviour), not only what they say.",
  spine_info_neuro_title: "Neurological deficit",
  spine_info_neuro:
    "Unable to squeeze hands and/or dorsiflex feet, or altered sensation in arms/legs/trunk (gross neurological exam).",

  spine_step1_title: "Step 1",
  spine_step1_q: "Is this an isolated penetrating trauma?",
  spine_step1_note: "If yes → no spinal stabilization in this flow.",

  spine_step2_title: "Step 2",
  spine_step2_q: "Critical ABC problem and/or GCS < 15?",
  spine_step2_note:
    "If yes → time-critical spinal stabilization (must not delay ABCDE or transport).",

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
    "Spinal stabilization is not indicated based on the selected answers in this flow.",
  spine_outcome_none_practical:
    "Focus on patient comfort and safe handling. Reassess if symptoms change.",

  spine_outcome_spinal_title: "Spinal stabilization",
  spine_outcome_spinal_body: "Spinal stabilization is indicated.",
  spine_outcome_spinal_practical:
    "Prehospital: position/transport on a vacuum mattress. No routine use of a rigid cervical collar.\nExtrication: self-extrication if asymptomatic OR if spinal tenderness is the only symptom; otherwise assisted extrication using situation-dependent aids (e.g. scoop, spineboard) possibly combined with MILS.",

  spine_outcome_time_title: "Time-critical spinal stabilization",
  spine_outcome_time_body:
    "Spinal stabilization is indicated, but must not delay ABCDE interventions or transport.",
  spine_outcome_time_practical:
    "Only perform stabilization steps that do not delay airway, breathing, circulation, or transport. Use situation-dependent aids (vacuum mattress, scoop, spineboard, ambulance stretcher) possibly combined with MILS.",

  spine_disclaimer:
    "Support tool only — follow local clinical guidance and medical direction.",

  spine_page_disclaimer:
    "This spinal trauma flow is a support tool only. It does not replace ABCDE assessment, clinical judgement, local trauma guidance, or medical direction. If the patient is unstable, or the clinical picture is unclear, follow the higher-risk pathway and local guidance.",
  spine_result_disclaimer:
    "The suggested result is advisory only and must be interpreted together with mechanism of injury, examination findings, neurological deficits, and local trauma guidance.",
  spine_sources_sub:
    "Assessment of spinal trauma should follow Danish spinal-stabilisation guidance, trauma principles, and local prehospital procedures.",
  spine_source_1_title:
    "Sundhedsstyrelsen – National Klinisk Retningslinje for spinal stabilisering af voksne traumepatienter",
  spine_source_1_sub:
    "Danish national clinical guideline describing when spinal stabilisation is and is not recommended in adult trauma patients.",
  spine_source_2_title:
    "Maschmann et al. – New clinical guidelines on the spinal stabilisation of adult trauma patients in Denmark (2019)",
  spine_source_2_sub:
    "Consensus- and evidence-based Danish guideline publication on prehospital spinal stabilisation practice.",
  spine_source_3_title: "Local trauma / prehospital guidance",
  spine_source_3_sub:
    "Follow current local procedures for ABCDE priorities, handling, transport, spinal motion restriction, and escalation.",

  // =========================================================
  // DESTINATION
  // =========================================================
  dest_title: "Destination helper",
  dest_sub: "Choose area, then street/district/municipality and category.",
  dest_function_title: "Choose function",
  dest_area: "Area",
  dest_byen: "Byen",
  dest_region: "Regionen",
  dest_find_street: "Street search",
  dest_street_placeholder: "Street (e.g. Amagertorv)",
  dest_no_street_match: "No match in the current street list.",
  dest_bydel: "District",
  dest_kommune: "Municipality",
  dest_category: "Category",
  dest_result: "Result",
  dest_pick_more:
    "Select area + (district/municipality) + category to get a destination.",
  dest_destination: "Destination",
  dest_unknown:
    "No mapped destination was found for this combination. Verify against current local guidance.",

  dest_use_location_btn: "Use current location",
  dest_detecting: "Finding location...",
  dest_detected: "Detected",
  dest_unknown_area: "Unknown area",
  dest_using_bydel: "Using district:",
  dest_using_kommune: "Using municipality:",
  dest_clear_location: "Clear location",

  dest_loc_perm_title: "Location permission required",
  dest_loc_perm_body:
    "Allow location access so AmbuAssist can find the patient’s area.",
  dest_loc_notfound_title: "Location not found",
  dest_loc_notfound_body: "Could not reverse-geocode this location.",
  dest_area_notmapped_title: "Area not mapped",
  dest_area_notmapped_body:
    "The location was found, but could not yet be matched to a mapped Byen street/district. You can still search or choose manually.",
  dest_kommune_notmapped_title: "Municipality not mapped",
  dest_kommune_notmapped_body:
    "The location was found, but could not yet be matched to one of the mapped municipalities. You can still search or choose manually.",
  dest_loc_error_title: "Location error",
  dest_loc_error_body: "Something went wrong while reading location.",
  dest_no_kommune_match: "No municipality match found.",
  dest_region_neurokir_note_fallback:
    "Neurosurgery is listed as a shared destination in the planning document.",

  dest_page_disclaimer:
    "This destination tool is a logistical support tool only. It does not replace local destination rules, current hospital capacity, specialty-specific pathways, medical triage, or real-time operational leadership. Always verify the destination against current local instructions before transport.",
  dest_sources_sub:
    "Destination suggestions should be based on current local destination documents, specialty pathways, and operational guidance.",
  dest_source_1_title: "Region H destination guidance (internal)",
  dest_source_1_sub:
    "Internal regional guidance for destination and hospital choice. Add version and review date here.",
  dest_source_2_title: "Operational updates and local pathway notes",
  dest_source_2_sub:
    "Use together with current operational messages, special instructions, and pathway criteria.",
  dest_source_3_title: "Local dispatch / medical triage",
  dest_source_3_sub:
    "Follow current dispatch, physician, and regional coordination guidance if it differs from static mapping.",

  dest_cat_hospital: "Hospital (default)",
  dest_cat_medicin: "Medicine",
  dest_cat_reuma: "Rheumatology",
  dest_cat_gaskir: "Gastrointestinal surgery",
  dest_cat_neuro_apopleksi: "Neurology: stroke",
  dest_cat_neuro_almen: "Neurology: general",
  dest_cat_kardiologi: "Cardiology",
  dest_cat_ortkir: "Orthopedic surgery",
  dest_cat_paediatri: "Pediatrics",
  dest_cat_gyn: "Gynecology",
  dest_cat_uro: "Urology",

  dest_reg_traumecenter: "Trauma center",
  dest_reg_akutmodtagelse: "Emergency department",
  dest_reg_med_modtagelse: "Medical receiving",
  dest_reg_akutklinik: "Acute clinic",
  dest_reg_kir_mave_tarm: "Gastrointestinal surgery",
  dest_reg_boernekir: "Pediatric surgery",
  dest_reg_ortkir: "Orthopedic surgery",
  dest_reg_ortkir_boern: "Pediatric orthopedics (<16 years)",
  dest_reg_karkir: "Vascular surgery",
  dest_reg_thoraxkir: "Thoracic surgery",
  dest_reg_neurokir: "Neurosurgery",
  dest_reg_urologi: "Urology",
  dest_reg_plastkir: "Plastic surgery",
  dest_reg_mammakir: "Breast surgery",
  dest_reg_kardiologi: "Cardiology",
  dest_reg_lungemed: "Respiratory medicine",
  dest_reg_gastro: "Gastroenterology",
  dest_reg_endo: "Endocrinology",
  dest_reg_geri: "Geriatrics",
  dest_reg_reuma: "Rheumatology",
  dest_reg_infekt: "Infectious diseases",
  dest_reg_nefro: "Nephrology",
  dest_reg_haemato: "Hematology",
  dest_reg_neuro: "Neurology",
  dest_reg_apopleksi: "Stroke",
  dest_reg_gyn: "Gynecology",
  dest_reg_obst: "Obstetrics",
  dest_reg_paediatri: "Pediatrics",
  dest_reg_billeddiag: "Imaging",
  dest_reg_onk: "Clinical oncology",
  dest_reg_pall: "Palliative unit",
  dest_reg_oftal: "Ophthalmology",
  dest_reg_oenh: "ENT",
  dest_reg_audio: "Audiology",
  dest_reg_odont: "Odontology",
  dest_reg_derm: "Dermato-venereology",
  dest_reg_allergi: "Allergology",
  dest_reg_arbejds: "Occupational and environmental medicine",
  dest_reg_social: "Social medicine",

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

  // =========================================================
  // TROMBOLYSIS
  // =========================================================
  trombolysis_title: "Thrombolysis",
  trombolysis_sub:
    "Automatically shows who is responsible for thrombolysis visitation right now.",
  trombolysis_current_title: "Current responsibility",
  trombolysis_contact_title: "Contact",
  trombolysis_responsible: "Responsible",
  trombolysis_next_switch: "Next switch:",
  trombolysis_loading_number: "Loading phone number...",
  trombolysis_number_label: "Phone number:",
  trombolysis_number_not_found: "No phone number found.",
  trombolysis_call_btn: "Call",
  trombolysis_main_fallback:
    "Specialty number not found – showing the hospital main number.",
  trombolysis_disclaimer:
    "This tool is advisory only. The phone number and destination responsibility must always be verified against current regional guidelines and local instructions.",
  trombolysis_call_error_title: "Could not open call",
  trombolysis_call_error_body: "Could not start the call.",
  trombolysis_rh: "Rigshospitalet",
  trombolysis_bbh: "Bispebjerg Hospital",
  trombolysis_current_time: "Current time",
  trombolysis_info_title: "Information",
  trombolysis_rule:
    "RH covers odd dates, and BBH covers even dates. Responsibility changes every day at 08:00.",

  // =========================================================
  // CFS
  // =========================================================
  cfs_title: "Clinical Frailty Scale (CFS)",
  cfs_sub:
    "Choose the level that best matches the patient’s baseline function (not just today’s illness).",
  cfs_pickTitle: "Choose level",
  cfs_pickSub: "Choose 1–9. Tap a number to see the definition.",
  cfs_scoreLabel: "CFS:",
  cfs_noSelection: "No score selected yet.",
  cfs_note:
    "Tip: Score the patient’s usual function over the last weeks to months. Acute illness can worsen function temporarily, but CFS reflects the underlying reserve.",

  cfs_1_title: "Very fit",
  cfs_1_desc:
    "Robust, active, energetic, and motivated. Exercises regularly and is among the fittest for their age.",
  cfs_2_title: "Fit",
  cfs_2_desc:
    "No active disease symptoms, but less fit than level 1. Often exercises or is very active occasionally (e.g. seasonally).",
  cfs_3_title: "Managing well",
  cfs_3_desc:
    "Medical problems are well controlled, even if occasionally symptomatic. Not regularly active beyond routine walking.",
  cfs_4_title: "Living with very mild frailty",
  cfs_4_desc:
    "Not dependent on help for daily activities, but symptoms often limit activity. Commonly feels slowed up and/or tired during the day.",
  cfs_5_title: "Living with mild frailty",
  cfs_5_desc:
    "More evident slowing. Needs help with higher-order IADLs (finances, transport, heavy housework). Shopping, walking outside alone, meal prep, and medication handling may be affected.",
  cfs_6_title: "Living with moderate frailty",
  cfs_6_desc:
    "Needs help with all outside activities and with keeping house. Often has problems with stairs. Needs help with bathing and may need minimal assistance (cueing/standby) with dressing.",
  cfs_7_title: "Living with severe frailty",
  cfs_7_desc:
    "Completely dependent for personal care (physical or cognitive). Still appears stable and is not at high risk of dying within about 6 months.",
  cfs_8_title: "Living with very severe frailty",
  cfs_8_desc:
    "Completely dependent for personal care and approaching end of life. Typically could not recover even from a minor illness.",
  cfs_9_title: "Terminally ill",
  cfs_9_desc:
    "Approaching end of life with life expectancy under 6 months, but not otherwise living with severe frailty. Many remain active until very close to death.",

  cfs_page_disclaimer:
    "The Clinical Frailty Scale supports a structured assessment of the patient’s usual frailty, but it does not replace an overall clinical assessment. It should not be used alone to determine treatment level, prognosis, or admission decisions.",
  cfs_result_disclaimer:
    "CFS should be interpreted in the context of the patient’s usual baseline function, current illness, collateral history, and local guidance.",
  cfs_sources_sub:
    "CFS should be used in accordance with the official Clinical Frailty Scale material, Danish translation work, and local clinical guidance.",
  cfs_source_1_title: "Clinical Frailty Scale (official scale material)",
  cfs_source_1_sub:
    "Official Clinical Frailty Scale resource from the Geriatric Medicine Research group / Dalhousie University.",
  cfs_source_2_title:
    "Danish translation and validation of the Clinical Frailty Scale",
  cfs_source_2_sub:
    "Danish translation and cross-sector reliability work supporting clinical use in Danish healthcare settings.",
  cfs_source_3_title: "Local geriatric / acute medicine guidance",
  cfs_source_3_sub:
    "Interpret the score together with baseline function, collateral history, acute illness, and current local clinical guidance.",

  // =========================================================
  // FLACC
  // =========================================================
  flacc_title: "FLACC score",
  flacc_sub:
    "Behavioural pain assessment (Face, Legs, Activity, Cry, Consolability). Choose one option per category.",
  flacc_face_title: "Face",
  flacc_face_0: "Disinterested",
  flacc_face_1: "Occasional grimace, withdrawn",
  flacc_face_2: "Frequent frown, clenched jaw",

  flacc_legs_title: "Legs",
  flacc_legs_0: "No particular position or relaxed",
  flacc_legs_1: "Uneasy, restless, tense",
  flacc_legs_2: "Kicking or legs drawn up",

  flacc_activity_title: "Activity",
  flacc_activity_0: "Normal position",
  flacc_activity_1: "Squirming, tense",
  flacc_activity_2: "Arched, rigid, or jerking",

  flacc_cry_title: "Cry",
  flacc_cry_0: "No crying",
  flacc_cry_1: "Moans or whimpers",
  flacc_cry_2: "Constant crying, screams, or sobs",

  flacc_consolability_title: "Consolability",
  flacc_consolability_0: "Content, relaxed",
  flacc_consolability_1: "Distractible",
  flacc_consolability_2: "Inconsolable",

  flacc_scoreLabel: "Total:",
  flacc_needAll: "Choose one option in every category to interpret the score.",
  flacc_severity_0: "0 = Relaxed and comfortable.",
  flacc_severity_mild: "1–3 = Mild discomfort/pain.",
  flacc_severity_mod: "4–6 = Moderate pain.",
  flacc_severity_severe: "7–10 = Severe pain/discomfort.",
  flacc_disclaimer:
    "Reminder: The score supports clinical judgement — reassess after intervention.",

  flacc_page_disclaimer:
    "FLACC is a behavioural pain assessment tool and should support, not replace, the overall pain assessment. Use the tool together with age, clinical context, relevant parent/caregiver information, and reassessment after intervention.",
  flacc_result_disclaimer:
    "The FLACC score must be interpreted with caution and must never be used as the sole basis for pain-treatment decisions.",
  flacc_sources_sub:
    "FLACC should be used in accordance with validated pediatric pain-assessment references and local pediatric guidance.",
  flacc_source_1_title:
    "Merkel et al. – FLACC Behavioral Pain Assessment Scale (1997)",
  flacc_source_1_sub:
    "Original publication describing FLACC as a behavioral pain scale for children who may not be able to verbalize pain.",
  flacc_source_2_title:
    "Validation studies for FLACC in pediatric pain assessment",
  flacc_source_2_sub:
    "Supporting literature on validity and reliability of FLACC for clinical and procedural pain assessment in children.",
  flacc_source_3_title: "AAP pediatric pain assessment guidance",
  flacc_source_3_sub:
    "Use together with broader pediatric pain-assessment principles, reassessment after intervention, and local pediatric treatment guidance.",

  // =========================================================
  // APGAR
  // =========================================================
  apgar_title: "APGAR score",
  apgar_sub: "Newborn assessment. Choose one option per category (0–2).",
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
  apgar_grimace_1: "Grimace or weak cry with stimulation",
  apgar_grimace_2: "Cries with stimulation",

  apgar_activity_title: "Activity (tone)",
  apgar_activity_0: "Floppy",
  apgar_activity_1: "Some flexion",
  apgar_activity_2: "Well flexed and resists extension",

  apgar_respiration_title: "Respiration",
  apgar_respiration_0: "Apneic",
  apgar_respiration_1: "Slow, irregular breathing",
  apgar_respiration_2: "Strong cry",

  apgar_scoreLabel: "Total:",
  apgar_needAll: "Choose one option in every category to interpret the score.",
  apgar_interp_ok: "7–10 = Generally normal adaptation.",
  apgar_interp_mod: "4–6 = Moderately depressed — support may be needed.",
  apgar_interp_crit:
    "0–3 = Critically low — immediate resuscitation measures may be needed.",
  apgar_disclaimer:
    "Reminder: APGAR complements, but does not replace, ongoing assessment and resuscitation algorithms.",

  apgar_page_disclaimer:
    "APGAR is a structured newborn assessment tool and does not replace neonatal resuscitation algorithms, ongoing reassessment, or clinical judgement. Use the score together with the full clinical picture and local neonatal guidance.",
  apgar_result_disclaimer:
    "APGAR supports communication and structured assessment, but it must not be used alone to determine treatment or prognosis.",
  apgar_sources_sub:
    "APGAR should be used in accordance with established newborn assessment references and local neonatal guidance.",
  apgar_source_1_title: "APGAR score",
  apgar_source_1_sub:
    "Established assessment framework for newborn appearance, pulse, grimace, activity, and respiration.",
  apgar_source_2_title: "Neonatal assessment and resuscitation guidance",
  apgar_source_2_sub:
    "Use together with current neonatal resuscitation algorithms and structured reassessment.",
  apgar_source_3_title: "Local obstetric / neonatal guidance",
  apgar_source_3_sub:
    "Follow current local guidance for newborn assessment, escalation, and treatment.",

  // =========================================================
  // SETTINGS
  // =========================================================
  result: "Result",
  settings_title: "Settings",
  settings_sub: "These affect tools across the app (saved on device).",
  settings_weight_title: "Weight estimation",
  settings_weight_sub: "Choose a default formula for Age → estimated kg.",
  settings_apls_1_5: "APLS 1–5 years",
  settings_apls_6_12: "APLS 6–12 years",
  settings_custom: "Custom",
  settings_custom_hint: "weight = age*a + b",
  settings_default_energy_title: "Default defib energy",
  settings_j_per_kg: "J/kg",
  settings_meds_title: "Medication list (dose by weight)",
  settings_meds_sub:
    "Use mg/kg. Optional max mg. Optional concentration (mg/mL) also enables mL calculation.",
  settings_med_name: "Name",
  settings_med_enabled: "Enabled",
  settings_med_mgkg: "mg/kg",
  settings_med_max: "Max mg (optional)",
  settings_med_conc: "Concentration (optional)",
  settings_add_med: "Add medicine",
  settings_save: "Save settings",
  settings_reset: "Reset to defaults",
  settings_reset_confirm: "Reset settings to defaults?",
  settings_remove_confirm: "Remove this medicine?",
  settings_med_name_placeholder: "Medicine name",
  settings_med_dose: "Dose",

  tool_settings_title: "Settings",
  tool_settings_desc: "Weight formula, default J/kg, med dose list",

  // =========================================================
  // CONTACT
  // =========================================================
  contact_title: "Contact & feedback",
  contact_sub:
    "Report bugs, suggest improvements, or get in touch about the app.",

  contact_getintouch_title: "Get in touch",
  contact_getintouch_body:
    "If you notice an issue, spot incorrect content, or have an idea for improving AmbuAssist, please send feedback.",
  contact_support_email_label: "Support email",
  contact_email_button: "Email support",

  contact_include_title: "What to include",
  contact_include_1: "The tool or page where the issue happened.",
  contact_include_2: "What went wrong, and what you expected instead.",
  contact_include_3: "Which language the app was using when it happened.",
  contact_include_4: "Your device and operating system, if it is a bug.",
  contact_include_5:
    "A screenshot if possible, especially for layout or calculation issues.",

  contact_medical_title: "Medical content feedback",
  contact_medical_body:
    "If you believe a source, disclaimer, destination mapping, score explanation, or other clinical content is incorrect or outdated, please report it as clearly as possible.",
  contact_medical_warning:
    "AmbuAssist is a support tool only. Clinical content feedback is valuable and helps improve safety, but users must always follow local guidelines, approved references, and clinical judgement.",

  contact_suggestions_title: "Suggestions are welcome too",
  contact_suggestions_1: "New tools or assessment pages.",
  contact_suggestions_2: "Translation improvements.",
  contact_suggestions_3: "UI tweaks that make the app faster to use on shift.",
  contact_suggestions_4: "Feature ideas for prehospital workflows.",

  contact_email_subject: "AmbuAssist feedback / issue report",
  contact_email_body_greeting: "Hi,",
  contact_email_body_intro: "I would like to report the following:",
  contact_email_body_tool: "Tool/page",
  contact_email_body_happened: "What happened",
  contact_email_body_expected: "What I expected",
  contact_email_body_language: "App language",
  contact_email_body_device: "Device / OS",
  contact_email_body_version: "App version (if known)",
  contact_email_body_notes: "Additional notes",

  // =========================================================
  // ABOUT
  // =========================================================
  about_title: "About AmbuAssist",
  about_sub:
    "A lightweight support app for prehospital and clinical reference use.",

  about_what_title: "What AmbuAssist is",
  about_what_body:
    "AmbuAssist is designed as a simple support tool for quick access to selected clinical scores, assessment aids, destination help, and reference content in busy real-world settings.",

  about_purpose_title: "Purpose",
  about_purpose_1:
    "Reduce friction when looking up common tools and structured assessments.",
  about_purpose_2:
    "Present practical information in a clean and fast mobile format.",
  about_purpose_3:
    "Support clinical thinking without replacing guidelines or judgement.",

  about_limit_title: "Important limitation",
  about_limit_body:
    "AmbuAssist is a support tool only. It does not replace clinical judgement, local instructions, approved references, physician input, or operational guidance.",

  about_info_title: "App information",
  about_info_name: "App name",
  about_info_version: "Version",
  about_info_use: "Intended use",
  about_info_use_value: "Reference and support tool",
  about_info_focus: "Primary focus",
  about_info_focus_value: "Prehospital and clinical support content",

  about_design_title: "Design philosophy",
  about_design_1: "Fast to open.",
  about_design_2: "Easy to read under pressure.",
  about_design_3: "Minimal clutter.",
  about_design_4:
    "Clear separation between support content and clinical decision responsibility.",

  about_feedback_title: "Feedback",
  about_feedback_body:
    "If you find a bug, spot outdated content, or have ideas for improving the app, please use the Contact & feedback page.",

  // =========================================================
  // MEDICAL DISCLAIMER
  // =========================================================
  meddisc_title: "Medical disclaimer",
  meddisc_sub:
    "Important information about safe use of AmbuAssist and its clinical tools.",

  meddisc_section_use_title: "Intended use",
  meddisc_use_1:
    "AmbuAssist is intended as a reference and support tool for trained users.",
  meddisc_use_2:
    "The app does not replace clinical judgment, local guidelines, physician advice, or supervision.",
  meddisc_use_3:
    "Information and calculations in the app must always be interpreted in the full clinical context.",
  meddisc_use_4:
    "Users are responsible for checking whether the tool content matches local practice, approved medicines, and applicable protocols.",

  meddisc_section_users_title: "Intended users",
  meddisc_users_1:
    "AmbuAssist is intended for trained healthcare personnel and students working under approved supervision.",
  meddisc_users_2:
    "The app is not intended for self-diagnosis, self-treatment, or use by untrained members of the public.",
  meddisc_users_3:
    "Some tools require specific clinical training, correct examination technique, and knowledge of local escalation pathways.",

  meddisc_section_warning_title: "Important warning",
  meddisc_warning_body:
    "Do not use AmbuAssist as the sole basis for diagnosis, triage, medication administration, transport decisions, or other treatment decisions. Always follow local instructions and seek a qualified doctor’s advice when relevant before making medical decisions.",

  meddisc_section_method_title: "Clinical basis and methodology",
  meddisc_method_1:
    "Assessment tools in AmbuAssist are based on established clinical scores, structured examination frameworks, or named guideline-based decision aids.",
  meddisc_method_2:
    "Each relevant tool screen should include its own source section describing the clinical basis of that tool.",
  meddisc_method_3:
    "Scores, checklists, and flows in the app simplify bedside support and do not reproduce the full clinical context, exclusions, or operational exceptions from all local documents.",
  meddisc_method_4:
    "If a source, workflow, score threshold, or local practice changes, local and current approved guidance always takes priority over the app.",

  meddisc_section_sources_title: "Sources and references",
  meddisc_sources_body:
    "Medical tools in AmbuAssist should be used together with clearly stated sources, guidelines, or validated scoring systems. Source information for individual tools should be easy to find in the relevant tool screens.",

  meddisc_sources_note_title: "About tool-specific references",
  meddisc_sources_note_body:
    "Use the source section on each tool page to review the framework, guideline, or reference material relevant to that specific assessment.",

  meddisc_section_region_title: "Local and regional applicability",
  meddisc_region_1:
    "AmbuAssist is designed as a support app for Danish clinical and prehospital use, including users working in the Copenhagen area.",
  meddisc_region_2:
    "Destination advice, escalation thresholds, trauma handling, stroke pathways, medication use, and referral practice may vary between services, hospitals, and regions.",
  meddisc_region_3:
    "If local, regional, employer, physician, or dispatch guidance differs from the app, follow the current approved local guidance.",

  meddisc_section_emergency_title: "Emergency use",
  meddisc_emergency_body:
    "In urgent or life-threatening situations, follow your local emergency procedures, approved guidelines, and supervising clinical direction. Delays caused by app use must always be avoided.",

  meddisc_section_updates_title: "Content review and updates",
  meddisc_updates_1:
    "Clinical content should be reviewed and updated whenever local guidance, named tools, or operational pathways change.",
  meddisc_updates_2:
    "Users should report suspected errors, outdated references, or mismatches with current local practice.",
  meddisc_updates_3:
    "Absence of an updated source on a tool page should be treated as a reason to verify the content in an approved reference before relying on it.",

  meddisc_footer:
    "This app is a support tool — not a substitute for professional medical assessment.",
};

export const da: typeof en = {
  // =========================================================
  // SHARED / APP
  // =========================================================
  appName: "AmbuAssist",
  homeTagline: "Små værktøjer til kaotisk virkelighed",
  language: "Sprog",
  english: "Engelsk",
  danish: "Dansk",
  open: "Åbn",

  loading: "Indlæser…",
  save: "Gem",
  reset: "Nulstil",
  cancel: "Annuller",
  remove: "Fjern",
  add: "Tilføj",
  close: "Luk",
  default: "standard",
  yes: "Ja",
  no: "Nej",
  answer: "Svar",
  back: "Tilbage",

  clinicalReminder:
    "Klinisk note: Dette værktøj understøtter vurderingen, men erstatter ikke klinisk skøn. Følg altid lokale retningslinjer.",

  tool_disclaimer_title: "Medicinsk disclaimer",
  tool_sources_title: "Kilder og referencer",
  tool_answered: "Besvaret:",
  tool_filled: "Udfyldte værdier:",

  // =========================================================
  // HOME TOOL CARDS
  // =========================================================
  tool_dest_title: "Destination",
  tool_dest_desc: "Vælg Byen/Regionen + diagnose → destinationshospital",

  tool_trombolysis_title: "Trombolyse",
  tool_trombolysis_desc:
    "Viser automatisk ansvarligt visitationshospital og telefonnummer.",

  tool_weightDose_title: "Vægt → Joule + Doser",
  tool_weightDose_desc: "Alder → vægtestimat → joule + valgte lægemidler",

  tool_exams_title: "Kliniske undersøgelser",
  tool_exams_desc: "Hurtige bedside-tegn",

  tool_assessment_title: "Vurderingsværktøjer",
  tool_assessment_desc: "Kliniske scores, skalaer og strukturerede vurderinger",

  tool_meddisc_title: "Medicinsk disclaimer",
  tool_meddisc_desc: "Vigtig info om brug, sikkerhed og kilder.",

  tool_contact_title: "Kontakt & feedback",
  tool_contact_desc: "Rapportér fejl, kom med forslag, eller kontakt os.",

  tool_about_title: "Om appen",
  tool_about_desc: "Hvad AmbuAssist er, hvad den gør, og hvad den ikke gør.",

  // =========================================================
  // ASSESSMENT SECTION CARDS
  // =========================================================

  tool_bloodgas_title: "Blodgas fortolkning",
  tool_bloodgas_desc: "Fortolk blodgas, laktat, glukose og infektionsparametre",

  tool_bvc_title: "BVC",
  tool_bvc_desc: "Brøset Violence Checklist",

  tool_spine_title: "NKR - Rygsøjletraume",
  tool_spine_desc: "Gå trinvis gennem flow for spinal stabilisering",

  tool_flacc_title: "FLACC",
  tool_flacc_desc: "Pædiatrisk smertevurdering (0–10).",

  tool_apgar_title: "APGAR",
  tool_apgar_desc: "Vurdering af nyfødt (0–10).",

  tool_cfs_title: "CFS",
  tool_cfs_desc: "Clinical Frailty Skala (1–9)",

  tool_hints_title: "HINTS",
  tool_hints_desc: "Gå trin for trin gennem HINTS+ og positionssvimmelhed.",

  tool_neuro_title: "Neurologisk",
  tool_neuro_desc: "NIHSS, PreSS og HINTS",

  tool_news2_title: "NEWS2",
  tool_news2_desc: "Vitalparametre → NEWS2-score + eskalation",

  tool_wells_title: "Wells (DVT)",
  tool_wells_desc: "Sandsynlighedsscore for DVT",

  tool_behaviouralGeriatric_title: "Adfærd & Geriatri",
  tool_behaviouralGeriatric_desc: "BVC, ABC-STAMP og CFS",

  tool_paediatric_title: "Pædiatrisk",
  tool_paediatric_desc: "APGAR, FLACC og pædiatriske vurderinger",

  tool_settings_title: "Indstillinger",
  tool_settings_desc: "Vægtestimat, standard J/kg, medicinliste",

  // =========================================================
  // SECTION PAGES
  // =========================================================
  behaviouralGeriatric_title: "Adfærd & Geriatri",
  behaviouralGeriatric_sub:
    "Vælg et adfærds- eller geriatrisk vurderingsværktøj.",

  paediatric_title: "Pædiatrisk",
  paediatric_sub: "Vælg et pædiatrisk scoresystem.",

  neurological_title: "Neurologisk",
  neurological_sub: "Vælg et neurologisk scoresystem.",

  // =========================================================
  // BLODGAS / LAB
  // =========================================================
  bg_label_po2: "pO₂ (kPa)",
  bg_label_be: "Base excess, BE(b) (mmol/L)",
  bg_label_so2: "cSO₂ (%)",
  bg_label_na: "Na+ (mmol/L)",
  bg_label_k: "K+ (mmol/L)",
  bg_label_ca: "Ca++ (mmol/L)",
  bg_label_cl: "Cl- (mmol/L)",
  bg_label_urea: "Urea (mmol/L)",
  bg_label_creatinine: "Kreatinin (µmol/L)",
  bg_label_hct: "Hct (%)",
  bg_label_hgb: "cHgb (mmol/L)",

  bg_pattern_hhs:
    "Muligt HHS-mønster – udtalt hyperglykæmi uden tydeligt svært ketoacidosemønster.",
  bg_pattern_metabolic_acidosis:
    "Metabolisk acidosemønster – lav HCO₃⁻ / negativ base excess sammen med acidæmi.",
  bg_pattern_hyponatremia: "Hyponatriæmi-mønster – natrium er nedsat.",
  bg_pattern_hypoxemia: "Hypoksæmi-mønster – pO₂ er nedsat.",
  bg_pattern_low_so2: "Lav iltmætning-mønster – cSO₂ er nedsat.",
  bg_pattern_renal_impairment:
    "Muligt nyrepåvirkningsmønster – urea og kreatinin er forhøjede.",

  bg_infection_lactate_elevated:
    "Forhøjet laktat – overvej hypoperfusion, sepsis eller betydelig fysiologisk stress.",
  bg_infection_stress_hyperglycemia:
    "Hyperglykæmi kan være stressrelateret, men skal fortolkes klinisk.",
  tool_bg_acidbase_title: "Syre-base-hjælper",
  tool_bg_acidbase_desc:
    "Simpel støtte til syre-base-mønstre ud fra pH, pCO₂ og HCO₃⁻.",

  tool_bg_patterns_title: "Mønstergenkendelse",
  tool_bg_patterns_desc:
    "Identificér almindelige blodgas- og laboratoriemønstre.",

  tool_bg_infection_title: "Infektionshjælper",
  tool_bg_infection_desc:
    "Simpel støtte til infektionstolkning ud fra blod- og urinprøver.",

  bg_label_ph: "pH",
  bg_label_pco2: "pCO₂ (kPa)",
  bg_label_hco3: "HCO₃⁻ (mmol/L)",
  bg_label_glucose: "Glukose (mmol/L)",
  bg_label_lactate: "Laktat (mmol/L)",
  bg_label_crp: "CRP (mg/L)",
  bg_label_nitrite: "Nitrit",
  bg_label_leukocytes: "Leukocytter",

  bg_acidbase_enter_values:
    "Indtast pH, pCO₂ og HCO₃⁻ for at se en fortolkning.",
  bg_acidbase_disclaimer:
    "Kun støtteværktøj. Syre-base-tolkning skal altid verificeres ud fra hele det kliniske billede, øvrige laboratoriesvar og gældende lokale retningslinjer.",
  bg_acidbase_sources_sub:
    "Gennemgå de underliggende kilder og verificér mod lokale retningslinjer.",

  bg_acidbase_resp_acidosis_title: "Acidose – respiratorisk mønster",
  bg_acidbase_resp_acidosis_body:
    "Lav pH sammen med forhøjet pCO₂ tyder på et primært respiratorisk acidosemønster.",
  bg_acidbase_met_acidosis_title: "Acidose – metabolisk mønster",
  bg_acidbase_met_acidosis_body:
    "Lav pH sammen med lav HCO₃⁻ tyder på et primært metabolisk acidosemønster.",
  bg_acidbase_mixed_acidosis_title: "Acidose – blandet/kombineret mønster",
  bg_acidbase_mixed_acidosis_body:
    "Lav pH sammen med både forhøjet pCO₂ og lav HCO₃⁻ tyder på en blandet respiratorisk og metabolisk acidose.",
  bg_acidbase_unclear_acidosis_title: "Acidose – uklart mønster",
  bg_acidbase_unclear_acidosis_body:
    "Der er acidæmi, men værdierne passer ikke til et enkelt og tydeligt mønster.",

  bg_acidbase_resp_alkalosis_title: "Alkalose – respiratorisk mønster",
  bg_acidbase_resp_alkalosis_body:
    "Høj pH sammen med lav pCO₂ tyder på et primært respiratorisk alkalosemønster.",
  bg_acidbase_met_alkalosis_title: "Alkalose – metabolisk mønster",
  bg_acidbase_met_alkalosis_body:
    "Høj pH sammen med forhøjet HCO₃⁻ tyder på et primært metabolisk alkalosemønster.",
  bg_acidbase_mixed_alkalosis_title: "Alkalose – blandet/kombineret mønster",
  bg_acidbase_mixed_alkalosis_body:
    "Høj pH sammen med både lav pCO₂ og forhøjet HCO₃⁻ tyder på en blandet respiratorisk og metabolisk alkalose.",
  bg_acidbase_unclear_alkalosis_title: "Alkalose – uklart mønster",
  bg_acidbase_unclear_alkalosis_body:
    "Der er alkalæmi, men værdierne passer ikke til et enkelt og tydeligt mønster.",

  bg_acidbase_comp_resp_acidosis_title:
    "Næsten normal pH – kompenseret respiratorisk acidose mulig",
  bg_acidbase_comp_resp_acidosis_body:
    "En næsten normal pH sammen med forhøjet pCO₂ og forhøjet HCO₃⁻ kan afspejle kompensation.",
  bg_acidbase_comp_resp_alkalosis_title:
    "Næsten normal pH – kompenseret respiratorisk alkalose mulig",
  bg_acidbase_comp_resp_alkalosis_body:
    "En næsten normal pH sammen med lav pCO₂ og lav HCO₃⁻ kan afspejle kompensation.",
  bg_acidbase_near_normal_title: "Syre-base-status virker næsten normal",
  bg_acidbase_near_normal_body:
    "pH ligger inden for normalområdet, og mønstret virker ikke tydeligt patologisk.",

  bg_acidbase_comp_metabolic_present:
    "HCO₃⁻ kan tyde på metabolisk/renal kompensation.",
  bg_acidbase_comp_metabolic_limited:
    "Der ses kun begrænset eller ingen tydelig metabolisk kompensation.",
  bg_acidbase_comp_respiratory_present:
    "pCO₂ kan tyde på respiratorisk kompensation.",
  bg_acidbase_comp_respiratory_limited:
    "Der ses kun begrænset eller ingen tydelig respiratorisk kompensation.",
  bg_acidbase_mixed_compensation:
    "Dette kan repræsentere kombinerede processer frem for simpel kompensation.",
  bg_acidbase_verify_context:
    "Fortolk altid sammen med det kliniske billede og hele blodgassen.",
  bg_acidbase_compensated_note: "Overvej kompensation og korrelér klinisk.",
  bg_acidbase_severe_acidemia: "Udtalt acidæmi",
  bg_acidbase_severe_alkalemia: "Udtalt alkalæmi",

  bg_acidbase_source_fallback_1_title: "Reference for syre-base-fortolkning",
  bg_acidbase_source_fallback_1_sub:
    "Brug godkendte lokale vejledninger, instrukser og undervisningsmaterialer.",
  bg_acidbase_source_fallback_2_title: "Klinisk verifikation kræves",
  bg_acidbase_source_fallback_2_sub:
    "Dette værktøj er vejledende og skal altid verificeres mod hele blodgassen og patientens klinik.",

  bg_patterns_enter_values:
    "Indtast en eller flere værdier for at se typiske mønstre.",
  bg_patterns_disclaimer:
    "Kun støtteværktøj. Mønstergenkendelse er forenklet og skal altid fortolkes sammen med hele det kliniske billede og gældende lokale retningslinjer.",
  bg_patterns_sources_sub:
    "Gennemgå de underliggende kilder og verificér mod lokale retningslinjer.",

  bg_pattern_dka: "Muligt DKA-mønster – overvej ketoacidose.",
  bg_pattern_lactate_elevated:
    "Forhøjet laktat – overvej infektion, hypoperfusion eller metabolisk stress.",
  bg_pattern_lactate_high:
    "Højt laktat – hurtig vurdering for shock eller betydende hypoperfusion er relevant.",
  bg_pattern_dehydration:
    "Mønstret kan passe med dehydrering eller stressrespons.",
  bg_pattern_respiratory_acidosis:
    "Respiratorisk acidosemønster – lav pH sammen med forhøjet pCO₂.",

  bg_patterns_source_fallback_1_title: "Reference for mønstergenkendelse",
  bg_patterns_source_fallback_1_sub:
    "Brug godkendte lokale vejledninger for blodgas og laboratorieværdier.",
  bg_patterns_source_fallback_2_title: "Klinisk verifikation kræves",
  bg_patterns_source_fallback_2_sub:
    "Mønstrene her er forenklede og skal altid verificeres klinisk.",

  bg_infection_enter_values:
    "Indtast CRP og/eller urinfund for at se en støttende fortolkning.",
  bg_infection_disclaimer:
    "Kun støtteværktøj. CRP og urinfund er uspecifikke og skal altid fortolkes sammen med anamnese, undersøgelse, vitale værdier og lokale retningslinjer.",
  bg_infection_sources_sub:
    "Gennemgå de underliggende kilder og verificér mod lokale retningslinjer.",

  bg_infection_crp_high:
    "Høj CRP – overvej betydende inflammatorisk eller infektiøs proces.",
  bg_infection_crp_moderate:
    "Moderat forhøjet CRP – mulig inflammatorisk eller infektiøs proces.",
  bg_infection_uti_pattern:
    "Nitrit og leukocytter til stede – overvej UVI-mønster.",
  bg_infection_leukocytes_only:
    "Leukocytter til stede – mulig inflammation eller infektion.",
  bg_infection_nitrite_only:
    "Nitrit til stede – bakteriel UVI kan være relevant afhængigt af symptomer.",

  bg_infection_source_fallback_1_title: "Reference for infektionstolkning",
  bg_infection_source_fallback_1_sub:
    "Brug godkendte lokale vejledninger for infektion og urinstix-fortolkning.",
  bg_infection_source_fallback_2_title: "Klinisk verifikation kræves",
  bg_infection_source_fallback_2_sub:
    "Dette værktøj er vejledende og skal altid verificeres mod symptomer, undersøgelse og lokale retningslinjer.",
  bg_disclaimer: "Kun støtteværktøj – ikke diagnostisk",
  bg_no_pattern_found:
    "Ingen tydelig mønsterforslag ud fra de indtastede værdier.",

  // =========================================================
  // ABC-STAMP
  // =========================================================
  abcstamp_title: "ABC-STAMP",
  abcstamp_sub: "Struktureret psykiatrisk vurderingsstøtte",
  abcstamp_completedLabel: "Udfyldte sektioner:",
  abcstamp_result_text:
    "Brug dette som et struktureret observationsværktøj sammen med klinisk vurdering og lokal procedure.",
  abcstamp_result_disclaimer:
    "ABC-STAMP er kun støtte til dokumentation og vurdering. Det må ikke erstatte fuld psykiatrisk vurdering, eskalering eller lokale retningslinjer.",
  abcstamp_page_disclaimer:
    "Brug den officielle lokale eller regionale ABC-STAMP-struktur, hvor det er relevant. Siden bør tilpasses godkendt dansk klinisk ordlyd før release.",
  abcstamp_sources_sub: "Referencer og godkendte kilder for ABC-STAMP.",
  abcstamp_source_1_title: "Officiel dansk ABC-STAMP-kilde",
  abcstamp_source_1_sub:
    "Erstat med jeres godkendte regionale eller psykiatriske kilde.",
  abcstamp_source_2_title: "Lokal / regional psykiatrisk vejledning",
  abcstamp_source_2_sub: "Erstat med jeres godkendte driftskilde.",
  abcstamp_source_3_title: "AmbuAssist-disclaimer",
  abcstamp_source_3_sub: "Kun vurderingsstøtte.",

  abcstamp_notes_label: "Korte noter",
  abcstamp_notes_placeholder: "Tilføj korte observationer...",

  abcstamp_a_title: "A",
  abcstamp_a_sub: "Fremtoning",
  abcstamp_b_title: "B",
  abcstamp_b_sub: "Adfærd",
  abcstamp_c_title: "C",
  abcstamp_c_sub: "Kommunikation",
  abcstamp_s_title: "S",
  abcstamp_s_sub: "Tale",
  abcstamp_t_title: "T",
  abcstamp_t_sub: "Tanke",
  abcstamp_m_title: "M",
  abcstamp_m_sub: "Stemningsleje",
  abcstamp_p_title: "P",
  abcstamp_p_sub: "Perception",

  abcstamp_a_opt_appearance_calm: "Rolig / passende fremtoning",
  abcstamp_a_opt_appearance_agitated: "Urolig / spændt fremtoning",
  abcstamp_a_opt_appearance_dishevelled: "Forsømt / usoigneret fremtoning",

  abcstamp_b_opt_behaviour_cooperative: "Samarbejdende adfærd",
  abcstamp_b_opt_behaviour_restless: "Urolig / rastløs adfærd",
  abcstamp_b_opt_behaviour_aggressive: "Aggressiv / truende adfærd",

  abcstamp_c_opt_communication_clear: "Klar kommunikation",
  abcstamp_c_opt_communication_disorganised: "Usammenhængende kommunikation",
  abcstamp_c_opt_communication_minimal: "Minimal / ophævet kommunikation",

  abcstamp_s_opt_speech_normal: "Normal tale",
  abcstamp_s_opt_speech_pressured: "Forceret / hurtig tale",
  abcstamp_s_opt_speech_slow: "Langsom / reduceret tale",

  abcstamp_t_opt_thought_linear: "Lineær / sammenhængende tankegang",
  abcstamp_t_opt_thought_racing: "Tankeflugt / tankemylder",
  abcstamp_t_opt_thought_disorganised:
    "Usammenhængende / uorganiseret tankegang",

  abcstamp_m_opt_mood_euthymic: "Neutralt / stabilt stemningsleje",
  abcstamp_m_opt_mood_low: "Nedtrykt / depressivt stemningsleje",
  abcstamp_m_opt_mood_elevated: "Eleveret / svingende stemningsleje",

  abcstamp_p_opt_perception_none: "Ingen abnorme perceptioner oplyst",
  abcstamp_p_opt_perception_voices: "Hørehallucinationer / stemmer oplyst",
  abcstamp_p_opt_perception_other: "Anden perceptuel forstyrrelse",

  // =========================================================
  // PRESS
  // =========================================================
  press_title: "PreSS",
  press_sub: "Prehospital Stroke Score",

  press_part1_title: "PreSS del 1",
  press_part1_sub: "Screening for apopleksi / TCI",
  press_part2_title: "PreSS del 2",
  press_part2_sub: "Sværhedsgrad / LVO-orienteret vurdering",

  press_p1_face_title: "Ansigtsparese",
  press_p1_arm_title: "Armsvækkelse",
  press_p1_speech_title: "Talepåvirkning",
  press_p1_other_title: "Andre neurologiske symptomer",

  press_p2_armDrift_title: "Armdrift",
  press_p2_loc_title: "Forkert måned og/eller alder",
  press_p2_gaze_title: "Blikparese / blikdeviation",

  press_opt_yes: "Ja",
  press_opt_no: "Nej",

  press_part1_score: "PreSS del 1:",
  press_part2_score: "PreSS del 2:",
  press_part1_positive:
    "Positiv screening for mistanke om apopleksi/TCI. Bruges sammen med klinisk vurdering og lokale retningslinjer.",
  press_part1_negative: "Ingen positive fund valgt.",
  press_needAll: "Udfyld alle punkter for at se resultatet.",
  press_result_disclaimer:
    "PreSS er kun beslutningsstøtte og må ikke erstatte klinisk vurdering, lokale retningslinjer eller neurologkontakt, når det er indiceret.",

  press_page_disclaimer:
    "Dette værktøj er kun til støtte for struktureret præhospital neurologisk vurdering. Følg altid lokale retningslinjer og brug klinisk vurdering.",
  press_sources_sub: "Nøglereferencer og protokolkilder for PreSS.",
  press_source_1_title: "Prehospital Stroke Score (PreSS)",
  press_source_1_sub: "Todelt dansk præhospital apopleksivurdering.",
  press_source_2_title: "The Prehospital Stroke Score and telephone conference",
  press_source_2_sub: "Prospektivt valideringsstudie.",
  press_source_3_title: "Lokal / regional retningslinje",
  press_source_3_sub: "Erstat med jeres godkendte driftskilde.",

  // =========================================================
  // WEIGHT / JOULE / DOSER
  // =========================================================
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
  wjd_openSettings: "Indstillinger",
  wjd_settings_title: "Værktøjsindstillinger",
  wjd_settings_sub:
    "Indstillinger for Vægt → Joule + Doser (gemmes på enheden).",
  wjd_capped120: "Begrænset til 120 J",
  wjd_cappedMax: "Begrænset til max",

  wjd_page_disclaimer:
    "Dette værktøj er kun tænkt som beregningsstøtte. Det må ikke bruges som eneste grundlag for medicingivning, valg af defibrilleringsenergi eller andre behandlingsbeslutninger. Verificér altid dosis, koncentration, indikation, administrationsvej, kontraindikationer, lokale instrukser og klinisk ansvar før behandling.",
  wjd_settings_disclaimer:
    "Medicinoplysninger og koncentrationer skal kontrolleres nøje mod godkendte lokale referencer. Fejl i indstillingerne kan give forkerte dosis- eller volumenberegninger.",
  wjd_result_disclaimer:
    "Beregnede værdier er kun vejledende og skal altid kontrolleres mod lokale retningslinjer, godkendte medicinreferencer og den samlede kliniske situation.",
  wjd_sources_sub:
    "Vægtestimater, energivalg og medicindata bør kontrolleres mod godkendte pædiatriske og lokale behandlingsreferencer.",
  wjd_source_1_title: "Lokal pædiatrisk medicin- og genoplivningsvejledning",
  wjd_source_1_sub:
    "Brug godkendte lokale doseringsskemaer, formularier og genoplivningsinstrukser.",
  wjd_source_2_title:
    "Validerede referencer for vægtestimat og pædiatrisk akutbehandling",
  wjd_source_2_sub:
    "Alder-til-vægt-estimat bør kun bruges, når reel eller bedre estimeret vægt ikke er tilgængelig.",
  wjd_source_3_title: "Godkendte referencer for lægemiddelkoncentration",
  wjd_source_3_sub:
    "Kontrollér altid koncentration, formulering, administrationsvej og maksimal dosis før medicingivning.",

  // =========================================================
  // NEWS2
  // =========================================================
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
  news2_rr_placeholder: "vejrtrækninger/min",
  news2_spo2_placeholder: "%",
  news2_sbp_placeholder: "mmHg",
  news2_hr_placeholder: "slag/min",
  news2_temp_placeholder: "°C",
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

  news2_page_disclaimer:
    "NEWS2 støtter en struktureret vurdering af akut sygdom, men erstatter ikke klinisk skøn, lokale eskaleringsinstrukser eller lægefaglig vurdering. Scoren må ikke stå alene ved beslutninger om diagnose, behandling eller visitation.",
  news2_sources_sub:
    "NEWS2 bør bruges i overensstemmelse med Royal College of Physicians’ NEWS2-rapport og lokale eskaleringsretningslinjer.",
  news2_source_1_title:
    "Royal College of Physicians – National Early Warning Score (NEWS2), 2017",
  news2_source_1_sub:
    "Officiel NEWS2-rapport, der beskriver det validerede scoringssystem til vurdering af akut sygdoms sværhedsgrad.",
  news2_source_2_title:
    "Royal College of Physicians – tærskler, iltscoring og eskaleringsprincipper i NEWS2",
  news2_source_2_sub:
    "Reference for SpO₂-skala 1 og 2, point for ilttilskud samt struktur for respons og eskalering.",
  news2_source_3_title: "Lokale observations- og eskaleringsretningslinjer",
  news2_source_3_sub:
    "Bruges sammen med gældende lokale instrukser for observationshyppighed, eskalering og henvisningsforløb.",

  // =========================================================
  // WELLS (DVT)
  // =========================================================
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

  wells_page_disclaimer:
    "Wells DVT-score er et klinisk prædiktionsværktøj og må ikke bruges alene til at be- eller afkræfte dyb venetrombose. Scoren skal altid tolkes sammen med anamnese, objektiv undersøgelse, differentialdiagnoser og lokale diagnostiske retningslinjer.",
  wells_result_disclaimer:
    "Resultatet er kun vejledende og erstatter ikke billeddiagnostik, D-dimer-strategi, lægefaglig vurdering eller lokal instruks.",
  wells_sources_sub:
    "Wells DVT-score bør bruges sammen med validerede referencer for prætest-sandsynlighed og gældende diagnostiske retningslinjer.",
  wells_source_1_title:
    "Wells m.fl. – Evaluation of D-dimer in the diagnosis of suspected deep-vein thrombosis (2003)",
  wells_source_1_sub:
    "Central publikation, der understøtter Wells-baseret klinisk sandsynlighedsvurdering kombineret med D-dimer.",
  wells_source_2_title:
    "NICE guideline NG158 – Venous thromboembolic diseases: diagnosis and management",
  wells_source_2_sub:
    "Aktuel guideline om diagnostiske forløb ved DVT, herunder struktureret udredning og behandling.",
  wells_source_3_title: "Lokal VTE- / henvisningsvejledning",
  wells_source_3_sub:
    "Bruges sammen med gældende lokale instrukser for D-dimer-strategi, ultralydshenvisning, eskalering og antikoagulationsbeslutninger.",

  // =========================================================
  // NIHSS
  // =========================================================
  nihss_title: "NIHSS",
  nihss_sub: "Vælg én mulighed pr. punkt — total opdateres live.",
  nihss_scoreLabel: "NIHSS:",
  nihss_needAll: "Udfyld alle NIHSS-punkter, før scorekategorien tolkes.",
  nihss_noStroke: "0: Ingen apopleksisymptomer",
  nihss_minor: "1–4: Let apopleksi",
  nihss_moderate: "5–15: Moderat apopleksi",
  nihss_modSevere: "16–20: Moderat-svær apopleksi",
  nihss_severe: "21+: Svær apopleksi",

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

  nihss_page_disclaimer:
    "NIHSS er et struktureret neurologisk vurderingsværktøj og må ikke bruges som eneste grundlag for diagnose, visitationssted, trombolyseovervejelser eller andre behandlingsbeslutninger. Scoren skal altid tolkes sammen med det samlede kliniske billede, lokale apopleksi-retningslinjer og klinisk skøn.",
  nihss_result_disclaimer:
    "Sværhedsgrupperne er kun vejledende og erstatter ikke lokal apopleksivurdering eller lægefaglig rådgivning.",
  nihss_sources_sub:
    "NIHSS-indhold bør følge den originale NIH Stroke Scale-publikation, guideline-materiale om stroke og lokale stroke-pathways.",
  nihss_source_1_title:
    "Brott m.fl. – Measurements of acute cerebral infarction: a clinical examination scale (1989)",
  nihss_source_1_sub:
    "Original publikation, der beskriver NIH Stroke Scale som en 15-punkts neurologisk undersøgelsesskala ved akut apopleksi.",
  nihss_source_2_title:
    "American Heart Association / American Stroke Association – guideline-materiale om akut iskæmisk stroke",
  nihss_source_2_sub:
    "Guideline-materiale der understøtter struktureret vurdering af stroke-sværhedsgrad, herunder brug af NIHSS.",
  nihss_source_3_title:
    "Lokal eller regional stroke-triage / visitationsvejledning",
  nihss_source_3_sub:
    "Bruges sammen med gældende præhospitale procedurer for stroke-triage, visitation, billeddiagnostik og eskalering.",

  // =========================================================
  // BVC
  // =========================================================
  bvc_title: "BVC",
  bvc_sub: "Brøset Violence Checklist — afkryds observeret adfærd.",
  bvc_scoreLabel: "BVC:",
  bvc_low: "Lav risiko",
  bvc_mod: "Moderat risiko",
  bvc_high: "Høj risiko",

  bvc_item_confused: "Konfus",
  bvc_item_irritable: "Irritabel",
  bvc_item_boisterous: "Højlydt / støjende",
  bvc_item_verbal: "Verbale trusler",
  bvc_item_physical: "Fysiske trusler",
  bvc_item_attacking: "Angriber genstande",

  bvc_page_disclaimer:
    "BVC er et screeningsværktøj til korttidsvurdering af voldsrisiko og bør støtte, ikke erstatte, dynamisk klinisk vurdering, deeskalering og lokale sikkerhedsprocedurer. Det må ikke bruges alene til at begrunde tvang, diagnose eller behandlingsbeslutninger.",
  bvc_result_disclaimer:
    "BVC-scoren er kun vejledende og skal tolkes sammen med adfærd, anamnese, miljøforhold og lokale sikkerhedsretningslinjer.",
  bvc_sources_sub:
    "BVC bør bruges sammen med validerede referencer for korttidsvurdering af voldsrisiko og lokale sikkerhedsprocedurer.",
  bvc_source_1_title:
    "Woods & Almvik m.fl. – The Brøset Violence Checklist (2002)",
  bvc_source_1_sub:
    "Original publikation, der beskriver Brøset Violence Checklist som et instrument til korttidsforudsigelse af voldelig adfærd.",
  bvc_source_2_title:
    "Short-term risk prediction: the Brøset Violence Checklist",
  bvc_source_2_sub:
    "Supplerende litteratur om korttidsforudsigelse af truende eller voldelig adfærd i psykiatriske miljøer.",
  bvc_source_3_title: "Lokal psykiatrisk / præhospital sikkerhedsvejledning",
  bvc_source_3_sub:
    "Bruges sammen med gældende lokale procedurer for deeskalering, scenesikkerhed, observation, eskalering og personalesikkerhed.",

  // =========================================================
  // EXAMS
  // =========================================================
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

  ex_lasegue_title: "Lasègues tegn (Straight Leg Raise)",
  ex_lasegue_how: "Løft strakt ben passivt i rygleje.",
  ex_lasegue_pos: "Radierende smerter ned i benet.",
  ex_lasegue_ind: "Iskias / diskusprolaps.",
  ex_lasegue_pre: "Adskiller nerverodssmerter fra muskulære smerter.",

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

  ex_giordano_title: "Giordanos tegn (bankeømhed)",
  ex_giordano_how: "Let bankeømhed/perkussion over flanken (nyrelogen).",
  ex_giordano_pos: "Smerter.",
  ex_giordano_ind: "Pyelonefritis eller nyresten.",

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

  ex_battles_title: "Battle’s sign",
  ex_battles_how: "Inspicér bag øret (mastoide-regionen).",
  ex_battles_pos: "Blå mærker bag øret.",
  ex_battles_ind: "Basis cranii-fraktur.",

  ex_raccoon_title: "Raccoon eyes",
  ex_raccoon_how: "Inspicér periorbitalt.",
  ex_raccoon_pos: "Periorbitale hæmatomer.",
  ex_raccoon_ind: "Basis cranii-fraktur.",

  ex_dix_hallpike_title: "Dix-Hallpike-test",
  ex_dix_hallpike_how:
    "Drej patientens hoved 45° til den ene side, og læg derefter patienten hurtigt fra siddende til rygliggende med hovedet ca. 20° bagover. Observer øjnene for nystagmus og spørg til svimmelhed. Gentag til den anden side.",
  ex_dix_hallpike_pos:
    "Udløsning af svimmelhed sammen med karakteristisk positionsudløst nystagmus efter kort latenstid, typisk fatigabel og mest udtalt på den ene side.",
  ex_dix_hallpike_ind:
    "Taler for benign paroksystisk positionsvertigo (BPPV), oftest fra den bageste buegang på den afficerede side.",
  ex_dix_hallpike_pre:
    "Bruges med forsigtighed ved nakkesmerter, cervikal instabilitet, vaskulære risikofaktorer, traume eller hvis patienten ikke tåler positioneringen. En negativ test udelukker ikke centrale årsager til vertigo.",

  exams_page_disclaimer:
    "Disse undersøgelsestegn er kun tænkt som undervisnings- og støtteindhold. De må ikke bruges alene til at bekræfte en diagnose, udelukke alvorlig sygdom eller afgøre behandling. Fund skal altid tolkes i den samlede kliniske kontekst og efter lokale retningslinjer.",
  exams_item_disclaimer:
    "Enkeltstående undersøgelsestegn kan have begrænset sensitivitet eller specificitet og skal tolkes sammen med anamnese, den samlede objektive undersøgelse, vitalparametre og klinisk skøn.",
  exams_sources_sub:
    "Objektive undersøgelsesfund bør tolkes ud fra standardværker i klinisk undersøgelse og lokale instrukser.",
  exams_source_1_title: "Standardreferencer i klinisk undersøgelse",
  exams_source_1_sub:
    "Brug etablerede lærebøger og valideret undervisningsmateriale i bedside-undersøgelse.",
  exams_source_2_title: "Akut- og præhospital vurderingsvejledning",
  exams_source_2_sub:
    "Kombinér undersøgelsesfund med struktureret ABCDE-vurdering og genkendelse af røde flag.",
  exams_source_3_title: "Lokale kliniske retningslinjer",
  exams_source_3_sub:
    "Følg gældende lokale instrukser for henvisning, eskalering og akut håndtering.",

  // =========================================================
  // HINTS
  // =========================================================
  hints_flowchart: "Flowchart",
  hints_result: "Resultat",
  hints_selections: "Dine valg",

  hints_page_disclaimer:
    "HINTS+ er tiltænkt udvalgte patienter med Akut Vestibulært Syndrom og kræver korrekt undersøgelsesteknik samt relevant klinisk kontekst. Det erstatter ikke bredere neurologisk vurdering, stroke-vurdering, billeddiagnostiske forløb eller senior klinisk vurdering, når dette er indiceret.",
  hints_result_disclaimer:
    "Dette resultat er kun vejledende. Hvis undersøgelseskvaliteten er usikker, symptomerne er atypiske, eller risikoen er høj, skal højere risikoniveau og lokale stroke- eller neurologiske retningslinjer følges.",
  hints_sources_sub:
    "HINTS+ og relateret svimmelhedsvurdering bør bruges i overensstemmelse med den originale AVS-litteratur, moderne retningslinjer for svimmelhed og lokale stroke-pathways.",
  hints_source_1_title:
    "Kattah m.fl. – HINTS to Diagnose Stroke in the Acute Vestibular Syndrome (2009)",
  hints_source_1_sub:
    "Grundlæggende HINTS-publikation, der beskriver den tretrins okulomotoriske bedside-undersøgelse ved akut vestibulært syndrom.",
  hints_source_2_title:
    "GRACE-3 – Acute dizziness and vertigo in the emergency department (2023)",
  hints_source_2_sub:
    "Retningslinje der fremhæver træning, vurdering ud fra timing/triggers og korrekt brug af bedside-øjenbevægelsesundersøgelse.",
  hints_source_3_title: "Lokal stroke- / neurologisk eskaleringsvejledning",
  hints_source_3_sub:
    "Følg gældende lokale procedurer for eskalering, billeddiagnostik og specialistvurdering ved mistanke om central årsag.",

  // =========================================================
  // SPINAL TRAUMA
  // =========================================================
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

  spine_page_disclaimer:
    "Dette spinal-traume-flow er kun et støtteværktøj. Det erstatter ikke ABCDE-vurdering, klinisk skøn, lokale traumerelevante instrukser eller lægefaglig ledelse. Hvis patienten er ustabil, eller det kliniske billede er uklart, skal højere risikoniveau og lokal instruks følges.",
  spine_result_disclaimer:
    "Det foreslåede resultat er kun vejledende og skal tolkes sammen med traumemekanisme, objektive fund, neurologiske udfald og lokale traumerelevante retningslinjer.",
  spine_sources_sub:
    "Vurdering af spinalt traume bør følge dansk vejledning om spinal stabilisering, traumaprincipper og lokale præhospitale procedurer.",
  spine_source_1_title:
    "Sundhedsstyrelsen – National Klinisk Retningslinje for spinal stabilisering af voksne traumepatienter",
  spine_source_1_sub:
    "Dansk national klinisk retningslinje, der beskriver hvornår spinal stabilisering er og ikke er anbefalet hos voksne traumepatienter.",
  spine_source_2_title:
    "Maschmann m.fl. – New clinical guidelines on the spinal stabilisation of adult trauma patients in Denmark (2019)",
  spine_source_2_sub:
    "Konsensus- og evidensbaseret dansk guidelinepublikation om præhospital praksis for spinal stabilisering.",
  spine_source_3_title: "Lokal traume- / præhospital vejledning",
  spine_source_3_sub:
    "Følg gældende lokale procedurer for ABCDE-prioriteter, håndtering, transport, spinal bevægerestriktion og eskalering.",

  // =========================================================
  // DESTINATION
  // =========================================================
  dest_title: "Destinationshjælper",
  dest_sub: "Vælg område, derefter gade/bydel/kommune og kategori.",
  dest_function_title: "Vælg funktion",
  dest_area: "Område",
  dest_byen: "Byen",
  dest_region: "Regionen",
  dest_find_street: "Søg på gade",
  dest_street_placeholder: "Gade (fx Amagertorv)",
  dest_no_street_match: "Ingen match i den nuværende gadeliste.",
  dest_bydel: "Bydel",
  dest_kommune: "Kommune",
  dest_category: "Kategori",
  dest_result: "Resultat",
  dest_pick_more:
    "Vælg område + (bydel/kommune) + kategori for at få destination.",
  dest_destination: "Destination",
  dest_unknown:
    "Der blev ikke fundet en mappet destination for denne kombination. Kontrollér mod gældende lokale retningslinjer.",

  dest_use_location_btn: "Brug nuværende lokation",
  dest_detecting: "Finder lokation...",
  dest_detected: "Fundet",
  dest_unknown_area: "Ukendt område",
  dest_using_bydel: "Bruger bydel:",
  dest_using_kommune: "Bruger kommune:",
  dest_clear_location: "Ryd lokation",

  dest_loc_perm_title: "Placeringstilladelse kræves",
  dest_loc_perm_body:
    "Giv adgang til placering, så AmbuAssist kan finde patientens område.",
  dest_loc_notfound_title: "Lokation ikke fundet",
  dest_loc_notfound_body: "Kunne ikke reverse-geokode denne placering.",
  dest_area_notmapped_title: "Område ikke mappet",
  dest_area_notmapped_body:
    "Lokationen blev fundet, men kunne endnu ikke matches til en mappet Byen-gade/bydel. Du kan stadig søge eller vælge manuelt.",
  dest_kommune_notmapped_title: "Kommune ikke mappet",
  dest_kommune_notmapped_body:
    "Lokationen blev fundet, men kunne ikke matches til en af de mappede kommuner endnu. Du kan stadig søge eller vælge manuelt.",
  dest_loc_error_title: "Lokationsfejl",
  dest_loc_error_body: "Noget gik galt under læsning af lokation.",
  dest_no_kommune_match: "Ingen kommunematch fundet.",
  dest_region_neurokir_note_fallback:
    "Neurokirurgi er angivet som delt destination i planlægningsdokumentet.",

  dest_page_disclaimer:
    "Dette destinationsværktøj er kun et logistisk støtteværktøj. Det erstatter ikke lokale visitationsregler, aktuel hospitalskapacitet, specialespecifikke forløb, lægefaglig visitation eller realtidsmæssig operativ ledelse. Kontrollér altid destinationen op mod gældende lokale instrukser før transport.",
  dest_sources_sub:
    "Destinationsforslag bør baseres på gældende lokale visitationsdokumenter, specialepathways og operative retningslinjer.",
  dest_source_1_title: "Region H visitationsvejledning (intern)",
  dest_source_1_sub:
    "Intern regional vejledning for visitation og destinationsvalg. Tilføj version og dato for gennemgang her.",
  dest_source_2_title: "Operationelle opdateringer og lokale pathway-noter",
  dest_source_2_sub:
    "Bruges sammen med aktuelle driftsmeddelelser, særlige instrukser og pathway-kriterier.",
  dest_source_3_title: "Lokal dispatch- / lægefaglig visitation",
  dest_source_3_sub:
    "Følg gældende dispatch-, læge- og regional koordineringsvejledning, hvis den afviger fra statisk mapping.",

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

  dest_reg_traumecenter: "Traumecenter",
  dest_reg_akutmodtagelse: "Akutmodtagelse",
  dest_reg_med_modtagelse: "Medicinsk modtagelse",
  dest_reg_akutklinik: "Akutklinik",
  dest_reg_kir_mave_tarm: "Gastrokirurgi",
  dest_reg_boernekir: "Børnekirurgi",
  dest_reg_ortkir: "Ortopædkirurgi",
  dest_reg_ortkir_boern: "Børneortopædi (<16 år)",
  dest_reg_karkir: "Karkirurgi",
  dest_reg_thoraxkir: "Thoraxkirurgi",
  dest_reg_neurokir: "Neurokirurgi",
  dest_reg_urologi: "Urologi",
  dest_reg_plastkir: "Plastikkirurgi",
  dest_reg_mammakir: "Mammakirurgi",
  dest_reg_kardiologi: "Kardiologi",
  dest_reg_lungemed: "Lungemedicin",
  dest_reg_gastro: "Gastroenterologi",
  dest_reg_endo: "Endokrinologi",
  dest_reg_geri: "Geriatri",
  dest_reg_reuma: "Reumatologi",
  dest_reg_infekt: "Infektionsmedicin",
  dest_reg_nefro: "Nefrologi",
  dest_reg_haemato: "Hæmatologi",
  dest_reg_neuro: "Neurologi",
  dest_reg_apopleksi: "Apopleksi",
  dest_reg_gyn: "Gynækologi",
  dest_reg_obst: "Obstetrik",
  dest_reg_paediatri: "Pædiatri",
  dest_reg_billeddiag: "Billeddiagnostik",
  dest_reg_onk: "Klinisk onkologi",
  dest_reg_pall: "Palliativ enhed",
  dest_reg_oftal: "Oftalmologi",
  dest_reg_oenh: "Øre-næse-hals",
  dest_reg_audio: "Audiologi",
  dest_reg_odont: "Odontologi",
  dest_reg_derm: "Dermato-venerologi",
  dest_reg_allergi: "Allergologi",
  dest_reg_arbejds: "Arbejds- og miljømedicin",
  dest_reg_social: "Socialmedicin",

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

  // =========================================================
  // TROMBOLYSE
  // =========================================================
  trombolysis_title: "Trombolyse",
  trombolysis_sub:
    "Viser automatisk hvem der har trombolysevisitation lige nu.",
  trombolysis_current_title: "Aktuel visitation",
  trombolysis_contact_title: "Kontakt",
  trombolysis_responsible: "Ansvarlig",
  trombolysis_next_switch: "Næste skift:",
  trombolysis_loading_number: "Henter telefonnummer...",
  trombolysis_number_label: "Telefonnummer:",
  trombolysis_number_not_found: "Intet telefonnummer fundet.",
  trombolysis_call_btn: "Ring op",
  trombolysis_main_fallback:
    "Specialenummer ikke fundet – viser hospitalets hovednummer.",
  trombolysis_disclaimer:
    "Dette værktøj er kun vejledende. Telefonnummer og visitation skal altid verificeres efter gældende regionale retningslinjer og lokale instrukser.",
  trombolysis_call_error_title: "Kunne ikke åbne opkald",
  trombolysis_call_error_body: "Kunde ikke starte opkald.",
  trombolysis_rh: "Rigshospitalet",
  trombolysis_bbh: "Bispebjerg Hospital",
  trombolysis_current_time: "Aktuel tid",
  trombolysis_info_title: "Information",
  trombolysis_rule:
    "RH har ulige datoer, og BBH har lige datoer. Skift sker hver dag kl. 08:00.",

  // =========================================================
  // CFS
  // =========================================================
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

  cfs_page_disclaimer:
    "Clinical Frailty Scale støtter en struktureret vurdering af patientens habituelle skrøbelighed, men erstatter ikke en samlet klinisk vurdering. Den bør ikke bruges alene til at afgøre behandlingsniveau, prognose eller indlæggelsesbeslutninger.",
  cfs_result_disclaimer:
    "CFS bør tolkes i sammenhæng med patientens habituelle funktionsevne, aktuelle sygdom, oplysninger fra pårørende og lokale retningslinjer.",
  cfs_sources_sub:
    "CFS bør anvendes i overensstemmelse med det officielle Clinical Frailty Scale-materiale, dansk oversættelsesarbejde og lokale kliniske retningslinjer.",
  cfs_source_1_title: "Clinical Frailty Scale (officielt skalamateriale)",
  cfs_source_1_sub:
    "Officiel ressource for Clinical Frailty Scale fra Geriatric Medicine Research group / Dalhousie University.",
  cfs_source_2_title:
    "Dansk oversættelse og validering af Clinical Frailty Scale",
  cfs_source_2_sub:
    "Dansk oversættelse og tværsektorielt reliabilitetsarbejde, som understøtter klinisk anvendelse i danske sundhedsfaglige miljøer.",
  cfs_source_3_title: "Lokal geriatrisk / akutmedicinsk vejledning",
  cfs_source_3_sub:
    "Scoren skal tolkes sammen med habituelt funktionsniveau, oplysninger fra pårørende, akut sygdom og gældende lokale retningslinjer.",

  // =========================================================
  // FLACC
  // =========================================================
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

  flacc_page_disclaimer:
    "FLACC er et adfærdsbaseret smertevurderingsværktøj og bør støtte, ikke erstatte, den samlede smertevurdering. Brug værktøjet sammen med alder, klinisk kontekst, relevante oplysninger fra forældre og revurdering efter intervention.",
  flacc_result_disclaimer:
    "FLACC-scoren skal tolkes med forsigtighed og må aldrig bruges som eneste grundlag for beslutninger om smertebehandling.",
  flacc_sources_sub:
    "FLACC bør anvendes i overensstemmelse med validerede pædiatriske smertevurderingsreferencer og lokale børneinstrukser.",
  flacc_source_1_title:
    "Merkel m.fl. – FLACC Behavioral Pain Assessment Scale (1997)",
  flacc_source_1_sub:
    "Original publikation, der beskriver FLACC som en adfærdsbaseret smerteskala til børn, som ikke nødvendigvis kan verbalisere smerte.",
  flacc_source_2_title:
    "Valideringsstudier af FLACC ved pædiatrisk smertevurdering",
  flacc_source_2_sub:
    "Supplerende litteratur om validitet og reliabilitet af FLACC ved klinisk og procedure-relateret smertevurdering hos børn.",
  flacc_source_3_title: "AAP-vejledning om smertevurdering hos børn",
  flacc_source_3_sub:
    "Bruges sammen med bredere principper for pædiatrisk smertevurdering, revurdering efter intervention og lokale behandlingsinstrukser.",

  // =========================================================
  // APGAR
  // =========================================================
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

  apgar_page_disclaimer:
    "APGAR er et struktureret værktøj til vurdering af nyfødte og erstatter ikke neonatale genoplivningsalgoritmer, løbende revurdering eller klinisk skøn. Brug scoren sammen med det samlede kliniske billede og lokale neonatale retningslinjer.",
  apgar_result_disclaimer:
    "APGAR støtter kommunikation og struktureret vurdering, men må ikke stå alene ved beslutninger om behandling eller prognose.",
  apgar_sources_sub:
    "APGAR bør anvendes i overensstemmelse med etablerede referencer for vurdering af nyfødte og lokale neonatale retningslinjer.",
  apgar_source_1_title: "APGAR-score",
  apgar_source_1_sub:
    "Etableret vurderingsramme for den nyfødtes udseende, puls, grimace, aktivitet og respiration.",
  apgar_source_2_title: "Vejledning om neonatal vurdering og genoplivning",
  apgar_source_2_sub:
    "Bruges sammen med gældende algoritmer for neonatal genoplivning og struktureret revurdering.",
  apgar_source_3_title: "Lokale obstetriske / neonatale retningslinjer",
  apgar_source_3_sub:
    "Følg gældende lokale instrukser for vurdering, eskalering og behandling af nyfødte.",

  // =========================================================
  // SETTINGS
  // =========================================================
  result: "Resultat",
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
  settings_med_conc: "Koncentration (valgfri)",
  settings_add_med: "Tilføj medicin",
  settings_save: "Gem indstillinger",
  settings_reset: "Nulstil til standard",
  settings_reset_confirm: "Nulstil indstillinger til standard?",
  settings_remove_confirm: "Fjern denne medicin?",
  settings_med_name_placeholder: "Lægemiddelnavn",
  settings_med_dose: "Dosis",

  // =========================================================
  // CONTACT
  // =========================================================
  contact_title: "Kontakt & feedback",
  contact_sub: "Rapportér fejl, kom med forslag, eller kontakt os om appen.",

  contact_getintouch_title: "Kontakt os",
  contact_getintouch_body:
    "Hvis du opdager en fejl, ser forkert indhold, eller har en idé til at forbedre AmbuAssist, er du meget velkommen til at sende feedback.",
  contact_support_email_label: "Support-email",
  contact_email_button: "Send email",

  contact_include_title: "Hvad du gerne må sende med",
  contact_include_1: "Hvilket værktøj eller hvilken side problemet skete på.",
  contact_include_2: "Hvad der gik galt, og hvad du forventede i stedet.",
  contact_include_3: "Hvilket sprog appen brugte, da det skete.",
  contact_include_4: "Din enhed og dit styresystem, hvis det er en fejl.",
  contact_include_5:
    "Gerne et screenshot, især ved layout- eller beregningsproblemer.",

  contact_medical_title: "Feedback om medicinsk indhold",
  contact_medical_body:
    "Hvis du mener, at en kilde, disclaimer, destinationsmapping, scoreforklaring eller andet klinisk indhold er forkert eller forældet, må du meget gerne rapportere det så tydeligt som muligt.",
  contact_medical_warning:
    "AmbuAssist er kun et støtteværktøj. Feedback om klinisk indhold er værdifuldt og kan forbedre sikkerheden, men brugeren skal altid følge lokale retningslinjer, godkendte referencer og klinisk skøn.",

  contact_suggestions_title: "Forslag er også velkomne",
  contact_suggestions_1: "Nye værktøjer eller vurderingssider.",
  contact_suggestions_2: "Forbedringer af oversættelser.",
  contact_suggestions_3:
    "UI-ændringer der gør appen hurtigere at bruge på vagt.",
  contact_suggestions_4: "Funktionsidéer til præhospitale arbejdsgange.",

  contact_email_subject: "AmbuAssist feedback / fejlrapport",
  contact_email_body_greeting: "Hej,",
  contact_email_body_intro: "Jeg vil gerne rapportere følgende:",
  contact_email_body_tool: "Værktøj/side",
  contact_email_body_happened: "Hvad skete der",
  contact_email_body_expected: "Hvad jeg forventede",
  contact_email_body_language: "App-sprog",
  contact_email_body_device: "Enhed / OS",
  contact_email_body_version: "App-version (hvis kendt)",
  contact_email_body_notes: "Yderligere noter",

  // =========================================================
  // ABOUT
  // =========================================================
  about_title: "Om AmbuAssist",
  about_sub: "En let støtteapp til præhospital og klinisk referencebrug.",

  about_what_title: "Hvad AmbuAssist er",
  about_what_body:
    "AmbuAssist er lavet som et enkelt støtteværktøj, der giver hurtig adgang til udvalgte kliniske scores, vurderingsværktøjer, destinationshjælp og referenceindhold i travle virkelige arbejdssituationer.",

  about_purpose_title: "Formål",
  about_purpose_1:
    "At mindske friktion, når man skal slå almindelige værktøjer og strukturerede vurderinger op.",
  about_purpose_2:
    "At præsentere praktisk information i et rent og hurtigt mobilformat.",
  about_purpose_3:
    "At understøtte klinisk tænkning uden at erstatte retningslinjer eller klinisk skøn.",

  about_limit_title: "Vigtig begrænsning",
  about_limit_body:
    "AmbuAssist er kun et støtteværktøj. Det erstatter ikke klinisk skøn, lokale instrukser, godkendte referencer, lægefaglig vurdering eller operativ ledelse.",

  about_info_title: "App-information",
  about_info_name: "App-navn",
  about_info_version: "Version",
  about_info_use: "Tilsigtet brug",
  about_info_use_value: "Opslags- og støtteværktøj",
  about_info_focus: "Primært fokus",
  about_info_focus_value: "Præhospitalt og klinisk støtteindhold",

  about_design_title: "Designfilosofi",
  about_design_1: "Hurtig at åbne.",
  about_design_2: "Nem at læse under pres.",
  about_design_3: "Minimal støj.",
  about_design_4:
    "Tydelig adskillelse mellem støtteindhold og klinisk beslutningsansvar.",

  about_feedback_title: "Feedback",
  about_feedback_body:
    "Hvis du finder en fejl, ser forældet indhold, eller har idéer til forbedringer, så brug siden Kontakt & feedback.",

  // =========================================================
  // MEDICAL DISCLAIMER
  // =========================================================
  meddisc_title: "Medicinsk disclaimer",
  meddisc_sub:
    "Vigtig information om sikker brug af AmbuAssist og appens kliniske værktøjer.",

  meddisc_section_use_title: "Tilsigtet brug",
  meddisc_use_1:
    "AmbuAssist er tænkt som et opslags- og støtteværktøj til uddannede brugere.",
  meddisc_use_2:
    "Appen erstatter ikke klinisk vurdering, lokale retningslinjer, lægefaglig rådgivning eller supervision.",
  meddisc_use_3:
    "Information og beregninger i appen skal altid tolkes i den samlede kliniske kontekst.",
  meddisc_use_4:
    "Brugeren har ansvar for at kontrollere, om indholdet passer med lokal praksis, godkendte lægemidler og gældende instrukser.",

  meddisc_section_users_title: "Tilsigtede brugere",
  meddisc_users_1:
    "AmbuAssist er tiltænkt uddannet sundhedspersonale og studerende, der arbejder under godkendt supervision.",
  meddisc_users_2:
    "Appen er ikke tiltænkt selvdiagnostik, selvbehandling eller brug af utrænede borgere.",
  meddisc_users_3:
    "Nogle værktøjer kræver specifik klinisk træning, korrekt undersøgelsesteknik og kendskab til lokale eskaleringsveje.",

  meddisc_section_warning_title: "Vigtig advarsel",
  meddisc_warning_body:
    "AmbuAssist må ikke bruges som eneste grundlag for diagnose, triage, medicingivning, visitationsbeslutninger eller andre behandlingsbeslutninger. Følg altid lokale instrukser og søg relevant lægefaglig rådgivning, før der træffes medicinske beslutninger.",

  meddisc_section_method_title: "Klinisk grundlag og metode",
  meddisc_method_1:
    "Vurderingsværktøjerne i AmbuAssist bygger på etablerede kliniske scores, strukturerede undersøgelsesrammer eller navngivne guideline-baserede beslutningsstøtter.",
  meddisc_method_2:
    "Hver relevant værktøjsside bør have sin egen kildesektion, som beskriver det kliniske grundlag for netop det værktøj.",
  meddisc_method_3:
    "Scores, tjeklister og flows i appen er forenklede bedside-støtter og gengiver ikke nødvendigvis hele den kliniske kontekst, alle eksklusionskriterier eller alle lokale undtagelser.",
  meddisc_method_4:
    "Hvis en kilde, arbejdsgang, scoregrænse eller lokal praksis ændrer sig, har gældende godkendt lokal vejledning altid forrang over appen.",

  meddisc_section_sources_title: "Kilder og referencer",
  meddisc_sources_body:
    "De medicinske værktøjer i AmbuAssist bør bruges sammen med tydeligt angivne kilder, retningslinjer eller validerede scoringssystemer. Kildeoplysninger for de enkelte værktøjer bør være lette at finde på de relevante værktøjssider.",

  meddisc_sources_note_title: "Om værktøjsspecifikke referencer",
  meddisc_sources_note_body:
    "Brug kildesektionen på hver værktøjsside til at se den guideline, det framework eller det referencemateriale, der er relevant for netop den vurdering.",

  meddisc_section_region_title: "Lokal og regional anvendelse",
  meddisc_region_1:
    "AmbuAssist er designet som en støtteapp til dansk klinisk og præhospital brug, herunder brugere der arbejder i København og omegn.",
  meddisc_region_2:
    "Destinationsvalg, eskalationsgrænser, traumehåndtering, stroke-pathways, medicinanvendelse og henvisningspraksis kan variere mellem tjenester, hospitaler og regioner.",
  meddisc_region_3:
    "Hvis lokal, regional, arbejdsgiverrelateret, lægefaglig eller dispatch-relateret vejledning afviger fra appen, skal gældende godkendt lokal vejledning følges.",

  meddisc_section_emergency_title: "Brug i akutte situationer",
  meddisc_emergency_body:
    "I akutte eller livstruende situationer skal du følge lokale akutprocedurer, godkendte retningslinjer og klinisk ansvarlig ledelse. Brug af appen må aldrig forsinke nødvendig behandling.",

  meddisc_section_updates_title: "Gennemgang og opdatering af indhold",
  meddisc_updates_1:
    "Det kliniske indhold bør gennemgås og opdateres, når lokale retningslinjer, navngivne værktøjer eller operative arbejdsgange ændrer sig.",
  meddisc_updates_2:
    "Brugere bør rapportere mistænkte fejl, forældede referencer eller uoverensstemmelser med gældende lokal praksis.",
  meddisc_updates_3:
    "Hvis en værktøjsside mangler en opdateret kilde, bør indholdet verificeres i en godkendt reference, før man læner sig op ad det.",

  meddisc_footer:
    "Denne app er et støtteværktøj — ikke en erstatning for professionel medicinsk vurdering.",
};
