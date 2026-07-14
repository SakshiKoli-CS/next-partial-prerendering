import { ProductDeal } from '#/components/product-deal';
import { add, formatDistanceToNow } from 'date-fns';
import { type Dinero } from 'dinero.js';

async function getExpiresInLabel(expiresInDays?: number): Promise<string> {
  'use cache';
  const date = add(new Date(), { days: expiresInDays });
  return formatDistanceToNow(date);
}

export const ProductLighteningDeal = async ({
  price,
  discount,
}: {
  price: Dinero<number>;
  discount: {
    amount: Dinero<number>;
    expires?: number;
  };
}) => {
  const expiresIn = await getExpiresInLabel(discount.expires);

  return (
    <>
      <div className="flex">
        <div className="rounded bg-gray-600 px-1.5 text-xs font-medium leading-5 text-white">
          Expires in {expiresIn}
        </div>
      </div>

      <ProductDeal price={price} discount={discount} />
    </>
  );
};
