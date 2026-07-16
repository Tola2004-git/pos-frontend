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
  const [mySales, setMySales] = useState(null);

  useEffect(() => {
    let active = true;
    fetchSalesByCashierApi({ dateFrom, dateTo, currentShiftOnly })
      .then((res) => {
        if (active) {
          setMySales(
            res.data[0] || {
              orders_count: 0,
              total_sales: 0,
              cash_usd_total: 0,
              cash_khr_total: 0,
              digital_total: 0,
            }
          );
        }
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
      <ToastNotification toasts={toasts} onClose={removeToast} onPrint={printReceipt} />

      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-white font-bold text-2xl m-0 flex items-center gap-3">
          <ReceiptText size={32} color="white" variant="Linear" />
          My Sales
        </h2>
      </div>

      {mySales && (
        <div style={glassCard} className="rounded-[20px] p-5 mb-5">
          <h3 className="text-white font-bold text-base m-0 mb-4 flex items-center gap-2">
            <Chart2 size={20} color="#fff" variant="Bold" />
            My Sales Total
          </h3>
          <div className="flex gap-3 flex-wrap items-stretch">
            <div
              className="rounded-[14px] px-4 py-3 inline-flex flex-col"
              style={{
                minWidth: "180px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="text-white font-bold text-2xl">
                ${Number(mySales.total_sales || 0).toFixed(2)}
              </div>
              <div className="text-white/50 text-[0.8rem] mt-1">
                {mySales.orders_count || 0} order{mySales.orders_count === 1 ? "" : "s"}
              </div>
            </div>

            <div
              className="rounded-[14px] px-4 py-3 flex flex-col justify-center gap-1.5"
              style={{
                minWidth: "220px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="flex justify-between gap-4 text-[0.78rem]">
                <span className="text-white/50">Cash (USD)</span>
                <span className="text-white font-semibold">
                  ${Number(mySales.cash_usd_total || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between gap-4 text-[0.78rem]">
                <span className="text-white/50">Cash (KHR)</span>
                <span className="text-white font-semibold">
                  {Math.round(Number(mySales.cash_khr_total || 0)).toLocaleString()} ៛
                </span>
              </div>
              <div className="flex justify-between gap-4 text-[0.78rem]">
                <span className="text-white/50">Digital / Bank</span>
                <span className="text-white font-semibold">
                  ${Number(mySales.digital_total || 0).toFixed(2)}
                </span>
              </div>
            </div>
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
        Current Shift Only
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
      />

      {showDetail && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setShowDetail(false)}
          onPrint={printReceipt}
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
