const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: {
        game: './game.js'
    },
    output: {
        filename: '[name].js',
        libraryTarget: "umd",
        path: path.resolve(__dirname, '[name]-dist'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            }]
    },
    plugins: [
        new UglifyJsPlugin(),
    ],
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    parse: {
                        // parse options
                    },
                    sourceMap: {
                        filename: "sdk.js",
                        url: "sdk.js.map"
                    },
                    compress: {
                        // compress options
                        keep_fnames: true,              // 通过true以防止压缩器丢弃函数名称。对于依赖的代码很有用
                        // global_defs: {
                        //     "console.log": "alert"
                        // },
                        unsafe_proto: true,             //优化表达式如 Array.prototype.slice.call(a)into[].slice.call(a)
                        expression: true,               // expression（默认值：false）--传递true以保留来自终端语句的完成值而不返回，例如在bookmarklets中。
                        
                        dead_code: true,                // 垃圾代码
                        
                        drop_console: true,             // 去掉console
                        
                        keep_fargs: "strict",           // keep_fargs（默认值：strict）——丢弃未使用的函数参数。依赖Function.length_的代码如果不加区分地执行，即在传递true时，将中断。传递false以始终保留函数参数。
                        
                        hoist_funs: true,               // 提升函数（默认值：false）——提升函数声明
                        hoist_vars: true,               // 变量提升
                        
                        toplevel: true,                 // 默认值：false--在顶层作用域中删除未引用的函数（“funcs”）和/或变量（“vars”）（默认值为false，如果为true则同时删除未引用的函数和变量）
                        
                        pure_getters: true,             // (对象调用转化为数组)pure-getters（默认值：“strict”）——如果您为此传递true，那么UglifyJS将假定对象属性访问（例如foo.bar或foo[“bar”]）没有任何副作用。指定“strict”仅当foo确定不抛出（即不为空或未定义）时，才将foo.bar视为无副作用。
                        
                        top_retain: null,               // top_retain（默认值：空）--防止特定的顶级函数和变量被未使用的删除（可以是数组、逗号分隔、RegExp或函数）。暗示顶层）
                        
                        unsafe: true,                   // 不安全转化（默认值：false）--应用“不安全”转换（下面讨论）
                        
                        unsafe_regexp: true,            // unsafe_regexp（默认值：false）--启用变量与regexp值的替换，就像它们是常量一样。
                        
                        unsafe_undefined: true,         // unefined不安全（默认值：false）--如果在作用域中有一个名为unefined的变量，则替换void 0（变量名将被损坏，通常减少为单个字符）
                        
                        unsafe_Function: true,          //unsafe_Function（默认值：false）--当args和code都是字符串文本时，压缩和损坏函数（args，code）。
                        
                        unsafe_math: true,              //优化数值表达式，例如 2 * x * 3into 6 * x，可能会得出不精确的浮点结果。
                        unsafe_comps: true,             //压缩表达式，例如a <= b假设任何操作数都不能（强制）NaN。
                    },
                    mangle: {
                        // mangle options
                        eval: false,            //eval（默认为false）--将true传递到使用eval或with的作用域中可见的损坏名称。
                        
                        toplevel: true,         //顶级（默认为false）--将true传递给顶级作用域中声明的损坏名称。
                        
                        keep_fnames: true,      //keep_fnames（默认为false）--将true传递给不可损坏的函数名。对于依赖Function.prototype.name的代码很有用。另请参见：keep_fnames
                        
                        reserved: [],           //保留（默认为[]）--传递一个应从损坏中排除的标识符数组。例如：[“foo”，“bar”]。
                        
                        properties: {
                            
                            builtins: false,    // 内置（默认值：false）--使用true允许损坏内置DOM属性。不建议重写此设置。
                            
                            debug: false,       // 调试（默认值：false）--仍存在具有原始名称的损坏名称。传递空字符串“”以启用，或传递非空字符串以设置调试后缀。
                            
                            keep_quoted: true, // keep_quoted（默认值：false）--仅损坏未引用的属性名称。
                            
                            
                            // reserved: reservedArr,
                        }
                    },
                    output: {
                        // output options
                        ascii_only: true,       // 仅限ascii_（默认为false）--在字符串和regexp中转义Unicode字符（影响非ascii字符变为无效的指令）
                        
                        beautify: false,        // 代码美化
                        
                        braces: false,          // 大括号（默认为false）--始终在if、for、do、while或with语句中插入大括号，即使它们的主体是单个语句。
                        
                        comments: false,        //传递true或"all"保留所有注释，"some"保留一些注释，正则表达式字符串（例如/^!/）或函数。
                        
                        indent_level: 1,        // 代码缩进
                        
                        keep_quoted_props: true, //keep_quoted_props（默认为false）--启用时，防止从对象文本中的属性名称中删除引号。
                        
                        max_line_len: true,     //max_line_len（默认值为false）--最大行长度（用于丑化代码）
                        
                        quote_keys: true,       //quote_keys（默认为false）--传递true以引用文本对象中的所有键
                        
                        quote_style: 0,         //引号样式（默认为0）--字符串的首选引号样式（也影响带引号的属性名称和指令）：
                        
                        wrap_iife: true,        //wrap_iife（默认为false）--通过true包装立即调用的函数表达式。有关详细信息，请参见#640。
                        
                    },
                    nameCache: null, // or specify a name cache object
                    ie8: false,
                    warnings: false,
                },
                test: /\.js(\?.*)?$/i,
                chunkFilter: function (chunk) {
                    console.log(chunk);
                    return true
                },
                cache: true,   //是否启用文件缓存，默认缓存在node_modules/.cache/uglifyjs-webpack-plugin.目录
                parallel: true,  //使用多进程并行运行来提高构建速度
                
            }),
        ],
    },
};
