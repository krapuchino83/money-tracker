/** Ответ НБРБ: https://www.nbrb.by/apihelp/exrates */
export type NbrbRate = {
  Cur_ID: number;
  Date: string;
  Cur_Abbreviation: string;
  Cur_Scale: number;
  Cur_Name: string;
  Cur_OfficialRate: number;
};

export type PaymentCurrency = "RUB" | "USD";

export type DisplayCurrency = PaymentCurrency;

/** Курсы к российскому рублю (база счёта). */
export type RubCrossRates = {
  /** Дата курса НБРБ (YYYY-MM-DD). */
  rateDate: string;
  /** ₽ за 1 USD. */
  USD: number;
  /** ₽ за 1 EUR. */
  EUR: number;
  /** ₽ за 1 CNY. */
  CNY: number;
  /** ₽ за 1 RUB = 1. */
  RUB: 1;
};
