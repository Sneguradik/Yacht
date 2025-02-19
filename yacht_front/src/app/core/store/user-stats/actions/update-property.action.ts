import { EUserStatsProperty } from '../enums/user-stats-property.enum';

export class UpdateProperty {
    static readonly type = '[User stats] Update property';

    constructor(public readonly property: EUserStatsProperty) {}
}
