import { useEffect, useState } from "react";
import { View } from "react-native";
import { Title, Subtle } from "../src/ui/Ui";
import { getHospitalPhoneNumber } from "../src/services/hospitalNumbers";

export default function TestScreen() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const result = await getHospitalPhoneNumber("RH", "neuro");
      console.log("Fetched:", result);
      setData(result);
    })();
  }, []);

  return (
    <View style={{ padding: 16 }}>
      <Title>Firestore Test</Title>

      <Subtle>
        {data
          ? `${data.displayNameDa}: ${data.phone}`
          : "Loading or no data..."}
      </Subtle>
    </View>
  );
}
