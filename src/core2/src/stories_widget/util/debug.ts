import {isProduction} from "~/src/stories_widget/util/env";

let debug: Function;
if (!isProduction) {
    debug = console.log.bind(window.console);
} else {
    debug = function () {}
}

// debug = console.log.bind(window.console)

export {debug};
