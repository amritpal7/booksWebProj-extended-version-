
class APIfeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        // Build the query
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'limit', 'sort', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);
        // console.log(req.query, queryObj)

        // Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        // console.log(JSON.stringify(queryStr));

        this.query = this.query.find(JSON.parse(queryStr));
        // let query = Book.find(JSON.parse(queryStr));

        return this;
    }

    sort() {
        // Sorting the fields
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort("created_at");
        }
        return this;
    }

    limit() {
        // Limiting the fields
        if (this.queryString.fields) {
            const selectedFields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(selectedFields);
        }
        return this;
    }

    paginate() {
        // Pagonation
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIfeatures;