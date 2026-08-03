import { PURE_WHITE_BG } from "../utils/styles";

const PRESET_NAME_KEYS = {
  "Food Dark": "bgPresetFoodDark",
  "Coffee Shop": "bgPresetCoffeeShop",
  Restaurant: "bgPresetRestaurant",
  "Dark Minimal": "bgPresetDarkMinimal",
  Burger: "bgPresetBurger",
  "Pure White": "bgPresetPureWhite",
  "Pure Black": "bgPresetPureBlack",
};

function PresetGrid({ bgPresets, selected, onSelect, t }) {
  return (
    <div>
      <p className="text-white/60 text-[0.85rem] mb-2">
        {t.bgChangerPresetLabel}
      </p>
      <div className="grid grid-cols-3 gap-[10px] mb-[20px]">
        {bgPresets.map((bg) => {
          const name = t[PRESET_NAME_KEYS[bg.name]] || bg.name;
          return (
            <div
              key={bg.url}
              onClick={() => onSelect(bg.url)}
              className={`
            rounded-[12px] overflow-hidden cursor-pointer relative h-[80px] transition-all duration-200 border-[3px]
            ${selected === bg.url ? "border-white" : "border-transparent"}
            `}
            >
              <img
                src={bg.url}
                alt={name}
                className="w-full h-full object-cover"
              />
              <div
                className={`absolute bottom-0 left-0 right-0 text-[0.7rem] p-1 text-center ${
                  bg.url === PURE_WHITE_BG
                    ? "bg-white/70 text-[#1a1a2e]"
                    : "theme-dark-surface bg-black/50 text-white"
                }`}
              >
                {name}
              </div>
              {selected === bg.url && (
                <div
                  className="absolute top-[6px] right-[6px] bg-[#fff] text-[#1a1a2e] rounded-full w-5 h-5 flex items-center justify-center text-[0.7rem] font-bold"
                  style={{
                    border: "1px solid rgba(26,26,46,0.15)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
                  }}
                >
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PresetGrid;
