import { getAlumnus } from '@/app/actions/alumni'
import { InteractionLog } from '@/components/interactions/interaction-log'
import { Users, Building2, GraduationCap, Mail } from 'lucide-react'
import Link from 'next/link'

export default async function AlumniPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const res = await getAlumnus(id)
  
  if (!res.success) {
    return <div className="p-8 text-center text-red-500">Error loading alumnus: {res.error}</div>
  }

  const alumnus = res.data

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
        <Link href="/alumni" className="hover:text-blue-500 transition-colors">Alumni</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{alumnus.first_name} {alumnus.last_name}</span>
      </div>

      <div className="bg-white p-8 rounded-3xl modern-shadow border border-gray-100 flex items-start space-x-6">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center flex-shrink-0">
          <Users className="w-10 h-10" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-gray-800">{alumnus.first_name} {alumnus.last_name}</h1>
          
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mt-4 text-gray-600">
            {alumnus.companies?.name && (
              <div className="flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                {alumnus.companies.name}
              </div>
            )}
            {alumnus.graduation_year && (
              <div className="flex items-center">
                <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                Class of {alumnus.graduation_year}
              </div>
            )}
            {alumnus.email && (
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <a href={`mailto:${alumnus.email}`} className="text-blue-500 hover:underline">
                  {alumnus.email}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <InteractionLog interactions={alumnus.interactions || []} alumniId={alumnus.id} />

    </div>
  )
}
