
export interface Stock {
    id?: number;
    symbol: string;
    name: string;
    price: number;
    current_price?: number;
    high_price?: number;
    low_price?: number;
    open_price?: number;
    previous_close?: number;
    change?: number;
    percent_change?: number;
}

export interface StockQuote {
    c: number;  // Current price
    d: number;  // Change
    dp: number; // Percent change
    h: number;  // High price of the day
    l: number;  // Low price of the day
    o: number;  // Open price of the day
    pc: number; // Previous close price
    t: number;  // Timestamp
}

export interface StockHistory {
    price: number;
    recorded_at: string;
}
