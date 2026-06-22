import { Loader2 } from "lucide-react"

export default function DiningDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0a0a0a]">
      <div className="h-[42vh] min-h-[280px] animate-pulse bg-gray-200 dark:bg-gray-900" />
      <div className="mx-4 -mt-12 rounded-[24px] border border-gray-100 bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-[#141414] space-y-3 animate-pulse">
        <div className="h-7 w-3/4 rounded-xl bg-gray-100 dark:bg-gray-800" />
        <div className="h-4 w-full rounded-full bg-gray-100 dark:bg-gray-800" />
        <div className="h-8 w-40 rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-20 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
        <div className="h-40 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-56 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-[#16A34A]" />
      </div>
    </div>
  )
}
