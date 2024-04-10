import {IData} from "../story-manager/types";

export class Utility {
    public static createFunctionWithTimeout(cb: () => void, opt_timeout?: number): () => void {
        let called = false;

        function fn() {
            if (!called) {
                called = true;
                cb();
            }
        }

        setTimeout(fn, opt_timeout || 1000);
        return fn;
    }

    public static convertModelToFormData(formData: FormData, data: IData, previousKey?: string) {
        if (data instanceof Object) {
            Object.keys(data).forEach(key => {
                const value = (data as any)[key];
                if (value instanceof Object && !Array.isArray(value)) {
                    return this.convertModelToFormData(formData, value, key);
                }
                if (previousKey) {
                    key = `${previousKey}[${key}]`;
                }
                if (Array.isArray(value)) {
                    value.forEach(val => {
                        formData.append(`${key}[]`, val);
                    });
                } else {
                    formData.append(key, value);
                }
            });
        }
    }

    // public static convertModelToFormData(model: any, form?: FormData, namespace = ''): FormData {
    //     let formData = form || new FormData();
    //     let formKey;
    //
    //     for (let propertyName in model) {
    //         if (!model.hasOwnProperty(propertyName) || !model[propertyName]) continue;
    //         let formKey = namespace ? `${namespace}[${propertyName}]` : propertyName;
    //         if (model[propertyName] instanceof Date)
    //             formData.append(formKey, model[propertyName].toISOString());
    //         else if (model[propertyName] instanceof Array) {
    //             model[propertyName].forEach((element: any, index: any) => {
    //                 const tempFormKey = `${formKey}[${index}]`;
    //                 this.convertModelToFormData(element, formData, tempFormKey);
    //             });
    //         }
    //         else if (typeof model[propertyName] === 'object' && !(model[propertyName] instanceof File))
    //             this.convertModelToFormData(model[propertyName], formData, formKey);
    //         else
    //             formData.append(formKey, model[propertyName].toString());
    //     }
    //     return formData;
    // }
}