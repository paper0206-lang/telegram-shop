const fs = require('fs').promises;
const path = require('path');

// 簡體到繁體的字典映射
const s2tDict = {
  // 基本字詞
  '欢迎': '歡迎',
  '购物': '購物',
  '浏览': '瀏覽',
  '查看': '查看',
  '获取': '獲取',
  '帮助': '幫助',
  '我们': '我們',
  '接受': '接受',
  '支付': '支付',
  '使用': '使用',
  '命令': '指令',
  '开始': '開始',
  '商品': '商品',
  '购物车': '購物車',
  '用户': '用戶',
  '暂无': '暫無',
  '可售': '可售',
  '来到': '來到',
  '选择': '選擇',
  '想要': '想要',
  '分类': '分類',
  '同时': '同時',
  '显示': '顯示',
  '精选': '精選',
  '获取': '獲取',
  '信息': '訊息',
  '出错': '出錯',
  '请': '請',
  '稍后': '稍後',
  '重试': '重試',
  '错误': '錯誤',
  '车': '車',
  '购': '購',
  '浏': '瀏',
  '览': '覽',
  '获': '獲',
  '货': '貨',
  '币': '幣',
  '应': '應',
  '内': '內',
  '买': '買',
  '障': '障',
  '联': '聯',
  '询': '詢',
  '问': '問',
  '务': '務',
  '单': '單',
  '详': '詳',
  '情': '情',
  '没': '沒',
  '创': '創',
  '建': '建',
  '发': '發',
  '票': '票',
  '订': '訂',
  '总': '總',
  '价': '價',
  '存': '存',
  '储': '儲',
  '处': '處',
  '理': '理',
  '过': '過',
  '期': '期',
  '验': '驗',
  '证': '證',
  '败': '敗',
  '试': '試',
  '这': '這',
  '里': '裡',
  '额': '額',
  '外': '外',
  '检': '檢',
  '库': '庫',
  '发': '發',
  '送': '送',
  '清': '清',
  '记': '記',
  '录': '錄',
  '更': '更',
  '新': '新',
  '保': '保',
  '确': '確',
  '认': '認',
  '邮': '郵',
  '件': '件',
  '联': '聯',
  '系': '繫',
  '时': '時',
  '间': '間',
  '谢': '謝',
  '您': '您',
  '数': '數',
  '量': '量',
  '种': '種',
  '交': '交',
  '易': '易',
  '已': '已',
  '感': '感',
  '邮': '郵',
  '如': '如',
  '有': '有',
  '疑': '疑',
  '问': '問',
  '联': '聯',
  '系': '繫',
  '客': '客',
  '服': '服',
  '清': '清',
  '理': '理',
  '期': '期',
  '的': '的',
  '待': '待',
  '付': '付',
  '款': '款'
};

// 短語映射
const phraseDict = {
  '购物车': '購物車',
  '浏览商品': '瀏覽商品',
  '查看购物车': '查看購物車',
  '获取帮助': '獲取幫助',
  '我们接受': '我們接受',
  '开始购物': '開始購物',
  '使用以下命令': '使用以下指令',
  '暂无商品可售': '暫無商品可售',
  '欢迎来到我们的商店': '歡迎來到我們的商店',
  '请选择您想要浏览的商品分类': '請選擇您想要瀏覽的商品分類',
  '同时显示精选商品': '同時顯示精選商品',
  '精选商品': '精選商品',
  '获取商品信息时出错': '獲取商品訊息時出錯',
  '请稍后重试': '請稍後重試',
  '购物命令': '購物指令',
  '浏览所有商品': '瀏覽所有商品',
  '回到主菜单': '回到主選單',
  '支付方式': '支付方式',
  '我们使用': '我們使用',
  '作为支付货币': '作為支付貨幣',
  '您可以通过应用内购买获得': '您可以通過應用內購買獲得',
  '支付安全由': '支付安全由',
  '保障': '保障',
  '需要帮助': '需要幫助',
  '请联系客服获取支持': '請聯繫客服獲取支持'
};

function convertToTraditionalChinese(text) {
  let result = text;
  
  // 先替換短語
  for (const [simplified, traditional] of Object.entries(phraseDict)) {
    result = result.replace(new RegExp(simplified, 'g'), traditional);
  }
  
  // 再替換單字
  for (const [simplified, traditional] of Object.entries(s2tDict)) {
    result = result.replace(new RegExp(simplified, 'g'), traditional);
  }
  
  return result;
}

async function updateFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const updatedContent = convertToTraditionalChinese(content);
    
    if (content !== updatedContent) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ 已更新: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️ 跳過: ${filePath} (無需更新)`);
      return false;
    }
  } catch (error) {
    console.error(`❌ 更新失敗: ${filePath}`, error.message);
    return false;
  }
}

async function updateAllFiles() {
  const filesToUpdate = [
    'src/handlers/MessageHandler.js',
    'src/handlers/CallbackHandler.js',
    'src/utils/UIHelper.js',
    'data/products.json'
  ];
  
  let updatedCount = 0;
  
  for (const file of filesToUpdate) {
    const filePath = path.join(__dirname, '..', file);
    const updated = await updateFile(filePath);
    if (updated) updatedCount++;
  }
  
  console.log(`\n🎉 轉換完成！更新了 ${updatedCount} 個檔案`);
}

// 如果直接運行此腳本
if (require.main === module) {
  updateAllFiles();
}

module.exports = { convertToTraditionalChinese, updateAllFiles };