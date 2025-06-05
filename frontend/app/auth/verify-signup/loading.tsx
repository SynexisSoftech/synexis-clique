export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-[#6F4E37] border-r-[#6F4E37] border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600 text-sm">Loading verification...</p>
      </div>
    </div>
  )
}
