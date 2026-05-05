import time
from typing import Dict, Optional
import random

# Simple in-memory cache
# In a production app, this would be Redis or a database table
_price_cache: Dict[str, Dict] = {}
CACHE_EXPIRY = 86400  # 24 hours

# Base rates for major materials (Indian market averages 2024)
BASE_MATERIAL_PRICES = {
    "Cement": {"unit": "bag", "rate": 380},
    "Steel": {"unit": "kg", "rate": 65},
    "Sand": {"unit": "cft", "rate": 60},
    "Aggregate": {"unit": "cft", "rate": 55},
    "Bricks": {"unit": "pcs", "rate": 8},
    "Concrete_M20": {"unit": "cum", "rate": 4500},
    "Vitrified_Tiles": {"unit": "sqft", "rate": 65},
}

CITY_PRICE_INDEX = {
    "Mumbai": 1.15,
    "Delhi": 1.10,
    "Bangalore": 1.08,
    "Hyderabad": 1.05,
    "Chennai": 1.05,
    "Pune": 1.07,
    "Other": 1.00
}

def get_material_prices(location: str = "Other") -> Dict[str, Dict]:
    """
    Fetch material prices for a given location.
    Includes a simple caching mechanism and randomized fluctuation for 'real-time' feel.
    """
    global _price_cache
    
    current_time = time.time()
    cache_key = f"prices_{location}"
    
    if cache_key in _price_cache:
        cached_data = _price_cache[cache_key]
        if current_time - cached_data["timestamp"] < CACHE_EXPIRY:
            return cached_data["prices"]
    
    # Generate 'real-time' prices based on base rates and location index
    location_mult = CITY_PRICE_INDEX.get(location, CITY_PRICE_INDEX["Other"])
    
    prices = {}
    for material, data in BASE_MATERIAL_PRICES.items():
        # Add small random fluctuation (-2% to +3%)
        fluctuation = 1 + (random.uniform(-0.02, 0.03))
        adjusted_rate = round(data["rate"] * location_mult * fluctuation, 2)
        prices[material] = {
            "unit": data["unit"],
            "rate": adjusted_rate,
            "trend": "up" if fluctuation > 1 else "down"
        }
        
    # Store in cache
    _price_cache[cache_key] = {
        "timestamp": current_time,
        "prices": prices
    }
    
    return prices

def get_location_multiplier(location: str) -> float:
    """Returns the cost index multiplier for a given city/region."""
    return CITY_PRICE_INDEX.get(location, 1.0)
