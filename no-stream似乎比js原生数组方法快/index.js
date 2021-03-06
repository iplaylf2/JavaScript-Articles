import { ans } from "no-stream";
import { throttle } from "./throttle";
import { debounce } from "./debounce";

(() => {
  const span = 100;

  const move_s = ans.ob((subscribe) => {
    function listener() {
      subscribe.next();
      // subscribe.complete();
      // subscribe.error(xxx);
    }

    document.body.addEventListener("mousemove", listener); // 订阅鼠标移动事件

    // 返回取消订阅的方法
    return () => document.body.removeEventListener("mousemove", listener);
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
      `throttle(${span})`,
      "#27AE60",
      (color, order) => {
        const s = throttle(span)(move_s);
        s.foreach(() => paint_bar(color, order, get_point()));
      },
    ],
    [
      `debounce(${span})`,
      "#34495E",
      (color, order) => {
        const s = debounce(span)(move_s);
        s.foreach(() => paint_bar(color, order, get_point()));
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
