const readPriceList = require('./readExcel');
const fs = require('fs').promises;
const path = require('path');

// 药品分类映射
const categoryMapping = {
  'sildenafil': '男性健康',
  'tadalafil': '男性健康', 
  'dapoxetine': '男性健康',
  'avanafil': '男性健康'
};

// 通用医药产品图片URLs (使用合适的医药产品占位图)
const medicineImages = [
  'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', // 药片
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', // 药物胶囊
  'https://images.unsplash.com/photo-1550572017-4fa49e191e36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', // 医疗用品
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', // 药品包装
  'https://images.unsplash.com/photo-1576092768241-dec231879fc3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'  // 医药产品
];

function getCategory(productName) {
  const name = productName.toLowerCase();
  if (name.includes('sildenafil') || name.includes('malegra') || name.includes('cenforce') || name.includes('suhagra') || name.includes('cobra')) {
    return '男性健康';
  } else if (name.includes('tadalafil') || name.includes('vidalista') || name.includes('tadarise')) {
    return '男性健康';
  } else if (name.includes('dapoxetine') || name.includes('poxet')) {
    return '男性健康';
  } else if (name.includes('avanafil')) {
    return '男性健康';
  }
  return '保健品';
}

function getDescription(productName, pack) {
  const name = productName.toLowerCase();
  
  // 基础描述模板
  let description = '';
  
  if (name.includes('sildenafil') || name.includes('malegra') || name.includes('cenforce') || name.includes('suhagra') || name.includes('cobra')) {
    description = '含西地那非成分的男性健康产品，有助于改善血液循环。';
  } else if (name.includes('tadalafil') || name.includes('vidalista') || name.includes('tadarise')) {
    description = '含他达拉非成分的长效男性健康产品，作用时间长达36小时。';
  } else if (name.includes('dapoxetine') || name.includes('poxet')) {
    description = '含达泊西汀成分的男性健康产品，有助于提升生活质量。';
  } else if (name.includes('avanafil')) {
    description = '含阿伐那非成分的快效男性健康产品。';
  } else if (name.includes('oral jelly')) {
    description = '口服果冻剂型，易于服用，起效快速。';
  } else {
    description = '优质男性健康保健产品，提升生活品质。';
  }
  
  // 添加包装信息
  if (pack && pack !== productName) {
    description += ` 包装规格: ${pack}。`;
  }
  
  description += ' 请咨询医师使用建议。';
  
  return description;
}

function convertPrice(ntdPrice) {
  // 将新台币价格转换为Stars (假设汇率 1 NTD = 0.1 Stars，可以根据实际情况调整)
  if (!ntdPrice || ntdPrice === 0) {
    return 10; // 最低价格
  }
  
  let starsPrice = Math.round(ntdPrice * 0.1);
  
  // 确保价格合理
  if (starsPrice < 10) starsPrice = 10;
  if (starsPrice > 1000) starsPrice = 1000;
  
  return starsPrice;
}

async function convertToProducts() {
  try {
    const excelPath = path.join(__dirname, '../印度威價格表.xlsx');
    const result = readPriceList(excelPath);
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    const products = [];
    
    result.data.forEach((row, index) => {
      // 处理第一行特殊情况
      if (index === 0 && typeof row['产品名称'] === 'string' && row['产品名称'].includes(',')) {
        const parts = row['产品名称'].split(',');
        if (parts.length >= 5) {
          products.push({
            id: `${index + 1}`,
            name: `💊 ${parts[0].trim()}`,
            description: getDescription(parts[0], parts[1]),
            price: convertPrice(parseInt(parts[2]) || 0),
            category: getCategory(parts[0]),
            image: medicineImages[index % medicineImages.length],
            stock: Math.floor(Math.random() * 50) + 10, // 随机库存 10-59
            featured: index < 5 // 前5个设为精选
          });
        }
        return;
      }
      
      // 处理正常数据行
      if (row['产品名称'] && (row['批发价 (NTD)'] || row['一中老板 (NTD)'])) {
        const price = row['批发价 (NTD)'] || row['一中老板 (NTD)'] || 0;
        const pack = row['Pack'] && row['Pack'] !== row['产品名称'] ? row['Pack'] : row['Pack_1'];
        
        products.push({
          id: `${index + 1}`,
          name: `💊 ${row['产品名称']}`,
          description: getDescription(row['产品名称'], pack),
          price: convertPrice(price),
          category: getCategory(row['产品名称']),
          image: medicineImages[index % medicineImages.length],
          stock: Math.floor(Math.random() * 50) + 10, // 随机库存 10-59
          featured: index < 5 // 前5个设为精选
        });
      }
    });
    
    // 保存到products.json
    const productsPath = path.join(__dirname, '../data/products.json');
    await fs.writeFile(productsPath, JSON.stringify(products, null, 2), 'utf8');
    
    console.log(`✅ 成功转换 ${products.length} 个产品到 products.json`);
    console.log('\n转换后的产品列表：');
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   价格: ${product.price} ⭐`);
      console.log(`   分类: ${product.category}`);
      console.log(`   库存: ${product.stock}`);
      console.log('');
    });
    
    return products;
    
  } catch (error) {
    console.error('转换产品时出错:', error.message);
    return null;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  convertToProducts();
}

module.exports = convertToProducts;