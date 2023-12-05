export const explosion = {
  lifetime: { min: 0.3, max: 0.5 },
  ease: [
    { s: 0, cp: 0.329, e: 0.548 },
    { s: 0.548, cp: 0.767, e: 0.876 },
    { s: 0.876, cp: 0.985, e: 1 },
  ],
  frequency: 0.01,
  particlesPerWave: 5,
  emitterLifetime: 0.1,
  maxParticles: 1000,
  addAtBack: true,
  behaviors: [
    {
      type: "alpha",
      config: {
        alpha: {
          list: [
            { time: 0, value: 1 },
            { time: 1, value: 0 },
          ],
        },
      },
    },
    {
      type: "moveSpeed",
      config: {
        speed: {
          list: [
            { time: 0, value: 500 },
            { time: 1, value: 50 },
          ],
        },
        minMult: 1,
      },
    },
    {
      type: "scale",
      config: {
        scale: {
          list: [
            { time: 0, value: 4 },
            { time: 1, value: 0.5 },
          ],
        },
        minMult: 0.7,
      },
    },
    {
      type: "color",
      config: {
        color: {
          list: [
            { time: 0, value: "#ffffff" },
            { time: 1, value: "#eeeeee" },
          ],
        },
      },
    },
    {
      type: "rotation",
      config: {
        accel: 0,
        minSpeed: 0,
        maxSpeed: 200,
        minStart: 0,
        maxStart: 360,
      },
    },
    { type: "spawnPoint" },
  ],
  emit: false,
  autoUpdate: true,
};

export const glowStars = {
  lifetime: { min: 0.5, max: 0.7 },
  ease: [
    { s: 0, cp: 0.329, e: 0.548 },
    { s: 0.548, cp: 0.767, e: 0.876 },
    { s: 0.876, cp: 0.985, e: 1 },
  ],
  frequency: 0.1,
  particlesPerWave: 6,
  emitterLifetime: 0.11,
  maxParticles: 100,
  addAtBack: true,
  behaviors: [
    {
      type: "alpha",
      config: {
        alpha: {
          list: [
            { time: 0, value: 1 },
            { time: 1, value: 0 },
          ],
        },
      },
    },
    {
      type: "movePath",
      config: {
        path: x => x * x * 0.02,
        speed: {
          list: [
            { time: 0, value: 210 },
            { time: 1, value: 30 },
          ],
        },
      },
    },
    {
      type: "scale",
      config: {
        scale: {
          list: [
            { time: 0, value: 0.6 },
            { time: 0.4, value: 1.5 },
            { time: 1, value: 0.3 },
          ],
        },
      },
    },
    {
      type: "spawnBurst",
      config: {
        start: 0,
        spacing: 60,
        distance: 20,
      },
    },
  ],
  emit: false,
  autoUpdate: true,
};

export function createParticlesConfig(config, texture) {
  const trueConfig = { ...config };

  if (texture) {
    if (!trueConfig.behaviors) trueConfig.behaviors = [];
    trueConfig.behaviors.push({
      type: Array.isArray(texture) ? "textureRandom" : "textureSingle",
      config: { texture },
    });
  }

  return trueConfig;
}
