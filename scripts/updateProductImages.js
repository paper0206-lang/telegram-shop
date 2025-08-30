const fs = require('fs').promises;
const path = require('path');

// 醫藥產品圖片 (使用可靠的公開圖片服務)
const realPackagingImages = {
  // 使用Lorem Picsum提供的高質量隨機圖片
  'super_p_force_oral_jelly': 'https://picsum.photos/400/300?random=1',
  'malegra_pro_100': 'https://picsum.photos/400/300?random=2',
  'vidalista_20': 'https://picsum.photos/400/300?random=3',
  'vidalista_40': 'https://picsum.photos/400/300?random=4',
  'suhagra_50': 'https://picsum.photos/400/300?random=5',
  'tadarise_5': 'https://picsum.photos/400/300?random=6',
  'tadarise_20': 'https://picsum.photos/400/300?random=7',
  'tadarise_pro_40': 'https://picsum.photos/400/300?random=8',
  'tadarise_pro_20': 'https://picsum.photos/400/300?random=9',
  'cenforce_100': 'https://picsum.photos/400/300?random=10',
  'cenforce_150': 'https://picsum.photos/400/300?random=11',
  'cenforce_200': 'https://picsum.photos/400/300?random=12',
  'cobra_200': 'https://picsum.photos/400/300?random=13',
  'poxet_90': 'https://picsum.photos/400/300?random=14',
  'extra_super_p_force': 'https://picsum.photos/400/300?random=15'
};

// 根據產品名稱映射到真實包裝圖片
const productImageMapping = {
  "💊 Super P-Force Oral Jelly": realPackagingImages.super_p_force_oral_jelly,
  "💊 Malegra Pro 100": realPackagingImages.malegra_pro_100,
  "💊 Vidalista 20": realPackagingImages.vidalista_20,
  "💊 Vidalista 40": realPackagingImages.vidalista_40,
  "💊 Suhagra 50": realPackagingImages.suhagra_50,
  "💊 Tadarise-5": realPackagingImages.tadarise_5,
  "💊 Tadarise-20": realPackagingImages.tadarise_20,
  "💊 Tadarise Pro-40": realPackagingImages.tadarise_pro_40,
  "💊 Tadarise-Pro-20": realPackagingImages.tadarise_pro_20,
  "💊 Cenforce 100": realPackagingImages.cenforce_100,
  "💊 Cenforce 150": realPackagingImages.cenforce_150,
  "💊 Cenforce 200": realPackagingImages.cenforce_200,
  "💊 Cobra 200 Sildenafil Citrate": realPackagingImages.cobra_200,
  "💊 Poxet-90 Dapoxetine": realPackagingImages.poxet_90,
  "💊 Extra Super P-Force Avanafil": realPackagingImages.extra_super_p_force
};

async function updateProductImages() {
  try {
    const productsPath = path.join(__dirname, '../data/products.json');
    
    // 讀取現有產品數據
    const productsData = await fs.readFile(productsPath, 'utf8');
    const products = JSON.parse(productsData);
    
    console.log('🔄 開始更新產品圖片...');
    
    // 更新每個產品的圖片
    let updatedCount = 0;
    products.forEach(product => {
      const newImage = productImageMapping[product.name];
      if (newImage && newImage !== product.image) {
        console.log(`✅ 更新 ${product.name} 的圖片`);
        product.image = newImage;
        updatedCount++;
      } else if (newImage) {
        console.log(`⏭️ ${product.name} 圖片已是最新`);
      } else {
        console.log(`⚠️ 未找到 ${product.name} 的對應圖片`);
      }
    });
    
    // 保存更新後的產品數據
    await fs.writeFile(productsPath, JSON.stringify(products, null, 2), 'utf8');
    
    console.log(`\\n🎉 圖片更新完成！`);
    console.log(`📊 總共更新了 ${updatedCount} 個產品的圖片`);
    console.log(`📦 產品總數: ${products.length}`);
    
    // 顯示所有產品的圖片資訊
    console.log('\\n📋 產品圖片列表：');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   🖼️ 圖片: ${product.image}`);
      console.log('');
    });
    
    return products;
    
  } catch (error) {
    console.error('❌ 更新產品圖片時發生錯誤:', error.message);
    throw error;
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  updateProductImages()
    .then(() => {
      console.log('✅ 腳本執行完成');
    })
    .catch((error) => {
      console.error('❌ 腳本執行失敗:', error.message);
      process.exit(1);
    });
}

module.exports = { updateProductImages, productImageMapping };