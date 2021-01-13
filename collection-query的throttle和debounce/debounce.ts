import { PushStream, Cancel, EmitType, transfer } from "collection-query";
import { create, filter, scan, map, take } from "collection-query/push";

class Debounce<T> {
  constructor(span: number) {
    this.span = span;
    this._sleep = true;
  }

  async cycle() {
    this._sleep = false;
    this._catchTrailing = false;
    while (true) {
      this.bounce = false;
      await this.delay();
      if (!this.bounce) {
        break;
      }
    }
    this._sleep = true;
  }

  trailing(x: T) {
    this.bounce = true;
    this._catchTrailing = true;
    this._trailing = x;
  }

  get sleep() {
    return this._sleep;
  }

  get catchTrailing() {
    return this._catchTrailing;
  }

  get theTrailing() {
    return this._trailing;
  }

  private delay() {
    return new Promise((r) => setTimeout(r, this.span));
  }

  private span: number;
  private _sleep: boolean;
  private _catchTrailing!: boolean;
  private _trailing!: T;
  private bounce!: boolean;
}

function debounceWithTrailing<T>(
  span: number,
  leading: boolean
): (s: PushStream<T>) => PushStream<T> {
  if (span <= 0) {
    return (s) => s;
  }

  return function (s) {
    return function (receiver, expose): Cancel {
      const cancel = function () {
        relay_cancel();
        source_cancel();
      };

      let source_cancel!: Cancel;

      const debounce = new Debounce<T>(span);
      const relay_emitter = create<T>((emit) => {
        s(
          (t, x?) => {
            switch (t) {
              case EmitType.Next:
                if (debounce.sleep) {
                  (async () => {
                    await debounce.cycle();
                    if (debounce.catchTrailing) {
                      emit(EmitType.Next, debounce.theTrailing);
                    }
                  })();

                  if (leading) {
                    emit(t, x);
                  } else {
                    debounce.trailing(x);
                  }
                } else {
                  debounce.trailing(x);
                }
                break;
              case EmitType.Complete:
                if (!debounce.sleep && debounce.catchTrailing) {
                  emit(EmitType.Next, debounce.theTrailing);
                }
                emit(t);
                break;
              case EmitType.Error:
                emit(t, x);
                break;
            }
          },
          (c) => {
            source_cancel = c;
          }
        );
      });

      let relay_cancel!: Cancel;

      relay_emitter(receiver, (c) => {
        relay_cancel = c;

        if (expose) {
          expose(cancel);
        }
      });

      return cancel;
    };
  };
}

function debounceLeading<T>(span: number) {
  type Item = [{ until: number }, boolean, T];
  return function (s: PushStream<T>): PushStream<T> {
    return transfer(s, [
      scan<T, Item>(
        ([context], x) => {
          const now = Date.now();
          let leading = false;
          if (context.until < now) {
            leading = true;
          }
          context.until = now + span;
          return [context, leading, x];
        },
        [{ until: 0 }] as any
      ),
      filter<Item>(([, test]) => test),
      map(([, , x]: Item) => x),
    ]);
  };
}

export function debounce<T>(
  t: number,
  { leading = true, trailing = false }
): (s: PushStream<T>) => PushStream<T> {
  if (trailing) {
    return debounceWithTrailing(t, leading);
  } else {
    if (leading) {
      return debounceLeading(t);
    } else {
      return take<any>(0);
    }
  }
}
