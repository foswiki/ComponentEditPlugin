/*
# Plugin for Foswiki - The Free and Open Source Wiki, http://foswiki.org/
#
# Copyright (C) 2005 Sven Dowideit SvenDowideit@wikiring.com
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details, published at 
# http://www.gnu.org/copyleft/gpl.html
#
*/

//create the Foswiki namespace if needed
if ( typeof( Foswiki ) == "undefined" ) {
    Foswiki = {};
}

/**********************************************************************************/
//create the Foswiki.ComponentEditPlugin namespace if needed
if ( typeof( Foswiki.ComponentEditPlugin ) == "undefined" ) {
    Foswiki.ComponentEditPlugin = {};
}

//used to add a ComponentEdit Click handler to document
Foswiki.ComponentEditPlugin.addComponentEditClick = function(body) {
    body.FoswikiComponentEditPluginonClickFunction = Foswiki.ComponentEditPlugin.onClickFunction;
    XBrowserAddHandler(body, 'click', 'FoswikiComponentEditPluginonClickFunction');

    //TODO: make keypress see if its within a TMLVariable area and pop up cleverness
//    this.current_mode.get_edit_document().addEventListener('keypress', function(e) {var tg = (e.target) ? e.target : e.srcElement;alert(tg);}, false);
}

Foswiki.ComponentEditPlugin.onClickFunction = function(event) {
    var tg = (event.target) ? event.target : event.srcElement;
    if (tg.className=='TMLvariable') {
        Foswiki.ComponentEditPlugin.sourceTarget = tg;
        Foswiki.ComponentEditPlugin.popupEdit(event, tg.innerHTML);
    } else {
        //if we're not in a TMLVariable element, then we have to be careful to parse and replace only the parsed bit..
    }
}

Foswiki.ComponentEditPlugin.popupEdit = function(event, tml) {
    if ((tml) && (tml != '')) {
        if (tml.indexOf('SEARCH') > -1) {
//TODO: need to get rid of the getting rid of %'s
//tml = '%'+tml+'%';
            Foswiki.JSPopupPlugin.openPopup(event, 'Please wait, requesting data from server');
            Foswiki.JSPopupPlugin.ajaxCall(event, Foswiki.ComponentEditPlugin.restUrl, 'tml='+tml);
        } else {
    	    var showControl = document.getElementById('componenteditplugindiv');
        	var showControlText = document.getElementById('componentedittextarea');

	        var dialogtext = showControl.innerHTML;
    	    //replace COMPONENTEDITPLUGINTML with tml
	        dialogtext = dialogtext.replace(/COMPONENTEDITPLUGINTML/, tml);
            //remove COMPONENTEDITPLUGINCUSTOM (its for inserting inputs above the textarea like SEARCH)
            dialogtext = dialogtext.replace(/COMPONENTEDITPLUGINCUSTOM/, '');
	        Foswiki.JSPopupPlugin.openPopup(event, dialogtext);
        }

        //try { showControlText.focus(); } catch (er) {alert(er)}
    } else {
        Foswiki.JSPopupPlugin.closePopup(event);
    }
}

Foswiki.ComponentEditPlugin.saveClick = function(event) {
    var tg = (event.target) ? event.target : event.srcElement;
    var result = tg.form.elements.namedItem("componentedit").value;
    
    //result = '<span class="WYSIWYG_PROTECTED">'+result+'</span>';
    
    tinyMCEPopup.execCommand('mceReplaceContent', false, result);

    return;

    if (Foswiki.ComponentEditPlugin.sourceTarget.className=='TMLvariable') {
        Foswiki.ComponentEditPlugin.sourceTarget.innerHTML = result;
        Foswiki.ComponentEditPlugin.popupEdit(event, null);
    } else {
        //if we're not in a TMLVariable element, then we have to be careful to parse and replace only the parsed bit..
        var pre = '';
        var post = '';

        var splitByPercents = Foswiki.ComponentEditPlugin.sourceTarget.value.split('%');
        for (var i=0;i<Foswiki.ComponentEditPlugin.startIdx-1;i++) {
            pre = pre+splitByPercents[i] + '%';
        }
        pre = pre+splitByPercents[i];
        for (var i=Foswiki.ComponentEditPlugin.stopIdx+1;i<splitByPercents.length-1;i++) {
             post = post+splitByPercents[i] + '%';
        }
        post = post+splitByPercents[i];

        //TODO: arge - i'm embedding the assumption of textarea here
        Foswiki.ComponentEditPlugin.sourceTarget.value = pre + result + post;
        Foswiki.ComponentEditPlugin.popupEdit(event, null);
    }
}

Foswiki.ComponentEditPlugin.inputFieldModified = function(event) {
//iterate over all input fields, and any that are different from the default, put into the textarea TWMLVariable
//can optimise by only changing that attr that triggered the event
    var tg = (event.target) ? event.target : event.srcElement;

    var tml = ''+tg.form.elements.namedItem("foswikitagname").value+'{\n';

    for (i=0; i < tg.form.elements.length; i++) {
        elem = tg.form.elements[i];
        if (elem.name == 'foswikitagname') {continue;};
        if (elem.name == 'componentedit') {continue;};
        if (elem.name == 'action_save') {continue;};
        if (elem.name == 'action_cancel') {continue;};
        if (elem.name == 'validation_key') {continue;};

        if ((elem.type == 'radio') && (!elem.checked)) {continue;};

        var defaultval = elem.getAttribute('foswikidefault');
        if ((typeof( defaultval ) != "undefined") && (elem.value == defaultval)) {continue;};

        tml = tml + '   '+elem.name +'="'+elem.value+'" \n';
    }

    tml = tml+'}';

    tg.form.elements.namedItem("componentedit").value = '%'+tml+'%';
}
