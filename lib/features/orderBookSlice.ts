import { MAX_ORDERS_TO_SHOW } from "@/app/components/OrderBook";
import { createAppSlice } from "@/lib/createAppSlice";

export type ChannelId = number;
export type BookEntry = [number, number, number];
export type Order = [ChannelId, BookEntry];

export type OrderBookSliceState = {
  messages: Order[];
  priceDecimalDigits: number;
};

const initialState: OrderBookSliceState = {
  messages: [],
  priceDecimalDigits: 4,
};

const MIN_DECIMAL_DIGITS = 1;
const MAX_DECIMAL_DIGITS = 7;

export const orderBookSlice = createAppSlice({
  name: "orderBook",
  initialState,
  reducers: (create) => ({
    addOrder: create.reducer((state, action: { payload: Order }) => {
      // Since this is just a widget showing limited information, there is no need to store a huge amount of data in memory
      // We only keep the last 20 times the amount of orders being shown to avoid lag
      state.messages = [...state.messages.slice(-MAX_ORDERS_TO_SHOW * 20), action.payload];
    }),
    changePriceDecimalDigits: create.reducer((state, action: { payload: number }) => {
      state.priceDecimalDigits = Math.min(Math.max(action.payload, MIN_DECIMAL_DIGITS), MAX_DECIMAL_DIGITS);
    }),
  }),
  selectors: {
    selectMessages: (state: OrderBookSliceState) => state.messages,
    selectPriceDecimalDigits: (state: OrderBookSliceState) => state.priceDecimalDigits,
  },
});

export const { addOrder, changePriceDecimalDigits } = orderBookSlice.actions;
export const { selectMessages, selectPriceDecimalDigits } = orderBookSlice.selectors;
