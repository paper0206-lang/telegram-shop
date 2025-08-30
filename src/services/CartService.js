class CartService {
  constructor() {
    // 使用内存存储用户购物车数据，在生产环境中应该使用持久化存储
    this.carts = new Map();
  }

  getCart(userId) {
    if (!this.carts.has(userId)) {
      this.carts.set(userId, {
        items: [],
        total: 0,
        createdAt: new Date()
      });
    }
    return this.carts.get(userId);
  }

  addItem(userId, productId, quantity = 1) {
    const cart = this.getCart(userId);
    const existingItem = cart.items.find(item => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        addedAt: new Date()
      });
    }

    this.updateCartTotal(userId);
    return true;
  }

  removeItem(userId, productId) {
    const cart = this.getCart(userId);
    cart.items = cart.items.filter(item => item.productId !== productId);
    this.updateCartTotal(userId);
    return true;
  }

  updateQuantity(userId, productId, quantity) {
    const cart = this.getCart(userId);
    const item = cart.items.find(item => item.productId === productId);
    
    if (item) {
      if (quantity > 0) {
        item.quantity = quantity;
      } else {
        this.removeItem(userId, productId);
        return true;
      }
    }

    this.updateCartTotal(userId);
    return true;
  }

  clearCart(userId) {
    const cart = this.getCart(userId);
    cart.items = [];
    cart.total = 0;
    return true;
  }

  updateCartTotal(userId, productService) {
    const cart = this.getCart(userId);
    let total = 0;

    if (productService) {
      cart.items.forEach(item => {
        const product = productService.getProductById(item.productId);
        if (product) {
          total += product.price * item.quantity;
        }
      });
    }

    cart.total = total;
    return total;
  }

  getCartItems(userId) {
    const cart = this.getCart(userId);
    return cart.items;
  }

  getCartItemsCount(userId) {
    const cart = this.getCart(userId);
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  getCartTotal(userId) {
    const cart = this.getCart(userId);
    return cart.total;
  }

  isEmpty(userId) {
    const cart = this.getCart(userId);
    return cart.items.length === 0;
  }

  formatCartMessage(userId, productService) {
    const cart = this.getCart(userId);
    
    if (cart.items.length === 0) {
      return '🛒 您的購物車是空的\n\n使用 /shop 指令瀏覽商品';
    }

    this.updateCartTotal(userId, productService);

    let message = '🛒 您的購物車\n\n';
    let total = 0;

    cart.items.forEach((item, index) => {
      const product = productService.getProductById(item.productId);
      if (product) {
        const itemTotal = product.price * item.quantity;
        total += itemTotal;
        message += `${index + 1}. ${product.name}\n`;
        message += `   💰 ${product.price} ⭐ × ${item.quantity} = ${itemTotal} ⭐\n\n`;
      }
    });

    message += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💳 總計: ${total} ⭐ (${cart.items.length} 種商品)\n`;
    message += `🎁 數量: ${this.getCartItemsCount(userId)} 件`;

    return message;
  }

  validateCart(userId, productService) {
    const cart = this.getCart(userId);
    const errors = [];
    const validItems = [];

    cart.items.forEach(item => {
      const product = productService.getProductById(item.productId);
      
      if (!product) {
        errors.push(`商品 ${item.productId} 不存在`);
      } else if (product.stock < item.quantity) {
        errors.push(`${product.name} 庫存不足，僅剩 ${product.stock} 件`);
        // 調整數量到可用庫存
        if (product.stock > 0) {
          item.quantity = product.stock;
          validItems.push(item);
        }
      } else {
        validItems.push(item);
      }
    });

    // 更新購物車為有效商品
    cart.items = validItems;
    this.updateCartTotal(userId, productService);

    return {
      isValid: errors.length === 0,
      errors,
      validItemsCount: validItems.length
    };
  }
}

module.exports = CartService;