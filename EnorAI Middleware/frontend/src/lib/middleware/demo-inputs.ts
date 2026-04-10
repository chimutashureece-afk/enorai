export const DEFAULT_CLINICAL_NOTE =
  "Patient Jane Doe DOB: 1984-05-12 MRN: ABCD-1234 phone +1 555-010-1111 needs an external discharge summary review.";

export const DEFAULT_MESSAGE_INPUT =
  "WhatsApp intake: Dr. Okafor requests a concise handoff summary for Jane Doe before discharge.";

export const DEFAULT_PATIENT_CONTEXT = JSON.stringify(
  {
    encounter_type: "inpatient",
    department: "cardiology",
    region: "demo",
  },
  null,
  2,
);

export const DEFAULT_INPUT_CHANNEL = "ehr_summary";
export const DEFAULT_DESTINATION_INTENT = "external_ai_summarization";

