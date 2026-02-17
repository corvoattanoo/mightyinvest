
export interface Stock {
    id: number;
    symbol: string;
    name: string;
    price: number;
}

export interface StockHistory {
    price: number;
    recorded_at: string;
}
