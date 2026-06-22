const TABS = [
  { id: "offers", label: "Offers", target: "dining-offers" },
  { id: "menu", label: "Menu", target: "dining-menu" },
  { id: "photos", label: "Photos", target: "dining-photos" },
  { id: "about", label: "About", target: "dining-about" },
]

export default function DiningDetailTabs({ activeTab, onTabChange }) {
  return (
    <div className="sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl">
      <div className="mx-auto max-w-2xl px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id, tab.target)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "border-[#16A34A] bg-[#16A34A] text-white shadow-md shadow-green-600/15"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141414] text-gray-500 dark:text-gray-400 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export { TABS }
