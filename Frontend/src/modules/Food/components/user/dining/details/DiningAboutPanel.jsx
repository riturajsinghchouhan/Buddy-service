import { IndianRupee, MapPin } from "lucide-react"

export default function DiningAboutPanel({ costForTwo, cuisines, address, facilities, heroImage, restaurantName }) {
  return (
    <section id="dining-about" className="scroll-mt-28">
      <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4">About</h2>
      <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#141414] overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
            <IndianRupee className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="font-semibold">{costForTwo}</p>
          </div>
          <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#16A34A]" />
            <p>{cuisines}</p>
          </div>
          <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
            <p>{address}</p>
          </div>
        </div>

        {heroImage && (
          <div className="border-t border-gray-100 dark:border-gray-800">
            <div className="relative aspect-[16/10]">
              <img src={heroImage} alt={restaurantName} className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
                <p className="text-sm font-bold text-white">Featured dining spot</p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 dark:border-gray-800 p-4 sm:p-5">
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wide mb-3">
            Facilities
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {facilities.slice(0, 6).map((facility) => (
              <div
                key={facility}
                className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                {facility}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
