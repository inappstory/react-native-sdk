export type InputModalConfig = {
    "configV2": {
        "factor": number,
        "main": {
            "background": {
                "color": string
            },
            "padding": {
                "top": number,
                "right": number,
                "bottom": number,
                "left": number,
            },
            "border": {
                "visible": boolean,
                "width": number,
                "radius": number,
                "color": number,
            },
            "question": {
                "padding": {
                    "top": number,
                    "right": number,
                    "bottom": number,
                    "left": number,
                },
                "text": {
                    "size": number,
                    "lineHeight": number,
                    "align": string,
                    "color": string
                    "value": string,
                    "type": string,
                    "family": string,
                    "weight": string,
                    "style": string
                }
            },
            "input": {
                "background": {
                    "color": string,
                },
                "border": {
                    "width": number,
                    "radius": number,
                    "color": string,
                },
                "padding": {
                    "top": number,
                    "right": number,
                    "bottom": number,
                    "left": number,
                },
                "text": {
                    "size": number,
                    "lineHeight": number,
                    "align": string,
                    "color":  string,
                    "placeholder": string,
                    "value": string,
                    "type": string,
                    "family": string,
                    "weight": string,
                    "style": string,
                },
                "type": string,
            },
            "button": {
                "background": {
                    "color": string,
                },
                "border": {
                    "width": number,
                    "radius": number,
                    "color": string,
                },
                "padding": {
                    "top": number,
                    "right": number,
                    "bottom": number,
                    "left": number,
                },
                "text": {
                    "size": number,
                    "lineHeight": number,
                    "align": string,
                    "color": string,
                    "value": string,
                    "type": string,
                    "family": string,
                    "weight": string,
                    "style": string,
                }
            }
        }
    },
    "size": {
        "width": number,
        "height": number,
        "left": number,
        "right": number,
        "center": {
            "x": number,
            "y": number,
        },
        // in px
        absolute: {
            "width": number,
            "height": number,
            "left": number,
            "right": number,
            "center": {
                "x": number,
                "y": number,
            },
        },
        viewportWidth: number,
        fontSize: number,
        slideOffsetX: number,
        slideOffsetY: number
    }
};

export type InputModalCompletePayload = {
    result: boolean,
    value: string
}