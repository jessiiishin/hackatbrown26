import { Key, ExternalLink } from 'lucide-react';

export function SetupInstructions() {
  return (
    <div className="max-w-3xl mx-auto mb-8">
      <div className="border rounded-2xl p-6" style={{ backgroundColor: '#FFF8E1', borderColor: '#F59F00' }}>
        <div className="flex items-start gap-4">
          <div className="rounded-full p-3 text-white" style={{ backgroundColor: '#F59F00' }}>
            <Key className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2" style={{ color: '#242116' }}>
              Google Maps Setup Required
            </h3>
            <p className="mb-4" style={{ color: '#242116', opacity: 0.8 }}>
              To display the interactive map with your food crawl route, you'll need to add a Google Maps API key.
            </p>
            <div className="space-y-2 text-sm" style={{ color: '#242116', opacity: 0.7 }}>
              <p className="font-medium" style={{ color: '#242116', opacity: 1 }}>Quick Setup:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Visit the Google Cloud Console</li>
                <li>Create a project and enable the Maps JavaScript API</li>
                <li>Generate an API key with Maps JavaScript API enabled</li>
                <li>Copy the API key to <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#FFEAA7' }}>GOOGLE_MAPS_API_KEY</code> in <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#FFEAA7' }}>/components/CrawlItinerary.tsx</code></li>
              </ol>
              <a
                href="https://developers.google.com/maps/documentation/javascript/get-api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-medium mt-3"
                style={{ color: '#F59F00' }}
              >
                View Setup Guide
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}