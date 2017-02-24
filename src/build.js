var hljs = require('./tools/highlight.min.js');
var hb = require('./tools/handlebars.min.js');
var pg = require('./tools/percentage.js');

// HLJS Langs (hljs.listLanguages()): 'apache','bash','coffeescript','cpp','cs','css','diff','http','ini','java','javascript','json','makefile','xml','markdown','nginx','objectivec','perl','php','python','ruby','sql'

var xhl = hljs.highlight('cs', `
using System.Text;
using System.Threading.Tasks;

namespace AutoTestGenerator.Analysers
{
    public class CSharpDocumentAnalyser : IDocumentAnalyser
    {
        protected SemanticModel Model;
        protected SyntaxTree Tree;
        protected CompilationUnitSyntax Root;

        internal CSharpDocumentAnalyser(SemanticModel model, SyntaxTree tree, CompilationUnitSyntax root)
        {
            this.Model = model;
            this.Tree = tree;
            this.Root = root;

            // http://stackoverflow.com/questions/38204509/roslyn-throws-the-language-c-is-not-supported
            // Project needs to reference Microsoft.CodeAnalysis.CSharp.Workspaces
            var _ = typeof(Microsoft.CodeAnalysis.CSharp.Formatting.CSharpFormattingOptions);
        }
    }
}
    `);

var template = hb.compile("<div>{{imie}} i {{nazwisko}}</div>");
var hb_html = template({imie: 'Przemek', nazwisko: 'Kowalski'});

var pg_groups = pg('to jest %%%#w00t_#%%% i jego pies.');


//console.log(xhl.value);
//console.log(hb_html);
console.log(pg_groups)