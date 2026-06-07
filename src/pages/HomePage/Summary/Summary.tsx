import React from "react";
import "./Summary.css";
import type { Transaction } from "../../../types";

type Props = { transactions: Transaction[] };

const monthNames = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];

function getMonthlyTotals(transactions: Transaction[]) {
  const map = new Map<number, number>();
  transactions.forEach((t) => {
    const d = new Date(t.date);
    const m = d.getMonth();
    const prev = map.get(m) ?? 0;
    const delta = t.type === "income" ? t.amount : -t.amount;
    map.set(m, prev + delta);
  });
  return map;
}

const Summary: React.FC<Props> = ({ transactions }) => {
  const totals = getMonthlyTotals(transactions);

  return (
    <aside className="hp-right" aria-label="Зведення">
      <h2 className="summary-title">ЗВЕДЕННЯ</h2>
      <div className="summary-box">
        <div className="summary-row summary-count">
          Кількість: <span>{transactions.length}</span>
        </div>
        <div className="summary-row">
          Доходи:{" "}
          <span>
            {transactions
              .filter((t) => t.type === "income")
              .reduce((s, t) => s + t.amount, 0)
              .toFixed(2)}
          </span>
        </div>
        <div className="summary-row">
          Витрати:{" "}
          <span>
            {transactions
              .filter((t) => t.type === "expense")
              .reduce((s, t) => s + t.amount, 0)
              .toFixed(2)}
          </span>
        </div>

        <div className="summary-months">
          {Array.from(totals.entries())
            .sort((a, b) => b[0] - a[0])
            .map(([m, val]) => (
              <div className="month-row" key={m}>
                <div className="month">{monthNames[m]}</div>
                <div className={`month-amount ${val < 0 ? "neg" : "pos"}`}>
                  {val.toFixed(2)}
                </div>
              </div>
            ))}
        </div>
      </div>
    </aside>
  );
};

export default Summary;
