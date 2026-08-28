const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo so edits in packages/* trigger a reload.
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Hierarchical lookup MUST stay enabled for pnpm.
//
// Expo's monorepo guide suggests `disableHierarchicalLookup = true`, but that
// advice assumes a hoisted (npm/yarn) layout where every transitive dependency
// ends up in one of the two directories above. pnpm instead keeps them in
// `node_modules/.pnpm/<pkg>/node_modules/`, reachable only by walking up from
// the importing file — so disabling the walk makes transitive deps such as
// `@expo/metro-runtime` unresolvable and the bundle fails outright.
config.resolver.disableHierarchicalLookup = false;

// 4. Follow pnpm's symlinks out of the store and into packages/*.
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
