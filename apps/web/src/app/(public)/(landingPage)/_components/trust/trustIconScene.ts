import type { TrustIconName } from "./trustIconName";

const NS = "http://www.w3.org/2000/svg";
const SW = 1.25;
const MONO_FONT = "var(--font-jetbrains-mono), ui-monospace, monospace";

const C = {
  slate: "var(--marketing-slate)",
  hairSoft: "var(--marketing-hair-soft)",
  blue: "var(--marketing-blue-600)",
  blueFaint: "var(--marketing-blue-300)",
  blueSoft: "var(--marketing-blue-200)",
} as const;

const STAR_PATH =
  "M138 7 L140.47 12.6 L146.56 13.22 L141.99 17.3 L143.29 23.28 L138 20.2 L132.71 23.28 L134.01 17.3 L129.44 13.22 L135.53 12.6 Z";

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
const progress = (start: number, end: number, time: number) =>
  clamp((time - start) / (end - start));
const easeOut = (value: number) => 1 - (1 - clamp(value)) ** 3;
const easeInOut = (value: number) => {
  const amount = clamp(value);
  return amount < 0.5 ? 4 * amount ** 3 : 1 - (-2 * amount + 2) ** 3 / 2;
};

type SvgAttributes = Record<string, string | number>;

type TrustIconScene = {
  render: (time: number) => void;
};

function createEl<K extends keyof SVGElementTagNameMap>(
  parent: Element,
  tag: K,
  attributes: SvgAttributes = {},
): SVGElementTagNameMap[K] {
  const element = document.createElementNS(NS, tag);
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, String(value));
  }
  parent.appendChild(element);
  return element as SVGElementTagNameMap[K];
}

function line(
  parent: Element,
  d: string,
  color: string = C.slate,
  extra: SvgAttributes = {},
) {
  return createEl(parent, "path", {
    d,
    fill: "none",
    stroke: color,
    "stroke-width": SW,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    pathLength: 1,
    ...extra,
  });
}

function circle(
  parent: Element,
  attributes: SvgAttributes,
  color: string = C.slate,
) {
  return createEl(parent, "circle", {
    fill: "none",
    stroke: color,
    "stroke-width": SW,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    pathLength: 1,
    ...attributes,
  });
}

function label(
  parent: Element,
  x: number,
  y: number,
  value: string,
  attributes: SvgAttributes = {},
) {
  const element = createEl(parent, "text", {
    x,
    y,
    "font-family": MONO_FONT,
    "font-size": 7.5,
    "letter-spacing": ".6",
    fill: C.slate,
    "text-anchor": "middle",
    ...attributes,
  });
  element.textContent = value;
  return element;
}

function draw(element: SVGGeometryElement, amount: number) {
  element.style.strokeDasharray = "1";
  element.style.strokeDashoffset = String(1 - clamp(amount));
  element.style.opacity = amount <= 0 ? "0" : "1";
}

function buildOpenSource(svg: SVGSVGElement): TrustIconScene {
  const left = line(svg, "M58 22 L38 40 L58 58");
  const right = line(svg, "M102 22 L122 40 L102 58");
  const slash = line(svg, "M88 16 L72 64");
  const star = createEl(svg, "path", {
    d: STAR_PATH,
    stroke: C.blue,
    "stroke-width": SW,
    fill: C.blue,
    "fill-opacity": 0,
    pathLength: 1,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  });
  const halo = createEl(svg, "circle", {
    cx: 138,
    cy: 16,
    r: 10,
    stroke: C.blueFaint,
    "stroke-width": SW,
    fill: "none",
    opacity: 0,
  });

  return {
    render(time) {
      draw(left, easeInOut(progress(0, 0.6, time)));
      draw(right, easeInOut(progress(0.1, 0.7, time)));
      draw(slash, easeInOut(progress(0.3, 0.8, time)));
      draw(star, easeInOut(progress(0.75, 1.15, time)));
      star.setAttribute(
        "fill-opacity",
        String(easeInOut(progress(1.15, 1.4, time))),
      );

      const pulse = time > 1.4 ? ((time - 1.4) % 6) / 6 : -1;
      const pulseAmount = pulse >= 0 ? progress(0, 0.4, pulse) : 0;
      halo.setAttribute("r", String(9 + 9 * easeOut(pulseAmount)));
      halo.setAttribute(
        "opacity",
        pulse >= 0 && pulseAmount < 1 ? String(0.8 * (1 - pulseAmount)) : "0",
      );
      star.setAttribute(
        "transform",
        `rotate(${pulse >= 0 ? 72 * easeInOut(progress(0, 0.35, pulse)) : 0} 138 16)`,
      );
      slash.setAttribute(
        "stroke",
        pulse >= 0 && pulse < 0.5 ? C.blue : C.slate,
      );
    },
  };
}

function buildSelfHost(svg: SVGSVGElement): TrustIconScene {
  const server = line(svg, "M20 14 H64 V66 H20 Z");
  const dividerOne = line(svg, "M20 31 H64");
  const dividerTwo = line(svg, "M20 48 H64");
  const bays = [22.5, 39.5, 56.5].map((y) =>
    line(svg, `M28 ${y} H42`, C.hairSoft),
  );
  const lights = [22.5, 39.5, 56.5].map((y) =>
    createEl(svg, "circle", {
      cx: 56,
      cy: y,
      r: 2.2,
      fill: C.blue,
      opacity: 0,
    }),
  );
  const cloud = line(
    svg,
    "M110 54 H140 C147 54 151 48 149 42 C147 37 142 35 138 36 C136 29 129 25 122 27 C116 29 113 34 113 38 C107 38 103 42 104 47 C105 51 107 54 110 54 Z",
  );
  const connector = createEl(svg, "path", {
    d: "M70 40 H100",
    stroke: C.slate,
    "stroke-width": SW,
    "stroke-dasharray": "1.5 4.5",
    fill: "none",
  });
  const dot = createEl(svg, "circle", {
    r: 3,
    fill: C.blue,
    opacity: 0,
  });
  const serverLabel = label(svg, 42, 79, "YOUR SERVER");
  const cloudLabel = label(svg, 127, 70, "OUR CLOUD");

  return {
    render(time) {
      draw(server, easeInOut(progress(0, 0.6, time)));
      draw(dividerOne, easeInOut(progress(0.3, 0.6, time)));
      draw(dividerTwo, easeInOut(progress(0.35, 0.65, time)));
      bays.forEach((bay, index) =>
        draw(
          bay,
          easeInOut(progress(0.45 + index * 0.06, 0.7 + index * 0.06, time)),
        ),
      );
      draw(cloud, easeInOut(progress(0.35, 1, time)));

      const connectionOn = progress(0.9, 1.2, time);
      connector.setAttribute("opacity", String(connectionOn));
      serverLabel.setAttribute("opacity", String(connectionOn));
      cloudLabel.setAttribute("opacity", String(connectionOn));

      lights.forEach((light, index) => {
        light.setAttribute(
          "opacity",
          time < 0.7
            ? "0"
            : String(
                0.35 +
                  0.65 *
                    (Math.floor(time * 2.6 + index * 1.7) % 3 === 0 ? 1 : 0),
              ),
        );
      });
      connector.setAttribute("stroke-dashoffset", String(-time * 10));

      const cycle = time < 1.2 ? 0 : ((time - 1.2) % 6) / 6;
      const side = cycle < 0.5 ? 0 : 1;
      const sideProgress = (cycle % 0.5) / 0.5;
      const travel = easeInOut(progress(0, 0.3, sideProgress));
      const x = side === 0 ? 100 - 30 * travel : 70 + 30 * travel;
      dot.setAttribute("cx", String(x));
      dot.setAttribute("cy", "40");
      dot.setAttribute("opacity", time < 1.2 ? "0" : "1");

      const serverOn = time >= 1.2 && side === 0 && sideProgress > 0.25;
      const cloudOn = time >= 1.2 && side === 1 && sideProgress > 0.25;
      server.setAttribute("stroke", serverOn ? C.blue : C.slate);
      cloud.setAttribute("stroke", cloudOn ? C.blue : C.slate);
      serverLabel.setAttribute("fill", serverOn ? C.blue : C.slate);
      cloudLabel.setAttribute("fill", cloudOn ? C.blue : C.slate);
    },
  };
}

function buildNoSell(svg: SVGSVGElement): TrustIconScene {
  const shield = line(
    svg,
    "M80 8 L106 17 V38 C106 56 94 66 80 72 C66 66 54 56 54 38 V17 Z",
  );
  const inner = line(
    svg,
    "M80 15 L99 21.5 V38 C99 52 90 60 80 65 C70 60 61 52 61 38 V21.5 Z",
    C.hairSoft,
  );
  const tick = line(svg, "M70 40 L77 47 L91 32", C.blue, {
    "stroke-width": 1.75,
  });
  const ring = circle(svg, {
    cx: 80,
    cy: 40,
    r: 30,
    stroke: C.blueFaint,
    opacity: 0,
  });

  return {
    render(time) {
      draw(shield, easeInOut(progress(0, 0.8, time)));
      draw(inner, easeInOut(progress(0.25, 0.95, time)));
      draw(tick, easeInOut(progress(0.85, 1.2, time)));

      const lock = progress(1.2, 1.45, time);
      tick.setAttribute(
        "stroke-width",
        String(1.75 + Math.sin(lock * Math.PI)),
      );
      shield.setAttribute("stroke", time > 1.2 ? C.blue : C.slate);

      const pulse = time > 1.2 ? ((time - 1.2) % 6) / 6 : -1;
      const pulseAmount = pulse >= 0 ? progress(0, 0.45, pulse) : 0;
      ring.setAttribute("r", String(32 + 14 * easeOut(pulseAmount)));
      ring.setAttribute(
        "opacity",
        pulse >= 0 && pulseAmount < 1 ? String(0.7 * (1 - pulseAmount)) : "0",
      );
    },
  };
}

function buildExport(svg: SVGSVGElement): TrustIconScene {
  const table = line(svg, "M12 14 H72 V66 H12 Z");
  const header = line(svg, "M12 27 H72");
  const rowOne = line(svg, "M12 40 H72", C.hairSoft);
  const rowTwo = line(svg, "M12 53 H72", C.hairSoft);
  const column = line(svg, "M34 14 V66", C.hairSoft);
  const csv = line(svg, "M96 16 H112 L120 24 V50 H96 Z");
  const fold = line(svg, "M112 16 V24 H120");
  const csvLabel = label(svg, 108, 41, "CSV");
  const sheets = line(svg, "M128 16 H152 V50 H128 Z");
  const sheetRowOne = line(svg, "M128 27 H152", C.hairSoft);
  const sheetRowTwo = line(svg, "M128 38 H152", C.hairSoft);
  const sheetColumn = line(svg, "M138 16 V50", C.hairSoft);
  const exportLabel = label(svg, 108, 64, "EXPORT", { "font-size": 7 });
  const sheetsLabel = label(svg, 140, 64, "SHEETS", { "font-size": 7 });
  const mover = createEl(svg, "path", {
    stroke: C.blue,
    "stroke-width": 1.75,
    fill: "none",
    opacity: 0,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  });

  return {
    render(time) {
      draw(table, easeInOut(progress(0, 0.6, time)));
      draw(header, easeInOut(progress(0.2, 0.5, time)));
      draw(rowOne, easeInOut(progress(0.3, 0.6, time)));
      draw(rowTwo, easeInOut(progress(0.35, 0.65, time)));
      draw(column, easeInOut(progress(0.3, 0.6, time)));
      draw(csv, easeInOut(progress(0.4, 0.9, time)));
      draw(fold, easeInOut(progress(0.8, 1, time)));
      draw(sheets, easeInOut(progress(0.5, 1, time)));
      for (const element of [sheetRowOne, sheetRowTwo, sheetColumn]) {
        draw(element, easeInOut(progress(0.8, 1.1, time)));
      }

      const textOn = progress(0.9, 1.2, time);
      for (const element of [csvLabel, exportLabel, sheetsLabel]) {
        element.setAttribute("opacity", String(textOn));
      }

      const rowIndex = time < 1.2 ? 0 : Math.floor((time - 1.2) / 3) % 2;
      const halfCycle = time < 1.2 ? -1 : ((time - 1.2) % 3) / 3;

      let hitCsv = false;
      let hitSheets = false;

      if (halfCycle >= 0) {
        const amount = easeInOut(progress(0.05, 0.55, halfCycle));
        const y0 = rowIndex === 0 ? 33.5 : 46.5;
        const x0 = 40;
        const targetX = rowIndex === 0 ? 108 : 140;
        const x = x0 + (targetX - 8 - x0) * amount;
        const y = y0 + (32 - y0) * amount;
        const width = 26 - 12 * amount;
        mover.setAttribute(
          "d",
          `M${x.toFixed(2)} ${y.toFixed(2)} h${width.toFixed(2)}`,
        );
        mover.setAttribute(
          "opacity",
          String(
            progress(0, 0.08, halfCycle) * (1 - progress(0.5, 0.62, halfCycle)),
          ),
        );
        const hit = halfCycle > 0.52 && halfCycle < 0.9;
        hitCsv = hit && rowIndex === 0;
        hitSheets = hit && rowIndex === 1;
        (rowIndex === 0 ? rowOne : rowTwo).setAttribute(
          "stroke",
          halfCycle < 0.5 ? C.blueSoft : C.hairSoft,
        );
      } else {
        mover.setAttribute("opacity", "0");
      }

      csv.setAttribute("stroke", hitCsv ? C.blue : C.slate);
      fold.setAttribute("stroke", hitCsv ? C.blue : C.slate);
      csvLabel.setAttribute("fill", hitCsv ? C.blue : C.slate);
      sheets.setAttribute("stroke", hitSheets ? C.blue : C.slate);
      sheetsLabel.setAttribute("fill", hitSheets ? C.blue : C.slate);
      exportLabel.setAttribute("fill", hitCsv ? C.blue : C.slate);
    },
  };
}

export function buildTrustIconScene(
  svg: SVGSVGElement,
  icon: TrustIconName,
): TrustIconScene {
  svg.innerHTML = "";

  switch (icon) {
    case "openSource":
      return buildOpenSource(svg);
    case "selfHost":
      return buildSelfHost(svg);
    case "noSell":
      return buildNoSell(svg);
    case "export":
      return buildExport(svg);
  }
}
