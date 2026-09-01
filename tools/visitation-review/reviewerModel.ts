export type ReviewItem = {
  id: string;
  itemNumber: number;
  totalItems: number;
  pdfSource: string;
  pdfPage: number;
  suggestedOfficialStreet: string;
  suggestedDistrict: string;
  suggestedConditions: {
    postcode: string;
    numberFrom: number | null;
    numberTo: number | null;
    parity: "" | "odd" | "even";
    summary: string[];
  };
};

export type ReviewDecision = {
  itemId: string;
  status: "approved" | "unclear";
  action: "approve_suggestion" | "manual_correction" | "still_unclear";
  officialStreetName: string;
  district: string;
  postcodeCondition: string[];
  numberFrom: number | null;
  numberTo: number | null;
  parity: "" | "odd" | "even";
  notes: string;
  reviewedAt: string;
};

export type ReviewDecisionFile = {
  version: 1;
  queueSha256: string;
  updatedAt: string | null;
  decisions: Record<string, ReviewDecision>;
};

function optionalPositiveInteger(value: unknown, field: string): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`${field} must be a positive whole number`);
  }
  return number;
}

function postcodeCondition(value: unknown): string[] {
  const values = Array.isArray(value)
    ? value.map(String)
    : String(value ?? "")
        .split(/[\s,;]+/)
        .filter(Boolean);
  const unique = [...new Set(values.map((entry) => entry.trim()).filter(Boolean))];
  for (const postcode of unique) {
    if (!/^\d{4}$/.test(postcode)) {
      throw new Error(`Invalid postcode: ${postcode}`);
    }
  }
  return unique;
}

export function emptyDecisionFile(queueSha256: string): ReviewDecisionFile {
  return {
    version: 1,
    queueSha256,
    updatedAt: null,
    decisions: {},
  };
}

export function validateDecision(
  item: ReviewItem,
  input: Record<string, unknown>,
  now = new Date().toISOString(),
): ReviewDecision {
  const status = input.status;
  const action = input.action;
  if (status !== "approved" && status !== "unclear") {
    throw new Error("Decision status must be approved or unclear");
  }
  if (
    action !== "approve_suggestion" &&
    action !== "manual_correction" &&
    action !== "still_unclear"
  ) {
    throw new Error("Invalid review action");
  }
  if (status === "approved" && action === "still_unclear") {
    throw new Error("An approved decision cannot use still_unclear");
  }
  if (status === "unclear" && action !== "still_unclear") {
    throw new Error("An unclear decision must use still_unclear");
  }

  const officialStreetName = String(input.officialStreetName ?? "").trim();
  const district = String(input.district ?? "").trim();
  if (status === "approved" && !officialStreetName) {
    throw new Error("Official street name is required for approval");
  }
  if (status === "approved" && !district) {
    throw new Error("District is required for approval");
  }

  const numberFrom = optionalPositiveInteger(input.numberFrom, "numberFrom");
  const numberTo = optionalPositiveInteger(input.numberTo, "numberTo");
  if (numberFrom !== null && numberTo !== null && numberFrom > numberTo) {
    throw new Error("numberFrom cannot exceed numberTo");
  }
  const parity = String(input.parity ?? "");
  if (parity !== "" && parity !== "odd" && parity !== "even") {
    throw new Error("Parity must be odd, even, or blank");
  }

  return {
    itemId: item.id,
    status,
    action,
    officialStreetName,
    district,
    postcodeCondition: postcodeCondition(input.postcodeCondition),
    numberFrom,
    numberTo,
    parity,
    notes: String(input.notes ?? "").trim(),
    reviewedAt: now,
  };
}

export function reviewSummary(
  total: number,
  decisions: Record<string, ReviewDecision>,
): { total: number; approved: number; unclear: number; remaining: number } {
  const values = Object.values(decisions);
  const approved = values.filter((decision) => decision.status === "approved").length;
  const unclear = values.filter((decision) => decision.status === "unclear").length;
  return {
    total,
    approved,
    unclear,
    remaining: Math.max(0, total - approved - unclear),
  };
}
