import serve from 'rollup-plugin-serve'
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


import vuePlugin from 'rollup-plugin-vue';

import nodePolyfills from 'rollup-plugin-polyfill-node';

import scssPlugin from 'rollup-plugin-scss';

import replace from '@rollup/plugin-replace';
import path from "path";

import {minifyConfig} from './minificationConfig';


const compatNameCache = {}
const onwarn = (warning, rollupWarn) => {
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

const extensions = ['.js', '.mjs', '.ts', '.tsx', '.vue'];

const replaceVueReactivity = false;
const replaceVueNext = true;

export default {
  input: 'dev/serve.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'es',
    freeze: false,
  },
  plugins: [
    babel({
      babelHelpers: 'bundled',
      extensions,
      skipPreflightCheck: true,
      exclude: /node_modules.*/,
      babelrc: false,
      ...require('./babel.config').generateConfig({
        isBuild: true,
        isTest: false,
        isCompat: false,
        isEsm: true,
        replaceVueReactivity,
        replaceVueNext,
      }),
    })
    ,

    // convert to es6 modules
    commonjs({
      extensions,
    }),
    // без browser: true axios вставляет require своих модулей
    resolve({extensions, preferBuiltins: true}),
    terser(
      minifyConfig({
        beautify: !!process.env.PRETTIFY,
        inline: true
      }),
    ),

    json({
      preferConst: true,
      indent: '  ',
    }),



    vuePlugin({
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

    nodePolyfills(),
    scssPlugin(),

    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify("production"),
      "process.env.API_URL": JSON.stringify("https://api.test.inappstory.com"),
    }),

    serve('dist')
  ]
};

