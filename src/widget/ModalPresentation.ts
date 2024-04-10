export class ModalPresentation {

    private _isOpen = false;
    private _isWidgetConnected = false;

    public set isOpen(value: boolean) {
        this._isOpen = value;
    }

    public get isOpen() {
        return this._isOpen;
    }

    public set isWidgetConnected(value: boolean) {
        this._isWidgetConnected = value;
    }

    public get isWidgetConnected() {
        return this._isWidgetConnected;
    }

    public modalClosed() {
        this.isWidgetConnected = false;
        this.isOpen = false;
    }


}

export interface IModalPresentation {
    modalPresentation: ModalPresentation;
}