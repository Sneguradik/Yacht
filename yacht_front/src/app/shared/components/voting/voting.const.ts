import { Glb } from '@app/glb/glb';

export const VoteActionNames = Glb.makeEnum({
    UP: 'up',
    DOWN: 'down',
});

export const VoteStyleNames = Glb.makeEnum({
    ARTICLE: 'article',
    COMMENT: 'comment'
});

export type VoteAction = (typeof VoteActionNames)[keyof typeof VoteActionNames];
export type VoteStyle = (typeof VoteStyleNames)[keyof typeof VoteStyleNames];

export const VoteActionValuesNames = Glb.makeEnum({
    POSITIVE: 1,
    NEGATIVE: -1
});

export type VoteActionValues = (typeof VoteActionValuesNames)[keyof typeof VoteActionValuesNames];
