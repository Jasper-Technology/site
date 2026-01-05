# Jasper

**Jasper** is an IDE for chemical process design. Create projects, design process flow diagrams (PFDs), define specifications and constraints, run simulations, and analyze results.

## What is Jasper?

Jasper is a web-based integrated development environment specifically designed for chemical engineers and process designers. It provides:

- **Visual Process Design**: Build process flow diagrams using an intuitive drag-and-drop interface
- **Specification Management**: Define purity, recovery, and capture targets
- **Constraint Handling**: Set limits on KPIs, stream properties, and unit operations
- **Simulation**: Run deterministic simulations to evaluate process performance
- **Economics**: Configure economic parameters and compute Cost of Manufacturing (COM)
- **Version Control**: Save snapshots of your designs at key milestones
- **Run History**: Track simulation results, violations, and KPI trends

## Features

### Core Functionality

- **Project Management**: Create, open, and manage multiple projects
- **Flowsheet Editor**: Visual canvas for building process flow diagrams
- **Unit Operations**: Support for common unit operations (absorbers, strippers, columns, pumps, heat exchangers, etc.)
- **Stream Specifications**: Define temperature, pressure, flow, and composition
- **Specifications**: Set purity, recovery, and capture targets
- **Constraints**: Define hard and soft constraints on process variables
- **Objective Functions**: Minimize or maximize KPIs (steam, electricity, COM, CAPEX)
- **Economic Analysis**: Configure utility prices and compute COM
- **Simulation**: Deterministic simulation stub that evaluates process performance
- **Results Visualization**: View KPI tables, spec results, and constraint violations

### UI/UX

- Clean, minimalistic, professional interface
- Responsive layout with collapsible sidebars
- Real-time autosave (every 2-3 seconds)
- Version snapshots for checkpointing
- Console drawer for run logs and violations

## Tech Stack

- **Vite** - Build tool and dev server
- **React** - UI framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **React Flow** - Graph visualization for PFD canvas
- **Zustand** - State management
- **TanStack Query** - Data fetching and caching
- **Zod** - Schema validation
- **lucide-react** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Jasper-Technology/site.git
cd site
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### First Run

1. Click "Continue as demo user" on the sign-in screen
2. Create a new project (choose "Blank" or "DEA CO2 Capture" template)
3. Start building your process flow diagram

## Project Structure

```
src/
├── app/
│   ├── App.tsx              # Main app with routing
│   └── routes/
│       ├── SignIn.tsx      # Authentication screen
│       ├── Dashboard.tsx   # Project list
│       └── Editor.tsx      # Main editor interface
├── components/
│   ├── layout/              # Layout components (TopBar, SideNav, PanelShell)
│   └── editor/             # Editor components (PFD canvas, Inspector, Console)
├── core/
│   ├── schema.ts            # Zod schemas and TypeScript types
│   ├── ids.ts              # ID generation utilities
│   ├── hash.ts             # Stable hashing for snapshots
│   ├── units.ts            # Quantity/unit helpers
│   ├── actions.ts           # Action application logic
│   └── metrics.ts          # Metric reference evaluation
├── data/
│   ├── storage.ts          # localStorage persistence
│   ├── api.ts              # Promise-based API for TanStack Query
│   └── seed.ts             # Templates and demo data
├── sim/
│   ├── jasperSim.ts        # Deterministic simulation stub
│   └── economics.ts        # COM computation
├── agent/
│   └── suggestFix.ts       # AI agent stub for suggested fixes
└── store/
    ├── authStore.ts        # Authentication state
    └── editorStore.ts      # Editor selection state
```

## Data Model

Jasper uses a comprehensive data model built on Zod schemas:

- **Projects**: Top-level containers with flowsheets, specs, constraints, and economics
- **Versions**: Immutable snapshots of projects at specific points in time
- **Runs**: Simulation execution results with KPIs, spec results, and violations
- **Actions**: Log of all changes made to projects (human or agent)

All data is persisted in browser localStorage under the key `jasper_v1`.

## Simulation

The current implementation includes a deterministic simulation stub (`jasperSim.ts`) that:

- Computes KPIs (steam, electricity, CO2 emissions, COM, CAPEX proxy) based on process parameters
- Evaluates spec results (purity, recovery, capture) heuristically
- Checks constraint violations
- Provides convergence status based on graph validity

Future versions will integrate with open-source chemical engineering simulation libraries.

## Development

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Roadmap

- [ ] Integrate open-source chemical engineering simulation libraries
- [ ] Build AI agent for iterative process optimization
- [ ] Add more unit operation types
- [ ] Implement unit conversion system
- [ ] Add export/import functionality
- [ ] Multi-user collaboration
- [ ] Cloud persistence

## Contributing

We welcome contributions from the community! Jasper is an open-source project built for chemical engineers, by chemical engineers.

### How to Contribute

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a new branch** for your feature or fix: `git checkout -b feature/your-feature-name`
4. **Make your changes** and commit them with clear, descriptive messages
5. **Push to your fork**: `git push origin feature/your-feature-name`
6. **Open a Pull Request** on the main repository

### Areas We Need Help

- **Simulation Engine**: Integrate open-source chemical engineering libraries (DWSIM, Cantera, etc.)
- **Unit Operations**: Add more unit operation types and improve existing ones
- **UI/UX**: Enhance the design, improve accessibility, and fix bugs
- **Documentation**: Write guides, tutorials, and improve inline documentation
- **Testing**: Add unit tests, integration tests, and end-to-end tests
- **Performance**: Optimize rendering, state management, and simulation speed

### Development Guidelines

- Follow the existing code style and conventions
- Write clear commit messages
- Update documentation for any changed functionality
- Test your changes thoroughly before submitting
- Keep PRs focused and atomic (one feature or fix per PR)

### Code of Conduct

Be respectful, constructive, and professional. We're all here to build something great together.

### Questions?

- Open an issue on GitHub
- Start a discussion in the repository
- Check existing issues and pull requests

## License

MIT License - see [LICENSE](LICENSE) for details.

Copyright (c) 2025 Jasper Technology

## Acknowledgments

Built with modern web technologies:
- React Flow for the visual canvas
- TailwindCSS for beautiful, responsive design
- Zod for type-safe schemas
- And many other amazing open-source libraries

Special thanks to the chemical engineering community for inspiration and feedback.
