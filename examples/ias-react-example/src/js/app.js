// https://github.com/zloirock/core-js
import "core-js/features/object/from-entries";

import "regenerator-runtime/runtime.js";

import ReactDOM from "react-dom";

import React, {useRef} from "react";
import {createStore, combine, createEvent, createApi} from 'effector'

const uuid = require('uuid');
import {Router, Route} from "./router";
import {routes} from "./routes";
import {NotFound} from "./activity/404";
import MainActivity from "./activity/MainActivity";


function App() {


    return (

        <Router routes={routes} NotFound={NotFound} defaultPath={routes.main.path}>
            <Route path={routes.main.path}>
                <MainActivity/>
            </Route>
        </Router>
    );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App/>, rootElement);
