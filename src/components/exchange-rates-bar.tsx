import type { RubCrossRates } from "@/lib/nbrb/types";

type Props = {
  rates: RubCrossRates;
};

function fmt(n: number): string {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/** Курсы НБРБ: сколько ₽ (российских) за 1 USD / EUR / CNY. */
export function ExchangeRatesBar({ rates }: Props) {
  return (
    <section
      aria-label="Курсы НБРБ к рублю"
      className="mb-8 rounded-2xl border border-border/60 bg-card/70 px-4 py-3 backdrop-blur-sm md:px-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-muted-foreground text-[10px] font-medium tracking-[0.16em] uppercase">
            Курс НБРБ · {rates.rateDate}
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Сколько российских рублей за 1 единицу валюты
          </p>
        </div>
        <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <div>
            <dt className="sr-only">Доллар США</dt>
            <dd className="font-medium tabular-nums">
              <span className="text-muted-foreground font-normal">1 $ = </span>
              {fmt(rates.USD)} ₽
            </dd>
          </div>
          <div>
            <dt className="sr-only">Евро</dt>
            <dd className="font-medium tabular-nums">
              <span className="text-muted-foreground font-normal">1 € = </span>
              {fmt(rates.EUR)} ₽
            </dd>
          </div>
          <div>
            <dt className="sr-only">Китайский юань</dt>
            <dd className="font-medium tabular-nums">
              <span className="text-muted-foreground font-normal">1 ¥ = </span>
              {fmt(rates.CNY)} ₽
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
