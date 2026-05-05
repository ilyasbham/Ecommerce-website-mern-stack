class ApiFeatures {
    constructor(query,queryString){
        this.query=query;
        this.queryString=queryString;
    }


    //Search for products by name
    search(){
        const keyword=this.queryString.keyword ? {
            name:{
                //regex enables flexible, partial, and case-insensitive searches.
                //For example, searching for "lap" will match "Laptop", "LAPTOP", or "lapdesk".
                $regex:this.queryString.keyword,
                //case insensitive
                $options:'i',
            }
        }:{};
        this.query=this.query.find({...keyword});
        return this;
    }


filter() {
  const queryCopy = { ...this.queryString };

  const removeFields = ["keyword", "page", "limit"];
  removeFields.forEach((key) => delete queryCopy[key]);

  // Convert operators (gte → $gte, etc.)
  let queryStr = JSON.stringify(queryCopy);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

  let mongoQuery = JSON.parse(queryStr);

  if (mongoQuery.price) {
    for (const key in mongoQuery.price) {
      mongoQuery.price[key] = Number(mongoQuery.price[key]);
    }
  }

  if (mongoQuery.rating) {
    for (const key in mongoQuery.rating) {
      mongoQuery.rating[key] = Number(mongoQuery.rating[key]);
    }
  }

  if (mongoQuery.category) {
    mongoQuery.category = {
      $regex: mongoQuery.category,
      $options: "i",
    };
  }


  // Apply filters to query
  this.query = this.query.find(mongoQuery);

  return this;
}


//pagination
    //resultPerPage=5 ka controller ka lr ml
    pagination(resultPerPage){
        const currentPage=Number(this.queryString.page) || 1;

        //if nga do ka page 1 mr so yin currentpage ka 1 So (1-1)=0 * resultperpage ka 5->0 so skip  0
        //if nga do ka page 2 mr so yin currentpage ka 2 So (2-1)=1 * resultperpage ka 5->5 so skip  5
        //if nga do ka page 3 mr so yin currentpage ka 3 So (3-1)=2 * resultperpage ka 5->10 so skip  10


       const skip=resultPerPage * (currentPage - 1);

       //main method is here to pagination .limit().skip()
        this.query=this.query.limit(resultPerPage).skip(skip);
        return this;
    }




}

module.exports=ApiFeatures;