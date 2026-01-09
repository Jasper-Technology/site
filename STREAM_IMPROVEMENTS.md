# Stream Properties & Console Improvements

## 🎯 Summary

Fixed two critical issues to match AspenPlus behavior:
1. **Read-only calculated streams** - Only input streams are editable
2. **Stream Table in Console** - Comprehensive stream results table

---

## ✅ Changes Made

### 1. **StreamPanel - Input vs Calculated Streams**

**Before:**
- All streams were editable (wrong!)
- User could change calculated results

**After:**
- **Input streams (from Feed)**: Fully editable ✏️
  - User can change T, P, flow, composition
  - These are the inputs that drive the simulation
  - Shows green tip: "This is an input stream"

- **Calculated streams (from equipment)**: Read-only 🔒
  - Display simulation results only
  - Shows blue info banner: "Calculated Stream (Read-Only)"
  - Explains: "These properties are calculated by the simulator"
  - All fields disabled (grayed out)

**Detection Logic:**
```typescript
const sourceBlock = project.flowsheet.nodes.find(n => n.id === stream.from.nodeId);
const isInputStream = sourceBlock?.type === 'Feed';
```

---

### 2. **Console - Stream Results Table**

Added new **"Streams" tab** to Console with AspenPlus-style table:

**Stream Table Columns:**
- Stream Name
- Temperature (K)
- Pressure (bar)
- Flow Rate (kmol/h)
- Phase (V/L/VL) - color-coded badges
- Enthalpy (kJ/mol)

**Composition Details:**
- Expandable section below table
- Shows composition for each stream
- Mole fractions displayed as percentages
- Grouped by stream

**Example Display:**
```
┌─────────────────────────────────────────────────────────────┐
│ Stream Results Table                                        │
├──────────┬──────┬──────┬──────────┬───────┬────────────────┤
│ Stream   │ T(K) │P(bar)│Flow(kmol)│ Phase │   H (kJ/mol)   │
├──────────┼──────┼──────┼──────────┼───────┼────────────────┤
│ Flue Gas │ 313.2│ 1.05 │  1000.0  │   V   │     -0.5       │
│ Lean Sol │ 313.2│ 1.60 │  5000.0  │   L   │   -285.3       │
│ Treated  │ 315.4│ 1.00 │   988.3  │   V   │     -0.2       │
│ Rich Sol │ 319.8│ 1.10 │  5117.0  │   L   │   -280.1       │
│ CO2 Prod │ 390.5│ 1.80 │   116.7  │   V   │    -393.5      │
└──────────┴──────┴──────┴──────────┴───────┴────────────────┘

Composition Details:
  Flue Gas:  CO2: 13.00%  N2: 87.00%
  Lean Sol:  MEA: 30.00%  H2O: 70.00%
  ...
```

**Data Source:**
- Reads from `latestRun.rawOutputs.streams`
- Populated by the rigorous thermodynamics solver
- Shows actual calculated results, not inputs!

---

## 🔍 User Experience Flow

### Editing Input Streams (Feed outlets):
1. Click on a stream connected to a Feed block
2. Inspector opens → Stream tab
3. See all editable fields (enabled)
4. Change T, P, flow, composition
5. Changes save automatically
6. Run simulation to see effects

### Viewing Calculated Streams:
1. Click on any other stream (from equipment)
2. Inspector opens → Stream tab
3. See blue "Read-Only" banner
4. All fields disabled (grayed out)
5. Displays current values from simulation
6. To change: edit upstream equipment or inputs

### Viewing Stream Table:
1. Run simulation
2. Console opens automatically
3. Click "Streams" tab
4. See comprehensive table with all streams
5. Scroll down for composition details
6. Compare input vs output streams

---

## 📊 Benefits

### For Users:
✅ **Clearer workflow** - Know what you can edit  
✅ **Prevent mistakes** - Can't accidentally change results  
✅ **Better understanding** - See all stream data at once  
✅ **Like AspenPlus** - Familiar to chemical engineers  

### For Simulation Integrity:
✅ **Inputs separated from outputs**  
✅ **Results are immutable**  
✅ **Clear data flow** - Feed → Equipment → Results  
✅ **Proper validation** - Only validate inputs  

---

## 🔧 Technical Details

### StreamPanel.tsx Changes:
```typescript
// Detect if stream is from Feed
const sourceBlock = project.flowsheet.nodes.find(
  n => n.id === stream.from.nodeId
);
const isInputStream = sourceBlock?.type === 'Feed';

// Disable all inputs for calculated streams
<input 
  disabled={!isInputStream}
  ...
/>
```

### ConsoleDrawer.tsx Changes:
```typescript
// Add 'streams' to tab types
const [activeView, setActiveView] = useState<
  'summary' | 'kpis' | 'streams' | 'violations'
>('summary');

// Stream table from rawOutputs
{activeView === 'streams' && (
  <table>
    {latestRun.rawOutputs.streams.map(stream => (
      <tr>
        <td>{stream.name}</td>
        <td>{stream.T.toFixed(1)}</td>
        <td>{stream.P.toFixed(2)}</td>
        ...
      </tr>
    ))}
  </table>
)}
```

### Solver Integration:
The solver (`blockSolver.ts`) already returns stream states:
```typescript
return {
  converged: true,
  streams: Map<string, StreamState>,
  blockResults: Map<string, any>
};
```

These are stored in `rawOutputs.streams` and displayed in the table.

---

## 🎨 UI/UX Details

### Read-Only Stream Banner:
- Blue background (info color)
- Icon: Info circle
- Text: Clear explanation
- Padding: Spacious for readability

### Stream Table Styling:
- Responsive layout (horizontal scroll if needed)
- Hover effects on rows
- Monospace font for numbers
- Phase badges with colors:
  - Vapor (V): Blue
  - Liquid (L): Teal
  - Mixed (VL): Gray

### Composition Display:
- Grouped cards per stream
- Two-column grid
- Percentages (not decimals)
- Clean spacing

---

## ✅ Validation

### Feed Streams (Editable):
- User sets all properties
- Validator checks completeness
- Changes affect simulation
- Saved to project state

### Calculated Streams (Read-Only):
- Solver computes properties
- Displayed in Inspector
- Shown in Console table
- Not saved to project (transient)

---

## 🚀 What's Next (Future)

Could add to Stream Table:
- [ ] Mass flow (kg/h) column
- [ ] Volumetric flow (m³/h)
- [ ] Density (kg/m³)
- [ ] Vapor fraction for VL
- [ ] Export to CSV/Excel
- [ ] Sort by column
- [ ] Filter by phase
- [ ] Search by stream name

Could add to StreamPanel:
- [ ] Show history (how this stream changed from previous sim)
- [ ] Show sensitivity (what affects this stream most)
- [ ] Quick links to connected equipment

---

## 📚 AspenPlus Comparison

| Feature | AspenPlus | Jasper (Before) | Jasper (Now) |
|---------|-----------|-----------------|--------------|
| Edit input streams | ✅ Yes | ✅ Yes | ✅ Yes |
| Edit calculated streams | ❌ No | ⚠️ Yes (bug) | ✅ No (fixed!) |
| Stream table | ✅ Yes | ❌ No | ✅ Yes |
| Composition table | ✅ Yes | ❌ No | ✅ Yes |
| Phase indicators | ✅ Yes | ❌ No | ✅ Yes |
| Read-only indicators | ✅ Yes | ❌ No | ✅ Yes |

**We now match AspenPlus behavior!** ✨

---

**These changes make Jasper behave like a professional process simulator!**

