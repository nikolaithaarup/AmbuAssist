import { makeEmptyBloodGasFormValues } from "./helpers";
import { getGroupSummary, VGAS_INPUT_GROUPS } from "./inputGroups";

describe("VGAS mobile input groups", () => {
  test("include every field exactly once", () => {
    const fields = VGAS_INPUT_GROUPS.flatMap((group) => group.fields);
    expect(new Set(fields).size).toBe(fields.length);
    expect(fields.sort()).toEqual(Object.keys(makeEmptyBloodGasFormValues()).sort());
  });

  test("only acid-base is expanded by default", () => {
    expect(VGAS_INPUT_GROUPS.filter((group) => group.defaultOpen).map((group) => group.id)).toEqual(["acidBase"]);
  });

  test("summarizes entered values and validation issues", () => {
    const values = makeEmptyBloodGasFormValues();
    values.ph = "7,4";
    values.pco2 = "not-a-number";
    values.hco3 = "240";
    expect(getGroupSummary(VGAS_INPUT_GROUPS[0].fields, values)).toEqual({ entered: 3, issues: 2, total: 4 });
  });
});
