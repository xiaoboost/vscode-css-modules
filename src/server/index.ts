import { TextDocument } from 'vscode-languageserver-textdocument';

import {
    TextDocuments,
    createConnection,
    ProposedFeatures,
    InitializeParams,
    InitializeResult,
    ServerCapabilities,
    TextDocumentSyncKind
} from 'vscode-languageserver';

/** 文档控制器 */
const docs = new TextDocuments(TextDocument);
/** 语言服务器 */
const lsp = createConnection(ProposedFeatures.all);

lsp.listen();
docs.listen(lsp);

console.log('lang start');

lsp.onInitialize(() => {
    return {
        capabilities: {},
    };
});

// 初始化
lsp.onInitialized(() => {
    console.log('inited');
});

docs.onDidOpen(({ document }) => {
    debugger;
    console.log(document.uri);
});

docs.onDidClose(({ document }) => {
    debugger;
    console.log(document.uri);
});

docs.onDidChangeContent(({ document }) => {
    debugger;
    console.log(document.uri);
});
