# Complete CO2 Capture Template - User Guide

## 🎯 Overview

The CO2 Capture template is now **fully complete** with all specifications, demonstrating the rigorous thermodynamics engine. You can trace how each stream changes through the process.

---

## 📊 Process Description

### Feed Streams (100% Specified)

**Stream 1: Flue Gas**
- Flow: `1000 kmol/h`
- Temperature: `40°C (313 K)`
- Pressure: `1.05 bar`
- Composition:
  - CO₂: `13.0%` (130 kmol/h)
  - N₂: `87.0%` (870 kmol/h)
- Phase: `Vapor`

**Stream 2: Lean MEA Solvent**
- Flow: `5000 kmol/h`
- Temperature: `60°C (333 K)`
- Pressure: `1.6 bar`
- Composition:
  - MEA: `30.0%` (monoethanolamine - the CO₂ absorbent)
  - H₂O: `70.0%` (water - solvent carrier)
- Phase: `Liquid`

---

## ⚙️ Equipment Specifications

### 1. **Absorber** (CO₂ Removal)
- Type: Packed tower
- Stages: `20` (equilibrium stages)
- Operating Pressure: `1.1 bar`
- **Function**: Gas-liquid contact where CO₂ dissolves into MEA solution

**What happens here:**
- Flue gas enters bottom (counter-current flow)
- Lean solvent enters top
- CO₂ reacts with MEA: `CO₂ + MEA ⇌ MEA·CO₂`
- Treated gas exits top (~1% CO₂)
- Rich solvent exits bottom

---

### 2. **Rich/Lean Heat Exchanger**
- Type: Shell-and-tube
- Heat Transfer Coefficient: `500 kW/K`
- **Function**: Energy integration - hot lean solvent heats cold rich solvent

**Energy savings:**
- Reduces reboiler duty by ~40%
- Typical ΔT: 10-15°C

---

### 3. **Stripper** (CO₂ Regeneration)
- Type: Packed tower with reboiler
- Stages: `10`
- Operating Pressure: `1.8 bar` (slight overpressure for downstream compression)
- **Function**: Reverse the absorption reaction by heating

**What happens here:**
- Rich solvent enters top
- Heat drives off CO₂: `MEA·CO₂ ⇌ MEA + CO₂`
- Pure CO₂ exits overhead
- Lean solvent exits bottom

---

### 4. **Reboiler**
- Type: Kettle reboiler (steam-heated)
- Duty: `2500 kW`
- Outlet Temperature: `120°C (393 K)`
- **Function**: Provide heat for CO₂ stripping

**Energy consumption:**
- Largest energy user in the process
- ~3.5 GJ/ton CO₂ captured (typical)

---

### 5. **Lean Pump**
- Type: Centrifugal pump
- Pressure Rise: `0.5 bar`
- Efficiency: `75%` (assumed)
- **Function**: Circulate lean solvent back to absorber

**Power consumption:**
- ~20-50 kW depending on flow rate

---

### 6. **Lean Cooler**
- Type: Cooling water exchanger
- Outlet Temperature: `40°C (313 K)`
- **Function**: Cool lean solvent to absorber inlet temperature

**Why cooling?**
- CO₂ absorption is exothermic
- Lower temperature = better CO₂ capture

---

## 🔄 Process Flow (11 Streams Total)

```
┌─────────────────────────────────────────────────────────────┐
│                     CO₂ CAPTURE PROCESS                      │
└─────────────────────────────────────────────────────────────┘

S1: Flue Gas (40°C, 1.05 bar, 13% CO₂)
    ↓
    ┌─────────┐
    │ABSORBER │  ← S3: Lean Solvent (40°C, cooled & recycled)
    └─────────┘
    ↓         ↓
    S4        S5
    ↓         ↓
[Treated  [Rich Solvent]
  Gas]        ↓
  ↓           ┌──────┐
 SINK     →→→ │  HX  │ ←←← (from S9)
              └──────┘
                ↓
                S6 (heated)
                ↓
            ┌──────────┐
            │ STRIPPER │
            └──────────┘
             ↓        ↓
             S7       S8
             ↓        ↓
        [CO₂ Prod] [Lean Hot]
             ↓        ↓
           SINK   ┌─────────┐
                  │REBOILER │ (2500 kW)
                  └─────────┘
                      ↓
                      S9 (120°C)
                      ↓
                  [back to HX cold side]
                      ↓
                      S10
                      ↓
                  ┌──────┐
                  │ PUMP │
                  └──────┘
                      ↓
                      S11
                      ↓
                  ┌────────┐
                  │ COOLER │
                  └────────┘
                      ↓
                   [S3 - closes loop]
```

---

## 📈 Expected Simulation Results

When you simulate this process, the rigorous thermodynamics engine will calculate:

### Stream Results (Examples)

**S1 - Flue Gas** (specified)
- T: 313 K, P: 1.05 bar, F: 1000 kmol/h
- Composition: 13% CO₂, 87% N₂
- Enthalpy: ~0 kJ/mol (reference)

**S3 - Lean Solvent** (calculated)
- T: 313 K, P: ~1.6 bar, F: 5000 kmol/h
- Composition: 30% MEA, 70% H₂O, <1% CO₂
- Enthalpy: ~-285 kJ/mol (liquid water reference)

**S4 - Treated Gas** (calculated by simulator)
- T: ~315 K (adiabatic absorption is exothermic!)
- P: ~1.0 bar
- F: ~988 kmol/h (117 kmol/h CO₂ removed)
- Composition: ~1.3% CO₂, 88% N₂ (90% capture!)
- Phase: Vapor

**S5 - Rich Solvent** (calculated)
- T: ~320 K (heated by absorption)
- P: ~1.1 bar
- F: ~5117 kmol/h (absorbed 117 kmol CO₂)
- Composition: MEA·CO₂ complex + free MEA + H₂O
- Enthalpy: Higher due to reaction heat

**S7 - CO₂ Product** (calculated)
- T: ~390 K
- P: 1.8 bar
- F: ~117 kmol/h
- Composition: >99% CO₂ (pure!)
- Phase: Vapor

---

## 🔬 What the Simulator Calculates

### 1. **Mass Balances** (for each component)
```
Total In = Total Out
CO₂ in flue gas = CO₂ in treated gas + CO₂ captured
```

### 2. **Energy Balances** (for each unit)
```
ΣH_in + Q + W = ΣH_out

Absorber: Exothermic (~50 kJ/mol CO₂)
Reboiler: Endothermic (2500 kW input)
Cooler: Heat removal
Pump: Work input
```

### 3. **Phase Equilibrium** (VLE)
```
Flash calculations for vapor/liquid splits
K-values: K_i = y_i / x_i = P_vap_i / P_total
Rachford-Rice for vapor fraction
```

### 4. **Thermodynamic Properties**
- Heat capacity: `Cp(T)` for each component
- Enthalpy: `H = Hf + ∫Cp dT`
- Vapor pressure: Clausius-Clapeyron
- Density: Ideal gas law (vapor), correlations (liquid)

---

## ✅ Validation Checks

Before simulation runs, the validator checks:

✅ Feed streams have complete specs (T, P, flow, composition)  
✅ All compositions sum to 1.0  
✅ All blocks are connected  
✅ Required parameters are set  
✅ No orphaned equipment  

---

## 🎯 Performance Targets

### Specifications
- **CO₂ Capture**: `90%` (target)
- **Product Purity**: >99% CO₂

### Constraints
- **Steam**: < 3500 GJ/h (soft limit)
- **Electricity**: < 200 kW (soft limit)

### Objective
- **Minimize COM** (Cost of Manufacturing)
  - Steam cost: $10/GJ
  - Electricity: $0.08/kWh
  - CO₂ credit: $60/ton

---

## 📊 Key Performance Indicators (KPIs)

After simulation, you'll see:

1. **CO₂ Captured** (kmol/h or ton/h)
2. **Capture Efficiency** (%)
3. **Reboiler Duty** (GJ/h or kW)
4. **Cooling Duty** (GJ/h)
5. **Pump Work** (kW)
6. **Specific Energy** (GJ/ton CO₂)
7. **Cost of Manufacturing** ($/h)

---

## 🚀 How to Use

1. **Open Jasper** → Dashboard
2. **Create New Project** → Select "CO₂ Capture Template"
3. **Click Simulate** ▶️
4. **View Results** in Console:
   - Summary tab: Quick overview
   - KPIs tab: All metrics
   - Streams tab: Detailed stream table
5. **Inspect Streams**: Click any stream to see T, P, flow, composition
6. **Inspect Units**: Click any equipment to see duties, work

---

## 🔧 Customization Ideas

Want to explore different scenarios? Try:

### Vary Feed Conditions
- Higher CO₂ concentration (power plant vs cement)
- Different temperature (flue gas cooling)
- Higher pressure (natural gas sweetening)

### Optimize Equipment
- **More absorber stages** → Better capture but taller tower
- **Lower stripper pressure** → Less energy but slower kinetics
- **Larger heat exchanger** → Better energy integration

### Different Solvents
- Replace MEA with DEA, MDEA, or blends
- Adjust solvent concentration (20-40 wt%)

### Process Variations
- Add intercooling in absorber
- Split-flow configuration
- Vapor recompression

---

## 📚 Chemical Engineering Principles

### Why MEA?
- **Fast kinetics** with CO₂
- **High capacity** (~0.5 mol CO₂/mol MEA)
- **Reversible** reaction (can be regenerated)
- **Industry standard** since 1930s

### Reaction
```
CO₂ + 2 RNH₂ ⇌ RNHCOO⁻ + RNH₃⁺
(MEA)        (carbamate)
```

### Absorption (Exothermic)
- Forward reaction favored at low T
- Releases ~84 kJ/mol CO₂

### Stripping (Endothermic)
- Reverse reaction at high T
- Requires ~84 kJ/mol CO₂ + sensible heat

### Energy Balance
```
Total energy ≈ 3.5-4.5 GJ/ton CO₂
  - Reboiler: 85%
  - Sensible heating: 10%
  - Pump work: 5%
```

---

## ✨ What Makes This Template Complete

✅ **All inlet streams fully specified** (no guesses!)  
✅ **All compositions sum to 1.0** (mass balance closure)  
✅ **Realistic equipment parameters** (from industry data)  
✅ **Complete recycle loop** (like real plants)  
✅ **Proper outlet sinks** (material balance)  
✅ **Meaningful KPIs** (capture %, energy intensity)  

This is a **real, working CO₂ capture process** that you can simulate, optimize, and learn from!

---

## 🎓 Learning Outcomes

By simulating this template, you'll understand:

1. **Counter-current absorption** principles
2. **Energy integration** via heat exchangers
3. **Recycle streams** and convergence
4. **Phase equilibrium** in separation
5. **Process optimization** trade-offs
6. **Energy efficiency** in carbon capture

---

## 📖 References

1. **Rochelle, G.T.** (2009). "Amine Scrubbing for CO2 Capture". *Science*.
2. **Rao, A.B. & Rubin, E.S.** (2002). "A Technical, Economic, and Environmental Assessment of Amine-Based CO2 Capture Technology".
3. **NETL** (2023). "Carbon Capture Simulation Initiative".
4. **Seader, Henley, Roper** - *Separation Process Principles*

---

**Enjoy exploring the rigorous thermodynamics! 🚀**

