'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Chalk = require('chalk');
var fs$1 = require('fs-extra');
var Viz = require('viz.js');
var full_render_js = require('viz.js/full.render.js');
var path$2 = require('path');
require('execa');
var rollup = require('rollup');
var pluginBabel = require('@rollup/plugin-babel');
var json = require('@rollup/plugin-json');
var resolve = require('@rollup/plugin-node-resolve');
var rollupPluginTerser = require('rollup-plugin-terser');
var commonjs = require('@rollup/plugin-commonjs');
var rollupPluginSizeSnapshot = require('rollup-plugin-size-snapshot');
var analyze = require('rollup-plugin-visualizer');
var alias = require('@rollup/plugin-alias');
var chroma = require('chroma-js');
var vuePlugin = require('rollup-plugin-vue');
var crypto = require('crypto');
var fs$2 = require('fs');
var util = require('util');
var replace$1 = require('@rollup/plugin-replace');
var jsYaml = require('js-yaml');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var Chalk__default = /*#__PURE__*/_interopDefaultLegacy(Chalk);
var fs__namespace = /*#__PURE__*/_interopNamespace(fs$1);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs$1);
var Viz__default = /*#__PURE__*/_interopDefaultLegacy(Viz);
var path__namespace = /*#__PURE__*/_interopNamespace(path$2);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path$2);
var json__default = /*#__PURE__*/_interopDefaultLegacy(json);
var resolve__default = /*#__PURE__*/_interopDefaultLegacy(resolve);
var commonjs__default = /*#__PURE__*/_interopDefaultLegacy(commonjs);
var analyze__default = /*#__PURE__*/_interopDefaultLegacy(analyze);
var alias__default = /*#__PURE__*/_interopDefaultLegacy(alias);
var chroma__default = /*#__PURE__*/_interopDefaultLegacy(chroma);
var vuePlugin__default = /*#__PURE__*/_interopDefaultLegacy(vuePlugin);
var util__default = /*#__PURE__*/_interopDefaultLegacy(util);
var replace__default = /*#__PURE__*/_interopDefaultLegacy(replace$1);

function onFinish(stats) {
  setConfig = noop;

  if (Object.keys(stats.fail).length === 0) {
    console.log(label(Chalk__default["default"].bgGreen, 'DONE'), label(Chalk__default["default"].bgWhite, 'build complete'), Chalk__default["default"].greenBright('all tasks finished successfully'));
    return;
  }

  console.log(label(Chalk__default["default"].bgKeyword('orange'), 'WARN'), Chalk__default["default"].bold.keyword('orange')('some tasks failed'));

  for (const name in stats.fail) {
    console.log(Chalk__default["default"].keyword('orange')(`  - ${name}`));
  }

  process.exit(1);
}

const label = (chalk, label) => chalk.black(` ${label} `);

const run = ({
  tasks,
  name,
  stats
}) => tasks.reduce((p, task) => p.then(task), Promise.resolve()).then(() => {
  stats.done[name] = true;
  console.log(label(Chalk__default["default"].bgGreen, 'DONE'), label(Chalk__default["default"].bgWhite, name), Chalk__default["default"].greenBright('task complete'));
}).catch(err => {
  stats.done[name] = false;
  stats.fail[name] = err;
  console.log(label(Chalk__default["default"].bgRed, 'FAIL'), label(Chalk__default["default"].bgWhite, name), Chalk__default["default"].redBright('task failed'));
  console.error(err);
});

const noop = () => {};

let setConfig = noop;
function taskList({
  tasks,
  hooks
}) {
  const pending = [];
  const stats = {
    done: {},
    fail: {}
  };
  const config = {
    ignore: [],
    only: []
  };

  setConfig = (field, data) => {
    config[field] = data;
  };

  return run({
    tasks: hooks.beforeAll,
    name: 'beforeAll',
    stats
  }).then(() => {
    console.log('running with config');
    console.dir(config);

    for (const pkg in tasks) {
      if (config.ignore.includes(pkg)) continue;
      if (config.only.length > 0 && !config.only.includes(pkg)) continue;
      pending.push(run({
        tasks: tasks[pkg],
        name: pkg,
        stats
      }));
    }

    return Promise.all(pending);
  }).then(() => onFinish(stats), () => onFinish(stats));
}

const cliArgs = {
  current: process.argv.slice(2),
  original: process.argv.slice(2)
};
const root = process.cwd();
function dir(...paths) {
  return path$2.resolve(root, ...paths);
}
async function outputPackageJSON(path, config) {
  let fullPath;
  if (path.endsWith('package.json')) fullPath = dir(path);else fullPath = dir(path, 'package.json');
  await fs__namespace.outputJSON(fullPath, config, {
    spaces: 2
  });
}
function massCopy(from, to, targets) {
  const jobs = [];

  for (const target of targets) {
    if (typeof target === 'string') {
      jobs.push([dir(from, target), dir(to, target)]);
    } else {
      const [fromFile, toFile] = target;

      if (typeof toFile === 'string') {
        jobs.push([dir(from, fromFile), dir(to, toFile)]);
      } else {
        for (const toFileName of toFile) {
          jobs.push([dir(from, fromFile), dir(to, toFileName)]);
        }
      }
    }
  }

  return Promise.all(jobs.map(([from, to]) => fs__namespace.copy(from, to)));
}
/* eslint-disable max-len */

/**
 * @example ../../src/react/createComponent.js -> effector-react/createComponent.js
 */

function getSourcemapPathTransform(name) {
  const nameWithoutSuffix = name.replace('effector-', '').replace('@effector/', '');
  const packageRoot = path$2.join('../..', 'src', nameWithoutSuffix);
  return relativePath => `${name}/${path$2.relative(packageRoot, relativePath)}`;
}

const scale = chroma__default["default"].scale([chroma__default["default"]('#fafa6e').darken(2), '#2A4858']).mode('lch');

function field({
  name,
  value,
  quotes = false
}) {
  if (quotes) value = quote(value);
  return `${name}=${value}`;
}

function quote(text) {
  return `"${String(text)}"`;
}

function definition({
  name,
  spaces,
  props
}) {
  const fieldsDef = [];

  for (const key in props) {
    fieldsDef.push({
      name: key,
      value: props[key],
      quotes: false
    });
  }

  const fieldsList = fieldsDef.map(field);
  const flatProps = fieldsList.join(`, `);
  const indent = Array(spaces).fill(' ').join('');
  return `${indent}${name} [${flatProps}];`;
}

function definitionMap({
  spaces,
  defs
}) {
  const resultList = [];

  for (const name in defs) {
    resultList.push({
      name,
      spaces,
      props: defs[name]
    });
  }

  return resultList.map(definition);
}

function toDot(modules, output) {
  const results = [];
  results.push('digraph G {');
  results.push(...definitionMap({
    spaces: 2,
    defs: {
      edge: {
        color: quote('#999999'),
        dir: 'back'
      },
      node: {
        color: 'white',
        style: 'filled',
        fontsize: quote('25px')
      },
      graph: {
        fontsize: 20,
        compound: true
      }
    }
  }));
  results.push('  rankdir=TB;');
  results.push('  ranksep=".95 equally";');
  results.push('  ratio=auto;');
  let links = [];
  const cwd = process.cwd() + '/';
  const modulesOnly = modules.map(md => {
    const id = processPath(md.id);
    const deps = md.deps.map(processPath);
    return {
      id,
      deps
    };
  });

  function processPath(path) {
    path = path.replace(cwd, '');
    path = path.replace('src/effector/', '');
    path = path.replace('src/', '');
    path = path.replace('.ts', '');
    path = path.replace(/(.+)\/index$/, '$1');
    return path;
  }

  const moduleNames = new Set();
  modulesOnly.forEach(m => {
    const from = m.id;
    moduleNames.add(from);
    m.deps.forEach(dep => {
      moduleNames.add(dep);
      links.push({
        from,
        to: dep
      });
    });
  });
  links = links.sort((a, b) => {
    if (a.from === b.from) {
      return a.to.localeCompare(b.to);
    }

    return a.from.localeCompare(b.from);
  });
  const moduleSet = [...moduleNames];

  const nextID = (() => {
    let id = 10;
    return () => `id_${(id++).toString(36)}`;
  })();

  const nameMap = {
    names: [],
    nameOf: {},
    idOf: {}
  };
  moduleSet.forEach(name => {
    const id = nextID();
    nameMap.nameOf[id] = name;
    nameMap.idOf[name] = id;
    nameMap.names.push(name);
  });
  let clusters = moduleSet.reduce((acc, name) => [...new Set([...acc, name.split('/')[0]])], []).map(name => ({
    name,
    childs: moduleSet.filter(n => n === name || n.startsWith(`${name}/`))
  }));
  clusters = clusters.filter(({
    name
  }, i, clusters) => clusters.every(({
    name: item,
    childs
  }) => {
    if (item === name) return true;
    return !childs.includes(name);
  })).filter(({
    childs
  }) => childs.length > 1);
  const freeNodes = new Set(moduleSet);
  const clusterRoots = {
    roots: new Set(),
    map: {},
    colors: {},
    clusterOf: {}
  };
  const colors = scale.colors(clusters.length + 1);
  clusters.forEach(({
    name,
    childs
  }, i) => {
    const color = colors[i + 1];
    const id = nextID();
    const cluster = [];
    const clusterName = `cluster_${id}`;
    clusterRoots.colors[clusterName] = color;
    cluster.push(`  subgraph ${clusterName} {`);
    cluster.push(`    style="rounded,bold";`);
    cluster.push(`    color="${color}";`); // cluster.push(`    color="transparent";`)

    cluster.push(definition({
      name: 'node',
      spaces: 4,
      props: {
        fontcolor: quote(color),
        fontsize: quote('25px')
      }
    }));
    childs.forEach(childName => {
      freeNodes.delete(childName);
      const id = nameMap.idOf[childName];
      clusterRoots.clusterOf[id] = clusterName;
      let visibleName = '/';

      if (childName !== name) {
        visibleName = childName.slice(name.length + 1);
      } else {
        clusterRoots.roots.add(id);
        clusterRoots.map[id] = clusterName;
      }

      cluster.push(definition({
        name: id,
        spaces: 4,
        props: {
          label: quote(visibleName),
          group: quote(name)
        }
      }));
    });
    cluster.push(`    fontcolor="${color}";`);
    cluster.push(`    fontsize="45px";`);
    cluster.push(`    label = "${name}";`);
    cluster.push(`  }`);
    results.push(...cluster);
  });
  freeNodes.forEach(name => {
    const label = `"${name}"`;
    results.push(definition({
      spaces: 2,
      name: nameMap.idOf[name],
      props: {
        label,
        fontsize: quote('45px')
      }
    }));
  });
  links.forEach(({
    from,
    to
  }) => {
    const fromId = nameMap.idOf[from];
    const toId = nameMap.idOf[to];
    let opts = ' [style="dashed"]';
    const sameCluster = toId in clusterRoots.clusterOf && clusterRoots.clusterOf[fromId] === clusterRoots.clusterOf[toId];

    if (sameCluster) {
      const cluster = clusterRoots.clusterOf[fromId];
      const color = clusterRoots.colors[cluster];
      opts = ` [style="bold",color="${color}"]`;
    } else if (clusterRoots.roots.has(toId)) {
      opts = ` [style="dashed",lhead=${clusterRoots.map[toId]}]`;
    }

    results.push(`  ${fromId} -> ${toId}${opts};`);
  });
  results.push('}');
  const fullText = results.join(`\n`); // console.log('path', Path.resolve(process.cwd(), output))
  // console.log('moduleSet', moduleSet)
  // console.log('nameMap', nameMap)
  // console.log('clustersFirst', clustersFirst)
  // console.log('clusters', clusters)

  if (nameMap.names.length === 0) {
    console.log('[moduleGraphGenerator] no modules given, return without writing results');
    return;
  }

  const outputPath = path__namespace.resolve(process.cwd(), output);
  fs$1.outputFileSync(outputPath, fullText); // console.log(
  //   '[moduleGraphGenerator] module dependency scheme saved to file %s',
  //   outputPath,
  // )
}

function prune(modules) {
  const avail = modules.filter(m => m.deps.length == 0);

  if (!avail.length) {
    return;
  }

  const id = avail[0].id;
  const index = modules.indexOf(avail[0]);
  modules.splice(index, 1);
  modules.forEach(m => {
    m.deps = m.deps.filter(dep => dep != id);
  });
  prune(modules);
}

function getPrefix(ids) {
  if (ids.length < 2) {
    return '';
  }

  return ids.reduce((prefix, val) => {
    while (val.indexOf(prefix) != 0) {
      prefix = prefix.substring(0, prefix.length - 1);
    }

    return prefix;
  });
}

function plugin(options = {}) {
  const exclude = str => options.exclude && str.match(options.exclude);

  return {
    generateBundle(bundleOptions, bundle, isWrite) {
      const ids = [];

      for (const moduleId of this.moduleIds) {
        if (!exclude(moduleId)) {
          ids.push(moduleId);
        }
      }

      const prefix = getPrefix(ids);

      const strip = str => str.substring(prefix.length);

      const modules = [];
      ids.forEach(id => {
        const m = {
          id: strip(id),
          deps: this.getModuleInfo(id).importedIds.filter(x => !exclude(x)).map(strip)
        };

        if (exclude(m.id)) {
          return;
        }

        modules.push(m);
      });

      if (Boolean(options.prune)) {
        prune(modules);
      }

      try {
        toDot(modules, options.output);
      } catch (error) {
        console.error('error during graph generation');
        console.error(error);
      }
    }

  };
}

const nameCache = {};
const minifyConfig = ({
  beautify,
  inline = true
}) => ({
  parse: {
    bare_returns: false,
    ecma: 8,
    html5_comments: false,
    shebang: true
  },
  compress: {
    global_defs: {// __DEV__: false,
      // 'process.env.NODE_ENV': 'production',
    },
    arrows: true,
    arguments: true,
    booleans: true,
    // important, need to be false
    // in any functions can be conditional like typeof === 'boolean'
    booleans_as_integers: false,
    collapse_vars: true,
    comparisons: true,
    computed_props: true,
    conditionals: true,
    dead_code: true,
    directives: true,
    drop_console: false,
    drop_debugger: true,
    ecma: 8,
    evaluate: true,
    expression: true,
    //?
    hoist_funs: true,
    //?
    hoist_props: true,
    hoist_vars: false,
    if_return: true,
    inline,
    join_vars: true,
    //?
    defaults: false,
    keep_classnames: false,
    keep_fargs: false,
    keep_fnames: false,
    loops: true,
    module: true,
    properties: true,
    pure_getters: true,
    reduce_funcs: true,
    reduce_vars: true,
    sequences: true,
    side_effects: true,
    switches: true,
    toplevel: true,
    typeofs: true,
    unused: true,
    passes: 3,
    unsafe_arrows: true,
    unsafe_Function: true,
    unsafe_math: true,
    unsafe_proto: true
  },
  mangle: {
    reserved: ['effector', 'effectorVue', 'effectorReact', 'it', 'test'],
    eval: true,
    keep_classnames: false,
    keep_fnames: false,
    module: true,
    toplevel: true,
    //?
    safari10: false // properties: {
    //   builtins: false,
    //   debug: false,
    //   keep_quoted: false, //?
    //   reserved: ['test', 'it'],
    // },

  },
  output: {
    ascii_only: true,
    braces: false,
    //?
    // comments: /#/i,
    comments: false,
    ecma: 8,
    beautify,
    indent_level: 2,
    inline_script: false,
    //?
    keep_quoted_props: false,
    //?
    quote_keys: false,
    quote_style: 3,
    //?
    safari10: false,
    semicolons: true,
    //?
    shebang: true,
    webkit: false,
    wrap_iife: false
  },
  // sourceMap: {
  //     // source map options
  // },
  ecma: 8,
  keep_classnames: false,
  keep_fnames: false,
  ie8: false,
  module: true,
  nameCache,
  safari10: false,
  toplevel: true,
  warnings: true
});

var utils$5 = {};

const path$1 = path__default["default"];

const WIN_SLASH$1 = '\\\\/';
const WIN_NO_SLASH$1 = `[^${WIN_SLASH$1}]`;
/**
 * Posix glob regex
 */

const DOT_LITERAL$1 = '\\.';
const PLUS_LITERAL$1 = '\\+';
const QMARK_LITERAL$1 = '\\?';
const SLASH_LITERAL$1 = '\\/';
const ONE_CHAR$1 = '(?=.)';
const QMARK$1 = '[^/]';
const END_ANCHOR$1 = `(?:${SLASH_LITERAL$1}|$)`;
const START_ANCHOR$1 = `(?:^|${SLASH_LITERAL$1})`;
const DOTS_SLASH$1 = `${DOT_LITERAL$1}{1,2}${END_ANCHOR$1}`;
const NO_DOT$1 = `(?!${DOT_LITERAL$1})`;
const NO_DOTS$1 = `(?!${START_ANCHOR$1}${DOTS_SLASH$1})`;
const NO_DOT_SLASH$1 = `(?!${DOT_LITERAL$1}{0,1}${END_ANCHOR$1})`;
const NO_DOTS_SLASH$1 = `(?!${DOTS_SLASH$1})`;
const QMARK_NO_DOT$1 = `[^.${SLASH_LITERAL$1}]`;
const STAR$1 = `${QMARK$1}*?`;
const POSIX_CHARS$1 = {
  DOT_LITERAL: DOT_LITERAL$1,
  PLUS_LITERAL: PLUS_LITERAL$1,
  QMARK_LITERAL: QMARK_LITERAL$1,
  SLASH_LITERAL: SLASH_LITERAL$1,
  ONE_CHAR: ONE_CHAR$1,
  QMARK: QMARK$1,
  END_ANCHOR: END_ANCHOR$1,
  DOTS_SLASH: DOTS_SLASH$1,
  NO_DOT: NO_DOT$1,
  NO_DOTS: NO_DOTS$1,
  NO_DOT_SLASH: NO_DOT_SLASH$1,
  NO_DOTS_SLASH: NO_DOTS_SLASH$1,
  QMARK_NO_DOT: QMARK_NO_DOT$1,
  STAR: STAR$1,
  START_ANCHOR: START_ANCHOR$1
};
/**
 * Windows glob regex
 */

const WINDOWS_CHARS$1 = { ...POSIX_CHARS$1,
  SLASH_LITERAL: `[${WIN_SLASH$1}]`,
  QMARK: WIN_NO_SLASH$1,
  STAR: `${WIN_NO_SLASH$1}*?`,
  DOTS_SLASH: `${DOT_LITERAL$1}{1,2}(?:[${WIN_SLASH$1}]|$)`,
  NO_DOT: `(?!${DOT_LITERAL$1})`,
  NO_DOTS: `(?!(?:^|[${WIN_SLASH$1}])${DOT_LITERAL$1}{1,2}(?:[${WIN_SLASH$1}]|$))`,
  NO_DOT_SLASH: `(?!${DOT_LITERAL$1}{0,1}(?:[${WIN_SLASH$1}]|$))`,
  NO_DOTS_SLASH: `(?!${DOT_LITERAL$1}{1,2}(?:[${WIN_SLASH$1}]|$))`,
  QMARK_NO_DOT: `[^.${WIN_SLASH$1}]`,
  START_ANCHOR: `(?:^|[${WIN_SLASH$1}])`,
  END_ANCHOR: `(?:[${WIN_SLASH$1}]|$)`
};
/**
 * POSIX Bracket Regex
 */

const POSIX_REGEX_SOURCE$3 = {
  alnum: 'a-zA-Z0-9',
  alpha: 'a-zA-Z',
  ascii: '\\x00-\\x7F',
  blank: ' \\t',
  cntrl: '\\x00-\\x1F\\x7F',
  digit: '0-9',
  graph: '\\x21-\\x7E',
  lower: 'a-z',
  print: '\\x20-\\x7E ',
  punct: '\\-!"#$%&\'()\\*+,./:;<=>?@[\\]^_`{|}~',
  space: ' \\t\\r\\n\\v\\f',
  upper: 'A-Z',
  word: 'A-Za-z0-9_',
  xdigit: 'A-Fa-f0-9'
};
var constants$4 = {
  MAX_LENGTH: 1024 * 64,
  POSIX_REGEX_SOURCE: POSIX_REGEX_SOURCE$3,
  // regular expressions
  REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
  REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
  REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
  REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
  REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
  REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
  // Replace globs with equivalent patterns to reduce parsing time.
  REPLACEMENTS: {
    '***': '*',
    '**/**': '**',
    '**/**/**': '**'
  },
  // Digits
  CHAR_0: 48,

  /* 0 */
  CHAR_9: 57,

  /* 9 */
  // Alphabet chars.
  CHAR_UPPERCASE_A: 65,

  /* A */
  CHAR_LOWERCASE_A: 97,

  /* a */
  CHAR_UPPERCASE_Z: 90,

  /* Z */
  CHAR_LOWERCASE_Z: 122,

  /* z */
  CHAR_LEFT_PARENTHESES: 40,

  /* ( */
  CHAR_RIGHT_PARENTHESES: 41,

  /* ) */
  CHAR_ASTERISK: 42,

  /* * */
  // Non-alphabetic chars.
  CHAR_AMPERSAND: 38,

  /* & */
  CHAR_AT: 64,

  /* @ */
  CHAR_BACKWARD_SLASH: 92,

  /* \ */
  CHAR_CARRIAGE_RETURN: 13,

  /* \r */
  CHAR_CIRCUMFLEX_ACCENT: 94,

  /* ^ */
  CHAR_COLON: 58,

  /* : */
  CHAR_COMMA: 44,

  /* , */
  CHAR_DOT: 46,

  /* . */
  CHAR_DOUBLE_QUOTE: 34,

  /* " */
  CHAR_EQUAL: 61,

  /* = */
  CHAR_EXCLAMATION_MARK: 33,

  /* ! */
  CHAR_FORM_FEED: 12,

  /* \f */
  CHAR_FORWARD_SLASH: 47,

  /* / */
  CHAR_GRAVE_ACCENT: 96,

  /* ` */
  CHAR_HASH: 35,

  /* # */
  CHAR_HYPHEN_MINUS: 45,

  /* - */
  CHAR_LEFT_ANGLE_BRACKET: 60,

  /* < */
  CHAR_LEFT_CURLY_BRACE: 123,

  /* { */
  CHAR_LEFT_SQUARE_BRACKET: 91,

  /* [ */
  CHAR_LINE_FEED: 10,

  /* \n */
  CHAR_NO_BREAK_SPACE: 160,

  /* \u00A0 */
  CHAR_PERCENT: 37,

  /* % */
  CHAR_PLUS: 43,

  /* + */
  CHAR_QUESTION_MARK: 63,

  /* ? */
  CHAR_RIGHT_ANGLE_BRACKET: 62,

  /* > */
  CHAR_RIGHT_CURLY_BRACE: 125,

  /* } */
  CHAR_RIGHT_SQUARE_BRACKET: 93,

  /* ] */
  CHAR_SEMICOLON: 59,

  /* ; */
  CHAR_SINGLE_QUOTE: 39,

  /* ' */
  CHAR_SPACE: 32,

  /*   */
  CHAR_TAB: 9,

  /* \t */
  CHAR_UNDERSCORE: 95,

  /* _ */
  CHAR_VERTICAL_LINE: 124,

  /* | */
  CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,

  /* \uFEFF */
  SEP: path$1.sep,

  /**
   * Create EXTGLOB_CHARS
   */
  extglobChars(chars) {
    return {
      '!': {
        type: 'negate',
        open: '(?:(?!(?:',
        close: `))${chars.STAR})`
      },
      '?': {
        type: 'qmark',
        open: '(?:',
        close: ')?'
      },
      '+': {
        type: 'plus',
        open: '(?:',
        close: ')+'
      },
      '*': {
        type: 'star',
        open: '(?:',
        close: ')*'
      },
      '@': {
        type: 'at',
        open: '(?:',
        close: ')'
      }
    };
  },

  /**
   * Create GLOB_CHARS
   */
  globChars(win32) {
    return win32 === true ? WINDOWS_CHARS$1 : POSIX_CHARS$1;
  }

};

(function (exports) {

const path = path__default["default"];

const win32 = process.platform === 'win32';

const {
  REGEX_BACKSLASH,
  REGEX_REMOVE_BACKSLASH,
  REGEX_SPECIAL_CHARS,
  REGEX_SPECIAL_CHARS_GLOBAL
} = constants$4;

exports.isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);

exports.hasRegexChars = str => REGEX_SPECIAL_CHARS.test(str);

exports.isRegexChar = str => str.length === 1 && exports.hasRegexChars(str);

exports.escapeRegex = str => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, '\\$1');

exports.toPosixSlashes = str => str.replace(REGEX_BACKSLASH, '/');

exports.removeBackslashes = str => {
  return str.replace(REGEX_REMOVE_BACKSLASH, match => {
    return match === '\\' ? '' : match;
  });
};

exports.supportsLookbehinds = () => {
  const segs = process.version.slice(1).split('.').map(Number);

  if (segs.length === 3 && segs[0] >= 9 || segs[0] === 8 && segs[1] >= 10) {
    return true;
  }

  return false;
};

exports.isWindows = options => {
  if (options && typeof options.windows === 'boolean') {
    return options.windows;
  }

  return win32 === true || path.sep === '\\';
};

exports.escapeLast = (input, char, lastIdx) => {
  const idx = input.lastIndexOf(char, lastIdx);
  if (idx === -1) return input;
  if (input[idx - 1] === '\\') return exports.escapeLast(input, char, idx - 1);
  return `${input.slice(0, idx)}\\${input.slice(idx)}`;
};

exports.removePrefix = (input, state = {}) => {
  let output = input;

  if (output.startsWith('./')) {
    output = output.slice(2);
    state.prefix = './';
  }

  return output;
};

exports.wrapOutput = (input, state = {}, options = {}) => {
  const prepend = options.contains ? '' : '^';
  const append = options.contains ? '' : '$';
  let output = `${prepend}(?:${input})${append}`;

  if (state.negated === true) {
    output = `(?:^(?!${output}).*$)`;
  }

  return output;
};
}(utils$5));

const utils$4 = utils$5;

const {
  CHAR_ASTERISK: CHAR_ASTERISK$1,

  /* * */
  CHAR_AT: CHAR_AT$1,

  /* @ */
  CHAR_BACKWARD_SLASH: CHAR_BACKWARD_SLASH$1,

  /* \ */
  CHAR_COMMA: CHAR_COMMA$2,

  /* , */
  CHAR_DOT: CHAR_DOT$2,

  /* . */
  CHAR_EXCLAMATION_MARK: CHAR_EXCLAMATION_MARK$1,

  /* ! */
  CHAR_FORWARD_SLASH: CHAR_FORWARD_SLASH$1,

  /* / */
  CHAR_LEFT_CURLY_BRACE: CHAR_LEFT_CURLY_BRACE$2,

  /* { */
  CHAR_LEFT_PARENTHESES: CHAR_LEFT_PARENTHESES$2,

  /* ( */
  CHAR_LEFT_SQUARE_BRACKET: CHAR_LEFT_SQUARE_BRACKET$2,

  /* [ */
  CHAR_PLUS: CHAR_PLUS$1,

  /* + */
  CHAR_QUESTION_MARK: CHAR_QUESTION_MARK$1,

  /* ? */
  CHAR_RIGHT_CURLY_BRACE: CHAR_RIGHT_CURLY_BRACE$2,

  /* } */
  CHAR_RIGHT_PARENTHESES: CHAR_RIGHT_PARENTHESES$2,

  /* ) */
  CHAR_RIGHT_SQUARE_BRACKET: CHAR_RIGHT_SQUARE_BRACKET$2
  /* ] */

} = constants$4;

const isPathSeparator$1 = code => {
  return code === CHAR_FORWARD_SLASH$1 || code === CHAR_BACKWARD_SLASH$1;
};

const depth = token => {
  if (token.isPrefix !== true) {
    token.depth = token.isGlobstar ? Infinity : 1;
  }
};
/**
 * Quickly scans a glob pattern and returns an object with a handful of
 * useful properties, like `isGlob`, `path` (the leading non-glob, if it exists),
 * `glob` (the actual pattern), `negated` (true if the path starts with `!` but not
 * with `!(`) and `negatedExtglob` (true if the path starts with `!(`).
 *
 * ```js
 * const pm = require('picomatch');
 * console.log(pm.scan('foo/bar/*.js'));
 * { isGlob: true, input: 'foo/bar/*.js', base: 'foo/bar', glob: '*.js' }
 * ```
 * @param {String} `str`
 * @param {Object} `options`
 * @return {Object} Returns an object with tokens and regex source string.
 * @api public
 */


const scan$2 = (input, options) => {
  const opts = options || {};
  const length = input.length - 1;
  const scanToEnd = opts.parts === true || opts.scanToEnd === true;
  const slashes = [];
  const tokens = [];
  const parts = [];
  let str = input;
  let index = -1;
  let start = 0;
  let lastIndex = 0;
  let isBrace = false;
  let isBracket = false;
  let isGlob = false;
  let isExtglob = false;
  let isGlobstar = false;
  let braceEscaped = false;
  let backslashes = false;
  let negated = false;
  let negatedExtglob = false;
  let finished = false;
  let braces = 0;
  let prev;
  let code;
  let token = {
    value: '',
    depth: 0,
    isGlob: false
  };

  const eos = () => index >= length;

  const peek = () => str.charCodeAt(index + 1);

  const advance = () => {
    prev = code;
    return str.charCodeAt(++index);
  };

  while (index < length) {
    code = advance();
    let next;

    if (code === CHAR_BACKWARD_SLASH$1) {
      backslashes = token.backslashes = true;
      code = advance();

      if (code === CHAR_LEFT_CURLY_BRACE$2) {
        braceEscaped = true;
      }

      continue;
    }

    if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE$2) {
      braces++;

      while (eos() !== true && (code = advance())) {
        if (code === CHAR_BACKWARD_SLASH$1) {
          backslashes = token.backslashes = true;
          advance();
          continue;
        }

        if (code === CHAR_LEFT_CURLY_BRACE$2) {
          braces++;
          continue;
        }

        if (braceEscaped !== true && code === CHAR_DOT$2 && (code = advance()) === CHAR_DOT$2) {
          isBrace = token.isBrace = true;
          isGlob = token.isGlob = true;
          finished = true;

          if (scanToEnd === true) {
            continue;
          }

          break;
        }

        if (braceEscaped !== true && code === CHAR_COMMA$2) {
          isBrace = token.isBrace = true;
          isGlob = token.isGlob = true;
          finished = true;

          if (scanToEnd === true) {
            continue;
          }

          break;
        }

        if (code === CHAR_RIGHT_CURLY_BRACE$2) {
          braces--;

          if (braces === 0) {
            braceEscaped = false;
            isBrace = token.isBrace = true;
            finished = true;
            break;
          }
        }
      }

      if (scanToEnd === true) {
        continue;
      }

      break;
    }

    if (code === CHAR_FORWARD_SLASH$1) {
      slashes.push(index);
      tokens.push(token);
      token = {
        value: '',
        depth: 0,
        isGlob: false
      };
      if (finished === true) continue;

      if (prev === CHAR_DOT$2 && index === start + 1) {
        start += 2;
        continue;
      }

      lastIndex = index + 1;
      continue;
    }

    if (opts.noext !== true) {
      const isExtglobChar = code === CHAR_PLUS$1 || code === CHAR_AT$1 || code === CHAR_ASTERISK$1 || code === CHAR_QUESTION_MARK$1 || code === CHAR_EXCLAMATION_MARK$1;

      if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES$2) {
        isGlob = token.isGlob = true;
        isExtglob = token.isExtglob = true;
        finished = true;

        if (code === CHAR_EXCLAMATION_MARK$1 && index === start) {
          negatedExtglob = true;
        }

        if (scanToEnd === true) {
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_BACKWARD_SLASH$1) {
              backslashes = token.backslashes = true;
              code = advance();
              continue;
            }

            if (code === CHAR_RIGHT_PARENTHESES$2) {
              isGlob = token.isGlob = true;
              finished = true;
              break;
            }
          }

          continue;
        }

        break;
      }
    }

    if (code === CHAR_ASTERISK$1) {
      if (prev === CHAR_ASTERISK$1) isGlobstar = token.isGlobstar = true;
      isGlob = token.isGlob = true;
      finished = true;

      if (scanToEnd === true) {
        continue;
      }

      break;
    }

    if (code === CHAR_QUESTION_MARK$1) {
      isGlob = token.isGlob = true;
      finished = true;

      if (scanToEnd === true) {
        continue;
      }

      break;
    }

    if (code === CHAR_LEFT_SQUARE_BRACKET$2) {
      while (eos() !== true && (next = advance())) {
        if (next === CHAR_BACKWARD_SLASH$1) {
          backslashes = token.backslashes = true;
          advance();
          continue;
        }

        if (next === CHAR_RIGHT_SQUARE_BRACKET$2) {
          isBracket = token.isBracket = true;
          isGlob = token.isGlob = true;
          finished = true;
          break;
        }
      }

      if (scanToEnd === true) {
        continue;
      }

      break;
    }

    if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK$1 && index === start) {
      negated = token.negated = true;
      start++;
      continue;
    }

    if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES$2) {
      isGlob = token.isGlob = true;

      if (scanToEnd === true) {
        while (eos() !== true && (code = advance())) {
          if (code === CHAR_LEFT_PARENTHESES$2) {
            backslashes = token.backslashes = true;
            code = advance();
            continue;
          }

          if (code === CHAR_RIGHT_PARENTHESES$2) {
            finished = true;
            break;
          }
        }

        continue;
      }

      break;
    }

    if (isGlob === true) {
      finished = true;

      if (scanToEnd === true) {
        continue;
      }

      break;
    }
  }

  if (opts.noext === true) {
    isExtglob = false;
    isGlob = false;
  }

  let base = str;
  let prefix = '';
  let glob = '';

  if (start > 0) {
    prefix = str.slice(0, start);
    str = str.slice(start);
    lastIndex -= start;
  }

  if (base && isGlob === true && lastIndex > 0) {
    base = str.slice(0, lastIndex);
    glob = str.slice(lastIndex);
  } else if (isGlob === true) {
    base = '';
    glob = str;
  } else {
    base = str;
  }

  if (base && base !== '' && base !== '/' && base !== str) {
    if (isPathSeparator$1(base.charCodeAt(base.length - 1))) {
      base = base.slice(0, -1);
    }
  }

  if (opts.unescape === true) {
    if (glob) glob = utils$4.removeBackslashes(glob);

    if (base && backslashes === true) {
      base = utils$4.removeBackslashes(base);
    }
  }

  const state = {
    prefix,
    input,
    start,
    base,
    glob,
    isBrace,
    isBracket,
    isGlob,
    isExtglob,
    isGlobstar,
    negated,
    negatedExtglob
  };

  if (opts.tokens === true) {
    state.maxDepth = 0;

    if (!isPathSeparator$1(code)) {
      tokens.push(token);
    }

    state.tokens = tokens;
  }

  if (opts.parts === true || opts.tokens === true) {
    let prevIndex;

    for (let idx = 0; idx < slashes.length; idx++) {
      const n = prevIndex ? prevIndex + 1 : start;
      const i = slashes[idx];
      const value = input.slice(n, i);

      if (opts.tokens) {
        if (idx === 0 && start !== 0) {
          tokens[idx].isPrefix = true;
          tokens[idx].value = prefix;
        } else {
          tokens[idx].value = value;
        }

        depth(tokens[idx]);
        state.maxDepth += tokens[idx].depth;
      }

      if (idx !== 0 || value !== '') {
        parts.push(value);
      }

      prevIndex = i;
    }

    if (prevIndex && prevIndex + 1 < input.length) {
      const value = input.slice(prevIndex + 1);
      parts.push(value);

      if (opts.tokens) {
        tokens[tokens.length - 1].value = value;
        depth(tokens[tokens.length - 1]);
        state.maxDepth += tokens[tokens.length - 1].depth;
      }
    }

    state.slashes = slashes;
    state.parts = parts;
  }

  return state;
};

var scan_1 = scan$2;

const constants$3 = constants$4;

const utils$3 = utils$5;
/**
 * Constants
 */


const {
  MAX_LENGTH: MAX_LENGTH$2,
  POSIX_REGEX_SOURCE: POSIX_REGEX_SOURCE$2,
  REGEX_NON_SPECIAL_CHARS,
  REGEX_SPECIAL_CHARS_BACKREF: REGEX_SPECIAL_CHARS_BACKREF$1,
  REPLACEMENTS: REPLACEMENTS$1
} = constants$3;
/**
 * Helpers
 */

const expandRange$1 = (args, options) => {
  if (typeof options.expandRange === 'function') {
    return options.expandRange(...args, options);
  }

  args.sort();
  const value = `[${args.join('-')}]`;

  try {
    /* eslint-disable-next-line no-new */
    new RegExp(value);
  } catch (ex) {
    return args.map(v => utils$3.escapeRegex(v)).join('..');
  }

  return value;
};
/**
 * Create the message for a syntax error
 */


const syntaxError$1 = (type, char) => {
  return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
};
/**
 * Parse the given input string.
 * @param {String} input
 * @param {Object} options
 * @return {Object}
 */


const parse$3 = (input, options) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected a string');
  }

  input = REPLACEMENTS$1[input] || input;
  const opts = { ...options
  };
  const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH$2, opts.maxLength) : MAX_LENGTH$2;
  let len = input.length;

  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }

  const bos = {
    type: 'bos',
    value: '',
    output: opts.prepend || ''
  };
  const tokens = [bos];
  const capture = opts.capture ? '' : '?:';
  const win32 = utils$3.isWindows(options); // create constants based on platform, for windows or posix

  const PLATFORM_CHARS = constants$3.globChars(win32);
  const EXTGLOB_CHARS = constants$3.extglobChars(PLATFORM_CHARS);
  const {
    DOT_LITERAL,
    PLUS_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOT_SLASH,
    NO_DOTS_SLASH,
    QMARK,
    QMARK_NO_DOT,
    STAR,
    START_ANCHOR
  } = PLATFORM_CHARS;

  const globstar = opts => {
    return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
  };

  const nodot = opts.dot ? '' : NO_DOT;
  const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
  let star = opts.bash === true ? globstar(opts) : STAR;

  if (opts.capture) {
    star = `(${star})`;
  } // minimatch options support


  if (typeof opts.noext === 'boolean') {
    opts.noextglob = opts.noext;
  }

  const state = {
    input,
    index: -1,
    start: 0,
    dot: opts.dot === true,
    consumed: '',
    output: '',
    prefix: '',
    backtrack: false,
    negated: false,
    brackets: 0,
    braces: 0,
    parens: 0,
    quotes: 0,
    globstar: false,
    tokens
  };
  input = utils$3.removePrefix(input, state);
  len = input.length;
  const extglobs = [];
  const braces = [];
  const stack = [];
  let prev = bos;
  let value;
  /**
   * Tokenizing helpers
   */

  const eos = () => state.index === len - 1;

  const peek = state.peek = (n = 1) => input[state.index + n];

  const advance = state.advance = () => input[++state.index] || '';

  const remaining = () => input.slice(state.index + 1);

  const consume = (value = '', num = 0) => {
    state.consumed += value;
    state.index += num;
  };

  const append = token => {
    state.output += token.output != null ? token.output : token.value;
    consume(token.value);
  };

  const negate = () => {
    let count = 1;

    while (peek() === '!' && (peek(2) !== '(' || peek(3) === '?')) {
      advance();
      state.start++;
      count++;
    }

    if (count % 2 === 0) {
      return false;
    }

    state.negated = true;
    state.start++;
    return true;
  };

  const increment = type => {
    state[type]++;
    stack.push(type);
  };

  const decrement = type => {
    state[type]--;
    stack.pop();
  };
  /**
   * Push tokens onto the tokens array. This helper speeds up
   * tokenizing by 1) helping us avoid backtracking as much as possible,
   * and 2) helping us avoid creating extra tokens when consecutive
   * characters are plain text. This improves performance and simplifies
   * lookbehinds.
   */


  const push = tok => {
    if (prev.type === 'globstar') {
      const isBrace = state.braces > 0 && (tok.type === 'comma' || tok.type === 'brace');
      const isExtglob = tok.extglob === true || extglobs.length && (tok.type === 'pipe' || tok.type === 'paren');

      if (tok.type !== 'slash' && tok.type !== 'paren' && !isBrace && !isExtglob) {
        state.output = state.output.slice(0, -prev.output.length);
        prev.type = 'star';
        prev.value = '*';
        prev.output = star;
        state.output += prev.output;
      }
    }

    if (extglobs.length && tok.type !== 'paren') {
      extglobs[extglobs.length - 1].inner += tok.value;
    }

    if (tok.value || tok.output) append(tok);

    if (prev && prev.type === 'text' && tok.type === 'text') {
      prev.value += tok.value;
      prev.output = (prev.output || '') + tok.value;
      return;
    }

    tok.prev = prev;
    tokens.push(tok);
    prev = tok;
  };

  const extglobOpen = (type, value) => {
    const token = { ...EXTGLOB_CHARS[value],
      conditions: 1,
      inner: ''
    };
    token.prev = prev;
    token.parens = state.parens;
    token.output = state.output;
    const output = (opts.capture ? '(' : '') + token.open;
    increment('parens');
    push({
      type,
      value,
      output: state.output ? '' : ONE_CHAR
    });
    push({
      type: 'paren',
      extglob: true,
      value: advance(),
      output
    });
    extglobs.push(token);
  };

  const extglobClose = token => {
    let output = token.close + (opts.capture ? ')' : '');
    let rest;

    if (token.type === 'negate') {
      let extglobStar = star;

      if (token.inner && token.inner.length > 1 && token.inner.includes('/')) {
        extglobStar = globstar(opts);
      }

      if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
        output = token.close = `)$))${extglobStar}`;
      }

      if (token.inner.includes('*') && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
        // Any non-magical string (`.ts`) or even nested expression (`.{ts,tsx}`) can follow after the closing parenthesis.
        // In this case, we need to parse the string and use it in the output of the original pattern.
        // Suitable patterns: `/!(*.d).ts`, `/!(*.d).{ts,tsx}`, `**/!(*-dbg).@(js)`.
        //
        // Disabling the `fastpaths` option due to a problem with parsing strings as `.ts` in the pattern like `**/!(*.d).ts`.
        const expression = parse$3(rest, { ...options,
          fastpaths: false
        }).output;
        output = token.close = `)${expression})${extglobStar})`;
      }

      if (token.prev.type === 'bos') {
        state.negatedExtglob = true;
      }
    }

    push({
      type: 'paren',
      extglob: true,
      value,
      output
    });
    decrement('parens');
  };
  /**
   * Fast paths
   */


  if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
    let backslashes = false;
    let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF$1, (m, esc, chars, first, rest, index) => {
      if (first === '\\') {
        backslashes = true;
        return m;
      }

      if (first === '?') {
        if (esc) {
          return esc + first + (rest ? QMARK.repeat(rest.length) : '');
        }

        if (index === 0) {
          return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : '');
        }

        return QMARK.repeat(chars.length);
      }

      if (first === '.') {
        return DOT_LITERAL.repeat(chars.length);
      }

      if (first === '*') {
        if (esc) {
          return esc + first + (rest ? star : '');
        }

        return star;
      }

      return esc ? m : `\\${m}`;
    });

    if (backslashes === true) {
      if (opts.unescape === true) {
        output = output.replace(/\\/g, '');
      } else {
        output = output.replace(/\\+/g, m => {
          return m.length % 2 === 0 ? '\\\\' : m ? '\\' : '';
        });
      }
    }

    if (output === input && opts.contains === true) {
      state.output = input;
      return state;
    }

    state.output = utils$3.wrapOutput(output, state, options);
    return state;
  }
  /**
   * Tokenize input until we reach end-of-string
   */


  while (!eos()) {
    value = advance();

    if (value === '\u0000') {
      continue;
    }
    /**
     * Escaped characters
     */


    if (value === '\\') {
      const next = peek();

      if (next === '/' && opts.bash !== true) {
        continue;
      }

      if (next === '.' || next === ';') {
        continue;
      }

      if (!next) {
        value += '\\';
        push({
          type: 'text',
          value
        });
        continue;
      } // collapse slashes to reduce potential for exploits


      const match = /^\\+/.exec(remaining());
      let slashes = 0;

      if (match && match[0].length > 2) {
        slashes = match[0].length;
        state.index += slashes;

        if (slashes % 2 !== 0) {
          value += '\\';
        }
      }

      if (opts.unescape === true) {
        value = advance();
      } else {
        value += advance();
      }

      if (state.brackets === 0) {
        push({
          type: 'text',
          value
        });
        continue;
      }
    }
    /**
     * If we're inside a regex character class, continue
     * until we reach the closing bracket.
     */


    if (state.brackets > 0 && (value !== ']' || prev.value === '[' || prev.value === '[^')) {
      if (opts.posix !== false && value === ':') {
        const inner = prev.value.slice(1);

        if (inner.includes('[')) {
          prev.posix = true;

          if (inner.includes(':')) {
            const idx = prev.value.lastIndexOf('[');
            const pre = prev.value.slice(0, idx);
            const rest = prev.value.slice(idx + 2);
            const posix = POSIX_REGEX_SOURCE$2[rest];

            if (posix) {
              prev.value = pre + posix;
              state.backtrack = true;
              advance();

              if (!bos.output && tokens.indexOf(prev) === 1) {
                bos.output = ONE_CHAR;
              }

              continue;
            }
          }
        }
      }

      if (value === '[' && peek() !== ':' || value === '-' && peek() === ']') {
        value = `\\${value}`;
      }

      if (value === ']' && (prev.value === '[' || prev.value === '[^')) {
        value = `\\${value}`;
      }

      if (opts.posix === true && value === '!' && prev.value === '[') {
        value = '^';
      }

      prev.value += value;
      append({
        value
      });
      continue;
    }
    /**
     * If we're inside a quoted string, continue
     * until we reach the closing double quote.
     */


    if (state.quotes === 1 && value !== '"') {
      value = utils$3.escapeRegex(value);
      prev.value += value;
      append({
        value
      });
      continue;
    }
    /**
     * Double quotes
     */


    if (value === '"') {
      state.quotes = state.quotes === 1 ? 0 : 1;

      if (opts.keepQuotes === true) {
        push({
          type: 'text',
          value
        });
      }

      continue;
    }
    /**
     * Parentheses
     */


    if (value === '(') {
      increment('parens');
      push({
        type: 'paren',
        value
      });
      continue;
    }

    if (value === ')') {
      if (state.parens === 0 && opts.strictBrackets === true) {
        throw new SyntaxError(syntaxError$1('opening', '('));
      }

      const extglob = extglobs[extglobs.length - 1];

      if (extglob && state.parens === extglob.parens + 1) {
        extglobClose(extglobs.pop());
        continue;
      }

      push({
        type: 'paren',
        value,
        output: state.parens ? ')' : '\\)'
      });
      decrement('parens');
      continue;
    }
    /**
     * Square brackets
     */


    if (value === '[') {
      if (opts.nobracket === true || !remaining().includes(']')) {
        if (opts.nobracket !== true && opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError$1('closing', ']'));
        }

        value = `\\${value}`;
      } else {
        increment('brackets');
      }

      push({
        type: 'bracket',
        value
      });
      continue;
    }

    if (value === ']') {
      if (opts.nobracket === true || prev && prev.type === 'bracket' && prev.value.length === 1) {
        push({
          type: 'text',
          value,
          output: `\\${value}`
        });
        continue;
      }

      if (state.brackets === 0) {
        if (opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError$1('opening', '['));
        }

        push({
          type: 'text',
          value,
          output: `\\${value}`
        });
        continue;
      }

      decrement('brackets');
      const prevValue = prev.value.slice(1);

      if (prev.posix !== true && prevValue[0] === '^' && !prevValue.includes('/')) {
        value = `/${value}`;
      }

      prev.value += value;
      append({
        value
      }); // when literal brackets are explicitly disabled
      // assume we should match with a regex character class

      if (opts.literalBrackets === false || utils$3.hasRegexChars(prevValue)) {
        continue;
      }

      const escaped = utils$3.escapeRegex(prev.value);
      state.output = state.output.slice(0, -prev.value.length); // when literal brackets are explicitly enabled
      // assume we should escape the brackets to match literal characters

      if (opts.literalBrackets === true) {
        state.output += escaped;
        prev.value = escaped;
        continue;
      } // when the user specifies nothing, try to match both


      prev.value = `(${capture}${escaped}|${prev.value})`;
      state.output += prev.value;
      continue;
    }
    /**
     * Braces
     */


    if (value === '{' && opts.nobrace !== true) {
      increment('braces');
      const open = {
        type: 'brace',
        value,
        output: '(',
        outputIndex: state.output.length,
        tokensIndex: state.tokens.length
      };
      braces.push(open);
      push(open);
      continue;
    }

    if (value === '}') {
      const brace = braces[braces.length - 1];

      if (opts.nobrace === true || !brace) {
        push({
          type: 'text',
          value,
          output: value
        });
        continue;
      }

      let output = ')';

      if (brace.dots === true) {
        const arr = tokens.slice();
        const range = [];

        for (let i = arr.length - 1; i >= 0; i--) {
          tokens.pop();

          if (arr[i].type === 'brace') {
            break;
          }

          if (arr[i].type !== 'dots') {
            range.unshift(arr[i].value);
          }
        }

        output = expandRange$1(range, opts);
        state.backtrack = true;
      }

      if (brace.comma !== true && brace.dots !== true) {
        const out = state.output.slice(0, brace.outputIndex);
        const toks = state.tokens.slice(brace.tokensIndex);
        brace.value = brace.output = '\\{';
        value = output = '\\}';
        state.output = out;

        for (const t of toks) {
          state.output += t.output || t.value;
        }
      }

      push({
        type: 'brace',
        value,
        output
      });
      decrement('braces');
      braces.pop();
      continue;
    }
    /**
     * Pipes
     */


    if (value === '|') {
      if (extglobs.length > 0) {
        extglobs[extglobs.length - 1].conditions++;
      }

      push({
        type: 'text',
        value
      });
      continue;
    }
    /**
     * Commas
     */


    if (value === ',') {
      let output = value;
      const brace = braces[braces.length - 1];

      if (brace && stack[stack.length - 1] === 'braces') {
        brace.comma = true;
        output = '|';
      }

      push({
        type: 'comma',
        value,
        output
      });
      continue;
    }
    /**
     * Slashes
     */


    if (value === '/') {
      // if the beginning of the glob is "./", advance the start
      // to the current index, and don't add the "./" characters
      // to the state. This greatly simplifies lookbehinds when
      // checking for BOS characters like "!" and "." (not "./")
      if (prev.type === 'dot' && state.index === state.start + 1) {
        state.start = state.index + 1;
        state.consumed = '';
        state.output = '';
        tokens.pop();
        prev = bos; // reset "prev" to the first token

        continue;
      }

      push({
        type: 'slash',
        value,
        output: SLASH_LITERAL
      });
      continue;
    }
    /**
     * Dots
     */


    if (value === '.') {
      if (state.braces > 0 && prev.type === 'dot') {
        if (prev.value === '.') prev.output = DOT_LITERAL;
        const brace = braces[braces.length - 1];
        prev.type = 'dots';
        prev.output += value;
        prev.value += value;
        brace.dots = true;
        continue;
      }

      if (state.braces + state.parens === 0 && prev.type !== 'bos' && prev.type !== 'slash') {
        push({
          type: 'text',
          value,
          output: DOT_LITERAL
        });
        continue;
      }

      push({
        type: 'dot',
        value,
        output: DOT_LITERAL
      });
      continue;
    }
    /**
     * Question marks
     */


    if (value === '?') {
      const isGroup = prev && prev.value === '(';

      if (!isGroup && opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        extglobOpen('qmark', value);
        continue;
      }

      if (prev && prev.type === 'paren') {
        const next = peek();
        let output = value;

        if (next === '<' && !utils$3.supportsLookbehinds()) {
          throw new Error('Node.js v10 or higher is required for regex lookbehinds');
        }

        if (prev.value === '(' && !/[!=<:]/.test(next) || next === '<' && !/<([!=]|\w+>)/.test(remaining())) {
          output = `\\${value}`;
        }

        push({
          type: 'text',
          value,
          output
        });
        continue;
      }

      if (opts.dot !== true && (prev.type === 'slash' || prev.type === 'bos')) {
        push({
          type: 'qmark',
          value,
          output: QMARK_NO_DOT
        });
        continue;
      }

      push({
        type: 'qmark',
        value,
        output: QMARK
      });
      continue;
    }
    /**
     * Exclamation
     */


    if (value === '!') {
      if (opts.noextglob !== true && peek() === '(') {
        if (peek(2) !== '?' || !/[!=<:]/.test(peek(3))) {
          extglobOpen('negate', value);
          continue;
        }
      }

      if (opts.nonegate !== true && state.index === 0) {
        negate();
        continue;
      }
    }
    /**
     * Plus
     */


    if (value === '+') {
      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        extglobOpen('plus', value);
        continue;
      }

      if (prev && prev.value === '(' || opts.regex === false) {
        push({
          type: 'plus',
          value,
          output: PLUS_LITERAL
        });
        continue;
      }

      if (prev && (prev.type === 'bracket' || prev.type === 'paren' || prev.type === 'brace') || state.parens > 0) {
        push({
          type: 'plus',
          value
        });
        continue;
      }

      push({
        type: 'plus',
        value: PLUS_LITERAL
      });
      continue;
    }
    /**
     * Plain text
     */


    if (value === '@') {
      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        push({
          type: 'at',
          extglob: true,
          value,
          output: ''
        });
        continue;
      }

      push({
        type: 'text',
        value
      });
      continue;
    }
    /**
     * Plain text
     */


    if (value !== '*') {
      if (value === '$' || value === '^') {
        value = `\\${value}`;
      }

      const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());

      if (match) {
        value += match[0];
        state.index += match[0].length;
      }

      push({
        type: 'text',
        value
      });
      continue;
    }
    /**
     * Stars
     */


    if (prev && (prev.type === 'globstar' || prev.star === true)) {
      prev.type = 'star';
      prev.star = true;
      prev.value += value;
      prev.output = star;
      state.backtrack = true;
      state.globstar = true;
      consume(value);
      continue;
    }

    let rest = remaining();

    if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
      extglobOpen('star', value);
      continue;
    }

    if (prev.type === 'star') {
      if (opts.noglobstar === true) {
        consume(value);
        continue;
      }

      const prior = prev.prev;
      const before = prior.prev;
      const isStart = prior.type === 'slash' || prior.type === 'bos';
      const afterStar = before && (before.type === 'star' || before.type === 'globstar');

      if (opts.bash === true && (!isStart || rest[0] && rest[0] !== '/')) {
        push({
          type: 'star',
          value,
          output: ''
        });
        continue;
      }

      const isBrace = state.braces > 0 && (prior.type === 'comma' || prior.type === 'brace');
      const isExtglob = extglobs.length && (prior.type === 'pipe' || prior.type === 'paren');

      if (!isStart && prior.type !== 'paren' && !isBrace && !isExtglob) {
        push({
          type: 'star',
          value,
          output: ''
        });
        continue;
      } // strip consecutive `/**/`


      while (rest.slice(0, 3) === '/**') {
        const after = input[state.index + 4];

        if (after && after !== '/') {
          break;
        }

        rest = rest.slice(3);
        consume('/**', 3);
      }

      if (prior.type === 'bos' && eos()) {
        prev.type = 'globstar';
        prev.value += value;
        prev.output = globstar(opts);
        state.output = prev.output;
        state.globstar = true;
        consume(value);
        continue;
      }

      if (prior.type === 'slash' && prior.prev.type !== 'bos' && !afterStar && eos()) {
        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = `(?:${prior.output}`;
        prev.type = 'globstar';
        prev.output = globstar(opts) + (opts.strictSlashes ? ')' : '|$)');
        prev.value += value;
        state.globstar = true;
        state.output += prior.output + prev.output;
        consume(value);
        continue;
      }

      if (prior.type === 'slash' && prior.prev.type !== 'bos' && rest[0] === '/') {
        const end = rest[1] !== void 0 ? '|$' : '';
        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = `(?:${prior.output}`;
        prev.type = 'globstar';
        prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
        prev.value += value;
        state.output += prior.output + prev.output;
        state.globstar = true;
        consume(value + advance());
        push({
          type: 'slash',
          value: '/',
          output: ''
        });
        continue;
      }

      if (prior.type === 'bos' && rest[0] === '/') {
        prev.type = 'globstar';
        prev.value += value;
        prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
        state.output = prev.output;
        state.globstar = true;
        consume(value + advance());
        push({
          type: 'slash',
          value: '/',
          output: ''
        });
        continue;
      } // remove single star from output


      state.output = state.output.slice(0, -prev.output.length); // reset previous token to globstar

      prev.type = 'globstar';
      prev.output = globstar(opts);
      prev.value += value; // reset output with globstar

      state.output += prev.output;
      state.globstar = true;
      consume(value);
      continue;
    }

    const token = {
      type: 'star',
      value,
      output: star
    };

    if (opts.bash === true) {
      token.output = '.*?';

      if (prev.type === 'bos' || prev.type === 'slash') {
        token.output = nodot + token.output;
      }

      push(token);
      continue;
    }

    if (prev && (prev.type === 'bracket' || prev.type === 'paren') && opts.regex === true) {
      token.output = value;
      push(token);
      continue;
    }

    if (state.index === state.start || prev.type === 'slash' || prev.type === 'dot') {
      if (prev.type === 'dot') {
        state.output += NO_DOT_SLASH;
        prev.output += NO_DOT_SLASH;
      } else if (opts.dot === true) {
        state.output += NO_DOTS_SLASH;
        prev.output += NO_DOTS_SLASH;
      } else {
        state.output += nodot;
        prev.output += nodot;
      }

      if (peek() !== '*') {
        state.output += ONE_CHAR;
        prev.output += ONE_CHAR;
      }
    }

    push(token);
  }

  while (state.brackets > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError$1('closing', ']'));
    state.output = utils$3.escapeLast(state.output, '[');
    decrement('brackets');
  }

  while (state.parens > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError$1('closing', ')'));
    state.output = utils$3.escapeLast(state.output, '(');
    decrement('parens');
  }

  while (state.braces > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError$1('closing', '}'));
    state.output = utils$3.escapeLast(state.output, '{');
    decrement('braces');
  }

  if (opts.strictSlashes !== true && (prev.type === 'star' || prev.type === 'bracket')) {
    push({
      type: 'maybe_slash',
      value: '',
      output: `${SLASH_LITERAL}?`
    });
  } // rebuild the output if we had to backtrack at any point


  if (state.backtrack === true) {
    state.output = '';

    for (const token of state.tokens) {
      state.output += token.output != null ? token.output : token.value;

      if (token.suffix) {
        state.output += token.suffix;
      }
    }
  }

  return state;
};
/**
 * Fast paths for creating regular expressions for common glob patterns.
 * This can significantly speed up processing and has very little downside
 * impact when none of the fast paths match.
 */


parse$3.fastpaths = (input, options) => {
  const opts = { ...options
  };
  const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH$2, opts.maxLength) : MAX_LENGTH$2;
  const len = input.length;

  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }

  input = REPLACEMENTS$1[input] || input;
  const win32 = utils$3.isWindows(options); // create constants based on platform, for windows or posix

  const {
    DOT_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOTS,
    NO_DOTS_SLASH,
    STAR,
    START_ANCHOR
  } = constants$3.globChars(win32);
  const nodot = opts.dot ? NO_DOTS : NO_DOT;
  const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
  const capture = opts.capture ? '' : '?:';
  const state = {
    negated: false,
    prefix: ''
  };
  let star = opts.bash === true ? '.*?' : STAR;

  if (opts.capture) {
    star = `(${star})`;
  }

  const globstar = opts => {
    if (opts.noglobstar === true) return star;
    return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
  };

  const create = str => {
    switch (str) {
      case '*':
        return `${nodot}${ONE_CHAR}${star}`;

      case '.*':
        return `${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '*.*':
        return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '*/*':
        return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;

      case '**':
        return nodot + globstar(opts);

      case '**/*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;

      case '**/*.*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '**/.*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;

      default:
        {
          const match = /^(.*?)\.(\w+)$/.exec(str);
          if (!match) return;
          const source = create(match[1]);
          if (!source) return;
          return source + DOT_LITERAL + match[2];
        }
    }
  };

  const output = utils$3.removePrefix(input, state);
  let source = create(output);

  if (source && opts.strictSlashes !== true) {
    source += `${SLASH_LITERAL}?`;
  }

  return source;
};

var parse_1$2 = parse$3;

const path = path__default["default"];

const scan$1 = scan_1;

const parse$2 = parse_1$2;

const utils$2 = utils$5;

const constants$2 = constants$4;

const isObject$2 = val => val && typeof val === 'object' && !Array.isArray(val);
/**
 * Creates a matcher function from one or more glob patterns. The
 * returned function takes a string to match as its first argument,
 * and returns true if the string is a match. The returned matcher
 * function also takes a boolean as the second argument that, when true,
 * returns an object with additional information.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch(glob[, options]);
 *
 * const isMatch = picomatch('*.!(*a)');
 * console.log(isMatch('a.a')); //=> false
 * console.log(isMatch('a.b')); //=> true
 * ```
 * @name picomatch
 * @param {String|Array} `globs` One or more glob patterns.
 * @param {Object=} `options`
 * @return {Function=} Returns a matcher function.
 * @api public
 */


const picomatch$3 = (glob, options, returnState = false) => {
  if (Array.isArray(glob)) {
    const fns = glob.map(input => picomatch$3(input, options, returnState));

    const arrayMatcher = str => {
      for (const isMatch of fns) {
        const state = isMatch(str);
        if (state) return state;
      }

      return false;
    };

    return arrayMatcher;
  }

  const isState = isObject$2(glob) && glob.tokens && glob.input;

  if (glob === '' || typeof glob !== 'string' && !isState) {
    throw new TypeError('Expected pattern to be a non-empty string');
  }

  const opts = options || {};
  const posix = utils$2.isWindows(options);
  const regex = isState ? picomatch$3.compileRe(glob, options) : picomatch$3.makeRe(glob, options, false, true);
  const state = regex.state;
  delete regex.state;

  let isIgnored = () => false;

  if (opts.ignore) {
    const ignoreOpts = { ...options,
      ignore: null,
      onMatch: null,
      onResult: null
    };
    isIgnored = picomatch$3(opts.ignore, ignoreOpts, returnState);
  }

  const matcher = (input, returnObject = false) => {
    const {
      isMatch,
      match,
      output
    } = picomatch$3.test(input, regex, options, {
      glob,
      posix
    });
    const result = {
      glob,
      state,
      regex,
      posix,
      input,
      output,
      match,
      isMatch
    };

    if (typeof opts.onResult === 'function') {
      opts.onResult(result);
    }

    if (isMatch === false) {
      result.isMatch = false;
      return returnObject ? result : false;
    }

    if (isIgnored(input)) {
      if (typeof opts.onIgnore === 'function') {
        opts.onIgnore(result);
      }

      result.isMatch = false;
      return returnObject ? result : false;
    }

    if (typeof opts.onMatch === 'function') {
      opts.onMatch(result);
    }

    return returnObject ? result : true;
  };

  if (returnState) {
    matcher.state = state;
  }

  return matcher;
};
/**
 * Test `input` with the given `regex`. This is used by the main
 * `picomatch()` function to test the input string.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.test(input, regex[, options]);
 *
 * console.log(picomatch.test('foo/bar', /^(?:([^/]*?)\/([^/]*?))$/));
 * // { isMatch: true, match: [ 'foo/', 'foo', 'bar' ], output: 'foo/bar' }
 * ```
 * @param {String} `input` String to test.
 * @param {RegExp} `regex`
 * @return {Object} Returns an object with matching info.
 * @api public
 */


picomatch$3.test = (input, regex, options, {
  glob,
  posix
} = {}) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected input to be a string');
  }

  if (input === '') {
    return {
      isMatch: false,
      output: ''
    };
  }

  const opts = options || {};
  const format = opts.format || (posix ? utils$2.toPosixSlashes : null);
  let match = input === glob;
  let output = match && format ? format(input) : input;

  if (match === false) {
    output = format ? format(input) : input;
    match = output === glob;
  }

  if (match === false || opts.capture === true) {
    if (opts.matchBase === true || opts.basename === true) {
      match = picomatch$3.matchBase(input, regex, options, posix);
    } else {
      match = regex.exec(output);
    }
  }

  return {
    isMatch: Boolean(match),
    match,
    output
  };
};
/**
 * Match the basename of a filepath.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.matchBase(input, glob[, options]);
 * console.log(picomatch.matchBase('foo/bar.js', '*.js'); // true
 * ```
 * @param {String} `input` String to test.
 * @param {RegExp|String} `glob` Glob pattern or regex created by [.makeRe](#makeRe).
 * @return {Boolean}
 * @api public
 */


picomatch$3.matchBase = (input, glob, options, posix = utils$2.isWindows(options)) => {
  const regex = glob instanceof RegExp ? glob : picomatch$3.makeRe(glob, options);
  return regex.test(path.basename(input));
};
/**
 * Returns true if **any** of the given glob `patterns` match the specified `string`.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.isMatch(string, patterns[, options]);
 *
 * console.log(picomatch.isMatch('a.a', ['b.*', '*.a'])); //=> true
 * console.log(picomatch.isMatch('a.a', 'b.*')); //=> false
 * ```
 * @param {String|Array} str The string to test.
 * @param {String|Array} patterns One or more glob patterns to use for matching.
 * @param {Object} [options] See available [options](#options).
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */


picomatch$3.isMatch = (str, patterns, options) => picomatch$3(patterns, options)(str);
/**
 * Parse a glob pattern to create the source string for a regular
 * expression.
 *
 * ```js
 * const picomatch = require('picomatch');
 * const result = picomatch.parse(pattern[, options]);
 * ```
 * @param {String} `pattern`
 * @param {Object} `options`
 * @return {Object} Returns an object with useful properties and output to be used as a regex source string.
 * @api public
 */


picomatch$3.parse = (pattern, options) => {
  if (Array.isArray(pattern)) return pattern.map(p => picomatch$3.parse(p, options));
  return parse$2(pattern, { ...options,
    fastpaths: false
  });
};
/**
 * Scan a glob pattern to separate the pattern into segments.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.scan(input[, options]);
 *
 * const result = picomatch.scan('!./foo/*.js');
 * console.log(result);
 * { prefix: '!./',
 *   input: '!./foo/*.js',
 *   start: 3,
 *   base: 'foo',
 *   glob: '*.js',
 *   isBrace: false,
 *   isBracket: false,
 *   isGlob: true,
 *   isExtglob: false,
 *   isGlobstar: false,
 *   negated: true }
 * ```
 * @param {String} `input` Glob pattern to scan.
 * @param {Object} `options`
 * @return {Object} Returns an object with
 * @api public
 */


picomatch$3.scan = (input, options) => scan$1(input, options);
/**
 * Compile a regular expression from the `state` object returned by the
 * [parse()](#parse) method.
 *
 * @param {Object} `state`
 * @param {Object} `options`
 * @param {Boolean} `returnOutput` Intended for implementors, this argument allows you to return the raw output from the parser.
 * @param {Boolean} `returnState` Adds the state to a `state` property on the returned regex. Useful for implementors and debugging.
 * @return {RegExp}
 * @api public
 */


picomatch$3.compileRe = (state, options, returnOutput = false, returnState = false) => {
  if (returnOutput === true) {
    return state.output;
  }

  const opts = options || {};
  const prepend = opts.contains ? '' : '^';
  const append = opts.contains ? '' : '$';
  let source = `${prepend}(?:${state.output})${append}`;

  if (state && state.negated === true) {
    source = `^(?!${source}).*$`;
  }

  const regex = picomatch$3.toRegex(source, options);

  if (returnState === true) {
    regex.state = state;
  }

  return regex;
};
/**
 * Create a regular expression from a parsed glob pattern.
 *
 * ```js
 * const picomatch = require('picomatch');
 * const state = picomatch.parse('*.js');
 * // picomatch.compileRe(state[, options]);
 *
 * console.log(picomatch.compileRe(state));
 * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
 * ```
 * @param {String} `state` The object returned from the `.parse` method.
 * @param {Object} `options`
 * @param {Boolean} `returnOutput` Implementors may use this argument to return the compiled output, instead of a regular expression. This is not exposed on the options to prevent end-users from mutating the result.
 * @param {Boolean} `returnState` Implementors may use this argument to return the state from the parsed glob with the returned regular expression.
 * @return {RegExp} Returns a regex created from the given pattern.
 * @api public
 */


picomatch$3.makeRe = (input, options = {}, returnOutput = false, returnState = false) => {
  if (!input || typeof input !== 'string') {
    throw new TypeError('Expected a non-empty string');
  }

  let parsed = {
    negated: false,
    fastpaths: true
  };

  if (options.fastpaths !== false && (input[0] === '.' || input[0] === '*')) {
    parsed.output = parse$2.fastpaths(input, options);
  }

  if (!parsed.output) {
    parsed = parse$2(input, options);
  }

  return picomatch$3.compileRe(parsed, options, returnOutput, returnState);
};
/**
 * Create a regular expression from the given regex source string.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.toRegex(source[, options]);
 *
 * const { output } = picomatch.parse('*.js');
 * console.log(picomatch.toRegex(output));
 * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
 * ```
 * @param {String} `source` Regular expression source string.
 * @param {Object} `options`
 * @return {RegExp}
 * @api public
 */


picomatch$3.toRegex = (source, options) => {
  try {
    const opts = options || {};
    return new RegExp(source, opts.flags || (opts.nocase ? 'i' : ''));
  } catch (err) {
    if (options && options.debug === true) throw err;
    return /$^/;
  }
};
/**
 * Picomatch constants.
 * @return {Object}
 */


picomatch$3.constants = constants$2;
/**
 * Expose "picomatch"
 */

var picomatch_1$1 = picomatch$3;

var picomatch$2 = picomatch_1$1;

function walk$1(ast, {
  enter,
  leave
}) {
  return visit(ast, null, enter, leave);
}

let should_skip = false;
let should_remove = false;
let replacement = null;
const context = {
  skip: () => should_skip = true,
  remove: () => should_remove = true,
  replace: node => replacement = node
};

function replace(parent, prop, index, node) {
  if (parent) {
    if (index !== null) {
      parent[prop][index] = node;
    } else {
      parent[prop] = node;
    }
  }
}

function remove(parent, prop, index) {
  if (parent) {
    if (index !== null) {
      parent[prop].splice(index, 1);
    } else {
      delete parent[prop];
    }
  }
}

function visit(node, parent, enter, leave, prop, index) {
  if (node) {
    if (enter) {
      const _should_skip = should_skip;
      const _should_remove = should_remove;
      const _replacement = replacement;
      should_skip = false;
      should_remove = false;
      replacement = null;
      enter.call(context, node, parent, prop, index);

      if (replacement) {
        node = replacement;
        replace(parent, prop, index, node);
      }

      if (should_remove) {
        remove(parent, prop, index);
      }

      const skipped = should_skip;
      const removed = should_remove;
      should_skip = _should_skip;
      should_remove = _should_remove;
      replacement = _replacement;
      if (skipped) return node;
      if (removed) return null;
    }

    for (const key in node) {
      const value = node[key];

      if (typeof value !== 'object') {
        continue;
      } else if (Array.isArray(value)) {
        for (let j = 0, k = 0; j < value.length; j += 1, k += 1) {
          if (value[j] !== null && typeof value[j].type === 'string') {
            if (!visit(value[j], node, enter, leave, key, k)) {
              // removed
              j--;
            }
          }
        }
      } else if (value !== null && typeof value.type === 'string') {
        visit(value, node, enter, leave, key, null);
      }
    }

    if (leave) {
      const _replacement = replacement;
      const _should_remove = should_remove;
      replacement = null;
      should_remove = false;
      leave.call(context, node, parent, prop, index);

      if (replacement) {
        node = replacement;
        replace(parent, prop, index, node);
      }

      if (should_remove) {
        remove(parent, prop, index);
      }

      const removed = should_remove;
      replacement = _replacement;
      should_remove = _should_remove;
      if (removed) return null;
    }
  }

  return node;
}

const extractors = {
  ArrayPattern(names, param) {
    for (const element of param.elements) {
      if (element) extractors[element.type](names, element);
    }
  },

  AssignmentPattern(names, param) {
    extractors[param.left.type](names, param.left);
  },

  Identifier(names, param) {
    names.push(param.name);
  },

  MemberExpression() {},

  ObjectPattern(names, param) {
    for (const prop of param.properties) {
      // @ts-ignore Typescript reports that this is not a valid type
      if (prop.type === 'RestElement') {
        extractors.RestElement(names, prop);
      } else {
        extractors[prop.value.type](names, prop.value);
      }
    }
  },

  RestElement(names, param) {
    extractors[param.argument.type](names, param.argument);
  }

};

const extractAssignedNames = function extractAssignedNames(param) {
  const names = [];
  extractors[param.type](names, param);
  return names;
};

const blockDeclarations = {
  const: true,
  let: true
};

class Scope {
  constructor(options = {}) {
    this.parent = options.parent;
    this.isBlockScope = !!options.block;
    this.declarations = Object.create(null);

    if (options.params) {
      options.params.forEach(param => {
        extractAssignedNames(param).forEach(name => {
          this.declarations[name] = true;
        });
      });
    }
  }

  addDeclaration(node, isBlockDeclaration, isVar) {
    if (!isBlockDeclaration && this.isBlockScope) {
      // it's a `var` or function node, and this
      // is a block scope, so we need to go up
      this.parent.addDeclaration(node, isBlockDeclaration, isVar);
    } else if (node.id) {
      extractAssignedNames(node.id).forEach(name => {
        this.declarations[name] = true;
      });
    }
  }

  contains(name) {
    return this.declarations[name] || (this.parent ? this.parent.contains(name) : false);
  }

}

const attachScopes = function attachScopes(ast, propertyName = 'scope') {
  let scope = new Scope();
  walk$1(ast, {
    enter(n, parent) {
      const node = n; // function foo () {...}
      // class Foo {...}

      if (/(Function|Class)Declaration/.test(node.type)) {
        scope.addDeclaration(node, false, false);
      } // var foo = 1


      if (node.type === 'VariableDeclaration') {
        const {
          kind
        } = node;
        const isBlockDeclaration = blockDeclarations[kind]; // don't add const/let declarations in the body of a for loop #113

        const parentType = parent ? parent.type : '';

        if (!(isBlockDeclaration && /ForOfStatement/.test(parentType))) {
          node.declarations.forEach(declaration => {
            scope.addDeclaration(declaration, isBlockDeclaration, true);
          });
        }
      }

      let newScope; // create new function scope

      if (/Function/.test(node.type)) {
        const func = node;
        newScope = new Scope({
          parent: scope,
          block: false,
          params: func.params
        }); // named function expressions - the name is considered
        // part of the function's scope

        if (func.type === 'FunctionExpression' && func.id) {
          newScope.addDeclaration(func, false, false);
        }
      } // create new block scope


      if (node.type === 'BlockStatement' && !/Function/.test(parent.type)) {
        newScope = new Scope({
          parent: scope,
          block: true
        });
      } // catch clause has its own block scope


      if (node.type === 'CatchClause') {
        newScope = new Scope({
          parent: scope,
          params: node.param ? [node.param] : [],
          block: true
        });
      }

      if (newScope) {
        Object.defineProperty(node, propertyName, {
          value: newScope,
          configurable: true
        });
        scope = newScope;
      }
    },

    leave(n) {
      const node = n;
      if (node[propertyName]) scope = scope.parent;
    }

  });
  return scope;
}; // Helper since Typescript can't detect readonly arrays with Array.isArray


function isArray(arg) {
  return Array.isArray(arg);
}

function ensureArray$1(thing) {
  if (isArray(thing)) return thing;
  if (thing == null) return [];
  return [thing];
}

function getMatcherString$1(id, resolutionBase) {
  if (resolutionBase === false) {
    return id;
  } // resolve('') is valid and will default to process.cwd()


  const basePath = path$2.resolve(resolutionBase || '').split(path$2.sep).join('/') // escape all possible (posix + win) path characters that might interfere with regex
  .replace(/[-^$*+?.()|[\]{}]/g, '\\$&'); // Note that we use posix.join because:
  // 1. the basePath has been normalized to use /
  // 2. the incoming glob (id) matcher, also uses /
  // otherwise Node will force backslash (\) on windows

  return path$2.posix.join(basePath, id);
}

const createFilter$1 = function createFilter(include, exclude, options) {
  const resolutionBase = options && options.resolve;

  const getMatcher = id => id instanceof RegExp ? id : {
    test: what => {
      // this refactor is a tad overly verbose but makes for easy debugging
      const pattern = getMatcherString$1(id, resolutionBase);
      const fn = picomatch$2(pattern, {
        dot: true
      });
      const result = fn(what);
      return result;
    }
  };

  const includeMatchers = ensureArray$1(include).map(getMatcher);
  const excludeMatchers = ensureArray$1(exclude).map(getMatcher);
  return function result(id) {
    if (typeof id !== 'string') return false;
    if (/\0/.test(id)) return false;
    const pathId = id.split(path$2.sep).join('/');

    for (let i = 0; i < excludeMatchers.length; ++i) {
      const matcher = excludeMatchers[i];
      if (matcher.test(pathId)) return false;
    }

    for (let i = 0; i < includeMatchers.length; ++i) {
      const matcher = includeMatchers[i];
      if (matcher.test(pathId)) return true;
    }

    return !includeMatchers.length;
  };
};

const reservedWords$1 = 'break case class catch const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield enum await implements package protected static interface private public';
const builtins$1 = 'arguments Infinity NaN undefined null true false eval uneval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Symbol Error EvalError InternalError RangeError ReferenceError SyntaxError TypeError URIError Number Math Date String RegExp Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array Map Set WeakMap WeakSet SIMD ArrayBuffer DataView JSON Promise Generator GeneratorFunction Reflect Proxy Intl';
const forbiddenIdentifiers$1 = new Set(`${reservedWords$1} ${builtins$1}`.split(' '));
forbiddenIdentifiers$1.add('');

const makeLegalIdentifier = function makeLegalIdentifier(str) {
  let identifier = str.replace(/-(\w)/g, (_, letter) => letter.toUpperCase()).replace(/[^$_a-zA-Z0-9]/g, '_');

  if (/\d/.test(identifier[0]) || forbiddenIdentifiers$1.has(identifier)) {
    identifier = `_${identifier}`;
  }

  return identifier || '_';
};

// @ts-check

/** @typedef { import('estree').BaseNode} BaseNode */

/** @typedef {{
	skip: () => void;
	remove: () => void;
	replace: (node: BaseNode) => void;
}} WalkerContext */
class WalkerBase {
  constructor() {
    /** @type {boolean} */
    this.should_skip = false;
    /** @type {boolean} */

    this.should_remove = false;
    /** @type {BaseNode | null} */

    this.replacement = null;
    /** @type {WalkerContext} */

    this.context = {
      skip: () => this.should_skip = true,
      remove: () => this.should_remove = true,
      replace: node => this.replacement = node
    };
  }
  /**
   *
   * @param {any} parent
   * @param {string} prop
   * @param {number} index
   * @param {BaseNode} node
   */


  replace(parent, prop, index, node) {
    if (parent) {
      if (index !== null) {
        parent[prop][index] = node;
      } else {
        parent[prop] = node;
      }
    }
  }
  /**
   *
   * @param {any} parent
   * @param {string} prop
   * @param {number} index
   */


  remove(parent, prop, index) {
    if (parent) {
      if (index !== null) {
        parent[prop].splice(index, 1);
      } else {
        delete parent[prop];
      }
    }
  }

} // @ts-check

/** @typedef { import('estree').BaseNode} BaseNode */

/** @typedef { import('./walker.js').WalkerContext} WalkerContext */

/** @typedef {(
 *    this: WalkerContext,
 *    node: BaseNode,
 *    parent: BaseNode,
 *    key: string,
 *    index: number
 * ) => void} SyncHandler */


class SyncWalker extends WalkerBase {
  /**
   *
   * @param {SyncHandler} enter
   * @param {SyncHandler} leave
   */
  constructor(enter, leave) {
    super();
    /** @type {SyncHandler} */

    this.enter = enter;
    /** @type {SyncHandler} */

    this.leave = leave;
  }
  /**
   *
   * @param {BaseNode} node
   * @param {BaseNode} parent
   * @param {string} [prop]
   * @param {number} [index]
   * @returns {BaseNode}
   */


  visit(node, parent, prop, index) {
    if (node) {
      if (this.enter) {
        const _should_skip = this.should_skip;
        const _should_remove = this.should_remove;
        const _replacement = this.replacement;
        this.should_skip = false;
        this.should_remove = false;
        this.replacement = null;
        this.enter.call(this.context, node, parent, prop, index);

        if (this.replacement) {
          node = this.replacement;
          this.replace(parent, prop, index, node);
        }

        if (this.should_remove) {
          this.remove(parent, prop, index);
        }

        const skipped = this.should_skip;
        const removed = this.should_remove;
        this.should_skip = _should_skip;
        this.should_remove = _should_remove;
        this.replacement = _replacement;
        if (skipped) return node;
        if (removed) return null;
      }

      for (const key in node) {
        const value = node[key];

        if (typeof value !== "object") {
          continue;
        } else if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i += 1) {
            if (value[i] !== null && typeof value[i].type === 'string') {
              if (!this.visit(value[i], node, key, i)) {
                // removed
                i--;
              }
            }
          }
        } else if (value !== null && typeof value.type === "string") {
          this.visit(value, node, key, null);
        }
      }

      if (this.leave) {
        const _replacement = this.replacement;
        const _should_remove = this.should_remove;
        this.replacement = null;
        this.should_remove = false;
        this.leave.call(this.context, node, parent, prop, index);

        if (this.replacement) {
          node = this.replacement;
          this.replace(parent, prop, index, node);
        }

        if (this.should_remove) {
          this.remove(parent, prop, index);
        }

        const removed = this.should_remove;
        this.replacement = _replacement;
        this.should_remove = _should_remove;
        if (removed) return null;
      }
    }

    return node;
  }

} // @ts-check

/** @typedef { import('estree').BaseNode} BaseNode */

/** @typedef { import('./sync.js').SyncHandler} SyncHandler */

/** @typedef { import('./async.js').AsyncHandler} AsyncHandler */

/**
 *
 * @param {BaseNode} ast
 * @param {{
 *   enter?: SyncHandler
 *   leave?: SyncHandler
 * }} walker
 * @returns {BaseNode}
 */


function walk(ast, {
  enter,
  leave
}) {
  const instance = new SyncWalker(enter, leave);
  return instance.visit(ast, null);
}

var charToInteger = {};
var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

for (var i = 0; i < chars.length; i++) {
  charToInteger[chars.charCodeAt(i)] = i;
}

function encode(decoded) {
  var sourceFileIndex = 0; // second field

  var sourceCodeLine = 0; // third field

  var sourceCodeColumn = 0; // fourth field

  var nameIndex = 0; // fifth field

  var mappings = '';

  for (var i = 0; i < decoded.length; i++) {
    var line = decoded[i];
    if (i > 0) mappings += ';';
    if (line.length === 0) continue;
    var generatedCodeColumn = 0; // first field

    var lineMappings = [];

    for (var _i = 0, line_1 = line; _i < line_1.length; _i++) {
      var segment = line_1[_i];
      var segmentMappings = encodeInteger(segment[0] - generatedCodeColumn);
      generatedCodeColumn = segment[0];

      if (segment.length > 1) {
        segmentMappings += encodeInteger(segment[1] - sourceFileIndex) + encodeInteger(segment[2] - sourceCodeLine) + encodeInteger(segment[3] - sourceCodeColumn);
        sourceFileIndex = segment[1];
        sourceCodeLine = segment[2];
        sourceCodeColumn = segment[3];
      }

      if (segment.length === 5) {
        segmentMappings += encodeInteger(segment[4] - nameIndex);
        nameIndex = segment[4];
      }

      lineMappings.push(segmentMappings);
    }

    mappings += lineMappings.join(',');
  }

  return mappings;
}

function encodeInteger(num) {
  var result = '';
  num = num < 0 ? -num << 1 | 1 : num << 1;

  do {
    var clamped = num & 31;
    num >>>= 5;

    if (num > 0) {
      clamped |= 32;
    }

    result += chars[clamped];
  } while (num > 0);

  return result;
}

var BitSet = function BitSet(arg) {
  this.bits = arg instanceof BitSet ? arg.bits.slice() : [];
};

BitSet.prototype.add = function add(n) {
  this.bits[n >> 5] |= 1 << (n & 31);
};

BitSet.prototype.has = function has(n) {
  return !!(this.bits[n >> 5] & 1 << (n & 31));
};

var Chunk = function Chunk(start, end, content) {
  this.start = start;
  this.end = end;
  this.original = content;
  this.intro = '';
  this.outro = '';
  this.content = content;
  this.storeName = false;
  this.edited = false; // we make these non-enumerable, for sanity while debugging

  Object.defineProperties(this, {
    previous: {
      writable: true,
      value: null
    },
    next: {
      writable: true,
      value: null
    }
  });
};

Chunk.prototype.appendLeft = function appendLeft(content) {
  this.outro += content;
};

Chunk.prototype.appendRight = function appendRight(content) {
  this.intro = this.intro + content;
};

Chunk.prototype.clone = function clone() {
  var chunk = new Chunk(this.start, this.end, this.original);
  chunk.intro = this.intro;
  chunk.outro = this.outro;
  chunk.content = this.content;
  chunk.storeName = this.storeName;
  chunk.edited = this.edited;
  return chunk;
};

Chunk.prototype.contains = function contains(index) {
  return this.start < index && index < this.end;
};

Chunk.prototype.eachNext = function eachNext(fn) {
  var chunk = this;

  while (chunk) {
    fn(chunk);
    chunk = chunk.next;
  }
};

Chunk.prototype.eachPrevious = function eachPrevious(fn) {
  var chunk = this;

  while (chunk) {
    fn(chunk);
    chunk = chunk.previous;
  }
};

Chunk.prototype.edit = function edit(content, storeName, contentOnly) {
  this.content = content;

  if (!contentOnly) {
    this.intro = '';
    this.outro = '';
  }

  this.storeName = storeName;
  this.edited = true;
  return this;
};

Chunk.prototype.prependLeft = function prependLeft(content) {
  this.outro = content + this.outro;
};

Chunk.prototype.prependRight = function prependRight(content) {
  this.intro = content + this.intro;
};

Chunk.prototype.split = function split(index) {
  var sliceIndex = index - this.start;
  var originalBefore = this.original.slice(0, sliceIndex);
  var originalAfter = this.original.slice(sliceIndex);
  this.original = originalBefore;
  var newChunk = new Chunk(index, this.end, originalAfter);
  newChunk.outro = this.outro;
  this.outro = '';
  this.end = index;

  if (this.edited) {
    // TODO is this block necessary?...
    newChunk.edit('', false);
    this.content = '';
  } else {
    this.content = originalBefore;
  }

  newChunk.next = this.next;

  if (newChunk.next) {
    newChunk.next.previous = newChunk;
  }

  newChunk.previous = this;
  this.next = newChunk;
  return newChunk;
};

Chunk.prototype.toString = function toString() {
  return this.intro + this.content + this.outro;
};

Chunk.prototype.trimEnd = function trimEnd(rx) {
  this.outro = this.outro.replace(rx, '');

  if (this.outro.length) {
    return true;
  }

  var trimmed = this.content.replace(rx, '');

  if (trimmed.length) {
    if (trimmed !== this.content) {
      this.split(this.start + trimmed.length).edit('', undefined, true);
    }

    return true;
  } else {
    this.edit('', undefined, true);
    this.intro = this.intro.replace(rx, '');

    if (this.intro.length) {
      return true;
    }
  }
};

Chunk.prototype.trimStart = function trimStart(rx) {
  this.intro = this.intro.replace(rx, '');

  if (this.intro.length) {
    return true;
  }

  var trimmed = this.content.replace(rx, '');

  if (trimmed.length) {
    if (trimmed !== this.content) {
      this.split(this.end - trimmed.length);
      this.edit('', undefined, true);
    }

    return true;
  } else {
    this.edit('', undefined, true);
    this.outro = this.outro.replace(rx, '');

    if (this.outro.length) {
      return true;
    }
  }
};

var btoa = function () {
  throw new Error('Unsupported environment: `window.btoa` or `Buffer` should be supported.');
};

if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
  btoa = function (str) {
    return window.btoa(unescape(encodeURIComponent(str)));
  };
} else if (typeof Buffer === 'function') {
  btoa = function (str) {
    return Buffer.from(str, 'utf-8').toString('base64');
  };
}

var SourceMap = function SourceMap(properties) {
  this.version = 3;
  this.file = properties.file;
  this.sources = properties.sources;
  this.sourcesContent = properties.sourcesContent;
  this.names = properties.names;
  this.mappings = encode(properties.mappings);
};

SourceMap.prototype.toString = function toString() {
  return JSON.stringify(this);
};

SourceMap.prototype.toUrl = function toUrl() {
  return 'data:application/json;charset=utf-8;base64,' + btoa(this.toString());
};

function guessIndent(code) {
  var lines = code.split('\n');
  var tabbed = lines.filter(function (line) {
    return /^\t+/.test(line);
  });
  var spaced = lines.filter(function (line) {
    return /^ {2,}/.test(line);
  });

  if (tabbed.length === 0 && spaced.length === 0) {
    return null;
  } // More lines tabbed than spaced? Assume tabs, and
  // default to tabs in the case of a tie (or nothing
  // to go on)


  if (tabbed.length >= spaced.length) {
    return '\t';
  } // Otherwise, we need to guess the multiple


  var min = spaced.reduce(function (previous, current) {
    var numSpaces = /^ +/.exec(current)[0].length;
    return Math.min(numSpaces, previous);
  }, Infinity);
  return new Array(min + 1).join(' ');
}

function getRelativePath(from, to) {
  var fromParts = from.split(/[/\\]/);
  var toParts = to.split(/[/\\]/);
  fromParts.pop(); // get dirname

  while (fromParts[0] === toParts[0]) {
    fromParts.shift();
    toParts.shift();
  }

  if (fromParts.length) {
    var i = fromParts.length;

    while (i--) {
      fromParts[i] = '..';
    }
  }

  return fromParts.concat(toParts).join('/');
}

var toString = Object.prototype.toString;

function isObject$1(thing) {
  return toString.call(thing) === '[object Object]';
}

function getLocator(source) {
  var originalLines = source.split('\n');
  var lineOffsets = [];

  for (var i = 0, pos = 0; i < originalLines.length; i++) {
    lineOffsets.push(pos);
    pos += originalLines[i].length + 1;
  }

  return function locate(index) {
    var i = 0;
    var j = lineOffsets.length;

    while (i < j) {
      var m = i + j >> 1;

      if (index < lineOffsets[m]) {
        j = m;
      } else {
        i = m + 1;
      }
    }

    var line = i - 1;
    var column = index - lineOffsets[line];
    return {
      line: line,
      column: column
    };
  };
}

var Mappings = function Mappings(hires) {
  this.hires = hires;
  this.generatedCodeLine = 0;
  this.generatedCodeColumn = 0;
  this.raw = [];
  this.rawSegments = this.raw[this.generatedCodeLine] = [];
  this.pending = null;
};

Mappings.prototype.addEdit = function addEdit(sourceIndex, content, loc, nameIndex) {
  if (content.length) {
    var segment = [this.generatedCodeColumn, sourceIndex, loc.line, loc.column];

    if (nameIndex >= 0) {
      segment.push(nameIndex);
    }

    this.rawSegments.push(segment);
  } else if (this.pending) {
    this.rawSegments.push(this.pending);
  }

  this.advance(content);
  this.pending = null;
};

Mappings.prototype.addUneditedChunk = function addUneditedChunk(sourceIndex, chunk, original, loc, sourcemapLocations) {
  var originalCharIndex = chunk.start;
  var first = true;

  while (originalCharIndex < chunk.end) {
    if (this.hires || first || sourcemapLocations.has(originalCharIndex)) {
      this.rawSegments.push([this.generatedCodeColumn, sourceIndex, loc.line, loc.column]);
    }

    if (original[originalCharIndex] === '\n') {
      loc.line += 1;
      loc.column = 0;
      this.generatedCodeLine += 1;
      this.raw[this.generatedCodeLine] = this.rawSegments = [];
      this.generatedCodeColumn = 0;
      first = true;
    } else {
      loc.column += 1;
      this.generatedCodeColumn += 1;
      first = false;
    }

    originalCharIndex += 1;
  }

  this.pending = null;
};

Mappings.prototype.advance = function advance(str) {
  if (!str) {
    return;
  }

  var lines = str.split('\n');

  if (lines.length > 1) {
    for (var i = 0; i < lines.length - 1; i++) {
      this.generatedCodeLine++;
      this.raw[this.generatedCodeLine] = this.rawSegments = [];
    }

    this.generatedCodeColumn = 0;
  }

  this.generatedCodeColumn += lines[lines.length - 1].length;
};

var n = '\n';
var warned = {
  insertLeft: false,
  insertRight: false,
  storeName: false
};

var MagicString = function MagicString(string, options) {
  if (options === void 0) options = {};
  var chunk = new Chunk(0, string.length, string);
  Object.defineProperties(this, {
    original: {
      writable: true,
      value: string
    },
    outro: {
      writable: true,
      value: ''
    },
    intro: {
      writable: true,
      value: ''
    },
    firstChunk: {
      writable: true,
      value: chunk
    },
    lastChunk: {
      writable: true,
      value: chunk
    },
    lastSearchedChunk: {
      writable: true,
      value: chunk
    },
    byStart: {
      writable: true,
      value: {}
    },
    byEnd: {
      writable: true,
      value: {}
    },
    filename: {
      writable: true,
      value: options.filename
    },
    indentExclusionRanges: {
      writable: true,
      value: options.indentExclusionRanges
    },
    sourcemapLocations: {
      writable: true,
      value: new BitSet()
    },
    storedNames: {
      writable: true,
      value: {}
    },
    indentStr: {
      writable: true,
      value: guessIndent(string)
    }
  });
  this.byStart[0] = chunk;
  this.byEnd[string.length] = chunk;
};

MagicString.prototype.addSourcemapLocation = function addSourcemapLocation(char) {
  this.sourcemapLocations.add(char);
};

MagicString.prototype.append = function append(content) {
  if (typeof content !== 'string') {
    throw new TypeError('outro content must be a string');
  }

  this.outro += content;
  return this;
};

MagicString.prototype.appendLeft = function appendLeft(index, content) {
  if (typeof content !== 'string') {
    throw new TypeError('inserted content must be a string');
  }

  this._split(index);

  var chunk = this.byEnd[index];

  if (chunk) {
    chunk.appendLeft(content);
  } else {
    this.intro += content;
  }

  return this;
};

MagicString.prototype.appendRight = function appendRight(index, content) {
  if (typeof content !== 'string') {
    throw new TypeError('inserted content must be a string');
  }

  this._split(index);

  var chunk = this.byStart[index];

  if (chunk) {
    chunk.appendRight(content);
  } else {
    this.outro += content;
  }

  return this;
};

MagicString.prototype.clone = function clone() {
  var cloned = new MagicString(this.original, {
    filename: this.filename
  });
  var originalChunk = this.firstChunk;
  var clonedChunk = cloned.firstChunk = cloned.lastSearchedChunk = originalChunk.clone();

  while (originalChunk) {
    cloned.byStart[clonedChunk.start] = clonedChunk;
    cloned.byEnd[clonedChunk.end] = clonedChunk;
    var nextOriginalChunk = originalChunk.next;
    var nextClonedChunk = nextOriginalChunk && nextOriginalChunk.clone();

    if (nextClonedChunk) {
      clonedChunk.next = nextClonedChunk;
      nextClonedChunk.previous = clonedChunk;
      clonedChunk = nextClonedChunk;
    }

    originalChunk = nextOriginalChunk;
  }

  cloned.lastChunk = clonedChunk;

  if (this.indentExclusionRanges) {
    cloned.indentExclusionRanges = this.indentExclusionRanges.slice();
  }

  cloned.sourcemapLocations = new BitSet(this.sourcemapLocations);
  cloned.intro = this.intro;
  cloned.outro = this.outro;
  return cloned;
};

MagicString.prototype.generateDecodedMap = function generateDecodedMap(options) {
  var this$1$1 = this;
  options = options || {};
  var sourceIndex = 0;
  var names = Object.keys(this.storedNames);
  var mappings = new Mappings(options.hires);
  var locate = getLocator(this.original);

  if (this.intro) {
    mappings.advance(this.intro);
  }

  this.firstChunk.eachNext(function (chunk) {
    var loc = locate(chunk.start);

    if (chunk.intro.length) {
      mappings.advance(chunk.intro);
    }

    if (chunk.edited) {
      mappings.addEdit(sourceIndex, chunk.content, loc, chunk.storeName ? names.indexOf(chunk.original) : -1);
    } else {
      mappings.addUneditedChunk(sourceIndex, chunk, this$1$1.original, loc, this$1$1.sourcemapLocations);
    }

    if (chunk.outro.length) {
      mappings.advance(chunk.outro);
    }
  });
  return {
    file: options.file ? options.file.split(/[/\\]/).pop() : null,
    sources: [options.source ? getRelativePath(options.file || '', options.source) : null],
    sourcesContent: options.includeContent ? [this.original] : [null],
    names: names,
    mappings: mappings.raw
  };
};

MagicString.prototype.generateMap = function generateMap(options) {
  return new SourceMap(this.generateDecodedMap(options));
};

MagicString.prototype.getIndentString = function getIndentString() {
  return this.indentStr === null ? '\t' : this.indentStr;
};

MagicString.prototype.indent = function indent(indentStr, options) {
  var pattern = /^[^\r\n]/gm;

  if (isObject$1(indentStr)) {
    options = indentStr;
    indentStr = undefined;
  }

  indentStr = indentStr !== undefined ? indentStr : this.indentStr || '\t';

  if (indentStr === '') {
    return this;
  } // noop


  options = options || {}; // Process exclusion ranges

  var isExcluded = {};

  if (options.exclude) {
    var exclusions = typeof options.exclude[0] === 'number' ? [options.exclude] : options.exclude;
    exclusions.forEach(function (exclusion) {
      for (var i = exclusion[0]; i < exclusion[1]; i += 1) {
        isExcluded[i] = true;
      }
    });
  }

  var shouldIndentNextCharacter = options.indentStart !== false;

  var replacer = function (match) {
    if (shouldIndentNextCharacter) {
      return "" + indentStr + match;
    }

    shouldIndentNextCharacter = true;
    return match;
  };

  this.intro = this.intro.replace(pattern, replacer);
  var charIndex = 0;
  var chunk = this.firstChunk;

  while (chunk) {
    var end = chunk.end;

    if (chunk.edited) {
      if (!isExcluded[charIndex]) {
        chunk.content = chunk.content.replace(pattern, replacer);

        if (chunk.content.length) {
          shouldIndentNextCharacter = chunk.content[chunk.content.length - 1] === '\n';
        }
      }
    } else {
      charIndex = chunk.start;

      while (charIndex < end) {
        if (!isExcluded[charIndex]) {
          var char = this.original[charIndex];

          if (char === '\n') {
            shouldIndentNextCharacter = true;
          } else if (char !== '\r' && shouldIndentNextCharacter) {
            shouldIndentNextCharacter = false;

            if (charIndex === chunk.start) {
              chunk.prependRight(indentStr);
            } else {
              this._splitChunk(chunk, charIndex);

              chunk = chunk.next;
              chunk.prependRight(indentStr);
            }
          }
        }

        charIndex += 1;
      }
    }

    charIndex = chunk.end;
    chunk = chunk.next;
  }

  this.outro = this.outro.replace(pattern, replacer);
  return this;
};

MagicString.prototype.insert = function insert() {
  throw new Error('magicString.insert(...) is deprecated. Use prependRight(...) or appendLeft(...)');
};

MagicString.prototype.insertLeft = function insertLeft(index, content) {
  if (!warned.insertLeft) {
    console.warn('magicString.insertLeft(...) is deprecated. Use magicString.appendLeft(...) instead'); // eslint-disable-line no-console

    warned.insertLeft = true;
  }

  return this.appendLeft(index, content);
};

MagicString.prototype.insertRight = function insertRight(index, content) {
  if (!warned.insertRight) {
    console.warn('magicString.insertRight(...) is deprecated. Use magicString.prependRight(...) instead'); // eslint-disable-line no-console

    warned.insertRight = true;
  }

  return this.prependRight(index, content);
};

MagicString.prototype.move = function move(start, end, index) {
  if (index >= start && index <= end) {
    throw new Error('Cannot move a selection inside itself');
  }

  this._split(start);

  this._split(end);

  this._split(index);

  var first = this.byStart[start];
  var last = this.byEnd[end];
  var oldLeft = first.previous;
  var oldRight = last.next;
  var newRight = this.byStart[index];

  if (!newRight && last === this.lastChunk) {
    return this;
  }

  var newLeft = newRight ? newRight.previous : this.lastChunk;

  if (oldLeft) {
    oldLeft.next = oldRight;
  }

  if (oldRight) {
    oldRight.previous = oldLeft;
  }

  if (newLeft) {
    newLeft.next = first;
  }

  if (newRight) {
    newRight.previous = last;
  }

  if (!first.previous) {
    this.firstChunk = last.next;
  }

  if (!last.next) {
    this.lastChunk = first.previous;
    this.lastChunk.next = null;
  }

  first.previous = newLeft;
  last.next = newRight || null;

  if (!newLeft) {
    this.firstChunk = first;
  }

  if (!newRight) {
    this.lastChunk = last;
  }

  return this;
};

MagicString.prototype.overwrite = function overwrite(start, end, content, options) {
  if (typeof content !== 'string') {
    throw new TypeError('replacement content must be a string');
  }

  while (start < 0) {
    start += this.original.length;
  }

  while (end < 0) {
    end += this.original.length;
  }

  if (end > this.original.length) {
    throw new Error('end is out of bounds');
  }

  if (start === end) {
    throw new Error('Cannot overwrite a zero-length range – use appendLeft or prependRight instead');
  }

  this._split(start);

  this._split(end);

  if (options === true) {
    if (!warned.storeName) {
      console.warn('The final argument to magicString.overwrite(...) should be an options object. See https://github.com/rich-harris/magic-string'); // eslint-disable-line no-console

      warned.storeName = true;
    }

    options = {
      storeName: true
    };
  }

  var storeName = options !== undefined ? options.storeName : false;
  var contentOnly = options !== undefined ? options.contentOnly : false;

  if (storeName) {
    var original = this.original.slice(start, end);
    Object.defineProperty(this.storedNames, original, {
      writable: true,
      value: true,
      enumerable: true
    });
  }

  var first = this.byStart[start];
  var last = this.byEnd[end];

  if (first) {
    var chunk = first;

    while (chunk !== last) {
      if (chunk.next !== this.byStart[chunk.end]) {
        throw new Error('Cannot overwrite across a split point');
      }

      chunk = chunk.next;
      chunk.edit('', false);
    }

    first.edit(content, storeName, contentOnly);
  } else {
    // must be inserting at the end
    var newChunk = new Chunk(start, end, '').edit(content, storeName); // TODO last chunk in the array may not be the last chunk, if it's moved...

    last.next = newChunk;
    newChunk.previous = last;
  }

  return this;
};

MagicString.prototype.prepend = function prepend(content) {
  if (typeof content !== 'string') {
    throw new TypeError('outro content must be a string');
  }

  this.intro = content + this.intro;
  return this;
};

MagicString.prototype.prependLeft = function prependLeft(index, content) {
  if (typeof content !== 'string') {
    throw new TypeError('inserted content must be a string');
  }

  this._split(index);

  var chunk = this.byEnd[index];

  if (chunk) {
    chunk.prependLeft(content);
  } else {
    this.intro = content + this.intro;
  }

  return this;
};

MagicString.prototype.prependRight = function prependRight(index, content) {
  if (typeof content !== 'string') {
    throw new TypeError('inserted content must be a string');
  }

  this._split(index);

  var chunk = this.byStart[index];

  if (chunk) {
    chunk.prependRight(content);
  } else {
    this.outro = content + this.outro;
  }

  return this;
};

MagicString.prototype.remove = function remove(start, end) {
  while (start < 0) {
    start += this.original.length;
  }

  while (end < 0) {
    end += this.original.length;
  }

  if (start === end) {
    return this;
  }

  if (start < 0 || end > this.original.length) {
    throw new Error('Character is out of bounds');
  }

  if (start > end) {
    throw new Error('end must be greater than start');
  }

  this._split(start);

  this._split(end);

  var chunk = this.byStart[start];

  while (chunk) {
    chunk.intro = '';
    chunk.outro = '';
    chunk.edit('');
    chunk = end > chunk.end ? this.byStart[chunk.end] : null;
  }

  return this;
};

MagicString.prototype.lastChar = function lastChar() {
  if (this.outro.length) {
    return this.outro[this.outro.length - 1];
  }

  var chunk = this.lastChunk;

  do {
    if (chunk.outro.length) {
      return chunk.outro[chunk.outro.length - 1];
    }

    if (chunk.content.length) {
      return chunk.content[chunk.content.length - 1];
    }

    if (chunk.intro.length) {
      return chunk.intro[chunk.intro.length - 1];
    }
  } while (chunk = chunk.previous);

  if (this.intro.length) {
    return this.intro[this.intro.length - 1];
  }

  return '';
};

MagicString.prototype.lastLine = function lastLine() {
  var lineIndex = this.outro.lastIndexOf(n);

  if (lineIndex !== -1) {
    return this.outro.substr(lineIndex + 1);
  }

  var lineStr = this.outro;
  var chunk = this.lastChunk;

  do {
    if (chunk.outro.length > 0) {
      lineIndex = chunk.outro.lastIndexOf(n);

      if (lineIndex !== -1) {
        return chunk.outro.substr(lineIndex + 1) + lineStr;
      }

      lineStr = chunk.outro + lineStr;
    }

    if (chunk.content.length > 0) {
      lineIndex = chunk.content.lastIndexOf(n);

      if (lineIndex !== -1) {
        return chunk.content.substr(lineIndex + 1) + lineStr;
      }

      lineStr = chunk.content + lineStr;
    }

    if (chunk.intro.length > 0) {
      lineIndex = chunk.intro.lastIndexOf(n);

      if (lineIndex !== -1) {
        return chunk.intro.substr(lineIndex + 1) + lineStr;
      }

      lineStr = chunk.intro + lineStr;
    }
  } while (chunk = chunk.previous);

  lineIndex = this.intro.lastIndexOf(n);

  if (lineIndex !== -1) {
    return this.intro.substr(lineIndex + 1) + lineStr;
  }

  return this.intro + lineStr;
};

MagicString.prototype.slice = function slice(start, end) {
  if (start === void 0) start = 0;
  if (end === void 0) end = this.original.length;

  while (start < 0) {
    start += this.original.length;
  }

  while (end < 0) {
    end += this.original.length;
  }

  var result = ''; // find start chunk

  var chunk = this.firstChunk;

  while (chunk && (chunk.start > start || chunk.end <= start)) {
    // found end chunk before start
    if (chunk.start < end && chunk.end >= end) {
      return result;
    }

    chunk = chunk.next;
  }

  if (chunk && chunk.edited && chunk.start !== start) {
    throw new Error("Cannot use replaced character " + start + " as slice start anchor.");
  }

  var startChunk = chunk;

  while (chunk) {
    if (chunk.intro && (startChunk !== chunk || chunk.start === start)) {
      result += chunk.intro;
    }

    var containsEnd = chunk.start < end && chunk.end >= end;

    if (containsEnd && chunk.edited && chunk.end !== end) {
      throw new Error("Cannot use replaced character " + end + " as slice end anchor.");
    }

    var sliceStart = startChunk === chunk ? start - chunk.start : 0;
    var sliceEnd = containsEnd ? chunk.content.length + end - chunk.end : chunk.content.length;
    result += chunk.content.slice(sliceStart, sliceEnd);

    if (chunk.outro && (!containsEnd || chunk.end === end)) {
      result += chunk.outro;
    }

    if (containsEnd) {
      break;
    }

    chunk = chunk.next;
  }

  return result;
}; // TODO deprecate this? not really very useful


MagicString.prototype.snip = function snip(start, end) {
  var clone = this.clone();
  clone.remove(0, start);
  clone.remove(end, clone.original.length);
  return clone;
};

MagicString.prototype._split = function _split(index) {
  if (this.byStart[index] || this.byEnd[index]) {
    return;
  }

  var chunk = this.lastSearchedChunk;
  var searchForward = index > chunk.end;

  while (chunk) {
    if (chunk.contains(index)) {
      return this._splitChunk(chunk, index);
    }

    chunk = searchForward ? this.byStart[chunk.end] : this.byEnd[chunk.start];
  }
};

MagicString.prototype._splitChunk = function _splitChunk(chunk, index) {
  if (chunk.edited && chunk.content.length) {
    // zero-length edited chunks are a special case (overlapping replacements)
    var loc = getLocator(this.original)(index);
    throw new Error("Cannot split a chunk that has already been edited (" + loc.line + ":" + loc.column + " – \"" + chunk.original + "\")");
  }

  var newChunk = chunk.split(index);
  this.byEnd[index] = chunk;
  this.byStart[index] = newChunk;
  this.byEnd[newChunk.end] = newChunk;

  if (chunk === this.lastChunk) {
    this.lastChunk = newChunk;
  }

  this.lastSearchedChunk = chunk;
  return true;
};

MagicString.prototype.toString = function toString() {
  var str = this.intro;
  var chunk = this.firstChunk;

  while (chunk) {
    str += chunk.toString();
    chunk = chunk.next;
  }

  return str + this.outro;
};

MagicString.prototype.isEmpty = function isEmpty() {
  var chunk = this.firstChunk;

  do {
    if (chunk.intro.length && chunk.intro.trim() || chunk.content.length && chunk.content.trim() || chunk.outro.length && chunk.outro.trim()) {
      return false;
    }
  } while (chunk = chunk.next);

  return true;
};

MagicString.prototype.length = function length() {
  var chunk = this.firstChunk;
  var length = 0;

  do {
    length += chunk.intro.length + chunk.content.length + chunk.outro.length;
  } while (chunk = chunk.next);

  return length;
};

MagicString.prototype.trimLines = function trimLines() {
  return this.trim('[\\r\\n]');
};

MagicString.prototype.trim = function trim(charType) {
  return this.trimStart(charType).trimEnd(charType);
};

MagicString.prototype.trimEndAborted = function trimEndAborted(charType) {
  var rx = new RegExp((charType || '\\s') + '+$');
  this.outro = this.outro.replace(rx, '');

  if (this.outro.length) {
    return true;
  }

  var chunk = this.lastChunk;

  do {
    var end = chunk.end;
    var aborted = chunk.trimEnd(rx); // if chunk was trimmed, we have a new lastChunk

    if (chunk.end !== end) {
      if (this.lastChunk === chunk) {
        this.lastChunk = chunk.next;
      }

      this.byEnd[chunk.end] = chunk;
      this.byStart[chunk.next.start] = chunk.next;
      this.byEnd[chunk.next.end] = chunk.next;
    }

    if (aborted) {
      return true;
    }

    chunk = chunk.previous;
  } while (chunk);

  return false;
};

MagicString.prototype.trimEnd = function trimEnd(charType) {
  this.trimEndAborted(charType);
  return this;
};

MagicString.prototype.trimStartAborted = function trimStartAborted(charType) {
  var rx = new RegExp('^' + (charType || '\\s') + '+');
  this.intro = this.intro.replace(rx, '');

  if (this.intro.length) {
    return true;
  }

  var chunk = this.firstChunk;

  do {
    var end = chunk.end;
    var aborted = chunk.trimStart(rx);

    if (chunk.end !== end) {
      // special case...
      if (chunk === this.lastChunk) {
        this.lastChunk = chunk.next;
      }

      this.byEnd[chunk.end] = chunk;
      this.byStart[chunk.next.start] = chunk.next;
      this.byEnd[chunk.next.end] = chunk.next;
    }

    if (aborted) {
      return true;
    }

    chunk = chunk.next;
  } while (chunk);

  return false;
};

MagicString.prototype.trimStart = function trimStart(charType) {
  this.trimStartAborted(charType);
  return this;
};

var escape = function (str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
};

var isReference = function (node, parent) {
  if (node.type === 'MemberExpression') {
    return !node.computed && isReference(node.object, node);
  }

  if (node.type === 'Identifier') {
    // TODO is this right?
    if (parent.type === 'MemberExpression') {
      return parent.computed || node === parent.object;
    } // disregard the `bar` in { bar: foo }


    if (parent.type === 'Property' && node !== parent.value) {
      return false;
    } // disregard the `bar` in `class Foo { bar () {...} }`


    if (parent.type === 'MethodDefinition') {
      return false;
    } // disregard the `bar` in `export { foo as bar }`


    if (parent.type === 'ExportSpecifier' && node !== parent.local) {
      return false;
    } // disregard the `bar` in `import { bar as foo }`


    if (parent.type === 'ImportSpecifier' && node === parent.imported) {
      return false;
    }

    return true;
  }

  return false;
};

var flatten = function (startNode) {
  var parts = [];
  var node = startNode;

  while (node.type === 'MemberExpression') {
    parts.unshift(node.property.name);
    node = node.object;
  }

  var name = node.name;
  parts.unshift(name);
  return {
    name: name,
    keypath: parts.join('.')
  };
};

function inject(options) {
  if (!options) {
    throw new Error('Missing options');
  }

  var filter = createFilter$1(options.include, options.exclude);
  var modules = options.modules;

  if (!modules) {
    modules = Object.assign({}, options);
    delete modules.include;
    delete modules.exclude;
    delete modules.sourceMap;
    delete modules.sourcemap;
  }

  var modulesMap = new Map(Object.entries(modules)); // Fix paths on Windows

  if (path$2.sep !== '/') {
    modulesMap.forEach(function (mod, key) {
      modulesMap.set(key, Array.isArray(mod) ? [mod[0].split(path$2.sep).join('/'), mod[1]] : mod.split(path$2.sep).join('/'));
    });
  }

  var firstpass = new RegExp("(?:" + Array.from(modulesMap.keys()).map(escape).join('|') + ")", 'g');
  var sourceMap = options.sourceMap !== false && options.sourcemap !== false;
  return {
    name: 'inject',
    transform: function transform(code, id) {
      if (!filter(id)) {
        return null;
      }

      if (code.search(firstpass) === -1) {
        return null;
      }

      if (path$2.sep !== '/') {
        id = id.split(path$2.sep).join('/');
      } // eslint-disable-line no-param-reassign


      var ast = null;

      try {
        ast = this.parse(code);
      } catch (err) {
        this.warn({
          code: 'PARSE_ERROR',
          message: "rollup-plugin-inject: failed to parse " + id + ". Consider restricting the plugin to particular files via options.include"
        });
      }

      if (!ast) {
        return null;
      }

      var imports = new Set();
      ast.body.forEach(function (node) {
        if (node.type === 'ImportDeclaration') {
          node.specifiers.forEach(function (specifier) {
            imports.add(specifier.local.name);
          });
        }
      }); // analyse scopes

      var scope = attachScopes(ast, 'scope');
      var magicString = new MagicString(code);
      var newImports = new Map();

      function handleReference(node, name, keypath) {
        var mod = modulesMap.get(keypath);

        if (mod && !imports.has(name) && !scope.contains(name)) {
          if (typeof mod === 'string') {
            mod = [mod, 'default'];
          } // prevent module from importing itself


          if (mod[0] === id) {
            return false;
          }

          var hash = keypath + ":" + mod[0] + ":" + mod[1];
          var importLocalName = name === keypath ? name : makeLegalIdentifier("$inject_" + keypath);

          if (!newImports.has(hash)) {
            // escape apostrophes and backslashes for use in single-quoted string literal
            var modName = mod[0].replace(/[''\\]/g, '\\$&');

            if (mod[1] === '*') {
              newImports.set(hash, "import * as " + importLocalName + " from '" + modName + "';");
            } else {
              newImports.set(hash, "import { " + mod[1] + " as " + importLocalName + " } from '" + modName + "';");
            }
          }

          if (name !== keypath) {
            magicString.overwrite(node.start, node.end, importLocalName, {
              storeName: true
            });
          }

          return true;
        }

        return false;
      }

      walk(ast, {
        enter: function enter(node, parent) {
          if (sourceMap) {
            magicString.addSourcemapLocation(node.start);
            magicString.addSourcemapLocation(node.end);
          }

          if (node.scope) {
            scope = node.scope; // eslint-disable-line prefer-destructuring
          } // special case – shorthand properties. because node.key === node.value,
          // we can't differentiate once we've descended into the node


          if (node.type === 'Property' && node.shorthand) {
            var ref = node.key;
            var name = ref.name;
            handleReference(node, name, name);
            this.skip();
            return;
          }

          if (isReference(node, parent)) {
            var ref$1 = flatten(node);
            var name$1 = ref$1.name;
            var keypath = ref$1.keypath;
            var handled = handleReference(node, name$1, keypath);

            if (handled) {
              this.skip();
            }
          }
        },
        leave: function leave(node) {
          if (node.scope) {
            scope = scope.parent;
          }
        }
      });

      if (newImports.size === 0) {
        return {
          code: code,
          ast: ast,
          map: sourceMap ? magicString.generateMap({
            hires: true
          }) : null
        };
      }

      var importBlock = Array.from(newImports.values()).join('\n\n');
      magicString.prepend(importBlock + "\n\n");
      return {
        code: magicString.toString(),
        map: sourceMap ? magicString.generateMap({
          hires: true
        }) : null
      };
    }
  };
}

const POLYFILLS={"__http-lib/capability.js":"export var hasFetch = isFunction(global.fetch) && isFunction(global.ReadableStream)\n\nvar _blobConstructor;\nexport function blobConstructor() {\n  if (typeof _blobConstructor !== 'undefined') {\n    return _blobConstructor;\n  }\n  try {\n    new global.Blob([new ArrayBuffer(1)])\n    _blobConstructor = true\n  } catch (e) {\n    _blobConstructor = false\n  }\n  return _blobConstructor\n}\nvar xhr;\n\nfunction checkTypeSupport(type) {\n  if (!xhr) {\n    xhr = new global.XMLHttpRequest()\n    // If location.host is empty, e.g. if this page/worker was loaded\n    // from a Blob, then use example.com to avoid an error\n    xhr.open('GET', global.location.host ? '/' : 'https://example.com')\n  }\n  try {\n    xhr.responseType = type\n    return xhr.responseType === type\n  } catch (e) {\n    return false\n  }\n\n}\n\n// For some strange reason, Safari 7.0 reports typeof global.ArrayBuffer === 'object'.\n// Safari 7.1 appears to have fixed this bug.\nvar haveArrayBuffer = typeof global.ArrayBuffer !== 'undefined'\nvar haveSlice = haveArrayBuffer && isFunction(global.ArrayBuffer.prototype.slice)\n\nexport var arraybuffer = haveArrayBuffer && checkTypeSupport('arraybuffer')\n  // These next two tests unavoidably show warnings in Chrome. Since fetch will always\n  // be used if it's available, just return false for these to avoid the warnings.\nexport var msstream = !hasFetch && haveSlice && checkTypeSupport('ms-stream')\nexport var mozchunkedarraybuffer = !hasFetch && haveArrayBuffer &&\n  checkTypeSupport('moz-chunked-arraybuffer')\nexport var overrideMimeType = isFunction(xhr.overrideMimeType)\nexport var vbArray = isFunction(global.VBArray)\n\nfunction isFunction(value) {\n  return typeof value === 'function'\n}\n\nxhr = null // Help gc\n","__http-lib/request.js":"import * as capability from './capability';\nimport {inherits} from 'util';\nimport {IncomingMessage, readyStates as rStates} from './response';\nimport {Writable} from 'stream';\nimport toArrayBuffer from './to-arraybuffer';\n\nfunction decideMode(preferBinary, useFetch) {\n  if (capability.hasFetch && useFetch) {\n    return 'fetch'\n  } else if (capability.mozchunkedarraybuffer) {\n    return 'moz-chunked-arraybuffer'\n  } else if (capability.msstream) {\n    return 'ms-stream'\n  } else if (capability.arraybuffer && preferBinary) {\n    return 'arraybuffer'\n  } else if (capability.vbArray && preferBinary) {\n    return 'text:vbarray'\n  } else {\n    return 'text'\n  }\n}\nexport default ClientRequest;\n\nfunction ClientRequest(opts) {\n  var self = this\n  Writable.call(self)\n\n  self._opts = opts\n  self._body = []\n  self._headers = {}\n  if (opts.auth)\n    self.setHeader('Authorization', 'Basic ' + new Buffer(opts.auth).toString('base64'))\n  Object.keys(opts.headers).forEach(function(name) {\n    self.setHeader(name, opts.headers[name])\n  })\n\n  var preferBinary\n  var useFetch = true\n  if (opts.mode === 'disable-fetch') {\n    // If the use of XHR should be preferred and includes preserving the 'content-type' header\n    useFetch = false\n    preferBinary = true\n  } else if (opts.mode === 'prefer-streaming') {\n    // If streaming is a high priority but binary compatibility and\n    // the accuracy of the 'content-type' header aren't\n    preferBinary = false\n  } else if (opts.mode === 'allow-wrong-content-type') {\n    // If streaming is more important than preserving the 'content-type' header\n    preferBinary = !capability.overrideMimeType\n  } else if (!opts.mode || opts.mode === 'default' || opts.mode === 'prefer-fast') {\n    // Use binary if text streaming may corrupt data or the content-type header, or for speed\n    preferBinary = true\n  } else {\n    throw new Error('Invalid value for opts.mode')\n  }\n  self._mode = decideMode(preferBinary, useFetch)\n\n  self.on('finish', function() {\n    self._onFinish()\n  })\n}\n\ninherits(ClientRequest, Writable)\n// Taken from http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader%28%29-method\nvar unsafeHeaders = [\n  'accept-charset',\n  'accept-encoding',\n  'access-control-request-headers',\n  'access-control-request-method',\n  'connection',\n  'content-length',\n  'cookie',\n  'cookie2',\n  'date',\n  'dnt',\n  'expect',\n  'host',\n  'keep-alive',\n  'origin',\n  'referer',\n  'te',\n  'trailer',\n  'transfer-encoding',\n  'upgrade',\n  'user-agent',\n  'via'\n]\nClientRequest.prototype.setHeader = function(name, value) {\n  var self = this\n  var lowerName = name.toLowerCase()\n    // This check is not necessary, but it prevents warnings from browsers about setting unsafe\n    // headers. To be honest I'm not entirely sure hiding these warnings is a good thing, but\n    // http-browserify did it, so I will too.\n  if (unsafeHeaders.indexOf(lowerName) !== -1)\n    return\n\n  self._headers[lowerName] = {\n    name: name,\n    value: value\n  }\n}\n\nClientRequest.prototype.getHeader = function(name) {\n  var self = this\n  return self._headers[name.toLowerCase()].value\n}\n\nClientRequest.prototype.removeHeader = function(name) {\n  var self = this\n  delete self._headers[name.toLowerCase()]\n}\n\nClientRequest.prototype._onFinish = function() {\n  var self = this\n\n  if (self._destroyed)\n    return\n  var opts = self._opts\n\n  var headersObj = self._headers\n  var body\n  if (opts.method === 'POST' || opts.method === 'PUT' || opts.method === 'PATCH') {\n    if (capability.blobConstructor()) {\n      body = new global.Blob(self._body.map(function(buffer) {\n        return toArrayBuffer(buffer)\n      }), {\n        type: (headersObj['content-type'] || {}).value || ''\n      })\n    } else {\n      // get utf8 string\n      body = Buffer.concat(self._body).toString()\n    }\n  }\n\n  if (self._mode === 'fetch') {\n    var headers = Object.keys(headersObj).map(function(name) {\n      return [headersObj[name].name, headersObj[name].value]\n    })\n\n    global.fetch(self._opts.url, {\n      method: self._opts.method,\n      headers: headers,\n      body: body,\n      mode: 'cors',\n      credentials: opts.withCredentials ? 'include' : 'same-origin'\n    }).then(function(response) {\n      self._fetchResponse = response\n      self._connect()\n    }, function(reason) {\n      self.emit('error', reason)\n    })\n  } else {\n    var xhr = self._xhr = new global.XMLHttpRequest()\n    try {\n      xhr.open(self._opts.method, self._opts.url, true)\n    } catch (err) {\n      process.nextTick(function() {\n        self.emit('error', err)\n      })\n      return\n    }\n\n    // Can't set responseType on really old browsers\n    if ('responseType' in xhr)\n      xhr.responseType = self._mode.split(':')[0]\n\n    if ('withCredentials' in xhr)\n      xhr.withCredentials = !!opts.withCredentials\n\n    if (self._mode === 'text' && 'overrideMimeType' in xhr)\n      xhr.overrideMimeType('text/plain; charset=x-user-defined')\n\n    Object.keys(headersObj).forEach(function(name) {\n      xhr.setRequestHeader(headersObj[name].name, headersObj[name].value)\n    })\n\n    self._response = null\n    xhr.onreadystatechange = function() {\n      switch (xhr.readyState) {\n      case rStates.LOADING:\n      case rStates.DONE:\n        self._onXHRProgress()\n        break\n      }\n    }\n      // Necessary for streaming in Firefox, since xhr.response is ONLY defined\n      // in onprogress, not in onreadystatechange with xhr.readyState = 3\n    if (self._mode === 'moz-chunked-arraybuffer') {\n      xhr.onprogress = function() {\n        self._onXHRProgress()\n      }\n    }\n\n    xhr.onerror = function() {\n      if (self._destroyed)\n        return\n      self.emit('error', new Error('XHR error'))\n    }\n\n    try {\n      xhr.send(body)\n    } catch (err) {\n      process.nextTick(function() {\n        self.emit('error', err)\n      })\n      return\n    }\n  }\n}\n\n/**\n * Checks if xhr.status is readable and non-zero, indicating no error.\n * Even though the spec says it should be available in readyState 3,\n * accessing it throws an exception in IE8\n */\nfunction statusValid(xhr) {\n  try {\n    var status = xhr.status\n    return (status !== null && status !== 0)\n  } catch (e) {\n    return false\n  }\n}\n\nClientRequest.prototype._onXHRProgress = function() {\n  var self = this\n\n  if (!statusValid(self._xhr) || self._destroyed)\n    return\n\n  if (!self._response)\n    self._connect()\n\n  self._response._onXHRProgress()\n}\n\nClientRequest.prototype._connect = function() {\n  var self = this\n\n  if (self._destroyed)\n    return\n\n  self._response = new IncomingMessage(self._xhr, self._fetchResponse, self._mode)\n  self.emit('response', self._response)\n}\n\nClientRequest.prototype._write = function(chunk, encoding, cb) {\n  var self = this\n\n  self._body.push(chunk)\n  cb()\n}\n\nClientRequest.prototype.abort = ClientRequest.prototype.destroy = function() {\n  var self = this\n  self._destroyed = true\n  if (self._response)\n    self._response._destroyed = true\n  if (self._xhr)\n    self._xhr.abort()\n    // Currently, there isn't a way to truly abort a fetch.\n    // If you like bikeshedding, see https://github.com/whatwg/fetch/issues/27\n}\n\nClientRequest.prototype.end = function(data, encoding, cb) {\n  var self = this\n  if (typeof data === 'function') {\n    cb = data\n    data = undefined\n  }\n\n  Writable.prototype.end.call(self, data, encoding, cb)\n}\n\nClientRequest.prototype.flushHeaders = function() {}\nClientRequest.prototype.setTimeout = function() {}\nClientRequest.prototype.setNoDelay = function() {}\nClientRequest.prototype.setSocketKeepAlive = function() {}\n","__http-lib/response.js":"import {overrideMimeType} from './capability';\nimport {inherits} from 'util';\nimport {Readable} from 'stream';\n\nvar rStates = {\n  UNSENT: 0,\n  OPENED: 1,\n  HEADERS_RECEIVED: 2,\n  LOADING: 3,\n  DONE: 4\n}\nexport {\n  rStates as readyStates\n};\nexport function IncomingMessage(xhr, response, mode) {\n  var self = this\n  Readable.call(self)\n\n  self._mode = mode\n  self.headers = {}\n  self.rawHeaders = []\n  self.trailers = {}\n  self.rawTrailers = []\n\n  // Fake the 'close' event, but only once 'end' fires\n  self.on('end', function() {\n    // The nextTick is necessary to prevent the 'request' module from causing an infinite loop\n    process.nextTick(function() {\n      self.emit('close')\n    })\n  })\n  var read;\n  if (mode === 'fetch') {\n    self._fetchResponse = response\n\n    self.url = response.url\n    self.statusCode = response.status\n    self.statusMessage = response.statusText\n      // backwards compatible version of for (<item> of <iterable>):\n      // for (var <item>,_i,_it = <iterable>[Symbol.iterator](); <item> = (_i = _it.next()).value,!_i.done;)\n    for (var header, _i, _it = response.headers[Symbol.iterator](); header = (_i = _it.next()).value, !_i.done;) {\n      self.headers[header[0].toLowerCase()] = header[1]\n      self.rawHeaders.push(header[0], header[1])\n    }\n\n    // TODO: this doesn't respect backpressure. Once WritableStream is available, this can be fixed\n    var reader = response.body.getReader()\n\n    read = function () {\n      reader.read().then(function(result) {\n        if (self._destroyed)\n          return\n        if (result.done) {\n          self.push(null)\n          return\n        }\n        self.push(new Buffer(result.value))\n        read()\n      })\n    }\n    read()\n\n  } else {\n    self._xhr = xhr\n    self._pos = 0\n\n    self.url = xhr.responseURL\n    self.statusCode = xhr.status\n    self.statusMessage = xhr.statusText\n    var headers = xhr.getAllResponseHeaders().split(/\\r?\\n/)\n    headers.forEach(function(header) {\n      var matches = header.match(/^([^:]+):\\s*(.*)/)\n      if (matches) {\n        var key = matches[1].toLowerCase()\n        if (key === 'set-cookie') {\n          if (self.headers[key] === undefined) {\n            self.headers[key] = []\n          }\n          self.headers[key].push(matches[2])\n        } else if (self.headers[key] !== undefined) {\n          self.headers[key] += ', ' + matches[2]\n        } else {\n          self.headers[key] = matches[2]\n        }\n        self.rawHeaders.push(matches[1], matches[2])\n      }\n    })\n\n    self._charset = 'x-user-defined'\n    if (!overrideMimeType) {\n      var mimeType = self.rawHeaders['mime-type']\n      if (mimeType) {\n        var charsetMatch = mimeType.match(/;\\s*charset=([^;])(;|$)/)\n        if (charsetMatch) {\n          self._charset = charsetMatch[1].toLowerCase()\n        }\n      }\n      if (!self._charset)\n        self._charset = 'utf-8' // best guess\n    }\n  }\n}\n\ninherits(IncomingMessage, Readable)\n\nIncomingMessage.prototype._read = function() {}\n\nIncomingMessage.prototype._onXHRProgress = function() {\n  var self = this\n\n  var xhr = self._xhr\n\n  var response = null\n  switch (self._mode) {\n  case 'text:vbarray': // For IE9\n    if (xhr.readyState !== rStates.DONE)\n      break\n    try {\n      // This fails in IE8\n      response = new global.VBArray(xhr.responseBody).toArray()\n    } catch (e) {\n      // pass\n    }\n    if (response !== null) {\n      self.push(new Buffer(response))\n      break\n    }\n    // Falls through in IE8\n  case 'text':\n    try { // This will fail when readyState = 3 in IE9. Switch mode and wait for readyState = 4\n      response = xhr.responseText\n    } catch (e) {\n      self._mode = 'text:vbarray'\n      break\n    }\n    if (response.length > self._pos) {\n      var newData = response.substr(self._pos)\n      if (self._charset === 'x-user-defined') {\n        var buffer = new Buffer(newData.length)\n        for (var i = 0; i < newData.length; i++)\n          buffer[i] = newData.charCodeAt(i) & 0xff\n\n        self.push(buffer)\n      } else {\n        self.push(newData, self._charset)\n      }\n      self._pos = response.length\n    }\n    break\n  case 'arraybuffer':\n    if (xhr.readyState !== rStates.DONE || !xhr.response)\n      break\n    response = xhr.response\n    self.push(new Buffer(new Uint8Array(response)))\n    break\n  case 'moz-chunked-arraybuffer': // take whole\n    response = xhr.response\n    if (xhr.readyState !== rStates.LOADING || !response)\n      break\n    self.push(new Buffer(new Uint8Array(response)))\n    break\n  case 'ms-stream':\n    response = xhr.response\n    if (xhr.readyState !== rStates.LOADING)\n      break\n    var reader = new global.MSStreamReader()\n    reader.onprogress = function() {\n      if (reader.result.byteLength > self._pos) {\n        self.push(new Buffer(new Uint8Array(reader.result.slice(self._pos))))\n        self._pos = reader.result.byteLength\n      }\n    }\n    reader.onload = function() {\n      self.push(null)\n    }\n      // reader.onerror = ??? // TODO: this\n    reader.readAsArrayBuffer(response)\n    break\n  }\n\n  // The ms-stream case handles end separately in reader.onload()\n  if (self._xhr.readyState === rStates.DONE && self._mode !== 'ms-stream') {\n    self.push(null)\n  }\n}\n","__http-lib/to-arraybuffer.js":"// from https://github.com/jhiesey/to-arraybuffer/blob/6502d9850e70ba7935a7df4ad86b358fc216f9f0/index.js\n\n// MIT License\n// Copyright (c) 2016 John Hiesey\nimport {isBuffer} from 'buffer';\nexport default function (buf) {\n  // If the buffer is backed by a Uint8Array, a faster version will work\n  if (buf instanceof Uint8Array) {\n    // If the buffer isn't a subarray, return the underlying ArrayBuffer\n    if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {\n      return buf.buffer\n    } else if (typeof buf.buffer.slice === 'function') {\n      // Otherwise we need to get a proper copy\n      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)\n    }\n  }\n\n  if (isBuffer(buf)) {\n    // This is the slow version that will work with any Buffer\n    // implementation (even in old browsers)\n    var arrayCopy = new Uint8Array(buf.length)\n    var len = buf.length\n    for (var i = 0; i < len; i++) {\n      arrayCopy[i] = buf[i]\n    }\n    return arrayCopy.buffer\n  } else {\n    throw new Error('Argument must be a Buffer')\n  }\n}\n","__readable-stream/buffer-list.js":"import {Buffer} from 'buffer';\n\nexport default BufferList;\n\nfunction BufferList() {\n  this.head = null;\n  this.tail = null;\n  this.length = 0;\n}\n\nBufferList.prototype.push = function (v) {\n  var entry = { data: v, next: null };\n  if (this.length > 0) this.tail.next = entry;else this.head = entry;\n  this.tail = entry;\n  ++this.length;\n};\n\nBufferList.prototype.unshift = function (v) {\n  var entry = { data: v, next: this.head };\n  if (this.length === 0) this.tail = entry;\n  this.head = entry;\n  ++this.length;\n};\n\nBufferList.prototype.shift = function () {\n  if (this.length === 0) return;\n  var ret = this.head.data;\n  if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;\n  --this.length;\n  return ret;\n};\n\nBufferList.prototype.clear = function () {\n  this.head = this.tail = null;\n  this.length = 0;\n};\n\nBufferList.prototype.join = function (s) {\n  if (this.length === 0) return '';\n  var p = this.head;\n  var ret = '' + p.data;\n  while (p = p.next) {\n    ret += s + p.data;\n  }return ret;\n};\n\nBufferList.prototype.concat = function (n) {\n  if (this.length === 0) return Buffer.alloc(0);\n  if (this.length === 1) return this.head.data;\n  var ret = Buffer.allocUnsafe(n >>> 0);\n  var p = this.head;\n  var i = 0;\n  while (p) {\n    p.data.copy(ret, i);\n    i += p.data.length;\n    p = p.next;\n  }\n  return ret;\n};\n","__readable-stream/duplex.js":"\nimport {inherits} from 'util';\nimport {nextTick} from 'process';\nimport {Readable} from '\\0polyfill-node._stream_readable';\nimport {Writable} from '\\0polyfill-node._stream_writable';\n\n\ninherits(Duplex, Readable);\n\nvar keys = Object.keys(Writable.prototype);\nfor (var v = 0; v < keys.length; v++) {\n  var method = keys[v];\n  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];\n}\nexport default Duplex;\nexport function Duplex(options) {\n  if (!(this instanceof Duplex)) return new Duplex(options);\n\n  Readable.call(this, options);\n  Writable.call(this, options);\n\n  if (options && options.readable === false) this.readable = false;\n\n  if (options && options.writable === false) this.writable = false;\n\n  this.allowHalfOpen = true;\n  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;\n\n  this.once('end', onend);\n}\n\n// the no-half-open enforcer\nfunction onend() {\n  // if we allow half-open state, or if the writable side ended,\n  // then we're ok.\n  if (this.allowHalfOpen || this._writableState.ended) return;\n\n  // no more data can be written.\n  // But allow more writes to happen in this tick.\n  nextTick(onEndNT, this);\n}\n\nfunction onEndNT(self) {\n  self.end();\n}\n","__readable-stream/passthrough.js":"\nimport {Transform} from '\\0polyfill-node._stream_transform';\n\nimport {inherits} from 'util';\ninherits(PassThrough, Transform);\nexport default PassThrough;\nexport function PassThrough(options) {\n  if (!(this instanceof PassThrough)) return new PassThrough(options);\n\n  Transform.call(this, options);\n}\n\nPassThrough.prototype._transform = function (chunk, encoding, cb) {\n  cb(null, chunk);\n};\n","__readable-stream/readable.js":"'use strict';\n\n\nReadable.ReadableState = ReadableState;\nimport EventEmitter from 'events';\nimport {inherits, debuglog} from 'util';\nimport BufferList from '_buffer_list';\nimport {StringDecoder} from 'string_decoder';\nimport {Duplex} from '\\0polyfill-node._stream_duplex';\nimport {nextTick} from 'process';\n\nvar debug = debuglog('stream');\ninherits(Readable, EventEmitter);\n\nfunction prependListener(emitter, event, fn) {\n  // Sadly this is not cacheable as some libraries bundle their own\n  // event emitter implementation with them.\n  if (typeof emitter.prependListener === 'function') {\n    return emitter.prependListener(event, fn);\n  } else {\n    // This is a hack to make sure that our error handler is attached before any\n    // userland ones.  NEVER DO THIS. This is here only because this code needs\n    // to continue to work with older versions of Node.js that do not include\n    // the prependListener() method. The goal is to eventually remove this hack.\n    if (!emitter._events || !emitter._events[event])\n      emitter.on(event, fn);\n    else if (Array.isArray(emitter._events[event]))\n      emitter._events[event].unshift(fn);\n    else\n      emitter._events[event] = [fn, emitter._events[event]];\n  }\n}\nfunction listenerCount (emitter, type) {\n  return emitter.listeners(type).length;\n}\nfunction ReadableState(options, stream) {\n\n  options = options || {};\n\n  // object stream flag. Used to make read(n) ignore n and to\n  // make all the buffer merging and length checks go away\n  this.objectMode = !!options.objectMode;\n\n  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;\n\n  // the point at which it stops calling _read() to fill the buffer\n  // Note: 0 is a valid value, means \"don't call _read preemptively ever\"\n  var hwm = options.highWaterMark;\n  var defaultHwm = this.objectMode ? 16 : 16 * 1024;\n  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;\n\n  // cast to ints.\n  this.highWaterMark = ~ ~this.highWaterMark;\n\n  // A linked list is used to store data chunks instead of an array because the\n  // linked list can remove elements from the beginning faster than\n  // array.shift()\n  this.buffer = new BufferList();\n  this.length = 0;\n  this.pipes = null;\n  this.pipesCount = 0;\n  this.flowing = null;\n  this.ended = false;\n  this.endEmitted = false;\n  this.reading = false;\n\n  // a flag to be able to tell if the onwrite cb is called immediately,\n  // or on a later tick.  We set this to true at first, because any\n  // actions that shouldn't happen until \"later\" should generally also\n  // not happen before the first write call.\n  this.sync = true;\n\n  // whenever we return null, then we set a flag to say\n  // that we're awaiting a 'readable' event emission.\n  this.needReadable = false;\n  this.emittedReadable = false;\n  this.readableListening = false;\n  this.resumeScheduled = false;\n\n  // Crypto is kind of old and crusty.  Historically, its default string\n  // encoding is 'binary' so we have to make this configurable.\n  // Everything else in the universe uses 'utf8', though.\n  this.defaultEncoding = options.defaultEncoding || 'utf8';\n\n  // when piping, we only care about 'readable' events that happen\n  // after read()ing all the bytes and not getting any pushback.\n  this.ranOut = false;\n\n  // the number of writers that are awaiting a drain event in .pipe()s\n  this.awaitDrain = 0;\n\n  // if true, a maybeReadMore has been scheduled\n  this.readingMore = false;\n\n  this.decoder = null;\n  this.encoding = null;\n  if (options.encoding) {\n    this.decoder = new StringDecoder(options.encoding);\n    this.encoding = options.encoding;\n  }\n}\nexport default Readable;\nexport function Readable(options) {\n\n  if (!(this instanceof Readable)) return new Readable(options);\n\n  this._readableState = new ReadableState(options, this);\n\n  // legacy\n  this.readable = true;\n\n  if (options && typeof options.read === 'function') this._read = options.read;\n\n  EventEmitter.call(this);\n}\n\n// Manually shove something into the read() buffer.\n// This returns true if the highWaterMark has not been hit yet,\n// similar to how Writable.write() returns true if you should\n// write() some more.\nReadable.prototype.push = function (chunk, encoding) {\n  var state = this._readableState;\n\n  if (!state.objectMode && typeof chunk === 'string') {\n    encoding = encoding || state.defaultEncoding;\n    if (encoding !== state.encoding) {\n      chunk = Buffer.from(chunk, encoding);\n      encoding = '';\n    }\n  }\n\n  return readableAddChunk(this, state, chunk, encoding, false);\n};\n\n// Unshift should *always* be something directly out of read()\nReadable.prototype.unshift = function (chunk) {\n  var state = this._readableState;\n  return readableAddChunk(this, state, chunk, '', true);\n};\n\nReadable.prototype.isPaused = function () {\n  return this._readableState.flowing === false;\n};\n\nfunction readableAddChunk(stream, state, chunk, encoding, addToFront) {\n  var er = chunkInvalid(state, chunk);\n  if (er) {\n    stream.emit('error', er);\n  } else if (chunk === null) {\n    state.reading = false;\n    onEofChunk(stream, state);\n  } else if (state.objectMode || chunk && chunk.length > 0) {\n    if (state.ended && !addToFront) {\n      var e = new Error('stream.push() after EOF');\n      stream.emit('error', e);\n    } else if (state.endEmitted && addToFront) {\n      var _e = new Error('stream.unshift() after end event');\n      stream.emit('error', _e);\n    } else {\n      var skipAdd;\n      if (state.decoder && !addToFront && !encoding) {\n        chunk = state.decoder.write(chunk);\n        skipAdd = !state.objectMode && chunk.length === 0;\n      }\n\n      if (!addToFront) state.reading = false;\n\n      // Don't add to the buffer if we've decoded to an empty string chunk and\n      // we're not in object mode\n      if (!skipAdd) {\n        // if we want the data now, just emit it.\n        if (state.flowing && state.length === 0 && !state.sync) {\n          stream.emit('data', chunk);\n          stream.read(0);\n        } else {\n          // update the buffer info.\n          state.length += state.objectMode ? 1 : chunk.length;\n          if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);\n\n          if (state.needReadable) emitReadable(stream);\n        }\n      }\n\n      maybeReadMore(stream, state);\n    }\n  } else if (!addToFront) {\n    state.reading = false;\n  }\n\n  return needMoreData(state);\n}\n\n// if it's past the high water mark, we can push in some more.\n// Also, if we have no data yet, we can stand some\n// more bytes.  This is to work around cases where hwm=0,\n// such as the repl.  Also, if the push() triggered a\n// readable event, and the user called read(largeNumber) such that\n// needReadable was set, then we ought to push more, so that another\n// 'readable' event will be triggered.\nfunction needMoreData(state) {\n  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);\n}\n\n// backwards compatibility.\nReadable.prototype.setEncoding = function (enc) {\n  this._readableState.decoder = new StringDecoder(enc);\n  this._readableState.encoding = enc;\n  return this;\n};\n\n// Don't raise the hwm > 8MB\nvar MAX_HWM = 0x800000;\nfunction computeNewHighWaterMark(n) {\n  if (n >= MAX_HWM) {\n    n = MAX_HWM;\n  } else {\n    // Get the next highest power of 2 to prevent increasing hwm excessively in\n    // tiny amounts\n    n--;\n    n |= n >>> 1;\n    n |= n >>> 2;\n    n |= n >>> 4;\n    n |= n >>> 8;\n    n |= n >>> 16;\n    n++;\n  }\n  return n;\n}\n\n// This function is designed to be inlinable, so please take care when making\n// changes to the function body.\nfunction howMuchToRead(n, state) {\n  if (n <= 0 || state.length === 0 && state.ended) return 0;\n  if (state.objectMode) return 1;\n  if (n !== n) {\n    // Only flow one buffer at a time\n    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;\n  }\n  // If we're asking for more than the current hwm, then raise the hwm.\n  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);\n  if (n <= state.length) return n;\n  // Don't have enough\n  if (!state.ended) {\n    state.needReadable = true;\n    return 0;\n  }\n  return state.length;\n}\n\n// you can override either this method, or the async _read(n) below.\nReadable.prototype.read = function (n) {\n  debug('read', n);\n  n = parseInt(n, 10);\n  var state = this._readableState;\n  var nOrig = n;\n\n  if (n !== 0) state.emittedReadable = false;\n\n  // if we're doing read(0) to trigger a readable event, but we\n  // already have a bunch of data in the buffer, then just trigger\n  // the 'readable' event and move on.\n  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {\n    debug('read: emitReadable', state.length, state.ended);\n    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);\n    return null;\n  }\n\n  n = howMuchToRead(n, state);\n\n  // if we've ended, and we're now clear, then finish it up.\n  if (n === 0 && state.ended) {\n    if (state.length === 0) endReadable(this);\n    return null;\n  }\n\n  // All the actual chunk generation logic needs to be\n  // *below* the call to _read.  The reason is that in certain\n  // synthetic stream cases, such as passthrough streams, _read\n  // may be a completely synchronous operation which may change\n  // the state of the read buffer, providing enough data when\n  // before there was *not* enough.\n  //\n  // So, the steps are:\n  // 1. Figure out what the state of things will be after we do\n  // a read from the buffer.\n  //\n  // 2. If that resulting state will trigger a _read, then call _read.\n  // Note that this may be asynchronous, or synchronous.  Yes, it is\n  // deeply ugly to write APIs this way, but that still doesn't mean\n  // that the Readable class should behave improperly, as streams are\n  // designed to be sync/async agnostic.\n  // Take note if the _read call is sync or async (ie, if the read call\n  // has returned yet), so that we know whether or not it's safe to emit\n  // 'readable' etc.\n  //\n  // 3. Actually pull the requested chunks out of the buffer and return.\n\n  // if we need a readable event, then we need to do some reading.\n  var doRead = state.needReadable;\n  debug('need readable', doRead);\n\n  // if we currently have less than the highWaterMark, then also read some\n  if (state.length === 0 || state.length - n < state.highWaterMark) {\n    doRead = true;\n    debug('length less than watermark', doRead);\n  }\n\n  // however, if we've ended, then there's no point, and if we're already\n  // reading, then it's unnecessary.\n  if (state.ended || state.reading) {\n    doRead = false;\n    debug('reading or ended', doRead);\n  } else if (doRead) {\n    debug('do read');\n    state.reading = true;\n    state.sync = true;\n    // if the length is currently zero, then we *need* a readable event.\n    if (state.length === 0) state.needReadable = true;\n    // call internal read method\n    this._read(state.highWaterMark);\n    state.sync = false;\n    // If _read pushed data synchronously, then `reading` will be false,\n    // and we need to re-evaluate how much data we can return to the user.\n    if (!state.reading) n = howMuchToRead(nOrig, state);\n  }\n\n  var ret;\n  if (n > 0) ret = fromList(n, state);else ret = null;\n\n  if (ret === null) {\n    state.needReadable = true;\n    n = 0;\n  } else {\n    state.length -= n;\n  }\n\n  if (state.length === 0) {\n    // If we have nothing in the buffer, then we want to know\n    // as soon as we *do* get something into the buffer.\n    if (!state.ended) state.needReadable = true;\n\n    // If we tried to read() past the EOF, then emit end on the next tick.\n    if (nOrig !== n && state.ended) endReadable(this);\n  }\n\n  if (ret !== null) this.emit('data', ret);\n\n  return ret;\n};\n\nfunction chunkInvalid(state, chunk) {\n  var er = null;\n  if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {\n    er = new TypeError('Invalid non-string/buffer chunk');\n  }\n  return er;\n}\n\nfunction onEofChunk(stream, state) {\n  if (state.ended) return;\n  if (state.decoder) {\n    var chunk = state.decoder.end();\n    if (chunk && chunk.length) {\n      state.buffer.push(chunk);\n      state.length += state.objectMode ? 1 : chunk.length;\n    }\n  }\n  state.ended = true;\n\n  // emit 'readable' now to make sure it gets picked up.\n  emitReadable(stream);\n}\n\n// Don't emit readable right away in sync mode, because this can trigger\n// another read() call => stack overflow.  This way, it might trigger\n// a nextTick recursion warning, but that's not so bad.\nfunction emitReadable(stream) {\n  var state = stream._readableState;\n  state.needReadable = false;\n  if (!state.emittedReadable) {\n    debug('emitReadable', state.flowing);\n    state.emittedReadable = true;\n    if (state.sync) nextTick(emitReadable_, stream);else emitReadable_(stream);\n  }\n}\n\nfunction emitReadable_(stream) {\n  debug('emit readable');\n  stream.emit('readable');\n  flow(stream);\n}\n\n// at this point, the user has presumably seen the 'readable' event,\n// and called read() to consume some data.  that may have triggered\n// in turn another _read(n) call, in which case reading = true if\n// it's in progress.\n// However, if we're not ended, or reading, and the length < hwm,\n// then go ahead and try to read some more preemptively.\nfunction maybeReadMore(stream, state) {\n  if (!state.readingMore) {\n    state.readingMore = true;\n    nextTick(maybeReadMore_, stream, state);\n  }\n}\n\nfunction maybeReadMore_(stream, state) {\n  var len = state.length;\n  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {\n    debug('maybeReadMore read 0');\n    stream.read(0);\n    if (len === state.length)\n      // didn't get any data, stop spinning.\n      break;else len = state.length;\n  }\n  state.readingMore = false;\n}\n\n// abstract method.  to be overridden in specific implementation classes.\n// call cb(er, data) where data is <= n in length.\n// for virtual (non-string, non-buffer) streams, \"length\" is somewhat\n// arbitrary, and perhaps not very meaningful.\nReadable.prototype._read = function (n) {\n  this.emit('error', new Error('not implemented'));\n};\n\nReadable.prototype.pipe = function (dest, pipeOpts) {\n  var src = this;\n  var state = this._readableState;\n\n  switch (state.pipesCount) {\n    case 0:\n      state.pipes = dest;\n      break;\n    case 1:\n      state.pipes = [state.pipes, dest];\n      break;\n    default:\n      state.pipes.push(dest);\n      break;\n  }\n  state.pipesCount += 1;\n  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);\n\n  var doEnd = (!pipeOpts || pipeOpts.end !== false);\n\n  var endFn = doEnd ? onend : cleanup;\n  if (state.endEmitted) nextTick(endFn);else src.once('end', endFn);\n\n  dest.on('unpipe', onunpipe);\n  function onunpipe(readable) {\n    debug('onunpipe');\n    if (readable === src) {\n      cleanup();\n    }\n  }\n\n  function onend() {\n    debug('onend');\n    dest.end();\n  }\n\n  // when the dest drains, it reduces the awaitDrain counter\n  // on the source.  This would be more elegant with a .once()\n  // handler in flow(), but adding and removing repeatedly is\n  // too slow.\n  var ondrain = pipeOnDrain(src);\n  dest.on('drain', ondrain);\n\n  var cleanedUp = false;\n  function cleanup() {\n    debug('cleanup');\n    // cleanup event handlers once the pipe is broken\n    dest.removeListener('close', onclose);\n    dest.removeListener('finish', onfinish);\n    dest.removeListener('drain', ondrain);\n    dest.removeListener('error', onerror);\n    dest.removeListener('unpipe', onunpipe);\n    src.removeListener('end', onend);\n    src.removeListener('end', cleanup);\n    src.removeListener('data', ondata);\n\n    cleanedUp = true;\n\n    // if the reader is waiting for a drain event from this\n    // specific writer, then it would cause it to never start\n    // flowing again.\n    // So, if this is awaiting a drain, then we just call it now.\n    // If we don't know, then assume that we are waiting for one.\n    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();\n  }\n\n  // If the user pushes more data while we're writing to dest then we'll end up\n  // in ondata again. However, we only want to increase awaitDrain once because\n  // dest will only emit one 'drain' event for the multiple writes.\n  // => Introduce a guard on increasing awaitDrain.\n  var increasedAwaitDrain = false;\n  src.on('data', ondata);\n  function ondata(chunk) {\n    debug('ondata');\n    increasedAwaitDrain = false;\n    var ret = dest.write(chunk);\n    if (false === ret && !increasedAwaitDrain) {\n      // If the user unpiped during `dest.write()`, it is possible\n      // to get stuck in a permanently paused state if that write\n      // also returned false.\n      // => Check whether `dest` is still a piping destination.\n      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {\n        debug('false write response, pause', src._readableState.awaitDrain);\n        src._readableState.awaitDrain++;\n        increasedAwaitDrain = true;\n      }\n      src.pause();\n    }\n  }\n\n  // if the dest has an error, then stop piping into it.\n  // however, don't suppress the throwing behavior for this.\n  function onerror(er) {\n    debug('onerror', er);\n    unpipe();\n    dest.removeListener('error', onerror);\n    if (listenerCount(dest, 'error') === 0) dest.emit('error', er);\n  }\n\n  // Make sure our error handler is attached before userland ones.\n  prependListener(dest, 'error', onerror);\n\n  // Both close and finish should trigger unpipe, but only once.\n  function onclose() {\n    dest.removeListener('finish', onfinish);\n    unpipe();\n  }\n  dest.once('close', onclose);\n  function onfinish() {\n    debug('onfinish');\n    dest.removeListener('close', onclose);\n    unpipe();\n  }\n  dest.once('finish', onfinish);\n\n  function unpipe() {\n    debug('unpipe');\n    src.unpipe(dest);\n  }\n\n  // tell the dest that it's being piped to\n  dest.emit('pipe', src);\n\n  // start the flow if it hasn't been started already.\n  if (!state.flowing) {\n    debug('pipe resume');\n    src.resume();\n  }\n\n  return dest;\n};\n\nfunction pipeOnDrain(src) {\n  return function () {\n    var state = src._readableState;\n    debug('pipeOnDrain', state.awaitDrain);\n    if (state.awaitDrain) state.awaitDrain--;\n    if (state.awaitDrain === 0 && src.listeners('data').length) {\n      state.flowing = true;\n      flow(src);\n    }\n  };\n}\n\nReadable.prototype.unpipe = function (dest) {\n  var state = this._readableState;\n\n  // if we're not piping anywhere, then do nothing.\n  if (state.pipesCount === 0) return this;\n\n  // just one destination.  most common case.\n  if (state.pipesCount === 1) {\n    // passed in one, but it's not the right one.\n    if (dest && dest !== state.pipes) return this;\n\n    if (!dest) dest = state.pipes;\n\n    // got a match.\n    state.pipes = null;\n    state.pipesCount = 0;\n    state.flowing = false;\n    if (dest) dest.emit('unpipe', this);\n    return this;\n  }\n\n  // slow case. multiple pipe destinations.\n\n  if (!dest) {\n    // remove all.\n    var dests = state.pipes;\n    var len = state.pipesCount;\n    state.pipes = null;\n    state.pipesCount = 0;\n    state.flowing = false;\n\n    for (var _i = 0; _i < len; _i++) {\n      dests[_i].emit('unpipe', this);\n    }return this;\n  }\n\n  // try to find the right one.\n  var i = indexOf(state.pipes, dest);\n  if (i === -1) return this;\n\n  state.pipes.splice(i, 1);\n  state.pipesCount -= 1;\n  if (state.pipesCount === 1) state.pipes = state.pipes[0];\n\n  dest.emit('unpipe', this);\n\n  return this;\n};\n\n// set up data events if they are asked for\n// Ensure readable listeners eventually get something\nReadable.prototype.on = function (ev, fn) {\n  var res = EventEmitter.prototype.on.call(this, ev, fn);\n\n  if (ev === 'data') {\n    // Start flowing on next tick if stream isn't explicitly paused\n    if (this._readableState.flowing !== false) this.resume();\n  } else if (ev === 'readable') {\n    var state = this._readableState;\n    if (!state.endEmitted && !state.readableListening) {\n      state.readableListening = state.needReadable = true;\n      state.emittedReadable = false;\n      if (!state.reading) {\n        nextTick(nReadingNextTick, this);\n      } else if (state.length) {\n        emitReadable(this, state);\n      }\n    }\n  }\n\n  return res;\n};\nReadable.prototype.addListener = Readable.prototype.on;\n\nfunction nReadingNextTick(self) {\n  debug('readable nexttick read 0');\n  self.read(0);\n}\n\n// pause() and resume() are remnants of the legacy readable stream API\n// If the user uses them, then switch into old mode.\nReadable.prototype.resume = function () {\n  var state = this._readableState;\n  if (!state.flowing) {\n    debug('resume');\n    state.flowing = true;\n    resume(this, state);\n  }\n  return this;\n};\n\nfunction resume(stream, state) {\n  if (!state.resumeScheduled) {\n    state.resumeScheduled = true;\n    nextTick(resume_, stream, state);\n  }\n}\n\nfunction resume_(stream, state) {\n  if (!state.reading) {\n    debug('resume read 0');\n    stream.read(0);\n  }\n\n  state.resumeScheduled = false;\n  state.awaitDrain = 0;\n  stream.emit('resume');\n  flow(stream);\n  if (state.flowing && !state.reading) stream.read(0);\n}\n\nReadable.prototype.pause = function () {\n  debug('call pause flowing=%j', this._readableState.flowing);\n  if (false !== this._readableState.flowing) {\n    debug('pause');\n    this._readableState.flowing = false;\n    this.emit('pause');\n  }\n  return this;\n};\n\nfunction flow(stream) {\n  var state = stream._readableState;\n  debug('flow', state.flowing);\n  while (state.flowing && stream.read() !== null) {}\n}\n\n// wrap an old-style stream as the async data source.\n// This is *not* part of the readable stream interface.\n// It is an ugly unfortunate mess of history.\nReadable.prototype.wrap = function (stream) {\n  var state = this._readableState;\n  var paused = false;\n\n  var self = this;\n  stream.on('end', function () {\n    debug('wrapped end');\n    if (state.decoder && !state.ended) {\n      var chunk = state.decoder.end();\n      if (chunk && chunk.length) self.push(chunk);\n    }\n\n    self.push(null);\n  });\n\n  stream.on('data', function (chunk) {\n    debug('wrapped data');\n    if (state.decoder) chunk = state.decoder.write(chunk);\n\n    // don't skip over falsy values in objectMode\n    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;\n\n    var ret = self.push(chunk);\n    if (!ret) {\n      paused = true;\n      stream.pause();\n    }\n  });\n\n  // proxy all the other methods.\n  // important when wrapping filters and duplexes.\n  for (var i in stream) {\n    if (this[i] === undefined && typeof stream[i] === 'function') {\n      this[i] = function (method) {\n        return function () {\n          return stream[method].apply(stream, arguments);\n        };\n      }(i);\n    }\n  }\n\n  // proxy certain important events.\n  var events = ['error', 'close', 'destroy', 'pause', 'resume'];\n  forEach(events, function (ev) {\n    stream.on(ev, self.emit.bind(self, ev));\n  });\n\n  // when we try to consume some more bytes, simply unpause the\n  // underlying stream.\n  self._read = function (n) {\n    debug('wrapped _read', n);\n    if (paused) {\n      paused = false;\n      stream.resume();\n    }\n  };\n\n  return self;\n};\n\n// exposed for testing purposes only.\nReadable._fromList = fromList;\n\n// Pluck off n bytes from an array of buffers.\n// Length is the combined lengths of all the buffers in the list.\n// This function is designed to be inlinable, so please take care when making\n// changes to the function body.\nfunction fromList(n, state) {\n  // nothing buffered\n  if (state.length === 0) return null;\n\n  var ret;\n  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {\n    // read it all, truncate the list\n    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);\n    state.buffer.clear();\n  } else {\n    // read part of list\n    ret = fromListPartial(n, state.buffer, state.decoder);\n  }\n\n  return ret;\n}\n\n// Extracts only enough buffered data to satisfy the amount requested.\n// This function is designed to be inlinable, so please take care when making\n// changes to the function body.\nfunction fromListPartial(n, list, hasStrings) {\n  var ret;\n  if (n < list.head.data.length) {\n    // slice is the same for buffers and strings\n    ret = list.head.data.slice(0, n);\n    list.head.data = list.head.data.slice(n);\n  } else if (n === list.head.data.length) {\n    // first chunk is a perfect match\n    ret = list.shift();\n  } else {\n    // result spans more than one buffer\n    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);\n  }\n  return ret;\n}\n\n// Copies a specified amount of characters from the list of buffered data\n// chunks.\n// This function is designed to be inlinable, so please take care when making\n// changes to the function body.\nfunction copyFromBufferString(n, list) {\n  var p = list.head;\n  var c = 1;\n  var ret = p.data;\n  n -= ret.length;\n  while (p = p.next) {\n    var str = p.data;\n    var nb = n > str.length ? str.length : n;\n    if (nb === str.length) ret += str;else ret += str.slice(0, n);\n    n -= nb;\n    if (n === 0) {\n      if (nb === str.length) {\n        ++c;\n        if (p.next) list.head = p.next;else list.head = list.tail = null;\n      } else {\n        list.head = p;\n        p.data = str.slice(nb);\n      }\n      break;\n    }\n    ++c;\n  }\n  list.length -= c;\n  return ret;\n}\n\n// Copies a specified amount of bytes from the list of buffered data chunks.\n// This function is designed to be inlinable, so please take care when making\n// changes to the function body.\nfunction copyFromBuffer(n, list) {\n  var ret = Buffer.allocUnsafe(n);\n  var p = list.head;\n  var c = 1;\n  p.data.copy(ret);\n  n -= p.data.length;\n  while (p = p.next) {\n    var buf = p.data;\n    var nb = n > buf.length ? buf.length : n;\n    buf.copy(ret, ret.length - n, 0, nb);\n    n -= nb;\n    if (n === 0) {\n      if (nb === buf.length) {\n        ++c;\n        if (p.next) list.head = p.next;else list.head = list.tail = null;\n      } else {\n        list.head = p;\n        p.data = buf.slice(nb);\n      }\n      break;\n    }\n    ++c;\n  }\n  list.length -= c;\n  return ret;\n}\n\nfunction endReadable(stream) {\n  var state = stream._readableState;\n\n  // If we get here before consuming all the bytes, then that is a\n  // bug in node.  Should never happen.\n  if (state.length > 0) throw new Error('\"endReadable()\" called on non-empty stream');\n\n  if (!state.endEmitted) {\n    state.ended = true;\n    nextTick(endReadableNT, state, stream);\n  }\n}\n\nfunction endReadableNT(state, stream) {\n  // Check that we didn't get one last unshift.\n  if (!state.endEmitted && state.length === 0) {\n    state.endEmitted = true;\n    stream.readable = false;\n    stream.emit('end');\n  }\n}\n\nfunction forEach(xs, f) {\n  for (var i = 0, l = xs.length; i < l; i++) {\n    f(xs[i], i);\n  }\n}\n\nfunction indexOf(xs, x) {\n  for (var i = 0, l = xs.length; i < l; i++) {\n    if (xs[i] === x) return i;\n  }\n  return -1;\n}\n","__readable-stream/transform.js":"// a transform stream is a readable/writable stream where you do\n// something with the data.  Sometimes it's called a \"filter\",\n// but that's not a great name for it, since that implies a thing where\n// some bits pass through, and others are simply ignored.  (That would\n// be a valid example of a transform, of course.)\n//\n// While the output is causally related to the input, it's not a\n// necessarily symmetric or synchronous transformation.  For example,\n// a zlib stream might take multiple plain-text writes(), and then\n// emit a single compressed chunk some time in the future.\n//\n// Here's how this works:\n//\n// The Transform stream has all the aspects of the readable and writable\n// stream classes.  When you write(chunk), that calls _write(chunk,cb)\n// internally, and returns false if there's a lot of pending writes\n// buffered up.  When you call read(), that calls _read(n) until\n// there's enough pending readable data buffered up.\n//\n// In a transform stream, the written data is placed in a buffer.  When\n// _read(n) is called, it transforms the queued up data, calling the\n// buffered _write cb's as it consumes chunks.  If consuming a single\n// written chunk would result in multiple output chunks, then the first\n// outputted bit calls the readcb, and subsequent chunks just go into\n// the read buffer, and will cause it to emit 'readable' if necessary.\n//\n// This way, back-pressure is actually determined by the reading side,\n// since _read has to be called to start processing a new chunk.  However,\n// a pathological inflate type of transform can cause excessive buffering\n// here.  For example, imagine a stream where every byte of input is\n// interpreted as an integer from 0-255, and then results in that many\n// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in\n// 1kb of data being output.  In this case, you could write a very small\n// amount of input, and end up with a very large amount of output.  In\n// such a pathological inflating mechanism, there'd be no way to tell\n// the system to stop doing the transform.  A single 4MB write could\n// cause the system to run out of memory.\n//\n// However, even in such a pathological case, only a single written chunk\n// would be consumed, and then the rest would wait (un-transformed) until\n// the results of the previous transformed chunk were consumed.\n\n\nimport {Duplex} from '\\0polyfill-node._stream_duplex';\n\n\nimport {inherits} from 'util';\ninherits(Transform, Duplex);\n\nfunction TransformState(stream) {\n  this.afterTransform = function (er, data) {\n    return afterTransform(stream, er, data);\n  };\n\n  this.needTransform = false;\n  this.transforming = false;\n  this.writecb = null;\n  this.writechunk = null;\n  this.writeencoding = null;\n}\n\nfunction afterTransform(stream, er, data) {\n  var ts = stream._transformState;\n  ts.transforming = false;\n\n  var cb = ts.writecb;\n\n  if (!cb) return stream.emit('error', new Error('no writecb in Transform class'));\n\n  ts.writechunk = null;\n  ts.writecb = null;\n\n  if (data !== null && data !== undefined) stream.push(data);\n\n  cb(er);\n\n  var rs = stream._readableState;\n  rs.reading = false;\n  if (rs.needReadable || rs.length < rs.highWaterMark) {\n    stream._read(rs.highWaterMark);\n  }\n}\nexport default Transform;\nexport function Transform(options) {\n  if (!(this instanceof Transform)) return new Transform(options);\n\n  Duplex.call(this, options);\n\n  this._transformState = new TransformState(this);\n\n  // when the writable side finishes, then flush out anything remaining.\n  var stream = this;\n\n  // start out asking for a readable event once data is transformed.\n  this._readableState.needReadable = true;\n\n  // we have implemented the _read method, and done the other things\n  // that Readable wants before the first _read call, so unset the\n  // sync guard flag.\n  this._readableState.sync = false;\n\n  if (options) {\n    if (typeof options.transform === 'function') this._transform = options.transform;\n\n    if (typeof options.flush === 'function') this._flush = options.flush;\n  }\n\n  this.once('prefinish', function () {\n    if (typeof this._flush === 'function') this._flush(function (er) {\n      done(stream, er);\n    });else done(stream);\n  });\n}\n\nTransform.prototype.push = function (chunk, encoding) {\n  this._transformState.needTransform = false;\n  return Duplex.prototype.push.call(this, chunk, encoding);\n};\n\n// This is the part where you do stuff!\n// override this function in implementation classes.\n// 'chunk' is an input chunk.\n//\n// Call `push(newChunk)` to pass along transformed output\n// to the readable side.  You may call 'push' zero or more times.\n//\n// Call `cb(err)` when you are done with this chunk.  If you pass\n// an error, then that'll put the hurt on the whole operation.  If you\n// never call cb(), then you'll never get another chunk.\nTransform.prototype._transform = function (chunk, encoding, cb) {\n  throw new Error('Not implemented');\n};\n\nTransform.prototype._write = function (chunk, encoding, cb) {\n  var ts = this._transformState;\n  ts.writecb = cb;\n  ts.writechunk = chunk;\n  ts.writeencoding = encoding;\n  if (!ts.transforming) {\n    var rs = this._readableState;\n    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);\n  }\n};\n\n// Doesn't matter what the args are here.\n// _transform does all the work.\n// That we got here means that the readable side wants more data.\nTransform.prototype._read = function (n) {\n  var ts = this._transformState;\n\n  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {\n    ts.transforming = true;\n    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);\n  } else {\n    // mark that we need a transform, so that any data that comes in\n    // will get processed, now that we've asked for it.\n    ts.needTransform = true;\n  }\n};\n\nfunction done(stream, er) {\n  if (er) return stream.emit('error', er);\n\n  // if there's nothing in the write buffer, then that means\n  // that nothing more will ever be provided\n  var ws = stream._writableState;\n  var ts = stream._transformState;\n\n  if (ws.length) throw new Error('Calling transform done when ws.length != 0');\n\n  if (ts.transforming) throw new Error('Calling transform done when still transforming');\n\n  return stream.push(null);\n}\n","__readable-stream/writable.js":"// A bit simpler than readable streams.\n// Implement an async ._write(chunk, encoding, cb), and it'll handle all\n// the drain event emission and buffering.\n\n\nimport {inherits, deprecate} from 'util';\nimport {Buffer} from 'buffer';\nWritable.WritableState = WritableState;\nimport {EventEmitter} from 'events';\nimport {Duplex} from '\\0polyfill-node._stream_duplex';\nimport {nextTick} from 'process';\ninherits(Writable, EventEmitter);\n\nfunction nop() {}\n\nfunction WriteReq(chunk, encoding, cb) {\n  this.chunk = chunk;\n  this.encoding = encoding;\n  this.callback = cb;\n  this.next = null;\n}\n\nfunction WritableState(options, stream) {\n  Object.defineProperty(this, 'buffer', {\n    get: deprecate(function () {\n      return this.getBuffer();\n    }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')\n  });\n  options = options || {};\n\n  // object stream flag to indicate whether or not this stream\n  // contains buffers or objects.\n  this.objectMode = !!options.objectMode;\n\n  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;\n\n  // the point at which write() starts returning false\n  // Note: 0 is a valid value, means that we always return false if\n  // the entire buffer is not flushed immediately on write()\n  var hwm = options.highWaterMark;\n  var defaultHwm = this.objectMode ? 16 : 16 * 1024;\n  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;\n\n  // cast to ints.\n  this.highWaterMark = ~ ~this.highWaterMark;\n\n  this.needDrain = false;\n  // at the start of calling end()\n  this.ending = false;\n  // when end() has been called, and returned\n  this.ended = false;\n  // when 'finish' is emitted\n  this.finished = false;\n\n  // should we decode strings into buffers before passing to _write?\n  // this is here so that some node-core streams can optimize string\n  // handling at a lower level.\n  var noDecode = options.decodeStrings === false;\n  this.decodeStrings = !noDecode;\n\n  // Crypto is kind of old and crusty.  Historically, its default string\n  // encoding is 'binary' so we have to make this configurable.\n  // Everything else in the universe uses 'utf8', though.\n  this.defaultEncoding = options.defaultEncoding || 'utf8';\n\n  // not an actual buffer we keep track of, but a measurement\n  // of how much we're waiting to get pushed to some underlying\n  // socket or file.\n  this.length = 0;\n\n  // a flag to see when we're in the middle of a write.\n  this.writing = false;\n\n  // when true all writes will be buffered until .uncork() call\n  this.corked = 0;\n\n  // a flag to be able to tell if the onwrite cb is called immediately,\n  // or on a later tick.  We set this to true at first, because any\n  // actions that shouldn't happen until \"later\" should generally also\n  // not happen before the first write call.\n  this.sync = true;\n\n  // a flag to know if we're processing previously buffered items, which\n  // may call the _write() callback in the same tick, so that we don't\n  // end up in an overlapped onwrite situation.\n  this.bufferProcessing = false;\n\n  // the callback that's passed to _write(chunk,cb)\n  this.onwrite = function (er) {\n    onwrite(stream, er);\n  };\n\n  // the callback that the user supplies to write(chunk,encoding,cb)\n  this.writecb = null;\n\n  // the amount that is being written when _write is called.\n  this.writelen = 0;\n\n  this.bufferedRequest = null;\n  this.lastBufferedRequest = null;\n\n  // number of pending user-supplied write callbacks\n  // this must be 0 before 'finish' can be emitted\n  this.pendingcb = 0;\n\n  // emit prefinish if the only thing we're waiting for is _write cbs\n  // This is relevant for synchronous Transform streams\n  this.prefinished = false;\n\n  // True if the error was already emitted and should not be thrown again\n  this.errorEmitted = false;\n\n  // count buffered requests\n  this.bufferedRequestCount = 0;\n\n  // allocate the first CorkedRequest, there is always\n  // one allocated and free to use, and we maintain at most two\n  this.corkedRequestsFree = new CorkedRequest(this);\n}\n\nWritableState.prototype.getBuffer = function writableStateGetBuffer() {\n  var current = this.bufferedRequest;\n  var out = [];\n  while (current) {\n    out.push(current);\n    current = current.next;\n  }\n  return out;\n};\n\nexport default Writable;\nexport function Writable(options) {\n\n  // Writable ctor is applied to Duplexes, though they're not\n  // instanceof Writable, they're instanceof Readable.\n  if (!(this instanceof Writable) && !(this instanceof Duplex)) return new Writable(options);\n\n  this._writableState = new WritableState(options, this);\n\n  // legacy.\n  this.writable = true;\n\n  if (options) {\n    if (typeof options.write === 'function') this._write = options.write;\n\n    if (typeof options.writev === 'function') this._writev = options.writev;\n  }\n\n  EventEmitter.call(this);\n}\n\n// Otherwise people can pipe Writable streams, which is just wrong.\nWritable.prototype.pipe = function () {\n  this.emit('error', new Error('Cannot pipe, not readable'));\n};\n\nfunction writeAfterEnd(stream, cb) {\n  var er = new Error('write after end');\n  // TODO: defer error events consistently everywhere, not just the cb\n  stream.emit('error', er);\n  nextTick(cb, er);\n}\n\n// If we get something that is not a buffer, string, null, or undefined,\n// and we're not in objectMode, then that's an error.\n// Otherwise stream chunks are all considered to be of length=1, and the\n// watermarks determine how many objects to keep in the buffer, rather than\n// how many bytes or characters.\nfunction validChunk(stream, state, chunk, cb) {\n  var valid = true;\n  var er = false;\n  // Always throw error if a null is written\n  // if we are not in object mode then throw\n  // if it is not a buffer, string, or undefined.\n  if (chunk === null) {\n    er = new TypeError('May not write null values to stream');\n  } else if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {\n    er = new TypeError('Invalid non-string/buffer chunk');\n  }\n  if (er) {\n    stream.emit('error', er);\n    nextTick(cb, er);\n    valid = false;\n  }\n  return valid;\n}\n\nWritable.prototype.write = function (chunk, encoding, cb) {\n  var state = this._writableState;\n  var ret = false;\n\n  if (typeof encoding === 'function') {\n    cb = encoding;\n    encoding = null;\n  }\n\n  if (Buffer.isBuffer(chunk)) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;\n\n  if (typeof cb !== 'function') cb = nop;\n\n  if (state.ended) writeAfterEnd(this, cb);else if (validChunk(this, state, chunk, cb)) {\n    state.pendingcb++;\n    ret = writeOrBuffer(this, state, chunk, encoding, cb);\n  }\n\n  return ret;\n};\n\nWritable.prototype.cork = function () {\n  var state = this._writableState;\n\n  state.corked++;\n};\n\nWritable.prototype.uncork = function () {\n  var state = this._writableState;\n\n  if (state.corked) {\n    state.corked--;\n\n    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);\n  }\n};\n\nWritable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {\n  // node::ParseEncoding() requires lower case.\n  if (typeof encoding === 'string') encoding = encoding.toLowerCase();\n  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);\n  this._writableState.defaultEncoding = encoding;\n  return this;\n};\n\nfunction decodeChunk(state, chunk, encoding) {\n  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {\n    chunk = Buffer.from(chunk, encoding);\n  }\n  return chunk;\n}\n\n// if we're already writing something, then just put this\n// in the queue, and wait our turn.  Otherwise, call _write\n// If we return false, then we need a drain event, so set that flag.\nfunction writeOrBuffer(stream, state, chunk, encoding, cb) {\n  chunk = decodeChunk(state, chunk, encoding);\n\n  if (Buffer.isBuffer(chunk)) encoding = 'buffer';\n  var len = state.objectMode ? 1 : chunk.length;\n\n  state.length += len;\n\n  var ret = state.length < state.highWaterMark;\n  // we must ensure that previous needDrain will not be reset to false.\n  if (!ret) state.needDrain = true;\n\n  if (state.writing || state.corked) {\n    var last = state.lastBufferedRequest;\n    state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);\n    if (last) {\n      last.next = state.lastBufferedRequest;\n    } else {\n      state.bufferedRequest = state.lastBufferedRequest;\n    }\n    state.bufferedRequestCount += 1;\n  } else {\n    doWrite(stream, state, false, len, chunk, encoding, cb);\n  }\n\n  return ret;\n}\n\nfunction doWrite(stream, state, writev, len, chunk, encoding, cb) {\n  state.writelen = len;\n  state.writecb = cb;\n  state.writing = true;\n  state.sync = true;\n  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);\n  state.sync = false;\n}\n\nfunction onwriteError(stream, state, sync, er, cb) {\n  --state.pendingcb;\n  if (sync) nextTick(cb, er);else cb(er);\n\n  stream._writableState.errorEmitted = true;\n  stream.emit('error', er);\n}\n\nfunction onwriteStateUpdate(state) {\n  state.writing = false;\n  state.writecb = null;\n  state.length -= state.writelen;\n  state.writelen = 0;\n}\n\nfunction onwrite(stream, er) {\n  var state = stream._writableState;\n  var sync = state.sync;\n  var cb = state.writecb;\n\n  onwriteStateUpdate(state);\n\n  if (er) onwriteError(stream, state, sync, er, cb);else {\n    // Check if we're actually ready to finish, but don't emit yet\n    var finished = needFinish(state);\n\n    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {\n      clearBuffer(stream, state);\n    }\n\n    if (sync) {\n      /*<replacement>*/\n        nextTick(afterWrite, stream, state, finished, cb);\n      /*</replacement>*/\n    } else {\n        afterWrite(stream, state, finished, cb);\n      }\n  }\n}\n\nfunction afterWrite(stream, state, finished, cb) {\n  if (!finished) onwriteDrain(stream, state);\n  state.pendingcb--;\n  cb();\n  finishMaybe(stream, state);\n}\n\n// Must force callback to be called on nextTick, so that we don't\n// emit 'drain' before the write() consumer gets the 'false' return\n// value, and has a chance to attach a 'drain' listener.\nfunction onwriteDrain(stream, state) {\n  if (state.length === 0 && state.needDrain) {\n    state.needDrain = false;\n    stream.emit('drain');\n  }\n}\n\n// if there's something in the buffer waiting, then process it\nfunction clearBuffer(stream, state) {\n  state.bufferProcessing = true;\n  var entry = state.bufferedRequest;\n\n  if (stream._writev && entry && entry.next) {\n    // Fast case, write everything using _writev()\n    var l = state.bufferedRequestCount;\n    var buffer = new Array(l);\n    var holder = state.corkedRequestsFree;\n    holder.entry = entry;\n\n    var count = 0;\n    while (entry) {\n      buffer[count] = entry;\n      entry = entry.next;\n      count += 1;\n    }\n\n    doWrite(stream, state, true, state.length, buffer, '', holder.finish);\n\n    // doWrite is almost always async, defer these to save a bit of time\n    // as the hot path ends with doWrite\n    state.pendingcb++;\n    state.lastBufferedRequest = null;\n    if (holder.next) {\n      state.corkedRequestsFree = holder.next;\n      holder.next = null;\n    } else {\n      state.corkedRequestsFree = new CorkedRequest(state);\n    }\n  } else {\n    // Slow case, write chunks one-by-one\n    while (entry) {\n      var chunk = entry.chunk;\n      var encoding = entry.encoding;\n      var cb = entry.callback;\n      var len = state.objectMode ? 1 : chunk.length;\n\n      doWrite(stream, state, false, len, chunk, encoding, cb);\n      entry = entry.next;\n      // if we didn't call the onwrite immediately, then\n      // it means that we need to wait until it does.\n      // also, that means that the chunk and cb are currently\n      // being processed, so move the buffer counter past them.\n      if (state.writing) {\n        break;\n      }\n    }\n\n    if (entry === null) state.lastBufferedRequest = null;\n  }\n\n  state.bufferedRequestCount = 0;\n  state.bufferedRequest = entry;\n  state.bufferProcessing = false;\n}\n\nWritable.prototype._write = function (chunk, encoding, cb) {\n  cb(new Error('not implemented'));\n};\n\nWritable.prototype._writev = null;\n\nWritable.prototype.end = function (chunk, encoding, cb) {\n  var state = this._writableState;\n\n  if (typeof chunk === 'function') {\n    cb = chunk;\n    chunk = null;\n    encoding = null;\n  } else if (typeof encoding === 'function') {\n    cb = encoding;\n    encoding = null;\n  }\n\n  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);\n\n  // .end() fully uncorks\n  if (state.corked) {\n    state.corked = 1;\n    this.uncork();\n  }\n\n  // ignore unnecessary end() calls.\n  if (!state.ending && !state.finished) endWritable(this, state, cb);\n};\n\nfunction needFinish(state) {\n  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;\n}\n\nfunction prefinish(stream, state) {\n  if (!state.prefinished) {\n    state.prefinished = true;\n    stream.emit('prefinish');\n  }\n}\n\nfunction finishMaybe(stream, state) {\n  var need = needFinish(state);\n  if (need) {\n    if (state.pendingcb === 0) {\n      prefinish(stream, state);\n      state.finished = true;\n      stream.emit('finish');\n    } else {\n      prefinish(stream, state);\n    }\n  }\n  return need;\n}\n\nfunction endWritable(stream, state, cb) {\n  state.ending = true;\n  finishMaybe(stream, state);\n  if (cb) {\n    if (state.finished) nextTick(cb);else stream.once('finish', cb);\n  }\n  state.ended = true;\n  stream.writable = false;\n}\n\n// It seems a linked list but it is not\n// there will be only 2 of these for each stream\nfunction CorkedRequest(state) {\n  var _this = this;\n\n  this.next = null;\n  this.entry = null;\n\n  this.finish = function (err) {\n    var entry = _this.entry;\n    _this.entry = null;\n    while (entry) {\n      var cb = entry.callback;\n      state.pendingcb--;\n      cb(err);\n      entry = entry.next;\n    }\n    if (state.corkedRequestsFree) {\n      state.corkedRequestsFree.next = _this;\n    } else {\n      state.corkedRequestsFree = _this;\n    }\n  };\n}\n","__zlib-lib/adler32.js":"\n// Note: adler32 takes 12% for level 0 and 2% for level 6.\n// It doesn't worth to make additional optimizationa as in original.\n// Small size is preferable.\n\nfunction adler32(adler, buf, len, pos) {\n  var s1 = (adler & 0xffff) |0,\n      s2 = ((adler >>> 16) & 0xffff) |0,\n      n = 0;\n\n  while (len !== 0) {\n    // Set limit ~ twice less than 5552, to keep\n    // s2 in 31-bits, because we force signed ints.\n    // in other case %= will fail.\n    n = len > 2000 ? 2000 : len;\n    len -= n;\n\n    do {\n      s1 = (s1 + buf[pos++]) |0;\n      s2 = (s2 + s1) |0;\n    } while (--n);\n\n    s1 %= 65521;\n    s2 %= 65521;\n  }\n\n  return (s1 | (s2 << 16)) |0;\n}\n\n\nexport default adler32;\n","__zlib-lib/binding.js":"import msg from './messages';\nimport zstream from './zstream';\nimport {deflateInit2, deflateEnd, deflateReset, deflate} from './deflate';\nimport {inflateInit2, inflate, inflateEnd, inflateReset} from './inflate';\n// import constants from './constants';\n\n\n// zlib modes\nexport var NONE = 0;\nexport var DEFLATE = 1;\nexport var INFLATE = 2;\nexport var GZIP = 3;\nexport var GUNZIP = 4;\nexport var DEFLATERAW = 5;\nexport var INFLATERAW = 6;\nexport var UNZIP = 7;\nexport var Z_NO_FLUSH=         0,\n  Z_PARTIAL_FLUSH=    1,\n  Z_SYNC_FLUSH=    2,\n  Z_FULL_FLUSH=       3,\n  Z_FINISH=       4,\n  Z_BLOCK=           5,\n  Z_TREES=            6,\n\n  /* Return codes for the compression/decompression functions. Negative values\n  * are errors, positive values are used for special but normal events.\n  */\n  Z_OK=               0,\n  Z_STREAM_END=       1,\n  Z_NEED_DICT=      2,\n  Z_ERRNO=       -1,\n  Z_STREAM_ERROR=   -2,\n  Z_DATA_ERROR=    -3,\n  //Z_MEM_ERROR:     -4,\n  Z_BUF_ERROR=    -5,\n  //Z_VERSION_ERROR: -6,\n\n  /* compression levels */\n  Z_NO_COMPRESSION=         0,\n  Z_BEST_SPEED=             1,\n  Z_BEST_COMPRESSION=       9,\n  Z_DEFAULT_COMPRESSION=   -1,\n\n\n  Z_FILTERED=               1,\n  Z_HUFFMAN_ONLY=           2,\n  Z_RLE=                    3,\n  Z_FIXED=                  4,\n  Z_DEFAULT_STRATEGY=       0,\n\n  /* Possible values of the data_type field (though see inflate()) */\n  Z_BINARY=                 0,\n  Z_TEXT=                   1,\n  //Z_ASCII:                1, // = Z_TEXT (deprecated)\n  Z_UNKNOWN=                2,\n\n  /* The deflate compression method */\n  Z_DEFLATED=               8;\nexport function Zlib(mode) {\n  if (mode < DEFLATE || mode > UNZIP)\n    throw new TypeError('Bad argument');\n\n  this.mode = mode;\n  this.init_done = false;\n  this.write_in_progress = false;\n  this.pending_close = false;\n  this.windowBits = 0;\n  this.level = 0;\n  this.memLevel = 0;\n  this.strategy = 0;\n  this.dictionary = null;\n}\n\nZlib.prototype.init = function(windowBits, level, memLevel, strategy, dictionary) {\n  this.windowBits = windowBits;\n  this.level = level;\n  this.memLevel = memLevel;\n  this.strategy = strategy;\n  // dictionary not supported.\n\n  if (this.mode === GZIP || this.mode === GUNZIP)\n    this.windowBits += 16;\n\n  if (this.mode === UNZIP)\n    this.windowBits += 32;\n\n  if (this.mode === DEFLATERAW || this.mode === INFLATERAW)\n    this.windowBits = -this.windowBits;\n\n  this.strm = new zstream();\n  var status;\n  switch (this.mode) {\n  case DEFLATE:\n  case GZIP:\n  case DEFLATERAW:\n    status = deflateInit2(\n      this.strm,\n      this.level,\n      Z_DEFLATED,\n      this.windowBits,\n      this.memLevel,\n      this.strategy\n    );\n    break;\n  case INFLATE:\n  case GUNZIP:\n  case INFLATERAW:\n  case UNZIP:\n    status  = inflateInit2(\n      this.strm,\n      this.windowBits\n    );\n    break;\n  default:\n    throw new Error('Unknown mode ' + this.mode);\n  }\n\n  if (status !== Z_OK) {\n    this._error(status);\n    return;\n  }\n\n  this.write_in_progress = false;\n  this.init_done = true;\n};\n\nZlib.prototype.params = function() {\n  throw new Error('deflateParams Not supported');\n};\n\nZlib.prototype._writeCheck = function() {\n  if (!this.init_done)\n    throw new Error('write before init');\n\n  if (this.mode === NONE)\n    throw new Error('already finalized');\n\n  if (this.write_in_progress)\n    throw new Error('write already in progress');\n\n  if (this.pending_close)\n    throw new Error('close is pending');\n};\n\nZlib.prototype.write = function(flush, input, in_off, in_len, out, out_off, out_len) {\n  this._writeCheck();\n  this.write_in_progress = true;\n\n  var self = this;\n  process.nextTick(function() {\n    self.write_in_progress = false;\n    var res = self._write(flush, input, in_off, in_len, out, out_off, out_len);\n    self.callback(res[0], res[1]);\n\n    if (self.pending_close)\n      self.close();\n  });\n\n  return this;\n};\n\n// set method for Node buffers, used by pako\nfunction bufferSet(data, offset) {\n  for (var i = 0; i < data.length; i++) {\n    this[offset + i] = data[i];\n  }\n}\n\nZlib.prototype.writeSync = function(flush, input, in_off, in_len, out, out_off, out_len) {\n  this._writeCheck();\n  return this._write(flush, input, in_off, in_len, out, out_off, out_len);\n};\n\nZlib.prototype._write = function(flush, input, in_off, in_len, out, out_off, out_len) {\n  this.write_in_progress = true;\n\n  if (flush !== Z_NO_FLUSH &&\n      flush !== Z_PARTIAL_FLUSH &&\n      flush !== Z_SYNC_FLUSH &&\n      flush !== Z_FULL_FLUSH &&\n      flush !== Z_FINISH &&\n      flush !== Z_BLOCK) {\n    throw new Error('Invalid flush value');\n  }\n\n  if (input == null) {\n    input = new Buffer(0);\n    in_len = 0;\n    in_off = 0;\n  }\n\n  if (out._set)\n    out.set = out._set;\n  else\n    out.set = bufferSet;\n\n  var strm = this.strm;\n  strm.avail_in = in_len;\n  strm.input = input;\n  strm.next_in = in_off;\n  strm.avail_out = out_len;\n  strm.output = out;\n  strm.next_out = out_off;\n  var status;\n  switch (this.mode) {\n  case DEFLATE:\n  case GZIP:\n  case DEFLATERAW:\n    status = deflate(strm, flush);\n    break;\n  case UNZIP:\n  case INFLATE:\n  case GUNZIP:\n  case INFLATERAW:\n    status = inflate(strm, flush);\n    break;\n  default:\n    throw new Error('Unknown mode ' + this.mode);\n  }\n\n  if (status !== Z_STREAM_END && status !== Z_OK) {\n    this._error(status);\n  }\n\n  this.write_in_progress = false;\n  return [strm.avail_in, strm.avail_out];\n};\n\nZlib.prototype.close = function() {\n  if (this.write_in_progress) {\n    this.pending_close = true;\n    return;\n  }\n\n  this.pending_close = false;\n\n  if (this.mode === DEFLATE || this.mode === GZIP || this.mode === DEFLATERAW) {\n    deflateEnd(this.strm);\n  } else {\n    inflateEnd(this.strm);\n  }\n\n  this.mode = NONE;\n};\nvar status\nZlib.prototype.reset = function() {\n  switch (this.mode) {\n  case DEFLATE:\n  case DEFLATERAW:\n    status = deflateReset(this.strm);\n    break;\n  case INFLATE:\n  case INFLATERAW:\n    status = inflateReset(this.strm);\n    break;\n  }\n\n  if (status !== Z_OK) {\n    this._error(status);\n  }\n};\n\nZlib.prototype._error = function(status) {\n  this.onerror(msg[status] + ': ' + this.strm.msg, status);\n\n  this.write_in_progress = false;\n  if (this.pending_close)\n    this.close();\n};\n","__zlib-lib/crc32.js":"\n// Note: we can't get significant speed boost here.\n// So write code to minimize size - no pregenerated tables\n// and array tools dependencies.\n\n\n// Use ordinary array, since untyped makes no boost here\nfunction makeTable() {\n  var c, table = [];\n\n  for (var n = 0; n < 256; n++) {\n    c = n;\n    for (var k = 0; k < 8; k++) {\n      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));\n    }\n    table[n] = c;\n  }\n\n  return table;\n}\n\n// Create table on load. Just 255 signed longs. Not a problem.\nvar crcTable = makeTable();\n\n\nfunction crc32(crc, buf, len, pos) {\n  var t = crcTable,\n      end = pos + len;\n\n  crc ^= -1;\n\n  for (var i = pos; i < end; i++) {\n    crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];\n  }\n\n  return (crc ^ (-1)); // >>> 0;\n}\n\n\nexport default crc32;\n","__zlib-lib/deflate.js":"\nimport {Buf8,Buf16,arraySet} from './utils';\nimport {_tr_flush_block, _tr_tally, _tr_init, _tr_align, _tr_stored_block} from './trees';\nimport adler32 from './adler32';\nimport crc32 from './crc32';\nimport msg from './messages';\n\n/* Public constants ==========================================================*/\n/* ===========================================================================*/\n\n\n/* Allowed flush values; see deflate() and inflate() below for details */\nvar Z_NO_FLUSH = 0;\nvar Z_PARTIAL_FLUSH = 1;\n//var Z_SYNC_FLUSH    = 2;\nvar Z_FULL_FLUSH = 3;\nvar Z_FINISH = 4;\nvar Z_BLOCK = 5;\n//var Z_TREES         = 6;\n\n\n/* Return codes for the compression/decompression functions. Negative values\n * are errors, positive values are used for special but normal events.\n */\nvar Z_OK = 0;\nvar Z_STREAM_END = 1;\n//var Z_NEED_DICT     = 2;\n//var Z_ERRNO         = -1;\nvar Z_STREAM_ERROR = -2;\nvar Z_DATA_ERROR = -3;\n//var Z_MEM_ERROR     = -4;\nvar Z_BUF_ERROR = -5;\n//var Z_VERSION_ERROR = -6;\n\n\n/* compression levels */\n//var Z_NO_COMPRESSION      = 0;\n//var Z_BEST_SPEED          = 1;\n//var Z_BEST_COMPRESSION    = 9;\nvar Z_DEFAULT_COMPRESSION = -1;\n\n\nvar Z_FILTERED = 1;\nvar Z_HUFFMAN_ONLY = 2;\nvar Z_RLE = 3;\nvar Z_FIXED = 4;\nvar Z_DEFAULT_STRATEGY = 0;\n\n/* Possible values of the data_type field (though see inflate()) */\n//var Z_BINARY              = 0;\n//var Z_TEXT                = 1;\n//var Z_ASCII               = 1; // = Z_TEXT\nvar Z_UNKNOWN = 2;\n\n\n/* The deflate compression method */\nvar Z_DEFLATED = 8;\n\n/*============================================================================*/\n\n\nvar MAX_MEM_LEVEL = 9;\n/* Maximum value for memLevel in deflateInit2 */\nvar MAX_WBITS = 15;\n/* 32K LZ77 window */\nvar DEF_MEM_LEVEL = 8;\n\n\nvar LENGTH_CODES = 29;\n/* number of length codes, not counting the special END_BLOCK code */\nvar LITERALS = 256;\n/* number of literal bytes 0..255 */\nvar L_CODES = LITERALS + 1 + LENGTH_CODES;\n/* number of Literal or Length codes, including the END_BLOCK code */\nvar D_CODES = 30;\n/* number of distance codes */\nvar BL_CODES = 19;\n/* number of codes used to transfer the bit lengths */\nvar HEAP_SIZE = 2 * L_CODES + 1;\n/* maximum heap size */\nvar MAX_BITS = 15;\n/* All codes must not exceed MAX_BITS bits */\n\nvar MIN_MATCH = 3;\nvar MAX_MATCH = 258;\nvar MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);\n\nvar PRESET_DICT = 0x20;\n\nvar INIT_STATE = 42;\nvar EXTRA_STATE = 69;\nvar NAME_STATE = 73;\nvar COMMENT_STATE = 91;\nvar HCRC_STATE = 103;\nvar BUSY_STATE = 113;\nvar FINISH_STATE = 666;\n\nvar BS_NEED_MORE = 1; /* block not completed, need more input or more output */\nvar BS_BLOCK_DONE = 2; /* block flush performed */\nvar BS_FINISH_STARTED = 3; /* finish started, need only more output at next deflate */\nvar BS_FINISH_DONE = 4; /* finish done, accept no more input or output */\n\nvar OS_CODE = 0x03; // Unix :) . Don't detect, use this default.\n\nfunction err(strm, errorCode) {\n  strm.msg = msg[errorCode];\n  return errorCode;\n}\n\nfunction rank(f) {\n  return ((f) << 1) - ((f) > 4 ? 9 : 0);\n}\n\nfunction zero(buf) {\n  var len = buf.length;\n  while (--len >= 0) {\n    buf[len] = 0;\n  }\n}\n\n\n/* =========================================================================\n * Flush as much pending output as possible. All deflate() output goes\n * through this function so some applications may wish to modify it\n * to avoid allocating a large strm->output buffer and copying into it.\n * (See also read_buf()).\n */\nfunction flush_pending(strm) {\n  var s = strm.state;\n\n  //_tr_flush_bits(s);\n  var len = s.pending;\n  if (len > strm.avail_out) {\n    len = strm.avail_out;\n  }\n  if (len === 0) {\n    return;\n  }\n\n  arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);\n  strm.next_out += len;\n  s.pending_out += len;\n  strm.total_out += len;\n  strm.avail_out -= len;\n  s.pending -= len;\n  if (s.pending === 0) {\n    s.pending_out = 0;\n  }\n}\n\n\nfunction flush_block_only(s, last) {\n  _tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);\n  s.block_start = s.strstart;\n  flush_pending(s.strm);\n}\n\n\nfunction put_byte(s, b) {\n  s.pending_buf[s.pending++] = b;\n}\n\n\n/* =========================================================================\n * Put a short in the pending buffer. The 16-bit value is put in MSB order.\n * IN assertion: the stream state is correct and there is enough room in\n * pending_buf.\n */\nfunction putShortMSB(s, b) {\n  //  put_byte(s, (Byte)(b >> 8));\n  //  put_byte(s, (Byte)(b & 0xff));\n  s.pending_buf[s.pending++] = (b >>> 8) & 0xff;\n  s.pending_buf[s.pending++] = b & 0xff;\n}\n\n\n/* ===========================================================================\n * Read a new buffer from the current input stream, update the adler32\n * and total number of bytes read.  All deflate() input goes through\n * this function so some applications may wish to modify it to avoid\n * allocating a large strm->input buffer and copying from it.\n * (See also flush_pending()).\n */\nfunction read_buf(strm, buf, start, size) {\n  var len = strm.avail_in;\n\n  if (len > size) {\n    len = size;\n  }\n  if (len === 0) {\n    return 0;\n  }\n\n  strm.avail_in -= len;\n\n  // zmemcpy(buf, strm->next_in, len);\n  arraySet(buf, strm.input, strm.next_in, len, start);\n  if (strm.state.wrap === 1) {\n    strm.adler = adler32(strm.adler, buf, len, start);\n  } else if (strm.state.wrap === 2) {\n    strm.adler = crc32(strm.adler, buf, len, start);\n  }\n\n  strm.next_in += len;\n  strm.total_in += len;\n\n  return len;\n}\n\n\n/* ===========================================================================\n * Set match_start to the longest match starting at the given string and\n * return its length. Matches shorter or equal to prev_length are discarded,\n * in which case the result is equal to prev_length and match_start is\n * garbage.\n * IN assertions: cur_match is the head of the hash chain for the current\n *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1\n * OUT assertion: the match length is not greater than s->lookahead.\n */\nfunction longest_match(s, cur_match) {\n  var chain_length = s.max_chain_length; /* max hash chain length */\n  var scan = s.strstart; /* current string */\n  var match; /* matched string */\n  var len; /* length of current match */\n  var best_len = s.prev_length; /* best match length so far */\n  var nice_match = s.nice_match; /* stop if match long enough */\n  var limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?\n    s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0 /*NIL*/ ;\n\n  var _win = s.window; // shortcut\n\n  var wmask = s.w_mask;\n  var prev = s.prev;\n\n  /* Stop when cur_match becomes <= limit. To simplify the code,\n   * we prevent matches with the string of window index 0.\n   */\n\n  var strend = s.strstart + MAX_MATCH;\n  var scan_end1 = _win[scan + best_len - 1];\n  var scan_end = _win[scan + best_len];\n\n  /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.\n   * It is easy to get rid of this optimization if necessary.\n   */\n  // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, \"Code too clever\");\n\n  /* Do not waste too much time if we already have a good match: */\n  if (s.prev_length >= s.good_match) {\n    chain_length >>= 2;\n  }\n  /* Do not look for matches beyond the end of the input. This is necessary\n   * to make deflate deterministic.\n   */\n  if (nice_match > s.lookahead) {\n    nice_match = s.lookahead;\n  }\n\n  // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, \"need lookahead\");\n\n  do {\n    // Assert(cur_match < s->strstart, \"no future\");\n    match = cur_match;\n\n    /* Skip to next match if the match length cannot increase\n     * or if the match length is less than 2.  Note that the checks below\n     * for insufficient lookahead only occur occasionally for performance\n     * reasons.  Therefore uninitialized memory will be accessed, and\n     * conditional jumps will be made that depend on those values.\n     * However the length of the match is limited to the lookahead, so\n     * the output of deflate is not affected by the uninitialized values.\n     */\n\n    if (_win[match + best_len] !== scan_end ||\n      _win[match + best_len - 1] !== scan_end1 ||\n      _win[match] !== _win[scan] ||\n      _win[++match] !== _win[scan + 1]) {\n      continue;\n    }\n\n    /* The check at best_len-1 can be removed because it will be made\n     * again later. (This heuristic is not always a win.)\n     * It is not necessary to compare scan[2] and match[2] since they\n     * are always equal when the other bytes match, given that\n     * the hash keys are equal and that HASH_BITS >= 8.\n     */\n    scan += 2;\n    match++;\n    // Assert(*scan == *match, \"match[2]?\");\n\n    /* We check for insufficient lookahead only every 8th comparison;\n     * the 256th check will be made at strstart+258.\n     */\n    do {\n      /*jshint noempty:false*/\n    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&\n      _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&\n      _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&\n      _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&\n      scan < strend);\n\n    // Assert(scan <= s->window+(unsigned)(s->window_size-1), \"wild scan\");\n\n    len = MAX_MATCH - (strend - scan);\n    scan = strend - MAX_MATCH;\n\n    if (len > best_len) {\n      s.match_start = cur_match;\n      best_len = len;\n      if (len >= nice_match) {\n        break;\n      }\n      scan_end1 = _win[scan + best_len - 1];\n      scan_end = _win[scan + best_len];\n    }\n  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);\n\n  if (best_len <= s.lookahead) {\n    return best_len;\n  }\n  return s.lookahead;\n}\n\n\n/* ===========================================================================\n * Fill the window when the lookahead becomes insufficient.\n * Updates strstart and lookahead.\n *\n * IN assertion: lookahead < MIN_LOOKAHEAD\n * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD\n *    At least one byte has been read, or avail_in == 0; reads are\n *    performed for at least two bytes (required for the zip translate_eol\n *    option -- not supported here).\n */\nfunction fill_window(s) {\n  var _w_size = s.w_size;\n  var p, n, m, more, str;\n\n  //Assert(s->lookahead < MIN_LOOKAHEAD, \"already enough lookahead\");\n\n  do {\n    more = s.window_size - s.lookahead - s.strstart;\n\n    // JS ints have 32 bit, block below not needed\n    /* Deal with !@#$% 64K limit: */\n    //if (sizeof(int) <= 2) {\n    //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {\n    //        more = wsize;\n    //\n    //  } else if (more == (unsigned)(-1)) {\n    //        /* Very unlikely, but possible on 16 bit machine if\n    //         * strstart == 0 && lookahead == 1 (input done a byte at time)\n    //         */\n    //        more--;\n    //    }\n    //}\n\n\n    /* If the window is almost full and there is insufficient lookahead,\n     * move the upper half to the lower one to make room in the upper half.\n     */\n    if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {\n\n      arraySet(s.window, s.window, _w_size, _w_size, 0);\n      s.match_start -= _w_size;\n      s.strstart -= _w_size;\n      /* we now have strstart >= MAX_DIST */\n      s.block_start -= _w_size;\n\n      /* Slide the hash table (could be avoided with 32 bit values\n       at the expense of memory usage). We slide even when level == 0\n       to keep the hash table consistent if we switch back to level > 0\n       later. (Using level 0 permanently is not an optimal usage of\n       zlib, so we don't care about this pathological case.)\n       */\n\n      n = s.hash_size;\n      p = n;\n      do {\n        m = s.head[--p];\n        s.head[p] = (m >= _w_size ? m - _w_size : 0);\n      } while (--n);\n\n      n = _w_size;\n      p = n;\n      do {\n        m = s.prev[--p];\n        s.prev[p] = (m >= _w_size ? m - _w_size : 0);\n        /* If n is not on any hash chain, prev[n] is garbage but\n         * its value will never be used.\n         */\n      } while (--n);\n\n      more += _w_size;\n    }\n    if (s.strm.avail_in === 0) {\n      break;\n    }\n\n    /* If there was no sliding:\n     *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&\n     *    more == window_size - lookahead - strstart\n     * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)\n     * => more >= window_size - 2*WSIZE + 2\n     * In the BIG_MEM or MMAP case (not yet supported),\n     *   window_size == input_size + MIN_LOOKAHEAD  &&\n     *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.\n     * Otherwise, window_size == 2*WSIZE so more >= 2.\n     * If there was sliding, more >= WSIZE. So in all cases, more >= 2.\n     */\n    //Assert(more >= 2, \"more < 2\");\n    n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);\n    s.lookahead += n;\n\n    /* Initialize the hash value now that we have some input: */\n    if (s.lookahead + s.insert >= MIN_MATCH) {\n      str = s.strstart - s.insert;\n      s.ins_h = s.window[str];\n\n      /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */\n      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + 1]) & s.hash_mask;\n      //#if MIN_MATCH != 3\n      //        Call update_hash() MIN_MATCH-3 more times\n      //#endif\n      while (s.insert) {\n        /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */\n        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;\n\n        s.prev[str & s.w_mask] = s.head[s.ins_h];\n        s.head[s.ins_h] = str;\n        str++;\n        s.insert--;\n        if (s.lookahead + s.insert < MIN_MATCH) {\n          break;\n        }\n      }\n    }\n    /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,\n     * but this is not important since only literal bytes will be emitted.\n     */\n\n  } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);\n\n  /* If the WIN_INIT bytes after the end of the current data have never been\n   * written, then zero those bytes in order to avoid memory check reports of\n   * the use of uninitialized (or uninitialised as Julian writes) bytes by\n   * the longest match routines.  Update the high water mark for the next\n   * time through here.  WIN_INIT is set to MAX_MATCH since the longest match\n   * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.\n   */\n  //  if (s.high_water < s.window_size) {\n  //    var curr = s.strstart + s.lookahead;\n  //    var init = 0;\n  //\n  //    if (s.high_water < curr) {\n  //      /* Previous high water mark below current data -- zero WIN_INIT\n  //       * bytes or up to end of window, whichever is less.\n  //       */\n  //      init = s.window_size - curr;\n  //      if (init > WIN_INIT)\n  //        init = WIN_INIT;\n  //      zmemzero(s->window + curr, (unsigned)init);\n  //      s->high_water = curr + init;\n  //    }\n  //    else if (s->high_water < (ulg)curr + WIN_INIT) {\n  //      /* High water mark at or above current data, but below current data\n  //       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up\n  //       * to end of window, whichever is less.\n  //       */\n  //      init = (ulg)curr + WIN_INIT - s->high_water;\n  //      if (init > s->window_size - s->high_water)\n  //        init = s->window_size - s->high_water;\n  //      zmemzero(s->window + s->high_water, (unsigned)init);\n  //      s->high_water += init;\n  //    }\n  //  }\n  //\n  //  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,\n  //    \"not enough room for search\");\n}\n\n/* ===========================================================================\n * Copy without compression as much as possible from the input stream, return\n * the current block state.\n * This function does not insert new strings in the dictionary since\n * uncompressible data is probably not useful. This function is used\n * only for the level=0 compression option.\n * NOTE: this function should be optimized to avoid extra copying from\n * window to pending_buf.\n */\nfunction deflate_stored(s, flush) {\n  /* Stored blocks are limited to 0xffff bytes, pending_buf is limited\n   * to pending_buf_size, and each stored block has a 5 byte header:\n   */\n  var max_block_size = 0xffff;\n\n  if (max_block_size > s.pending_buf_size - 5) {\n    max_block_size = s.pending_buf_size - 5;\n  }\n\n  /* Copy as much as possible from input to output: */\n  for (;;) {\n    /* Fill the window as much as possible: */\n    if (s.lookahead <= 1) {\n\n      //Assert(s->strstart < s->w_size+MAX_DIST(s) ||\n      //  s->block_start >= (long)s->w_size, \"slide too late\");\n      //      if (!(s.strstart < s.w_size + (s.w_size - MIN_LOOKAHEAD) ||\n      //        s.block_start >= s.w_size)) {\n      //        throw  new Error(\"slide too late\");\n      //      }\n\n      fill_window(s);\n      if (s.lookahead === 0 && flush === Z_NO_FLUSH) {\n        return BS_NEED_MORE;\n      }\n\n      if (s.lookahead === 0) {\n        break;\n      }\n      /* flush the current block */\n    }\n    //Assert(s->block_start >= 0L, \"block gone\");\n    //    if (s.block_start < 0) throw new Error(\"block gone\");\n\n    s.strstart += s.lookahead;\n    s.lookahead = 0;\n\n    /* Emit a stored block if pending_buf will be full: */\n    var max_start = s.block_start + max_block_size;\n\n    if (s.strstart === 0 || s.strstart >= max_start) {\n      /* strstart == 0 is possible when wraparound on 16-bit machine */\n      s.lookahead = s.strstart - max_start;\n      s.strstart = max_start;\n      /*** FLUSH_BLOCK(s, 0); ***/\n      flush_block_only(s, false);\n      if (s.strm.avail_out === 0) {\n        return BS_NEED_MORE;\n      }\n      /***/\n\n\n    }\n    /* Flush if we may have to slide, otherwise block_start may become\n     * negative and the data will be gone:\n     */\n    if (s.strstart - s.block_start >= (s.w_size - MIN_LOOKAHEAD)) {\n      /*** FLUSH_BLOCK(s, 0); ***/\n      flush_block_only(s, false);\n      if (s.strm.avail_out === 0) {\n        return BS_NEED_MORE;\n      }\n      /***/\n    }\n  }\n\n  s.insert = 0;\n\n  if (flush === Z_FINISH) {\n    /*** FLUSH_BLOCK(s, 1); ***/\n    flush_block_only(s, true);\n    if (s.strm.avail_out === 0) {\n      return BS_FINISH_STARTED;\n    }\n    /***/\n    return BS_FINISH_DONE;\n  }\n\n  if (s.strstart > s.block_start) {\n    /*** FLUSH_BLOCK(s, 0); ***/\n    flush_block_only(s, false);\n    if (s.strm.avail_out === 0) {\n      return BS_NEED_MORE;\n    }\n    /***/\n  }\n\n  return BS_NEED_MORE;\n}\n\n/* ===========================================================================\n * Compress as much as possible from the input stream, return the current\n * block state.\n * This function does not perform lazy evaluation of matches and inserts\n * new strings in the dictionary only for unmatched strings or for short\n * matches. It is used only for the fast compression options.\n */\nfunction deflate_fast(s, flush) {\n  var hash_head; /* head of the hash chain */\n  var bflush; /* set if current block must be flushed */\n\n  for (;;) {\n    /* Make sure that we always have enough lookahead, except\n     * at the end of the input file. We need MAX_MATCH bytes\n     * for the next match, plus MIN_MATCH bytes to insert the\n     * string following the next match.\n     */\n    if (s.lookahead < MIN_LOOKAHEAD) {\n      fill_window(s);\n      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {\n        return BS_NEED_MORE;\n      }\n      if (s.lookahead === 0) {\n        break; /* flush the current block */\n      }\n    }\n\n    /* Insert the string window[strstart .. strstart+2] in the\n     * dictionary, and set hash_head to the head of the hash chain:\n     */\n    hash_head = 0 /*NIL*/ ;\n    if (s.lookahead >= MIN_MATCH) {\n      /*** INSERT_STRING(s, s.strstart, hash_head); ***/\n      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;\n      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];\n      s.head[s.ins_h] = s.strstart;\n      /***/\n    }\n\n    /* Find the longest match, discarding those <= prev_length.\n     * At this point we have always match_length < MIN_MATCH\n     */\n    if (hash_head !== 0 /*NIL*/ && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {\n      /* To simplify the code, we prevent matches with the string\n       * of window index 0 (in particular we have to avoid a match\n       * of the string with itself at the start of the input file).\n       */\n      s.match_length = longest_match(s, hash_head);\n      /* longest_match() sets match_start */\n    }\n    if (s.match_length >= MIN_MATCH) {\n      // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only\n\n      /*** _tr_tally_dist(s, s.strstart - s.match_start,\n                     s.match_length - MIN_MATCH, bflush); ***/\n      bflush = _tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);\n\n      s.lookahead -= s.match_length;\n\n      /* Insert new strings in the hash table only if the match length\n       * is not too large. This saves time but degrades compression.\n       */\n      if (s.match_length <= s.max_lazy_match /*max_insert_length*/ && s.lookahead >= MIN_MATCH) {\n        s.match_length--; /* string at strstart already in table */\n        do {\n          s.strstart++;\n          /*** INSERT_STRING(s, s.strstart, hash_head); ***/\n          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;\n          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];\n          s.head[s.ins_h] = s.strstart;\n          /***/\n          /* strstart never exceeds WSIZE-MAX_MATCH, so there are\n           * always MIN_MATCH bytes ahead.\n           */\n        } while (--s.match_length !== 0);\n        s.strstart++;\n      } else {\n        s.strstart += s.match_length;\n        s.match_length = 0;\n        s.ins_h = s.window[s.strstart];\n        /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */\n        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + 1]) & s.hash_mask;\n\n        //#if MIN_MATCH != 3\n        //                Call UPDATE_HASH() MIN_MATCH-3 more times\n        //#endif\n        /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not\n         * matter since it will be recomputed at next deflate call.\n         */\n      }\n    } else {\n      /* No match, output a literal byte */\n      //Tracevv((stderr,\"%c\", s.window[s.strstart]));\n      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/\n      bflush = _tr_tally(s, 0, s.window[s.strstart]);\n\n      s.lookahead--;\n      s.strstart++;\n    }\n    if (bflush) {\n      /*** FLUSH_BLOCK(s, 0); ***/\n      flush_block_only(s, false);\n      if (s.strm.avail_out === 0) {\n        return BS_NEED_MORE;\n      }\n      /***/\n    }\n  }\n  s.insert = ((s.strstart < (MIN_MATCH - 1)) ? s.strstart : MIN_MATCH - 1);\n  if (flush === Z_FINISH) {\n    /*** FLUSH_BLOCK(s, 1); ***/\n    flush_block_only(s, true);\n    if (s.strm.avail_out === 0) {\n      return BS_FINISH_STARTED;\n    }\n    /***/\n    return BS_FINISH_DONE;\n  }\n  if (s.last_lit) {\n    /*** FLUSH_BLOCK(s, 0); ***/\n    flush_block_only(s, false);\n    if (s.strm.avail_out === 0) {\n      return BS_NEED_MORE;\n    }\n    /***/\n  }\n  return BS_BLOCK_DONE;\n}\n\n/* ===========================================================================\n * Same as above, but achieves better compression. We use a lazy\n * evaluation for matches: a match is finally adopted only if there is\n * no better match at the next window position.\n */\nfunction deflate_slow(s, flush) {\n  var hash_head; /* head of hash chain */\n  var bflush; /* set if current block must be flushed */\n\n  var max_insert;\n\n  /* Process the input block. */\n  for (;;) {\n    /* Make sure that we always have enough lookahead, except\n     * at the end of the input file. We need MAX_MATCH bytes\n     * for the next match, plus MIN_MATCH bytes to insert the\n     * string following the next match.\n     */\n    if (s.lookahead < MIN_LOOKAHEAD) {\n      fill_window(s);\n      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {\n        return BS_NEED_MORE;\n      }\n      if (s.lookahead === 0) {\n        break;\n      } /* flush the current block */\n    }\n\n    /* Insert the string window[strstart .. strstart+2] in the\n     * dictionary, and set hash_head to the head of the hash chain:\n     */\n    hash_head = 0 /*NIL*/ ;\n    if (s.lookahead >= MIN_MATCH) {\n      /*** INSERT_STRING(s, s.strstart, hash_head); ***/\n      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;\n      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];\n      s.head[s.ins_h] = s.strstart;\n      /***/\n    }\n\n    /* Find the longest match, discarding those <= prev_length.\n     */\n    s.prev_length = s.match_length;\n    s.prev_match = s.match_start;\n    s.match_length = MIN_MATCH - 1;\n\n    if (hash_head !== 0 /*NIL*/ && s.prev_length < s.max_lazy_match &&\n      s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD) /*MAX_DIST(s)*/ ) {\n      /* To simplify the code, we prevent matches with the string\n       * of window index 0 (in particular we have to avoid a match\n       * of the string with itself at the start of the input file).\n       */\n      s.match_length = longest_match(s, hash_head);\n      /* longest_match() sets match_start */\n\n      if (s.match_length <= 5 &&\n        (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096 /*TOO_FAR*/ ))) {\n\n        /* If prev_match is also MIN_MATCH, match_start is garbage\n         * but we will ignore the current match anyway.\n         */\n        s.match_length = MIN_MATCH - 1;\n      }\n    }\n    /* If there was a match at the previous step and the current\n     * match is not better, output the previous match:\n     */\n    if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {\n      max_insert = s.strstart + s.lookahead - MIN_MATCH;\n      /* Do not insert strings in hash table beyond this. */\n\n      //check_match(s, s.strstart-1, s.prev_match, s.prev_length);\n\n      /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,\n                     s.prev_length - MIN_MATCH, bflush);***/\n      bflush = _tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);\n      /* Insert in hash table all strings up to the end of the match.\n       * strstart-1 and strstart are already inserted. If there is not\n       * enough lookahead, the last two strings are not inserted in\n       * the hash table.\n       */\n      s.lookahead -= s.prev_length - 1;\n      s.prev_length -= 2;\n      do {\n        if (++s.strstart <= max_insert) {\n          /*** INSERT_STRING(s, s.strstart, hash_head); ***/\n          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;\n          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];\n          s.head[s.ins_h] = s.strstart;\n          /***/\n        }\n      } while (--s.prev_length !== 0);\n      s.match_available = 0;\n      s.match_length = MIN_MATCH - 1;\n      s.strstart++;\n\n      if (bflush) {\n        /*** FLUSH_BLOCK(s, 0); ***/\n        flush_block_only(s, false);\n        if (s.strm.avail_out === 0) {\n          return BS_NEED_MORE;\n        }\n        /***/\n      }\n\n    } else if (s.match_available) {\n      /* If there was no match at the previous position, output a\n       * single literal. If there was a match but the current match\n       * is longer, truncate the previous match to a single literal.\n       */\n      //Tracevv((stderr,\"%c\", s->window[s->strstart-1]));\n      /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/\n      bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);\n\n      if (bflush) {\n        /*** FLUSH_BLOCK_ONLY(s, 0) ***/\n        flush_block_only(s, false);\n        /***/\n      }\n      s.strstart++;\n      s.lookahead--;\n      if (s.strm.avail_out === 0) {\n        return BS_NEED_MORE;\n      }\n    } else {\n      /* There is no previous match to compare with, wait for\n       * the next step to decide.\n       */\n      s.match_available = 1;\n      s.strstart++;\n      s.lookahead--;\n    }\n  }\n  //Assert (flush != Z_NO_FLUSH, \"no flush?\");\n  if (s.match_available) {\n    //Tracevv((stderr,\"%c\", s->window[s->strstart-1]));\n    /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/\n    bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);\n\n    s.match_available = 0;\n  }\n  s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;\n  if (flush === Z_FINISH) {\n    /*** FLUSH_BLOCK(s, 1); ***/\n    flush_block_only(s, true);\n    if (s.strm.avail_out === 0) {\n      return BS_FINISH_STARTED;\n    }\n    /***/\n    return BS_FINISH_DONE;\n  }\n  if (s.last_lit) {\n    /*** FLUSH_BLOCK(s, 0); ***/\n    flush_block_only(s, false);\n    if (s.strm.avail_out === 0) {\n      return BS_NEED_MORE;\n    }\n    /***/\n  }\n\n  return BS_BLOCK_DONE;\n}\n\n\n/* ===========================================================================\n * For Z_RLE, simply look for runs of bytes, generate matches only of distance\n * one.  Do not maintain a hash table.  (It will be regenerated if this run of\n * deflate switches away from Z_RLE.)\n */\nfunction deflate_rle(s, flush) {\n  var bflush; /* set if current block must be flushed */\n  var prev; /* byte at distance one to match */\n  var scan, strend; /* scan goes up to strend for length of run */\n\n  var _win = s.window;\n\n  for (;;) {\n    /* Make sure that we always have enough lookahead, except\n     * at the end of the input file. We need MAX_MATCH bytes\n     * for the longest run, plus one for the unrolled loop.\n     */\n    if (s.lookahead <= MAX_MATCH) {\n      fill_window(s);\n      if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {\n        return BS_NEED_MORE;\n      }\n      if (s.lookahead === 0) {\n        break;\n      } /* flush the current block */\n    }\n\n    /* See how many times the previous byte repeats */\n    s.match_length = 0;\n    if (s.lookahead >= MIN_MATCH && s.strstart > 0) {\n      scan = s.strstart - 1;\n      prev = _win[scan];\n      if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {\n        strend = s.strstart + MAX_MATCH;\n        do {\n          /*jshint noempty:false*/\n        } while (prev === _win[++scan] && prev === _win[++scan] &&\n          prev === _win[++scan] && prev === _win[++scan] &&\n          prev === _win[++scan] && prev === _win[++scan] &&\n          prev === _win[++scan] && prev === _win[++scan] &&\n          scan < strend);\n        s.match_length = MAX_MATCH - (strend - scan);\n        if (s.match_length > s.lookahead) {\n          s.match_length = s.lookahead;\n        }\n      }\n      //Assert(scan <= s->window+(uInt)(s->window_size-1), \"wild scan\");\n    }\n\n    /* Emit match if have run of MIN_MATCH or longer, else emit literal */\n    if (s.match_length >= MIN_MATCH) {\n      //check_match(s, s.strstart, s.strstart - 1, s.match_length);\n\n      /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/\n      bflush = _tr_tally(s, 1, s.match_length - MIN_MATCH);\n\n      s.lookahead -= s.match_length;\n      s.strstart += s.match_length;\n      s.match_length = 0;\n    } else {\n      /* No match, output a literal byte */\n      //Tracevv((stderr,\"%c\", s->window[s->strstart]));\n      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/\n      bflush = _tr_tally(s, 0, s.window[s.strstart]);\n\n      s.lookahead--;\n      s.strstart++;\n    }\n    if (bflush) {\n      /*** FLUSH_BLOCK(s, 0); ***/\n      flush_block_only(s, false);\n      if (s.strm.avail_out === 0) {\n        return BS_NEED_MORE;\n      }\n      /***/\n    }\n  }\n  s.insert = 0;\n  if (flush === Z_FINISH) {\n    /*** FLUSH_BLOCK(s, 1); ***/\n    flush_block_only(s, true);\n    if (s.strm.avail_out === 0) {\n      return BS_FINISH_STARTED;\n    }\n    /***/\n    return BS_FINISH_DONE;\n  }\n  if (s.last_lit) {\n    /*** FLUSH_BLOCK(s, 0); ***/\n    flush_block_only(s, false);\n    if (s.strm.avail_out === 0) {\n      return BS_NEED_MORE;\n    }\n    /***/\n  }\n  return BS_BLOCK_DONE;\n}\n\n/* ===========================================================================\n * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.\n * (It will be regenerated if this run of deflate switches away from Huffman.)\n */\nfunction deflate_huff(s, flush) {\n  var bflush; /* set if current block must be flushed */\n\n  for (;;) {\n    /* Make sure that we have a literal to write. */\n    if (s.lookahead === 0) {\n      fill_window(s);\n      if (s.lookahead === 0) {\n        if (flush === Z_NO_FLUSH) {\n          return BS_NEED_MORE;\n        }\n        break; /* flush the current block */\n      }\n    }\n\n    /* Output a literal byte */\n    s.match_length = 0;\n    //Tracevv((stderr,\"%c\", s->window[s->strstart]));\n    /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/\n    bflush = _tr_tally(s, 0, s.window[s.strstart]);\n    s.lookahead--;\n    s.strstart++;\n    if (bflush) {\n      /*** FLUSH_BLOCK(s, 0); ***/\n      flush_block_only(s, false);\n      if (s.strm.avail_out === 0) {\n        return BS_NEED_MORE;\n      }\n      /***/\n    }\n  }\n  s.insert = 0;\n  if (flush === Z_FINISH) {\n    /*** FLUSH_BLOCK(s, 1); ***/\n    flush_block_only(s, true);\n    if (s.strm.avail_out === 0) {\n      return BS_FINISH_STARTED;\n    }\n    /***/\n    return BS_FINISH_DONE;\n  }\n  if (s.last_lit) {\n    /*** FLUSH_BLOCK(s, 0); ***/\n    flush_block_only(s, false);\n    if (s.strm.avail_out === 0) {\n      return BS_NEED_MORE;\n    }\n    /***/\n  }\n  return BS_BLOCK_DONE;\n}\n\n/* Values for max_lazy_match, good_match and max_chain_length, depending on\n * the desired pack level (0..9). The values given below have been tuned to\n * exclude worst case performance for pathological files. Better values may be\n * found for specific files.\n */\nfunction Config(good_length, max_lazy, nice_length, max_chain, func) {\n  this.good_length = good_length;\n  this.max_lazy = max_lazy;\n  this.nice_length = nice_length;\n  this.max_chain = max_chain;\n  this.func = func;\n}\n\nvar configuration_table;\n\nconfiguration_table = [\n  /*      good lazy nice chain */\n  new Config(0, 0, 0, 0, deflate_stored), /* 0 store only */\n  new Config(4, 4, 8, 4, deflate_fast), /* 1 max speed, no lazy matches */\n  new Config(4, 5, 16, 8, deflate_fast), /* 2 */\n  new Config(4, 6, 32, 32, deflate_fast), /* 3 */\n\n  new Config(4, 4, 16, 16, deflate_slow), /* 4 lazy matches */\n  new Config(8, 16, 32, 32, deflate_slow), /* 5 */\n  new Config(8, 16, 128, 128, deflate_slow), /* 6 */\n  new Config(8, 32, 128, 256, deflate_slow), /* 7 */\n  new Config(32, 128, 258, 1024, deflate_slow), /* 8 */\n  new Config(32, 258, 258, 4096, deflate_slow) /* 9 max compression */\n];\n\n\n/* ===========================================================================\n * Initialize the \"longest match\" routines for a new zlib stream\n */\nfunction lm_init(s) {\n  s.window_size = 2 * s.w_size;\n\n  /*** CLEAR_HASH(s); ***/\n  zero(s.head); // Fill with NIL (= 0);\n\n  /* Set the default configuration parameters:\n   */\n  s.max_lazy_match = configuration_table[s.level].max_lazy;\n  s.good_match = configuration_table[s.level].good_length;\n  s.nice_match = configuration_table[s.level].nice_length;\n  s.max_chain_length = configuration_table[s.level].max_chain;\n\n  s.strstart = 0;\n  s.block_start = 0;\n  s.lookahead = 0;\n  s.insert = 0;\n  s.match_length = s.prev_length = MIN_MATCH - 1;\n  s.match_available = 0;\n  s.ins_h = 0;\n}\n\n\nfunction DeflateState() {\n  this.strm = null; /* pointer back to this zlib stream */\n  this.status = 0; /* as the name implies */\n  this.pending_buf = null; /* output still pending */\n  this.pending_buf_size = 0; /* size of pending_buf */\n  this.pending_out = 0; /* next pending byte to output to the stream */\n  this.pending = 0; /* nb of bytes in the pending buffer */\n  this.wrap = 0; /* bit 0 true for zlib, bit 1 true for gzip */\n  this.gzhead = null; /* gzip header information to write */\n  this.gzindex = 0; /* where in extra, name, or comment */\n  this.method = Z_DEFLATED; /* can only be DEFLATED */\n  this.last_flush = -1; /* value of flush param for previous deflate call */\n\n  this.w_size = 0; /* LZ77 window size (32K by default) */\n  this.w_bits = 0; /* log2(w_size)  (8..16) */\n  this.w_mask = 0; /* w_size - 1 */\n\n  this.window = null;\n  /* Sliding window. Input bytes are read into the second half of the window,\n   * and move to the first half later to keep a dictionary of at least wSize\n   * bytes. With this organization, matches are limited to a distance of\n   * wSize-MAX_MATCH bytes, but this ensures that IO is always\n   * performed with a length multiple of the block size.\n   */\n\n  this.window_size = 0;\n  /* Actual size of window: 2*wSize, except when the user input buffer\n   * is directly used as sliding window.\n   */\n\n  this.prev = null;\n  /* Link to older string with same hash index. To limit the size of this\n   * array to 64K, this link is maintained only for the last 32K strings.\n   * An index in this array is thus a window index modulo 32K.\n   */\n\n  this.head = null; /* Heads of the hash chains or NIL. */\n\n  this.ins_h = 0; /* hash index of string to be inserted */\n  this.hash_size = 0; /* number of elements in hash table */\n  this.hash_bits = 0; /* log2(hash_size) */\n  this.hash_mask = 0; /* hash_size-1 */\n\n  this.hash_shift = 0;\n  /* Number of bits by which ins_h must be shifted at each input\n   * step. It must be such that after MIN_MATCH steps, the oldest\n   * byte no longer takes part in the hash key, that is:\n   *   hash_shift * MIN_MATCH >= hash_bits\n   */\n\n  this.block_start = 0;\n  /* Window position at the beginning of the current output block. Gets\n   * negative when the window is moved backwards.\n   */\n\n  this.match_length = 0; /* length of best match */\n  this.prev_match = 0; /* previous match */\n  this.match_available = 0; /* set if previous match exists */\n  this.strstart = 0; /* start of string to insert */\n  this.match_start = 0; /* start of matching string */\n  this.lookahead = 0; /* number of valid bytes ahead in window */\n\n  this.prev_length = 0;\n  /* Length of the best match at previous step. Matches not greater than this\n   * are discarded. This is used in the lazy match evaluation.\n   */\n\n  this.max_chain_length = 0;\n  /* To speed up deflation, hash chains are never searched beyond this\n   * length.  A higher limit improves compression ratio but degrades the\n   * speed.\n   */\n\n  this.max_lazy_match = 0;\n  /* Attempt to find a better match only when the current match is strictly\n   * smaller than this value. This mechanism is used only for compression\n   * levels >= 4.\n   */\n  // That's alias to max_lazy_match, don't use directly\n  //this.max_insert_length = 0;\n  /* Insert new strings in the hash table only if the match length is not\n   * greater than this length. This saves time but degrades compression.\n   * max_insert_length is used only for compression levels <= 3.\n   */\n\n  this.level = 0; /* compression level (1..9) */\n  this.strategy = 0; /* favor or force Huffman coding*/\n\n  this.good_match = 0;\n  /* Use a faster search when the previous match is longer than this */\n\n  this.nice_match = 0; /* Stop searching when current match exceeds this */\n\n  /* used by c: */\n\n  /* Didn't use ct_data typedef below to suppress compiler warning */\n\n  // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */\n  // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */\n  // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */\n\n  // Use flat array of DOUBLE size, with interleaved fata,\n  // because JS does not support effective\n  this.dyn_ltree = new Buf16(HEAP_SIZE * 2);\n  this.dyn_dtree = new Buf16((2 * D_CODES + 1) * 2);\n  this.bl_tree = new Buf16((2 * BL_CODES + 1) * 2);\n  zero(this.dyn_ltree);\n  zero(this.dyn_dtree);\n  zero(this.bl_tree);\n\n  this.l_desc = null; /* desc. for literal tree */\n  this.d_desc = null; /* desc. for distance tree */\n  this.bl_desc = null; /* desc. for bit length tree */\n\n  //ush bl_count[MAX_BITS+1];\n  this.bl_count = new Buf16(MAX_BITS + 1);\n  /* number of codes at each bit length for an optimal tree */\n\n  //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */\n  this.heap = new Buf16(2 * L_CODES + 1); /* heap used to build the Huffman trees */\n  zero(this.heap);\n\n  this.heap_len = 0; /* number of elements in the heap */\n  this.heap_max = 0; /* element of largest frequency */\n  /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.\n   * The same heap array is used to build all\n   */\n\n  this.depth = new Buf16(2 * L_CODES + 1); //uch depth[2*L_CODES+1];\n  zero(this.depth);\n  /* Depth of each subtree used as tie breaker for trees of equal frequency\n   */\n\n  this.l_buf = 0; /* buffer index for literals or lengths */\n\n  this.lit_bufsize = 0;\n  /* Size of match buffer for literals/lengths.  There are 4 reasons for\n   * limiting lit_bufsize to 64K:\n   *   - frequencies can be kept in 16 bit counters\n   *   - if compression is not successful for the first block, all input\n   *     data is still in the window so we can still emit a stored block even\n   *     when input comes from standard input.  (This can also be done for\n   *     all blocks if lit_bufsize is not greater than 32K.)\n   *   - if compression is not successful for a file smaller than 64K, we can\n   *     even emit a stored file instead of a stored block (saving 5 bytes).\n   *     This is applicable only for zip (not gzip or zlib).\n   *   - creating new Huffman trees less frequently may not provide fast\n   *     adaptation to changes in the input data statistics. (Take for\n   *     example a binary file with poorly compressible code followed by\n   *     a highly compressible string table.) Smaller buffer sizes give\n   *     fast adaptation but have of course the overhead of transmitting\n   *     trees more frequently.\n   *   - I can't count above 4\n   */\n\n  this.last_lit = 0; /* running index in l_buf */\n\n  this.d_buf = 0;\n  /* Buffer index for distances. To simplify the code, d_buf and l_buf have\n   * the same number of elements. To use different lengths, an extra flag\n   * array would be necessary.\n   */\n\n  this.opt_len = 0; /* bit length of current block with optimal trees */\n  this.static_len = 0; /* bit length of current block with static trees */\n  this.matches = 0; /* number of string matches in current block */\n  this.insert = 0; /* bytes at end of window left to insert */\n\n\n  this.bi_buf = 0;\n  /* Output buffer. bits are inserted starting at the bottom (least\n   * significant bits).\n   */\n  this.bi_valid = 0;\n  /* Number of valid bits in bi_buf.  All bits above the last valid bit\n   * are always zero.\n   */\n\n  // Used for window memory init. We safely ignore it for JS. That makes\n  // sense only for pointers and memory check tools.\n  //this.high_water = 0;\n  /* High water mark offset in window for initialized bytes -- bytes above\n   * this are set to zero in order to avoid memory check warnings when\n   * longest match routines access bytes past the input.  This is then\n   * updated to the new high water mark.\n   */\n}\n\n\nexport function deflateResetKeep(strm) {\n  var s;\n\n  if (!strm || !strm.state) {\n    return err(strm, Z_STREAM_ERROR);\n  }\n\n  strm.total_in = strm.total_out = 0;\n  strm.data_type = Z_UNKNOWN;\n\n  s = strm.state;\n  s.pending = 0;\n  s.pending_out = 0;\n\n  if (s.wrap < 0) {\n    s.wrap = -s.wrap;\n    /* was made negative by deflate(..., Z_FINISH); */\n  }\n  s.status = (s.wrap ? INIT_STATE : BUSY_STATE);\n  strm.adler = (s.wrap === 2) ?\n    0 // crc32(0, Z_NULL, 0)\n    :\n    1; // adler32(0, Z_NULL, 0)\n  s.last_flush = Z_NO_FLUSH;\n  _tr_init(s);\n  return Z_OK;\n}\n\n\nexport function deflateReset(strm) {\n  var ret = deflateResetKeep(strm);\n  if (ret === Z_OK) {\n    lm_init(strm.state);\n  }\n  return ret;\n}\n\n\nexport function deflateSetHeader(strm, head) {\n  if (!strm || !strm.state) {\n    return Z_STREAM_ERROR;\n  }\n  if (strm.state.wrap !== 2) {\n    return Z_STREAM_ERROR;\n  }\n  strm.state.gzhead = head;\n  return Z_OK;\n}\n\n\nexport function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {\n  if (!strm) { // === Z_NULL\n    return Z_STREAM_ERROR;\n  }\n  var wrap = 1;\n\n  if (level === Z_DEFAULT_COMPRESSION) {\n    level = 6;\n  }\n\n  if (windowBits < 0) { /* suppress zlib wrapper */\n    wrap = 0;\n    windowBits = -windowBits;\n  } else if (windowBits > 15) {\n    wrap = 2; /* write gzip wrapper instead */\n    windowBits -= 16;\n  }\n\n\n  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED ||\n    windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||\n    strategy < 0 || strategy > Z_FIXED) {\n    return err(strm, Z_STREAM_ERROR);\n  }\n\n\n  if (windowBits === 8) {\n    windowBits = 9;\n  }\n  /* until 256-byte window bug fixed */\n\n  var s = new DeflateState();\n\n  strm.state = s;\n  s.strm = strm;\n\n  s.wrap = wrap;\n  s.gzhead = null;\n  s.w_bits = windowBits;\n  s.w_size = 1 << s.w_bits;\n  s.w_mask = s.w_size - 1;\n\n  s.hash_bits = memLevel + 7;\n  s.hash_size = 1 << s.hash_bits;\n  s.hash_mask = s.hash_size - 1;\n  s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);\n\n  s.window = new Buf8(s.w_size * 2);\n  s.head = new Buf16(s.hash_size);\n  s.prev = new Buf16(s.w_size);\n\n  // Don't need mem init magic for JS.\n  //s.high_water = 0;  /* nothing written to s->window yet */\n\n  s.lit_bufsize = 1 << (memLevel + 6); /* 16K elements by default */\n\n  s.pending_buf_size = s.lit_bufsize * 4;\n\n  //overlay = (ushf *) ZALLOC(strm, s->lit_bufsize, sizeof(ush)+2);\n  //s->pending_buf = (uchf *) overlay;\n  s.pending_buf = new Buf8(s.pending_buf_size);\n\n  // It is offset from `s.pending_buf` (size is `s.lit_bufsize * 2`)\n  //s->d_buf = overlay + s->lit_bufsize/sizeof(ush);\n  s.d_buf = 1 * s.lit_bufsize;\n\n  //s->l_buf = s->pending_buf + (1+sizeof(ush))*s->lit_bufsize;\n  s.l_buf = (1 + 2) * s.lit_bufsize;\n\n  s.level = level;\n  s.strategy = strategy;\n  s.method = method;\n\n  return deflateReset(strm);\n}\n\nexport function deflateInit(strm, level) {\n  return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);\n}\n\n\nexport function deflate(strm, flush) {\n  var old_flush, s;\n  var beg, val; // for gzip header write only\n\n  if (!strm || !strm.state ||\n    flush > Z_BLOCK || flush < 0) {\n    return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;\n  }\n\n  s = strm.state;\n\n  if (!strm.output ||\n    (!strm.input && strm.avail_in !== 0) ||\n    (s.status === FINISH_STATE && flush !== Z_FINISH)) {\n    return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR : Z_STREAM_ERROR);\n  }\n\n  s.strm = strm; /* just in case */\n  old_flush = s.last_flush;\n  s.last_flush = flush;\n\n  /* Write the header */\n  if (s.status === INIT_STATE) {\n    if (s.wrap === 2) {\n      // GZIP header\n      strm.adler = 0; //crc32(0L, Z_NULL, 0);\n      put_byte(s, 31);\n      put_byte(s, 139);\n      put_byte(s, 8);\n      if (!s.gzhead) { // s->gzhead == Z_NULL\n        put_byte(s, 0);\n        put_byte(s, 0);\n        put_byte(s, 0);\n        put_byte(s, 0);\n        put_byte(s, 0);\n        put_byte(s, s.level === 9 ? 2 :\n          (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?\n            4 : 0));\n        put_byte(s, OS_CODE);\n        s.status = BUSY_STATE;\n      } else {\n        put_byte(s, (s.gzhead.text ? 1 : 0) +\n          (s.gzhead.hcrc ? 2 : 0) +\n          (!s.gzhead.extra ? 0 : 4) +\n          (!s.gzhead.name ? 0 : 8) +\n          (!s.gzhead.comment ? 0 : 16)\n        );\n        put_byte(s, s.gzhead.time & 0xff);\n        put_byte(s, (s.gzhead.time >> 8) & 0xff);\n        put_byte(s, (s.gzhead.time >> 16) & 0xff);\n        put_byte(s, (s.gzhead.time >> 24) & 0xff);\n        put_byte(s, s.level === 9 ? 2 :\n          (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?\n            4 : 0));\n        put_byte(s, s.gzhead.os & 0xff);\n        if (s.gzhead.extra && s.gzhead.extra.length) {\n          put_byte(s, s.gzhead.extra.length & 0xff);\n          put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);\n        }\n        if (s.gzhead.hcrc) {\n          strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);\n        }\n        s.gzindex = 0;\n        s.status = EXTRA_STATE;\n      }\n    } else // DEFLATE header\n    {\n      var header = (Z_DEFLATED + ((s.w_bits - 8) << 4)) << 8;\n      var level_flags = -1;\n\n      if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {\n        level_flags = 0;\n      } else if (s.level < 6) {\n        level_flags = 1;\n      } else if (s.level === 6) {\n        level_flags = 2;\n      } else {\n        level_flags = 3;\n      }\n      header |= (level_flags << 6);\n      if (s.strstart !== 0) {\n        header |= PRESET_DICT;\n      }\n      header += 31 - (header % 31);\n\n      s.status = BUSY_STATE;\n      putShortMSB(s, header);\n\n      /* Save the adler32 of the preset dictionary: */\n      if (s.strstart !== 0) {\n        putShortMSB(s, strm.adler >>> 16);\n        putShortMSB(s, strm.adler & 0xffff);\n      }\n      strm.adler = 1; // adler32(0L, Z_NULL, 0);\n    }\n  }\n\n  //#ifdef GZIP\n  if (s.status === EXTRA_STATE) {\n    if (s.gzhead.extra /* != Z_NULL*/ ) {\n      beg = s.pending; /* start of bytes to update crc */\n\n      while (s.gzindex < (s.gzhead.extra.length & 0xffff)) {\n        if (s.pending === s.pending_buf_size) {\n          if (s.gzhead.hcrc && s.pending > beg) {\n            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);\n          }\n          flush_pending(strm);\n          beg = s.pending;\n          if (s.pending === s.pending_buf_size) {\n            break;\n          }\n        }\n        put_byte(s, s.gzhead.extra[s.gzindex] & 0xff);\n        s.gzindex++;\n      }\n      if (s.gzhead.hcrc && s.pending > beg) {\n        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);\n      }\n      if (s.gzindex === s.gzhead.extra.length) {\n        s.gzindex = 0;\n        s.status = NAME_STATE;\n      }\n    } else {\n      s.status = NAME_STATE;\n    }\n  }\n  if (s.status === NAME_STATE) {\n    if (s.gzhead.name /* != Z_NULL*/ ) {\n      beg = s.pending; /* start of bytes to update crc */\n      //int val;\n\n      do {\n        if (s.pending === s.pending_buf_size) {\n          if (s.gzhead.hcrc && s.pending > beg) {\n            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);\n          }\n          flush_pending(strm);\n          beg = s.pending;\n          if (s.pending === s.pending_buf_size) {\n            val = 1;\n            break;\n          }\n        }\n        // JS specific: little magic to add zero terminator to end of string\n        if (s.gzindex < s.gzhead.name.length) {\n          val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;\n        } else {\n          val = 0;\n        }\n        put_byte(s, val);\n      } while (val !== 0);\n\n      if (s.gzhead.hcrc && s.pending > beg) {\n        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);\n      }\n      if (val === 0) {\n        s.gzindex = 0;\n        s.status = COMMENT_STATE;\n      }\n    } else {\n      s.status = COMMENT_STATE;\n    }\n  }\n  if (s.status === COMMENT_STATE) {\n    if (s.gzhead.comment /* != Z_NULL*/ ) {\n      beg = s.pending; /* start of bytes to update crc */\n      //int val;\n\n      do {\n        if (s.pending === s.pending_buf_size) {\n          if (s.gzhead.hcrc && s.pending > beg) {\n            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);\n          }\n          flush_pending(strm);\n          beg = s.pending;\n          if (s.pending === s.pending_buf_size) {\n            val = 1;\n            break;\n          }\n        }\n        // JS specific: little magic to add zero terminator to end of string\n        if (s.gzindex < s.gzhead.comment.length) {\n          val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;\n        } else {\n          val = 0;\n        }\n        put_byte(s, val);\n      } while (val !== 0);\n\n      if (s.gzhead.hcrc && s.pending > beg) {\n        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);\n      }\n      if (val === 0) {\n        s.status = HCRC_STATE;\n      }\n    } else {\n      s.status = HCRC_STATE;\n    }\n  }\n  if (s.status === HCRC_STATE) {\n    if (s.gzhead.hcrc) {\n      if (s.pending + 2 > s.pending_buf_size) {\n        flush_pending(strm);\n      }\n      if (s.pending + 2 <= s.pending_buf_size) {\n        put_byte(s, strm.adler & 0xff);\n        put_byte(s, (strm.adler >> 8) & 0xff);\n        strm.adler = 0; //crc32(0L, Z_NULL, 0);\n        s.status = BUSY_STATE;\n      }\n    } else {\n      s.status = BUSY_STATE;\n    }\n  }\n  //#endif\n\n  /* Flush as much pending output as possible */\n  if (s.pending !== 0) {\n    flush_pending(strm);\n    if (strm.avail_out === 0) {\n      /* Since avail_out is 0, deflate will be called again with\n       * more output space, but possibly with both pending and\n       * avail_in equal to zero. There won't be anything to do,\n       * but this is not an error situation so make sure we\n       * return OK instead of BUF_ERROR at next call of deflate:\n       */\n      s.last_flush = -1;\n      return Z_OK;\n    }\n\n    /* Make sure there is something to do and avoid duplicate consecutive\n     * flushes. For repeated and useless calls with Z_FINISH, we keep\n     * returning Z_STREAM_END instead of Z_BUF_ERROR.\n     */\n  } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&\n    flush !== Z_FINISH) {\n    return err(strm, Z_BUF_ERROR);\n  }\n\n  /* User must not provide more input after the first FINISH: */\n  if (s.status === FINISH_STATE && strm.avail_in !== 0) {\n    return err(strm, Z_BUF_ERROR);\n  }\n\n  /* Start a new block or continue the current one.\n   */\n  if (strm.avail_in !== 0 || s.lookahead !== 0 ||\n    (flush !== Z_NO_FLUSH && s.status !== FINISH_STATE)) {\n    var bstate = (s.strategy === Z_HUFFMAN_ONLY) ? deflate_huff(s, flush) :\n      (s.strategy === Z_RLE ? deflate_rle(s, flush) :\n        configuration_table[s.level].func(s, flush));\n\n    if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {\n      s.status = FINISH_STATE;\n    }\n    if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {\n      if (strm.avail_out === 0) {\n        s.last_flush = -1;\n        /* avoid BUF_ERROR next call, see above */\n      }\n      return Z_OK;\n      /* If flush != Z_NO_FLUSH && avail_out == 0, the next call\n       * of deflate should use the same flush parameter to make sure\n       * that the flush is complete. So we don't have to output an\n       * empty block here, this will be done at next call. This also\n       * ensures that for a very small output buffer, we emit at most\n       * one empty block.\n       */\n    }\n    if (bstate === BS_BLOCK_DONE) {\n      if (flush === Z_PARTIAL_FLUSH) {\n        _tr_align(s);\n      } else if (flush !== Z_BLOCK) { /* FULL_FLUSH or SYNC_FLUSH */\n\n        _tr_stored_block(s, 0, 0, false);\n        /* For a full flush, this empty block will be recognized\n         * as a special marker by inflate_sync().\n         */\n        if (flush === Z_FULL_FLUSH) {\n          /*** CLEAR_HASH(s); ***/\n          /* forget history */\n          zero(s.head); // Fill with NIL (= 0);\n\n          if (s.lookahead === 0) {\n            s.strstart = 0;\n            s.block_start = 0;\n            s.insert = 0;\n          }\n        }\n      }\n      flush_pending(strm);\n      if (strm.avail_out === 0) {\n        s.last_flush = -1; /* avoid BUF_ERROR at next call, see above */\n        return Z_OK;\n      }\n    }\n  }\n  //Assert(strm->avail_out > 0, \"bug2\");\n  //if (strm.avail_out <= 0) { throw new Error(\"bug2\");}\n\n  if (flush !== Z_FINISH) {\n    return Z_OK;\n  }\n  if (s.wrap <= 0) {\n    return Z_STREAM_END;\n  }\n\n  /* Write the trailer */\n  if (s.wrap === 2) {\n    put_byte(s, strm.adler & 0xff);\n    put_byte(s, (strm.adler >> 8) & 0xff);\n    put_byte(s, (strm.adler >> 16) & 0xff);\n    put_byte(s, (strm.adler >> 24) & 0xff);\n    put_byte(s, strm.total_in & 0xff);\n    put_byte(s, (strm.total_in >> 8) & 0xff);\n    put_byte(s, (strm.total_in >> 16) & 0xff);\n    put_byte(s, (strm.total_in >> 24) & 0xff);\n  } else {\n    putShortMSB(s, strm.adler >>> 16);\n    putShortMSB(s, strm.adler & 0xffff);\n  }\n\n  flush_pending(strm);\n  /* If avail_out is zero, the application will call deflate again\n   * to flush the rest.\n   */\n  if (s.wrap > 0) {\n    s.wrap = -s.wrap;\n  }\n  /* write the trailer only once! */\n  return s.pending !== 0 ? Z_OK : Z_STREAM_END;\n}\n\nexport function deflateEnd(strm) {\n  var status;\n\n  if (!strm /*== Z_NULL*/ || !strm.state /*== Z_NULL*/ ) {\n    return Z_STREAM_ERROR;\n  }\n\n  status = strm.state.status;\n  if (status !== INIT_STATE &&\n    status !== EXTRA_STATE &&\n    status !== NAME_STATE &&\n    status !== COMMENT_STATE &&\n    status !== HCRC_STATE &&\n    status !== BUSY_STATE &&\n    status !== FINISH_STATE\n  ) {\n    return err(strm, Z_STREAM_ERROR);\n  }\n\n  strm.state = null;\n\n  return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;\n}\n\n\n/* =========================================================================\n * Initializes the compression dictionary from the given byte\n * sequence without producing any compressed output.\n */\nexport function deflateSetDictionary(strm, dictionary) {\n  var dictLength = dictionary.length;\n\n  var s;\n  var str, n;\n  var wrap;\n  var avail;\n  var next;\n  var input;\n  var tmpDict;\n\n  if (!strm /*== Z_NULL*/ || !strm.state /*== Z_NULL*/ ) {\n    return Z_STREAM_ERROR;\n  }\n\n  s = strm.state;\n  wrap = s.wrap;\n\n  if (wrap === 2 || (wrap === 1 && s.status !== INIT_STATE) || s.lookahead) {\n    return Z_STREAM_ERROR;\n  }\n\n  /* when using zlib wrappers, compute Adler-32 for provided dictionary */\n  if (wrap === 1) {\n    /* adler32(strm->adler, dictionary, dictLength); */\n    strm.adler = adler32(strm.adler, dictionary, dictLength, 0);\n  }\n\n  s.wrap = 0; /* avoid computing Adler-32 in read_buf */\n\n  /* if dictionary would fill window, just replace the history */\n  if (dictLength >= s.w_size) {\n    if (wrap === 0) { /* already empty otherwise */\n      /*** CLEAR_HASH(s); ***/\n      zero(s.head); // Fill with NIL (= 0);\n      s.strstart = 0;\n      s.block_start = 0;\n      s.insert = 0;\n    }\n    /* use the tail */\n    // dictionary = dictionary.slice(dictLength - s.w_size);\n    tmpDict = new Buf8(s.w_size);\n    arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);\n    dictionary = tmpDict;\n    dictLength = s.w_size;\n  }\n  /* insert dictionary into window and hash */\n  avail = strm.avail_in;\n  next = strm.next_in;\n  input = strm.input;\n  strm.avail_in = dictLength;\n  strm.next_in = 0;\n  strm.input = dictionary;\n  fill_window(s);\n  while (s.lookahead >= MIN_MATCH) {\n    str = s.strstart;\n    n = s.lookahead - (MIN_MATCH - 1);\n    do {\n      /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */\n      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;\n\n      s.prev[str & s.w_mask] = s.head[s.ins_h];\n\n      s.head[s.ins_h] = str;\n      str++;\n    } while (--n);\n    s.strstart = str;\n    s.lookahead = MIN_MATCH - 1;\n    fill_window(s);\n  }\n  s.strstart += s.lookahead;\n  s.block_start = s.strstart;\n  s.insert = s.lookahead;\n  s.lookahead = 0;\n  s.match_length = s.prev_length = MIN_MATCH - 1;\n  s.match_available = 0;\n  strm.next_in = next;\n  strm.input = input;\n  strm.avail_in = avail;\n  s.wrap = wrap;\n  return Z_OK;\n}\n\n\nexport var deflateInfo = 'pako deflate (from Nodeca project)';\n\n/* Not implemented\nexports.deflateBound = deflateBound;\nexports.deflateCopy = deflateCopy;\nexports.deflateParams = deflateParams;\nexports.deflatePending = deflatePending;\nexports.deflatePrime = deflatePrime;\nexports.deflateTune = deflateTune;\n*/\n","__zlib-lib/inffast.js":"\n// See state defs from inflate.js\nvar BAD = 30;       /* got a data error -- remain here until reset */\nvar TYPE = 12;      /* i: waiting for type bits, including last-flag bit */\n\n/*\n   Decode literal, length, and distance codes and write out the resulting\n   literal and match bytes until either not enough input or output is\n   available, an end-of-block is encountered, or a data error is encountered.\n   When large enough input and output buffers are supplied to inflate(), for\n   example, a 16K input buffer and a 64K output buffer, more than 95% of the\n   inflate execution time is spent in this routine.\n\n   Entry assumptions:\n\n        state.mode === LEN\n        strm.avail_in >= 6\n        strm.avail_out >= 258\n        start >= strm.avail_out\n        state.bits < 8\n\n   On return, state.mode is one of:\n\n        LEN -- ran out of enough output space or enough available input\n        TYPE -- reached end of block code, inflate() to interpret next block\n        BAD -- error in block data\n\n   Notes:\n\n    - The maximum input bits used by a length/distance pair is 15 bits for the\n      length code, 5 bits for the length extra, 15 bits for the distance code,\n      and 13 bits for the distance extra.  This totals 48 bits, or six bytes.\n      Therefore if strm.avail_in >= 6, then there is enough input to avoid\n      checking for available input while decoding.\n\n    - The maximum bytes that a single length/distance pair can output is 258\n      bytes, which is the maximum length that can be coded.  inflate_fast()\n      requires strm.avail_out >= 258 for each loop to avoid checking for\n      output space.\n */\nexport default function inflate_fast(strm, start) {\n  var state;\n  var _in;                    /* local strm.input */\n  var last;                   /* have enough input while in < last */\n  var _out;                   /* local strm.output */\n  var beg;                    /* inflate()'s initial strm.output */\n  var end;                    /* while out < end, enough space available */\n//#ifdef INFLATE_STRICT\n  var dmax;                   /* maximum distance from zlib header */\n//#endif\n  var wsize;                  /* window size or zero if not using window */\n  var whave;                  /* valid bytes in the window */\n  var wnext;                  /* window write index */\n  // Use `s_window` instead `window`, avoid conflict with instrumentation tools\n  var s_window;               /* allocated sliding window, if wsize != 0 */\n  var hold;                   /* local strm.hold */\n  var bits;                   /* local strm.bits */\n  var lcode;                  /* local strm.lencode */\n  var dcode;                  /* local strm.distcode */\n  var lmask;                  /* mask for first level of length codes */\n  var dmask;                  /* mask for first level of distance codes */\n  var here;                   /* retrieved table entry */\n  var op;                     /* code bits, operation, extra bits, or */\n                              /*  window position, window bytes to copy */\n  var len;                    /* match length, unused bytes */\n  var dist;                   /* match distance */\n  var from;                   /* where to copy match from */\n  var from_source;\n\n\n  var input, output; // JS specific, because we have no pointers\n\n  /* copy state to local variables */\n  state = strm.state;\n  //here = state.here;\n  _in = strm.next_in;\n  input = strm.input;\n  last = _in + (strm.avail_in - 5);\n  _out = strm.next_out;\n  output = strm.output;\n  beg = _out - (start - strm.avail_out);\n  end = _out + (strm.avail_out - 257);\n//#ifdef INFLATE_STRICT\n  dmax = state.dmax;\n//#endif\n  wsize = state.wsize;\n  whave = state.whave;\n  wnext = state.wnext;\n  s_window = state.window;\n  hold = state.hold;\n  bits = state.bits;\n  lcode = state.lencode;\n  dcode = state.distcode;\n  lmask = (1 << state.lenbits) - 1;\n  dmask = (1 << state.distbits) - 1;\n\n\n  /* decode literals and length/distances until end-of-block or not enough\n     input data or output space */\n\n  top:\n  do {\n    if (bits < 15) {\n      hold += input[_in++] << bits;\n      bits += 8;\n      hold += input[_in++] << bits;\n      bits += 8;\n    }\n\n    here = lcode[hold & lmask];\n\n    dolen:\n    for (;;) { // Goto emulation\n      op = here >>> 24/*here.bits*/;\n      hold >>>= op;\n      bits -= op;\n      op = (here >>> 16) & 0xff/*here.op*/;\n      if (op === 0) {                          /* literal */\n        //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?\n        //        \"inflate:         literal '%c'\\n\" :\n        //        \"inflate:         literal 0x%02x\\n\", here.val));\n        output[_out++] = here & 0xffff/*here.val*/;\n      }\n      else if (op & 16) {                     /* length base */\n        len = here & 0xffff/*here.val*/;\n        op &= 15;                           /* number of extra bits */\n        if (op) {\n          if (bits < op) {\n            hold += input[_in++] << bits;\n            bits += 8;\n          }\n          len += hold & ((1 << op) - 1);\n          hold >>>= op;\n          bits -= op;\n        }\n        //Tracevv((stderr, \"inflate:         length %u\\n\", len));\n        if (bits < 15) {\n          hold += input[_in++] << bits;\n          bits += 8;\n          hold += input[_in++] << bits;\n          bits += 8;\n        }\n        here = dcode[hold & dmask];\n\n        dodist:\n        for (;;) { // goto emulation\n          op = here >>> 24/*here.bits*/;\n          hold >>>= op;\n          bits -= op;\n          op = (here >>> 16) & 0xff/*here.op*/;\n\n          if (op & 16) {                      /* distance base */\n            dist = here & 0xffff/*here.val*/;\n            op &= 15;                       /* number of extra bits */\n            if (bits < op) {\n              hold += input[_in++] << bits;\n              bits += 8;\n              if (bits < op) {\n                hold += input[_in++] << bits;\n                bits += 8;\n              }\n            }\n            dist += hold & ((1 << op) - 1);\n//#ifdef INFLATE_STRICT\n            if (dist > dmax) {\n              strm.msg = 'invalid distance too far back';\n              state.mode = BAD;\n              break top;\n            }\n//#endif\n            hold >>>= op;\n            bits -= op;\n            //Tracevv((stderr, \"inflate:         distance %u\\n\", dist));\n            op = _out - beg;                /* max distance in output */\n            if (dist > op) {                /* see if copy from window */\n              op = dist - op;               /* distance back in window */\n              if (op > whave) {\n                if (state.sane) {\n                  strm.msg = 'invalid distance too far back';\n                  state.mode = BAD;\n                  break top;\n                }\n\n// (!) This block is disabled in zlib defailts,\n// don't enable it for binary compatibility\n//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR\n//                if (len <= op - whave) {\n//                  do {\n//                    output[_out++] = 0;\n//                  } while (--len);\n//                  continue top;\n//                }\n//                len -= op - whave;\n//                do {\n//                  output[_out++] = 0;\n//                } while (--op > whave);\n//                if (op === 0) {\n//                  from = _out - dist;\n//                  do {\n//                    output[_out++] = output[from++];\n//                  } while (--len);\n//                  continue top;\n//                }\n//#endif\n              }\n              from = 0; // window index\n              from_source = s_window;\n              if (wnext === 0) {           /* very common case */\n                from += wsize - op;\n                if (op < len) {         /* some from window */\n                  len -= op;\n                  do {\n                    output[_out++] = s_window[from++];\n                  } while (--op);\n                  from = _out - dist;  /* rest from output */\n                  from_source = output;\n                }\n              }\n              else if (wnext < op) {      /* wrap around window */\n                from += wsize + wnext - op;\n                op -= wnext;\n                if (op < len) {         /* some from end of window */\n                  len -= op;\n                  do {\n                    output[_out++] = s_window[from++];\n                  } while (--op);\n                  from = 0;\n                  if (wnext < len) {  /* some from start of window */\n                    op = wnext;\n                    len -= op;\n                    do {\n                      output[_out++] = s_window[from++];\n                    } while (--op);\n                    from = _out - dist;      /* rest from output */\n                    from_source = output;\n                  }\n                }\n              }\n              else {                      /* contiguous in window */\n                from += wnext - op;\n                if (op < len) {         /* some from window */\n                  len -= op;\n                  do {\n                    output[_out++] = s_window[from++];\n                  } while (--op);\n                  from = _out - dist;  /* rest from output */\n                  from_source = output;\n                }\n              }\n              while (len > 2) {\n                output[_out++] = from_source[from++];\n                output[_out++] = from_source[from++];\n                output[_out++] = from_source[from++];\n                len -= 3;\n              }\n              if (len) {\n                output[_out++] = from_source[from++];\n                if (len > 1) {\n                  output[_out++] = from_source[from++];\n                }\n              }\n            }\n            else {\n              from = _out - dist;          /* copy direct from output */\n              do {                        /* minimum length is three */\n                output[_out++] = output[from++];\n                output[_out++] = output[from++];\n                output[_out++] = output[from++];\n                len -= 3;\n              } while (len > 2);\n              if (len) {\n                output[_out++] = output[from++];\n                if (len > 1) {\n                  output[_out++] = output[from++];\n                }\n              }\n            }\n          }\n          else if ((op & 64) === 0) {          /* 2nd level distance code */\n            here = dcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];\n            continue dodist;\n          }\n          else {\n            strm.msg = 'invalid distance code';\n            state.mode = BAD;\n            break top;\n          }\n\n          break; // need to emulate goto via \"continue\"\n        }\n      }\n      else if ((op & 64) === 0) {              /* 2nd level length code */\n        here = lcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];\n        continue dolen;\n      }\n      else if (op & 32) {                     /* end-of-block */\n        //Tracevv((stderr, \"inflate:         end of block\\n\"));\n        state.mode = TYPE;\n        break top;\n      }\n      else {\n        strm.msg = 'invalid literal/length code';\n        state.mode = BAD;\n        break top;\n      }\n\n      break; // need to emulate goto via \"continue\"\n    }\n  } while (_in < last && _out < end);\n\n  /* return unused bytes (on entry, bits < 8, so in won't go too far back) */\n  len = bits >> 3;\n  _in -= len;\n  bits -= len << 3;\n  hold &= (1 << bits) - 1;\n\n  /* update state and return */\n  strm.next_in = _in;\n  strm.next_out = _out;\n  strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));\n  strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));\n  state.hold = hold;\n  state.bits = bits;\n  return;\n};\n","__zlib-lib/inflate.js":"'use strict';\n\nimport {Buf8,Buf16,Buf32,arraySet} from './utils';\nimport adler32 from './adler32';\nimport crc32 from './crc32';\nimport inflate_fast from './inffast';\nimport inflate_table from './inftrees';\n\nvar CODES = 0;\nvar LENS = 1;\nvar DISTS = 2;\n\n/* Public constants ==========================================================*/\n/* ===========================================================================*/\n\n\n/* Allowed flush values; see deflate() and inflate() below for details */\n//var Z_NO_FLUSH      = 0;\n//var Z_PARTIAL_FLUSH = 1;\n//var Z_SYNC_FLUSH    = 2;\n//var Z_FULL_FLUSH    = 3;\nvar Z_FINISH = 4;\nvar Z_BLOCK = 5;\nvar Z_TREES = 6;\n\n\n/* Return codes for the compression/decompression functions. Negative values\n * are errors, positive values are used for special but normal events.\n */\nvar Z_OK = 0;\nvar Z_STREAM_END = 1;\nvar Z_NEED_DICT = 2;\n//var Z_ERRNO         = -1;\nvar Z_STREAM_ERROR = -2;\nvar Z_DATA_ERROR = -3;\nvar Z_MEM_ERROR = -4;\nvar Z_BUF_ERROR = -5;\n//var Z_VERSION_ERROR = -6;\n\n/* The deflate compression method */\nvar Z_DEFLATED = 8;\n\n\n/* STATES ====================================================================*/\n/* ===========================================================================*/\n\n\nvar HEAD = 1; /* i: waiting for magic header */\nvar FLAGS = 2; /* i: waiting for method and flags (gzip) */\nvar TIME = 3; /* i: waiting for modification time (gzip) */\nvar OS = 4; /* i: waiting for extra flags and operating system (gzip) */\nvar EXLEN = 5; /* i: waiting for extra length (gzip) */\nvar EXTRA = 6; /* i: waiting for extra bytes (gzip) */\nvar NAME = 7; /* i: waiting for end of file name (gzip) */\nvar COMMENT = 8; /* i: waiting for end of comment (gzip) */\nvar HCRC = 9; /* i: waiting for header crc (gzip) */\nvar DICTID = 10; /* i: waiting for dictionary check value */\nvar DICT = 11; /* waiting for inflateSetDictionary() call */\nvar TYPE = 12; /* i: waiting for type bits, including last-flag bit */\nvar TYPEDO = 13; /* i: same, but skip check to exit inflate on new block */\nvar STORED = 14; /* i: waiting for stored size (length and complement) */\nvar COPY_ = 15; /* i/o: same as COPY below, but only first time in */\nvar COPY = 16; /* i/o: waiting for input or output to copy stored block */\nvar TABLE = 17; /* i: waiting for dynamic block table lengths */\nvar LENLENS = 18; /* i: waiting for code length code lengths */\nvar CODELENS = 19; /* i: waiting for length/lit and distance code lengths */\nvar LEN_ = 20; /* i: same as LEN below, but only first time in */\nvar LEN = 21; /* i: waiting for length/lit/eob code */\nvar LENEXT = 22; /* i: waiting for length extra bits */\nvar DIST = 23; /* i: waiting for distance code */\nvar DISTEXT = 24; /* i: waiting for distance extra bits */\nvar MATCH = 25; /* o: waiting for output space to copy string */\nvar LIT = 26; /* o: waiting for output space to write literal */\nvar CHECK = 27; /* i: waiting for 32-bit check value */\nvar LENGTH = 28; /* i: waiting for 32-bit length (gzip) */\nvar DONE = 29; /* finished check, done -- remain here until reset */\nvar BAD = 30; /* got a data error -- remain here until reset */\nvar MEM = 31; /* got an inflate() memory error -- remain here until reset */\nvar SYNC = 32; /* looking for synchronization bytes to restart inflate() */\n\n/* ===========================================================================*/\n\n\n\nvar ENOUGH_LENS = 852;\nvar ENOUGH_DISTS = 592;\n//var ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);\n\nvar MAX_WBITS = 15;\n/* 32K LZ77 window */\nvar DEF_WBITS = MAX_WBITS;\n\n\nfunction zswap32(q) {\n  return (((q >>> 24) & 0xff) +\n    ((q >>> 8) & 0xff00) +\n    ((q & 0xff00) << 8) +\n    ((q & 0xff) << 24));\n}\n\n\nfunction InflateState() {\n  this.mode = 0; /* current inflate mode */\n  this.last = false; /* true if processing last block */\n  this.wrap = 0; /* bit 0 true for zlib, bit 1 true for gzip */\n  this.havedict = false; /* true if dictionary provided */\n  this.flags = 0; /* gzip header method and flags (0 if zlib) */\n  this.dmax = 0; /* zlib header max distance (INFLATE_STRICT) */\n  this.check = 0; /* protected copy of check value */\n  this.total = 0; /* protected copy of output count */\n  // TODO: may be {}\n  this.head = null; /* where to save gzip header information */\n\n  /* sliding window */\n  this.wbits = 0; /* log base 2 of requested window size */\n  this.wsize = 0; /* window size or zero if not using window */\n  this.whave = 0; /* valid bytes in the window */\n  this.wnext = 0; /* window write index */\n  this.window = null; /* allocated sliding window, if needed */\n\n  /* bit accumulator */\n  this.hold = 0; /* input bit accumulator */\n  this.bits = 0; /* number of bits in \"in\" */\n\n  /* for string and stored block copying */\n  this.length = 0; /* literal or length of data to copy */\n  this.offset = 0; /* distance back to copy string from */\n\n  /* for table and code decoding */\n  this.extra = 0; /* extra bits needed */\n\n  /* fixed and dynamic code tables */\n  this.lencode = null; /* starting table for length/literal codes */\n  this.distcode = null; /* starting table for distance codes */\n  this.lenbits = 0; /* index bits for lencode */\n  this.distbits = 0; /* index bits for distcode */\n\n  /* dynamic table building */\n  this.ncode = 0; /* number of code length code lengths */\n  this.nlen = 0; /* number of length code lengths */\n  this.ndist = 0; /* number of distance code lengths */\n  this.have = 0; /* number of code lengths in lens[] */\n  this.next = null; /* next available space in codes[] */\n\n  this.lens = new Buf16(320); /* temporary storage for code lengths */\n  this.work = new Buf16(288); /* work area for code table building */\n\n  /*\n   because we don't have pointers in js, we use lencode and distcode directly\n   as buffers so we don't need codes\n  */\n  //this.codes = new Buf32(ENOUGH);       /* space for code tables */\n  this.lendyn = null; /* dynamic table for length/literal codes (JS specific) */\n  this.distdyn = null; /* dynamic table for distance codes (JS specific) */\n  this.sane = 0; /* if false, allow invalid distance too far */\n  this.back = 0; /* bits back of last unprocessed length/lit */\n  this.was = 0; /* initial length of match */\n}\n\nexport function inflateResetKeep(strm) {\n  var state;\n\n  if (!strm || !strm.state) {\n    return Z_STREAM_ERROR;\n  }\n  state = strm.state;\n  strm.total_in = strm.total_out = state.total = 0;\n  strm.msg = ''; /*Z_NULL*/\n  if (state.wrap) { /* to support ill-conceived Java test suite */\n    strm.adler = state.wrap & 1;\n  }\n  state.mode = HEAD;\n  state.last = 0;\n  state.havedict = 0;\n  state.dmax = 32768;\n  state.head = null /*Z_NULL*/ ;\n  state.hold = 0;\n  state.bits = 0;\n  //state.lencode = state.distcode = state.next = state.codes;\n  state.lencode = state.lendyn = new Buf32(ENOUGH_LENS);\n  state.distcode = state.distdyn = new Buf32(ENOUGH_DISTS);\n\n  state.sane = 1;\n  state.back = -1;\n  //Tracev((stderr, \"inflate: reset\\n\"));\n  return Z_OK;\n}\n\nexport function inflateReset(strm) {\n  var state;\n\n  if (!strm || !strm.state) {\n    return Z_STREAM_ERROR;\n  }\n  state = strm.state;\n  state.wsize = 0;\n  state.whave = 0;\n  state.wnext = 0;\n  return inflateResetKeep(strm);\n\n}\n\nexport function inflateReset2(strm, windowBits) {\n  var wrap;\n  var state;\n\n  /* get the state */\n  if (!strm || !strm.state) {\n    return Z_STREAM_ERROR;\n  }\n  state = strm.state;\n\n  /* extract wrap request from windowBits parameter */\n  if (windowBits < 0) {\n    wrap = 0;\n    windowBits = -windowBits;\n  } else {\n    wrap = (windowBits >> 4) + 1;\n    if (windowBits < 48) {\n      windowBits &= 15;\n    }\n  }\n\n  /* set number of window bits, free window if different */\n  if (windowBits && (windowBits < 8 || windowBits > 15)) {\n    return Z_STREAM_ERROR;\n  }\n  if (state.window !== null && state.wbits !== windowBits) {\n    state.window = null;\n  }\n\n  /* update state and reset the rest of it */\n  state.wrap = wrap;\n  state.wbits = windowBits;\n  return inflateReset(strm);\n}\n\nexport function inflateInit2(strm, windowBits) {\n  var ret;\n  var state;\n\n  if (!strm) {\n    return Z_STREAM_ERROR;\n  }\n  //strm.msg = Z_NULL;                 /* in case we return an error */\n\n  state = new InflateState();\n\n  //if (state === Z_NULL) return Z_MEM_ERROR;\n  //Tracev((stderr, \"inflate: allocated\\n\"));\n  strm.state = state;\n  state.window = null /*Z_NULL*/ ;\n  ret = inflateReset2(strm, windowBits);\n  if (ret !== Z_OK) {\n    strm.state = null /*Z_NULL*/ ;\n  }\n  return ret;\n}\n\nexport function inflateInit(strm) {\n  return inflateInit2(strm, DEF_WBITS);\n}\n\n\n/*\n Return state with length and distance decoding tables and index sizes set to\n fixed code decoding.  Normally this returns fixed tables from inffixed.h.\n If BUILDFIXED is defined, then instead this routine builds the tables the\n first time it's called, and returns those tables the first time and\n thereafter.  This reduces the size of the code by about 2K bytes, in\n exchange for a little execution time.  However, BUILDFIXED should not be\n used for threaded applications, since the rewriting of the tables and virgin\n may not be thread-safe.\n */\nvar virgin = true;\n\nvar lenfix, distfix; // We have no pointers in JS, so keep tables separate\n\nfunction fixedtables(state) {\n  /* build fixed huffman tables if first call (may not be thread safe) */\n  if (virgin) {\n    var sym;\n\n    lenfix = new Buf32(512);\n    distfix = new Buf32(32);\n\n    /* literal/length table */\n    sym = 0;\n    while (sym < 144) {\n      state.lens[sym++] = 8;\n    }\n    while (sym < 256) {\n      state.lens[sym++] = 9;\n    }\n    while (sym < 280) {\n      state.lens[sym++] = 7;\n    }\n    while (sym < 288) {\n      state.lens[sym++] = 8;\n    }\n\n    inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, {\n      bits: 9\n    });\n\n    /* distance table */\n    sym = 0;\n    while (sym < 32) {\n      state.lens[sym++] = 5;\n    }\n\n    inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, {\n      bits: 5\n    });\n\n    /* do this just once */\n    virgin = false;\n  }\n\n  state.lencode = lenfix;\n  state.lenbits = 9;\n  state.distcode = distfix;\n  state.distbits = 5;\n}\n\n\n/*\n Update the window with the last wsize (normally 32K) bytes written before\n returning.  If window does not exist yet, create it.  This is only called\n when a window is already in use, or when output has been written during this\n inflate call, but the end of the deflate stream has not been reached yet.\n It is also called to create a window for dictionary data when a dictionary\n is loaded.\n\n Providing output buffers larger than 32K to inflate() should provide a speed\n advantage, since only the last 32K of output is copied to the sliding window\n upon return from inflate(), and since all distances after the first 32K of\n output will fall in the output data, making match copies simpler and faster.\n The advantage may be dependent on the size of the processor's data caches.\n */\nfunction updatewindow(strm, src, end, copy) {\n  var dist;\n  var state = strm.state;\n\n  /* if it hasn't been done already, allocate space for the window */\n  if (state.window === null) {\n    state.wsize = 1 << state.wbits;\n    state.wnext = 0;\n    state.whave = 0;\n\n    state.window = new Buf8(state.wsize);\n  }\n\n  /* copy state->wsize or less output bytes into the circular window */\n  if (copy >= state.wsize) {\n    arraySet(state.window, src, end - state.wsize, state.wsize, 0);\n    state.wnext = 0;\n    state.whave = state.wsize;\n  } else {\n    dist = state.wsize - state.wnext;\n    if (dist > copy) {\n      dist = copy;\n    }\n    //zmemcpy(state->window + state->wnext, end - copy, dist);\n    arraySet(state.window, src, end - copy, dist, state.wnext);\n    copy -= dist;\n    if (copy) {\n      //zmemcpy(state->window, end - copy, copy);\n      arraySet(state.window, src, end - copy, copy, 0);\n      state.wnext = copy;\n      state.whave = state.wsize;\n    } else {\n      state.wnext += dist;\n      if (state.wnext === state.wsize) {\n        state.wnext = 0;\n      }\n      if (state.whave < state.wsize) {\n        state.whave += dist;\n      }\n    }\n  }\n  return 0;\n}\n\nexport function inflate(strm, flush) {\n  var state;\n  var input, output; // input/output buffers\n  var next; /* next input INDEX */\n  var put; /* next output INDEX */\n  var have, left; /* available input and output */\n  var hold; /* bit buffer */\n  var bits; /* bits in bit buffer */\n  var _in, _out; /* save starting available input and output */\n  var copy; /* number of stored or match bytes to copy */\n  var from; /* where to copy match bytes from */\n  var from_source;\n  var here = 0; /* current decoding table entry */\n  var here_bits, here_op, here_val; // paked \"here\" denormalized (JS specific)\n  //var last;                   /* parent table entry */\n  var last_bits, last_op, last_val; // paked \"last\" denormalized (JS specific)\n  var len; /* length to copy for repeats, bits to drop */\n  var ret; /* return code */\n  var hbuf = new Buf8(4); /* buffer for gzip header crc calculation */\n  var opts;\n\n  var n; // temporary var for NEED_BITS\n\n  var order = /* permutation of code lengths */ [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];\n\n\n  if (!strm || !strm.state || !strm.output ||\n    (!strm.input && strm.avail_in !== 0)) {\n    return Z_STREAM_ERROR;\n  }\n\n  state = strm.state;\n  if (state.mode === TYPE) {\n    state.mode = TYPEDO;\n  } /* skip check */\n\n\n  //--- LOAD() ---\n  put = strm.next_out;\n  output = strm.output;\n  left = strm.avail_out;\n  next = strm.next_in;\n  input = strm.input;\n  have = strm.avail_in;\n  hold = state.hold;\n  bits = state.bits;\n  //---\n\n  _in = have;\n  _out = left;\n  ret = Z_OK;\n\n  inf_leave: // goto emulation\n    for (;;) {\n      switch (state.mode) {\n      case HEAD:\n        if (state.wrap === 0) {\n          state.mode = TYPEDO;\n          break;\n        }\n        //=== NEEDBITS(16);\n        while (bits < 16) {\n          if (have === 0) {\n            break inf_leave;\n          }\n          have--;\n          hold += input[next++] << bits;\n          bits += 8;\n        }\n        //===//\n        if ((state.wrap & 2) && hold === 0x8b1f) { /* gzip header */\n          state.check = 0 /*crc32(0L, Z_NULL, 0)*/ ;\n          //=== CRC2(state.check, hold);\n          hbuf[0] = hold & 0xff;\n          hbuf[1] = (hold >>> 8) & 0xff;\n          state.check = crc32(state.check, hbuf, 2, 0);\n          //===//\n\n          //=== INITBITS();\n          hold = 0;\n          bits = 0;\n          //===//\n          state.mode = FLAGS;\n          break;\n        }\n        state.flags = 0; /* expect zlib header */\n        if (state.head) {\n          state.head.done = false;\n        }\n        if (!(state.wrap & 1) || /* check if zlib header allowed */\n          (((hold & 0xff) /*BITS(8)*/ << 8) + (hold >> 8)) % 31) {\n          strm.msg = 'incorrect header check';\n          state.mode = BAD;\n          break;\n        }\n        if ((hold & 0x0f) /*BITS(4)*/ !== Z_DEFLATED) {\n          strm.msg = 'unknown compression method';\n          state.mode = BAD;\n          break;\n        }\n        //--- DROPBITS(4) ---//\n        hold >>>= 4;\n        bits -= 4;\n        //---//\n        len = (hold & 0x0f) /*BITS(4)*/ + 8;\n        if (state.wbits === 0) {\n          state.wbits = len;\n        } else if (len > state.wbits) {\n          strm.msg = 'invalid window size';\n          state.mode = BAD;\n          break;\n        }\n        state.dmax = 1 << len;\n        //Tracev((stderr, \"inflate:   zlib header ok\\n\"));\n        strm.adler = state.check = 1 /*adler32(0L, Z_NULL, 0)*/ ;\n        state.mode = hold & 0x200 ? DICTID : TYPE;\n        //=== INITBITS();\n        hold = 0;\n        bits = 0;\n        //===//\n        break;\n      case FLAGS:\n        //=== NEEDBITS(16); */\n        while (bits < 16) {\n          if (have === 0) {\n            break inf_leave;\n          }\n          have--;\n          hold += input[next++] << bits;\n          bits += 8;\n        }\n        //===//\n        state.flags = hold;\n        if ((state.flags & 0xff) !== Z_DEFLATED) {\n          strm.msg = 'unknown compression method';\n          state.mode = BAD;\n          break;\n        }\n        if (state.flags & 0xe000) {\n          strm.msg = 'unknown header flags set';\n          state.mode = BAD;\n          break;\n        }\n        if (state.head) {\n          state.head.text = ((hold >> 8) & 1);\n        }\n        if (state.flags & 0x0200) {\n          //=== CRC2(state.check, hold);\n          hbuf[0] = hold & 0xff;\n          hbuf[1] = (hold >>> 8) & 0xff;\n          state.check = crc32(state.check, hbuf, 2, 0);\n          //===//\n        }\n        //=== INITBITS();\n        hold = 0;\n        bits = 0;\n        //===//\n        state.mode = TIME;\n        /* falls through */\n      case TIME:\n        //=== NEEDBITS(32); */\n        while (bits < 32) {\n          if (have === 0) {\n            break inf_leave;\n          }\n          have--;\n          hold += input[next++] << bits;\n          bits += 8;\n        }\n        //===//\n        if (state.head) {\n          state.head.time = hold;\n        }\n        if (state.flags & 0x0200) {\n          //=== CRC4(state.check, hold)\n          hbuf[0] = hold & 0xff;\n          hbuf[1] = (hold >>> 8) & 0xff;\n          hbuf[2] = (hold >>> 16) & 0xff;\n          hbuf[3] = (hold >>> 24) & 0xff;\n          state.check = crc32(state.check, hbuf, 4, 0);\n          //===\n        }\n        //=== INITBITS();\n        hold = 0;\n        bits = 0;\n        //===//\n        state.mode = OS;\n        /* falls through */\n      case OS:\n        //=== NEEDBITS(16); */\n        while (bits < 16) {\n          if (have === 0) {\n            break inf_leave;\n          }\n          have--;\n          hold += input[next++] << bits;\n          bits += 8;\n        }\n        //===//\n        if (state.head) {\n          state.head.xflags = (hold & 0xff);\n          state.head.os = (hold >> 8);\n        }\n        if (state.flags & 0x0200) {\n          //=== CRC2(state.check, hold);\n          hbuf[0] = hold & 0xff;\n          hbuf[1] = (hold >>> 8) & 0xff;\n          state.check = crc32(state.check, hbuf, 2, 0);\n          //===//\n        }\n        //=== INITBITS();\n        hold = 0;\n        bits = 0;\n        //===//\n        state.mode = EXLEN;\n        /* falls through */\n      case EXLEN:\n        if (state.flags & 0x0400) {\n          //=== NEEDBITS(16); */\n          while (bits < 16) {\n            if (have === 0) {\n              break inf_leave;\n            }\n            have--;\n            hold += input[next++] << bits;\n            bits += 8;\n          }\n          //===//\n          state.length = hold;\n          if (state.head) {\n            state.head.extra_len = hold;\n          }\n          if (state.flags & 0x0200) {\n            //=== CRC2(state.check, hold);\n            hbuf[0] = hold & 0xff;\n            hbuf[1] = (hold >>> 8) & 0xff;\n            state.check = crc32(state.check, hbuf, 2, 0);\n            //===//\n          }\n          //=== INITBITS();\n          hold = 0;\n          bits = 0;\n          //===//\n        } else if (state.head) {\n          state.head.extra = null /*Z_NULL*/ ;\n        }\n        state.mode = EXTRA;\n        /* falls through */\n      case EXTRA:\n        if (state.flags & 0x0400) {\n          copy = state.length;\n          if (copy > have) {\n            copy = have;\n          }\n          if (copy) {\n            if (state.head) {\n              len = state.head.extra_len - state.length;\n              if (!state.head.extra) {\n                // Use untyped array for more conveniend processing later\n                state.head.extra = new Array(state.head.extra_len);\n              }\n              arraySet(\n                state.head.extra,\n                input,\n                next,\n                // extra field is limited to 65536 bytes\n                // - no need for additional size check\n                copy,\n                /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/\n                len\n              );\n              //zmemcpy(state.head.extra + len, next,\n              //        len + copy > state.head.extra_max ?\n              //        state.head.extra_max - len : copy);\n            }\n            if (state.flags & 0x0200) {\n              state.check = crc32(state.check, input, copy, next);\n            }\n            have -= copy;\n            next += copy;\n            state.length -= copy;\n          }\n          if (state.length) {\n            break inf_leave;\n          }\n        }\n        state.length = 0;\n        state.mode = NAME;\n        /* falls through */\n      case NAME:\n        if (state.flags & 0x0800) {\n          if (have === 0) {\n            break inf_leave;\n          }\n          copy = 0;\n          do {\n            // TODO: 2 or 1 bytes?\n            len = input[next + copy++];\n            /* use constant limit because in js we should not preallocate memory */\n            if (state.head && len &&\n              (state.length < 65536 /*state.head.name_max*/ )) {\n              state.head.name += String.fromCharCode(len);\n            }\n          } while (len && copy < have);\n\n          if (state.flags & 0x0200) {\n            state.check = crc32(state.check, input, copy, next);\n          }\n          have -= copy;\n          next += copy;\n          if (len) {\n            break inf_leave;\n          }\n        } else if (state.head) {\n          state.head.name = null;\n        }\n        state.length = 0;\n        state.mode = COMMENT;\n        /* falls through */\n      case COMMENT:\n        if (state.flags & 0x1000) {\n          if (have === 0) {\n            break inf_leave;\n          }\n          copy = 0;\n          do {\n            len = input[next + copy++];\n            /* use constant limit because in js we should not preallocate memory */\n            if (state.head && len &&\n              (state.length < 65536 /*state.head.comm_max*/ )) {\n              state.head.comment += String.fromCharCode(len);\n            }\n          } while (len && copy < have);\n          if (state.flags & 0x0200) {\n            state.check = crc32(state.check, input, copy, next);\n          }\n          have -= copy;\n          next += copy;\n          if (len) {\n            break inf_leave;\n          }\n        } else if (state.head) {\n          state.head.comment = null;\n        }\n        state.mode = HCRC;\n        /* falls through */\n      case HCRC:\n        if (state.flags & 0x0200) {\n          //=== NEEDBITS(16); */\n          while (bits < 16) {\n            if (have === 0) {\n              break inf_leave;\n            }\n            have--;\n            hold += input[next++] << bits;\n            bits += 8;\n          }\n          //===//\n          if (hold !== (state.check & 0xffff)) {\n            strm.msg = 'header crc mismatch';\n            state.mode = BAD;\n            break;\n          }\n          //=== INITBITS();\n          hold = 0;\n          bits = 0;\n          //===//\n        }\n        if (state.head) {\n          state.head.hcrc = ((state.flags >> 9) & 1);\n          state.head.done = true;\n        }\n        strm.adler = state.check = 0;\n        state.mode = TYPE;\n        break;\n      case DICTID:\n        //=== NEEDBITS(32); */\n        while (bits < 32) {\n          if (have === 0) {\n            break inf_leave;\n          }\n          have--;\n          hold += input[next++] << bits;\n          bits += 8;\n        }\n        //===//\n        strm.adler = state.check = zswap32(hold);\n        //=== INITBITS();\n        hold = 0;\n        bits = 0;\n        //===//\n        state.mode = DICT;\n        /* falls through */\n      case DICT:\n        if (state.havedict === 0) {\n          //--- RESTORE() ---\n          strm.next_out = put;\n          strm.avail_out = left;\n          strm.next_in = next;\n          strm.avail_in = have;\n          state.hold = hold;\n          state.bits = bits;\n          //---\n          return Z_NEED_DICT;\n        }\n        strm.adler = state.check = 1 /*adler32(0L, Z_NULL, 0)*/ ;\n        state.mode = TYPE;\n        /* falls through */\n      case TYPE:\n        if (flush === Z_BLOCK || flush === Z_TREES) {\n          break inf_leave;\n        }\n        /* falls through */\n      case TYPEDO:\n        if (state.last) {\n          //--- BYTEBITS() ---//\n          hold >>>= bits & 7;\n          bits -= bits & 7;\n          //---//\n          state.mode = CHECK;\n          break;\n        }\n        //=== NEEDBITS(3); */\n        while (bits < 3) {\n          if (have === 0) {\n            break inf_leave;\n          }\n          have--;\n          hold += input[next++] << bits;\n          bits += 8;\n        }\n        //===//\n        state.last = (hold & 0x01) /*BITS(1)*/ ;\n        //--- DROPBITS(1) ---//\n        hold >>>= 1;\n        bits -= 1;\n        //---//\n\n        switch ((hold & 0x03) /*BITS(2)*/ ) {\n        case 0:\n          /* stored block */\n          //Tracev((stderr, \"inflate:     stored block%s\\n\",\n          //        state.last ? \" (last)\" : \"\"));\n          state.mode = STORED;\n          break;\n        case 1:\n          /* fixed block */\n          fixedtables(state);\n          //Tracev((stderr, \"inflate:     fixed codes block%s\\n\",\n          //        state.last ? \" (last)\" : \"\"));\n          state.mode = LEN_; /* decode codes */\n          if (flush === Z_TREES) {\n            //--- DROPBITS(2) ---//\n            hold >>>= 2;\n            bits -= 2;\n            //---//\n            break inf_leave;\n          }\n          break;\n        case 2:\n          /* dynamic block */\n          //Tracev((stderr, \"inflate:     dynamic codes block%s\\n\",\n          //        state.last ? \" (last)\" : \"\"));\n          state.mode = TABLE;\n          break;\n        case 3:\n          strm.msg = 'invalid block type';\n          state.mode = BAD;\n        }\n        //--- DROPBITS(2) ---//\n        hold >>>= 2;\n        bits -= 2;\n        //---//\n        break;\n      case STORED:\n        //--- BYTEBITS() ---// /* go to byte boundary */\n        hold >>>= bits & 7;\n        bits -= bits & 7;\n        //---//\n        //=== NEEDBITS(32); */\n        while (bits < 32) {\n          if (have === 0) {\n            break inf_leave;\n          }\n          have--;\n          hold += input[next++] << bits;\n          bits += 8;\n        }\n        //===//\n        if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {\n          strm.msg = 'invalid stored block lengths';\n          state.mode = BAD;\n          break;\n        }\n        state.length = hold & 0xffff;\n        //Tracev((stderr, \"inflate:       stored length %u\\n\",\n        //        state.length));\n        //=== INITBITS();\n        hold = 0;\n        bits = 0;\n        //===//\n        state.mode = COPY_;\n        if (flush === Z_TREES) {\n          break inf_leave;\n        }\n        /* falls through */\n      case COPY_:\n        state.mode = COPY;\n        /* falls through */\n      case COPY:\n        copy = state.length;\n        if (copy) {\n          if (copy > have) {\n            copy = have;\n          }\n          if (copy > left) {\n            copy = left;\n          }\n          if (copy === 0) {\n            break inf_leave;\n          }\n          //--- zmemcpy(put, next, copy); ---\n          arraySet(output, input, next, copy, put);\n          //---//\n          have -= copy;\n          next += copy;\n          left -= copy;\n          put += copy;\n          state.length -= copy;\n          break;\n        }\n        //Tracev((stderr, \"inflate:       stored end\\n\"));\n        state.mode = TYPE;\n        break;\n      case TABLE:\n        //=== NEEDBITS(14); */\n        while (bits < 14) {\n          if (have === 0) {\n            break inf_leave;\n          }\n          have--;\n          hold += input[next++] << bits;\n          bits += 8;\n        }\n        //===//\n        state.nlen = (hold & 0x1f) /*BITS(5)*/ + 257;\n        //--- DROPBITS(5) ---//\n        hold >>>= 5;\n        bits -= 5;\n        //---//\n        state.ndist = (hold & 0x1f) /*BITS(5)*/ + 1;\n        //--- DROPBITS(5) ---//\n        hold >>>= 5;\n        bits -= 5;\n        //---//\n        state.ncode = (hold & 0x0f) /*BITS(4)*/ + 4;\n        //--- DROPBITS(4) ---//\n        hold >>>= 4;\n        bits -= 4;\n        //---//\n        //#ifndef PKZIP_BUG_WORKAROUND\n        if (state.nlen > 286 || state.ndist > 30) {\n          strm.msg = 'too many length or distance symbols';\n          state.mode = BAD;\n          break;\n        }\n        //#endif\n        //Tracev((stderr, \"inflate:       table sizes ok\\n\"));\n        state.have = 0;\n        state.mode = LENLENS;\n        /* falls through */\n      case LENLENS:\n        while (state.have < state.ncode) {\n          //=== NEEDBITS(3);\n          while (bits < 3) {\n            if (have === 0) {\n              break inf_leave;\n            }\n            have--;\n            hold += input[next++] << bits;\n            bits += 8;\n          }\n          //===//\n          state.lens[order[state.have++]] = (hold & 0x07); //BITS(3);\n          //--- DROPBITS(3) ---//\n          hold >>>= 3;\n          bits -= 3;\n          //---//\n        }\n        while (state.have < 19) {\n          state.lens[order[state.have++]] = 0;\n        }\n        // We have separate tables & no pointers. 2 commented lines below not needed.\n        //state.next = state.codes;\n        //state.lencode = state.next;\n        // Switch to use dynamic table\n        state.lencode = state.lendyn;\n        state.lenbits = 7;\n\n        opts = {\n          bits: state.lenbits\n        };\n        ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);\n        state.lenbits = opts.bits;\n\n        if (ret) {\n          strm.msg = 'invalid code lengths set';\n          state.mode = BAD;\n          break;\n        }\n        //Tracev((stderr, \"inflate:       code lengths ok\\n\"));\n        state.have = 0;\n        state.mode = CODELENS;\n        /* falls through */\n      case CODELENS:\n        while (state.have < state.nlen + state.ndist) {\n          for (;;) {\n            here = state.lencode[hold & ((1 << state.lenbits) - 1)]; /*BITS(state.lenbits)*/\n            here_bits = here >>> 24;\n            here_op = (here >>> 16) & 0xff;\n            here_val = here & 0xffff;\n\n            if ((here_bits) <= bits) {\n              break;\n            }\n            //--- PULLBYTE() ---//\n            if (have === 0) {\n              break inf_leave;\n            }\n            have--;\n            hold += input[next++] << bits;\n            bits += 8;\n            //---//\n          }\n          if (here_val < 16) {\n            //--- DROPBITS(here.bits) ---//\n            hold >>>= here_bits;\n            bits -= here_bits;\n            //---//\n            state.lens[state.have++] = here_val;\n          } else {\n            if (here_val === 16) {\n              //=== NEEDBITS(here.bits + 2);\n              n = here_bits + 2;\n              while (bits < n) {\n                if (have === 0) {\n                  break inf_leave;\n                }\n                have--;\n                hold += input[next++] << bits;\n                bits += 8;\n              }\n              //===//\n              //--- DROPBITS(here.bits) ---//\n              hold >>>= here_bits;\n              bits -= here_bits;\n              //---//\n              if (state.have === 0) {\n                strm.msg = 'invalid bit length repeat';\n                state.mode = BAD;\n                break;\n              }\n              len = state.lens[state.have - 1];\n              copy = 3 + (hold & 0x03); //BITS(2);\n              //--- DROPBITS(2) ---//\n              hold >>>= 2;\n              bits -= 2;\n              //---//\n            } else if (here_val === 17) {\n              //=== NEEDBITS(here.bits + 3);\n              n = here_bits + 3;\n              while (bits < n) {\n                if (have === 0) {\n                  break inf_leave;\n                }\n                have--;\n                hold += input[next++] << bits;\n                bits += 8;\n              }\n              //===//\n              //--- DROPBITS(here.bits) ---//\n              hold >>>= here_bits;\n              bits -= here_bits;\n              //---//\n              len = 0;\n              copy = 3 + (hold & 0x07); //BITS(3);\n              //--- DROPBITS(3) ---//\n              hold >>>= 3;\n              bits -= 3;\n              //---//\n            } else {\n              //=== NEEDBITS(here.bits + 7);\n              n = here_bits + 7;\n              while (bits < n) {\n                if (have === 0) {\n                  break inf_leave;\n                }\n                have--;\n                hold += input[next++] << bits;\n                bits += 8;\n              }\n              //===//\n              //--- DROPBITS(here.bits) ---//\n              hold >>>= here_bits;\n              bits -= here_bits;\n              //---//\n              len = 0;\n              copy = 11 + (hold & 0x7f); //BITS(7);\n              //--- DROPBITS(7) ---//\n              hold >>>= 7;\n              bits -= 7;\n              //---//\n            }\n            if (state.have + copy > state.nlen + state.ndist) {\n              strm.msg = 'invalid bit length repeat';\n              state.mode = BAD;\n              break;\n            }\n            while (copy--) {\n              state.lens[state.have++] = len;\n            }\n          }\n        }\n\n        /* handle error breaks in while */\n        if (state.mode === BAD) {\n          break;\n        }\n\n        /* check for end-of-block code (better have one) */\n        if (state.lens[256] === 0) {\n          strm.msg = 'invalid code -- missing end-of-block';\n          state.mode = BAD;\n          break;\n        }\n\n        /* build code tables -- note: do not change the lenbits or distbits\n           values here (9 and 6) without reading the comments in inftrees.h\n           concerning the ENOUGH constants, which depend on those values */\n        state.lenbits = 9;\n\n        opts = {\n          bits: state.lenbits\n        };\n        ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);\n        // We have separate tables & no pointers. 2 commented lines below not needed.\n        // state.next_index = opts.table_index;\n        state.lenbits = opts.bits;\n        // state.lencode = state.next;\n\n        if (ret) {\n          strm.msg = 'invalid literal/lengths set';\n          state.mode = BAD;\n          break;\n        }\n\n        state.distbits = 6;\n        //state.distcode.copy(state.codes);\n        // Switch to use dynamic table\n        state.distcode = state.distdyn;\n        opts = {\n          bits: state.distbits\n        };\n        ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);\n        // We have separate tables & no pointers. 2 commented lines below not needed.\n        // state.next_index = opts.table_index;\n        state.distbits = opts.bits;\n        // state.distcode = state.next;\n\n        if (ret) {\n          strm.msg = 'invalid distances set';\n          state.mode = BAD;\n          break;\n        }\n        //Tracev((stderr, 'inflate:       codes ok\\n'));\n        state.mode = LEN_;\n        if (flush === Z_TREES) {\n          break inf_leave;\n        }\n        /* falls through */\n      case LEN_:\n        state.mode = LEN;\n        /* falls through */\n      case LEN:\n        if (have >= 6 && left >= 258) {\n          //--- RESTORE() ---\n          strm.next_out = put;\n          strm.avail_out = left;\n          strm.next_in = next;\n          strm.avail_in = have;\n          state.hold = hold;\n          state.bits = bits;\n          //---\n          inflate_fast(strm, _out);\n          //--- LOAD() ---\n          put = strm.next_out;\n          output = strm.output;\n          left = strm.avail_out;\n          next = strm.next_in;\n          input = strm.input;\n          have = strm.avail_in;\n          hold = state.hold;\n          bits = state.bits;\n          //---\n\n          if (state.mode === TYPE) {\n            state.back = -1;\n          }\n          break;\n        }\n        state.back = 0;\n        for (;;) {\n          here = state.lencode[hold & ((1 << state.lenbits) - 1)]; /*BITS(state.lenbits)*/\n          here_bits = here >>> 24;\n          here_op = (here >>> 16) & 0xff;\n          here_val = here & 0xffff;\n\n          if (here_bits <= bits) {\n            break;\n          }\n          //--- PULLBYTE() ---//\n          if (have === 0) {\n            break inf_leave;\n          }\n          have--;\n          hold += input[next++] << bits;\n          bits += 8;\n          //---//\n        }\n        if (here_op && (here_op & 0xf0) === 0) {\n          last_bits = here_bits;\n          last_op = here_op;\n          last_val = here_val;\n          for (;;) {\n            here = state.lencode[last_val +\n              ((hold & ((1 << (last_bits + last_op)) - 1)) /*BITS(last.bits + last.op)*/ >> last_bits)];\n            here_bits = here >>> 24;\n            here_op = (here >>> 16) & 0xff;\n            here_val = here & 0xffff;\n\n            if ((last_bits + here_bits) <= bits) {\n              break;\n            }\n            //--- PULLBYTE() ---//\n            if (have === 0) {\n              break inf_leave;\n            }\n            have--;\n            hold += input[next++] << bits;\n            bits += 8;\n            //---//\n          }\n          //--- DROPBITS(last.bits) ---//\n          hold >>>= last_bits;\n          bits -= last_bits;\n          //---//\n          state.back += last_bits;\n        }\n        //--- DROPBITS(here.bits) ---//\n        hold >>>= here_bits;\n        bits -= here_bits;\n        //---//\n        state.back += here_bits;\n        state.length = here_val;\n        if (here_op === 0) {\n          //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?\n          //        \"inflate:         literal '%c'\\n\" :\n          //        \"inflate:         literal 0x%02x\\n\", here.val));\n          state.mode = LIT;\n          break;\n        }\n        if (here_op & 32) {\n          //Tracevv((stderr, \"inflate:         end of block\\n\"));\n          state.back = -1;\n          state.mode = TYPE;\n          break;\n        }\n        if (here_op & 64) {\n          strm.msg = 'invalid literal/length code';\n          state.mode = BAD;\n          break;\n        }\n        state.extra = here_op & 15;\n        state.mode = LENEXT;\n        /* falls through */\n      case LENEXT:\n        if (state.extra) {\n          //=== NEEDBITS(state.extra);\n          n = state.extra;\n          while (bits < n) {\n            if (have === 0) {\n              break inf_leave;\n            }\n            have--;\n            hold += input[next++] << bits;\n            bits += 8;\n          }\n          //===//\n          state.length += hold & ((1 << state.extra) - 1) /*BITS(state.extra)*/ ;\n          //--- DROPBITS(state.extra) ---//\n          hold >>>= state.extra;\n          bits -= state.extra;\n          //---//\n          state.back += state.extra;\n        }\n        //Tracevv((stderr, \"inflate:         length %u\\n\", state.length));\n        state.was = state.length;\n        state.mode = DIST;\n        /* falls through */\n      case DIST:\n        for (;;) {\n          here = state.distcode[hold & ((1 << state.distbits) - 1)]; /*BITS(state.distbits)*/\n          here_bits = here >>> 24;\n          here_op = (here >>> 16) & 0xff;\n          here_val = here & 0xffff;\n\n          if ((here_bits) <= bits) {\n            break;\n          }\n          //--- PULLBYTE() ---//\n          if (have === 0) {\n            break inf_leave;\n          }\n          have--;\n          hold += input[next++] << bits;\n          bits += 8;\n          //---//\n        }\n        if ((here_op & 0xf0) === 0) {\n          last_bits = here_bits;\n          last_op = here_op;\n          last_val = here_val;\n          for (;;) {\n            here = state.distcode[last_val +\n              ((hold & ((1 << (last_bits + last_op)) - 1)) /*BITS(last.bits + last.op)*/ >> last_bits)];\n            here_bits = here >>> 24;\n            here_op = (here >>> 16) & 0xff;\n            here_val = here & 0xffff;\n\n            if ((last_bits + here_bits) <= bits) {\n              break;\n            }\n            //--- PULLBYTE() ---//\n            if (have === 0) {\n              break inf_leave;\n            }\n            have--;\n            hold += input[next++] << bits;\n            bits += 8;\n            //---//\n          }\n          //--- DROPBITS(last.bits) ---//\n          hold >>>= last_bits;\n          bits -= last_bits;\n          //---//\n          state.back += last_bits;\n        }\n        //--- DROPBITS(here.bits) ---//\n        hold >>>= here_bits;\n        bits -= here_bits;\n        //---//\n        state.back += here_bits;\n        if (here_op & 64) {\n          strm.msg = 'invalid distance code';\n          state.mode = BAD;\n          break;\n        }\n        state.offset = here_val;\n        state.extra = (here_op) & 15;\n        state.mode = DISTEXT;\n        /* falls through */\n      case DISTEXT:\n        if (state.extra) {\n          //=== NEEDBITS(state.extra);\n          n = state.extra;\n          while (bits < n) {\n            if (have === 0) {\n              break inf_leave;\n            }\n            have--;\n            hold += input[next++] << bits;\n            bits += 8;\n          }\n          //===//\n          state.offset += hold & ((1 << state.extra) - 1) /*BITS(state.extra)*/ ;\n          //--- DROPBITS(state.extra) ---//\n          hold >>>= state.extra;\n          bits -= state.extra;\n          //---//\n          state.back += state.extra;\n        }\n        //#ifdef INFLATE_STRICT\n        if (state.offset > state.dmax) {\n          strm.msg = 'invalid distance too far back';\n          state.mode = BAD;\n          break;\n        }\n        //#endif\n        //Tracevv((stderr, \"inflate:         distance %u\\n\", state.offset));\n        state.mode = MATCH;\n        /* falls through */\n      case MATCH:\n        if (left === 0) {\n          break inf_leave;\n        }\n        copy = _out - left;\n        if (state.offset > copy) { /* copy from window */\n          copy = state.offset - copy;\n          if (copy > state.whave) {\n            if (state.sane) {\n              strm.msg = 'invalid distance too far back';\n              state.mode = BAD;\n              break;\n            }\n            // (!) This block is disabled in zlib defailts,\n            // don't enable it for binary compatibility\n            //#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR\n            //          Trace((stderr, \"inflate.c too far\\n\"));\n            //          copy -= state.whave;\n            //          if (copy > state.length) { copy = state.length; }\n            //          if (copy > left) { copy = left; }\n            //          left -= copy;\n            //          state.length -= copy;\n            //          do {\n            //            output[put++] = 0;\n            //          } while (--copy);\n            //          if (state.length === 0) { state.mode = LEN; }\n            //          break;\n            //#endif\n          }\n          if (copy > state.wnext) {\n            copy -= state.wnext;\n            from = state.wsize - copy;\n          } else {\n            from = state.wnext - copy;\n          }\n          if (copy > state.length) {\n            copy = state.length;\n          }\n          from_source = state.window;\n        } else { /* copy from output */\n          from_source = output;\n          from = put - state.offset;\n          copy = state.length;\n        }\n        if (copy > left) {\n          copy = left;\n        }\n        left -= copy;\n        state.length -= copy;\n        do {\n          output[put++] = from_source[from++];\n        } while (--copy);\n        if (state.length === 0) {\n          state.mode = LEN;\n        }\n        break;\n      case LIT:\n        if (left === 0) {\n          break inf_leave;\n        }\n        output[put++] = state.length;\n        left--;\n        state.mode = LEN;\n        break;\n      case CHECK:\n        if (state.wrap) {\n          //=== NEEDBITS(32);\n          while (bits < 32) {\n            if (have === 0) {\n              break inf_leave;\n            }\n            have--;\n            // Use '|' insdead of '+' to make sure that result is signed\n            hold |= input[next++] << bits;\n            bits += 8;\n          }\n          //===//\n          _out -= left;\n          strm.total_out += _out;\n          state.total += _out;\n          if (_out) {\n            strm.adler = state.check =\n              /*UPDATE(state.check, put - _out, _out);*/\n              (state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out));\n\n          }\n          _out = left;\n          // NB: crc32 stored as signed 32-bit int, zswap32 returns signed too\n          if ((state.flags ? hold : zswap32(hold)) !== state.check) {\n            strm.msg = 'incorrect data check';\n            state.mode = BAD;\n            break;\n          }\n          //=== INITBITS();\n          hold = 0;\n          bits = 0;\n          //===//\n          //Tracev((stderr, \"inflate:   check matches trailer\\n\"));\n        }\n        state.mode = LENGTH;\n        /* falls through */\n      case LENGTH:\n        if (state.wrap && state.flags) {\n          //=== NEEDBITS(32);\n          while (bits < 32) {\n            if (have === 0) {\n              break inf_leave;\n            }\n            have--;\n            hold += input[next++] << bits;\n            bits += 8;\n          }\n          //===//\n          if (hold !== (state.total & 0xffffffff)) {\n            strm.msg = 'incorrect length check';\n            state.mode = BAD;\n            break;\n          }\n          //=== INITBITS();\n          hold = 0;\n          bits = 0;\n          //===//\n          //Tracev((stderr, \"inflate:   length matches trailer\\n\"));\n        }\n        state.mode = DONE;\n        /* falls through */\n      case DONE:\n        ret = Z_STREAM_END;\n        break inf_leave;\n      case BAD:\n        ret = Z_DATA_ERROR;\n        break inf_leave;\n      case MEM:\n        return Z_MEM_ERROR;\n      case SYNC:\n        /* falls through */\n      default:\n        return Z_STREAM_ERROR;\n      }\n    }\n\n  // inf_leave <- here is real place for \"goto inf_leave\", emulated via \"break inf_leave\"\n\n  /*\n     Return from inflate(), updating the total counts and the check value.\n     If there was no progress during the inflate() call, return a buffer\n     error.  Call updatewindow() to create and/or update the window state.\n     Note: a memory error from inflate() is non-recoverable.\n   */\n\n  //--- RESTORE() ---\n  strm.next_out = put;\n  strm.avail_out = left;\n  strm.next_in = next;\n  strm.avail_in = have;\n  state.hold = hold;\n  state.bits = bits;\n  //---\n\n  if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&\n      (state.mode < CHECK || flush !== Z_FINISH))) {\n    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {\n      state.mode = MEM;\n      return Z_MEM_ERROR;\n    }\n  }\n  _in -= strm.avail_in;\n  _out -= strm.avail_out;\n  strm.total_in += _in;\n  strm.total_out += _out;\n  state.total += _out;\n  if (state.wrap && _out) {\n    strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/\n      (state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out));\n  }\n  strm.data_type = state.bits + (state.last ? 64 : 0) +\n    (state.mode === TYPE ? 128 : 0) +\n    (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);\n  if (((_in === 0 && _out === 0) || flush === Z_FINISH) && ret === Z_OK) {\n    ret = Z_BUF_ERROR;\n  }\n  return ret;\n}\n\nexport function inflateEnd(strm) {\n\n  if (!strm || !strm.state /*|| strm->zfree == (free_func)0*/ ) {\n    return Z_STREAM_ERROR;\n  }\n\n  var state = strm.state;\n  if (state.window) {\n    state.window = null;\n  }\n  strm.state = null;\n  return Z_OK;\n}\n\nexport function inflateGetHeader(strm, head) {\n  var state;\n\n  /* check state */\n  if (!strm || !strm.state) {\n    return Z_STREAM_ERROR;\n  }\n  state = strm.state;\n  if ((state.wrap & 2) === 0) {\n    return Z_STREAM_ERROR;\n  }\n\n  /* save header structure */\n  state.head = head;\n  head.done = false;\n  return Z_OK;\n}\n\nexport function inflateSetDictionary(strm, dictionary) {\n  var dictLength = dictionary.length;\n\n  var state;\n  var dictid;\n  var ret;\n\n  /* check state */\n  if (!strm /* == Z_NULL */ || !strm.state /* == Z_NULL */ ) {\n    return Z_STREAM_ERROR;\n  }\n  state = strm.state;\n\n  if (state.wrap !== 0 && state.mode !== DICT) {\n    return Z_STREAM_ERROR;\n  }\n\n  /* check for correct dictionary identifier */\n  if (state.mode === DICT) {\n    dictid = 1; /* adler32(0, null, 0)*/\n    /* dictid = adler32(dictid, dictionary, dictLength); */\n    dictid = adler32(dictid, dictionary, dictLength, 0);\n    if (dictid !== state.check) {\n      return Z_DATA_ERROR;\n    }\n  }\n  /* copy dictionary to window using updatewindow(), which will amend the\n   existing dictionary if appropriate */\n  ret = updatewindow(strm, dictionary, dictLength, dictLength);\n  if (ret) {\n    state.mode = MEM;\n    return Z_MEM_ERROR;\n  }\n  state.havedict = 1;\n  // Tracev((stderr, \"inflate:   dictionary set\\n\"));\n  return Z_OK;\n}\n\nexport var inflateInfo = 'pako inflate (from Nodeca project)';\n\n/* Not implemented\nexports.inflateCopy = inflateCopy;\nexports.inflateGetDictionary = inflateGetDictionary;\nexports.inflateMark = inflateMark;\nexports.inflatePrime = inflatePrime;\nexports.inflateSync = inflateSync;\nexports.inflateSyncPoint = inflateSyncPoint;\nexports.inflateUndermine = inflateUndermine;\n*/\n","__zlib-lib/inftrees.js":"import {Buf16} from './utils';\nvar MAXBITS = 15;\nvar ENOUGH_LENS = 852;\nvar ENOUGH_DISTS = 592;\n//var ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);\n\nvar CODES = 0;\nvar LENS = 1;\nvar DISTS = 2;\n\nvar lbase = [ /* Length codes 257..285 base */\n  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,\n  35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0\n];\n\nvar lext = [ /* Length codes 257..285 extra */\n  16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,\n  19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78\n];\n\nvar dbase = [ /* Distance codes 0..29 base */\n  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,\n  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,\n  8193, 12289, 16385, 24577, 0, 0\n];\n\nvar dext = [ /* Distance codes 0..29 extra */\n  16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,\n  23, 23, 24, 24, 25, 25, 26, 26, 27, 27,\n  28, 28, 29, 29, 64, 64\n];\n\nexport default function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts) {\n  var bits = opts.bits;\n  //here = opts.here; /* table entry for duplication */\n\n  var len = 0; /* a code's length in bits */\n  var sym = 0; /* index of code symbols */\n  var min = 0,\n    max = 0; /* minimum and maximum code lengths */\n  var root = 0; /* number of index bits for root table */\n  var curr = 0; /* number of index bits for current table */\n  var drop = 0; /* code bits to drop for sub-table */\n  var left = 0; /* number of prefix codes available */\n  var used = 0; /* code entries in table used */\n  var huff = 0; /* Huffman code */\n  var incr; /* for incrementing code, index */\n  var fill; /* index for replicating entries */\n  var low; /* low bits for current root entry */\n  var mask; /* mask for low root bits */\n  var next; /* next available space in table */\n  var base = null; /* base value table to use */\n  var base_index = 0;\n  //  var shoextra;    /* extra bits table to use */\n  var end; /* use base and extra for symbol > end */\n  var count = new Buf16(MAXBITS + 1); //[MAXBITS+1];    /* number of codes of each length */\n  var offs = new Buf16(MAXBITS + 1); //[MAXBITS+1];     /* offsets in table for each length */\n  var extra = null;\n  var extra_index = 0;\n\n  var here_bits, here_op, here_val;\n\n  /*\n   Process a set of code lengths to create a canonical Huffman code.  The\n   code lengths are lens[0..codes-1].  Each length corresponds to the\n   symbols 0..codes-1.  The Huffman code is generated by first sorting the\n   symbols by length from short to long, and retaining the symbol order\n   for codes with equal lengths.  Then the code starts with all zero bits\n   for the first code of the shortest length, and the codes are integer\n   increments for the same length, and zeros are appended as the length\n   increases.  For the deflate format, these bits are stored backwards\n   from their more natural integer increment ordering, and so when the\n   decoding tables are built in the large loop below, the integer codes\n   are incremented backwards.\n\n   This routine assumes, but does not check, that all of the entries in\n   lens[] are in the range 0..MAXBITS.  The caller must assure this.\n   1..MAXBITS is interpreted as that code length.  zero means that that\n   symbol does not occur in this code.\n\n   The codes are sorted by computing a count of codes for each length,\n   creating from that a table of starting indices for each length in the\n   sorted table, and then entering the symbols in order in the sorted\n   table.  The sorted table is work[], with that space being provided by\n   the caller.\n\n   The length counts are used for other purposes as well, i.e. finding\n   the minimum and maximum length codes, determining if there are any\n   codes at all, checking for a valid set of lengths, and looking ahead\n   at length counts to determine sub-table sizes when building the\n   decoding tables.\n   */\n\n  /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */\n  for (len = 0; len <= MAXBITS; len++) {\n    count[len] = 0;\n  }\n  for (sym = 0; sym < codes; sym++) {\n    count[lens[lens_index + sym]]++;\n  }\n\n  /* bound code lengths, force root to be within code lengths */\n  root = bits;\n  for (max = MAXBITS; max >= 1; max--) {\n    if (count[max] !== 0) {\n      break;\n    }\n  }\n  if (root > max) {\n    root = max;\n  }\n  if (max === 0) { /* no symbols to code at all */\n    //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */\n    //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;\n    //table.val[opts.table_index++] = 0;   //here.val = (var short)0;\n    table[table_index++] = (1 << 24) | (64 << 16) | 0;\n\n\n    //table.op[opts.table_index] = 64;\n    //table.bits[opts.table_index] = 1;\n    //table.val[opts.table_index++] = 0;\n    table[table_index++] = (1 << 24) | (64 << 16) | 0;\n\n    opts.bits = 1;\n    return 0; /* no symbols, but wait for decoding to report error */\n  }\n  for (min = 1; min < max; min++) {\n    if (count[min] !== 0) {\n      break;\n    }\n  }\n  if (root < min) {\n    root = min;\n  }\n\n  /* check for an over-subscribed or incomplete set of lengths */\n  left = 1;\n  for (len = 1; len <= MAXBITS; len++) {\n    left <<= 1;\n    left -= count[len];\n    if (left < 0) {\n      return -1;\n    } /* over-subscribed */\n  }\n  if (left > 0 && (type === CODES || max !== 1)) {\n    return -1; /* incomplete set */\n  }\n\n  /* generate offsets into symbol table for each length for sorting */\n  offs[1] = 0;\n  for (len = 1; len < MAXBITS; len++) {\n    offs[len + 1] = offs[len] + count[len];\n  }\n\n  /* sort symbols by length, by symbol order within each length */\n  for (sym = 0; sym < codes; sym++) {\n    if (lens[lens_index + sym] !== 0) {\n      work[offs[lens[lens_index + sym]]++] = sym;\n    }\n  }\n\n  /*\n   Create and fill in decoding tables.  In this loop, the table being\n   filled is at next and has curr index bits.  The code being used is huff\n   with length len.  That code is converted to an index by dropping drop\n   bits off of the bottom.  For codes where len is less than drop + curr,\n   those top drop + curr - len bits are incremented through all values to\n   fill the table with replicated entries.\n\n   root is the number of index bits for the root table.  When len exceeds\n   root, sub-tables are created pointed to by the root entry with an index\n   of the low root bits of huff.  This is saved in low to check for when a\n   new sub-table should be started.  drop is zero when the root table is\n   being filled, and drop is root when sub-tables are being filled.\n\n   When a new sub-table is needed, it is necessary to look ahead in the\n   code lengths to determine what size sub-table is needed.  The length\n   counts are used for this, and so count[] is decremented as codes are\n   entered in the tables.\n\n   used keeps track of how many table entries have been allocated from the\n   provided *table space.  It is checked for LENS and DIST tables against\n   the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in\n   the initial root table size constants.  See the comments in inftrees.h\n   for more information.\n\n   sym increments through all symbols, and the loop terminates when\n   all codes of length max, i.e. all codes, have been processed.  This\n   routine permits incomplete codes, so another loop after this one fills\n   in the rest of the decoding tables with invalid code markers.\n   */\n\n  /* set up for code type */\n  // poor man optimization - use if-else instead of switch,\n  // to avoid deopts in old v8\n  if (type === CODES) {\n    base = extra = work; /* dummy value--not used */\n    end = 19;\n\n  } else if (type === LENS) {\n    base = lbase;\n    base_index -= 257;\n    extra = lext;\n    extra_index -= 257;\n    end = 256;\n\n  } else { /* DISTS */\n    base = dbase;\n    extra = dext;\n    end = -1;\n  }\n\n  /* initialize opts for loop */\n  huff = 0; /* starting code */\n  sym = 0; /* starting code symbol */\n  len = min; /* starting code length */\n  next = table_index; /* current table to fill in */\n  curr = root; /* current table index bits */\n  drop = 0; /* current bits to drop from code for index */\n  low = -1; /* trigger new sub-table when len > root */\n  used = 1 << root; /* use root table entries */\n  mask = used - 1; /* mask for comparing low */\n\n  /* check available table space */\n  if ((type === LENS && used > ENOUGH_LENS) ||\n    (type === DISTS && used > ENOUGH_DISTS)) {\n    return 1;\n  }\n\n  var i = 0;\n  /* process all codes and make table entries */\n  for (;;) {\n    i++;\n    /* create table entry */\n    here_bits = len - drop;\n    if (work[sym] < end) {\n      here_op = 0;\n      here_val = work[sym];\n    } else if (work[sym] > end) {\n      here_op = extra[extra_index + work[sym]];\n      here_val = base[base_index + work[sym]];\n    } else {\n      here_op = 32 + 64; /* end of block */\n      here_val = 0;\n    }\n\n    /* replicate for those indices with low len bits equal to huff */\n    incr = 1 << (len - drop);\n    fill = 1 << curr;\n    min = fill; /* save offset to next table */\n    do {\n      fill -= incr;\n      table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val | 0;\n    } while (fill !== 0);\n\n    /* backwards increment the len-bit code huff */\n    incr = 1 << (len - 1);\n    while (huff & incr) {\n      incr >>= 1;\n    }\n    if (incr !== 0) {\n      huff &= incr - 1;\n      huff += incr;\n    } else {\n      huff = 0;\n    }\n\n    /* go to next symbol, update count, len */\n    sym++;\n    if (--count[len] === 0) {\n      if (len === max) {\n        break;\n      }\n      len = lens[lens_index + work[sym]];\n    }\n\n    /* create new sub-table if needed */\n    if (len > root && (huff & mask) !== low) {\n      /* if first time, transition to sub-tables */\n      if (drop === 0) {\n        drop = root;\n      }\n\n      /* increment past last table */\n      next += min; /* here min is 1 << curr */\n\n      /* determine length of next table */\n      curr = len - drop;\n      left = 1 << curr;\n      while (curr + drop < max) {\n        left -= count[curr + drop];\n        if (left <= 0) {\n          break;\n        }\n        curr++;\n        left <<= 1;\n      }\n\n      /* check for enough space */\n      used += 1 << curr;\n      if ((type === LENS && used > ENOUGH_LENS) ||\n        (type === DISTS && used > ENOUGH_DISTS)) {\n        return 1;\n      }\n\n      /* point entry in root table to sub-table */\n      low = huff & mask;\n      /*table.op[low] = curr;\n      table.bits[low] = root;\n      table.val[low] = next - opts.table_index;*/\n      table[low] = (root << 24) | (curr << 16) | (next - table_index) | 0;\n    }\n  }\n\n  /* fill in remaining table entry if code is incomplete (guaranteed to have\n   at most one remaining entry, since if the code is incomplete, the\n   maximum code length that was allowed to get this far is one bit) */\n  if (huff !== 0) {\n    //table.op[next + huff] = 64;            /* invalid code marker */\n    //table.bits[next + huff] = len - drop;\n    //table.val[next + huff] = 0;\n    table[next + huff] = ((len - drop) << 24) | (64 << 16) | 0;\n  }\n\n  /* set return parameters */\n  //opts.table_index += used;\n  opts.bits = root;\n  return 0;\n};\n","__zlib-lib/LICENSE":"(The MIT License)\n\nCopyright (C) 2014-2016 by Vitaly Puzrin\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in\nall copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\nTHE SOFTWARE.\n","__zlib-lib/messages.js":"export default {\n  2:      'need dictionary',     /* Z_NEED_DICT       2  */\n  1:      'stream end',          /* Z_STREAM_END      1  */\n  0:      '',                    /* Z_OK              0  */\n  '-1':   'file error',          /* Z_ERRNO         (-1) */\n  '-2':   'stream error',        /* Z_STREAM_ERROR  (-2) */\n  '-3':   'data error',          /* Z_DATA_ERROR    (-3) */\n  '-4':   'insufficient memory', /* Z_MEM_ERROR     (-4) */\n  '-5':   'buffer error',        /* Z_BUF_ERROR     (-5) */\n  '-6':   'incompatible version' /* Z_VERSION_ERROR (-6) */\n};\n","__zlib-lib/trees.js":"'use strict';\n\nimport {arraySet} from './utils';\n\n/* Public constants ==========================================================*/\n/* ===========================================================================*/\n\n\n//var Z_FILTERED          = 1;\n//var Z_HUFFMAN_ONLY      = 2;\n//var Z_RLE               = 3;\nvar Z_FIXED = 4;\n//var Z_DEFAULT_STRATEGY  = 0;\n\n/* Possible values of the data_type field (though see inflate()) */\nvar Z_BINARY = 0;\nvar Z_TEXT = 1;\n//var Z_ASCII             = 1; // = Z_TEXT\nvar Z_UNKNOWN = 2;\n\n/*============================================================================*/\n\n\nfunction zero(buf) {\n  var len = buf.length;\n  while (--len >= 0) {\n    buf[len] = 0;\n  }\n}\n\n// From zutil.h\n\nvar STORED_BLOCK = 0;\nvar STATIC_TREES = 1;\nvar DYN_TREES = 2;\n/* The three kinds of block type */\n\nvar MIN_MATCH = 3;\nvar MAX_MATCH = 258;\n/* The minimum and maximum match lengths */\n\n// From deflate.h\n/* ===========================================================================\n * Internal compression state.\n */\n\nvar LENGTH_CODES = 29;\n/* number of length codes, not counting the special END_BLOCK code */\n\nvar LITERALS = 256;\n/* number of literal bytes 0..255 */\n\nvar L_CODES = LITERALS + 1 + LENGTH_CODES;\n/* number of Literal or Length codes, including the END_BLOCK code */\n\nvar D_CODES = 30;\n/* number of distance codes */\n\nvar BL_CODES = 19;\n/* number of codes used to transfer the bit lengths */\n\nvar HEAP_SIZE = 2 * L_CODES + 1;\n/* maximum heap size */\n\nvar MAX_BITS = 15;\n/* All codes must not exceed MAX_BITS bits */\n\nvar Buf_size = 16;\n/* size of bit buffer in bi_buf */\n\n\n/* ===========================================================================\n * Constants\n */\n\nvar MAX_BL_BITS = 7;\n/* Bit length codes must not exceed MAX_BL_BITS bits */\n\nvar END_BLOCK = 256;\n/* end of block literal code */\n\nvar REP_3_6 = 16;\n/* repeat previous bit length 3-6 times (2 bits of repeat count) */\n\nvar REPZ_3_10 = 17;\n/* repeat a zero length 3-10 times  (3 bits of repeat count) */\n\nvar REPZ_11_138 = 18;\n/* repeat a zero length 11-138 times  (7 bits of repeat count) */\n\n/* eslint-disable comma-spacing,array-bracket-spacing */\nvar extra_lbits = /* extra bits for each length code */ [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];\n\nvar extra_dbits = /* extra bits for each distance code */ [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];\n\nvar extra_blbits = /* extra bits for each bit length code */ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7];\n\nvar bl_order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];\n/* eslint-enable comma-spacing,array-bracket-spacing */\n\n/* The lengths of the bit length codes are sent in order of decreasing\n * probability, to avoid transmitting the lengths for unused bit length codes.\n */\n\n/* ===========================================================================\n * Local data. These are initialized only once.\n */\n\n// We pre-fill arrays with 0 to avoid uninitialized gaps\n\nvar DIST_CODE_LEN = 512; /* see definition of array dist_code below */\n\n// !!!! Use flat array insdead of structure, Freq = i*2, Len = i*2+1\nvar static_ltree = new Array((L_CODES + 2) * 2);\nzero(static_ltree);\n/* The static literal tree. Since the bit lengths are imposed, there is no\n * need for the L_CODES extra codes used during heap construction. However\n * The codes 286 and 287 are needed to build a canonical tree (see _tr_init\n * below).\n */\n\nvar static_dtree = new Array(D_CODES * 2);\nzero(static_dtree);\n/* The static distance tree. (Actually a trivial tree since all codes use\n * 5 bits.)\n */\n\nvar _dist_code = new Array(DIST_CODE_LEN);\nzero(_dist_code);\n/* Distance codes. The first 256 values correspond to the distances\n * 3 .. 258, the last 256 values correspond to the top 8 bits of\n * the 15 bit distances.\n */\n\nvar _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);\nzero(_length_code);\n/* length code for each normalized match length (0 == MIN_MATCH) */\n\nvar base_length = new Array(LENGTH_CODES);\nzero(base_length);\n/* First normalized length for each code (0 = MIN_MATCH) */\n\nvar base_dist = new Array(D_CODES);\nzero(base_dist);\n/* First normalized distance for each code (0 = distance of 1) */\n\n\nfunction StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {\n\n  this.static_tree = static_tree; /* static tree or NULL */\n  this.extra_bits = extra_bits; /* extra bits for each code or NULL */\n  this.extra_base = extra_base; /* base index for extra_bits */\n  this.elems = elems; /* max number of elements in the tree */\n  this.max_length = max_length; /* max bit length for the codes */\n\n  // show if `static_tree` has data or dummy - needed for monomorphic objects\n  this.has_stree = static_tree && static_tree.length;\n}\n\n\nvar static_l_desc;\nvar static_d_desc;\nvar static_bl_desc;\n\n\nfunction TreeDesc(dyn_tree, stat_desc) {\n  this.dyn_tree = dyn_tree; /* the dynamic tree */\n  this.max_code = 0; /* largest code with non zero frequency */\n  this.stat_desc = stat_desc; /* the corresponding static tree */\n}\n\n\n\nfunction d_code(dist) {\n  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];\n}\n\n\n/* ===========================================================================\n * Output a short LSB first on the stream.\n * IN assertion: there is enough room in pendingBuf.\n */\nfunction put_short(s, w) {\n  //    put_byte(s, (uch)((w) & 0xff));\n  //    put_byte(s, (uch)((ush)(w) >> 8));\n  s.pending_buf[s.pending++] = (w) & 0xff;\n  s.pending_buf[s.pending++] = (w >>> 8) & 0xff;\n}\n\n\n/* ===========================================================================\n * Send a value on a given number of bits.\n * IN assertion: length <= 16 and value fits in length bits.\n */\nfunction send_bits(s, value, length) {\n  if (s.bi_valid > (Buf_size - length)) {\n    s.bi_buf |= (value << s.bi_valid) & 0xffff;\n    put_short(s, s.bi_buf);\n    s.bi_buf = value >> (Buf_size - s.bi_valid);\n    s.bi_valid += length - Buf_size;\n  } else {\n    s.bi_buf |= (value << s.bi_valid) & 0xffff;\n    s.bi_valid += length;\n  }\n}\n\n\nfunction send_code(s, c, tree) {\n  send_bits(s, tree[c * 2] /*.Code*/ , tree[c * 2 + 1] /*.Len*/ );\n}\n\n\n/* ===========================================================================\n * Reverse the first len bits of a code, using straightforward code (a faster\n * method would use a table)\n * IN assertion: 1 <= len <= 15\n */\nfunction bi_reverse(code, len) {\n  var res = 0;\n  do {\n    res |= code & 1;\n    code >>>= 1;\n    res <<= 1;\n  } while (--len > 0);\n  return res >>> 1;\n}\n\n\n/* ===========================================================================\n * Flush the bit buffer, keeping at most 7 bits in it.\n */\nfunction bi_flush(s) {\n  if (s.bi_valid === 16) {\n    put_short(s, s.bi_buf);\n    s.bi_buf = 0;\n    s.bi_valid = 0;\n\n  } else if (s.bi_valid >= 8) {\n    s.pending_buf[s.pending++] = s.bi_buf & 0xff;\n    s.bi_buf >>= 8;\n    s.bi_valid -= 8;\n  }\n}\n\n\n/* ===========================================================================\n * Compute the optimal bit lengths for a tree and update the total bit length\n * for the current block.\n * IN assertion: the fields freq and dad are set, heap[heap_max] and\n *    above are the tree nodes sorted by increasing frequency.\n * OUT assertions: the field len is set to the optimal bit length, the\n *     array bl_count contains the frequencies for each bit length.\n *     The length opt_len is updated; static_len is also updated if stree is\n *     not null.\n */\nfunction gen_bitlen(s, desc) {\n//    deflate_state *s;\n//    tree_desc *desc;    /* the tree descriptor */\n  var tree = desc.dyn_tree;\n  var max_code = desc.max_code;\n  var stree = desc.stat_desc.static_tree;\n  var has_stree = desc.stat_desc.has_stree;\n  var extra = desc.stat_desc.extra_bits;\n  var base = desc.stat_desc.extra_base;\n  var max_length = desc.stat_desc.max_length;\n  var h; /* heap index */\n  var n, m; /* iterate over the tree elements */\n  var bits; /* bit length */\n  var xbits; /* extra bits */\n  var f; /* frequency */\n  var overflow = 0; /* number of elements with bit length too large */\n\n  for (bits = 0; bits <= MAX_BITS; bits++) {\n    s.bl_count[bits] = 0;\n  }\n\n  /* In a first pass, compute the optimal bit lengths (which may\n   * overflow in the case of the bit length tree).\n   */\n  tree[s.heap[s.heap_max] * 2 + 1] /*.Len*/ = 0; /* root of the heap */\n\n  for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {\n    n = s.heap[h];\n    bits = tree[tree[n * 2 + 1] /*.Dad*/ * 2 + 1] /*.Len*/ + 1;\n    if (bits > max_length) {\n      bits = max_length;\n      overflow++;\n    }\n    tree[n * 2 + 1] /*.Len*/ = bits;\n    /* We overwrite tree[n].Dad which is no longer needed */\n\n    if (n > max_code) {\n      continue;\n    } /* not a leaf node */\n\n    s.bl_count[bits]++;\n    xbits = 0;\n    if (n >= base) {\n      xbits = extra[n - base];\n    }\n    f = tree[n * 2] /*.Freq*/ ;\n    s.opt_len += f * (bits + xbits);\n    if (has_stree) {\n      s.static_len += f * (stree[n * 2 + 1] /*.Len*/ + xbits);\n    }\n  }\n  if (overflow === 0) {\n    return;\n  }\n\n  // Trace((stderr,\"\\nbit length overflow\\n\"));\n  /* This happens for example on obj2 and pic of the Calgary corpus */\n\n  /* Find the first bit length which could increase: */\n  do {\n    bits = max_length - 1;\n    while (s.bl_count[bits] === 0) {\n      bits--;\n    }\n    s.bl_count[bits]--; /* move one leaf down the tree */\n    s.bl_count[bits + 1] += 2; /* move one overflow item as its brother */\n    s.bl_count[max_length]--;\n    /* The brother of the overflow item also moves one step up,\n     * but this does not affect bl_count[max_length]\n     */\n    overflow -= 2;\n  } while (overflow > 0);\n\n  /* Now recompute all bit lengths, scanning in increasing frequency.\n   * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all\n   * lengths instead of fixing only the wrong ones. This idea is taken\n   * from 'ar' written by Haruhiko Okumura.)\n   */\n  for (bits = max_length; bits !== 0; bits--) {\n    n = s.bl_count[bits];\n    while (n !== 0) {\n      m = s.heap[--h];\n      if (m > max_code) {\n        continue;\n      }\n      if (tree[m * 2 + 1] /*.Len*/ !== bits) {\n        // Trace((stderr,\"code %d bits %d->%d\\n\", m, tree[m].Len, bits));\n        s.opt_len += (bits - tree[m * 2 + 1] /*.Len*/ ) * tree[m * 2] /*.Freq*/ ;\n        tree[m * 2 + 1] /*.Len*/ = bits;\n      }\n      n--;\n    }\n  }\n}\n\n\n/* ===========================================================================\n * Generate the codes for a given tree and bit counts (which need not be\n * optimal).\n * IN assertion: the array bl_count contains the bit length statistics for\n * the given tree and the field len is set for all tree elements.\n * OUT assertion: the field code is set for all tree elements of non\n *     zero code length.\n */\nfunction gen_codes(tree, max_code, bl_count) {\n//    ct_data *tree;             /* the tree to decorate */\n//    int max_code;              /* largest code with non zero frequency */\n//    ushf *bl_count;            /* number of codes at each bit length */\n\n  var next_code = new Array(MAX_BITS + 1); /* next code value for each bit length */\n  var code = 0; /* running code value */\n  var bits; /* bit index */\n  var n; /* code index */\n\n  /* The distribution counts are first used to generate the code values\n   * without bit reversal.\n   */\n  for (bits = 1; bits <= MAX_BITS; bits++) {\n    next_code[bits] = code = (code + bl_count[bits - 1]) << 1;\n  }\n  /* Check that the bit counts in bl_count are consistent. The last code\n   * must be all ones.\n   */\n  //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,\n  //        \"inconsistent bit counts\");\n  //Tracev((stderr,\"\\ngen_codes: max_code %d \", max_code));\n\n  for (n = 0; n <= max_code; n++) {\n    var len = tree[n * 2 + 1] /*.Len*/ ;\n    if (len === 0) {\n      continue;\n    }\n    /* Now reverse the bits */\n    tree[n * 2] /*.Code*/ = bi_reverse(next_code[len]++, len);\n\n    //Tracecv(tree != static_ltree, (stderr,\"\\nn %3d %c l %2d c %4x (%x) \",\n    //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));\n  }\n}\n\n\n/* ===========================================================================\n * Initialize the various 'constant' tables.\n */\nfunction tr_static_init() {\n  var n; /* iterates over tree elements */\n  var bits; /* bit counter */\n  var length; /* length value */\n  var code; /* code value */\n  var dist; /* distance index */\n  var bl_count = new Array(MAX_BITS + 1);\n  /* number of codes at each bit length for an optimal tree */\n\n  // do check in _tr_init()\n  //if (static_init_done) return;\n\n  /* For some embedded targets, global variables are not initialized: */\n  /*#ifdef NO_INIT_GLOBAL_POINTERS\n    static_l_desc.static_tree = static_ltree;\n    static_l_desc.extra_bits = extra_lbits;\n    static_d_desc.static_tree = static_dtree;\n    static_d_desc.extra_bits = extra_dbits;\n    static_bl_desc.extra_bits = extra_blbits;\n  #endif*/\n\n  /* Initialize the mapping length (0..255) -> length code (0..28) */\n  length = 0;\n  for (code = 0; code < LENGTH_CODES - 1; code++) {\n    base_length[code] = length;\n    for (n = 0; n < (1 << extra_lbits[code]); n++) {\n      _length_code[length++] = code;\n    }\n  }\n  //Assert (length == 256, \"tr_static_init: length != 256\");\n  /* Note that the length 255 (match length 258) can be represented\n   * in two different ways: code 284 + 5 bits or code 285, so we\n   * overwrite length_code[255] to use the best encoding:\n   */\n  _length_code[length - 1] = code;\n\n  /* Initialize the mapping dist (0..32K) -> dist code (0..29) */\n  dist = 0;\n  for (code = 0; code < 16; code++) {\n    base_dist[code] = dist;\n    for (n = 0; n < (1 << extra_dbits[code]); n++) {\n      _dist_code[dist++] = code;\n    }\n  }\n  //Assert (dist == 256, \"tr_static_init: dist != 256\");\n  dist >>= 7; /* from now on, all distances are divided by 128 */\n  for (; code < D_CODES; code++) {\n    base_dist[code] = dist << 7;\n    for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {\n      _dist_code[256 + dist++] = code;\n    }\n  }\n  //Assert (dist == 256, \"tr_static_init: 256+dist != 512\");\n\n  /* Construct the codes of the static literal tree */\n  for (bits = 0; bits <= MAX_BITS; bits++) {\n    bl_count[bits] = 0;\n  }\n\n  n = 0;\n  while (n <= 143) {\n    static_ltree[n * 2 + 1] /*.Len*/ = 8;\n    n++;\n    bl_count[8]++;\n  }\n  while (n <= 255) {\n    static_ltree[n * 2 + 1] /*.Len*/ = 9;\n    n++;\n    bl_count[9]++;\n  }\n  while (n <= 279) {\n    static_ltree[n * 2 + 1] /*.Len*/ = 7;\n    n++;\n    bl_count[7]++;\n  }\n  while (n <= 287) {\n    static_ltree[n * 2 + 1] /*.Len*/ = 8;\n    n++;\n    bl_count[8]++;\n  }\n  /* Codes 286 and 287 do not exist, but we must include them in the\n   * tree construction to get a canonical Huffman tree (longest code\n   * all ones)\n   */\n  gen_codes(static_ltree, L_CODES + 1, bl_count);\n\n  /* The static distance tree is trivial: */\n  for (n = 0; n < D_CODES; n++) {\n    static_dtree[n * 2 + 1] /*.Len*/ = 5;\n    static_dtree[n * 2] /*.Code*/ = bi_reverse(n, 5);\n  }\n\n  // Now data ready and we can init static trees\n  static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);\n  static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES, MAX_BITS);\n  static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES, MAX_BL_BITS);\n\n  //static_init_done = true;\n}\n\n\n/* ===========================================================================\n * Initialize a new block.\n */\nfunction init_block(s) {\n  var n; /* iterates over tree elements */\n\n  /* Initialize the trees. */\n  for (n = 0; n < L_CODES; n++) {\n    s.dyn_ltree[n * 2] /*.Freq*/ = 0;\n  }\n  for (n = 0; n < D_CODES; n++) {\n    s.dyn_dtree[n * 2] /*.Freq*/ = 0;\n  }\n  for (n = 0; n < BL_CODES; n++) {\n    s.bl_tree[n * 2] /*.Freq*/ = 0;\n  }\n\n  s.dyn_ltree[END_BLOCK * 2] /*.Freq*/ = 1;\n  s.opt_len = s.static_len = 0;\n  s.last_lit = s.matches = 0;\n}\n\n\n/* ===========================================================================\n * Flush the bit buffer and align the output on a byte boundary\n */\nfunction bi_windup(s) {\n  if (s.bi_valid > 8) {\n    put_short(s, s.bi_buf);\n  } else if (s.bi_valid > 0) {\n    //put_byte(s, (Byte)s->bi_buf);\n    s.pending_buf[s.pending++] = s.bi_buf;\n  }\n  s.bi_buf = 0;\n  s.bi_valid = 0;\n}\n\n/* ===========================================================================\n * Copy a stored block, storing first the length and its\n * one's complement if requested.\n */\nfunction copy_block(s, buf, len, header) {\n//DeflateState *s;\n//charf    *buf;    /* the input data */\n//unsigned len;     /* its length */\n//int      header;  /* true if block header must be written */\n\n  bi_windup(s); /* align on byte boundary */\n\n  if (header) {\n    put_short(s, len);\n    put_short(s, ~len);\n  }\n  //  while (len--) {\n  //    put_byte(s, *buf++);\n  //  }\n  arraySet(s.pending_buf, s.window, buf, len, s.pending);\n  s.pending += len;\n}\n\n/* ===========================================================================\n * Compares to subtrees, using the tree depth as tie breaker when\n * the subtrees have equal frequency. This minimizes the worst case length.\n */\nfunction smaller(tree, n, m, depth) {\n  var _n2 = n * 2;\n  var _m2 = m * 2;\n  return (tree[_n2] /*.Freq*/ < tree[_m2] /*.Freq*/ ||\n    (tree[_n2] /*.Freq*/ === tree[_m2] /*.Freq*/ && depth[n] <= depth[m]));\n}\n\n/* ===========================================================================\n * Restore the heap property by moving down the tree starting at node k,\n * exchanging a node with the smallest of its two sons if necessary, stopping\n * when the heap property is re-established (each father smaller than its\n * two sons).\n */\nfunction pqdownheap(s, tree, k)\n//    deflate_state *s;\n//    ct_data *tree;  /* the tree to restore */\n//    int k;               /* node to move down */\n{\n  var v = s.heap[k];\n  var j = k << 1; /* left son of k */\n  while (j <= s.heap_len) {\n    /* Set j to the smallest of the two sons: */\n    if (j < s.heap_len &&\n      smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {\n      j++;\n    }\n    /* Exit if v is smaller than both sons */\n    if (smaller(tree, v, s.heap[j], s.depth)) {\n      break;\n    }\n\n    /* Exchange v with the smallest son */\n    s.heap[k] = s.heap[j];\n    k = j;\n\n    /* And continue down the tree, setting j to the left son of k */\n    j <<= 1;\n  }\n  s.heap[k] = v;\n}\n\n\n// inlined manually\n// var SMALLEST = 1;\n\n/* ===========================================================================\n * Send the block data compressed using the given Huffman trees\n */\nfunction compress_block(s, ltree, dtree)\n//    deflate_state *s;\n//    const ct_data *ltree; /* literal tree */\n//    const ct_data *dtree; /* distance tree */\n{\n  var dist; /* distance of matched string */\n  var lc; /* match length or unmatched char (if dist == 0) */\n  var lx = 0; /* running index in l_buf */\n  var code; /* the code to send */\n  var extra; /* number of extra bits to send */\n\n  if (s.last_lit !== 0) {\n    do {\n      dist = (s.pending_buf[s.d_buf + lx * 2] << 8) | (s.pending_buf[s.d_buf + lx * 2 + 1]);\n      lc = s.pending_buf[s.l_buf + lx];\n      lx++;\n\n      if (dist === 0) {\n        send_code(s, lc, ltree); /* send a literal byte */\n        //Tracecv(isgraph(lc), (stderr,\" '%c' \", lc));\n      } else {\n        /* Here, lc is the match length - MIN_MATCH */\n        code = _length_code[lc];\n        send_code(s, code + LITERALS + 1, ltree); /* send the length code */\n        extra = extra_lbits[code];\n        if (extra !== 0) {\n          lc -= base_length[code];\n          send_bits(s, lc, extra); /* send the extra length bits */\n        }\n        dist--; /* dist is now the match distance - 1 */\n        code = d_code(dist);\n        //Assert (code < D_CODES, \"bad d_code\");\n\n        send_code(s, code, dtree); /* send the distance code */\n        extra = extra_dbits[code];\n        if (extra !== 0) {\n          dist -= base_dist[code];\n          send_bits(s, dist, extra); /* send the extra distance bits */\n        }\n      } /* literal or match pair ? */\n\n      /* Check that the overlay between pending_buf and d_buf+l_buf is ok: */\n      //Assert((uInt)(s->pending) < s->lit_bufsize + 2*lx,\n      //       \"pendingBuf overflow\");\n\n    } while (lx < s.last_lit);\n  }\n\n  send_code(s, END_BLOCK, ltree);\n}\n\n\n/* ===========================================================================\n * Construct one Huffman tree and assigns the code bit strings and lengths.\n * Update the total bit length for the current block.\n * IN assertion: the field freq is set for all tree elements.\n * OUT assertions: the fields len and code are set to the optimal bit length\n *     and corresponding code. The length opt_len is updated; static_len is\n *     also updated if stree is not null. The field max_code is set.\n */\nfunction build_tree(s, desc)\n//    deflate_state *s;\n//    tree_desc *desc; /* the tree descriptor */\n{\n  var tree = desc.dyn_tree;\n  var stree = desc.stat_desc.static_tree;\n  var has_stree = desc.stat_desc.has_stree;\n  var elems = desc.stat_desc.elems;\n  var n, m; /* iterate over heap elements */\n  var max_code = -1; /* largest code with non zero frequency */\n  var node; /* new node being created */\n\n  /* Construct the initial heap, with least frequent element in\n   * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].\n   * heap[0] is not used.\n   */\n  s.heap_len = 0;\n  s.heap_max = HEAP_SIZE;\n\n  for (n = 0; n < elems; n++) {\n    if (tree[n * 2] /*.Freq*/ !== 0) {\n      s.heap[++s.heap_len] = max_code = n;\n      s.depth[n] = 0;\n\n    } else {\n      tree[n * 2 + 1] /*.Len*/ = 0;\n    }\n  }\n\n  /* The pkzip format requires that at least one distance code exists,\n   * and that at least one bit should be sent even if there is only one\n   * possible code. So to avoid special checks later on we force at least\n   * two codes of non zero frequency.\n   */\n  while (s.heap_len < 2) {\n    node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);\n    tree[node * 2] /*.Freq*/ = 1;\n    s.depth[node] = 0;\n    s.opt_len--;\n\n    if (has_stree) {\n      s.static_len -= stree[node * 2 + 1] /*.Len*/ ;\n    }\n    /* node is 0 or 1 so it does not have extra bits */\n  }\n  desc.max_code = max_code;\n\n  /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,\n   * establish sub-heaps of increasing lengths:\n   */\n  for (n = (s.heap_len >> 1 /*int /2*/ ); n >= 1; n--) {\n    pqdownheap(s, tree, n);\n  }\n\n  /* Construct the Huffman tree by repeatedly combining the least two\n   * frequent nodes.\n   */\n  node = elems; /* next internal node of the tree */\n  do {\n    //pqremove(s, tree, n);  /* n = node of least frequency */\n    /*** pqremove ***/\n    n = s.heap[1 /*SMALLEST*/ ];\n    s.heap[1 /*SMALLEST*/ ] = s.heap[s.heap_len--];\n    pqdownheap(s, tree, 1 /*SMALLEST*/ );\n    /***/\n\n    m = s.heap[1 /*SMALLEST*/ ]; /* m = node of next least frequency */\n\n    s.heap[--s.heap_max] = n; /* keep the nodes sorted by frequency */\n    s.heap[--s.heap_max] = m;\n\n    /* Create a new node father of n and m */\n    tree[node * 2] /*.Freq*/ = tree[n * 2] /*.Freq*/ + tree[m * 2] /*.Freq*/ ;\n    s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;\n    tree[n * 2 + 1] /*.Dad*/ = tree[m * 2 + 1] /*.Dad*/ = node;\n\n    /* and insert the new node in the heap */\n    s.heap[1 /*SMALLEST*/ ] = node++;\n    pqdownheap(s, tree, 1 /*SMALLEST*/ );\n\n  } while (s.heap_len >= 2);\n\n  s.heap[--s.heap_max] = s.heap[1 /*SMALLEST*/ ];\n\n  /* At this point, the fields freq and dad are set. We can now\n   * generate the bit lengths.\n   */\n  gen_bitlen(s, desc);\n\n  /* The field len is now set, we can generate the bit codes */\n  gen_codes(tree, max_code, s.bl_count);\n}\n\n\n/* ===========================================================================\n * Scan a literal or distance tree to determine the frequencies of the codes\n * in the bit length tree.\n */\nfunction scan_tree(s, tree, max_code)\n//    deflate_state *s;\n//    ct_data *tree;   /* the tree to be scanned */\n//    int max_code;    /* and its largest code of non zero frequency */\n{\n  var n; /* iterates over all tree elements */\n  var prevlen = -1; /* last emitted length */\n  var curlen; /* length of current code */\n\n  var nextlen = tree[0 * 2 + 1] /*.Len*/ ; /* length of next code */\n\n  var count = 0; /* repeat count of the current code */\n  var max_count = 7; /* max repeat count */\n  var min_count = 4; /* min repeat count */\n\n  if (nextlen === 0) {\n    max_count = 138;\n    min_count = 3;\n  }\n  tree[(max_code + 1) * 2 + 1] /*.Len*/ = 0xffff; /* guard */\n\n  for (n = 0; n <= max_code; n++) {\n    curlen = nextlen;\n    nextlen = tree[(n + 1) * 2 + 1] /*.Len*/ ;\n\n    if (++count < max_count && curlen === nextlen) {\n      continue;\n\n    } else if (count < min_count) {\n      s.bl_tree[curlen * 2] /*.Freq*/ += count;\n\n    } else if (curlen !== 0) {\n\n      if (curlen !== prevlen) {\n        s.bl_tree[curlen * 2] /*.Freq*/ ++;\n      }\n      s.bl_tree[REP_3_6 * 2] /*.Freq*/ ++;\n\n    } else if (count <= 10) {\n      s.bl_tree[REPZ_3_10 * 2] /*.Freq*/ ++;\n\n    } else {\n      s.bl_tree[REPZ_11_138 * 2] /*.Freq*/ ++;\n    }\n\n    count = 0;\n    prevlen = curlen;\n\n    if (nextlen === 0) {\n      max_count = 138;\n      min_count = 3;\n\n    } else if (curlen === nextlen) {\n      max_count = 6;\n      min_count = 3;\n\n    } else {\n      max_count = 7;\n      min_count = 4;\n    }\n  }\n}\n\n\n/* ===========================================================================\n * Send a literal or distance tree in compressed form, using the codes in\n * bl_tree.\n */\nfunction send_tree(s, tree, max_code)\n//    deflate_state *s;\n//    ct_data *tree; /* the tree to be scanned */\n//    int max_code;       /* and its largest code of non zero frequency */\n{\n  var n; /* iterates over all tree elements */\n  var prevlen = -1; /* last emitted length */\n  var curlen; /* length of current code */\n\n  var nextlen = tree[0 * 2 + 1] /*.Len*/ ; /* length of next code */\n\n  var count = 0; /* repeat count of the current code */\n  var max_count = 7; /* max repeat count */\n  var min_count = 4; /* min repeat count */\n\n  /* tree[max_code+1].Len = -1; */\n  /* guard already set */\n  if (nextlen === 0) {\n    max_count = 138;\n    min_count = 3;\n  }\n\n  for (n = 0; n <= max_code; n++) {\n    curlen = nextlen;\n    nextlen = tree[(n + 1) * 2 + 1] /*.Len*/ ;\n\n    if (++count < max_count && curlen === nextlen) {\n      continue;\n\n    } else if (count < min_count) {\n      do {\n        send_code(s, curlen, s.bl_tree);\n      } while (--count !== 0);\n\n    } else if (curlen !== 0) {\n      if (curlen !== prevlen) {\n        send_code(s, curlen, s.bl_tree);\n        count--;\n      }\n      //Assert(count >= 3 && count <= 6, \" 3_6?\");\n      send_code(s, REP_3_6, s.bl_tree);\n      send_bits(s, count - 3, 2);\n\n    } else if (count <= 10) {\n      send_code(s, REPZ_3_10, s.bl_tree);\n      send_bits(s, count - 3, 3);\n\n    } else {\n      send_code(s, REPZ_11_138, s.bl_tree);\n      send_bits(s, count - 11, 7);\n    }\n\n    count = 0;\n    prevlen = curlen;\n    if (nextlen === 0) {\n      max_count = 138;\n      min_count = 3;\n\n    } else if (curlen === nextlen) {\n      max_count = 6;\n      min_count = 3;\n\n    } else {\n      max_count = 7;\n      min_count = 4;\n    }\n  }\n}\n\n\n/* ===========================================================================\n * Construct the Huffman tree for the bit lengths and return the index in\n * bl_order of the last bit length code to send.\n */\nfunction build_bl_tree(s) {\n  var max_blindex; /* index of last bit length code of non zero freq */\n\n  /* Determine the bit length frequencies for literal and distance trees */\n  scan_tree(s, s.dyn_ltree, s.l_desc.max_code);\n  scan_tree(s, s.dyn_dtree, s.d_desc.max_code);\n\n  /* Build the bit length tree: */\n  build_tree(s, s.bl_desc);\n  /* opt_len now includes the length of the tree representations, except\n   * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.\n   */\n\n  /* Determine the number of bit length codes to send. The pkzip format\n   * requires that at least 4 bit length codes be sent. (appnote.txt says\n   * 3 but the actual value used is 4.)\n   */\n  for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {\n    if (s.bl_tree[bl_order[max_blindex] * 2 + 1] /*.Len*/ !== 0) {\n      break;\n    }\n  }\n  /* Update opt_len to include the bit length tree and counts */\n  s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;\n  //Tracev((stderr, \"\\ndyn trees: dyn %ld, stat %ld\",\n  //        s->opt_len, s->static_len));\n\n  return max_blindex;\n}\n\n\n/* ===========================================================================\n * Send the header for a block using dynamic Huffman trees: the counts, the\n * lengths of the bit length codes, the literal tree and the distance tree.\n * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.\n */\nfunction send_all_trees(s, lcodes, dcodes, blcodes)\n//    deflate_state *s;\n//    int lcodes, dcodes, blcodes; /* number of codes for each tree */\n{\n  var rank; /* index in bl_order */\n\n  //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, \"not enough codes\");\n  //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,\n  //        \"too many codes\");\n  //Tracev((stderr, \"\\nbl counts: \"));\n  send_bits(s, lcodes - 257, 5); /* not +255 as stated in appnote.txt */\n  send_bits(s, dcodes - 1, 5);\n  send_bits(s, blcodes - 4, 4); /* not -3 as stated in appnote.txt */\n  for (rank = 0; rank < blcodes; rank++) {\n    //Tracev((stderr, \"\\nbl code %2d \", bl_order[rank]));\n    send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1] /*.Len*/ , 3);\n  }\n  //Tracev((stderr, \"\\nbl tree: sent %ld\", s->bits_sent));\n\n  send_tree(s, s.dyn_ltree, lcodes - 1); /* literal tree */\n  //Tracev((stderr, \"\\nlit tree: sent %ld\", s->bits_sent));\n\n  send_tree(s, s.dyn_dtree, dcodes - 1); /* distance tree */\n  //Tracev((stderr, \"\\ndist tree: sent %ld\", s->bits_sent));\n}\n\n\n/* ===========================================================================\n * Check if the data type is TEXT or BINARY, using the following algorithm:\n * - TEXT if the two conditions below are satisfied:\n *    a) There are no non-portable control characters belonging to the\n *       \"black list\" (0..6, 14..25, 28..31).\n *    b) There is at least one printable character belonging to the\n *       \"white list\" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).\n * - BINARY otherwise.\n * - The following partially-portable control characters form a\n *   \"gray list\" that is ignored in this detection algorithm:\n *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).\n * IN assertion: the fields Freq of dyn_ltree are set.\n */\nfunction detect_data_type(s) {\n  /* black_mask is the bit mask of black-listed bytes\n   * set bits 0..6, 14..25, and 28..31\n   * 0xf3ffc07f = binary 11110011111111111100000001111111\n   */\n  var black_mask = 0xf3ffc07f;\n  var n;\n\n  /* Check for non-textual (\"black-listed\") bytes. */\n  for (n = 0; n <= 31; n++, black_mask >>>= 1) {\n    if ((black_mask & 1) && (s.dyn_ltree[n * 2] /*.Freq*/ !== 0)) {\n      return Z_BINARY;\n    }\n  }\n\n  /* Check for textual (\"white-listed\") bytes. */\n  if (s.dyn_ltree[9 * 2] /*.Freq*/ !== 0 || s.dyn_ltree[10 * 2] /*.Freq*/ !== 0 ||\n    s.dyn_ltree[13 * 2] /*.Freq*/ !== 0) {\n    return Z_TEXT;\n  }\n  for (n = 32; n < LITERALS; n++) {\n    if (s.dyn_ltree[n * 2] /*.Freq*/ !== 0) {\n      return Z_TEXT;\n    }\n  }\n\n  /* There are no \"black-listed\" or \"white-listed\" bytes:\n   * this stream either is empty or has tolerated (\"gray-listed\") bytes only.\n   */\n  return Z_BINARY;\n}\n\n\nvar static_init_done = false;\n\n/* ===========================================================================\n * Initialize the tree data structures for a new zlib stream.\n */\nexport function _tr_init(s) {\n\n  if (!static_init_done) {\n    tr_static_init();\n    static_init_done = true;\n  }\n\n  s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);\n  s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);\n  s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);\n\n  s.bi_buf = 0;\n  s.bi_valid = 0;\n\n  /* Initialize the first block of the first file: */\n  init_block(s);\n}\n\n\n/* ===========================================================================\n * Send a stored block\n */\nexport function _tr_stored_block(s, buf, stored_len, last)\n//DeflateState *s;\n//charf *buf;       /* input block */\n//ulg stored_len;   /* length of input block */\n//int last;         /* one if this is the last block for a file */\n{\n  send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3); /* send block type */\n  copy_block(s, buf, stored_len, true); /* with header */\n}\n\n\n/* ===========================================================================\n * Send one empty static block to give enough lookahead for inflate.\n * This takes 10 bits, of which 7 may remain in the bit buffer.\n */\nexport function _tr_align(s) {\n  send_bits(s, STATIC_TREES << 1, 3);\n  send_code(s, END_BLOCK, static_ltree);\n  bi_flush(s);\n}\n\n\n/* ===========================================================================\n * Determine the best encoding for the current block: dynamic trees, static\n * trees or store, and output the encoded block to the zip file.\n */\nexport function _tr_flush_block(s, buf, stored_len, last)\n//DeflateState *s;\n//charf *buf;       /* input block, or NULL if too old */\n//ulg stored_len;   /* length of input block */\n//int last;         /* one if this is the last block for a file */\n{\n  var opt_lenb, static_lenb; /* opt_len and static_len in bytes */\n  var max_blindex = 0; /* index of last bit length code of non zero freq */\n\n  /* Build the Huffman trees unless a stored block is forced */\n  if (s.level > 0) {\n\n    /* Check if the file is binary or text */\n    if (s.strm.data_type === Z_UNKNOWN) {\n      s.strm.data_type = detect_data_type(s);\n    }\n\n    /* Construct the literal and distance trees */\n    build_tree(s, s.l_desc);\n    // Tracev((stderr, \"\\nlit data: dyn %ld, stat %ld\", s->opt_len,\n    //        s->static_len));\n\n    build_tree(s, s.d_desc);\n    // Tracev((stderr, \"\\ndist data: dyn %ld, stat %ld\", s->opt_len,\n    //        s->static_len));\n    /* At this point, opt_len and static_len are the total bit lengths of\n     * the compressed block data, excluding the tree representations.\n     */\n\n    /* Build the bit length tree for the above two trees, and get the index\n     * in bl_order of the last bit length code to send.\n     */\n    max_blindex = build_bl_tree(s);\n\n    /* Determine the best encoding. Compute the block lengths in bytes. */\n    opt_lenb = (s.opt_len + 3 + 7) >>> 3;\n    static_lenb = (s.static_len + 3 + 7) >>> 3;\n\n    // Tracev((stderr, \"\\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u \",\n    //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,\n    //        s->last_lit));\n\n    if (static_lenb <= opt_lenb) {\n      opt_lenb = static_lenb;\n    }\n\n  } else {\n    // Assert(buf != (char*)0, \"lost buf\");\n    opt_lenb = static_lenb = stored_len + 5; /* force a stored block */\n  }\n\n  if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {\n    /* 4: two words for the lengths */\n\n    /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.\n     * Otherwise we can't have processed more than WSIZE input bytes since\n     * the last block flush, because compression would have been\n     * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to\n     * transform a block into a stored block.\n     */\n    _tr_stored_block(s, buf, stored_len, last);\n\n  } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {\n\n    send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);\n    compress_block(s, static_ltree, static_dtree);\n\n  } else {\n    send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);\n    send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);\n    compress_block(s, s.dyn_ltree, s.dyn_dtree);\n  }\n  // Assert (s->compressed_len == s->bits_sent, \"bad compressed size\");\n  /* The above check is made mod 2^32, for files larger than 512 MB\n   * and uLong implemented on 32 bits.\n   */\n  init_block(s);\n\n  if (last) {\n    bi_windup(s);\n  }\n  // Tracev((stderr,\"\\ncomprlen %lu(%lu) \", s->compressed_len>>3,\n  //       s->compressed_len-7*last));\n}\n\n/* ===========================================================================\n * Save the match info and tally the frequency counts. Return true if\n * the current block must be flushed.\n */\nexport function _tr_tally(s, dist, lc)\n//    deflate_state *s;\n//    unsigned dist;  /* distance of matched string */\n//    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */\n{\n  //var out_length, in_length, dcode;\n\n  s.pending_buf[s.d_buf + s.last_lit * 2] = (dist >>> 8) & 0xff;\n  s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 0xff;\n\n  s.pending_buf[s.l_buf + s.last_lit] = lc & 0xff;\n  s.last_lit++;\n\n  if (dist === 0) {\n    /* lc is the unmatched char */\n    s.dyn_ltree[lc * 2] /*.Freq*/ ++;\n  } else {\n    s.matches++;\n    /* Here, lc is the match length - MIN_MATCH */\n    dist--; /* dist = match distance - 1 */\n    //Assert((ush)dist < (ush)MAX_DIST(s) &&\n    //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&\n    //       (ush)d_code(dist) < (ush)D_CODES,  \"_tr_tally: bad match\");\n\n    s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2] /*.Freq*/ ++;\n    s.dyn_dtree[d_code(dist) * 2] /*.Freq*/ ++;\n  }\n\n  // (!) This block is disabled in zlib defailts,\n  // don't enable it for binary compatibility\n\n  //#ifdef TRUNCATE_BLOCK\n  //  /* Try to guess if it is profitable to stop the current block here */\n  //  if ((s.last_lit & 0x1fff) === 0 && s.level > 2) {\n  //    /* Compute an upper bound for the compressed length */\n  //    out_length = s.last_lit*8;\n  //    in_length = s.strstart - s.block_start;\n  //\n  //    for (dcode = 0; dcode < D_CODES; dcode++) {\n  //      out_length += s.dyn_dtree[dcode*2]/*.Freq*/ * (5 + extra_dbits[dcode]);\n  //    }\n  //    out_length >>>= 3;\n  //    //Tracev((stderr,\"\\nlast_lit %u, in %ld, out ~%ld(%ld%%) \",\n  //    //       s->last_lit, in_length, out_length,\n  //    //       100L - out_length*100L/in_length));\n  //    if (s.matches < (s.last_lit>>1)/*int /2*/ && out_length < (in_length>>1)/*int /2*/) {\n  //      return true;\n  //    }\n  //  }\n  //#endif\n\n  return (s.last_lit === s.lit_bufsize - 1);\n  /* We avoid equality with lit_bufsize because of wraparound at 64K\n   * on 16 bit machines and because stored blocks are restricted to\n   * 64K-1 bytes.\n   */\n}\n","__zlib-lib/utils.js":"'use strict';\n\n\nvar TYPED_OK =  (typeof Uint8Array !== 'undefined') &&\n                (typeof Uint16Array !== 'undefined') &&\n                (typeof Int32Array !== 'undefined');\n\n\nexport function assign(obj /*from1, from2, from3, ...*/) {\n  var sources = Array.prototype.slice.call(arguments, 1);\n  while (sources.length) {\n    var source = sources.shift();\n    if (!source) { continue; }\n\n    if (typeof source !== 'object') {\n      throw new TypeError(source + 'must be non-object');\n    }\n\n    for (var p in source) {\n      if (source.hasOwnProperty(p)) {\n        obj[p] = source[p];\n      }\n    }\n  }\n\n  return obj;\n}\n\n\n// reduce buffer size, avoiding mem copy\nexport function shrinkBuf(buf, size) {\n  if (buf.length === size) { return buf; }\n  if (buf.subarray) { return buf.subarray(0, size); }\n  buf.length = size;\n  return buf;\n}\nexport function arraySet(dest, src, src_offs, len, dest_offs) {\n  if (src.subarray && dest.subarray) {\n    dest.set(src.subarray(src_offs, src_offs + len), dest_offs);\n    return;\n  }\n  // Fallback to ordinary array\n  for (var i = 0; i < len; i++) {\n    dest[dest_offs + i] = src[src_offs + i];\n  }\n}\nexport function flattenChunks(chunks) {\n  var i, l, len, pos, chunk, result;\n\n  // calculate data length\n  len = 0;\n  for (i = 0, l = chunks.length; i < l; i++) {\n    len += chunks[i].length;\n  }\n\n  // join chunks\n  result = new Uint8Array(len);\n  pos = 0;\n  for (i = 0, l = chunks.length; i < l; i++) {\n    chunk = chunks[i];\n    result.set(chunk, pos);\n    pos += chunk.length;\n  }\n\n  return result;\n}\n\n\nexport var Buf8 = Uint8Array;\nexport var Buf16 = Uint16Array;\nexport var Buf32 = Int32Array;\n// Enable/Disable typed arrays use, for testing\n//\n","__zlib-lib/zstream.js":"\n\nfunction ZStream() {\n  /* next input byte */\n  this.input = null; // JS specific, because we have no pointers\n  this.next_in = 0;\n  /* number of bytes available at input */\n  this.avail_in = 0;\n  /* total number of input bytes read so far */\n  this.total_in = 0;\n  /* next output byte should be put there */\n  this.output = null; // JS specific, because we have no pointers\n  this.next_out = 0;\n  /* remaining free space at output */\n  this.avail_out = 0;\n  /* total number of bytes output so far */\n  this.total_out = 0;\n  /* last error message, NULL if no error */\n  this.msg = ''/*Z_NULL*/;\n  /* not visible by applications */\n  this.state = null;\n  /* best guess about the data type: binary or text */\n  this.data_type = 2/*Z_UNKNOWN*/;\n  /* adler32 value of the uncompressed data */\n  this.adler = 0;\n}\n\nexport default ZStream;\n","assert.js":"\nfunction compare(a, b) {\n  if (a === b) {\n    return 0;\n  }\n\n  var x = a.length;\n  var y = b.length;\n\n  for (var i = 0, len = Math.min(x, y); i < len; ++i) {\n    if (a[i] !== b[i]) {\n      x = a[i];\n      y = b[i];\n      break;\n    }\n  }\n\n  if (x < y) {\n    return -1;\n  }\n  if (y < x) {\n    return 1;\n  }\n  return 0;\n}\nvar hasOwn = Object.prototype.hasOwnProperty;\n\nvar objectKeys = Object.keys || function (obj) {\n  var keys = [];\n  for (var key in obj) {\n    if (hasOwn.call(obj, key)) keys.push(key);\n  }\n  return keys;\n};\n// based on node assert, original notice:\n\n// http://wiki.commonjs.org/wiki/Unit_Testing/1.0\n//\n// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!\n//\n// Originally from narwhal.js (http://narwhaljs.org)\n// Copyright (c) 2009 Thomas Robinson <280north.com>\n//\n// Permission is hereby granted, free of charge, to any person obtaining a copy\n// of this software and associated documentation files (the 'Software'), to\n// deal in the Software without restriction, including without limitation the\n// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or\n// sell copies of the Software, and to permit persons to whom the Software is\n// furnished to do so, subject to the following conditions:\n//\n// The above copyright notice and this permission notice shall be included in\n// all copies or substantial portions of the Software.\n//\n// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN\n// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION\n// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\nimport {isBuffer} from 'buffer';\nimport {isPrimitive, inherits, isError, isFunction, isRegExp, isDate, inspect as utilInspect} from 'util';\nvar pSlice = Array.prototype.slice;\nvar _functionsHaveNames;\nfunction functionsHaveNames() {\n  if (typeof _functionsHaveNames !== 'undefined') {\n    return _functionsHaveNames;\n  }\n  return _functionsHaveNames = (function () {\n    return function foo() {}.name === 'foo';\n  }());\n}\nfunction pToString (obj) {\n  return Object.prototype.toString.call(obj);\n}\nfunction isView(arrbuf) {\n  if (isBuffer(arrbuf)) {\n    return false;\n  }\n  if (typeof global.ArrayBuffer !== 'function') {\n    return false;\n  }\n  if (typeof ArrayBuffer.isView === 'function') {\n    return ArrayBuffer.isView(arrbuf);\n  }\n  if (!arrbuf) {\n    return false;\n  }\n  if (arrbuf instanceof DataView) {\n    return true;\n  }\n  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {\n    return true;\n  }\n  return false;\n}\n// 1. The assert module provides functions that throw\n// AssertionError's when particular conditions are not met. The\n// assert module must conform to the following interface.\n\nfunction assert(value, message) {\n  if (!value) fail(value, true, message, '==', ok);\n}\nexport default assert;\n\n// 2. The AssertionError is defined in assert.\n// new assert.AssertionError({ message: message,\n//                             actual: actual,\n//                             expected: expected })\n\nvar regex = /\\s*function\\s+([^\\(\\s]*)\\s*/;\n// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js\nfunction getName(func) {\n  if (!isFunction(func)) {\n    return;\n  }\n  if (functionsHaveNames()) {\n    return func.name;\n  }\n  var str = func.toString();\n  var match = str.match(regex);\n  return match && match[1];\n}\nassert.AssertionError = AssertionError;\nexport function AssertionError(options) {\n  this.name = 'AssertionError';\n  this.actual = options.actual;\n  this.expected = options.expected;\n  this.operator = options.operator;\n  if (options.message) {\n    this.message = options.message;\n    this.generatedMessage = false;\n  } else {\n    this.message = getMessage(this);\n    this.generatedMessage = true;\n  }\n  var stackStartFunction = options.stackStartFunction || fail;\n  if (Error.captureStackTrace) {\n    Error.captureStackTrace(this, stackStartFunction);\n  } else {\n    // non v8 browsers so we can have a stacktrace\n    var err = new Error();\n    if (err.stack) {\n      var out = err.stack;\n\n      // try to strip useless frames\n      var fn_name = getName(stackStartFunction);\n      var idx = out.indexOf('\\n' + fn_name);\n      if (idx >= 0) {\n        // once we have located the function frame\n        // we need to strip out everything before it (and its line)\n        var next_line = out.indexOf('\\n', idx + 1);\n        out = out.substring(next_line + 1);\n      }\n\n      this.stack = out;\n    }\n  }\n}\n\n// assert.AssertionError instanceof Error\ninherits(AssertionError, Error);\n\nfunction truncate(s, n) {\n  if (typeof s === 'string') {\n    return s.length < n ? s : s.slice(0, n);\n  } else {\n    return s;\n  }\n}\nfunction inspect(something) {\n  if (functionsHaveNames() || !isFunction(something)) {\n    return utilInspect(something);\n  }\n  var rawname = getName(something);\n  var name = rawname ? ': ' + rawname : '';\n  return '[Function' +  name + ']';\n}\nfunction getMessage(self) {\n  return truncate(inspect(self.actual), 128) + ' ' +\n         self.operator + ' ' +\n         truncate(inspect(self.expected), 128);\n}\n\n// At present only the three keys mentioned above are used and\n// understood by the spec. Implementations or sub modules can pass\n// other keys to the AssertionError's constructor - they will be\n// ignored.\n\n// 3. All of the following functions must throw an AssertionError\n// when a corresponding condition is not met, with a message that\n// may be undefined if not provided.  All assertion methods provide\n// both the actual and expected values to the assertion error for\n// display purposes.\n\nexport function fail(actual, expected, message, operator, stackStartFunction) {\n  throw new AssertionError({\n    message: message,\n    actual: actual,\n    expected: expected,\n    operator: operator,\n    stackStartFunction: stackStartFunction\n  });\n}\n\n// EXTENSION! allows for well behaved errors defined elsewhere.\nassert.fail = fail;\n\n// 4. Pure assertion tests whether a value is truthy, as determined\n// by !!guard.\n// assert.ok(guard, message_opt);\n// This statement is equivalent to assert.equal(true, !!guard,\n// message_opt);. To test strictly for the value true, use\n// assert.strictEqual(true, guard, message_opt);.\n\nexport function ok(value, message) {\n  if (!value) fail(value, true, message, '==', ok);\n}\nassert.ok = ok;\nexport {ok as assert};\n\n// 5. The equality assertion tests shallow, coercive equality with\n// ==.\n// assert.equal(actual, expected, message_opt);\nassert.equal = equal;\nexport function equal(actual, expected, message) {\n  if (actual != expected) fail(actual, expected, message, '==', equal);\n}\n\n// 6. The non-equality assertion tests for whether two objects are not equal\n// with != assert.notEqual(actual, expected, message_opt);\nassert.notEqual = notEqual;\nexport function notEqual(actual, expected, message) {\n  if (actual == expected) {\n    fail(actual, expected, message, '!=', notEqual);\n  }\n}\n\n// 7. The equivalence assertion tests a deep equality relation.\n// assert.deepEqual(actual, expected, message_opt);\nassert.deepEqual = deepEqual;\nexport function deepEqual(actual, expected, message) {\n  if (!_deepEqual(actual, expected, false)) {\n    fail(actual, expected, message, 'deepEqual', deepEqual);\n  }\n}\nassert.deepStrictEqual = deepStrictEqual;\nexport function deepStrictEqual(actual, expected, message) {\n  if (!_deepEqual(actual, expected, true)) {\n    fail(actual, expected, message, 'deepStrictEqual', deepStrictEqual);\n  }\n}\n\nfunction _deepEqual(actual, expected, strict, memos) {\n  // 7.1. All identical values are equivalent, as determined by ===.\n  if (actual === expected) {\n    return true;\n  } else if (isBuffer(actual) && isBuffer(expected)) {\n    return compare(actual, expected) === 0;\n\n  // 7.2. If the expected value is a Date object, the actual value is\n  // equivalent if it is also a Date object that refers to the same time.\n  } else if (isDate(actual) && isDate(expected)) {\n    return actual.getTime() === expected.getTime();\n\n  // 7.3 If the expected value is a RegExp object, the actual value is\n  // equivalent if it is also a RegExp object with the same source and\n  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).\n  } else if (isRegExp(actual) && isRegExp(expected)) {\n    return actual.source === expected.source &&\n           actual.global === expected.global &&\n           actual.multiline === expected.multiline &&\n           actual.lastIndex === expected.lastIndex &&\n           actual.ignoreCase === expected.ignoreCase;\n\n  // 7.4. Other pairs that do not both pass typeof value == 'object',\n  // equivalence is determined by ==.\n  } else if ((actual === null || typeof actual !== 'object') &&\n             (expected === null || typeof expected !== 'object')) {\n    return strict ? actual === expected : actual == expected;\n\n  // If both values are instances of typed arrays, wrap their underlying\n  // ArrayBuffers in a Buffer each to increase performance\n  // This optimization requires the arrays to have the same type as checked by\n  // Object.prototype.toString (aka pToString). Never perform binary\n  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their\n  // bit patterns are not identical.\n  } else if (isView(actual) && isView(expected) &&\n             pToString(actual) === pToString(expected) &&\n             !(actual instanceof Float32Array ||\n               actual instanceof Float64Array)) {\n    return compare(new Uint8Array(actual.buffer),\n                   new Uint8Array(expected.buffer)) === 0;\n\n  // 7.5 For all other Object pairs, including Array objects, equivalence is\n  // determined by having the same number of owned properties (as verified\n  // with Object.prototype.hasOwnProperty.call), the same set of keys\n  // (although not necessarily the same order), equivalent values for every\n  // corresponding key, and an identical 'prototype' property. Note: this\n  // accounts for both named and indexed properties on Arrays.\n  } else if (isBuffer(actual) !== isBuffer(expected)) {\n    return false;\n  } else {\n    memos = memos || {actual: [], expected: []};\n\n    var actualIndex = memos.actual.indexOf(actual);\n    if (actualIndex !== -1) {\n      if (actualIndex === memos.expected.indexOf(expected)) {\n        return true;\n      }\n    }\n\n    memos.actual.push(actual);\n    memos.expected.push(expected);\n\n    return objEquiv(actual, expected, strict, memos);\n  }\n}\n\nfunction isArguments(object) {\n  return Object.prototype.toString.call(object) == '[object Arguments]';\n}\n\nfunction objEquiv(a, b, strict, actualVisitedObjects) {\n  if (a === null || a === undefined || b === null || b === undefined)\n    return false;\n  // if one is a primitive, the other must be same\n  if (isPrimitive(a) || isPrimitive(b))\n    return a === b;\n  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))\n    return false;\n  var aIsArgs = isArguments(a);\n  var bIsArgs = isArguments(b);\n  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))\n    return false;\n  if (aIsArgs) {\n    a = pSlice.call(a);\n    b = pSlice.call(b);\n    return _deepEqual(a, b, strict);\n  }\n  var ka = objectKeys(a);\n  var kb = objectKeys(b);\n  var key, i;\n  // having the same number of owned properties (keys incorporates\n  // hasOwnProperty)\n  if (ka.length !== kb.length)\n    return false;\n  //the same set of keys (although not necessarily the same order),\n  ka.sort();\n  kb.sort();\n  //~~~cheap key test\n  for (i = ka.length - 1; i >= 0; i--) {\n    if (ka[i] !== kb[i])\n      return false;\n  }\n  //equivalent values for every corresponding key, and\n  //~~~possibly expensive deep test\n  for (i = ka.length - 1; i >= 0; i--) {\n    key = ka[i];\n    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))\n      return false;\n  }\n  return true;\n}\n\n// 8. The non-equivalence assertion tests for any deep inequality.\n// assert.notDeepEqual(actual, expected, message_opt);\nassert.notDeepEqual = notDeepEqual;\nexport function notDeepEqual(actual, expected, message) {\n  if (_deepEqual(actual, expected, false)) {\n    fail(actual, expected, message, 'notDeepEqual', notDeepEqual);\n  }\n}\n\nassert.notDeepStrictEqual = notDeepStrictEqual;\nexport function notDeepStrictEqual(actual, expected, message) {\n  if (_deepEqual(actual, expected, true)) {\n    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);\n  }\n}\n\n\n// 9. The strict equality assertion tests strict equality, as determined by ===.\n// assert.strictEqual(actual, expected, message_opt);\nassert.strictEqual = strictEqual;\nexport function strictEqual(actual, expected, message) {\n  if (actual !== expected) {\n    fail(actual, expected, message, '===', strictEqual);\n  }\n}\n\n// 10. The strict non-equality assertion tests for strict inequality, as\n// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);\nassert.notStrictEqual = notStrictEqual;\nexport function notStrictEqual(actual, expected, message) {\n  if (actual === expected) {\n    fail(actual, expected, message, '!==', notStrictEqual);\n  }\n}\n\nfunction expectedException(actual, expected) {\n  if (!actual || !expected) {\n    return false;\n  }\n\n  if (Object.prototype.toString.call(expected) == '[object RegExp]') {\n    return expected.test(actual);\n  }\n\n  try {\n    if (actual instanceof expected) {\n      return true;\n    }\n  } catch (e) {\n    // Ignore.  The instanceof check doesn't work for arrow functions.\n  }\n\n  if (Error.isPrototypeOf(expected)) {\n    return false;\n  }\n\n  return expected.call({}, actual) === true;\n}\n\nfunction _tryBlock(block) {\n  var error;\n  try {\n    block();\n  } catch (e) {\n    error = e;\n  }\n  return error;\n}\n\nfunction _throws(shouldThrow, block, expected, message) {\n  var actual;\n\n  if (typeof block !== 'function') {\n    throw new TypeError('\"block\" argument must be a function');\n  }\n\n  if (typeof expected === 'string') {\n    message = expected;\n    expected = null;\n  }\n\n  actual = _tryBlock(block);\n\n  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +\n            (message ? ' ' + message : '.');\n\n  if (shouldThrow && !actual) {\n    fail(actual, expected, 'Missing expected exception' + message);\n  }\n\n  var userProvidedMessage = typeof message === 'string';\n  var isUnwantedException = !shouldThrow && isError(actual);\n  var isUnexpectedException = !shouldThrow && actual && !expected;\n\n  if ((isUnwantedException &&\n      userProvidedMessage &&\n      expectedException(actual, expected)) ||\n      isUnexpectedException) {\n    fail(actual, expected, 'Got unwanted exception' + message);\n  }\n\n  if ((shouldThrow && actual && expected &&\n      !expectedException(actual, expected)) || (!shouldThrow && actual)) {\n    throw actual;\n  }\n}\n\n// 11. Expected to throw an error:\n// assert.throws(block, Error_opt, message_opt);\nassert.throws = throws;\nexport function throws(block, /*optional*/error, /*optional*/message) {\n  _throws(true, block, error, message);\n}\n\n// EXTENSION! This is annoying to write outside this module.\nassert.doesNotThrow = doesNotThrow;\nexport function doesNotThrow(block, /*optional*/error, /*optional*/message) {\n  _throws(false, block, error, message);\n}\n\nassert.ifError = ifError;\nexport function ifError(err) {\n  if (err) throw err;\n}\n","buffer-es6.js":"var lookup = [];\nvar revLookup = [];\nvar Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;\nvar inited = false;\nfunction init () {\n  inited = true;\n  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';\n  for (var i = 0, len = code.length; i < len; ++i) {\n    lookup[i] = code[i];\n    revLookup[code.charCodeAt(i)] = i;\n  }\n\n  revLookup['-'.charCodeAt(0)] = 62;\n  revLookup['_'.charCodeAt(0)] = 63;\n}\n\nfunction toByteArray (b64) {\n  if (!inited) {\n    init();\n  }\n  var i, j, l, tmp, placeHolders, arr;\n  var len = b64.length;\n\n  if (len % 4 > 0) {\n    throw new Error('Invalid string. Length must be a multiple of 4')\n  }\n\n  // the number of equal signs (place holders)\n  // if there are two placeholders, than the two characters before it\n  // represent one byte\n  // if there is only one, then the three characters before it represent 2 bytes\n  // this is just a cheap hack to not do indexOf twice\n  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;\n\n  // base64 is 4/3 + up to two characters of the original data\n  arr = new Arr(len * 3 / 4 - placeHolders);\n\n  // if there are placeholders, only get up to the last complete 4 chars\n  l = placeHolders > 0 ? len - 4 : len;\n\n  var L = 0;\n\n  for (i = 0, j = 0; i < l; i += 4, j += 3) {\n    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];\n    arr[L++] = (tmp >> 16) & 0xFF;\n    arr[L++] = (tmp >> 8) & 0xFF;\n    arr[L++] = tmp & 0xFF;\n  }\n\n  if (placeHolders === 2) {\n    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);\n    arr[L++] = tmp & 0xFF;\n  } else if (placeHolders === 1) {\n    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);\n    arr[L++] = (tmp >> 8) & 0xFF;\n    arr[L++] = tmp & 0xFF;\n  }\n\n  return arr\n}\n\nfunction tripletToBase64 (num) {\n  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]\n}\n\nfunction encodeChunk (uint8, start, end) {\n  var tmp;\n  var output = [];\n  for (var i = start; i < end; i += 3) {\n    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);\n    output.push(tripletToBase64(tmp));\n  }\n  return output.join('')\n}\n\nfunction fromByteArray (uint8) {\n  if (!inited) {\n    init();\n  }\n  var tmp;\n  var len = uint8.length;\n  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes\n  var output = '';\n  var parts = [];\n  var maxChunkLength = 16383; // must be multiple of 3\n\n  // go through the array every three bytes, we'll deal with trailing stuff later\n  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {\n    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));\n  }\n\n  // pad the end with zeros, but make sure to not forget the extra bytes\n  if (extraBytes === 1) {\n    tmp = uint8[len - 1];\n    output += lookup[tmp >> 2];\n    output += lookup[(tmp << 4) & 0x3F];\n    output += '==';\n  } else if (extraBytes === 2) {\n    tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);\n    output += lookup[tmp >> 10];\n    output += lookup[(tmp >> 4) & 0x3F];\n    output += lookup[(tmp << 2) & 0x3F];\n    output += '=';\n  }\n\n  parts.push(output);\n\n  return parts.join('')\n}\n\nfunction read (buffer, offset, isLE, mLen, nBytes) {\n  var e, m;\n  var eLen = nBytes * 8 - mLen - 1;\n  var eMax = (1 << eLen) - 1;\n  var eBias = eMax >> 1;\n  var nBits = -7;\n  var i = isLE ? (nBytes - 1) : 0;\n  var d = isLE ? -1 : 1;\n  var s = buffer[offset + i];\n\n  i += d;\n\n  e = s & ((1 << (-nBits)) - 1);\n  s >>= (-nBits);\n  nBits += eLen;\n  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}\n\n  m = e & ((1 << (-nBits)) - 1);\n  e >>= (-nBits);\n  nBits += mLen;\n  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}\n\n  if (e === 0) {\n    e = 1 - eBias;\n  } else if (e === eMax) {\n    return m ? NaN : ((s ? -1 : 1) * Infinity)\n  } else {\n    m = m + Math.pow(2, mLen);\n    e = e - eBias;\n  }\n  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)\n}\n\nfunction write (buffer, value, offset, isLE, mLen, nBytes) {\n  var e, m, c;\n  var eLen = nBytes * 8 - mLen - 1;\n  var eMax = (1 << eLen) - 1;\n  var eBias = eMax >> 1;\n  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);\n  var i = isLE ? 0 : (nBytes - 1);\n  var d = isLE ? 1 : -1;\n  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;\n\n  value = Math.abs(value);\n\n  if (isNaN(value) || value === Infinity) {\n    m = isNaN(value) ? 1 : 0;\n    e = eMax;\n  } else {\n    e = Math.floor(Math.log(value) / Math.LN2);\n    if (value * (c = Math.pow(2, -e)) < 1) {\n      e--;\n      c *= 2;\n    }\n    if (e + eBias >= 1) {\n      value += rt / c;\n    } else {\n      value += rt * Math.pow(2, 1 - eBias);\n    }\n    if (value * c >= 2) {\n      e++;\n      c /= 2;\n    }\n\n    if (e + eBias >= eMax) {\n      m = 0;\n      e = eMax;\n    } else if (e + eBias >= 1) {\n      m = (value * c - 1) * Math.pow(2, mLen);\n      e = e + eBias;\n    } else {\n      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);\n      e = 0;\n    }\n  }\n\n  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}\n\n  e = (e << mLen) | m;\n  eLen += mLen;\n  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}\n\n  buffer[offset + i - d] |= s * 128;\n}\n\nvar toString = {}.toString;\n\nvar isArray = Array.isArray || function (arr) {\n  return toString.call(arr) == '[object Array]';\n};\n\n/*!\n * The buffer module from node.js, for the browser.\n *\n * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>\n * @license  MIT\n */\n\nvar INSPECT_MAX_BYTES = 50;\n\n/**\n * If `Buffer.TYPED_ARRAY_SUPPORT`:\n *   === true    Use Uint8Array implementation (fastest)\n *   === false   Use Object implementation (most compatible, even IE6)\n *\n * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,\n * Opera 11.6+, iOS 4.2+.\n *\n * Due to various browser bugs, sometimes the Object implementation will be used even\n * when the browser supports typed arrays.\n *\n * Note:\n *\n *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,\n *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.\n *\n *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.\n *\n *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of\n *     incorrect length in some situations.\n\n * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they\n * get the Object implementation, which is slower but behaves correctly.\n */\nBuffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined\n  ? global.TYPED_ARRAY_SUPPORT\n  : true;\n\n/*\n * Export kMaxLength after typed array support is determined.\n */\nvar _kMaxLength = kMaxLength();\n\nfunction kMaxLength () {\n  return Buffer.TYPED_ARRAY_SUPPORT\n    ? 0x7fffffff\n    : 0x3fffffff\n}\n\nfunction createBuffer (that, length) {\n  if (kMaxLength() < length) {\n    throw new RangeError('Invalid typed array length')\n  }\n  if (Buffer.TYPED_ARRAY_SUPPORT) {\n    // Return an augmented `Uint8Array` instance, for best performance\n    that = new Uint8Array(length);\n    that.__proto__ = Buffer.prototype;\n  } else {\n    // Fallback: Return an object instance of the Buffer class\n    if (that === null) {\n      that = new Buffer(length);\n    }\n    that.length = length;\n  }\n\n  return that\n}\n\n/**\n * The Buffer constructor returns instances of `Uint8Array` that have their\n * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of\n * `Uint8Array`, so the returned instances will have all the node `Buffer` methods\n * and the `Uint8Array` methods. Square bracket notation works as expected -- it\n * returns a single octet.\n *\n * The `Uint8Array` prototype remains unmodified.\n */\n\nfunction Buffer (arg, encodingOrOffset, length) {\n  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {\n    return new Buffer(arg, encodingOrOffset, length)\n  }\n\n  // Common case.\n  if (typeof arg === 'number') {\n    if (typeof encodingOrOffset === 'string') {\n      throw new Error(\n        'If encoding is specified then the first argument must be a string'\n      )\n    }\n    return allocUnsafe(this, arg)\n  }\n  return from(this, arg, encodingOrOffset, length)\n}\n\nBuffer.poolSize = 8192; // not used by this implementation\n\n// TODO: Legacy, not needed anymore. Remove in next major version.\nBuffer._augment = function (arr) {\n  arr.__proto__ = Buffer.prototype;\n  return arr\n};\n\nfunction from (that, value, encodingOrOffset, length) {\n  if (typeof value === 'number') {\n    throw new TypeError('\"value\" argument must not be a number')\n  }\n\n  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {\n    return fromArrayBuffer(that, value, encodingOrOffset, length)\n  }\n\n  if (typeof value === 'string') {\n    return fromString(that, value, encodingOrOffset)\n  }\n\n  return fromObject(that, value)\n}\n\n/**\n * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError\n * if value is a number.\n * Buffer.from(str[, encoding])\n * Buffer.from(array)\n * Buffer.from(buffer)\n * Buffer.from(arrayBuffer[, byteOffset[, length]])\n **/\nBuffer.from = function (value, encodingOrOffset, length) {\n  return from(null, value, encodingOrOffset, length)\n};\n\nif (Buffer.TYPED_ARRAY_SUPPORT) {\n  Buffer.prototype.__proto__ = Uint8Array.prototype;\n  Buffer.__proto__ = Uint8Array;\n}\n\nfunction assertSize (size) {\n  if (typeof size !== 'number') {\n    throw new TypeError('\"size\" argument must be a number')\n  } else if (size < 0) {\n    throw new RangeError('\"size\" argument must not be negative')\n  }\n}\n\nfunction alloc (that, size, fill, encoding) {\n  assertSize(size);\n  if (size <= 0) {\n    return createBuffer(that, size)\n  }\n  if (fill !== undefined) {\n    // Only pay attention to encoding if it's a string. This\n    // prevents accidentally sending in a number that would\n    // be interpretted as a start offset.\n    return typeof encoding === 'string'\n      ? createBuffer(that, size).fill(fill, encoding)\n      : createBuffer(that, size).fill(fill)\n  }\n  return createBuffer(that, size)\n}\n\n/**\n * Creates a new filled Buffer instance.\n * alloc(size[, fill[, encoding]])\n **/\nBuffer.alloc = function (size, fill, encoding) {\n  return alloc(null, size, fill, encoding)\n};\n\nfunction allocUnsafe (that, size) {\n  assertSize(size);\n  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);\n  if (!Buffer.TYPED_ARRAY_SUPPORT) {\n    for (var i = 0; i < size; ++i) {\n      that[i] = 0;\n    }\n  }\n  return that\n}\n\n/**\n * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.\n * */\nBuffer.allocUnsafe = function (size) {\n  return allocUnsafe(null, size)\n};\n/**\n * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.\n */\nBuffer.allocUnsafeSlow = function (size) {\n  return allocUnsafe(null, size)\n};\n\nfunction fromString (that, string, encoding) {\n  if (typeof encoding !== 'string' || encoding === '') {\n    encoding = 'utf8';\n  }\n\n  if (!Buffer.isEncoding(encoding)) {\n    throw new TypeError('\"encoding\" must be a valid string encoding')\n  }\n\n  var length = byteLength(string, encoding) | 0;\n  that = createBuffer(that, length);\n\n  var actual = that.write(string, encoding);\n\n  if (actual !== length) {\n    // Writing a hex string, for example, that contains invalid characters will\n    // cause everything after the first invalid character to be ignored. (e.g.\n    // 'abxxcd' will be treated as 'ab')\n    that = that.slice(0, actual);\n  }\n\n  return that\n}\n\nfunction fromArrayLike (that, array) {\n  var length = array.length < 0 ? 0 : checked(array.length) | 0;\n  that = createBuffer(that, length);\n  for (var i = 0; i < length; i += 1) {\n    that[i] = array[i] & 255;\n  }\n  return that\n}\n\nfunction fromArrayBuffer (that, array, byteOffset, length) {\n  array.byteLength; // this throws if `array` is not a valid ArrayBuffer\n\n  if (byteOffset < 0 || array.byteLength < byteOffset) {\n    throw new RangeError('\\'offset\\' is out of bounds')\n  }\n\n  if (array.byteLength < byteOffset + (length || 0)) {\n    throw new RangeError('\\'length\\' is out of bounds')\n  }\n\n  if (byteOffset === undefined && length === undefined) {\n    array = new Uint8Array(array);\n  } else if (length === undefined) {\n    array = new Uint8Array(array, byteOffset);\n  } else {\n    array = new Uint8Array(array, byteOffset, length);\n  }\n\n  if (Buffer.TYPED_ARRAY_SUPPORT) {\n    // Return an augmented `Uint8Array` instance, for best performance\n    that = array;\n    that.__proto__ = Buffer.prototype;\n  } else {\n    // Fallback: Return an object instance of the Buffer class\n    that = fromArrayLike(that, array);\n  }\n  return that\n}\n\nfunction fromObject (that, obj) {\n  if (internalIsBuffer(obj)) {\n    var len = checked(obj.length) | 0;\n    that = createBuffer(that, len);\n\n    if (that.length === 0) {\n      return that\n    }\n\n    obj.copy(that, 0, 0, len);\n    return that\n  }\n\n  if (obj) {\n    if ((typeof ArrayBuffer !== 'undefined' &&\n        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {\n      if (typeof obj.length !== 'number' || isnan(obj.length)) {\n        return createBuffer(that, 0)\n      }\n      return fromArrayLike(that, obj)\n    }\n\n    if (obj.type === 'Buffer' && isArray(obj.data)) {\n      return fromArrayLike(that, obj.data)\n    }\n  }\n\n  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')\n}\n\nfunction checked (length) {\n  // Note: cannot use `length < kMaxLength()` here because that fails when\n  // length is NaN (which is otherwise coerced to zero.)\n  if (length >= kMaxLength()) {\n    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +\n                         'size: 0x' + kMaxLength().toString(16) + ' bytes')\n  }\n  return length | 0\n}\n\nfunction SlowBuffer (length) {\n  if (+length != length) { // eslint-disable-line eqeqeq\n    length = 0;\n  }\n  return Buffer.alloc(+length)\n}\nBuffer.isBuffer = isBuffer;\nfunction internalIsBuffer (b) {\n  return !!(b != null && b._isBuffer)\n}\n\nBuffer.compare = function compare (a, b) {\n  if (!internalIsBuffer(a) || !internalIsBuffer(b)) {\n    throw new TypeError('Arguments must be Buffers')\n  }\n\n  if (a === b) return 0\n\n  var x = a.length;\n  var y = b.length;\n\n  for (var i = 0, len = Math.min(x, y); i < len; ++i) {\n    if (a[i] !== b[i]) {\n      x = a[i];\n      y = b[i];\n      break\n    }\n  }\n\n  if (x < y) return -1\n  if (y < x) return 1\n  return 0\n};\n\nBuffer.isEncoding = function isEncoding (encoding) {\n  switch (String(encoding).toLowerCase()) {\n    case 'hex':\n    case 'utf8':\n    case 'utf-8':\n    case 'ascii':\n    case 'latin1':\n    case 'binary':\n    case 'base64':\n    case 'ucs2':\n    case 'ucs-2':\n    case 'utf16le':\n    case 'utf-16le':\n      return true\n    default:\n      return false\n  }\n};\n\nBuffer.concat = function concat (list, length) {\n  if (!isArray(list)) {\n    throw new TypeError('\"list\" argument must be an Array of Buffers')\n  }\n\n  if (list.length === 0) {\n    return Buffer.alloc(0)\n  }\n\n  var i;\n  if (length === undefined) {\n    length = 0;\n    for (i = 0; i < list.length; ++i) {\n      length += list[i].length;\n    }\n  }\n\n  var buffer = Buffer.allocUnsafe(length);\n  var pos = 0;\n  for (i = 0; i < list.length; ++i) {\n    var buf = list[i];\n    if (!internalIsBuffer(buf)) {\n      throw new TypeError('\"list\" argument must be an Array of Buffers')\n    }\n    buf.copy(buffer, pos);\n    pos += buf.length;\n  }\n  return buffer\n};\n\nfunction byteLength (string, encoding) {\n  if (internalIsBuffer(string)) {\n    return string.length\n  }\n  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&\n      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {\n    return string.byteLength\n  }\n  if (typeof string !== 'string') {\n    string = '' + string;\n  }\n\n  var len = string.length;\n  if (len === 0) return 0\n\n  // Use a for loop to avoid recursion\n  var loweredCase = false;\n  for (;;) {\n    switch (encoding) {\n      case 'ascii':\n      case 'latin1':\n      case 'binary':\n        return len\n      case 'utf8':\n      case 'utf-8':\n      case undefined:\n        return utf8ToBytes(string).length\n      case 'ucs2':\n      case 'ucs-2':\n      case 'utf16le':\n      case 'utf-16le':\n        return len * 2\n      case 'hex':\n        return len >>> 1\n      case 'base64':\n        return base64ToBytes(string).length\n      default:\n        if (loweredCase) return utf8ToBytes(string).length // assume utf8\n        encoding = ('' + encoding).toLowerCase();\n        loweredCase = true;\n    }\n  }\n}\nBuffer.byteLength = byteLength;\n\nfunction slowToString (encoding, start, end) {\n  var loweredCase = false;\n\n  // No need to verify that \"this.length <= MAX_UINT32\" since it's a read-only\n  // property of a typed array.\n\n  // This behaves neither like String nor Uint8Array in that we set start/end\n  // to their upper/lower bounds if the value passed is out of range.\n  // undefined is handled specially as per ECMA-262 6th Edition,\n  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.\n  if (start === undefined || start < 0) {\n    start = 0;\n  }\n  // Return early if start > this.length. Done here to prevent potential uint32\n  // coercion fail below.\n  if (start > this.length) {\n    return ''\n  }\n\n  if (end === undefined || end > this.length) {\n    end = this.length;\n  }\n\n  if (end <= 0) {\n    return ''\n  }\n\n  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.\n  end >>>= 0;\n  start >>>= 0;\n\n  if (end <= start) {\n    return ''\n  }\n\n  if (!encoding) encoding = 'utf8';\n\n  while (true) {\n    switch (encoding) {\n      case 'hex':\n        return hexSlice(this, start, end)\n\n      case 'utf8':\n      case 'utf-8':\n        return utf8Slice(this, start, end)\n\n      case 'ascii':\n        return asciiSlice(this, start, end)\n\n      case 'latin1':\n      case 'binary':\n        return latin1Slice(this, start, end)\n\n      case 'base64':\n        return base64Slice(this, start, end)\n\n      case 'ucs2':\n      case 'ucs-2':\n      case 'utf16le':\n      case 'utf-16le':\n        return utf16leSlice(this, start, end)\n\n      default:\n        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)\n        encoding = (encoding + '').toLowerCase();\n        loweredCase = true;\n    }\n  }\n}\n\n// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect\n// Buffer instances.\nBuffer.prototype._isBuffer = true;\n\nfunction swap (b, n, m) {\n  var i = b[n];\n  b[n] = b[m];\n  b[m] = i;\n}\n\nBuffer.prototype.swap16 = function swap16 () {\n  var len = this.length;\n  if (len % 2 !== 0) {\n    throw new RangeError('Buffer size must be a multiple of 16-bits')\n  }\n  for (var i = 0; i < len; i += 2) {\n    swap(this, i, i + 1);\n  }\n  return this\n};\n\nBuffer.prototype.swap32 = function swap32 () {\n  var len = this.length;\n  if (len % 4 !== 0) {\n    throw new RangeError('Buffer size must be a multiple of 32-bits')\n  }\n  for (var i = 0; i < len; i += 4) {\n    swap(this, i, i + 3);\n    swap(this, i + 1, i + 2);\n  }\n  return this\n};\n\nBuffer.prototype.swap64 = function swap64 () {\n  var len = this.length;\n  if (len % 8 !== 0) {\n    throw new RangeError('Buffer size must be a multiple of 64-bits')\n  }\n  for (var i = 0; i < len; i += 8) {\n    swap(this, i, i + 7);\n    swap(this, i + 1, i + 6);\n    swap(this, i + 2, i + 5);\n    swap(this, i + 3, i + 4);\n  }\n  return this\n};\n\nBuffer.prototype.toString = function toString () {\n  var length = this.length | 0;\n  if (length === 0) return ''\n  if (arguments.length === 0) return utf8Slice(this, 0, length)\n  return slowToString.apply(this, arguments)\n};\n\nBuffer.prototype.equals = function equals (b) {\n  if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')\n  if (this === b) return true\n  return Buffer.compare(this, b) === 0\n};\n\nBuffer.prototype.inspect = function inspect () {\n  var str = '';\n  var max = INSPECT_MAX_BYTES;\n  if (this.length > 0) {\n    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');\n    if (this.length > max) str += ' ... ';\n  }\n  return '<Buffer ' + str + '>'\n};\n\nBuffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {\n  if (!internalIsBuffer(target)) {\n    throw new TypeError('Argument must be a Buffer')\n  }\n\n  if (start === undefined) {\n    start = 0;\n  }\n  if (end === undefined) {\n    end = target ? target.length : 0;\n  }\n  if (thisStart === undefined) {\n    thisStart = 0;\n  }\n  if (thisEnd === undefined) {\n    thisEnd = this.length;\n  }\n\n  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {\n    throw new RangeError('out of range index')\n  }\n\n  if (thisStart >= thisEnd && start >= end) {\n    return 0\n  }\n  if (thisStart >= thisEnd) {\n    return -1\n  }\n  if (start >= end) {\n    return 1\n  }\n\n  start >>>= 0;\n  end >>>= 0;\n  thisStart >>>= 0;\n  thisEnd >>>= 0;\n\n  if (this === target) return 0\n\n  var x = thisEnd - thisStart;\n  var y = end - start;\n  var len = Math.min(x, y);\n\n  var thisCopy = this.slice(thisStart, thisEnd);\n  var targetCopy = target.slice(start, end);\n\n  for (var i = 0; i < len; ++i) {\n    if (thisCopy[i] !== targetCopy[i]) {\n      x = thisCopy[i];\n      y = targetCopy[i];\n      break\n    }\n  }\n\n  if (x < y) return -1\n  if (y < x) return 1\n  return 0\n};\n\n// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,\n// OR the last index of `val` in `buffer` at offset <= `byteOffset`.\n//\n// Arguments:\n// - buffer - a Buffer to search\n// - val - a string, Buffer, or number\n// - byteOffset - an index into `buffer`; will be clamped to an int32\n// - encoding - an optional encoding, relevant is val is a string\n// - dir - true for indexOf, false for lastIndexOf\nfunction bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {\n  // Empty buffer means no match\n  if (buffer.length === 0) return -1\n\n  // Normalize byteOffset\n  if (typeof byteOffset === 'string') {\n    encoding = byteOffset;\n    byteOffset = 0;\n  } else if (byteOffset > 0x7fffffff) {\n    byteOffset = 0x7fffffff;\n  } else if (byteOffset < -0x80000000) {\n    byteOffset = -0x80000000;\n  }\n  byteOffset = +byteOffset;  // Coerce to Number.\n  if (isNaN(byteOffset)) {\n    // byteOffset: it it's undefined, null, NaN, \"foo\", etc, search whole buffer\n    byteOffset = dir ? 0 : (buffer.length - 1);\n  }\n\n  // Normalize byteOffset: negative offsets start from the end of the buffer\n  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;\n  if (byteOffset >= buffer.length) {\n    if (dir) return -1\n    else byteOffset = buffer.length - 1;\n  } else if (byteOffset < 0) {\n    if (dir) byteOffset = 0;\n    else return -1\n  }\n\n  // Normalize val\n  if (typeof val === 'string') {\n    val = Buffer.from(val, encoding);\n  }\n\n  // Finally, search either indexOf (if dir is true) or lastIndexOf\n  if (internalIsBuffer(val)) {\n    // Special case: looking for empty string/buffer always fails\n    if (val.length === 0) {\n      return -1\n    }\n    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)\n  } else if (typeof val === 'number') {\n    val = val & 0xFF; // Search for a byte value [0-255]\n    if (Buffer.TYPED_ARRAY_SUPPORT &&\n        typeof Uint8Array.prototype.indexOf === 'function') {\n      if (dir) {\n        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)\n      } else {\n        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)\n      }\n    }\n    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)\n  }\n\n  throw new TypeError('val must be string, number or Buffer')\n}\n\nfunction arrayIndexOf (arr, val, byteOffset, encoding, dir) {\n  var indexSize = 1;\n  var arrLength = arr.length;\n  var valLength = val.length;\n\n  if (encoding !== undefined) {\n    encoding = String(encoding).toLowerCase();\n    if (encoding === 'ucs2' || encoding === 'ucs-2' ||\n        encoding === 'utf16le' || encoding === 'utf-16le') {\n      if (arr.length < 2 || val.length < 2) {\n        return -1\n      }\n      indexSize = 2;\n      arrLength /= 2;\n      valLength /= 2;\n      byteOffset /= 2;\n    }\n  }\n\n  function read (buf, i) {\n    if (indexSize === 1) {\n      return buf[i]\n    } else {\n      return buf.readUInt16BE(i * indexSize)\n    }\n  }\n\n  var i;\n  if (dir) {\n    var foundIndex = -1;\n    for (i = byteOffset; i < arrLength; i++) {\n      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {\n        if (foundIndex === -1) foundIndex = i;\n        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize\n      } else {\n        if (foundIndex !== -1) i -= i - foundIndex;\n        foundIndex = -1;\n      }\n    }\n  } else {\n    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;\n    for (i = byteOffset; i >= 0; i--) {\n      var found = true;\n      for (var j = 0; j < valLength; j++) {\n        if (read(arr, i + j) !== read(val, j)) {\n          found = false;\n          break\n        }\n      }\n      if (found) return i\n    }\n  }\n\n  return -1\n}\n\nBuffer.prototype.includes = function includes (val, byteOffset, encoding) {\n  return this.indexOf(val, byteOffset, encoding) !== -1\n};\n\nBuffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {\n  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)\n};\n\nBuffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {\n  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)\n};\n\nfunction hexWrite (buf, string, offset, length) {\n  offset = Number(offset) || 0;\n  var remaining = buf.length - offset;\n  if (!length) {\n    length = remaining;\n  } else {\n    length = Number(length);\n    if (length > remaining) {\n      length = remaining;\n    }\n  }\n\n  // must be an even number of digits\n  var strLen = string.length;\n  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')\n\n  if (length > strLen / 2) {\n    length = strLen / 2;\n  }\n  for (var i = 0; i < length; ++i) {\n    var parsed = parseInt(string.substr(i * 2, 2), 16);\n    if (isNaN(parsed)) return i\n    buf[offset + i] = parsed;\n  }\n  return i\n}\n\nfunction utf8Write (buf, string, offset, length) {\n  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)\n}\n\nfunction asciiWrite (buf, string, offset, length) {\n  return blitBuffer(asciiToBytes(string), buf, offset, length)\n}\n\nfunction latin1Write (buf, string, offset, length) {\n  return asciiWrite(buf, string, offset, length)\n}\n\nfunction base64Write (buf, string, offset, length) {\n  return blitBuffer(base64ToBytes(string), buf, offset, length)\n}\n\nfunction ucs2Write (buf, string, offset, length) {\n  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)\n}\n\nBuffer.prototype.write = function write (string, offset, length, encoding) {\n  // Buffer#write(string)\n  if (offset === undefined) {\n    encoding = 'utf8';\n    length = this.length;\n    offset = 0;\n  // Buffer#write(string, encoding)\n  } else if (length === undefined && typeof offset === 'string') {\n    encoding = offset;\n    length = this.length;\n    offset = 0;\n  // Buffer#write(string, offset[, length][, encoding])\n  } else if (isFinite(offset)) {\n    offset = offset | 0;\n    if (isFinite(length)) {\n      length = length | 0;\n      if (encoding === undefined) encoding = 'utf8';\n    } else {\n      encoding = length;\n      length = undefined;\n    }\n  // legacy write(string, encoding, offset, length) - remove in v0.13\n  } else {\n    throw new Error(\n      'Buffer.write(string, encoding, offset[, length]) is no longer supported'\n    )\n  }\n\n  var remaining = this.length - offset;\n  if (length === undefined || length > remaining) length = remaining;\n\n  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {\n    throw new RangeError('Attempt to write outside buffer bounds')\n  }\n\n  if (!encoding) encoding = 'utf8';\n\n  var loweredCase = false;\n  for (;;) {\n    switch (encoding) {\n      case 'hex':\n        return hexWrite(this, string, offset, length)\n\n      case 'utf8':\n      case 'utf-8':\n        return utf8Write(this, string, offset, length)\n\n      case 'ascii':\n        return asciiWrite(this, string, offset, length)\n\n      case 'latin1':\n      case 'binary':\n        return latin1Write(this, string, offset, length)\n\n      case 'base64':\n        // Warning: maxLength not taken into account in base64Write\n        return base64Write(this, string, offset, length)\n\n      case 'ucs2':\n      case 'ucs-2':\n      case 'utf16le':\n      case 'utf-16le':\n        return ucs2Write(this, string, offset, length)\n\n      default:\n        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)\n        encoding = ('' + encoding).toLowerCase();\n        loweredCase = true;\n    }\n  }\n};\n\nBuffer.prototype.toJSON = function toJSON () {\n  return {\n    type: 'Buffer',\n    data: Array.prototype.slice.call(this._arr || this, 0)\n  }\n};\n\nfunction base64Slice (buf, start, end) {\n  if (start === 0 && end === buf.length) {\n    return fromByteArray(buf)\n  } else {\n    return fromByteArray(buf.slice(start, end))\n  }\n}\n\nfunction utf8Slice (buf, start, end) {\n  end = Math.min(buf.length, end);\n  var res = [];\n\n  var i = start;\n  while (i < end) {\n    var firstByte = buf[i];\n    var codePoint = null;\n    var bytesPerSequence = (firstByte > 0xEF) ? 4\n      : (firstByte > 0xDF) ? 3\n      : (firstByte > 0xBF) ? 2\n      : 1;\n\n    if (i + bytesPerSequence <= end) {\n      var secondByte, thirdByte, fourthByte, tempCodePoint;\n\n      switch (bytesPerSequence) {\n        case 1:\n          if (firstByte < 0x80) {\n            codePoint = firstByte;\n          }\n          break\n        case 2:\n          secondByte = buf[i + 1];\n          if ((secondByte & 0xC0) === 0x80) {\n            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);\n            if (tempCodePoint > 0x7F) {\n              codePoint = tempCodePoint;\n            }\n          }\n          break\n        case 3:\n          secondByte = buf[i + 1];\n          thirdByte = buf[i + 2];\n          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {\n            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);\n            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {\n              codePoint = tempCodePoint;\n            }\n          }\n          break\n        case 4:\n          secondByte = buf[i + 1];\n          thirdByte = buf[i + 2];\n          fourthByte = buf[i + 3];\n          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {\n            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);\n            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {\n              codePoint = tempCodePoint;\n            }\n          }\n      }\n    }\n\n    if (codePoint === null) {\n      // we did not generate a valid codePoint so insert a\n      // replacement char (U+FFFD) and advance only 1 byte\n      codePoint = 0xFFFD;\n      bytesPerSequence = 1;\n    } else if (codePoint > 0xFFFF) {\n      // encode to utf16 (surrogate pair dance)\n      codePoint -= 0x10000;\n      res.push(codePoint >>> 10 & 0x3FF | 0xD800);\n      codePoint = 0xDC00 | codePoint & 0x3FF;\n    }\n\n    res.push(codePoint);\n    i += bytesPerSequence;\n  }\n\n  return decodeCodePointsArray(res)\n}\n\n// Based on http://stackoverflow.com/a/22747272/680742, the browser with\n// the lowest limit is Chrome, with 0x10000 args.\n// We go 1 magnitude less, for safety\nvar MAX_ARGUMENTS_LENGTH = 0x1000;\n\nfunction decodeCodePointsArray (codePoints) {\n  var len = codePoints.length;\n  if (len <= MAX_ARGUMENTS_LENGTH) {\n    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()\n  }\n\n  // Decode in chunks to avoid \"call stack size exceeded\".\n  var res = '';\n  var i = 0;\n  while (i < len) {\n    res += String.fromCharCode.apply(\n      String,\n      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)\n    );\n  }\n  return res\n}\n\nfunction asciiSlice (buf, start, end) {\n  var ret = '';\n  end = Math.min(buf.length, end);\n\n  for (var i = start; i < end; ++i) {\n    ret += String.fromCharCode(buf[i] & 0x7F);\n  }\n  return ret\n}\n\nfunction latin1Slice (buf, start, end) {\n  var ret = '';\n  end = Math.min(buf.length, end);\n\n  for (var i = start; i < end; ++i) {\n    ret += String.fromCharCode(buf[i]);\n  }\n  return ret\n}\n\nfunction hexSlice (buf, start, end) {\n  var len = buf.length;\n\n  if (!start || start < 0) start = 0;\n  if (!end || end < 0 || end > len) end = len;\n\n  var out = '';\n  for (var i = start; i < end; ++i) {\n    out += toHex(buf[i]);\n  }\n  return out\n}\n\nfunction utf16leSlice (buf, start, end) {\n  var bytes = buf.slice(start, end);\n  var res = '';\n  for (var i = 0; i < bytes.length; i += 2) {\n    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);\n  }\n  return res\n}\n\nBuffer.prototype.slice = function slice (start, end) {\n  var len = this.length;\n  start = ~~start;\n  end = end === undefined ? len : ~~end;\n\n  if (start < 0) {\n    start += len;\n    if (start < 0) start = 0;\n  } else if (start > len) {\n    start = len;\n  }\n\n  if (end < 0) {\n    end += len;\n    if (end < 0) end = 0;\n  } else if (end > len) {\n    end = len;\n  }\n\n  if (end < start) end = start;\n\n  var newBuf;\n  if (Buffer.TYPED_ARRAY_SUPPORT) {\n    newBuf = this.subarray(start, end);\n    newBuf.__proto__ = Buffer.prototype;\n  } else {\n    var sliceLen = end - start;\n    newBuf = new Buffer(sliceLen, undefined);\n    for (var i = 0; i < sliceLen; ++i) {\n      newBuf[i] = this[i + start];\n    }\n  }\n\n  return newBuf\n};\n\n/*\n * Need to make sure that buffer isn't trying to write out of bounds.\n */\nfunction checkOffset (offset, ext, length) {\n  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')\n  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')\n}\n\nBuffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {\n  offset = offset | 0;\n  byteLength = byteLength | 0;\n  if (!noAssert) checkOffset(offset, byteLength, this.length);\n\n  var val = this[offset];\n  var mul = 1;\n  var i = 0;\n  while (++i < byteLength && (mul *= 0x100)) {\n    val += this[offset + i] * mul;\n  }\n\n  return val\n};\n\nBuffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {\n  offset = offset | 0;\n  byteLength = byteLength | 0;\n  if (!noAssert) {\n    checkOffset(offset, byteLength, this.length);\n  }\n\n  var val = this[offset + --byteLength];\n  var mul = 1;\n  while (byteLength > 0 && (mul *= 0x100)) {\n    val += this[offset + --byteLength] * mul;\n  }\n\n  return val\n};\n\nBuffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 1, this.length);\n  return this[offset]\n};\n\nBuffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 2, this.length);\n  return this[offset] | (this[offset + 1] << 8)\n};\n\nBuffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 2, this.length);\n  return (this[offset] << 8) | this[offset + 1]\n};\n\nBuffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 4, this.length);\n\n  return ((this[offset]) |\n      (this[offset + 1] << 8) |\n      (this[offset + 2] << 16)) +\n      (this[offset + 3] * 0x1000000)\n};\n\nBuffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 4, this.length);\n\n  return (this[offset] * 0x1000000) +\n    ((this[offset + 1] << 16) |\n    (this[offset + 2] << 8) |\n    this[offset + 3])\n};\n\nBuffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {\n  offset = offset | 0;\n  byteLength = byteLength | 0;\n  if (!noAssert) checkOffset(offset, byteLength, this.length);\n\n  var val = this[offset];\n  var mul = 1;\n  var i = 0;\n  while (++i < byteLength && (mul *= 0x100)) {\n    val += this[offset + i] * mul;\n  }\n  mul *= 0x80;\n\n  if (val >= mul) val -= Math.pow(2, 8 * byteLength);\n\n  return val\n};\n\nBuffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {\n  offset = offset | 0;\n  byteLength = byteLength | 0;\n  if (!noAssert) checkOffset(offset, byteLength, this.length);\n\n  var i = byteLength;\n  var mul = 1;\n  var val = this[offset + --i];\n  while (i > 0 && (mul *= 0x100)) {\n    val += this[offset + --i] * mul;\n  }\n  mul *= 0x80;\n\n  if (val >= mul) val -= Math.pow(2, 8 * byteLength);\n\n  return val\n};\n\nBuffer.prototype.readInt8 = function readInt8 (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 1, this.length);\n  if (!(this[offset] & 0x80)) return (this[offset])\n  return ((0xff - this[offset] + 1) * -1)\n};\n\nBuffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 2, this.length);\n  var val = this[offset] | (this[offset + 1] << 8);\n  return (val & 0x8000) ? val | 0xFFFF0000 : val\n};\n\nBuffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 2, this.length);\n  var val = this[offset + 1] | (this[offset] << 8);\n  return (val & 0x8000) ? val | 0xFFFF0000 : val\n};\n\nBuffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 4, this.length);\n\n  return (this[offset]) |\n    (this[offset + 1] << 8) |\n    (this[offset + 2] << 16) |\n    (this[offset + 3] << 24)\n};\n\nBuffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 4, this.length);\n\n  return (this[offset] << 24) |\n    (this[offset + 1] << 16) |\n    (this[offset + 2] << 8) |\n    (this[offset + 3])\n};\n\nBuffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 4, this.length);\n  return read(this, offset, true, 23, 4)\n};\n\nBuffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 4, this.length);\n  return read(this, offset, false, 23, 4)\n};\n\nBuffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 8, this.length);\n  return read(this, offset, true, 52, 8)\n};\n\nBuffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 8, this.length);\n  return read(this, offset, false, 52, 8)\n};\n\nfunction checkInt (buf, value, offset, ext, max, min) {\n  if (!internalIsBuffer(buf)) throw new TypeError('\"buffer\" argument must be a Buffer instance')\n  if (value > max || value < min) throw new RangeError('\"value\" argument is out of bounds')\n  if (offset + ext > buf.length) throw new RangeError('Index out of range')\n}\n\nBuffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {\n  value = +value;\n  offset = offset | 0;\n  byteLength = byteLength | 0;\n  if (!noAssert) {\n    var maxBytes = Math.pow(2, 8 * byteLength) - 1;\n    checkInt(this, value, offset, byteLength, maxBytes, 0);\n  }\n\n  var mul = 1;\n  var i = 0;\n  this[offset] = value & 0xFF;\n  while (++i < byteLength && (mul *= 0x100)) {\n    this[offset + i] = (value / mul) & 0xFF;\n  }\n\n  return offset + byteLength\n};\n\nBuffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {\n  value = +value;\n  offset = offset | 0;\n  byteLength = byteLength | 0;\n  if (!noAssert) {\n    var maxBytes = Math.pow(2, 8 * byteLength) - 1;\n    checkInt(this, value, offset, byteLength, maxBytes, 0);\n  }\n\n  var i = byteLength - 1;\n  var mul = 1;\n  this[offset + i] = value & 0xFF;\n  while (--i >= 0 && (mul *= 0x100)) {\n    this[offset + i] = (value / mul) & 0xFF;\n  }\n\n  return offset + byteLength\n};\n\nBuffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {\n  value = +value;\n  offset = offset | 0;\n  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);\n  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);\n  this[offset] = (value & 0xff);\n  return offset + 1\n};\n\nfunction objectWriteUInt16 (buf, value, offset, littleEndian) {\n  if (value < 0) value = 0xffff + value + 1;\n  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {\n    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>\n      (littleEndian ? i : 1 - i) * 8;\n  }\n}\n\nBuffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {\n  value = +value;\n  offset = offset | 0;\n  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);\n  if (Buffer.TYPED_ARRAY_SUPPORT) {\n    this[offset] = (value & 0xff);\n    this[offset + 1] = (value >>> 8);\n  } else {\n    objectWriteUInt16(this, value, offset, true);\n  }\n  return offset + 2\n};\n\nBuffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {\n  value = +value;\n  offset = offset | 0;\n  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);\n  if (Buffer.TYPED_ARRAY_SUPPORT) {\n    this[offset] = (value >>> 8);\n    this[offset + 1] = (value & 0xff);\n  } else {\n    objectWriteUInt16(this, value, offset, false);\n  }\n  return offset + 2\n};\n\nfunction objectWriteUInt32 (buf, value, offset, littleEndian) {\n  if (value < 0) value = 0xffffffff + value + 1;\n  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {\n    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;\n  }\n}\n\nBuffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {\n  value = +value;\n  offset = offset | 0;\n  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);\n  if (Buffer.TYPED_ARRAY_SUPPORT) {\n    this[offset + 3] = (value >>> 24);\n    this[offset + 2] = (value >>> 16);\n    this[offset + 1] = (value >>> 8);\n    this[offset] = (value & 0xff);\n  } else {\n    objectWriteUInt32(this, value, offset, true);\n  }\n  return offset + 4\n};\n\nBuffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {\n  value = +value;\n  offset = offset | 0;\n  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);\n  if (Buffer.TYPED_ARRAY_SUPPORT) {\n    this[offset] = (value >>> 24);\n    this[offset + 1] = (value >>> 16);\n    this[offset + 2] = (value >>> 8);\n    this[offset + 3] = (value & 0xff);\n  } else {\n    objectWriteUInt32(this, value, offset, false);\n  }\n  return offset + 4\n};\n\nBuffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {\n  value = +value;\n  offset = offset | 0;\n  if (!noAssert) {\n    var limit = Math.pow(2, 8 * byteLength - 1);\n\n    checkInt(this, value, offset, byteLength, limit - 1, -limit);\n  }\n\n  var i = 0;\n  var mul = 1;\n  var sub = 0;\n  this[offset] = value & 0xFF;\n  while (++i < byteLength && (mul *= 0x100)) {\n    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {\n      sub = 1;\n    }\n    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;\n  }\n\n  return offset + byteLength\n};\n\nBuffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {\n  value = +value;\n  offset = offset | 0;\n  if (!noAssert) {\n    var limit = Math.pow(2, 8 * byteLength - 1);\n\n    checkInt(this, value, offset, byteLength, limit - 1, -limit);\n  }\n\n  var i = byteLength - 1;\n  var mul = 1;\n  var sub = 0;\n  this[offset + i] = value & 0xFF;\n  while (--i >= 0 && (mul *= 0x100)) {\n    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {\n      sub = 1;\n    }\n    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;\n  }\n\n  return offset + byteLength\n};\n\nBuffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {\n  value = +value;\n  offset = offset | 0;\n  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);\n  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);\n  if (value < 0) value = 0xff + value + 1;\n  this[offset] = (value & 0xff);\n  return offset + 1\n};\n\nBuffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {\n  value = +value;\n  offset = offset | 0;\n  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);\n  if (Buffer.TYPED_ARRAY_SUPPORT) {\n    this[offset] = (value & 0xff);\n    this[offset + 1] = (value >>> 8);\n  } else {\n    objectWriteUInt16(this, value, offset, true);\n  }\n  return offset + 2\n};\n\nBuffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {\n  value = +value;\n  offset = offset | 0;\n  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);\n  if (Buffer.TYPED_ARRAY_SUPPORT) {\n    this[offset] = (value >>> 8);\n    this[offset + 1] = (value & 0xff);\n  } else {\n    objectWriteUInt16(this, value, offset, false);\n  }\n  return offset + 2\n};\n\nBuffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {\n  value = +value;\n  offset = offset | 0;\n  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);\n  if (Buffer.TYPED_ARRAY_SUPPORT) {\n    this[offset] = (value & 0xff);\n    this[offset + 1] = (value >>> 8);\n    this[offset + 2] = (value >>> 16);\n    this[offset + 3] = (value >>> 24);\n  } else {\n    objectWriteUInt32(this, value, offset, true);\n  }\n  return offset + 4\n};\n\nBuffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {\n  value = +value;\n  offset = offset | 0;\n  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);\n  if (value < 0) value = 0xffffffff + value + 1;\n  if (Buffer.TYPED_ARRAY_SUPPORT) {\n    this[offset] = (value >>> 24);\n    this[offset + 1] = (value >>> 16);\n    this[offset + 2] = (value >>> 8);\n    this[offset + 3] = (value & 0xff);\n  } else {\n    objectWriteUInt32(this, value, offset, false);\n  }\n  return offset + 4\n};\n\nfunction checkIEEE754 (buf, value, offset, ext, max, min) {\n  if (offset + ext > buf.length) throw new RangeError('Index out of range')\n  if (offset < 0) throw new RangeError('Index out of range')\n}\n\nfunction writeFloat (buf, value, offset, littleEndian, noAssert) {\n  if (!noAssert) {\n    checkIEEE754(buf, value, offset, 4);\n  }\n  write(buf, value, offset, littleEndian, 23, 4);\n  return offset + 4\n}\n\nBuffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {\n  return writeFloat(this, value, offset, true, noAssert)\n};\n\nBuffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {\n  return writeFloat(this, value, offset, false, noAssert)\n};\n\nfunction writeDouble (buf, value, offset, littleEndian, noAssert) {\n  if (!noAssert) {\n    checkIEEE754(buf, value, offset, 8);\n  }\n  write(buf, value, offset, littleEndian, 52, 8);\n  return offset + 8\n}\n\nBuffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {\n  return writeDouble(this, value, offset, true, noAssert)\n};\n\nBuffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {\n  return writeDouble(this, value, offset, false, noAssert)\n};\n\n// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)\nBuffer.prototype.copy = function copy (target, targetStart, start, end) {\n  if (!start) start = 0;\n  if (!end && end !== 0) end = this.length;\n  if (targetStart >= target.length) targetStart = target.length;\n  if (!targetStart) targetStart = 0;\n  if (end > 0 && end < start) end = start;\n\n  // Copy 0 bytes; we're done\n  if (end === start) return 0\n  if (target.length === 0 || this.length === 0) return 0\n\n  // Fatal error conditions\n  if (targetStart < 0) {\n    throw new RangeError('targetStart out of bounds')\n  }\n  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')\n  if (end < 0) throw new RangeError('sourceEnd out of bounds')\n\n  // Are we oob?\n  if (end > this.length) end = this.length;\n  if (target.length - targetStart < end - start) {\n    end = target.length - targetStart + start;\n  }\n\n  var len = end - start;\n  var i;\n\n  if (this === target && start < targetStart && targetStart < end) {\n    // descending copy from end\n    for (i = len - 1; i >= 0; --i) {\n      target[i + targetStart] = this[i + start];\n    }\n  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {\n    // ascending copy from start\n    for (i = 0; i < len; ++i) {\n      target[i + targetStart] = this[i + start];\n    }\n  } else {\n    Uint8Array.prototype.set.call(\n      target,\n      this.subarray(start, start + len),\n      targetStart\n    );\n  }\n\n  return len\n};\n\n// Usage:\n//    buffer.fill(number[, offset[, end]])\n//    buffer.fill(buffer[, offset[, end]])\n//    buffer.fill(string[, offset[, end]][, encoding])\nBuffer.prototype.fill = function fill (val, start, end, encoding) {\n  // Handle string cases:\n  if (typeof val === 'string') {\n    if (typeof start === 'string') {\n      encoding = start;\n      start = 0;\n      end = this.length;\n    } else if (typeof end === 'string') {\n      encoding = end;\n      end = this.length;\n    }\n    if (val.length === 1) {\n      var code = val.charCodeAt(0);\n      if (code < 256) {\n        val = code;\n      }\n    }\n    if (encoding !== undefined && typeof encoding !== 'string') {\n      throw new TypeError('encoding must be a string')\n    }\n    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {\n      throw new TypeError('Unknown encoding: ' + encoding)\n    }\n  } else if (typeof val === 'number') {\n    val = val & 255;\n  }\n\n  // Invalid ranges are not set to a default, so can range check early.\n  if (start < 0 || this.length < start || this.length < end) {\n    throw new RangeError('Out of range index')\n  }\n\n  if (end <= start) {\n    return this\n  }\n\n  start = start >>> 0;\n  end = end === undefined ? this.length : end >>> 0;\n\n  if (!val) val = 0;\n\n  var i;\n  if (typeof val === 'number') {\n    for (i = start; i < end; ++i) {\n      this[i] = val;\n    }\n  } else {\n    var bytes = internalIsBuffer(val)\n      ? val\n      : utf8ToBytes(new Buffer(val, encoding).toString());\n    var len = bytes.length;\n    for (i = 0; i < end - start; ++i) {\n      this[i + start] = bytes[i % len];\n    }\n  }\n\n  return this\n};\n\n// HELPER FUNCTIONS\n// ================\n\nvar INVALID_BASE64_RE = /[^+\\/0-9A-Za-z-_]/g;\n\nfunction base64clean (str) {\n  // Node strips out invalid characters like \\n and \\t from the string, base64-js does not\n  str = stringtrim(str).replace(INVALID_BASE64_RE, '');\n  // Node converts strings with length < 2 to ''\n  if (str.length < 2) return ''\n  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not\n  while (str.length % 4 !== 0) {\n    str = str + '=';\n  }\n  return str\n}\n\nfunction stringtrim (str) {\n  if (str.trim) return str.trim()\n  return str.replace(/^\\s+|\\s+$/g, '')\n}\n\nfunction toHex (n) {\n  if (n < 16) return '0' + n.toString(16)\n  return n.toString(16)\n}\n\nfunction utf8ToBytes (string, units) {\n  units = units || Infinity;\n  var codePoint;\n  var length = string.length;\n  var leadSurrogate = null;\n  var bytes = [];\n\n  for (var i = 0; i < length; ++i) {\n    codePoint = string.charCodeAt(i);\n\n    // is surrogate component\n    if (codePoint > 0xD7FF && codePoint < 0xE000) {\n      // last char was a lead\n      if (!leadSurrogate) {\n        // no lead yet\n        if (codePoint > 0xDBFF) {\n          // unexpected trail\n          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);\n          continue\n        } else if (i + 1 === length) {\n          // unpaired lead\n          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);\n          continue\n        }\n\n        // valid lead\n        leadSurrogate = codePoint;\n\n        continue\n      }\n\n      // 2 leads in a row\n      if (codePoint < 0xDC00) {\n        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);\n        leadSurrogate = codePoint;\n        continue\n      }\n\n      // valid surrogate pair\n      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;\n    } else if (leadSurrogate) {\n      // valid bmp char, but last char was a lead\n      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);\n    }\n\n    leadSurrogate = null;\n\n    // encode utf8\n    if (codePoint < 0x80) {\n      if ((units -= 1) < 0) break\n      bytes.push(codePoint);\n    } else if (codePoint < 0x800) {\n      if ((units -= 2) < 0) break\n      bytes.push(\n        codePoint >> 0x6 | 0xC0,\n        codePoint & 0x3F | 0x80\n      );\n    } else if (codePoint < 0x10000) {\n      if ((units -= 3) < 0) break\n      bytes.push(\n        codePoint >> 0xC | 0xE0,\n        codePoint >> 0x6 & 0x3F | 0x80,\n        codePoint & 0x3F | 0x80\n      );\n    } else if (codePoint < 0x110000) {\n      if ((units -= 4) < 0) break\n      bytes.push(\n        codePoint >> 0x12 | 0xF0,\n        codePoint >> 0xC & 0x3F | 0x80,\n        codePoint >> 0x6 & 0x3F | 0x80,\n        codePoint & 0x3F | 0x80\n      );\n    } else {\n      throw new Error('Invalid code point')\n    }\n  }\n\n  return bytes\n}\n\nfunction asciiToBytes (str) {\n  var byteArray = [];\n  for (var i = 0; i < str.length; ++i) {\n    // Node's code seems to be doing this and not & 0x7F..\n    byteArray.push(str.charCodeAt(i) & 0xFF);\n  }\n  return byteArray\n}\n\nfunction utf16leToBytes (str, units) {\n  var c, hi, lo;\n  var byteArray = [];\n  for (var i = 0; i < str.length; ++i) {\n    if ((units -= 2) < 0) break\n\n    c = str.charCodeAt(i);\n    hi = c >> 8;\n    lo = c % 256;\n    byteArray.push(lo);\n    byteArray.push(hi);\n  }\n\n  return byteArray\n}\n\n\nfunction base64ToBytes (str) {\n  return toByteArray(base64clean(str))\n}\n\nfunction blitBuffer (src, dst, offset, length) {\n  for (var i = 0; i < length; ++i) {\n    if ((i + offset >= dst.length) || (i >= src.length)) break\n    dst[i + offset] = src[i];\n  }\n  return i\n}\n\nfunction isnan (val) {\n  return val !== val // eslint-disable-line no-self-compare\n}\n\n\n// the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence\n// The _isBuffer check is for Safari 5-7 support, because it's missing\n// Object.prototype.constructor. Remove this eventually\nfunction isBuffer(obj) {\n  return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))\n}\n\nfunction isFastBuffer (obj) {\n  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)\n}\n\n// For Node v0.10 support. Remove this eventually.\nfunction isSlowBuffer (obj) {\n  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))\n}\n\nexport { Buffer, INSPECT_MAX_BYTES, SlowBuffer, isBuffer, _kMaxLength as kMaxLength };\n","console.js":"function noop(){}\n\nexport default global.console ? global.console : {\n  log: noop,\n  info: noop,\n  warn: noop,\n  error: noop,\n  dir: noop,\n  assert: noop,\n  time: noop,\n  timeEnd: noop,\n  trace: noop\n};\n","constants.js":"export var RTLD_LAZY = 1;\nexport var RTLD_NOW = 2;\nexport var RTLD_GLOBAL = 8;\nexport var RTLD_LOCAL = 4;\nexport var E2BIG = 7;\nexport var EACCES = 13;\nexport var EADDRINUSE = 48;\nexport var EADDRNOTAVAIL = 49;\nexport var EAFNOSUPPORT = 47;\nexport var EAGAIN = 35;\nexport var EALREADY = 37;\nexport var EBADF = 9;\nexport var EBADMSG = 94;\nexport var EBUSY = 16;\nexport var ECANCELED = 89;\nexport var ECHILD = 10;\nexport var ECONNABORTED = 53;\nexport var ECONNREFUSED = 61;\nexport var ECONNRESET = 54;\nexport var EDEADLK = 11;\nexport var EDESTADDRREQ = 39;\nexport var EDOM = 33;\nexport var EDQUOT = 69;\nexport var EEXIST = 17;\nexport var EFAULT = 14;\nexport var EFBIG = 27;\nexport var EHOSTUNREACH = 65;\nexport var EIDRM = 90;\nexport var EILSEQ = 92;\nexport var EINPROGRESS = 36;\nexport var EINTR = 4;\nexport var EINVAL = 22;\nexport var EIO = 5;\nexport var EISCONN = 56;\nexport var EISDIR = 21;\nexport var ELOOP = 62;\nexport var EMFILE = 24;\nexport var EMLINK = 31;\nexport var EMSGSIZE = 40;\nexport var EMULTIHOP = 95;\nexport var ENAMETOOLONG = 63;\nexport var ENETDOWN = 50;\nexport var ENETRESET = 52;\nexport var ENETUNREACH = 51;\nexport var ENFILE = 23;\nexport var ENOBUFS = 55;\nexport var ENODATA = 96;\nexport var ENODEV = 19;\nexport var ENOENT = 2;\nexport var ENOEXEC = 8;\nexport var ENOLCK = 77;\nexport var ENOLINK = 97;\nexport var ENOMEM = 12;\nexport var ENOMSG = 91;\nexport var ENOPROTOOPT = 42;\nexport var ENOSPC = 28;\nexport var ENOSR = 98;\nexport var ENOSTR = 99;\nexport var ENOSYS = 78;\nexport var ENOTCONN = 57;\nexport var ENOTDIR = 20;\nexport var ENOTEMPTY = 66;\nexport var ENOTSOCK = 38;\nexport var ENOTSUP = 45;\nexport var ENOTTY = 25;\nexport var ENXIO = 6;\nexport var EOPNOTSUPP = 102;\nexport var EOVERFLOW = 84;\nexport var EPERM = 1;\nexport var EPIPE = 32;\nexport var EPROTO = 100;\nexport var EPROTONOSUPPORT = 43;\nexport var EPROTOTYPE = 41;\nexport var ERANGE = 34;\nexport var EROFS = 30;\nexport var ESPIPE = 29;\nexport var ESRCH = 3;\nexport var ESTALE = 70;\nexport var ETIME = 101;\nexport var ETIMEDOUT = 60;\nexport var ETXTBSY = 26;\nexport var EWOULDBLOCK = 35;\nexport var EXDEV = 18;\nexport var PRIORITY_LOW = 19;\nexport var PRIORITY_BELOW_NORMAL = 10;\nexport var PRIORITY_NORMAL = 0;\nexport var PRIORITY_ABOVE_NORMAL = -7;\nexport var PRIORITY_HIGH = -14;\nexport var PRIORITY_HIGHEST = -20;\nexport var SIGHUP = 1;\nexport var SIGINT = 2;\nexport var SIGQUIT = 3;\nexport var SIGILL = 4;\nexport var SIGTRAP = 5;\nexport var SIGABRT = 6;\nexport var SIGIOT = 6;\nexport var SIGBUS = 10;\nexport var SIGFPE = 8;\nexport var SIGKILL = 9;\nexport var SIGUSR1 = 30;\nexport var SIGSEGV = 11;\nexport var SIGUSR2 = 31;\nexport var SIGPIPE = 13;\nexport var SIGALRM = 14;\nexport var SIGTERM = 15;\nexport var SIGCHLD = 20;\nexport var SIGCONT = 19;\nexport var SIGSTOP = 17;\nexport var SIGTSTP = 18;\nexport var SIGTTIN = 21;\nexport var SIGTTOU = 22;\nexport var SIGURG = 16;\nexport var SIGXCPU = 24;\nexport var SIGXFSZ = 25;\nexport var SIGVTALRM = 26;\nexport var SIGPROF = 27;\nexport var SIGWINCH = 28;\nexport var SIGIO = 23;\nexport var SIGINFO = 29;\nexport var SIGSYS = 12;\nexport var UV_FS_SYMLINK_DIR = 1;\nexport var UV_FS_SYMLINK_JUNCTION = 2;\nexport var O_RDONLY = 0;\nexport var O_WRONLY = 1;\nexport var O_RDWR = 2;\nexport var UV_DIRENT_UNKNOWN = 0;\nexport var UV_DIRENT_FILE = 1;\nexport var UV_DIRENT_DIR = 2;\nexport var UV_DIRENT_LINK = 3;\nexport var UV_DIRENT_FIFO = 4;\nexport var UV_DIRENT_SOCKET = 5;\nexport var UV_DIRENT_CHAR = 6;\nexport var UV_DIRENT_BLOCK = 7;\nexport var S_IFMT = 61440;\nexport var S_IFREG = 32768;\nexport var S_IFDIR = 16384;\nexport var S_IFCHR = 8192;\nexport var S_IFBLK = 24576;\nexport var S_IFIFO = 4096;\nexport var S_IFLNK = 40960;\nexport var S_IFSOCK = 49152;\nexport var O_CREAT = 512;\nexport var O_EXCL = 2048;\nexport var UV_FS_O_FILEMAP = 0;\nexport var O_NOCTTY = 131072;\nexport var O_TRUNC = 1024;\nexport var O_APPEND = 8;\nexport var O_DIRECTORY = 1048576;\nexport var O_NOFOLLOW = 256;\nexport var O_SYNC = 128;\nexport var O_DSYNC = 4194304;\nexport var O_SYMLINK = 2097152;\nexport var O_NONBLOCK = 4;\nexport var S_IRWXU = 448;\nexport var S_IRUSR = 256;\nexport var S_IWUSR = 128;\nexport var S_IXUSR = 64;\nexport var S_IRWXG = 56;\nexport var S_IRGRP = 32;\nexport var S_IWGRP = 16;\nexport var S_IXGRP = 8;\nexport var S_IRWXO = 7;\nexport var S_IROTH = 4;\nexport var S_IWOTH = 2;\nexport var S_IXOTH = 1;\nexport var F_OK = 0;\nexport var R_OK = 4;\nexport var W_OK = 2;\nexport var X_OK = 1;\nexport var UV_FS_COPYFILE_EXCL = 1;\nexport var COPYFILE_EXCL = 1;\nexport var UV_FS_COPYFILE_FICLONE = 2;\nexport var COPYFILE_FICLONE = 2;\nexport var UV_FS_COPYFILE_FICLONE_FORCE = 4;\nexport var COPYFILE_FICLONE_FORCE = 4;\nexport var OPENSSL_VERSION_NUMBER = 269488319;\nexport var SSL_OP_ALL = 2147485780;\nexport var SSL_OP_ALLOW_NO_DHE_KEX = 1024;\nexport var SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION = 262144;\nexport var SSL_OP_CIPHER_SERVER_PREFERENCE = 4194304;\nexport var SSL_OP_CISCO_ANYCONNECT = 32768;\nexport var SSL_OP_COOKIE_EXCHANGE = 8192;\nexport var SSL_OP_CRYPTOPRO_TLSEXT_BUG = 2147483648;\nexport var SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS = 2048;\nexport var SSL_OP_EPHEMERAL_RSA = 0;\nexport var SSL_OP_LEGACY_SERVER_CONNECT = 4;\nexport var SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER = 0;\nexport var SSL_OP_MICROSOFT_SESS_ID_BUG = 0;\nexport var SSL_OP_MSIE_SSLV2_RSA_PADDING = 0;\nexport var SSL_OP_NETSCAPE_CA_DN_BUG = 0;\nexport var SSL_OP_NETSCAPE_CHALLENGE_BUG = 0;\nexport var SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG = 0;\nexport var SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG = 0;\nexport var SSL_OP_NO_COMPRESSION = 131072;\nexport var SSL_OP_NO_ENCRYPT_THEN_MAC = 524288;\nexport var SSL_OP_NO_QUERY_MTU = 4096;\nexport var SSL_OP_NO_RENEGOTIATION = 1073741824;\nexport var SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION = 65536;\nexport var SSL_OP_NO_SSLv2 = 0;\nexport var SSL_OP_NO_SSLv3 = 33554432;\nexport var SSL_OP_NO_TICKET = 16384;\nexport var SSL_OP_NO_TLSv1 = 67108864;\nexport var SSL_OP_NO_TLSv1_1 = 268435456;\nexport var SSL_OP_NO_TLSv1_2 = 134217728;\nexport var SSL_OP_NO_TLSv1_3 = 536870912;\nexport var SSL_OP_PKCS1_CHECK_1 = 0;\nexport var SSL_OP_PKCS1_CHECK_2 = 0;\nexport var SSL_OP_PRIORITIZE_CHACHA = 2097152;\nexport var SSL_OP_SINGLE_DH_USE = 0;\nexport var SSL_OP_SINGLE_ECDH_USE = 0;\nexport var SSL_OP_SSLEAY_080_CLIENT_DH_BUG = 0;\nexport var SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG = 0;\nexport var SSL_OP_TLS_BLOCK_PADDING_BUG = 0;\nexport var SSL_OP_TLS_D5_BUG = 0;\nexport var SSL_OP_TLS_ROLLBACK_BUG = 8388608;\nexport var ENGINE_METHOD_RSA = 1;\nexport var ENGINE_METHOD_DSA = 2;\nexport var ENGINE_METHOD_DH = 4;\nexport var ENGINE_METHOD_RAND = 8;\nexport var ENGINE_METHOD_EC = 2048;\nexport var ENGINE_METHOD_CIPHERS = 64;\nexport var ENGINE_METHOD_DIGESTS = 128;\nexport var ENGINE_METHOD_PKEY_METHS = 512;\nexport var ENGINE_METHOD_PKEY_ASN1_METHS = 1024;\nexport var ENGINE_METHOD_ALL = 65535;\nexport var ENGINE_METHOD_NONE = 0;\nexport var DH_CHECK_P_NOT_SAFE_PRIME = 2;\nexport var DH_CHECK_P_NOT_PRIME = 1;\nexport var DH_UNABLE_TO_CHECK_GENERATOR = 4;\nexport var DH_NOT_SUITABLE_GENERATOR = 8;\nexport var ALPN_ENABLED = 1;\nexport var RSA_PKCS1_PADDING = 1;\nexport var RSA_SSLV23_PADDING = 2;\nexport var RSA_NO_PADDING = 3;\nexport var RSA_PKCS1_OAEP_PADDING = 4;\nexport var RSA_X931_PADDING = 5;\nexport var RSA_PKCS1_PSS_PADDING = 6;\nexport var RSA_PSS_SALTLEN_DIGEST = -1;\nexport var RSA_PSS_SALTLEN_MAX_SIGN = -2;\nexport var RSA_PSS_SALTLEN_AUTO = -2;\nexport var defaultCoreCipherList = \"TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA\";\nexport var TLS1_VERSION = 769;\nexport var TLS1_1_VERSION = 770;\nexport var TLS1_2_VERSION = 771;\nexport var TLS1_3_VERSION = 772;\nexport var POINT_CONVERSION_COMPRESSED = 2;\nexport var POINT_CONVERSION_UNCOMPRESSED = 4;\nexport var POINT_CONVERSION_HYBRID = 6;\nexport default {\n  RTLD_LAZY: RTLD_LAZY,\n  RTLD_NOW: RTLD_NOW,\n  RTLD_GLOBAL: RTLD_GLOBAL,\n  RTLD_LOCAL: RTLD_LOCAL,\n  E2BIG: E2BIG,\n  EACCES: EACCES,\n  EADDRINUSE: EADDRINUSE,\n  EADDRNOTAVAIL: EADDRNOTAVAIL,\n  EAFNOSUPPORT: EAFNOSUPPORT,\n  EAGAIN: EAGAIN,\n  EALREADY: EALREADY,\n  EBADF: EBADF,\n  EBADMSG: EBADMSG,\n  EBUSY: EBUSY,\n  ECANCELED: ECANCELED,\n  ECHILD: ECHILD,\n  ECONNABORTED: ECONNABORTED,\n  ECONNREFUSED: ECONNREFUSED,\n  ECONNRESET: ECONNRESET,\n  EDEADLK: EDEADLK,\n  EDESTADDRREQ: EDESTADDRREQ,\n  EDOM: EDOM,\n  EDQUOT: EDQUOT,\n  EEXIST: EEXIST,\n  EFAULT: EFAULT,\n  EFBIG: EFBIG,\n  EHOSTUNREACH: EHOSTUNREACH,\n  EIDRM: EIDRM,\n  EILSEQ: EILSEQ,\n  EINPROGRESS: EINPROGRESS,\n  EINTR: EINTR,\n  EINVAL: EINVAL,\n  EIO: EIO,\n  EISCONN: EISCONN,\n  EISDIR: EISDIR,\n  ELOOP: ELOOP,\n  EMFILE: EMFILE,\n  EMLINK: EMLINK,\n  EMSGSIZE: EMSGSIZE,\n  EMULTIHOP: EMULTIHOP,\n  ENAMETOOLONG: ENAMETOOLONG,\n  ENETDOWN: ENETDOWN,\n  ENETRESET: ENETRESET,\n  ENETUNREACH: ENETUNREACH,\n  ENFILE: ENFILE,\n  ENOBUFS: ENOBUFS,\n  ENODATA: ENODATA,\n  ENODEV: ENODEV,\n  ENOENT: ENOENT,\n  ENOEXEC: ENOEXEC,\n  ENOLCK: ENOLCK,\n  ENOLINK: ENOLINK,\n  ENOMEM: ENOMEM,\n  ENOMSG: ENOMSG,\n  ENOPROTOOPT: ENOPROTOOPT,\n  ENOSPC: ENOSPC,\n  ENOSR: ENOSR,\n  ENOSTR: ENOSTR,\n  ENOSYS: ENOSYS,\n  ENOTCONN: ENOTCONN,\n  ENOTDIR: ENOTDIR,\n  ENOTEMPTY: ENOTEMPTY,\n  ENOTSOCK: ENOTSOCK,\n  ENOTSUP: ENOTSUP,\n  ENOTTY: ENOTTY,\n  ENXIO: ENXIO,\n  EOPNOTSUPP: EOPNOTSUPP,\n  EOVERFLOW: EOVERFLOW,\n  EPERM: EPERM,\n  EPIPE: EPIPE,\n  EPROTO: EPROTO,\n  EPROTONOSUPPORT: EPROTONOSUPPORT,\n  EPROTOTYPE: EPROTOTYPE,\n  ERANGE: ERANGE,\n  EROFS: EROFS,\n  ESPIPE: ESPIPE,\n  ESRCH: ESRCH,\n  ESTALE: ESTALE,\n  ETIME: ETIME,\n  ETIMEDOUT: ETIMEDOUT,\n  ETXTBSY: ETXTBSY,\n  EWOULDBLOCK: EWOULDBLOCK,\n  EXDEV: EXDEV,\n  PRIORITY_LOW: PRIORITY_LOW,\n  PRIORITY_BELOW_NORMAL: PRIORITY_BELOW_NORMAL,\n  PRIORITY_NORMAL: PRIORITY_NORMAL,\n  PRIORITY_ABOVE_NORMAL: PRIORITY_ABOVE_NORMAL,\n  PRIORITY_HIGH: PRIORITY_HIGH,\n  PRIORITY_HIGHEST: PRIORITY_HIGHEST,\n  SIGHUP: SIGHUP,\n  SIGINT: SIGINT,\n  SIGQUIT: SIGQUIT,\n  SIGILL: SIGILL,\n  SIGTRAP: SIGTRAP,\n  SIGABRT: SIGABRT,\n  SIGIOT: SIGIOT,\n  SIGBUS: SIGBUS,\n  SIGFPE: SIGFPE,\n  SIGKILL: SIGKILL,\n  SIGUSR1: SIGUSR1,\n  SIGSEGV: SIGSEGV,\n  SIGUSR2: SIGUSR2,\n  SIGPIPE: SIGPIPE,\n  SIGALRM: SIGALRM,\n  SIGTERM: SIGTERM,\n  SIGCHLD: SIGCHLD,\n  SIGCONT: SIGCONT,\n  SIGSTOP: SIGSTOP,\n  SIGTSTP: SIGTSTP,\n  SIGTTIN: SIGTTIN,\n  SIGTTOU: SIGTTOU,\n  SIGURG: SIGURG,\n  SIGXCPU: SIGXCPU,\n  SIGXFSZ: SIGXFSZ,\n  SIGVTALRM: SIGVTALRM,\n  SIGPROF: SIGPROF,\n  SIGWINCH: SIGWINCH,\n  SIGIO: SIGIO,\n  SIGINFO: SIGINFO,\n  SIGSYS: SIGSYS,\n  UV_FS_SYMLINK_DIR: UV_FS_SYMLINK_DIR,\n  UV_FS_SYMLINK_JUNCTION: UV_FS_SYMLINK_JUNCTION,\n  O_RDONLY: O_RDONLY,\n  O_WRONLY: O_WRONLY,\n  O_RDWR: O_RDWR,\n  UV_DIRENT_UNKNOWN: UV_DIRENT_UNKNOWN,\n  UV_DIRENT_FILE: UV_DIRENT_FILE,\n  UV_DIRENT_DIR: UV_DIRENT_DIR,\n  UV_DIRENT_LINK: UV_DIRENT_LINK,\n  UV_DIRENT_FIFO: UV_DIRENT_FIFO,\n  UV_DIRENT_SOCKET: UV_DIRENT_SOCKET,\n  UV_DIRENT_CHAR: UV_DIRENT_CHAR,\n  UV_DIRENT_BLOCK: UV_DIRENT_BLOCK,\n  S_IFMT: S_IFMT,\n  S_IFREG: S_IFREG,\n  S_IFDIR: S_IFDIR,\n  S_IFCHR: S_IFCHR,\n  S_IFBLK: S_IFBLK,\n  S_IFIFO: S_IFIFO,\n  S_IFLNK: S_IFLNK,\n  S_IFSOCK: S_IFSOCK,\n  O_CREAT: O_CREAT,\n  O_EXCL: O_EXCL,\n  UV_FS_O_FILEMAP: UV_FS_O_FILEMAP,\n  O_NOCTTY: O_NOCTTY,\n  O_TRUNC: O_TRUNC,\n  O_APPEND: O_APPEND,\n  O_DIRECTORY: O_DIRECTORY,\n  O_NOFOLLOW: O_NOFOLLOW,\n  O_SYNC: O_SYNC,\n  O_DSYNC: O_DSYNC,\n  O_SYMLINK: O_SYMLINK,\n  O_NONBLOCK: O_NONBLOCK,\n  S_IRWXU: S_IRWXU,\n  S_IRUSR: S_IRUSR,\n  S_IWUSR: S_IWUSR,\n  S_IXUSR: S_IXUSR,\n  S_IRWXG: S_IRWXG,\n  S_IRGRP: S_IRGRP,\n  S_IWGRP: S_IWGRP,\n  S_IXGRP: S_IXGRP,\n  S_IRWXO: S_IRWXO,\n  S_IROTH: S_IROTH,\n  S_IWOTH: S_IWOTH,\n  S_IXOTH: S_IXOTH,\n  F_OK: F_OK,\n  R_OK: R_OK,\n  W_OK: W_OK,\n  X_OK: X_OK,\n  UV_FS_COPYFILE_EXCL: UV_FS_COPYFILE_EXCL,\n  COPYFILE_EXCL: COPYFILE_EXCL,\n  UV_FS_COPYFILE_FICLONE: UV_FS_COPYFILE_FICLONE,\n  COPYFILE_FICLONE: COPYFILE_FICLONE,\n  UV_FS_COPYFILE_FICLONE_FORCE: UV_FS_COPYFILE_FICLONE_FORCE,\n  COPYFILE_FICLONE_FORCE: COPYFILE_FICLONE_FORCE,\n  OPENSSL_VERSION_NUMBER: OPENSSL_VERSION_NUMBER,\n  SSL_OP_ALL: SSL_OP_ALL,\n  SSL_OP_ALLOW_NO_DHE_KEX: SSL_OP_ALLOW_NO_DHE_KEX,\n  SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION: SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION,\n  SSL_OP_CIPHER_SERVER_PREFERENCE: SSL_OP_CIPHER_SERVER_PREFERENCE,\n  SSL_OP_CISCO_ANYCONNECT: SSL_OP_CISCO_ANYCONNECT,\n  SSL_OP_COOKIE_EXCHANGE: SSL_OP_COOKIE_EXCHANGE,\n  SSL_OP_CRYPTOPRO_TLSEXT_BUG: SSL_OP_CRYPTOPRO_TLSEXT_BUG,\n  SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS: SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS,\n  SSL_OP_EPHEMERAL_RSA: SSL_OP_EPHEMERAL_RSA,\n  SSL_OP_LEGACY_SERVER_CONNECT: SSL_OP_LEGACY_SERVER_CONNECT,\n  SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER: SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER,\n  SSL_OP_MICROSOFT_SESS_ID_BUG: SSL_OP_MICROSOFT_SESS_ID_BUG,\n  SSL_OP_MSIE_SSLV2_RSA_PADDING: SSL_OP_MSIE_SSLV2_RSA_PADDING,\n  SSL_OP_NETSCAPE_CA_DN_BUG: SSL_OP_NETSCAPE_CA_DN_BUG,\n  SSL_OP_NETSCAPE_CHALLENGE_BUG: SSL_OP_NETSCAPE_CHALLENGE_BUG,\n  SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG: SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG,\n  SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG: SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG,\n  SSL_OP_NO_COMPRESSION: SSL_OP_NO_COMPRESSION,\n  SSL_OP_NO_ENCRYPT_THEN_MAC: SSL_OP_NO_ENCRYPT_THEN_MAC,\n  SSL_OP_NO_QUERY_MTU: SSL_OP_NO_QUERY_MTU,\n  SSL_OP_NO_RENEGOTIATION: SSL_OP_NO_RENEGOTIATION,\n  SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION: SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION,\n  SSL_OP_NO_SSLv2: SSL_OP_NO_SSLv2,\n  SSL_OP_NO_SSLv3: SSL_OP_NO_SSLv3,\n  SSL_OP_NO_TICKET: SSL_OP_NO_TICKET,\n  SSL_OP_NO_TLSv1: SSL_OP_NO_TLSv1,\n  SSL_OP_NO_TLSv1_1: SSL_OP_NO_TLSv1_1,\n  SSL_OP_NO_TLSv1_2: SSL_OP_NO_TLSv1_2,\n  SSL_OP_NO_TLSv1_3: SSL_OP_NO_TLSv1_3,\n  SSL_OP_PKCS1_CHECK_1: SSL_OP_PKCS1_CHECK_1,\n  SSL_OP_PKCS1_CHECK_2: SSL_OP_PKCS1_CHECK_2,\n  SSL_OP_PRIORITIZE_CHACHA: SSL_OP_PRIORITIZE_CHACHA,\n  SSL_OP_SINGLE_DH_USE: SSL_OP_SINGLE_DH_USE,\n  SSL_OP_SINGLE_ECDH_USE: SSL_OP_SINGLE_ECDH_USE,\n  SSL_OP_SSLEAY_080_CLIENT_DH_BUG: SSL_OP_SSLEAY_080_CLIENT_DH_BUG,\n  SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG: SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG,\n  SSL_OP_TLS_BLOCK_PADDING_BUG: SSL_OP_TLS_BLOCK_PADDING_BUG,\n  SSL_OP_TLS_D5_BUG: SSL_OP_TLS_D5_BUG,\n  SSL_OP_TLS_ROLLBACK_BUG: SSL_OP_TLS_ROLLBACK_BUG,\n  ENGINE_METHOD_RSA: ENGINE_METHOD_RSA,\n  ENGINE_METHOD_DSA: ENGINE_METHOD_DSA,\n  ENGINE_METHOD_DH: ENGINE_METHOD_DH,\n  ENGINE_METHOD_RAND: ENGINE_METHOD_RAND,\n  ENGINE_METHOD_EC: ENGINE_METHOD_EC,\n  ENGINE_METHOD_CIPHERS: ENGINE_METHOD_CIPHERS,\n  ENGINE_METHOD_DIGESTS: ENGINE_METHOD_DIGESTS,\n  ENGINE_METHOD_PKEY_METHS: ENGINE_METHOD_PKEY_METHS,\n  ENGINE_METHOD_PKEY_ASN1_METHS: ENGINE_METHOD_PKEY_ASN1_METHS,\n  ENGINE_METHOD_ALL: ENGINE_METHOD_ALL,\n  ENGINE_METHOD_NONE: ENGINE_METHOD_NONE,\n  DH_CHECK_P_NOT_SAFE_PRIME: DH_CHECK_P_NOT_SAFE_PRIME,\n  DH_CHECK_P_NOT_PRIME: DH_CHECK_P_NOT_PRIME,\n  DH_UNABLE_TO_CHECK_GENERATOR: DH_UNABLE_TO_CHECK_GENERATOR,\n  DH_NOT_SUITABLE_GENERATOR: DH_NOT_SUITABLE_GENERATOR,\n  ALPN_ENABLED: ALPN_ENABLED,\n  RSA_PKCS1_PADDING: RSA_PKCS1_PADDING,\n  RSA_SSLV23_PADDING: RSA_SSLV23_PADDING,\n  RSA_NO_PADDING: RSA_NO_PADDING,\n  RSA_PKCS1_OAEP_PADDING: RSA_PKCS1_OAEP_PADDING,\n  RSA_X931_PADDING: RSA_X931_PADDING,\n  RSA_PKCS1_PSS_PADDING: RSA_PKCS1_PSS_PADDING,\n  RSA_PSS_SALTLEN_DIGEST: RSA_PSS_SALTLEN_DIGEST,\n  RSA_PSS_SALTLEN_MAX_SIGN: RSA_PSS_SALTLEN_MAX_SIGN,\n  RSA_PSS_SALTLEN_AUTO: RSA_PSS_SALTLEN_AUTO,\n  defaultCoreCipherList: defaultCoreCipherList,\n  TLS1_VERSION: TLS1_VERSION,\n  TLS1_1_VERSION: TLS1_1_VERSION,\n  TLS1_2_VERSION: TLS1_2_VERSION,\n  TLS1_3_VERSION: TLS1_3_VERSION,\n  POINT_CONVERSION_COMPRESSED: POINT_CONVERSION_COMPRESSED,\n  POINT_CONVERSION_UNCOMPRESSED: POINT_CONVERSION_UNCOMPRESSED,\n  POINT_CONVERSION_HYBRID: POINT_CONVERSION_HYBRID\n};\n","domain.js":"/*\n<!-- LICENSEFILE/ -->\n\n<h1>License</h1>\n\nUnless stated otherwise all works are:\n\n<ul><li>Copyright &copy; 2013+ <a href=\"http://bevry.me\">Bevry Pty Ltd</a></li></ul>\n\nand licensed under:\n\n<ul><li><a href=\"http://spdx.org/licenses/MIT.html\">MIT License</a></li></ul>\n\n<h2>MIT License</h2>\n\n<pre>\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the \"Software\"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n</pre>\n\n<!-- /LICENSEFILE -->\n*/\n/*\nmodified by Calvin Metcalf to adhere to how the node one works a little better\n*/\nimport {EventEmitter} from 'events';\nimport inherits from '_inherits';\ninherits(Domain, EventEmitter);\nfunction createEmitError(d) {\n  return emitError;\n  function emitError(e) {\n    d.emit('error', e)\n  }\n}\n\nexport function Domain() {\n  EventEmitter.call(this);\n  this.__emitError = createEmitError(this);\n}\nDomain.prototype.add = function (emitter) {\n  emitter.on('error', this.__emitError);\n}\nDomain.prototype.remove = function(emitter) {\n  emitter.removeListener('error', this.__emitError)\n}\nDomain.prototype.bind = function(fn) {\n  var emitError = this.__emitError;\n  return function() {\n    var args = Array.prototype.slice.call(arguments)\n    try {\n      fn.apply(null, args)\n    } catch (err) {\n      emitError(err)\n    }\n  }\n}\nDomain.prototype.intercept = function(fn) {\n  var emitError = this.__emitError;\n  return function(err) {\n    if (err) {\n      emitError(err)\n    } else {\n      var args = Array.prototype.slice.call(arguments, 1)\n      try {\n        fn.apply(null, args)\n      } catch (err) {\n        emitError(err)\n      }\n    }\n  }\n}\nDomain.prototype.run = function(fn) {\n  var emitError = this.__emitError;\n  try {\n    fn()\n  } catch (err) {\n    emitError(err)\n  }\n  return this\n}\nDomain.prototype.dispose = function() {\n  this.removeAllListeners()\n  return this\n}\nDomain.prototype.enter = Domain.prototype.exit = function() {\n  return this\n}\nexport function createDomain() {\n  return new Domain();\n}\nexport var create = createDomain;\n\nexport default {\n  Domain: Domain,\n  createDomain: createDomain,\n  create: create\n}\n","empty.js":"export default {};\n","events.js":"'use strict';\n\nvar domain;\n\n// This constructor is used to store event handlers. Instantiating this is\n// faster than explicitly calling `Object.create(null)` to get a \"clean\" empty\n// object (tested with v8 v4.9).\nfunction EventHandlers() {}\nEventHandlers.prototype = Object.create(null);\n\nfunction EventEmitter() {\n  EventEmitter.init.call(this);\n}\nexport default EventEmitter;\nexport {EventEmitter};\n\n// nodejs oddity\n// require('events') === require('events').EventEmitter\nEventEmitter.EventEmitter = EventEmitter\n\nEventEmitter.usingDomains = false;\n\nEventEmitter.prototype.domain = undefined;\nEventEmitter.prototype._events = undefined;\nEventEmitter.prototype._maxListeners = undefined;\n\n// By default EventEmitters will print a warning if more than 10 listeners are\n// added to it. This is a useful default which helps finding memory leaks.\nEventEmitter.defaultMaxListeners = 10;\n\nEventEmitter.init = function() {\n  this.domain = null;\n  if (EventEmitter.usingDomains) {\n    // if there is an active domain, then attach to it.\n    if (domain.active && !(this instanceof domain.Domain)) {\n      this.domain = domain.active;\n    }\n  }\n\n  if (!this._events || this._events === Object.getPrototypeOf(this)._events) {\n    this._events = new EventHandlers();\n    this._eventsCount = 0;\n  }\n\n  this._maxListeners = this._maxListeners || undefined;\n};\n\n// Obviously not all Emitters should be limited to 10. This function allows\n// that to be increased. Set to zero for unlimited.\nEventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {\n  if (typeof n !== 'number' || n < 0 || isNaN(n))\n    throw new TypeError('\"n\" argument must be a positive number');\n  this._maxListeners = n;\n  return this;\n};\n\nfunction $getMaxListeners(that) {\n  if (that._maxListeners === undefined)\n    return EventEmitter.defaultMaxListeners;\n  return that._maxListeners;\n}\n\nEventEmitter.prototype.getMaxListeners = function getMaxListeners() {\n  return $getMaxListeners(this);\n};\n\n// These standalone emit* functions are used to optimize calling of event\n// handlers for fast cases because emit() itself often has a variable number of\n// arguments and can be deoptimized because of that. These functions always have\n// the same number of arguments and thus do not get deoptimized, so the code\n// inside them can execute faster.\nfunction emitNone(handler, isFn, self) {\n  if (isFn)\n    handler.call(self);\n  else {\n    var len = handler.length;\n    var listeners = arrayClone(handler, len);\n    for (var i = 0; i < len; ++i)\n      listeners[i].call(self);\n  }\n}\nfunction emitOne(handler, isFn, self, arg1) {\n  if (isFn)\n    handler.call(self, arg1);\n  else {\n    var len = handler.length;\n    var listeners = arrayClone(handler, len);\n    for (var i = 0; i < len; ++i)\n      listeners[i].call(self, arg1);\n  }\n}\nfunction emitTwo(handler, isFn, self, arg1, arg2) {\n  if (isFn)\n    handler.call(self, arg1, arg2);\n  else {\n    var len = handler.length;\n    var listeners = arrayClone(handler, len);\n    for (var i = 0; i < len; ++i)\n      listeners[i].call(self, arg1, arg2);\n  }\n}\nfunction emitThree(handler, isFn, self, arg1, arg2, arg3) {\n  if (isFn)\n    handler.call(self, arg1, arg2, arg3);\n  else {\n    var len = handler.length;\n    var listeners = arrayClone(handler, len);\n    for (var i = 0; i < len; ++i)\n      listeners[i].call(self, arg1, arg2, arg3);\n  }\n}\n\nfunction emitMany(handler, isFn, self, args) {\n  if (isFn)\n    handler.apply(self, args);\n  else {\n    var len = handler.length;\n    var listeners = arrayClone(handler, len);\n    for (var i = 0; i < len; ++i)\n      listeners[i].apply(self, args);\n  }\n}\n\nEventEmitter.prototype.emit = function emit(type) {\n  var er, handler, len, args, i, events, domain;\n  var needDomainExit = false;\n  var doError = (type === 'error');\n\n  events = this._events;\n  if (events)\n    doError = (doError && events.error == null);\n  else if (!doError)\n    return false;\n\n  domain = this.domain;\n\n  // If there is no 'error' event listener then throw.\n  if (doError) {\n    er = arguments[1];\n    if (domain) {\n      if (!er)\n        er = new Error('Uncaught, unspecified \"error\" event');\n      er.domainEmitter = this;\n      er.domain = domain;\n      er.domainThrown = false;\n      domain.emit('error', er);\n    } else if (er instanceof Error) {\n      throw er; // Unhandled 'error' event\n    } else {\n      // At least give some kind of context to the user\n      var err = new Error('Uncaught, unspecified \"error\" event. (' + er + ')');\n      err.context = er;\n      throw err;\n    }\n    return false;\n  }\n\n  handler = events[type];\n\n  if (!handler)\n    return false;\n\n  var isFn = typeof handler === 'function';\n  len = arguments.length;\n  switch (len) {\n    // fast cases\n    case 1:\n      emitNone(handler, isFn, this);\n      break;\n    case 2:\n      emitOne(handler, isFn, this, arguments[1]);\n      break;\n    case 3:\n      emitTwo(handler, isFn, this, arguments[1], arguments[2]);\n      break;\n    case 4:\n      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);\n      break;\n    // slower\n    default:\n      args = new Array(len - 1);\n      for (i = 1; i < len; i++)\n        args[i - 1] = arguments[i];\n      emitMany(handler, isFn, this, args);\n  }\n\n  if (needDomainExit)\n    domain.exit();\n\n  return true;\n};\n\nfunction _addListener(target, type, listener, prepend) {\n  var m;\n  var events;\n  var existing;\n\n  if (typeof listener !== 'function')\n    throw new TypeError('\"listener\" argument must be a function');\n\n  events = target._events;\n  if (!events) {\n    events = target._events = new EventHandlers();\n    target._eventsCount = 0;\n  } else {\n    // To avoid recursion in the case that type === \"newListener\"! Before\n    // adding it to the listeners, first emit \"newListener\".\n    if (events.newListener) {\n      target.emit('newListener', type,\n                  listener.listener ? listener.listener : listener);\n\n      // Re-assign `events` because a newListener handler could have caused the\n      // this._events to be assigned to a new object\n      events = target._events;\n    }\n    existing = events[type];\n  }\n\n  if (!existing) {\n    // Optimize the case of one listener. Don't need the extra array object.\n    existing = events[type] = listener;\n    ++target._eventsCount;\n  } else {\n    if (typeof existing === 'function') {\n      // Adding the second element, need to change to array.\n      existing = events[type] = prepend ? [listener, existing] :\n                                          [existing, listener];\n    } else {\n      // If we've already got an array, just append.\n      if (prepend) {\n        existing.unshift(listener);\n      } else {\n        existing.push(listener);\n      }\n    }\n\n    // Check for listener leak\n    if (!existing.warned) {\n      m = $getMaxListeners(target);\n      if (m && m > 0 && existing.length > m) {\n        existing.warned = true;\n        var w = new Error('Possible EventEmitter memory leak detected. ' +\n                            existing.length + ' ' + type + ' listeners added. ' +\n                            'Use emitter.setMaxListeners() to increase limit');\n        w.name = 'MaxListenersExceededWarning';\n        w.emitter = target;\n        w.type = type;\n        w.count = existing.length;\n        emitWarning(w);\n      }\n    }\n  }\n\n  return target;\n}\nfunction emitWarning(e) {\n  typeof console.warn === 'function' ? console.warn(e) : console.log(e);\n}\nEventEmitter.prototype.addListener = function addListener(type, listener) {\n  return _addListener(this, type, listener, false);\n};\n\nEventEmitter.prototype.on = EventEmitter.prototype.addListener;\n\nEventEmitter.prototype.prependListener =\n    function prependListener(type, listener) {\n      return _addListener(this, type, listener, true);\n    };\n\nfunction _onceWrap(target, type, listener) {\n  var fired = false;\n  function g() {\n    target.removeListener(type, g);\n    if (!fired) {\n      fired = true;\n      listener.apply(target, arguments);\n    }\n  }\n  g.listener = listener;\n  return g;\n}\n\nEventEmitter.prototype.once = function once(type, listener) {\n  if (typeof listener !== 'function')\n    throw new TypeError('\"listener\" argument must be a function');\n  this.on(type, _onceWrap(this, type, listener));\n  return this;\n};\n\nEventEmitter.prototype.prependOnceListener =\n    function prependOnceListener(type, listener) {\n      if (typeof listener !== 'function')\n        throw new TypeError('\"listener\" argument must be a function');\n      this.prependListener(type, _onceWrap(this, type, listener));\n      return this;\n    };\n\n// emits a 'removeListener' event iff the listener was removed\nEventEmitter.prototype.removeListener =\n    function removeListener(type, listener) {\n      var list, events, position, i, originalListener;\n\n      if (typeof listener !== 'function')\n        throw new TypeError('\"listener\" argument must be a function');\n\n      events = this._events;\n      if (!events)\n        return this;\n\n      list = events[type];\n      if (!list)\n        return this;\n\n      if (list === listener || (list.listener && list.listener === listener)) {\n        if (--this._eventsCount === 0)\n          this._events = new EventHandlers();\n        else {\n          delete events[type];\n          if (events.removeListener)\n            this.emit('removeListener', type, list.listener || listener);\n        }\n      } else if (typeof list !== 'function') {\n        position = -1;\n\n        for (i = list.length; i-- > 0;) {\n          if (list[i] === listener ||\n              (list[i].listener && list[i].listener === listener)) {\n            originalListener = list[i].listener;\n            position = i;\n            break;\n          }\n        }\n\n        if (position < 0)\n          return this;\n\n        if (list.length === 1) {\n          list[0] = undefined;\n          if (--this._eventsCount === 0) {\n            this._events = new EventHandlers();\n            return this;\n          } else {\n            delete events[type];\n          }\n        } else {\n          spliceOne(list, position);\n        }\n\n        if (events.removeListener)\n          this.emit('removeListener', type, originalListener || listener);\n      }\n\n      return this;\n    };\n    \n// Alias for removeListener added in NodeJS 10.0\n// https://nodejs.org/api/events.html#events_emitter_off_eventname_listener\nEventEmitter.prototype.off = function(type, listener){\n    return this.removeListener(type, listener);\n};\n\nEventEmitter.prototype.removeAllListeners =\n    function removeAllListeners(type) {\n      var listeners, events;\n\n      events = this._events;\n      if (!events)\n        return this;\n\n      // not listening for removeListener, no need to emit\n      if (!events.removeListener) {\n        if (arguments.length === 0) {\n          this._events = new EventHandlers();\n          this._eventsCount = 0;\n        } else if (events[type]) {\n          if (--this._eventsCount === 0)\n            this._events = new EventHandlers();\n          else\n            delete events[type];\n        }\n        return this;\n      }\n\n      // emit removeListener for all listeners on all events\n      if (arguments.length === 0) {\n        var keys = Object.keys(events);\n        for (var i = 0, key; i < keys.length; ++i) {\n          key = keys[i];\n          if (key === 'removeListener') continue;\n          this.removeAllListeners(key);\n        }\n        this.removeAllListeners('removeListener');\n        this._events = new EventHandlers();\n        this._eventsCount = 0;\n        return this;\n      }\n\n      listeners = events[type];\n\n      if (typeof listeners === 'function') {\n        this.removeListener(type, listeners);\n      } else if (listeners) {\n        // LIFO order\n        do {\n          this.removeListener(type, listeners[listeners.length - 1]);\n        } while (listeners[0]);\n      }\n\n      return this;\n    };\n\nEventEmitter.prototype.listeners = function listeners(type) {\n  var evlistener;\n  var ret;\n  var events = this._events;\n\n  if (!events)\n    ret = [];\n  else {\n    evlistener = events[type];\n    if (!evlistener)\n      ret = [];\n    else if (typeof evlistener === 'function')\n      ret = [evlistener.listener || evlistener];\n    else\n      ret = unwrapListeners(evlistener);\n  }\n\n  return ret;\n};\n\nEventEmitter.listenerCount = function(emitter, type) {\n  if (typeof emitter.listenerCount === 'function') {\n    return emitter.listenerCount(type);\n  } else {\n    return listenerCount.call(emitter, type);\n  }\n};\n\nEventEmitter.prototype.listenerCount = listenerCount;\nfunction listenerCount(type) {\n  var events = this._events;\n\n  if (events) {\n    var evlistener = events[type];\n\n    if (typeof evlistener === 'function') {\n      return 1;\n    } else if (evlistener) {\n      return evlistener.length;\n    }\n  }\n\n  return 0;\n}\n\nEventEmitter.prototype.eventNames = function eventNames() {\n  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];\n};\n\n// About 1.5x faster than the two-arg version of Array#splice().\nfunction spliceOne(list, index) {\n  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)\n    list[i] = list[k];\n  list.pop();\n}\n\nfunction arrayClone(arr, i) {\n  var copy = new Array(i);\n  while (i--)\n    copy[i] = arr[i];\n  return copy;\n}\n\nfunction unwrapListeners(arr) {\n  var ret = new Array(arr.length);\n  for (var i = 0; i < ret.length; ++i) {\n    ret[i] = arr[i].listener || arr[i];\n  }\n  return ret;\n}\n","global.js":"export default (typeof global !== \"undefined\" ? global :\n  typeof self !== \"undefined\" ? self :\n  typeof window !== \"undefined\" ? window : {});","http.js":"/*\nthis and http-lib folder\n\nThe MIT License\n\nCopyright (c) 2015 John Hiesey\n\nPermission is hereby granted, free of charge,\nto any person obtaining a copy of this software and\nassociated documentation files (the \"Software\"), to\ndeal in the Software without restriction, including\nwithout limitation the rights to use, copy, modify,\nmerge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom\nthe Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice\nshall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND,\nEXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES\nOF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.\nIN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR\nANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,\nTORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE\nSOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n\n*/\nimport ClientRequest from '\\0polyfill-node.__http-lib/request';\nimport {parse} from 'url';\n\nexport function request(opts, cb) {\n  if (typeof opts === 'string')\n    opts = parse(opts)\n\n\n  // Normally, the page is loaded from http or https, so not specifying a protocol\n  // will result in a (valid) protocol-relative url. However, this won't work if\n  // the protocol is something else, like 'file:'\n  var defaultProtocol = global.location.protocol.search(/^https?:$/) === -1 ? 'http:' : ''\n\n  var protocol = opts.protocol || defaultProtocol\n  var host = opts.hostname || opts.host\n  var port = opts.port\n  var path = opts.path || '/'\n\n  // Necessary for IPv6 addresses\n  if (host && host.indexOf(':') !== -1)\n    host = '[' + host + ']'\n\n  // This may be a relative url. The browser should always be able to interpret it correctly.\n  opts.url = (host ? (protocol + '//' + host) : '') + (port ? ':' + port : '') + path\n  opts.method = (opts.method || 'GET').toUpperCase()\n  opts.headers = opts.headers || {}\n\n  // Also valid opts.auth, opts.mode\n\n  var req = new ClientRequest(opts)\n  if (cb)\n    req.on('response', cb)\n  return req\n}\n\nexport function get(opts, cb) {\n  var req = request(opts, cb)\n  req.end()\n  return req\n}\n\nexport function Agent() {}\nAgent.defaultMaxSockets = 4\n\nexport var METHODS = [\n  'CHECKOUT',\n  'CONNECT',\n  'COPY',\n  'DELETE',\n  'GET',\n  'HEAD',\n  'LOCK',\n  'M-SEARCH',\n  'MERGE',\n  'MKACTIVITY',\n  'MKCOL',\n  'MOVE',\n  'NOTIFY',\n  'OPTIONS',\n  'PATCH',\n  'POST',\n  'PROPFIND',\n  'PROPPATCH',\n  'PURGE',\n  'PUT',\n  'REPORT',\n  'SEARCH',\n  'SUBSCRIBE',\n  'TRACE',\n  'UNLOCK',\n  'UNSUBSCRIBE'\n]\nexport var STATUS_CODES = {\n  100: 'Continue',\n  101: 'Switching Protocols',\n  102: 'Processing', // RFC 2518, obsoleted by RFC 4918\n  200: 'OK',\n  201: 'Created',\n  202: 'Accepted',\n  203: 'Non-Authoritative Information',\n  204: 'No Content',\n  205: 'Reset Content',\n  206: 'Partial Content',\n  207: 'Multi-Status', // RFC 4918\n  300: 'Multiple Choices',\n  301: 'Moved Permanently',\n  302: 'Moved Temporarily',\n  303: 'See Other',\n  304: 'Not Modified',\n  305: 'Use Proxy',\n  307: 'Temporary Redirect',\n  400: 'Bad Request',\n  401: 'Unauthorized',\n  402: 'Payment Required',\n  403: 'Forbidden',\n  404: 'Not Found',\n  405: 'Method Not Allowed',\n  406: 'Not Acceptable',\n  407: 'Proxy Authentication Required',\n  408: 'Request Time-out',\n  409: 'Conflict',\n  410: 'Gone',\n  411: 'Length Required',\n  412: 'Precondition Failed',\n  413: 'Request Entity Too Large',\n  414: 'Request-URI Too Large',\n  415: 'Unsupported Media Type',\n  416: 'Requested Range Not Satisfiable',\n  417: 'Expectation Failed',\n  418: 'I\\'m a teapot', // RFC 2324\n  422: 'Unprocessable Entity', // RFC 4918\n  423: 'Locked', // RFC 4918\n  424: 'Failed Dependency', // RFC 4918\n  425: 'Unordered Collection', // RFC 4918\n  426: 'Upgrade Required', // RFC 2817\n  428: 'Precondition Required', // RFC 6585\n  429: 'Too Many Requests', // RFC 6585\n  431: 'Request Header Fields Too Large', // RFC 6585\n  500: 'Internal Server Error',\n  501: 'Not Implemented',\n  502: 'Bad Gateway',\n  503: 'Service Unavailable',\n  504: 'Gateway Time-out',\n  505: 'HTTP Version Not Supported',\n  506: 'Variant Also Negotiates', // RFC 2295\n  507: 'Insufficient Storage', // RFC 4918\n  509: 'Bandwidth Limit Exceeded',\n  510: 'Not Extended', // RFC 2774\n  511: 'Network Authentication Required' // RFC 6585\n};\n\nexport default {\n  request,\n  get,\n  Agent,\n  METHODS,\n  STATUS_CODES\n}\n","inherits.js":"\nvar inherits;\nif (typeof Object.create === 'function'){\n  inherits = function inherits(ctor, superCtor) {\n    // implementation from standard node.js 'util' module\n    ctor.super_ = superCtor\n    ctor.prototype = Object.create(superCtor.prototype, {\n      constructor: {\n        value: ctor,\n        enumerable: false,\n        writable: true,\n        configurable: true\n      }\n    });\n  };\n} else {\n  inherits = function inherits(ctor, superCtor) {\n    ctor.super_ = superCtor\n    var TempCtor = function () {}\n    TempCtor.prototype = superCtor.prototype\n    ctor.prototype = new TempCtor()\n    ctor.prototype.constructor = ctor\n  }\n}\nexport default inherits;\n","LICENSE-browserify-fs.txt":"Name: browserify-fs\nVersion: 1.0.0\nLicense: undefined\nPrivate: false\nDescription: fs for the browser using level-filesystem and browserify\nRepository: undefined\n\n---\n\nName: level-js\nVersion: 2.2.4\nLicense: BSD-2-Clause\nPrivate: false\nDescription: leveldown/leveldb library for browsers using IndexedDB\nRepository: git@github.com:maxogden/level.js.git\nAuthor: max ogden\n\n---\n\nName: levelup\nVersion: 0.18.6\nLicense: MIT\nPrivate: false\nDescription: Fast & simple storage - a Node.js-style LevelDB wrapper\nRepository: https://github.com/rvagg/node-levelup.git\nHomepage: https://github.com/rvagg/node-levelup\nContributors:\n  Rod Vagg <r@va.gg> (https://github.com/rvagg)\n  John Chesley <john@chesl.es> (https://github.com/chesles/)\n  Jake Verbaten <raynos2@gmail.com> (https://github.com/raynos)\n  Dominic Tarr <dominic.tarr@gmail.com> (https://github.com/dominictarr)\n  Max Ogden <max@maxogden.com> (https://github.com/maxogden)\n  Lars-Magnus Skog <lars.magnus.skog@gmail.com> (https://github.com/ralphtheninja)\n  David Björklund <david.bjorklund@gmail.com> (https://github.com/kesla)\n  Julian Gruber <julian@juliangruber.com> (https://github.com/juliangruber)\n  Paolo Fragomeni <paolo@async.ly> (https://github.com/hij1nx)\n  Anton Whalley <anton.whalley@nearform.com> (https://github.com/No9)\n  Matteo Collina <matteo.collina@gmail.com> (https://github.com/mcollina)\n  Pedro Teixeira <pedro.teixeira@gmail.com> (https://github.com/pgte)\n  James Halliday <mail@substack.net> (https://github.com/substack)\n\n---\n\nName: level-filesystem\nVersion: 1.2.0\nLicense: undefined\nPrivate: false\nDescription: Full implementation of the fs module on top of leveldb\nRepository: undefined\n\n---\n\nName: rollup-plugin-node-resolve\nVersion: 5.0.1\nLicense: MIT\nPrivate: false\nDescription: Bundle third-party dependencies in node_modules\nRepository: undefined\nHomepage: https://github.com/rollup/rollup-plugin-node-resolve#readme\nAuthor: Rich Harris <richard.a.harris@gmail.com>\n\n---\n\nName: prr\nVersion: 0.0.0\nLicense: MIT\nPrivate: false\nDescription: A better Object.defineProperty()\nRepository: https://github.com/rvagg/prr.git\nHomepage: https://github.com/rvagg/prr\n\n---\n\nName: xtend\nVersion: 2.1.2\nLicense: (MIT)\nPrivate: false\nDescription: extend like a boss\nRepository: undefined\nHomepage: https://github.com/Raynos/xtend\nAuthor: Raynos <raynos2@gmail.com>\nContributors:\n  Jake Verbaten\n  Matt Esch\n\n---\n\nName: once\nVersion: 1.4.0\nLicense: ISC\nPrivate: false\nDescription: Run a function exactly one time\nRepository: git://github.com/isaacs/once\nAuthor: Isaac Z. Schlueter <i@izs.me> (http://blog.izs.me/)\n\n---\n\nName: octal\nVersion: 1.0.0\nLicense: MIT\nPrivate: false\nDescription: Interpret a number as base 8\nRepository: https://github.com/mafintosh/octal.git\nHomepage: https://github.com/mafintosh/octal\nAuthor: Mathias Buus (@mafintosh)\n\n---\n\nName: readable-stream\nVersion: 1.0.34\nLicense: MIT\nPrivate: false\nDescription: Streams2, a user-land copy of the stream library from Node.js v0.10.x\nRepository: git://github.com/isaacs/readable-stream\nAuthor: Isaac Z. Schlueter <i@izs.me> (http://blog.izs.me/)\n\n---\n\nName: level-blobs\nVersion: 0.1.7\nLicense: undefined\nPrivate: false\nDescription: Save binary blobs in level and stream then back\nRepository: undefined\n\n---\n\nName: level-sublevel\nVersion: 5.2.3\nLicense: MIT\nPrivate: false\nDescription: partition levelup databases\nRepository: git://github.com/dominictarr/level-sublevel.git\nHomepage: https://github.com/dominictarr/level-sublevel\nAuthor: Dominic Tarr <dominic.tarr@gmail.com> (http://dominictarr.com)\n\n---\n\nName: fwd-stream\nVersion: 1.0.4\nLicense: undefined\nPrivate: false\nDescription: Forward a readable stream to another readable stream or a writable stream to another writable stream\nRepository: undefined\n\n---\n\nName: level-peek\nVersion: 1.0.6\nLicense: MIT\nPrivate: false\nRepository: git://github.com/dominictarr/level-peek.git\nHomepage: https://github.com/dominictarr/level-peek\nAuthor: Dominic Tarr <dominic.tarr@gmail.com> (http://dominictarr.com)\n\n---\n\nName: errno\nVersion: 0.1.7\nLicense: MIT\nPrivate: false\nDescription: libuv errno details exposed\nRepository: https://github.com/rvagg/node-errno.git\n\n---\n\nName: concat-stream\nVersion: 1.6.2\nLicense: MIT\nPrivate: false\nDescription: writable stream that concatenates strings or binary data and calls a callback with the result\nRepository: http://github.com/maxogden/concat-stream.git\nAuthor: Max Ogden <max@maxogden.com>\n\n---\n\nName: inherits\nVersion: 2.0.3\nLicense: ISC\nPrivate: false\nDescription: Browser-friendly inheritance fully compatible with standard node.js inherits()\nRepository: undefined\n\n---\n\nName: idb-wrapper\nVersion: 1.7.2\nLicense: MIT\nPrivate: false\nDescription: A cross-browser wrapper for IndexedDB\nRepository: undefined\nHomepage: https://github.com/jensarps/IDBWrapper\nAuthor: jensarps <mail@jensarps.de> (http://jensarps.de/)\nContributors:\n  Github Contributors (https://github.com/jensarps/IDBWrapper/graphs/contributors)\n\n---\n\nName: typedarray-to-buffer\nVersion: 1.0.4\nLicense: MIT\nPrivate: false\nDescription: Convert a typed array to a Buffer without a copy\nRepository: git://github.com/feross/typedarray-to-buffer.git\nHomepage: http://feross.org\nAuthor: Feross Aboukhadijeh <feross@feross.org> (http://feross.org/)\n\n---\n\nName: abstract-leveldown\nVersion: 0.12.4\nLicense: MIT\nPrivate: false\nDescription: An abstract prototype matching the LevelDOWN API\nRepository: https://github.com/rvagg/node-abstract-leveldown.git\nHomepage: https://github.com/rvagg/node-abstract-leveldown\nContributors:\n  Rod Vagg <r@va.gg> (https://github.com/rvagg)\n  John Chesley <john@chesl.es> (https://github.com/chesles/)\n  Jake Verbaten <raynos2@gmail.com> (https://github.com/raynos)\n  Dominic Tarr <dominic.tarr@gmail.com> (https://github.com/dominictarr)\n  Max Ogden <max@maxogden.com> (https://github.com/maxogden)\n  Lars-Magnus Skog <lars.magnus.skog@gmail.com> (https://github.com/ralphtheninja)\n  David Björklund <david.bjorklund@gmail.com> (https://github.com/kesla)\n  Julian Gruber <julian@juliangruber.com> (https://github.com/juliangruber)\n  Paolo Fragomeni <paolo@async.ly> (https://github.com/hij1nx)\n  Anton Whalley <anton.whalley@nearform.com> (https://github.com/No9)\n  Matteo Collina <matteo.collina@gmail.com> (https://github.com/mcollina)\n  Pedro Teixeira <pedro.teixeira@gmail.com> (https://github.com/pgte)\n  James Halliday <mail@substack.net> (https://github.com/substack)\n\n---\n\nName: isbuffer\nVersion: 0.0.0\nLicense: MIT\nPrivate: false\nDescription: isBuffer for node and browser (supports typed arrays)\nRepository: git://github.com/juliangruber/isbuffer.git\nHomepage: https://github.com/juliangruber/isbuffer\nAuthor: Julian Gruber <mail@juliangruber.com> (http://juliangruber.com)\n\n---\n\nName: deferred-leveldown\nVersion: 0.2.0\nLicense: MIT\nPrivate: false\nDescription: For handling delayed-open on LevelDOWN compatible libraries\nRepository: https://github.com/Level/deferred-leveldown.git\nHomepage: https://github.com/Level/deferred-leveldown\nContributors:\n  Rod Vagg <r@va.gg> (https://github.com/rvagg)\n  John Chesley <john@chesl.es> (https://github.com/chesles/)\n  Jake Verbaten <raynos2@gmail.com> (https://github.com/raynos)\n  Dominic Tarr <dominic.tarr@gmail.com> (https://github.com/dominictarr)\n  Max Ogden <max@maxogden.com> (https://github.com/maxogden)\n  Lars-Magnus Skog <lars.magnus.skog@gmail.com> (https://github.com/ralphtheninja)\n  David Björklund <david.bjorklund@gmail.com> (https://github.com/kesla)\n  Julian Gruber <julian@juliangruber.com> (https://github.com/juliangruber)\n  Paolo Fragomeni <paolo@async.ly> (https://github.com/hij1nx)\n  Anton Whalley <anton.whalley@nearform.com> (https://github.com/No9)\n  Matteo Collina <matteo.collina@gmail.com> (https://github.com/mcollina)\n  Pedro Teixeira <pedro.teixeira@gmail.com> (https://github.com/pgte)\n  James Halliday <mail@substack.net> (https://github.com/substack)\n\n---\n\nName: wrappy\nVersion: 1.0.2\nLicense: ISC\nPrivate: false\nDescription: Callback wrapping utility\nRepository: https://github.com/npm/wrappy\nHomepage: https://github.com/npm/wrappy\nAuthor: Isaac Z. Schlueter <i@izs.me> (http://blog.izs.me/)\n\n---\n\nName: bl\nVersion: 0.8.2\nLicense: MIT\nPrivate: false\nDescription: Buffer List: collect buffers and access with a standard readable Buffer interface, streamable too!\nRepository: https://github.com/rvagg/bl.git\nHomepage: https://github.com/rvagg/bl\n\n---\n\nName: object-keys\nVersion: 0.4.0\nLicense: MIT\nPrivate: false\nDescription: An Object.keys replacement, in case Object.keys is not available. From https://github.com/kriskowal/es5-shim\nRepository: git://github.com/ljharb/object-keys.git\nAuthor: Jordan Harband\n\n---\n\nName: ltgt\nVersion: 2.2.1\nLicense: MIT\nPrivate: false\nRepository: git://github.com/dominictarr/ltgt.git\nHomepage: https://github.com/dominictarr/ltgt\nAuthor: Dominic Tarr <dominic.tarr@gmail.com> (http://dominictarr.com)\n\n---\n\nName: typedarray\nVersion: 0.0.6\nLicense: MIT\nPrivate: false\nDescription: TypedArray polyfill for old browsers\nRepository: git://github.com/substack/typedarray.git\nHomepage: https://github.com/substack/typedarray\nAuthor: James Halliday <mail@substack.net> (http://substack.net)\n\n---\n\nName: level-fix-range\nVersion: 2.0.0\nLicense: MIT\nPrivate: false\nDescription: make using levelup reverse ranges easy\nRepository: git://github.com/dominictarr/level-fix-range.git\nHomepage: https://github.com/dominictarr/level-fix-range\nAuthor: Dominic Tarr <dominic.tarr@gmail.com> (http://dominictarr.com)\n\n---\n\nName: buffer-from\nVersion: 1.1.1\nLicense: MIT\nPrivate: false\nRepository: undefined\n\n---\n\nName: isarray\nVersion: 0.0.1\nLicense: MIT\nPrivate: false\nDescription: Array#isArray for older browsers\nRepository: git://github.com/juliangruber/isarray.git\nHomepage: https://github.com/juliangruber/isarray\nAuthor: Julian Gruber <mail@juliangruber.com> (http://juliangruber.com)\n\n---\n\nName: string_decoder\nVersion: 0.10.31\nLicense: MIT\nPrivate: false\nDescription: The string_decoder module from Node core\nRepository: git://github.com/rvagg/string_decoder.git\nHomepage: https://github.com/rvagg/string_decoder\n\n---\n\nName: safe-buffer\nVersion: 5.1.2\nLicense: MIT\nPrivate: false\nDescription: Safer Node.js Buffer API\nRepository: git://github.com/feross/safe-buffer.git\nHomepage: https://github.com/feross/safe-buffer\nAuthor: Feross Aboukhadijeh <feross@feross.org> (http://feross.org)\n\n---\n\nName: level-hooks\nVersion: 4.5.0\nLicense: undefined\nPrivate: false\nDescription: pre/post hooks for leveldb\nRepository: git://github.com/dominictarr/level-hooks.git\nHomepage: https://github.com/dominictarr/level-hooks\nAuthor: Dominic Tarr <dominic.tarr@gmail.com> (http://bit.ly/dominictarr)\n\n---\n\nName: core-util-is\nVersion: 1.0.2\nLicense: MIT\nPrivate: false\nDescription: The `util.is*` functions introduced in Node v0.12.\nRepository: git://github.com/isaacs/core-util-is\nAuthor: Isaac Z. Schlueter <i@izs.me> (http://blog.izs.me/)\n\n---\n\nName: string-range\nVersion: 1.2.2\nLicense: MIT\nPrivate: false\nDescription: check if a string is within a range\nRepository: git://github.com/dominictarr/string-range.git\nHomepage: https://github.com/dominictarr/string-range\nAuthor: Dominic Tarr <dominic.tarr@gmail.com> (http://dominictarr.com)\n\n---\n\nName: process-nextick-args\nVersion: 2.0.0\nLicense: MIT\nPrivate: false\nDescription: process.nextTick but always with args\nRepository: https://github.com/calvinmetcalf/process-nextick-args.git\nHomepage: https://github.com/calvinmetcalf/process-nextick-args\n\n---\n\nName: util-deprecate\nVersion: 1.0.2\nLicense: MIT\nPrivate: false\nDescription: The Node.js `util.deprecate()` function with browser support\nRepository: git://github.com/TooTallNate/util-deprecate.git\nHomepage: https://github.com/TooTallNate/util-deprecate\nAuthor: Nathan Rajlich <nathan@tootallnate.net> (http://n8.io/)\n\n---\n\nName: clone\nVersion: 0.1.19\nLicense: MIT\nPrivate: false\nDescription: deep cloning of objects and arrays\nRepository: git://github.com/pvorb/node-clone.git\nAuthor: Paul Vorbach <paul@vorba.ch> (http://paul.vorba.ch/)\nContributors:\n  Blake Miner <miner.blake@gmail.com> (http://www.blakeminer.com/)\n  Tian You <axqd001@gmail.com> (http://blog.axqd.net/)\n  George Stagas <gstagas@gmail.com> (http://stagas.com/)\n  Tobiasz Cudnik <tobiasz.cudnik@gmail.com> (https://github.com/TobiaszCudnik)\n  Pavel Lang <langpavel@phpskelet.org> (https://github.com/langpavel)\n  Dan MacTough (http://yabfog.com/)\n  w1nk (https://github.com/w1nk)\n  Hugh Kennedy (http://twitter.com/hughskennedy)\n  Dustin Diaz (http://dustindiaz.com)\n  Ilya Shaisultanov (https://github.com/diversario)\n  Nathan MacInnes <nathan@macinn.es> (http://macinn.es/)\n  Benjamin E. Coe <ben@npmjs.com> (https://twitter.com/benjamincoe)\n  Nathan Zadoks (https://github.com/nathan7)\n  Róbert Oroszi <robert+gh@oroszi.net> (https://github.com/oroce)\n\n---\n\nName: is\nVersion: 0.2.7\nLicense: undefined\nPrivate: false\nDescription: the definitive JavaScript type testing library\nRepository: git://github.com/enricomarino/is.git\nHomepage: https://github.com/enricomarino/is\nAuthor: Enrico Marino (http://onirame.com)\nContributors:\n  Jordan Harband (https://github.com/ljharb)\n\n---\n\nName: foreach\nVersion: 2.0.5\nLicense: MIT\nPrivate: false\nDescription: foreach component + npm package\nRepository: git://github.com/manuelstofer/foreach\nAuthor: Manuel Stofer <manuel@takimata.ch>\nContributors:\n  Manuel Stofer\n  Jordan Harband (https://github.com/ljharb)","LICENSE-buffer-es6.txt":"Name: buffer-es6\nVersion: 4.9.3\nLicense: MIT\nPrivate: false\nDescription: Node.js Buffer API, for the browser\nRepository: git://github.com/calvinmetcalf/buffer-es6.git\nAuthor: Feross Aboukhadijeh <feross@feross.org> (http://feross.org)\nContributors:\n  Romain Beauxis <toots@rastageeks.org>\n  James Halliday <mail@substack.net>\nLicense Copyright:\n===\n\nThe MIT License (MIT)\n\nCopyright (c) Feross Aboukhadijeh, and other contributors.\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in\nall copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\nTHE SOFTWARE.\n\n===========================================\nieee754 originally contained this license:\n===========================================\n\nCopyright (c) 2008, Fair Oaks Labs, Inc.\nAll rights reserved.\n\nRedistribution and use in source and binary forms, with or without\nmodification, are permitted provided that the following conditions are met:\n\n * Redistributions of source code must retain the above copyright notice,\n   this list of conditions and the following disclaimer.\n\n * Redistributions in binary form must reproduce the above copyright notice,\n   this list of conditions and the following disclaimer in the documentation\n   and/or other materials provided with the distribution.\n\n * Neither the name of Fair Oaks Labs, Inc. nor the names of its contributors\n   may be used to endorse or promote products derived from this software\n   without specific prior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\"\nAND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE\nIMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE\nARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE\nLIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR\nCONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF\nSUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS\nINTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN\nCONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)\nARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE\nPOSSIBILITY OF SUCH DAMAGE.\n\nModifications to writeIEEE754 to support negative zeroes made by Brian White.","LICENSE-crypto-browserify.txt":"Name: crypto-browserify\nVersion: 3.12.0\nLicense: MIT\nPrivate: false\nDescription: implementation of crypto for the browser\nRepository: git://github.com/crypto-browserify/crypto-browserify.git\nHomepage: https://github.com/crypto-browserify/crypto-browserify\nAuthor: Dominic Tarr <dominic.tarr@gmail.com> (dominictarr.com)\n\n---\n\nName: browserify-sign\nVersion: 4.0.4\nLicense: ISC\nPrivate: false\nDescription: adds node crypto signing for browsers\nRepository: https://github.com/crypto-browserify/browserify-sign.git\n\n---\n\nName: randombytes\nVersion: 2.1.0\nLicense: MIT\nPrivate: false\nDescription: random bytes from browserify stand alone\nRepository: git@github.com:crypto-browserify/randombytes.git\nHomepage: https://github.com/crypto-browserify/randombytes\n\n---\n\nName: create-hash\nVersion: 1.2.0\nLicense: MIT\nPrivate: false\nDescription: create hashes for browserify\nRepository: git@github.com:crypto-browserify/createHash.git\nHomepage: https://github.com/crypto-browserify/createHash\n\n---\n\nName: browserify-cipher\nVersion: 1.0.1\nLicense: MIT\nPrivate: false\nDescription: ciphers for the browser\nRepository: git@github.com:crypto-browserify/browserify-cipher.git\nAuthor: Calvin Metcalf <calvin.metcalf@gmail.com>\n\n---\n\nName: pbkdf2\nVersion: 3.0.17\nLicense: MIT\nPrivate: false\nDescription: This library provides the functionality of PBKDF2 with the ability to use any supported hashing algorithm returned from crypto.getHashes()\nRepository: https://github.com/crypto-browserify/pbkdf2.git\nHomepage: https://github.com/crypto-browserify/pbkdf2\nAuthor: Daniel Cousens\n\n---\n\nName: diffie-hellman\nVersion: 5.0.3\nLicense: MIT\nPrivate: false\nDescription: pure js diffie-hellman\nRepository: https://github.com/crypto-browserify/diffie-hellman.git\nHomepage: https://github.com/crypto-browserify/diffie-hellman\nAuthor: Calvin Metcalf\n\n---\n\nName: create-hmac\nVersion: 1.1.7\nLicense: MIT\nPrivate: false\nDescription: node style hmacs in the browser\nRepository: https://github.com/crypto-browserify/createHmac.git\nHomepage: https://github.com/crypto-browserify/createHmac\n\n---\n\nName: create-ecdh\nVersion: 4.0.3\nLicense: MIT\nPrivate: false\nDescription: createECDH but browserifiable\nRepository: https://github.com/crypto-browserify/createECDH.git\nHomepage: https://github.com/crypto-browserify/createECDH\nAuthor: Calvin Metcalf\n\n---\n\nName: public-encrypt\nVersion: 4.0.3\nLicense: MIT\nPrivate: false\nDescription: browserify version of publicEncrypt & privateDecrypt\nRepository: https://github.com/crypto-browserify/publicEncrypt.git\nHomepage: https://github.com/crypto-browserify/publicEncrypt\nAuthor: Calvin Metcalf\n\n---\n\nName: randomfill\nVersion: 1.0.4\nLicense: MIT\nPrivate: false\nDescription: random fill from browserify stand alone\nRepository: https://github.com/crypto-browserify/randomfill.git\nHomepage: https://github.com/crypto-browserify/randomfill\n\n---\n\nName: browserify-des\nVersion: 1.0.2\nLicense: MIT\nPrivate: false\nRepository: git+https://github.com/crypto-browserify/browserify-des.git\nHomepage: https://github.com/crypto-browserify/browserify-des#readme\nAuthor: Calvin Metcalf <calvin.metcalf@gmail.com>\n\n---\n\nName: browserify-aes\nVersion: 1.2.0\nLicense: MIT\nPrivate: false\nDescription: aes, for browserify\nRepository: git://github.com/crypto-browserify/browserify-aes.git\nHomepage: https://github.com/crypto-browserify/browserify-aes\n\n---\n\nName: safe-buffer\nVersion: 5.1.2\nLicense: MIT\nPrivate: false\nDescription: Safer Node.js Buffer API\nRepository: git://github.com/feross/safe-buffer.git\nHomepage: https://github.com/feross/safe-buffer\nAuthor: Feross Aboukhadijeh <feross@feross.org> (http://feross.org)\n\n---\n\nName: md5.js\nVersion: 1.3.5\nLicense: MIT\nPrivate: false\nDescription: node style md5 on pure JavaScript\nRepository: https://github.com/crypto-browserify/md5.js.git\nHomepage: https://github.com/crypto-browserify/md5.js\nAuthor: Kirill Fomichev <fanatid@ya.ru> (https://github.com/fanatid)\n\n---\n\nName: inherits\nVersion: 2.0.3\nLicense: ISC\nPrivate: false\nDescription: Browser-friendly inheritance fully compatible with standard node.js inherits()\nRepository: undefined\n\n---\n\nName: cipher-base\nVersion: 1.0.4\nLicense: MIT\nPrivate: false\nDescription: abstract base class for crypto-streams\nRepository: git+https://github.com/crypto-browserify/cipher-base.git\nHomepage: https://github.com/crypto-browserify/cipher-base#readme\nAuthor: Calvin Metcalf <calvin.metcalf@gmail.com>\n\n---\n\nName: evp_bytestokey\nVersion: 1.0.3\nLicense: MIT\nPrivate: false\nDescription: The insecure key derivation algorithm from OpenSSL\nRepository: https://github.com/crypto-browserify/EVP_BytesToKey.git\nHomepage: https://github.com/crypto-browserify/EVP_BytesToKey\nAuthor: Calvin Metcalf <calvin.metcalf@gmail.com>\nContributors:\n  Kirill Fomichev <fanatid@ya.ru>\n\n---\n\nName: elliptic\nVersion: 6.4.1\nLicense: MIT\nPrivate: false\nDescription: EC cryptography\nRepository: git@github.com:indutny/elliptic\nHomepage: https://github.com/indutny/elliptic\nAuthor: Fedor Indutny <fedor@indutny.com>\n\n---\n\nName: bn.js\nVersion: 4.11.8\nLicense: MIT\nPrivate: false\nDescription: Big number implementation in pure javascript\nRepository: git@github.com:indutny/bn.js\nHomepage: https://github.com/indutny/bn.js\nAuthor: Fedor Indutny <fedor@indutny.com>\n\n---\n\nName: browserify-rsa\nVersion: 4.0.1\nLicense: MIT\nPrivate: false\nDescription: RSA for browserify\nRepository: git@github.com:crypto-browserify/browserify-rsa.git\n\n---\n\nName: parse-asn1\nVersion: 5.1.4\nLicense: ISC\nPrivate: false\nDescription: utility library for parsing asn1 files for use with browserify-sign.\nRepository: git://github.com/crypto-browserify/parse-asn1.git\n\n---\n\nName: ripemd160\nVersion: 2.0.2\nLicense: MIT\nPrivate: false\nDescription: Compute ripemd160 of bytes or strings.\nRepository: https://github.com/crypto-browserify/ripemd160\n\n---\n\nName: sha.js\nVersion: 2.4.11\nLicense: (MIT AND BSD-3-Clause)\nPrivate: false\nDescription: Streamable SHA hashes in pure javascript\nRepository: git://github.com/crypto-browserify/sha.js.git\nHomepage: https://github.com/crypto-browserify/sha.js\nAuthor: Dominic Tarr <dominic.tarr@gmail.com> (dominictarr.com)\n\n---\n\nName: miller-rabin\nVersion: 4.0.1\nLicense: MIT\nPrivate: false\nDescription: Miller Rabin algorithm for primality test\nRepository: git@github.com:indutny/miller-rabin\nHomepage: https://github.com/indutny/miller-rabin\nAuthor: Fedor Indutny <fedor@indutny.com>\n\n---\n\nName: des.js\nVersion: 1.0.0\nLicense: MIT\nPrivate: false\nDescription: DES implementation\nRepository: git+ssh://git@github.com/indutny/des.js.git\nHomepage: https://github.com/indutny/des.js#readme\nAuthor: Fedor Indutny <fedor@indutny.com>\n\n---\n\nName: hash-base\nVersion: 3.0.4\nLicense: MIT\nPrivate: false\nDescription: abstract base class for hash-streams\nRepository: https://github.com/crypto-browserify/hash-base.git\nHomepage: https://github.com/crypto-browserify/hash-base\nAuthor: Kirill Fomichev <fanatid@ya.ru> (https://github.com/fanatid)\n\n---\n\nName: brorand\nVersion: 1.1.0\nLicense: MIT\nPrivate: false\nDescription: Random number generator for browsers and node.js\nRepository: git@github.com:indutny/brorand\nHomepage: https://github.com/indutny/brorand\nAuthor: Fedor Indutny <fedor@indutny.com>\n\n---\n\nName: buffer-xor\nVersion: 1.0.3\nLicense: MIT\nPrivate: false\nDescription: A simple module for bitwise-xor on buffers\nRepository: https://github.com/crypto-browserify/buffer-xor.git\nHomepage: https://github.com/crypto-browserify/buffer-xor\nAuthor: Daniel Cousens\n\n---\n\nName: asn1.js\nVersion: 4.10.1\nLicense: MIT\nPrivate: false\nDescription: ASN.1 encoder and decoder\nRepository: git@github.com:indutny/asn1.js\nHomepage: https://github.com/indutny/asn1.js\nAuthor: Fedor Indutny\n\n---\n\nName: minimalistic-assert\nVersion: 1.0.1\nLicense: ISC\nPrivate: false\nDescription: minimalistic-assert ===\nRepository: https://github.com/calvinmetcalf/minimalistic-assert.git\nHomepage: https://github.com/calvinmetcalf/minimalistic-assert\n\n---\n\nName: hash.js\nVersion: 1.1.7\nLicense: MIT\nPrivate: false\nDescription: Various hash functions that could be run by both browser and node\nRepository: git@github.com:indutny/hash.js\nHomepage: https://github.com/indutny/hash.js\nAuthor: Fedor Indutny <fedor@indutny.com>\n\n---\n\nName: minimalistic-crypto-utils\nVersion: 1.0.1\nLicense: MIT\nPrivate: false\nDescription: Minimalistic tools for JS crypto modules\nRepository: git+ssh://git@github.com/indutny/minimalistic-crypto-utils.git\nHomepage: https://github.com/indutny/minimalistic-crypto-utils#readme\nAuthor: Fedor Indutny <fedor@indutny.com>\n\n---\n\nName: hmac-drbg\nVersion: 1.0.1\nLicense: MIT\nPrivate: false\nDescription: Deterministic random bit generator (hmac)\nRepository: git+ssh://git@github.com/indutny/hmac-drbg.git\nHomepage: https://github.com/indutny/hmac-drbg#readme\nAuthor: Fedor Indutny <fedor@indutny.com>","LICENSE-process-es6.txt":"Name: process-es6\nVersion: 0.11.6\nLicense: MIT\nPrivate: false\nDescription: process information for node.js and browsers, but in es6\nRepository: git://github.com/calvinmetcalf/node-process-es6.git\nAuthor: Roman Shtylman <shtylman@gmail.com>\nLicense Copyright:\n===\n\n(The MIT License)\n\nCopyright (c) 2013 Roman Shtylman <shtylman@gmail.com>\n\nPermission is hereby granted, free of charge, to any person obtaining\na copy of this software and associated documentation files (the\n'Software'), to deal in the Software without restriction, including\nwithout limitation the rights to use, copy, modify, merge, publish,\ndistribute, sublicense, and/or sell copies of the Software, and to\npermit persons to whom the Software is furnished to do so, subject to\nthe following conditions:\n\nThe above copyright notice and this permission notice shall be\nincluded in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,\nEXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\nMERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.\nIN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY\nCLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,\nTORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE\nSOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.","os.js":"/*\nThe MIT License (MIT)\n\nCopyright (c) 2016 CoderPuppy\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n\n*/\nvar _endianness;\nexport function endianness() {\n  if (typeof _endianness === 'undefined') {\n    var a = new ArrayBuffer(2);\n    var b = new Uint8Array(a);\n    var c = new Uint16Array(a);\n    b[0] = 1;\n    b[1] = 2;\n    if (c[0] === 258) {\n      _endianness = 'BE';\n    } else if (c[0] === 513){\n      _endianness = 'LE';\n    } else {\n      throw new Error('unable to figure out endianess');\n    }\n  }\n  return _endianness;\n}\n\nexport function hostname() {\n  if (typeof global.location !== 'undefined') {\n    return global.location.hostname\n  } else return '';\n}\n\nexport function loadavg() {\n  return [];\n}\n\nexport function uptime() {\n  return 0;\n}\n\nexport function freemem() {\n  return Number.MAX_VALUE;\n}\n\nexport function totalmem() {\n  return Number.MAX_VALUE;\n}\n\nexport function cpus() {\n  return [];\n}\n\nexport function type() {\n  return 'Browser';\n}\n\nexport function release () {\n  if (typeof global.navigator !== 'undefined') {\n    return global.navigator.appVersion;\n  }\n  return '';\n}\n\nexport function networkInterfaces () {\n  return {};\n}\n\nexport function getNetworkInterfaces () {\n  return {};\n}\n\nexport function arch() {\n  return 'javascript';\n}\n\nexport function platform() {\n  return 'browser';\n}\n\nexport function tmpDir() {\n  return '/tmp';\n}\nexport var tmpdir = tmpDir;\n\nexport var EOL = '\\n';\nexport default {\n  EOL: EOL,\n  arch: arch,\n  platform: platform,\n  tmpdir: tmpdir,\n  tmpDir: tmpDir,\n  networkInterfaces:networkInterfaces,\n  getNetworkInterfaces: getNetworkInterfaces,\n  release: release,\n  type: type,\n  cpus: cpus,\n  totalmem: totalmem,\n  freemem: freemem,\n  uptime: uptime,\n  loadavg: loadavg,\n  hostname: hostname,\n  endianness: endianness,\n}\n","path.js":"// Copyright Joyent, Inc. and other Node contributors.\n//\n// Permission is hereby granted, free of charge, to any person obtaining a\n// copy of this software and associated documentation files (the\n// \"Software\"), to deal in the Software without restriction, including\n// without limitation the rights to use, copy, modify, merge, publish,\n// distribute, sublicense, and/or sell copies of the Software, and to permit\n// persons to whom the Software is furnished to do so, subject to the\n// following conditions:\n//\n// The above copyright notice and this permission notice shall be included\n// in all copies or substantial portions of the Software.\n//\n// THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS\n// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\n// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN\n// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,\n// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR\n// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE\n// USE OR OTHER DEALINGS IN THE SOFTWARE.\n\n// resolves . and .. elements in a path array with directory names there\n// must be no slashes, empty elements, or device names (c:\\) in the array\n// (so also no leading and trailing slashes - it does not distinguish\n// relative and absolute paths)\nfunction normalizeArray(parts, allowAboveRoot) {\n  // if the path tries to go above the root, `up` ends up > 0\n  var up = 0;\n  for (var i = parts.length - 1; i >= 0; i--) {\n    var last = parts[i];\n    if (last === '.') {\n      parts.splice(i, 1);\n    } else if (last === '..') {\n      parts.splice(i, 1);\n      up++;\n    } else if (up) {\n      parts.splice(i, 1);\n      up--;\n    }\n  }\n\n  // if the path is allowed to go above the root, restore leading ..s\n  if (allowAboveRoot) {\n    for (; up--; up) {\n      parts.unshift('..');\n    }\n  }\n\n  return parts;\n}\n\n// Split a filename into [root, dir, basename, ext], unix version\n// 'root' is just a slash, or nothing.\nvar splitPathRe =\n    /^(\\/?|)([\\s\\S]*?)((?:\\.{1,2}|[^\\/]+?|)(\\.[^.\\/]*|))(?:[\\/]*)$/;\nvar splitPath = function(filename) {\n  return splitPathRe.exec(filename).slice(1);\n};\n\n// path.resolve([from ...], to)\n// posix version\nexport function resolve() {\n  var resolvedPath = '',\n      resolvedAbsolute = false;\n\n  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {\n    var path = (i >= 0) ? arguments[i] : '/';\n\n    // Skip empty and invalid entries\n    if (typeof path !== 'string') {\n      throw new TypeError('Arguments to path.resolve must be strings');\n    } else if (!path) {\n      continue;\n    }\n\n    resolvedPath = path + '/' + resolvedPath;\n    resolvedAbsolute = path.charAt(0) === '/';\n  }\n\n  // At this point the path should be resolved to a full absolute path, but\n  // handle relative paths to be safe (might happen when process.cwd() fails)\n\n  // Normalize the path\n  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {\n    return !!p;\n  }), !resolvedAbsolute).join('/');\n\n  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';\n};\n\n// path.normalize(path)\n// posix version\nexport function normalize(path) {\n  var isPathAbsolute = isAbsolute(path),\n      trailingSlash = substr(path, -1) === '/';\n\n  // Normalize the path\n  path = normalizeArray(filter(path.split('/'), function(p) {\n    return !!p;\n  }), !isPathAbsolute).join('/');\n\n  if (!path && !isPathAbsolute) {\n    path = '.';\n  }\n  if (path && trailingSlash) {\n    path += '/';\n  }\n\n  return (isPathAbsolute ? '/' : '') + path;\n};\n\n// posix version\nexport function isAbsolute(path) {\n  return path.charAt(0) === '/';\n}\n\n// posix version\nexport function join() {\n  var paths = Array.prototype.slice.call(arguments, 0);\n  return normalize(filter(paths, function(p, index) {\n    if (typeof p !== 'string') {\n      throw new TypeError('Arguments to path.join must be strings');\n    }\n    return p;\n  }).join('/'));\n}\n\n\n// path.relative(from, to)\n// posix version\nexport function relative(from, to) {\n  from = resolve(from).substr(1);\n  to = resolve(to).substr(1);\n\n  function trim(arr) {\n    var start = 0;\n    for (; start < arr.length; start++) {\n      if (arr[start] !== '') break;\n    }\n\n    var end = arr.length - 1;\n    for (; end >= 0; end--) {\n      if (arr[end] !== '') break;\n    }\n\n    if (start > end) return [];\n    return arr.slice(start, end - start + 1);\n  }\n\n  var fromParts = trim(from.split('/'));\n  var toParts = trim(to.split('/'));\n\n  var length = Math.min(fromParts.length, toParts.length);\n  var samePartsLength = length;\n  for (var i = 0; i < length; i++) {\n    if (fromParts[i] !== toParts[i]) {\n      samePartsLength = i;\n      break;\n    }\n  }\n\n  var outputParts = [];\n  for (var i = samePartsLength; i < fromParts.length; i++) {\n    outputParts.push('..');\n  }\n\n  outputParts = outputParts.concat(toParts.slice(samePartsLength));\n\n  return outputParts.join('/');\n}\n\nexport var sep = '/';\nexport var delimiter = ':';\n\nexport function dirname(path) {\n  var result = splitPath(path),\n      root = result[0],\n      dir = result[1];\n\n  if (!root && !dir) {\n    // No dirname whatsoever\n    return '.';\n  }\n\n  if (dir) {\n    // It has a dirname, strip trailing slash\n    dir = dir.substr(0, dir.length - 1);\n  }\n\n  return root + dir;\n}\n\nexport function basename(path, ext) {\n  var f = splitPath(path)[2];\n  // TODO: make this comparison case-insensitive on windows?\n  if (ext && f.substr(-1 * ext.length) === ext) {\n    f = f.substr(0, f.length - ext.length);\n  }\n  return f;\n}\n\n\nexport function extname(path) {\n  return splitPath(path)[3];\n}\nexport default {\n  extname: extname,\n  basename: basename,\n  dirname: dirname,\n  sep: sep,\n  delimiter: delimiter,\n  relative: relative,\n  join: join,\n  isAbsolute: isAbsolute,\n  normalize: normalize,\n  resolve: resolve\n};\nfunction filter (xs, f) {\n    if (xs.filter) return xs.filter(f);\n    var res = [];\n    for (var i = 0; i < xs.length; i++) {\n        if (f(xs[i], i, xs)) res.push(xs[i]);\n    }\n    return res;\n}\n\n// String.prototype.substr - negative index don't work in IE8\nvar substr = 'ab'.substr(-1) === 'b' ?\n    function (str, start, len) { return str.substr(start, len) } :\n    function (str, start, len) {\n        if (start < 0) start = str.length + start;\n        return str.substr(start, len);\n    }\n;\n","process-es6.js":"// shim for using process in browser\n// based off https://github.com/defunctzombie/node-process/blob/master/browser.js\n\nfunction defaultSetTimout() {\n    throw new Error('setTimeout has not been defined');\n}\nfunction defaultClearTimeout () {\n    throw new Error('clearTimeout has not been defined');\n}\nvar cachedSetTimeout = defaultSetTimout;\nvar cachedClearTimeout = defaultClearTimeout;\nif (typeof global.setTimeout === 'function') {\n    cachedSetTimeout = setTimeout;\n}\nif (typeof global.clearTimeout === 'function') {\n    cachedClearTimeout = clearTimeout;\n}\n\nfunction runTimeout(fun) {\n    if (cachedSetTimeout === setTimeout) {\n        //normal enviroments in sane situations\n        return setTimeout(fun, 0);\n    }\n    // if setTimeout wasn't available but was latter defined\n    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {\n        cachedSetTimeout = setTimeout;\n        return setTimeout(fun, 0);\n    }\n    try {\n        // when when somebody has screwed with setTimeout but no I.E. maddness\n        return cachedSetTimeout(fun, 0);\n    } catch(e){\n        try {\n            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally\n            return cachedSetTimeout.call(null, fun, 0);\n        } catch(e){\n            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error\n            return cachedSetTimeout.call(this, fun, 0);\n        }\n    }\n\n\n}\nfunction runClearTimeout(marker) {\n    if (cachedClearTimeout === clearTimeout) {\n        //normal enviroments in sane situations\n        return clearTimeout(marker);\n    }\n    // if clearTimeout wasn't available but was latter defined\n    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {\n        cachedClearTimeout = clearTimeout;\n        return clearTimeout(marker);\n    }\n    try {\n        // when when somebody has screwed with setTimeout but no I.E. maddness\n        return cachedClearTimeout(marker);\n    } catch (e){\n        try {\n            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally\n            return cachedClearTimeout.call(null, marker);\n        } catch (e){\n            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.\n            // Some versions of I.E. have different rules for clearTimeout vs setTimeout\n            return cachedClearTimeout.call(this, marker);\n        }\n    }\n\n\n\n}\nvar queue = [];\nvar draining = false;\nvar currentQueue;\nvar queueIndex = -1;\n\nfunction cleanUpNextTick() {\n    if (!draining || !currentQueue) {\n        return;\n    }\n    draining = false;\n    if (currentQueue.length) {\n        queue = currentQueue.concat(queue);\n    } else {\n        queueIndex = -1;\n    }\n    if (queue.length) {\n        drainQueue();\n    }\n}\n\nfunction drainQueue() {\n    if (draining) {\n        return;\n    }\n    var timeout = runTimeout(cleanUpNextTick);\n    draining = true;\n\n    var len = queue.length;\n    while(len) {\n        currentQueue = queue;\n        queue = [];\n        while (++queueIndex < len) {\n            if (currentQueue) {\n                currentQueue[queueIndex].run();\n            }\n        }\n        queueIndex = -1;\n        len = queue.length;\n    }\n    currentQueue = null;\n    draining = false;\n    runClearTimeout(timeout);\n}\nfunction nextTick(fun) {\n    var args = new Array(arguments.length - 1);\n    if (arguments.length > 1) {\n        for (var i = 1; i < arguments.length; i++) {\n            args[i - 1] = arguments[i];\n        }\n    }\n    queue.push(new Item(fun, args));\n    if (queue.length === 1 && !draining) {\n        runTimeout(drainQueue);\n    }\n}\n// v8 likes predictible objects\nfunction Item(fun, array) {\n    this.fun = fun;\n    this.array = array;\n}\nItem.prototype.run = function () {\n    this.fun.apply(null, this.array);\n};\nvar title = 'browser';\nvar platform = 'browser';\nvar browser = true;\nvar env = {};\nvar argv = [];\nvar version = ''; // empty string to avoid regexp issues\nvar versions = {};\nvar release = {};\nvar config = {};\n\nfunction noop() {}\n\nvar on = noop;\nvar addListener = noop;\nvar once = noop;\nvar off = noop;\nvar removeListener = noop;\nvar removeAllListeners = noop;\nvar emit = noop;\n\nfunction binding(name) {\n    throw new Error('process.binding is not supported');\n}\n\nfunction cwd () { return '/' }\nfunction chdir (dir) {\n    throw new Error('process.chdir is not supported');\n}function umask() { return 0; }\n\n// from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js\nvar performance = global.performance || {};\nvar performanceNow =\n  performance.now        ||\n  performance.mozNow     ||\n  performance.msNow      ||\n  performance.oNow       ||\n  performance.webkitNow  ||\n  function(){ return (new Date()).getTime() };\n\n// generate timestamp or delta\n// see http://nodejs.org/api/process.html#process_process_hrtime\nfunction hrtime(previousTimestamp){\n  var clocktime = performanceNow.call(performance)*1e-3;\n  var seconds = Math.floor(clocktime);\n  var nanoseconds = Math.floor((clocktime%1)*1e9);\n  if (previousTimestamp) {\n    seconds = seconds - previousTimestamp[0];\n    nanoseconds = nanoseconds - previousTimestamp[1];\n    if (nanoseconds<0) {\n      seconds--;\n      nanoseconds += 1e9;\n    }\n  }\n  return [seconds,nanoseconds]\n}\n\nvar startTime = new Date();\nfunction uptime() {\n  var currentTime = new Date();\n  var dif = currentTime - startTime;\n  return dif / 1000;\n}\n\nvar browser$1 = {\n  nextTick: nextTick,\n  title: title,\n  browser: browser,\n  env: env,\n  argv: argv,\n  version: version,\n  versions: versions,\n  on: on,\n  addListener: addListener,\n  once: once,\n  off: off,\n  removeListener: removeListener,\n  removeAllListeners: removeAllListeners,\n  emit: emit,\n  binding: binding,\n  cwd: cwd,\n  chdir: chdir,\n  umask: umask,\n  hrtime: hrtime,\n  platform: platform,\n  release: release,\n  config: config,\n  uptime: uptime\n};\n\nexport { addListener, argv, binding, browser, chdir, config, cwd, browser$1 as default, emit, env, hrtime, nextTick, off, on, once, platform, release, removeAllListeners, removeListener, title, umask, uptime, version, versions };\n","punycode.js":"/*! https://mths.be/punycode v1.4.1 by @mathias */\n\n\n/** Highest positive signed 32-bit float value */\nvar maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1\n\n/** Bootstring parameters */\nvar base = 36;\nvar tMin = 1;\nvar tMax = 26;\nvar skew = 38;\nvar damp = 700;\nvar initialBias = 72;\nvar initialN = 128; // 0x80\nvar delimiter = '-'; // '\\x2D'\n\n/** Regular expressions */\nvar regexPunycode = /^xn--/;\nvar regexNonASCII = /[^\\x20-\\x7E]/; // unprintable ASCII chars + non-ASCII chars\nvar regexSeparators = /[\\x2E\\u3002\\uFF0E\\uFF61]/g; // RFC 3490 separators\n\n/** Error messages */\nvar errors = {\n  'overflow': 'Overflow: input needs wider integers to process',\n  'not-basic': 'Illegal input >= 0x80 (not a basic code point)',\n  'invalid-input': 'Invalid input'\n};\n\n/** Convenience shortcuts */\nvar baseMinusTMin = base - tMin;\nvar floor = Math.floor;\nvar stringFromCharCode = String.fromCharCode;\n\n/*--------------------------------------------------------------------------*/\n\n/**\n * A generic error utility function.\n * @private\n * @param {String} type The error type.\n * @returns {Error} Throws a `RangeError` with the applicable error message.\n */\nfunction error(type) {\n  throw new RangeError(errors[type]);\n}\n\n/**\n * A generic `Array#map` utility function.\n * @private\n * @param {Array} array The array to iterate over.\n * @param {Function} callback The function that gets called for every array\n * item.\n * @returns {Array} A new array of values returned by the callback function.\n */\nfunction map(array, fn) {\n  var length = array.length;\n  var result = [];\n  while (length--) {\n    result[length] = fn(array[length]);\n  }\n  return result;\n}\n\n/**\n * A simple `Array#map`-like wrapper to work with domain name strings or email\n * addresses.\n * @private\n * @param {String} domain The domain name or email address.\n * @param {Function} callback The function that gets called for every\n * character.\n * @returns {Array} A new string of characters returned by the callback\n * function.\n */\nfunction mapDomain(string, fn) {\n  var parts = string.split('@');\n  var result = '';\n  if (parts.length > 1) {\n    // In email addresses, only the domain name should be punycoded. Leave\n    // the local part (i.e. everything up to `@`) intact.\n    result = parts[0] + '@';\n    string = parts[1];\n  }\n  // Avoid `split(regex)` for IE8 compatibility. See #17.\n  string = string.replace(regexSeparators, '\\x2E');\n  var labels = string.split('.');\n  var encoded = map(labels, fn).join('.');\n  return result + encoded;\n}\n\n/**\n * Creates an array containing the numeric code points of each Unicode\n * character in the string. While JavaScript uses UCS-2 internally,\n * this function will convert a pair of surrogate halves (each of which\n * UCS-2 exposes as separate characters) into a single code point,\n * matching UTF-16.\n * @see `punycode.ucs2.encode`\n * @see <https://mathiasbynens.be/notes/javascript-encoding>\n * @memberOf punycode.ucs2\n * @name decode\n * @param {String} string The Unicode input string (UCS-2).\n * @returns {Array} The new array of code points.\n */\nfunction ucs2decode(string) {\n  var output = [],\n    counter = 0,\n    length = string.length,\n    value,\n    extra;\n  while (counter < length) {\n    value = string.charCodeAt(counter++);\n    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {\n      // high surrogate, and there is a next character\n      extra = string.charCodeAt(counter++);\n      if ((extra & 0xFC00) == 0xDC00) { // low surrogate\n        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);\n      } else {\n        // unmatched surrogate; only append this code unit, in case the next\n        // code unit is the high surrogate of a surrogate pair\n        output.push(value);\n        counter--;\n      }\n    } else {\n      output.push(value);\n    }\n  }\n  return output;\n}\n\n/**\n * Creates a string based on an array of numeric code points.\n * @see `punycode.ucs2.decode`\n * @memberOf punycode.ucs2\n * @name encode\n * @param {Array} codePoints The array of numeric code points.\n * @returns {String} The new Unicode string (UCS-2).\n */\nfunction ucs2encode(array) {\n  return map(array, function(value) {\n    var output = '';\n    if (value > 0xFFFF) {\n      value -= 0x10000;\n      output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);\n      value = 0xDC00 | value & 0x3FF;\n    }\n    output += stringFromCharCode(value);\n    return output;\n  }).join('');\n}\n\n/**\n * Converts a basic code point into a digit/integer.\n * @see `digitToBasic()`\n * @private\n * @param {Number} codePoint The basic numeric code point value.\n * @returns {Number} The numeric value of a basic code point (for use in\n * representing integers) in the range `0` to `base - 1`, or `base` if\n * the code point does not represent a value.\n */\nfunction basicToDigit(codePoint) {\n  if (codePoint - 48 < 10) {\n    return codePoint - 22;\n  }\n  if (codePoint - 65 < 26) {\n    return codePoint - 65;\n  }\n  if (codePoint - 97 < 26) {\n    return codePoint - 97;\n  }\n  return base;\n}\n\n/**\n * Converts a digit/integer into a basic code point.\n * @see `basicToDigit()`\n * @private\n * @param {Number} digit The numeric value of a basic code point.\n * @returns {Number} The basic code point whose value (when used for\n * representing integers) is `digit`, which needs to be in the range\n * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is\n * used; else, the lowercase form is used. The behavior is undefined\n * if `flag` is non-zero and `digit` has no uppercase form.\n */\nfunction digitToBasic(digit, flag) {\n  //  0..25 map to ASCII a..z or A..Z\n  // 26..35 map to ASCII 0..9\n  return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);\n}\n\n/**\n * Bias adaptation function as per section 3.4 of RFC 3492.\n * https://tools.ietf.org/html/rfc3492#section-3.4\n * @private\n */\nfunction adapt(delta, numPoints, firstTime) {\n  var k = 0;\n  delta = firstTime ? floor(delta / damp) : delta >> 1;\n  delta += floor(delta / numPoints);\n  for ( /* no initialization */ ; delta > baseMinusTMin * tMax >> 1; k += base) {\n    delta = floor(delta / baseMinusTMin);\n  }\n  return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));\n}\n\n/**\n * Converts a Punycode string of ASCII-only symbols to a string of Unicode\n * symbols.\n * @memberOf punycode\n * @param {String} input The Punycode string of ASCII-only symbols.\n * @returns {String} The resulting string of Unicode symbols.\n */\nexport function decode(input) {\n  // Don't use UCS-2\n  var output = [],\n    inputLength = input.length,\n    out,\n    i = 0,\n    n = initialN,\n    bias = initialBias,\n    basic,\n    j,\n    index,\n    oldi,\n    w,\n    k,\n    digit,\n    t,\n    /** Cached calculation results */\n    baseMinusT;\n\n  // Handle the basic code points: let `basic` be the number of input code\n  // points before the last delimiter, or `0` if there is none, then copy\n  // the first basic code points to the output.\n\n  basic = input.lastIndexOf(delimiter);\n  if (basic < 0) {\n    basic = 0;\n  }\n\n  for (j = 0; j < basic; ++j) {\n    // if it's not a basic code point\n    if (input.charCodeAt(j) >= 0x80) {\n      error('not-basic');\n    }\n    output.push(input.charCodeAt(j));\n  }\n\n  // Main decoding loop: start just after the last delimiter if any basic code\n  // points were copied; start at the beginning otherwise.\n\n  for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */ ) {\n\n    // `index` is the index of the next character to be consumed.\n    // Decode a generalized variable-length integer into `delta`,\n    // which gets added to `i`. The overflow checking is easier\n    // if we increase `i` as we go, then subtract off its starting\n    // value at the end to obtain `delta`.\n    for (oldi = i, w = 1, k = base; /* no condition */ ; k += base) {\n\n      if (index >= inputLength) {\n        error('invalid-input');\n      }\n\n      digit = basicToDigit(input.charCodeAt(index++));\n\n      if (digit >= base || digit > floor((maxInt - i) / w)) {\n        error('overflow');\n      }\n\n      i += digit * w;\n      t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);\n\n      if (digit < t) {\n        break;\n      }\n\n      baseMinusT = base - t;\n      if (w > floor(maxInt / baseMinusT)) {\n        error('overflow');\n      }\n\n      w *= baseMinusT;\n\n    }\n\n    out = output.length + 1;\n    bias = adapt(i - oldi, out, oldi == 0);\n\n    // `i` was supposed to wrap around from `out` to `0`,\n    // incrementing `n` each time, so we'll fix that now:\n    if (floor(i / out) > maxInt - n) {\n      error('overflow');\n    }\n\n    n += floor(i / out);\n    i %= out;\n\n    // Insert `n` at position `i` of the output\n    output.splice(i++, 0, n);\n\n  }\n\n  return ucs2encode(output);\n}\n\n/**\n * Converts a string of Unicode symbols (e.g. a domain name label) to a\n * Punycode string of ASCII-only symbols.\n * @memberOf punycode\n * @param {String} input The string of Unicode symbols.\n * @returns {String} The resulting Punycode string of ASCII-only symbols.\n */\nexport function encode(input) {\n  var n,\n    delta,\n    handledCPCount,\n    basicLength,\n    bias,\n    j,\n    m,\n    q,\n    k,\n    t,\n    currentValue,\n    output = [],\n    /** `inputLength` will hold the number of code points in `input`. */\n    inputLength,\n    /** Cached calculation results */\n    handledCPCountPlusOne,\n    baseMinusT,\n    qMinusT;\n\n  // Convert the input in UCS-2 to Unicode\n  input = ucs2decode(input);\n\n  // Cache the length\n  inputLength = input.length;\n\n  // Initialize the state\n  n = initialN;\n  delta = 0;\n  bias = initialBias;\n\n  // Handle the basic code points\n  for (j = 0; j < inputLength; ++j) {\n    currentValue = input[j];\n    if (currentValue < 0x80) {\n      output.push(stringFromCharCode(currentValue));\n    }\n  }\n\n  handledCPCount = basicLength = output.length;\n\n  // `handledCPCount` is the number of code points that have been handled;\n  // `basicLength` is the number of basic code points.\n\n  // Finish the basic string - if it is not empty - with a delimiter\n  if (basicLength) {\n    output.push(delimiter);\n  }\n\n  // Main encoding loop:\n  while (handledCPCount < inputLength) {\n\n    // All non-basic code points < n have been handled already. Find the next\n    // larger one:\n    for (m = maxInt, j = 0; j < inputLength; ++j) {\n      currentValue = input[j];\n      if (currentValue >= n && currentValue < m) {\n        m = currentValue;\n      }\n    }\n\n    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,\n    // but guard against overflow\n    handledCPCountPlusOne = handledCPCount + 1;\n    if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {\n      error('overflow');\n    }\n\n    delta += (m - n) * handledCPCountPlusOne;\n    n = m;\n\n    for (j = 0; j < inputLength; ++j) {\n      currentValue = input[j];\n\n      if (currentValue < n && ++delta > maxInt) {\n        error('overflow');\n      }\n\n      if (currentValue == n) {\n        // Represent delta as a generalized variable-length integer\n        for (q = delta, k = base; /* no condition */ ; k += base) {\n          t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);\n          if (q < t) {\n            break;\n          }\n          qMinusT = q - t;\n          baseMinusT = base - t;\n          output.push(\n            stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))\n          );\n          q = floor(qMinusT / baseMinusT);\n        }\n\n        output.push(stringFromCharCode(digitToBasic(q, 0)));\n        bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);\n        delta = 0;\n        ++handledCPCount;\n      }\n    }\n\n    ++delta;\n    ++n;\n\n  }\n  return output.join('');\n}\n\n/**\n * Converts a Punycode string representing a domain name or an email address\n * to Unicode. Only the Punycoded parts of the input will be converted, i.e.\n * it doesn't matter if you call it on a string that has already been\n * converted to Unicode.\n * @memberOf punycode\n * @param {String} input The Punycoded domain name or email address to\n * convert to Unicode.\n * @returns {String} The Unicode representation of the given Punycode\n * string.\n */\nexport function toUnicode(input) {\n  return mapDomain(input, function(string) {\n    return regexPunycode.test(string) ?\n      decode(string.slice(4).toLowerCase()) :\n      string;\n  });\n}\n\n/**\n * Converts a Unicode string representing a domain name or an email address to\n * Punycode. Only the non-ASCII parts of the domain name will be converted,\n * i.e. it doesn't matter if you call it with a domain that's already in\n * ASCII.\n * @memberOf punycode\n * @param {String} input The domain name or email address to convert, as a\n * Unicode string.\n * @returns {String} The Punycode representation of the given domain name or\n * email address.\n */\nexport function toASCII(input) {\n  return mapDomain(input, function(string) {\n    return regexNonASCII.test(string) ?\n      'xn--' + encode(string) :\n      string;\n  });\n}\nexport var version = '1.4.1';\n/**\n * An object of methods to convert from JavaScript's internal character\n * representation (UCS-2) to Unicode code points, and back.\n * @see <https://mathiasbynens.be/notes/javascript-encoding>\n * @memberOf punycode\n * @type Object\n */\n\nexport var ucs2 = {\n  decode: ucs2decode,\n  encode: ucs2encode\n};\nexport default {\n  version: version,\n  ucs2: ucs2,\n  toASCII: toASCII,\n  toUnicode: toUnicode,\n  encode: encode,\n  decode: decode\n}\n","qs.js":"// Copyright Joyent, Inc. and other Node contributors.\n//\n// Permission is hereby granted, free of charge, to any person obtaining a\n// copy of this software and associated documentation files (the\n// \"Software\"), to deal in the Software without restriction, including\n// without limitation the rights to use, copy, modify, merge, publish,\n// distribute, sublicense, and/or sell copies of the Software, and to permit\n// persons to whom the Software is furnished to do so, subject to the\n// following conditions:\n//\n// The above copyright notice and this permission notice shall be included\n// in all copies or substantial portions of the Software.\n//\n// THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS\n// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\n// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN\n// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,\n// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR\n// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE\n// USE OR OTHER DEALINGS IN THE SOFTWARE.\n\n\n// If obj.hasOwnProperty has been overridden, then calling\n// obj.hasOwnProperty(prop) will break.\n// See: https://github.com/joyent/node/issues/1707\nfunction hasOwnProperty(obj, prop) {\n  return Object.prototype.hasOwnProperty.call(obj, prop);\n}\nvar isArray = Array.isArray || function (xs) {\n  return Object.prototype.toString.call(xs) === '[object Array]';\n};\nfunction stringifyPrimitive(v) {\n  switch (typeof v) {\n    case 'string':\n      return v;\n\n    case 'boolean':\n      return v ? 'true' : 'false';\n\n    case 'number':\n      return isFinite(v) ? v : '';\n\n    default:\n      return '';\n  }\n}\n\nexport function stringify (obj, sep, eq, name) {\n  sep = sep || '&';\n  eq = eq || '=';\n  if (obj === null) {\n    obj = undefined;\n  }\n\n  if (typeof obj === 'object') {\n    return map(objectKeys(obj), function(k) {\n      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;\n      if (isArray(obj[k])) {\n        return map(obj[k], function(v) {\n          return ks + encodeURIComponent(stringifyPrimitive(v));\n        }).join(sep);\n      } else {\n        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));\n      }\n    }).join(sep);\n\n  }\n\n  if (!name) return '';\n  return encodeURIComponent(stringifyPrimitive(name)) + eq +\n         encodeURIComponent(stringifyPrimitive(obj));\n};\n\nfunction map (xs, f) {\n  if (xs.map) return xs.map(f);\n  var res = [];\n  for (var i = 0; i < xs.length; i++) {\n    res.push(f(xs[i], i));\n  }\n  return res;\n}\n\nvar objectKeys = Object.keys || function (obj) {\n  var res = [];\n  for (var key in obj) {\n    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);\n  }\n  return res;\n};\n\nexport function parse(qs, sep, eq, options) {\n  sep = sep || '&';\n  eq = eq || '=';\n  var obj = {};\n\n  if (typeof qs !== 'string' || qs.length === 0) {\n    return obj;\n  }\n\n  var regexp = /\\+/g;\n  qs = qs.split(sep);\n\n  var maxKeys = 1000;\n  if (options && typeof options.maxKeys === 'number') {\n    maxKeys = options.maxKeys;\n  }\n\n  var len = qs.length;\n  // maxKeys <= 0 means that we should not limit keys count\n  if (maxKeys > 0 && len > maxKeys) {\n    len = maxKeys;\n  }\n\n  for (var i = 0; i < len; ++i) {\n    var x = qs[i].replace(regexp, '%20'),\n        idx = x.indexOf(eq),\n        kstr, vstr, k, v;\n\n    if (idx >= 0) {\n      kstr = x.substr(0, idx);\n      vstr = x.substr(idx + 1);\n    } else {\n      kstr = x;\n      vstr = '';\n    }\n\n    k = decodeURIComponent(kstr);\n    v = decodeURIComponent(vstr);\n\n    if (!hasOwnProperty(obj, k)) {\n      obj[k] = v;\n    } else if (isArray(obj[k])) {\n      obj[k].push(v);\n    } else {\n      obj[k] = [obj[k], v];\n    }\n  }\n\n  return obj;\n};\nexport default {\n  encode: stringify,\n  stringify: stringify,\n  decode: parse,\n  parse: parse\n}\nexport {stringify as encode, parse as decode};\n","setimmediate.js":"/*\nMIT Licence\nCopyright (c) 2012 Barnesandnoble.com, llc, Donavon West, and Domenic Denicola\nhttps://github.com/YuzuJS/setImmediate/blob/f1ccbfdf09cb93aadf77c4aa749ea554503b9234/LICENSE.txt\n*/\n\nvar nextHandle = 1; // Spec says greater than zero\nvar tasksByHandle = {};\nvar currentlyRunningATask = false;\nvar doc = global.document;\nvar registerImmediate;\n\nexport function setImmediate(callback) {\n  // Callback can either be a function or a string\n  if (typeof callback !== \"function\") {\n    callback = new Function(\"\" + callback);\n  }\n  // Copy function arguments\n  var args = new Array(arguments.length - 1);\n  for (var i = 0; i < args.length; i++) {\n      args[i] = arguments[i + 1];\n  }\n  // Store and register the task\n  var task = { callback: callback, args: args };\n  tasksByHandle[nextHandle] = task;\n  registerImmediate(nextHandle);\n  return nextHandle++;\n}\n\nexport function clearImmediate(handle) {\n    delete tasksByHandle[handle];\n}\n\nfunction run(task) {\n    var callback = task.callback;\n    var args = task.args;\n    switch (args.length) {\n    case 0:\n        callback();\n        break;\n    case 1:\n        callback(args[0]);\n        break;\n    case 2:\n        callback(args[0], args[1]);\n        break;\n    case 3:\n        callback(args[0], args[1], args[2]);\n        break;\n    default:\n        callback.apply(undefined, args);\n        break;\n    }\n}\n\nfunction runIfPresent(handle) {\n    // From the spec: \"Wait until any invocations of this algorithm started before this one have completed.\"\n    // So if we're currently running a task, we'll need to delay this invocation.\n    if (currentlyRunningATask) {\n        // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a\n        // \"too much recursion\" error.\n        setTimeout(runIfPresent, 0, handle);\n    } else {\n        var task = tasksByHandle[handle];\n        if (task) {\n            currentlyRunningATask = true;\n            try {\n                run(task);\n            } finally {\n                clearImmediate(handle);\n                currentlyRunningATask = false;\n            }\n        }\n    }\n}\n\nfunction installNextTickImplementation() {\n    registerImmediate = function(handle) {\n        process.nextTick(function () { runIfPresent(handle); });\n    };\n}\n\nfunction canUsePostMessage() {\n    // The test against `importScripts` prevents this implementation from being installed inside a web worker,\n    // where `global.postMessage` means something completely different and can't be used for this purpose.\n    if (global.postMessage && !global.importScripts) {\n        var postMessageIsAsynchronous = true;\n        var oldOnMessage = global.onmessage;\n        global.onmessage = function() {\n            postMessageIsAsynchronous = false;\n        };\n        global.postMessage(\"\", \"*\");\n        global.onmessage = oldOnMessage;\n        return postMessageIsAsynchronous;\n    }\n}\n\nfunction installPostMessageImplementation() {\n    // Installs an event handler on `global` for the `message` event: see\n    // * https://developer.mozilla.org/en/DOM/window.postMessage\n    // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages\n\n    var messagePrefix = \"setImmediate$\" + Math.random() + \"$\";\n    var onGlobalMessage = function(event) {\n        if (event.source === global &&\n            typeof event.data === \"string\" &&\n            event.data.indexOf(messagePrefix) === 0) {\n            runIfPresent(+event.data.slice(messagePrefix.length));\n        }\n    };\n\n    if (global.addEventListener) {\n        global.addEventListener(\"message\", onGlobalMessage, false);\n    } else {\n        global.attachEvent(\"onmessage\", onGlobalMessage);\n    }\n\n    registerImmediate = function(handle) {\n        global.postMessage(messagePrefix + handle, \"*\");\n    };\n}\n\nfunction installMessageChannelImplementation() {\n    var channel = new MessageChannel();\n    channel.port1.onmessage = function(event) {\n        var handle = event.data;\n        runIfPresent(handle);\n    };\n\n    registerImmediate = function(handle) {\n        channel.port2.postMessage(handle);\n    };\n}\n\nfunction installReadyStateChangeImplementation() {\n    var html = doc.documentElement;\n    registerImmediate = function(handle) {\n        // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted\n        // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.\n        var script = doc.createElement(\"script\");\n        script.onreadystatechange = function () {\n            runIfPresent(handle);\n            script.onreadystatechange = null;\n            html.removeChild(script);\n            script = null;\n        };\n        html.appendChild(script);\n    };\n}\n\nfunction installSetTimeoutImplementation() {\n    registerImmediate = function(handle) {\n        setTimeout(runIfPresent, 0, handle);\n    };\n}\n\n// If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.\nvar attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);\nattachTo = attachTo && attachTo.setTimeout ? attachTo : global;\n\n// Don't get fooled by e.g. browserify environments.\nif ({}.toString.call(global.process) === \"[object process]\") {\n    // For Node.js before 0.9\n    installNextTickImplementation();\n\n} else if (canUsePostMessage()) {\n    // For non-IE10 modern browsers\n    installPostMessageImplementation();\n\n} else if (global.MessageChannel) {\n    // For web workers, where supported\n    installMessageChannelImplementation();\n\n} else if (doc && \"onreadystatechange\" in doc.createElement(\"script\")) {\n    // For IE 6–8\n    installReadyStateChangeImplementation();\n\n} else {\n    // For older browsers\n    installSetTimeoutImplementation();\n}\nexport default {\n  setTimeout: setTimeout,\n  clearTimeout: clearTimeout\n}\n","stream.js":"import EE from 'events';\nimport {inherits} from 'util';\n\nimport {Duplex} from '\\0polyfill-node._stream_duplex';\nimport {Readable} from '\\0polyfill-node._stream_readable';\nimport {Writable} from '\\0polyfill-node._stream_writable';\nimport {Transform} from '\\0polyfill-node._stream_transform';\nimport {PassThrough} from '\\0polyfill-node._stream_passthrough';\ninherits(Stream, EE);\nStream.Readable = Readable;\nStream.Writable = Writable;\nStream.Duplex = Duplex;\nStream.Transform = Transform;\nStream.PassThrough = PassThrough;\n\n// Backwards-compat with node 0.4.x\nStream.Stream = Stream;\n\nexport default Stream;\nexport {Readable,Writable,Duplex,Transform,PassThrough,Stream}\n\n// old-style streams.  Note that the pipe method (the only relevant\n// part of this class) is overridden in the Readable class.\n\nfunction Stream() {\n  EE.call(this);\n}\n\nStream.prototype.pipe = function(dest, options) {\n  var source = this;\n\n  function ondata(chunk) {\n    if (dest.writable) {\n      if (false === dest.write(chunk) && source.pause) {\n        source.pause();\n      }\n    }\n  }\n\n  source.on('data', ondata);\n\n  function ondrain() {\n    if (source.readable && source.resume) {\n      source.resume();\n    }\n  }\n\n  dest.on('drain', ondrain);\n\n  // If the 'end' option is not supplied, dest.end() will be called when\n  // source gets the 'end' or 'close' events.  Only dest.end() once.\n  if (!dest._isStdio && (!options || options.end !== false)) {\n    source.on('end', onend);\n    source.on('close', onclose);\n  }\n\n  var didOnEnd = false;\n  function onend() {\n    if (didOnEnd) return;\n    didOnEnd = true;\n\n    dest.end();\n  }\n\n\n  function onclose() {\n    if (didOnEnd) return;\n    didOnEnd = true;\n\n    if (typeof dest.destroy === 'function') dest.destroy();\n  }\n\n  // don't leave dangling pipes when there are errors.\n  function onerror(er) {\n    cleanup();\n    if (EE.listenerCount(this, 'error') === 0) {\n      throw er; // Unhandled stream error in pipe.\n    }\n  }\n\n  source.on('error', onerror);\n  dest.on('error', onerror);\n\n  // remove all the event listeners that were added.\n  function cleanup() {\n    source.removeListener('data', ondata);\n    dest.removeListener('drain', ondrain);\n\n    source.removeListener('end', onend);\n    source.removeListener('close', onclose);\n\n    source.removeListener('error', onerror);\n    dest.removeListener('error', onerror);\n\n    source.removeListener('end', cleanup);\n    source.removeListener('close', cleanup);\n\n    dest.removeListener('close', cleanup);\n  }\n\n  source.on('end', cleanup);\n  source.on('close', cleanup);\n\n  dest.on('close', cleanup);\n\n  dest.emit('pipe', source);\n\n  // Allow for unix-like usage: A.pipe(B).pipe(C)\n  return dest;\n};\n","string-decoder.js":"// Copyright Joyent, Inc. and other Node contributors.\n//\n// Permission is hereby granted, free of charge, to any person obtaining a\n// copy of this software and associated documentation files (the\n// \"Software\"), to deal in the Software without restriction, including\n// without limitation the rights to use, copy, modify, merge, publish,\n// distribute, sublicense, and/or sell copies of the Software, and to permit\n// persons to whom the Software is furnished to do so, subject to the\n// following conditions:\n//\n// The above copyright notice and this permission notice shall be included\n// in all copies or substantial portions of the Software.\n//\n// THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS\n// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\n// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN\n// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,\n// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR\n// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE\n// USE OR OTHER DEALINGS IN THE SOFTWARE.\n\nimport {Buffer} from 'buffer';\nvar isBufferEncoding = Buffer.isEncoding\n  || function(encoding) {\n       switch (encoding && encoding.toLowerCase()) {\n         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;\n         default: return false;\n       }\n     }\n\n\nfunction assertEncoding(encoding) {\n  if (encoding && !isBufferEncoding(encoding)) {\n    throw new Error('Unknown encoding: ' + encoding);\n  }\n}\n\n// StringDecoder provides an interface for efficiently splitting a series of\n// buffers into a series of JS strings without breaking apart multi-byte\n// characters. CESU-8 is handled as part of the UTF-8 encoding.\n//\n// @TODO Handling all encodings inside a single object makes it very difficult\n// to reason about this code, so it should be split up in the future.\n// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code\n// points as used by CESU-8.\nexport function StringDecoder(encoding) {\n  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');\n  assertEncoding(encoding);\n  switch (this.encoding) {\n    case 'utf8':\n      // CESU-8 represents each of Surrogate Pair by 3-bytes\n      this.surrogateSize = 3;\n      break;\n    case 'ucs2':\n    case 'utf16le':\n      // UTF-16 represents each of Surrogate Pair by 2-bytes\n      this.surrogateSize = 2;\n      this.detectIncompleteChar = utf16DetectIncompleteChar;\n      break;\n    case 'base64':\n      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.\n      this.surrogateSize = 3;\n      this.detectIncompleteChar = base64DetectIncompleteChar;\n      break;\n    default:\n      this.write = passThroughWrite;\n      return;\n  }\n\n  // Enough space to store all bytes of a single character. UTF-8 needs 4\n  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).\n  this.charBuffer = new Buffer(6);\n  // Number of bytes received for the current incomplete multi-byte character.\n  this.charReceived = 0;\n  // Number of bytes expected for the current incomplete multi-byte character.\n  this.charLength = 0;\n};\n\n\n// write decodes the given buffer and returns it as JS string that is\n// guaranteed to not contain any partial multi-byte characters. Any partial\n// character found at the end of the buffer is buffered up, and will be\n// returned when calling write again with the remaining bytes.\n//\n// Note: Converting a Buffer containing an orphan surrogate to a String\n// currently works, but converting a String to a Buffer (via `new Buffer`, or\n// Buffer#write) will replace incomplete surrogates with the unicode\n// replacement character. See https://codereview.chromium.org/121173009/ .\nStringDecoder.prototype.write = function(buffer) {\n  var charStr = '';\n  // if our last write ended with an incomplete multibyte character\n  while (this.charLength) {\n    // determine how many remaining bytes this buffer has to offer for this char\n    var available = (buffer.length >= this.charLength - this.charReceived) ?\n        this.charLength - this.charReceived :\n        buffer.length;\n\n    // add the new bytes to the char buffer\n    buffer.copy(this.charBuffer, this.charReceived, 0, available);\n    this.charReceived += available;\n\n    if (this.charReceived < this.charLength) {\n      // still not enough chars in this buffer? wait for more ...\n      return '';\n    }\n\n    // remove bytes belonging to the current character from the buffer\n    buffer = buffer.slice(available, buffer.length);\n\n    // get the character that was split\n    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);\n\n    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character\n    var charCode = charStr.charCodeAt(charStr.length - 1);\n    if (charCode >= 0xD800 && charCode <= 0xDBFF) {\n      this.charLength += this.surrogateSize;\n      charStr = '';\n      continue;\n    }\n    this.charReceived = this.charLength = 0;\n\n    // if there are no more bytes in this buffer, just emit our char\n    if (buffer.length === 0) {\n      return charStr;\n    }\n    break;\n  }\n\n  // determine and set charLength / charReceived\n  this.detectIncompleteChar(buffer);\n\n  var end = buffer.length;\n  if (this.charLength) {\n    // buffer the incomplete character bytes we got\n    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);\n    end -= this.charReceived;\n  }\n\n  charStr += buffer.toString(this.encoding, 0, end);\n\n  var end = charStr.length - 1;\n  var charCode = charStr.charCodeAt(end);\n  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character\n  if (charCode >= 0xD800 && charCode <= 0xDBFF) {\n    var size = this.surrogateSize;\n    this.charLength += size;\n    this.charReceived += size;\n    this.charBuffer.copy(this.charBuffer, size, 0, size);\n    buffer.copy(this.charBuffer, 0, 0, size);\n    return charStr.substring(0, end);\n  }\n\n  // or just emit the charStr\n  return charStr;\n};\n\n// detectIncompleteChar determines if there is an incomplete UTF-8 character at\n// the end of the given buffer. If so, it sets this.charLength to the byte\n// length that character, and sets this.charReceived to the number of bytes\n// that are available for this character.\nStringDecoder.prototype.detectIncompleteChar = function(buffer) {\n  // determine how many bytes we have to check at the end of this buffer\n  var i = (buffer.length >= 3) ? 3 : buffer.length;\n\n  // Figure out if one of the last i bytes of our buffer announces an\n  // incomplete char.\n  for (; i > 0; i--) {\n    var c = buffer[buffer.length - i];\n\n    // See http://en.wikipedia.org/wiki/UTF-8#Description\n\n    // 110XXXXX\n    if (i == 1 && c >> 5 == 0x06) {\n      this.charLength = 2;\n      break;\n    }\n\n    // 1110XXXX\n    if (i <= 2 && c >> 4 == 0x0E) {\n      this.charLength = 3;\n      break;\n    }\n\n    // 11110XXX\n    if (i <= 3 && c >> 3 == 0x1E) {\n      this.charLength = 4;\n      break;\n    }\n  }\n  this.charReceived = i;\n};\n\nStringDecoder.prototype.end = function(buffer) {\n  var res = '';\n  if (buffer && buffer.length)\n    res = this.write(buffer);\n\n  if (this.charReceived) {\n    var cr = this.charReceived;\n    var buf = this.charBuffer;\n    var enc = this.encoding;\n    res += buf.slice(0, cr).toString(enc);\n  }\n\n  return res;\n};\n\nfunction passThroughWrite(buffer) {\n  return buffer.toString(this.encoding);\n}\n\nfunction utf16DetectIncompleteChar(buffer) {\n  this.charReceived = buffer.length % 2;\n  this.charLength = this.charReceived ? 2 : 0;\n}\n\nfunction base64DetectIncompleteChar(buffer) {\n  this.charReceived = buffer.length % 3;\n  this.charLength = this.charReceived ? 3 : 0;\n}\n","timers.js":"// License https://jryans.mit-license.org/\n\nimport {setImmediate, clearImmediate} from './setimmediate';\nexport {setImmediate, clearImmediate};\n// DOM APIs, for completeness\nvar apply = Function.prototype.apply;\n\nexport function clearInterval(timeout) {\n  if (typeof timeout === 'number' && typeof global.clearInterval === 'function') {\n    global.clearInterval(timeout);\n  } else {\n    clearFn(timeout)\n  }\n}\nexport function clearTimeout(timeout) {\n  if (typeof timeout === 'number' && typeof global.clearTimeout === 'function') {\n    global.clearTimeout(timeout);\n  } else {\n    clearFn(timeout)\n  }\n}\nfunction clearFn(timeout) {\n  if (timeout && typeof timeout.close === 'function') {\n    timeout.close();\n  }\n}\nexport function setTimeout() {\n  return new Timeout(apply.call(global.setTimeout, window, arguments), clearTimeout);\n}\nexport function setInterval() {\n  return new Timeout(apply.call(global.setInterval, window, arguments), clearInterval);\n}\n\nfunction Timeout(id) {\n  this._id = id;\n}\nTimeout.prototype.unref = Timeout.prototype.ref = function() {};\nTimeout.prototype.close = function() {\n  clearFn(this._id);\n}\n\n// Does not start the time, just sets up the members needed.\nexport function enroll(item, msecs) {\n  clearTimeout(item._idleTimeoutId);\n  item._idleTimeout = msecs;\n}\n\nexport function unenroll(item) {\n  clearTimeout(item._idleTimeoutId);\n  item._idleTimeout = -1;\n}\nexport var _unrefActive = active;\nexport function active(item) {\n  clearTimeout(item._idleTimeoutId);\n\n  var msecs = item._idleTimeout;\n  if (msecs >= 0) {\n    item._idleTimeoutId = setTimeout(function onTimeout() {\n      if (item._onTimeout)\n        item._onTimeout();\n    }, msecs);\n  }\n}\n\nexport default {\n  setImmediate: setImmediate,\n  clearImmediate: clearImmediate,\n  setTimeout: setTimeout,\n  clearTimeout: clearTimeout,\n  setInterval: setInterval,\n  clearInterval: clearInterval,\n  active: active,\n  unenroll: unenroll,\n  _unrefActive: _unrefActive,\n  enroll: enroll\n};\n","tty.js":"// MIT lisence\n// from https://github.com/substack/tty-browserify/blob/1ba769a6429d242f36226538835b4034bf6b7886/index.js\n\nexport function isatty() {\n  return false;\n}\n\nexport function ReadStream() {\n  throw new Error('tty.ReadStream is not implemented');\n}\n\nexport function WriteStream() {\n  throw new Error('tty.ReadStream is not implemented');\n}\n\nexport default {\n  isatty: isatty,\n  ReadStream: ReadStream,\n  WriteStream: WriteStream\n}\n","url.js":"// Copyright Joyent, Inc. and other Node contributors.\n//\n// Permission is hereby granted, free of charge, to any person obtaining a\n// copy of this software and associated documentation files (the\n// \"Software\"), to deal in the Software without restriction, including\n// without limitation the rights to use, copy, modify, merge, publish,\n// distribute, sublicense, and/or sell copies of the Software, and to permit\n// persons to whom the Software is furnished to do so, subject to the\n// following conditions:\n//\n// The above copyright notice and this permission notice shall be included\n// in all copies or substantial portions of the Software.\n//\n// THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS\n// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\n// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN\n// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,\n// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR\n// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE\n// USE OR OTHER DEALINGS IN THE SOFTWARE.\n\n\nimport {toASCII} from 'punycode';\nimport {isObject,isString,isNullOrUndefined,isNull} from 'util';\nimport {parse as qsParse,stringify as qsStringify} from 'querystring';\nexport {\n  urlParse as parse,\n  urlResolve as resolve,\n  urlResolveObject as resolveObject,\n  urlFormat as format\n};\nexport default {\n  parse: urlParse,\n  resolve: urlResolve,\n  resolveObject: urlResolveObject,\n  format: urlFormat,\n  Url: Url\n}\nexport function Url() {\n  this.protocol = null;\n  this.slashes = null;\n  this.auth = null;\n  this.host = null;\n  this.port = null;\n  this.hostname = null;\n  this.hash = null;\n  this.search = null;\n  this.query = null;\n  this.pathname = null;\n  this.path = null;\n  this.href = null;\n}\n\n// Reference: RFC 3986, RFC 1808, RFC 2396\n\n// define these here so at least they only have to be\n// compiled once on the first module load.\nvar protocolPattern = /^([a-z0-9.+-]+:)/i,\n  portPattern = /:[0-9]*$/,\n\n  // Special case for a simple path URL\n  simplePathPattern = /^(\\/\\/?(?!\\/)[^\\?\\s]*)(\\?[^\\s]*)?$/,\n\n  // RFC 2396: characters reserved for delimiting URLs.\n  // We actually just auto-escape these.\n  delims = ['<', '>', '\"', '`', ' ', '\\r', '\\n', '\\t'],\n\n  // RFC 2396: characters not allowed for various reasons.\n  unwise = ['{', '}', '|', '\\\\', '^', '`'].concat(delims),\n\n  // Allowed by RFCs, but cause of XSS attacks.  Always escape these.\n  autoEscape = ['\\''].concat(unwise),\n  // Characters that are never ever allowed in a hostname.\n  // Note that any invalid chars are also handled, but these\n  // are the ones that are *expected* to be seen, so we fast-path\n  // them.\n  nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),\n  hostEndingChars = ['/', '?', '#'],\n  hostnameMaxLen = 255,\n  hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,\n  hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,\n  // protocols that can allow \"unsafe\" and \"unwise\" chars.\n  unsafeProtocol = {\n    'javascript': true,\n    'javascript:': true\n  },\n  // protocols that never have a hostname.\n  hostlessProtocol = {\n    'javascript': true,\n    'javascript:': true\n  },\n  // protocols that always contain a // bit.\n  slashedProtocol = {\n    'http': true,\n    'https': true,\n    'ftp': true,\n    'gopher': true,\n    'file': true,\n    'http:': true,\n    'https:': true,\n    'ftp:': true,\n    'gopher:': true,\n    'file:': true\n  };\n\nfunction urlParse(url, parseQueryString, slashesDenoteHost) {\n  if (url && isObject(url) && url instanceof Url) return url;\n\n  var u = new Url;\n  u.parse(url, parseQueryString, slashesDenoteHost);\n  return u;\n}\nUrl.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {\n  return parse(this, url, parseQueryString, slashesDenoteHost);\n}\n\nfunction parse(self, url, parseQueryString, slashesDenoteHost) {\n  if (!isString(url)) {\n    throw new TypeError('Parameter \\'url\\' must be a string, not ' + typeof url);\n  }\n\n  // Copy chrome, IE, opera backslash-handling behavior.\n  // Back slashes before the query string get converted to forward slashes\n  // See: https://code.google.com/p/chromium/issues/detail?id=25916\n  var queryIndex = url.indexOf('?'),\n    splitter =\n    (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',\n    uSplit = url.split(splitter),\n    slashRegex = /\\\\/g;\n  uSplit[0] = uSplit[0].replace(slashRegex, '/');\n  url = uSplit.join(splitter);\n\n  var rest = url;\n\n  // trim before proceeding.\n  // This is to support parse stuff like \"  http://foo.com  \\n\"\n  rest = rest.trim();\n\n  if (!slashesDenoteHost && url.split('#').length === 1) {\n    // Try fast path regexp\n    var simplePath = simplePathPattern.exec(rest);\n    if (simplePath) {\n      self.path = rest;\n      self.href = rest;\n      self.pathname = simplePath[1];\n      if (simplePath[2]) {\n        self.search = simplePath[2];\n        if (parseQueryString) {\n          self.query = qsParse(self.search.substr(1));\n        } else {\n          self.query = self.search.substr(1);\n        }\n      } else if (parseQueryString) {\n        self.search = '';\n        self.query = {};\n      }\n      return self;\n    }\n  }\n\n  var proto = protocolPattern.exec(rest);\n  if (proto) {\n    proto = proto[0];\n    var lowerProto = proto.toLowerCase();\n    self.protocol = lowerProto;\n    rest = rest.substr(proto.length);\n  }\n\n  // figure out if it's got a host\n  // user@server is *always* interpreted as a hostname, and url\n  // resolution will treat //foo/bar as host=foo,path=bar because that's\n  // how the browser resolves relative URLs.\n  if (slashesDenoteHost || proto || rest.match(/^\\/\\/[^@\\/]+@[^@\\/]+/)) {\n    var slashes = rest.substr(0, 2) === '//';\n    if (slashes && !(proto && hostlessProtocol[proto])) {\n      rest = rest.substr(2);\n      self.slashes = true;\n    }\n  }\n  var i, hec, l, p;\n  if (!hostlessProtocol[proto] &&\n    (slashes || (proto && !slashedProtocol[proto]))) {\n\n    // there's a hostname.\n    // the first instance of /, ?, ;, or # ends the host.\n    //\n    // If there is an @ in the hostname, then non-host chars *are* allowed\n    // to the left of the last @ sign, unless some host-ending character\n    // comes *before* the @-sign.\n    // URLs are obnoxious.\n    //\n    // ex:\n    // http://a@b@c/ => user:a@b host:c\n    // http://a@b?@c => user:a host:c path:/?@c\n\n    // v0.12 TODO(isaacs): This is not quite how Chrome does things.\n    // Review our test case against browsers more comprehensively.\n\n    // find the first instance of any hostEndingChars\n    var hostEnd = -1;\n    for (i = 0; i < hostEndingChars.length; i++) {\n      hec = rest.indexOf(hostEndingChars[i]);\n      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))\n        hostEnd = hec;\n    }\n\n    // at this point, either we have an explicit point where the\n    // auth portion cannot go past, or the last @ char is the decider.\n    var auth, atSign;\n    if (hostEnd === -1) {\n      // atSign can be anywhere.\n      atSign = rest.lastIndexOf('@');\n    } else {\n      // atSign must be in auth portion.\n      // http://a@b/c@d => host:b auth:a path:/c@d\n      atSign = rest.lastIndexOf('@', hostEnd);\n    }\n\n    // Now we have a portion which is definitely the auth.\n    // Pull that off.\n    if (atSign !== -1) {\n      auth = rest.slice(0, atSign);\n      rest = rest.slice(atSign + 1);\n      self.auth = decodeURIComponent(auth);\n    }\n\n    // the host is the remaining to the left of the first non-host char\n    hostEnd = -1;\n    for (i = 0; i < nonHostChars.length; i++) {\n      hec = rest.indexOf(nonHostChars[i]);\n      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))\n        hostEnd = hec;\n    }\n    // if we still have not hit it, then the entire thing is a host.\n    if (hostEnd === -1)\n      hostEnd = rest.length;\n\n    self.host = rest.slice(0, hostEnd);\n    rest = rest.slice(hostEnd);\n\n    // pull out port.\n    parseHost(self);\n\n    // we've indicated that there is a hostname,\n    // so even if it's empty, it has to be present.\n    self.hostname = self.hostname || '';\n\n    // if hostname begins with [ and ends with ]\n    // assume that it's an IPv6 address.\n    var ipv6Hostname = self.hostname[0] === '[' &&\n      self.hostname[self.hostname.length - 1] === ']';\n\n    // validate a little.\n    if (!ipv6Hostname) {\n      var hostparts = self.hostname.split(/\\./);\n      for (i = 0, l = hostparts.length; i < l; i++) {\n        var part = hostparts[i];\n        if (!part) continue;\n        if (!part.match(hostnamePartPattern)) {\n          var newpart = '';\n          for (var j = 0, k = part.length; j < k; j++) {\n            if (part.charCodeAt(j) > 127) {\n              // we replace non-ASCII char with a temporary placeholder\n              // we need this to make sure size of hostname is not\n              // broken by replacing non-ASCII by nothing\n              newpart += 'x';\n            } else {\n              newpart += part[j];\n            }\n          }\n          // we test again with ASCII char only\n          if (!newpart.match(hostnamePartPattern)) {\n            var validParts = hostparts.slice(0, i);\n            var notHost = hostparts.slice(i + 1);\n            var bit = part.match(hostnamePartStart);\n            if (bit) {\n              validParts.push(bit[1]);\n              notHost.unshift(bit[2]);\n            }\n            if (notHost.length) {\n              rest = '/' + notHost.join('.') + rest;\n            }\n            self.hostname = validParts.join('.');\n            break;\n          }\n        }\n      }\n    }\n\n    if (self.hostname.length > hostnameMaxLen) {\n      self.hostname = '';\n    } else {\n      // hostnames are always lower case.\n      self.hostname = self.hostname.toLowerCase();\n    }\n\n    if (!ipv6Hostname) {\n      // IDNA Support: Returns a punycoded representation of \"domain\".\n      // It only converts parts of the domain name that\n      // have non-ASCII characters, i.e. it doesn't matter if\n      // you call it with a domain that already is ASCII-only.\n      self.hostname = toASCII(self.hostname);\n    }\n\n    p = self.port ? ':' + self.port : '';\n    var h = self.hostname || '';\n    self.host = h + p;\n    self.href += self.host;\n\n    // strip [ and ] from the hostname\n    // the host field still retains them, though\n    if (ipv6Hostname) {\n      self.hostname = self.hostname.substr(1, self.hostname.length - 2);\n      if (rest[0] !== '/') {\n        rest = '/' + rest;\n      }\n    }\n  }\n\n  // now rest is set to the post-host stuff.\n  // chop off any delim chars.\n  if (!unsafeProtocol[lowerProto]) {\n\n    // First, make 100% sure that any \"autoEscape\" chars get\n    // escaped, even if encodeURIComponent doesn't think they\n    // need to be.\n    for (i = 0, l = autoEscape.length; i < l; i++) {\n      var ae = autoEscape[i];\n      if (rest.indexOf(ae) === -1)\n        continue;\n      var esc = encodeURIComponent(ae);\n      if (esc === ae) {\n        esc = escape(ae);\n      }\n      rest = rest.split(ae).join(esc);\n    }\n  }\n\n\n  // chop off from the tail first.\n  var hash = rest.indexOf('#');\n  if (hash !== -1) {\n    // got a fragment string.\n    self.hash = rest.substr(hash);\n    rest = rest.slice(0, hash);\n  }\n  var qm = rest.indexOf('?');\n  if (qm !== -1) {\n    self.search = rest.substr(qm);\n    self.query = rest.substr(qm + 1);\n    if (parseQueryString) {\n      self.query = qsParse(self.query);\n    }\n    rest = rest.slice(0, qm);\n  } else if (parseQueryString) {\n    // no query string, but parseQueryString still requested\n    self.search = '';\n    self.query = {};\n  }\n  if (rest) self.pathname = rest;\n  if (slashedProtocol[lowerProto] &&\n    self.hostname && !self.pathname) {\n    self.pathname = '/';\n  }\n\n  //to support http.request\n  if (self.pathname || self.search) {\n    p = self.pathname || '';\n    var s = self.search || '';\n    self.path = p + s;\n  }\n\n  // finally, reconstruct the href based on what has been validated.\n  self.href = format(self);\n  return self;\n}\n\n// format a parsed object into a url string\nfunction urlFormat(obj) {\n  // ensure it's an object, and not a string url.\n  // If it's an obj, this is a no-op.\n  // this way, you can call url_format() on strings\n  // to clean up potentially wonky urls.\n  if (isString(obj)) obj = parse({}, obj);\n  return format(obj);\n}\n\nfunction format(self) {\n  var auth = self.auth || '';\n  if (auth) {\n    auth = encodeURIComponent(auth);\n    auth = auth.replace(/%3A/i, ':');\n    auth += '@';\n  }\n\n  var protocol = self.protocol || '',\n    pathname = self.pathname || '',\n    hash = self.hash || '',\n    host = false,\n    query = '';\n\n  if (self.host) {\n    host = auth + self.host;\n  } else if (self.hostname) {\n    host = auth + (self.hostname.indexOf(':') === -1 ?\n      self.hostname :\n      '[' + this.hostname + ']');\n    if (self.port) {\n      host += ':' + self.port;\n    }\n  }\n\n  if (self.query &&\n    isObject(self.query) &&\n    Object.keys(self.query).length) {\n    query = qsStringify(self.query);\n  }\n\n  var search = self.search || (query && ('?' + query)) || '';\n\n  if (protocol && protocol.substr(-1) !== ':') protocol += ':';\n\n  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.\n  // unless they had them to begin with.\n  if (self.slashes ||\n    (!protocol || slashedProtocol[protocol]) && host !== false) {\n    host = '//' + (host || '');\n    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;\n  } else if (!host) {\n    host = '';\n  }\n\n  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;\n  if (search && search.charAt(0) !== '?') search = '?' + search;\n\n  pathname = pathname.replace(/[?#]/g, function(match) {\n    return encodeURIComponent(match);\n  });\n  search = search.replace('#', '%23');\n\n  return protocol + host + pathname + search + hash;\n}\n\nUrl.prototype.format = function() {\n  return format(this);\n}\n\nfunction urlResolve(source, relative) {\n  return urlParse(source, false, true).resolve(relative);\n}\n\nUrl.prototype.resolve = function(relative) {\n  return this.resolveObject(urlParse(relative, false, true)).format();\n};\n\nfunction urlResolveObject(source, relative) {\n  if (!source) return relative;\n  return urlParse(source, false, true).resolveObject(relative);\n}\n\nUrl.prototype.resolveObject = function(relative) {\n  if (isString(relative)) {\n    var rel = new Url();\n    rel.parse(relative, false, true);\n    relative = rel;\n  }\n\n  var result = new Url();\n  var tkeys = Object.keys(this);\n  for (var tk = 0; tk < tkeys.length; tk++) {\n    var tkey = tkeys[tk];\n    result[tkey] = this[tkey];\n  }\n\n  // hash is always overridden, no matter what.\n  // even href=\"\" will remove it.\n  result.hash = relative.hash;\n\n  // if the relative url is empty, then there's nothing left to do here.\n  if (relative.href === '') {\n    result.href = result.format();\n    return result;\n  }\n\n  // hrefs like //foo/bar always cut to the protocol.\n  if (relative.slashes && !relative.protocol) {\n    // take everything except the protocol from relative\n    var rkeys = Object.keys(relative);\n    for (var rk = 0; rk < rkeys.length; rk++) {\n      var rkey = rkeys[rk];\n      if (rkey !== 'protocol')\n        result[rkey] = relative[rkey];\n    }\n\n    //urlParse appends trailing / to urls like http://www.example.com\n    if (slashedProtocol[result.protocol] &&\n      result.hostname && !result.pathname) {\n      result.path = result.pathname = '/';\n    }\n\n    result.href = result.format();\n    return result;\n  }\n  var relPath;\n  if (relative.protocol && relative.protocol !== result.protocol) {\n    // if it's a known url protocol, then changing\n    // the protocol does weird things\n    // first, if it's not file:, then we MUST have a host,\n    // and if there was a path\n    // to begin with, then we MUST have a path.\n    // if it is file:, then the host is dropped,\n    // because that's known to be hostless.\n    // anything else is assumed to be absolute.\n    if (!slashedProtocol[relative.protocol]) {\n      var keys = Object.keys(relative);\n      for (var v = 0; v < keys.length; v++) {\n        var k = keys[v];\n        result[k] = relative[k];\n      }\n      result.href = result.format();\n      return result;\n    }\n\n    result.protocol = relative.protocol;\n    if (!relative.host && !hostlessProtocol[relative.protocol]) {\n      relPath = (relative.pathname || '').split('/');\n      while (relPath.length && !(relative.host = relPath.shift()));\n      if (!relative.host) relative.host = '';\n      if (!relative.hostname) relative.hostname = '';\n      if (relPath[0] !== '') relPath.unshift('');\n      if (relPath.length < 2) relPath.unshift('');\n      result.pathname = relPath.join('/');\n    } else {\n      result.pathname = relative.pathname;\n    }\n    result.search = relative.search;\n    result.query = relative.query;\n    result.host = relative.host || '';\n    result.auth = relative.auth;\n    result.hostname = relative.hostname || relative.host;\n    result.port = relative.port;\n    // to support http.request\n    if (result.pathname || result.search) {\n      var p = result.pathname || '';\n      var s = result.search || '';\n      result.path = p + s;\n    }\n    result.slashes = result.slashes || relative.slashes;\n    result.href = result.format();\n    return result;\n  }\n\n  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),\n    isRelAbs = (\n      relative.host ||\n      relative.pathname && relative.pathname.charAt(0) === '/'\n    ),\n    mustEndAbs = (isRelAbs || isSourceAbs ||\n      (result.host && relative.pathname)),\n    removeAllDots = mustEndAbs,\n    srcPath = result.pathname && result.pathname.split('/') || [],\n    psychotic = result.protocol && !slashedProtocol[result.protocol];\n  relPath = relative.pathname && relative.pathname.split('/') || [];\n  // if the url is a non-slashed url, then relative\n  // links like ../.. should be able\n  // to crawl up to the hostname, as well.  This is strange.\n  // result.protocol has already been set by now.\n  // Later on, put the first path part into the host field.\n  if (psychotic) {\n    result.hostname = '';\n    result.port = null;\n    if (result.host) {\n      if (srcPath[0] === '') srcPath[0] = result.host;\n      else srcPath.unshift(result.host);\n    }\n    result.host = '';\n    if (relative.protocol) {\n      relative.hostname = null;\n      relative.port = null;\n      if (relative.host) {\n        if (relPath[0] === '') relPath[0] = relative.host;\n        else relPath.unshift(relative.host);\n      }\n      relative.host = null;\n    }\n    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');\n  }\n  var authInHost;\n  if (isRelAbs) {\n    // it's absolute.\n    result.host = (relative.host || relative.host === '') ?\n      relative.host : result.host;\n    result.hostname = (relative.hostname || relative.hostname === '') ?\n      relative.hostname : result.hostname;\n    result.search = relative.search;\n    result.query = relative.query;\n    srcPath = relPath;\n    // fall through to the dot-handling below.\n  } else if (relPath.length) {\n    // it's relative\n    // throw away the existing file, and take the new path instead.\n    if (!srcPath) srcPath = [];\n    srcPath.pop();\n    srcPath = srcPath.concat(relPath);\n    result.search = relative.search;\n    result.query = relative.query;\n  } else if (!isNullOrUndefined(relative.search)) {\n    // just pull out the search.\n    // like href='?foo'.\n    // Put this after the other two cases because it simplifies the booleans\n    if (psychotic) {\n      result.hostname = result.host = srcPath.shift();\n      //occationaly the auth can get stuck only in host\n      //this especially happens in cases like\n      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')\n      authInHost = result.host && result.host.indexOf('@') > 0 ?\n        result.host.split('@') : false;\n      if (authInHost) {\n        result.auth = authInHost.shift();\n        result.host = result.hostname = authInHost.shift();\n      }\n    }\n    result.search = relative.search;\n    result.query = relative.query;\n    //to support http.request\n    if (!isNull(result.pathname) || !isNull(result.search)) {\n      result.path = (result.pathname ? result.pathname : '') +\n        (result.search ? result.search : '');\n    }\n    result.href = result.format();\n    return result;\n  }\n\n  if (!srcPath.length) {\n    // no path at all.  easy.\n    // we've already handled the other stuff above.\n    result.pathname = null;\n    //to support http.request\n    if (result.search) {\n      result.path = '/' + result.search;\n    } else {\n      result.path = null;\n    }\n    result.href = result.format();\n    return result;\n  }\n\n  // if a url ENDs in . or .., then it must get a trailing slash.\n  // however, if it ends in anything else non-slashy,\n  // then it must NOT get a trailing slash.\n  var last = srcPath.slice(-1)[0];\n  var hasTrailingSlash = (\n    (result.host || relative.host || srcPath.length > 1) &&\n    (last === '.' || last === '..') || last === '');\n\n  // strip single dots, resolve double dots to parent dir\n  // if the path tries to go above the root, `up` ends up > 0\n  var up = 0;\n  for (var i = srcPath.length; i >= 0; i--) {\n    last = srcPath[i];\n    if (last === '.') {\n      srcPath.splice(i, 1);\n    } else if (last === '..') {\n      srcPath.splice(i, 1);\n      up++;\n    } else if (up) {\n      srcPath.splice(i, 1);\n      up--;\n    }\n  }\n\n  // if the path is allowed to go above the root, restore leading ..s\n  if (!mustEndAbs && !removeAllDots) {\n    for (; up--; up) {\n      srcPath.unshift('..');\n    }\n  }\n\n  if (mustEndAbs && srcPath[0] !== '' &&\n    (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {\n    srcPath.unshift('');\n  }\n\n  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {\n    srcPath.push('');\n  }\n\n  var isAbsolute = srcPath[0] === '' ||\n    (srcPath[0] && srcPath[0].charAt(0) === '/');\n\n  // put the host back\n  if (psychotic) {\n    result.hostname = result.host = isAbsolute ? '' :\n      srcPath.length ? srcPath.shift() : '';\n    //occationaly the auth can get stuck only in host\n    //this especially happens in cases like\n    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')\n    authInHost = result.host && result.host.indexOf('@') > 0 ?\n      result.host.split('@') : false;\n    if (authInHost) {\n      result.auth = authInHost.shift();\n      result.host = result.hostname = authInHost.shift();\n    }\n  }\n\n  mustEndAbs = mustEndAbs || (result.host && srcPath.length);\n\n  if (mustEndAbs && !isAbsolute) {\n    srcPath.unshift('');\n  }\n\n  if (!srcPath.length) {\n    result.pathname = null;\n    result.path = null;\n  } else {\n    result.pathname = srcPath.join('/');\n  }\n\n  //to support request.http\n  if (!isNull(result.pathname) || !isNull(result.search)) {\n    result.path = (result.pathname ? result.pathname : '') +\n      (result.search ? result.search : '');\n  }\n  result.auth = relative.auth || result.auth;\n  result.slashes = result.slashes || relative.slashes;\n  result.href = result.format();\n  return result;\n};\n\nUrl.prototype.parseHost = function() {\n  return parseHost(this);\n};\n\nfunction parseHost(self) {\n  var host = self.host;\n  var port = portPattern.exec(host);\n  if (port) {\n    port = port[0];\n    if (port !== ':') {\n      self.port = port.substr(1);\n    }\n    host = host.substr(0, host.length - port.length);\n  }\n  if (host) self.hostname = host;\n}\n","util.js":"// Copyright Joyent, Inc. and other Node contributors.\n//\n// Permission is hereby granted, free of charge, to any person obtaining a\n// copy of this software and associated documentation files (the\n// \"Software\"), to deal in the Software without restriction, including\n// without limitation the rights to use, copy, modify, merge, publish,\n// distribute, sublicense, and/or sell copies of the Software, and to permit\n// persons to whom the Software is furnished to do so, subject to the\n// following conditions:\n//\n// The above copyright notice and this permission notice shall be included\n// in all copies or substantial portions of the Software.\n//\n// THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS\n// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\n// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN\n// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,\n// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR\n// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE\n// USE OR OTHER DEALINGS IN THE SOFTWARE.\nimport process from 'process';\nvar formatRegExp = /%[sdj%]/g;\nexport function format(f) {\n  if (!isString(f)) {\n    var objects = [];\n    for (var i = 0; i < arguments.length; i++) {\n      objects.push(inspect(arguments[i]));\n    }\n    return objects.join(' ');\n  }\n\n  var i = 1;\n  var args = arguments;\n  var len = args.length;\n  var str = String(f).replace(formatRegExp, function(x) {\n    if (x === '%%') return '%';\n    if (i >= len) return x;\n    switch (x) {\n      case '%s': return String(args[i++]);\n      case '%d': return Number(args[i++]);\n      case '%j':\n        try {\n          return JSON.stringify(args[i++]);\n        } catch (_) {\n          return '[Circular]';\n        }\n      default:\n        return x;\n    }\n  });\n  for (var x = args[i]; i < len; x = args[++i]) {\n    if (isNull(x) || !isObject(x)) {\n      str += ' ' + x;\n    } else {\n      str += ' ' + inspect(x);\n    }\n  }\n  return str;\n};\n\n\n// Mark that a method should not be used.\n// Returns a modified function which warns once by default.\n// If --no-deprecation is set, then it is a no-op.\nexport function deprecate(fn, msg) {\n  // Allow for deprecating things in the process of starting up.\n  if (isUndefined(global.process)) {\n    return function() {\n      return deprecate(fn, msg).apply(this, arguments);\n    };\n  }\n\n  if (process.noDeprecation === true) {\n    return fn;\n  }\n\n  var warned = false;\n  function deprecated() {\n    if (!warned) {\n      if (process.throwDeprecation) {\n        throw new Error(msg);\n      } else if (process.traceDeprecation) {\n        console.trace(msg);\n      } else {\n        console.error(msg);\n      }\n      warned = true;\n    }\n    return fn.apply(this, arguments);\n  }\n\n  return deprecated;\n};\n\n\nvar debugs = {};\nvar debugEnviron;\nexport function debuglog(set) {\n  if (isUndefined(debugEnviron))\n    debugEnviron = process.env.NODE_DEBUG || '';\n  set = set.toUpperCase();\n  if (!debugs[set]) {\n    if (new RegExp('\\\\b' + set + '\\\\b', 'i').test(debugEnviron)) {\n      var pid = 0;\n      debugs[set] = function() {\n        var msg = format.apply(null, arguments);\n        console.error('%s %d: %s', set, pid, msg);\n      };\n    } else {\n      debugs[set] = function() {};\n    }\n  }\n  return debugs[set];\n};\n\n\n/**\n * Echos the value of a value. Trys to print the value out\n * in the best way possible given the different types.\n *\n * @param {Object} obj The object to print out.\n * @param {Object} opts Optional options object that alters the output.\n */\n/* legacy: obj, showHidden, depth, colors*/\nexport function inspect(obj, opts) {\n  // default options\n  var ctx = {\n    seen: [],\n    stylize: stylizeNoColor\n  };\n  // legacy...\n  if (arguments.length >= 3) ctx.depth = arguments[2];\n  if (arguments.length >= 4) ctx.colors = arguments[3];\n  if (isBoolean(opts)) {\n    // legacy...\n    ctx.showHidden = opts;\n  } else if (opts) {\n    // got an \"options\" object\n    _extend(ctx, opts);\n  }\n  // set default options\n  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;\n  if (isUndefined(ctx.depth)) ctx.depth = 2;\n  if (isUndefined(ctx.colors)) ctx.colors = false;\n  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;\n  if (ctx.colors) ctx.stylize = stylizeWithColor;\n  return formatValue(ctx, obj, ctx.depth);\n}\n\n// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics\ninspect.colors = {\n  'bold' : [1, 22],\n  'italic' : [3, 23],\n  'underline' : [4, 24],\n  'inverse' : [7, 27],\n  'white' : [37, 39],\n  'grey' : [90, 39],\n  'black' : [30, 39],\n  'blue' : [34, 39],\n  'cyan' : [36, 39],\n  'green' : [32, 39],\n  'magenta' : [35, 39],\n  'red' : [31, 39],\n  'yellow' : [33, 39]\n};\n\n// Don't use 'blue' not visible on cmd.exe\ninspect.styles = {\n  'special': 'cyan',\n  'number': 'yellow',\n  'boolean': 'yellow',\n  'undefined': 'grey',\n  'null': 'bold',\n  'string': 'green',\n  'date': 'magenta',\n  // \"name\": intentionally not styling\n  'regexp': 'red'\n};\n\n\nfunction stylizeWithColor(str, styleType) {\n  var style = inspect.styles[styleType];\n\n  if (style) {\n    return '\\u001b[' + inspect.colors[style][0] + 'm' + str +\n           '\\u001b[' + inspect.colors[style][1] + 'm';\n  } else {\n    return str;\n  }\n}\n\n\nfunction stylizeNoColor(str, styleType) {\n  return str;\n}\n\n\nfunction arrayToHash(array) {\n  var hash = {};\n\n  array.forEach(function(val, idx) {\n    hash[val] = true;\n  });\n\n  return hash;\n}\n\n\nfunction formatValue(ctx, value, recurseTimes) {\n  // Provide a hook for user-specified inspect functions.\n  // Check that value is an object with an inspect function on it\n  if (ctx.customInspect &&\n      value &&\n      isFunction(value.inspect) &&\n      // Filter out the util module, it's inspect function is special\n      value.inspect !== inspect &&\n      // Also filter out any prototype objects using the circular check.\n      !(value.constructor && value.constructor.prototype === value)) {\n    var ret = value.inspect(recurseTimes, ctx);\n    if (!isString(ret)) {\n      ret = formatValue(ctx, ret, recurseTimes);\n    }\n    return ret;\n  }\n\n  // Primitive types cannot have properties\n  var primitive = formatPrimitive(ctx, value);\n  if (primitive) {\n    return primitive;\n  }\n\n  // Look up the keys of the object.\n  var keys = Object.keys(value);\n  var visibleKeys = arrayToHash(keys);\n\n  if (ctx.showHidden) {\n    keys = Object.getOwnPropertyNames(value);\n  }\n\n  // IE doesn't make error fields non-enumerable\n  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx\n  if (isError(value)\n      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {\n    return formatError(value);\n  }\n\n  // Some type of object without properties can be shortcutted.\n  if (keys.length === 0) {\n    if (isFunction(value)) {\n      var name = value.name ? ': ' + value.name : '';\n      return ctx.stylize('[Function' + name + ']', 'special');\n    }\n    if (isRegExp(value)) {\n      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');\n    }\n    if (isDate(value)) {\n      return ctx.stylize(Date.prototype.toString.call(value), 'date');\n    }\n    if (isError(value)) {\n      return formatError(value);\n    }\n  }\n\n  var base = '', array = false, braces = ['{', '}'];\n\n  // Make Array say that they are Array\n  if (isArray(value)) {\n    array = true;\n    braces = ['[', ']'];\n  }\n\n  // Make functions say that they are functions\n  if (isFunction(value)) {\n    var n = value.name ? ': ' + value.name : '';\n    base = ' [Function' + n + ']';\n  }\n\n  // Make RegExps say that they are RegExps\n  if (isRegExp(value)) {\n    base = ' ' + RegExp.prototype.toString.call(value);\n  }\n\n  // Make dates with properties first say the date\n  if (isDate(value)) {\n    base = ' ' + Date.prototype.toUTCString.call(value);\n  }\n\n  // Make error with message first say the error\n  if (isError(value)) {\n    base = ' ' + formatError(value);\n  }\n\n  if (keys.length === 0 && (!array || value.length == 0)) {\n    return braces[0] + base + braces[1];\n  }\n\n  if (recurseTimes < 0) {\n    if (isRegExp(value)) {\n      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');\n    } else {\n      return ctx.stylize('[Object]', 'special');\n    }\n  }\n\n  ctx.seen.push(value);\n\n  var output;\n  if (array) {\n    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);\n  } else {\n    output = keys.map(function(key) {\n      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);\n    });\n  }\n\n  ctx.seen.pop();\n\n  return reduceToSingleString(output, base, braces);\n}\n\n\nfunction formatPrimitive(ctx, value) {\n  if (isUndefined(value))\n    return ctx.stylize('undefined', 'undefined');\n  if (isString(value)) {\n    var simple = '\\'' + JSON.stringify(value).replace(/^\"|\"$/g, '')\n                                             .replace(/'/g, \"\\\\'\")\n                                             .replace(/\\\\\"/g, '\"') + '\\'';\n    return ctx.stylize(simple, 'string');\n  }\n  if (isNumber(value))\n    return ctx.stylize('' + value, 'number');\n  if (isBoolean(value))\n    return ctx.stylize('' + value, 'boolean');\n  // For some reason typeof null is \"object\", so special case here.\n  if (isNull(value))\n    return ctx.stylize('null', 'null');\n}\n\n\nfunction formatError(value) {\n  return '[' + Error.prototype.toString.call(value) + ']';\n}\n\n\nfunction formatArray(ctx, value, recurseTimes, visibleKeys, keys) {\n  var output = [];\n  for (var i = 0, l = value.length; i < l; ++i) {\n    if (hasOwnProperty(value, String(i))) {\n      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,\n          String(i), true));\n    } else {\n      output.push('');\n    }\n  }\n  keys.forEach(function(key) {\n    if (!key.match(/^\\d+$/)) {\n      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,\n          key, true));\n    }\n  });\n  return output;\n}\n\n\nfunction formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {\n  var name, str, desc;\n  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };\n  if (desc.get) {\n    if (desc.set) {\n      str = ctx.stylize('[Getter/Setter]', 'special');\n    } else {\n      str = ctx.stylize('[Getter]', 'special');\n    }\n  } else {\n    if (desc.set) {\n      str = ctx.stylize('[Setter]', 'special');\n    }\n  }\n  if (!hasOwnProperty(visibleKeys, key)) {\n    name = '[' + key + ']';\n  }\n  if (!str) {\n    if (ctx.seen.indexOf(desc.value) < 0) {\n      if (isNull(recurseTimes)) {\n        str = formatValue(ctx, desc.value, null);\n      } else {\n        str = formatValue(ctx, desc.value, recurseTimes - 1);\n      }\n      if (str.indexOf('\\n') > -1) {\n        if (array) {\n          str = str.split('\\n').map(function(line) {\n            return '  ' + line;\n          }).join('\\n').substr(2);\n        } else {\n          str = '\\n' + str.split('\\n').map(function(line) {\n            return '   ' + line;\n          }).join('\\n');\n        }\n      }\n    } else {\n      str = ctx.stylize('[Circular]', 'special');\n    }\n  }\n  if (isUndefined(name)) {\n    if (array && key.match(/^\\d+$/)) {\n      return str;\n    }\n    name = JSON.stringify('' + key);\n    if (name.match(/^\"([a-zA-Z_][a-zA-Z_0-9]*)\"$/)) {\n      name = name.substr(1, name.length - 2);\n      name = ctx.stylize(name, 'name');\n    } else {\n      name = name.replace(/'/g, \"\\\\'\")\n                 .replace(/\\\\\"/g, '\"')\n                 .replace(/(^\"|\"$)/g, \"'\");\n      name = ctx.stylize(name, 'string');\n    }\n  }\n\n  return name + ': ' + str;\n}\n\n\nfunction reduceToSingleString(output, base, braces) {\n  var numLinesEst = 0;\n  var length = output.reduce(function(prev, cur) {\n    numLinesEst++;\n    if (cur.indexOf('\\n') >= 0) numLinesEst++;\n    return prev + cur.replace(/\\u001b\\[\\d\\d?m/g, '').length + 1;\n  }, 0);\n\n  if (length > 60) {\n    return braces[0] +\n           (base === '' ? '' : base + '\\n ') +\n           ' ' +\n           output.join(',\\n  ') +\n           ' ' +\n           braces[1];\n  }\n\n  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];\n}\n\n\n// NOTE: These type checking functions intentionally don't use `instanceof`\n// because it is fragile and can be easily faked with `Object.create()`.\nexport function isArray(ar) {\n  return Array.isArray(ar);\n}\n\nexport function isBoolean(arg) {\n  return typeof arg === 'boolean';\n}\n\nexport function isNull(arg) {\n  return arg === null;\n}\n\nexport function isNullOrUndefined(arg) {\n  return arg == null;\n}\n\nexport function isNumber(arg) {\n  return typeof arg === 'number';\n}\n\nexport function isString(arg) {\n  return typeof arg === 'string';\n}\n\nexport function isSymbol(arg) {\n  return typeof arg === 'symbol';\n}\n\nexport function isUndefined(arg) {\n  return arg === void 0;\n}\n\nexport function isRegExp(re) {\n  return isObject(re) && objectToString(re) === '[object RegExp]';\n}\n\nexport function isObject(arg) {\n  return typeof arg === 'object' && arg !== null;\n}\n\nexport function isDate(d) {\n  return isObject(d) && objectToString(d) === '[object Date]';\n}\n\nexport function isError(e) {\n  return isObject(e) &&\n      (objectToString(e) === '[object Error]' || e instanceof Error);\n}\n\nexport function isFunction(arg) {\n  return typeof arg === 'function';\n}\n\nexport function isPrimitive(arg) {\n  return arg === null ||\n         typeof arg === 'boolean' ||\n         typeof arg === 'number' ||\n         typeof arg === 'string' ||\n         typeof arg === 'symbol' ||  // ES6 symbol\n         typeof arg === 'undefined';\n}\n\nexport function isBuffer(maybeBuf) {\n  return Buffer.isBuffer(maybeBuf);\n}\n\nfunction objectToString(o) {\n  return Object.prototype.toString.call(o);\n}\n\n\nfunction pad(n) {\n  return n < 10 ? '0' + n.toString(10) : n.toString(10);\n}\n\n\nvar months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',\n              'Oct', 'Nov', 'Dec'];\n\n// 26 Feb 16:19:34\nfunction timestamp() {\n  var d = new Date();\n  var time = [pad(d.getHours()),\n              pad(d.getMinutes()),\n              pad(d.getSeconds())].join(':');\n  return [d.getDate(), months[d.getMonth()], time].join(' ');\n}\n\n\n// log is just a thin wrapper to console.log that prepends a timestamp\nexport function log() {\n  console.log('%s - %s', timestamp(), format.apply(null, arguments));\n}\n\n\n/**\n * Inherit the prototype methods from one constructor into another.\n *\n * The Function.prototype.inherits from lang.js rewritten as a standalone\n * function (not on Function.prototype). NOTE: If this file is to be loaded\n * during bootstrapping this function needs to be rewritten using some native\n * functions as prototype setup using normal JavaScript does not work as\n * expected during bootstrapping (see mirror.js in r114903).\n *\n * @param {function} ctor Constructor function which needs to inherit the\n *     prototype.\n * @param {function} superCtor Constructor function to inherit prototype from.\n */\nimport inherits from '_inherits';\nexport {inherits}\n\nexport function _extend(origin, add) {\n  // Don't do anything if add isn't an object\n  if (!add || !isObject(add)) return origin;\n\n  var keys = Object.keys(add);\n  var i = keys.length;\n  while (i--) {\n    origin[keys[i]] = add[keys[i]];\n  }\n  return origin;\n};\n\nfunction hasOwnProperty(obj, prop) {\n  return Object.prototype.hasOwnProperty.call(obj, prop);\n}\n\nexport default {\n  inherits: inherits,\n  _extend: _extend,\n  log: log,\n  isBuffer: isBuffer,\n  isPrimitive: isPrimitive,\n  isFunction: isFunction,\n  isError: isError,\n  isDate: isDate,\n  isObject: isObject,\n  isRegExp: isRegExp,\n  isUndefined: isUndefined,\n  isSymbol: isSymbol,\n  isString: isString,\n  isNumber: isNumber,\n  isNullOrUndefined: isNullOrUndefined,\n  isNull: isNull,\n  isBoolean: isBoolean,\n  isArray: isArray,\n  inspect: inspect,\n  deprecate: deprecate,\n  format: format,\n  debuglog: debuglog\n}\n","vm.js":"/*\nfrom https://github.com/substack/vm-browserify/blob/bfd7c5f59edec856dc7efe0b77a4f6b2fa20f226/index.js\n\nMIT license no Copyright holder mentioned\n*/\n\n\nfunction Object_keys(obj) {\n  if (Object.keys) return Object.keys(obj)\n  else {\n    var res = [];\n    for (var key in obj) res.push(key)\n    return res;\n  }\n}\n\nfunction forEach(xs, fn) {\n  if (xs.forEach) return xs.forEach(fn)\n  else\n    for (var i = 0; i < xs.length; i++) {\n      fn(xs[i], i, xs);\n    }\n}\nvar _defineProp;\n\nfunction defineProp(obj, name, value) {\n  if (typeof _defineProp !== 'function') {\n    _defineProp = createDefineProp;\n  }\n  _defineProp(obj, name, value);\n}\n\nfunction createDefineProp() {\n  try {\n    Object.defineProperty({}, '_', {});\n    return function(obj, name, value) {\n      Object.defineProperty(obj, name, {\n        writable: true,\n        enumerable: false,\n        configurable: true,\n        value: value\n      })\n    };\n  } catch (e) {\n    return function(obj, name, value) {\n      obj[name] = value;\n    };\n  }\n}\n\nvar globals = ['Array', 'Boolean', 'Date', 'Error', 'EvalError', 'Function',\n  'Infinity', 'JSON', 'Math', 'NaN', 'Number', 'Object', 'RangeError',\n  'ReferenceError', 'RegExp', 'String', 'SyntaxError', 'TypeError', 'URIError',\n  'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape',\n  'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined', 'unescape'\n];\n\nfunction Context() {}\nContext.prototype = {};\n\nexport function Script(code) {\n  if (!(this instanceof Script)) return new Script(code);\n  this.code = code;\n}\nfunction otherRunInContext(code, context) {\n  var args = Object_keys(global);\n  args.push('with (this.__ctx__){return eval(this.__code__)}');\n  var fn = Function.apply(null, args);\n  return fn.apply({\n    __code__: code,\n    __ctx__: context\n  });\n}\nScript.prototype.runInContext = function(context) {\n  if (!(context instanceof Context)) {\n    throw new TypeError('needs a \\'context\\' argument.');\n  }\n  if (global.document) {\n    var iframe = global.document.createElement('iframe');\n    if (!iframe.style) iframe.style = {};\n    iframe.style.display = 'none';\n\n    global.document.body.appendChild(iframe);\n\n    var win = iframe.contentWindow;\n    var wEval = win.eval,\n      wExecScript = win.execScript;\n\n    if (!wEval && wExecScript) {\n      // win.eval() magically appears when this is called in IE:\n      wExecScript.call(win, 'null');\n      wEval = win.eval;\n    }\n\n    forEach(Object_keys(context), function(key) {\n      win[key] = context[key];\n    });\n    forEach(globals, function(key) {\n      if (context[key]) {\n        win[key] = context[key];\n      }\n    });\n\n    var winKeys = Object_keys(win);\n\n    var res = wEval.call(win, this.code);\n\n    forEach(Object_keys(win), function(key) {\n      // Avoid copying circular objects like `top` and `window` by only\n      // updating existing context properties or new properties in the `win`\n      // that was only introduced after the eval.\n      if (key in context || indexOf(winKeys, key) === -1) {\n        context[key] = win[key];\n      }\n    });\n\n    forEach(globals, function(key) {\n      if (!(key in context)) {\n        defineProp(context, key, win[key]);\n      }\n    });\n    global.document.body.removeChild(iframe);\n\n    return res;\n  }\n  return otherRunInContext(this.code, context);\n};\n\nScript.prototype.runInThisContext = function() {\n  var fn = new Function('code', 'return eval(code);');\n  return fn.call(global, this.code); // maybe...\n};\n\nScript.prototype.runInNewContext = function(context) {\n  var ctx = createContext(context);\n  var res = this.runInContext(ctx);\n  if (context) {\n    forEach(Object_keys(ctx), function(key) {\n      context[key] = ctx[key];\n    });\n  }\n\n  return res;\n};\n\n\nexport function createScript(code) {\n  return new Script(code);\n}\n\nexport function createContext(context) {\n  if (isContext(context)) {\n    return context;\n  }\n  var copy = new Context();\n  if (typeof context === 'object') {\n    forEach(Object_keys(context), function(key) {\n      copy[key] = context[key];\n    });\n  }\n  return copy;\n}\nexport function runInContext(code, contextifiedSandbox, options) {\n  var script = new Script(code, options);\n  return script.runInContext(contextifiedSandbox, options);\n}\nexport function runInThisContext(code, options) {\n  var script = new Script(code, options);\n  return script.runInThisContext(options);\n}\nexport function isContext(context) {\n  return context instanceof Context;\n}\nexport function runInNewContext(code, sandbox, options) {\n  var script = new Script(code, options);\n  return script.runInNewContext(sandbox, options);\n}\nexport default {\n  runInContext: runInContext,\n  isContext: isContext,\n  createContext: createContext,\n  createScript: createScript,\n  Script: Script,\n  runInThisContext: runInThisContext,\n  runInNewContext: runInNewContext\n}\n\n\n/*\nfrom indexOf\n@ author tjholowaychuk\n@ license MIT\n*/\nvar _indexOf = [].indexOf;\n\nfunction indexOf(arr, obj){\n  if (_indexOf) return arr.indexOf(obj);\n  for (var i = 0; i < arr.length; ++i) {\n    if (arr[i] === obj) return i;\n  }\n  return -1;\n}\n","zlib.js":"// Copyright Joyent, Inc. and other Node contributors.\n//\n// Permission is hereby granted, free of charge, to any person obtaining a\n// copy of this software and associated documentation files (the\n// \"Software\"), to deal in the Software without restriction, including\n// without limitation the rights to use, copy, modify, merge, publish,\n// distribute, sublicense, and/or sell copies of the Software, and to permit\n// persons to whom the Software is furnished to do so, subject to the\n// following conditions:\n//\n// The above copyright notice and this permission notice shall be included\n// in all copies or substantial portions of the Software.\n//\n// THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS\n// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\n// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN\n// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,\n// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR\n// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE\n// USE OR OTHER DEALINGS IN THE SOFTWARE.\n\nimport {Transform} from 'stream';\nimport * as _binding from '\\0polyfill-node.__zlib-lib/binding';\nimport {inherits} from 'util';\nfunction assert (a, msg) {\n  if (!a) {\n    throw new Error(msg);\n  }\n}\nvar binding = {};\nObject.keys(_binding).forEach(function (key) {\n  binding[key] = _binding[key];\n});\n// zlib doesn't provide these, so kludge them in following the same\n// const naming scheme zlib uses.\nbinding.Z_MIN_WINDOWBITS = 8;\nbinding.Z_MAX_WINDOWBITS = 15;\nbinding.Z_DEFAULT_WINDOWBITS = 15;\n\n// fewer than 64 bytes per chunk is stupid.\n// technically it could work with as few as 8, but even 64 bytes\n// is absurdly low.  Usually a MB or more is best.\nbinding.Z_MIN_CHUNK = 64;\nbinding.Z_MAX_CHUNK = Infinity;\nbinding.Z_DEFAULT_CHUNK = (16 * 1024);\n\nbinding.Z_MIN_MEMLEVEL = 1;\nbinding.Z_MAX_MEMLEVEL = 9;\nbinding.Z_DEFAULT_MEMLEVEL = 8;\n\nbinding.Z_MIN_LEVEL = -1;\nbinding.Z_MAX_LEVEL = 9;\nbinding.Z_DEFAULT_LEVEL = binding.Z_DEFAULT_COMPRESSION;\n\n\n// translation table for return codes.\nexport var codes = {\n  Z_OK: binding.Z_OK,\n  Z_STREAM_END: binding.Z_STREAM_END,\n  Z_NEED_DICT: binding.Z_NEED_DICT,\n  Z_ERRNO: binding.Z_ERRNO,\n  Z_STREAM_ERROR: binding.Z_STREAM_ERROR,\n  Z_DATA_ERROR: binding.Z_DATA_ERROR,\n  Z_MEM_ERROR: binding.Z_MEM_ERROR,\n  Z_BUF_ERROR: binding.Z_BUF_ERROR,\n  Z_VERSION_ERROR: binding.Z_VERSION_ERROR\n};\n\nObject.keys(codes).forEach(function(k) {\n  codes[codes[k]] = k;\n});\n\nexport function createDeflate(o) {\n  return new Deflate(o);\n}\n\nexport function createInflate(o) {\n  return new Inflate(o);\n}\n\nexport function createDeflateRaw(o) {\n  return new DeflateRaw(o);\n}\n\nexport function createInflateRaw(o) {\n  return new InflateRaw(o);\n}\n\nexport function createGzip(o) {\n  return new Gzip(o);\n}\n\nexport function createGunzip(o) {\n  return new Gunzip(o);\n}\n\nexport function createUnzip(o) {\n  return new Unzip(o);\n}\n\n\n// Convenience methods.\n// compress/decompress a string or buffer in one step.\nexport function deflate(buffer, opts, callback) {\n  if (typeof opts === 'function') {\n    callback = opts;\n    opts = {};\n  }\n  return zlibBuffer(new Deflate(opts), buffer, callback);\n}\n\nexport function deflateSync(buffer, opts) {\n  return zlibBufferSync(new Deflate(opts), buffer);\n}\n\nexport function gzip(buffer, opts, callback) {\n  if (typeof opts === 'function') {\n    callback = opts;\n    opts = {};\n  }\n  return zlibBuffer(new Gzip(opts), buffer, callback);\n}\n\nexport function gzipSync(buffer, opts) {\n  return zlibBufferSync(new Gzip(opts), buffer);\n}\n\nexport function deflateRaw(buffer, opts, callback) {\n  if (typeof opts === 'function') {\n    callback = opts;\n    opts = {};\n  }\n  return zlibBuffer(new DeflateRaw(opts), buffer, callback);\n}\n\nexport function deflateRawSync(buffer, opts) {\n  return zlibBufferSync(new DeflateRaw(opts), buffer);\n}\n\nexport function unzip(buffer, opts, callback) {\n  if (typeof opts === 'function') {\n    callback = opts;\n    opts = {};\n  }\n  return zlibBuffer(new Unzip(opts), buffer, callback);\n}\n\nexport function unzipSync(buffer, opts) {\n  return zlibBufferSync(new Unzip(opts), buffer);\n}\n\nexport function inflate(buffer, opts, callback) {\n  if (typeof opts === 'function') {\n    callback = opts;\n    opts = {};\n  }\n  return zlibBuffer(new Inflate(opts), buffer, callback);\n}\n\nexport function inflateSync(buffer, opts) {\n  return zlibBufferSync(new Inflate(opts), buffer);\n}\n\nexport function gunzip(buffer, opts, callback) {\n  if (typeof opts === 'function') {\n    callback = opts;\n    opts = {};\n  }\n  return zlibBuffer(new Gunzip(opts), buffer, callback);\n}\n\nexport function gunzipSync(buffer, opts) {\n  return zlibBufferSync(new Gunzip(opts), buffer);\n}\n\nexport function inflateRaw(buffer, opts, callback) {\n  if (typeof opts === 'function') {\n    callback = opts;\n    opts = {};\n  }\n  return zlibBuffer(new InflateRaw(opts), buffer, callback);\n}\n\nexport function inflateRawSync(buffer, opts) {\n  return zlibBufferSync(new InflateRaw(opts), buffer);\n}\n\nfunction zlibBuffer(engine, buffer, callback) {\n  var buffers = [];\n  var nread = 0;\n\n  engine.on('error', onError);\n  engine.on('end', onEnd);\n\n  engine.end(buffer);\n  flow();\n\n  function flow() {\n    var chunk;\n    while (null !== (chunk = engine.read())) {\n      buffers.push(chunk);\n      nread += chunk.length;\n    }\n    engine.once('readable', flow);\n  }\n\n  function onError(err) {\n    engine.removeListener('end', onEnd);\n    engine.removeListener('readable', flow);\n    callback(err);\n  }\n\n  function onEnd() {\n    var buf = Buffer.concat(buffers, nread);\n    buffers = [];\n    callback(null, buf);\n    engine.close();\n  }\n}\n\nfunction zlibBufferSync(engine, buffer) {\n  if (typeof buffer === 'string')\n    buffer = new Buffer(buffer);\n  if (!Buffer.isBuffer(buffer))\n    throw new TypeError('Not a string or buffer');\n\n  var flushFlag = binding.Z_FINISH;\n\n  return engine._processChunk(buffer, flushFlag);\n}\n\n// generic zlib\n// minimal 2-byte header\nexport function Deflate(opts) {\n  if (!(this instanceof Deflate)) return new Deflate(opts);\n  Zlib.call(this, opts, binding.DEFLATE);\n}\n\nexport function Inflate(opts) {\n  if (!(this instanceof Inflate)) return new Inflate(opts);\n  Zlib.call(this, opts, binding.INFLATE);\n}\n\n\n\n// gzip - bigger header, same deflate compression\nexport function Gzip(opts) {\n  if (!(this instanceof Gzip)) return new Gzip(opts);\n  Zlib.call(this, opts, binding.GZIP);\n}\n\nexport function Gunzip(opts) {\n  if (!(this instanceof Gunzip)) return new Gunzip(opts);\n  Zlib.call(this, opts, binding.GUNZIP);\n}\n\n\n\n// raw - no header\nexport function DeflateRaw(opts) {\n  if (!(this instanceof DeflateRaw)) return new DeflateRaw(opts);\n  Zlib.call(this, opts, binding.DEFLATERAW);\n}\n\nexport function InflateRaw(opts) {\n  if (!(this instanceof InflateRaw)) return new InflateRaw(opts);\n  Zlib.call(this, opts, binding.INFLATERAW);\n}\n\n\n// auto-detect header.\nexport function Unzip(opts) {\n  if (!(this instanceof Unzip)) return new Unzip(opts);\n  Zlib.call(this, opts, binding.UNZIP);\n}\n\n\n// the Zlib class they all inherit from\n// This thing manages the queue of requests, and returns\n// true or false if there is anything in the queue when\n// you call the .write() method.\n\nexport function Zlib(opts, mode) {\n  this._opts = opts = opts || {};\n  this._chunkSize = opts.chunkSize || binding.Z_DEFAULT_CHUNK;\n\n  Transform.call(this, opts);\n\n  if (opts.flush) {\n    if (opts.flush !== binding.Z_NO_FLUSH &&\n        opts.flush !== binding.Z_PARTIAL_FLUSH &&\n        opts.flush !== binding.Z_SYNC_FLUSH &&\n        opts.flush !== binding.Z_FULL_FLUSH &&\n        opts.flush !== binding.Z_FINISH &&\n        opts.flush !== binding.Z_BLOCK) {\n      throw new Error('Invalid flush flag: ' + opts.flush);\n    }\n  }\n  this._flushFlag = opts.flush || binding.Z_NO_FLUSH;\n\n  if (opts.chunkSize) {\n    if (opts.chunkSize < binding.Z_MIN_CHUNK ||\n        opts.chunkSize > binding.Z_MAX_CHUNK) {\n      throw new Error('Invalid chunk size: ' + opts.chunkSize);\n    }\n  }\n\n  if (opts.windowBits) {\n    if (opts.windowBits < binding.Z_MIN_WINDOWBITS ||\n        opts.windowBits > binding.Z_MAX_WINDOWBITS) {\n      throw new Error('Invalid windowBits: ' + opts.windowBits);\n    }\n  }\n\n  if (opts.level) {\n    if (opts.level < binding.Z_MIN_LEVEL ||\n        opts.level > binding.Z_MAX_LEVEL) {\n      throw new Error('Invalid compression level: ' + opts.level);\n    }\n  }\n\n  if (opts.memLevel) {\n    if (opts.memLevel < binding.Z_MIN_MEMLEVEL ||\n        opts.memLevel > binding.Z_MAX_MEMLEVEL) {\n      throw new Error('Invalid memLevel: ' + opts.memLevel);\n    }\n  }\n\n  if (opts.strategy) {\n    if (opts.strategy != binding.Z_FILTERED &&\n        opts.strategy != binding.Z_HUFFMAN_ONLY &&\n        opts.strategy != binding.Z_RLE &&\n        opts.strategy != binding.Z_FIXED &&\n        opts.strategy != binding.Z_DEFAULT_STRATEGY) {\n      throw new Error('Invalid strategy: ' + opts.strategy);\n    }\n  }\n\n  if (opts.dictionary) {\n    if (!Buffer.isBuffer(opts.dictionary)) {\n      throw new Error('Invalid dictionary: it should be a Buffer instance');\n    }\n  }\n\n  this._binding = new binding.Zlib(mode);\n\n  var self = this;\n  this._hadError = false;\n  this._binding.onerror = function(message, errno) {\n    // there is no way to cleanly recover.\n    // continuing only obscures problems.\n    self._binding = null;\n    self._hadError = true;\n\n    var error = new Error(message);\n    error.errno = errno;\n    error.code = binding.codes[errno];\n    self.emit('error', error);\n  };\n\n  var level = binding.Z_DEFAULT_COMPRESSION;\n  if (typeof opts.level === 'number') level = opts.level;\n\n  var strategy = binding.Z_DEFAULT_STRATEGY;\n  if (typeof opts.strategy === 'number') strategy = opts.strategy;\n\n  this._binding.init(opts.windowBits || binding.Z_DEFAULT_WINDOWBITS,\n                     level,\n                     opts.memLevel || binding.Z_DEFAULT_MEMLEVEL,\n                     strategy,\n                     opts.dictionary);\n\n  this._buffer = new Buffer(this._chunkSize);\n  this._offset = 0;\n  this._closed = false;\n  this._level = level;\n  this._strategy = strategy;\n\n  this.once('end', this.close);\n}\n\ninherits(Zlib, Transform);\n\nZlib.prototype.params = function(level, strategy, callback) {\n  if (level < binding.Z_MIN_LEVEL ||\n      level > binding.Z_MAX_LEVEL) {\n    throw new RangeError('Invalid compression level: ' + level);\n  }\n  if (strategy != binding.Z_FILTERED &&\n      strategy != binding.Z_HUFFMAN_ONLY &&\n      strategy != binding.Z_RLE &&\n      strategy != binding.Z_FIXED &&\n      strategy != binding.Z_DEFAULT_STRATEGY) {\n    throw new TypeError('Invalid strategy: ' + strategy);\n  }\n\n  if (this._level !== level || this._strategy !== strategy) {\n    var self = this;\n    this.flush(binding.Z_SYNC_FLUSH, function() {\n      self._binding.params(level, strategy);\n      if (!self._hadError) {\n        self._level = level;\n        self._strategy = strategy;\n        if (callback) callback();\n      }\n    });\n  } else {\n    process.nextTick(callback);\n  }\n};\n\nZlib.prototype.reset = function() {\n  return this._binding.reset();\n};\n\n// This is the _flush function called by the transform class,\n// internally, when the last chunk has been written.\nZlib.prototype._flush = function(callback) {\n  this._transform(new Buffer(0), '', callback);\n};\n\nZlib.prototype.flush = function(kind, callback) {\n  var ws = this._writableState;\n\n  if (typeof kind === 'function' || (kind === void 0 && !callback)) {\n    callback = kind;\n    kind = binding.Z_FULL_FLUSH;\n  }\n\n  if (ws.ended) {\n    if (callback)\n      process.nextTick(callback);\n  } else if (ws.ending) {\n    if (callback)\n      this.once('end', callback);\n  } else if (ws.needDrain) {\n    var self = this;\n    this.once('drain', function() {\n      self.flush(callback);\n    });\n  } else {\n    this._flushFlag = kind;\n    this.write(new Buffer(0), '', callback);\n  }\n};\n\nZlib.prototype.close = function(callback) {\n  if (callback)\n    process.nextTick(callback);\n\n  if (this._closed)\n    return;\n\n  this._closed = true;\n\n  this._binding.close();\n\n  var self = this;\n  process.nextTick(function() {\n    self.emit('close');\n  });\n};\n\nZlib.prototype._transform = function(chunk, encoding, cb) {\n  var flushFlag;\n  var ws = this._writableState;\n  var ending = ws.ending || ws.ended;\n  var last = ending && (!chunk || ws.length === chunk.length);\n\n  if (!chunk === null && !Buffer.isBuffer(chunk))\n    return cb(new Error('invalid input'));\n\n  // If it's the last chunk, or a final flush, we use the Z_FINISH flush flag.\n  // If it's explicitly flushing at some other time, then we use\n  // Z_FULL_FLUSH. Otherwise, use Z_NO_FLUSH for maximum compression\n  // goodness.\n  if (last)\n    flushFlag = binding.Z_FINISH;\n  else {\n    flushFlag = this._flushFlag;\n    // once we've flushed the last of the queue, stop flushing and\n    // go back to the normal behavior.\n    if (chunk.length >= ws.length) {\n      this._flushFlag = this._opts.flush || binding.Z_NO_FLUSH;\n    }\n  }\n\n  this._processChunk(chunk, flushFlag, cb);\n};\n\nZlib.prototype._processChunk = function(chunk, flushFlag, cb) {\n  var availInBefore = chunk && chunk.length;\n  var availOutBefore = this._chunkSize - this._offset;\n  var inOff = 0;\n\n  var self = this;\n\n  var async = typeof cb === 'function';\n\n  if (!async) {\n    var buffers = [];\n    var nread = 0;\n\n    var error;\n    this.on('error', function(er) {\n      error = er;\n    });\n\n    do {\n      var res = this._binding.writeSync(flushFlag,\n                                        chunk, // in\n                                        inOff, // in_off\n                                        availInBefore, // in_len\n                                        this._buffer, // out\n                                        this._offset, //out_off\n                                        availOutBefore); // out_len\n    } while (!this._hadError && callback(res[0], res[1]));\n\n    if (this._hadError) {\n      throw error;\n    }\n\n    var buf = Buffer.concat(buffers, nread);\n    this.close();\n\n    return buf;\n  }\n\n  var req = this._binding.write(flushFlag,\n                                chunk, // in\n                                inOff, // in_off\n                                availInBefore, // in_len\n                                this._buffer, // out\n                                this._offset, //out_off\n                                availOutBefore); // out_len\n\n  req.buffer = chunk;\n  req.callback = callback;\n\n  function callback(availInAfter, availOutAfter) {\n    if (self._hadError)\n      return;\n\n    var have = availOutBefore - availOutAfter;\n    assert(have >= 0, 'have should not go down');\n\n    if (have > 0) {\n      var out = self._buffer.slice(self._offset, self._offset + have);\n      self._offset += have;\n      // serve some output to the consumer.\n      if (async) {\n        self.push(out);\n      } else {\n        buffers.push(out);\n        nread += out.length;\n      }\n    }\n\n    // exhausted the output buffer, or used all the input create a new one.\n    if (availOutAfter === 0 || self._offset >= self._chunkSize) {\n      availOutBefore = self._chunkSize;\n      self._offset = 0;\n      self._buffer = new Buffer(self._chunkSize);\n    }\n\n    if (availOutAfter === 0) {\n      // Not actually done.  Need to reprocess.\n      // Also, update the availInBefore to the availInAfter value,\n      // so that if we have to hit it a third (fourth, etc.) time,\n      // it'll have the correct byte counts.\n      inOff += (availInBefore - availInAfter);\n      availInBefore = availInAfter;\n\n      if (!async)\n        return true;\n\n      var newReq = self._binding.write(flushFlag,\n                                       chunk,\n                                       inOff,\n                                       availInBefore,\n                                       self._buffer,\n                                       self._offset,\n                                       self._chunkSize);\n      newReq.callback = callback; // this same function\n      newReq.buffer = chunk;\n      return;\n    }\n\n    if (!async)\n      return false;\n\n    // finished with the chunk.\n    cb();\n  }\n};\n\ninherits(Deflate, Zlib);\ninherits(Inflate, Zlib);\ninherits(Gzip, Zlib);\ninherits(Gunzip, Zlib);\ninherits(DeflateRaw, Zlib);\ninherits(InflateRaw, Zlib);\ninherits(Unzip, Zlib);\nexport default {\n  codes: codes,\n  createDeflate: createDeflate,\n  createInflate: createInflate,\n  createDeflateRaw: createDeflateRaw,\n  createInflateRaw: createInflateRaw,\n  createGzip: createGzip,\n  createGunzip: createGunzip,\n  createUnzip: createUnzip,\n  deflate: deflate,\n  deflateSync: deflateSync,\n  gzip: gzip,\n  gzipSync: gzipSync,\n  deflateRaw: deflateRaw,\n  deflateRawSync: deflateRawSync,\n  unzip: unzip,\n  unzipSync: unzipSync,\n  inflate: inflate,\n  inflateSync: inflateSync,\n  gunzip: gunzip,\n  gunzipSync: gunzipSync,\n  inflateRaw: inflateRaw,\n  inflateRawSync: inflateRawSync,\n  Deflate: Deflate,\n  Inflate: Inflate,\n  Gzip: Gzip,\n  Gunzip: Gunzip,\n  DeflateRaw: DeflateRaw,\n  InflateRaw: InflateRaw,\n  Unzip: Unzip,\n  Zlib: Zlib\n};\n"};const EMPTY_PATH=POLYFILLS['empty.js'];function getModules(){const libs=new Map();libs.set('process',POLYFILLS['process-es6.js']);libs.set('global',POLYFILLS['global.js']);libs.set('buffer',POLYFILLS['buffer-es6.js']);libs.set('util',POLYFILLS['util.js']);libs.set('sys',libs.get('util'));libs.set('events',POLYFILLS['events.js']);libs.set('stream',POLYFILLS['stream.js']);libs.set('path',POLYFILLS['path.js']);libs.set('querystring',POLYFILLS['qs.js']);libs.set('punycode',POLYFILLS['punycode.js']);libs.set('url',POLYFILLS['url.js']);libs.set('string_decoder',POLYFILLS['string-decoder.js']);libs.set('http',POLYFILLS['http.js']);libs.set('https',POLYFILLS['http.js']);libs.set('os',POLYFILLS['os.js']);libs.set('assert',POLYFILLS['assert.js']);libs.set('constants',POLYFILLS['constants.js']);libs.set('_stream_duplex',POLYFILLS['__readable-stream/duplex.js']);libs.set('_stream_passthrough',POLYFILLS['__readable-stream/passthrough.js']);libs.set('_stream_readable',POLYFILLS['__readable-stream/readable.js']);libs.set('_stream_writable',POLYFILLS['__readable-stream/writable.js']);libs.set('_stream_transform',POLYFILLS['__readable-stream/transform.js']);libs.set('_inherits',POLYFILLS['inherits.js']);libs.set('_buffer_list',POLYFILLS['__readable-stream/buffer-list.js']);libs.set('timers',POLYFILLS['timers.js']);libs.set('console',POLYFILLS['console.js']);libs.set('vm',POLYFILLS['vm.js']);libs.set('zlib',POLYFILLS['zlib.js']);libs.set('tty',POLYFILLS['tty.js']);libs.set('domain',POLYFILLS['domain.js']);// TODO: Decide if we want to implement these or not
// currently causing trouble in tests
libs.set('fs',EMPTY_PATH);libs.set('crypto',EMPTY_PATH);// libs.set('fs', POLYFILLS['browserify-fs.js']);
// libs.set('crypto', POLYFILLS['crypto-browserify.js']);
// TODO: No good polyfill exists yet
libs.set('http2',EMPTY_PATH);// not shimmed
libs.set('dns',EMPTY_PATH);libs.set('dgram',EMPTY_PATH);libs.set('child_process',EMPTY_PATH);libs.set('cluster',EMPTY_PATH);libs.set('module',EMPTY_PATH);libs.set('net',EMPTY_PATH);libs.set('readline',EMPTY_PATH);libs.set('repl',EMPTY_PATH);libs.set('tls',EMPTY_PATH);libs.set('perf_hooks',EMPTY_PATH);return libs;}// Node import paths use POSIX separators
const{dirname,relative,join}=path$2.posix;const PREFIX=`\0polyfill-node.`;const PREFIX_LENGTH=PREFIX.length;function index(opts={}){const mods=getModules();const injectPlugin=inject({include:opts.include===undefined?['node_modules/**/*.js']:opts.include,exclude:opts.exclude,sourceMap:opts.sourceMap,modules:{process:PREFIX+"process",Buffer:[PREFIX+"buffer","Buffer"],global:PREFIX+'global',__filename:FILENAME_PATH,__dirname:DIRNAME_PATH}});const basedir=opts.baseDir||"/";const dirs=new Map();return {name:"polyfill-node",resolveId(importee,importer){if(importee===DIRNAME_PATH){const id=getRandomId();dirs.set(id,dirname("/"+relative(basedir,importer)));return {id,moduleSideEffects:false};}if(importee===FILENAME_PATH){const id=getRandomId();dirs.set(id,dirname("/"+relative(basedir,importer)));return {id,moduleSideEffects:false};}if(importee&&importee.slice(-1)==="/"){importee=importee.slice(0,-1);}if(importer&&importer.startsWith(PREFIX)&&importee.startsWith('.')){importee=PREFIX+join(importer.substr(PREFIX_LENGTH).replace('.js',''),'..',importee)+'.js';}if(importee.startsWith(PREFIX)){importee=importee.substr(PREFIX_LENGTH);}if(mods.has(importee)||POLYFILLS[importee.replace('.js','')+'.js']){return {id:PREFIX+importee.replace('.js','')+'.js',moduleSideEffects:false};}return null;},load(id){if(dirs.has(id)){return `export default '${dirs.get(id)}'`;}if(id.startsWith(PREFIX)){const importee=id.substr(PREFIX_LENGTH).replace('.js','');return mods.get(importee)||POLYFILLS[importee+'.js'];}},transform(code,id){if(id===PREFIX+'global.js')return;return injectPlugin.transform.call(this,code,id.replace(PREFIX,path$2.resolve('node_modules','polyfill-node')));}};}function getRandomId(){return crypto.randomBytes(15).toString("hex");}const DIRNAME_PATH="\0node-polyfills:dirname";const FILENAME_PATH="\0node-polyfills:filename";

function createCommonjsModule(fn, module) {
  return module = {
    exports: {}
  }, fn(module, module.exports), module.exports;
}

var utils = createCommonjsModule(function (module, exports) {
  exports.isInteger = num => {
    if (typeof num === 'number') {
      return Number.isInteger(num);
    }

    if (typeof num === 'string' && num.trim() !== '') {
      return Number.isInteger(Number(num));
    }

    return false;
  };
  /**
   * Find a node of the given type
   */


  exports.find = (node, type) => node.nodes.find(node => node.type === type);
  /**
   * Find a node of the given type
   */


  exports.exceedsLimit = (min, max, step = 1, limit) => {
    if (limit === false) return false;
    if (!exports.isInteger(min) || !exports.isInteger(max)) return false;
    return (Number(max) - Number(min)) / Number(step) >= limit;
  };
  /**
   * Escape the given node with '\\' before node.value
   */


  exports.escapeNode = (block, n = 0, type) => {
    let node = block.nodes[n];
    if (!node) return;

    if (type && node.type === type || node.type === 'open' || node.type === 'close') {
      if (node.escaped !== true) {
        node.value = '\\' + node.value;
        node.escaped = true;
      }
    }
  };
  /**
   * Returns true if the given brace node should be enclosed in literal braces
   */


  exports.encloseBrace = node => {
    if (node.type !== 'brace') return false;

    if (node.commas >> 0 + node.ranges >> 0 === 0) {
      node.invalid = true;
      return true;
    }

    return false;
  };
  /**
   * Returns true if a brace node is invalid.
   */


  exports.isInvalidBrace = block => {
    if (block.type !== 'brace') return false;
    if (block.invalid === true || block.dollar) return true;

    if (block.commas >> 0 + block.ranges >> 0 === 0) {
      block.invalid = true;
      return true;
    }

    if (block.open !== true || block.close !== true) {
      block.invalid = true;
      return true;
    }

    return false;
  };
  /**
   * Returns true if a node is an open or close node
   */


  exports.isOpenOrClose = node => {
    if (node.type === 'open' || node.type === 'close') {
      return true;
    }

    return node.open === true || node.close === true;
  };
  /**
   * Reduce an array of text nodes.
   */


  exports.reduce = nodes => nodes.reduce((acc, node) => {
    if (node.type === 'text') acc.push(node.value);
    if (node.type === 'range') node.type = 'text';
    return acc;
  }, []);
  /**
   * Flatten an array
   */


  exports.flatten = (...args) => {
    const result = [];

    const flat = arr => {
      for (let i = 0; i < arr.length; i++) {
        let ele = arr[i];
        Array.isArray(ele) ? flat(ele) : ele !== void 0 && result.push(ele);
      }

      return result;
    };

    flat(args);
    return result;
  };
});
utils.isInteger;
utils.find;
utils.exceedsLimit;
utils.escapeNode;
utils.encloseBrace;
utils.isInvalidBrace;
utils.isOpenOrClose;
utils.reduce;
utils.flatten;

var stringify = (ast, options = {}) => {
  let stringify = (node, parent = {}) => {
    let invalidBlock = options.escapeInvalid && utils.isInvalidBrace(parent);
    let invalidNode = node.invalid === true && options.escapeInvalid === true;
    let output = '';

    if (node.value) {
      if ((invalidBlock || invalidNode) && utils.isOpenOrClose(node)) {
        return '\\' + node.value;
      }

      return node.value;
    }

    if (node.value) {
      return node.value;
    }

    if (node.nodes) {
      for (let child of node.nodes) {
        output += stringify(child);
      }
    }

    return output;
  };

  return stringify(ast);
};
/*!
 * is-number <https://github.com/jonschlinkert/is-number>
 *
 * Copyright (c) 2014-present, Jon Schlinkert.
 * Released under the MIT License.
 */


var isNumber = function (num) {
  if (typeof num === 'number') {
    return num - num === 0;
  }

  if (typeof num === 'string' && num.trim() !== '') {
    return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
  }

  return false;
};

const toRegexRange = (min, max, options) => {
  if (isNumber(min) === false) {
    throw new TypeError('toRegexRange: expected the first argument to be a number');
  }

  if (max === void 0 || min === max) {
    return String(min);
  }

  if (isNumber(max) === false) {
    throw new TypeError('toRegexRange: expected the second argument to be a number.');
  }

  let opts = Object.assign({
    relaxZeros: true
  }, options);

  if (typeof opts.strictZeros === 'boolean') {
    opts.relaxZeros = opts.strictZeros === false;
  }

  let relax = String(opts.relaxZeros);
  let shorthand = String(opts.shorthand);
  let capture = String(opts.capture);
  let wrap = String(opts.wrap);
  let cacheKey = min + ':' + max + '=' + relax + shorthand + capture + wrap;

  if (toRegexRange.cache.hasOwnProperty(cacheKey)) {
    return toRegexRange.cache[cacheKey].result;
  }

  let a = Math.min(min, max);
  let b = Math.max(min, max);

  if (Math.abs(a - b) === 1) {
    let result = min + '|' + max;

    if (opts.capture) {
      return `(${result})`;
    }

    if (opts.wrap === false) {
      return result;
    }

    return `(?:${result})`;
  }

  let isPadded = hasPadding(min) || hasPadding(max);
  let state = {
    min,
    max,
    a,
    b
  };
  let positives = [];
  let negatives = [];

  if (isPadded) {
    state.isPadded = isPadded;
    state.maxLen = String(state.max).length;
  }

  if (a < 0) {
    let newMin = b < 0 ? Math.abs(b) : 1;
    negatives = splitToPatterns(newMin, Math.abs(a), state, opts);
    a = state.a = 0;
  }

  if (b >= 0) {
    positives = splitToPatterns(a, b, state, opts);
  }

  state.negatives = negatives;
  state.positives = positives;
  state.result = collatePatterns(negatives, positives);

  if (opts.capture === true) {
    state.result = `(${state.result})`;
  } else if (opts.wrap !== false && positives.length + negatives.length > 1) {
    state.result = `(?:${state.result})`;
  }

  toRegexRange.cache[cacheKey] = state;
  return state.result;
};

function collatePatterns(neg, pos, options) {
  let onlyNegative = filterPatterns(neg, pos, '-', false) || [];
  let onlyPositive = filterPatterns(pos, neg, '', false) || [];
  let intersected = filterPatterns(neg, pos, '-?', true) || [];
  let subpatterns = onlyNegative.concat(intersected).concat(onlyPositive);
  return subpatterns.join('|');
}

function splitToRanges(min, max) {
  let nines = 1;
  let zeros = 1;
  let stop = countNines(min, nines);
  let stops = new Set([max]);

  while (min <= stop && stop <= max) {
    stops.add(stop);
    nines += 1;
    stop = countNines(min, nines);
  }

  stop = countZeros(max + 1, zeros) - 1;

  while (min < stop && stop <= max) {
    stops.add(stop);
    zeros += 1;
    stop = countZeros(max + 1, zeros) - 1;
  }

  stops = [...stops];
  stops.sort(compare);
  return stops;
}
/**
 * Convert a range to a regex pattern
 * @param {Number} `start`
 * @param {Number} `stop`
 * @return {String}
 */


function rangeToPattern(start, stop, options) {
  if (start === stop) {
    return {
      pattern: start,
      count: [],
      digits: 0
    };
  }

  let zipped = zip(start, stop);
  let digits = zipped.length;
  let pattern = '';
  let count = 0;

  for (let i = 0; i < digits; i++) {
    let [startDigit, stopDigit] = zipped[i];

    if (startDigit === stopDigit) {
      pattern += startDigit;
    } else if (startDigit !== '0' || stopDigit !== '9') {
      pattern += toCharacterClass(startDigit, stopDigit);
    } else {
      count++;
    }
  }

  if (count) {
    pattern += options.shorthand === true ? '\\d' : '[0-9]';
  }

  return {
    pattern,
    count: [count],
    digits
  };
}

function splitToPatterns(min, max, tok, options) {
  let ranges = splitToRanges(min, max);
  let tokens = [];
  let start = min;
  let prev;

  for (let i = 0; i < ranges.length; i++) {
    let max = ranges[i];
    let obj = rangeToPattern(String(start), String(max), options);
    let zeros = '';

    if (!tok.isPadded && prev && prev.pattern === obj.pattern) {
      if (prev.count.length > 1) {
        prev.count.pop();
      }

      prev.count.push(obj.count[0]);
      prev.string = prev.pattern + toQuantifier(prev.count);
      start = max + 1;
      continue;
    }

    if (tok.isPadded) {
      zeros = padZeros(max, tok, options);
    }

    obj.string = zeros + obj.pattern + toQuantifier(obj.count);
    tokens.push(obj);
    start = max + 1;
    prev = obj;
  }

  return tokens;
}

function filterPatterns(arr, comparison, prefix, intersection, options) {
  let result = [];

  for (let ele of arr) {
    let {
      string
    } = ele; // only push if _both_ are negative...

    if (!intersection && !contains(comparison, 'string', string)) {
      result.push(prefix + string);
    } // or _both_ are positive


    if (intersection && contains(comparison, 'string', string)) {
      result.push(prefix + string);
    }
  }

  return result;
}
/**
 * Zip strings
 */


function zip(a, b) {
  let arr = [];

  for (let i = 0; i < a.length; i++) arr.push([a[i], b[i]]);

  return arr;
}

function compare(a, b) {
  return a > b ? 1 : b > a ? -1 : 0;
}

function contains(arr, key, val) {
  return arr.some(ele => ele[key] === val);
}

function countNines(min, len) {
  return Number(String(min).slice(0, -len) + '9'.repeat(len));
}

function countZeros(integer, zeros) {
  return integer - integer % Math.pow(10, zeros);
}

function toQuantifier(digits) {
  let [start = 0, stop = ''] = digits;

  if (stop || start > 1) {
    return `{${start + (stop ? ',' + stop : '')}}`;
  }

  return '';
}

function toCharacterClass(a, b, options) {
  return `[${a}${b - a === 1 ? '' : '-'}${b}]`;
}

function hasPadding(str) {
  return /^-?(0+)\d/.test(str);
}

function padZeros(value, tok, options) {
  if (!tok.isPadded) {
    return value;
  }

  let diff = Math.abs(tok.maxLen - String(value).length);
  let relax = options.relaxZeros !== false;

  switch (diff) {
    case 0:
      return '';

    case 1:
      return relax ? '0?' : '0';

    case 2:
      return relax ? '0{0,2}' : '00';

    default:
      {
        return relax ? `0{0,${diff}}` : `0{${diff}}`;
      }
  }
}
/**
 * Cache
 */


toRegexRange.cache = {};

toRegexRange.clearCache = () => toRegexRange.cache = {};
/**
 * Expose `toRegexRange`
 */


var toRegexRange_1 = toRegexRange;

const isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);

const transform = toNumber => {
  return value => toNumber === true ? Number(value) : String(value);
};

const isValidValue = value => {
  return typeof value === 'number' || typeof value === 'string' && value !== '';
};

const isNumber$1 = num => Number.isInteger(+num);

const zeros = input => {
  let value = `${input}`;
  let index = -1;
  if (value[0] === '-') value = value.slice(1);
  if (value === '0') return false;

  while (value[++index] === '0');

  return index > 0;
};

const stringify$1 = (start, end, options) => {
  if (typeof start === 'string' || typeof end === 'string') {
    return true;
  }

  return options.stringify === true;
};

const pad = (input, maxLength, toNumber) => {
  if (maxLength > 0) {
    let dash = input[0] === '-' ? '-' : '';
    if (dash) input = input.slice(1);
    input = dash + input.padStart(dash ? maxLength - 1 : maxLength, '0');
  }

  if (toNumber === false) {
    return String(input);
  }

  return input;
};

const toMaxLen = (input, maxLength) => {
  let negative = input[0] === '-' ? '-' : '';

  if (negative) {
    input = input.slice(1);
    maxLength--;
  }

  while (input.length < maxLength) input = '0' + input;

  return negative ? '-' + input : input;
};

const toSequence = (parts, options) => {
  parts.negatives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
  parts.positives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
  let prefix = options.capture ? '' : '?:';
  let positives = '';
  let negatives = '';
  let result;

  if (parts.positives.length) {
    positives = parts.positives.join('|');
  }

  if (parts.negatives.length) {
    negatives = `-(${prefix}${parts.negatives.join('|')})`;
  }

  if (positives && negatives) {
    result = `${positives}|${negatives}`;
  } else {
    result = positives || negatives;
  }

  if (options.wrap) {
    return `(${prefix}${result})`;
  }

  return result;
};

const toRange = (a, b, isNumbers, options) => {
  if (isNumbers) {
    return toRegexRange_1(a, b, Object.assign({
      wrap: false
    }, options));
  }

  let start = String.fromCharCode(a);
  if (a === b) return start;
  let stop = String.fromCharCode(b);
  return `[${start}-${stop}]`;
};

const toRegex = (start, end, options) => {
  if (Array.isArray(start)) {
    let wrap = options.wrap === true;
    let prefix = options.capture ? '' : '?:';
    return wrap ? `(${prefix}${start.join('|')})` : start.join('|');
  }

  return toRegexRange_1(start, end, options);
};

const rangeError = (...args) => {
  return new RangeError('Invalid range arguments: ' + util__default["default"].inspect(...args));
};

const invalidRange = (start, end, options) => {
  if (options.strictRanges === true) throw rangeError([start, end]);
  return [];
};

const invalidStep = (step, options) => {
  if (options.strictRanges === true) {
    throw new TypeError(`Expected step "${step}" to be a number`);
  }

  return [];
};

const fillNumbers = (start, end, step = 1, options = {}) => {
  let a = Number(start);
  let b = Number(end);

  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    if (options.strictRanges === true) throw rangeError([start, end]);
    return [];
  } // fix negative zero


  if (a === 0) a = 0;
  if (b === 0) b = 0;
  let descending = a > b;
  let startString = String(start);
  let endString = String(end);
  let stepString = String(step);
  step = Math.max(Math.abs(step), 1);
  let padded = zeros(startString) || zeros(endString) || zeros(stepString);
  let maxLen = padded ? Math.max(startString.length, endString.length, stepString.length) : 0;
  let toNumber = padded === false && stringify$1(start, end, options) === false;
  let format = options.transform || transform(toNumber);

  if (options.toRegex && step === 1) {
    return toRange(toMaxLen(start, maxLen), toMaxLen(end, maxLen), true, options);
  }

  let parts = {
    negatives: [],
    positives: []
  };

  let push = num => parts[num < 0 ? 'negatives' : 'positives'].push(Math.abs(num));

  let range = [];
  let index = 0;

  while (descending ? a >= b : a <= b) {
    if (options.toRegex === true && step > 1) {
      push(a);
    } else {
      range.push(pad(format(a, index), maxLen, toNumber));
    }

    a = descending ? a - step : a + step;
    index++;
  }

  if (options.toRegex === true) {
    return step > 1 ? toSequence(parts, options) : toRegex(range, null, Object.assign({
      wrap: false
    }, options));
  }

  return range;
};

const fillLetters = (start, end, step = 1, options = {}) => {
  if (!isNumber$1(start) && start.length > 1 || !isNumber$1(end) && end.length > 1) {
    return invalidRange(start, end, options);
  }

  let format = options.transform || (val => String.fromCharCode(val));

  let a = `${start}`.charCodeAt(0);
  let b = `${end}`.charCodeAt(0);
  let descending = a > b;
  let min = Math.min(a, b);
  let max = Math.max(a, b);

  if (options.toRegex && step === 1) {
    return toRange(min, max, false, options);
  }

  let range = [];
  let index = 0;

  while (descending ? a >= b : a <= b) {
    range.push(format(a, index));
    a = descending ? a - step : a + step;
    index++;
  }

  if (options.toRegex === true) {
    return toRegex(range, null, {
      wrap: false,
      options
    });
  }

  return range;
};

const fill = (start, end, step, options = {}) => {
  if (end == null && isValidValue(start)) {
    return [start];
  }

  if (!isValidValue(start) || !isValidValue(end)) {
    return invalidRange(start, end, options);
  }

  if (typeof step === 'function') {
    return fill(start, end, 1, {
      transform: step
    });
  }

  if (isObject(step)) {
    return fill(start, end, 0, step);
  }

  let opts = Object.assign({}, options);
  if (opts.capture === true) opts.wrap = true;
  step = step || opts.step || 1;

  if (!isNumber$1(step)) {
    if (step != null && !isObject(step)) return invalidStep(step, opts);
    return fill(start, end, 1, step);
  }

  if (isNumber$1(start) && isNumber$1(end)) {
    return fillNumbers(start, end, step, opts);
  }

  return fillLetters(start, end, Math.max(Math.abs(step), 1), opts);
};

var fillRange = fill;

const compile = (ast, options = {}) => {
  let walk = (node, parent = {}) => {
    let invalidBlock = utils.isInvalidBrace(parent);
    let invalidNode = node.invalid === true && options.escapeInvalid === true;
    let invalid = invalidBlock === true || invalidNode === true;
    let prefix = options.escapeInvalid === true ? '\\' : '';
    let output = '';

    if (node.isOpen === true) {
      return prefix + node.value;
    }

    if (node.isClose === true) {
      return prefix + node.value;
    }

    if (node.type === 'open') {
      return invalid ? prefix + node.value : '(';
    }

    if (node.type === 'close') {
      return invalid ? prefix + node.value : ')';
    }

    if (node.type === 'comma') {
      return node.prev.type === 'comma' ? '' : invalid ? node.value : '|';
    }

    if (node.value) {
      return node.value;
    }

    if (node.nodes && node.ranges > 0) {
      let args = utils.reduce(node.nodes);
      let range = fillRange(...args, Object.assign({}, options, {
        wrap: false,
        toRegex: true
      }));

      if (range.length !== 0) {
        return args.length > 1 && range.length > 1 ? `(${range})` : range;
      }
    }

    if (node.nodes) {
      for (let child of node.nodes) {
        output += walk(child, node);
      }
    }

    return output;
  };

  return walk(ast);
};

var compile_1 = compile;

const append = (queue = '', stash = '', enclose = false) => {
  let result = [];
  queue = [].concat(queue);
  stash = [].concat(stash);
  if (!stash.length) return queue;

  if (!queue.length) {
    return enclose ? utils.flatten(stash).map(ele => `{${ele}}`) : stash;
  }

  for (let item of queue) {
    if (Array.isArray(item)) {
      for (let value of item) {
        result.push(append(value, stash, enclose));
      }
    } else {
      for (let ele of stash) {
        if (enclose === true && typeof ele === 'string') ele = `{${ele}}`;
        result.push(Array.isArray(ele) ? append(item, ele, enclose) : item + ele);
      }
    }
  }

  return utils.flatten(result);
};

const expand = (ast, options = {}) => {
  let rangeLimit = options.rangeLimit === void 0 ? 1000 : options.rangeLimit;

  let walk = (node, parent = {}) => {
    node.queue = [];
    let p = parent;
    let q = parent.queue;

    while (p.type !== 'brace' && p.type !== 'root' && p.parent) {
      p = p.parent;
      q = p.queue;
    }

    if (node.invalid || node.dollar) {
      q.push(append(q.pop(), stringify(node, options)));
      return;
    }

    if (node.type === 'brace' && node.invalid !== true && node.nodes.length === 2) {
      q.push(append(q.pop(), ['{}']));
      return;
    }

    if (node.nodes && node.ranges > 0) {
      let args = utils.reduce(node.nodes);

      if (utils.exceedsLimit(...args, options.step, rangeLimit)) {
        throw new RangeError('expanded array length exceeds range limit. Use options.rangeLimit to increase or disable the limit.');
      }

      let range = fillRange(...args, options);

      if (range.length === 0) {
        range = stringify(node, options);
      }

      q.push(append(q.pop(), range));
      node.nodes = [];
      return;
    }

    let enclose = utils.encloseBrace(node);
    let queue = node.queue;
    let block = node;

    while (block.type !== 'brace' && block.type !== 'root' && block.parent) {
      block = block.parent;
      queue = block.queue;
    }

    for (let i = 0; i < node.nodes.length; i++) {
      let child = node.nodes[i];

      if (child.type === 'comma' && node.type === 'brace') {
        if (i === 1) queue.push('');
        queue.push('');
        continue;
      }

      if (child.type === 'close') {
        q.push(append(q.pop(), queue, enclose));
        continue;
      }

      if (child.value && child.type !== 'open') {
        queue.push(append(queue.pop(), child.value));
        continue;
      }

      if (child.nodes) {
        walk(child, node);
      }
    }

    return queue;
  };

  return utils.flatten(walk(ast));
};

var expand_1 = expand;
var constants = {
  MAX_LENGTH: 1024 * 64,
  // Digits
  CHAR_0: '0',
  CHAR_9: '9',
  // Alphabet chars.
  CHAR_UPPERCASE_A: 'A',
  CHAR_LOWERCASE_A: 'a',
  CHAR_UPPERCASE_Z: 'Z',
  CHAR_LOWERCASE_Z: 'z',
  CHAR_LEFT_PARENTHESES: '(',
  CHAR_RIGHT_PARENTHESES: ')',
  CHAR_ASTERISK: '*',
  // Non-alphabetic chars.
  CHAR_AMPERSAND: '&',
  CHAR_AT: '@',
  CHAR_BACKSLASH: '\\',
  CHAR_BACKTICK: '`',
  CHAR_CARRIAGE_RETURN: '\r',
  CHAR_CIRCUMFLEX_ACCENT: '^',
  CHAR_COLON: ':',
  CHAR_COMMA: ',',
  CHAR_DOLLAR: '$',
  CHAR_DOT: '.',
  CHAR_DOUBLE_QUOTE: '"',
  CHAR_EQUAL: '=',
  CHAR_EXCLAMATION_MARK: '!',
  CHAR_FORM_FEED: '\f',
  CHAR_FORWARD_SLASH: '/',
  CHAR_HASH: '#',
  CHAR_HYPHEN_MINUS: '-',
  CHAR_LEFT_ANGLE_BRACKET: '<',
  CHAR_LEFT_CURLY_BRACE: '{',
  CHAR_LEFT_SQUARE_BRACKET: '[',
  CHAR_LINE_FEED: '\n',
  CHAR_NO_BREAK_SPACE: '\u00A0',
  CHAR_PERCENT: '%',
  CHAR_PLUS: '+',
  CHAR_QUESTION_MARK: '?',
  CHAR_RIGHT_ANGLE_BRACKET: '>',
  CHAR_RIGHT_CURLY_BRACE: '}',
  CHAR_RIGHT_SQUARE_BRACKET: ']',
  CHAR_SEMICOLON: ';',
  CHAR_SINGLE_QUOTE: '\'',
  CHAR_SPACE: ' ',
  CHAR_TAB: '\t',
  CHAR_UNDERSCORE: '_',
  CHAR_VERTICAL_LINE: '|',
  CHAR_ZERO_WIDTH_NOBREAK_SPACE: '\uFEFF'
  /* \uFEFF */

};
/**
 * Constants
 */

const {
  MAX_LENGTH,
  CHAR_BACKSLASH,

  /* \ */
  CHAR_BACKTICK,

  /* ` */
  CHAR_COMMA,

  /* , */
  CHAR_DOT,

  /* . */
  CHAR_LEFT_PARENTHESES,

  /* ( */
  CHAR_RIGHT_PARENTHESES,

  /* ) */
  CHAR_LEFT_CURLY_BRACE,

  /* { */
  CHAR_RIGHT_CURLY_BRACE,

  /* } */
  CHAR_LEFT_SQUARE_BRACKET,

  /* [ */
  CHAR_RIGHT_SQUARE_BRACKET,

  /* ] */
  CHAR_DOUBLE_QUOTE,

  /* " */
  CHAR_SINGLE_QUOTE,

  /* ' */
  CHAR_NO_BREAK_SPACE,
  CHAR_ZERO_WIDTH_NOBREAK_SPACE
} = constants;
/**
 * parse
 */

const parse = (input, options = {}) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected a string');
  }

  let opts = options || {};
  let max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;

  if (input.length > max) {
    throw new SyntaxError(`Input length (${input.length}), exceeds max characters (${max})`);
  }

  let ast = {
    type: 'root',
    input,
    nodes: []
  };
  let stack = [ast];
  let block = ast;
  let prev = ast;
  let brackets = 0;
  let length = input.length;
  let index = 0;
  let depth = 0;
  let value;
  /**
   * Helpers
   */

  const advance = () => input[index++];

  const push = node => {
    if (node.type === 'text' && prev.type === 'dot') {
      prev.type = 'text';
    }

    if (prev && prev.type === 'text' && node.type === 'text') {
      prev.value += node.value;
      return;
    }

    block.nodes.push(node);
    node.parent = block;
    node.prev = prev;
    prev = node;
    return node;
  };

  push({
    type: 'bos'
  });

  while (index < length) {
    block = stack[stack.length - 1];
    value = advance();
    /**
     * Invalid chars
     */

    if (value === CHAR_ZERO_WIDTH_NOBREAK_SPACE || value === CHAR_NO_BREAK_SPACE) {
      continue;
    }
    /**
     * Escaped chars
     */


    if (value === CHAR_BACKSLASH) {
      push({
        type: 'text',
        value: (options.keepEscaping ? value : '') + advance()
      });
      continue;
    }
    /**
     * Right square bracket (literal): ']'
     */


    if (value === CHAR_RIGHT_SQUARE_BRACKET) {
      push({
        type: 'text',
        value: '\\' + value
      });
      continue;
    }
    /**
     * Left square bracket: '['
     */


    if (value === CHAR_LEFT_SQUARE_BRACKET) {
      brackets++;
      let next;

      while (index < length && (next = advance())) {
        value += next;

        if (next === CHAR_LEFT_SQUARE_BRACKET) {
          brackets++;
          continue;
        }

        if (next === CHAR_BACKSLASH) {
          value += advance();
          continue;
        }

        if (next === CHAR_RIGHT_SQUARE_BRACKET) {
          brackets--;

          if (brackets === 0) {
            break;
          }
        }
      }

      push({
        type: 'text',
        value
      });
      continue;
    }
    /**
     * Parentheses
     */


    if (value === CHAR_LEFT_PARENTHESES) {
      block = push({
        type: 'paren',
        nodes: []
      });
      stack.push(block);
      push({
        type: 'text',
        value
      });
      continue;
    }

    if (value === CHAR_RIGHT_PARENTHESES) {
      if (block.type !== 'paren') {
        push({
          type: 'text',
          value
        });
        continue;
      }

      block = stack.pop();
      push({
        type: 'text',
        value
      });
      block = stack[stack.length - 1];
      continue;
    }
    /**
     * Quotes: '|"|`
     */


    if (value === CHAR_DOUBLE_QUOTE || value === CHAR_SINGLE_QUOTE || value === CHAR_BACKTICK) {
      let open = value;
      let next;

      if (options.keepQuotes !== true) {
        value = '';
      }

      while (index < length && (next = advance())) {
        if (next === CHAR_BACKSLASH) {
          value += next + advance();
          continue;
        }

        if (next === open) {
          if (options.keepQuotes === true) value += next;
          break;
        }

        value += next;
      }

      push({
        type: 'text',
        value
      });
      continue;
    }
    /**
     * Left curly brace: '{'
     */


    if (value === CHAR_LEFT_CURLY_BRACE) {
      depth++;
      let dollar = prev.value && prev.value.slice(-1) === '$' || block.dollar === true;
      let brace = {
        type: 'brace',
        open: true,
        close: false,
        dollar,
        depth,
        commas: 0,
        ranges: 0,
        nodes: []
      };
      block = push(brace);
      stack.push(block);
      push({
        type: 'open',
        value
      });
      continue;
    }
    /**
     * Right curly brace: '}'
     */


    if (value === CHAR_RIGHT_CURLY_BRACE) {
      if (block.type !== 'brace') {
        push({
          type: 'text',
          value
        });
        continue;
      }

      let type = 'close';
      block = stack.pop();
      block.close = true;
      push({
        type,
        value
      });
      depth--;
      block = stack[stack.length - 1];
      continue;
    }
    /**
     * Comma: ','
     */


    if (value === CHAR_COMMA && depth > 0) {
      if (block.ranges > 0) {
        block.ranges = 0;
        let open = block.nodes.shift();
        block.nodes = [open, {
          type: 'text',
          value: stringify(block)
        }];
      }

      push({
        type: 'comma',
        value
      });
      block.commas++;
      continue;
    }
    /**
     * Dot: '.'
     */


    if (value === CHAR_DOT && depth > 0 && block.commas === 0) {
      let siblings = block.nodes;

      if (depth === 0 || siblings.length === 0) {
        push({
          type: 'text',
          value
        });
        continue;
      }

      if (prev.type === 'dot') {
        block.range = [];
        prev.value += value;
        prev.type = 'range';

        if (block.nodes.length !== 3 && block.nodes.length !== 5) {
          block.invalid = true;
          block.ranges = 0;
          prev.type = 'text';
          continue;
        }

        block.ranges++;
        block.args = [];
        continue;
      }

      if (prev.type === 'range') {
        siblings.pop();
        let before = siblings[siblings.length - 1];
        before.value += prev.value + value;
        prev = before;
        block.ranges--;
        continue;
      }

      push({
        type: 'dot',
        value
      });
      continue;
    }
    /**
     * Text
     */


    push({
      type: 'text',
      value
    });
  } // Mark imbalanced braces and brackets as invalid


  do {
    block = stack.pop();

    if (block.type !== 'root') {
      block.nodes.forEach(node => {
        if (!node.nodes) {
          if (node.type === 'open') node.isOpen = true;
          if (node.type === 'close') node.isClose = true;
          if (!node.nodes) node.type = 'text';
          node.invalid = true;
        }
      }); // get the location of the block on parent.nodes (block's siblings)

      let parent = stack[stack.length - 1];
      let index = parent.nodes.indexOf(block); // replace the (invalid) block with it's nodes

      parent.nodes.splice(index, 1, ...block.nodes);
    }
  } while (stack.length > 0);

  push({
    type: 'eos'
  });
  return ast;
};

var parse_1 = parse;
/**
 * Expand the given pattern or create a regex-compatible string.
 *
 * ```js
 * const braces = require('braces');
 * console.log(braces('{a,b,c}', { compile: true })); //=> ['(a|b|c)']
 * console.log(braces('{a,b,c}')); //=> ['a', 'b', 'c']
 * ```
 * @param {String} `str`
 * @param {Object} `options`
 * @return {String}
 * @api public
 */

const braces = (input, options = {}) => {
  let output = [];

  if (Array.isArray(input)) {
    for (let pattern of input) {
      let result = braces.create(pattern, options);

      if (Array.isArray(result)) {
        output.push(...result);
      } else {
        output.push(result);
      }
    }
  } else {
    output = [].concat(braces.create(input, options));
  }

  if (options && options.expand === true && options.nodupes === true) {
    output = [...new Set(output)];
  }

  return output;
};
/**
 * Parse the given `str` with the given `options`.
 *
 * ```js
 * // braces.parse(pattern, [, options]);
 * const ast = braces.parse('a/{b,c}/d');
 * console.log(ast);
 * ```
 * @param {String} pattern Brace pattern to parse
 * @param {Object} options
 * @return {Object} Returns an AST
 * @api public
 */


braces.parse = (input, options = {}) => parse_1(input, options);
/**
 * Creates a braces string from an AST, or an AST node.
 *
 * ```js
 * const braces = require('braces');
 * let ast = braces.parse('foo/{a,b}/bar');
 * console.log(stringify(ast.nodes[2])); //=> '{a,b}'
 * ```
 * @param {String} `input` Brace pattern or AST.
 * @param {Object} `options`
 * @return {Array} Returns an array of expanded values.
 * @api public
 */


braces.stringify = (input, options = {}) => {
  if (typeof input === 'string') {
    return stringify(braces.parse(input, options), options);
  }

  return stringify(input, options);
};
/**
 * Compiles a brace pattern into a regex-compatible, optimized string.
 * This method is called by the main [braces](#braces) function by default.
 *
 * ```js
 * const braces = require('braces');
 * console.log(braces.compile('a/{b,c}/d'));
 * //=> ['a/(b|c)/d']
 * ```
 * @param {String} `input` Brace pattern or AST.
 * @param {Object} `options`
 * @return {Array} Returns an array of expanded values.
 * @api public
 */


braces.compile = (input, options = {}) => {
  if (typeof input === 'string') {
    input = braces.parse(input, options);
  }

  return compile_1(input, options);
};
/**
 * Expands a brace pattern into an array. This method is called by the
 * main [braces](#braces) function when `options.expand` is true. Before
 * using this method it's recommended that you read the [performance notes](#performance))
 * and advantages of using [.compile](#compile) instead.
 *
 * ```js
 * const braces = require('braces');
 * console.log(braces.expand('a/{b,c}/d'));
 * //=> ['a/b/d', 'a/c/d'];
 * ```
 * @param {String} `pattern` Brace pattern
 * @param {Object} `options`
 * @return {Array} Returns an array of expanded values.
 * @api public
 */


braces.expand = (input, options = {}) => {
  if (typeof input === 'string') {
    input = braces.parse(input, options);
  }

  let result = expand_1(input, options); // filter out empty strings if specified

  if (options.noempty === true) {
    result = result.filter(Boolean);
  } // filter out duplicates if specified


  if (options.nodupes === true) {
    result = [...new Set(result)];
  }

  return result;
};
/**
 * Processes a brace pattern and returns either an expanded array
 * (if `options.expand` is true), a highly optimized regex-compatible string.
 * This method is called by the main [braces](#braces) function.
 *
 * ```js
 * const braces = require('braces');
 * console.log(braces.create('user-{200..300}/project-{a,b,c}-{1..10}'))
 * //=> 'user-(20[0-9]|2[1-9][0-9]|300)/project-(a|b|c)-([1-9]|10)'
 * ```
 * @param {String} `pattern` Brace pattern
 * @param {Object} `options`
 * @return {Array} Returns an array of expanded values.
 * @api public
 */


braces.create = (input, options = {}) => {
  if (input === '' || input.length < 3) {
    return [input];
  }

  return options.expand !== true ? braces.compile(input, options) : braces.expand(input, options);
};
/**
 * Expose "braces"
 */


var braces_1 = braces;
const WIN_SLASH = '\\\\/';
const WIN_NO_SLASH = `[^${WIN_SLASH}]`;
/**
 * Posix glob regex
 */

const DOT_LITERAL = '\\.';
const PLUS_LITERAL = '\\+';
const QMARK_LITERAL = '\\?';
const SLASH_LITERAL = '\\/';
const ONE_CHAR = '(?=.)';
const QMARK = '[^/]';
const END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
const START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
const DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
const NO_DOT = `(?!${DOT_LITERAL})`;
const NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
const NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
const NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
const QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
const STAR = `${QMARK}*?`;
const POSIX_CHARS = {
  DOT_LITERAL,
  PLUS_LITERAL,
  QMARK_LITERAL,
  SLASH_LITERAL,
  ONE_CHAR,
  QMARK,
  END_ANCHOR,
  DOTS_SLASH,
  NO_DOT,
  NO_DOTS,
  NO_DOT_SLASH,
  NO_DOTS_SLASH,
  QMARK_NO_DOT,
  STAR,
  START_ANCHOR
};
/**
 * Windows glob regex
 */

const WINDOWS_CHARS = Object.assign({}, POSIX_CHARS, {
  SLASH_LITERAL: `[${WIN_SLASH}]`,
  QMARK: WIN_NO_SLASH,
  STAR: `${WIN_NO_SLASH}*?`,
  DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
  NO_DOT: `(?!${DOT_LITERAL})`,
  NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
  NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
  NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
  QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
  START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
  END_ANCHOR: `(?:[${WIN_SLASH}]|$)`
});
/**
 * POSIX Bracket Regex
 */

const POSIX_REGEX_SOURCE = {
  alnum: 'a-zA-Z0-9',
  alpha: 'a-zA-Z',
  ascii: '\\x00-\\x7F',
  blank: ' \\t',
  cntrl: '\\x00-\\x1F\\x7F',
  digit: '0-9',
  graph: '\\x21-\\x7E',
  lower: 'a-z',
  print: '\\x20-\\x7E ',
  punct: '\\-!"#$%&\'()\\*+,./:;<=>?@[\\]^_`{|}~',
  space: ' \\t\\r\\n\\v\\f',
  upper: 'A-Z',
  word: 'A-Za-z0-9_',
  xdigit: 'A-Fa-f0-9'
};
var constants$1 = {
  MAX_LENGTH: 1024 * 64,
  POSIX_REGEX_SOURCE,
  // regular expressions
  REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
  REGEX_NON_SPECIAL_CHAR: /^[^@![\].,$*+?^{}()|\\/]+/,
  REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
  REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
  REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
  REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
  // Replace globs with equivalent patterns to reduce parsing time.
  REPLACEMENTS: {
    '***': '*',
    '**/**': '**',
    '**/**/**': '**'
  },
  // Digits
  CHAR_0: 48,
  CHAR_9: 57,
  // Alphabet chars.
  CHAR_UPPERCASE_A: 65,
  CHAR_LOWERCASE_A: 97,
  CHAR_UPPERCASE_Z: 90,
  CHAR_LOWERCASE_Z: 122,
  CHAR_LEFT_PARENTHESES: 40,
  CHAR_RIGHT_PARENTHESES: 41,
  CHAR_ASTERISK: 42,
  // Non-alphabetic chars.
  CHAR_AMPERSAND: 38,
  CHAR_AT: 64,
  CHAR_BACKWARD_SLASH: 92,
  CHAR_CARRIAGE_RETURN: 13,
  CHAR_CIRCUMFLEX_ACCENT: 94,
  CHAR_COLON: 58,
  CHAR_COMMA: 44,
  CHAR_DOT: 46,
  CHAR_DOUBLE_QUOTE: 34,
  CHAR_EQUAL: 61,
  CHAR_EXCLAMATION_MARK: 33,
  CHAR_FORM_FEED: 12,
  CHAR_FORWARD_SLASH: 47,
  CHAR_GRAVE_ACCENT: 96,
  CHAR_HASH: 35,
  CHAR_HYPHEN_MINUS: 45,
  CHAR_LEFT_ANGLE_BRACKET: 60,
  CHAR_LEFT_CURLY_BRACE: 123,
  CHAR_LEFT_SQUARE_BRACKET: 91,
  CHAR_LINE_FEED: 10,
  CHAR_NO_BREAK_SPACE: 160,
  CHAR_PERCENT: 37,
  CHAR_PLUS: 43,
  CHAR_QUESTION_MARK: 63,
  CHAR_RIGHT_ANGLE_BRACKET: 62,
  CHAR_RIGHT_CURLY_BRACE: 125,
  CHAR_RIGHT_SQUARE_BRACKET: 93,
  CHAR_SEMICOLON: 59,
  CHAR_SINGLE_QUOTE: 39,
  CHAR_SPACE: 32,
  CHAR_TAB: 9,
  CHAR_UNDERSCORE: 95,
  CHAR_VERTICAL_LINE: 124,
  CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,
  SEP: path__default["default"].sep,

  /**
   * Create EXTGLOB_CHARS
   */
  extglobChars(chars) {
    return {
      '!': {
        type: 'negate',
        open: '(?:(?!(?:',
        close: `))${chars.STAR})`
      },
      '?': {
        type: 'qmark',
        open: '(?:',
        close: ')?'
      },
      '+': {
        type: 'plus',
        open: '(?:',
        close: ')+'
      },
      '*': {
        type: 'star',
        open: '(?:',
        close: ')*'
      },
      '@': {
        type: 'at',
        open: '(?:',
        close: ')'
      }
    };
  },

  /**
   * Create GLOB_CHARS
   */
  globChars(win32) {
    return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
  }

};
var utils$1 = createCommonjsModule(function (module, exports) {
  const win32 = process.platform === 'win32';
  const {
    REGEX_SPECIAL_CHARS,
    REGEX_SPECIAL_CHARS_GLOBAL,
    REGEX_REMOVE_BACKSLASH
  } = constants$1;

  exports.isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);

  exports.hasRegexChars = str => REGEX_SPECIAL_CHARS.test(str);

  exports.isRegexChar = str => str.length === 1 && exports.hasRegexChars(str);

  exports.escapeRegex = str => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, '\\$1');

  exports.toPosixSlashes = str => str.replace(/\\/g, '/');

  exports.removeBackslashes = str => {
    return str.replace(REGEX_REMOVE_BACKSLASH, match => {
      return match === '\\' ? '' : match;
    });
  };

  exports.supportsLookbehinds = () => {
    let segs = process.version.slice(1).split('.');

    if (segs.length === 3 && +segs[0] >= 9 || +segs[0] === 8 && +segs[1] >= 10) {
      return true;
    }

    return false;
  };

  exports.isWindows = options => {
    if (options && typeof options.windows === 'boolean') {
      return options.windows;
    }

    return win32 === true || path__default["default"].sep === '\\';
  };

  exports.escapeLast = (input, char, lastIdx) => {
    let idx = input.lastIndexOf(char, lastIdx);
    if (idx === -1) return input;
    if (input[idx - 1] === '\\') return exports.escapeLast(input, char, idx - 1);
    return input.slice(0, idx) + '\\' + input.slice(idx);
  };
});
utils$1.isObject;
utils$1.hasRegexChars;
utils$1.isRegexChar;
utils$1.escapeRegex;
utils$1.toPosixSlashes;
utils$1.removeBackslashes;
utils$1.supportsLookbehinds;
utils$1.isWindows;
utils$1.escapeLast;
const {
  CHAR_ASTERISK,

  /* * */
  CHAR_AT,

  /* @ */
  CHAR_BACKWARD_SLASH,

  /* \ */
  CHAR_COMMA: CHAR_COMMA$1,

  /* , */
  CHAR_DOT: CHAR_DOT$1,

  /* . */
  CHAR_EXCLAMATION_MARK,

  /* ! */
  CHAR_FORWARD_SLASH,

  /* / */
  CHAR_LEFT_CURLY_BRACE: CHAR_LEFT_CURLY_BRACE$1,

  /* { */
  CHAR_LEFT_PARENTHESES: CHAR_LEFT_PARENTHESES$1,

  /* ( */
  CHAR_LEFT_SQUARE_BRACKET: CHAR_LEFT_SQUARE_BRACKET$1,

  /* [ */
  CHAR_PLUS,

  /* + */
  CHAR_QUESTION_MARK,

  /* ? */
  CHAR_RIGHT_CURLY_BRACE: CHAR_RIGHT_CURLY_BRACE$1,

  /* } */
  CHAR_RIGHT_PARENTHESES: CHAR_RIGHT_PARENTHESES$1,

  /* ) */
  CHAR_RIGHT_SQUARE_BRACKET: CHAR_RIGHT_SQUARE_BRACKET$1
  /* ] */

} = constants$1;

const isPathSeparator = code => {
  return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
};
/**
 * Quickly scans a glob pattern and returns an object with a handful of
 * useful properties, like `isGlob`, `path` (the leading non-glob, if it exists),
 * `glob` (the actual pattern), and `negated` (true if the path starts with `!`).
 *
 * ```js
 * const pm = require('picomatch');
 * console.log(pm.scan('foo/bar/*.js'));
 * { isGlob: true, input: 'foo/bar/*.js', base: 'foo/bar', glob: '*.js' }
 * ```
 * @param {String} `str`
 * @param {Object} `options`
 * @return {Object} Returns an object with tokens and regex source string.
 * @api public
 */


var scan = (input, options) => {
  let opts = options || {};
  let length = input.length - 1;
  let index = -1;
  let start = 0;
  let lastIndex = 0;
  let isGlob = false;
  let backslashes = false;
  let negated = false;
  let braces = 0;
  let prev;
  let code;
  let braceEscaped = false;

  let eos = () => index >= length;

  let advance = () => {
    prev = code;
    return input.charCodeAt(++index);
  };

  while (index < length) {
    code = advance();
    let next;

    if (code === CHAR_BACKWARD_SLASH) {
      backslashes = true;
      next = advance();

      if (next === CHAR_LEFT_CURLY_BRACE$1) {
        braceEscaped = true;
      }

      continue;
    }

    if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE$1) {
      braces++;

      while (!eos() && (next = advance())) {
        if (next === CHAR_BACKWARD_SLASH) {
          backslashes = true;
          next = advance();
          continue;
        }

        if (next === CHAR_LEFT_CURLY_BRACE$1) {
          braces++;
          continue;
        }

        if (!braceEscaped && next === CHAR_DOT$1 && (next = advance()) === CHAR_DOT$1) {
          isGlob = true;
          break;
        }

        if (!braceEscaped && next === CHAR_COMMA$1) {
          isGlob = true;
          break;
        }

        if (next === CHAR_RIGHT_CURLY_BRACE$1) {
          braces--;

          if (braces === 0) {
            braceEscaped = false;
            break;
          }
        }
      }
    }

    if (code === CHAR_FORWARD_SLASH) {
      if (prev === CHAR_DOT$1 && index === start + 1) {
        start += 2;
        continue;
      }

      lastIndex = index + 1;
      continue;
    }

    if (code === CHAR_ASTERISK) {
      isGlob = true;
      break;
    }

    if (code === CHAR_ASTERISK || code === CHAR_QUESTION_MARK) {
      isGlob = true;
      break;
    }

    if (code === CHAR_LEFT_SQUARE_BRACKET$1) {
      while (!eos() && (next = advance())) {
        if (next === CHAR_BACKWARD_SLASH) {
          backslashes = true;
          next = advance();
          continue;
        }

        if (next === CHAR_RIGHT_SQUARE_BRACKET$1) {
          isGlob = true;
          break;
        }
      }
    }

    let isExtglobChar = code === CHAR_PLUS || code === CHAR_AT || code === CHAR_EXCLAMATION_MARK;

    if (isExtglobChar && input.charCodeAt(index + 1) === CHAR_LEFT_PARENTHESES$1) {
      isGlob = true;
      break;
    }

    if (code === CHAR_EXCLAMATION_MARK && index === start) {
      negated = true;
      start++;
      continue;
    }

    if (code === CHAR_LEFT_PARENTHESES$1) {
      while (!eos() && (next = advance())) {
        if (next === CHAR_BACKWARD_SLASH) {
          backslashes = true;
          next = advance();
          continue;
        }

        if (next === CHAR_RIGHT_PARENTHESES$1) {
          isGlob = true;
          break;
        }
      }
    }

    if (isGlob) {
      break;
    }
  }

  let prefix = '';
  let orig = input;
  let base = input;
  let glob = '';

  if (start > 0) {
    prefix = input.slice(0, start);
    input = input.slice(start);
    lastIndex -= start;
  }

  if (base && isGlob === true && lastIndex > 0) {
    base = input.slice(0, lastIndex);
    glob = input.slice(lastIndex);
  } else if (isGlob === true) {
    base = '';
    glob = input;
  } else {
    base = input;
  }

  if (base && base !== '' && base !== '/' && base !== input) {
    if (isPathSeparator(base.charCodeAt(base.length - 1))) {
      base = base.slice(0, -1);
    }
  }

  if (opts.unescape === true) {
    if (glob) glob = utils$1.removeBackslashes(glob);

    if (base && backslashes === true) {
      base = utils$1.removeBackslashes(base);
    }
  }

  return {
    prefix,
    input: orig,
    base,
    glob,
    negated,
    isGlob
  };
};
/**
 * Constants
 */


const {
  MAX_LENGTH: MAX_LENGTH$1,
  POSIX_REGEX_SOURCE: POSIX_REGEX_SOURCE$1,
  REGEX_NON_SPECIAL_CHAR,
  REGEX_SPECIAL_CHARS_BACKREF,
  REPLACEMENTS
} = constants$1;
/**
 * Helpers
 */

const expandRange = (args, options) => {
  if (typeof options.expandRange === 'function') {
    return options.expandRange(...args, options);
  }

  args.sort();
  let value = `[${args.join('-')}]`;

  return value;
};

const negate = state => {
  let count = 1;

  while (state.peek() === '!' && (state.peek(2) !== '(' || state.peek(3) === '?')) {
    state.advance();
    state.start++;
    count++;
  }

  if (count % 2 === 0) {
    return false;
  }

  state.negated = true;
  state.start++;
  return true;
};
/**
 * Create the message for a syntax error
 */


const syntaxError = (type, char) => {
  return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
};
/**
 * Parse the given input string.
 * @param {String} input
 * @param {Object} options
 * @return {Object}
 */


const parse$1 = (input, options) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected a string');
  }

  input = REPLACEMENTS[input] || input;
  let opts = Object.assign({}, options);
  let max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH$1, opts.maxLength) : MAX_LENGTH$1;
  let len = input.length;

  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }

  let bos = {
    type: 'bos',
    value: '',
    output: opts.prepend || ''
  };
  let tokens = [bos];
  let capture = opts.capture ? '' : '?:';
  let win32 = utils$1.isWindows(options); // create constants based on platform, for windows or posix

  const PLATFORM_CHARS = constants$1.globChars(win32);
  const EXTGLOB_CHARS = constants$1.extglobChars(PLATFORM_CHARS);
  const {
    DOT_LITERAL,
    PLUS_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOT_SLASH,
    NO_DOTS_SLASH,
    QMARK,
    QMARK_NO_DOT,
    STAR,
    START_ANCHOR
  } = PLATFORM_CHARS;

  const globstar = opts => {
    return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
  };

  let nodot = opts.dot ? '' : NO_DOT;
  let star = opts.bash === true ? globstar(opts) : STAR;
  let qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;

  if (opts.capture) {
    star = `(${star})`;
  } // minimatch options support


  if (typeof opts.noext === 'boolean') {
    opts.noextglob = opts.noext;
  }

  let state = {
    index: -1,
    start: 0,
    consumed: '',
    output: '',
    backtrack: false,
    brackets: 0,
    braces: 0,
    parens: 0,
    quotes: 0,
    tokens
  };
  let extglobs = [];
  let stack = [];
  let prev = bos;
  let value;
  /**
   * Tokenizing helpers
   */

  const eos = () => state.index === len - 1;

  const peek = state.peek = (n = 1) => input[state.index + n];

  const advance = state.advance = () => input[++state.index];

  const append = token => {
    state.output += token.output != null ? token.output : token.value;
    state.consumed += token.value || '';
  };

  const increment = type => {
    state[type]++;
    stack.push(type);
  };

  const decrement = type => {
    state[type]--;
    stack.pop();
  };
  /**
   * Push tokens onto the tokens array. This helper speeds up
   * tokenizing by 1) helping us avoid backtracking as much as possible,
   * and 2) helping us avoid creating extra tokens when consecutive
   * characters are plain text. This improves performance and simplifies
   * lookbehinds.
   */


  const push = tok => {
    if (prev.type === 'globstar') {
      let isBrace = state.braces > 0 && (tok.type === 'comma' || tok.type === 'brace');
      let isExtglob = extglobs.length && (tok.type === 'pipe' || tok.type === 'paren');

      if (tok.type !== 'slash' && tok.type !== 'paren' && !isBrace && !isExtglob) {
        state.output = state.output.slice(0, -prev.output.length);
        prev.type = 'star';
        prev.value = '*';
        prev.output = star;
        state.output += prev.output;
      }
    }

    if (extglobs.length && tok.type !== 'paren' && !EXTGLOB_CHARS[tok.value]) {
      extglobs[extglobs.length - 1].inner += tok.value;
    }

    if (tok.value || tok.output) append(tok);

    if (prev && prev.type === 'text' && tok.type === 'text') {
      prev.value += tok.value;
      return;
    }

    tok.prev = prev;
    tokens.push(tok);
    prev = tok;
  };

  const extglobOpen = (type, value) => {
    let token = Object.assign({}, EXTGLOB_CHARS[value], {
      conditions: 1,
      inner: ''
    });
    token.prev = prev;
    token.parens = state.parens;
    token.output = state.output;
    let output = (opts.capture ? '(' : '') + token.open;
    push({
      type,
      value,
      output: state.output ? '' : ONE_CHAR
    });
    push({
      type: 'paren',
      extglob: true,
      value: advance(),
      output
    });
    increment('parens');
    extglobs.push(token);
  };

  const extglobClose = token => {
    let output = token.close + (opts.capture ? ')' : '');

    if (token.type === 'negate') {
      let extglobStar = star;

      if (token.inner && token.inner.length > 1 && token.inner.includes('/')) {
        extglobStar = globstar(opts);
      }

      if (extglobStar !== star || eos() || /^\)+$/.test(input.slice(state.index + 1))) {
        output = token.close = ')$))' + extglobStar;
      }

      if (token.prev.type === 'bos' && eos()) {
        state.negatedExtglob = true;
      }
    }

    push({
      type: 'paren',
      extglob: true,
      value,
      output
    });
    decrement('parens');
  };

  if (opts.fastpaths !== false && !/(^[*!]|[/{[()\]}"])/.test(input)) {
    let backslashes = false;
    let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first, rest, index) => {
      if (first === '\\') {
        backslashes = true;
        return m;
      }

      if (first === '?') {
        if (esc) {
          return esc + first + (rest ? QMARK.repeat(rest.length) : '');
        }

        if (index === 0) {
          return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : '');
        }

        return QMARK.repeat(chars.length);
      }

      if (first === '.') {
        return DOT_LITERAL.repeat(chars.length);
      }

      if (first === '*') {
        if (esc) {
          return esc + first + (rest ? star : '');
        }

        return star;
      }

      return esc ? m : '\\' + m;
    });

    if (backslashes === true) {
      if (opts.unescape === true) {
        output = output.replace(/\\/g, '');
      } else {
        output = output.replace(/\\+/g, m => {
          return m.length % 2 === 0 ? '\\\\' : m ? '\\' : '';
        });
      }
    }

    state.output = output;
    return state;
  }
  /**
   * Tokenize input until we reach end-of-string
   */


  while (!eos()) {
    value = advance();

    if (value === '\u0000') {
      continue;
    }
    /**
     * Escaped characters
     */


    if (value === '\\') {
      let next = peek();

      if (next === '/' && opts.bash !== true) {
        continue;
      }

      if (next === '.' || next === ';') {
        continue;
      }

      if (!next) {
        value += '\\';
        push({
          type: 'text',
          value
        });
        continue;
      } // collapse slashes to reduce potential for exploits


      let match = /^\\+/.exec(input.slice(state.index + 1));
      let slashes = 0;

      if (match && match[0].length > 2) {
        slashes = match[0].length;
        state.index += slashes;

        if (slashes % 2 !== 0) {
          value += '\\';
        }
      }

      if (opts.unescape === true) {
        value = advance() || '';
      } else {
        value += advance() || '';
      }

      if (state.brackets === 0) {
        push({
          type: 'text',
          value
        });
        continue;
      }
    }
    /**
     * If we're inside a regex character class, continue
     * until we reach the closing bracket.
     */


    if (state.brackets > 0 && (value !== ']' || prev.value === '[' || prev.value === '[^')) {
      if (opts.posix !== false && value === ':') {
        let inner = prev.value.slice(1);

        if (inner.includes('[')) {
          prev.posix = true;

          if (inner.includes(':')) {
            let idx = prev.value.lastIndexOf('[');
            let pre = prev.value.slice(0, idx);
            let rest = prev.value.slice(idx + 2);
            let posix = POSIX_REGEX_SOURCE$1[rest];

            if (posix) {
              prev.value = pre + posix;
              state.backtrack = true;
              advance();

              if (!bos.output && tokens.indexOf(prev) === 1) {
                bos.output = ONE_CHAR;
              }

              continue;
            }
          }
        }
      }

      if (value === '[' && peek() !== ':' || value === '-' && peek() === ']') {
        value = '\\' + value;
      }

      if (value === ']' && (prev.value === '[' || prev.value === '[^')) {
        value = '\\' + value;
      }

      if (opts.posix === true && value === '!' && prev.value === '[') {
        value = '^';
      }

      prev.value += value;
      append({
        value
      });
      continue;
    }
    /**
     * If we're inside a quoted string, continue
     * until we reach the closing double quote.
     */


    if (state.quotes === 1 && value !== '"') {
      value = utils$1.escapeRegex(value);
      prev.value += value;
      append({
        value
      });
      continue;
    }
    /**
     * Double quotes
     */


    if (value === '"') {
      state.quotes = state.quotes === 1 ? 0 : 1;

      if (opts.keepQuotes === true) {
        push({
          type: 'text',
          value
        });
      }

      continue;
    }
    /**
     * Parentheses
     */


    if (value === '(') {
      push({
        type: 'paren',
        value
      });
      increment('parens');
      continue;
    }

    if (value === ')') {
      if (state.parens === 0 && opts.strictBrackets === true) {
        throw new SyntaxError(syntaxError('opening', '('));
      }

      let extglob = extglobs[extglobs.length - 1];

      if (extglob && state.parens === extglob.parens + 1) {
        extglobClose(extglobs.pop());
        continue;
      }

      push({
        type: 'paren',
        value,
        output: state.parens ? ')' : '\\)'
      });
      decrement('parens');
      continue;
    }
    /**
     * Brackets
     */


    if (value === '[') {
      if (opts.nobracket === true || !input.slice(state.index + 1).includes(']')) {
        if (opts.nobracket !== true && opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError('closing', ']'));
        }

        value = '\\' + value;
      } else {
        increment('brackets');
      }

      push({
        type: 'bracket',
        value
      });
      continue;
    }

    if (value === ']') {
      if (opts.nobracket === true || prev && prev.type === 'bracket' && prev.value.length === 1) {
        push({
          type: 'text',
          value,
          output: '\\' + value
        });
        continue;
      }

      if (state.brackets === 0) {
        if (opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError('opening', '['));
        }

        push({
          type: 'text',
          value,
          output: '\\' + value
        });
        continue;
      }

      decrement('brackets');
      let prevValue = prev.value.slice(1);

      if (prev.posix !== true && prevValue[0] === '^' && !prevValue.includes('/')) {
        value = '/' + value;
      }

      prev.value += value;
      append({
        value
      }); // when literal brackets are explicitly disabled
      // assume we should match with a regex character class

      if (opts.literalBrackets === false || utils$1.hasRegexChars(prevValue)) {
        continue;
      }

      let escaped = utils$1.escapeRegex(prev.value);
      state.output = state.output.slice(0, -prev.value.length); // when literal brackets are explicitly enabled
      // assume we should escape the brackets to match literal characters

      if (opts.literalBrackets === true) {
        state.output += escaped;
        prev.value = escaped;
        continue;
      } // when the user specifies nothing, try to match both


      prev.value = `(${capture}${escaped}|${prev.value})`;
      state.output += prev.value;
      continue;
    }
    /**
     * Braces
     */


    if (value === '{' && opts.nobrace !== true) {
      push({
        type: 'brace',
        value,
        output: '('
      });
      increment('braces');
      continue;
    }

    if (value === '}') {
      if (opts.nobrace === true || state.braces === 0) {
        push({
          type: 'text',
          value,
          output: '\\' + value
        });
        continue;
      }

      let output = ')';

      if (state.dots === true) {
        let arr = tokens.slice();
        let range = [];

        for (let i = arr.length - 1; i >= 0; i--) {
          tokens.pop();

          if (arr[i].type === 'brace') {
            break;
          }

          if (arr[i].type !== 'dots') {
            range.unshift(arr[i].value);
          }
        }

        output = expandRange(range, opts);
        state.backtrack = true;
      }

      push({
        type: 'brace',
        value,
        output
      });
      decrement('braces');
      continue;
    }
    /**
     * Pipes
     */


    if (value === '|') {
      if (extglobs.length > 0) {
        extglobs[extglobs.length - 1].conditions++;
      }

      push({
        type: 'text',
        value
      });
      continue;
    }
    /**
     * Commas
     */


    if (value === ',') {
      let output = value;

      if (state.braces > 0 && stack[stack.length - 1] === 'braces') {
        output = '|';
      }

      push({
        type: 'comma',
        value,
        output
      });
      continue;
    }
    /**
     * Slashes
     */


    if (value === '/') {
      // if the beginning of the glob is "./", advance the start
      // to the current index, and don't add the "./" characters
      // to the state. This greatly simplifies lookbehinds when
      // checking for BOS characters like "!" and "." (not "./")
      if (prev.type === 'dot' && state.index === 1) {
        state.start = state.index + 1;
        state.consumed = '';
        state.output = '';
        tokens.pop();
        prev = bos; // reset "prev" to the first token

        continue;
      }

      push({
        type: 'slash',
        value,
        output: SLASH_LITERAL
      });
      continue;
    }
    /**
     * Dots
     */


    if (value === '.') {
      if (state.braces > 0 && prev.type === 'dot') {
        if (prev.value === '.') prev.output = DOT_LITERAL;
        prev.type = 'dots';
        prev.output += value;
        prev.value += value;
        state.dots = true;
        continue;
      }

      push({
        type: 'dot',
        value,
        output: DOT_LITERAL
      });
      continue;
    }
    /**
     * Question marks
     */


    if (value === '?') {
      if (prev && prev.type === 'paren') {
        let next = peek();
        let output = value;

        if (next === '<' && !utils$1.supportsLookbehinds()) {
          throw new Error('Node.js v10 or higher is required for regex lookbehinds');
        }

        if (prev.value === '(' && !/[!=<:]/.test(next) || next === '<' && !/[!=]/.test(peek(2))) {
          output = '\\' + value;
        }

        push({
          type: 'text',
          value,
          output
        });
        continue;
      }

      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        extglobOpen('qmark', value);
        continue;
      }

      if (opts.dot !== true && (prev.type === 'slash' || prev.type === 'bos')) {
        push({
          type: 'qmark',
          value,
          output: QMARK_NO_DOT
        });
        continue;
      }

      push({
        type: 'qmark',
        value,
        output: QMARK
      });
      continue;
    }
    /**
     * Exclamation
     */


    if (value === '!') {
      if (opts.noextglob !== true && peek() === '(') {
        if (peek(2) !== '?' || !/[!=<:]/.test(peek(3))) {
          extglobOpen('negate', value);
          continue;
        }
      }

      if (opts.nonegate !== true && state.index === 0) {
        negate(state);
        continue;
      }
    }
    /**
     * Plus
     */


    if (value === '+') {
      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        extglobOpen('plus', value);
        continue;
      }

      if (prev && (prev.type === 'bracket' || prev.type === 'paren' || prev.type === 'brace')) {
        let output = prev.extglob === true ? '\\' + value : value;
        push({
          type: 'plus',
          value,
          output
        });
        continue;
      } // use regex behavior inside parens


      if (state.parens > 0 && opts.regex !== false) {
        push({
          type: 'plus',
          value
        });
        continue;
      }

      push({
        type: 'plus',
        value: PLUS_LITERAL
      });
      continue;
    }
    /**
     * Plain text
     */


    if (value === '@') {
      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        push({
          type: 'at',
          value,
          output: ''
        });
        continue;
      }

      push({
        type: 'text',
        value
      });
      continue;
    }
    /**
     * Plain text
     */


    if (value !== '*') {
      if (value === '$' || value === '^') {
        value = '\\' + value;
      }

      let match = REGEX_NON_SPECIAL_CHAR.exec(input.slice(state.index + 1));

      if (match) {
        value += match[0];
        state.index += match[0].length;
      }

      push({
        type: 'text',
        value
      });
      continue;
    }
    /**
     * Stars
     */


    if (prev && (prev.type === 'globstar' || prev.star === true)) {
      prev.type = 'star';
      prev.star = true;
      prev.value += value;
      prev.output = star;
      state.backtrack = true;
      state.consumed += value;
      continue;
    }

    if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
      extglobOpen('star', value);
      continue;
    }

    if (prev.type === 'star') {
      if (opts.noglobstar === true) {
        state.consumed += value;
        continue;
      }

      let prior = prev.prev;
      let before = prior.prev;
      let isStart = prior.type === 'slash' || prior.type === 'bos';
      let afterStar = before && (before.type === 'star' || before.type === 'globstar');

      if (opts.bash === true && (!isStart || !eos() && peek() !== '/')) {
        push({
          type: 'star',
          value,
          output: ''
        });
        continue;
      }

      let isBrace = state.braces > 0 && (prior.type === 'comma' || prior.type === 'brace');
      let isExtglob = extglobs.length && (prior.type === 'pipe' || prior.type === 'paren');

      if (!isStart && prior.type !== 'paren' && !isBrace && !isExtglob) {
        push({
          type: 'star',
          value,
          output: ''
        });
        continue;
      } // strip consecutive `/**/`


      while (input.slice(state.index + 1, state.index + 4) === '/**') {
        let after = input[state.index + 4];

        if (after && after !== '/') {
          break;
        }

        state.consumed += '/**';
        state.index += 3;
      }

      if (prior.type === 'bos' && eos()) {
        prev.type = 'globstar';
        prev.value += value;
        prev.output = globstar(opts);
        state.output = prev.output;
        state.consumed += value;
        continue;
      }

      if (prior.type === 'slash' && prior.prev.type !== 'bos' && !afterStar && eos()) {
        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = '(?:' + prior.output;
        prev.type = 'globstar';
        prev.output = globstar(opts) + '|$)';
        prev.value += value;
        state.output += prior.output + prev.output;
        state.consumed += value;
        continue;
      }

      let next = peek();

      if (prior.type === 'slash' && prior.prev.type !== 'bos' && next === '/') {
        let end = peek(2) !== void 0 ? '|$' : '';
        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = '(?:' + prior.output;
        prev.type = 'globstar';
        prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
        prev.value += value;
        state.output += prior.output + prev.output;
        state.consumed += value + advance();
        push({
          type: 'slash',
          value,
          output: ''
        });
        continue;
      }

      if (prior.type === 'bos' && next === '/') {
        prev.type = 'globstar';
        prev.value += value;
        prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
        state.output = prev.output;
        state.consumed += value + advance();
        push({
          type: 'slash',
          value,
          output: ''
        });
        continue;
      } // remove single star from output


      state.output = state.output.slice(0, -prev.output.length); // reset previous token to globstar

      prev.type = 'globstar';
      prev.output = globstar(opts);
      prev.value += value; // reset output with globstar

      state.output += prev.output;
      state.consumed += value;
      continue;
    }

    let token = {
      type: 'star',
      value,
      output: star
    };

    if (opts.bash === true) {
      token.output = '.*?';

      if (prev.type === 'bos' || prev.type === 'slash') {
        token.output = nodot + token.output;
      }

      push(token);
      continue;
    }

    if (prev && (prev.type === 'bracket' || prev.type === 'paren') && opts.regex === true) {
      token.output = value;
      push(token);
      continue;
    }

    if (state.index === state.start || prev.type === 'slash' || prev.type === 'dot') {
      if (prev.type === 'dot') {
        state.output += NO_DOT_SLASH;
        prev.output += NO_DOT_SLASH;
      } else if (opts.dot === true) {
        state.output += NO_DOTS_SLASH;
        prev.output += NO_DOTS_SLASH;
      } else {
        state.output += nodot;
        prev.output += nodot;
      }

      if (peek() !== '*') {
        state.output += ONE_CHAR;
        prev.output += ONE_CHAR;
      }
    }

    push(token);
  }

  while (state.brackets > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ']'));
    state.output = utils$1.escapeLast(state.output, '[');
    decrement('brackets');
  }

  while (state.parens > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ')'));
    state.output = utils$1.escapeLast(state.output, '(');
    decrement('parens');
  }

  while (state.braces > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', '}'));
    state.output = utils$1.escapeLast(state.output, '{');
    decrement('braces');
  }

  if (opts.strictSlashes !== true && (prev.type === 'star' || prev.type === 'bracket')) {
    push({
      type: 'maybe_slash',
      value: '',
      output: `${SLASH_LITERAL}?`
    });
  } // rebuild the output if we had to backtrack at any point


  if (state.backtrack === true) {
    state.output = '';

    for (let token of state.tokens) {
      state.output += token.output != null ? token.output : token.value;

      if (token.suffix) {
        state.output += token.suffix;
      }
    }
  }

  return state;
};
/**
 * Fast paths for creating regular expressions for common glob patterns.
 * This can significantly speed up processing and has very little downside
 * impact when none of the fast paths match.
 */


parse$1.fastpaths = (input, options) => {
  let opts = Object.assign({}, options);
  let max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH$1, opts.maxLength) : MAX_LENGTH$1;
  let len = input.length;

  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }

  input = REPLACEMENTS[input] || input;
  let win32 = utils$1.isWindows(options); // create constants based on platform, for windows or posix

  const {
    DOT_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOTS,
    NO_DOTS_SLASH,
    STAR,
    START_ANCHOR
  } = constants$1.globChars(win32);
  let capture = opts.capture ? '' : '?:';
  let star = opts.bash === true ? '.*?' : STAR;
  let nodot = opts.dot ? NO_DOTS : NO_DOT;
  let slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;

  if (opts.capture) {
    star = `(${star})`;
  }

  const globstar = opts => {
    return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
  };

  const create = str => {
    switch (str) {
      case '*':
        return `${nodot}${ONE_CHAR}${star}`;

      case '.*':
        return `${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '*.*':
        return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '*/*':
        return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;

      case '**':
        return nodot + globstar(opts);

      case '**/*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;

      case '**/*.*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '**/.*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;

      default:
        {
          let match = /^(.*?)\.(\w+)$/.exec(str);
          if (!match) return;
          let source = create(match[1]);
          if (!source) return;
          return source + DOT_LITERAL + match[2];
        }
    }
  };

  let output = create(input);

  if (output && opts.strictSlashes !== true) {
    output += `${SLASH_LITERAL}?`;
  }

  return output;
};

var parse_1$1 = parse$1;
/**
 * Creates a matcher function from one or more glob patterns. The
 * returned function takes a string to match as its first argument,
 * and returns true if the string is a match. The returned matcher
 * function also takes a boolean as the second argument that, when true,
 * returns an object with additional information.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch(glob[, options]);
 *
 * const isMatch = picomatch('*.!(*a)');
 * console.log(isMatch('a.a')); //=> false
 * console.log(isMatch('a.b')); //=> true
 * ```
 * @name picomatch
 * @param {String|Array} `globs` One or more glob patterns.
 * @param {Object=} `options`
 * @return {Function=} Returns a matcher function.
 * @api public
 */

const picomatch = (glob, options, returnState = false) => {
  if (Array.isArray(glob)) {
    let fns = glob.map(input => picomatch(input, options, returnState));
    return str => {
      for (let isMatch of fns) {
        let state = isMatch(str);
        if (state) return state;
      }

      return false;
    };
  }

  if (typeof glob !== 'string' || glob === '') {
    throw new TypeError('Expected pattern to be a non-empty string');
  }

  let opts = options || {};
  let posix = utils$1.isWindows(options);
  let regex = picomatch.makeRe(glob, options, false, true);
  let state = regex.state;
  delete regex.state;

  let isIgnored = () => false;

  if (opts.ignore) {
    let ignoreOpts = Object.assign({}, options, {
      ignore: null,
      onMatch: null,
      onResult: null
    });
    isIgnored = picomatch(opts.ignore, ignoreOpts, returnState);
  }

  const matcher = (input, returnObject = false) => {
    let {
      isMatch,
      match,
      output
    } = picomatch.test(input, regex, options, {
      glob,
      posix
    });
    let result = {
      glob,
      state,
      regex,
      posix,
      input,
      output,
      match,
      isMatch
    };

    if (typeof opts.onResult === 'function') {
      opts.onResult(result);
    }

    if (isMatch === false) {
      result.isMatch = false;
      return returnObject ? result : false;
    }

    if (isIgnored(input)) {
      if (typeof opts.onIgnore === 'function') {
        opts.onIgnore(result);
      }

      result.isMatch = false;
      return returnObject ? result : false;
    }

    if (typeof opts.onMatch === 'function') {
      opts.onMatch(result);
    }

    return returnObject ? result : true;
  };

  if (returnState) {
    matcher.state = state;
  }

  return matcher;
};
/**
 * Test `input` with the given `regex`. This is used by the main
 * `picomatch()` function to test the input string.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.test(input, regex[, options]);
 *
 * console.log(picomatch.test('foo/bar', /^(?:([^/]*?)\/([^/]*?))$/));
 * // { isMatch: true, match: [ 'foo/', 'foo', 'bar' ], output: 'foo/bar' }
 * ```
 * @param {String} `input` String to test.
 * @param {RegExp} `regex`
 * @return {Object} Returns an object with matching info.
 * @api public
 */


picomatch.test = (input, regex, options, {
  glob,
  posix
} = {}) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected input to be a string');
  }

  if (input === '') {
    return {
      isMatch: false,
      output: ''
    };
  }

  let opts = options || {};
  let format = opts.format || (posix ? utils$1.toPosixSlashes : null);
  let match = input === glob;
  let output = match && format ? format(input) : input;

  if (match === false) {
    output = format ? format(input) : input;
    match = output === glob;
  }

  if (match === false || opts.capture === true) {
    if (opts.matchBase === true || opts.basename === true) {
      match = picomatch.matchBase(input, regex, options, posix);
    } else {
      match = regex.exec(output);
    }
  }

  return {
    isMatch: !!match,
    match,
    output
  };
};
/**
 * Match the basename of a filepath.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.matchBase(input, glob[, options]);
 * console.log(picomatch.matchBase('foo/bar.js', '*.js'); // true
 * ```
 * @param {String} `input` String to test.
 * @param {RegExp|String} `glob` Glob pattern or regex created by [.makeRe](#makeRe).
 * @return {Boolean}
 * @api public
 */


picomatch.matchBase = (input, glob, options, posix = utils$1.isWindows(options)) => {
  let regex = glob instanceof RegExp ? glob : picomatch.makeRe(glob, options);
  return regex.test(path__default["default"].basename(input));
};
/**
 * Returns true if **any** of the given glob `patterns` match the specified `string`.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.isMatch(string, patterns[, options]);
 *
 * console.log(picomatch.isMatch('a.a', ['b.*', '*.a'])); //=> true
 * console.log(picomatch.isMatch('a.a', 'b.*')); //=> false
 * ```
 * @param {String|Array} str The string to test.
 * @param {String|Array} patterns One or more glob patterns to use for matching.
 * @param {Object} [options] See available [options](#options).
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */


picomatch.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);
/**
 * Parse a glob pattern to create the source string for a regular
 * expression.
 *
 * ```js
 * const picomatch = require('picomatch');
 * const result = picomatch.parse(glob[, options]);
 * ```
 * @param {String} `glob`
 * @param {Object} `options`
 * @return {Object} Returns an object with useful properties and output to be used as a regex source string.
 * @api public
 */


picomatch.parse = (glob, options) => parse_1$1(glob, options);
/**
 * Scan a glob pattern to separate the pattern into segments.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.scan(input[, options]);
 *
 * const result = picomatch.scan('!./foo/*.js');
 * console.log(result);
 * // { prefix: '!./',
 * //   input: '!./foo/*.js',
 * //   base: 'foo',
 * //   glob: '*.js',
 * //   negated: true,
 * //   isGlob: true }
 * ```
 * @param {String} `input` Glob pattern to scan.
 * @param {Object} `options`
 * @return {Object} Returns an object with
 * @api public
 */


picomatch.scan = (input, options) => scan(input, options);
/**
 * Create a regular expression from a glob pattern.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.makeRe(input[, options]);
 *
 * console.log(picomatch.makeRe('*.js'));
 * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
 * ```
 * @param {String} `input` A glob pattern to convert to regex.
 * @param {Object} `options`
 * @return {RegExp} Returns a regex created from the given pattern.
 * @api public
 */


picomatch.makeRe = (input, options, returnOutput = false, returnState = false) => {
  if (!input || typeof input !== 'string') {
    throw new TypeError('Expected a non-empty string');
  }

  let opts = options || {};
  let prepend = opts.contains ? '' : '^';
  let append = opts.contains ? '' : '$';
  let state = {
    negated: false,
    fastpaths: true
  };
  let prefix = '';
  let output;

  if (input.startsWith('./')) {
    input = input.slice(2);
    prefix = state.prefix = './';
  }

  if (opts.fastpaths !== false && (input[0] === '.' || input[0] === '*')) {
    output = parse_1$1.fastpaths(input, options);
  }

  if (output === void 0) {
    state = picomatch.parse(input, options);
    state.prefix = prefix + (state.prefix || '');
    output = state.output;
  }

  if (returnOutput === true) {
    return output;
  }

  let source = `${prepend}(?:${output})${append}`;

  if (state && state.negated === true) {
    source = `^(?!${source}).*$`;
  }

  let regex = picomatch.toRegex(source, options);

  if (returnState === true) {
    regex.state = state;
  }

  return regex;
};
/**
 * Create a regular expression from the given regex source string.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.toRegex(source[, options]);
 *
 * const { output } = picomatch.parse('*.js');
 * console.log(picomatch.toRegex(output));
 * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
 * ```
 * @param {String} `source` Regular expression source string.
 * @param {Object} `options`
 * @return {RegExp}
 * @api public
 */


picomatch.toRegex = (source, options) => {
  try {
    let opts = options || {};
    return new RegExp(source, opts.flags || (opts.nocase ? 'i' : ''));
  } catch (err) {
    if (options && options.debug === true) throw err;
    return /$^/;
  }
};
/**
 * Picomatch constants.
 * @return {Object}
 */


picomatch.constants = constants$1;
/**
 * Expose "picomatch"
 */

var picomatch_1 = picomatch;
var picomatch$1 = picomatch_1;

const isEmptyString = val => typeof val === 'string' && (val === '' || val === './');
/**
 * Returns an array of strings that match one or more glob patterns.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm(list, patterns[, options]);
 *
 * console.log(mm(['a.js', 'a.txt'], ['*.js']));
 * //=> [ 'a.js' ]
 * ```
 * @param {String|Array<string>} list List of strings to match.
 * @param {String|Array<string>} patterns One or more glob patterns to use for matching.
 * @param {Object} options See available [options](#options)
 * @return {Array} Returns an array of matches
 * @summary false
 * @api public
 */


const micromatch = (list, patterns, options) => {
  patterns = [].concat(patterns);
  list = [].concat(list);
  let omit = new Set();
  let keep = new Set();
  let items = new Set();
  let negatives = 0;

  let onResult = state => {
    items.add(state.output);

    if (options && options.onResult) {
      options.onResult(state);
    }
  };

  for (let i = 0; i < patterns.length; i++) {
    let isMatch = picomatch$1(String(patterns[i]), Object.assign({}, options, {
      onResult
    }), true);
    let negated = isMatch.state.negated || isMatch.state.negatedExtglob;
    if (negated) negatives++;

    for (let item of list) {
      let matched = isMatch(item, true);
      let match = negated ? !matched.isMatch : matched.isMatch;
      if (!match) continue;

      if (negated) {
        omit.add(matched.output);
      } else {
        omit.delete(matched.output);
        keep.add(matched.output);
      }
    }
  }

  let result = negatives === patterns.length ? [...items] : [...keep];
  let matches = result.filter(item => !omit.has(item));

  if (options && matches.length === 0) {
    if (options.failglob === true) {
      throw new Error(`No matches found for "${patterns.join(', ')}"`);
    }

    if (options.nonull === true || options.nullglob === true) {
      return options.unescape ? patterns.map(p => p.replace(/\\/g, '')) : patterns;
    }
  }

  return matches;
};
/**
 * Backwards compatibility
 */


micromatch.match = micromatch;
/**
 * Returns a matcher function from the given glob `pattern` and `options`.
 * The returned function takes a string to match as its only argument and returns
 * true if the string is a match.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.matcher(pattern[, options]);
 *
 * const isMatch = mm.matcher('*.!(*a)');
 * console.log(isMatch('a.a')); //=> false
 * console.log(isMatch('a.b')); //=> true
 * ```
 * @param {String} `pattern` Glob pattern
 * @param {Object} `options`
 * @return {Function} Returns a matcher function.
 * @api public
 */

micromatch.matcher = (pattern, options) => picomatch$1(pattern, options);
/**
 * Returns true if **any** of the given glob `patterns` match the specified `string`.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.isMatch(string, patterns[, options]);
 *
 * console.log(mm.isMatch('a.a', ['b.*', '*.a'])); //=> true
 * console.log(mm.isMatch('a.a', 'b.*')); //=> false
 * ```
 * @param {String} str The string to test.
 * @param {String|Array} patterns One or more glob patterns to use for matching.
 * @param {Object} [options] See available [options](#options).
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */


micromatch.isMatch = (str, patterns, options) => picomatch$1(patterns, options)(str);
/**
 * Backwards compatibility
 */


micromatch.any = micromatch.isMatch;
/**
 * Returns a list of strings that _**do not match any**_ of the given `patterns`.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.not(list, patterns[, options]);
 *
 * console.log(mm.not(['a.a', 'b.b', 'c.c'], '*.a'));
 * //=> ['b.b', 'c.c']
 * ```
 * @param {Array} `list` Array of strings to match.
 * @param {String|Array} `patterns` One or more glob pattern to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Array} Returns an array of strings that **do not match** the given patterns.
 * @api public
 */

micromatch.not = (list, patterns, options = {}) => {
  patterns = [].concat(patterns).map(String);
  let result = new Set();
  let items = [];

  let onResult = state => {
    if (options.onResult) options.onResult(state);
    items.push(state.output);
  };

  let matches = micromatch(list, patterns, Object.assign({}, options, {
    onResult
  }));

  for (let item of items) {
    if (!matches.includes(item)) {
      result.add(item);
    }
  }

  return [...result];
};
/**
 * Returns true if the given `string` contains the given pattern. Similar
 * to [.isMatch](#isMatch) but the pattern can match any part of the string.
 *
 * ```js
 * var mm = require('micromatch');
 * // mm.contains(string, pattern[, options]);
 *
 * console.log(mm.contains('aa/bb/cc', '*b'));
 * //=> true
 * console.log(mm.contains('aa/bb/cc', '*d'));
 * //=> false
 * ```
 * @param {String} `str` The string to match.
 * @param {String|Array} `patterns` Glob pattern to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if the patter matches any part of `str`.
 * @api public
 */


micromatch.contains = (str, pattern, options) => {
  if (typeof str !== 'string') {
    throw new TypeError(`Expected a string: "${util__default["default"].inspect(str)}"`);
  }

  if (Array.isArray(pattern)) {
    return pattern.some(p => micromatch.contains(str, p, options));
  }

  if (typeof pattern === 'string') {
    if (isEmptyString(str) || isEmptyString(pattern)) {
      return false;
    }

    if (str.includes(pattern) || str.startsWith('./') && str.slice(2).includes(pattern)) {
      return true;
    }
  }

  return micromatch.isMatch(str, pattern, Object.assign({}, options, {
    contains: true
  }));
};
/**
 * Filter the keys of the given object with the given `glob` pattern
 * and `options`. Does not attempt to match nested keys. If you need this feature,
 * use [glob-object][] instead.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.matchKeys(object, patterns[, options]);
 *
 * const obj = { aa: 'a', ab: 'b', ac: 'c' };
 * console.log(mm.matchKeys(obj, '*b'));
 * //=> { ab: 'b' }
 * ```
 * @param {Object} `object` The object with keys to filter.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Object} Returns an object with only keys that match the given patterns.
 * @api public
 */


micromatch.matchKeys = (obj, patterns, options) => {
  if (!utils$1.isObject(obj)) {
    throw new TypeError('Expected the first argument to be an object');
  }

  let keys = micromatch(Object.keys(obj), patterns, options);
  let res = {};

  for (let key of keys) res[key] = obj[key];

  return res;
};
/**
 * Returns true if some of the strings in the given `list` match any of the given glob `patterns`.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.some(list, patterns[, options]);
 *
 * console.log(mm.some(['foo.js', 'bar.js'], ['*.js', '!foo.js']));
 * // true
 * console.log(mm.some(['foo.js'], ['*.js', '!foo.js']));
 * // false
 * ```
 * @param {String|Array} `list` The string or array of strings to test. Returns as soon as the first match is found.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */


micromatch.some = (list, patterns, options) => {
  let items = [].concat(list);

  for (let pattern of [].concat(patterns)) {
    let isMatch = picomatch$1(String(pattern), options);

    if (items.some(item => isMatch(item))) {
      return true;
    }
  }

  return false;
};
/**
 * Returns true if every string in the given `list` matches
 * any of the given glob `patterns`.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.every(list, patterns[, options]);
 *
 * console.log(mm.every('foo.js', ['foo.js']));
 * // true
 * console.log(mm.every(['foo.js', 'bar.js'], ['*.js']));
 * // true
 * console.log(mm.every(['foo.js', 'bar.js'], ['*.js', '!foo.js']));
 * // false
 * console.log(mm.every(['foo.js'], ['*.js', '!foo.js']));
 * // false
 * ```
 * @param {String|Array} `list` The string or array of strings to test.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */


micromatch.every = (list, patterns, options) => {
  let items = [].concat(list);

  for (let pattern of [].concat(patterns)) {
    let isMatch = picomatch$1(String(pattern), options);

    if (!items.every(item => isMatch(item))) {
      return false;
    }
  }

  return true;
};
/**
 * Returns true if **all** of the given `patterns` match
 * the specified string.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.all(string, patterns[, options]);
 *
 * console.log(mm.all('foo.js', ['foo.js']));
 * // true
 *
 * console.log(mm.all('foo.js', ['*.js', '!foo.js']));
 * // false
 *
 * console.log(mm.all('foo.js', ['*.js', 'foo.js']));
 * // true
 *
 * console.log(mm.all('foo.js', ['*.js', 'f*', '*o*', '*o.js']));
 * // true
 * ```
 * @param {String|Array} `str` The string to test.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */


micromatch.all = (str, patterns, options) => {
  if (typeof str !== 'string') {
    throw new TypeError(`Expected a string: "${util__default["default"].inspect(str)}"`);
  }

  return [].concat(patterns).every(p => picomatch$1(p, options)(str));
};
/**
 * Returns an array of matches captured by `pattern` in `string, or `null` if the pattern did not match.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.capture(pattern, string[, options]);
 *
 * console.log(mm.capture('test/*.js', 'test/foo.js'));
 * //=> ['foo']
 * console.log(mm.capture('test/*.js', 'foo/bar.css'));
 * //=> null
 * ```
 * @param {String} `glob` Glob pattern to use for matching.
 * @param {String} `input` String to match
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns an array of captures if the input matches the glob pattern, otherwise `null`.
 * @api public
 */


micromatch.capture = (glob, input, options) => {
  let posix = utils$1.isWindows(options);
  let regex = picomatch$1.makeRe(String(glob), Object.assign({}, options, {
    capture: true
  }));
  let match = regex.exec(posix ? utils$1.toPosixSlashes(input) : input);

  if (match) {
    return match.slice(1).map(v => v === void 0 ? '' : v);
  }
};
/**
 * Create a regular expression from the given glob `pattern`.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.makeRe(pattern[, options]);
 *
 * console.log(mm.makeRe('*.js'));
 * //=> /^(?:(\.[\\\/])?(?!\.)(?=.)[^\/]*?\.js)$/
 * ```
 * @param {String} `pattern` A glob pattern to convert to regex.
 * @param {Object} `options`
 * @return {RegExp} Returns a regex created from the given pattern.
 * @api public
 */


micromatch.makeRe = (...args) => picomatch$1.makeRe(...args);
/**
 * Scan a glob pattern to separate the pattern into segments. Used
 * by the [split](#split) method.
 *
 * ```js
 * const mm = require('micromatch');
 * const state = mm.scan(pattern[, options]);
 * ```
 * @param {String} `pattern`
 * @param {Object} `options`
 * @return {Object} Returns an object with
 * @api public
 */


micromatch.scan = (...args) => picomatch$1.scan(...args);
/**
 * Parse a glob pattern to create the source string for a regular
 * expression.
 *
 * ```js
 * const mm = require('micromatch');
 * const state = mm(pattern[, options]);
 * ```
 * @param {String} `glob`
 * @param {Object} `options`
 * @return {Object} Returns an object with useful properties and output to be used as regex source string.
 * @api public
 */


micromatch.parse = (patterns, options) => {
  let res = [];

  for (let pattern of [].concat(patterns || [])) {
    for (let str of braces_1(String(pattern), options)) {
      res.push(picomatch$1.parse(str, options));
    }
  }

  return res;
};
/**
 * Process the given brace `pattern`.
 *
 * ```js
 * const { braces } = require('micromatch');
 * console.log(braces('foo/{a,b,c}/bar'));
 * //=> [ 'foo/(a|b|c)/bar' ]
 *
 * console.log(braces('foo/{a,b,c}/bar', { expand: true }));
 * //=> [ 'foo/a/bar', 'foo/b/bar', 'foo/c/bar' ]
 * ```
 * @param {String} `pattern` String with brace pattern to process.
 * @param {Object} `options` Any [options](#options) to change how expansion is performed. See the [braces][] library for all available options.
 * @return {Array}
 * @api public
 */


micromatch.braces = (pattern, options) => {
  if (typeof pattern !== 'string') throw new TypeError('Expected a string');

  if (options && options.nobrace === true || !/\{.*\}/.test(pattern)) {
    return [pattern];
  }

  return braces_1(pattern, options);
};
/**
 * Expand braces
 */


micromatch.braceExpand = (pattern, options) => {
  if (typeof pattern !== 'string') throw new TypeError('Expected a string');
  return micromatch.braces(pattern, Object.assign({}, options, {
    expand: true
  }));
};
/**
 * Expose micromatch
 */


var micromatch_1 = micromatch;

function ensureArray(thing) {
  if (Array.isArray(thing)) return thing;
  if (thing == undefined) return [];
  return [thing];
}

function getMatcherString(id, resolutionBase) {
  if (resolutionBase === false) {
    return id;
  }

  return path$2.resolve(...(typeof resolutionBase === 'string' ? [resolutionBase, id] : [id]));
}

const createFilter = function createFilter(include, exclude, options) {
  const resolutionBase = options && options.resolve;

  const getMatcher = id => {
    return id instanceof RegExp ? id : {
      test: micromatch_1.matcher(getMatcherString(id, resolutionBase).split(path$2.sep).join('/'), {
        dot: true
      })
    };
  };

  const includeMatchers = ensureArray(include).map(getMatcher);
  const excludeMatchers = ensureArray(exclude).map(getMatcher);
  return function (id) {
    if (typeof id !== 'string') return false;
    if (/\0/.test(id)) return false;
    id = id.split(path$2.sep).join('/');

    for (let i = 0; i < excludeMatchers.length; ++i) {
      const matcher = excludeMatchers[i];
      if (matcher.test(id)) return false;
    }

    for (let i = 0; i < includeMatchers.length; ++i) {
      const matcher = includeMatchers[i];
      if (matcher.test(id)) return true;
    }

    return !includeMatchers.length;
  };
};

const reservedWords = 'break case class catch const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield enum await implements package protected static interface private public';
const builtins = 'arguments Infinity NaN undefined null true false eval uneval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Symbol Error EvalError InternalError RangeError ReferenceError SyntaxError TypeError URIError Number Math Date String RegExp Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array Map Set WeakMap WeakSet SIMD ArrayBuffer DataView JSON Promise Generator GeneratorFunction Reflect Proxy Intl';
const forbiddenIdentifiers = new Set(`${reservedWords} ${builtins}`.split(' '));
forbiddenIdentifiers.add('');

function scss(options = {}) {
  const filter = createFilter(options.include || ['/**/*.css', '/**/*.scss', '/**/*.sass'], options.exclude);
  let dest = typeof options.output === 'string' ? options.output : null;
  const insertStyleFnName = '___$insertStylesToHeader';
  const styles = {};
  const prefix = options.prefix ? options.prefix + '\n' : '';
  let includePaths = options.includePaths || ['node_modules/'];
  includePaths.push(process.cwd());

  const compileToCSS = async function (scss) {
    // Compile SASS to CSS
    if (scss.length) {
      includePaths = includePaths.filter((v, i, a) => a.indexOf(v) === i);

      try {
        const sass = options.sass || loadSassLibrary();
        const render = sass.renderSync(Object.assign({
          data: prefix + scss,
          outFile: dest,
          includePaths,
          importer: (url, prev, done) => {
            /* If a path begins with `.`, then it's a local import and this
             * importer cannot handle it. This check covers both `.` and
             * `..`.
             *
             * Additionally, if an import path begins with `url` or `http`,
             * then it's a remote import, this importer also cannot handle
             * that. */
            if (url.startsWith('.') || url.startsWith('url') || url.startsWith('http')) {
              /* The importer returns `null` to defer processing the import
               * back to the sass compiler. */
              return null;
            }
            /* If the requested path begins with a `~`, we remove it. This
             * character is used by webpack-contrib's sass-loader to
             * indicate the import is from the node_modules folder. Since
             * this is so standard in the JS world, the importer supports
             * it, by removing it and ignoring it. */


            const cleanUrl = url.startsWith('~') ? url.replace('~', '') : url;
            /* Now, the importer uses `require.resolve()` to attempt
             * to resolve the path to the requested file. In the case
             * of a standard node_modules project, this will use Node's
             * `require.resolve()`. In the case of a Plug 'n Play project,
             * this will use the `require.resolve()` provided by the
             * package manager.
             *
             * This statement is surrounded by a try/catch block because
             * if Node or the package manager cannot resolve the requested
             * file, they will throw an error, so the importer needs to
             * defer to sass, by returning `null`.
             *
             * The paths property tells `require.resolve()` where to begin
             * resolution (i.e. who is requesting the file). */

            try {
              const resolved = require.resolve(cleanUrl, {
                paths: [prefix + scss]
              });
              /* Since `require.resolve()` will throw an error if a file
               * doesn't exist. It's safe to assume the file exists and
               * pass it off to the sass compiler. */


              return {
                file: resolved
              };
            } catch (e) {
              /* Just because `require.resolve()` couldn't find the file
               * doesn't mean it doesn't exist. It may still be a local
               * import that just doesn't list a relative path, so defer
               * processing back to sass by returning `null` */
              return null;
            }
          }
        }, options));
        const css = render.css.toString();
        const map = render.map ? render.map.toString() : ''; // Possibly process CSS (e.g. by PostCSS)

        if (typeof options.processor === 'function') {
          const result = await options.processor(css, map, styles); // TODO: figure out how to check for
          // @ts-ignore

          const postcss = result; // PostCSS support

          if (typeof postcss.process === 'function') {
            return Promise.resolve(postcss.process(css, {
              from: undefined,
              to: dest,
              map: map ? {
                prev: map,
                inline: false
              } : null
            }));
          } // @ts-ignore


          const output = result;
          return stringToCSS(output);
        }

        return {
          css,
          map
        };
      } catch (e) {
        if (options.failOnError) {
          throw e;
        }

        console.log();
        console.log(red('Error:\n\t' + e.message));

        if (e.message.includes('Invalid CSS')) {
          console.log(green('Solution:\n\t' + 'fix your Sass code'));
          console.log('Line:   ' + e.line);
          console.log('Column: ' + e.column);
        }

        if (e.message.includes('sass') && e.message.includes('find module')) {
          console.log(green('Solution:\n\t' + 'npm install --save-dev sass'));
        }

        if (e.message.includes('node-sass') && e.message.includes('bindings')) {
          console.log(green('Solution:\n\t' + 'npm rebuild node-sass --force'));
        }

        console.log();
      }
    }

    return {
      css: '',
      map: ''
    };
  };

  return {
    name: 'scss',

    intro() {
      return options.insert === true ? insertStyleFn.replace(/insertStyleFn/, insertStyleFnName) : '';
    },

    async transform(code, id) {
      if (!filter(id)) {
        return;
      } // Add the include path before doing any processing


      includePaths.push(path$2.dirname(id)); // Rebuild all scss files if anything happens to this folder
      // TODO: check if it's possible to get a list of all dependent scss files
      //       and only watch those

      if (options.watch) {
        const files = Array.isArray(options.watch) ? options.watch : [options.watch];
        files.forEach(file => this.addWatchFile(file));
      }

      if (options.insert === true) {
        // When the 'insert' is enabled, the stylesheet will be inserted into <head/> tag.
        const {
          css,
          map
        } = await compileToCSS(code);
        return {
          code: 'export default ' + insertStyleFnName + '(' + JSON.stringify(css) + ')',
          map: {
            mappings: ''
          }
        };
      } else if (options.output === false) {
        // When output is disabled, the stylesheet is exported as a string
        const {
          css,
          map
        } = await compileToCSS(code);
        return {
          code: 'export default ' + JSON.stringify(css),
          map: {
            mappings: ''
          }
        };
      } // Map of every stylesheet


      styles[id] = code;
      return '';
    },

    async generateBundle(opts) {
      // No stylesheet needed
      if (options.output === false || options.insert === true) {
        return;
      } // Combine all stylesheets


      let scss = '';

      for (const id in styles) {
        scss += styles[id] || '';
      }

      if (typeof dest !== 'string') {
        // Guess destination filename
        dest = opts.file || 'bundle.js';

        if (dest.endsWith('.js')) {
          dest = dest.slice(0, -3);
        }

        dest = dest + '.css';
      }

      const compiled = await compileToCSS(scss);

      if (typeof compiled !== 'object' || typeof compiled.css !== 'string') {
        return;
      } // Emit styles through callback


      if (typeof options.output === 'function') {
        options.output(compiled.css, styles);
        return;
      } // Don't create unwanted empty stylesheets


      if (!compiled.css.length) {
        return;
      } // Ensure that dest parent folders exist (create the missing ones)


      ensureParentDirsSync(path$2.dirname(dest)); // Emit styles to file

      fs$2.writeFile(dest, compiled.css, err => {
        if (options.verbose !== false) {
          if (err) {
            console.error(red(err.toString()));
          } else if (compiled.css) {
            console.log(green(dest || '?'), getSize(compiled.css.length));
          }
        }
      });

      if (options.sourceMap && compiled.map) {
        let sourcemap = compiled.map;

        if (typeof compiled.map.toString === 'function') {
          sourcemap = compiled.map.toString();
        }

        fs$2.writeFile(dest + '.map', sourcemap, err => {
          if (options.verbose !== false && err) {
            console.error(red(err.toString()));
          }
        });
      }
    }

  };
}
/**
 * Create a style tag and append to head tag
 *
 * @param {String} css style
 * @return {String} css style
 */


const insertStyleFn = `function insertStyleFn(css) {
  if (!css) {
    return
  }
  if (typeof window === 'undefined') {
    return
  }

  const style = document.createElement('style');

  style.setAttribute('type', 'text/css');
  style.innerHTML = css;
  document.head.appendChild(style);
  return css
}`;

function loadSassLibrary() {
  try {
    return require('sass');
  } catch (e) {
    return require('node-sass');
  }
}

function stringToCSS(input) {
  if (typeof input === 'string') {
    return {
      css: input,
      map: ''
    };
  }

  return input;
}

function red(text) {
  return '\x1b[1m\x1b[31m' + text + '\x1b[0m';
}

function green(text) {
  return '\x1b[1m\x1b[32m' + text + '\x1b[0m';
}

function getSize(bytes) {
  return bytes < 10000 ? bytes.toFixed(0) + ' B' : bytes < 1024000 ? (bytes / 1024).toPrecision(3) + ' kB' : (bytes / 1024 / 1024).toPrecision(4) + ' MB';
}

function ensureParentDirsSync(dir) {
  if (fs$2.existsSync(dir)) {
    return;
  }

  try {
    fs$2.mkdirSync(dir);
  } catch (err) {
    if (err.code === 'ENOENT') {
      ensureParentDirsSync(path$2.dirname(dir));
      ensureParentDirsSync(dir);
    }
  }
}

const common = {
  author: "Inappstory",
  maintainers: [{
    name: "Inappstory",
    email: "dev@inappstory.com"
  }],
  sideEffects: false,
  license: "MIT",
  devDependencies: {},
  scripts: {},
  repository: "https://github.com/inappstory/react-native-ias",
  bugs: "https://github.com/inappstory/react-native-ias/issues",
  homepage: "https://inappstory.com",
  engines: {
    node: ">=11.0.0"
  },
  publishConfig: {
    access: "public"
  },
  funding: []
};
const keywords = ["stories", "stories SDK", "InAppStory"];
const version = {
  "ias-react": "2.2.0",
  "react-native-ias": "0.3.15",
  "effector": "22.1.2",
  "effector-react": "22.0.6",
  "effector-vue": "22.0.2",
  "forest": "0.20.2"
};

const issueUrl = tag => `https://github.com/effector/effector/issues?q=is:issue+label:${tag}`;

const compiledFile = name => [`${name}.js`, `${name}.js.map`];

const esmFile = name => [`${name}.mjs`, `${name}.mjs.map`];

const getFiles = name => ["README.md", "LICENSE", "index.d.ts", "index.js.flow", //js files
...esmFile(name), ...compiledFile(`${name}.cjs`), ...compiledFile(`${name}.umd`), ...compiledFile("compat"), //flow typings
`${name}.cjs.js.flow`, // `${name}.es.js.flow`,
`${name}.umd.js.flow`, "compat.js.flow", //ts typings
`${name}.cjs.d.ts`, `${name}.mjs.d.ts`, `${name}.umd.d.ts`, "compat.d.ts"];

const dependsOnEffector = {
  effector: `^${version.effector}`
};
var packages = {
  "ias-react": {
    "name": "ias-react",
    "version": version["ias-react"],
    "description": "IAS SDK for react",
    // main: 'ias-react.cjs.js',
    "main": "ias-react.mjs",
    "module": "ias-react.mjs",
    "umd:main": "ias-react.umd.js",
    "jsnext:main": "ias-react.mjs",
    "typings": "index.d.ts",
    "dependencies": { ...dependsOnEffector
    },
    "peerDependencies": {
      react: ">=16.13.1"
    },
    "exports": {
      ".": {
        import: "./ias-react.mjs",
        require: "./ias-react.cjs.js",
        default: "./ias-react.mjs"
      },
      "./ias-react.mjs": "./ias-react.mjs",
      "./fork": {
        import: "./fork.mjs",
        require: "./fork.js",
        default: "./fork.mjs"
      },
      "./compat": "./compat.js",
      "./ias-react.umd": "./ias-react.umd.js",
      "./babel-plugin": "./babel-plugin.js",
      "./babel-plugin-react": "./babel-plugin-react.js",
      "./package.json": "./package.json"
    },
    "files": [...getFiles("ias-react"), // ...compiledFile('fork'),
    // ...esmFile('fork'),
    "fork.d.ts", "babel-plugin.js", "babel-plugin-react.js"],
    keywords,
    ...common
  },
  "react-native-ias": {
    name: "react-native-ias",
    version: version["react-native-ias"],
    description: "IAS SDK for react native",
    main: "react-native-ias.cjs.js",
    module: "react-native-ias.mjs",
    // 'umd:main': 'ias-rn.umd.js',
    // 'jsnext:main': 'ias-rn.js',
    types: "index.d.ts",
    dependencies: {
      // for install script only
      // npm postinstall run before devDep ?
      "css-font-parser": "^2.0.0",
      "parse-css-sides": "^3.0.1",
      ...dependsOnEffector // "react-native-webview": "^11.6.2",
      // "react-native-get-random-values": "^1.7.2",
      // "react-native-device-info": "^8.4.8",
      // "@react-native-async-storage/async-storage": "^1.15.14",
      //   "react-native-share": "^7.3.9",

    },
    // nativeDependencies: [
    //   "react-native-webview",
    //   "react-native-get-random-values",
    //   "react-native-device-info",
    //   "@react-native-async-storage/async-storage",
    //   "react-native-share",
    // ],
    peerDependencies: {
      "react": "*",
      "react-native": "*",
      "react-native-webview": ">=11.0.0",
      "react-native-get-random-values": ">=1.0.0",
      "react-native-device-info": ">=9.0.0",
      "@react-native-async-storage/async-storage": ">=1.0.0",
      "react-native-share": ">=7.0.0",
      "rn-android-keyboard-adjust": ">=2.1.2"
    },
    exports: {
      ".": {
        import: "./react-native-ias.mjs",
        require: "./react-native-ias.cjs.js",
        default: "./react-native-ias.mjs"
      },
      "./react-native-ias.mjs": "./react-native-ias.mjs",
      "./package.json": "./package.json",
      "./index.d.ts": "./index.d.ts"
    },
    files: [// все что должно уйти в пакет !!!!!
    ...getFiles("react-native-ias"), "StoriesListClient.js", "StoriesListClient.css.js", "StoryReaderClient.js", "StoryReaderClient.css.js", "StoryFavoriteReaderClient.js", "StoryFavoriteReaderClient.css.js", // "scripts",
    "index.d.ts", "types" // ...compiledFile('fork'),
    // ...esmFile('fork'),
    // 'fork.d.ts',
    // 'babel-plugin.js',
    // 'babel-plugin-react.js',
    ],
    keywords,
    ...common,
    // scripts: {
    //   "postinstall": "node ./scripts/add-native-deps",
    // },
    devDependencies: {// "fs-extra": "^9.1.0",
      // "os": "^0.1.2",
    }
  },
  "effector": {
    "name": "effector",
    "version": version["effector"],
    "description": "The state manager",
    "main": "effector.cjs.js",
    "module": "effector.mjs",
    "umd:main": "effector.umd.js",
    "jsnext:main": "effector.mjs",
    "typings": "index.d.ts",
    "dependencies": {},
    "exports": {
      ".": {
        import: "./effector.mjs",
        require: "./effector.cjs.js",
        default: "./effector.mjs"
      },
      "./effector.mjs": "./effector.mjs",
      "./fork": {
        import: "./fork.mjs",
        require: "./fork.js",
        default: "./fork.mjs"
      },
      "./compat": "./compat.js",
      "./effector.umd": "./effector.umd.js",
      "./babel-plugin": "./babel-plugin.js",
      "./babel-plugin-react": "./babel-plugin-react.js",
      "./package.json": "./package.json"
    },
    "files": [...getFiles("effector"), ...compiledFile("fork"), ...esmFile("fork"), "fork.d.ts", "babel-plugin.js", "babel-plugin-react.js"],
    keywords,
    ...common
  },
  "effector-react": {
    "name": "effector-react",
    "version": version["effector-react"],
    "description": "React bindings for effector",
    "main": "effector-react.cjs.js",
    "module": "effector-react.mjs",
    "exports": {
      ".": {
        import: "./effector-react.mjs",
        require: "./effector-react.cjs.js",
        default: "./effector-react.mjs"
      },
      "./package.json": "./package.json",
      "./effector-react.mjs": "./effector-react.mjs",
      "./scope.mjs": "./scope.mjs",
      "./scope": {
        import: "./scope.mjs",
        require: "./scope.js",
        default: "./scope.mjs"
      },
      "./ssr": {
        import: "./ssr.mjs",
        require: "./ssr.js",
        default: "./ssr.mjs"
      },
      "./compat": "./compat.js",
      "./effector-react.umd": "./effector-react.umd.js"
    },
    "umd:main": "effector-react.umd.js",
    "jsnext:main": "effector-react.mjs",
    "typings": "index.d.ts",
    "peerDependencies": {
      react: ">=16.8.0 <19.0.0",
      effector: "^22.0.2"
    },
    "files": [...getFiles("effector-react"), ...compiledFile("scope"), ...esmFile("scope"), ...compiledFile("ssr"), ...esmFile("ssr"), "scope.d.ts", "ssr.d.ts"],
    "keywords": ["react", "hooks", ...keywords],
    ...common,
    "bugs": issueUrl("effector-react,effector-react%2Fscope")
  },
  "effector-vue": {
    "name": "effector-vue",
    "version": version["effector-vue"],
    "description": "Vue bindings for effector",
    "main": "effector-vue.cjs.js",
    "module": "effector-vue.mjs",
    "exports": {
      ".": {
        import: "./effector-vue.mjs",
        require: "./effector-vue.cjs.js",
        default: "./effector-vue.mjs"
      },
      "./composition": {
        import: "./composition.mjs",
        require: "./composition.cjs.js",
        default: "./composition.mjs"
      },
      "./effector-vue.mjs": "./effector-vue.mjs",
      "./composition.mjs": "./composition.mjs",
      "./compat": "./compat.js",
      "./effector-vue.umd": "./effector-vue.umd.js"
    },
    "umd:main": "effector-vue.umd.js",
    "jsnext:main": "effector-vue.mjs",
    "typings": "index.d.ts",
    "peerDependencies": {
      "vue": "*",
      "effector": "^22.0.2",
      "@vue/reactivity": "^3.0.2",
      "@vue/runtime-core": "^3.0.2"
    },
    "files": [...getFiles("effector-vue"), ...compiledFile("composition.cjs"), ...esmFile("composition"), "composition.d.ts", "composition.mjs.d.ts", "composition.cjs.d.ts"],
    "keywords": ["vue", "composition api", ...keywords],
    ...common,
    "bugs": issueUrl("effector-vue")
  },
  "forest": {
    "name": "forest",
    "version": version["forest"],
    "description": "UI engine for web",
    "main": "forest.cjs.js",
    "module": "forest.mjs",
    "exports": {
      ".": {
        import: "./forest.mjs",
        require: "./forest.cjs.js",
        default: "./forest.mjs"
      },
      "./forest.mjs": "./forest.mjs",
      "./server": {
        import: "./server.mjs",
        require: "./server.js",
        default: "./server.mjs"
      },
      "./forest.umd": "./forest.umd.js"
    },
    "umd:main": "forest.umd.js",
    "jsnext:main": "forest.mjs",
    "typings": "index.d.ts",
    "dependencies": {},
    "peerDependencies": dependsOnEffector,
    "keywords": [...keywords, "dom", "view"],
    ...common,
    "bugs": issueUrl("forest")
  }
};

const fs = require("fs");

require("tar");

const semver = require("semver");

const compatNameCache = {};

const onwarn = (warning, rollupWarn) => {
  if (warning.code !== 'CIRCULAR_DEPENDENCY' && warning.code !== 'NON_EXISTENT_EXPORT') {
    rollupWarn(warning);
  }
};

const compatTarget = {
  browsers: ['Chrome 47', 'last 2 Firefox versions', 'last 2 Safari versions', 'last 2 Edge versions', 'IE 11']
};
const projectRoot = path__default["default"].resolve(__dirname, '..');
const extensions = ['.js', '.mjs', '.ts', '.tsx', '.vue'];
const externals = [// 'effector',
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
'react', 'react-native', 'react-native-webview', 'react-native-get-random-values', 'react-native-device-info', '@react-native-async-storage/async-storage', // rn specific
'../../packages/react-native-ias/StoriesListClient.js', '../../packages/react-native-ias/StoriesListClient.css.js', '../../packages/react-native-ias/StoryReaderClient.js', '../../packages/react-native-ias/StoryReaderClient.css.js', '../../packages/react-native-ias/StoryFavoriteReaderClient.js', '../../packages/react-native-ias/StoryFavoriteReaderClient.css.js'];

const getPlugins = (name, {
  isEsm = false,
  replaceVueReactivity = false,
  replaceVueNext = false
} = {}) => {
  var _packagesConfig$name, _packagesConfig$name2, _packagesConfig$name3;

  return {
    babel: isEsm ? pluginBabel.babel({
      babelHelpers: 'bundled',
      extensions,
      skipPreflightCheck: true,
      // надо чтобы @babel/preset-flow сработал на react-native из node_modules
      exclude: /node_modules.*/,
      // include: [
      //   'node_modules/react-native/**',
      // ],
      babelrc: false,
      ...require("../babel.config").generateConfig({
        isBuild: true,
        isTest: false,
        isCompat: false,
        isEsm: true,
        replaceVueReactivity,
        replaceVueNext
      })
    }) : pluginBabel.babel({
      babelHelpers: 'bundled',
      skipPreflightCheck: true,
      extensions,
      // надо чтобы @babel/preset-flow сработал на react-native из node_modules
      exclude: /node_modules.*/,
      babelrc: false,
      ...require("../babel.config").generateConfig({
        isBuild: true,
        isTest: false,
        isCompat: false,
        isEsm: false,
        replaceVueReactivity,
        replaceVueNext
      })
    }),
    // convert to es6 modules
    commonjs: commonjs__default["default"]({
      extensions // include: [
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
    nodeResolve: resolve__default["default"]({
      extensions,
      preferBuiltins: false
    }),
    sizeSnapshot: rollupPluginSizeSnapshot.sizeSnapshot({
      printInfo: false
    }),
    analyzer: analyze__default["default"]({
      filename: `stats/${name}.html`,
      title: `${name} size report`,
      sourcemap: true,
      template: 'treemap'
    }),
    analyzerJSON: analyze__default["default"]({
      sourcemap: true,
      json: true,
      filename: `stats/${name}.json`
    }),
    terser: rollupPluginTerser.terser(minifyConfig({
      beautify: !!process.env.PRETTIFY,
      inline: !name.endsWith('.umd')
    })),
    graph: plugin({
      output: 'modules.dot',
      exclude: 'effector/package.json'
    }),
    json: json__default["default"]({
      preferConst: true,
      indent: '  '
    }),
    alias: alias__default["default"]({
      // entries: {
      //   // effector: dir('src/effector'),
      // },
      entries: [{
        find: /^~(.*)/,
        replacement: `${path__default["default"].resolve(projectRoot, "/")}$1`
      } // { find:/^\{@}(.*)/, replacement: './$1' },
      ]
    }),
    vue: vuePlugin__default["default"]({
      //@ts-ignore
      needMap: false,
      css: true,
      defaultLang: {
        style: 'scss',
        script: 'js'
      } // template: {
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
    nodePolyfills: index(),
    scss: scss(),
    replace: replace__default["default"]({
      preventAssignment: true,
      values: {
        "process.env.NODE_ENV": JSON.stringify("production"),
        "process.env.API_URL": JSON.stringify("https://api.inappstory.ru"),
        "process.env.API_URL_SANDBOX": JSON.stringify("https://api.test.inappstory.com"),
        "process.env.FAVICON_API_URL": JSON.stringify("https://favicon.inappstory.ru"),
        "process.env.BUILD_VERSION": JSON.stringify(((_packagesConfig$name = packages[name]) === null || _packagesConfig$name === void 0 ? void 0 : _packagesConfig$name.version) || ""),
        "process.env.SDK_VERSION": JSON.stringify(((_packagesConfig$name2 = packages[name]) === null || _packagesConfig$name2 === void 0 ? void 0 : _packagesConfig$name2.version) || ""),
        "process.env.SDK_VERSION_CODE": generateVersionCode(((_packagesConfig$name3 = packages[name]) === null || _packagesConfig$name3 === void 0 ? void 0 : _packagesConfig$name3.version) || "0.0.0")
      }
    })
  };
};

function generateVersionCode(versionName) {
  const version = semver.parse(versionName);
  return version.major * 10000 + version.minor * 100 + version.patch;
}

async function rollupIasReact() {
  const name = 'ias-react';
  await Promise.all([createEsCjs(name, {
    file: {
      cjs: dir(`npm/${name}/${name}.cjs.js`),
      es: dir(`npm/${name}/${name}.mjs`)
    },
    inputExtension: 'ts'
  }), // createSSR({
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
      react: 'React'
    },
    extension: 'ts'
  }), createCompat(name, 'ts'), // widgetClients - common task. We need only UMD (for include as src inside iframe) //
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
    umdName: 'storiesList',
    // export to window.storiesList
    globals: {// react: 'React',
    },
    extension: 'ts' // input file extension

  })]);
}
async function rollupIasReactNative() {
  const name = 'react-native-ias';
  await Promise.all([createEsCjs(name, {
    file: {
      cjs: dir(`npm/${name}/${name}.cjs.js`),
      es: dir(`npm/${name}/${name}.mjs`)
    },
    inputExtension: 'ts' // outputPlugins: [
    //   replace({
    //     preventAssignment: true,
    //     values: {
    //       // "{@}": JSON.stringify("./")
    //       '{@}StoriesListClient.js': './StoriesListClient.js',
    //       'changed': 'replaced'
    //     }
    //   })
    // ]

  }), // createSSR({
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
    umdName: 'storiesList',
    // export to window.storiesList
    globals: {// react: 'React',
    },
    extension: 'ts' // input file extension

  }), createUmd(name, {
    input: "StoryReaderClient",
    // без зависимостей
    // external: [],
    external: externals,
    file: dir(`npm/${name}/StoryReaderClient.umd.js`),
    umdName: 'storyReader',
    // export to window.storiesList
    globals: {// react: 'React',
    },
    extension: 'ts' // input file extension

  }), createUmd(name, {
    input: "StoryFavoriteReaderClient",
    // без зависимостей
    // external: [],
    external: externals,
    file: dir(`npm/${name}/StoryFavoriteReaderClient.umd.js`),
    umdName: 'storyFavoriteReader',
    // export to window.storiesList
    globals: {// react: 'React',
    },
    extension: 'ts' // input file extension

  })]); // src path (.css|.js)
  // dist path - .js

  function moveBundleToScript(src, dist) {
    const bundle = fs.readFileSync(src, "utf8");
    const escaped = JSON.stringify(bundle);
    const js = `export default ${escaped}`;
    fs.writeFileSync(dist, js);
  }

  moveBundleToScript(dir(`npm/${name}/StoriesListClient.umd.js`), dir(`npm/${name}/StoriesListClient.js`));
  moveBundleToScript(dir(`npm/${name}/StoriesListClient.umd.css`), dir(`npm/${name}/StoriesListClient.css.js`));

  try {
    fs.unlink(dir(`npm/${name}/StoriesListClient.umd.js`), () => {});
    fs.unlink(dir(`npm/${name}/StoriesListClient.umd.css`), () => {});
  } catch (e) {// console.error(e);
  }

  moveBundleToScript(dir(`npm/${name}/StoryReaderClient.umd.js`), dir(`npm/${name}/StoryReaderClient.js`));
  moveBundleToScript(dir(`npm/${name}/StoryReaderClient.umd.css`), dir(`npm/${name}/StoryReaderClient.css.js`));

  try {
    fs.unlink(dir(`npm/${name}/StoryReaderClient.umd.js`), () => {});
    fs.unlink(dir(`npm/${name}/StoryReaderClient.umd.css`), () => {});
  } catch (e) {// console.error(e);
  }

  moveBundleToScript(dir(`npm/${name}/StoryFavoriteReaderClient.umd.js`), dir(`npm/${name}/StoryFavoriteReaderClient.js`));
  moveBundleToScript(dir(`npm/${name}/StoryFavoriteReaderClient.umd.css`), dir(`npm/${name}/StoryFavoriteReaderClient.css.js`));

  try {
    fs.unlink(dir(`npm/${name}/StoryFavoriteReaderClient.umd.js`), () => {});
    fs.unlink(dir(`npm/${name}/StoryFavoriteReaderClient.umd.css`), () => {});
  } catch (e) {// console.error(e);
  } // await tar.c(
  //   {
  //     gzip: true,
  //     file: dir(`npm/${name}.tar.gz`),
  //     cwd: dir("npm")
  //   },
  //   [name]
  // );

}

async function createUmd(name, {
  external,
  file,
  umdName,
  globals,
  input = 'index',
  extension = 'js',
  bundleEffector = false
}) {
  const plugins = getPlugins(`${name}.umd`);
  const build = await rollup.rollup({
    onwarn,
    input: dir(`packages/${name}/${input}.${extension}`),
    plugins: [plugins.replace, plugins.nodePolyfills, plugins.vue, plugins.scss, // plugins.postcss,
    plugins.nodeResolve, plugins.json, plugins.babel, bundleEffector && plugins.alias, plugins.commonjs, // вызывает ошибку
    // plugins.sizeSnapshot,
    plugins.terser
    /* TODO tmp disable (source-map detect node via typeof fetch) */
    // plugins.analyzer,
    // plugins.analyzerJSON,
    ].filter(Boolean),
    external
  });
  await build.write({
    file,
    format: 'umd',
    freeze: false,
    name: umdName,
    sourcemap: true,
    globals
  });
}

async function createCompat(name, extension = 'js') {
  const plugins = getPlugins(`${name}.compat`); //$off

  const {
    getAliases
  } = require("../babel.config");

  const terserConfig = minifyConfig({
    beautify: !!process.env.PRETTIFY
  });
  const pluginList = [plugins.replace, plugins.nodeResolve, plugins.vue, plugins.scss, plugins.json, pluginBabel.babel({
    babelHelpers: 'bundled',
    extensions,
    skipPreflightCheck: true,
    exclude: /node_modules.*/,
    babelrc: false,
    presets: [extension === 'js' ? '@babel/preset-flow' : ['@babel/preset-typescript', {
      isTSX: true,
      allExtensions: true
    }], ['@babel/preset-react', {
      useBuiltIns: false
    }], ['@babel/preset-env', {
      loose: true,
      useBuiltIns: 'entry',
      corejs: 3,
      modules: false,
      shippedProposals: true,
      targets: compatTarget
    }]],
    plugins: ['@babel/plugin-proposal-export-namespace-from', '@babel/plugin-proposal-optional-chaining', '@babel/plugin-proposal-nullish-coalescing-operator', ['@babel/plugin-proposal-class-properties', {
      loose: true
    }], ['babel-plugin-module-resolver', {
      alias: getAliases({
        isBuild: true,
        isTest: false,
        isCompat: true,
        isEsm: false
      }),
      loglevel: 'silent'
    }]]
  }), plugins.commonjs, // вызывает ошибку
  // plugins.sizeSnapshot,
  rollupPluginTerser.terser({ ...terserConfig,
    parse: { ...terserConfig.parse,
      ecma: 5
    },
    compress: { ...terserConfig.compress,
      directives: false,
      ecma: 5
    },
    mangle: { ...terserConfig.mangle,
      safari10: true
    },
    output: { ...terserConfig.output,
      ecma: 5,
      safari10: true,
      webkit: true
    },
    ecma: 5,
    nameCache: compatNameCache,
    safari10: true
  })
  /* TODO tmp disable (source-map detect node via typeof fetch) */
  // plugins.analyzer,
  // plugins.analyzerJSON,
  ];
  const build = await rollup.rollup({
    onwarn,
    input: dir(`packages/${name}/index.${extension}`),
    external: externals,
    plugins: pluginList
  });
  await build.write({
    file: dir(`npm/${name}/compat.js`),
    format: 'cjs',
    freeze: false,
    name,
    sourcemap: true,
    sourcemapPathTransform: getSourcemapPathTransform(name),
    externalLiveBindings: false
  });
}

async function createEsCjs(name, {
  file: {
    es,
    cjs
  },
  renderModuleGraph = false,
  input = 'index',
  inputExtension = 'js',
  replaceVueReactivity = false,
  outputPlugins = []
}) {
  const pluginsCjs = getPlugins(input === 'index' ? name : input, {
    replaceVueNext: true
  });
  const pluginListCjs = [pluginsCjs.replace, pluginsCjs.nodePolyfills, pluginsCjs.vue, pluginsCjs.scss, pluginsCjs.nodeResolve, pluginsCjs.json, pluginsCjs.babel, pluginsCjs.alias, pluginsCjs.commonjs, // after babel ts transforms
  // вызывает ошибку
  // pluginsCjs.sizeSnapshot,
  pluginsCjs.terser
  /* TODO tmp disable (source-map detect node via typeof fetch) */
  // pluginsCjs.analyzer,
  // pluginsCjs.analyzerJSON,
  ];
  const pluginsEsm = getPlugins(input === 'index' ? name : input, {
    isEsm: true,
    replaceVueReactivity,
    replaceVueNext: true
  });
  const pluginListEsm = [pluginsEsm.json, pluginsEsm.replace, pluginsEsm.nodePolyfills, pluginsEsm.vue, pluginsEsm.scss, pluginsEsm.nodeResolve, pluginsEsm.babel, pluginsEsm.alias, pluginsEsm.commonjs, // вызывает ошибку
  // pluginsEsm.sizeSnapshot,
  pluginsEsm.terser
  /* TODO tmp disable (source-map detect node via typeof fetch) */
  // pluginsEsm.analyzer,
  // pluginsEsm.analyzerJSON,
  ];

  if (renderModuleGraph) {
    pluginListCjs.push(plugin({
      output: 'modules.dot',
      exclude: 'effector/package.json'
    }));
  }

  const [buildCjs, buildEs] = await Promise.all([rollup.rollup({
    onwarn,
    input: dir(`packages/${name}/${input}.${inputExtension}`),
    external: externals,
    plugins: pluginListCjs
  }), es && rollup.rollup({
    onwarn,
    input: dir(`packages/${name}/${input}.${inputExtension}`),
    external: externals,
    // external: (id, parentId, isResolved) => {
    //   console.log(id, parentId, isResolved);
    //   return false;
    // },
    plugins: pluginListEsm
  })]);
  await Promise.all([buildCjs.write({
    file: cjs,
    format: 'cjs',
    freeze: false,
    name,
    sourcemap: true,
    sourcemapPathTransform: getSourcemapPathTransform(name),
    externalLiveBindings: false,
    plugins: outputPlugins
  }), es && buildEs.write({
    file: es,
    format: 'es',
    freeze: false,
    name,
    sourcemap: true,
    sourcemapPathTransform: getSourcemapPathTransform(name),
    plugins: outputPlugins
  })]);
}

const copyLicense = libName => () => massCopy('.', `npm/${libName}`, ['LICENSE']);
const generatePackageJSON = libName => () => outputPackageJSON(`packages/${libName}/package.json`, packages[libName]);

var iasSdk = {
  "ias-react": [generatePackageJSON("ias-react"), copyLicense("ias-react"), () => massCopy("packages/ias-react", "npm/ias-react", [["index.d.ts", ["index.d.ts", "ias-react.cjs.d.ts", "ias-react.mjs.d.ts", "ias-react.umd.d.ts", "compat.d.ts"]], "README.md", "package.json" // ['scope.d.ts', ['scope.d.ts', 'ssr.d.ts']],
  // [
  //   'index.js.flow',
  //   [
  //     'index.js.flow',
  //     'effector-react.cjs.js.flow',
  //     // 'effector-react.es.js.flow',
  //     'effector-react.umd.js.flow',
  //     'compat.js.flow',
  //   ],
  // ],
  ]), rollupIasReact // publishScript('effector-react'),
  ],
  "react-native-ias": [generatePackageJSON("react-native-ias"), copyLicense("react-native-ias"), () => massCopy("packages/react-native-ias", "npm/react-native-ias", [// [
  //   'index.d.ts',
  //   [
  //     'index.d.ts',
  //     'ias-rn.cjs.d.ts',
  //     'ias-rn.mjs.d.ts',
  //     'ias-rn.umd.d.ts',
  //     'compat.d.ts',
  //   ],
  // ],
  //   '',
  "README.md", "package.json", // 'scripts/add-native-deps.js',
  "types", "index.d.ts" // ['scope.d.ts', ['scope.d.ts', 'ssr.d.ts']],
  // [
  //   'index.js.flow',
  //   [
  //     'index.js.flow',
  //     'effector-react.cjs.js.flow',
  //     // 'effector-react.es.js.flow',
  //     'effector-react.umd.js.flow',
  //     'compat.js.flow',
  //   ],
  // ],
  ]), rollupIasReactNative, // publishScript('effector-react'),
  () => {
    const srcDir = path__default["default"].resolve(__dirname, "../npm/react-native-ias");
    const destDir = path__default["default"].resolve(__dirname, "../../rn-ias-qr/src/react-native-ias");
    fs__default["default"].copySync(srcDir, destDir, {
      overwrite: true,
      recursive: true
    });
  }] // effector: [
  //   generatePackageJSON('effector'),
  //   copyLicense('effector'),
  //   () => massCopy('.', 'npm/effector', ['README.md']),
  //   () =>
  //     massCopy('packages/effector', 'npm/effector', [
  //       [
  //         'index.d.ts',
  //         [
  //           'index.d.ts',
  //           'effector.cjs.d.ts',
  //           'effector.mjs.d.ts',
  //           'effector.umd.d.ts',
  //           'compat.d.ts',
  //         ],
  //       ],
  //       'package.json',
  //       'fork.d.ts',
  //       [
  //         'index.js.flow',
  //         [
  //           'index.js.flow',
  //           'effector.cjs.js.flow',
  //           // 'effector.mjs.flow',
  //           'effector.umd.js.flow',
  //           'compat.js.flow',
  //         ],
  //       ],
  //     ]),
  //   () =>
  //     massCopy('src/babel', 'npm/effector', [
  //       'babel-plugin.js',
  //       'babel-plugin-react.js',
  //     ]),
  //   rollupEffector,
  //   renderModulesGraph,
  //   publishScript('effector'),
  // ],
  // 'effector-react': [
  //   generatePackageJSON('effector-react'),
  //   copyLicense('effector-react'),
  //   () =>
  //     massCopy('packages/effector-react', 'npm/effector-react', [
  //       [
  //         'index.d.ts',
  //         [
  //           'index.d.ts',
  //           'effector-react.cjs.d.ts',
  //           'effector-react.mjs.d.ts',
  //           'effector-react.umd.d.ts',
  //           'compat.d.ts',
  //         ],
  //       ],
  //       'README.md',
  //       'package.json',
  //       ['scope.d.ts', ['scope.d.ts', 'ssr.d.ts']],
  //       [
  //         'index.js.flow',
  //         [
  //           'index.js.flow',
  //           'effector-react.cjs.js.flow',
  //           // 'effector-react.es.js.flow',
  //           'effector-react.umd.js.flow',
  //           'compat.js.flow',
  //         ],
  //       ],
  //     ]),
  //   rollupEffectorReact,
  //   publishScript('effector-react'),
  // ],
  // 'effector-vue': [
  //   generatePackageJSON('effector-vue'),
  //   copyLicense('effector-vue'),
  //   () =>
  //     massCopy('packages/effector-vue', 'npm/effector-vue', [
  //       [
  //         'index.d.ts',
  //         [
  //           'index.d.ts',
  //           'effector-vue.cjs.d.ts',
  //           'effector-vue.mjs.d.ts',
  //           'effector-vue.umd.d.ts',
  //           'compat.d.ts',
  //         ],
  //       ],
  //       [
  //         'composition.d.ts',
  //         ['composition.d.ts', 'composition.cjs.d.ts', 'composition.mjs.d.ts'],
  //       ],
  //       'README.md',
  //       'package.json',
  //       [
  //         'index.js.flow',
  //         [
  //           'index.js.flow',
  //           'effector-vue.cjs.js.flow',
  //           // 'effector-vue.mjs.js.flow',
  //           'effector-vue.umd.js.flow',
  //         ],
  //       ],
  //     ]),
  //   rollupEffectorVue,
  //   publishScript('effector-vue'),
  // ],
  // forest: [
  //   generatePackageJSON('forest'),
  //   copyLicense('forest'),
  //   () =>
  //     Promise.all([
  //       massCopy('packages/forest', 'npm/forest', [
  //         [
  //           'index.d.ts',
  //           [
  //             'index.d.ts',
  //             'forest.cjs.d.ts',
  //             'forest.mjs.d.ts',
  //             'forest.umd.d.ts',
  //           ],
  //         ],
  //         'server.d.ts',
  //       ]),
  //       massCopy('packages/forest', 'npm/forest', [
  //         'README.md',
  //         'package.json',
  //       ]),
  //     ]),
  //   () => rollupEffectorDom({name: 'forest'}),
  //   publishScript('forest'),
  // ],

};
new Viz__default["default"]({
  Module: full_render_js.Module,
  render: full_render_js.render
});

var hooks = {
  beforeAll: [async () => {
    fs__namespace.exists(`${process.cwd()}/npm`, async e => {
      if (e) {
        const ls = await fs__namespace.readdir(`${process.cwd()}/npm`);

        for (const path of ls) {
          // filter repo elements
          const ls = (await fs__namespace.readdir(`${process.cwd()}/npm/${path}`)).filter(el => ![".git", ".gitignore", ".npmrc"].includes(el));

          for (const element of ls) {
            await fs__namespace.rm(`${process.cwd()}/npm/${path}/${element}`, {
              recursive: true
            });
          }
        }
      }
    });
  }, // () => fs.emptyDir(`${process.cwd()}/npm`),
  async () => {
    process.env.IS_BUILD = 'true';
  }, async () => {
    if (cliArgs.current.length < 1) return;
    const argRaw = cliArgs.current[0];
    let body;

    try {
      body = jsYaml.load(argRaw);
    } catch {
      return;
    }

    if (typeof body !== 'object' || body === null) return;
    cliArgs.current.splice(0, 1);

    for (const field in body) {
      //$todo
      setConfig(field, body[field]);
    }
  }]
};

var tasks = {
  tasks: iasSdk,
  hooks
};

const exec = () => taskList(tasks);

exports.exec = exec;