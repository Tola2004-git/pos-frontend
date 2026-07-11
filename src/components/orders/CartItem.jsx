import { Add, Gallery, Minus, Trash } from "iconsax-react";
import { glassCard } from "../../utils/styles";

export function CartItem({
  item,
  onUpdateQty,
  onRemove,
  findItemPromotions,
  formatPromotionLabel,
  truncatePromoName,
  getItemTotal,
  getItemDiscount,
}) {
  const promotions = findItemPromotions(item);
  const itemTotal = getItemTotal(item);
  const discount = getItemDiscount(item);

  return (
    <div
      style={glassCard}
      className="p-3 rounded-xl mb-[10px] flex gap-3 relative"
    >
      {/* Item Image */}
      <div className="w-[60px] h-[60px] rounded-[8px] overflow-hidden flex items-center justify-center bg-white/5 shrink-0">
        {item.product?.image ||
        item.product?.image_url ||
        item.image_url ||
        item.image ? (
          <img
            src={
              item.product?.image ||
              item.product?.image_url ||
              item.image_url ||
              item.image
            }
            alt={item.product_name}
            className="w-full h-full object-contain"
          />
        ) : (
          <Gallery size={40} color="white" variant="Linear" />
        )}
      </div>

      {/* Item Details */}
      <div className="flex-1 flex flex-col justify-between">
        <span className="text-white text-[0.9rem] font-semibold">
          {item.product_name}
        </span>

        {/* Promotion Info */}
        {promotions.length > 0 ? (
          <div className="text-white/50 text-[0.72rem] mb-1 space-y-1 min-w-0">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="flex items-center justify-center gap-1 min-w-0 max-w-full"
              >
                <span className="min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap block text-center">
                  {truncatePromoName(promo.name)}
                </span>
                <span className="flex-shrink-0 text-[0.68rem] text-[#bdeeff]">
                  {formatPromotionLabel(promo)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-white/50 text-[0.72rem] mb-1 block">
            No promo
          </span>
        )}

        {/* Price and Discount */}
        <span className="text-white font-bold text-base">
          ${itemTotal.toFixed(2)}
        </span>
        {discount > 0 && (
          <span className="text-white/50 text-[0.72rem] line-through">
            ${item.subtotal.toFixed(2)}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col justify-between items-end">
        {/* Delete Button */}
        <button
          onClick={() => onRemove(item.product_id)}
          className="bg-transparent border-none cursor-pointer pl-[5px] pb-[5px] hover:scale-110 transition-transform"
          aria-label="Remove item"
        >
          <Trash size={20} variant="Linear" color="red" />
        </button>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 bg-white/5 py-1 px-2 rounded-full">
          <button
            onClick={() => onUpdateQty(item.product_id, item.quantity - 1)}
            className="w-[22px] h-[22px] rounded-full border-none bg-white/15 text-white flex items-center justify-center cursor-pointer hover:bg-white/25 transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus size={14} variant="Linear" color="white" />
          </button>
          <span className="text-white font-semibold min-w-[15px] text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQty(item.product_id, item.quantity + 1)}
            className="w-[22px] h-[22px] rounded-full border-none bg-white/15 text-white flex items-center justify-center cursor-pointer hover:bg-white/25 transition-colors"
            aria-label="Increase quantity"
          >
            <Add size={14} color="white" variant="Linear" />
          </button>
        </div>
      </div>
    </div>
  );
}
