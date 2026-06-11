import { useEffect, useMemo, useState } from 'react'
import type { CategoryTotal, Transaction, TransactionType } from '../types'
import { expenseCategories, incomeCategories } from '../utils/categories'
import { readLocalTransactions } from './useTransactions'

export const monthNames = [
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

export const formatMoney = (value: number) =>
  `${value.toLocaleString('uk-UA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} грн.`

export const formatBalance = (value: number) =>
  formatMoney(value).replace(' грн.', ' UAH')

const isSameMonth = (dateValue: string, period: Date) => {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return false

  return (
    date.getFullYear() === period.getFullYear() &&
    date.getMonth() === period.getMonth()
  )
}

export const getPeriodLabel = (period: Date) =>
  `${monthNames[period.getMonth()]} ${period.getFullYear()}`

export const shiftMonth = (period: Date, direction: -1 | 1) =>
  new Date(period.getFullYear(), period.getMonth() + direction, 1)

const getLatestTransactionPeriod = (transactions: Transaction[]) => {
  const latestDate = transactions
    .map((transaction) => new Date(transaction.date))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((firstDate, secondDate) => secondDate.getTime() - firstDate.getTime())[0]

  return latestDate ? new Date(latestDate.getFullYear(), latestDate.getMonth(), 1) : null
}

const getInitialPeriod = () => {
  const latestPeriod = getLatestTransactionPeriod(readLocalTransactions())
  const now = new Date()

  return latestPeriod ?? new Date(now.getFullYear(), now.getMonth(), 1)
}

const sumTransactionsByType = (
  transactions: Transaction[],
  type: TransactionType,
) =>
  transactions
    .filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0)

const getCategoryTotals = (
  transactions: Transaction[],
  reportType: TransactionType,
  categories: string[],
): CategoryTotal[] => {
  const categoryMap = new Map<string, number>()

  for (const category of categories) {
    categoryMap.set(category, 0)
  }

  for (const transaction of transactions) {
    if (transaction.type !== reportType) continue

    const category = transaction.category || 'Інше'
    categoryMap.set(category, (categoryMap.get(category) ?? 0) + transaction.amount)
  }

  return Array.from(categoryMap.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((firstCategory, secondCategory) => secondCategory.amount - firstCategory.amount)
}

const getCategoryChartItems = (
  transactions: Transaction[],
  reportType: TransactionType,
  selectedCategory: string,
) => {
  const chartMap = new Map<string, number>()
  const selectedTransactions = transactions.filter(
    (transaction) =>
      transaction.type === reportType &&
      (transaction.category || 'Інше') === selectedCategory,
  )

  for (const transaction of selectedTransactions) {
    const label = transaction.description.trim() || selectedCategory
    chartMap.set(label, (chartMap.get(label) ?? 0) + transaction.amount)
  }

  return Array.from(chartMap.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((firstItem, secondItem) => secondItem.amount - firstItem.amount)
    .slice(0, 10)
}

export const useAnalyticsReport = (transactions: Transaction[]) => {
  const [period, setPeriod] = useState(getInitialPeriod)
  const [reportType, setReportType] = useState<TransactionType>('expense')
  const [selectedCategory, setSelectedCategory] = useState(expenseCategories[0])

  const reportCategories = reportType === 'expense' ? expenseCategories : incomeCategories

  useEffect(() => {
    const latestPeriod = getLatestTransactionPeriod(transactions)
    if (latestPeriod) setPeriod(latestPeriod)
  }, [transactions])

  const periodTransactions = useMemo(
    () => transactions.filter((transaction) => isSameMonth(transaction.date, period)),
    [period, transactions],
  )

  const periodExpenses = useMemo(
    () => sumTransactionsByType(periodTransactions, 'expense'),
    [periodTransactions],
  )

  const periodIncome = useMemo(
    () => sumTransactionsByType(periodTransactions, 'income'),
    [periodTransactions],
  )

  const categoryTotals = useMemo(
    () => getCategoryTotals(periodTransactions, reportType, reportCategories),
    [periodTransactions, reportCategories, reportType],
  )

  const topCategory = categoryTotals[0]?.name ?? reportCategories[0]

  useEffect(() => {
    const hasSelectedCategory = categoryTotals.some(
      (category) => category.name === selectedCategory,
    )

    if (!hasSelectedCategory) setSelectedCategory(topCategory)
  }, [categoryTotals, selectedCategory, topCategory])

  const chartItems = useMemo(
    () => getCategoryChartItems(periodTransactions, reportType, selectedCategory),
    [periodTransactions, reportType, selectedCategory],
  )

  const switchReportType = () => {
    const nextType = reportType === 'expense' ? 'income' : 'expense'

    setReportType(nextType)
    setSelectedCategory(
      nextType === 'expense' ? expenseCategories[0] : incomeCategories[0],
    )
  }

  return {
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
  }
}
