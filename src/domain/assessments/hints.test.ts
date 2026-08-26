import { getHintsTransition } from "./hints";

describe("HINTS decision regression", () => {
  test("red flags terminate in imaging result", () => {
    expect(getHintsTransition("red_flags", "rf_yes")).toBe("imaging");
  });
  test("positional path retains BPPV and other outcomes", () => {
    expect(getHintsTransition("pattern", "pattern_bppv")).toBe("dix_hallpike");
    expect(getHintsTransition("dix_hallpike", "dh_positive")).toBe("bppv");
    expect(getHintsTransition("dix_hallpike", "dh_negative")).toBe("other");
  });
  test("acute vestibular path retains central, peripheral and unclear outcomes", () => {
    expect(getHintsTransition("pattern", "pattern_avs")).toBe("hints_plus");
    expect(getHintsTransition("hints_plus", "hints_central_any")).toBe("central");
    expect(getHintsTransition("hints_plus", "hints_peripheral_all")).toBe("peripheral");
    expect(getHintsTransition("hints_plus", "hints_unclear")).toBe("indeterminate");
  });
});
