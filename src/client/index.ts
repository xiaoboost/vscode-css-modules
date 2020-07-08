import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient';
import { ExtensionContext } from 'vscode';

let client: LanguageClient;

function scheme(lang: string) {
    return {
        scheme: 'file',
        language: lang
    };
}

export function activate(context: ExtensionContext) {
    // 语言服务文件绝对路径
    const serverModule = context.asAbsolutePath('server.js');
    // 语言服务启动配置
    const serverOptions: ServerOptions = {
        run: {
            module: serverModule,
            transport: TransportKind.ipc
        },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: {
                // 注意端口号和 launch 中的调试端口要一致
                execArgv: ['--nolazy', '--inspect=6009']
            }
        }
    };
    // 客户端控制语言服务配置
    const clientOptions: LanguageClientOptions = {
        documentSelector: [scheme('styl'), scheme('less'), scheme('sass')]
    };

    // 创建插件客户端
    client = new LanguageClient('VSCodeCSSModule', 'VSCode CSS Module Language Server', serverOptions, clientOptions);

    // 启动客户端
    client.start();
}

export function deactivate() {
    if (client) {
        return client.stop();
    }
}
