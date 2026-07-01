import { analyzeBloodGas } from "./bloodgasEngine";

describe("analyzeBloodGas", () => {
  test("returns empty findings when no values are supplied", () => {
    expect(analyzeBloodGas({})).toEqual({
      acidBase: "",
      patterns: [],
      suggestions: [],
    });
  });

  test.each([
    [7.34, "Acidosis"],
    [7.35, "Normal pH"],
    [7.45, "Normal pH"],
    [7.46, "Alkalosis"],
  ])("classifies pH %s as %s", (pH, expected) => {
    expect(analyzeBloodGas({ pH }).acidBase).toBe(expected);
  });

  test("detects the current DKA pattern when all strict thresholds are crossed", () => {
    expect(analyzeBloodGas({ pH: 7.29, HCO3: 17, glucose: 12 })).toEqual({
      acidBase: "Acidosis",
      patterns: ["DKA pattern"],
      suggestions: ["Consider ketoacidosis"],
    });
  });

  test.each([
    { pH: 7.3, HCO3: 17, glucose: 12 },
    { pH: 7.29, HCO3: 18, glucose: 12 },
    { pH: 7.29, HCO3: 17, glucose: 11 },
  ])("does not detect DKA at a threshold boundary: %o", (input) => {
    expect(analyzeBloodGas(input).patterns).not.toContain("DKA pattern");
  });

  test.each([
    [2, [], []],
    [2.1, ["Elevated lactate"], ["Consider sepsis or hypoperfusion"]],
    [4, ["Elevated lactate"], ["Consider sepsis or hypoperfusion"]],
    [
      4.1,
      ["Elevated lactate"],
      ["Consider sepsis or hypoperfusion", "Urgent evaluation for shock"],
    ],
  ])("characterizes lactate threshold behavior at %s", (lactate, patterns, suggestions) => {
    expect(analyzeBloodGas({ lactate })).toMatchObject({ patterns, suggestions });
  });

  test("requires both nitrite and leukocytes for the UTI pattern", () => {
    expect(analyzeBloodGas({ nitrite: true }).patterns).toEqual([]);
    expect(analyzeBloodGas({ leukocytes: true }).patterns).toEqual([]);
    expect(analyzeBloodGas({ nitrite: true, leukocytes: true })).toMatchObject({
      patterns: ["UTI pattern"],
      suggestions: ["Consider urinary tract infection"],
    });
  });

  test("uses a strict greater-than threshold for high CRP", () => {
    expect(analyzeBloodGas({ crp: 100 }).patterns).toEqual([]);
    expect(analyzeBloodGas({ crp: 100.1 })).toMatchObject({
      patterns: ["High CRP"],
      suggestions: ["Consider significant infection"],
    });
  });

  test("preserves finding and suggestion order for combined inputs", () => {
    expect(
      analyzeBloodGas({
        pH: 7.2,
        HCO3: 10,
        glucose: 20,
        lactate: 5,
        nitrite: true,
        leukocytes: true,
        crp: 150,
      }),
    ).toEqual({
      acidBase: "Acidosis",
      patterns: ["DKA pattern", "Elevated lactate", "UTI pattern", "High CRP"],
      suggestions: [
        "Consider ketoacidosis",
        "Consider sepsis or hypoperfusion",
        "Urgent evaluation for shock",
        "Consider urinary tract infection",
        "Consider significant infection",
      ],
    });
  });
});
