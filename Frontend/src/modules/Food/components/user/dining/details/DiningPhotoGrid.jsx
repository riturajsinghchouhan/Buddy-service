export default function DiningPhotoGrid({ images, restaurantName }) {
  const gallery = Array.isArray(images) ? images.filter(Boolean) : []

  if (gallery.length === 0) {
    return (
      <section id="dining-photos" className="scroll-mt-28">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4">Photos</h2>
        <div className="rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#141414] py-12 text-center text-sm text-gray-500">
          Photos coming soon
        </div>
      </section>
    )
  }

  return (
    <section id="dining-photos" className="scroll-mt-28">
      <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4">Photos</h2>
      <div className="grid grid-cols-2 gap-3">
        {gallery.slice(0, 5).map((image, index) => (
          <div
            key={`${image}-${index}`}
            className={`overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900 ${
              index === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square"
            }`}
          >
            <img src={image} alt={`${restaurantName} ${index + 1}`} className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    </section>
  )
}
