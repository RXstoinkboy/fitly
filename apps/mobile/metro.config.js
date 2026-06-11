// const path = require('path');
// const { getDefaultConfig } = require('expo/metro-config');

// const projectRoot = __dirname;
// const workspaceRoot = path.resolve(projectRoot, '../..');

// const config = getDefaultConfig(projectRoot);

// // Required for npm workspaces: let Metro find packages hoisted to repo root.
// config.resolver.nodeModulesPaths = [
//   path.resolve(projectRoot, 'node_modules'),
//   path.resolve(workspaceRoot, 'node_modules'),
// ];

// // Force key Tamagui packages to resolve to a single copy at the workspace root.
// // Without this, duplicate instances break Tamagui's React Context (config not found).
// const tamaguiSingletons = ['@tamagui/core', '@tamagui/web', 'tamagui'];

// config.resolver.extraNodeModules = tamaguiSingletons.reduce((acc, pkg) => {
//   acc[pkg] = path.resolve(workspaceRoot, 'node_modules', pkg);
//   return acc;
// }, {});

// module.exports = config;

const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Destructure the default transformer and resolver to modify them
const { transformer, resolver } = config;

// 2. Configure the SVG transformer
config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
};

// 3. Update asset and source extensions for SVG support
config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
};

// 4. Required for npm workspaces: let Metro find packages hoisted to repo root.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 5. Force key Tamagui packages to resolve to a single copy at the workspace root.
const tamaguiSingletons = ['@tamagui/core', '@tamagui/web', 'tamagui'];

config.resolver.extraNodeModules = tamaguiSingletons.reduce((acc, pkg) => {
  acc[pkg] = path.resolve(workspaceRoot, 'node_modules', pkg);
  return acc;
}, {});

module.exports = config;
