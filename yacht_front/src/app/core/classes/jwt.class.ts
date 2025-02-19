const atobSafe = typeof atob === 'undefined' ? ((str: string) => Buffer.from(str, 'base64').toString('binary')) : atob;

export class Jwt {
    // tslint:disable
    private _header: any;
    private _data: { [key: string]: any };
    // tslint:enable

    public get expired(): boolean {
        return Date.now() / 1000 > this.data.exp;
    }

    public get header(): any {
        return this._header;
    }

    public get data(): { [key: string]: any } {
        return this._data;
    }

    constructor(data: string, withHeader: boolean = true) {
        if (withHeader) {
            const components = data.replace(/-/g, '+').replace(/_/, '/').split('.');
            this._header = JSON.parse(decodeURIComponent(escape(atobSafe(components[0]))));
            this._data = JSON.parse(decodeURIComponent(escape(atobSafe(components[1]))));
        } else {
            this._data = JSON.parse(decodeURIComponent(escape(atobSafe(data))));
        }
    }
}
