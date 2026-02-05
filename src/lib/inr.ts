// Indian Number Formatting Utilities

/**
 * Format number in Indian numbering system (Lakhs/Crores)
 * Example: 1,50,000 instead of 150,000
 */
export function formatIndianNumber(num: number): string {
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  if (absNum < 1000) {
    return sign + absNum.toFixed(2);
  }
  
  const numStr = Math.floor(absNum).toString();
  let result = '';
  
  // Last 3 digits
  result = numStr.slice(-3);
  let remaining = numStr.slice(0, -3);
  
  // Add remaining digits in pairs (Indian system)
  while (remaining.length > 0) {
    const pair = remaining.slice(-2);
    remaining = remaining.slice(0, -2);
    result = pair + ',' + result;
  }
  
  // Handle decimal places
  const decimal = (absNum % 1).toFixed(2).slice(2);
  return sign + '₹' + result + '.' + decimal;
}

/**
 * Format rupees with ₹ symbol and Indian numbering
 */
export function formatRupee(amount: number): string {
  return formatIndianNumber(amount);
}

/**
 * Format large numbers as Lakhs/Crores
 */
export function formatLakhsCrores(num: number): string {
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  if (absNum >= 10000000) {
    return sign + '₹' + (absNum / 10000000).toFixed(2) + ' Cr';
  } else if (absNum >= 100000) {
    return sign + '₹' + (absNum / 100000).toFixed(2) + ' L';
  } else if (absNum >= 1000) {
    return sign + '₹' + (absNum / 1000).toFixed(2) + 'K';
  }
  return formatRupee(absNum);
}

/**
 * Format date in Indian format (DD/MM/YYYY)
 */
export function formatIndianDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Get short Indian date format (DD MMM)
 */
export function formatShortIndianDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  return `${day} ${month}`;
}

/**
 * Check if current month is a festive spending month
 */
export function isFestiveSeason(): { isFestive: boolean; festival: string | null; bufferPercent: number } {
  const month = new Date().getMonth();
  
  // October/November - Diwali season
  if (month === 9 || month === 10) {
    return { isFestive: true, festival: 'Diwali', bufferPercent: 30 };
  }
  // March - Holi season
  if (month === 2) {
    return { isFestive: true, festival: 'Holi', bufferPercent: 30 };
  }
  // August/September - Ganesh Chaturthi & Onam
  if (month === 7 || month === 8) {
    return { isFestive: true, festival: 'Ganesh Chaturthi', bufferPercent: 20 };
  }
  
  return { isFestive: false, festival: null, bufferPercent: 0 };
}

/**
 * Calculate days until next allowance
 */
export function getDaysUntilAllowance(nextAllowanceDate: Date | null): number {
  if (!nextAllowanceDate) {
    // Default to end of current month
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }
  const now = new Date();
  const diff = nextAllowanceDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Calculate daily burn rate
 */
export function calculateDailyBurnRate(remaining: number, daysUntilAllowance: number): number {
  if (daysUntilAllowance <= 0) return remaining;
  return remaining / daysUntilAllowance;
}

// Chai-Samosa Index: Average street food meal cost across Indian cities
export const STREET_FOOD_PRICES: Record<string, number> = {
  'Delhi': 60,
  'Mumbai': 80,
  'Bangalore': 70,
  'Chennai': 55,
  'Kolkata': 50,
  'Hyderabad': 65,
  'Pune': 65,
  'Jaipur': 55,
  'Ahmedabad': 50,
  'Default': 60,
};

/**
 * Get street food meal cost for a city
 */
export function getStreetFoodPrice(city: string): number {
  return STREET_FOOD_PRICES[city] || STREET_FOOD_PRICES['Default'];
}

/**
 * Calculate Chai-Samosa Index (how many meals "wasted" on subscriptions)
 */
export function calculateChaiSamosaIndex(subscriptionSpend: number, city: string = 'Delhi'): number {
  const mealCost = getStreetFoodPrice(city);
  return Math.floor(subscriptionSpend / mealCost);
}
