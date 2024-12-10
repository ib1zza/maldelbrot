const canvas = document.getElementById("mandelbrotCanvas");
const ctx = canvas.getContext("2d");
const width = 800;
const height = 800;

const widthToZoom = parseInt(window.getComputedStyle(canvas).width);
const heightToZoom = parseInt(window.getComputedStyle(canvas).height);

document.getElementById("saveImage").addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "mandelbrot.png"; // The name for the downloaded file
    link.href = canvas.toDataURL("image/png"); // Get the data URL of the canvas
    link.click(); // Trigger the download
});

let xMin = -2;
let xMax = 2;
let yMin = -2;
let yMax = 2;
let maxIter = 400;
let colorMode = "RGB"; // Default color mode
let withBg = false;

let bgColor = [0, 255, 255];

function getDefaultBgColor() {
    return bgColor;
}

function mandelbrot() {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    console.log(xMin, xMax, yMin, yMax);

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let zx = 0;
            let zy = 0;
            let i = maxIter;
            const cX = xMin + (x / width) * (xMax - xMin);
            const cY = yMin + (y / height) * (yMax - yMin);

            while (zx * zx + zy * zy < 4 && i > 0) {
                const tmp = zx * zx - zy * zy + cX;
                zy = 2 * zx * zy + cY;
                zx = tmp;
                i--;
            }

            const pixelIndex = (x + y * width) * 4;

            if (withBg) {
                if (i > maxIter - 30) {
                    const col = getDefaultBgColor();
                    data[pixelIndex] = col[0]; // Red
                    data[pixelIndex + 1] = col[1]; // Green
                    data[pixelIndex + 2] = col[2]; // Blue
                    data[pixelIndex + 3] = 255; // Alpha
                    continue;
                }
            }

            // Color assignment based on color mode
            if (colorMode === "BlackWhite") {
                const shade = (i / maxIter) * 255; // Create a gray shade based on iterations
                data[pixelIndex] = shade; // Red
                data[pixelIndex + 1] = shade; // Green
                data[pixelIndex + 2] = shade; // Blue
            } else if (colorMode === "RGB") {
                if (i === 0) {
                    data[pixelIndex] = 0; // Red
                    data[pixelIndex + 1] = 0; // Green
                    data[pixelIndex + 2] = 0; // Blue
                } else {
                    const r = (i % 8) * 32;
                    const g = (i % 16) * 16;
                    const b = (i % 32) * 8;
                    data[pixelIndex] = r;
                    data[pixelIndex + 1] = g;
                    data[pixelIndex + 2] = b;
                }
            } else if (colorMode === "Rainbow") {
                if (i === 0) {
                    data[pixelIndex] = 0; // Red
                    data[pixelIndex + 1] = 0; // Green
                    data[pixelIndex + 2] = 0; // Blue
                } else {
                    const hue = (i / maxIter) * 360; // Color angle in HSL
                    const rgb = hslToRgb(hue / 360, 1, 0.5); // Convert HSL to RGB
                    data[pixelIndex] = rgb[0];
                    data[pixelIndex + 1] = rgb[1];
                    data[pixelIndex + 2] = rgb[2];
                }
            }
            data[pixelIndex + 3] = 255; // Alpha
        }
    }
    ctx.putImageData(imageData, 0, 0);
    updateInfo();
}

function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function zoomIn(xMouse, yMouse) {
    const zoomFactor = 0.5; // Увеличение в 2 раза
    const xCenter = xMin + (xMouse / widthToZoom) * (xMax - xMin);
    const yCenter = yMin + (yMouse / heightToZoom) * (yMax - yMin);

    console.log(xCenter, yCenter, yMouse, widthToZoom);
    xMin = xCenter + (xMin - xCenter) * zoomFactor;
    xMax = xCenter + (xMax - xCenter) * zoomFactor;
    yMin = yCenter + (yMin - yCenter) * zoomFactor;
    yMax = yCenter + (yMax - yCenter) * zoomFactor;

    mandelbrot();
}

function zoomInAuto() {
    const zoomFactor = 0.9;
    const xCenter = xMin + (widthToZoom / 2 / widthToZoom) * (xMax - xMin);
    const yCenter =
        yMin + (heightToZoom / 2 / heightToZoom) * (yMax - yMin);

    xMin = xCenter + (xMin - xCenter) * zoomFactor;
    xMax = xCenter + (xMax - xCenter) * zoomFactor;
    yMin = yCenter + (yMin - yCenter) * zoomFactor;
    yMax = yCenter + (yMax - yCenter) * zoomFactor;

    mandelbrot();
}

let autoZoomInterval;

document
    .getElementById("point1")
    // -0.3805060593809112 -0.3772581898548366 0.6609624087172162 0.6642102782432908
    .addEventListener("click", () =>
        setPoint(
            -0.3805060593809112,
            -0.3772581898548366,
            0.6609624087172162,
            0.6642102782432908
        )
    );
document
    .getElementById("point2")
    // -0.7457158825305376 -0.7457158825155342 0.18679454434401785 0.18679454435407586
    .addEventListener("click", () =>
        setPoint(
            -0.8457158825305376,
            -0.6457158825155342,
            0.08679454434401785,
            0.28679454435407586
        )
    );
document
    .getElementById("point3")
    // -1.791316785000101 -1.7913143114073429 -0.0000010095191826326165 0.0000017317622929907563
    .addEventListener("click", () => setPoint(
        -2.891316785000101, -0.6913143114073429, -1.1000010095191826326165, 1.1000017317622929907563)
    );
document
    .getElementById("point4")
    .addEventListener("click", () =>
        setPoint(
            -0.47658135381313224,
            -0.27658135381313224,
            0.5622053085935699,
            0.7622053085935699
        )
    );
document
    .getElementById("point5")
    .addEventListener("click", () => setPoint(-1.5, -1.4, 0, 0.1));
document.getElementById("reset").addEventListener("click", reset);
document.getElementById("autoZoom").addEventListener("click", () => {
    if (autoZoomInterval) {
        clearInterval(autoZoomInterval);
    }
    autoZoomInterval = setInterval(() => {
        zoomInAuto();
    }, 200);
});

document
    .getElementById("colorBlackWhite")
    .addEventListener("click", () => {
        colorMode = "BlackWhite";
        mandelbrot();
    });

document.getElementById("colorRGB").addEventListener("click", () => {
    colorMode = "RGB";
    mandelbrot();
});

document.getElementById("colorRainbow").addEventListener("click", () => {
    colorMode = "Rainbow";
    mandelbrot();
});

canvas.addEventListener("wheel", (event) => {
    const zoomDiff = 0.5;
    const zoomFactor = event.deltaY > 0 ? 1 + zoomDiff : 1 - zoomDiff; // Увеличение или уменьшение в 1.1 раза
    const rect = canvas.getBoundingClientRect();
    const xMouse = event.clientX - rect.left;
    const yMouse = event.clientY - rect.top;
    const xCenter = xMin + (xMouse / widthToZoom) * (xMax - xMin);
    const yCenter = yMin + (yMouse / heightToZoom) * (yMax - yMin);

    xMin = xCenter + (xMin - xCenter) / zoomFactor;
    xMax = xCenter + (xMax - xCenter) / zoomFactor;
    yMin = yCenter + (yMin - yCenter) / zoomFactor;
    yMax = yCenter + (yMax - yCenter) / zoomFactor;

    mandelbrot();
});

document.getElementById("zoomIn").addEventListener("click", zoomIn);
document.getElementById("zoomOut").addEventListener("click", zoomOut);

function updateInfo() {
    const centerX = (xMin + xMax) / 2;
    const centerY = (yMin + yMax) / 2;
    const zoomLevel = Math.abs(xMax - xMin);
    document.getElementById(
        "info"
    ).innerText = `Координаты: (${centerX.toFixed(3)}, ${centerY.toFixed(
        3
    )}) | Длинна стороны: ${toScientificNotation(zoomLevel)}`;
}

function toScientificNotation(num, decimalPlaces = 4) {
    if (num > 1 / 10 ** decimalPlaces) {
        return num.toFixed(decimalPlaces);
    }
    return num.toExponential(decimalPlaces);
}

function reset() {
    xMin = -2;
    xMax = 2;
    yMin = -2;
    yMax = 2;
    maxIter = 400;
    colorMode = "RGB"; // Reset to default color mode
    withBg = false;
    clearInterval(autoZoomInterval);
    mandelbrot();
}

function setPoint(xMinValue, xMaxValue, yMinValue, yMaxValue) {
    xMin = xMinValue;
    xMax = xMaxValue;
    yMin = yMinValue;
    yMax = yMaxValue;
    mandelbrot();
}

function zoomIn() {
    const zoomFactor = 0.5; // Увеличение в 2 раза
    const xCenter = (xMin + xMax) / 2;
    const yCenter = (yMin + yMax) / 2;

    xMin = xCenter + (xMin - xCenter) * zoomFactor;
    xMax = xCenter + (xMax - xCenter) * zoomFactor;
    yMin = yCenter + (yMin - yCenter) * zoomFactor;
    yMax = yCenter + (yMax - yCenter) * zoomFactor;

    mandelbrot();
}

function zoomOut() {
    const zoomFactor = 0.5; // Уменьшение в 2 раза
    const xCenter = (xMin + xMax) / 2;
    const yCenter = (yMin + yMax) / 2;

    xMin = xCenter + (xMin - xCenter) / zoomFactor;
    xMax = xCenter + (xMax - xCenter) / zoomFactor;
    yMin = yCenter + (yMin - yCenter) / zoomFactor;
    yMax = yCenter + (yMax - yCenter) / zoomFactor;

    mandelbrot();
}

document.getElementById("zoomIn").addEventListener("click", zoomIn);
document.getElementById("zoomOut").addEventListener("click", zoomOut);

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

canvas.addEventListener("mousedown", (event) => {
    isDragging = true;
    const rect = canvas.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
});

canvas.addEventListener("mousemove", (event) => {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        const newX = event.clientX - rect.left;
        const newY = event.clientY - rect.top;
        const dx = newX - offsetX;
        const dy = newY - offsetY;

        xMin -= (dx / width) * (xMax - xMin);
        xMax -= (dx / width) * (xMax - xMin);
        yMin -= (dy / height) * (yMax - yMin);
        yMax -= (dy / height) * (yMax - yMin);

        offsetX = newX;
        offsetY = newY;

        mandelbrot();
    }
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
});

// Touch events for mobile devices
canvas.addEventListener("touchstart", (event) => {
    isDragging = true;
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    offsetX = touch.clientX - rect.left;
    offsetY = touch.clientY - rect.top;
});

canvas.addEventListener("touchmove", (event) => {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        const newX = touch.clientX - rect.left;
        const newY = touch.clientY - rect.top;
        const dx = newX - offsetX;
        const dy = newY - offsetY;

        xMin -= (dx / width) * (xMax - xMin);
        xMax -= (dx / width) * (xMax - xMin);
        yMin -= (dy / height) * (yMax - yMin);
        yMax -= (dy / height) * (yMax - yMin);

        offsetX = newX;
        offsetY = newY;

        mandelbrot();
    }
});

canvas.addEventListener("touchend", () => {
    isDragging = false;
});

const customColor = document.getElementById("customColor");

function rgbFromHex(ev) {
    const color = ev;
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);
    return [r, g, b];
}

customColor.addEventListener("change", (e) => {
    console.log(e.target);
    bgColor = rgbFromHex(customColor.value);
    withBg = true;
    mandelbrot();
});

mandelbrot();
