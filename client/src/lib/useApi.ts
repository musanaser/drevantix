import { useCallback, useEffect, useState } from 'react'
import { api } from './api'

/** Fetches `path` whenever it or any of `deps` changes. */
export function useApi<T>(path: string | null, query?: Record<string, string | number | undefined | null>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(!!path)
  const key = JSON.stringify(query ?? {})

  const load = useCallback(async () => {
    if (!path) return
    setLoading(true)
    try {
      setData(await api<T>(path, { query: JSON.parse(key) }))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, key, ...deps])

  useEffect(() => {
    load()
  }, [load])

  return { data, error, loading, reload: load, setData }
}
