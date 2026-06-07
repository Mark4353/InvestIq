import React, { useEffect, useState } from "react";
import { useAuth } from '../../hooks/useAuth'
import "./HomePage.css";
import type { Transaction } from "../../types"
import ExpensesTab, { CostsView } from './Costs/Costs'
import IncomeTab, { IncomeView } from './Income/Income'
import Summary from './Summary/Summary'
import Container from '../../container/Container'
import { apiBase } from '../../utils/api'

type Props = {
  initialTransactions?: Transaction[]
}

const HomePage: React.FC<Props> = ({ initialTransactions = [] }) => {
  const [tab, setTab] = useState<"expenses" | "income">("expenses");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const { token } = useAuth()
  const [showTooltip, setShowTooltip] = useState<boolean>(() => {
      try { return !localStorage.getItem('welcome_shown') }
      catch { return false }
    })

    useEffect(() => {
      const load = async () => {
        try {
          const headers: HeadersInit | undefined = token ? { Authorization: `Bearer ${token}` } : undefined
          const res = await fetch(`${apiBase}/api/transactions`, { headers })
          if (!res.ok) return
        const data = await res.json()
        const tx = (data.transactions ?? []).map((t: unknown) => {
          const item = t as Partial<Transaction> & { amount?: unknown }
          return { ...(item as Transaction), amount: Number(item.amount ?? 0) } as Transaction
        })
        setTransactions(tx)
      } catch (err) {
        console.error('Failed to load transactions', err)
      } 
    }
    load()
  }, [token])

  useEffect(() => {
    if (!showTooltip) return
    const timer = setTimeout(() => {
      setShowTooltip(false)
      try { localStorage.setItem('welcome_shown', '1') } catch (err) { console.warn('localStorage not available', err) }
    }, 10000)
    return () => clearTimeout(timer)
  }, [showTooltip])

  const closeTooltip = () => {
    setShowTooltip(false)
    try { localStorage.setItem('welcome_shown', '1') } catch (err) { console.warn('localStorage not available', err) }
  }

  const handleAdd = () => {
    if (!date || !description || !amount) return;
    const payload = {
      date,
      description,
      category: tab === "expenses" ? (category || 'Default') : 'Income',
      amount: Number(amount),
      type: tab === "expenses" ? "expense" : "income",
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`

    fetch(`${apiBase}/api/transactions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((data) => {
        const raw = data.transaction
        const t: Transaction = {
          id: raw.id,
          date: raw.date,
          description: raw.description ?? '',
          category: raw.category ?? '',
          amount: Number(raw.amount),
          type: raw.type,
        }
        setTransactions((prev) => [t, ...prev])
        setDate("");
        setDescription("");
        setAmount("");
        setCategory("");
      })
      .catch((err) => console.error('Failed to create transaction', err))
  };

  const handleClear = () => {
    setDate("");
    setDescription("");
    setAmount("");
    setCategory("");
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
              amount={amount}
              category={category}
              onDateChange={setDate}
              onDescriptionChange={setDescription}
              onAmountChange={setAmount}
              onCategoryChange={setCategory}
              onAdd={handleAdd}
              onClear={handleClear}
            />
          ) : (
            <IncomeView
              transactions={transactions}
              date={date}
              description={description}
              amount={amount}
              category={category}
              onDateChange={setDate}
              onDescriptionChange={setDescription}
              onAmountChange={setAmount}
              onCategoryChange={setCategory}
              onAdd={handleAdd}
              onClear={handleClear}
            />
          )}
        </div>

        <Summary transactions={transactions} />

        {showTooltip && (
          <div className="hp-tooltip" role="dialog" aria-live="polite">
            <button className="hp-tooltip-close" onClick={closeTooltip} aria-label="Close">×</button>
            <div>Привіт! Для початку роботи внесіть свій поточний баланс рахунку!</div>
            <div style={{marginTop:8, color:'#d7e6ff'}}>Ви не можете витрачати гроші, поки їх у Вас немає :)</div>
          </div>
        )}
        </main>
      </Container>
    </div>
  );
};

export default HomePage;
