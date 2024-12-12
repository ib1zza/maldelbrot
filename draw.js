import { Utils } from "./utils.js";

class Draw {
  constructor(canvas, ctx, width, height) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.xMin = -2;
    this.xMax = 2;
    this.yMin = -2;
    this.yMax = 2;
    this.maxIter = 400;
    this.colorMode = "RGB";
    this.withBg = false;
    this.bgColor = [0, 255, 255];
    this.utils = new Utils();
    this.isDragging = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.widthToZoom = parseInt(window.getComputedStyle(canvas).width);
    this.heightToZoom = parseInt(window.getComputedStyle(canvas).height);
    this.autoZoomInterval = null;
  }

  mandelbrot() {
    const imageData = this.ctx.createImageData(this.width, this.height);
    const data = imageData.data;

    console.log(this.xMin, this.xMax, this.yMin, this.yMax);

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        let zx = 0;
        let zy = 0;
        let i = this.maxIter;
        const cX = this.xMin + (x / this.width) * (this.xMax - this.xMin);
        const cY = this.yMin + (y / this.height) * (this.yMax - this.yMin);

        while (zx * zx + zy * zy < 4 && i > 0) {
          const tmp = zx * zx - zy * zy + cX;
          zy = 2 * zx * zy + cY;
          zx = tmp;
          i--;
        }

        const pixelIndex = (x + y * this.width) * 4;

        if (this.withBg) {
          if (i > this.maxIter - 30) {
            const col = this.bgColor;
            data[pixelIndex] = col[0]; // Red
            data[pixelIndex + 1] = col[1]; // Green
            data[pixelIndex + 2] = col[2]; // Blue
            data[pixelIndex + 3] = 255; // Alpha
            continue;
          }
        }

        // Color assignment based on color mode
        if (this.colorMode === "BlackWhite") {
          const shade = (i / this.maxIter) * 255; // Create a gray shade based on iterations
          data[pixelIndex] = shade; // Red
          data[pixelIndex + 1] = shade; // Green
          data[pixelIndex + 2] = shade; // Blue
        } else if (this.colorMode === "RGB") {
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
        } else if (this.colorMode === "Rainbow") {
          if (i === 0) {
            data[pixelIndex] = 0; // Red
            data[pixelIndex + 1] = 0; // Green
            data[pixelIndex + 2] = 0; // Blue
          } else {
            const hue = (i / this.maxIter) * 360; // Color angle in HSL
            const rgb = this.utils.hslToRgb(hue / 360, 1, 0.5); // Convert HSL to RGB
            data[pixelIndex] = rgb[0];
            data[pixelIndex + 1] = rgb[1];
            data[pixelIndex + 2] = rgb[2];
          }
        }
        data[pixelIndex + 3] = 255; // Alpha
      }
    }
    this.ctx.putImageData(imageData, 0, 0);
    this.updateInfo();
  }

  saveImage() {
    const link = document.createElement("a");
    link.download = "mandelbrot.png"; // The name for the downloaded file
    link.href = this.canvas.toDataURL("image/png"); // Get the data URL of the canvas
    link.click(); // Trigger the download
  }

  setPoint(xMinValue, xMaxValue, yMinValue, yMaxValue) {
    this.xMin = xMinValue;
    this.xMax = xMaxValue;
    this.yMin = yMinValue;
    this.yMax = yMaxValue;
    this.mandelbrot();
  }

  reset() {
    this.xMin = -2;
    this.xMax = 2;
    this.yMin = -2;
    this.yMax = 2;
    this.maxIter = 400;
    this.colorMode = "RGB"; // Reset to default color mode
    this.withBg = false;
    clearInterval(this.autoZoomInterval);
    this.mandelbrot();
  }

  autoZoom() {
    if (this.autoZoomInterval) {
      clearInterval(this.autoZoomInterval);
    }
    this.autoZoomInterval = setInterval(() => {
      this.zoomInAuto();
    }, 200);
  }

  zoomInAuto() {
    const zoomFactor = 0.9;
    const xCenter =
      this.xMin +
      (this.widthToZoom / 2 / this.widthToZoom) * (this.xMax - this.xMin);
    const yCenter =
      this.yMin +
      (this.heightToZoom / 2 / this.heightToZoom) * (this.yMax - this.yMin);

    this.xMin = xCenter + (this.xMin - xCenter) * zoomFactor;
    this.xMax = xCenter + (this.xMax - xCenter) * zoomFactor;
    this.yMin = yCenter + (this.yMin - yCenter) * zoomFactor;
    this.yMax = yCenter + (this.yMax - yCenter) * zoomFactor;

    this.mandelbrot();
  }

  zoom(isZoomIn) {
    const zoomFactor = isZoomIn ? 1.1 : 0.9;
    const rect = this.canvas.getBoundingClientRect();
    const xCenter =
      this.xMin + (rect.width / 2 / this.widthToZoom) * (this.xMax - this.xMin);
    const yCenter =
      this.yMin +
      (rect.height / 2 / this.heightToZoom) * (this.yMax - this.yMin);

    this.xMin = xCenter + (this.xMin - xCenter) / zoomFactor;
    this.xMax = xCenter + (this.xMax - xCenter) / zoomFactor;
    this.yMin = yCenter + (this.yMin - yCenter) / zoomFactor;
    this.yMax = yCenter + (this.yMax - yCenter) / zoomFactor;

    this.mandelbrot();
  }

  startDrag(event) {
    this.isDragging = true;
    const rect = this.canvas.getBoundingClientRect();
    this.offsetX = event.clientX - rect.left;
    this.offsetY = event.clientY - rect.top;
  }

  drag(event) {
    if (this.isDragging) {
      const rect = this.canvas.getBoundingClientRect();
      const newX = event.clientX - rect.left;
      const newY = event.clientY - rect.top;
      const dx = newX - this.offsetX;
      const dy = newY - this.offsetY;

      this.xMin -= (dx / this.width) * (this.xMax - this.xMin);
      this.xMax -= (dx / this.width) * (this.xMax - this.xMin);
      this.yMin -= (dy / this.height) * (this.yMax - this.yMin);
      this.yMax -= (dy / this.height) * (this.yMax - this.yMin);

      this.offsetX = newX;
      this.offsetY = newY;

      this.mandelbrot();
    }
  }

  stopDrag() {
    this.isDragging = false;
  }

  setCustomColor(color) {
    this.bgColor = this.utils.rgbFromHex(color);
    this.withBg = true;
    this.mandelbrot();
  }

  updateInfo() {
    const centerX = (this.xMin + this.xMax) / 2;
    const centerY = (this.yMin + this.yMax) / 2;
    const zoomLevel = Math.abs(this.xMax - this.xMin);
    document.getElementById("info").innerText = `Координаты: (${centerX.toFixed(
      3
    )}, ${centerY.toFixed(
      3
    )}) | Длинна стороны: ${this.utils.toScientificNotation(zoomLevel)}`;
  }

  setColorMode(mode) {
    this.colorMode = mode;
    this.mandelbrot();
  }
}

export { Draw };
