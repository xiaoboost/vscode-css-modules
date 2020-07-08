import Webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin';
import GenerateJsonPlugin from 'generate-json-webpack-plugin';
import PackageConfig from '../package.json';

import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { RequireSplitChunkPlugin } from 'require-split-chunk-webpack-plugin';

import {
    modeName,
    resolve,
    outputDir,
    builtinModules,
    externalModules,
    isDevelopment,
    isAnalyzer,
} from './utils';

/** 公共配置 */
const webpackConfig: Webpack.Configuration = {
    target: 'node',
    externals: builtinModules.concat(externalModules),
    mode: modeName,
    node: {
        __dirname: false,
        __filename: false,
    },
    entry: {
        client: resolve('src/client/index.ts'),
        server: resolve('src/server/index.ts'),
    },
    output: {
        path: outputDir,
        filename: 'scripts/[name].js',
        libraryTarget: 'commonjs',
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        mainFiles: ['index.ts', 'index.js'],
        plugins: [
            new TsconfigPathsPlugin({
                configFile: resolve('tsconfig.json'),
            }),
        ],
    },
    performance: {
        hints: false,
        maxEntrypointSize: 2048000,
        maxAssetSize: 2048000,
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
                options: {
                    configFile: resolve('tsconfig.json'),
                },
            },
        ],
    },
    plugins: [
        new Webpack.optimize.ModuleConcatenationPlugin(),
        new Webpack.HashedModuleIdsPlugin({
            hashFunction: 'sha256',
            hashDigest: 'hex',
            hashDigestLength: 6,
        }),
        new Webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(modeName),
        }),
        new GenerateJsonPlugin('package.json', {
            name: PackageConfig.name,
            version: PackageConfig.version,
            description: PackageConfig.description,
            main: PackageConfig.main,
            author: PackageConfig.author,
        }),
    ],
};

if (isDevelopment) {
    webpackConfig.watch = true;
    webpackConfig.devtool = 'source-map';
    webpackConfig.externals = builtinModules.concat(externalModules);
    webpackConfig.plugins = webpackConfig.plugins!.concat([
        new FriendlyErrorsPlugin({
            compilationSuccessInfo: {
                messages: ['Project compile done.'],
                notes: [],
            },
        }),
    ]);

    Webpack(webpackConfig).watch({ ignored: /node_modules/ }, (err?: Error) => {
        if (err) {
            console.error(err.stack || err);
        }
    });
}
else {
    webpackConfig.optimization = {
        minimize: true,
        splitChunks: {
            maxInitialRequests: Infinity,
            minSize: 0,
            minChunks: 1,
            name: true,
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'common',
                    chunks: 'all',
                },
            },
        },
        minimizer: [
            new TerserPlugin({
                test: /\.js$/i,
                cache: false,
                terserOptions: {
                    ecma: 8,
                    ie8: false,
                    safari10: false,
                    output: {
                        comments: /^!/,
                    },
                },
            }),
        ],
    };

    webpackConfig.plugins = webpackConfig.plugins!.concat([
        new RequireSplitChunkPlugin(),
    ]);

    if (isAnalyzer) {
        webpackConfig.plugins = webpackConfig.plugins!.concat([
            new BundleAnalyzerPlugin({
                analyzerPort: 9876,
            }),
        ]);
    }
    
    Webpack(webpackConfig, (err, stats) => {
        if (err) {
            throw err;
        }

        console.log('\n' + stats.toString({
            chunks: false,
            chunkModules: false,
            chunkOrigins: false,
            colors: true,
            modules: false,
            children: false,
            builtAt: false,
        }) + '\n');
    });
}
