import React, { useState } from "react";
import "./HomePage.css";
import type { Transaction } from "../../types"
import ExpensesTab, { CostsView } from './Costs/Costs'
import IncomeTab, { IncomeView } from './Income/Income'
import Container from '../../container/Container'

type Props = {
  initialTransactions?: Transaction[]
}

const HomePage: React.FC<Props> = ({ initialTransactions = [] }) => {
  const [tab, setTab] = useState<"expenses" | "income">("expenses");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const handleAdd = () => {
    if (!date || !description || !amount) return;
    const t: Transaction = {
      id: String(Date.now()),
      date,
      description,
      category: tab === "expenses" ? "Default" : "Income",
      amount: Number(amount),
      type: tab === "expenses" ? "expense" : "income",
    };
    setTransactions((prev) => [t, ...prev]);
    setDate("");
    setDescription("");
    setAmount("");
  };

  const handleClear = () => {
    setDate("");
    setDescription("");
    setAmount("");
  };

  const balance = transactions.reduce(
    (acc, t) => (t.type === "income" ? acc + t.amount : acc - t.amount),
    0,
  );

  return (
    <div className="home-page">
      <Container>
        <div className="hp-balance">
          <div className="label">Баланс:</div>
          <div className="amount">{balance.toFixed(2)} UAH</div>
        </div>
        <main className="hp-card">
        <div className="hp-left">
          <div className="hp-tabs">
            <div style={{ display: 'flex', gap: 8 }}>
              <ExpensesTab active={tab === 'expenses'} onClick={() => setTab('expenses')} />
              <IncomeTab active={tab === 'income'} onClick={() => setTab('income')} />
            </div>
          </div>

          {tab === 'expenses' ? (
            <CostsView
              transactions={transactions}
              date={date}
              description={description}
              onDateChange={setDate}
              onDescriptionChange={setDescription}
              onAdd={handleAdd}
              onClear={handleClear}
            />
          ) : (
            <IncomeView
              transactions={transactions}
              date={date}
              description={description}
              onDateChange={setDate}
              onDescriptionChange={setDescription}
              onAdd={handleAdd}
              onClear={handleClear}
            />
          )}
        </div>

        <aside className="hp-right">
          <div className="summary">ЗВЕДЕННЯ</div>
          <div className="summary-content">
            <div>Кількість: {transactions.length}</div>
            <div>
              Доходи:{" "}
              {transactions
                .filter((t) => t.type === "income")
                .reduce((s, t) => s + t.amount, 0)
                .toFixed(2)}
            </div>
            <div>
              Витрати:{" "}
              {transactions
                .filter((t) => t.type === "expense")
                .reduce((s, t) => s + t.amount, 0)
                .toFixed(2)}
            </div>
          </div>
        </aside>

        <div className="hp-tooltip">
          Привіт! Для початку роботи внесіть свій поточний баланс рахунку!
        </div>
        </main>
      </Container>
    </div>
  );
};

export default HomePage;
