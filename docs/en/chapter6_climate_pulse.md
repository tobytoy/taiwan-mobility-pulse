# Chapter 6: Islandwide Climate Pulse & Microclimate Livability — 30-Year Variations, Microclimate Extremes, and 12-Month Seasonal Tidal Rhythms

🌐 **Language Switcher / 語言切換**: [ 🇬🇧 English ] | [ 🇹🇼 繁體中文版 ](../chapter6_climate_pulse.md)

> *"Across an island spanning merely 394 kilometers from north to south, yet thrusting nearly 4,000 meters into the sky along its central spine, weather is never uniform background noise. It is the primary exogenous force constantly reshaping surface travel routes, traffic safety, and livability."*

---

## 6.1 Climate as the Primary Exogenous Force Reshaping Ground Mobility

In conventional transportation and urban planning, analysts frequently fixate on "rigid supply" (road geometry, train headways, station capacity) and "rigid demand" (employment commutes, school districts). However, when meteorological extremes strike:

* An afternoon cloudburst dumping over 90 mm of rain in one hour causes urban bus patronage to plummet by 35%, driving ground pedestrians into underground metro passages;
* A strong continental cold surge coupled with the northeast monsoon causes motorcycle and YouBike bikeshare usage in Keelung and the Northeast Coast to fall below 40% of clear-day levels;
* Extended summer heatwaves ($\ge 35^\circ\text{C}$) compress pedestrian walking tolerance from 800 meters to under 300 meters, dramatically shrinking the effective transit catchment shed around metro stations.

To empirically measure how climate governs surface mobility across Taiwan, this project integrated **nearly 30 years (1998–2024) of continuous observations from the Central Weather Administration (CWA) CODiS repository** with multimodal ticketing and eTag freeway flows, synthesizing the **Climate Pulse Lab**.

---

## 6.2 30-Year Climate Variations across Taiwan (1998–2024 Empirical Findings)

By analyzing daily and monthly time series across 29 first-order meteorological stations over the past 30 years, we find that climate warming in Taiwan is not spatially uniform, but characterized by **dramatic spatial divergence and extreme concentration**:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                 Core Findings of 30-Year Climate Trends (1998–2024)             │
├───────────────────┬───────────────────────────────┬─────────────────────────────┤
│ Dimension         │ Islandwide Macro Trend        │ Spatial Extremes & Hotspots │
├───────────────────┼───────────────────────────────┼─────────────────────────────┤
│ 🌡️ Mean Temp Rise │ Island average net rise +0.72°C│ Taipei Basin exceeds +0.84°C│
│                   │ (Recent decade vs. 1998-2007) │ Coastal breeze zones +0.2°C │
├───────────────────┼───────────────────────────────┼─────────────────────────────┤
│ 🔥 Extreme Heat   │ Days with Max Temp ≥35°C      │ Taipei gains +21.9 days/yr  │
│    (Hot35 Days)   │ doubled islandwide (+18.4 d)  │ East Rift Foehn +19.5 d/yr  │
├───────────────────┼───────────────────────────────┼─────────────────────────────┤
│ 📉 Rain Days Drop │ Rain days down -12.6 days/yr  │ Windward North/Central drops│
│                   │ Total rainfall stable         │ Cloudburst intensity spikes │
└───────────────────┴───────────────────────────────┴─────────────────────────────┘
```

### 1. The Taipei Basin "Heat Island Trap"
The Taipei Station (466920) recorded a net temperature increase of **+0.54°C to +0.84°C** over the past 30 years. The annual number of scorching days exceeding $35^\circ\text{C}$ surged from an annual average of 36.7 days in the late 1990s to **58.6 days** in the most recent five years (an annual increase of **+21.9 days**).  
The basin topography prevents maritime sea breezes from flushing trapped heat. Combined with asphalt coverage, underground subway heat ventilation shafts, and millions of air conditioning outdoor condensers, the metropolitan area experiences pronounced nocturnal heat retention (temperatures hovering above $30^\circ\text{C}$ past 22:00), placing massive cooling loads on transit hubs.

### 2. "Fewer Rainy Days, Fiercer Storms"
Across Taiwan, annual rainy days decreased by 10 to 15 days, yet total annual precipitation remained steady or rose slightly in mountainous areas. This confirms the perilous climate trend of **"moisture release concentration"**: gentle drizzle days are compressed, replaced by short-duration, high-intensity convective cloudbursts. This trend poses acute operational tests for urban stormwater drainage and freeway hydroplaning resistance.

### 3. Top 5 Climatological Anchors
In contrast to inland urban warming, five regions exhibit exceptional natural climate stability:
1. **Hengchun Peninsula (467590)**: Surrounded by ocean and the warm Kuroshio Current; 30-year temperature variation was only **+0.18°C**.
2. **Penghu Archipelago (467350)**: Strong strait sea breezes year-round and low impervious cover keep temperatures stable.
3. **Alishan & Mountain Forests (467530)**: Virgin forest transpiration creates natural cooling buffers shielded from urban heat islands.
4. **Orchid Island & Green Island (467620)**: Deep Pacific oceanic currents provide thermal inertia.
5. **Chenggong Coast, Taitung (467610)**: Backed by coastal mountains and facing deep oceanic upwelling, land-sea breeze cycles form a natural cooling shield.

---

## 6.3 Microclimate Livability & Extreme Leaderboards

By standardizing 30-year observations of sunshine, precipitation, relative humidity, commute umbrella rates, and natural topographic shelter across 29 stations, the system synthesized five benchmark leaderboards:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│               National Microclimate Livability & Extreme Rankings               │
├───────────────────┬────────────────────────────────┬────────────────────────────┤
│ Dimension         │ 👑 Champion Station (Highest)   │ 🛡️ Optimal / Resilient Site│
├───────────────────┼────────────────────────────────┼────────────────────────────┤
│ 🍄 Dehumidifier   │ Yangmingshan Anbu (Mold: 98)   │ Penghu / Taichung (Mold: 43│
│    Full-Load List │ Linkou Plateau (77) · Keelung(65│ Moderate humidity, sunshine│
├───────────────────┼────────────────────────────────┼────────────────────────────┤
│ 🛡️ Natural Typhoon│ Taichung (Shelter Score: 85)   │ Orchid Island (Wind: 28)   │
│    Shelter Harbor │ Changhua (83) · Puli (82)      │ Green Island · Hengchun    │
├───────────────────┼────────────────────────────────┼────────────────────────────┤
│ 🌂 Dry Commute    │ Taichung City (Umbrella: 21.4%)│ Keelung City (Umbrella: 48%│
│    Leaderboard    │ Changhua (22.1%) · Tainan (23%)│ Suao (46.8%) · Anbu (55%)  │
├───────────────────┼────────────────────────────────┼────────────────────────────┤
│ ☀️ Sunshine Capital│ Tainan City (2,185 hrs/year)   │ Anbu (952 hrs/year)        │
│                   │ Kaohsiung (2,112h) · Hengchun  │ Keelung Rainy Port (1,224h)│
├───────────────────┼────────────────────────────────┼────────────────────────────┤
│ 🌙 Cool Summer    │ Alishan (No AC Needed: 98 pts) │ Taipei Heat Island (38 pts)│
│    Nights         │ Sun Moon Lake (85) · Sanxing(78│ Chiayi Inland Plain (41)   │
└───────────────────┴───────────────────────────────┴─────────────────────────────┘
```

### 1. 🍄 Mold Index Top 3: The 24/7 Dehumidifier Zones
* **#1 Yangmingshan Anbu / Huoshaoliao (Mold Index: 98)**: Windward frontline of the northeast monsoon; annual rainfall exceeds 4,000mm, with over 210 days exceeding relative humidity $>85\%$.
* **#2 New Taipei Linkou Plateau (Mold Index: 77)**: Tableland elevation at 250m; autumn/winter advection fog and inversion layers cause heavy indoor dampness.
* **#3 Keelung Rainy Port (Mold Index: 65)**: Locked by monsoon fronts from October through February; dehumidifier tanks fill daily.

### 2. 🛡️ Natural Typhoon Shelter: The Central Mountain Range Barrier
Soaring over 3,000 meters, the Central Mountain Range creates a natural **"Typhoon Shield"**:  
When severe typhoons make landfall on the east coast, gale-force southeasterly winds and rain bands are intercepted and forced upwards on the eastern slopes. Taichung, Changhua, and the Nantou Basin sit in the leeward subsidence zone. Historical typhoon data confirms that Taichung records the lowest average peak gusts and disaster loss indices among lowland counties (**Shelter Score: 85**), making it an optimal sanctuary for semiconductor fabs and precision manufacturing.

### 3. 🌂 Dry Commuting: The Rain-Free Living Corridor
For scooter riders and pedestrians, rain is the primary mobility hurdle. Data shows that the **plains south of Taichung down to Tainan** form Taiwan's driest commuter corridor, with peak-hour rain probabilities below **22%**. In contrast, Keelung and Yilan experience commuter umbrella rates near **50%**, requiring comprehensive sheltered walkway infrastructure at transit interchanges.

---

## 6.4 12-Month Islandwide Seasonal Climatology Tidal Rhythms

Taiwan's climate is not static. Driven by global atmospheric circulation, it undergoes dynamic ebb and flow across the 12 months of the year. Using the interactive seasonal player in our online lab, users can witness the monthly transitions across all 29 stations:

* **January to February (Winter Monsoon)**: Northern windward stations (Anbu, Keelung, Yilan) plunge into overcast gloom, while central and southern plains bask in golden sunshine ($22^\circ\text{C}$).
* **May to June (Meiyu Front & Cloudbursts)**: Islandwide cloudbursts emerge; reservoirs replenish, while commuter rail demand surges as riders abandon surface scooters.
* **July to August (Midsummer Convection & Typhoons)**: High temperatures peak islandwide; Taipei Basin experiences extreme heat ($38^\circ\text{C}$), while Alishan and Sun Moon Lake become prime retreat corridors.
* **October to November (Autumn Equinox Transition)**: Stable golden weather arrives in the west; East Coast swells attract surf enthusiasts.

---

## 6.5 Extended Decision Models

The CODiS analytical pipeline incorporates four advanced operational decision models:

1. **Weather Convection in Commercial Districts**:  
   Quantifies the rate at which pedestrians shift from open street shopping to covered shopping mall bridges and underground subway malls under heavy rain ($>50\text{mm}$).
2. **Solar PV & EV Fast-Charging ROI Engine**:  
   Evaluates 30-year solar irradiance across 29 stations to calculate payback periods for integrated solar-storage 360kW EV fast chargers (Penghu/Tainan: 4.5 years vs. Keelung: 9.2 years).
3. **Typhoon Shielding Backtesting**:  
   Simulates 6 historical super-typhoons (Herb, Morakot, Soudelor) across 29 stations, proving Central Mountain Range attenuation factors (Taichung achieved 68% wind-speed shielding, scoring 96 in resilience).
4. **Reservoir Drought-to-Flood Rapid Inversion**:  
   Monitors maximum consecutive dry days (CDD) alongside extreme rapid-refill events ($>40\%$ storage gain within 48 hours requiring emergency flood discharge), identifying critical water infrastructure vulnerabilities (Zengwen Reservoir scores 98 in inversion vulnerability).

---

## 6.6 OpenData Inundation Disaster & IoT Sensor Integration

To close the loop between weather, hydrology, and road transport, the system links with open datasets from the Water Resources Agency (WRA) and IoT sensors:

| Dataset ID & Title | Agency | Coordinates | Key Fields | Mobility Validation Link |
|:---|:---|:---|:---|:---|
| **Dataset 25770**<br>Historical Typhoon Floods | WRA | GeoJSON (WGS84) | `typhoon_name`, `total_inundated_km2`, `max_depth_cm` | Correlates flooded surface polygons with eTag freeway speed plunges (-75% to -92%). |
| **Dataset 130016**<br>5-Year Flood Disaster Points | NCDR | CSV / JSON | `FID`, `lat`, `lng`, `flood_count_5y`, `threshold_rain_mm_hr` | Calibrates cloudburst thresholds (e.g. 45mm/h) against off-ramp traffic delays. |
| **Dataset 142980/142979**<br>IoW Road Inundation Sensors | WRA / IoW | JSON API (Hourly) | `sensor_id`, `latest_depth_cm`, `warning_threshold_cm` | Links ultrasonic water depth sensors to road control tiers (Slow / Hydroplane / Closed). |

---

## 6.7 🛠️ Hands-on Operational Walkthrough: Exploring the Climate Pulse Lab

* **[👉 Launch Live Application: Climate Pulse & Livability Lab](https://tobytoy.github.io/taiwan-mobility-pulse/#climate-lab)**

### Operational Steps:
1. Click the link above or select **【Climate Pulse & Livability Map】** on the top navigation bar.
2. **Toggle the 12-Month Seasonal Player**:  
   Click the **"Play"** button on the bottom seasonal bar to watch station icons, temperatures, and rain glyphs transform across January through December.
3. **Inspect Station Radar Profiles**:  
   Click on **Taipei (466920)**, **Taichung (467490)**, or **Alishan (467530)** on the map to inspect their 6-axis radar charts (Rain Defense, Thermal Comfort, Typhoon Shelter, Sunshine Asset, Anti-Mold, Night Cooling).
4. **Explore the Leaderboard Tables**:  
   Toggle through the five extreme leaderboards to examine dehumidifier workloads and commuting umbrella rates.

---

## 6.8 🔍 Decision-Making Insights

> **💡 Real Estate & Infrastructure Takeaway**:  
> Microclimate is the silent factor determining long-term asset value. An interchange or transit hub with a high natural typhoon shelter score and dry commuting conditions experiences significantly lower maintenance overhead, fewer weather-induced cancellations, and higher customer dwell time throughout the year.

Having analyzed macro climate forces across the island, we now transition to the economic pulse: how do these passenger flows translate into commercial vitality, retail opportunities, and EV charging investments?

👉 **[Proceed to Chapter 7: Commercial Pulse & Station Hub Intelligence](chapter7_commercial_pulse.md)**
