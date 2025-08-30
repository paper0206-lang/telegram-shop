const fs = require('fs').promises;
const path = require('path');

class ProductService {
  constructor() {
    this.productsPath = path.join(__dirname, '../../data/products.json');
    this.products = [];
    this.loadProducts();
  }

  async loadProducts() {
    try {
      const data = await fs.readFile(this.productsPath, 'utf8');
      this.products = JSON.parse(data);
      console.log(`✅ 已載入 ${this.products.length} 個商品`);
    } catch (error) {
      console.error('❌ 載入商品時發生錯誤:', error);
      this.products = [];
    }
  }

  async saveProducts() {
    try {
      await fs.writeFile(this.productsPath, JSON.stringify(this.products, null, 2));
      console.log('✅ 商品已成功儲存');
    } catch (error) {
      console.error('❌ 儲存商品時發生錯誤:', error);
    }
  }

  getAllProducts() {
    return this.products;
  }

  getProductById(id) {
    return this.products.find(product => product.id === id);
  }

  getProductsByCategory(category) {
    return this.products.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
  }

  getFeaturedProducts() {
    return this.products.filter(product => product.featured);
  }

  searchProducts(query) {
    const searchQuery = query.toLowerCase();
    return this.products.filter(product =>
      product.name.toLowerCase().includes(searchQuery) ||
      product.description.toLowerCase().includes(searchQuery) ||
      product.category.toLowerCase().includes(searchQuery)
    );
  }

  getCategories() {
    const categories = [...new Set(this.products.map(product => product.category))];
    return categories;
  }

  isProductAvailable(productId, quantity = 1) {
    const product = this.getProductById(productId);
    return product && product.stock >= quantity;
  }

  updateStock(productId, quantity) {
    const productIndex = this.products.findIndex(product => product.id === productId);
    if (productIndex !== -1) {
      this.products[productIndex].stock -= quantity;
      this.saveProducts();
      return true;
    }
    return false;
  }

  formatProductMessage(product) {
    const stockStatus = product.stock > 10 ? '✅ 現貨充足' : 
                       product.stock > 0 ? `⚠️ 僅剩 ${product.stock} 件` : '❌ 缺貨';
    
    return `${product.name}\n\n` +
           `📝 ${product.description}\n\n` +
           `💰 價格: ${product.price} ⭐\n` +
           `📦 分類: ${product.category}\n` +
           `📊 庫存: ${stockStatus}\n` +
           `🆔 商品ID: ${product.id}`;
  }

  formatProductsList(products, title = '商品列表') {
    if (products.length === 0) {
      return '暫無商品';
    }

    let message = `${title}\n\n`;
    products.forEach((product, index) => {
      const stockIcon = product.stock > 0 ? '✅' : '❌';
      message += `${index + 1}. ${stockIcon} ${product.name}\n`;
      message += `   💰 ${product.price} ⭐ | 📦 ${product.category}\n\n`;
    });

    return message;
  }
}

module.exports = ProductService;