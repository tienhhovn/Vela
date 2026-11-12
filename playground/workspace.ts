// The workspace playground page: a 4-cell VelaWorkspace on live Binance data with the
// page's demo scripting engine and the full shared chrome — topbar (symbol / timeframe /
// style / LAYOUT dropdowns, indicator picker, alerts, screenshot, object tree, settings),
// bottombar (range chips, clock, timezone), one keymap. Served straight from src/ (HMR).
import { VelaWorkspace } from "../src/workspace";
import { BinanceProvider } from "../src/data/providers/binance";
import { DemoEngine } from "./demo-engine";
import { playgroundStorage } from "./persistence";
import { DARK_THEME, createTheme, registerNativeIndicator } from "../src";
import type { NativeIndicatorDescriptor, NativeIndicatorContext, InputValue } from "../src";

const customDarkTheme = createTheme({
  ...DARK_THEME,
  background: '#020920',
});

// 👇 TIÊM CSS TÙY CHỈNH ĐỂ LÀM NỔI BẬT KHUNG VIỀN Ô NHẬP LIỆU TRÊN BẢNG SETTINGS
const customInputStyles = document.createElement('style');
customInputStyles.innerHTML = `
  /* Tạo khung viền sáng màu, tinh tế cho các ô nhập text/string trong bảng Settings */
  input[type="text"], 
  input:not([type]), 
  textarea {
    border: 1px solid rgba(255, 255, 255, 0.25) !important;
    border-radius: 6px !important;
    background: rgba(255, 255, 255, 0.05) !important;
    color: #ffffff !important;
    padding: 6px 10px !important;
    outline: none !important;
    transition: border-color 0.2s ease;
  }
  /* Hiệu ứng sáng lên khi người dùng click vào ô nhập key */
  input[type="text"]:focus, 
  input:not([type]):focus {
    border-color: #ff9800 !important;
    background: rgba(255, 152, 0, 0.05) !important;
  }
`;
document.head.appendChild(customInputStyles);

// 1. ĐỊNH NGHĨA CHUẨN NATIVE INDICATOR DESCRIPTOR CHO WYNMANGO BIGMONEY
const wynAlgoBigMoneyNative: NativeIndicatorDescriptor = {
    type: "wynalgo-bigmoney-3.1",
    title: "WynAlgo_BigMoney™ [3.1]",
    paneHint: "price",
    overlay: true,
    multiInstance: false,

    inputsSchema: () => [
        {
            key: "inputKey",
            title: "Activation Key",
            type: "string",
            defval: "",
        },
        {
            key: "sens",
            title: "Sensitivity (Độ nhạy)",
            type: "int",
            defval: 3,
            min: 1,
            max: 5,
            step: 1,
        },
        {
            key: "showbbsqueeze",
            title: "Show Squeezing of BB",
            type: "bool",
            defval: true,
        },
    ],

    defaultInputs: () => ({
        inputKey: "",
        sens: 3,
        showbbsqueeze: true,
    }),

    create: () => {
        let context: NativeIndicatorContext | null = null;
        let inputs: Record<string, InputValue> = {};

        const recompute = () => {
            if (!context) return;

            const bars = context.bars();
            if (bars.length === 0) return;

            const key = String(inputs.inputKey ?? "");
            const sens = Number(inputs.sens ?? 3);

            const points = bars.map((bar) => ({
                time: bar.time,
                value: key.trim()
                    ? bar.close * (1 + sens * 0.002)
                    : null,
            }));

            context.emit({
                series: [
                    {
                        id: "wynalgo-main-line",
                        title: "BigMoney Signal",
                        paneId: "",
                        kind: "line",
                        points,
                        style: {
                            color: "#ff9800",
                            width: 2,
                            lineStyle: "solid",
                        },
                    },
                ],
            });

            context.setStatus("idle");
        };

        return {
            start(nextContext, nextInputs) {
                context = nextContext;
                inputs = nextInputs;
                recompute();
            },

            onBars() {
                recompute();
            },

            onViewport() {},

            setInputs(nextInputs) {
                inputs = nextInputs;
                recompute();
            },

            suspend() {},

            resume() {
                recompute();
            },

            stop() {
                context = null;
            },
        };
    },
};

// 2. ĐĂNG KÝ VÀO HỆ THỐNG TRƯỚC KHI KHỞI TẠO WORKSPACE
registerNativeIndicator(wynAlgoBigMoneyNative);

const ws = new VelaWorkspace("#workspace", {
  layout: "1", // Tạm thời để 1 ô biểu đồ cho gọn gàng dễ kiểm tra
  symbol: "BTCUSDT",
  timeframe: "60",
  cells: {
    btc: { 
      symbol: "BTCUSDT", 
      timeframe: "60"
    },
  },
  providers: { binance: () => new BinanceProvider() },
  engines: { demo: () => new DemoEngine() },
  defaultLanguage: "demo",
  live: true,
  theme: customDarkTheme,
  autofocus: true,
  persist: false, // Tắt tạm thời tính năng persist để ép nhận diện cấu hình mới
  storage: playgroundStorage(),
  settings: { hidden: ["advanced"] },
});

// 3. TỰ ĐỘNG THÊM INDICATOR VÀO CELL BDC KHI SẴN SÀNG
const btcCell = ws.cell("btc");
if (btcCell) {
  void btcCell.chart.ready().then(() => {
    btcCell.chart.addNativeIndicator("wynalgo-bigmoney-3.1");
  });
}

// The page shell follows the app theme — flip it from any cell's chart settings →
// Canvas → Theme (or `__ws.setTheme('light')` in the console); every LIVE cell relays
// the change, and cells minted by later layout switches are wired as they appear.
const syncShellTheme = (t: { background: string }): void => {
  document.body.style.background = t.background;
};
for (const cell of ws.cells()) cell.chart.on("theme:changed", syncShellTheme);
ws.on("cell:created", ({ id }) =>
  ws.cell(id)?.chart.on("theme:changed", syncShellTheme),
);

// Handy for poking around from the browser console (and for the automated probes).
(window as unknown as { __ws: VelaWorkspace }).__ws = ws;