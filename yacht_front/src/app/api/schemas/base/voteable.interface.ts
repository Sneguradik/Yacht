export interface VoteCount {
  you?: number;
  up: number;
  down: number;
}

export interface IVoteable {
  votes: VoteCount;
}
