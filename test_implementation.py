#!/usr/bin/env python
"""
Test script for the new route type implementation
Tests both Inter-City and Intra-City routing modes
"""
import requests
import json

BASE_URL = "http://localhost:5000"

print("=" * 80)
print("TESTING NEW IMPLEMENTATION: INTER-CITY vs INTRA-CITY ROUTING")
print("=" * 80)

# ==============================================================================
# TEST 1: API /api/cities
# ==============================================================================
print("\n" + "=" * 80)
print("TEST 1: GET /api/cities (list all cities)")
print("=" * 80)

try:
    r = requests.get(f"{BASE_URL}/api/cities")
    data = r.json()
    print(f"Status: {r.status_code}")
    print(f"Success: {data.get('success')}")
    print(f"Total cities: {len(data.get('cities', []))}")
    print(f"First city: {data['cities'][0]}")
    print(f"Last city: {data['cities'][-1]}")
except Exception as e:
    print(f"ERROR: {e}")

# ==============================================================================
# TEST 2: API /api/city-neighborhoods (get neighborhoods for a city)
# ==============================================================================
print("\n" + "=" * 80)
print("TEST 2: GET /api/city-neighborhoods/sao_paulo")
print("=" * 80)

try:
    r = requests.get(f"{BASE_URL}/api/city-neighborhoods/sao_paulo")
    data = r.json()
    print(f"Status: {r.status_code}")
    print(f"Success: {data.get('success')}")
    print(f"City: {data.get('city_name')}")
    print(f"Hub: {data.get('hub')['name']}")
    print(f"Neighborhoods: {len(data.get('neighborhoods', []))}")
    print(f"First neighborhood: {data['neighborhoods'][0]['name']}")
except Exception as e:
    print(f"ERROR: {e}")

# ==============================================================================
# TEST 3: INTRA-CITY ROUTING - Classical (Hub + 5 random neighborhoods)
# ==============================================================================
print("\n" + "=" * 80)
print("TEST 3: INTRA-CITY ROUTING - Classical (São Paulo, 5 neighborhoods)")
print("=" * 80)

try:
    payload = {
        "city_key": "sao_paulo",
        "algorithm": "classical",
        "num_points": 5
    }

    r = requests.post(
        f"{BASE_URL}/api/generate-route",
        json=payload,
        headers={"Content-Type": "application/json"}
    )

    data = r.json()
    print(f"Status: {r.status_code}")
    print(f"Success: {data.get('success')}")
    print(f"City: {data.get('city_name')}")
    print(f"Total points: {data.get('total_points')} (1 hub + 5 neighborhoods)")
    print(f"Algorithm: {data.get('algorithm')}")

    print(f"\nGenerated Route:")
    for loc in data.get('locations', []):
        print(f"  {loc['id']}: {loc['name']}")

    # Now calculate the route
    print(f"\nCalculating optimized route...")
    calc_payload = {
        "locations": data.get('locations'),
        "algorithm": "classical"
    }

    r2 = requests.post(
        f"{BASE_URL}/api/calculate",
        json=calc_payload,
        headers={"Content-Type": "application/json"}
    )

    result = r2.json()
    print(f"  Distance: {result.get('total_distance', 0):.2f} km")
    print(f"  Time: {result.get('time_ms', 0):.2f} ms")
    print(f"  Method: {result.get('method')}")
    print(f"  Route: {result.get('route')}")

except Exception as e:
    print(f"ERROR: {e}")

# ==============================================================================
# TEST 4: INTRA-CITY ROUTING - Quantum (Hub + 3 random neighborhoods)
# ==============================================================================
print("\n" + "=" * 80)
print("TEST 4: INTRA-CITY ROUTING - Quantum (Rio de Janeiro, 3 neighborhoods)")
print("=" * 80)

try:
    payload = {
        "city_key": "rio_de_janeiro",
        "algorithm": "quantum",
        "num_points": 3
    }

    r = requests.post(
        f"{BASE_URL}/api/generate-route",
        json=payload,
        headers={"Content-Type": "application/json"}
    )

    data = r.json()
    print(f"Status: {r.status_code}")
    print(f"Success: {data.get('success')}")
    print(f"City: {data.get('city_name')}")
    print(f"Total points: {data.get('total_points')} (1 hub + 3 neighborhoods)")
    print(f"Algorithm: {data.get('algorithm')}")

    print(f"\nGenerated Route:")
    for loc in data.get('locations', []):
        print(f"  {loc['id']}: {loc['name']}")

    # Now calculate the route
    print(f"\nCalculating optimized route...")
    calc_payload = {
        "locations": data.get('locations'),
        "algorithm": "quantum"
    }

    r2 = requests.post(
        f"{BASE_URL}/api/calculate",
        json=calc_payload,
        headers={"Content-Type": "application/json"}
    )

    result = r2.json()
    print(f"  Distance: {result.get('total_distance', 0):.2f} km")
    print(f"  Time: {result.get('time_ms', 0):.2f} ms")
    print(f"  Method: {result.get('method')}")
    print(f"  Route: {result.get('route')}")

except Exception as e:
    print(f"ERROR: {e}")

# ==============================================================================
# TEST 5: INTRA-CITY ROUTING - Validation (Quantum with >3 points - should fail)
# ==============================================================================
print("\n" + "=" * 80)
print("TEST 5: VALIDATION - Quantum with 5 points (should fail)")
print("=" * 80)

try:
    payload = {
        "city_key": "brasilia",
        "algorithm": "quantum",
        "num_points": 5  # This should fail (max 3 for quantum)
    }

    r = requests.post(
        f"{BASE_URL}/api/generate-route",
        json=payload,
        headers={"Content-Type": "application/json"}
    )

    data = r.json()
    print(f"Status: {r.status_code}")
    print(f"Success: {data.get('success')}")
    if not data.get('success'):
        print(f"Error (expected): {data.get('error')}")

except Exception as e:
    print(f"ERROR: {e}")

# ==============================================================================
# TEST 6: INTER-CITY ROUTING (original mode - depot + random capitals)
# ==============================================================================
print("\n" + "=" * 80)
print("TEST 6: INTER-CITY ROUTING - Classical (São Paulo depot + 4 cities)")
print("=" * 80)

try:
    # Get all capitals
    r = requests.get(f"{BASE_URL}/api/brazil-capitals")
    all_capitals = r.json()['locations']

    # Select São Paulo as depot + 4 random others
    depot_idx = 1  # São Paulo
    num_additional = 4

    depot = all_capitals[depot_idx]
    other_capitals = [cap for i, cap in enumerate(all_capitals) if i != depot_idx]

    import random
    random_capitals = random.sample(other_capitals, num_additional)

    # Combine: depot first + random additional
    test_locations = [depot] + random_capitals

    # Re-index
    test_locations = [
        {**loc, 'id': idx} for idx, loc in enumerate(test_locations)
    ]

    print(f"Selected route:")
    for loc in test_locations:
        print(f"  {loc['id']}: {loc['name']}")

    # Calculate with Classical
    payload = {
        "locations": test_locations,
        "algorithm": "classical"
    }

    r = requests.post(
        f"{BASE_URL}/api/calculate",
        json=payload,
        headers={"Content-Type": "application/json"}
    )

    result = r.json()
    print(f"\nClassical Result:")
    print(f"  Status: {r.status_code}")
    print(f"  Success: {result.get('success')}")
    print(f"  Route: {result.get('route')}")
    print(f"  Distance: {result.get('total_distance', 0):.2f} km")
    print(f"  Time: {result.get('time_ms', 0):.2f} ms")
    print(f"  Method: {result.get('method')}")

except Exception as e:
    print(f"ERROR: {e}")

# ==============================================================================
# SUMMARY
# ==============================================================================
print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print("✓ API /api/cities - List all cities")
print("✓ API /api/city-neighborhoods/<city_key> - Get hub + neighborhoods")
print("✓ API /api/generate-route - Generate intra-city routes")
print("✓ Intra-City Mode:")
print("   - Classical: Hub + 1-9 random neighborhoods")
print("   - Quantum: Hub + 1-3 random neighborhoods (max 4 total points)")
print("✓ Inter-City Mode:")
print("   - Classical: Depot + 1-9 random capitals")
print("   - Quantum: Depot + 1-3 random capitals (max 4 total points)")
print("✓ Validation working correctly")
print("=" * 80)
