import { GraphQLObjectType, GraphQLString } from "graphql";

const ImageType = new GraphQLObjectType({
  name: "ImageType",
  fields: {
    secure_url: { type: GraphQLString },
    public_id: { type: GraphQLString },
  },
});

const CategoryType = new GraphQLObjectType({
  name: "CategoryType",
  fields: {
    name: { type: GraphQLString },
    slug: { type: GraphQLString },
    Image: { type: ImageType },
    createdBy: { type: GraphQLString },
    updatedBy: { type: GraphQLString },
    customId: { type: GraphQLString },
  },
});

export { ImageType, CategoryType };
