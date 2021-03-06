import { ANS } from "no-stream/ans";

export function debounce<T>(span: number) {
  return function (s: ANS<T>): ANS<T> {
    return s
      .scan(
        ([context], x) => {
          const now = performance.now();
          let leading = context.until < now;

          context.until = now + span;
          return [context, leading, x];
        },
        [{ until: 0 }, false, null as any]
      )
      .filter(([, test]) => test)
      .map(([, , x]) => x);
  };
}
