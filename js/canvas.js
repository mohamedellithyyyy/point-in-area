
const canvas = document.getElementById("plane");
const ctx = canvas.getContext("2d");

let selectedR = null;
let viewRange = 6;

export function setCanvasR(r) {
    selectedR = r;
}

function computeViewRange() {
    const r = selectedR || 5;
    return Math.max(6, r * 1.3);
}

function toCanvasX(x) {
    const half = canvas.width / 2;
    return half + (x / viewRange) * half;
}

function toCanvasY(y) {
    const half = canvas.height / 2;
    return half - (y / viewRange) * half;
}

function formatTick(v) {
    return (Number.isInteger(v) ? v : v.toFixed(1)).toString();
}

function drawArrow(x, y, dir) {
    ctx.beginPath();

    if (dir === "right") {
        ctx.moveTo(x, y);
        ctx.lineTo(x - 8, y - 4);
        ctx.moveTo(x, y);
        ctx.lineTo(x - 8, y + 4);
    } else {
        ctx.moveTo(x, y);
        ctx.lineTo(x - 4, y + 8);
        ctx.moveTo(x, y);
        ctx.lineTo(x + 4, y + 8);
    }

    ctx.stroke();
}

function drawCoordinatePlane() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = "#333";
    ctx.fillStyle = "#333";
    ctx.lineWidth = 1;
    ctx.font = "11px Verdana";

    const originX = toCanvasX(0);
    const originY = toCanvasY(0);

    ctx.beginPath();
    ctx.moveTo(10, originY);
    ctx.lineTo(w - 10, originY);
    ctx.moveTo(originX, h - 10);
    ctx.lineTo(originX, 10);
    ctx.stroke();

    drawArrow(w - 10, originY, "right");
    drawArrow(originX, 10, "up");

    ctx.fillText("x", w - 16, originY - 8);
    ctx.fillText("y", originX + 8, 16);

    const r = selectedR || 1;
    const marks = [-r, -r / 2, r / 2, r];

    marks.forEach(v => {
        const cx = toCanvasX(v);
        const cy = toCanvasY(v);

        ctx.beginPath();
        ctx.moveTo(cx, originY - 4);
        ctx.lineTo(cx, originY + 4);
        ctx.stroke();
        ctx.fillText(formatTick(v), cx - 8, originY + 16);

        ctx.beginPath();
        ctx.moveTo(originX - 4, cy);
        ctx.lineTo(originX + 4, cy);
        ctx.stroke();
        ctx.fillText(formatTick(v), originX + 6, cy + 4);
    });
}

function drawArea() {
    if (!selectedR) return;

    const r = selectedR;

    ctx.fillStyle = "rgba(74, 130, 220, 0.55)";
    ctx.strokeStyle = "rgba(40, 80, 160, 0.9)";
    ctx.lineWidth = 1.5;

    // Rectangle in the first quadrant
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), toCanvasY(0));
    ctx.lineTo(toCanvasX(r), toCanvasY(0));
    ctx.lineTo(toCanvasX(r), toCanvasY(r / 2));
    ctx.lineTo(toCanvasX(0), toCanvasY(r / 2));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Quarter circle in the fourth quadrant
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), toCanvasY(0));

    const steps = 60;

    for (let i = 0; i <= steps; i++) {
        const angle = -(Math.PI / 2) * (i / steps);
        const px = r * Math.cos(angle);
        const py = r * Math.sin(angle);

        ctx.lineTo(toCanvasX(px), toCanvasY(py));
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Triangle in the third quadrant
    ctx.beginPath();
    ctx.moveTo(toCanvasX(-r / 2), toCanvasY(0));
    ctx.lineTo(toCanvasX(0), toCanvasY(0));
    ctx.lineTo(toCanvasX(0), toCanvasY(-r / 2));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

export function drawPoint(x, y, hit) {
    const cx = toCanvasX(x);
    const cy = toCanvasY(y);

    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);

    ctx.fillStyle = hit ? "#198754" : "#dc3545";
    ctx.fill();

    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;
    ctx.stroke();
}

export function redrawAll(results) {
    viewRange = computeViewRange();

    drawCoordinatePlane();
    drawArea();

    results.forEach(res => {
        const y = Number(res.yNumeric ?? res.y);
        drawPoint(res.x, y, res.hit);
    });
}
