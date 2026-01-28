declare module "moltbot/plugin-sdk" {
    export interface ClawdbotPluginApi {
        logger: {
            info: (msg: string) => void;
            warn: (msg: string) => void;
            error: (msg: string) => void;
            debug: (msg: string) => void;
        };
        // Allow handler to return anything (void, Promise, or Object)
        on: (event: string, handler: (event: any, ctx: any) => any) => void;
        config: any;
        pluginConfig: any;
    }
}
