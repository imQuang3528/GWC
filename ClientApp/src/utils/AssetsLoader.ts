import { Sound } from "@pixi/sound";
import FontFaceObserver from "fontfaceobserver";
import {
  Assets,
  BaseTexture,
  ISpritesheetData,
  Resource,
  Spritesheet,
  Texture,
  utils,
} from "pixi.js-legacy";

export type SpritesheetSource = LiteralObject<
  ISpritesheetData & {
    meta: ISpritesheetData["meta"] & { image: string };
  }
>;

export type TextureOf<T> = T extends string
  ? Texture<Resource>
  : T extends SpritesheetSource
  ? utils.Dict<Texture<Resource>>
  : undefined;

interface AssetSource<T> {
  [key: string]: T | AssetSource<T> | T[];
}

type AssetResult<T extends AssetSource<any>, U> = T extends AssetSource<infer V>
  ? {
      [K in keyof T]: T[K] extends V
        ? U
        : T[K] extends V[]
        ? U[]
        : T[K] extends AssetSource<V>
        ? U
        : never;
    }
  : never;

type TextureResult<T extends AssetSource<any>> = T extends AssetSource<infer V>
  ? {
      [K in keyof T]: T[K] extends V
        ? TextureOf<T[K]>
        : T[K] extends V[]
        ? TextureOf<T[K][0]>[]
        : T[K] extends AssetSource<V>
        ? TextureResult<T[K]>
        : never;
    }
  : never;

/**
 * An object wrapper that distinguish between normal `AssetSource` nested objects structure and literal objects as asset sources.
 * Wrap this around an asset source object will prevent it from being flattened in the parsing process
 */
export class LiteralObject<T> {
  data: T;
  constructor(obj: T) {
    this.data = obj;
  }
}

class AssetsLoader {
  static async loadTextures<T extends AssetSource<string | SpritesheetSource>>(
    textures: T
  ): Promise<TextureResult<T>> {
    const flattenTextures = this.flatten(textures);

    const textureNames = Object.keys(flattenTextures);
    for (const [name, texture] of Object.entries(flattenTextures)) {
      if (!Assets.get(name)) {
        if (typeof texture === "string") {
          // single texture
          Assets.add(name, texture);
        } else if (
          texture instanceof LiteralObject &&
          texture.data?.meta?.image
        ) {
          // a spritesheet
          Assets.add(name, texture.data.meta.image);
        }
      }
    }
    await Assets.load(textureNames);

    const texturesObj = Object.fromEntries(
      await Promise.all(
        Object.entries(flattenTextures).map(([name, texture]) =>
          this.loadTexture(name, texture)
        )
      )
    );

    return this.unflatten(texturesObj);
  }

  private static async loadTexture<
    K extends string,
    V extends string | SpritesheetSource,
  >(name: K, texture: V): Promise<[K, TextureOf<V>]> {
    if (typeof texture === "string") {
      return [name, Texture.from(name) as TextureOf<V>];
    } else {
      const spritesheet = new Spritesheet(BaseTexture.from(name), texture.data);
      await spritesheet.parse();

      return [name, spritesheet.textures as TextureOf<V>];
    }
  }

  static async loadSounds<T extends AssetSource<string>>(
    sounds: T
  ): Promise<AssetResult<T, Sound>> {
    const soundsObj = this.unflatten(
      Object.fromEntries(
        await Promise.all(
          Object.entries(this.flatten(sounds)).map(([name, sound]) =>
            this.loadSound(name, sound)
          )
        )
      )
    );

    return soundsObj;
  }

  private static async loadSound<K extends string, V extends string>(
    name: K,
    sound: V
  ): Promise<[K, Sound]> {
    if (!Assets.get(name)) Assets.add(name, sound);
    return [name, (await Assets.load(name)) as Sound];
  }

  static async loadFontFamilies<T extends AssetSource<string>>(
    fontFamilies: T
  ): Promise<T> {
    await Promise.all(
      Object.values(this.flatten(fontFamilies)).map(fontFamily =>
        new FontFaceObserver(fontFamily).load(null, 60000)
      )
    );

    return fontFamilies;
  }

  static async loadBitmapFonts<T extends AssetSource<string>>(
    bitmapFonts: T
  ): Promise<AssetResult<T, string>> {
    const fontsObj = this.unflatten(
      Object.fromEntries(
        await Promise.all(
          Object.entries(this.flatten(bitmapFonts)).map(([name, fontUrl]) =>
            this.loadBitmapFont(name, fontUrl)
          )
        )
      )
    );

    return fontsObj;
  }

  private static async loadBitmapFont<K extends string, V extends string>(
    name: K,
    fontUrl: V
  ): Promise<[K, string]> {
    if (!Assets.get(name)) Assets.add(name, fontUrl);
    return [name, (await Assets.load(name)).font as string];
  }

  static async loadImages<T extends AssetSource<string>>(
    images: T
  ): Promise<AssetResult<T, HTMLImageElement>> {
    const imgs = await Promise.all(
      Object.entries(this.flatten(images)).map(img => this.loadImage(img))
    );

    return this.unflatten(Object.fromEntries(imgs));
  }

  private static async loadImage(img: [string, string | undefined]) {
    return new Promise<[string, HTMLImageElement]>((resolve, reject) => {
      const imgObj = new Image();

      if (!img?.[1]) {
        resolve([img[0], imgObj]);
      } else {
        imgObj.onload = () => resolve([img[0], imgObj]);
        imgObj.onerror = err => reject(err);
        imgObj.src = img[1];

        // load in css
        imgObj.style.width = "0";
        imgObj.style.height = "0";
        imgObj.style.position = "absolute";
        imgObj.style.backgroundImage = `url("${img[1]}")`;

        document.body.appendChild(imgObj);
      }
    });
  }

  // TODO: Better type checking
  private static flatten(data: { [key: string]: any }) {
    const result: { [key: string]: any } = {};
    function recurse(cur: { [key: string]: any }, prop: string) {
      if (Object(cur) !== cur || cur instanceof LiteralObject) {
        result[prop] = cur;
      } else if (Array.isArray(cur)) {
        const l = cur.length;
        for (let i = 0; i < l; i++) recurse(cur[i], prop + "[" + i + "]");
        if (l === 0) result[prop] = [];
      } else {
        var isEmpty = true;
        for (const p in cur) {
          isEmpty = false;
          recurse(cur[p], prop ? prop + "." + p : p);
        }
        if (isEmpty && prop) result[prop] = {};
      }
    }
    recurse(data, "");
    return result;
  }

  // TODO: Better type checking
  private static unflatten(data: { [key: string]: any }) {
    if (Object(data) !== data || Array.isArray(data)) return data;
    const regex = /\.?([^.[\]]+)|\[(\d+)\]/g,
      resultholder: { [key: string]: any } = {};
    for (const p in data) {
      let cur = resultholder,
        prop = "",
        m;
      while ((m = regex.exec(p))) {
        cur = cur[prop] || (cur[prop] = m[2] ? [] : {});
        prop = m[2] || m[1];
      }
      cur[prop] = data[p];
    }
    return resultholder[""] || resultholder;
  }
}

export default AssetsLoader;
