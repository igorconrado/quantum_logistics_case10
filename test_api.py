#!/usr/bin/env python
"""
Test script to verify API endpoints
"""
import requests
import json

BASE_URL = "http://localhost:5000"

print("=" * 60)
print("TESTING QUANTUM LOGISTICS API")
print("=" * 60)

# Test 1: Health check
print("\n1. Testing health endpoint...")
try:
    r = requests.get(f"{BASE_URL}/api/health")
    print(f"   Status: {r.status_code}")
    print(f"   Response: {r.json()}")
except Exception as e:
    print(f"   ERROR: {e}")

# Test 2: Get test data
print("\n2. Testing test-data endpoint...")
try:
    r = requests.get(f"{BASE_URL}/api/test-data")
    print(f"   Status: {r.status_code}")
    data = r.json()
    print(f"   Locations loaded: {len(data['locations'])}")
    print(f"   First location: {data['locations'][0]}")
except Exception as e:
    print(f"   ERROR: {e}")

# Test 3: Calculate classical route
print("\n3. Testing calculate endpoint (classical)...")
try:
    test_locations = [
        {"id": 0, "name": "Centro", "lat": -23.5505, "lon": -46.6333},
        {"id": 1, "name": "Pinheiros", "lat": -23.5629, "lon": -46.6825},
        {"id": 2, "name": "Vila Mariana", "lat": -23.5880, "lon": -46.6386}
    ]

    payload = {
        "locations": test_locations,
        "algorithm": "classical"
    }

    r = requests.post(
        f"{BASE_URL}/api/calculate",
        json=payload,
        headers={"Content-Type": "application/json"}
    )

    print(f"   Status: {r.status_code}")
    result = r.json()
    print(f"   Success: {result.get('success')}")
    print(f"   Route: {result.get('route')}")
    print(f"   Distance: {result.get('total_distance'):.2f} km")
    print(f"   Time: {result.get('time_ms'):.2f} ms")
    print(f"   Method: {result.get('method')}")
except Exception as e:
    print(f"   ERROR: {e}")

# Test 4: Calculate quantum route
print("\n4. Testing calculate endpoint (quantum)...")
try:
    payload["algorithm"] = "quantum"

    r = requests.post(
        f"{BASE_URL}/api/calculate",
        json=payload,
        headers={"Content-Type": "application/json"}
    )

    print(f"   Status: {r.status_code}")
    result = r.json()
    print(f"   Success: {result.get('success')}")
    print(f"   Route: {result.get('route')}")
    print(f"   Distance: {result.get('total_distance'):.2f} km")
    print(f"   Time: {result.get('time_ms'):.2f} ms")
    print(f"   Method: {result.get('method')}")
except Exception as e:
    print(f"   ERROR: {e}")

print("\n" + "=" * 60)
print("ALL TESTS COMPLETED")
print("=" * 60)
