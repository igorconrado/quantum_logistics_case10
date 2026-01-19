#!/usr/bin/env python
"""
Test script for Brazil capitals functionality
"""
import requests
import json

BASE_URL = "http://localhost:5000"

print("=" * 60)
print("TESTING BRAZIL CAPITALS FUNCTIONALITY")
print("=" * 60)

# Test 1: Get Brazil capitals
print("\n1. Testing /api/brazil-capitals endpoint...")
try:
    r = requests.get(f"{BASE_URL}/api/brazil-capitals")
    print(f"   Status: {r.status_code}")
    data = r.json()
    print(f"   Capitals loaded: {len(data['locations'])}")
    print(f"   First capital: {data['locations'][0]['name']}")
    print(f"   Last capital: {data['locations'][-1]['name']}")
except Exception as e:
    print(f"   ERROR: {e}")

# Test 2: Calculate route with 4 random capitals (Classical)
print("\n2. Testing route calculation with 4 capitals (Classical)...")
try:
    # Get all capitals
    r = requests.get(f"{BASE_URL}/api/brazil-capitals")
    all_capitals = r.json()['locations']

    # Select first 4
    test_capitals = all_capitals[:4]

    payload = {
        "locations": test_capitals,
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
    print(f"   Distance: {result.get('total_distance', 0):.2f} km")
    print(f"   Time: {result.get('time_ms', 0):.2f} ms")
    print(f"   Method: {result.get('method')}")
except Exception as e:
    print(f"   ERROR: {e}")

# Test 3: Calculate route with 4 capitals (Quantum)
print("\n3. Testing route calculation with 4 capitals (Quantum)...")
try:
    test_capitals = all_capitals[:4]

    payload = {
        "locations": test_capitals,
        "algorithm": "quantum"
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
    print(f"   Distance: {result.get('total_distance', 0):.2f} km")
    print(f"   Time: {result.get('time_ms', 0):.2f} ms")
    print(f"   Method: {result.get('method')}")
except Exception as e:
    print(f"   ERROR: {e}")

# Test 4: Test with 10 capitals (Classical only)
print("\n4. Testing route calculation with ALL 10 capitals (Classical)...")
try:
    payload = {
        "locations": all_capitals,
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
    print(f"   Distance: {result.get('total_distance', 0):.2f} km")
    print(f"   Time: {result.get('time_ms', 0):.2f} ms")
    print(f"   Method: {result.get('method')}")
except Exception as e:
    print(f"   ERROR: {e}")

print("\n" + "=" * 60)
print("ALL TESTS COMPLETED")
print("=" * 60)
