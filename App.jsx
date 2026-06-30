import { useState, useRef, useCallback } from "react";
import { Eraser, Download, Plus, Minus, RotateCcw, Grid3x3 } from "lucide-react";

const KNIT_SYMBOLS = [
  { id: "k", label: "Knit (K)", glyph: "", uk: "Knit" },
  { id: "p", label: "Purl (P)", glyph: "•", uk: "Purl" },
  { id: "yo", label: "Yarn Over (YO)", glyph: "○", uk: "Yfwd" },
  { id: "k2tog", label: "K2tog", glyph: "╲", uk: "K2tog" },
  { id: "ssk", label: "SSK", glyph: "╱", uk: "Skpo" },
  { id: "sl", label: "Slip (Sl1)", glyph: "▾", uk: "Sl1" },
  { id: "cdd", label: "Centre Dbl Dec", glyph: "▲", uk: "Sl2-k1-psso" },
  { id: "c4f", label: "Cable 4 Front", glyph: "⤬", uk: "C4F" },
  { id: "c4b", label: "Cable 4 Back", glyph: "⤫", uk: "C4B" },
  { id: "bobble", label: "Bobble (MB)", glyph: "❖", uk: "MB" },
  { id: "nostitch", label: "No Stitch", glyph: "▢", uk: "No st" },
];

const CROCHET_SYMBOLS = [
  { id: "ch", label: "Chain (ch)", kind: "oval", uk: "ch" },
  { id: "slst", label: "Slip Stitch (sl st)", kind: "dot", uk: "sl st" },
  { id: "sc", label: "Single Crochet (sc)", kind: "cross", uk: "dc (UK)" },
  { id: "hdc", label: "Half Double (hdc)", kind: "stemT", uk: "htr (UK)" },
  { id: "dc", label: "Double Crochet (dc)", kind: "stem", bars: 1, uk: "tr (UK)" },
  { id: "tr", label: "Treble (tr)", kind: "stem", bars: 2, uk: "dtr (UK)" },
  { id: "dtr", label: "Dbl Treble (dtr)", kind: "stem", bars: 3, uk: "ttr (UK)" },
  { id: "dec", label: "Decrease (2tog)", kind: "dec", uk: "2tog" },
  { id: "inc", label: "Increase (2 in 1)", kind: "inc", uk: "2 in 1" },
  { id: "nostitch", label: "No Stitch", kind: "none", uk: "No st" },
];

// Draws a standard crochet symbol (Craft Yarn Council style) onto a canvas context,
// centered at (cx, cy) within a box of size s.
function drawCrochetSymbol(ctx, kind, bars, cx, cy, s, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.4, s * 0.045);
  ctx.lineCap = "round";
  const h = s * 0.42;
  switch (kind) {
    case "oval":
      ctx.beginPath();
      ctx.ellipse(cx, cy, s * 0.3, s * 0.2, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "dot":
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.11, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "cross":
      ctx.beginPath();
      ctx.moveTo(cx - h * 0.5, cy - h * 0.5);
      ctx.lineTo(cx + h * 0.5, cy + h * 0.5);
      ctx.moveTo(cx + h * 0.5, cy - h * 0.5);
      ctx.lineTo(cx - h * 0.5, cy + h * 0.5);
      ctx.stroke();
      break;
    case "stemT":
      ctx.beginPath();
      ctx.moveTo(cx, cy - h);
      ctx.lineTo(cx, cy + h);
      ctx.moveTo(cx - h * 0.4, cy - h);
      ctx.lineTo(cx + h * 0.4, cy - h);
      ctx.stroke();
      break;
    case "stem": {
      ctx.beginPath();
      ctx.moveTo(cx, cy - h);
      ctx.lineTo(cx, cy + h);
      ctx.stroke();
      const n = bars || 1;
      const spacing = (h * 1.2) / (n + 1);
      for (let i = 1; i <= n; i++) {
        const ty = cy - h * 0.55 + i * spacing;
        ctx.beginPath();
        ctx.moveTo(cx - h * 0.32, ty + h * 0.18);
        ctx.lineTo(cx + h * 0.32, ty - h * 0.18);
        ctx.stroke();
      }
      break;
    }
    case "dec":
      ctx.beginPath();
      ctx.moveTo(cx - h * 0.45, cy - h);
      ctx.lineTo(cx, cy + h * 0.5);
      ctx.moveTo(cx + h * 0.45, cy - h);
      ctx.lineTo(cx, cy + h * 0.5);
      ctx.stroke();
      break;
    case "inc":
      ctx.beginPath();
      ctx.moveTo(cx, cy - h * 0.5);
      ctx.lineTo(cx - h * 0.45, cy + h);
      ctx.moveTo(cx, cy - h * 0.5);
      ctx.lineTo(cx + h * 0.45, cy + h);
      ctx.stroke();
      break;
    default:
      break;
  }
  ctx.restore();
}

function CrochetSymbolSVG({ kind, bars, size = 22, color = "#3D2B1F" }) {
  const h = size * 0.42;
  const c = size / 2;
  const sw = Math.max(1.4, size * 0.07);
  if (kind === "oval")
    return (
      <svg width={size} height={size}>
        <ellipse cx={c} cy={c} rx={size * 0.3} ry={size * 0.2} fill="none" stroke={color} strokeWidth={sw} />
      </svg>
    );
  if (kind === "dot")
    return (
      <svg width={size} height={size}>
        <circle cx={c} cy={c} r={size * 0.11} fill={color} />
      </svg>
    );
  if (kind === "cross")
    return (
      <svg width={size} height={size}>
        <line x1={c - h * 0.5} y1={c - h * 0.5} x2={c + h * 0.5} y2={c + h * 0.5} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={c + h * 0.5} y1={c - h * 0.5} x2={c - h * 0.5} y2={c + h * 0.5} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    );
  if (kind === "stemT")
    return (
      <svg width={size} height={size}>
        <line x1={c} y1={c - h} x2={c} y2={c + h} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={c - h * 0.4} y1={c - h} x2={c + h * 0.4} y2={c - h} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    );
  if (kind === "stem") {
    const n = bars || 1;
    const spacing = (h * 1.2) / (n + 1);
    const ticks = [];
    for (let i = 1; i <= n; i++) {
      const ty = c - h * 0.55 + i * spacing;
      ticks.push(
        <line key={i} x1={c - h * 0.32} y1={ty + h * 0.18} x2={c + h * 0.32} y2={ty - h * 0.18} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      );
    }
    return (
      <svg width={size} height={size}>
        <line x1={c} y1={c - h} x2={c} y2={c + h} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        {ticks}
      </svg>
    );
  }
  if (kind === "dec")
    return (
      <svg width={size} height={size}>
        <line x1={c - h * 0.45} y1={c - h} x2={c} y2={c + h * 0.5} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={c + h * 0.45} y1={c - h} x2={c} y2={c + h * 0.5} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    );
  if (kind === "inc")
    return (
      <svg width={size} height={size}>
        <line x1={c} y1={c - h * 0.5} x2={c - h * 0.45} y2={c + h} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={c} y1={c - h * 0.5} x2={c + h * 0.45} y2={c + h} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    );
  return null;
}

function getCellSize(rows, cols) {
  const maxDim = Math.max(rows, cols);
  if (maxDim <= 16) return 34;
  if (maxDim <= 24) return 26;
  if (maxDim <= 32) return 20;
  return 16;
}

export default function ChartDesigner() {
  const [rows, setRows] = useState(16);
  const [cols, setCols] = useState(16);
  const [grid, setGrid] = useState(() =>
    Array.from({ length: 16 }, () => Array(16).fill(null))
  );
  const [craftMode, setCraftMode] = useState("knit");
  const SYMBOLS = craftMode === "knit" ? KNIT_SYMBOLS : CROCHET_SYMBOLS;
  const [active, setActive] = useState("k");
  const [chartName, setChartName] = useState("Pola Syal Saya");
  const [evenRightToLeft, setEvenRightToLeft] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [exportError, setExportError] = useState(null);
  const CELL = getCellSize(rows, cols);
  const canvasRef = useRef(null);
  const isPaintingRef = useRef(false);
  const paintModeRef = useRef("set");

  const switchMode = (mode) => {
    if (mode === craftMode) return;
    setCraftMode(mode);
    const list = mode === "knit" ? KNIT_SYMBOLS : CROCHET_SYMBOLS;
    setActive(list[0].id);
    setGrid(Array.from({ length: rows }, () => Array(cols).fill(null)));
  };

  const resizeGrid = (newRows, newCols) => {
    setGrid((prev) => {
      const next = Array.from({ length: newRows }, (_, r) =>
        Array.from({ length: newCols }, (_, c) =>
          prev[r] && prev[r][c] !== undefined ? prev[r][c] : null
        )
      );
      return next;
    });
    setRows(newRows);
    setCols(newCols);
  };

  const paintCell = useCallback(
    (r, c, mode) => {
      setGrid((prev) => {
        const next = prev.map((row) => row.slice());
        next[r][c] = mode === "erase" ? null : active;
        return next;
      });
    },
    [active]
  );

  const handleCellDown = (r, c, e) => {
    e.preventDefault();
    const isErase = e.button === 2 || e.shiftKey;
    paintModeRef.current = isErase ? "erase" : "set";
    isPaintingRef.current = true;
    paintCell(r, c, paintModeRef.current);
  };

  const handleCellEnter = (r, c) => {
    if (isPaintingRef.current) paintCell(r, c, paintModeRef.current);
  };

  const stopPaint = () => {
    isPaintingRef.current = false;
  };

  const clearGrid = () => {
    setGrid(Array.from({ length: rows }, () => Array(cols).fill(null)));
  };

  const usedSymbols = (() => {
    const set = new Set();
    grid.forEach((row) => row.forEach((c) => c && set.add(c)));
    return SYMBOLS.filter((s) => set.has(s.id));
  })();

  const exportPNG = () => {
    setExportError(null);
    try {
      const padding = 70;
      const legendRowH = 26;
      const legendH = padding + usedSymbols.length * legendRowH + 30;
      const width = cols * CELL + padding * 2;
      const height = rows * CELL + padding * 2 + legendH;
      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);

      ctx.fillStyle = "#FBF6EE";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#3D2B1F";
      ctx.font = "bold 22px Georgia, serif";
      ctx.fillText(chartName, padding, 36);

      const gx = padding;
      const gy = 56;

      ctx.font = `${CELL * 0.55}px Georgia, serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = gx + c * CELL;
          const y = gy + r * CELL;
          const sym = grid[r][c];
          ctx.fillStyle = sym === "nostitch" ? "#E5DDD0" : "#FFFFFF";
          ctx.fillRect(x, y, CELL, CELL);
          ctx.strokeStyle = "#C9BBA8";
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, CELL, CELL);
          if (sym) {
            const s = SYMBOLS.find((s) => s.id === sym);
            if (craftMode === "crochet") {
              drawCrochetSymbol(ctx, s.kind, s.bars, x + CELL / 2, y + CELL / 2, CELL, "#3D2B1F");
            } else {
              ctx.fillStyle = "#3D2B1F";
              ctx.fillText(s.glyph, x + CELL / 2, y + CELL / 2 + 1);
            }
          }
        }
      }
      ctx.strokeStyle = "#3D2B1F";
      ctx.lineWidth = 2;
      ctx.strokeRect(gx, gy, cols * CELL, rows * CELL);

      ctx.fillStyle = "#7A5C3E";
      ctx.font = "11px Georgia, serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      for (let r = 0; r < rows; r++) {
        const rowNum = rows - r;
        const isEven = rowNum % 2 === 0;
        const onLeft = evenRightToLeft ? isEven : !isEven;
        const y = gy + r * CELL + CELL / 2 + 4;
        if (onLeft) ctx.fillText(String(rowNum), gx - 18, y);
        else ctx.fillText(String(rowNum), gx + cols * CELL + 6, y);
      }
      ctx.textAlign = "center";
      for (let c = 0; c < cols; c++) {
        ctx.fillText(String(c + 1), gx + c * CELL + CELL / 2, gy + rows * CELL + 16);
      }

      let ly = gy + rows * CELL + 44;
      ctx.textAlign = "left";
      ctx.font = "bold 13px Georgia, serif";
      ctx.fillStyle = "#3D2B1F";
      ctx.fillText("Keterangan / Legend", gx, ly);
      ly += 18;
      ctx.font = "13px Georgia, serif";
      usedSymbols.forEach((s) => {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(gx, ly - 14, 20, 20);
        ctx.strokeStyle = "#C9BBA8";
        ctx.strokeRect(gx, ly - 14, 20, 20);
        ctx.fillStyle = "#3D2B1F";
        if (craftMode === "crochet") {
          drawCrochetSymbol(ctx, s.kind, s.bars, gx + 10, ly - 4, 20, "#3D2B1F");
        } else {
          ctx.font = "14px Georgia, serif";
          ctx.textAlign = "center";
          ctx.fillText(s.glyph, gx + 10, ly + 1);
        }
        ctx.textAlign = "left";
        ctx.font = "13px Georgia, serif";
        ctx.fillText(`${s.label}  (UK: ${s.uk})`, gx + 28, ly + 1);
        ly += legendRowH;
      });

      const dataUrl = canvas.toDataURL("image/png");
      setPreviewUrl(dataUrl);

      const link = document.createElement("a");
      link.download = `${chartName.replace(/\s+/g, "_") || "chart"}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setExportError(err.message || "Gagal generate gambar");
    }
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: "#FBF6EE", fontFamily: "Georgia, 'Times New Roman', serif" }}
      onMouseUp={stopPaint}
      onMouseLeave={stopPaint}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-baseline justify-between flex-wrap gap-3 mb-6 border-b-2 pb-4" style={{ borderColor: "#C9BBA8" }}>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#3D2B1F" }}>
              Chart Designer
            </h1>
            <p className="text-sm mt-1" style={{ color: "#7A5C3E" }}>
              Bikin stitch chart knitting & crochet, lalu export jadi gambar
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: "#C9BBA8" }}>
              <button
                onClick={() => switchMode("knit")}
                className="px-3 py-2 text-sm"
                style={{
                  background: craftMode === "knit" ? "#A6512C" : "#FFFFFF",
                  color: craftMode === "knit" ? "#FFFFFF" : "#3D2B1F",
                }}
              >
                Knitting
              </button>
              <button
                onClick={() => switchMode("crochet")}
                className="px-3 py-2 text-sm"
                style={{
                  background: craftMode === "crochet" ? "#A6512C" : "#FFFFFF",
                  color: craftMode === "crochet" ? "#FFFFFF" : "#3D2B1F",
                }}
              >
                Crochet
              </button>
            </div>
            <input
              value={chartName}
              onChange={(e) => setChartName(e.target.value)}
              className="px-3 py-2 rounded border text-sm w-56"
              style={{ borderColor: "#C9BBA8", background: "#FFFFFF", color: "#3D2B1F" }}
              placeholder="Nama pola"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-5 items-center">
          {SYMBOLS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              title={`${s.label} (UK: ${s.uk})`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition"
              style={{
                borderColor: active === s.id ? "#A6512C" : "#C9BBA8",
                background: active === s.id ? "#F0DCC9" : "#FFFFFF",
                color: "#3D2B1F",
                boxShadow: active === s.id ? "0 0 0 2px #A6512C33" : "none",
              }}
            >
              <span className="w-5 flex items-center justify-center text-base">
                {craftMode === "crochet" ? (
                  <CrochetSymbolSVG kind={s.kind} bars={s.bars} size={20} color="#3D2B1F" />
                ) : (
                  s.glyph
                )}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-3 text-sm" style={{ color: "#3D2B1F" }}>
          <div className="flex items-center gap-2">
            <Grid3x3 size={16} />
            <span>Baris</span>
            <button onClick={() => rows > 2 && resizeGrid(rows - 1, cols)} className="p-1 rounded border" style={{ borderColor: "#C9BBA8" }}><Minus size={14} /></button>
            <span className="w-7 text-center">{rows}</span>
            <button onClick={() => resizeGrid(rows + 1, cols)} className="p-1 rounded border" style={{ borderColor: "#C9BBA8" }}><Plus size={14} /></button>
          </div>
          <div className="flex items-center gap-2">
            <span>Kolom</span>
            <button onClick={() => cols > 2 && resizeGrid(rows, cols - 1)} className="p-1 rounded border" style={{ borderColor: "#C9BBA8" }}><Minus size={14} /></button>
            <span className="w-7 text-center">{cols}</span>
            <button onClick={() => resizeGrid(rows, cols + 1)} className="p-1 rounded border" style={{ borderColor: "#C9BBA8" }}><Plus size={14} /></button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ color: "#7A5C3E" }}>Ukuran cepat:</span>
            {[
              [10, 10],
              [16, 16],
              [20, 20],
              [30, 30],
              [40, 40],
            ].map(([r, c]) => (
              <button
                key={`${r}x${c}`}
                onClick={() => resizeGrid(r, c)}
                className="px-2.5 py-1 rounded border text-xs"
                style={{
                  borderColor: rows === r && cols === c ? "#A6512C" : "#C9BBA8",
                  background: rows === r && cols === c ? "#F0DCC9" : "#FFFFFF",
                }}
              >
                {r}×{c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-5 text-sm" style={{ color: "#3D2B1F" }}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={evenRightToLeft} onChange={(e) => setEvenRightToLeft(e.target.checked)} />
            Baris genap dibaca kanan→kiri
          </label>
          <button onClick={clearGrid} className="flex items-center gap-1 px-3 py-1.5 rounded border ml-auto" style={{ borderColor: "#C9BBA8" }}>
            <RotateCcw size={14} /> Bersihkan
          </button>
          <button onClick={exportPNG} className="flex items-center gap-1 px-3 py-1.5 rounded text-white" style={{ background: "#A6512C" }}>
            <Download size={14} /> Export PNG
          </button>
        </div>

        <p className="text-xs mb-3" style={{ color: "#7A5C3E" }}>
          Klik & drag untuk gambar, klik kanan (atau tahan Shift) untuk hapus.
        </p>

        <div className="overflow-x-auto border-2 rounded-lg p-4 inline-block" style={{ borderColor: "#C9BBA8", background: "#FFFFFF" }} ref={canvasRef}>
          <div className="inline-block select-none">
            {grid.map((row, r) => {
              const rowNum = rows - r;
              const isEven = rowNum % 2 === 0;
              const onLeft = evenRightToLeft ? isEven : !isEven;
              return (
                <div key={r} className="flex items-center">
                  {onLeft && (
                    <span className="text-xs w-6 text-right pr-1" style={{ color: "#7A5C3E" }}>{rowNum}</span>
                  )}
                  {!onLeft && <span className="w-6" />}
                  {row.map((cell, c) => {
                    const sym = cell ? SYMBOLS.find((s) => s.id === cell) : null;
                    return (
                      <div
                        key={c}
                        onMouseDown={(e) => handleCellDown(r, c, e)}
                        onMouseEnter={() => handleCellEnter(r, c)}
                        className="flex items-center justify-center text-sm cursor-pointer"
                        style={{
                          width: CELL,
                          height: CELL,
                          border: "1px solid #C9BBA8",
                          background: cell === "nostitch" ? "#E5DDD0" : "#FFFFFF",
                          color: "#3D2B1F",
                        }}
                      >
                        {sym ? (
                          craftMode === "crochet" ? (
                            <CrochetSymbolSVG kind={sym.kind} bars={sym.bars} size={CELL * 0.7} color="#3D2B1F" />
                          ) : (
                            sym.glyph
                          )
                        ) : (
                          ""
                        )}
                      </div>
                    );
                  })}
                  {onLeft && <span className="w-6" />}
                  {!onLeft && (
                    <span className="text-xs w-6 pl-1" style={{ color: "#7A5C3E" }}>{rowNum}</span>
                  )}
                </div>
              );
            })}
            <div className="flex">
              <span className="w-6" />
              {Array.from({ length: cols }).map((_, c) => (
                <div key={c} className="text-xs text-center" style={{ width: CELL, color: "#7A5C3E" }}>
                  {c + 1}
                </div>
              ))}
              <span className="w-6" />
            </div>
          </div>
        </div>

        {usedSymbols.length > 0 && (
          <div className="mt-6 p-4 rounded-lg border" style={{ borderColor: "#C9BBA8", background: "#FFFFFF" }}>
            <h2 className="text-sm font-bold mb-3" style={{ color: "#3D2B1F" }}>Keterangan / Legend</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {usedSymbols.map((s) => (
                <div key={s.id} className="flex items-center gap-2 text-sm" style={{ color: "#3D2B1F" }}>
                  <span className="w-7 h-7 flex items-center justify-center border rounded" style={{ borderColor: "#C9BBA8" }}>
                    {craftMode === "crochet" ? (
                      <CrochetSymbolSVG kind={s.kind} bars={s.bars} size={20} color="#3D2B1F" />
                    ) : (
                      s.glyph
                    )}
                  </span>
                  <span>{s.label} <span style={{ color: "#7A5C3E" }}>(UK: {s.uk})</span></span>
                </div>
              ))}
            </div>
          </div>
        )}
        {exportError && (
          <div className="mt-4 p-3 rounded-lg border text-sm" style={{ borderColor: "#C0392B", background: "#FBEAEA", color: "#922B21" }}>
            Export gagal: {exportError}
          </div>
        )}

        {previewUrl && (
          <div className="mt-6 p-4 rounded-lg border" style={{ borderColor: "#C9BBA8", background: "#FFFFFF" }}>
            <h2 className="text-sm font-bold mb-2" style={{ color: "#3D2B1F" }}>Preview hasil export</h2>
            <p className="text-xs mb-3" style={{ color: "#7A5C3E" }}>
              Kalau download otomatis tidak jalan, klik kanan gambar di bawah lalu pilih "Save image as…" / "Simpan gambar sebagai…"
            </p>
            <img src={previewUrl} alt="Chart export preview" className="max-w-full border rounded" style={{ borderColor: "#C9BBA8" }} />
          </div>
        )}
      </div>
    </div>
  );
}
