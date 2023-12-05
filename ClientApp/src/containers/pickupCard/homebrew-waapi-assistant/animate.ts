import { AnimationControls, createAnimationControls } from "./controls";
import { StaggerFunction } from "./stagger";

export type AdvancedAnimationOptions = Omit<
  KeyframeAnimationOptions,
  "delay" | "endDelay"
> & {
  delay?: number | StaggerFunction;
  endDelay?: number | StaggerFunction;

  /**
   * If persist the animation, the style will be committed and the animation will be deleted.
   * This should be preferred, but if another animation is still running and you don't want to interrupt it,
   * set persist to `false`
   */
  persist?: boolean;
};

export type Keyframes =
  | Keyframe[]
  | PropertyIndexedKeyframes
  | ((index: number) => Keyframe[] | PropertyIndexedKeyframes);

export type AnimationWithMetadata = Animation & {
  element: HTMLElement;
  keyframes: Keyframes;
};

const DEFAULT_CONFIG: AdvancedAnimationOptions = {
  fill: "forwards",
  easing: "ease-in-out",
  persist: true,
};

/**
 * animate a single HTML element or an array of HTML elements
 * with a very sane default configs
 * and a bunch of assisting features (hence the name homebrew-waapi-*assistant*)
 *
 * @param elem the element(s) to animate
 * @param keyframes the keyframe array
 * @param config the animation config object, or duration if number is passed
 * @returns the animation controls
 */
export const animate = (
  elem: HTMLElement | HTMLElement[],
  keyframes: Keyframes,
  config?: number | AdvancedAnimationOptions
): AnimationControls => {
  const elems = Array.isArray(elem) ? elem : [elem];
  const animations: AnimationWithMetadata[] = [];
  const configObj: AdvancedAnimationOptions = {
    ...DEFAULT_CONFIG,
    ...normalizeAnimateConfig(config),
  };

  // Pre-calcutate all keyframes => reduce computation time when setup animations => animations will be more synchronized
  const formattedKeyframes = elems.map((elem, i) =>
    addImplicitStartKeyframe(
      elem,
      formatKeyframes(
        elem,
        typeof keyframes === "function" ? keyframes(i) : keyframes,
        i
      )
    )
  );

  elems.forEach((elem, i) => {
    const animation = elem.animate(formattedKeyframes[i], {
      ...configObj,
      delay: normalizeDelayValue(configObj.delay, i, elems.length),
      endDelay: normalizeDelayValue(configObj.endDelay, i, elems.length),
    }) as AnimationWithMetadata;
    animation.element = elem;
    animation.keyframes = formattedKeyframes[i];

    animation.addEventListener("finish", () => {
      if (configObj.persist) {
        stopAnimation(animation);
      }
    });

    animations.push(animation);
  });

  return createAnimationControls(animations);
};

/**
 * Normalize your animate config parameter to a config object
 * @param config the config parameter to normalize
 * @returns the config object
 */
export const normalizeAnimateConfig = (
  config: number | AdvancedAnimationOptions | undefined
): AdvancedAnimationOptions | undefined =>
  typeof config === "number" ? { duration: config } : config;

/**
 * Quick function to normalize the delay value that supports StaggerFunction
 */
const normalizeDelayValue = (
  delay: number | StaggerFunction | undefined,
  index: number,
  length: number
): number | undefined =>
  typeof delay === "function" ? delay(index, length) : delay;

/**
 * Commit the current animation style and cancel the animation
 *
 * @param animation
 */
export const stopAnimation = (animation: AnimationWithMetadata) => {
  if (typeof animation.commitStyles === "function") {
    animation.commitStyles();
  } else {
    // Polyfill for older browsers without `commitStyles` function
    const elemStyle = window.getComputedStyle(animation.element);
    for (const property of getKeyframeProperties(animation.keyframes)) {
      if (elemStyle.hasOwnProperty(property)) {
        const style = elemStyle[property as keyof typeof elemStyle];
        if (style) animation.element.style.setProperty(property, style + "");
      }
    }
  }

  animation.cancel();
};

/**
 * Get all properties of keyframes
 */
const getKeyframeProperties = (keyframes: Keyframes): string[] => {
  if (Array.isArray(keyframes)) {
    const properties = new Set<string>();
    for (const keyframe of keyframes) {
      for (const property in keyframe) {
        properties.add(property);
      }
    }

    return Array.from(properties);
  } else {
    return Object.keys(keyframes);
  }
};

function checkImplicitKeyframeSupported() {
  const elem = document.createElement("div");
  try {
    elem.animate({ transform: "translateX(100px)" });
  } catch (e) {
    if (
      (e + "").toLowerCase().includes("partial keyframes are not supported")
    ) {
      elem.remove();
      return false;
    }
  }

  elem.remove();
  return true;
}
const isImplicitKeyframeSupported = checkImplicitKeyframeSupported();

/**
 * Polyfill for older browsers that don't support implicit start keyframe
 *
 * @param elem The element that is about to be animated
 * @param keyframes The animation keyframes
 * @returns The animation keyframes with start keyframe added
 */
const addImplicitStartKeyframe = <
  K extends Keyframe[] | PropertyIndexedKeyframes
>(
  elem: HTMLElement,
  keyframes: K
): K => {
  if (!isImplicitKeyframeSupported) {
    const style = window.getComputedStyle(elem);

    if (Array.isArray(keyframes)) {
      if (keyframes.length === 1) {
        const startKeyframe: Keyframe = {};
        for (const property in keyframes[0]) {
          if (property in style) {
            startKeyframe[property] = style[property as keyof typeof style] as
              | string
              | number
              | null
              | undefined;
          }
        }

        keyframes.unshift(startKeyframe);
      }
    } else {
      for (const property in keyframes) {
        if (property in style) {
          if (!Array.isArray(keyframes[property])) {
            keyframes[property] = [keyframes[property]] as K[Extract<
              keyof K,
              string
            >];
          }

          const values = keyframes[property] as string[] | (number | null)[]; // just believe in my code

          if (values.length === 1) {
            values.unshift(style[property as keyof typeof style] as never);
          }
        }
      }
    }
  }

  return keyframes;
};

/**
 * Format the keyframes using metadata
 *
 * @param elem the HTML element that uses the keyframes
 * @param keyframes the keyframes theirselves
 * @param elemIndex the index of the HTML element in the element array
 * @returns the formatted keyframes
 */
const formatKeyframes = <K extends Keyframe[] | PropertyIndexedKeyframes>(
  elem: HTMLElement,
  keyframes: K,
  elemIndex: number
): K => {
  if (Array.isArray(keyframes)) {
    const formattedKeyframes: Keyframe[] = [];

    keyframes.forEach((keyframe, i) => {
      const formattedKeyframe = { ...keyframe };
      Object.entries(formattedKeyframe).forEach(([key, value]) => {
        formattedKeyframe[key] = formatProperty(
          key,
          value,
          elem,
          elemIndex,
          i,
          replaceIdx => formattedKeyframes[replaceIdx][key]
        );
      });

      formattedKeyframes.push(formattedKeyframe);
    });

    return formattedKeyframes as K;
  } else {
    const formattedKeyframes: PropertyIndexedKeyframes = { ...keyframes };
    Object.entries(formattedKeyframes).forEach(([key, values]) => {
      if (Array.isArray(values)) {
        const formattedValues: (string | number | null)[] = [];
        values.forEach((value, i) =>
          formattedValues.push(
            formatProperty(
              key,
              value,
              elem,
              elemIndex,
              i,
              replaceIdx => formattedValues[replaceIdx]
            ) ?? null
          )
        );

        formattedKeyframes[key] = formattedValues as
          | string[]
          | (number | null)[]; // just believe in my code
      } else {
        formattedKeyframes[key] = formatProperty(
          key,
          values,
          elem,
          elemIndex,
          0,
          () => null
        );
      }
    });

    return formattedKeyframes as K;
  }
};

/**
 * Format a keyframe property
 * Currently only support transform and opacity properties
 *
 * @param propertyKey the keyframe property key
 * @param property the keyframe property value
 * @param elem the HTML element that owns the property
 * @param elemIndex the index of the HTML element in the element array
 * @param index the index of the property in the transform array
 * @param getReplaceProperty function to get the replace transform for the `%k_` tags
 * @returns the formatted property
 */
const formatProperty = (
  propertyKey: string,
  property: string | number | null | undefined,
  elem: HTMLElement,
  elemIndex: number,
  index: number,
  getReplaceProperty: (replaceIdx: number) => string | number | null | undefined
): string | number | null | undefined => {
  switch (propertyKey) {
    case "transform":
      return typeof property === "string"
        ? formatTransform(property, elem, elemIndex, index, i => {
            const res = getReplaceProperty(i);
            return typeof res === "number" ? res + "" : res;
          })
        : property;
    case "opacity":
      return typeof property === "string" || typeof property === "number"
        ? formatOpacity(property, elem, index, getReplaceProperty)
        : property;
    default:
      return property;
  }
};

/**
 * Format a transform keyframe using a bunch of metadata via tags
 * Currently supported tags are:
 *  - `%s`: the start/current transform style of the element.
 *  - `%i`: the index of the element in the element array.
 *  - `%k_`: the formatted tranform style of the keyframe _th in the current keyframe array.
 * If _ is greater or equals to the current index of the transform style then the tag will be ignored.
 *  - `%k_^`: the formatted tranform style of the keyframe _th place
 * from the current transform style up to the start of the keyframe array.
 * If _ is 0 or greater than the current index of the transform style then the tag will be ignored.
 *
 * TODO: Support `%()` - the pre calculate tag without using the calc() CSS function
 *
 * @param transform the transform keyframe
 * @param elem the HTML element that owns the transform
 * @param elemIndex the index of the HTML element in the element array
 * @param index the index of the transform in the transform array
 * @param getReplaceTransform function to get the replace transform for the `%k_` tags
 * @returns the formatted transform
 */
const formatTransform = (
  transform: string,
  elem: HTMLElement,
  elemIndex: number,
  index: number,
  getReplaceTransform: (replaceIdx: number) => string | null | undefined
): string => {
  const a = transform
    .replaceAll("%s", getComputedStyle(elem).transform)
    .replaceAll("%i", elemIndex + "")
    .replaceAll(/%k(\d+)(\^?)/g, (_, value, relative) => {
      let replaceIdx = Number(value);
      if (relative === "^") {
        replaceIdx = index - replaceIdx;
      }

      if (replaceIdx >= 0 && replaceIdx < index) {
        const replaceTransform = getReplaceTransform(replaceIdx);
        if (typeof replaceTransform === "string") return replaceTransform;
      }

      return "";
    });
  return a;
};

/**
 * Format a opacity keyframe using a bunch of metadata via tags
 * Currently supported tags are:
 *  - `%s`: the start/current opacity style of the element.
 *  - `%k_`: the formatted tranform style of the keyframe _th in the current keyframe array.
 * If _ is greater or equals to the current index of the opacity style then the tag will be ignored.
 *  - `%k_^`: the formatted tranform style of the keyframe _th place
 * from the current opacity style up to the start of the keyframe array.
 * If _ is 0 or greater than the current index of the opacity style then the tag will be ignored.
 *
 * @param opacity the opacity keyframe
 * @param elem the HTML element that owns the opacity
 * @param index the index of the opacity in the opacity array
 * @param getReplaceOpacity function to get the replace opacity for the `%k_` tags
 * @returns the formatted opacity
 */
const formatOpacity = (
  opacity: string | number,
  elem: HTMLElement,
  index: number,
  getReplaceOpacity: (replaceIdx: number) => string | number | null | undefined
): string => {
  if (typeof opacity === "string") {
    if (opacity === "%s") return getComputedStyle(elem).opacity;

    const matchK = /^%k(\d+)(\^?)$/.exec(opacity);
    if (matchK) {
      let replaceIdx = Number(matchK[1]);
      const relative = matchK[2] === "^";
      if (relative) {
        replaceIdx = index - replaceIdx;
      }

      if (replaceIdx >= 0 && replaceIdx < index) {
        const replaceOpacity = getReplaceOpacity(replaceIdx);
        if (replaceOpacity !== null && replaceOpacity !== undefined)
          return replaceOpacity + "";
      }
    }
  }

  return opacity + "";
};
