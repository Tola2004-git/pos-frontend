import { Edit2 } from "iconsax-react";
import { alertConfirmWarning } from "../../../utils/alert.jsx";

export function TableSelectionPanel({
  t,
  currentSessionTable,
  showTablePicker,
  setShowTablePicker,
  canChangeTable,
  getTableLabel,
  tableSelection,
  availableTables,
  blockedTables,
  isEditMode,
  isChangingTable,
  handleChangeTable,
  tableActionMessage,
}) {
  return (
    <div className="mb-4 rounded-[14px] border border-white/10 bg-white/5 p-3">
      {currentSessionTable && !showTablePicker ? (
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-[0.72rem] uppercase tracking-[0.2em] text-white/45">
              {t.tableLabel}
            </span>
            <span className="truncate rounded-[10px] border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-medium text-white">
              {getTableLabel(currentSessionTable)}
            </span>
          </div>
          {canChangeTable && (
            <button
              type="button"
              onClick={() => setShowTablePicker(true)}
              title={t.switchTable}
              aria-label={t.switchTable}
              className="flex-shrink-0 rounded-full border border-white/10 bg-white/10 p-2 text-white transition-all hover:bg-white/20"
            >
              <Edit2 size={16} color="white" variant="Outline" />
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="mb-2 flex items-center justify-between">
            <h5 className="text-white font-medium">{t.selectTable}</h5>
            {currentSessionTable ? (
              <button
                type="button"
                onClick={() => setShowTablePicker(false)}
                className="text-[0.8rem] text-white/60 transition-all hover:text-white"
              >
                {t.cancel}
              </button>
            ) : (
              <span className="text-[0.8rem] text-white/60">
                {tableSelection.selectedTableId ? t.selected : t.required}
              </span>
            )}
          </div>

          {tableSelection.tableLoading ? (
            <div className="text-sm text-white/60">{t.loadingTables}</div>
          ) : currentSessionTable ? (
            // Switching an already-seated order: a compact dropdown beats a
            // full grid + separate confirm button for this quick action.
            <div className="space-y-2">
              <select
                value={tableSelection.selectedTableId ?? currentSessionTable.id}
                disabled={isChangingTable}
                onChange={(e) => {
                  const nextTableId = Number(e.target.value);
                  if (nextTableId === currentSessionTable.id) return;
                  handleChangeTable(nextTableId);
                }}
                className="w-full rounded-[10px] border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-white transition-all focus:border-white/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value={currentSessionTable.id} className="bg-[#1a1a2e]">
                  {getTableLabel(currentSessionTable)} {t.currentSuffix}
                </option>
                {availableTables.map((table) => (
                  <option key={table.id} value={table.id} className="bg-[#1a1a2e]">
                    {getTableLabel(table)}
                  </option>
                ))}
              </select>
              {isChangingTable && (
                <div className="text-sm text-white/60">{t.switchingTable}</div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableTables.length > 0 ? (
                  availableTables.map((table) => {
                    const isSelected = tableSelection.selectedTableId === table.id;

                    return (
                      <button
                        key={table.id}
                        type="button"
                        onClick={() => tableSelection.setSelectedTableId(table.id)}
                        className={`rounded-[10px] border px-3 py-2 text-sm font-medium transition-all ${
                          isSelected
                            ? "border-white bg-white text-[#1a1a2e]"
                            : "border-white/10 bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        {getTableLabel(table)}
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-full text-sm text-white/60">
                    {t.noAvailableTables}
                  </div>
                )}
              </div>

              {!isEditMode && (
                <div className="rounded-[10px] border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                  {t.onlyAvailableTablesNote}
                </div>
              )}

              {blockedTables.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[0.72rem] uppercase tracking-[0.2em] text-white/45">
                    {t.inUseTables}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {blockedTables.map((table) => {
                      const statusLabel =
                        table.status === "reserved" ? t.reservedStatus : t.occupiedStatus;

                      if (isEditMode) {
                        return (
                          <button
                            key={table.id}
                            type="button"
                            disabled
                            className="cursor-not-allowed rounded-[10px] border border-white/10 bg-white/5 px-3 py-2 text-left text-sm font-medium text-white/60"
                          >
                            <div>{getTableLabel(table)}</div>
                            <div className="text-[0.7rem] uppercase tracking-[0.2em] text-white/45">
                              {statusLabel}
                            </div>
                          </button>
                        );
                      }

                      const isSelected = tableSelection.selectedTableId === table.id;

                      const handleOccupiedTableClick = async () => {
                        const result = await alertConfirmWarning(
                          t.tableOccupiedConfirmTitle,
                          t.tableOccupiedConfirmMsg,
                          t.yesAddOrder,
                          t.cancel,
                        );
                        if (!result.isConfirmed) return;
                        tableSelection.setSelectedTableId(table.id, true);
                      };

                      return (
                        <button
                          key={table.id}
                          type="button"
                          onClick={handleOccupiedTableClick}
                          className={`rounded-[10px] border px-3 py-2 text-left text-sm font-medium transition-all ${
                            isSelected
                              ? "border-white bg-white text-[#1a1a2e]"
                              : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                          }`}
                        >
                          <div>{getTableLabel(table)}</div>
                          <div
                            className={`text-[0.7rem] uppercase tracking-[0.2em] ${
                              isSelected ? "text-[#1a1a2e]/60" : "text-white/45"
                            }`}
                          >
                            {statusLabel}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {tableActionMessage && (
            <div className="mt-2 rounded-[10px] border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {tableActionMessage}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TableSelectionPanel;
