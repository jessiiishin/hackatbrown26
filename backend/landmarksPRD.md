# Product Requirements Document (PRD)

## Product Name

City Landmark & Food Crawl Planner

## Overview

The product generates optimized city exploration itineraries centered around **landmarks and food**, reducing user research time and cognitive load. Users input constraints (city, time window, budget, preferences), and the system returns a curated, time-feasible set of landmarks (and optionally food stops) that are **open during the selected time** and **within an acceptable price range**.

This PRD focuses specifically on **landmark discovery and filtering** using the **Google Places API**.

---

## Problem Statement

City explorers and foodies currently rely on fragmented sources (Instagram, reviews, blogs, maps) to identify landmarks and plan routes. This process is:

* Time-consuming
* Difficult to personalize by time and budget
* Poorly optimized for logistics (opening hours, proximity)

Users need a system that automatically surfaces **relevant landmarks that are actually open when they plan to visit and aligned with their budget expectations**.

---

## Goals & Success Metrics

### Goals

* Reduce city-planning research time by >70%
* Surface only *actionable* landmarks (open + affordable)
* Provide transparent filtering (no "black box" exclusions)

### Success Metrics

* % of generated landmarks that are open at visit time
* User engagement with suggested landmarks
* Low bounce rate due to "closed" or misleading suggestions

---

## Target Users

* City explorers / tourists
* Food-focused travelers
* Hackathon demo users
* Budget- and time-constrained planners

---

## User Inputs

| Input             | Type       | Required | Notes                      |
| ----------------- | ---------- | -------- | -------------------------- |
| City              | String     | Yes      | e.g. "Paris, France"       |
| Visit Date        | Date       | Yes      | Used for weekday mapping   |
| Visit Time Window | Time Range | Yes      | e.g. 14:00–17:00           |
| Budget Preference | Enum       | No       | Free / Low / Medium / High |
| Starting Address  | String     | Optional | Used later for routing     |

---

## Core Functional Requirements

### FR1: City Boundary Resolution

* System must geocode the user-input city using Google Geocoding API
* Extract:

  * City center latitude/longitude
  * Viewport bounds (optional strict filtering)

---

### FR2: Landmark Discovery

* System must retrieve candidate landmarks using Google Places Nearby Search
* Supported place types:

  * `tourist_attraction`
  * `museum`
  * `park`
  * `church`, `synagogue`, `mosque`
  * `point_of_interest`

---

### FR3: Opening Hours Validation (Critical)

#### Requirement

The system must verify whether a landmark is **open during the user-selected time window**.

#### Implementation

* Use Google Place Details API
* Required fields:

  * `opening_hours.periods`

#### Logic

* Convert user-selected date → weekday index (0–6)
* Convert user-selected time → HHMM format
* A landmark is considered **open** if:

  * Any opening period fully or partially overlaps the user time window
  * OR opening hours are missing (marked as "Unknown")

#### Edge Cases

* Overnight hours (e.g. 22:00–02:00)
* 24-hour landmarks
* Missing opening data

---

### FR4: Price Level Filtering

#### Requirement

Landmarks must align with the user's budget expectations using an **average price proxy**.

#### Data Source

* Google Place Details field: `price_level`

#### Price Scale

```
0 = Free
1 = Inexpensive
2 = Moderate
3 = Expensive
4 = Very Expensive
```

#### Rules

* If `price_level` exists:

  * Must fall within user-selected budget
* If `price_level` is missing:

  * Landmark is allowed
  * Display "Price info unavailable"

#### Optional Heuristics (Non-blocking)

* Parks / natural features → infer price level 0
* Museums → infer price level 1–2

---

### FR5: Combined Eligibility Logic

A landmark is eligible if:

```
(open during time window OR hours unknown)
AND
(price level matches budget OR price unknown)
```

No landmark should be silently excluded without explanation.

---

## Non-Functional Requirements

### Performance

* Nearby Search should return results within 1–2 seconds
* Place Details calls must be rate-limited and batched

### Cost Control

* Place Details API calls limited to top-ranked landmarks (10–15 max)
* Cache results by `place_id`

### Reliability

* System must gracefully handle missing or incomplete data

---

## UX Requirements

* Each landmark must display:

  * Name
  * Open status badge (e.g. "Open 14:00–17:00")
  * Price badge (Free / $$ / Unknown)

* Unknown data must be explicitly labeled, not hidden

---

## Out of Scope (Phase 1)

* Exact ticket pricing
* Real-time crowd levels
* Reservation booking
* Multi-day itinerary optimization

---

## Risks & Mitigations

| Risk                            | Mitigation                   |
| ------------------------------- | ---------------------------- |
| Missing opening hours           | Treat as unknown, not closed |
| Missing price data              | Allow with transparency      |
| API cost overruns               | Aggressive caching + ranking |
| Landmark spillover outside city | Post-filter by locality      |

---

## Future Enhancements

* Time-weighted scoring (open longer = higher rank)
* Popularity + rating composite score
* Integration with food crawl routing
* Agentic AI auto-filling city characteristics

---

## Appendix

### APIs Used

* Google Geocoding API
* Google Places Nearby Search API
* Google Places Details API

---

**Owner:** Product / Backend
**Status:** Draft
