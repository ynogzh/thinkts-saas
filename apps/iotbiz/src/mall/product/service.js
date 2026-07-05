export async function createProduct(opts, think) {
  if (!opts.tenant_id) throw new Error('tenant_id is required');
  if (!opts.name) throw new Error('name is required');
  if (opts.price === undefined || opts.price === null) throw new Error('price is required');

  const product = await think.model('mall_product').create({
    tenant_id: opts.tenant_id,
    name: opts.name,
    price: Number(opts.price),
    status: 'enabled'
  });

  return product;
}
