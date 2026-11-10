import { buildGpsConfirmationChoices } from "./gpsConfirmation";
import { STREET_SAMPLE } from "../../features/destination/data/byen";

const at = (street: string, number: string, city: string, municipalityCode?: string) => ({
  street, streetNumber: number, city, municipalityCode,
  formattedAddress: `${street} ${number}, ${city === "Taastrup" ? "2630" : "1621"} ${city}`,
  postalCode: city === "Taastrup" ? "2630" : "1621",
});

describe("GPS confirmation matches the clinical decision, not nearby house numbers", () => {
  test("five Taastrup addresses become one Høje-Taastrup municipality choice", () => {
    const choices = buildGpsConfirmationChoices(
      ["4T", "4", "6", "6T", "2"].map(n => at("Øtoftegårdsvej", n, "Taastrup", "0169")),
      STREET_SAMPLE,
    );
    expect(choices).toEqual([{
      kind: "municipality", key: "kommune:høje-taastrup",
      label: "Høje-Taastrup", kommune: "Høje-Taastrup",
    }]);
  });

  test("a real regional boundary lists each DAR-verified municipality, not streets", () => {
    const choices = buildGpsConfirmationChoices([
      at("Testvej", "1", "Taastrup", "0169"),
      at("Testvej", "2", "Taastrup", "0167"),
    ], STREET_SAMPLE);
    expect(choices.map(x => x.kind)).toEqual(["municipality", "municipality"]);
    expect(choices.map(x => x.label)).toEqual(["Høje-Taastrup", "Hvidovre"]);
  });

  test("city candidates on the same street collapse to one street; no house side inferred", () => {
    const choices = buildGpsConfirmationChoices([
      at("Frederiksberg Allé", "13A", "København V"),
      at("Frederiksberg Allé", "15", "København V"),
    ], STREET_SAMPLE);
    expect(choices).toHaveLength(1);
    expect(choices[0]).toMatchObject({ kind: "street", street: "Frederiksberg Allé" });
    expect(choices[0]).not.toHaveProperty("houseNumber");
  });

  test("nearby Byen streets are offered as distinct street choices", () => {
    const choices = buildGpsConfirmationChoices([
      at("Frederiksberg Allé", "13A", "København V"),
      at("Gammel Torv", "1", "København V"),
    ], STREET_SAMPLE);
    expect(choices).toHaveLength(2);
    expect(choices.map(x => x.kind)).toEqual(["street", "street"]);
    expect(choices.map(x => x.label)).toEqual([
      "Frederiksberg Allé · 1621", "Gammel Torv · 1621",
    ]);
  });

  test("unknown municipality is left as an address, never guessed from 2630", () => {
    const choices = buildGpsConfirmationChoices([at("Øtoftegårdsvej", "4", "Taastrup")], STREET_SAMPLE);
    expect(choices).toMatchObject([{ kind: "address", candidateIndex: 0 }]);
  });
});
