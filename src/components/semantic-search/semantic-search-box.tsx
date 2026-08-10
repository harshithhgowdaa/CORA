'use client'

import { useState } from 'react'
import { semanticSearch } from '@/app/actions/semantic-search'
import { Sparkles, Users } from 'lucide-react'
import Link from 'next/link'

export function SemanticSearchBox() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)
    try {
      const res = await semanticSearch(query)
      if (res.success) {
        setResults(res.data)
      } else {
        setResults([])
      }
    } catch (err) {
      console.error(err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full relative">
      <form onSubmit={handleSearch} className="bg-gray-50/80 rounded-2xl p-2 border border-gray-100 flex items-center focus-within:ring-2 ring-blue-500/20 transition-all relative z-20 shadow-sm">
        <Sparkles className="w-5 h-5 text-blue-500 ml-2" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try: 'AI alumni in Bengaluru who'd mentor'" 
          className="bg-transparent border-none outline-none flex-1 px-3 text-gray-700"
        />
        <button 
          type="submit" 
          disabled={loading || !query.trim()}
          className="px-4 py-2 rounded-xl bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50"
        >
          {loading ? 'Thinking...' : 'Ask AI'}
        </button>
      </form>

      {searched && (
        <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <h4 className="text-sm font-semibold text-gray-700">AI Results</h4>
            <button onClick={() => { setSearched(false); setQuery(''); setResults([]) }} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500 flex items-center justify-center space-x-2">
                <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                <span>Analyzing request...</span>
              </div>
            ) : results.length > 0 ? (
              results.map((r, i) => (
                <Link key={i} href={`/alumni/${r.id}`}>
                  <div className="p-3 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-blue-100 flex items-center justify-between group">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800 group-hover:text-blue-700">{r.first_name} {r.last_name}</div>
                        <div className="text-xs text-gray-500">{(r.similarity * 100).toFixed(1)}% match</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">No matches found for this query.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
