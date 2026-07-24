import { memo, useEffect, useMemo, useState } from "react";
import {
  ArchiveSlash,
  ArrowLeft2,
  ArrowRight2,
  Box,
  Gallery,
  SearchNormal1,
} from "iconsax-react";
import { glassCard } from "../../utils/styles";
import { useLowStock } from "../../context/LowStockContext";

const PAGE_SIZE = 9;

export const ProductGrid = memo(function ProductGrid({
  products,
  categories,
  search,
  onSearchChange,
  onAddToCart,
  findProductPromotions,
  formatPromotionLabel,
  truncatePromoName,
  t,
}) {
  const tr = (key, fallback) => t?.[key] || fallback;

  const { threshold } = useLowStock();
  const [activeCategory, setActiveCategory] = useState("all");
  const [page, setPage] = useState(1);

  // Filter products based on search
  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          (p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))) &&
          (activeCategory === "all" || p.category_id === activeCategory),
      ),
    [products, search, activeCategory],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = useMemo(
    () =>
      filteredProducts.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [filteredProducts, currentPage],
  );

  useEffect(() => {
    setPage(1);
  }, [search, activeCategory]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden border-r border-white/10">
      <div className="p-4 pb-0">
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
            placeholder={tr("searchProducts", "Search products...")}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white text-[14px] py-1"
          />
        </div>

        {/* Categories Filter Bar */}
        <div
          style={{
            overflowX: "auto",
            overflowY: "hidden",
            margin: 0,
            padding: "12px",
            display: "flex",
            flexDirection: "row",
            gap: "8px",
            listStyle: "none",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255, 255, 255, 0.2) transparent",
          }}
          className="flex items-center gap-2 pb-2 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
        >
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-[0.78rem] font-semibold whitespace-nowrap transition-all duration-200 ${
              activeCategory === "all"
                ? "bg-white text-[#1a1a2e] border border-white"
                : "bg-white/5 text-white/70 border border-white/15 hover:bg-white/10 hover:text-white"
            }`}
          >
            {tr("allCategory", "All")}
          </button>
          {(categories || [])
            .filter((c) => c.status)
            .map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-[0.78rem] font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeCategory === c.id
                    ? "bg-white text-[#1a1a2e] border border-white"
                    : "bg-white/5 text-white/70 border border-white/15 hover:bg-white/10 hover:text-white"
                }`}
              >
                {c.name}
              </button>
            ))}
        </div>
      </div>

      {/* Product Grid */}
      <div
        style={{
          overflowY: "auto",
          margin: 0,
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          listStyle: "none",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255, 255, 255, 0.2) transparent",
        }}
        className="flex-1 overflow-y-auto px-4 pb-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      >
        <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-[10px]">
          {paginatedProducts.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gridColumn: "span 3",
                minHeight: "350px",
                gap: "12px",
              }}
            >
              <Box size="48" color="white" variant="Outline" className="text-white/30" />
              <div
                style={{
                  fontSize: "1rem",
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: "500",
                }}
              >
                {tr("noProductsAvailable", "No products available")}
              </div>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>
                {tr("tryAnotherCategory", "Try selecting another category")}
              </div>
            </div>
          ) : (
            paginatedProducts.map((p) => {
            const promotions = findProductPromotions(p);
            const isOutOfStock = Number(p.qty) <= 0;
            const isLowStock = !isOutOfStock && Number(p.qty) <= threshold;

            return (
              <div
                key={p.id}
                onClick={() => !isOutOfStock && onAddToCart(p)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: glassCard.border,
                  boxShadow: glassCard.boxShadow,
                }}
                className={`relative p-3 rounded-[12px] text-center duration-200 transition-all ${
                  isOutOfStock
                    ? "opacity-50 pointer-events-none"
                    : "cursor-pointer hover:scale-105"
                } ${isLowStock ? "border border-amber-500/50 bg-amber-500/5" : ""}`}
              >
                {/* Out of Stock Badge */}
                {isOutOfStock && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[12px] bg-black/50">
                    <span className="rounded-full bg-red-600/90 px-2 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-white">
                      {tr("outOfStock", "Out of Stock")}
                    </span>
                  </div>
                )}

                {/* Low Stock Badge */}
                {isLowStock && (
                  <span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-amber-500/95 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-[#1a1a2e] shadow-sm">
                    {tr("lowStock", "Low Stock")}
                  </span>
                )}

                {/* Product Image */}
                {p.image ? (
                  <div
                    className="w-20 h-20 mx-auto mb-2"
                    style={{ aspectRatio: "1 / 1" }}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      width={80}
                      height={80}
                      loading="lazy"
                      decoding="async"
                      className="w-20 h-20 rounded-[10px] object-contain block"
                      style={{ aspectRatio: "1 / 1" }}
                    />
                  </div>
                ) : (
                  <div className="w-[60px] h-[60px] rounded-[10px] flex items-center justify-center text-[1.5rem] mx-auto mb-2">
                    <Gallery size={50} color="#fff" variant="Linear" />
                  </div>
                )}

                {/* Product Name */}
                <div
                  className="text-white text-[0.82rem] font-semibold mb-1 overflow-hidden text-ellipsis whitespace-nowrap"
                  title={p.name}
                >
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
                <div
                  className={`text-[0.72rem] ${
                    isOutOfStock
                      ? "text-red-400 font-semibold"
                      : isLowStock
                        ? "text-amber-500 font-semibold"
                        : "text-white/40"
                  }`}
                >
                  {tr("stockLabel", "Stock")}: {p.qty}
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3 p-4">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          style={glassCard}
          className="flex items-center gap-1 rounded-full px-4 py-2 text-[0.8rem] font-semibold text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:scale-105"
        >
          <ArrowLeft2 size={14} color="#fff" variant="Linear" />
          {tr("back2", "Back")}
        </button>

        <div
          style={glassCard}
          className="rounded-full px-4 py-2 text-[0.78rem] font-semibold text-white/80"
        >
          {tr("pageOf", "Page {current} of {total}")
            .replace("{current}", currentPage)
            .replace("{total}", totalPages)}
        </div>

        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          style={glassCard}
          className="flex items-center gap-1 rounded-full px-4 py-2 text-[0.8rem] font-semibold text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:scale-105"
        >
          {tr("next", "Next")}
          <ArrowRight2 size={14} color="#fff" variant="Linear" />
        </button>
      </div>
    </div>
  );
});
