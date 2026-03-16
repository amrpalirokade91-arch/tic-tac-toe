import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface GameResult {
    oWins: bigint;
    xWins: bigint;
    draws: bigint;
}
export interface backendInterface {
    getScores(): Promise<GameResult>;
    recordGameResult(winner: string): Promise<void>;
    resetScores(): Promise<void>;
}
