import Image from "./Image";
import ProjectResourceCache from "~/src/stories_widget/models/ProjectResourceCache";


export default class ProjectResourceCacheSet {
    public resources: Array<ProjectResourceCache> = [];

    public static createFromArray(value: any): ProjectResourceCacheSet {
        const model: ProjectResourceCacheSet = new ProjectResourceCacheSet();

        // if !is_array return model

        for (let key in value) {
            if (value.hasOwnProperty(key)) {
                model.resources.push(ProjectResourceCache.createInstance(ProjectResourceCache, value[key]));
            }
        }

        return model;
    }

    get fontsCss(): Nullable<string> {
        let css = '';
        this.resources.forEach((resource: ProjectResourceCache) => {
            if (resource.isFont) {
                let _itemCss = resource.fontFaceAsCss;
                if (_itemCss !== null) {
                    css += _itemCss;
                }
            }
        })

        if (css) {
            return css;
        }
        return null;
    }




    // public findOneByType(type: string): Image|null {
    //
    //     let image: Image|null = null;
    //     this.images.forEach((value: Image) => {
    //         if (value.type === type) {
    //             image = value;
    //         }
    //     });
    //
    //     return image;
    // }
    //
    // public findOneByWidth(width: number, other: boolean = false): Image|null {
    //
    //     let image: Image|null = null;
    //     this.images.forEach((value: Image) => {
    //         if (value.width === width) {
    //             image = value;
    //         }
    //     });
    //     if (image !== null) {
    //         return image;
    //     }
    //
    //     if (other && (image = head(this.images)) !== undefined) {
    //         return image;
    //     }
    //
    //     return null;
    //
    // }

}