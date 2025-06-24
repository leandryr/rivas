'use client'

import { useState } from 'react'
import { registerExpense } from '@/actions/expenses'
import styles from './page.module.css'

export default function AccountingPage({ summary, expenses }: { summary: any, expenses: any[] }) {
  const [form, setForm] = useState({ amount: '', category: '', description: '' })
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    setMessage('')
    const result = await registerExpense(form)

    if (result.success) {
      setMessage('✅ Gasto registrado')
      setForm({ amount: '', category: '', description: '' })
      location.reload()
    } else {
      setMessage(`❌ ${result.error || 'Error al registrar'}`)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Contabilidad</h1>

      {summary && (
        <div className={styles.summary}>
          <p>💵 Ingresos totales: ${summary.totalIncome}</p>
          <p>💸 Gastos totales: ${summary.totalExpenses}</p>
          <p>📈 Ganancia neta: ${summary.netProfit}</p>
        </div>
      )}

      <h2 className={styles.formTitle}>Registrar Gasto</h2>
      <input
        className={styles.input}
        placeholder="Monto"
        type="number"
        value={form.amount}
        onChange={e => setForm({ ...form, amount: e.target.value })}
      />
      <input
        className={styles.input}
        placeholder="Categoría"
        value={form.category}
        onChange={e => setForm({ ...form, category: e.target.value })}
      />
      <input
        className={styles.input}
        placeholder="Descripción"
        value={form.description}
        onChange={e => setForm({ ...form, description: e.target.value })}
      />
      <button className={styles.button} onClick={handleSubmit}>Guardar</button>

      {message && <p className={styles.message}>{message}</p>}

      <h2 className={styles.historyTitle}>Historial de gastos</h2>
      <ul className={styles.historyList}>
        {expenses.map(e => (
          <li key={e._id} className={styles.historyItem}>
            {new Date(e.createdAt).toISOString().split('T')[0]} - ${e.amount} - {e.category} - {e.description}
          </li>
        ))}
      </ul>
    </div>
  )
}
