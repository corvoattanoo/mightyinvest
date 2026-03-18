
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

export interface StockHistory {
    price: number;
    recorded_at: string;
}
