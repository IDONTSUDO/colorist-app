import makeAutoObservable from "mobx-store-inheritance";

export class SettingsStore {
    constructor() {
        makeAutoObservable(this)
    }
    
}