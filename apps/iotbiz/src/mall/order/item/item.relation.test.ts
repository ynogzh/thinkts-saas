import { describe, it, expect, beforeAll } from "bun:test";
import { getTestContext, post, get } from "../../../test/setup";
import type { TestContext } from "../../../test/setup";

describe("mall_order_item belongsTo order", () => {
  let ctx: TestContext;
  let orderId: number;

  beforeAll(async () => {
    ctx = await getTestContext();

    const product = await post(ctx.baseUrl, "/api/mall/product/create-product", {
      tenant_id: ctx.tenantId,
      name: "Relation Product",
      price: 50,
    }, ctx.token);
    expect(product.body.errno).toBe(0);
    expect(product.body.data).toHaveProperty("id");
    const productId = Number(product.body.data.id);

    const buyer = await post(ctx.baseUrl, "/api/identity/user/register", {
      tenant_id: ctx.tenantId,
      username: `buyer_${Date.now()}`,
      password_hash: "x",
    }, ctx.token);
    expect(buyer.body.errno).toBe(0);
    expect(buyer.body.data).toHaveProperty("id");
    const buyerId = Number(buyer.body.data.id);

    const order = await post(ctx.baseUrl, "/api/mall/order/submit", {
      tenant_id: ctx.tenantId,
      user_id: buyerId,
      product_id: productId,
      quantity: 1,
    }, ctx.token);
    expect(order.body.errno).toBe(0);
    expect(order.body.data.mall_order).toHaveProperty("id");
    orderId = Number(order.body.data.mall_order.id);
  });

  it("loads item for the order", async () => {
    const res = await get(ctx.baseUrl, `/mall/order/item/list?tenant_id=${ctx.tenantId}&order_id=${orderId}`, ctx.token);
    console.error("LIST RESPONSE:", JSON.stringify(res.body));
    expect(res.status).toBe(200);
    expect(res.body.data.some((it: { order_id: number }) => Number(it.order_id) === orderId)).toBe(true);
  });
});
