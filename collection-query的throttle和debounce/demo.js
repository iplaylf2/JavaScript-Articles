import { EmitType, transfer } from "collection-query";
import { create, forEach } from "collection-query/push";
import { throttle } from "./throttle.ts";
import { debounce } from "./debounce.ts";

(() => {
  const span = 100;

  const move_s = create((emit) => {
    const listen = function listen() {
      emit(EmitType.Next);
    };
    document.body.addEventListener("mousemove", listen);

    return () => document.body.removeEventListener("mousemove", listen);
  });

  const filter_array = [
    [
      "normal",
      "#1ABC9C",
      (color, order) => {
        document.body.addEventListener("mousemove", () =>
          paint_bar(color, order, get_point())
        );
      },
    ],
    [
      `throttle(${span}, { leading: true })`,
      "#27AE60",
      (color, order) => {
        const s = transfer(move_s, [throttle(span, { leading: true })]);
        forEach(s, () => paint_bar(color, order, get_point()));
      },
    ],
    [
      `throttle(${span}, { trailing: true })`,
      "#3498DB",
      (color, order) => {
        const s = transfer(move_s, [throttle(span, { trailing: true })]);
        forEach(s, () => paint_bar(color, order, get_point()));
      },
    ],
    [
      `throttle(${span}, { leading: true, trailing: true })`,
      "#9B59B6",
      (color, order) => {
        const s = transfer(move_s, [
          throttle(span, { leading: true, trailing: true }),
        ]);
        forEach(s, () => paint_bar(color, order, get_point()));
      },
    ],
    [
      `debounce(${span}, { leading: true })`,
      "#34495E",
      (color, order) => {
        const s = transfer(move_s, [debounce(span, { leading: true })]);
        forEach(s, () => paint_bar(color, order, get_point()));
      },
    ],
    [
      `debounce(${span}, { trailing: true })`,
      "#F39C12",
      (color, order) => {
        const s = transfer(move_s, [debounce(span, { trailing: true })]);
        forEach(s, () => paint_bar(color, order, get_point()));
      },
    ],
    [
      `debounce(${span}, { leading: true, trailing: true })`,
      "#D35400",
      (color, order) => {
        const s = transfer(move_s, [
          debounce(span, { leading: true, trailing: true }),
        ]);
        forEach(s, () => paint_bar(color, order, get_point()));
      },
    ],
  ];

  const canvas_width = 1024;
  const canvas_height = 640;
  const region = filter_array.length;
  const width = 1;
  const height = canvas_height / region;

  document.body.innerHTML = `
  <style>
    body{
      position: relative;
    }
    ul{
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      list-style: none;
      height: ${canvas_height};
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      z-index: 1;
    }
    canvas{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%)
    }
  </style>
  <ul>
      ${filter_array
        .map(
          ([text, color]) => `
    <li style="color: ${color};">${text}</li>
    `
        )
        .join("")}
  </ul>
  <canvas height= "${canvas_height}" width= "${canvas_width}"></canvas>
  `;

  const ctx = document.querySelector("canvas").getContext("2d");

  const flush = function () {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas_width, canvas_height);
  };

  const paint_bar = function (color, order, point) {
    const y = order * height;
    const x = point;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  };

  const time_scale = 5 * 1000;
  const width_scale = canvas_width / time_scale;

  let start_time = 0;
  const get_point = function () {
    const now = performance.now();
    const span = now - start_time;
    if (time_scale < span) {
      start_time = now;
      flush();
      return 0;
    }
    return span * width_scale;
  };

  let i = 0;
  for (const [, color, x] of filter_array) {
    x(color, i++);
  }
})();
