# Chapter 3: Intercity Arteries & Urban Mobility Corridors — 111 Dynamic Flow Corridors

🌐 **Language Switcher / 語言切換**: [ 🇬🇧 English ] | [ 🇹🇼 繁體中文版 ](../chapter3_flow_arteries.md)

> *"If Taiwan were a living, breathing organism, then its 111 dynamic mobility corridors would be its arteries and veins; these coursing particles are not mere computer code, but the daily life journeys of twenty-three million souls."*

---

## 3.1 Corridor Network Principles: From Isolated Stations to Connected Dimensions

Traditional transportation statistics often dwell upon isolated leaderboards of single stations (e.g., "Taipei Main Station ranks #1; Banqiao ranks #2"). However, point-based metrics cannot answer the core questions of urban mobility: **Where do people originate? Where are they bound? Which critical bottlenecks do they traverse?**

This system transcends point-based limitations. By intersecting Origin-Destination (OD) pairs from TICP electronic ticketing with contiguous passage paths across eTag highway gantries, we synthesized **111 of Taiwan's most representative dynamic mobility corridors**.

These corridors span five major multimodal transit categories:
1. **High-Speed Rail (THSR)**: The 350-kilometer western corridor backbone enabling the one-day living sphere.
2. **Taiwan Railway (TRA)**: The round-island intercity trunk line and regional commuter lifeblood.
3. **Metropolitan Rail Transit (Metro)**: High-density urban circulation across Taipei, New Taipei, Taoyuan, Taichung, and Kaohsiung.
4. **Intercity Highway Coaches**: Direct point-to-point commuter buses (e.g., Keelung ↔ Taipei; Nankan ↔ Taipei).
5. **Freeway Freight & Tourism Expressways**: High-capacity industrial logistics and scenic leisure routes monitored via eTag.

---

## 3.2 Industrial Logistics Arteries: Sleepless Heavy Corridors

Taiwan is an international epicenter for semiconductor fabrication and precision hardware. Beyond daytime commuter crowds, a massive undercurrent pulses across the island: **Industrial Freight Corridors**. By analyzing passage records for eTag vehicle classes 32 (small trucks), 42 (heavy trucks), and 51/52 (tractor-trailers), we reconstructed Taiwan's three vital tech logistics corridors:

1. **Freeway 1 Silicon Corridor (Hsinchu Science Park ↔ Port of Taipei / Taoyuan Airport)**:
   * **Trajectory**: Hsinchu Science Park (HSP) ➔ Freeway 1 / Provincial Highway 66 ➔ Port of Taipei & Farglory Free Trade Zone.
   * **Characteristics**: 24-hour expedited transit for high-value semiconductor wafers and precision components. Between 00:00 and 04:00 at night, heavy box vans maintain remarkably high traffic densities.
2. **Central Port-Science Linked Corridor (Port of Taichung ↔ Central Taiwan Science Park)**:
   * **Trajectory**: Port of Taichung Container Terminals ➔ Provincial Highway 74 / Freeway 4 ➔ Central Taiwan Science Park (CTSP) Taichung Base.
   * **Characteristics**: Specialized transport for offshore wind turbine components, wafer foundry chemical tankers, and precision machinery export.
3. **Southern Semiconductor S-Corridor (Port of Kaohsiung ↔ Southern Taiwan Science Park)**:
   * **Trajectory**: Port of Kaohsiung Qianzhen Dedicated Freight Way ➔ Freeway 1 / Provincial Highway 86 ➔ Southern Taiwan Science Park (STSP) Xinshi.
   * **Characteristics**: Upstream chemical reagents and 3nm advanced fabrication supply chain deliveries.

![Figure 3.1: Dynamic Flow Corridors Map — Sleepless Heavy Freight Logistics](../images/ch3_corridor_freight_logistics.webp)
*Figure 3.1: Live Application Interface — Flow corridors filtered by "🚛 Industrial Logistics", highlighting the Freeway 1 Silicon Corridor and Port-Science logistics links operating around the clock.*

---

## 3.3 Holiday Tourism Expressways: The Great Exodus to Mountains and Seas

In stark contrast to workday commuting, weekends and national holidays trigger a dramatic **"Polarity Inversion"** across Taiwan. Crowds rapidly evacuate metropolitan cores, surging into four national scenic corridors:

1. **Freeway 5 Hsuehshan Tunnel Yilan Express (Nangang ↔ Jiaoxi / Luodong)**:
   * While serving regional commuters on weekdays, **southbound traffic surges by +280% on Saturday mornings (07:00–11:00)**, while Sunday afternoons (14:00–20:00) produce northbound vehicle queues extending dozens of kilometers.
2. **Freeway 6 Ailan Sun Moon Lake Corridor (Wufeng ➔ Puli / Ailan)**:
   * The primary artery funneling central metropolitan crowds toward Cingjing Farm, Sun Moon Lake, and Hehuanshan; small passenger cars (Class 31) account for over 88% of holiday traffic.
3. **South-Link Tourism Corridor (Pingtung Nanzhou ➔ Kenting Hengchun)**:
   * The southern holiday trunk line; southbound flows swell from Friday evening, returning toward Pingtung and the Freeway 3 Nanzhou Interchange late Sunday.
4. **East Rift Valley Leisure Express (Taitung ➔ Jiaoxi / Hualien)**:
   * Operated jointly by TRA EMU3000 New Ziqiang expresses and private driving along the Suhua Highway Improvement project.

![Figure 3.2: Weekend Tourism Migration — Surge of Flow Particles Toward Scenic Corridors](../images/ch3_corridor_holiday_tourism.webp)
*Figure 3.2: Live Application Interface — Switched to "🏖️ Holiday (Weekend)" and "🧳 Tourism" personas, showing a 320% explosion in particle flows across Freeway 5, Freeway 6, and the East Coast.*

---

## 3.4 24-Hour Spatiotemporal Tidal Rhythm

Dragging the 24-hour timeline in the live system reveals Taiwan's daily mobility heartbeat:

```
00:00 ── 05:00 │ Nocturnal Rest Period: Transit halted; highway heavy freight (42/51) dominates
07:00 ── 09:00 │ Morning Rush Surge: Radial influx toward Taipei, Banqiao, HSP, Taichung, Kaohsiung
11:00 ── 14:00 │ Midday Business & Social Mobility: Short-haul trips within district centers, lunch
17:00 ── 19:30 │ Evening Commuter Exodus: Outward rush from urban centers; particle speeds peak
21:00 ── 23:30 │ Evening Homecomings & Night Markets: Dispersal from Xinyi, Fengjia, and Liuhe markets
```

---

## 3.5 🛠️ Hands-on Operational Walkthrough: Experiencing the Dynamic FlowMap

* **[👉 Launch Live Application: Dynamic FlowMap](https://tobytoy.github.io/taiwan-mobility-pulse/#flows)**

### Operational Steps:
1. Click the link above or click **【GIS Map】➔【Dynamic FlowMap】** on the top navigation bar.
2. **Observe the Timeline Tides**:
   * Locate the timeline control bar at the bottom and click **"Play"** to watch the hour advance from 00:00 to 23:00.
   * Notice the surging density of neon particles during the 08:00 morning rush and 18:00 evening peak.
3. **Toggle "Workday" vs. "Weekend"**:
   * Switch the day type on the top or left control panel:
   * Under **Workdays**, observe rapid blue particle influxes along Keelung ➔ Taipei, the Hsinchu tech basin, and metropolitan subway webs.
   * Under **Weekends**, observe brilliant golden and orange leisure particles exploding along Freeway 5, Freeway 6, and the East Coast.
4. **Focus with the Corridor Quick Radar**:
   * Select **"HSP Tech Corridor"** or **"Freeway 5 Yilan Express"** in the corridor navigation list;
   * The camera will smoothly FlyTo and zoom into the corridor, highlighting its Origin-Destination coordinates and particle speeds!

---

## 3.6 🔍 Core Data Takeaways & Analytical Inquiries

> **💡 Analytical Insights**:
> 1. **Morning Peak 08:00 on the "HSP Tech Corridor"**:  
>    Observe the vehicle particle stream converging onto the Hsinchu Interchange from Freeway 1, contrasted with simultaneous TRA Liujia branch train arrivals, demonstrating the multimodal balance between private driving and rail transfers.
> 2. **Evening Peak 18:00 on "Keelung ➔ Taipei Highway Coaches"**:  
>    Notice the reverse flood of commuter coach particles departing Taipei Bus Station and City Hall Bus Station toward Keelung, illustrating the massive intercity capacity unlocked by the TPASS policy.

Having observed macro corridor flows, we must now investigate: when vehicles depart freeway off-ramps and enter local streets, how does local urban space absorb the shockwaves?

👉 **[Proceed to Chapter 4: Hotspot Radiation & Off-Ramp Catchment Halos](chapter4_etag_halos_heatmap.md)**
