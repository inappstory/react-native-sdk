import Image from "./Image";
import {head} from "../../../../helpers/head";

export default class ImageSet {


    public images: Array<Image> = [];

    color: string = '';
    gradient: boolean = false;


    public static createFromArray(value: Dict): ImageSet {
        const model: ImageSet = new ImageSet();

        // if !is_array return model

        for (let key in value) {
            if (value.hasOwnProperty(key)) {
                model.images.push(Image.createInstance(Image, value[key]));
            }
        }

        return model;
    }

    public findOneByType(type: string): Image|null {

        let image: Image|null = null;
        this.images.forEach((value: Image) => {
            if (value.type === type) {
                image = value;
            }
        });

        return image;
    }

    public findOneByWidth(width: number, other: boolean = false): Image|null {

        let image: Image|null = null;
        this.images.forEach((value: Image) => {
            if (value.width === width) {
                image = value;
            }
        });
        if (image !== null) {
            return image;
        }

        if (other && (image = head(this.images)) !== undefined) {
            return image;
        }

        return null;

    }

}