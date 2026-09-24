import { useEffect, useState } from "react";
import { usePayPalScriptReducer } from "@paypal/react-paypal-js";
import type { FUNDING_SOURCE } from "@paypal/paypal-js/types/components/funding-eligibility";

// PayPal's own SDK eligibility for one funding source — true until the script resolves and
// PayPal says otherwise. No fundingSource (AllButtons) is always eligible.
export const useFundingSourceEligible = (
  fundingSource?: FUNDING_SOURCE
): boolean => {
  const [{ isResolved }] = usePayPalScriptReducer();
  const [isEligible, setIsEligible] = useState(true);

  useEffect(() => {
    if (!isResolved || !fundingSource || !window.paypal?.Buttons) {
      return;
    }
    const eligible = window.paypal.Buttons({ fundingSource }).isEligible();
    if (!eligible) {
      console.warn(`"${fundingSource}" not eligible`);
    }
    setIsEligible(eligible);
  }, [isResolved, fundingSource]);

  return isEligible;
};
