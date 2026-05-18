"""
SmartServe SMEs — SMART ITEMS STOCKED
======================================
Customer Dashboard Module  |  Fashion Industry Sales Trends
-------------------------------------------------------------
Items  : Dress, Trouser, Shirt, Skirt, Coat
Features:
  • Sales trend bar charts (last 6 months)
  • Stock status per item (In Stock / Low / Sold Out)
  • Customer sold-out notifications
  • Designer stock-low / out-of-stock alerts
  • Designer sample upload (up to 10 per item)
  • Designer restock capability
"""

import os
import datetime

# ─────────────────────────────────────────────────────────────
#  CONFIGURATION
# ─────────────────────────────────────────────────────────────

FASHION_ITEMS   = ["Dress", "Trouser", "Shirt", "Skirt", "Coat"]
MAX_SAMPLES     = 10          # max sample images per item
LOW_THRESHOLD   = 5           # alert designer when stock ≤ this
VALID_EXTS      = {".jpg", ".jpeg", ".png", ".webp", ".avif"}

# ─────────────────────────────────────────────────────────────
#  IN-MEMORY DATABASE  (replace with real DB in production)
# ─────────────────────────────────────────────────────────────

stock_db = {
    "Dress":   {"stock": 0,  "price": 2500, "samples": [], "sales": []},
    "Trouser": {"stock": 3,  "price": 1500, "samples": [], "sales": []},
    "Shirt":   {"stock": 12, "price": 1200, "samples": [], "sales": []},
    "Skirt":   {"stock": 0,  "price": 1100, "samples": [], "sales": []},
    "Coat":    {"stock": 7,  "price": 3500, "samples": [], "sales": []},
}

# 6-month sales history (Dec → May)
_sales_data = {
    "Dress":   [80, 65, 45, 90, 110, 95],
    "Trouser": [40, 42, 38, 45,  50, 55],
    "Shirt":   [60, 55, 48, 62,  58, 75],
    "Skirt":   [25, 22, 30, 48,  60, 72],
    "Coat":    [90, 85, 70, 30,  15, 10],
}
_months = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"]

def _seed_sales():
    for item, counts in _sales_data.items():
        stock_db[item]["sales"] = [
            {
                "month":      _months[i],
                "units_sold": counts[i],
                "revenue":    counts[i] * stock_db[item]["price"]
            }
            for i in range(len(_months))
        ]

_seed_sales()

# Alert & notification logs
designer_alerts        = []
customer_notifications = []

# ─────────────────────────────────────────────────────────────
#  TERMINAL HELPERS
# ─────────────────────────────────────────────────────────────

def _c(text, code):
    """ANSI colour wrapper."""
    codes = {
        "red": 31, "green": 32, "yellow": 33, "blue": 34,
        "magenta": 35, "cyan": 36, "white": 37, "bold": 1
    }
    return f"\033[{codes.get(code, 37)}m{text}\033[0m"

def _bar(value, max_val, width=28):
    filled = int((value / max_val) * width) if max_val > 0 else 0
    return "█" * filled + "░" * (width - filled)

def _sep(char="─", w=66):
    print(char * w)

def _ts():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# ─────────────────────────────────────────────────────────────
#  ALERT & NOTIFICATION SYSTEM
# ─────────────────────────────────────────────────────────────

def _send_designer_alert(item, stock):
    """Create an alert for the designer."""
    if stock == 0:
        msg  = f"🚨 URGENT — '{item}' is OUT OF STOCK. Customers are waiting. Restock immediately."
        kind = "OUT_OF_STOCK"
    else:
        msg  = f"⚠️  LOW STOCK — '{item}' has only {stock} unit(s) left. Please add more stock."
        kind = "LOW_STOCK"
    alert = {"id": len(designer_alerts)+1, "type": kind,
             "item": item, "stock": stock, "message": msg,
             "timestamp": _ts(), "read": False}
    designer_alerts.append(alert)
    return alert


def _notify_customer(item):
    """Create a sold-out notification for customers."""
    msg = (f"We're sorry — '{item}' is currently sold out. "
           "We'll notify you as soon as it's back in stock.")
    notif = {"item": item, "message": msg, "timestamp": _ts()}
    customer_notifications.append(notif)
    return notif


def check_and_send_alerts():
    """Scan all items and fire alerts / notifications as needed."""
    for item, data in stock_db.items():
        if data["stock"] == 0:
            _send_designer_alert(item, 0)
            _notify_customer(item)
        elif data["stock"] <= LOW_THRESHOLD:
            _send_designer_alert(item, data["stock"])

# ─────────────────────────────────────────────────────────────
#  DESIGNER TOOLS
# ─────────────────────────────────────────────────────────────

def designer_upload_sample(item_name, image_path, description=""):
    """
    Upload a sample image for an item (max 10 per item).

    Parameters
    ----------
    item_name   : str  — one of FASHION_ITEMS
    image_path  : str  — file path to the image
    description : str  — optional caption

    Returns
    -------
    dict with success flag and message
    """
    if item_name not in stock_db:
        return {"success": False,
                "message": f"❌ Unknown item '{item_name}'. "
                           f"Valid items: {', '.join(FASHION_ITEMS)}"}

    samples = stock_db[item_name]["samples"]

    if len(samples) >= MAX_SAMPLES:
        return {"success": False,
                "message": f"❌ Max {MAX_SAMPLES} samples already uploaded for '{item_name}'. "
                           "Remove one before adding more."}

    ext = os.path.splitext(image_path)[1].lower()
    if ext not in VALID_EXTS:
        return {"success": False,
                "message": f"❌ Invalid file type '{ext}'. "
                           f"Allowed: {', '.join(VALID_EXTS)}"}

    sample = {
        "id":          len(samples) + 1,
        "path":        image_path,
        "description": description or f"{item_name} sample {len(samples)+1}",
        "uploaded_at": _ts()
    }
    samples.append(sample)
    return {"success": True,
            "message": f"✅ Sample {len(samples)}/{MAX_SAMPLES} uploaded for '{item_name}'.",
            "sample":  sample}


def designer_update_stock(item_name, new_stock):
    """Update the stock quantity for an item."""
    if item_name not in stock_db:
        return {"success": False, "message": f"❌ Unknown item '{item_name}'."}
    if new_stock < 0:
        return {"success": False, "message": "❌ Stock cannot be negative."}
    old = stock_db[item_name]["stock"]
    stock_db[item_name]["stock"] = new_stock
    return {"success": True,
            "message": f"✅ '{item_name}' stock updated: {old} → {new_stock} units."}

# ─────────────────────────────────────────────────────────────
#  CUSTOMER DASHBOARD — SMART ITEMS STOCKED
# ─────────────────────────────────────────────────────────────

def show_customer_dashboard():
    """Customer-facing view: stock status + sold-out notices."""
    os.system("cls" if os.name == "nt" else "clear")

    print(_c("╔══════════════════════════════════════════════════════════════════╗", "cyan"))
    print(_c("║         SmartServe SMEs  —  CUSTOMER DASHBOARD                  ║", "cyan"))
    print(_c("║                  📦  SMART ITEMS STOCKED                        ║", "cyan"))
    print(_c("╚══════════════════════════════════════════════════════════════════╝", "cyan"))
    print(f"  📅 {_ts()}\n")

    # ── Stock status table ────────────────────────────────────────────────
    print(_c("  ITEM AVAILABILITY", "bold"))
    _sep()
    print(f"  {'ITEM':<10} {'STOCK':>6}  {'STATUS':<24} {'PRICE (KSh)':>12}  SAMPLES")
    _sep()

    for item, data in stock_db.items():
        stock   = data["stock"]
        price   = data["price"]
        n_samp  = len(data["samples"])

        if stock == 0:
            status = _c("● SOLD OUT", "red")
            s_str  = _c("0", "red")
        elif stock <= LOW_THRESHOLD:
            status = _c(f"● LOW  ({stock} left)", "yellow")
            s_str  = _c(str(stock), "yellow")
        else:
            status = _c("● IN STOCK", "green")
            s_str  = _c(str(stock), "green")

        print(f"  {item:<10} {s_str:>6}  {status:<34} {price:>12,}  [{n_samp}/{MAX_SAMPLES}]")

    _sep()

    # ── Sold-out feedback to customers ────────────────────────────────────
    sold_out = [i for i, d in stock_db.items() if d["stock"] == 0]
    if sold_out:
        print()
        print(_c("  🔴 SOLD OUT — We'll notify you when these are restocked:", "red"))
        for item in sold_out:
            notif = next((n for n in customer_notifications if n["item"] == item), None)
            msg   = notif["message"] if notif else f"'{item}' is sold out. Check back soon."
            print(f"    • {msg}")

    # ── Low-stock warnings ────────────────────────────────────────────────
    low = [i for i, d in stock_db.items() if 0 < d["stock"] <= LOW_THRESHOLD]
    if low:
        print()
        print(_c("  ⚠️  ALMOST GONE — Order soon:", "yellow"))
        for item in low:
            print(f"    • {item}: only {stock_db[item]['stock']} unit(s) left!")

    print()

# ─────────────────────────────────────────────────────────────
#  SALES TRENDS CHART
# ─────────────────────────────────────────────────────────────

def show_sales_trends():
    """6-month sales bar chart for every item."""
    print(_c("\n  📈 SALES TRENDS — Last 6 Months", "bold"))
    _sep()

    all_units = [e["units_sold"]
                 for d in stock_db.values()
                 for e in d["sales"]]
    max_units = max(all_units) if all_units else 1

    colors = ["cyan", "green", "yellow", "magenta", "blue"]

    for idx, (item, data) in enumerate(stock_db.items()):
        if not data["sales"]:
            continue
        color   = colors[idx % len(colors)]
        total   = sum(e["units_sold"] for e in data["sales"])
        revenue = sum(e["revenue"]    for e in data["sales"])
        last    = data["sales"][-1]["units_sold"]
        prev    = data["sales"][-2]["units_sold"] if len(data["sales"]) >= 2 else last
        arrow   = "↑" if last > prev else ("↓" if last < prev else "→")
        a_col   = "green" if last > prev else ("red" if last < prev else "white")

        print(f"\n  {_c(item, color)} {_c(arrow, a_col)}"
              f"  |  Total: {total} units  |  Revenue: KSh {revenue:,}")

        for entry in data["sales"]:
            bar = _bar(entry["units_sold"], max_units)
            print(f"    {entry['month']:>3}  {bar}  "
                  f"{entry['units_sold']:>3} units  KSh {entry['revenue']:>9,}")

    _sep()

    # ── Top performers ────────────────────────────────────────────────────
    print(_c("\n  🏆 TOP PERFORMERS (by total units sold)", "bold"))
    ranked = sorted(
        stock_db.items(),
        key=lambda x: sum(e["units_sold"] for e in x[1]["sales"]),
        reverse=True
    )
    medals = ["🥇", "🥈", "🥉", "  4.", "  5."]
    for i, (item, data) in enumerate(ranked):
        total   = sum(e["units_sold"] for e in data["sales"])
        revenue = sum(e["revenue"]    for e in data["sales"])
        print(f"    {medals[i]}  {item:<10} — {total:>3} units  |  KSh {revenue:,}")

    # ── Trend summary ─────────────────────────────────────────────────────
    print(_c("\n  📊 TREND SUMMARY", "bold"))
    _sep()
    rising  = [i for i, d in stock_db.items()
               if len(d["sales"]) >= 2
               and d["sales"][-1]["units_sold"] > d["sales"][-2]["units_sold"]]
    falling = [i for i, d in stock_db.items()
               if len(d["sales"]) >= 2
               and d["sales"][-1]["units_sold"] < d["sales"][-2]["units_sold"]]
    stable  = [i for i, d in stock_db.items()
               if len(d["sales"]) >= 2
               and d["sales"][-1]["units_sold"] == d["sales"][-2]["units_sold"]]

    if rising:
        print(f"  {_c('↑ Rising demand: ', 'green')} {', '.join(rising)}")
    if falling:
        print(f"  {_c('↓ Falling demand:', 'red')}  {', '.join(falling)}")
    if stable:
        print(f"  {_c('→ Stable demand: ', 'white')} {', '.join(stable)}")
    _sep()

# ─────────────────────────────────────────────────────────────
#  DESIGNER DASHBOARD
# ─────────────────────────────────────────────────────────────

def show_designer_dashboard():
    """Designer view: unread alerts, stock overview, sample status."""
    print(_c("\n╔══════════════════════════════════════════════════════════════════╗", "magenta"))
    print(_c("║         SmartServe SMEs  —  DESIGNER DASHBOARD                  ║", "magenta"))
    print(_c("╚══════════════════════════════════════════════════════════════════╝", "magenta"))

    # ── Unread alerts ─────────────────────────────────────────────────────
    unread = [a for a in designer_alerts if not a["read"]]
    if unread:
        print(_c(f"\n  🔔 {len(unread)} NEW ALERT(S):", "yellow"))
        _sep()
        for alert in unread:
            col = "red" if alert["type"] == "OUT_OF_STOCK" else "yellow"
            print(f"  [{alert['timestamp']}]  {_c(alert['message'], col)}")
            alert["read"] = True
        _sep()
    else:
        print(_c("\n  ✅ No new alerts — all items are well stocked.", "green"))

    # ── Stock & sample overview ───────────────────────────────────────────
    print(_c("\n  📦 STOCK & SAMPLE STATUS", "bold"))
    _sep()
    print(f"  {'ITEM':<10} {'STOCK':>6}  {'SAMPLES':<14}  STATUS")
    _sep()

    for item, data in stock_db.items():
        stock   = data["stock"]
        n_samp  = len(data["samples"])
        bar     = "▓" * n_samp + "░" * (MAX_SAMPLES - n_samp)

        if stock == 0:
            status = _c("RESTOCK NEEDED", "red")
        elif stock <= LOW_THRESHOLD:
            status = _c("LOW — add stock", "yellow")
        else:
            status = _c("OK", "green")

        print(f"  {item:<10} {stock:>6}  [{bar}] {n_samp}/{MAX_SAMPLES}  {status}")

    _sep()

    # ── Upload guide ──────────────────────────────────────────────────────
    print(_c("\n  📸 HOW TO UPLOAD SAMPLES", "bold"))
    print("  Call:  designer_upload_sample(item_name, image_path, description)")
    print(_c('  e.g.   designer_upload_sample("Dress", "uploads/dress_01.jpg", "Summer floral")', "cyan"))
    print(f"  • Max {MAX_SAMPLES} samples per item")
    print(f"  • Allowed formats: {', '.join(VALID_EXTS)}")
    _sep()

# ─────────────────────────────────────────────────────────────
#  FULL DEMO
# ─────────────────────────────────────────────────────────────

def run_demo():
    """Run a complete demonstration of all features."""

    # 1. Trigger alerts based on current stock
    check_and_send_alerts()

    # 2. Customer dashboard
    show_customer_dashboard()

    # 3. Sales trends
    show_sales_trends()

    # 4. Designer uploads samples (10 per item demonstrated)
    print(_c("\n  📸 DESIGNER UPLOADING SAMPLES…", "bold"))
    _sep()
    uploads = [
        # Dress — 10 samples
        ("Dress",   "uploads/dress_summer_01.jpg",    "Summer floral maxi"),
        ("Dress",   "uploads/dress_evening_02.jpg",   "Evening cocktail"),
        ("Dress",   "uploads/dress_casual_03.jpg",    "Casual day dress"),
        ("Dress",   "uploads/dress_kitenge_04.jpg",   "Kitenge wrap dress"),
        ("Dress",   "uploads/dress_office_05.jpg",    "Office shift dress"),
        ("Dress",   "uploads/dress_ankara_06.jpg",    "Ankara print dress"),
        ("Dress",   "uploads/dress_lace_07.jpg",      "Lace evening gown"),
        ("Dress",   "uploads/dress_denim_08.jpg",     "Denim midi dress"),
        ("Dress",   "uploads/dress_chiffon_09.jpg",   "Chiffon wrap"),
        ("Dress",   "uploads/dress_bodycon_10.jpg",   "Bodycon dress"),
        # Trouser — 10 samples
        ("Trouser", "uploads/trouser_formal_01.jpg",  "Formal slim-fit"),
        ("Trouser", "uploads/trouser_chino_02.jpg",   "Chino trouser"),
        ("Trouser", "uploads/trouser_cargo_03.jpg",   "Cargo trouser"),
        ("Trouser", "uploads/trouser_wide_04.jpg",    "Wide-leg trouser"),
        ("Trouser", "uploads/trouser_linen_05.jpg",   "Linen trouser"),
        ("Trouser", "uploads/trouser_denim_06.jpg",   "Denim trouser"),
        ("Trouser", "uploads/trouser_ankara_07.jpg",  "Ankara print"),
        ("Trouser", "uploads/trouser_jogger_08.jpg",  "Jogger trouser"),
        ("Trouser", "uploads/trouser_pleated_09.jpg", "Pleated trouser"),
        ("Trouser", "uploads/trouser_shorts_10.jpg",  "Tailored shorts"),
        # Shirt — 10 samples
        ("Shirt",   "uploads/shirt_white_01.jpg",     "White formal"),
        ("Shirt",   "uploads/shirt_stripe_02.jpg",    "Striped casual"),
        ("Shirt",   "uploads/shirt_ankara_03.jpg",    "Ankara print"),
        ("Shirt",   "uploads/shirt_linen_04.jpg",     "Linen shirt"),
        ("Shirt",   "uploads/shirt_polo_05.jpg",      "Polo shirt"),
        ("Shirt",   "uploads/shirt_denim_06.jpg",     "Denim shirt"),
        ("Shirt",   "uploads/shirt_floral_07.jpg",    "Floral print"),
        ("Shirt",   "uploads/shirt_mandarin_08.jpg",  "Mandarin collar"),
        ("Shirt",   "uploads/shirt_oversized_09.jpg", "Oversized shirt"),
        ("Shirt",   "uploads/shirt_kitenge_10.jpg",   "Kitenge shirt"),
        # Skirt — 10 samples
        ("Skirt",   "uploads/skirt_pencil_01.jpg",    "Pencil skirt"),
        ("Skirt",   "uploads/skirt_maxi_02.jpg",      "Maxi skirt"),
        ("Skirt",   "uploads/skirt_mini_03.jpg",      "Mini skirt"),
        ("Skirt",   "uploads/skirt_pleated_04.jpg",   "Pleated skirt"),
        ("Skirt",   "uploads/skirt_ankara_05.jpg",    "Ankara print"),
        ("Skirt",   "uploads/skirt_denim_06.jpg",     "Denim skirt"),
        ("Skirt",   "uploads/skirt_wrap_07.jpg",      "Wrap skirt"),
        ("Skirt",   "uploads/skirt_lace_08.jpg",      "Lace overlay"),
        ("Skirt",   "uploads/skirt_slit_09.jpg",      "Side-slit skirt"),
        ("Skirt",   "uploads/skirt_kitenge_10.jpg",   "Kitenge skirt"),
        # Coat — 10 samples
        ("Coat",    "uploads/coat_trench_01.jpg",     "Trench coat"),
        ("Coat",    "uploads/coat_wool_02.jpg",       "Wool overcoat"),
        ("Coat",    "uploads/coat_denim_03.jpg",      "Denim jacket"),
        ("Coat",    "uploads/coat_leather_04.jpg",    "Leather jacket"),
        ("Coat",    "uploads/coat_blazer_05.jpg",     "Blazer coat"),
        ("Coat",    "uploads/coat_puffer_06.jpg",     "Puffer jacket"),
        ("Coat",    "uploads/coat_ankara_07.jpg",     "Ankara coat"),
        ("Coat",    "uploads/coat_linen_08.jpg",      "Linen blazer"),
        ("Coat",    "uploads/coat_bomber_09.jpg",     "Bomber jacket"),
        ("Coat",    "uploads/coat_kitenge_10.jpg",    "Kitenge coat"),
    ]

    for item, path, desc in uploads:
        result = designer_upload_sample(item, path, desc)
        print(f"  {result['message']}")

    # 5. Designer restocks sold-out items
    print(_c("\n  🔄 DESIGNER RESTOCKING SOLD-OUT ITEMS…", "bold"))
    _sep()
    for item, qty in [("Dress", 25), ("Skirt", 18)]:
        r = designer_update_stock(item, qty)
        print(f"  {r['message']}")

    # 6. Re-check alerts after restock
    check_and_send_alerts()

    # 7. Designer dashboard (shows alerts + sample progress)
    show_designer_dashboard()

    # 8. Customer notifications summary
    print(_c("\n  📬 CUSTOMER NOTIFICATIONS SENT:", "bold"))
    _sep()
    if customer_notifications:
        for n in customer_notifications:
            print(f"  [{n['timestamp']}]  {n['message']}")
    else:
        print("  No customer notifications.")
    _sep()

    print(_c("\n  ✅ SMART ITEMS STOCKED module loaded successfully.\n", "green"))


# ─────────────────────────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    run_demo()
