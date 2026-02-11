from decimal import Decimal, ROUND_HALF_UP

def to_decimal(value, precision="0.01"):
    """
    Safely converts a value to Decimal. 
    Handles floats via string to avoid precision artifacts.
    """
    if value is None:
        return Decimal("0.00")
    
    # Convert to string first to avoid float precision issues (e.g., 1.1 -> 1.10000000000000008)
    if isinstance(value, float):
        value = str(value)
        
    return Decimal(value).quantize(Decimal(precision), rounding=ROUND_HALF_UP)