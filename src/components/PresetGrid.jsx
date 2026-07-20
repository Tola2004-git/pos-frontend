const PRESET_NAME_KEYS = {
  "Food Dark": "bgPresetFoodDark",
  "Coffee Shop": "bgPresetCoffeeShop",
  Restaurant: "bgPresetRestaurant",
  "Dark Minimal": "bgPresetDarkMinimal",
  Burger: "bgPresetBurger",
};

function PresetGrid({ bgPresets, selected, onSelect, t }) {
  return (
    <div>
      <p className="text-[rgba(255,255,255,0.6)] text-[0.85rem] mb-2">
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
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[0.7rem] p-1 text-center">
                {name}
              </div>
              {selected === bg.url && (
                <div className="absolute top-[6px] right-[6px] bg-[#fff] rounded-full w-5 h-5 flex items-center justify-center text-[0.7rem] font-bold">
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
