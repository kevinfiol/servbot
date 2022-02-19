type ServbotOptions = {
    root: string;
    reload: boolean;
    fallback: string;
    ignores: RegExp[];
    credentials?: Record<string, unknown>;
};

type ServbotServer = {
    listen: (port: number) => void;
    reload: () => void;
    close: (callback: Function) => void;
};

export default function (options: ServbotOptions): ServbotServer;
