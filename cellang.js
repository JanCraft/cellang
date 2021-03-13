import { PeekableStream } from './src/PeekableStream.js';
import { Lexer } from './src/lexer.js';
import { Parser } from './src/parser.js';
import { Eval } from './src/eval.js';
import { Env } from './src/env.js';
import { stdenv } from './src/std.js';

if (Deno.args.length < 1 || Deno.args[0] == '-h' || Deno.args[0] == '--help') {
    console.log("== Cellang Help ==");
    console.log("  run $FILENAME -> Executes the specified .cll file");
    console.log("    --timings   -> Outputs timings");
    console.log("==================");
    Deno.exit(0);
}

if (Deno.args[0] == 'run' ) {
    if (Deno.args.length < 2) {
        throw new Error("No input file was specified");
    }
    
    const decoder = new TextDecoder("utf-8");
    const data = Deno.readFileSync(Deno.args[1]);
    const content = decoder.decode(data);
    
    const tstart = Date.now();
    let tref = tstart;

    const lexer = new Lexer();
    const toks = lexer.lex(new PeekableStream(content));
    const tlexing = Date.now() - tstart;
    
    tref = Date.now();
    const parser = new Parser(toks, ";");
    const ast = Parser.all_expr(parser);
    const tparsing = Date.now() - tref;
    
    tref = Date.now();
    const evaluator = new Eval();
    evaluator.eval_list(ast, new Env(stdenv));
    const tevaluating = Date.now() - tref;

    if (Deno.args.length > 2 && Deno.args[2] == '--timings') {
        const now = Date.now();
        const ttotal = now - tstart;

        console.log("== Timings ==");
        console.log("  Lexing      " + (tlexing) + "ms");
        console.log("  Parsing     " + (tparsing) + "ms");
        console.log("  Evalutating " + (tevaluating) + "ms");
        console.log("  Total       " + (ttotal) + "ms");
    }
}