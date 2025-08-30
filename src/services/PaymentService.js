const config = require('../../config/config');

class PaymentService {
  constructor(bot) {
    this.bot = bot;
    this.pendingPayments = new Map();
  }

  async createInvoice(chatId, userId, cartItems, productService) {
    if (cartItems.length === 0) {
      throw new Error('購物車為空');
    }

    // 計算訂單詳情
    let totalAmount = 0;
    const invoiceItems = [];

    cartItems.forEach(item => {
      const product = productService.getProductById(item.productId);
      if (product && product.stock >= item.quantity) {
        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;
        invoiceItems.push({
          label: `${product.name} × ${item.quantity}`,
          amount: itemTotal
        });
      }
    });

    if (invoiceItems.length === 0) {
      throw new Error('沒有可購買的商品');
    }

    // 生成唯一的支付ID
    const paymentId = `pay_${Date.now()}_${userId}`;
    
    // 儲存待付款訂單訊息
    this.pendingPayments.set(paymentId, {
      userId,
      chatId,
      items: cartItems,
      total: totalAmount,
      createdAt: new Date()
    });

    // 建立發票
    const invoice = {
      chat_id: chatId,
      title: `${config.shop.name} 訂單`,
      description: `您的訂單包含 ${cartItems.length} 種商品`,
      payload: paymentId,
      currency: config.shop.currency, // XTR for Telegram Stars
      prices: [
        {
          label: '商品總價',
          amount: totalAmount
        }
      ],
      photo_url: 'https://via.placeholder.com/400x200/4CAF50/white?text=Telegram+Shop',
      photo_size: 400,
      photo_width: 400,
      photo_height: 200,
      need_name: false,
      need_phone_number: false,
      need_email: false,
      need_shipping_address: false,
      send_phone_number_to_provider: false,
      send_email_to_provider: false,
      is_flexible: false,
      disable_notification: false,
      protect_content: false,
      reply_to_message_id: null,
      allow_sending_without_reply: true
    };

    try {
      await this.bot.sendInvoice(
        invoice.chat_id,
        invoice.title,
        invoice.description,
        invoice.payload,
        '', // provider_token 为空，因为使用 Telegram Stars
        invoice.currency,
        invoice.prices,
        {
          photo_url: invoice.photo_url,
          photo_size: invoice.photo_size,
          photo_width: invoice.photo_width,
          photo_height: invoice.photo_height,
          need_name: invoice.need_name,
          need_phone_number: invoice.need_phone_number,
          need_email: invoice.need_email,
          need_shipping_address: invoice.need_shipping_address,
          send_phone_number_to_provider: invoice.send_phone_number_to_provider,
          send_email_to_provider: invoice.send_email_to_provider,
          is_flexible: invoice.is_flexible,
          disable_notification: invoice.disable_notification,
          protect_content: invoice.protect_content,
          reply_to_message_id: invoice.reply_to_message_id,
          allow_sending_without_reply: invoice.allow_sending_without_reply
        }
      );

      return paymentId;
    } catch (error) {
      // 清理失敗的支付記錄
      this.pendingPayments.delete(paymentId);
      throw error;
    }
  }

  async handlePreCheckout(query) {
    const paymentId = query.invoice_payload;
    const pendingPayment = this.pendingPayments.get(paymentId);

    if (!pendingPayment) {
      await this.bot.answerPreCheckoutQuery(query.id, false, {
        error_message: '訂單已過期或不存在'
      });
      return;
    }

    // 這裡可以添加額外的驗證邏輯，比如再次檢查庫存
    try {
      await this.bot.answerPreCheckoutQuery(query.id, true);
    } catch (error) {
      console.error('Pre-checkout error:', error);
      await this.bot.answerPreCheckoutQuery(query.id, false, {
        error_message: '支付驗證失敗，請重試'
      });
    }
  }

  async handleSuccessfulPayment(msg) {
    const payment = msg.successful_payment;
    const paymentId = payment.invoice_payload;
    const pendingPayment = this.pendingPayments.get(paymentId);

    if (!pendingPayment) {
      console.error('Payment completed but no pending payment found:', paymentId);
      return;
    }

    try {
      // 處理成功的支付
      const { userId, chatId, items, total } = pendingPayment;
      
      // 發送支付成功訊息
      await this.bot.sendMessage(chatId, this.formatSuccessMessage(payment, items.length));

      // 清理已完成的支付記錄
      this.pendingPayments.delete(paymentId);

      // 這裡可以添加其他後處理邏輯：
      // - 更新庫存
      // - 儲存訂單記錄
      // - 發送確認郵件等

      console.log(`✅ Payment successful: ${paymentId}, Amount: ${total} Stars`);
      
    } catch (error) {
      console.error('Error handling successful payment:', error);
      
      // 发送错误消息给用户
      await this.bot.sendMessage(pendingPayment.chatId, 
        '❌ 支付处理过程中发生错误，请联系客服。\n\n' +
        `支付ID: ${paymentId}`
      );
    }
  }

  formatSuccessMessage(payment, itemCount) {
    return `🎉 支付成功！\n\n` +
           `💳 支付金额: ${payment.total_amount} ⭐\n` +
           `🛍️ 商品数量: ${itemCount} 种\n` +
           `📅 支付时间: ${new Date().toLocaleString('zh-CN')}\n` +
           `🔐 交易ID: ${payment.telegram_payment_charge_id}\n\n` +
           `✅ 您的订单已确认，感谢您的购买！\n` +
           `📧 如有疑问，请联系客服。`;
  }

  // 清理过期的待付款订单（可以定期调用）
  cleanupExpiredPayments(maxAgeMinutes = 30) {
    const now = new Date();
    const expiredPayments = [];

    for (const [paymentId, payment] of this.pendingPayments.entries()) {
      const ageMinutes = (now - payment.createdAt) / (1000 * 60);
      if (ageMinutes > maxAgeMinutes) {
        expiredPayments.push(paymentId);
      }
    }

    expiredPayments.forEach(paymentId => {
      this.pendingPayments.delete(paymentId);
    });

    if (expiredPayments.length > 0) {
      console.log(`🧹 Cleaned up ${expiredPayments.length} expired payments`);
    }

    return expiredPayments.length;
  }

  getPendingPaymentsCount() {
    return this.pendingPayments.size;
  }
}

module.exports = PaymentService;