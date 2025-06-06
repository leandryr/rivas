// components/ui/FullScreenSpinner.tsx
export default function FullScreenSpinner() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
    </div>
  )
}
