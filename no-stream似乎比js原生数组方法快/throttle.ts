import { ANS } from "no-stream/ans";

export function throttle<T>(span: number) {
  return function (s: ANS<T>): ANS<T> {
    return s
      .scan(
        ([context], x) => {
          const now = performance.now();
          let leading = context.until < now;

          if (leading) {
            let until = context.until + span;
            if (until < now) {
              until = now + span;
            }
            context.until = until;
          }

          return [context, leading, x];
        },
        [{ until: 0 }, false, null as any]
      )
      .filter(([, test]) => test)
      .map(([, , x]) => x);
  };
}
