import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import categoryModel from "../../../../DB/Models/category.model.js";
import slugify from "slugify";
import { CategoryType } from "./graphQlCategoryTypes.js";

const getAllCategoriesResolve = {
  type: new GraphQLList(CategoryType),
  resolve: async () => {
    const Categories = await categoryModel.find({});
    return Categories;
  },
};

const createCategory = {
  type: new GraphQLObjectType({
    name: "response",
    fields: {
      message: { type: GraphQLString },
      category: { type: CategoryType },
    },
  }),
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
  },

  resolve: async (parent, args) => {
    const categoryObject = {
      name: args.name,
      slug: slugify(name, "_"),
    };
    const category = await categoryModel.create();
    return {
      message: "done",
      category,
    };
  },
};

export { getAllCategoriesResolve, createCategory };
