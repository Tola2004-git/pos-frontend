import { Gallery, SearchNormal1 } from "iconsax-react";
import { glassCard } from "../../utils/styles";

export function ProductGrid({
  products,
  search,
  onSearchChange,
  onAddToCart,
  findProductPromotions,
  formatPromotionLabel,
  truncatePromoName,
}) {
  // Filter products based on search
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 p-4 overflow-y-auto border-r border-white/10">
      {/* Search Input */}
      <div className="flex items-center bg-white/5 px-3 py-2 rounded-lg border border-white/10 mb-[14px]">
        <SearchNormal1
          size={20}
          color="#fff"
          variant="Linear"
          style={{ marginRight: "10px" }}
        />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-white text-[14px] py-1"
        />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-[10px]">
        {filteredProducts.map((p) => {
          const promotions = findProductPromotions(p);

          return (
            <div
              key={p.id}
              onClick={() => onAddToCart(p)}
              style={glassCard}
              className="p-3 rounded-[12px] cursor-pointer text-center duration-200 hover:scale-105 transition-all"
            >
              {/* Product Image */}
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-20 h-20 rounded-[10px] object-contain mx-auto mb-2 block"
                />
              ) : (
                <div className="w-[60px] h-[60px] rounded-[10px] flex items-center justify-center text-[1.5rem] mx-auto mb-2">
                  <Gallery size={50} color="#fff" variant="Linear" />
                </div>
              )}

              {/* Product Name */}
              <div className="text-white text-[0.82rem] font-semibold mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {p.name}
              </div>

              {/* Promotion Badges */}
              {promotions.length > 0 && (
                <div className="text-[#d7f5ff] text-[0.72rem] mb-1">
                  {promotions.map((promo) => (
                    <div
                      key={promo.id}
                      className="flex items-center justify-center gap-1 overflow-hidden"
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
              )}

              {/* Price and Stock */}
              <div className="text-white font-bold text-[0.88rem]">
                ${Number(p.price).toFixed(2)}
              </div>
              <div className="text-white/40 text-[0.72rem]">Stock: {p.qty}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
