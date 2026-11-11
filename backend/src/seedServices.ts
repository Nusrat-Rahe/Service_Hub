import { Service } from "./models/Service";

const defaultServices = [
  {
    name: "Cleaning",
    category: "Home care",
    description: "Regular upkeep and deep cleaning for a fresh, comfortable home.",
    price: 60,
    status: "Active",
  },
  {
    name: "Plumbing",
    category: "Repairs",
    description: "Help with leaks, fittings, drainage, and everyday repairs.",
    price: 65,
    status: "Active",
  },
  {
    name: "Electrical",
    category: "Repairs",
    description: "Lighting, wiring, and household electrical work.",
    price: 95,
    status: "Active",
  },
  {
    name: "AC Repair",
    category: "Appliance care",
    description: "Air conditioning repair and seasonal maintenance.",
    price: 85,
    status: "Active",
  },
  {
    name: "Painting",
    category: "Home improvement",
    description: "Refresh your rooms with a clean, professional finish.",
    price: 120,
    status: "Active",
  },
  {
    name: "Pest Control",
    category: "Home care",
    description: "Professional treatment to keep unwanted pests out.",
    price: 75,
    status: "Active",
  },
  {
    name: "Appliance Repair",
    category: "Appliance care",
    description: "Get essential household appliances back in working order.",
    price: 80,
    status: "Active",
  },
  {
    name: "Moving & Shifting",
    category: "Moving",
    description: "Packing and moving support to make your move easier.",
    price: 150,
    status: "Active",
  },
];

export async function seedServices() {
  if ((await Service.estimatedDocumentCount()) > 0) return;
  await Service.insertMany(defaultServices);
}
