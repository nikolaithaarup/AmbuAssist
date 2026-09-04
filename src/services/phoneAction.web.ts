export async function openPhoneNumber(phone: string): Promise<boolean> {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  // Desktop browsers often claim tel: support but have no registered dialer.
  // Keep the visible number selectable and only launch on mobile-class devices.
  const likelyHasDialer = /Android|iPhone|iPad|iPod|Mobile/i.test(
    navigator.userAgent,
  );
  if (!likelyHasDialer) return false;

  window.location.assign(`tel:${phone}`);
  return true;
}
