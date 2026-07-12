import { makeEmptyBloodGasFormValues, parseBloodGasFormValues, parseNumber, validateBloodGasField } from "./helpers";

describe("parseNumber", () => {
  it("parses a decimal comma", () => {
    expect(parseNumber("7,4")).toBe(7.4);
  });

  it("parses a decimal point", () => {
    expect(parseNumber("7.4")).toBe(7.4);
  });

  it.each(["abc", "7.4abc", "1,2,3", "Infinity"])("rejects non-numeric input %s", (value) => {
    expect(parseNumber(value)).toBeUndefined();
  });
});

describe("VGAS field validation", () => {
  it("allows an empty optional value", () => {
    expect(validateBloodGasField("po2", "")).toBe("empty");
  });

  it("flags implausible or impossible values", () => {
    expect(validateBloodGasField("ph", "74")).toBe("implausible");
    expect(validateBloodGasField("pco2", "-1")).toBe("implausible");
    expect(validateBloodGasField("crp", "-1")).toBe("implausible");
  });

  it("does not feed invalid values into interpretation", () => {
    const form = makeEmptyBloodGasFormValues();
    form.ph = "74";
    form.pco2 = "5,2";
    expect(parseBloodGasFormValues(form)).toMatchObject({ ph: undefined, pco2: 5.2, po2: undefined });
  });
});
