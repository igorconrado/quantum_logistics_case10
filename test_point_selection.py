#!/usr/bin/env python
"""
Test script for point selection functionality
"""
import requests
import json

BASE_URL = "http://localhost:5000"

print("=" * 60)
print("TESTING POINT SELECTION FUNCTIONALITY")
print("=" * 60)

# Get Brazil capitals
r = requests.get(f"{BASE_URL}/api/brazil-capitals")
all_capitals = r.json()['locations']

# Test 1: Calculate with 2 points (Quantum)
print("\n1. Testing 2 points (Quantum)...")
try:
    test_points = all_capitals[:2]
    payload = {
        "locations": test_points,
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

# Test 2: Calculate with 5 points (Quantum - maximum)
print("\n2. Testing 5 points (Quantum - maximum)...")
try:
    test_points = all_capitals[:5]
    payload = {
        "locations": test_points,
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

# Test 3: Try 6 points (Quantum - should fail)
print("\n3. Testing 6 points (Quantum - should reject)...")
try:
    test_points = all_capitals[:6]
    payload = {
        "locations": test_points,
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
    if not result.get('success'):
        print(f"   Error (expected): {result.get('error')}")
except Exception as e:
    print(f"   ERROR: {e}")

# Test 4: Calculate with 10 points (Classical)
print("\n4. Testing 10 points (Classical)...")
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

# Test 5: Minimum 2 points (Classical)
print("\n5. Testing minimum 2 points (Classical)...")
try:
    test_points = all_capitals[:2]
    payload = {
        "locations": test_points,
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
print("SUMMARY")
print("=" * 60)
print("Quantum mode: 2-5 points")
print("Classical mode: 2+ points (unlimited)")
print("=" * 60)
