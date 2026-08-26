import { getSpinalTraumaTransition } from "./spinalTrauma";

describe("spinal trauma decision regression", () => {
  test("penetrating trauma retains immediate none outcome", () => {
    expect(getSpinalTraumaTransition("penetrating", "yes")).toBe("none");
  });
  test("time-critical and spinal paths retain their outcomes", () => {
    expect(getSpinalTraumaTransition("critical", "yes")).toBe("timeCritical");
    expect(getSpinalTraumaTransition("critical", "no")).toBe("tenderOrNeuro");
    expect(getSpinalTraumaTransition("tenderOrNeuro", "yes")).toBe("spinal");
    expect(getSpinalTraumaTransition("tenderOrNeuro", "no")).toBe("none");
  });
});
