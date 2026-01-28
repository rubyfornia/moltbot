declare module "moltbot/plugin-sdk" {
    export interface ClawdbotPluginApi {
        logger: {
            info: (msg: string) => void;
            warn: (msg: string) => void;
            error: (msg: string) => void;
            debug: (msg: string) => void;
        };
        on: (event: string, handler: (event: any, ctx: any) => Promise<any>) => void;
        config: any;
        pluginConfig: any; // <--- The missing nerve
    }
}
