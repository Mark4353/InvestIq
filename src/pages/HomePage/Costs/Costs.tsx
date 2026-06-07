import React from "react";
import "./Costs.css";
import type { Transaction } from "../../../types";

type TabProps = {
  active?: boolean;
  onClick?: () => void;
};

export const CostsTab: React.FC<TabProps> = ({ active = false, onClick }) => {
  return (
    <button className={`hp-tab ${active ? "active" : ""}`} onClick={onClick}>
      ВИТРАТИ
    </button>
  );
};

type ViewProps = {
  transactions: Transaction[];
  date: string;
  description: string;
  amount: string;
  category: string;
  onDateChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onAmountChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onAdd: () => void;
  onClear: () => void;
};

export const CostsView: React.FC<ViewProps> = ({
  transactions,
  date,
  description,
  amount,
  category,
  onDateChange,
  onDescriptionChange,
  onAmountChange,
  onCategoryChange,
  onAdd,
  onClear,
}) => {
  return (
    <>
      <div className="hp-entry">
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
        />
        <input
          className="desc"
          placeholder="Опис товару"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
        <input
          className="desc amount"
          placeholder="Сума"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
        />
        <select
          className="desc category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">Категорія</option>
          <option value="Транспорт">Транспорт</option>
          <option value="Продукти">Продукти</option>
          <option value="Розваги">Розваги</option>
        </select>
        <div className="hp-entry-actions">
          <button className="primary" onClick={onAdd}>
            ВВЕСТИ
          </button>
          <button onClick={onClear}>ОЧИСТИТИ</button>
        </div>
      </div>

      <table className="hp-table">
        <thead>
          <tr>
            <th>ДАТА</th>
            <th>ОПИС</th>
            <th>КАТЕГОРІЯ</th>
            <th>СУМА</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 && (
            <tr className="empty">
              <td colSpan={4}>Немає записів</td>
            </tr>
          )}
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.date}</td>
              <td>{t.description}</td>
              <td>{t.category}</td>
              <td className={t.type === "expense" ? "neg" : "pos"}>
                {t.amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default CostsTab;
