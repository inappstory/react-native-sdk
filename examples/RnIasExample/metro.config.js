/* eslint-disable import/no-commonjs */
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const path = require("path");
const exclusionList = require("metro-config/src/defaults/exclusionList");
const escape = require("escape-string-regexp");
const pack = require("../../npm/react-native-ias/package.json");
/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import("metro-config").MetroConfig}
 */



// react-native-ias root directory
const rniasRoot = path.resolve(__dirname, "../../npm/react-native-ias/");

const modules = [
    "@react-navigation/native",
    "react-native-safe-area-context",
    "react-native-gesture-handler",
    "react-native-reanimated",
    ...Object.keys(pack.peerDependencies),
];

const nodeModulesPaths = [path.resolve(path.join(__dirname, './node_modules'))];


const config = {
    projectRoot: __dirname,
    watchFolders: [rniasRoot],

    // We need to make sure that only one version is loaded for peerDependencies
    // So we exclude them at the root, and alias them to the versions in example's node_modules
    resolver: {
        unstable_enableSymlinks: true,
        blockList: exclusionList(
            modules.map(
                m =>
                    new RegExp(`^${escape(path.join(rniasRoot, "node_modules", m))}\\/.*$`),
            ),
        ),

        extraNodeModules: modules.reduce((acc, name) => {
            acc[name] = path.join(__dirname, "node_modules", name);
            return acc;
        }, {}),
        nodeModulesPaths,
    },

    transformer: {
        getTransformOptions: async () => ({
            transform: {
                experimentalImportSupport: true,
                inlineRequires: true,
            },
        }),
    },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
