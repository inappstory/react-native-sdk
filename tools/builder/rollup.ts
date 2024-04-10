import {rollup} from 'rollup';
import {babel} from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
//@ts-ignore
import {sizeSnapshot} from 'rollup-plugin-size-snapshot';
//@ts-ignore
import analyze from 'rollup-plugin-visualizer';
import alias from '@rollup/plugin-alias';

import graphPlugin from './moduleGraphGenerator';
import {dir, getSourcemapPathTransform} from './utils';
import {minifyConfig} from './minificationConfig';

import vuePlugin from 'rollup-plugin-vue';
import typescriptPlugin from 'rollup-plugin-typescript2';
import ttypescript from 'ttypescript';

import postcssPlugin from 'rollup-plugin-postcss';

import nodePolyfills from 'rollup-plugin-polyfill-node';

import scssPlugin from 'rollup-plugin-scss';

import replace from '@rollup/plugin-replace';
import path from "path";
const fs = require("fs");

import ignoreImport from 'rollup-plugin-ignore-import';
import Plugin from "rollup";

import {default as packagesConfig} from "./packages.config";

const tar = require("tar");

const semver = require("semver");


const compatNameCache = {}
const onwarn = (warning: any, rollupWarn: any) => {
  if (
    warning.code !== 'CIRCULAR_DEPENDENCY' &&
    warning.code !== 'NON_EXISTENT_EXPORT'
  ) {
    rollupWarn(warning)
  }
}

const compatTarget = {
  browsers: [
    'Chrome 47',
    'last 2 Firefox versions',
    'last 2 Safari versions',
    'last 2 Edge versions',
    'IE 11',
  ],
}

const projectRoot = path.resolve(__dirname, '..');

const extensions = ['.js', '.mjs', '.ts', '.tsx', '.vue'];
const externals = [
  // 'effector',
  // 'effector/effector.mjs',
  // 'effector/compat',
  // 'effector-react',
  // 'effector-react/effector-react.mjs',
  // 'effector-react/scope',
  // 'effector-react/scope.mjs',
  // 'effector-react/compat',
  // 'effector-vue',
  // 'effector-vue/effector-vue.mjs',
  // 'effector-vue/compat',
  // 'forest',
  // 'forest/forest.mjs',
  // 'forest/server',
  // '@vue/reactivity',
  // '@vue/runtime-core',
  // 'vue',

  'react',
  'react-native',
  'react-native-webview',
  'react-native-get-random-values',
  'react-native-device-info',
  '@react-native-async-storage/async-storage',

  // rn specific
  '../../packages/react-native-ias/StoriesListClient.js',
  '../../packages/react-native-ias/StoriesListClient.css.js',
  '../../packages/react-native-ias/StoryReaderClient.js',
  '../../packages/react-native-ias/StoryReaderClient.css.js',
  '../../packages/react-native-ias/StoryFavoriteReaderClient.js',
  '../../packages/react-native-ias/StoryFavoriteReaderClient.css.js',

];



const getPlugins = (
  name: string,
  {isEsm = false, replaceVueReactivity = false, replaceVueNext = false} = {},
) => ({
  babel: isEsm
    ? babel({
      babelHelpers: 'bundled',
      extensions,
      skipPreflightCheck: true,
      // надо чтобы @babel/preset-flow сработал на react-native из node_modules
      exclude: /node_modules.*/,
      // include: [
      //   'node_modules/react-native/**',
      // ],

      babelrc: false,
      ...require('../babel.config').generateConfig({
        isBuild: true,
        isTest: false,
        isCompat: false,
        isEsm: true,
        replaceVueReactivity,
        replaceVueNext,
      }),
    })
    : babel({
      babelHelpers: 'bundled',
      skipPreflightCheck: true,
      extensions,
      // надо чтобы @babel/preset-flow сработал на react-native из node_modules
      exclude: /node_modules.*/,
      babelrc: false,
      ...require('../babel.config').generateConfig({
        isBuild: true,
        isTest: false,
        isCompat: false,
        isEsm: false,
        replaceVueReactivity,
        replaceVueNext,
      }),
    }),

  // convert to es6 modules
  commonjs: commonjs({
    extensions,
    // include: [
    //   './node_modules/axios/**',
    //   './node_modules/lodash/**',
    //   './node_modules/fingerprintjs2/**',
    //   './node_modules/effector/**',
    // ],

    // include: 'node_modules/**'
    // include: /node_modules/,
    // exclude: ['node_modules/lodash-es/**']
  }),
  // без browser: true axios вставляет require своих модулей
  nodeResolve: resolve({extensions, preferBuiltins: false}),
  sizeSnapshot: sizeSnapshot({
    printInfo: false,
  }),
  analyzer: analyze({
    filename: `stats/${name}.html`,
    title: `${name} size report`,
    sourcemap: true,
    template: 'treemap',
  }),
  analyzerJSON: analyze({
    sourcemap: true,
    json: true,
    filename: `stats/${name}.json`,
  }),
  terser: terser(
    minifyConfig({
      beautify: !!process.env.PRETTIFY,
      inline: !name.endsWith('.umd'),
    }) as any,
  ),
  graph: graphPlugin({
    output: 'modules.dot',
    exclude: 'effector/package.json',
  }),
  json: json({
    preferConst: true,
    indent: '  ',
  }),


  alias: alias({
    // entries: {
    //   // effector: dir('src/effector'),
    // },
    entries: [
      { find:/^~(.*)/, replacement: `${path.resolve(projectRoot, "/")}$1` },
      // { find:/^\{@}(.*)/, replacement: './$1' },
    ],
  }),

  vue: vuePlugin({
    //@ts-ignore
    needMap: false,
    css: true,
    defaultLang: {
      style: 'scss',
      script: 'js'
    },
    // template: {
    //   isProduction: true,
    //   compilerOptions: {
    //     whitespace: 'condense'
    //   }
    // },

  }),

  // postVue

  // Only use typescript for declarations - babel will
  // do actual js transformations
  // typescriptPlugin({
  //   typescript: ttypescript,
  //   useTsconfigDeclarationDir: true,
  //   emitDeclarationOnly: true,
  // }),

  // postcss: postcssPlugin({
  //   extract: false
  // }),

  nodePolyfills: nodePolyfills(),
  scss: scssPlugin(),

  replace: replace({
    preventAssignment: true,
    values: {
      "process.env.NODE_ENV": JSON.stringify("production"),
      "process.env.API_URL": JSON.stringify("https://api.inappstory.ru"),
      "process.env.API_URL_SANDBOX": JSON.stringify("https://api.test.inappstory.com"),
      "process.env.FAVICON_API_URL": JSON.stringify("https://favicon.inappstory.ru"),
        "process.env.BUILD_VERSION": JSON.stringify(packagesConfig[name]?.version || ""),
        "process.env.SDK_VERSION": JSON.stringify(packagesConfig[name]?.version || ""),
        "process.env.SDK_VERSION_CODE": generateVersionCode(packagesConfig[name]?.version || "0.0.0"),
    }
  }),

});

function generateVersionCode(versionName: string): number {
    const version = semver.parse(versionName);
    return version.major * 10000 + version.minor * 100 + version.patch;
}


export async function rollupIasReact() {
  const name = 'ias-react';

  await Promise.all([
    createEsCjs(name, {
      file: {
        cjs: dir(`npm/${name}/${name}.cjs.js`),
        es: dir(`npm/${name}/${name}.mjs`),
      },
      inputExtension: 'ts',
    }),
    // createSSR({
    //   file: {
    //     cjs: dir(`npm/${name}/scope.js`),
    //     es: dir(`npm/${name}/scope.mjs`),
    //   },
    // }),
    createUmd(name, {
      // external: externals,
      external: ['react'],
      file: dir(`npm/${name}/${name}.umd.js`),
      umdName: 'iasReact',
      globals: {
        // effector: 'effector', //
        react: 'React',
      },
      extension: 'ts',
    }),
    createCompat(name, 'ts'),


    // widgetClients - common task. We need only UMD (for include as src inside iframe) //
    // createEsCjs(name, {
    //   file: {
    //     cjs: dir(`npm/${name}/StoriesListClient.cjs.js`),
    //     es: dir(`npm/${name}/StoriesListClient.mjs`),
    //   },
    //   input: "StoriesListClient",
    //   inputExtension: 'ts',
    // }),
    createUmd(name, {
      input: "StoriesListClient",
      // без зависимостей
      // external: [],
      external: externals,
      file: dir(`npm/${name}/StoriesListClient.umd.js`),
      umdName: 'storiesList', // export to window.storiesList
      globals: {

        // react: 'React',
      },
      extension: 'ts', // input file extension
    }),

  ])

  async function createSSR({
                             file: {cjs, es},
                           }: {
    file: { cjs: string; es: string }
  }) {
    await Promise.all([
      runBuild(cjs, 'cjs'),
      runBuild(es, 'es'),
      createEsCjs(name, {
        file: {
          cjs: dir(`npm/${name}/ssr.js`),
          es: dir(`npm/${name}/ssr.mjs`),
        },
        input: 'ssr',
        inputExtension: 'ts',
      }),
    ])

    async function runBuild(file: string, format: 'cjs' | 'es') {
      const plugins = getPlugins(name, {isEsm: format === 'es'})
      const pluginList = [
        plugins.nodeResolve,
        plugins.json,
        plugins.babel,
        // вызывает ошибку
        // plugins.sizeSnapshot,
        plugins.terser,
          /* TODO tmp disable (source-map detect node via typeof fetch)  fixed in 0.8.0*/
        // plugins.analyzer,
        // plugins.analyzerJSON,
      ]
      const build = await rollup({
        onwarn,
        input: dir(`packages/${name}/scope.ts`),
        external: externals,
        plugins: pluginList,
      })
      await build.write({
        file,
        format,
        freeze: false,
        name,
        sourcemap: true,
        sourcemapPathTransform: getSourcemapPathTransform(name),
        externalLiveBindings: format === 'es',
      })
    }
  }
}


export async function rollupIasReactNative() {
  const name = 'react-native-ias';

  await Promise.all([
    createEsCjs(name, {
      file: {
        cjs: dir(`npm/${name}/${name}.cjs.js`),
        es: dir(`npm/${name}/${name}.mjs`),
      },
      inputExtension: 'ts',
      // outputPlugins: [
      //   replace({
      //     preventAssignment: true,
      //     values: {
      //       // "{@}": JSON.stringify("./")
      //       '{@}StoriesListClient.js': './StoriesListClient.js',
      //       'changed': 'replaced'
      //     }
      //   })
      // ]

    }),
    // createSSR({
    //   file: {
    //     cjs: dir(`npm/${name}/scope.js`),
    //     es: dir(`npm/${name}/scope.mjs`),
    //   },
    // }),

    // createUmd(name, {
    //   // external: externals,
    //   external: ['react', 'react-native', 'react-native-webview'],
    //   file: dir(`npm/${name}/${name}.umd.js`),
    //   umdName: 'iasReactNative',
    //   globals: {
    //     // effector: 'effector', //
    //     react: 'React',
    //     'react-native': 'reactNative',
    //     'react-native-webview': 'reactNativeWebView',
    //   },
    //   extension: 'ts',
    // }),
    // compat не нужен
    // createCompat(name, 'ts'),


    // widgetClients - common task. We need only UMD (for include as src inside iframe) //
    // createEsCjs(name, {
    //   file: {
    //     cjs: dir(`npm/${name}/StoriesListClient.cjs.js`),
    //     es: dir(`npm/${name}/StoriesListClient.mjs`),
    //   },
    //   input: "StoriesListClient",
    //   inputExtension: 'ts',
    // }),

    createUmd(name, {
      input: "StoriesListClient",
      // без зависимостей
      // external: [],
      external: externals,
      file: dir(`npm/${name}/StoriesListClient.umd.js`),
      umdName: 'storiesList', // export to window.storiesList
      globals: {

        // react: 'React',
      },
      extension: 'ts', // input file extension
    }),

    createUmd(name, {
      input: "StoryReaderClient",
      // без зависимостей
      // external: [],
      external: externals,
      file: dir(`npm/${name}/StoryReaderClient.umd.js`),
      umdName: 'storyReader', // export to window.storiesList
      globals: {

        // react: 'React',
      },
      extension: 'ts', // input file extension
    }),

    createUmd(name, {
      input: "StoryFavoriteReaderClient",
      // без зависимостей
      // external: [],
      external: externals,
      file: dir(`npm/${name}/StoryFavoriteReaderClient.umd.js`),
      umdName: 'storyFavoriteReader', // export to window.storiesList
      globals: {

        // react: 'React',
      },
      extension: 'ts', // input file extension
    }),

  ]);

  // src path (.css|.js)
  // dist path - .js
  function moveBundleToScript(src: string, dist: string){

    const bundle = fs.readFileSync(src, "utf8");

    const escaped = JSON.stringify(bundle);
    const js = `export default ${escaped}`;

    fs.writeFileSync(dist, js);
  }

  moveBundleToScript(dir(`npm/${name}/StoriesListClient.umd.js`), dir(`npm/${name}/StoriesListClient.js`));
  moveBundleToScript(dir(`npm/${name}/StoriesListClient.umd.css`), dir(`npm/${name}/StoriesListClient.css.js`));

  try {
    fs.unlink(dir(`npm/${name}/StoriesListClient.umd.js`), () => {
    });
    fs.unlink(dir(`npm/${name}/StoriesListClient.umd.css`), () => {
    });
  } catch (e) {
    // console.error(e);
  }

  moveBundleToScript(dir(`npm/${name}/StoryReaderClient.umd.js`), dir(`npm/${name}/StoryReaderClient.js`));
  moveBundleToScript(dir(`npm/${name}/StoryReaderClient.umd.css`), dir(`npm/${name}/StoryReaderClient.css.js`));
  try {
    fs.unlink(dir(`npm/${name}/StoryReaderClient.umd.js`), () => {
    });
    fs.unlink(dir(`npm/${name}/StoryReaderClient.umd.css`), () => {
    });
  } catch (e) {
    // console.error(e);
  }

  moveBundleToScript(dir(`npm/${name}/StoryFavoriteReaderClient.umd.js`), dir(`npm/${name}/StoryFavoriteReaderClient.js`));
  moveBundleToScript(dir(`npm/${name}/StoryFavoriteReaderClient.umd.css`), dir(`npm/${name}/StoryFavoriteReaderClient.css.js`));
  try {
    fs.unlink(dir(`npm/${name}/StoryFavoriteReaderClient.umd.js`), () => {
    });
    fs.unlink(dir(`npm/${name}/StoryFavoriteReaderClient.umd.css`), () => {
    });
  } catch (e) {
    // console.error(e);
  }


  // await tar.c(
  //   {
  //     gzip: true,
  //     file: dir(`npm/${name}.tar.gz`),
  //     cwd: dir("npm")
  //   },
  //   [name]
  // );



}





export async function rollupEffector() {
  const name = 'effector'
  await Promise.all([
    createEsCjs(name, {
      file: {
        cjs: dir(`npm/${name}/${name}.cjs.js`),
        es: dir(`npm/${name}/${name}.mjs`),
      },
      renderModuleGraph: true,
      inputExtension: 'ts',
    }),
    createEsCjs(name, {
      file: {
        cjs: dir(`npm/${name}/fork.js`),
        es: dir(`npm/${name}/fork.mjs`),
      },
      input: 'fork',
      inputExtension: 'ts',
    }),
    createUmd(name, {
      external: externals,
      file: dir(`npm/${name}/${name}.umd.js`),
      umdName: name,
      globals: {},
      extension: 'ts',
    }),
    createCompat(name, 'ts'),
  ])
}

export async function rollupEffectorDom({name}: { name: string }) {
  await Promise.all([
    createEsCjs(name, {
      file: {
        cjs: dir(`npm/${name}/${name}.cjs.js`),
        es: dir(`npm/${name}/${name}.mjs`),
      },
      inputExtension: 'ts',
    }),
    createEsCjs(name, {
      file: {
        cjs: dir(`npm/${name}/server.js`),
        es: dir(`npm/${name}/server.mjs`),
      },
      input: 'server',
      inputExtension: 'ts',
    }),
    createUmd(name, {
      external: externals,
      file: dir(`npm/${name}/${name}.umd.js`),
      umdName: name,
      globals: {
        effector: 'effector',
      },
      extension: 'ts',
      bundleEffector: false,
    }),
    // createCompat(name),
  ])
}

export async function rollupEffectorReact() {
  const name = 'effector-react'

  await Promise.all([
    createEsCjs(name, {
      file: {
        cjs: dir(`npm/${name}/${name}.cjs.js`),
        es: dir(`npm/${name}/${name}.mjs`),
      },
      inputExtension: 'ts',
    }),
    createSSR({
      file: {
        cjs: dir(`npm/${name}/scope.js`),
        es: dir(`npm/${name}/scope.mjs`),
      },
    }),
    createUmd(name, {
      // external: externals,
      external: externals,
      file: dir(`npm/${name}/${name}.umd.js`),
      umdName: 'effectorReact',
      globals: {
        effector: 'effector',
        react: 'React',
      },
      extension: 'ts',
    }),
    createCompat(name, 'ts'),
  ])

  async function createSSR({
                             file: {cjs, es},
                           }: {
    file: { cjs: string; es: string }
  }) {
    await Promise.all([
      runBuild(cjs, 'cjs'),
      runBuild(es, 'es'),
      createEsCjs(name, {
        file: {
          cjs: dir(`npm/${name}/ssr.js`),
          es: dir(`npm/${name}/ssr.mjs`),
        },
        input: 'ssr',
        inputExtension: 'ts',
      }),
    ])

    async function runBuild(file: string, format: 'cjs' | 'es') {
      const plugins = getPlugins(name, {isEsm: format === 'es'})
      const pluginList = [
        plugins.resolve,
        plugins.json,
        plugins.babel,
        // вызывает ошибку
        // plugins.sizeSnapshot,
        plugins.terser,

          /* TODO tmp disable (source-map detect node via typeof fetch) */
        // plugins.analyzer,
        // plugins.analyzerJSON,
      ]
      const build = await rollup({
        onwarn,
        input: dir(`packages/${name}/scope.ts`),
        external: externals,
        plugins: pluginList,
      })
      await build.write({
        file,
        format,
        freeze: false,
        name,
        sourcemap: true,
        sourcemapPathTransform: getSourcemapPathTransform(name),
        externalLiveBindings: format === 'es',
      })
    }
  }
}

export async function rollupEffectorVue() {
  const name = 'effector-vue'
  await Promise.all([
    createEsCjs(name, {
      file: {
        cjs: dir(`npm/${name}/${name}.cjs.js`),
        es: dir(`npm/${name}/${name}.mjs`),
      },
      inputExtension: 'ts',
    }),
    createEsCjs(name, {
      file: {
        cjs: dir(`npm/${name}/composition.cjs.js`),
        es: dir(`npm/${name}/composition.mjs`),
      },
      input: 'composition',
      inputExtension: 'ts',
      replaceVueReactivity: true,
    }),
    createUmd(name, {
      external: externals,
      file: dir(`npm/${name}/${name}.umd.js`),
      umdName: 'effectorVue',
      globals: {
        effector: 'effector',
        vue: 'Vue',
      },
      extension: 'ts',
    }),
    createCompat(name, 'ts'),
  ])
}

async function createUmd(
  name: string,
  {external, file, umdName, globals, input = 'index', extension = 'js', bundleEffector = false},
) {
  const plugins = getPlugins(`${name}.umd`)
  const build = await rollup({
    onwarn,
    input: dir(`packages/${name}/${input}.${extension}`),
    plugins: [
      plugins.replace,
      plugins.nodePolyfills,
      plugins.vue,
      plugins.scss,
      // plugins.postcss,

      plugins.nodeResolve,
      plugins.json,
      plugins.babel,

      bundleEffector && plugins.alias,
      plugins.commonjs,
      // вызывает ошибку
      // plugins.sizeSnapshot,
      plugins.terser,
        /* TODO tmp disable (source-map detect node via typeof fetch) */
      // plugins.analyzer,
      // plugins.analyzerJSON,
    ].filter(Boolean),
    external,
  })
  await build.write({
    file,
    format: 'umd',
    freeze: false,
    name: umdName,
    sourcemap: true,
    globals,
  })
}

async function createCompat(name: string, extension = 'js') {
  const plugins = getPlugins(`${name}.compat`)
  //$off
  const {getAliases} = require('../babel.config')
  const terserConfig = minifyConfig({
    beautify: !!process.env.PRETTIFY,
  })
  const pluginList = [
    plugins.replace,
    plugins.nodeResolve,
    plugins.vue,
    plugins.scss,
    plugins.json,
    babel({
      babelHelpers: 'bundled',
      extensions,
      skipPreflightCheck: true,
      exclude: /node_modules.*/,
      babelrc: false,
      presets: [
        extension === 'js'
          ? '@babel/preset-flow'
          : [
            '@babel/preset-typescript',
            {
              isTSX: true,
              allExtensions: true,
            },
          ],
        ['@babel/preset-react', {useBuiltIns: false}],
        [
          '@babel/preset-env',
          {
            loose: true,
            useBuiltIns: 'entry',
            corejs: 3,
            modules: false,
            shippedProposals: true,
            targets: compatTarget,
          },
        ],
      ],
      plugins: [
        '@babel/plugin-proposal-export-namespace-from',
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-proposal-nullish-coalescing-operator',
        ['@babel/plugin-proposal-class-properties', {loose: true}],
        [
          'babel-plugin-module-resolver',
          {
            alias: getAliases({
              isBuild: true,
              isTest: false,
              isCompat: true,
              isEsm: false,
            }),
            loglevel: 'silent',
          },
        ],
      ],
    }),
    plugins.commonjs,
    // вызывает ошибку
    // plugins.sizeSnapshot,
    terser({
      ...terserConfig,
      parse: {
        ...terserConfig.parse,
        ecma: 5,
      },
      compress: {
        ...terserConfig.compress,
        directives: false,
        ecma: 5,
      },
      mangle: {
        ...terserConfig.mangle,
        safari10: true,
      },
      output: {
        ...terserConfig.output,
        ecma: 5,
        safari10: true,
        webkit: true,
      },
      ecma: 5,
      nameCache: compatNameCache,
      safari10: true,
    }),
      /* TODO tmp disable (source-map detect node via typeof fetch) */
    // plugins.analyzer,
    // plugins.analyzerJSON,
  ]
  const build = await rollup({
    onwarn,
    input: dir(`packages/${name}/index.${extension}`),
    external: externals,
    plugins: pluginList,
  })
  await build.write({
    file: dir(`npm/${name}/compat.js`),
    format: 'cjs',
    freeze: false,
    name,
    sourcemap: true,
    sourcemapPathTransform: getSourcemapPathTransform(name),
    externalLiveBindings: false,
  })
}

async function createEsCjs(
  name: string,
  {
    file: {es, cjs},
    renderModuleGraph = false,
    input = 'index',
    inputExtension = 'js',
    replaceVueReactivity = false,
    outputPlugins = []
  }: {
    file: { es?: string; cjs: string }
    renderModuleGraph?: boolean
    input?: string
    inputExtension?: string
    replaceVueReactivity?: boolean,
    outputPlugins?: Array<any>
  },
) {
  const pluginsCjs = getPlugins(input === 'index' ? name : input, {
    replaceVueNext: true,
  })
  const pluginListCjs = [
    pluginsCjs.replace,
    pluginsCjs.nodePolyfills,
    pluginsCjs.vue,
    pluginsCjs.scss,
    pluginsCjs.nodeResolve,
    pluginsCjs.json,
    pluginsCjs.babel,
    pluginsCjs.alias,
    pluginsCjs.commonjs, // after babel ts transforms
    // вызывает ошибку
    // pluginsCjs.sizeSnapshot,
    pluginsCjs.terser,
      /* TODO tmp disable (source-map detect node via typeof fetch) */
    // pluginsCjs.analyzer,
    // pluginsCjs.analyzerJSON,
  ]
  const pluginsEsm = getPlugins(input === 'index' ? name : input, {
    isEsm: true,
    replaceVueReactivity,
    replaceVueNext: true,
  })
  const pluginListEsm = [
    pluginsEsm.json,
    pluginsEsm.replace,
    pluginsEsm.nodePolyfills,
    pluginsEsm.vue,
    pluginsEsm.scss,
    pluginsEsm.nodeResolve,
    pluginsEsm.babel,
    pluginsEsm.alias,
    pluginsEsm.commonjs,
    // вызывает ошибку
    // pluginsEsm.sizeSnapshot,
    pluginsEsm.terser,
      /* TODO tmp disable (source-map detect node via typeof fetch) */
    // pluginsEsm.analyzer,
    // pluginsEsm.analyzerJSON,
  ]
  if (renderModuleGraph) {
    pluginListCjs.push(
      graphPlugin({
        output: 'modules.dot',
        exclude: 'effector/package.json',
      }),
    )
  }
  const [buildCjs, buildEs] = await Promise.all([
    rollup({
      onwarn,
      input: dir(`packages/${name}/${input}.${inputExtension}`),
      external: externals,
      plugins: pluginListCjs,
    }),
    es &&
    rollup({
      onwarn,
      input: dir(`packages/${name}/${input}.${inputExtension}`),
      external: externals,
      // external: (id, parentId, isResolved) => {
      //   console.log(id, parentId, isResolved);
      //   return false;
      // },
      plugins: pluginListEsm,
    }),
  ])
  await Promise.all([
    buildCjs.write({
      file: cjs,
      format: 'cjs',
      freeze: false,
      name,
      sourcemap: true,
      sourcemapPathTransform: getSourcemapPathTransform(name),
      externalLiveBindings: false,
      plugins: outputPlugins
    }),
    es &&
    buildEs.write({
      file: es,
      format: 'es',
      freeze: false,
      name,
      sourcemap: true,
      sourcemapPathTransform: getSourcemapPathTransform(name),
      plugins: outputPlugins
    }),
  ])
}
