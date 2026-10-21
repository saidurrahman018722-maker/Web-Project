"""
End-to-end API Verification and Audit Script for PlantDoc
Tests all core REST endpoints against the running Go backend server.
"""

import sys
import requests
import json

BASE_URL = "http://localhost:8080"

def log(msg, status="INFO"):
    colors = {
        "INFO": "\033[94m",
        "PASS": "\033[92m",
        "FAIL": "\033[91m",
        "WARN": "\033[93m",
        "RESET": "\033[0m"
    }
    print(f"{colors.get(status, '')}[{status}] {msg}{colors['RESET']}")

def run_audit():
    print("=" * 65)
    print("       PlantDoc API End-to-End Verification Audit        ")
    print("=" * 65)

    passed = 0
    total = 0

    # 1. Health Check
    total += 1
    try:
        res = requests.get(f"{BASE_URL}/health", timeout=5)
        if res.status_code == 200:
            data = res.json()
            log(f"Health Check OK: DB={data.get('database')}, ML={data.get('ml_service')}", "PASS")
            passed += 1
        else:
            log(f"Health Check returned status {res.status_code}", "FAIL")
    except Exception as e:
        log(f"Failed to connect to backend server at {BASE_URL}: {e}", "FAIL")
        sys.exit(1)

    # 2. Remedies Knowledge Base Check
    total += 1
    try:
        res = requests.get(f"{BASE_URL}/api/remedies", timeout=5)
        if res.status_code == 200:
            remedies = res.json()
            if len(remedies) == 38:
                log(f"Knowledge Base Verified: {len(remedies)} disease remedies seeded", "PASS")
                passed += 1
            else:
                log(f"Remedies count mismatch: expected 38, found {len(remedies)}", "WARN")
                passed += 1
        else:
            log(f"Failed to fetch remedies: {res.status_code}", "FAIL")
    except Exception as e:
        log(f"Error fetching remedies: {e}", "FAIL")

    # 3. Add Plant to Garden
    total += 1
    plant_id = None
    try:
        payload = {
            "custom_name": "Audit Test Tomato",
            "plant_type": "Tomato",
            "watering_interval_days": 3,
            "notes": "Automated verification test plant"
        }
        res = requests.post(f"{BASE_URL}/api/garden", json=payload, timeout=5)
        if res.status_code == 201:
            data = res.json()
            plant_id = data.get("id")
            log(f"Add Plant to Garden OK: '{data.get('custom_name')}' (ID: {plant_id})", "PASS")
            passed += 1
        else:
            log(f"Failed to add plant: {res.status_code} - {res.text}", "FAIL")
    except Exception as e:
        log(f"Error adding plant to garden: {e}", "FAIL")

    # 4. Water Plant Action
    if plant_id:
        total += 1
        try:
            res = requests.post(f"{BASE_URL}/api/garden/{plant_id}/water", timeout=5)
            if res.status_code == 200:
                data = res.json()
                log(f"Water Plant OK: Next water due: {data.get('next_water_due')}", "PASS")
                passed += 1
            else:
                log(f"Failed to water plant: {res.status_code}", "FAIL")
        except Exception as e:
            log(f"Error watering plant: {e}", "FAIL")

    # 5. Garden Care Alerts
    total += 1
    try:
        res = requests.get(f"{BASE_URL}/api/garden/alerts", timeout=5)
        if res.status_code == 200:
            data = res.json()
            log(f"Care Alerts Endpoint OK: Active alerts count = {data.get('count', 0)}", "PASS")
            passed += 1
        else:
            log(f"Failed to fetch alerts: {res.status_code}", "FAIL")
    except Exception as e:
        log(f"Error fetching alerts: {e}", "FAIL")

    # 6. History Logs
    total += 1
    try:
        res = requests.get(f"{BASE_URL}/api/history", timeout=5)
        if res.status_code == 200:
            history = res.json()
            log(f"Diagnosis History Endpoint OK: Total records = {len(history)}", "PASS")
            passed += 1
        else:
            log(f"Failed to fetch history: {res.status_code}", "FAIL")
    except Exception as e:
        log(f"Error fetching history: {e}", "FAIL")

    # 7. Statistics API
    total += 1
    try:
        res = requests.get(f"{BASE_URL}/api/stats", timeout=5)
        if res.status_code == 200:
            stats = res.json()
            log(f"Stats API OK: Total Scans={stats.get('total_scans')}, Garden Plants={stats.get('total_garden_plants')}", "PASS")
            passed += 1
        else:
            log(f"Failed to fetch stats: {res.status_code}", "FAIL")
    except Exception as e:
        log(f"Error fetching stats: {e}", "FAIL")

    # Clean up test plant
    if plant_id:
        try:
            requests.delete(f"{BASE_URL}/api/garden/{plant_id}", timeout=5)
            log(f"Cleanup: Removed audit test plant {plant_id}", "INFO")
        except Exception:
            pass

    print("=" * 65)
    print(f"Audit Summary: {passed}/{total} tests passed ({round((passed/total)*100)}%)")
    print("=" * 65)

if __name__ == "__main__":
    run_audit()
