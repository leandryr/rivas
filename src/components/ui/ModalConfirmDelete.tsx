'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function ModalConfirmDelete({ open, onClose, onConfirm }: Props) {
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleDelete = async () => {
    if (input.toLowerCase() !== 'delete') return
    setSubmitting(true)
    await onConfirm()
    setSubmitting(false)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center px-4">
        <Dialog.Panel className="w-full max-w-md bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl space-y-5 border border-gray-200 dark:border-gray-700">
          <Dialog.Title className="text-lg font-semibold text-gray-800 dark:text-white">
            Remove Payment Method?
          </Dialog.Title>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            This action is permanent. Please type <span className="font-medium text-blue-600">delete</span> to confirm.
          </p>

          <input
            type="text"
            placeholder="Type 'delete' to confirm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border px-3 py-2 rounded text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={input.toLowerCase() !== 'delete' || submitting}
              onClick={handleDelete}
            >
              {submitting ? 'Removing...' : 'Yes, Remove'}
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
