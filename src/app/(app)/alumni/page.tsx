import { getAlumni } from '@/app/actions/alumni'
import Link from 'next/link'
import { Users, Plus } from 'lucide-react'

export default async function AlumniPage() {
  const response = await getAlumni()
  const alumni = response.success ? response.data : []

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl modern-shadow border border-gray-100">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Alumni</h1>
          <p className="text-gray-500 text-sm mt-1">Manage alumni network</p>
        </div>
        <button className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-2xl transition-colors shadow-md">
          <Plus className="w-4 h-4" />
          <span>Add Alumnus</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alumni.map((alumnus) => (
          <Link key={alumnus.id} href={`/alumni/${alumnus.id}`}>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-blue-200 transition-colors cursor-pointer group modern-shadow">
              <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {alumnus.first_name} {alumnus.last_name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {alumnus.companies?.name ? `Works at ${alumnus.companies.name}` : 'Company not specified'}
              </p>
              {alumnus.graduation_year && (
                <p className="text-xs text-gray-400 mt-2 border-t border-gray-100 pt-2">Class of {alumnus.graduation_year}</p>
              )}
            </div>
          </Link>
        ))}
        {alumni.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-500 bg-white rounded-3xl border border-dashed border-gray-300">
            No alumni found. Start building your network!
          </div>
        )}
      </div>
    </div>
  )
}
