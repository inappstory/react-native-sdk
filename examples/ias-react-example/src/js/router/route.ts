import React from "react";
import { RouterContext } from "./context"

export function Route({ path, children }: {path: string, children: any}) {

    // Extract route from RouterContext
    const { route } = React.useContext(RouterContext);

    // Return null if the supplied path doesn't match the current route path
    if (route.path !== path) {
        return null;
    }

    return children;

}
