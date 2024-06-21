"use client";

import { PricePrecisionChanger } from "@/app/components/PricePrecisionChanger";
import { selectMessages, selectPriceDecimalDigits, type Order } from "@/lib/features/orderBookSlice";

import { useAppSelector } from "@/lib/hooks";
import { clsx } from "clsx";

export const MAX_ORDERS_TO_SHOW = 25;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "decimal",
});

const processOrders = (orders: Order[], orderType: "buy" | "sell", priceDecimalDigits: number) => {
  if (!orders) return [];

  const filteredOrders = orders.filter((order) => {
    const count = order?.[1]?.[1];
    const amount = order?.[1]?.[2];
    return count !== 0 && (orderType === "buy" ? amount > 0 : amount < 0);
  });

  const orderMap = filteredOrders.reduce((acc: Map<string, Order>, order) => {
    const channelId = order[0];
    const price = order[1][0];
    const count = order[1][1];
    const amount = order[1][2];
    const formattedPrice = amount.toFixed(priceDecimalDigits);

    // If the price is already in the map, increment the count
    if (acc.has(formattedPrice)) {
      const existingOrder = acc.get(formattedPrice) as Order;
      existingOrder[1][1] += count;
    } else {
      acc.set(formattedPrice, [channelId, [price, count, amount]]);
    }
    return acc;
  }, new Map()); // A Map is recommended here because of the performance benefits due to the big amount of data

  const orderValues = Array.from(orderMap.values());
  const limitedOrders = orderValues.slice(-MAX_ORDERS_TO_SHOW);
  const sortedOrders = limitedOrders.sort((a, b) => {
    const [priceA] = a[1];
    const [priceB] = b[1];

    return orderType === "buy" ? priceB - priceA : priceA - priceB;
  });

  return sortedOrders;
};

export const OrderBook = () => {
  const orders = useAppSelector(selectMessages);
  const priceDecimalDigits = useAppSelector(selectPriceDecimalDigits);

  return (
    <div className="flex flex-col gap-4 w-full">
      <h1 className="text-center text-3xl font-semibold">Order Book</h1>
      <PricePrecisionChanger />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full">
        <OrderBookTable
          orderType="buy"
          orders={processOrders(orders, "buy", priceDecimalDigits)}
          priceDecimalDigits={priceDecimalDigits}
        />
        <OrderBookTable
          orderType="sell"
          orders={processOrders(orders, "sell", priceDecimalDigits)}
          priceDecimalDigits={priceDecimalDigits}
        />
      </div>
    </div>
  );
};

const OrderBookTable = ({
  orderType,
  orders,
  priceDecimalDigits,
}: {
  orderType: "buy" | "sell";
  orders: Order[];
  priceDecimalDigits: number;
}) => {
  const columns = ["Count", "Amount", "Total", "Price"];

  const shouldInvertColumns = orderType === "sell";

  const columnTitles = shouldInvertColumns ? columns.reverse() : columns;

  return (
    <div className="relative w-full overflow-auto">
      <h3 className="mx-auto w-fit pb-5 text-xl font-medium">{orderType === "buy" ? "Buy" : "Sell"}</h3>
      <table
        className={clsx("w-full text-sm table-fixed", {
          "border-separate border-spacing-y-2": orders.length === 0,
        })}
      >
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors">
            {columnTitles.map((columnTitle) => (
              <th
                key={columnTitle}
                className={clsx(
                  "h-12 uppercase px-1 align-middle font-medium text-slate-900",
                  columnTitle === "Count"
                    ? "text-center"
                    : shouldInvertColumns && columnTitle === "Price"
                    ? "text-left"
                    : "text-right"
                )}
              >
                {columnTitle}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0 space-y-2">
          {orders.length === 0 ? (
            <>
              {Array.from({ length: 10 }, (_, index) => (
                <tr key={index} className="h-7">
                  <td colSpan={4} className="animate-pulse w-full rounded-md bg-slate-200" />
                </tr>
              ))}
            </>
          ) : (
            orders.map(([channelId, bookEntries], index: number) => {
              const [price, count, amount] = bookEntries;

              const formattedPrice = currencyFormatter.format(price);
              const total = (count * amount).toFixed(priceDecimalDigits);
              const formattedAmount = amount.toFixed(priceDecimalDigits);

              const data = shouldInvertColumns
                ? [formattedPrice, total, formattedAmount, count]
                : [count, formattedAmount, total, formattedPrice];

              return (
                <tr
                  key={index}
                  className="border-b h-7 transition-colors hover:bg-slate-200 [&>td]:p-1 [&>td]:align-middle [&>td]:tabular-nums"
                >
                  <td className={clsx({ "text-center": !shouldInvertColumns, "text-left": shouldInvertColumns })}>
                    {data[0]}
                  </td>
                  <td className={clsx("w-[8ch] text-right")}>{data[1]}</td>
                  <td className={clsx("w-[8ch] text-right")}>{data[2]}</td>
                  <td className={clsx({ "text-center": shouldInvertColumns, "text-right": !shouldInvertColumns })}>
                    {data[3]}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
