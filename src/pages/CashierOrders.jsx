import { useState, useEffect } from "react";
import { ReceiptText, Chart2 } from "iconsax-react";
import CashierLayout from "../components/layout/CashierLayout";
import { useOrders, useProducts, usePaymentMethods } from "../hooks/useOrders";
import { useCategories } from "../hooks/useCategories";
import { usePromotions } from "../hooks/usePromotions";
import { usePOS } from "../hooks/usePOS";
import OrdersFilter from "../components/orders/OrdersFilter";
import OrdersTable from "../components/orders/OrdersTable";
import OrderDetailModal from "../components/orders/OrderDetailModal";
import POSModal from "../components/orders/POSModal";
import ToastNotification from "../components/orders/ToastNotification";
import { printReceipt } from "../components/receipt/ReceiptTemplate";
import { fetchSalesByCashierApi } from "../api/ordersApi";
import { glassCard } from "../utils/styles";
import { useTranslations } from "../hooks/useTranslations";

// This whole page remounts every time the cashier switches to the "My
// Sales" tab (CashierHome and CashierOrders each mount their own route, they
// don't share state). Without caching the last fetched totals, `mySales`
// would reset to null on every visit, so the card would only pop in after
// the orders table (which has its own skeleton) had already finished
// loading - a jarring "appears late" flash. Cache by the query params it
// depends on so a same-day revisit shows the last known totals immediately
// while a background refetch keeps them fresh.
let cachedMySales = null;
let cachedMySalesKey = null;

// Sales history for the logged-in cashier. The backend
// (OrderController::index) automatically scopes results to the
// authenticated cashier's own orders - this page never asks for or trusts
// a "mine only" flag from the client, so it can't be widened by tampering
// with the request.
//
// Editing a still-pending order reuses the exact same resume-into-cart
// mechanism as tapping a held table on the Cashier home grid (usePOS's
// loadOrderIntoCart + resumingOrderId) - this is what lets a cashier edit a
// takeaway/self-seating pending order too, not just a dine-in one tied to a
// table card.
function CashierOrders() {
  const { t } = useTranslations();
  const {
    orders,
    loading,
    total,
    page,
    lastPage,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    currentShiftOnly,
    setCurrentShiftOnly,
    setPage,
    toasts,
    addToast,
    removeToast,
    lastOrderId,
    fetchOrders,
    handleCancel,
    cancelLoadingId,
  } = useOrders({ defaultToday: true });

  const { products, refetchProducts } = useProducts();
  const { categories } = useCategories();
  const { paymentMethods } = usePaymentMethods();
  const { promotions } = usePromotions();

  const pos = usePOS({
    onOrderCreated: () => {
      fetchOrders();
      refetchProducts();
    },
    addToast,
    lastOrderId,
    promotions,
    paymentMethods,
  });

  const [initialTableId, setInitialTableId] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const salesKey = `${dateFrom}|${dateTo}|${currentShiftOnly}`;
  const [mySales, setMySales] = useState(
    salesKey === cachedMySalesKey ? cachedMySales : null,
  );

  useEffect(() => {
    let active = true;
    fetchSalesByCashierApi({ dateFrom, dateTo, currentShiftOnly })
      .then((res) => {
        const data = res.data[0] || {
          orders_count: 0,
          total_sales: 0,
          cash_usd_total: 0,
          cash_khr_total: 0,
          digital_total: 0,
        };
        cachedMySales = data;
        cachedMySalesKey = salesKey;
        if (active) setMySales(data);
      })
      .catch(() => {
        if (active) setMySales(null);
      });
    return () => {
      active = false;
    };
  }, [dateFrom, dateTo, currentShiftOnly, orders]);

  const openOrderForEdit = (order) => {
    setInitialTableId(order.table_id ?? null);
    pos.loadOrderIntoCart(order, products);
    pos.setShowPOS(true);
  };

  const closePOS = () => {
    pos.closePOS();
    setInitialTableId(null);
  };

  return (
    <CashierLayout>
      <ToastNotification
        toasts={toasts}
        onClose={removeToast}
        onPrint={printReceipt}
      />

      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-white font-bold text-2xl m-0 flex items-center gap-3">
          <ReceiptText
            size={32}
            color="white"
            variant="Linear"
            style={{ animation: "float 3s ease-in-out infinite" }}
          />
          {t.mySales}
        </h2>
      </div>

      {mySales && (
        <div
          style={glassCard}
          className="w-full max-w-[280px] rounded-[16px] px-5 py-4 mb-5"
        >
          <div className="flex items-baseline gap-2 mb-2.5">
            <Chart2 size={18} color="#fff" variant="Bold" />
            <span className="text-white font-bold text-xl">
              ${Number(mySales.total_sales || 0).toFixed(2)}
            </span>
            <span className="text-white/50 text-xs">
              ({mySales.orders_count || 0}{" "}
              {mySales.orders_count === 1 ? t.orderSingular : t.orderPlural})
            </span>
          </div>
          <div className="flex justify-between text-[0.8rem] text-white/50 py-1 border-t border-white/10">
            <span>{t.cashUsdLabel}</span>
            <span className="text-white font-semibold">
              ${Number(mySales.cash_usd_total || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-[0.8rem] text-white/50 py-1 border-t border-white/10">
            <span>{t.cashKhrLabel}</span>
            <span className="text-white font-semibold">
              {Math.round(Number(mySales.cash_khr_total || 0)).toLocaleString()}{" "}
              ៛
            </span>
          </div>
          <div className="flex justify-between text-[0.8rem] text-white/50 py-1 border-t border-white/10">
            <span>{t.digitalBankLabel}</span>
            <span className="text-white font-semibold">
              ${Number(mySales.digital_total || 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <label className="flex items-center gap-2 mb-4 text-white/80 text-sm cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={currentShiftOnly}
          onChange={(e) => {
            setCurrentShiftOnly(e.target.checked);
            setPage(1);
          }}
          className="w-4 h-4 cursor-pointer"
        />
        {t.currentShiftOnly}
      </label>

      <OrdersFilter
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusChange={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}
        dateFrom={dateFrom}
        onDateFromChange={(v) => {
          setDateFrom(v);
          setPage(1);
        }}
        dateTo={dateTo}
        onDateToChange={(v) => {
          setDateTo(v);
          setPage(1);
        }}
        datesDisabled={currentShiftOnly}
        t={t}
      />

      <OrdersTable
        orders={orders}
        loading={loading}
        page={page}
        lastPage={lastPage}
        total={total}
        onView={(order) => {
          setSelectedOrder(order);
          setShowDetail(true);
        }}
        onEdit={openOrderForEdit}
        onPrint={printReceipt}
        onCancel={handleCancel}
        cancelLoadingId={cancelLoadingId}
        onPagePrev={() => setPage((p) => Math.max(1, p - 1))}
        onPageNext={() => setPage((p) => Math.min(lastPage, p + 1))}
        t={t}
      />

      {showDetail && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setShowDetail(false)}
          onPrint={printReceipt}
          t={t}
        />
      )}

      {pos.showPOS && (
        <POSModal
          products={products}
          categories={categories}
          paymentMethods={paymentMethods}
          promotions={promotions}
          initialTableId={initialTableId}
          {...pos}
          closePOS={closePOS}
        />
      )}
    </CashierLayout>
  );
}

export default CashierOrders;
