import paginationFunction from "./pagination.js";

class ApiFeatures {
  constructor(mongooseQuery, queryData) {
    this.mongooseQuery = mongooseQuery;
    this.queryData = queryData;
  }

  //Pagination
  pagination() {
    const { page, size } = this.queryData;
    const { limit, skip } = paginationFunction({ page, size });
    this.mongooseQuery.limit(limit).skip(skip);
    return this;
  }

  //Sort
  sort() {
    this.mongooseQuery.sort(this.queryData.sort.replaceAll(",", " "));
    return this;
  }

  //Select
  select() {
    this.mongooseQuery.select(this.queryData.select.replaceAll(",", " "));
    return this;
  }

  //Filters
  filter() {
    const filterData = JSON.parse(
      JSON.stringify(this.queryData).replace(
        /gt|gte|lt|lte|in|nin|eq|neq|regex/g,
        (match) => `$${match}`
      )
    );
    this.mongooseQuery.find(filterData);
    return this;
  }
}

export default ApiFeatures;
