import { getSummaryAndExpenses } from '@/actions/expenses'
import AccountingPage from './AccountingPage'

export default async function Page() {
  const { summary, expenses } = await getSummaryAndExpenses()

  return <AccountingPage summary={summary} expenses={expenses} />
}
