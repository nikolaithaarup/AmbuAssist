import { reviewSummary, validateDecision, type ReviewItem } from "./reviewerModel";

const item: ReviewItem = {
  id: "byen-p01-left-01",
  itemNumber: 1,
  totalItems: 123,
  pdfSource: "docs/visitation-source/VisitationByen.pdf",
  pdfPage: 1,
  suggestedOfficialStreet: "Testgade",
  suggestedDistrict: "Indre By",
  suggestedConditions: {
    postcode: "",
    numberFrom: null,
    numberTo: null,
    parity: "",
    summary: [],
  },
};

describe("visitation reviewer decisions", () => {
  it("preserves an approved human transcription and structured conditions", () => {
    expect(
      validateDecision(
        item,
        {
          status: "approved",
          action: "manual_correction",
          officialStreetName: "Æblevej",
          district: "Amager",
          postcodeCondition: "2300, 2770",
          numberFrom: 13,
          numberTo: 29,
          parity: "odd",
          notes: "Read directly from the crop.",
        },
        "2026-09-01T10:00:00.000Z",
      ),
    ).toMatchObject({
      officialStreetName: "Æblevej",
      postcodeCondition: ["2300", "2770"],
      numberFrom: 13,
      numberTo: 29,
      parity: "odd",
    });
  });

  it("rejects incomplete approvals and invalid ranges/postcodes", () => {
    expect(() =>
      validateDecision(item, { status: "approved", action: "approve_suggestion" }),
    ).toThrow("Official street name");
    expect(() =>
      validateDecision(item, {
        status: "approved",
        action: "manual_correction",
        officialStreetName: "Testgade",
        district: "Indre By",
        postcodeCondition: "230",
      }),
    ).toThrow("Invalid postcode");
    expect(() =>
      validateDecision(item, {
        status: "approved",
        action: "manual_correction",
        officialStreetName: "Testgade",
        district: "Indre By",
        numberFrom: 20,
        numberTo: 10,
      }),
    ).toThrow("numberFrom cannot exceed numberTo");
  });

  it("keeps unclear decisions distinct and reports progress", () => {
    const unclear = validateDecision(item, {
      status: "unclear",
      action: "still_unclear",
      notes: "Slash notation needs a second reader.",
    });
    expect(reviewSummary(123, { [item.id]: unclear })).toEqual({
      total: 123,
      approved: 0,
      unclear: 1,
      remaining: 122,
    });
  });
});
