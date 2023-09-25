import {TypedMoney} from "@commercetools/platform-sdk";

export const mapCommercetoolsMoneyToPayPalMoney = (
    amountPlanned: TypedMoney
): string => {
    return String(
        amountPlanned.centAmount * Math.pow(10, -amountPlanned.fractionDigits || 0)
    );
};