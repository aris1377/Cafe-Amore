import { ProductInput } from "../libs/types/product";
import ProductModel from "../schema/Product.model";
import { Product } from "../libs/types/product";
import Errors from "../libs/Error";
import { HttpCode } from "../libs/Error";
import { Message } from "../libs/Error";

class ProductServive {
    private readonly productModel;
    constructor() {
        this.productModel = ProductModel;
    }

    
    /** SPA */
    
    /** SSR */
    
    public async createNewProduct(input: ProductInput): Promise<Product[] | any> {
        try {
            return await this.productModel.create(input);
        } catch (err) {
            console.log("Error, model:createNewProduct:", err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
    }
}

export default ProductServive