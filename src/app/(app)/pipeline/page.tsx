import { getOpportunities } from '@/app/actions/opportunities'
import Link from 'next/link'
import { LiveRefresh } from '@/components/live-refresh'
import { OpportunityBoard, type PipelineOpportunity } from '@/components/opportunity-board'

export default async function PipelinePage() {
  const response = await getOpportunities()
  const opportunities: PipelineOpportunity[] = response.success ? response.data.map((opportunity: PipelineOpportunity) => opportunity) : []
  return <div className="w-full h-full p-6 animate-in fade-in duration-500 overflow-hidden flex flex-col"><LiveRefresh tables={['opportunities', 'companies']} /><div className="flex justify-between items-center mb-6 flex-shrink-0"><div><h1 className="text-[22px] font-semibold text-text-primary">Opportunity Pipeline</h1><p className="text-[13px] text-text-secondary mt-0.5">{opportunities.length} total opportunities</p></div><Link href="/companies" className="bg-shell border border-border-hairline px-4 py-2 rounded-pill text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors shadow-sm">All Companies</Link></div><div className="flex-1 overflow-x-auto pb-4"><OpportunityBoard opportunities={opportunities} /></div></div>
}
