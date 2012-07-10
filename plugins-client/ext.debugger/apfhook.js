/**
 * Code Editor for the Cloud9 IDE
 *
 * @copyright 2010, Ajax.org B.V.
 * @license GPLv3 <http://www.gnu.org/licenses/gpl.txt>
 */
 
// registers global objects needed for apf ui elements
define(function(require, exports, module) {

window.adbg = {
    exec : function(method, args, callback, options) {
        if (method == "loadScript") {
            var dbg = args[0];
            var script = args[1];
            dbg.loadScript(script, function(source) {
                if (options && options.callback) {
                    options.callback(apf.escapeXML(source), apf.SUCCESS);
                } else {
                    // callback("<file>" + apf.escapeXML(source) + "</file>", apf.SUCCESS);
                    // TODO: ugly text() bug workaround
                    callback("<file><![CDATA[" + source.replace("]]>", "]] >") + "]]></file>", apf.SUCCESS);
                }
            });
        }
        else if (method == "loadObjects") {
            var dbg = args[0];
            var item = args[1];

            dbg.loadObjects(item, function(xml) {
                if (options && options.callback) {
                    options.callback(xml, apf.SUCCESS);
                } else {
                    callback(xml, apf.SUCCESS);
                }
            });
        }
        else if (method == "loadFrame") {
            var dbg = args[0];
            var frame = args[1];

            dbg.loadFrame(frame, function(xml) {
                if (options && options.callback) {
                    options.callback(xml, apf.SUCCESS);
                } else {
                    callback(xml, apf.SUCCESS);
                }
            });
        }
    }
};

(apf.$asyncObjects || (apf.$asyncObjects = {}))["adbg"] = 1;


module.exports = {
    registerDebugger: function(_debugger) {
        window.dbg = _debugger;
    }
}

});

