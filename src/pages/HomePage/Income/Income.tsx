import type { Transaction } from '../../../types'
import './Income.css'

type TabProps = {
  active?: boolean
  onClick?: () => void
}

export const IncomeTab = ({ active = false, onClick }: TabProps) => {
  return (
    <button className={`hp-tab ${active ? 'active' : ''}`} onClick={onClick}>
      ДОХІД
    </button>
  )
}

type ViewProps = {
  transactions: Transaction[]
  date: string
  description: string
  amount: string
  category: string
  isSaving?: boolean
  onDateChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onAmountChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onAdd: () => void
  onClear: () => void
}

export const IncomeView = ({
  transactions,
  date,
  description,
  amount,
  category,
  isSaving = false,
  onDateChange,
  onDescriptionChange,
  onAmountChange,
  onCategoryChange,
  onAdd,
  onClear,
}: ViewProps) => {
  return (
    <>
      <div className="hp-entry">
        <input
          type="date"
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
        />
        <input
          className="desc"
          placeholder="Опис"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
        <input
          className="desc amount"
          inputMode="decimal"
          placeholder="Сума"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
        />
        <select
          className="desc category"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          <option value="">Категорія</option>
          <option value="Заробіток">Заробіток</option>
          <option value="Повернення">Повернення</option>
        </select>
        <div className="hp-entry-actions">
          <button className="primary" type="button" onClick={onAdd} disabled={isSaving}>
            {isSaving ? 'ЗБЕРІГАЄМО...' : 'ВВЕСТИ'}
          </button>
          <button type="button" onClick={onClear} disabled={isSaving}>
            ОЧИСТИТИ
          </button>
        </div>
      </div>

      <table className="hp-table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Опис</th>
            <th>Категорія</th>
            <th>Сума</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 && (
            <tr className="empty">
              <td colSpan={4}>Немає записів</td>
            </tr>
          )}
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.date}</td>
              <td>{transaction.description}</td>
              <td>{transaction.category}</td>
              <td className={transaction.type === 'expense' ? 'neg' : 'pos'}>
                {transaction.amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default IncomeTab
