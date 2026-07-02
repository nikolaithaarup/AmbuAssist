import { useEffect, useRef } from "react";
import { hapticSuccess } from "./haptics";

export function useSuccessHaptic(isSuccessful: boolean) {
  const wasSuccessful = useRef(false);
  useEffect(() => {
    if (isSuccessful && !wasSuccessful.current) hapticSuccess();
    wasSuccessful.current = isSuccessful;
  }, [isSuccessful]);
}
