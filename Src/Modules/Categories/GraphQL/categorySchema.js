import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import {
  createCategory,
  getAllCategoriesResolve,
} from "./graphQlCategoryResolve.js";

const categorySchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "CategoryQuerySchema",
    description: "Schema of CategoryQuery in GraphQL",
    fields: {
      getAllCategories: getAllCategoriesResolve,
      createCategory: createCategory,
    },
  }),
});

export { categorySchema };
