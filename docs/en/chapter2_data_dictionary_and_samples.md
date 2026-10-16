# Chapter 2: National Data Foundation & Entity Schemas — TICP Ticketing, eTag Gantries, TDX, and CODiS Specifications

🌐 **Language Switcher / 語言切換**: [ 🇬🇧 English ] | [ 🇹🇼 繁體中文版 ](../chapter2_data_dictionary_and_samples.md)

> *"If one cannot discern which physical smart card, which microwave reflection from an overhead highway gantry, or which inductive loop in a parking garage a record represents, then even the most dazzling dynamic visualization remains nothing more than a drifting numerical mirage."*

---

## 2.1 Macro Scope & Temporal Dimensions

"Taiwan Mobility Pulse" is not built upon localized survey sampling or probabilistic models from a single cellular carrier. Instead, it directly intersects and fuses three national-level ground truth data foundations:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              National Mobility & Passenger Flow Data Infrastructure             │
├───────────────────┬───────────────────────────────┬─────────────────────────────┤
│   Data Category   │        Empirical Scale        │ Temporal Horizon & Sampling │
├───────────────────┼───────────────────────────────┼─────────────────────────────┤
│ 🚆 MOTC TICP      │ 448M Real Electronic Farecard │ Continuous coverage across  │
│    Public Transit │ Transaction Records           │ 181 to 255 full calendar    │
│    Ticketing Base │ (843M Inter-Month Journeys)   │ days; second-level tickets  │
├───────────────────┼───────────────────────────────┼─────────────────────────────┤
│ 🛣️ Freeway Bureau │ 325 Gantry Posts & Exchanges  │ 5-minute granular passage   │
│    eTag Toll Base │ Nationwide; 5 Statutory Motor │ records; 24/7 continuous    │
│                   │ Vehicle Regulatory Classes    │ non-stop traffic monitoring │
├───────────────────┼───────────────────────────────┼─────────────────────────────┤
│ 🅿️ MOTC TDX       │ 77 Major Transit Hubs & 16    │ 1-to-5 minute real-time     │
│    Parking API    │ Strategic Interchange Radii;  │ dynamic refresh; occupancy, │
│                   │ 3,000+ Public/Private Garages │ turnover & step-tier rates  │
├───────────────────┼───────────────────────────────┼─────────────────────────────┤
│ 🌧️ CWA CODiS      │ 29 First-Order Automatic/     │ Continuous hourly records;  │
│    Climate Base   │ Manned Weather Stations;      │ cumulative rainfall (mm),   │
│                   │ 30-Year Continuous Time Series│ gusts, ambient temperatures │
└───────────────────┴───────────────────────────────┴─────────────────────────────┘
```

### Observation Temporal Baseline
1. **Macro Historical Time Horizon**:  
   Encompasses continuous time-series observations across **H1 2024 through H1 2026**, covering **181 to 255 consecutive calendar days**. Includes normal academic school weeks (e.g., standard March terms), continuous workdays, Lunar New Year mass migrations, Tomb Sweeping festival, Dragon Boat festival, and Mid-Autumn festival periods.
2. **Dual Day-Type Classification**:  
   * **Workdays**: Monday through Friday (strictly excluding national holidays and severe storm/typhoon shutdown days) to capture the 9-to-5 commuting peaks and industrial logistics pulses.
   * **Weekends**: Saturday and Sunday, isolating commercial leisure shopping, metropolitan outflows, and short-haul scenic excursions.
   * **Long Consecutive Holidays**: Breaks spanning 3+ days, isolating inter-regional family homecomings and mass tourism surges.
3. **Temporal Granularity**:  
   * **Hourly (`00:00:00` ~ `23:00:00`)**: TICP public transit records are aggregated into hourly timestamps under privacy protection protocols.
   * **Transaction-Level (Seconds / Milliseconds)**: Tap-in and tap-out transactions, as well as 60-minute inter-modal transfer discount validations, are executed and resolved on smartcard chips with second-level timestamps.

---

## 2.2 TICP Transit Ticketing Data Dictionary

MOTC TICP consolidates 10 multimodal transit operators across Taiwan, structured into three primary schemas:

### 1. Urban Bus & Highway Coach Transaction Schema (`bus_to3a`)
The largest dataset capturing street-level capillary mobility (comprising 250M Taipei/New Taipei urban bus records and 26.6M intercity highway coach records):

| Field Name | Type | Physical Definition & Business Logic |
|:---|:---:|:---|
| `LineID` | `VARCHAR(16)` | **Unique Route Identifier**: Authorized route code (e.g., `0100030700` denotes Route 307). |
| `SubLineID` | `VARCHAR(8)` | **Sub-Route Identifier**: Distinguishes mainline, shuttle, express, and jumping bus variants (`01` = mainline, `02` = shuttle). |
| `Direction` | `TINYINT` | **Travel Direction**: `0` = Outbound, `1` = Inbound. |
| `HolderType` | `CHAR(1)` | **Statutory Passenger Persona**: `A` General Adult Full Fare, `S` Student Concession, `E` Senior / Disability Concession, `K` Child Fare. |
| `CardType` | `TINYINT` | **Smartcard Issuer**: `1` EasyCard, `2` iPASS, `3` icash 2.0. |
| `TicketType` | `VARCHAR(16)` | **Fare Scheme Code**: `#NOR-1200` represents TPASS Northern 1200 Monthly Pass; `NORMAL` represents self-funded e-wallet. |
| `BoardingStopID` | `VARCHAR(16)` | **Boarding Stop ID**: Station code with exact geographical coordinates. |
| `BoardingStopSequence` | `SMALLINT` | **Boarding Stop Sequence**: Stop sequence number $N$ along the trip path (1, 2, 3... N). |
| `BoardingTime` | `DATETIME` | **Boarding Timestamp**: De-identified hourly timestamp (e.g., `2026-03-11 08:00:00`). |
| `DeboardingStopID` | `VARCHAR(16)` | **Deboarding Stop ID**: Destination station stop code. |
| `DeboardingStopSequence` | `SMALLINT` | **Deboarding Sequence**: Destination sequence; the differential yields **total stops traveled**. |
| `DeboardingTime` | `DATETIME` | **Deboarding Timestamp**: Alighting transaction hourly timestamp. |
| `Fare` | `SMALLINT` | **Nominal Tariff (NT$)**: Statutory undiscounted fare (e.g., standard segment fare NT$ 15/30). |
| `Discount` | `SMALLINT` | **Statutory Subsidy Discount (NT$)**: Government subsidy or transfer concession (e.g., NT$ 8 transfer relief; NT$ 15 full TPASS waiver). |
| `Amount` | `SMALLINT` | **Net Amount Deducted (NT$)**: Actual cash deducted from card: `Amount = Fare - Discount`. |
| `TransferCode` | `VARCHAR(8)` | **Transfer Code**: `0` None, `102` Metro-to-Bus, `9902` Bus-to-Bus, `202` TRA-to-Bus. |

#### Raw Ticketing JSON Samples
```json
[
  {
    "LineID": "0100030700",
    "SubLineID": "01",
    "Direction": 0,
    "HolderType": "A",
    "CardType": 1,
    "TicketType": "#NOR-1200",
    "BoardingStopID": "TPE100341",
    "BoardingStopSequence": 14,
    "BoardingTime": "2026-03-11 08:00:00",
    "DeboardingStopID": "TPE100362",
    "DeboardingStopSequence": 23,
    "DeboardingTime": "2026-03-11 08:00:00",
    "Fare": 15,
    "Discount": 15,
    "Amount": 0,
    "TransferCode": "102"
  },
  {
    "LineID": "0100026500",
    "SubLineID": "01",
    "Direction": 1,
    "HolderType": "E",
    "CardType": 1,
    "TicketType": "NORMAL",
    "BoardingStopID": "NWT204112",
    "BoardingStopSequence": 6,
    "BoardingTime": "2026-03-11 09:00:00",
    "DeboardingStopID": "TPE101050",
    "DeboardingStopSequence": 18,
    "DeboardingTime": "2026-03-11 09:00:00",
    "Fare": 15,
    "Discount": 7,
    "Amount": 8,
    "TransferCode": "0"
  }
]
```
> **Sample Interpretation**:  
> * **Sample 1**: A **TPASS 1200 Commuter (`HolderType='A'`, `TicketType='#NOR-1200'`)** travels 9 stops on Route 307 during the 08:00 morning rush. Because the trip connects from a Taipei Metro exit (`TransferCode='102'`), the NT$ 15 fare is fully offset by the TPASS mechanism (`Discount=15`), resulting in `Amount=0`.  
> * **Sample 2**: An **Elderly Citizen (`HolderType='E'`)** travels from Banqiao to Wanhua at 09:00 on Route 265, receiving a statutory concession discount of NT$ 7 and paying NT$ 8 (or redeemed via municipal monthly welfare points).

---

### 2. Rail Transit Hourly Origin-Destination Schema (`rail_od`)
Encompasses High-Speed Rail (THSR), Taiwan Railway (TRA), Taipei Metro (TRTC), New Taipei Metro (NTMC), and Kaohsiung Metro (KRTC), aggregating over 500 million journeys:

| Field Name | Type | Physical Definition & Business Logic |
|:---|:---:|:---|
| `OriginStationID` | `VARCHAR(8)` | **Origin Station Code**: Turnstile entry code (e.g., TRTC `BL12`, TRA `1000`, THSR `02`). |
| `OriginStationName` | `VARCHAR(24)` | **Origin Station Name**: Canonical station name in Traditional Chinese. |
| `DestinationStationID` | `VARCHAR(8)` | **Destination Station Code**: Turnstile exit code (e.g., TRTC `BR15`, THSR `04`). |
| `DestinationStationName` | `VARCHAR(24)` | **Destination Station Name**: Canonical station destination name. |
| `TransactionDate` | `DATE` | **Travel Date**: Format `YYYY-MM-DD`. |
| `TransactionHour` | `TINYINT` | **Hourly Interval**: `0` ~ `23` (e.g., `8` denotes 08:00:00 to 08:59:59 alighting). |
| `PassengerCount` | `INTEGER` | **Passenger Volume**: Verified total swiped passengers across the specified OD pair in that hour. |
| `DayType` | `VARCHAR(12)` | **Calendar Type**: `Weekday`, `Weekend`, or `Holiday`. |

#### Rail OD JSON Sample
```json
[
  {
    "OriginStationID": "BL12",
    "OriginStationName": "Taipei Main Station",
    "DestinationStationID": "BR15",
    "DestinationStationName": "Xihu",
    "TransactionDate": "2026-03-12",
    "TransactionHour": 8,
    "PassengerCount": 3842,
    "DayType": "Weekday"
  },
  {
    "OriginStationID": "02",
    "OriginStationName": "THSR Taipei",
    "DestinationStationID": "04",
    "DestinationStationName": "THSR Hsinchu",
    "TransactionDate": "2026-03-12",
    "TransactionHour": 7,
    "PassengerCount": 1420,
    "DayType": "Weekday"
  }
]
```

---

### 3. Public Bikeshare Rental Schema (`bike_to2a`)
Captures first-and-last mile green mobility micro-circulation (40.4M Taipei/New Taipei YouBike records, 7.95M Taoyuan records):

| Field Name | Type | Physical Definition & Business Logic |
|:---|:---:|:---|
| `RentStationID` | `VARCHAR(16)` | **Rental Station ID**: Unique YouBike dock station identifier. |
| `RentStationName` | `VARCHAR(48)` | **Rental Station Name**: Name and subway exit detail. |
| `RentTime` | `DATETIME` | **Rental Timestamp**: De-identified hourly timestamp (`YYYY-MM-DD HH:00:00`). |
| `ReturnStationID` | `VARCHAR(16)` | **Return Station ID**: Dock station identifier where bike was locked. |
| `ReturnStationName` | `VARCHAR(48)` | **Return Station Name**: Canonical return station name. |
| `ReturnTime` | `DATETIME` | **Return Timestamp**: Alighting hourly timestamp. |
| `DurationSeconds` | `INTEGER` | **Trip Duration (Seconds)**: Exact duration from unlock to dock latching. |

---

## 2.3 Freeway Bureau eTag Toll Collection Schema

The Freeway Bureau's eTag network is Taiwan's sole dataset combining **statutory vehicle classification** with **fixed physical gantry chainage**:

| Field Name | Type | Physical Definition & Business Logic |
|:---|:---:|:---|
| `GantryID` | `VARCHAR(16)` | **Gantry ID**: Official identifier (e.g., `01F-0232S` = Freeway 1 Southbound 23.2K Yuanshan). |
| `HighwayName` | `VARCHAR(16)` | **Freeway Name**: National Freeway 1, Freeway 3, Freeway 5, Freeway 6. |
| `MilestoneKM` | `DECIMAL(5,1)` | **Kilometer Post**: Meter-accurate physical chainage (e.g., `23.2`). |
| `InterchangeName` | `VARCHAR(24)` | **Associated Interchange**: Off-ramp exit name (e.g., Yuanshan, Hsinchu Science Park, Ailan). |
| `DischargeTarget` | `VARCHAR(64)` | **Discharge Catchment Area**: Urban district, technology park, or scenic corridor receiving the traffic flow. |
| `VehicleType` | `SMALLINT` | **Statutory Vehicle Class**:<br>• `31`: Small Passenger Cars (Sedan/SUV)<br>• `32`: Small Freight Trucks (<3.5T)<br>• `41`: Large Passenger Buses (Coaches/Tour Buses)<br>• `42`: Heavy Freight Trucks<br>• `51/52`: Articulated / Semi-Trailer Container Trucks |
| `WorkdayDischargeVol` | `INTEGER` | **Weekday Daily Discharge (Vehicles)**: Normal workday 24-hour total. |
| `HolidayDischargeVol` | `INTEGER` | **Holiday Daily Discharge (Vehicles)**: Weekend/Holiday 24-hour total. |
| `FreightRatio` | `DECIMAL(4,1)` | **Heavy Freight Ratio (%)**: Proportion of classes 32+42+51/52 (identifies industrial supply chains). |

#### Raw eTag Interchange JSON Sample
```json
[
  {
    "GantryID": "01F-0955S",
    "HighwayName": "National Freeway 1",
    "InterchangeName": "Hsinchu Science Park Interchange (95K)",
    "DischargeTarget": "Hsinchu Science Park (Park 2nd Rd / Jieshou Rd)",
    "WorkdayDischargeVol": 78200,
    "HolidayDischargeVol": 22100,
    "VehicleMix": {
      "type31_car": 62,
      "type32_small_truck": 16,
      "type41_tour_bus": 4,
      "type42_big_truck": 12,
      "type51_52_trailer": 6
    },
    "PeakHour": "08:00 - 09:00",
    "PeakHourlyDischarge": 9840
  },
  {
    "GantryID": "06F-0290E",
    "HighwayName": "National Freeway 6",
    "InterchangeName": "Ailan Interchange (29K)",
    "DischargeTarget": "Sun Moon Lake National Scenic Area / Puli Downtown (Provincial Highway 14/21)",
    "WorkdayDischargeVol": 11200,
    "HolidayDischargeVol": 41800,
    "VehicleMix": {
      "type31_car": 82,
      "type32_small_truck": 6,
      "type41_tour_bus": 10,
      "type42_big_truck": 2,
      "type51_52_trailer": 0
    },
    "PeakHour": "10:00 - 12:00",
    "PeakHourlyDischarge": 5420
  }
]
```

---

## 2.4 TDX Real-Time Parking & Civic Infrastructure Dictionary

| Field Name | Type | Physical Definition & Business Logic |
|:---|:---:|:---|
| `ParkingLotID` | `VARCHAR(32)` | **Unique Parking Facility ID**: Registered facility code in MOTC TDX. |
| `ParkingLotName` | `VARCHAR(64)` | **Facility Name**: Legal registered name. |
| `TotalSpaces` | `INTEGER` | **Total Capacity**: Authorized passenger car parking slots. |
| `AvailableSpaces` | `INTEGER` | **Real-Time Available Spaces**: Dynamic count transmitted via sensor loops / ALPR cameras. |
| `OccupancyRate` | `DECIMAL(4,2)` | **Dynamic Occupancy Ratio (0.00 ~ 1.00)**: $1 - (\text{AvailableSpaces} / \text{TotalSpaces})$; $>0.85$ indicates severe congestion. |
| `HourlyRate` | `SMALLINT` | **Hourly Tariff (NT$/hr)**: Standard hourly charging rate. |
| `DistanceToDischargeKM` | `DECIMAL(4,2)` | **Distance to Off-Ramp (km)**: Spatial buffer distance from highway discharge point. |

---

## 2.5 CWA CODiS Climate Big Data Specifications

Climate represents the primary exogenous disruptor reshaping surface human flows and travel impedance. Through the Central Weather Administration's (CWA) official **Climate Observation Data Inquire Service (CODiS)** OpenAPI, this project connects with 30 years (1998–2024) of continuous hourly, daily, and monthly microclimate historical observations.

### 1. Station Hierarchy
* **Manned First-Order Stations (29 Stations)**: Historical stations with 30+ to 100+ years of rigorous manual calibration (e.g., Taipei 466920, Keelung 466940, Anbu 466910, Taichung 467490, Tainan 467410, Hengchun 467590, Alishan 467530, Yushan 467550, Penghu 467350), possessing full-spectrum meteorological instrumentation and authoritative public trust.
* **Automatic Weather Stations (C0 Series, 1,236 Stations)**: Distributed across rural townships, coastal capes, and mountain corridors, providing high spatial resolution temperature, humidity, and precipitation monitoring.

### 2. CODiS Field Dictionary

| Field Name | Type | Definition & Calculation Logic |
|:---|:---:|:---|
| `StationID` | `VARCHAR(10)` | **WMO International Station ID**: e.g., `466920` (Taipei), `467490` (Taichung). |
| `StationName` | `VARCHAR(32)` | **Canonical Station Name**: Registered Chinese/English station name. |
| `County` | `VARCHAR(16)` | **Administrative District**: Municipality or County of installation. |
| `AltitudeM` | `DECIMAL(6,1)` | **Altitude (m)**: From 6.3m (Taipei) to 3,844.8m (Yushan), determining vertical temperature lapse rates. |
| `Archetype` | `VARCHAR(32)` | **Microclimate Persona**: 22 archetypes including "Heat Island Basin", "Moody Rainy Port", "Typhoon Shelter", "Global Wind Pole". |
| `TempDelta30Y` | `DECIMAL(4,2)` | **30-Year Temperature Net Shift (°C)**: Recent decade mean (2015–2024) minus baseline mean (1998–2007); national average +0.72°C. |
| `Hot35DaysDelta` | `DECIMAL(5,1)` | **Net Change in Extreme Heat Days (Days/Year)**: 30-year increase in days with maximum temperature $\ge 35^\circ\text{C}$ (+21.9 days in Taipei). |
| `RainDaysDelta` | `DECIMAL(5,1)` | **Net Change in Rainy Days (Days/Year)**: Trend reflecting fewer rainy days accompanied by more violent cloudburst intensities. |
| `MoldIndex` | `TINYINT` | **Indoor Mold Growth Index (0–100)**: Normalized score of annual days with relative humidity $>80\%$ and temperature between $20\sim 30^\circ\text{C}$. |
| `TyphoonDefense` | `TINYINT` | **Natural Typhoon Defense Score (0–100)**: Composite sheltering score based on Central Mountain Range lee shielding, historical peak gusts, and pressure drops. |
| `UmbrellaProbPct` | `DECIMAL(4,1)` | **Commute Umbrella Probability (%)**: Probability of precipitation during peak hours (07:00–09:00, 17:00–19:00). |
| `AnnualSunshineH` | `DECIMAL(6,1)` | **Annual Sunshine Hours (Hours/Year)**: Direct solar irradiance duration; evaluates photovoltaic and sunshine assets. |
| `AnnualRainMM` | `DECIMAL(6,1)` | **Annual Precipitation (mm/Year)**: Historical mean annual rainfall (3,828mm in Keelung vs. ~980mm in Penghu). |
| `MonthlyClimatology` | `JSON` | **12-Month Climatological Array**: Monthly temperature, rainfall, rain days, sunshine, humidity, and weather glyphs. |

#### Raw CODiS Station Payload Sample
```json
{
  "id": "466920",
  "name": "Taipei",
  "county": "Taipei City",
  "lat": 25.0377,
  "lng": 121.5149,
  "alt_m": 6.3,
  "archetype": "Heat Island Basin",
  "badge": "Taipei Basin · Champion of Nocturnal Warming",
  "metrics_30y": {
    "baseline_temp": 23.40,
    "recent_temp": 23.94,
    "temp_delta": 0.54,
    "hot35_days_delta": 21.9,
    "rain_days_delta": -10.4
  },
  "livability": {
    "avg_temp": 23.6,
    "annual_rain_mm": 2405.0,
    "annual_rain_days": 158.5,
    "annual_sunshine_h": 1305.2,
    "avg_humidity_pct": 75.8,
    "umbrella_prob_pct": 43.4,
    "mold_index": 58,
    "radar": {
      "rain_defense": 45,
      "thermal_comfort": 62,
      "typhoon_defense": 65,
      "sunshine": 48,
      "anti_mold": 42,
      "night_cool": 38
    }
  },
  "monthly_climatology": [
    { "month": 1, "temp": 16.7, "rain_mm": 88.0, "icon": "☁️", "label": "Overcast" },
    { "month": 7, "temp": 30.1, "rain_mm": 245.2, "icon": "☀️", "label": "Clear & Sunny" }
  ]
}
```

---

## 2.6 Data Pipeline Nuances & Security Protections

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 National Big Data Pre-Processing Safety Pipeline            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────┐                             ┌───────────────────────┐
│ Independent Salt Hash │                             │ Zero-OOM Streaming    │
│ Privacy Protection    │                             │ PyArrow Streaming     │
└───────────┬───────────┘                             └───────────┬───────────┘
            │                                                     │
            │ Independent salt per operator prevents multi-vendor │ 16MB chunk streaming decompress, no disk
            │ longitudinal surveillance; transfers validated on   │ Polars LazyFrame projection & filter pushdown
            │ physical smartcard chip firmware                    │
            ▼                                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Final Artifact: 16.5GB Compressed Apache Parquet Corpus     │
└─────────────────────────────────────────────────────────────────────────────┘
```

1. **Independent Salting Hash Mechanism**:  
   To safeguard personal privacy, TICP mandates that operators (Bus, Metro, TRA, YouBike) utilize **independent, distinct salting algorithms** when hashing smartcard numbers. As a result, analysts cannot link an individual's cross-system identity through simple card-number string joins.  
   However, inter-modal transfer relationships are validated physically inside the onboard chip reader firmware, outputting verified statutory audit fields (`TransferCode`, `Discount`).
2. **Zero-OOM Streaming Architecture**:  
   The raw uncompressed volume of 448 million records exceeds 30 GB, requiring over 120 GB of RAM if loaded with standard Pandas—prompting catastrophic Out-Of-Memory (OOM) crashes.  
   Our pipeline (`pipeline/convert_to_parquet.py`) employs **PyArrow 16MB zero-disk stream decompression** combined with **Zstandard (Level 5) columnar compression**, shrinking disk footprint by 88% down to 16.5 GB. Using **Polars LazyFrames**, thread and memory consumption are constrained to a safe 1.5GB RAM ceiling!

![Figure 2.1: National Data Infrastructure Blueprint](../images/ch2_data_infrastructure.webp)
*Figure 2.1: Live Application Interface — Multi-Source Fusion Blueprint illustrating Tier 1 (Rigid Baseline), Tier 2 (Continuous Cellular Muscle), and Tier 3 (Inverse Anchoring Calibration).*

---

## 2.7 Interactive Portal

To explore the multi-dimensional strategic comparison matrix synthesized from these 448 million records and 325 eTag gantries:

* **[👉 Launch Live Application: Strategic Master Matrix](https://tobytoy.github.io/taiwan-mobility-pulse/#telecom)**

Having dissected the physical foundation and schemas, we now inject these microscopic flow particles into Taiwan's 114 representative mobility corridors!

👉 **[Proceed to Chapter 3: Intercity Arteries & Urban Mobility Corridors](chapter3_flow_arteries.md)**
