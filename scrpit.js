const canvas = document.querySelector(".mandelbrotCanvas");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;

function mandelbrot(xMin, xMax, yMin, yMax, maxIter) {
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
      const color = i === 0 ? 0 : (i / maxIter) * 255;
      ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

mandelbrot(-2, 2, -2, 2, 100);
