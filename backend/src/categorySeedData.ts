export const categorySeedData = [
  {
    slug: "cleaning",
    name: "Cleaning",
    heading: "Choose Your Cleaning Service",
    subcategories: [
      { slug: "regular", name: "Regular Cleaning", description: "Routine upkeep to keep your home tidy, comfortable, and fresh.", duration: "About 2-3 hours, depending on home size", includes: ["Dusting accessible surfaces", "Sweeping and mopping floors", "Wiping commonly used surfaces", "Emptying household bins"] },
      { slug: "deep", name: "Deep Cleaning", description: "A more thorough clean for built-up dirt and less frequently cleaned areas.", duration: "About 4-6 hours, depending on home size", includes: ["Detailed dusting of reachable areas", "Cleaning floor edges and corners", "Wiping doors and switches", "Extra attention to high-use surfaces"] },
      { slug: "kitchen", name: "Kitchen Cleaning", description: "Focused cleaning for kitchen surfaces, fixtures, and everyday cooking areas.", duration: "About 2-3 hours, depending on kitchen size", includes: ["Wiping counters and cabinet exteriors", "Cleaning the sink and faucet", "Wiping the stovetop exterior", "Sweeping and mopping the floor"] },
      { slug: "bathroom", name: "Bathroom Cleaning", description: "A focused refresh for bathroom fixtures, surfaces, and floors.", duration: "About 1-2 hours per bathroom", includes: ["Cleaning the toilet, sink, and faucet", "Wiping mirrors and reachable surfaces", "Cleaning shower or tub surfaces", "Sweeping and mopping the floor"] },
    ],
  },
  {
    slug: "ac-repair",
    name: "AC Repair",
    heading: "Choose Your AC Service",
    subcategories: [
      { slug: "servicing", name: "AC Servicing", description: "Routine air-conditioner care to help maintain airflow and cooling performance.", duration: "About 1-2 hours per unit", includes: ["Cleaning accessible filters", "Checking airflow and basic operation", "Inspecting the indoor and outdoor units", "Reporting any issues found"] },
      { slug: "installation", name: "AC Installation", description: "Installation support for a new air conditioner in a suitable location.", duration: "About 3-5 hours per unit", includes: ["Reviewing the installation location", "Mounting the indoor and outdoor units", "Connecting the required lines", "Testing basic operation"] },
      { slug: "gas-refill", name: "AC Gas Refill", description: "A refrigerant check and refill service when a qualified technician determines it is needed.", duration: "About 1-2 hours per unit", includes: ["Checking cooling performance", "Inspecting for visible leaks", "Assessing refrigerant requirements", "Testing the unit after service"] },
      { slug: "repair", name: "AC Repair", description: "Troubleshooting for air conditioners that are noisy, leaking, or not cooling properly.", duration: "About 1-3 hours for diagnosis and common repairs", includes: ["Diagnosing the reported issue", "Inspecting electrical and cooling components", "Explaining recommended repairs", "Testing operation after approved work"] },
    ],
  },
  {
    slug: "plumbing",
    name: "Plumbing",
    heading: "Choose Your Plumbing Service",
    subcategories: [
      { slug: "pipe-leakage", name: "Pipe Leakage Repair", description: "Find and repair common leaks in accessible household pipes and joints.", duration: "About 1-3 hours, depending on access", includes: ["Locating the leak", "Inspecting the pipe and connection", "Repairing or replacing the affected fitting", "Checking for continued leakage"] },
      { slug: "tap-faucet", name: "Tap & Faucet Repair", description: "Resolve dripping, loose, or poorly working taps and faucets.", duration: "About 1-2 hours per fixture", includes: ["Inspecting the tap or faucet", "Checking seals and connections", "Repairing or replacing common fittings", "Testing water flow and shutoff"] },
      { slug: "drain-cleaning", name: "Drain Cleaning", description: "Clear common blockages and restore flow in household drains.", duration: "About 1-2 hours per drain", includes: ["Checking the affected drain", "Removing accessible debris", "Clearing a common blockage", "Testing drainage after cleaning"] },
      { slug: "bathroom-plumbing", name: "Bathroom Plumbing", description: "Plumbing assistance for common bathroom fixtures and connections.", duration: "About 1-3 hours, depending on the issue", includes: ["Inspecting the reported fixture", "Checking supply and drain connections", "Repairing common fixture issues", "Testing the fixture after work"] },
    ],
  },
  {
    slug: "electrical",
    name: "Electrical",
    heading: "Choose Your Electrical Service",
    subcategories: [
      { slug: "switch-socket", name: "Switch & Socket Repair", description: "Repair or replace faulty switches and sockets to restore safe operation.", duration: "About 1-2 hours per fitting", includes: ["Inspecting the switch or socket", "Checking connections and visible damage", "Repairing or replacing the affected fitting", "Testing operation"] },
      { slug: "fan-installation", name: "Fan Installation", description: "Install or replace a ceiling or wall fan with suitable existing wiring.", duration: "About 1-2 hours per fan", includes: ["Checking the mounting point", "Connecting the fan to existing wiring", "Securing the fan assembly", "Testing speed and operation"] },
      { slug: "light-installation", name: "Light Installation", description: "Install or replace a light fixture at a compatible existing connection.", duration: "About 1-2 hours per fixture", includes: ["Checking the fixture and mounting point", "Connecting to existing wiring", "Securing the light fixture", "Testing the light"] },
      { slug: "wiring-repair", name: "Wiring Repair", description: "Inspect and repair accessible wiring issues affecting household electrical service.", duration: "About 1-3 hours, depending on the issue", includes: ["Checking the reported electrical issue", "Inspecting accessible wiring", "Repairing the identified connection", "Testing the affected circuit"] },
    ],
  },
  {
    slug: "painting",
    name: "Painting",
    heading: "Choose Your Painting Service",
    subcategories: [
      { slug: "interior", name: "Interior Painting", description: "Refresh indoor walls and ceilings with a clean, even finish.", duration: "Typically 1-3 days, depending on area and preparation", includes: ["Preparing the agreed surfaces", "Protecting nearby floors and fixtures", "Applying paint to selected areas", "Cleaning the work area"] },
      { slug: "exterior", name: "Exterior Painting", description: "Improve the look of exterior walls and other agreed outdoor surfaces.", duration: "Typically 2-5 days, depending on area and weather", includes: ["Inspecting and preparing the surface", "Covering nearby fixtures and openings", "Painting the selected exterior area", "Cleaning the work area"] },
      { slug: "wall-repainting", name: "Wall Repainting", description: "Give existing walls a fresh coat to renew their appearance.", duration: "Typically 1-2 days per room", includes: ["Preparing the existing wall finish", "Filling minor surface marks", "Applying paint to agreed walls", "Tidying the work area"] },
      { slug: "full-house", name: "Full House Painting", description: "Coordinate painting across multiple rooms or the full home interior.", duration: "Typically several days, depending on home size", includes: ["Reviewing rooms and surfaces", "Preparing agreed walls and ceilings", "Painting the selected areas", "Cleaning and final walk-through"] },
    ],
  },
  {
    slug: "pest-control",
    name: "Pest Control",
    heading: "Choose Your Pest Control Service",
    subcategories: [
      { slug: "cockroach", name: "Cockroach Control", description: "Treatment focused on common cockroach activity and entry points.", duration: "About 1-2 hours, depending on home size", includes: ["Assessing affected areas", "Identifying likely harborages", "Applying suitable targeted treatment", "Providing follow-up prevention guidance"] },
      { slug: "mosquito", name: "Mosquito Control", description: "Reduce mosquito activity with treatment focused on relevant indoor or outdoor areas.", duration: "About 1-2 hours, depending on area", includes: ["Inspecting the affected areas", "Identifying common breeding or resting sites", "Applying suitable area treatment", "Sharing prevention recommendations"] },
      { slug: "termite", name: "Termite Control", description: "Assessment and treatment planning for suspected termite activity.", duration: "Assessment takes about 1-2 hours; treatment varies by property", includes: ["Inspecting accessible affected areas", "Identifying visible signs of activity", "Recommending a suitable treatment approach", "Explaining monitoring or follow-up needs"] },
      { slug: "bed-bug", name: "Bed Bug Control", description: "Targeted service for suspected bed bug activity in sleeping areas and furnishings.", duration: "About 2-4 hours, depending on rooms treated", includes: ["Inspecting affected sleeping areas", "Identifying signs of bed bugs", "Applying a suitable targeted treatment", "Providing preparation and follow-up guidance"] },
    ],
  },
  {
    slug: "appliance-repair",
    name: "Appliance Repair",
    heading: "Choose Your Appliance Repair Service",
    subcategories: [
      { slug: "refrigerator", name: "Refrigerator Repair", description: "Diagnose cooling, noise, or operating problems with your refrigerator.", duration: "About 1-3 hours for diagnosis and common repairs", includes: ["Checking the reported symptoms", "Inspecting accessible controls and components", "Explaining the likely repair", "Testing operation after approved work"] },
      { slug: "washing-machine", name: "Washing Machine Repair", description: "Troubleshoot common washing machine drainage, spinning, or startup issues.", duration: "About 1-3 hours for diagnosis and common repairs", includes: ["Checking the reported symptoms", "Inspecting accessible hoses and controls", "Explaining the recommended repair", "Testing a basic cycle after approved work"] },
      { slug: "microwave", name: "Microwave Repair", description: "Assess a microwave that is not heating or operating as expected.", duration: "About 1-2 hours for diagnosis", includes: ["Checking the reported symptoms", "Inspecting accessible controls and door operation", "Explaining the recommended repair", "Testing operation after approved work"] },
      { slug: "oven", name: "Oven Repair", description: "Troubleshoot common oven heating, temperature, or control problems.", duration: "About 1-3 hours for diagnosis and common repairs", includes: ["Checking the reported symptoms", "Inspecting accessible controls and heating operation", "Explaining the recommended repair", "Testing operation after approved work"] },
    ],
  },
  {
    slug: "moving-shifting",
    name: "Moving & Shifting",
    heading: "Choose Your Moving & Shifting Service",
    subcategories: [
      { slug: "home-shifting", name: "Home Shifting", description: "Move household belongings between homes with coordinated loading and transport.", duration: "Typically 1 day, depending on distance and volume", includes: ["Reviewing move locations and item volume", "Loading agreed household items", "Transporting belongings to the destination", "Unloading items at the new location"] },
      { slug: "office-shifting", name: "Office Shifting", description: "Relocate office furniture and equipment with an organized moving plan.", duration: "Typically 1-2 days, depending on office size", includes: ["Reviewing office items and locations", "Loading agreed furniture and equipment", "Transporting items to the destination", "Unloading at the new office"] },
      { slug: "furniture-moving", name: "Furniture Moving", description: "Move selected furniture items within a property or to another address.", duration: "About 1-4 hours, depending on items and distance", includes: ["Reviewing the furniture and access route", "Preparing and securing agreed items", "Moving items to the destination", "Placing items in the requested area"] },
      { slug: "packing-unpacking", name: "Packing & Unpacking", description: "Get help preparing belongings for a move and unpacking them at the destination.", duration: "Typically 1-2 days, depending on home size", includes: ["Packing agreed household belongings", "Labeling boxes by room or contents", "Unpacking at the destination", "Placing items in the agreed rooms"] },
    ],
  },
] as const;
