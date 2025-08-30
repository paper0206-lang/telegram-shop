class UIHelper {
  constructor() {
    this.BUTTONS_PER_ROW = 2;
    this.MAX_PRODUCTS_PER_PAGE = 10;
  }

  createMainMenuKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: '🛍️ 瀏覽商品', callback_data: 'back_to_shop' },
          { text: '🛒 購物車', callback_data: 'cart_view' }
        ],
        [
          { text: '📋 所有商品', callback_data: 'all_products' }
        ]
      ]
    };
  }

  createCategoriesKeyboard(categories) {
    const buttons = categories.map(category => ({
      text: `📦 ${category}`,
      callback_data: `category:${category}`
    }));

    // 将按钮分组为每行2个
    const rows = [];
    for (let i = 0; i < buttons.length; i += this.BUTTONS_PER_ROW) {
      rows.push(buttons.slice(i, i + this.BUTTONS_PER_ROW));
    }

    // 添加其他选项行
    rows.push([
      { text: '📋 查看所有', callback_data: 'all_products' }
    ]);

    rows.push([
      { text: '🏠 主菜單', callback_data: 'main_menu' },
      { text: '🛒 購物車', callback_data: 'cart_view' }
    ]);

    return { inline_keyboard: rows };
  }

  createProductsKeyboard(products, showBackButton = true) {
    const buttons = products.slice(0, this.MAX_PRODUCTS_PER_PAGE).map(product => {
      const stockIcon = product.stock > 0 ? '✅' : '❌';
      const priceText = `${product.price} ⭐`;
      return {
        text: `${stockIcon} ${product.name} - ${priceText}`,
        callback_data: `product:${product.id}`
      };
    });

    // 将按钮分组为每行1个（因为产品名称较长）
    const rows = buttons.map(button => [button]);

    // 添加导航按钮
    if (showBackButton) {
      rows.push([
        { text: '🔙 返回分類', callback_data: 'back_to_shop' },
        { text: '🛒 購物車', callback_data: 'cart_view' }
      ]);
    }

    return { inline_keyboard: rows };
  }

  createProductDetailKeyboard(product, inCart = false) {
    const buttons = [];

    if (product.stock > 0) {
      if (!inCart) {
        buttons.push([
          { text: '🛒 添加到購物車', callback_data: `add_cart:${product.id}` }
        ]);
      } else {
        buttons.push([
          { text: '✅ 已添加到購物車', callback_data: 'cart_view' }
        ]);
      }
    } else {
      buttons.push([
        { text: '❌ 已售完', callback_data: 'back_to_shop' }
      ]);
    }

    buttons.push([
      { text: '🔙 返回商品列表', callback_data: 'back_to_shop' },
      { text: '🛒 購物車', callback_data: 'cart_view' }
    ]);

    return { inline_keyboard: buttons };
  }

  createCartKeyboard(userId) {
    return {
      inline_keyboard: [
        [
          { text: '💳 立即结账', callback_data: 'checkout' }
        ],
        [
          { text: '🛍️ 继续購物', callback_data: 'back_to_shop' },
          { text: '🗑️ 清空購物車', callback_data: 'clear_cart' }
        ],
        [
          { text: '🏠 主菜單', callback_data: 'main_menu' }
        ]
      ]
    };
  }

  createCartItemKeyboard(productId, currentQuantity, maxStock) {
    const buttons = [];

    // 數量调整按钮
    const quantityRow = [];
    if (currentQuantity > 1) {
      quantityRow.push({ text: '➖', callback_data: `quantity:${productId}:-1` });
    }
    quantityRow.push({ text: `數量: ${currentQuantity}`, callback_data: 'noop' });
    if (currentQuantity < maxStock) {
      quantityRow.push({ text: '➕', callback_data: `quantity:${productId}:1` });
    }
    buttons.push(quantityRow);

    // 移除按钮
    buttons.push([
      { text: '🗑️ 移除商品', callback_data: `remove_item:${productId}` }
    ]);

    // 导航按钮
    buttons.push([
      { text: '🔙 返回購物車', callback_data: 'cart_view' },
      { text: '🛍️ 继续購物', callback_data: 'back_to_shop' }
    ]);

    return { inline_keyboard: buttons };
  }

  createBackToShopKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: '🔙 返回商店', callback_data: 'back_to_shop' },
          { text: '🏠 主菜單', callback_data: 'main_menu' }
        ]
      ]
    };
  }

  createEmptyCartKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: '🛍️ 去購物', callback_data: 'back_to_shop' }
        ],
        [
          { text: '🏠 主菜單', callback_data: 'main_menu' }
        ]
      ]
    };
  }

  createConfirmationKeyboard(confirmAction, cancelAction = 'main_menu') {
    return {
      inline_keyboard: [
        [
          { text: '✅ 確認', callback_data: confirmAction },
          { text: '❌ 取消', callback_data: cancelAction }
        ]
      ]
    };
  }

  // 處理长列表的分页
  createPaginationKeyboard(currentPage, totalPages, actionPrefix) {
    const buttons = [];
    const pageRow = [];

    if (currentPage > 1) {
      pageRow.push({ text: '⬅️ 上一页', callback_data: `${actionPrefix}:${currentPage - 1}` });
    }

    pageRow.push({ text: `${currentPage}/${totalPages}`, callback_data: 'noop' });

    if (currentPage < totalPages) {
      pageRow.push({ text: '➡️ 下一页', callback_data: `${actionPrefix}:${currentPage + 1}` });
    }

    if (pageRow.length > 1) {
      buttons.push(pageRow);
    }

    return buttons;
  }

  // 快速創建單行按钮
  createSingleRowKeyboard(buttons) {
    return {
      inline_keyboard: [
        buttons.map(button => ({
          text: button.text,
          callback_data: button.callback_data
        }))
      ]
    };
  }

  // 錯誤訊息键盘
  createErrorKeyboard(message = '發生錯誤') {
    return {
      inline_keyboard: [
        [
          { text: '🔄 重試', callback_data: 'back_to_shop' },
          { text: '🏠 主菜單', callback_data: 'main_menu' }
        ]
      ]
    };
  }

  // 格式化商品價格顯示
  formatPrice(price) {
    return `${price} ⭐`;
  }

  // 格式化按钮文本，確保长度合理
  truncateButtonText(text, maxLength = 30) {
    return text.length > maxLength 
      ? text.substring(0, maxLength - 3) + '...'
      : text;
  }
}

module.exports = UIHelper;