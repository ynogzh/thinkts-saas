import { describe, it, expect, beforeAll } from "bun:test";
import { getTestContext, post } from "../../test/setup";
import type { TestContext } from "../../test/setup";

describe("mall_order relation", () => {
  let ctx: TestContext;
  let productId: number;
  let buyerId: number;

  beforeAll(async () => {
    ctx = await getTestContext();

    const product = await post(ctx.baseUrl, "/api/mall/product/create-product", {
      tenant_id: ctx.tenantId,
      name: "Relation Test Product",
      price: 100,
    }, ctx.token);
    expect(product.body.errno).toBe(0);
    expect(product.body.data).toHaveProperty("id");
    productId = Number(product.body.data.id);

    const buyer = await post(ctx.baseUrl, "/api/identity/user/register", {
      tenant_id: ctx.tenantId,
      username: `buyer_${Date.now()}`,
      password_hash: "x",
    }, ctx.token);
    expect(buyer.body.errno).toBe(0);
    expect(buyer.body.data).toHaveProperty("id");
    buyerId = Number(buyer.body.data.id);
  });

  it("creates order and returns item via relation", async () => {
    const order = await post(ctx.baseUrl, "/api/mall/order/submit", {
      tenant_id: ctx.tenantId,
      user_id: buyerId,
      product_id: productId,
      quantity: 2,
    }, ctx.token);
    expect(order.status).toBe(200);
    expect(order.body.errno).toBe(0);
    expect(order.body.data.item.order_id).toBe(order.body.data.mall_order.id);
  });
});
