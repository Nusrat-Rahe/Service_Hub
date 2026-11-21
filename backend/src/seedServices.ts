import { Service } from "./models/Service";

const defaultServices = [
  {
    name: "Cleaning",
    category: "Home care",
    description: "Regular upkeep and deep cleaning for a fresh, comfortable home.",
    image: "/images/services/cleaning.jpg",
    price: 60,
    status: "Active",
  },
  {
    name: "Plumbing",
    category: "Repairs",
    description: "Help with leaks, fittings, drainage, and everyday repairs.",
    image: "/images/services/plumbing.jpg",
    price: 65,
    status: "Active",
  },
  {
    name: "Electrical",
    category: "Repairs",
    description: "Lighting, wiring, and household electrical work.",
    image: "/images/services/electrical.jpg",
    price: 95,
    status: "Active",
  },
  {
    name: "AC Repair",
    category: "Appliance care",
    description: "Air conditioning repair and seasonal maintenance.",
    image: "/images/services/ac-repair.jpg",
    price: 85,
    status: "Active",
  },
  {
    name: "Painting",
    category: "Home improvement",
    description: "Refresh your rooms with a clean, professional finish.",
    image: "/images/services/painting.png",
    price: 120,
    status: "Active",
  },
  {
    name: "Pest Control",
    category: "Home care",
    description: "Professional treatment to keep unwanted pests out.",
    image: "/images/services/pest%20control.jpg",
    price: 75,
    status: "Active",
  },
  {
    name: "Appliance Repair",
    category: "Appliance care",
    description: "Get essential household appliances back in working order.",
    image: "/images/services/applience%20repair.jpeg",
    price: 80,
    status: "Active",
  },
  {
    name: "Moving & Shifting",
    category: "Moving",
    description: "Packing and moving support to make your move easier.",
    image: "/images/services/moving%20%26%20shifting.png",
    price: 150,
    status: "Active",
  },
];

export async function seedServices() {
  if ((await Service.estimatedDocumentCount()) === 0) {
    await Service.insertMany(defaultServices);
    return;
  }

  await Promise.all(
    defaultServices.map(({ name, image }) =>
      Service.updateMany(
        { name, $or: [{ image: { $exists: false } }, { image: null }, { image: "" }] },
        { $set: { image } },
      ),
    ),
  );
}
