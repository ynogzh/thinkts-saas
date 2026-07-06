/**
 * Resource label catalog — maps API resource keys to Chinese labels and icons.
 * Keyed by the table/resource name (e.g. "platform_tenant").
 */
export interface ResourceCatalogEntry {
  label: string
  icon: string
}

export const RESOURCE_CATALOG: Record<string, ResourceCatalogEntry> = {
  // ── Platform ──
  platform_tenant: { label: '租户', icon: 'Building' },
  platform_tenant_module: { label: '租户模块', icon: 'Blocks' },

  // ── Identity ──
  identity_user: { label: '用户', icon: 'Users' },
  identity_dept: { label: '部门', icon: 'Building2' },
  identity_login_log: { label: '登录日志', icon: 'FileText' },

  // ── Permission ──
  permission_role: { label: '角色', icon: 'Shield' },
  permission_role_permission: { label: '角色权限', icon: 'ShieldCheck' },
  permission_menu: { label: '菜单权限', icon: 'Menu' },
  permission_data_scope: { label: '数据范围', icon: 'Filter' },
  permission_data_resource: { label: '数据资源', icon: 'Database' },
  permission_user_role: { label: '用户角色', icon: 'UserCheck' },
  permission_tenant_permission: { label: '租户权限', icon: 'Building2' },

  // ── Trade ──
  trade_order: { label: '订单', icon: 'ShoppingCart' },
  trade_order_item: { label: '订单明细', icon: 'List' },
  trade_settle_order: { label: '结算单', icon: 'Receipt' },

  // ── Payment ──
  payment_order: { label: '支付单', icon: 'CreditCard' },
  payment_refund: { label: '退款', icon: 'Undo2' },
  payment_channel: { label: '支付渠道', icon: 'Wallet' },
  payment_callback_log: { label: '回调日志', icon: 'Webhook' },

  // ── Promote ──
  promote_coupon: { label: '优惠券', icon: 'Ticket' },
  promote_user_coupon: { label: '用户优惠券', icon: 'TicketCheck' },
  promote_coupon_use_record: { label: '使用记录', icon: 'ClipboardList' },
  promote_commission_rule: { label: '佣金规则', icon: 'Percent' },
  promote_commission_record: { label: '佣金记录', icon: 'DollarSign' },
  promote_agent_relation: { label: '代理关系', icon: 'Users' },
  promote_activity: { label: '活动', icon: 'Megaphone' },
  promote_activity_participant: { label: '活动参与', icon: 'UserPlus' },
  promote_distribution_record: { label: '分销记录', icon: 'Share2' },

  // ── Content ──
  content_article: { label: '文章', icon: 'FileText' },
  content_category: { label: '分类', icon: 'FolderTree' },

  // ── Iotbiz ──
  iotbiz_device: { label: '设备', icon: 'Cpu' },
  iotbiz_device_category: { label: '设备分类', icon: 'Tags' },
  iotbiz_device_type: { label: '设备型号', icon: 'Smartphone' },
  iotbiz_device_sku: { label: '设备SKU', icon: 'Barcode' },
  iotbiz_device_profile: { label: '设备档案', icon: 'FileBadge' },
  iotbiz_device_usage_record: { label: '用量记录', icon: 'Activity' },
  iotbiz_command_log: { label: '指令日志', icon: 'Terminal' },
  iotbiz_site: { label: '站点', icon: 'MapPin' },
  iotbiz_merchant: { label: '商户', icon: 'Store' },
  iotbiz_campaign: { label: '营销活动', icon: 'Megaphone' },
  iotbiz_entitlement: { label: '权益', icon: 'Award' },
  iotbiz_package: { label: '套餐', icon: 'Package' },
  iotbiz_package_order: { label: '套餐订单', icon: 'PackageCheck' },
  iotbiz_param_template: { label: '参数模板', icon: 'FileCode' },
  iotbiz_recharge_order: { label: '充值订单', icon: 'Zap' },
  iotbiz_revenue_share: { label: '分账', icon: 'Split' },
  iotbiz_session: { label: '会话', icon: 'MessageCircle' },

  // ── Mall ──
  mall_product: { label: '商品', icon: 'ShoppingBag' },
  mall_order: { label: '商城订单', icon: 'ShoppingCart' },
  mall_order_item: { label: '订单明细', icon: 'List' },

  // ── Base ──
  base: { label: '基础数据', icon: 'Database' },
}
