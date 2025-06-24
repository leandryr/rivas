import * as React from 'react'
import {
  Dialog as HeadlessDialog,
  Transition
} from '@headlessui/react'
import { X } from 'lucide-react'
import { Fragment, isValidElement, cloneElement, ReactElement } from 'react'

interface DialogContextValue {
  isOpen: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

export const Dialog = ({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const setOpen = (value: boolean) => {
    if (isControlled) {
      onOpenChange?.(value)
    } else {
      setInternalOpen(value)
    }
  }

  return (
    <DialogContext.Provider value={{ isOpen, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

const useDialog = () => {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error('Dialog components must be used within <Dialog>')
  return context
}

export const DialogTrigger = ({
  children,
  asChild = false,
}: {
  children: React.ReactNode
  asChild?: boolean
}) => {
  const { setOpen } = useDialog()

  if (asChild && isValidElement(children)) {
    const el = children as ReactElement<any>
    return cloneElement(el, {
      ...el.props,
      onClick: (e: React.MouseEvent) => {
        el.props?.onClick?.(e)
        setOpen(true)
      },
    })
  }

  return (
    <span onClick={() => setOpen(true)} className="cursor-pointer">
      {children}
    </span>
  )
}

// Aquí está el cambio que pediste en DialogContent:
export const DialogContent = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => {
  const { isOpen, setOpen } = useDialog()

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <HeadlessDialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <HeadlessDialog.Panel
                className={`w-full max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all ${className}`}
              >
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {children}
              </HeadlessDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HeadlessDialog>
    </Transition>
  )
}
