'use server'

import { createClient } from '@/lib/supabase/server'
import { withActionHandler } from '@/lib/actions-wrapper'
import { pipeline, env } from '@xenova/transformers'

env.allowLocalModels = false;

class PipelineSingleton {
  static task: any = 'feature-extraction';
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance: any = null;

  static async getInstance(progress_callback?: any) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

export const semanticSearch = async (queryText: string) => {
  return withActionHandler(async () => {
    const supabase = await createClient()

    // 1. Generate embedding for the query
    const extractor = await PipelineSingleton.getInstance()
    const output = await extractor(queryText, { pooling: 'mean', normalize: true })
    const embedding = Array.from(output.data)

    // 2. Perform similarity search via RPC
    const { data: alumni, error } = await supabase.rpc('match_alumni', {
      query_embedding: embedding,
      match_threshold: 0.3, // Example threshold
      match_count: 5,
    })

    if (error) throw new Error(error.message)
    
    // We can fetch more details for the alumni if needed, or return directly if RPC returns what we need
    return alumni || []
  })
}
