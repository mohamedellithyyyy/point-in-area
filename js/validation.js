
export function scaled(str, scale) {
    const neg = str.startsWith("-");
    const [i, d = ""] = str.replace("-", "").split(".");
    const v = BigInt(i + d.padEnd(scale, "0"));

    return neg ? -v : v;
}

export function decimals(str) {
    return (str.split(".")[1] || "").length;
}

export function isPointInside(xStr, yStr, rStr) {
    // Extra decimal place makes R / 2 exact.
    const s =
        Math.max(
            decimals(xStr),
            decimals(yStr),
            decimals(rStr)
        ) + 1;

    const X = scaled(xStr, s);
    const Y = scaled(yStr, s);
    const R = scaled(rStr, s);
    const H = R / 2n;

    // First quadrant: rectangle
    if (X >= 0n && Y >= 0n) {
        return X <= R && Y <= H;
    }

    // Fourth quadrant: quarter circle
    if (X >= 0n && Y <= 0n) {
        return X * X + Y * Y <= R * R;
    }

    // Third quadrant: triangle
    if (X <= 0n && Y <= 0n) {
        return X >= -H && Y >= -H && X + Y >= -H;
    }

    // Second quadrant: outside
    return false;
}

export function validateForm({
    xSelect,
    yInput,
    selectedR,
    showError,
    clearError
}) {
    clearError();

    const xRaw = xSelect.value;
    const yRaw = yInput.value.trim();

    if (xRaw === "" || !Number.isFinite(Number(xRaw))) {
        showError("Некорректное значение X.");
        return null;
    }

    const x = Number(xRaw);

    if (yRaw === "") {
        showError("Поле Y не может быть пустым.");
        return null;
    }

    if (!/^-?\d+(\.\d+)?$/.test(yRaw)) {
        showError(
            "Y должен быть числом (только цифры, точка и знак «минус»)."
        );
        return null;
    }

    const y = Number(yRaw);
    const scale = decimals(yRaw) + 1;
    const Yb = scaled(yRaw, scale);

    if (
        Yb < scaled("-5", scale) ||
        Yb > scaled("3", scale)
    ) {
        showError("Y должен быть в диапазоне от -5 до 3.");
        return null;
    }

    if (selectedR === null) {
        showError("Выберите значение R.");
        return null;
    }

    return {
        x,
        y,
        yString: yRaw,
        xString: xRaw,
        rString: String(selectedR),
        r: selectedR
    };
}
