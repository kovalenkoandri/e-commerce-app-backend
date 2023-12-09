const calculateSpecialPrice = async (row) => {
  if (row) {
    const numericPrice = parseFloat(row.replace(",", ""));
    if (numericPrice >= 1 && numericPrice <= 100) {
      return Number(numericPrice * 0.4 + numericPrice).toFixed(2);
    } else if (numericPrice > 100 && numericPrice <= 150) {
      return Number(numericPrice * 0.3 + numericPrice).toFixed(2);
    } else if (numericPrice > 150 && numericPrice <= 250) {
      return Number(numericPrice * 0.25 + numericPrice).toFixed(2);
    } else if (numericPrice > 250 && numericPrice <= 370) {
      return Number(numericPrice * 0.23 + numericPrice).toFixed(2);
    } else if (numericPrice > 370 && numericPrice <= 500) {
      return Number(numericPrice * 0.2 + numericPrice).toFixed(2);
    } else if (numericPrice > 500 && numericPrice <= 700) {
      return Number(numericPrice * 0.16 + numericPrice).toFixed(2);
    } else if (numericPrice > 700 && numericPrice <= 1000) {
      return Number(numericPrice * 0.14 + numericPrice).toFixed(2);
    } else if (numericPrice > 1000 && numericPrice <= 2000) {
      return Number(numericPrice * 0.11 + numericPrice).toFixed(2);
    } else if (numericPrice > 2000 && numericPrice <= 3000) {
      return Number(numericPrice * 0.09 + numericPrice).toFixed(2);
    } else if (numericPrice > 3000 && numericPrice <= 4000) {
      return Number(numericPrice * 0.08 + numericPrice).toFixed(2);
    } else if (numericPrice > 4000 && numericPrice <= 5000) {
      return Number(numericPrice * 0.07 + numericPrice).toFixed(2);
    } else if (numericPrice > 5000 && numericPrice <= 7000) {
      return Number(numericPrice * 0.06 + numericPrice).toFixed(2);
    } else if (numericPrice > 7000 && numericPrice <= 10000) {
      return Number(numericPrice * 0.05 + numericPrice).toFixed(2);
    } else if (numericPrice > 10000 && numericPrice <= 20000) {
      return Number(numericPrice * 0.04 + numericPrice).toFixed(2);
    } else if (numericPrice > 20000 && numericPrice <= 30000) {
      return Number(numericPrice * 0.03 + numericPrice).toFixed(2);
    } else if (numericPrice > 40000 && numericPrice <= 50000) {
      return Number(numericPrice * 0.02 + numericPrice).toFixed(2);
    } else if (numericPrice > 50000) {
      return Number(numericPrice * 0.015 + numericPrice).toFixed(2);
    } else {
      return "Помилкове значення";
    }
  }
};
module.exports = calculateSpecialPrice;
