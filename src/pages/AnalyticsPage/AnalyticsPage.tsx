import { Link } from 'react-router-dom'
import Container from '../../container/Container'
import './AnalyticsPage.css'

const categories = [
  { name: 'Продукти', amount: '5 000.00', active: true },
  { name: 'Транспорт', amount: '2 000.00' },
  { name: 'Навчання', amount: '2 400.00' },
  { name: 'Інше', amount: '3 000.00' },
]

const chartItems = [
  { name: 'М’ясо', amount: 5000, height: 100, accent: true },
  { name: 'Овочі', amount: 4500, height: 90 },
  { name: 'Крупи', amount: 3200, height: 64 },
  { name: 'Риба', amount: 2100, height: 42, accent: true },
  { name: 'Пальне', amount: 1800, height: 36 },
  { name: 'Кава', amount: 1700, height: 34 },
  { name: 'Книги', amount: 1500, height: 30, accent: true },
  { name: 'Шоколад', amount: 800, height: 16 },
  { name: 'Таксі', amount: 500, height: 10 },
  { name: 'Зелень', amount: 300, height: 6, accent: true },
]

const formatCurrency = (value: number) => `${value.toLocaleString('uk-UA')} грн`

const AnalyticsPage = () => {
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
            <strong>55 000.00 UAH</strong>
          </div>

          <button className="analytics-confirm" type="button">
            Підтвердити
          </button>

          <div className="analytics-period" aria-label="Поточний період">
            <span>Поточний період</span>
            <div>
              <button type="button" aria-label="Попередній місяць">
                ‹
              </button>
              <strong>Листопад 2019</strong>
              <button type="button" aria-label="Наступний місяць">
                ›
              </button>
            </div>
          </div>
        </section>

        <section className="analytics-summary" aria-label="Підсумок">
          <p>
            Витрати:
            <strong className="analytics-negative">- 18 000.00 грн.</strong>
          </p>
          <span aria-hidden="true" />
          <p>
            Доходи:
            <strong className="analytics-positive">+ 45 000.00 грн.</strong>
          </p>
        </section>

        <section className="analytics-card analytics-categories">
          <div className="analytics-section-title">
            <button type="button" aria-label="Попередні витрати">
              ‹
            </button>
            <h1>Витрати</h1>
            <button type="button" aria-label="Наступні витрати">
              ›
            </button>
          </div>

          <div className="analytics-category-grid">
            {categories.map((category) => (
              <article
                className={`analytics-category ${category.active ? 'active' : ''}`}
                key={category.name}
              >
                <span>{category.amount}</span>
                <strong>{category.name}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="analytics-card analytics-chart" aria-label="Графік витрат">
          <div className="analytics-bars">
            {chartItems.map((item) => (
              <article className="analytics-bar-item" key={item.name}>
                <span>{formatCurrency(item.amount)}</span>
                <div
                  className={`analytics-bar ${item.accent ? 'accent' : ''}`}
                  style={{ height: `${item.height}%` }}
                  aria-label={`${item.name}: ${formatCurrency(item.amount)}`}
                />
                <strong>{item.name}</strong>
              </article>
            ))}
          </div>
        </section>
      </Container>
    </main>
  )
}

export default AnalyticsPage
