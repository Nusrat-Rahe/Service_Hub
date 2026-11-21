import { Router } from "express";
import mongoose from "mongoose";
import { Category } from "../models/Category";
import { Service } from "../models/Service";
import { Subcategory } from "../models/Subcategory";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const categories = await Category.find({ status: "Active" }).sort({ name: 1 }).lean();
    const categoryIds = categories.map((category) => category._id);
    const [services, subcategories] = await Promise.all([
      Service.find({ _id: { $in: categories.map((category) => category.serviceId) }, status: "Active" }).lean(),
      Subcategory.find({ categoryId: { $in: categoryIds }, status: "Active" }).sort({ name: 1 }).lean(),
    ]);
    const serviceById = new Map(services.map((service) => [service._id.toString(), service]));
    const subcategoriesByCategory = new Map<string, typeof subcategories>();
    for (const subcategory of subcategories) {
      const key = subcategory.categoryId.toString();
      const records = subcategoriesByCategory.get(key) ?? [];
      records.push(subcategory);
      subcategoriesByCategory.set(key, records);
    }
    res.json({
      categories: categories.flatMap((category) => {
        const service = serviceById.get(category.serviceId.toString());
        return service
          ? [{ ...category, service, subcategories: subcategoriesByCategory.get(category._id.toString()) ?? [] }]
          : [];
      }),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:identifier", async (req, res, next) => {
  const identifier = req.params.identifier;
  try {
    const filter = mongoose.isValidObjectId(identifier)
      ? { $or: [{ _id: identifier }, { serviceId: identifier }] }
      : { slug: identifier.toLowerCase() };
    const category = await Category.findOne({ ...filter, status: "Active" }).lean();
    if (!category) {
      res.status(404).json({ message: "Service category not found." });
      return;
    }
    const [service, subcategories] = await Promise.all([
      Service.findOne({ _id: category.serviceId, status: "Active" }).lean(),
      Subcategory.find({ categoryId: category._id, status: "Active" }).sort({ name: 1 }).lean(),
    ]);
    if (!service) {
      res.status(404).json({ message: "This category is currently unavailable." });
      return;
    }
    res.json({ category: { ...category, service, subcategories } });
  } catch (error) {
    next(error);
  }
});

export default router;
