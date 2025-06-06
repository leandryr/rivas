// components/Spinner.tsx
export default function Spinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div
        className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"
        role="status"
      />
      <p className="text-gray-500 text-sm mt-2">{label}</p>
    </div>
  )
}
