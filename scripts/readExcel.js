const XLSX = require('xlsx');
const path = require('path');

function readPriceList(filePath) {
  try {
    // 读取Excel文件
    const workbook = XLSX.readFile(filePath);
    
    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // 转换为JSON数组
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('Excel文件读取成功！');
    console.log('工作表名称:', sheetName);
    console.log('数据行数:', jsonData.length);
    console.log('\n前几行数据:');
    console.log(JSON.stringify(jsonData.slice(0, 3), null, 2));
    
    return {
      success: true,
      data: jsonData,
      sheetName: sheetName
    };
    
  } catch (error) {
    console.error('读取Excel文件时出错:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const excelPath = path.join(__dirname, '../印度威價格表.xlsx');
  const result = readPriceList(excelPath);
  
  if (result.success) {
    console.log('\n=== 所有数据 ===');
    result.data.forEach((row, index) => {
      console.log(`第 ${index + 1} 行:`, row);
    });
  }
}

module.exports = readPriceList;