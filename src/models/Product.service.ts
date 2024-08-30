import ProductModel from "../schema/Product.model";

class ProductServive{
    private readonly productModel;
    constructor() {
        this.productModel = ProductModel;
    }
}

export default ProductServive