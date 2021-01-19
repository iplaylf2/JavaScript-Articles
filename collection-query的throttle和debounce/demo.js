import { EmitType, transfer } from "collection-query";
import { create, forEach } from "collection-query/push";
import { throttle } from "./throttle.ts";
import { debounce } from "./debounce.ts";

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
        height: 640;
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
    li:nth-child(1){
      color: #1ABC9C;
    }
    li:nth-child(2){
      color: #2ECC71;
    }
    li:nth-child(3){
      color: #3498DB;
    }
    li:nth-child(4){
      color: #9B59B6;
    }
    li:nth-child(5){
      color: #34495E;
    }
    li:nth-child(6){
      color: #F1C40F;
    }
    li:nth-child(7){
      color: #E67E22;
    }
</style>
<ul>
    <li>normal</li>
    <li>throttle(100, { leading: true})</li>
    <li>throttle(100, { tailing: true})</li>
    <li>throttle(100, { leading: true, tailing: true})</li>
    <li>debounce(100, { leading: true})</li>
    <li>debounce(100, { tailing: true})</li>
    <li>debounce(100, { leading: true, tailing: true})</li>
</ul>
<canvas height= "640" width= "1024"></canvas>
`;

(() => {
  const canvas_width = 1024;
  const canvas_height = 640;
  const region = 7;
  const width = 1;
  const height = canvas_height / region;

  const ctx = document.querySelector("canvas").getContext("2d");

  const flush = function () {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas_width, canvas_height);
  };

  const color = [
    "#1ABC9C",
    "#2ECC71",
    "#3498DB",
    "9B59B6",
    "34495E",
    "F1C40F",
    "E67E22",
  ];

  const paint_bar = function (order, point) {
    const y = order * height;
    const x = point;
    ctx.fillStyle = color[order];
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

  const move_s = create((emit) => {
    document.body.addEventListener("mousemove", () => emit(EmitType.Next));
  });
  const t1 = transfer(move_s, [throttle(100, { leading: true })]);
  const t2 = transfer(move_s, [throttle(100, { tailing: true })]);
  const t3 = transfer(move_s, [
    throttle(100, { leading: true, tailing: true }),
  ]);
  const d1 = transfer(move_s, [debounce(100, { leading: true })]);
  const d2 = transfer(move_s, [debounce(100, { tailing: true })]);
  const d3 = transfer(move_s, [
    debounce(100, { leading: true, tailing: true }),
  ]);

  document.body.addEventListener("mousemove", () => {
    paint_bar(0, get_point());
  });

  forEach(t1, () => {
    paint_bar(1, get_point());
  });
  forEach(t2, () => {
    paint_bar(2, get_point());
  });
  forEach(t3, () => {
    paint_bar(3, get_point());
  });
  forEach(d1, () => {
    paint_bar(4, get_point());
  });
  forEach(d2, () => {
    paint_bar(5, get_point());
  });
  forEach(d3, () => {
    paint_bar(6, get_point());
  });
})();
