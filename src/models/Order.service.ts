import OrderItemModel from "../schema/OrderItem.model";
import OrderModel from "../schema/Order.model";
import { Member } from "../libs/types/member";
import {
  Order,
  OrderInquiry,
  OrderItemInput,
  OrderUpdateInput,
} from "../libs/types/order";
import { shapeIntoMongooseObjecId } from "../libs/config";
import { ObjectId } from "mongoose";
import { OrderStatus } from "../libs/enums/order.enum";
import MemberService from "./Member.service";
import Errors from "../libs/Error";
import { HttpCode } from "../libs/Error";
import { Message } from "../libs/Error";

class OrderService {
  private readonly orderModel;
  private readonly orderItemModel;
  private readonly memberService;

  constructor() {
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItemModel;
    this.memberService = new MemberService();
  }
  public async createOrder(
    member: Member,
    input: OrderItemInput[]
  ): Promise<Order> {
    const membertId = shapeIntoMongooseObjecId(member._id);
    const amount = input.reduce((accumulator: number, item: OrderItemInput) => {
      return accumulator + item.itemPrice * item.itemQuantity;
    }, 0);
    const delivery = amount < 100 ? 5 : 0;

    try {
      const newOrder: Order | any = await this.orderModel.create({
        orderTotal: amount + delivery,
        orderDelivery: delivery,
        memberId: membertId,
      });
      const orderId = newOrder._id;
      console.log("orderid: ", orderId);
      await this.recordOrderItem(orderId, input);

      return newOrder;
    } catch (err) {
      console.log("Error, model:createOrder:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }
  private async recordOrderItem(
    orderId: ObjectId,
    input: OrderItemInput[]
  ): Promise<void> {
    const promiosedList = input.map(async (item: OrderItemInput) => {
      item.orderId = orderId;
      item.productId = shapeIntoMongooseObjecId(item.productId);
      await this.orderItemModel.create(item);
      return "INSERTED";
    });

    const orderItemState = await Promise.all(promiosedList);
    console.log("orderItemState:", orderItemState);
  }

  public async getMyOrders(
    member: Member,
    inquiry: OrderInquiry
  ): Promise<Order[]> {
    const memberId = shapeIntoMongooseObjecId(member._id);
    const matches = { memberId: memberId, orderStatus: inquiry.orderStatus };

    const result = await this.orderModel
      .aggregate([
        { $match: matches },
        { $sort: { updatedAt: -1 } },
        { $skip: (inquiry.page - 1) * inquiry.limit },
        { $limit: inquiry.limit },
        {
          $lookup: {
            from: "orderItems",
            localField: "_id",
            foreignField: "orderId",
            as: "orderItems",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "orderItems.productId",
            foreignField: "_id",
            as: "productData",
          },
        },
      ])
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async updateOrder(
    member: Member,
    input: OrderUpdateInput
  ): Promise<Order> {
    const memberId = shapeIntoMongooseObjecId(member._id),
      orderId = shapeIntoMongooseObjecId(input.orderId),
      orderStatus = input.orderStatus;

    const result = await this.orderModel
      .findOneAndUpdate(
        {
          memberId: memberId,
          _id: orderId,
        },
        { orderStatus: orderStatus },
        { new: true }
      )
      .exec();
     if (!result)
       throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

     if (orderStatus === OrderStatus.PROCESS) {
       await this.memberService.addUserPoint(member, 1);
     }
    return result as unknown as Order;
  }
}
export default OrderService;
