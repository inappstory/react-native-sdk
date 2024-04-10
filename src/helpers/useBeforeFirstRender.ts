import {useRef} from "react";

export const useBeforeFirstRender = (effect: () => void) => {
    const willMount = useRef(true);

    if (willMount.current) {
        effect();
        willMount.current = false;
    }
};