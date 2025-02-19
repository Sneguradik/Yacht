import { EUserStatsProperty } from '../enums/user-stats-property.enum';

export class AddToProperty {
    static readonly type = '[User stats] Add to property';

    constructor(public readonly addNumber: number, public readonly property: EUserStatsProperty) {}
}
