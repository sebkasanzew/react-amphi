export interface TerminalState {
    output: string[];
    isReady: boolean;
}

export interface TerminalConfig {
    welcomeMessage?: string;
    initialDelay?: number;
}
