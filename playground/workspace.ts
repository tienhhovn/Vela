// The workspace playground page: a 4-cell VelaWorkspace on live Binance data with the
// page's demo scripting engine and the full shared chrome — topbar (symbol / timeframe /
// style / LAYOUT dropdowns, indicator picker, alerts, screenshot, object tree, settings),
// bottombar (range chips, clock, timezone), one keymap. Served straight from src/ (HMR).
//
// Vela ships no scripting engine — `demo-engine.ts` is the page's own, written against
// the public port (see widget.ts's header). For Pine Script:
// `npm i @luxalgo/vela-pinets pinets` and `engines: { pine: () => new PineWorkerEngine() }`.
import { VelaWorkspace } from "../src/workspace";
import { BinanceProvider } from "../src/data/providers/binance";
import { DemoEngine } from "./demo-engine";
import { playgroundStorage } from "./persistence";
import { DARK_THEME, createTheme } from "../src";

const customDarkTheme = createTheme({
  ...DARK_THEME,
  background: '#020920',
});

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

// 👇 BỔ SUNG ĐOẠN NÀY ĐỂ ÉP ĐĂNG KÝ TRỰC TIẾP VÀO HỆ THỐNG KHI WORKSPACE KHỞI TẠO
setTimeout(() => {
  const chartCell = ws.cell("btc");
  if (chartCell && chartCell.chart) {
    // Đăng ký trực tiếp chỉ báo vỏ bọc vào runtime của biểu đồ
    chartCell.chart.registerIndicator({
      id: "wynalgo-bigmoney-3.1",
      name: "WynAlgo_BigMoney™ [3.1]",
      description: "Chỉ báo dòng tiền thông minh và xác định xu hướng độc quyền của WynAlgo",
      inputs: [
        { id: "inputKey", name: "Activation Key", type: "string", defval: "", tooltip: "Nhập License Key để kích hoạt." },
        { id: "sens", name: "Sensitivity (Độ nhạy)", type: "integer", defval: 3, min: 1, max: 5 }
      ],
      run(context: any) {
        const key = context.inputs.inputKey;
        console.log("WynAlgo Proxy đang chạy, Key:", key);
        return [];
      }
    });

    // Tự động add luôn chỉ báo này lên biểu đồ
    chartCell.chart.addIndicator("wynalgo-bigmoney-3.1");
    console.log("Đã ép inject thành công WynAlgo_BigMoney lên biểu đồ!");
  }
}, 500);

  // ── The rest of the CHART options (every cell's DEFAULT), at their defaults ───────
  // bars: 500,                      // history depth per cell
  // data: myBars,                   // offline OHLCV[] for every cell — a `cells` entry can override
  // visibleRange: '3M',             // initial window per cell: '1D'…'5Y', 'YTD', 'ALL' or {from,to} ms
  // priceStyle: 'candles',          // default style of every cell — a `cells` entry can override
  // volume: true,                   // the built-in volume columns, per cell; false opts out
  // logScale: false,                // logarithmic price scale, per cell
  // currentPriceLine: true,         // dashed line + axis chip at the latest price, per cell
  // upColor: '#089981',             // bullish candles (default: the palette's bullish green)
  // downColor: '#f23645',           // bearish candles (default: the palette's bearish red)
  // glow: 0,                        // neon glow on line series, 0..~0.6 — WebGL2 cells only
  // animations: { zoom: true, pan: true, liveBar: false }, // eased zoom + inertial pan + forming-bar glide (true = 90 ms, or a duration in ms); false disables all
  // nativeBackend: 'auto',          // explicit 'canvas2d'/'webgl2' wins over the maxWebglCells policy
  // renderer: NativeRenderer,       // a custom IChartRenderer class for every cell
  // drawings: true,                 // per-cell tools config — its `toolbar` key is ignored: the grid's
  //                                 //  ONE shared bar replaces per-cell bars (see drawingToolbar)
  // (no `height` here: the grid sizes its cells)

  // ── The rest of the SHELL options, at their defaults ──────────────────────────────
  // timeframes: ['1', '5', '15', '30', '60', '240', 'D', 'W', 'M'], // topbar timeframe presets
  // timezone: 'Etc/UTC',            // display timezone (IANA), one zone for every cell
  // statusline: true,               // chrome: the per-cell status line
  // watermark: true,                // chrome: the per-cell symbol watermark
  // bottombar: true,                // chrome: the range-presets + timezone bar
  // topbar: {                       // COMPOSE the topbar: each side lists its VISIBLE
  //   left: ["symbol", "timeframes", "style", "layout", "indicators", "actions", "undo-redo"],
  //   right: ["actions", "alerts", "panels", "screenshot"],
  // },
  //                                 // These values ARE the defaults — an undeclared side keeps
  //                                 //  them, so the option is pure opt-in. Entries render in
  //                                 //  LIST ORDER; an id you omit disappears WITH its mobile
  //                                 //  entry and its keyboard chord (mod+alt+S goes with
  //                                 //  'screenshot', `/` with 'indicators' — Ctrl+Z/Y always
  //                                 //  stay). 'actions' is the slot where contributed actions
  //                                 //  flow; naming a contributed action's ID instead pins it
  //                                 //  at that exact spot (its align/order are then ignored).
  //                                 //  An explicit list is the side's COMPLETE contract: it
  //                                 //  also freezes it — chrome a future release adds won't
  //                                 //  appear for a curating host. A plugin can also take a
  //                                 //  slot over by registering an action under its id
  //                                 //  ('indicators' | 'screenshot') — see the plugin SDK.

  // ── The rest of the WORKSPACE options, at their defaults ──────────────────────────
  // sync: { viewport: true, crosshair: true }, // links between cells, per kind ('viewport' |
  //                                 //  'symbol' | 'timeframe' | 'crosshair'): true = all cells,
  //                                 //  or {cellId: group} so only same-group cells follow
  // drawingToolbar: true,           // the ONE shared drawing toolbar (acts on the active cell)
  // maxWebglCells: 8,               // above this many cells, every cell renders canvas2d
  //                                 //  (browser WebGL-context budget; glow unavailable there)


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

// Sample timeline marks (chart.marks) on every cell — the ones alive now and those a
// later layout switch mints. Each waits for its own chart to paint, then spreads the
// marks over that chart's visible range (see marks.ts).
const seedMarks = (chart: Vela): void => {
  void chart.ready().then(() => addSampleMarks(chart));
};
for (const cell of ws.cells()) seedMarks(cell.chart);
ws.on("cell:created", ({ id }) => {
  const cell = ws.cell(id);
  if (cell) seedMarks(cell.chart);
});

// Handy for poking around from the browser console (and for the automated probes).
(window as unknown as { __ws: VelaWorkspace }).__ws = ws;

// ── State surface demo (uncomment to try) ─────────────────────────────────────
// The workspace speaks the SAME state triplet and document format as the widget —
// multi-cell here. `persist` above writes exactly this document; the calls below
// are how a host composes custom flows (server snapshots, share links, templates).
//
// // READ — the WHOLE grid as one versioned document: layout, splitter tracks,
// // active cell, sync links, timezone, favorites, and per cell (live AND dormant)
// // the market, renderer config, user drawings, and indicator ledger.
// const snapshot = ws.getState();
// console.log('[state] workspace document:', snapshot);
//
// // EVENT — fires debounced (~500ms) after any persistable change in ANY cell
// // (pan-synced viewports excluded; drawings, markets, layout, prefs included).
// const offState = ws.on('state:changed', () => {
//     console.log('[state] changed → active cell:', ws.getState().activeCellId);
// });
//
// // WRITE — the whole grid rebuilds from the document (cells diff by IDENTITY — the
// // names declared above; a layout id must be registered — registerLayout — before
// // applying). Untrusted-safe: malformed fields are dropped by the shared codec.
// setTimeout(() => {
//     const doc = ws.getState();
//     doc.layout = '2h'; // switch the grid…
//     const btc = doc.charts.find((c) => c.id === 'btc');
//     if (btc) btc.symbol = 'DOGEUSDT'; // …retarget the btc cell…
//     doc.sync = { viewport: true }; // …and link every cell's viewport
//     ws.applyState(doc);
//     offState();
// }, 5000);
//
// // CROSS-SHELL — one format: a WIDGET document (layout '1', one `c1` cell)
// // applies here verbatim, and a workspace cell's state restores into a widget.
// // ws.applyState(widget.getState());
