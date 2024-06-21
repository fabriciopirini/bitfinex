import { changePriceDecimalDigits, selectPriceDecimalDigits } from "@/lib/features/orderBookSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

export const PricePrecisionChanger = () => {
  const dispatch = useAppDispatch();
  const priceDecimalDigits = useAppSelector(selectPriceDecimalDigits);

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg">Price decimal digits: {priceDecimalDigits}</h2>
      <p className="text-sm text-pretty max-w-md">
        Price decimal digits is the number of decimal digits to display for the price amount. The minimum is 1 and the
        maximum is 7 digits.
      </p>
      <div className="flex gap-2">
        <button
          className="bg-slate-200 p-2 rounded-md hover:bg-slate-300"
          onClick={() => dispatch(changePriceDecimalDigits(priceDecimalDigits + 1))}
        >
          Increase
        </button>
        <button
          className="bg-slate-200 p-2 rounded-md hover:bg-slate-300"
          onClick={() => dispatch(changePriceDecimalDigits(priceDecimalDigits - 1))}
        >
          Decrease
        </button>
      </div>
    </div>
  );
};
