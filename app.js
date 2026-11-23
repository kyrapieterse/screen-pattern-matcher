"use strict";

const el = id => document.getElementById(id);

const fmt = (number, digits = 2) => number.toLocaleString("en-ZA", { maximumFractionDigits: digits });

function number(id) {
  const input = el(id);
  if (!input.validity.valid || !Number.isFinite(input.valueAsNumber)) {
    throw new Error("Check " + input.labels[0].textContent.trim().toLowerCase() + " and its allowed range.");
  }
  return input.valueAsNumber;
}

function refresh(draw) {
  try {
    draw();
    el("message").textContent = "";
    el("result").hidden = false;
  } catch (error) {
    el("message").textContent = error.message;
    el("result").hidden = true;
  }
}

function imageFrom(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("This image could not be opened. Choose a valid local image."));
    image.src = source;
  });
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("This file could not be read."));
    reader.readAsDataURL(file);
  });
}

let tile, serial = 0;
function draw() {
  if (!tile) return;
  const count = number("panels"), width = number("width"), height = number("height");
  const gap = number("gap"), edge = number("edge"), repeat = number("repeat"), offset = number("offset");
  if (2*edge >= Math.min(width,height)) throw new Error("Reduce the solid edge so the pattern fits inside every panel.");
  const view = el("view"), ctx = view.getContext("2d");
  const run = count*width + (count-1)*gap;
  const scale = Math.min((view.width-24)/run,(view.height/2-22)/height);
  const start = (view.width-run*scale)/2;
  ctx.fillStyle = "#eef3f7"; ctx.fillRect(0,0,view.width,view.height);
  for (let row=0; row<2; row++) {
    const y = (row+.5)*view.height/2 - height*scale/2;
    for (let panel=0; panel<count; panel++) {
      const relX = panel*(width+gap)*scale, x = start+relX;
      ctx.fillStyle = "#305268"; ctx.fillRect(x,y,width*scale,height*scale);
      ctx.fillStyle = "#e0edf4"; ctx.fillRect(x+edge*scale,y+edge*scale,(width-2*edge)*scale,(height-2*edge)*scale);
      ctx.save();
      ctx.beginPath(); ctx.rect(x+edge*scale,y+edge*scale,(width-2*edge)*scale,(height-2*edge)*scale); ctx.clip();
      const pattern = ctx.createPattern(tile,"repeat");
      const origin = row === 0 ? start : x;
      const factor = repeat*scale/tile.width;
      pattern.setTransform(new DOMMatrix().translate(origin+offset*scale,y).scale(factor));
      ctx.fillStyle = pattern; ctx.fillRect(x,y,width*scale,height*scale);
      ctx.restore();
    }
  }
  el("summary").textContent = count + (count===1?" panel":" panels") + " · " + fmt(run) + " mm across the run";
}
async function choose(source, version = ++serial) {
  try {
    const img = await imageFrom(source);
    if (version !== serial) return;
    tile = document.createElement("canvas");
    const scale = 384/Math.max(img.naturalWidth,img.naturalHeight);
    tile.width = Math.max(1,Math.round(img.naturalWidth*scale));
    tile.height = Math.max(1,Math.round(img.naturalHeight*scale));
    tile.getContext("2d").drawImage(img,0,0,tile.width,tile.height);
    refresh(draw);
  } catch (error) { if (version === serial) { tile=null; el("result").hidden=true; el("message").textContent=error.message; } }
}
let imported;
el("pattern").onchange = () => choose(el("pattern").value === "local" ? imported : svgUrl(patternSource(el("pattern").value)));
el("art").onchange = async event => {
  const file = event.target.files[0];
  if (!file) return;
  const version = ++serial;
  try {
    const source = await readFile(new Blob([file],{type:"image/svg+xml"}));
    if (version !== serial) return;
    imported = source;
    const select = el("pattern");
    let option = select.querySelector('[value="local"]');
    if (!option) { option = new Option("","local"); select.add(option); }
    option.text = file.name; select.value = "local"; await choose(imported, version);
  } catch (error) { if (version === serial) el("message").textContent=error.message; }
};
el("controls").addEventListener("input",e => { if (e.target.type === "number") refresh(draw); });
el("export").onclick = () => {
  if (!tile || el("result").hidden) return;
  el("view").toBlob(blob => { if (blob) download(blob,"screen-pattern-comparison.png"); });
};
choose(svgUrl(patternSource("diamonds")));
