import { useEffect } from 'react';
import { useSavedCrawls } from '../hooks/useSavedCrawls';
import type { SavedCrawl } from '../hooks/useSavedCrawls';
import type { Crawl } from './types';

interface SavedCrawlsListProps {
  onLoadCrawl: (crawl: Crawl, city: string) => void;
  onClose: () => void;
}

export function SavedCrawlsList({ onLoadCrawl, onClose }: SavedCrawlsListProps) {
  const { savedCrawls, isLoading, error, fetchSavedCrawls, loadCrawl, deleteCrawl, duplicateCrawl } = useSavedCrawls();

  useEffect(() => {
    fetchSavedCrawls();
  }, [fetchSavedCrawls]);

  const handleLoad = async (savedCrawl: SavedCrawl) => {
    const crawl = await loadCrawl(savedCrawl.id);
    if (crawl) {
      onLoadCrawl(crawl, savedCrawl.city);
      onClose();
    }
  };

  const handleDelete = async (crawlId: string) => {
    if (window.confirm('Are you sure you want to delete this crawl?')) {
      await deleteCrawl(crawlId);
    }
  };

  const handleDuplicate = async (crawlId: string) => {
    await duplicateCrawl(crawlId);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FDF8EF',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#242116' }}>Saved Crawls</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666',
            }}
          >
            ×
          </button>
        </div>

        {isLoading && <p style={{ color: '#666' }}>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!isLoading && savedCrawls.length === 0 && (
          <p style={{ color: '#666', textAlign: 'center', padding: '40px 0' }}>
            No saved crawls yet. Generate a crawl and save it!
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {savedCrawls.map((crawl) => (
            <div
              key={crawl.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#242116', marginBottom: '4px' }}>
                    {crawl.name}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '8px' }}>
                    {crawl.city} • {crawl.budget} • {new Date(crawl.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  onClick={() => handleLoad(crawl)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#F59F00',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Load
                </button>
                <button
                  onClick={() => handleDuplicate(crawl.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#F59F00',
                    border: '2px solid #F59F00',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Duplicate
                </button>
                <button
                  onClick={() => handleDelete(crawl.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#dc3545',
                    border: '2px solid #dc3545',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
