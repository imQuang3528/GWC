export type CrossWebviewEvent = {
  type: "hardwareBackPress";
  listener: (event: undefined) => boolean;
} /* | { ...new event here } */;

type CrossWebviewEventParam = CrossWebviewEvent extends infer U extends {
  type: string;
  listener: (event: any) => any;
}
  ? U extends U
    ? {
        type: U["type"];
        param: Parameters<U["listener"]>[0];
      }
    : never
  : never;

type CrossWebviewEventResult = CrossWebviewEvent extends infer U extends {
  type: string;
  listener: (event: any) => any;
}
  ? U extends U
    ? {
        type: U["type"];
        result: ReturnType<U["listener"]>[];
      }
    : never
  : never;

type CrossWebviewEventResultMap = {
  [T in CrossWebviewEventResult as T["type"]]: T["result"];
};

export type CrossWebviewMessage =
  | {
      type: "hide-header" | "show-header" | "exit";
      data: undefined;
    }
  | {
      type: "event-result";
      data: CrossWebviewEventResult;
    }
  | {
      type: "event-subcription-change";
      data: {
        type: CrossWebviewEvent["type"];
        count: number;
      };
    };

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
      eventListeners?: Map<
        CrossWebviewEvent["type"],
        {
          (...args: Parameters<CrossWebviewEvent["listener"]>): ReturnType<
            CrossWebviewEvent["listener"]
          >;
          [key: string]: any;
        }[]
      >;
      [key: string]: any;
      dispatchEvent?: <T extends CrossWebviewEventParam>(
        type: T["type"],
        data: T["param"]
      ) => CrossWebviewEventResultMap[T["type"]];
    };
  }
}

export const postMessageToNative = <T extends CrossWebviewMessage>(
  type: T["type"],
  data: T["data"]
) => {
  window.ReactNativeWebView?.postMessage(JSON.stringify({ type, data }));
};

export const addNativeEventListener = <T extends CrossWebviewEvent>(
  type: T["type"],
  listener: T["listener"],
  options?: { order: number }
) => {
  if (!window.ReactNativeWebView) return;
  if (!type || !listener) return;

  const order = options?.order ?? -Infinity;

  if (!window.ReactNativeWebView.eventListeners) {
    window.ReactNativeWebView.eventListeners = new Map();
  }
  const listenerMap = window.ReactNativeWebView.eventListeners;

  let listeners = listenerMap.get(type);
  if (!listeners) {
    listeners = [];
    listenerMap.set(type, listeners);
  }

  const listenerForMap = listener as (typeof listeners)[number];
  listenerForMap.order = order;
  listeners.push(listenerForMap);
  listeners.sort((a, b) => a.order - b.order);

  postMessageToNative("event-subcription-change", {
    type,
    count: listeners.length,
  });
};

export const removeNativeEventListener = <T extends CrossWebviewEvent>(
  type: T["type"],
  listener: T["listener"]
) => {
  if (!window.ReactNativeWebView) return;
  if (!type || !listener || !window.ReactNativeWebView.eventListeners) return;

  const listenerMap = window.ReactNativeWebView.eventListeners;
  const listeners = listenerMap.get(type);

  if (!listeners) return;

  listenerMap.set(
    type,
    listeners.filter(l => listener !== l)
  );

  postMessageToNative("event-subcription-change", {
    type,
    count: listeners.length,
  });
};

(function () {
  if (!window.ReactNativeWebView) return;

  window.ReactNativeWebView.dispatchEvent = <T extends CrossWebviewEventParam>(
    type: T["type"],
    data: T["param"]
  ) => {
    const dispatch = () => {
      const res: CrossWebviewEventResultMap[T["type"]][number][] = [];

      if (
        !window.ReactNativeWebView ||
        !type ||
        !window.ReactNativeWebView.eventListeners
      )
        return res;

      const listenerMap = window.ReactNativeWebView.eventListeners;
      const listeners = listenerMap.get(type);

      if (!listeners) return res;

      for (const listener of listeners) {
        res.push(listener(data));
      }

      return res;
    };

    const result = dispatch();
    postMessageToNative("event-result", {
      type,
      result,
    } as CrossWebviewEventResult);

    return result as CrossWebviewEventResultMap[T["type"]];
  };
})();
