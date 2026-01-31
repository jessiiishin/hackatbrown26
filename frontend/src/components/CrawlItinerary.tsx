import {
  MapPin,
  Clock,
  DollarSign,
  Utensils,
  ArrowLeft,
  Download,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CrawlMap, loadGoogleMapsScript } from "./CrawlMap";
import type { Crawl } from "../App";

interface Props {
  crawl: Crawl;
  onReset: () => void;
}

const GOOGLE_MAPS_API_KEY =
  "AIzaSyDPxDaN6zphc0lhM3UcmpNQwP62m6s2IMQ";

export function CrawlItinerary({ crawl, onReset }: Props) {
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
      .then(() => {
        setMapsLoaded(true);
        setMapError(null);
      })
      .catch((err) => {
        console.error("Error loading Google Maps:", err);
        setMapError(err.message);
      });
  }, []);

  const handleDownload = () => {
    const content = `
MY FOOD CRAWL ITINERARY
=====================

Total Stops: ${crawl.stops.length}
Total Budget: $${crawl.totalCost}
Total Time: ${Math.floor(crawl.totalTime / 60)}h ${crawl.totalTime % 60}m

STOPS:
${crawl.stops
  .map(
    (stop, index) => `
${index + 1}. ${stop.name} ${stop.type === "landmark" ? "📍" : "🍽️"}
   ${stop.description}
   Address: ${stop.address}
   Duration: ${stop.duration} minutes
   ${stop.type === "restaurant" ? `Price: ${stop.priceTier ?? '$' + stop.price}` : "Free Entry"}
   ${stop.cuisine ? `Cuisine: ${stop.cuisine}` : ""}
`,
  )
  .join("\n")}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "food-crawl-itinerary.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div
        className="bg-white rounded-2xl p-6 mb-6 border border-gray-100"
        style={{
          boxShadow: "0 10px 30px rgba(245, 159, 0, 0.15)",
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <button
            onClick={onReset}
            className="flex items-center gap-2 transition-colors"
            style={{ color: "#242116", opacity: 0.6 }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.opacity = "1")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.opacity = "0.6")
            }
          >
            <ArrowLeft className="w-5 h-5" />
            New Search
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            style={{ backgroundColor: "#f3f4f6" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#e5e7eb")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#f3f4f6")
            }
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>

        <div className="text-center mb-6">
          <h2
            className="text-3xl font-bold mb-2"
            style={{ color: "#242116" }}
          >
            Your Curated Food Crawl
          </h2>
          <p style={{ color: "#242116", opacity: 0.6 }}>
            {crawl.stops.length} amazing stops await you!
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div
            className="rounded-xl p-4 text-center"
            style={{
              background:
                "linear-gradient(to bottom right, #FEF3E2, #FDE8C9)",
            }}
          >
            <MapPin
              className="w-6 h-6 mx-auto mb-2"
              style={{ color: "#F59F00" }}
            />
            <div
              className="text-2xl font-bold"
              style={{ color: "#242116" }}
            >
              {crawl.stops.length}
            </div>
            <div
              className="text-sm"
              style={{ color: "#242116", opacity: 0.6 }}
            >
              Stops
            </div>
          </div>
          <div
            className="rounded-xl p-4 text-center"
            style={{
              background:
                "linear-gradient(to bottom right, #F4F9E5, #E8F2D1)",
            }}
          >
            <DollarSign
              className="w-6 h-6 mx-auto mb-2"
              style={{ color: "#D1E892" }}
            />
            <div
              className="text-2xl font-bold"
              style={{ color: "#242116" }}
            >
              ${crawl.totalCost}
            </div>
            <div
              className="text-sm"
              style={{ color: "#242116", opacity: 0.6 }}
            >
              Total Cost
            </div>
          </div>
          <div
            className="rounded-xl p-4 text-center"
            style={{
              background:
                "linear-gradient(to bottom right, #FEF3E2, #E8F2D1)",
            }}
          >
            <Clock
              className="w-6 h-6 mx-auto mb-2"
              style={{ color: "#D1E892" }}
            />
            <div
              className="text-2xl font-bold"
              style={{ color: "#242116" }}
            >
              {Math.floor(crawl.totalTime / 60)}h{" "}
              {crawl.totalTime % 60}m
            </div>
            <div
              className="text-sm"
              style={{ color: "#242116", opacity: 0.6 }}
            >
              Duration
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div
        className="bg-white rounded-2xl p-6 mb-6 border border-gray-100"
        style={{
          boxShadow: "0 10px 30px rgba(245, 159, 0, 0.15)",
        }}
      >
        <div className="mb-4">
          <h3
            className="text-2xl font-bold mb-2"
            style={{ color: "#242116" }}
          >
            Your Route
          </h3>
          <p style={{ color: "#242116", opacity: 0.6 }}>
            Follow the numbered pins to navigate your food crawl
          </p>
        </div>
        {mapsLoaded ? (
          <CrawlMap stops={crawl.stops} />
        ) : mapError ? (
          <div className="w-full h-[500px] bg-red-50 rounded-2xl flex items-center justify-center border-2 border-red-200">
            <div className="text-center px-8">
              <div className="text-5xl mb-4">🗺️</div>
              <p className="text-red-700 font-semibold mb-2">
                Map Load Error
              </p>
              <p className="text-sm text-red-600 mb-4">
                {mapError}
              </p>
              <div className="bg-white rounded-lg p-4 text-left text-sm">
                <p
                  className="font-medium mb-2"
                  style={{ color: "#242116" }}
                >
                  To fix this:
                </p>
                <ol
                  className="list-decimal list-inside space-y-1"
                  style={{ color: "#242116", opacity: 0.6 }}
                >
                  <li>
                    Get a Google Maps API key from Google Cloud
                    Console
                  </li>
                  <li>Enable Maps JavaScript API</li>
                  <li>
                    Replace{" "}
                    <code className="bg-gray-100 px-2 py-0.5 rounded">
                      YOUR_GOOGLE_MAPS_API_KEY_HERE
                    </code>{" "}
                    in CrawlItinerary.tsx
                  </li>
                </ol>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-[500px] bg-gray-100 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <div
                className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 mb-4"
                style={{ borderTopColor: "#F59F00" }}
              ></div>
              <p style={{ color: "#242116", opacity: 0.6 }}>
                Loading map...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stop Details List */}
      <div className="space-y-4">
        {crawl.stops.map((stop, index) => (
          <div
            key={stop.id}
            className="bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow overflow-hidden"
            style={{
              boxShadow: "0 6px 20px rgba(245, 159, 0, 0.06)",
            }}
          >
            <div className="flex gap-6 p-6">
              {/* Image */}
              <div className="flex-shrink-0">
                <img
                  src={stop.image}
                  alt={stop.name}
                  className="w-48 h-48 object-cover rounded-xl"
                  style={{
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {/* Number Badge */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{
                        backgroundColor:
                          stop.type === "restaurant"
                            ? "#F59F00"
                            : "#9B59B6",
                        boxShadow:
                          stop.type === "restaurant"
                            ? "0 4px 12px rgba(245, 159, 0, 0.3)"
                            : "0 4px 12px rgba(155, 89, 182, 0.3)",
                      }}
                    >
                      {index + 1}
                    </div>

                    {/* Title and Type */}
                    <div>
                      <h3
                        className="text-2xl font-bold mb-1"
                        style={{ color: "#242116" }}
                      >
                        {stop.name}
                      </h3>
                      <div className="flex items-center gap-3 mb-2">
                        {stop.cuisine && (
                          <div
                            className="flex items-center gap-2"
                            style={{ color: "#F59F00" }}
                          >
                            <Utensils className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {stop.cuisine}
                            </span>
                          </div>
                        )}
                        {stop.type === "landmark" && (
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: "#EDE7F6",
                              color: "#7B1FA2",
                            }}
                          >
                            Landmark
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price Badge */}
                  {stop.type === "restaurant" && (
                    <div
                      className="px-4 py-2 rounded-full font-bold"
                      style={{
                        backgroundColor: "#E8F5E9",
                        color: "#2E7D32",
                      }}
                    >
                      {stop.priceTier ?? `$${stop.price}`}
                    </div>
                  )}
                </div>

                <p
                  className="mb-4 leading-relaxed ml-16"
                  style={{ color: "#242116", opacity: 0.7 }}
                >
                  {stop.description}
                </p>

                <div className="flex flex-wrap gap-4 text-sm ml-16">
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    {stop.address}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="w-4 h-4" />
                    {stop.duration} minutes
                  </div>
                </div>

                {stop.dietaryOptions.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 ml-16">
                    {stop.dietaryOptions.map((option) => (
                      <span
                        key={option}
                        className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                        style={{
                          backgroundColor: "#FFF8E1",
                          color: "#F57C00",
                        }}
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="mt-8 rounded-2xl p-6 text-white text-center"
        style={{
          background:
            "linear-gradient(to right, #F59F00, #D1E892)",
        }}
      >
        <h3 className="text-2xl font-bold mb-2">
          Ready to explore?
        </h3>
        <p className="mb-4" style={{ opacity: 0.9 }}>
          Save this itinerary and start your culinary adventure!
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleDownload}
            className="px-6 py-3 rounded-xl font-semibold transition-colors"
            style={{
              backgroundColor: "white",
              color: "#F59F00",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#FDF8EF")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "white")
            }
          >
            Download Itinerary
          </button>
          <button
            onClick={onReset}
            className="px-6 py-3 rounded-xl font-semibold text-white transition-opacity"
            style={{ backgroundColor: "#D97706" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.opacity = "0.9")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.opacity = "1")
            }
          >
            Plan Another Crawl
          </button>
        </div>
      </div>
    </div>
  );
}