import React from "react";
import { RouterContext } from "./context"

export function Link(props: Dict) {

    const { to, onClick, timeout, children } = props;

    // Extract route from RouterContext
    const { route, toRoute } = React.useContext(RouterContext);

    const handleClick = (e: any) => {

        e.preventDefault();

        // Dont' navigate if current path
        if (route.path === to) {
            return;
        }

        // Trigger onClick prop manually
        if (onClick) {
            onClick(e);
        }

        if (timeout) {
            setTimeout(() => toRoute(to), timeout);
        } else {
            toRoute(to);
        }

    };

    return (
        <a {...props} onClick={handleClick}>
            {children}
        </a>
    );

}
