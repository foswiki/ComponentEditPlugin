/**
 * $Id$
 *
 * @author Sven Dowideit
 * @copyright Copyright © 2010, SvenDowideit@fosiki.com
 */

(function() {
	tinymce.PluginManager.requireLangPack('foswikimacro');
	var Event = tinymce.dom.Event;

	tinymce.create('tinymce.plugins.FoswikiMacroPlugin', {
		init : function(ed, url) {
			var t = this, editClass, nonEditClass;
			
			t.editor = ed;
			editClass = ed.getParam("noneditable_editable_class", "mceEditable");
			nonEditClass = ed.getParam("noneditable_noneditable_class", "WYSIWYG_PROTECTED");

			ed.onNodeChange.addToTop(function(ed, cm, n) {
				var sc, ec;

				// Block if start or end is inside a non editable element
				sc = ed.dom.getParent(ed.selection.getStart(), function(n) {
					return ed.dom.hasClass(n, nonEditClass);
				});

				ec = ed.dom.getParent(ed.selection.getEnd(), function(n) {
					return ed.dom.hasClass(n, nonEditClass);
				});

				// Block or unblock
				//cm.setActive('componentedit', !(sc || ec));	//enable the button..
				//if (sc || ec) {
				//	t._setDisabled(1);
				//	return false;
				//} else {
				//	t._setDisabled(0);
				//}
				
				var selectedNode = ed.dom.getParent(ed.selection.getStart(), function(n) {
					return n;
				});
				if (typeof(selectedNode.innerHTML) != "undefined") {
					if (selectedNode.innerHTML[0] == '%') {
						cm.setActive('componentedit', true);	//we're in an existing tag
					} else {
						cm.setActive('componentedit', false);	//we're in an 'add' tag context
					}
				} else {
					cm.setActive('componentedit', false);	//we're in an 'add' tag context?
				}
			});
			
			ed.addCommand('foswikimacros_edit', function() {
				var selectedNode = ed.dom.getParent(ed.selection.getStart(), function(n) {
					return n;
				});
				//TODO: need to set the selection to the entire innerHTML
				if ((typeof(selectedNode.innerHTML) != "undefined") && 
					(selectedNode.innerHTML[0] == '%')) {
					var range = ed.selection.getRng();
					range.selectNodeContents(selectedNode);
					ed.selection.setRng(range);
					
					ed.windowManager.open({
					    title: 'foswiki Macro Editor',
					    location: false,
					    menubar: false,
					    toolbar: false,
					    status: false,
					    url : 'http://localhost/trunk/bin/rest/ComponentEditPlugin/getEdit?tml='+encodeURIComponent(selectedNode.innerHTML),
					    width : 540,
					    height : 440,
					    movable : true,
					    popup_css: false, // not required
					    inline : true
					}, {
					    plugin_url: url
					});
				} else {
					if ((typeof(selectedNode.innerHTML) != "undefined")) {
						alert("add new TML Macro ("+selectedNode.innerHTML+")");
					} else {
						alert("add new TML Macro");

					}
				}
			});
			ed.addButton('componentedit', {
			   title : 'foswikimacro.desc',
			   cmd : 'foswikimacros_edit',
			   image : url + '/img/tag-purple.gif'
			});
		},

		getInfo : function() {
			return {
				longname : 'dynamic editing of Foswiki Macros',
				author : 'SvenDowideit@fosiki.com',
				authorurl : 'http://fosiki.com',
				infourl : 'http://fosiki.com',
				version : '0.1'
			};
		},

		_block : function(ed, e) {
			var k = e.keyCode;

			// Don't block arrow keys, pg up/down, and F1-F12
			if ((k > 32 && k < 41) || (k > 111 && k < 124))
				return;

			return Event.cancel(e);
		},

		_setDisabled : function(s) {
			var t = this, ed = t.editor;

			tinymce.each(ed.controlManager.controls, function(c) {
				c.setDisabled(s);
			});

			if (s !== t.disabled) {
				if (s) {
					ed.onKeyDown.addToTop(t._block);
					ed.onKeyPress.addToTop(t._block);
					ed.onKeyUp.addToTop(t._block);
					ed.onPaste.addToTop(t._block);
				} else {
					ed.onKeyDown.remove(t._block);
					ed.onKeyPress.remove(t._block);
					ed.onKeyUp.remove(t._block);
					ed.onPaste.remove(t._block);
				}

				t.disabled = s;
			}
		}
	});

	// Register plugin
	tinymce.PluginManager.add('foswikimacro', tinymce.plugins.FoswikiMacroPlugin);
})();