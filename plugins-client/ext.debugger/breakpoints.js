/**
 * Code Editor for the Cloud9 IDE
 *
 * @copyright 2010, Ajax.org B.V.
 * @license GPLv3 <http://www.gnu.org/licenses/gpl.txt>
 */

define(function(require, exports, module) {

require("apf/elements/codeeditor");

var ide = require("core/ide");
var ext = require("core/ext");
var editors = require("ext/editors/editors");
var dock   = require("ext/dockpanel/dockpanel");
var commands = require("ext/commands/commands");
var fs = require("ext/filesystem/filesystem");


module.exports = {
    init: function() {
        var modelName = "mdlDbgBreakpoints"
        var model = apf.nameserver.register("model", modelName, new apf.model());
        apf.setReference(modelName, model);
        mdlDbgBreakpoints.load("<breakpoints/>");
        
        ide.addEventListener("settings.load", function (e) {
            // restore the breakpoints from the IDE settings
            var bpFromIde = e.model.data.selectSingleNode("//breakpoints");
            // not there yet, create element
            if (!bpFromIde) {
                bpFromIde = e.model.data.ownerDocument.createElement("breakpoints");
                e.model.data.appendChild(bpFromIde);
            }
            // bind it to the Breakpoint model
            mdlDbgBreakpoints.load(bpFromIde);
        });

        
        dock.register(name, "dbgBreakpoints", {
            menu : "Debugger/Breakpoints",
            primary : {
                backgroundImage: ide.staticPrefix + "/ext/main/style/images/debugicons.png",
                defaultState: { x: -8, y: -88 },
                activeState: { x: -8, y: -88 }
            }
        }, function(type) {
            ext.initExtension(_self);
            return dbgBreakpoints;
        });
        
        function evHandler(e){
            var node = e.node || e.xmlNode;
            if (!node)
                return;


        }

        ide.addEventListener("afteropenfile", evHandler);
        ide.addEventListener("afterfilesave", evHandler);
    },

    attachToEditor : function() {
        this.$debuggerBreakpoints = false;

        if (this.$breakpoints)
            this.$breakpoints.removeEventListener("update", this.$onBreakpoint);

        this.$breakpoints = value;

        if (!this.$breakpoints) {
            this.$updateBreakpoints();
            return;
        }

        var _self = this;
        _self.$updateBreakpoints();
        this.$onBreakpoint = function() {
            _self.$updateBreakpoints();
        };
        this.$breakpoints.addEventListener("update", this.$onBreakpoint);
        this.$updateBreakpoints();
    },
    
    $updateBreakpoints: function(doc) {
        doc = doc || this.$editor.getSession();

        var rows = [];
        if (this.xmlRoot && this.$breakpoints) {
            var path = this.xmlRoot.getAttribute("path");
            var scriptName = ide.workspaceDir + path.slice(ide.davPrefix.length);

            var breakpoints = this.$breakpoints.queryNodes("//breakpoint[@script='" + scriptName + "']");

            for (var i=0; i<breakpoints.length; i++) {
                rows.push(parseInt(breakpoints[i].getAttribute("line"), 10) - parseInt(breakpoints[i].getAttribute("lineoffset"), 10));
            }
        }
        doc.setBreakpoints(rows);
    },

    /*$toggleBreakpoint = function(row, session) {
        var bp = session.getBreakpoints();
        bp[row] = !bp[row];
        session.setBreakpoints(bp);
        var script = this.xmlRoot;
        script.setAttribute("scriptname",
            ide.workspaceDir + script.getAttribute("path").slice(ide.davPrefix.length));
        this.$debugger.toggleBreakpoint(script, row, session.getLine(row));
    };*/
    
    toggleBreakpoint : function(script, row, content) {
        var model = this.$mdlBreakpoints;
        var scriptName = script.getAttribute("scriptname");
        var bp = model.queryNode("breakpoint[@script='" + scriptName
            + "' and @line='" + row + "']");

        if (bp) {
            apf.xmldb.removeNode(bp);
        }
        else {
            // filename is something like blah/blah/workspace/realdir/file
            // we are only interested in the part after workspace for display purposes
            var tofind = "/workspace/";
            var path = script.getAttribute("path");
            var displayText = path;
            if (path.indexOf(tofind) > -1) {
                displayText = path.substring(path.indexOf(tofind) + tofind.length);
            }

            var bp = apf.n("<breakpoint/>")
                .attr("script", scriptName)
                .attr("line", row)
                .attr("text", displayText + ":" + (parseInt(row, 10) + 1))
                .attr("lineoffset", 0)
                .attr("content", content)
                .attr("enabled", "true")
                .node();
            model.appendXml(bp);
        }
    },

    setBreakPointEnabled : function(node, value){
        node.setAttribute("enabled", value ? true : false);
    },    
    
}

});
