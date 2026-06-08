import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../../container/Container'
import { useAuth } from '../../hooks/useAuth'
import type { Transaction } from '../../types'
import { apiBase } from '../../utils/api'
import ExpensesTab, { CostsView } from './Costs/Costs'
import './HomePage.css'
import IncomeTab, { IncomeView } from './Income/Income'
import Summary from './Summary/Summary'

type Props = {
  initialTransactions?: Transaction[]
}

type TransactionType = 'expense' | 'income'

const localTransactionsKey = 'investiq_transactions'

const normalizeTransaction = (value: unknown): Transaction => {
  const item = value as Partial<Transaction> & { amount?: unknown }

  return {
    id: String(item.id ?? crypto.randomUUID()),
    date: String(item.date ?? ''),
    description: String(item.description ?? ''),
    category: String(item.category ?? ''),
    amount: Number(item.amount ?? 0),
    type: item.type === 'income' ? 'income' : 'expense',
  }
}

const readLocalTransactions = (): Transaction[] => {
  try {
    const storedValue = localStorage.getItem(localTransactionsKey)
    if (!storedValue) return []

    const parsedValue = JSON.parse(storedValue) as unknown[]
    return parsedValue.map(normalizeTransaction)
  } catch {
    return []
  }
}

const saveLocalTransactions = (transactions: Transaction[]) => {
  try {
    localStorage.setItem(localTransactionsKey, JSON.stringify(transactions))
  } catch {
    return
  }
}

const createLocalTransaction = (
  type: TransactionType,
  date: string,
  description: string,
  amount: number,
  category: string,
): Transaction => ({
  id: crypto.randomUUID(),
  date,
  description,
  category: type === 'expense' ? category || 'Інше' : category || 'Дохід',
  amount,
  type,
})

const HomePage = ({ initialTransactions = [] }: Props) => {
  const [tab, setTab] = useState<TransactionType>('expense')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>(
    initialTransactions.length > 0 ? initialTransactions : readLocalTransactions,
  )
  const [formMessage, setFormMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const { token } = useAuth()
  const [showTooltip, setShowTooltip] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('welcome_shown')
    } catch {
      return false
    }
  })

  useEffect(() => {
    const load = async () => {
      try {
        const headers: HeadersInit | undefined = token
          ? { Authorization: `Bearer ${token}` }
          : undefined
        const res = await fetch(`${apiBase}/api/transactions`, { headers })
        if (!res.ok) return

        const data = await res.json()
        const nextTransactions = (data.transactions ?? []).map(normalizeTransaction)
        setTransactions(nextTransactions)
        saveLocalTransactions(nextTransactions)
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
      try {
        localStorage.setItem('welcome_shown', '1')
      } catch (err) {
        console.warn('localStorage not available', err)
      }
    }, 10000)

    return () => clearTimeout(timer)
  }, [showTooltip])

  const filteredTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.type === tab),
    [tab, transactions],
  )

  const balance = useMemo(
    () =>
      transactions.reduce(
        (total, transaction) =>
          transaction.type === 'income'
            ? total + transaction.amount
            : total - transaction.amount,
        0,
      ),
    [transactions],
  )

  const closeTooltip = () => {
    setShowTooltip(false)
    try {
      localStorage.setItem('welcome_shown', '1')
    } catch (err) {
      console.warn('localStorage not available', err)
    }
  }

  const resetForm = () => {
    setDate('')
    setDescription('')
    setAmount('')
    setCategory('')
    setFormMessage('')
  }

  const persistTransaction = (transaction: Transaction) => {
    setTransactions((currentTransactions) => {
      const nextTransactions = [transaction, ...currentTransactions]
      saveLocalTransactions(nextTransactions)
      return nextTransactions
    })
  }

  const handleAdd = async () => {
    const trimmedDescription = description.trim()
    const normalizedAmount = Number(amount.replace(',', '.'))

    if (!date || !trimmedDescription || !amount) {
      setFormMessage('Заповніть дату, опис і суму.')
      return
    }

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      setFormMessage('Введіть коректну суму більше нуля.')
      return
    }

    const transactionType: TransactionType = tab
    const localTransaction = createLocalTransaction(
      transactionType,
      date,
      trimmedDescription,
      normalizedAmount,
      category,
    )

    setIsSaving(true)
    setFormMessage('')

    try {
      if (!token) {
        persistTransaction(localTransaction)
        resetForm()
        return
      }

      const response = await fetch(`${apiBase}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(localTransaction),
      })

      if (!response.ok) {
        throw new Error('Failed to create transaction')
      }

      const data = await response.json()
      persistTransaction(normalizeTransaction(data.transaction))
      resetForm()
    } catch (err) {
      console.error('Failed to create transaction', err)
      persistTransaction(localTransaction)
      resetForm()
      setFormMessage('Запис збережено локально. API зараз недоступний.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="home-page">
      <Container>
        <div className="hp-balance">
          <div className="label">Баланс:</div>
          <div className="amount">{balance.toFixed(2)} UAH</div>
        </div>
        <div className="hp-analytics-link-wrap">
          <Link className="hp-analytics-link" to="/analytics">
            Перейти до аналітики
          </Link>
        </div>

        <main className="hp-card">
          <div className="hp-left">
            <div className="hp-tabs">
              <ExpensesTab
                active={tab === 'expense'}
                onClick={() => setTab('expense')}
              />
              <IncomeTab
                active={tab === 'income'}
                onClick={() => setTab('income')}
              />
            </div>

            {formMessage && <p className="hp-form-message">{formMessage}</p>}

            {tab === 'expense' ? (
              <CostsView
                transactions={filteredTransactions}
                date={date}
                description={description}
                amount={amount}
                category={category}
                isSaving={isSaving}
                onDateChange={setDate}
                onDescriptionChange={setDescription}
                onAmountChange={setAmount}
                onCategoryChange={setCategory}
                onAdd={handleAdd}
                onClear={resetForm}
              />
            ) : (
              <IncomeView
                transactions={filteredTransactions}
                date={date}
                description={description}
                amount={amount}
                category={category}
                isSaving={isSaving}
                onDateChange={setDate}
                onDescriptionChange={setDescription}
                onAmountChange={setAmount}
                onCategoryChange={setCategory}
                onAdd={handleAdd}
                onClear={resetForm}
              />
            )}
          </div>

          <Summary transactions={transactions} />

          {showTooltip && (
            <div className="hp-tooltip" role="dialog" aria-live="polite">
              <button
                className="hp-tooltip-close"
                onClick={closeTooltip}
                aria-label="Close"
              >
                ×
              </button>
              <div>Привіт! Для початку роботи внесіть свій поточний баланс рахунку.</div>
              <div style={{ marginTop: 8, color: '#d7e6ff' }}>
                Ви не можете витрачати гроші, поки їх у вас немає :)
              </div>
            </div>
          )}
        </main>
      </Container>
    </div>
  )
}

export default HomePage
