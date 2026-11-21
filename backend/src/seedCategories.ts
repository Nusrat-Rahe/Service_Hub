import type { ClientSession } from "mongoose";
import { categorySeedData } from "./categorySeedData";
import { Category } from "./models/Category";
import { Service } from "./models/Service";
import { Subcategory } from "./models/Subcategory";

export async function seedCategories() {
  for (const categorySeed of categorySeedData) {
    const service = await Service.findOne({ name: categorySeed.name });
    if (!service) continue;

    const category = await Category.findOneAndUpdate(
      { slug: categorySeed.slug },
      {
        $setOnInsert: {
          name: categorySeed.name,
          slug: categorySeed.slug,
          heading: categorySeed.heading,
          serviceId: service._id,
          status: "Active",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    for (const subcategorySeed of categorySeed.subcategories) {
      await Subcategory.updateOne(
        { categoryId: category._id, slug: subcategorySeed.slug },
        {
          $setOnInsert: {
            ...subcategorySeed,
            categoryId: category._id,
            status: "Active",
          },
        },
        { upsert: true },
      );
    }
  }

  const services = await Service.find();
  for (const service of services) {
    await ensureServiceCategory(service, undefined, true);
  }
}

export async function ensureServiceCategory(
  service: InstanceType<typeof Service>,
  session?: ClientSession,
  addGenericSubcategory = false,
) {
  const categoryQuery = Category.findOne({ serviceId: service._id });
  if (session) categoryQuery.session(session);
  let category = await categoryQuery;
  if (!category) {
    const slugBase = service.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "service";
    const options = session ? { session } : {};
    const [created] = await Category.create([{
      name: service.name,
      slug: `${slugBase}-${service.id}`,
      heading: `Choose Your ${service.name} Service`,
      serviceId: service._id,
      status: "Active",
    }], options);
    category = created;
  }

  if (addGenericSubcategory) {
    const subcategoryQuery = Subcategory.exists({ categoryId: category._id });
    if (session) subcategoryQuery.session(session);
    if (!(await subcategoryQuery)) {
      await Subcategory.create([{
        categoryId: category._id,
        name: "General Service",
        slug: "general",
        description: service.description,
        includes: [],
        duration: "",
        status: "Active",
      }], session ? { session } : {});
    }
  }
  return category;
}
