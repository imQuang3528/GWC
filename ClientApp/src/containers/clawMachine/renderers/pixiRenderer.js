import * as PIXI from "pixi.js-legacy";
import Bounds from "matter-js/src/geometry/Bounds";
import Composite from "matter-js/src/body/Composite";
import Common from "matter-js/src/core/Common";
import Events from "matter-js/src/core/Events";
import Vector from "matter-js/src/geometry/Vector";
import { LinkedListContainer } from "@pixi/particle-emitter";

/**
 * The `Matter.RenderPixi` module is an example renderer using pixi.js.
 * See also `Matter.Render` for a canvas based renderer.
 *
 * @class RenderPixi
 */

const PixiRender = {};

export default PixiRender;

(function () {
  PixiRender._goodFps = 30;
  PixiRender._goodDelta = 1000 / 60;

  /**
   * Creates a new Pixi.js WebGL renderer
   * @method create
   * @param {object} options
   * @return {RenderPixi} A new renderer
   * @deprecated
   */
  PixiRender.create = function (options) {
    var defaults = {
      renderer: null,
      engine: null,
      element: null,
      canvas: null,
      mouse: null,
      pixiOptions: null,
      container: null,
      spriteContainer: null,
      frontParticleContainer: null,
      backParticleContainer: null,
      shouldDestroy: true,
      timing: {
        historySize: 60,
        delta: 0,
        deltaHistory: [],
        lastTime: 0,
        lastTimestamp: 0,
        lastElapsed: 0,
        timestampElapsed: 0,
        timestampElapsedHistory: [],
        engineDeltaHistory: [],
        engineElapsedHistory: [],
        elapsedHistory: [],
      },
      options: {
        width: 800,
        height: 600,
        pixelRatio: 1,
        background: "#14151f",
        wireframeBackground: "#14151f",
        hasBounds: !!options.bounds,
        enabled: true,
        wireframes: true,
        showSleeping: true,
        showDebug: false,
        showStats: false,
        showPerformance: false,
        showBounds: false,
        showVelocity: false,
        showCollisions: false,
        showSeparations: false,
        showAxes: false,
        showPositions: false,
        showAngleIndicator: false,
        showIds: false,
        showVertexNumbers: false,
        showConvexHulls: false,
        showInternalEdges: false,
        showMousePosition: false,
      },
      filters: [],
    };

    const render = Common.extend(defaults, options);
    const transparent =
      !render.options.wireframes && render.options.background === "transparent";

    // init pixi
    render.pixiOptions = {
      view: render.canvas,
      transparent: transparent,
      resolution:
        render.options.pixelRatio === "auto"
          ? Math.floor(window.devicePixelRatio)
          : render.options.pixelRatio || 1,
      autoDensity: true,
      backgroundColor: options.background,
      width: render.options.width,
      height: render.options.height,
      ...render.pixiOptions,
    };

    render.mouse = options.mouse;
    render.engine = options.engine;
    render.renderer =
      render.renderer || new PIXI.Application(render.pixiOptions);
    render.container = render.container || new PIXI.Container();
    render.spriteContainer = render.spriteContainer || new PIXI.Container();
    render.frontParticleContainer =
      render.frontParticleContainer || new LinkedListContainer();
    render.backParticleContainer =
      render.backParticleContainer || new LinkedListContainer();
    render.canvas = render.canvas || render.renderer.view;
    render.bounds = render.bounds || {
      min: {
        x: 0,
        y: 0,
      },
      max: {
        x: render.options.width,
        y: render.options.height,
      },
    };

    // for temporary back compatibility only
    render.controller = PixiRender;
    render.options.showBroadphase = false;

    // caches
    render.textures = {};
    render.sprites = {};
    render.primitives = {};

    // use a sprite batch for performance
    render.container.addChild(render.spriteContainer);
    render.renderer.stage.addChild(render.container);

    render.container.addChildAt(render.backParticleContainer, 0);
    render.container.addChildAt(render.frontParticleContainer, 2);

    // insert canvas
    if (Common.isElement(render.element)) {
      render.element.appendChild(render.canvas);
    }

    // prevent menus on canvas
    render.canvas.oncontextmenu = function () {
      return false;
    };
    render.canvas.onselectstart = function () {
      return false;
    };

    // filters
    render.filters.forEach(
      filter => (filter.resolution = render.pixiOptions.resolution)
    );
    render.spriteContainer.filters = render.filters;

    // For debugging tool: https://chrome.google.com/webstore/detail/pixijs-devtools/aamddddknhcagpehecnhphigffljadon
    // eslint-disable-next-line no-undef
    globalThis.__PIXI_APP__ = render.renderer;

    return render;
  };

  /**
   * Continuously updates the render canvas.
   * @method run
   * @param {render} render
   * @deprecated
   */
  PixiRender.run = function (render) {
    render.renderer.ticker.add(tick => {
      const time = tick / PIXI.Ticker.targetFPMS;

      _updateTiming(render, time);

      PixiRender.world(render, time);

      if (render.options.showStats || render.options.showDebug) {
        PixiRender.stats(render, render.context, time);
      }

      if (render.options.showPerformance || render.options.showDebug) {
        PixiRender.performance(render, render.context, time);
      }
    });
  };

  /**
   * Ends execution of `Render.run` on the given `render`, by canceling the animation frame request event loop.
   * @method stop
   * @param {render} render
   * @deprecated
   */
  PixiRender.stop = function (render) {
    render.renderer.ticker.stop();
    render.renderer.destroy();
  };

  /**
   * Clears the scene graph
   * @method clear
   * @param {RenderPixi} render
   * @deprecated
   */
  PixiRender.clear = function (render) {
    var container = render.container,
      spriteContainer = render.spriteContainer;

    // clear stage container
    while (container.children[0]) {
      container.removeChild(container.children[0]);
    }

    // clear sprite batch
    while (spriteContainer.children[0]) {
      spriteContainer.removeChild(spriteContainer.children[0]);
    }

    var bgSprite = render.sprites["bg-0"];

    // clear caches
    render.textures = {};
    render.sprites = {};
    render.primitives = {};

    // set background sprite
    render.sprites["bg-0"] = bgSprite;
    if (bgSprite) container.addChildAt(bgSprite, 0);

    // add back particle back into container
    container.addChild(render.backParticleContainer);

    // add sprite batch back into container
    container.addChild(render.spriteContainer);

    // add front particle back into container
    container.addChild(render.frontParticleContainer);

    // reset background state
    render.currentBackground = null;

    // reset bounds transforms
    container.scale.set(1, 1);
    container.position.set(0, 0);
  };

  /**
   * Sets the background of the canvas
   * @method setBackground
   * @param {RenderPixi} render
   * @param {string} background
   * @deprecated
   */
  PixiRender.setBackground = function (render, background) {
    if (render.currentBackground !== background) {
      var isColor = background.indexOf && background.indexOf("#") !== -1,
        bgSprite = render.sprites["bg-0"];

      if (isColor) {
        // if solid background color
        var color = background;
        render.renderer.backgroundColor = color;

        // remove background sprite if existing
        if (bgSprite) render.container.removeChild(bgSprite);
      } else {
        // initialise background sprite if needed
        if (!bgSprite) {
          var texture = _getTexture(render, background);

          bgSprite = render.sprites["bg-0"] = new PIXI.Sprite(texture);
          bgSprite.position.x = 0;
          bgSprite.position.y = 0;
          bgSprite.width = render.options.width;
          bgSprite.height = render.options.height;
          render.container.addChildAt(bgSprite, 0);
        }
      }

      render.currentBackground = background;
    }
  };

  /**
   * Description
   * @method world
   * @param {engine} engine
   * @deprecated
   */
  PixiRender.world = function (render, time) {
    var startTime = Common.now(),
      engine = render.engine,
      timing = render.timing,
      world = engine.world,
      renderer = render.renderer,
      container = render.container,
      options = render.options,
      bodies = Composite.allBodies(world),
      allConstraints = Composite.allConstraints(world),
      constraints = [],
      i;

    var event = {
      timestamp: engine.timing.timestamp,
    };

    Events.trigger(render, "beforeRender", event);

    bodies.sort((a, b) => {
      const zIndexA =
        a.render && typeof a.render.zIndex !== "undefined"
          ? a.render.zIndex
          : 0;
      const zIndexB =
        b.render && typeof b.render.zIndex !== "undefined"
          ? b.render.zIndex
          : 0;
      return zIndexA - zIndexB;
    });

    if (options.wireframes) {
      PixiRender.setBackground(render, options.wireframeBackground);
    } else {
      PixiRender.setBackground(render, options.background);
    }

    Events.trigger(render, "beginRender", event);

    // handle bounds
    var boundsWidth = render.bounds.max.x - render.bounds.min.x,
      boundsHeight = render.bounds.max.y - render.bounds.min.y,
      boundsScaleX = boundsWidth / render.options.width,
      boundsScaleY = boundsHeight / render.options.height;

    if (options.hasBounds) {
      // Hide bodies that are not in view
      for (i = 0; i < bodies.length; i++) {
        var body = bodies[i];
        body.render.sprite.visible = Bounds.overlaps(
          body.bounds,
          render.bounds
        );
      }

      // filter out constraints that are not in view
      for (i = 0; i < allConstraints.length; i++) {
        var constraint = allConstraints[i],
          bodyA = constraint.bodyA,
          bodyB = constraint.bodyB,
          pointAWorld = constraint.pointA,
          pointBWorld = constraint.pointB;

        if (bodyA) pointAWorld = Vector.add(bodyA.position, constraint.pointA);
        if (bodyB) pointBWorld = Vector.add(bodyB.position, constraint.pointB);

        if (!pointAWorld || !pointBWorld) continue;

        if (
          Bounds.contains(render.bounds, pointAWorld) ||
          Bounds.contains(render.bounds, pointBWorld)
        )
          constraints.push(constraint);
      }

      // transform the view
      container.scale.set(1 / boundsScaleX, 1 / boundsScaleY);
      container.position.set(
        -render.bounds.min.x * (1 / boundsScaleX),
        -render.bounds.min.y * (1 / boundsScaleY)
      );
    } else {
      constraints = allConstraints;
    }

    for (i = 0; i < bodies.length; i++) PixiRender.body(render, bodies[i]);

    // TODO: render more missing debug information

    for (i = 0; i < constraints.length; i++)
      PixiRender.constraint(render, constraints[i]);

    // renderer.render(container);

    Events.trigger(render, "afterRender", event);

    // log the time elapsed computing this update
    timing.lastElapsed = Common.now() - startTime;
  };

  /**
   * Description
   * @method constraint
   * @param {engine} engine
   * @param {constraint} constraint
   * @deprecated
   */
  PixiRender.constraint = function (render, constraint) {
    var engine = render.engine,
      bodyA = constraint.bodyA,
      bodyB = constraint.bodyB,
      container = render.container,
      constraintRender = constraint.render,
      primitiveId = "c-" + constraint.id,
      c = render.primitives[primitiveId];
    var start, end;

    // don't render if constraint does not have two end points
    if (!constraintRender.visible || !constraint.pointA || !constraint.pointB) {
      if (c) {
        c.clear();
        c.visible = false;
      }
      return;
    }

    // initialise constraint primitive if not existing
    if (!c) c = render.primitives[primitiveId] = new PIXI.Graphics();
    c.visible = true;

    // add to scene graph if not already there
    if (Common.indexOf(container.children, c) === -1) container.addChild(c);

    if (bodyA) {
      start = Vector.add(bodyA.position, constraint.pointA);
    } else {
      start = constraint.pointA;
    }

    c.lineStyle(constraintRender.lineWidth, constraintRender.strokeStyle, 1);

    if (constraint.render.type === "pin") {
      c.beginFill("transparent");
      c.drawCircle(start.x, start.y, 3, 0);
      c.endFill();
    } else {
      if (bodyB) {
        end = Vector.add(bodyB.position, constraint.pointB);
      } else {
        end = constraint.pointB;
      }

      c.beginFill("transparent");
      c.moveTo(start.x, start.y);

      if (constraint.render.type === "spring") {
        var delta = Vector.sub(end, start),
          normal = Vector.perp(Vector.normalise(delta)),
          coils = Math.ceil(Common.clamp(constraint.length / 5, 12, 20)),
          offset;

        for (var j = 1; j < coils; j += 1) {
          offset = j % 2 === 0 ? 1 : -1;

          c.lineTo(
            start.x + delta.x * (j / coils) + normal.x * offset * 4,
            start.y + delta.y * (j / coils) + normal.y * offset * 4
          );
        }
      }

      c.lineTo(end.x, end.y);
      c.endFill();
    }

    if (constraint.render.lineWidth) {
      c.beginFill(constraint.render.strokeStyle);
      c.endFill();
    }

    if (constraint.render.anchors) {
      c.beginFill(constraint.render.strokeStyle);
      c.arc(start.x, start.y, 3, 0, 2 * Math.PI);
      c.endFill();
      c.beginFill(constraint.render.strokeStyle);
      c.arc(end.x, end.y, 3, 0, 2 * Math.PI);
      c.endFill();
    }
  };

  /**
   * Description
   * @method body
   * @param {engine} engine
   * @param {body} body
   * @deprecated
   */
  PixiRender.body = function (render, body) {
    var engine = render.engine,
      bodyRender = body.render;

    if (bodyRender.sprite && bodyRender.sprite.texture) {
      var spriteId = "b-" + body.id,
        sprite = render.sprites[spriteId],
        spriteContainer = render.spriteContainer;

      if (!bodyRender.visible) {
        if (sprite) sprite.visible = false;
        return;
      }

      if (!sprite)
        sprite = render.sprites[spriteId] = _createBodySprite(render, body);
      sprite.visible = true;

      // add to scene graph if not already there
      if (Common.indexOf(spriteContainer.children, sprite) === -1)
        spriteContainer.addChild(sprite);

      // update body sprite
      sprite.position.x = body.position.x;
      sprite.position.y = body.position.y;
      sprite.rotation = body.angle + (bodyRender.sprite.rotation || 0);
      sprite.scale.x = bodyRender.sprite.xScale || 1;
      sprite.scale.y = bodyRender.sprite.yScale || 1;
      sprite.filters = bodyRender.sprite.filters;
    } else {
      var primitiveId = "b-" + body.id,
        primitive = render.primitives[primitiveId],
        container = render.container;

      if (!bodyRender.visible) {
        if (primitive) primitive.visible = false;
        return;
      }

      // initialise body primitive if not existing
      if (!primitive) {
        primitive = render.primitives[primitiveId] = _createBodyPrimitive(
          render,
          body
        );
        primitive.initialAngle = body.angle;
      }
      primitive.visible = true;

      // add to scene graph if not already there
      if (Common.indexOf(container.children, primitive) === -1)
        container.addChild(primitive);

      // update body primitive
      primitive.position.x = body.position.x;
      primitive.position.y = body.position.y;
      primitive.rotation = body.angle - primitive.initialAngle;
    }
  };

  /**
   * Creates a body sprite
   * @method _createBodySprite
   * @private
   * @param {RenderPixi} render
   * @param {body} body
   * @return {PIXI.Sprite} sprite
   * @deprecated
   */
  var _createBodySprite = function (render, body) {
    var bodyRender = body.render,
      texturePath = bodyRender.sprite.texture,
      texture = _getTexture(render, texturePath),
      sprite = new PIXI.Sprite(texture);

    sprite.anchor.x = body.render.sprite.xOffset;
    sprite.anchor.y = body.render.sprite.yOffset;

    return sprite;
  };

  /**
   * Creates a body primitive
   * @method _createBodyPrimitive
   * @private
   * @param {RenderPixi} render
   * @param {body} body
   * @return {PIXI.Graphics} graphics
   * @deprecated
   */
  var _createBodyPrimitive = function (render, body) {
    var bodyRender = body.render,
      options = render.options,
      primitive = new PIXI.Graphics(),
      fillStyle = bodyRender.fillStyle,
      strokeStyle = bodyRender.strokeStyle,
      strokeStyleIndicator = bodyRender.strokeStyle,
      strokeStyleWireframe = "#bbb",
      strokeStyleWireframeIndicator = "#CD5C5C",
      part;

    primitive.clear();

    // handle compound parts
    for (var k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
      part = body.parts[k];

      if (!options.wireframes) {
        primitive.beginFill(fillStyle, 1);
        primitive.lineStyle(bodyRender.lineWidth, strokeStyle, 1);
      } else {
        primitive.beginFill(0, 0);
        primitive.lineStyle(1, strokeStyleWireframe, 1);
      }

      primitive.moveTo(
        part.vertices[0].x - body.position.x,
        part.vertices[0].y - body.position.y
      );

      for (var j = 1; j < part.vertices.length; j++) {
        primitive.lineTo(
          part.vertices[j].x - body.position.x,
          part.vertices[j].y - body.position.y
        );
      }

      primitive.lineTo(
        part.vertices[0].x - body.position.x,
        part.vertices[0].y - body.position.y
      );

      primitive.endFill();

      // angle indicator
      if (options.showAngleIndicator || options.showAxes) {
        primitive.beginFill(0, 0);

        if (options.wireframes) {
          primitive.lineStyle(1, strokeStyleWireframeIndicator, 1);
        } else {
          primitive.lineStyle(1, strokeStyleIndicator);
        }

        primitive.moveTo(
          part.position.x - body.position.x,
          part.position.y - body.position.y
        );
        primitive.lineTo(
          (part.vertices[0].x + part.vertices[part.vertices.length - 1].x) / 2 -
            body.position.x,
          (part.vertices[0].y + part.vertices[part.vertices.length - 1].y) / 2 -
            body.position.y
        );

        primitive.endFill();
      }
    }

    return primitive;
  };

  /**
   * Gets the requested texture (a PIXI.Texture) via its path
   * @method _getTexture
   * @private
   * @param {RenderPixi} render
   * @param {string} imagePath
   * @return {PIXI.Texture} texture
   * @deprecated
   */
  var _getTexture = function (render, imagePath) {
    var texture =
      render.textures[
        typeof imagePath === "string" ? imagePath : imagePath.textureCacheIds[1]
      ];

    if (!texture)
      texture = render.textures[imagePath] =
        typeof imagePath === "string"
          ? PIXI.Texture.from(imagePath)
          : imagePath;

    return texture;
  };
})();

/**
 * Updates render timing.
 * @method _updateTiming
 * @private
 * @param {render} render
 * @param {number} time
 */
var _updateTiming = function (render, time) {
  var engine = render.engine,
    timing = render.timing,
    historySize = timing.historySize,
    timestamp = engine.timing.timestamp;

  timing.delta = time - timing.lastTime || PixiRender._goodDelta;
  timing.lastTime = time;

  timing.timestampElapsed = timestamp - timing.lastTimestamp || 0;
  timing.lastTimestamp = timestamp;

  timing.deltaHistory.unshift(timing.delta);
  timing.deltaHistory.length = Math.min(
    timing.deltaHistory.length,
    historySize
  );

  timing.engineDeltaHistory.unshift(engine.timing.lastDelta);
  timing.engineDeltaHistory.length = Math.min(
    timing.engineDeltaHistory.length,
    historySize
  );

  timing.timestampElapsedHistory.unshift(timing.timestampElapsed);
  timing.timestampElapsedHistory.length = Math.min(
    timing.timestampElapsedHistory.length,
    historySize
  );

  timing.engineElapsedHistory.unshift(engine.timing.lastElapsed);
  timing.engineElapsedHistory.length = Math.min(
    timing.engineElapsedHistory.length,
    historySize
  );

  timing.elapsedHistory.unshift(timing.lastElapsed);
  timing.elapsedHistory.length = Math.min(
    timing.elapsedHistory.length,
    historySize
  );
};

/**
 * Renders statistics about the engine and world useful for debugging.
 * @private
 * @method stats
 * @param {render} render
 * @param {RenderingContext} context
 * @param {Number} time
 */
PixiRender.stats = function (render, context, time) {
  var engine = render.engine,
    world = engine.world,
    bodies = Composite.allBodies(world),
    parts = 0,
    width = 55,
    height = 44,
    x = 0,
    y = 0;

  // count parts
  for (var i = 0; i < bodies.length; i += 1) {
    parts += bodies[i].parts.length;
  }

  // sections
  var sections = {
    Part: parts,
    Body: bodies.length,
    Cons: Composite.allConstraints(world).length,
    Comp: Composite.allComposites(world).length,
    Pair: engine.pairs.list.length,
  };

  // background
  context.fillStyle = "#0e0f19";
  context.fillRect(x, y, width * 5.5, height);

  context.font = "12px Arial";
  context.textBaseline = "top";
  context.textAlign = "right";

  // sections
  for (var key in sections) {
    var section = sections[key];
    // label
    context.fillStyle = "#aaa";
    context.fillText(key, x + width, y + 8);

    // value
    context.fillStyle = "#eee";
    context.fillText(section, x + width, y + 26);

    x += width;
  }
};

/**
 * Renders engine and render performance information.
 * @private
 * @method performance
 * @param {render} render
 * @param {RenderingContext} context
 */
PixiRender.performance = function (render, context) {
  var engine = render.engine,
    timing = render.timing,
    deltaHistory = timing.deltaHistory,
    elapsedHistory = timing.elapsedHistory,
    timestampElapsedHistory = timing.timestampElapsedHistory,
    engineDeltaHistory = timing.engineDeltaHistory,
    engineElapsedHistory = timing.engineElapsedHistory,
    lastEngineDelta = engine.timing.lastDelta;

  var deltaMean = _mean(deltaHistory),
    elapsedMean = _mean(elapsedHistory),
    engineDeltaMean = _mean(engineDeltaHistory),
    engineElapsedMean = _mean(engineElapsedHistory),
    timestampElapsedMean = _mean(timestampElapsedHistory),
    rateMean = timestampElapsedMean / deltaMean || 0,
    fps = 1000 / deltaMean || 0;

  var graphHeight = 4,
    gap = 12,
    width = 60,
    height = 34,
    x = 10,
    y = 69;

  // background
  context.fillStyle = "#0e0f19";
  context.fillRect(0, 50, gap * 4 + width * 5 + 22, height);

  // show FPS
  PixiRender.status(
    context,
    x,
    y,
    width,
    graphHeight,
    deltaHistory.length,
    Math.round(fps) + " fps",
    fps / PixiRender._goodFps,
    function (i) {
      return deltaHistory[i] / deltaMean - 1;
    }
  );

  // show engine delta
  PixiRender.status(
    context,
    x + gap + width,
    y,
    width,
    graphHeight,
    engineDeltaHistory.length,
    lastEngineDelta.toFixed(2) + " dt",
    PixiRender._goodDelta / lastEngineDelta,
    function (i) {
      return engineDeltaHistory[i] / engineDeltaMean - 1;
    }
  );

  // show engine update time
  PixiRender.status(
    context,
    x + (gap + width) * 2,
    y,
    width,
    graphHeight,
    engineElapsedHistory.length,
    engineElapsedMean.toFixed(2) + " ut",
    1 - engineElapsedMean / PixiRender._goodFps,
    function (i) {
      return engineElapsedHistory[i] / engineElapsedMean - 1;
    }
  );

  // show render time
  PixiRender.status(
    context,
    x + (gap + width) * 3,
    y,
    width,
    graphHeight,
    elapsedHistory.length,
    elapsedMean.toFixed(2) + " rt",
    1 - elapsedMean / PixiRender._goodFps,
    function (i) {
      return elapsedHistory[i] / elapsedMean - 1;
    }
  );

  // show effective speed
  PixiRender.status(
    context,
    x + (gap + width) * 4,
    y,
    width,
    graphHeight,
    timestampElapsedHistory.length,
    rateMean.toFixed(2) + " x",
    rateMean * rateMean * rateMean,
    function (i) {
      return (timestampElapsedHistory[i] / deltaHistory[i] / rateMean || 0) - 1;
    }
  );
};

/**
 * Returns the mean value of the given numbers.
 * @method _mean
 * @private
 * @param {Number[]} values
 * @return {Number} the mean of given values
 */
var _mean = function (values) {
  var result = 0;
  for (var i = 0; i < values.length; i += 1) {
    result += values[i];
  }
  return result / values.length || 0;
};

/**
 * Renders a label, indicator and a chart.
 * @private
 * @method status
 * @param {RenderingContext} context
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} count
 * @param {string} label
 * @param {string} indicator
 * @param {function} plotY
 */
PixiRender.status = function (
  context,
  x,
  y,
  width,
  height,
  count,
  label,
  indicator,
  plotY
) {
  // background
  context.strokeStyle = "#888";
  context.fillStyle = "#444";
  context.lineWidth = 1;
  context.fillRect(x, y + 7, width, 1);

  // chart
  context.beginPath();
  context.moveTo(x, y + 7 - height * Common.clamp(0.4 * plotY(0), -2, 2));
  for (var i = 0; i < width; i += 1) {
    context.lineTo(
      x + i,
      y + 7 - (i < count ? height * Common.clamp(0.4 * plotY(i), -2, 2) : 0)
    );
  }
  context.stroke();

  // indicator
  context.fillStyle =
    "hsl(" + Common.clamp(25 + 95 * indicator, 0, 120) + ",100%,60%)";
  context.fillRect(x, y - 7, 4, 4);

  // label
  context.font = "12px Arial";
  context.textBaseline = "middle";
  context.textAlign = "right";
  context.fillStyle = "#eee";
  context.fillText(label, x + width, y - 5);
};
