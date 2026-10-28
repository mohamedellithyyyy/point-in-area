
import {
    validateForm,
    isPointInside
} from "./validation.js";

import {
    setCanvasR,
    drawPoint,
    redrawAll
} from "./canvas.js";

const STORAGE_KEY = "lab1_results_variant_22685";

const form = document.getElementById("point-form");
const xSelect = document.getElementById("x-select");
const yInput = document.getElementById("y-input");
const rButtons = document.querySelectorAll(".r-button");
const errorBox = document.getElementById("error-box");
const resultsBody = document.getElementById("results-body");
const clearBtn = document.getElementById("clear-btn");

let selectedR = null;
let results = [];

function showError(msg) {
    errorBox.textContent = msg;
}

function clearError() {
    errorBox.textContent = "";
}

function saveResult(entry) {
    results.push(entry);

    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(results)
        );

        localStorage.setItem(
            "lab1_last_values",
            JSON.stringify({
                x: entry.x,
                y: entry.y,
                r: entry.r
            })
        );
    } catch (e) {
        console.error("Не удалось сохранить результат:", e);
    }
}

function loadResults() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            results = [];
            return;
        }

        const data = JSON.parse(raw);

        results = Array.isArray(data)
            ? data.filter(item =>
                item &&
                typeof item.x === "number" &&
                (typeof item.y === "string" ||
                    typeof item.y === "number") &&
                typeof item.r === "number" &&
                typeof item.hit === "boolean" &&
                typeof item.timestamp === "string"
            )
            : [];
    } catch (e) {
        console.error(
            "Повреждённые данные в localStorage:",
            e
        );
        results = [];
    }
}

function renderResults() {
    resultsBody.innerHTML = "";

    results.forEach(entry => {
        const tr = document.createElement("tr");
        const dateStr = new Date(entry.timestamp).toLocaleString("ru-RU");

        const values = [
            entry.x,
            entry.y,
            entry.r,
            entry.hit ? "Попадает" : "Не попадает",
            dateStr
        ];

        values.forEach((value, index) => {
            const td = document.createElement("td");
            td.textContent = value;

            if (index === 3) {
                td.className = entry.hit ? "hit-yes" : "hit-no";
            }

            tr.appendChild(td);
        });

        resultsBody.appendChild(tr);
    });
}

function updateCanvas() {
    redrawAll(results);
}

rButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        rButtons.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");

        selectedR = Number(btn.dataset.r);
        setCanvasR(selectedR);

        clearError();
        updateCanvas();
    });
});

form.addEventListener("submit", e => {
    e.preventDefault();

    const parsed = validateForm({
        xSelect,
        yInput,
        selectedR,
        showError,
        clearError
    });

    if (!parsed) return;

    const hit = isPointInside(
        parsed.xString,
        parsed.yString,
        parsed.rString
    );

    const entry = {
        x: parsed.x,
        y: parsed.yString,
        yNumeric: parsed.y,
        r: parsed.r,
        hit,
        timestamp: new Date().toISOString()
    };

    saveResult(entry);
    renderResults();
    drawPoint(entry.x, entry.yNumeric, entry.hit);
});

clearBtn.addEventListener("click", () => {
    results = [];
    localStorage.removeItem(STORAGE_KEY);

    renderResults();
    updateCanvas();
});

loadResults();
renderResults();
updateCanvas();