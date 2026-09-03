const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Gradle and CMake create and delete directories under these paths mid-build, which
    // crashes Metro's fallback watcher with ENOENT when a build runs alongside the server.
    blockList: [
      /[\\/]android[\\/]\.gradle[\\/]/,
      /[\\/]android[\\/]build[\\/]/,
      /[\\/]android[\\/]app[\\/]build[\\/]/,
      /[\\/]android[\\/]app[\\/]\.cxx[\\/]/,
      /[\\/]ios[\\/]build[\\/]/,
      /[\\/]ios[\\/]Pods[\\/]/,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
