# Implementation Guide: Inter-City vs Intra-City Routing System

## Overview

This document describes the complete implementation of a dual-mode logistics routing system that supports both **Inter-City (Inter-municipal)** and **Intra-City (Intra-municipal)** route calculation.

## Architecture

### Data Structure

#### 1. **Capital Cities with Neighborhoods**
Each of the 10 Brazilian capitals contains:
- **1 Distribution Hub (Central Depot)** - Index 0
- **9 Neighborhoods (Delivery Points)** - Indices 1-9

Location: [`backend/geo.py`](backend/geo.py)

```python
# Example: São Paulo
SAO_PAULO_LOCATIONS = [
    Location(0, "Hub Central São Paulo", -23.5505, -46.6333),  # Hub
    Location(1, "Pinheiros", -23.5629, -46.6825),              # Neighborhood 1
    Location(2, "Vila Mariana", -23.5880, -46.6386),           # Neighborhood 2
    # ... 7 more neighborhoods
]

# Programmatic access via dictionary
CITIES_DATA = {
    "sao_paulo": {
        "id": 1,
        "name": "São Paulo (SP)",
        "hub": SAO_PAULO_LOCATIONS[0],
        "neighborhoods": SAO_PAULO_LOCATIONS[1:],
        "all_locations": SAO_PAULO_LOCATIONS
    },
    # ... other 9 capitals
}
```

**Cities included:**
1. Brasília (DF) - Federal Capital
2. São Paulo (SP) - Largest city
3. Rio de Janeiro (RJ) - 2nd largest city
4. Belo Horizonte (MG)
5. Salvador (BA)
6. Recife (PE)
7. Fortaleza (CE)
8. Curitiba (PR)
9. Porto Alegre (RS)
10. Manaus (AM)

#### 2. **Business Logic Functions**

**`generate_route(city_key, algorithm_type, num_points)`**

Pure function that generates intra-city routes with validation:

```python
def generate_route(city_key: str, algorithm_type: str, num_points: int) -> List[Location]:
    """
    Generates a route for TSP calculation based on provided parameters.

    Args:
        city_key: City key in CITIES_DATA dictionary (e.g., "sao_paulo")
        algorithm_type: Algorithm type ("classical" or "quantum")
        num_points: Number of desired delivery points (excluding hub)

    Returns:
        List of Location containing [Hub, Point1, Point2, ..., PointN]

    Validation:
        - Quantum: 1-3 points (total 4 with hub) - RAM memory limit
        - Classical: 1-9 points (total 10 with hub) - No limit

    Example:
        >>> route = generate_route("sao_paulo", "quantum", 3)
        >>> # Returns: [Hub SP, Pinheiros, Mooca, Tatuapé] (random)
    """
```

**Key features:**
- ✓ Validates algorithm type
- ✓ Enforces point limits based on algorithm
- ✓ Randomly selects N neighborhoods from available 9
- ✓ Always includes hub as first point (index 0)
- ✓ Re-indexes locations sequentially (0, 1, 2, ..., N)

### API Endpoints

Location: [`server.py`](server.py)

#### 1. **GET /api/cities**
Returns list of all available cities with metadata.

**Response:**
```json
{
  "success": true,
  "cities": [
    {
      "id": 0,
      "key": "brasilia",
      "name": "Brasília (DF)"
    },
    // ... 9 more cities
  ]
}
```

#### 2. **GET /api/city-neighborhoods/<city_key>**
Returns hub and neighborhoods for a specific city.

**Example:** `/api/city-neighborhoods/sao_paulo`

**Response:**
```json
{
  "success": true,
  "city_name": "São Paulo (SP)",
  "hub": {
    "id": 0,
    "name": "Hub Central São Paulo",
    "lat": -23.5505,
    "lon": -46.6333
  },
  "neighborhoods": [
    {
      "id": 1,
      "name": "Pinheiros",
      "lat": -23.5629,
      "lon": -46.6825
    },
    // ... 8 more neighborhoods
  ]
}
```

#### 3. **POST /api/generate-route**
Generates an intra-city route with hub + random neighborhoods.

**Request:**
```json
{
  "city_key": "sao_paulo",
  "algorithm": "classical",
  "num_points": 5
}
```

**Response:**
```json
{
  "success": true,
  "city_name": "São Paulo (SP)",
  "locations": [
    {"id": 0, "name": "Hub Central São Paulo", "lat": -23.5505, "lon": -46.6333},
    {"id": 1, "name": "Pinheiros", "lat": -23.5629, "lon": -46.6825},
    {"id": 2, "name": "Mooca", "lat": -23.5489, "lon": -46.5997},
    {"id": 3, "name": "Tatuapé", "lat": -23.5403, "lon": -46.5768},
    {"id": 4, "name": "Ipiranga", "lat": -23.5944, "lon": -46.6070},
    {"id": 5, "name": "Vila Mariana", "lat": -23.5880, "lon": -46.6386}
  ],
  "total_points": 6,
  "algorithm": "classical"
}
```

**Validation:**
- Returns 400 error if `num_points` exceeds algorithm limits
- Returns 404 error if city_key is invalid

### User Interface

Location: [`templates/index.html`](templates/index.html)

#### Step 1: Route Scope Selection

User chooses between two calculation modes:

**Option A: Between Cities (Inter-municipal)**
- Routes between different Brazilian capital cities
- Uses capital hubs as waypoints
- Long-distance logistics

**Option B: Within City (Intra-municipal)**
- Routes within a single city
- Hub + neighborhoods as waypoints
- Short-distance local delivery

#### Step 2: Configuration

**For Intra-City Mode:**

1. **Select City** - Choose from 10 Brazilian capitals
2. **Select Algorithm Type:**
   - Classical: Allows 1-9 delivery points
   - Quantum: Allows 1-3 delivery points (RAM limit)
3. **Select Delivery Points Quantity:**
   - Dropdown dynamically adjusts based on algorithm selection
   - Quantum: Shows only 1-3 options
   - Classical: Shows full 1-9 options
4. **Generate Route Button** - Creates hub + random neighborhoods

**For Inter-City Mode:**

1. **Select Algorithm Type:**
   - Classical: Unlimited cities
   - Quantum: Max 4 cities (RAM limit)
2. **Select Depot City** - Starting capital
3. **Select Additional Cities** - Random selection from remaining capitals
4. **Load Route Button** - Creates depot + random cities

### Frontend Logic

Location: [`static/app.js`](static/app.js)

#### Key Functions:

**1. `toggleRouteTypeUI()`**
- Shows/hides appropriate configuration panels
- Clears loaded points when switching modes
- Updates global `currentRouteType` state

**2. `updatePointsLimitIntraCity()`**
- Dynamically adjusts point quantity dropdown
- Quantum: Limits to 1-3 options
- Classical: Shows full 1-9 options
- Updates helper text based on algorithm

**3. `generateIntraCityRoute()`**
- Fetches route from `/api/generate-route`
- Renders markers on map
- Updates UI state
- Shows success/error notifications

**4. `calculateRoute()`**
- Detects current route type (inter-city vs intra-city)
- Uses appropriate algorithm selector
- Calls `/api/calculate` endpoint
- Displays results and draws route on map

#### Algorithm Selection Logic:

```javascript
// Determine which algorithm to use based on mode
let algorithm;
if (currentRouteType === 'intra-city') {
    algorithm = document.getElementById('algorithm').value;
} else {
    algorithm = document.getElementById('algorithm-inter').value;
}
```

## User Flow

### Intra-City Routing Flow:

1. User selects "Within City (Intra-municipal)"
2. User selects city (e.g., "São Paulo")
3. User selects algorithm (e.g., "Quantum")
4. Dropdown automatically limits to 1-3 points
5. User selects quantity (e.g., "3 points")
6. User clicks "Generate Intra-City Route"
7. System generates: Hub + 3 random neighborhoods (4 total)
8. Map displays markers with hub highlighted in red
9. User clicks "Calculate Optimized Route"
10. System calculates TSP solution using quantum solver
11. Results displayed with distance, cost, time, and route sequence

### Inter-City Routing Flow:

1. User selects "Between Cities (Inter-municipal)"
2. User selects algorithm (e.g., "Classical")
3. User selects depot city (e.g., "São Paulo")
4. User selects additional cities (e.g., "4 cities")
5. User clicks "Load Inter-City Route"
6. System generates: Depot + 4 random capitals (5 total)
7. Map displays markers across Brazil
8. User clicks "Calculate Optimized Route"
9. System calculates TSP solution using classical solver
10. Results displayed with distance, cost, time, and route sequence

## Point Quantity Limits

### Quantum Mode:
- **Intra-City:** Hub + 1-3 neighborhoods = **2-4 total points**
- **Inter-City:** Depot + 1-3 capitals = **2-4 total points**
- **RAM Requirement:** ~512 KB for 4 points
- **Reason:** NumPyMinimumEigensolver requires 2^(n²) RAM elements

### Classical Mode:
- **Intra-City:** Hub + 1-9 neighborhoods = **2-10 total points**
- **Inter-City:** Depot + 1-9 capitals = **2-10 total points**
- **No RAM constraints**
- **Scalable:** Can handle hundreds of points using NetworkX

## Testing

### Test Script:
Location: [`test_implementation.py`](test_implementation.py)

**Tests performed:**
1. ✓ API `/api/cities` - List all cities
2. ✓ API `/api/city-neighborhoods/<city_key>` - Get hub + neighborhoods
3. ✓ API `/api/generate-route` - Generate intra-city routes
4. ✓ Intra-City Classical - 5 points (Hub + 5 neighborhoods)
5. ✓ Intra-City Quantum - 3 points (Hub + 3 neighborhoods)
6. ✓ Validation - Quantum with 5 points (correctly fails)
7. ✓ Inter-City Classical - 5 points (Depot + 4 capitals)

### Test Results:

```
TEST 3: INTRA-CITY ROUTING - Classical (São Paulo, 5 neighborhoods)
  Distance: 49.52 km
  Time: 0.21 ms
  Method: brute_force
  Route: [0, 5, 4, 1, 3, 2, 0]

TEST 4: INTRA-CITY ROUTING - Quantum (Rio de Janeiro, 3 neighborhoods)
  Distance: 87.00 km
  Time: 74.25 ms
  Method: quantum_exact
  Route: [0, 3, 1, 2, 0]

TEST 5: VALIDATION - Quantum with 5 points (should fail)
  Status: 400
  Error (expected): Quantum: número de pontos deve estar entre 1 e 3
```

## Code Structure

### Separation of Concerns:

**Data Layer** (`backend/geo.py`):
- Pure data structures (CITIES_DATA)
- No business logic mixed with data

**Business Logic** (`backend/geo.py`):
- `generate_route()` - Pure function with validation
- `get_city_by_index()` - Helper function for index conversion
- Separated from data definitions

**API Layer** (`server.py`):
- RESTful endpoints
- JSON request/response handling
- Error handling with appropriate HTTP status codes

**Presentation Layer** (`templates/index.html` + `static/app.js`):
- UI state management
- Dynamic form controls
- Map visualization
- User notifications

## Key Features Implemented:

✓ **Data Structure:** 10 capitals × (1 hub + 9 neighborhoods) = 100 total locations
✓ **Dual Routing Modes:** Inter-City and Intra-City
✓ **Algorithm-Based Limits:** Quantum (1-3 points) vs Classical (1-9 points)
✓ **Random Point Selection:** Fair distribution using `random.sample()`
✓ **Pure Business Logic:** `generate_route()` function separates data from calculation
✓ **API Endpoints:** RESTful design with proper validation
✓ **Dynamic UI:** Form controls adjust based on algorithm selection
✓ **Comprehensive Testing:** All modes tested and validated

## Technical Decisions:

1. **Hub always at index 0:** Ensures consistent depot-based routing
2. **Re-indexing after selection:** Maintains sequential IDs (0, 1, 2, ..., N)
3. **Separate algorithm selectors:** `algorithm` (intra-city) vs `algorithm-inter` (inter-city)
4. **Dynamic dropdown population:** JavaScript modifies `<select>` options based on algorithm
5. **Validation at API level:** Server-side validation prevents invalid requests
6. **Placeholder-ready:** TSP calculation logic already integrated (no placeholders needed)

## Future Enhancements:

- [ ] Add more cities (expand beyond 10 capitals)
- [ ] Allow user to manually select specific neighborhoods (instead of random)
- [ ] Add time windows for delivery points
- [ ] Implement vehicle capacity constraints
- [ ] Add multiple vehicle routing (CVRP)
- [ ] Export routes to CSV/JSON
- [ ] Save/load route configurations
- [ ] Real-time route progress tracking

## References:

- **Backend Data:** [backend/geo.py](backend/geo.py)
- **API Endpoints:** [server.py](server.py)
- **Frontend UI:** [templates/index.html](templates/index.html)
- **Frontend Logic:** [static/app.js](static/app.js)
- **Test Script:** [test_implementation.py](test_implementation.py)
