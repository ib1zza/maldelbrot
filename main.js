import { Draw } from "./draw.js";
import { Utils } from "./utils.js";

class Main {
  constructor() {
    this.canvas = document.getElementById("mandelbrotCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.width = 800;
    this.height = 800;
    this.draw = new Draw(this.canvas, this.ctx, this.width, this.height);
    this.utils = new Utils();
    this.init();
  }

  init() {
    this.draw.mandelbrot();
    this.addEventListeners();
  }

  addEventListeners() {
    document.getElementById("saveImage").addEventListener("click", () => {
      this.draw.saveImage();
    });

    document.getElementById("point1").addEventListener("click", () => {
      this.draw.setPoint(
        -0.3805060593809112,
        -0.3772581898548366,
        0.6609624087172162,
        0.6642102782432908
      );
    });

    document.getElementById("point2").addEventListener("click", () => {
      this.draw.setPoint(
        -0.8457158825305376,
        -0.6457158825155342,
        0.08679454434401785,
        0.28679454435407586
      );
    });

    document.getElementById("point3").addEventListener("click", () => {
      this.draw.setPoint(
        -2.891316785000101,
        -0.6913143114073429,
        -1.1000010095191826326165,
        1.1000017317622929907563
      );
    });

    document.getElementById("point4").addEventListener("click", () => {
      this.draw.setPoint(
        -0.47658135381313224,
        -0.27658135381313224,
        0.5622053085935699,
        0.7622053085935699
      );
    });

    document.getElementById("point5").addEventListener("click", () => {
      this.draw.setPoint(-1.5, -1.4, 0, 0.1);
    });

    document.getElementById("reset").addEventListener("click", () => {
      this.draw.reset();
    });

    document.getElementById("autoZoom").addEventListener("click", () => {
      this.draw.autoZoom();
    });

    document.getElementById("colorBlackWhite").addEventListener("click", () => {
      this.draw.setColorMode("BlackWhite");
    });

    document.getElementById("colorRGB").addEventListener("click", () => {
      this.draw.setColorMode("RGB");
    });

    document.getElementById("colorRainbow").addEventListener("click", () => {
      this.draw.setColorMode("Rainbow");
    });

    this.canvas.addEventListener("wheel", (event) => {
      this.draw.zoom(event.deltaY > 0);
    });

    this.canvas.addEventListener("mousedown", (event) => {
      this.draw.startDrag(event);
    });

    this.canvas.addEventListener("mousemove", (event) => {
      this.draw.drag(event);
    });

    this.canvas.addEventListener("mouseup", () => {
      this.draw.stopDrag();
    });

    this.canvas.addEventListener("touchstart", (event) => {
      this.draw.startDrag(event.touches[0]);
    });

    this.canvas.addEventListener("touchmove", (event) => {
      this.draw.drag(event.touches[0]);
    });

    this.canvas.addEventListener("touchend", () => {
      this.draw.stopDrag();
    });

    const customColor = document.getElementById("customColor");
    customColor.addEventListener("change", (e) => {
      this.draw.setCustomColor(e.target.value);
    });
  }
}

new Main();
