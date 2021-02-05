import { PushStream, Cancel, EmitType, transfer } from "collection-query";
import {
  EmitForm,
  create,
  filter,
  scan,
  map,
  take,
} from "collection-query/push";

export function debounce<T>(
  t: number,
  option = { leading: true, trailing: false }
): (s: PushStream<T>) => PushStream<T> {
  const { leading, trailing } = option;
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

class Debounce<T> {
  constructor(span: number) {
    this.span = span;
    this._sleep = true;
  }

  startByLeading() {
    this._sleep = false;
    this._catchTrailing = false;
    return this.delay();
  }

  startByTrailing(x: T, tag: {}) {
    this._sleep = false;
    return this.pushTrailing(x, tag);
  }

  end() {
    this._sleep = true;
  }

  async pushTrailing(x: T, tag: {}) {
    this._catchTrailing = true;
    this._trailing = x;
    this._tag = tag;
    await this.delay();
    return this._tag;
  }

  popTrailing() {
    const x = this._trailing;
    this._trailing = null!;
    return x;
  }

  get sleep() {
    return this._sleep;
  }

  get catchTrailing() {
    return this._catchTrailing;
  }

  private delay() {
    return new Promise((r) => setTimeout(r, this.span));
  }

  private span: number;
  private _sleep: boolean;
  private _catchTrailing!: boolean;
  private _trailing!: T;
  private _tag!: {};
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
      let relay_emit!: EmitForm<T>;
      let _source_cancel: Cancel;
      const source_cancel = function () {
        _source_cancel();
      };

      const relay_emitter = create<T>((emit) => {
        relay_emit = emit;
        return source_cancel;
      });

      const cancel = relay_emitter(receiver, (c) => {
        if (expose) {
          expose(c);
        }
      });

      const debounce = new Debounce<T>(span);
      s(
        (t, x?) => {
          switch (t) {
            case EmitType.Next:
              if (debounce.sleep) {
                if (leading) {
                  (async () => {
                    await debounce.startByLeading();
                    if (!debounce.catchTrailing) {
                      debounce.end();
                    }
                  })();
                  relay_emit(t, x);
                } else {
                  (async () => {
                    const tag = {};
                    const current = await debounce.startByTrailing(x, tag);
                    if (tag === current) {
                      const x = debounce.popTrailing();
                      debounce.end();
                      relay_emit(t, x);
                    }
                  })();
                }
              } else {
                (async () => {
                  const tag = {};
                  const current = await debounce.pushTrailing(x, tag);
                  if (tag === current) {
                    const x = debounce.popTrailing();
                    debounce.end();
                    relay_emit(t, x);
                  }
                })();
              }
              break;
            case EmitType.Complete:
              if (!debounce.sleep && debounce.catchTrailing) {
                relay_emit(EmitType.Next, debounce.popTrailing());
              }
              relay_emit(t);
              break;
            case EmitType.Error:
              relay_emit(t, x);
              break;
          }
        },
        (c) => (_source_cancel = c)
      );

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
          const now = performance.now();
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
