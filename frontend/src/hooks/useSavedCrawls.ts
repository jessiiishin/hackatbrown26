import { useState, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import type { Crawl } from '../components/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface SavedCrawl {
  id: string;
  name: string;
  city: string;
  budget: string;
  duration: number;
  dietary_preferences: string[];
  cuisines: string[];
  crawl_data: Crawl;
  created_at: string;
  updated_at: string;
}

export function useSavedCrawls() {
  const { user } = useUser();
  const [savedCrawls, setSavedCrawls] = useState<SavedCrawl[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedCrawls = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/crawls?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch crawls');
      const data = await response.json();
      setSavedCrawls(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch crawls');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const saveCrawl = useCallback(async (crawl: Crawl, city: string, name?: string): Promise<SavedCrawl | null> => {
    if (!user?.id) {
      setError('You must be signed in to save crawls');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/crawls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: name || `${city} Crawl`,
          city,
          budget: crawl.budgetTier,
          duration: crawl.totalTime,
          crawlData: crawl,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to save crawl');
      const savedCrawl = await response.json();
      setSavedCrawls(prev => [savedCrawl, ...prev]);
      return savedCrawl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save crawl');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadCrawl = useCallback(async (crawlId: string): Promise<Crawl | null> => {
    if (!user?.id) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/crawls/${crawlId}?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to load crawl');
      const data = await response.json();
      return data.crawl_data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load crawl');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const updateCrawl = useCallback(async (crawlId: string, crawl: Crawl, name?: string): Promise<SavedCrawl | null> => {
    if (!user?.id) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/crawls/${crawlId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name,
          crawlData: crawl,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update crawl');
      const updated = await response.json();
      setSavedCrawls(prev => prev.map(c => c.id === crawlId ? updated : c));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update crawl');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const deleteCrawl = useCallback(async (crawlId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/crawls/${crawlId}?userId=${user.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete crawl');
      setSavedCrawls(prev => prev.filter(c => c.id !== crawlId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete crawl');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const duplicateCrawl = useCallback(async (crawlId: string): Promise<SavedCrawl | null> => {
    if (!user?.id) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/crawls/${crawlId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      
      if (!response.ok) throw new Error('Failed to duplicate crawl');
      const duplicated = await response.json();
      setSavedCrawls(prev => [duplicated, ...prev]);
      return duplicated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate crawl');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    savedCrawls,
    isLoading,
    error,
    fetchSavedCrawls,
    saveCrawl,
    loadCrawl,
    updateCrawl,
    deleteCrawl,
    duplicateCrawl,
  };
}
