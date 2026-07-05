/**
 * Tenant plugin service hooks.
 * SaaS-generic — no product-specific module catalog.
 */
export function beforeCreate(data) {
  if (!data.code) throw new Error("tenant code is required");
  if (!data.name) throw new Error("tenant name is required");
  return data;
}

export function beforeUpdate(data) {
  if (data.code === "") throw new Error("tenant code cannot be empty");
  return data;
}
