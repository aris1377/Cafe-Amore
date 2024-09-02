import { ProductInput, ProductUpdateInput } from "../libs/types/product";
import ProductModel from "../schema/Product.model";
import { Product } from "../libs/types/product";
import Errors from "../libs/Error";
import { HttpCode } from "../libs/Error";
import { Message } from "../libs/Error";
import { shapeIntoMongooseObjecId } from "../libs/config";

class ProductService {
    private readonly productModel;
    constructor() {
        this.productModel = ProductModel;
    }

    
    /** SPA */
    
    /** SSR */

      public async getAllProducts(): Promise<Product[] | any> {
    const result = await this.productModel.find().exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }
    
    public async createNewProduct(input: ProductInput): Promise<Product[] | any> {
        try {
            return await this.productModel.create(input);
        } catch (err) {
            console.log("Error, model:createNewProduct:", err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
    }

    public async updateChosenProduct(id: string, input: ProductUpdateInput): Promise<Product[] | any> {
        id = shapeIntoMongooseObjecId(id);
      const result = await this.productModel
      .findOneAndUpdate({ _id: id }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    return result;
  }

 
}
export default ProductService;


