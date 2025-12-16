const API_BASE = '/api'

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, options)
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.error?.message || `API Error: ${res.status}`)
  }
  
  const json = await res.json()
  return json.data
}

export const api = {
  health: () => fetcher<{ status: string }>('/health'),
  
  actors: {
    listPopular: (category?: string) => 
      fetch(`${API_BASE}/actors/popular${category ? `?category=${category}` : ''}`).then(r => r.json()),
    
    getCategories: () => fetcher<{ id: string; name: string; count: number }[]>('/actors/categories'),
    
    get: (id: string) => fetcher<any>(`/actors/${id}`),
    
    getInputSchema: (id: string) => fetcher<any>(`/actors/${id}/input-schema`),
    
    run: (id: string, input: any) => 
      fetcher<any>(`/actors/${id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      }),
      
    getRun: (actorId: string, runId: string) => 
      fetcher<any>(`/actors/${actorId}/runs/${runId}`),
      
    getRunLog: (actorId: string, runId: string) =>
      fetcher<{ log: string }>(`/actors/${actorId}/runs/${runId}/log`),
      
    abortRun: (actorId: string, runId: string) =>
      fetcher<any>(`/actors/${actorId}/runs/${runId}/abort`, { method: 'POST' }),
  },
  
  datasets: {
    list: (limit = 20, offset = 0) => 
      fetcher<{ items: any[]; total: number }>(`/datasets?limit=${limit}&offset=${offset}`),
      
    get: (id: string) => fetcher<any>(`/datasets/${id}`),
    
    getItems: (id: string, limit = 50, offset = 0) => 
      fetcher<{ items: any[]; total: number }>(`/datasets/${id}/items?limit=${limit}&offset=${offset}`),
  },
  
  runs: {
    list: (limit = 20, offset = 0) => 
      fetcher<{ items: any[]; total: number }>(`/runs?limit=${limit}&offset=${offset}`),
    
    get: (runId: string) => fetcher<any>(`/runs/${runId}`),
    
    getLog: (runId: string) => fetcher<{ log: string }>(`/runs/${runId}/log`),
    
    abort: (runId: string) => fetcher<any>(`/runs/${runId}/abort`, { method: 'POST' }),
    
    resurrect: (runId: string) => fetcher<any>(`/runs/${runId}/resurrect`, { method: 'POST' }),
  },
  
  storage: {
    list: (limit = 20) => 
      fetcher<{ items: any[]; total: number }>(`/storage?limit=${limit}`),
      
    get: (id: string) => fetcher<any>(`/storage/${id}`),
    
    getKeys: (id: string, limit = 100, exclusiveStartKey?: string) => 
      fetcher<{ items: any[]; nextExclusiveStartKey?: string }>(
        `/storage/${id}/keys?limit=${limit}${exclusiveStartKey ? `&exclusiveStartKey=${exclusiveStartKey}` : ''}`
      ),
      
    getRecord: (id: string, key: string) => 
      fetcher<{ key: string; value: any }>(`/storage/${id}/records/${key}`),
      
    setRecord: (id: string, key: string, value: any) =>
      fetcher<any>(`/storage/${id}/records/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, contentType: 'application/json' })
      }),
      
    deleteRecord: (id: string, key: string) =>
      fetcher<any>(`/storage/${id}/records/${key}`, { method: 'DELETE' }),
  }
}
