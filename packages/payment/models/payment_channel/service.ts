import { BaseService } from "thinkts";

export default class Payment_channelService extends BaseService {
  async initChannel(opts, think) {
    if (!opts.tenant_id) throw new Error('tenant_id is required');
  
    const model = think.model('payment_channel');
    const existing = await model.where({ tenant_id: opts.tenant_id, channel_code: 'mock' }).first();
    if (existing) return existing;
  
    return await model.create({
      tenant_id: opts.tenant_id,
      channel_code: 'mock',
      channel_name: 'Mock Pay',
      provider: 'mock',
      config_json: {},
      status: 'enabled'
    });
  }

}
