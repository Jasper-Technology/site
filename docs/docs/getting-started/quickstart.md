---
sidebar_position: 1
---

# Quickstart

Get up and running with Jasper simulation engine.

## Installation

```bash
npm install @jasper-technology/simulation
```

## Basic Usage

```typescript
import { runSimulation } from '@jasper-technology/simulation';

const result = runSimulation({
  components: ['H2O', 'C2H5OH'],
  streams: [
    {
      id: 'feed',
      T: 25,      // °C
      P: 1,       // bar
      flow: 100,  // kmol/h
      composition: { H2O: 0.5, C2H5OH: 0.5 }
    }
  ],
  blocks: [
    {
      id: 'heater',
      type: 'Heater',
      inlet: 'feed',
      outlet: 'heated',
      params: { outletT: 80 }
    }
  ]
});

console.log(result.streams.heated);
```

## Visual Editor

For drag-and-drop flowsheet editing, visit [jaspertech.org](https://jaspertech.org).

## Next Steps

- [Thermodynamics](/thermodynamics/overview) - Learn about calculation methods
- [Unit Operations](/unit-operations/feed) - Explore equipment models
- [Component Database](/components/database) - View available chemicals
