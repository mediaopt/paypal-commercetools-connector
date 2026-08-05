import { useEffect } from "react";
import { usePayment } from "./usePayment";
import { useLoader } from "./useLoader";

export const useHandleCreatePayment = () => {
  const { handleCreatePayment } = usePayment();
  const { isLoading } = useLoader();

  useEffect(() => {
    handleCreatePayment().finally(() => isLoading(false));
  }, []);
};
