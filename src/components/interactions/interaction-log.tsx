import { Calendar, MessageSquare, Phone, Mail, User } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

type Interaction = {
  id: string
  type: string
  notes: string
  date: string
  author?: { full_name: string }
}

export function InteractionLog({ 
  interactions, 
  companyId, 
  alumniId 
}: { 
  interactions: Interaction[]
  companyId?: string
  alumniId?: string 
}) {

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'email': return <Mail className="w-4 h-4 text-blue-500" />
      case 'call': return <Phone className="w-4 h-4 text-emerald-500" />
      case 'meeting': return <Calendar className="w-4 h-4 text-purple-500" />
      case 'event': return <User className="w-4 h-4 text-[#F59E0B]" />
      default: return <MessageSquare className="w-4 h-4 text-text-muted" />
    }
  }

  // Sort interactions latest first
  const sortedInteractions = [...interactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="bg-shell p-6 rounded-card border border-border-hairline shadow-sm">
      <h3 className="text-[16px] font-semibold mb-6 text-text-primary">Interaction History</h3>
      
      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
        {sortedInteractions.map(interaction => (
          <div key={interaction.id} className="flex space-x-4">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-surface border border-border-hairline flex items-center justify-center shadow-sm">
                {getIcon(interaction.type)}
              </div>
            </div>
            <div className="flex-1 bg-surface rounded-[16px] p-4 border border-border-hairline hover:bg-subtle/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-text-primary text-[14px] capitalize flex items-center">
                  {interaction.type}
                  <span className="mx-2 text-border-hairline">•</span>
                  <span className="text-[12px] text-text-secondary font-normal flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {interaction.author?.full_name || 'Unknown User'}
                  </span>
                </span>
                <span className="text-[11px] text-text-muted font-medium bg-shell px-2 py-0.5 rounded-pill border border-border-hairline">
                  {format(new Date(interaction.date), 'MMM d, yyyy')}
                </span>
              </div>
              <p className="text-[13px] text-text-secondary whitespace-pre-wrap">{interaction.notes}</p>
            </div>
          </div>
        ))}
        {sortedInteractions.length === 0 && (
          <p className="text-[13px] text-text-muted italic text-center py-8">No interactions logged yet.</p>
        )}
      </div>
    </div>
  )
}
