import type { Transaction } from '../../../types'
import './Summary.css'

type Props = {
  transactions: Transaction[]
}

const monthNames = [
  'Січень',
  'Лютий',
  'Березень',
  'Квітень',
  'Травень',
  'Червень',
  'Липень',
  'Серпень',
  'Вересень',
  'Жовтень',
  'Листопад',
  'Грудень',
]

const getMonthlyTotals = (transactions: Transaction[]) => {
  const totals = new Map<number, number>()

  for (const transaction of transactions) {
    const month = new Date(transaction.date).getMonth()
    const currentTotal = totals.get(month) ?? 0
    const amount =
      transaction.type === 'income' ? transaction.amount : -transaction.amount

    totals.set(month, currentTotal + amount)
  }

  return totals
}

const Summary = ({ transactions }: Props) => {
  const totals = getMonthlyTotals(transactions)
  const incomeTotal = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0)
  const expenseTotal = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0)

  return (
    <aside className="hp-right" aria-label="Зведення">
      <h2 className="summary-title">ЗВЕДЕННЯ</h2>
      <div className="summary-box">
        <div className="summary-row summary-count">
          Кількість: <span>{transactions.length}</span>
        </div>
        <div className="summary-row">
          Доходи: <span>{incomeTotal.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          Витрати: <span>{expenseTotal.toFixed(2)}</span>
        </div>

        <div className="summary-months">
          {Array.from(totals.entries())
            .sort((firstTotal, secondTotal) => secondTotal[0] - firstTotal[0])
            .map(([month, value]) => (
              <div className="month-row" key={month}>
                <div className="month">{monthNames[month]}</div>
                <div className={`month-amount ${value < 0 ? 'neg' : 'pos'}`}>
                  {value.toFixed(2)}
                </div>
              </div>
            ))}
        </div>
      </div>
    </aside>
  )
}

export default Summary
