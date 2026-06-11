import { Link } from 'react-router-dom'
import Container from '../../container/Container'
import {
  formatBalance,
  formatMoney,
  getPeriodLabel,
  shiftMonth,
  useAnalyticsReport,
} from '../../hooks/useAnalyticsReport'
import { useAuth } from '../../hooks/useAuth'
import { useTransactions } from '../../hooks/useTransactions'
import './AnalyticsPage.css'

const AnalyticsPage = () => {
  const { token } = useAuth()
  const { balance, isRefreshing, loadTransactions, transactions } =
    useTransactions(token)
  const {
    categoryTotals,
    chartItems,
    period,
    periodExpenses,
    periodIncome,
    reportType,
    selectedCategory,
    setPeriod,
    setSelectedCategory,
    switchReportType,
  } = useAnalyticsReport(transactions)
  const maxChartAmount = Math.max(...chartItems.map((item) => item.amount), 0)

  return (
    <main className="analytics-page">
      <Container className="analytics-container">
        <section className="analytics-toolbar" aria-label="Панель аналітики">
          <Link className="analytics-back" to="/home">
            <span aria-hidden="true">←</span>
            Повернутись на головну
          </Link>

          <div className="analytics-balance">
            <span>Баланс:</span>
            <strong>{formatBalance(balance)}</strong>
          </div>

          <button
            className="analytics-confirm"
            type="button"
            onClick={loadTransactions}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Оновлення...' : 'Підтвердити'}
          </button>

          <div className="analytics-period" aria-label="Поточний період">
            <span>Поточний період</span>
            <div>
              <button
                type="button"
                aria-label="Попередній місяць"
                onClick={() => setPeriod((currentPeriod) => shiftMonth(currentPeriod, -1))}
              >
                ‹
              </button>
              <strong>{getPeriodLabel(period)}</strong>
              <button
                type="button"
                aria-label="Наступний місяць"
                onClick={() => setPeriod((currentPeriod) => shiftMonth(currentPeriod, 1))}
              >
                ›
              </button>
            </div>
          </div>
        </section>

        <section className="analytics-summary" aria-label="Підсумок">
          <p>
            Витрати:
            <strong className="analytics-negative">- {formatMoney(periodExpenses)}</strong>
          </p>
          <span aria-hidden="true" />
          <p>
            Доходи:
            <strong className="analytics-positive">+ {formatMoney(periodIncome)}</strong>
          </p>
        </section>

        <section className="analytics-card analytics-categories">
          <div className="analytics-section-title">
            <button type="button" aria-label="Перемкнути тип звіту" onClick={switchReportType}>
              ‹
            </button>
            <h1>{reportType === 'expense' ? 'Витрати' : 'Доходи'}</h1>
            <button type="button" aria-label="Перемкнути тип звіту" onClick={switchReportType}>
              ›
            </button>
          </div>

          <div className="analytics-category-grid">
            {categoryTotals.map((category) => (
              <button
                className={`analytics-category ${
                  selectedCategory === category.name ? 'active' : ''
                }`}
                type="button"
                onClick={() => setSelectedCategory(category.name)}
                key={category.name}
              >
                <span>{formatMoney(category.amount)}</span>
                <strong>{category.name}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="analytics-card analytics-chart" aria-label="Графік категорії">
          <h2 className="analytics-chart-title">{selectedCategory}</h2>

          {chartItems.length > 0 ? (
            <div className="analytics-bars">
              {chartItems.map((item, index) => (
                <article className="analytics-bar-item" key={item.name}>
                  <span>{formatMoney(item.amount)}</span>
                  <div
                    className={`analytics-bar ${index % 3 === 0 ? 'accent' : ''}`}
                    style={{
                      height: `${Math.max((item.amount / maxChartAmount) * 100, 5)}%`,
                    }}
                    aria-label={`${item.name}: ${formatMoney(item.amount)}`}
                  />
                  <strong>{item.name}</strong>
                </article>
              ))}
            </div>
          ) : (
            <p className="analytics-empty">
              Немає записів у цій категорії за обраний період.
            </p>
          )}
        </section>
      </Container>
    </main>
  )
}

export default AnalyticsPage
