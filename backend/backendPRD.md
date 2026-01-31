# CityBite Crawl PRD

## 1. Product Overview

**Purpose:**
Exploring a city is best experienced through its food and landmarks, but manually researching restaurants via Instagram videos, hundreds of reviews, and creating an optimized route is time-consuming. CityBite Crawl automates this process, providing curated food and landmark crawls optimized for time, distance, and user preferences.

**Target Audience:**

* City explorers
* Foodies and travelers who enjoy curated culinary experiences

**Problem Solved:**

* Cuts down research time for planning food and landmark itineraries
* Automatically generates efficient routes based on user preferences

**Key Benefits:**

* Saves time by generating multiple optimized crawls
* Provides a full route map with estimated travel and visit times
* Allows flexibility to merge, adjust, or customize crawls

## 2. User Inputs

Users provide the following:

1. **City** – location of the crawl
2. **Budget** – maximum spend or category per person
3. **Duration** – total time available for the crawl
4. **Number of stops** – optional, user can specify or leave blank for system to optimize
5. **Dietary preferences** – e.g., vegan, gluten-free, kosher, halal (strict “pure fit” filtering by default, with option to relax filters)
6. **Cuisines** – types of food preferred
7. **Start location** – street address or coordinates
8. **Interests for landmarks** – free-form text, mapped to known categories for API queries

## 3. Outputs

The app returns:

* Multiple curated crawls (food + landmark sequences)
* Optimized order based on **travel time** (TSP algorithm)
* Variable visit times per restaurant and landmark (combining user input, historical data, and static defaults)
* Estimated travel time between stops
* Estimated cost per stop and total crawl
* Full route map integrated with **Google Maps**
* Ordered list of stops with metadata:

```json
{
  "type": "restaurant" | "landmark",
  "name": "Stop Name",
  "address": "123 Main St",
  "coordinates": { "lat": 37.77, "lng": -122.42 },
  "cuisine": "Vegan",
  "rating": 4.5,
  "estimated_visit_time": "12:00-12:45",
  "estimated_cost": "$$",
  "link_to_maps": "https://maps.google.com/?q=...",
  "dietary_match": "pure" | "partial" // indicates strict or best-fit match
}
```

## 4. Crawl Logic / Algorithm

**Ordering of stops:**

* Default: **restaurant → landmark → restaurant → landmark**
* User can customize pattern (e.g., 2 restaurants → 1 landmark)

**Time Allocation:**

* Variable visit time per restaurant (based on cuisine, rating, or estimated duration)
* Landmarks have estimated visit time

**Optimization:**

* Use **TSP (Traveling Salesman Problem) solver** for shortest route
* Include **travel time and duration constraints**
* Allow **alternate routes** if user falls behind schedule (system notifies, user decides how to proceed)

**Constraints:**

* Budget per stop / total crawl
* Duration of the crawl
* Dietary restrictions and cuisine preferences (strict by default, can be relaxed)

## 5. Data Sources

* **Restaurants & Landmarks:** Google Places API (fetch by city, type, cuisine, dietary options; use placeholders for API keys)
* **Travel time / mapping:** Google Maps API (Distance Matrix & Directions; use placeholders for API keys)
* **Ratings & Reviews:** Fetched from Google Places API

**Data Handling:**

* Store fetched places in PostgreSQL for faster repeated queries
* Use PostGIS for geospatial queries (distance, nearest neighbor)
* Cache data and refresh every 24 hours

## 6. User Experience / Features

* Users can **adjust crawls** after generation (add/remove stops, change order)
* Filtering options apply dynamically:
  * Dietary preferences (strict or relaxed)
  * Cuisine type
  * Landmark categories
* Users can **merge multiple crawls** to form custom itineraries
* Show **best time to visit** a restaurant or landmark based on ratings/popularity
* Option to view **multiple crawl options** before selection
* **Integration with Google Maps** for real-time navigation
* Users can remove filters to broaden search results

## 7. Technical Considerations

**Backend Stack:**

* Node.js (Express or NestJS)
* PostgreSQL with PostGIS
* Axios (or node-fetch) for API calls (API keys as placeholders)

**Key Endpoints:**

1. `POST /generateCrawl` – input city, budget, duration, preferences → returns ordered crawl(s)
2. `POST /adjustCrawl` – modify stops or reorder → returns updated crawl
3. `GET /places` – fetch available restaurants/landmarks based on filters

**Geospatial Requirements:**

* Distance calculations for route optimization
* Generate map pins and route directions for Google Maps integration

**Performance Considerations:**

* Optimize API calls (cache frequent queries, prioritize cache)
* Ensure crawl generation < 5–10 seconds for smooth UX
* Cache refresh every 24 hours

**API Limits:**

* Google Places & Maps have quotas; consider caching or storing data locally for repeated requests
* Use placeholders for all API keys

**Logging & Analytics:**

* Log all user adjustments (skipped stops, reordering, filter changes) in a database table for analytics and future recommendations

## 8. Optional / Future Enhancements

* Push notifications or reminders when running behind schedule
* User-generated ratings for restaurants/landmarks within the app
* Social sharing of crawls
* AI-based recommendations for combining crawls
* Multiple-city multi-day crawl planning

## 9. Integration Notes

* Backend will use placeholders for all API keys and any frontend-dependent values
* Mock data or stubs will be used where frontend integration is not yet available
* Backend is designed to be ready for future frontend integration
