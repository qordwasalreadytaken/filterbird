
var itemToCompare = {name:"5000 Gold",NAME:"5000 Gold",CODE:"GOLD",GOLD:5000,ID:true,always_id:true,rarity:"regular"};
var character = {CLVL:90,CHARSTAT14:199000,CHARSTAT15:199000,DIFFICULTY:2,ILVL:85,CHARSTAT70:0,CHARSTAT13:1000,AMAZON:true,ASSASSIN:false,BARBARIAN:false,DRUID:false,NECROMANCER:false,PALADIN:false,SORCERESS:false,SHOP:false,EQUIPPED:false,FILTLVL:1};
var item_settings = {ID:false, ILVL_return:85};
var settings = {auto_difficulty:true,version:0,validation:1,auto_simulate:1,max_errors:50,error_limit:1,num_filters:2,background:0,nowrap:true,nowrap_width:800};
var notices = {duplicates:0,pd2_conditions:0,pod_conditions:0,colors:0,encoding:0};
var colors = {
	WHITE:"#dddddd",
	GRAY:"#707070",
	BLUE:"#6666bb",	
	YELLOW:"#cccc77",
	GOLD:"#9b885e",
	GREEN:"#00f000",
	DGREEN:"#255d16",
	TAN:"#9b8c6d",
	BLACK:"000000",
	ORANGE:"#c48736",
	PURPLE:"#9b2aea",
	RED:"#a94838",
	COBALT:"#0047AB",
	PINK:"#FFC0CB",
	DPURPLE:"#301934"
};
var filter = [0,{text:"",result:["",""],o:""},{text:"",result:["",""],o:""}];	// stores most recent info, first index unused
var item_old = {};
var character_old = {};
var settings_old = {};
var messages_old = "";
// testing variables
var launcher_text = "";
var launcher_data = [];
var github_text = "";
var github_data = [];
var filter_text = "";
var border = "";
var bgcolor = "";
let mappedbgcolor = "";
let mappedborder = "";

// startup - runs when the page loads
// ---------------------------------
function startup() {
	document.getElementById("filter_text_1").innerHTML = "// Load filter files from your Diablo II directory or copy/paste their rules here"
	document.getElementById("filter_text_2").innerHTML = "// Load filter files from your Diablo II directory or copy/paste their rules here\r\n// If you're not simulating multiple filters, Filter #2 can be disabled via the menu"
	loadItems()
	loadOptions()
	var r = Math.floor(Math.random()*5+1);
	var background = "./images/act_"+r+".png";
	document.getElementById("background_1").src = background
	document.getElementById("background_2").src = background
	settings.background = r;
	loadCustomization()
	
	// TODO: Add URL parameters for these options
	document.getElementById("original").checked = false
	toggleOriginalChoices(false)
	document.getElementById("non_item_custom").checked = true
	toggleNonItemDetails(true)
	document.getElementById("custom").checked = true
	toggleCustom(true)
	document.getElementById("custom_format").checked = true
	toggleCustomFormat(true)
	
	// check URL parameters
	params = new URLSearchParams(window.location.search);
	if (params.has('v') == true) {
		if (params.get('v').toLowerCase() == "pd2") { changeVersion(1) }
	}
	if (params.has('multiple') == true) {
		if (params.get('multiple') == "0") {
			document.getElementById("multiple_filters").checked = false
			toggleMultipleFilters(false)
		}
	}
	if (params.has('alternate') == true) {
		if (params.get('alternate') == "0") {
			document.getElementById("custom_format").checked = false
			toggleCustomFormat(false)
		}
	}
	if (params.has('auto') == true) {
		if (params.get('auto') == "0") {
			document.getElementById("auto_simulate").checked = false
			toggleAutoSimulation(false)
		}
	}
	if (params.has('checking') == true) {
		if (params.get('checking') == "0") {
			document.getElementById("cond_validation").checked = false
			toggleConditionValidation(false)
		}
	}
	// TODO: Handle settings if the page is loaded irregularly (i.e. by navigating "back")
	
	//document.getElementById("debug").style.display = "block"
}

// loadItems - adds equipment and other items to the item dropdown menu
// ---------------------------------
function loadItems() {
	var choices = "<option>­ ­ ­ ­ Select Item</option>";
	for (group in equipment) {
		for (itemNew in equipment[group]) {
			var item = equipment[group][itemNew];
			var addon = "";
			if (item == equipment[group][0]) { addon = "<option class='gray-all' style='color:gray' disabled>" + item.name + "</option>" }
			else if (typeof(item.color) != 'undefined') { addon = "<option style='color:"+colors[getColor(item)]+"'>" + item.name + "</option>" }
			else if (typeof(item.rarity) != 'undefined') { addon = "<option class='dropdown-"+item.rarity+"'>" + item.name + "</option>" }
			else { addon = "<option class='dropdown-unique'>" + item.name + "</option>" }
			choices += addon //border
		}
	}
	document.getElementById("dropdown_item").innerHTML = choices
}

// loadOptions - populates the dropdown menus (other than the item menu)
// ---------------------------------
function loadOptions() {
	document.getElementById("dropdown_id").innerHTML = "<option>Id</option><option selected>Unid (if possible)</option>";
	var options_clvl = "<option class='gray-all' style='color:gray' disabled>Character Level</option>"; for (let i = 1; i < 100; i++) { options_clvl += "<option>"+i+"</option>" }
	document.getElementById("dropdown_clvl").innerHTML = options_clvl
	document.getElementById("dropdown_clvl").selectedIndex = character.CLVL
	var options_ilvl = "<option class='gray-all' style='color:gray' disabled>Item Level</option>"; for (let i = 1; i < 100; i++) { options_ilvl += "<option>"+i+"</option>" }
	document.getElementById("dropdown_ilvl").innerHTML = options_ilvl
	document.getElementById("dropdown_ilvl").selectedIndex = character.ILVL
}

// setID - handles input from the ID dropdown menu
//	value: 'Id' or 'Unid (if possible)'
// ---------------------------------
function setID(value) {
	if (value == "Id") { item_settings.ID = true; document.getElementById("identified").checked = true; }
	else { item_settings.ID = false; document.getElementById("identified").checked = false; }
	itemToCompare.ID = item_settings.ID
	setItem(document.getElementById("dropdown_item").value )
}

// setCLVL - handles input from the CLVL dropdown menu
//	value: character's level (1-99)
// ---------------------------------
function setCLVL(value) {
	character.CLVL = Number(value)
	// keep clvl consistent (temporary while old item selection & non-item details coexist)
	document.getElementById("clvl").value = Number(value)
	if (character.CHARSTAT14 > (character.CLVL * 10000)) {
		character.CHARSTAT14 = character.CLVL * 10000
		document.getElementById("gold_char").value = character.CHARSTAT14
	}
	if (value == 1) { character.CHARSTAT13 = 0 }
	else { character.CHARSTAT13 = 1000 }
	simulate()
}

// setILVL - handles input from the ILVL dropdown menu
//	value: item's level (1-99)
// ---------------------------------
function setILVL(value) {
	// keep ilvl consistent (temporary while old item selection & custom item editing coexist)
	itemCustom.ILVL = value
	document.getElementById("ilvl").value = value
	
	character.ILVL = Number(value)
	if (settings.auto_difficulty == true) {
		if (value < 36) { character.DIFFICULTY = 0 }
		else if (value > 66) { character.DIFFICULTY = 2 }
		else { character.DIFFICULTY = 1 }
	}
	setItem(document.getElementById("dropdown_item").value )
}

// setItem - handles input from the item dropdown menu
//	value: the item's name
// ---------------------------------
function setItem(value) {
	if (value != "­ ­ ­ ­ Select Item") {
		for (group in equipment) { for (itemNew in equipment[group]) { if (value == equipment[group][itemNew].name) {
			var item = equipment[group][itemNew];
			itemToCompare = {}
			for (affix in item) { itemToCompare[affix] = item[affix] }
			itemToCompare.NAME = value.split(" (")[0].split(" ­ ")[0]
			itemToCompare.ILVL = character.ILVL
			itemToCompare.PRICE = Number(document.getElementById("price").value)
			itemToCompare.ID = true
			if (typeof(itemToCompare.base) != 'undefined') {
				var base = bases[itemToCompare.base.split(" ").join("_").split("-").join("_").split("s'").join("s").split("'s").join("s")];
				for (affix in base) { itemToCompare[affix] = base[affix] }
				if (base.tier == 1) { itemToCompare.NORM = true }
				else if (base.tier == 2) { itemToCompare.EXC = true }
				else if (base.tier == 3) { itemToCompare.ELT = true }
			} else {
				if (group == "amulet" && typeof(itemToCompare.CODE) == 'undefined') { itemToCompare.CODE = "amu"; itemToCompare.base = "Amulet"; }
				else if (group == "ring") { itemToCompare.CODE = "rin"; itemToCompare.base = "Ring"; }
				else if (group == "charms") {
					if (item.size == "small") { itemToCompare.CODE = "cm1"; itemToCompare.base = "Small Charm"; }
					else if (item.size == "large") { itemToCompare.CODE = "cm2"; itemToCompare.base = "Large Charm"; }
					else if (item.size == "grand") { itemToCompare.CODE = "cm3"; itemToCompare.base = "Grand Charm"; }
				}
				else if (group == "socketables") {
					if (item.type == "jewel") { itemToCompare.CODE = "jew"; itemToCompare.base = "Jewel"; }
					else if (item.type == "rune") { itemToCompare.RUNENAME = itemToCompare.name.split(" ")[0] }
					else if (item.type == "gem") {
						var g_level = [0,"Chipped","Flawed","Normal","Flawless","Perfect"];
						var g_type = [0,"Amethyst","Diamond","Emerald","Ruby","Sapphire","Topaz","Skull"];
						itemToCompare.GLEVEL = g_level[itemToCompare.GEMLEVEL]
						itemToCompare.GTYPE = g_type[itemToCompare.GEMTYPE]
					}
				}
				else if (itemToCompare.CODE == "aq2") { itemToCompare.base = "Arrows" }
				else if (itemToCompare.CODE == "cq2") { itemToCompare.base = "Bolts" }
				else if (itemToCompare.CODE == "ma1" || itemToCompare.CODE == "ma2" || itemToCompare.CODE == "ma4" || itemToCompare.CODE == "ma5" || itemToCompare.CODE == "ma6" || itemToCompare.CODE == "ma7" || itemToCompare.CODE == "ma8" || itemToCompare.CODE == "ma9") {
					itemToCompare.base = itemToCompare.name
					itemToCompare.NAME = rare_prefix[Math.floor(Math.random()*rare_prefix.length)] + " Eye"
				}
				else if (itemToCompare.CODE == "cm4") { itemToCompare.base = "Grand Charm" }	// TOCHECK: Does this item still display with 2 lines?
			}
			for (affix in item) { itemToCompare[affix] = item[affix] }	// some base affixes are overridden by regular affixes
			if (typeof(itemToCompare.rarity) != 'undefined') {
				if (itemToCompare.rarity == "set") { itemToCompare.SET = true }
				else if (itemToCompare.rarity == "rare") { itemToCompare.RARE = true }
				else if (itemToCompare.rarity == "magic") { itemToCompare.MAG = true }
				else if (itemToCompare.rarity == "regular") { itemToCompare.NMAG = true; itemToCompare.always_id = true; }
				else if (itemToCompare.rarity == "rw") { itemToCompare.NMAG = true; itemToCompare.RW = true; itemToCompare.always_id = true; }
				else if (itemToCompare.rarity == "unique") { itemToCompare.UNI = true }
				else if (itemToCompare.rarity == "craft") { itemToCompare.CRAFT = true; itemToCompare.always_id = true; }
				else if (itemToCompare.rarity == "synth") { itemToCompare.SYNTH = true; itemToCompare.always_id = true; }
				else if (itemToCompare.rarity == "synthesized") { itemToCompare.SYNTH = true; itemToCompare.always_id = true; }
			} else { itemToCompare.UNI = true }
			if (itemToCompare.RW == true) {
				var rw_name = itemToCompare.name.split(" ­ ")[0].split(" ").join("_").split("'").join("");
				if (rw_name == "Infinity") { rw_name = "infinity" }
				var s = 0;
				for (let i = 0; i < runewords[rw_name].runes.length; i++) { s+=1; }
				itemToCompare.sockets = s
			}
			itemToCompare[itemToCompare.CODE] = true
			if (typeof(itemToCompare.velocity) != 'undefined') { if (itemToCompare.velocity < 0) { itemToCompare.velocity += 100000 } }	// negative values overflow for this in-game code
			if (typeof(itemToCompare.always_id) == 'undefined') { itemToCompare.always_id = false }
			if (itemToCompare.always_id == false && item_settings.ID == false) { itemToCompare.ID = false }
			if (itemToCompare.ID == true) {
				// affix codes translated to in-game codes
				for (affix in itemToCompare) { for (code in codes) { if (affix == code) { itemToCompare[codes[code]] = itemToCompare[affix] } } }
				if (typeof(itemToCompare.sup) != 'undefined') { if (itemToCompare.sup > 0) { if (typeof(itemToCompare.ED) == 'undefined') { itemToCompare.ED = 0 }; itemToCompare.ED += itemToCompare.sup; itemToCompare.SUP = true; if (item.rarity == "regular") { itemToCompare.NAME = "Superior "+itemToCompare.NAME } } }
				if (typeof(itemToCompare.ethereal) != 'undefined' && itemToCompare.ethereal == 1) { itemToCompare.ETH = true }
				if (itemToCompare.CODE == "aq2" || itemToCompare.CODE == "cq2" || itemToCompare.CODE == "aqv" || itemToCompare.CODE == "cqv") { itemToCompare.QUANTITY = 500; character.CHARSTAT70 = 500; }
				itemToCompare.DEF = Math.ceil((~~itemToCompare.base_defense * (1+~~item.ethereal*0.5) * (1+~~item.e_def/100+~~item.sup/100)) + ~~item.defense + Math.floor(~~item.defense_per_level*character.CLVL))
				itemToCompare.REQ_STR = Math.ceil(~~itemToCompare.req_strength * (1+(~~itemToCompare.req/100)) - ~~itemToCompare.ethereal*10)
				itemToCompare.REQ_DEX = Math.ceil(~~itemToCompare.req_dexterity * (1+(~~itemToCompare.req/100)) - ~~itemToCompare.ethereal*10)
				itemToCompare.BLOCK = ~~itemToCompare.block + ~~itemToCompare.ibc
				itemToCompare.ITEMSTAT17 = ~~itemToCompare.e_damage + ~~itemToCompare.damage_bonus
				itemToCompare.ITEMSTAT7 = itemToCompare.life
				// TODO: Add more codes that aren't handled properly by codes[code]
			} else {
				itemToCompare.SUP = false
				itemToCompare.ETH = false
				for (affix in itemToCompare) {
					for (code in codes) { if (affix == code) { itemToCompare[codes[code]] = 0 } }
					if (typeof(unequipped[affix]) != 'undefined') { if (affix != "base_damage_min" && affix != "base_damage_max" && affix != "base_defense" && affix != "req_level" && affix != "req_strength" && affix != "req_dexterity" && affix != "durability" && affix != "baseSpeed" && affix != "range" && affix != "throw_min"  && affix != "throw_max" && affix != "base_min_alternate" && affix != "base_max_alternate" && affix != "block" && affix != "velocity") { itemToCompare[affix] = unequipped[affix] } }	// doesn't include all 'base' affixes... fix?
				}
				//character.CHARSTAT70 = 0;
				itemToCompare.DEF = ~~itemToCompare.base_defense
				itemToCompare.REQ_STR = ~~itemToCompare.req_strength
				itemToCompare.REQ_DEX = ~~itemToCompare.req_dexterity
				itemToCompare.BLOCK = ~~itemToCompare.block
				itemToCompare.ITEMSTAT17 = 0
			}
			itemToCompare.ITEMSTAT31 = itemToCompare.DEF
			itemToCompare.ITEMSTAT18 = itemToCompare.ITEMSTAT17
			itemToCompare.ITEMSTAT7 = itemToCompare.life
			
			// TODO: Validate ILVL
		} } }
		if (typeof(itemToCompare.RW) == 'undefined') { itemToCompare.RW = false }
		if (typeof(itemToCompare.NMAG) == 'undefined') { itemToCompare.NMAG = false }
		if (typeof(itemToCompare.ETH) == 'undefined') { itemToCompare.ETH = false }
		if (typeof(itemToCompare.SOCK) == 'undefined') { itemToCompare.SOCK = 0 }
		simulate()
	}
}

// simulate - begins the filter simulation process
// ---------------------------------
function simulate(manual) {
	settings.nowrap_width = 800;
//	console.log("background color line 279: ",mappedbgcolor)
	//document.body.style.cursor = "wait";
	if (settings.auto_simulate == 0) { document.getElementById("o5").innerHTML = "Auto-Simulate is disabled. Click the 'ground' to simulate manually." }
	else { document.getElementById("o5").innerHTML = "Auto-Simulate is enabled - the simulation updates when character/item changes are made. Click the 'ground' to simulate manually." }
	document.getElementById("multiple_spacing").innerHTML = ""
	if (settings.num_filters == 2) { document.getElementById("multiple_spacing").innerHTML = "<br>" }
	if (document.getElementById("dropdown_group").selectedIndex > 9) { document.getElementById("select_price").style.display = "none" }
	document.getElementById("o4").innerHTML = ""
	if (settings.auto_simulate == 1 || manual == 1) {
		for (n in notices) { notices[n] = 0 }
		document.getElementById("output_spacing").innerHTML = ""
		document.getElementById("o3").innerHTML = ""
		for (let num = 1; num <= settings.num_filters; num++) {
			document.getElementById("o"+num).innerHTML = ""
			document.getElementById("output_"+num).innerHTML = ""
			document.getElementById("item_desc"+num).innerHTML = ""
		}
		// compare item/character info
		var same_both_filters = true;
		var same_itemchar_info = true;
		for (stat in itemToCompare) { if (typeof(item_old) != 'undefined') { if (itemToCompare[stat] != item_old[stat]) { same_itemchar_info = false } } else { same_itemchar_info = false } }
		for (stat in item_old) { if (typeof(itemToCompare) != 'undefined') { if (item_old[stat] != itemToCompare[stat]) { same_itemchar_info = false } } else { same_itemchar_info = false } }
		for (stat in character) { if (typeof(character_old) != 'undefined') { if (character[stat] != character_old[stat]) { same_itemchar_info = false } } else { same_itemchar_info = false } }
		for (stat in character_old) { if (typeof(character) != 'undefined') { if (character_old[stat] != character[stat]) { same_itemchar_info = false } } else { same_itemchar_info = false } }
		for (stat in settings) { if (settings[stat] != settings_old[stat]) { same_itemchar_info = false } }	// only 1-way comparison needed, new settings are never added

		for (let num = 1; num <= settings.num_filters; num++) {
			var same_filter_info = true;
			var result = ["",""];
			if (document.getElementById("filter_text_"+num).value != "") {
				if (document.getElementById("o3").innerHTML == "") {
					// compare filter text and item/character info, only call parseFile() if when there have been changes
					var filter_text_new = document.getElementById("filter_text_"+num).value;
					if (filter_text_new != filter[num].text) { same_filter_info = false; same_both_filters = false; }
					if (same_itemchar_info == false || same_filter_info == false) {
						result = parseFile(filter_text_new,num)		// TODO: Is there a way to handle parseFile() crashes, so that Filter #2 can still be evaluated even if #1 fails? Would also help reduce duplicated code for error/notification messages as well... SO MANY work-arounds due to this issue!
						filter[num].result = result
						filter[num].o = document.getElementById("o"+num).innerHTML
					} else {
						result = filter[num].result
						document.getElementById("o"+num).innerHTML = filter[num].o
					}
				}
			}
			document.getElementById("output_"+num).innerHTML = result[0]
			document.getElementById("item_desc"+num).innerHTML = result[1]
			var wid = Math.floor(document.getElementById("output_area_"+num).getBoundingClientRect().width/2 - document.getElementById("output_"+num).getBoundingClientRect().width/2);
			var hei = Math.floor(document.getElementById("output_area_"+num).getBoundingClientRect().height/2 - document.getElementById("output_"+num).getBoundingClientRect().height/2);
			document.getElementById("output_"+num).style.left = wid+"px"
			document.getElementById("output_"+num).style.top = hei+"px"
			// dynamic add mappedbgcolor for the entire area?
//			document.getElementById("output_"+num).style.backgroundColor = "Black"
//			document.getElementById("output_"+num).style.backgroundColor = mappedbgcolor
			if (num == 1 && document.getElementById("filter_text_2").value != "") { document.getElementById("output_spacing").innerHTML = "<br>" }
			if (settings.nowrap == true) { document.getElementById("o"+num).style.width = settings.nowrap_width+"px" }
			else { document.getElementById("o"+num).style.width = "auto" }
		}
		// store filter text and item/character info
		filter[1].text = document.getElementById("filter_text_1").value
		filter[2].text = document.getElementById("filter_text_2").value
		item_old = {}
		character_old = {}
		settings_old = {}
		for (stat in itemToCompare) { item_old[stat] = itemToCompare[stat] }
		for (stat in character) { character_old[stat] = character[stat] }
		for (stat in settings) { settings_old[stat] = settings[stat] }
	}
	var messages = ""
	if (notices.encoding == 1) { messages += "<br>An encoding issue may be preventing � characters from appearing correctly." }
	if (notices.duplicates == 1) { messages += "<br>When two rules have identical conditions, the first rule gets checked twice instead of both rules being checked. (Not simulated)" }
	if (notices.pd2_conditions == 1) { messages += "<br>PD2 code(s) detected - the PD2 version of FilterBird can be enabled from the menu." }
	if (notices.pod_conditions == 1) { messages += "<br>PoD code(s) detected - the PoD version of FilterBird can be enabled from the menu." }
	//if (notices.colors == 1) {messages += "<br>Unsupported color keywords detected. Keywords such as %LIGHT_GRAY% just default to %GRAY% in PD2." }
	if (same_both_filters == true) { messages = messages_old }
	messages_old = messages
	document.getElementById("o4").innerHTML = messages
	//document.body.style.cursor = "auto";
}

// loadFileAsText - loads text from a file
// ---------------------------------
function loadFileAsText(num) {
	var fileToLoad = document.getElementById("fileToLoad_"+num).files[0];
	var textFromFileLoaded = "";
	var fileReader = new FileReader();
	fileReader.onload = function(fileLoadedEvent) {
		textFromFileLoaded = fileLoadedEvent.target.result;
		document.getElementById("filter_text_"+num).value = fileLoadedEvent.target.result;
		simulate()
	};
	fileReader.readAsText(fileToLoad, "UTF-8");
}

// clearText - clears the text from the text area
// ---------------------------------
function clearText(num) {
	document.getElementById("filter_text_"+num).value = "";
}

function extractStyleFromFile(file) {
    const stmacros = {}; // Dictionary to store extracted macros

    // Updated regex: handles line breaks properly between parts of the macro definition
    const styleRegex = /ItemStyle\s*\[(.*?)\]\s*:\s*(.+)/g;

    let match;

    // Safely iterate over all matches in the file
    while ((match = styleRegex.exec(file)) !== null) {
        const styleName = match[1].trim(); // Extract macro name
        const styleValue = match[2].trim(); // Extract macro value
        stmacros[styleName] = styleValue;
//		console.log("style found: ", styleName)
    }
//	console.log("styles found: ", stmacros)
    return stmacros;
}

function extractMacrosFromFile(file) {
    const macros = {}; // Dictionary to store extracted macros

    // Updated regex: handles line breaks properly between parts of the macro definition
    const macroRegex = /TextMacro\s*\[(.*?)\]\s*:\s*(.+)/g;

    let match;

    // Safely iterate over all matches in the file
    while ((match = macroRegex.exec(file)) !== null) {
        const macroName = match[1].trim(); // Extract macro name
        const macroValue = match[2].trim(); // Extract macro value
        macros[macroName] = macroValue;
    }

    return macros;
}

function extractItemListsFromFile(file) {
    const itemLists = {};

    const listRegex = /ItemList\[(\w+)\]:([^\n\r]*)/g;
    let match;
    while ((match = listRegex.exec(file)) !== null) {
        const listName = match[1].trim();
        const items = match[2].trim();
        itemLists[listName] = items;
    }

    return itemLists;
}



//// Example definitions for macros and styles
//var textMacros = {
//    okuniq: '%YELLOW%»%TAN%»%GRAY%»     %RED%%NAME%%GRAY%     «%TAN%«%YELLOW%«',
//	runename: '%ORANGE%  %RUNENAME%  %GOLD%[%RUNETIER%]',
//};
//
//var itemStyles = {
//    okuniqs: 'BorderColor = 111, BorderSize = 2, BackgroundColor = 203, NotificationColor = ORANGE',
//	rune: 'MapIcon = 75, MapIconColor = 5, BorderColor = 111, BorderSize = 2, BackgroundColor = 75, NotificationColor = PURPLE, NotificationPriority = HIGH, NotificationSound = corb2, NotificationSoundPriority = HIGH',
//};

// parseFile - parses the filter file line by line
//	file: text of the filter
//	num: filter number (1 or 2)
// ---------------------------------
function parseFile(file,num) {
	file = file.replace(
		/EnableIf\[(.*?)\]\s*([\s\S]*?)\s*EndIf\[\]/g,
		(fullMatch, enableCondition, blockContent) => {
		  const condition = enableCondition.trim();
	  
		  const updatedBlock = blockContent
			.split("\n")
			.map(line => {
				line = line.replace(/^\s+/, ""); // remove all leading whitespace
				line = line.replace(/%?STAT\((\d+)\)%?/g, "ITEMSTAT$1");
				const match = line.match(/^(\s*ItemDisplay\[\s*)([^\]]*)(\s*\]:.*)$/);
				if (match) {
				  const prefix = match[1];
				  const currentConditions = match[2].trim();
				  const suffix = match[3];
			  
				  const newConditions = currentConditions
					? `${condition} ${currentConditions}`
					: condition;
			  
				  return `${prefix}${newConditions}${suffix}`;
				}
				return line;
			  })
							  .join("\n");
	  
		  // 🔁 Re-wrap the updated block in EnableIf and EndIf lines to preserve line numbers
		  return `EnableIf[${condition}]\n${updatedBlock}\nEndIf[]`;
		}
	  );
		
	const textMacros = extractMacrosFromFile(file);
	const styleMacros = extractStyleFromFile(file);
	const itemLists = extractItemListsFromFile(file);
	var errors = 0;
	var display = "";
	var description = "";
	var desc_output = "";
	var desc_output_total = "";
	var all_conditions = [];
	var all_line_nums = [];
	var name_saved = itemToCompare.NAME;
	var border = "";
	var bgcolor = "";
	let mappedbgcolor = "";
	let mappedborder = "";
	if (!(itemToCompare.NMAG == true && itemToCompare.RW != true) && itemToCompare.MAG != true) {	// setup variables to accomodate item names that use multiple lines
		if (typeof(itemToCompare.base) != 'undefined') {
			if (itemToCompare.ID == true) {
				if (itemToCompare.RW == true) {
					name_saved = itemToCompare.base+"‗%GOLD%"+itemToCompare.NAME
				} else {
					name_saved = itemToCompare.base+"‗"+itemToCompare.NAME
				}
			} else {
				name_saved = itemToCompare.base;
			}
		}
	}
	if (itemToCompare.ID == false) {
		if (typeof(itemToCompare.base) == 'undefined') { name_saved = itemToCompare.NAME }	// TODO: remove after fixing premade items?
		else { name_saved = itemToCompare.base }
	}
	if (typeof(itemToCompare.color_stuck) != 'undefined') { name_saved = "%"+itemToCompare.color_stuck+"%"+name_saved }
	if (settings.version == 0 && itemToCompare.type == "rune") { name_saved = "%ORANGE%"+name_saved }
	var display_default = "<l style='color:"+colors[getColor(itemToCompare)]+"'>"+name_saved+"</l>";
//	var display_default = "<l style='color:"+colors[getColor(itemToCompare)]+" " + border +"'>"+name_saved+"</l>";
	console.log("Display: ", display_default)
	var output_total = name_saved;
	var done = false;
	var continued = 0;
	var rules_checked = 0;
	var lines = file.split("\t").join("").split("­").join("•").split("\n");
	var lines_with_tabs = file.split("­").join("•").split("\n");
	var line_num = 0;
	for (line in lines) { if (done == false) {
		line_num = Number(line)+1;

		document.getElementById("o3").innerHTML += "<br>ERROR: Cannot Evaluate<br>"+"#"+num+" Invalid formatting on line "+line_num+" (rule "+(rules_checked+1)+") ... "+"<l style='color:#aaa'>"+file.split("­").join("•").split("\n")[line]+"</l><br>Please copy/paste that line and give it to Qord, or just tell him the filter and line # that fails<br>Failure is from " + itemDisplayLine	// gets displayed if the function halts unexpectedly at any point
//		console.log("Invalid formatting: ", line)
		var rule = lines[line].split("/")[0];
		var rule_with_tabs = lines_with_tabs[line].split("/")[0];
		var index = rule.indexOf("ItemDisplay[");
		if (line_num !== -1) {
			mappedbgcolor = "";
            // Extract the ItemDisplay line
            var itemDisplayLine = rule_with_tabs;

            // Step 1: Replace macros (%!macro!%)
            itemDisplayLine = itemDisplayLine.replace(/%!(.*?)!%/g, (match, macroName) => {
                return textMacros[macroName] || match;
            });

			itemDisplayLine = itemDisplayLine.replace(/ItemDisplay\[\s*ITEMS\(([^)\]]+)\)\s*\]/g, (match, listName) => {
				if (itemLists[listName]) {
					const orSeparated = itemLists[listName].split(/\s+/).join(" OR ");
					return `ItemDisplay[${orSeparated}]`;
				}
				return match;
			});
						
            // Step 2: Replace styles (<<style>>)
            itemDisplayLine = itemDisplayLine.replace(/<<(.*?)>>/g, (match, styleName) => {
				return styleMacros[styleName] || match;
            });

			itemDisplayLine = itemDisplayLine.replace(/<:(.*?):(.*?)>/g, (match, styleName, overrides) => {
				const baseStyle = styleMacros[styleName.trim()];
				if (!baseStyle) return match; // unknown style fallback
			
				// Parse base style into a map
				const styleMap = {};
				baseStyle.split(',').forEach(entry => {
					const [key, value] = entry.split('=').map(part => part.trim());
					if (key && value !== undefined) styleMap[key] = value;
				});
			
				// Robust key=value parser that allows complex values like RGB(...) or quoted strings
				const overrideRegex = /(\w+)\s*=\s*((".*?"|'[^']*?'|RGB\([^)]*\)|[^,]+))/g;
				let matchOverride;
				while ((matchOverride = overrideRegex.exec(overrides)) !== null) {
					const [, key, rawValue] = matchOverride;
					const value = rawValue.trim();
					styleMap[key] = value;
				}
			
				// Rebuild result
				return Object.entries(styleMap)
					.map(([k, v]) => `${k} = ${v}`)
					.join(', ');
			});
						
			// separate double %'s
			itemDisplayLine = itemDisplayLine.replace('%%', '% %')
			// make sure there's a space after any closing elipse
//			itemDisplayLine = itemDisplayLine.replace(')', ') ')
			itemDisplayLine = itemDisplayLine.replace(', ,', ', ').replace(', ,', ', ').replace(', ,', ', ').replace(', ,', ', ').replace(', ,', ', ')

			// remove extra spaces on either side of an equal sign so we can remove things better
//			itemDisplayLine = itemDisplayLine.replace('  ', ' ').replace('  ', ' ').replace('  ', ' ').replace('  ', ' ').replace('  ', ' ').replace('  ', ' ').replace('  ', ' ').replace('  ', ' ');
			itemDisplayLine = itemDisplayLine.replace(' = ', '=').replace(' = ', '=').replace(' = ', '=').replace(' = ', '=').replace(' = ', '=').replace(' = ', '=').replace(' = ', '=').replace(' = ', '=').replace(' = ', '=').replace(' = ', '=').replace(' = ', '=').replace(' = ', '=').replace(' = ', '=');

			
			console.warn("Updated display line after ifs: " + itemDisplayLine)
//			itemDisplayLine = itemDisplayLine.replace(/AND !PLRCLASS\(.*?\)|AND PLRCLASS\(.*?\)|PLRCLASS\(.*?\)|!PLRCLASS\(.*?\),/g, "");
			itemDisplayLine = itemDisplayLine.replace(/Notifica(.*?)[\),]?\s+/g, " ");
			itemDisplayLine = itemDisplayLine.replace(/Notif.*?\)\,?/g, " ");
			itemDisplayLine = itemDisplayLine.replace(/\bBackgroundColor\s*=\s*(\d+),?/g, '%bgcolor($1)%');
			// itemDisplayLine = itemDisplayLine.replace(/\bBorderColor\s*=\s*(\d+)\b/g, '%BORDER($1)%');
			itemDisplayLine = itemDisplayLine.replace("NotificationPriority=HIGH,", " ")
				.replace("NotificationPriority=MEDIUM,", "")
				.replace("NotificationPriority=LOW,", "")
				.replace("NotificationPriority=HIGH", "")
				.replace("NotificationPriority=MEDIUM", "")
				.replace("NotificationPriority=LOW", "");
			itemDisplayLine = itemDisplayLine.replace("NotificationSoundPriority=HIGH,", " ")
				.replace("NotificationSoundPriority=MEDIUM,", "")
				.replace("NotificationSoundPriority=LOW,", "")
				.replace("NotificationSoundPriority=HIGH", "")
				.replace("NotificationSoundPriority=MEDIUM", "")
				.replace("NotificationSoundPriority=LOW", "");
//			itemDisplayLine = itemDisplayLine.replace(/NotificationSound\s*=\s*(\d+)\b/g, " ").replace(/NotificationSound\s*=\s*(\d+)\b/g, "");
//			itemDisplayLine = itemDisplayLine.replace(/NotificationSound\s*=\s*(".*?"|\S+)/g, " ");
			itemDisplayLine = itemDisplayLine.replace(/NotificationSound\s*=\s*(".*?"|\S+),?/g, " ");
			itemDisplayLine = itemDisplayLine.replace(/MapIcon\s*=\s*(\d+)\b[\),]*/g, " ");
			itemDisplayLine = itemDisplayLine.replace(/%mapicon\(\s*([0-9a-fA-F]{1,2})(?:\s*,\s*[0-9a-fA-F]{1,2})?\s*\)%/gi, " ");

//			itemDisplayLine = itemDisplayLine.replace(/%?MapIcon\s*=\s*\d+[\),]*%?/g, " ");
			itemDisplayLine = itemDisplayLine.replace(/MapIconColor\s*=\s*(\d+)\b[\),]*/g, " ");
			itemDisplayLine = itemDisplayLine.replace(/BorderSize\s*=\s*(\d+)\b[\),]*/g, " ");
			itemDisplayLine = itemDisplayLine.replace(/BorderColor\s*=\s*\d+,?/g, " ");
//			itemDisplayLine = itemDisplayLine.replace(/MapIconColor\s*=\s*(\d+)\b/g, "").replace(/MapIconColor\s*=\s*(\d+)\b/g, "");
//			itemDisplayLine = itemDisplayLine.replace(/BorderSize\s*=\s*(\d+)\b/g, "").replace(/BorderSize\s*=\s*(\d+)\b/g, "");
			// remove extra spaces
			itemDisplayLine = itemDisplayLine.replace(/\s{2,}/g, " ");
			// replace double commas with single comma
			itemDisplayLine = itemDisplayLine.replace(/,\s*,+/g, ", ");
//			itemDisplayLine = itemDisplayLine.replace('  ', ' ').replace('  ', ' ').replace('  ', ' ').replace('  ', ' ').replace('  ', ' ').replace('  ', ' ').replace('  ', ' ').replace('  ', ' ');
//			itemDisplayLine = itemDisplayLine.replace(', ,', ', ').replace(', ,', ', ').replace(', ,', ', ').replace(', ,', ', ').replace(', ,', ', ')
//			itemDisplayLine = itemDisplayLine.replace('  ', ' ').replace('  ', ' ').replace('  ', ' ').replace('  ', ' ').replace('  ', ' ').replace('  ', ' ').replace('  ', ' ').replace('  ', ' ');
//			itemDisplayLine = itemDisplayLine.replace(', ,', ', ').replace(', ,', ', ').replace(', ,', ', ').replace(', ,', ', ').replace(', ,', ', ')
			itemDisplayLine = itemDisplayLine.replace(/%SPACE%,?|%SPACE%/g, " ");
			itemDisplayLine = itemDisplayLine.replace("%BOLD%", "%BLACK%");

//			itemDisplayLine = itemDisplayLine.replace(/!?PLRCLASS\((.*?)\)/g, "$1");			
//			itemDisplayLine = itemDisplayLine.replace(/<<(.*?)>>/g, () => {
//				return ""; // Replace with an empty string
//			});
			// itemname and basename "fixes", really just replacing them with %name% for now
			itemDisplayLine = itemDisplayLine.replace('%ITEMNAME%', '%NAME%');
			itemDisplayLine = itemDisplayLine.replace('%BASENAME%', '%NAME%');

			itemDisplayLine = itemDisplayLine.replace(/SKILL\("([^"]+)"\)/g, (match, skillName) => {
				const skillCode = skillIndexMap[skillName]; // Lookup the skill code
				if (skillCode !== undefined) {
					console.warn("Skill " + skillName + " replaced by SK" + skillCode)
					return `SK${skillCode}`; // Replace with SK##
				} else {
					console.warn(`Skill not found in map: ${skillName}`);
					return match; // Leave it unchanged if not in the map
				}
			});
//			console.log("New DisplayLine after skill sub: " + itemDisplayLine);

			// remove some style elements
//			itemDisplayLine = itemDisplayLine.replace('%BASENAME%', '%NAME%');

			// Proof of concept for finding item based on name, but fails where ring or amulet
			// Need to do this differently
			// Step 1: Extract the item name from the filter line
			let unimatch = itemDisplayLine.match(/UNIQUE\("([^"]+)"\)/);
			if (unimatch) {
				const itemName = unimatch[1]; // Extracted name ("Heavenly Garb")
				console.log("UNIQUE match found:", unimatch[0], ",", itemName);
			
				let item = null;
			
				// Search through all equipment subcategories
				for (const subcategory of Object.keys(equipment)) {
					item = equipment[subcategory].find(e => e.name === itemName);
					if (item) break; // Stop early if found
				}
			
				if (item) {
					console.log("Found item in subcategory:", item);
			
					// Normalize the base name
					const baseName = item.base.replace(/\s+/g, "_"); // "Light Plate" -> "Light_Plate"
					const base = bases[baseName];
			
					if (base) {
						const code = base.CODE; // Get the CODE ("ltp")
						console.log("UNIQUE item code found:", code);
			
						// Replace UNIQUE(...) correctly
						itemDisplayLine = itemDisplayLine.replace(
							/UNIQUE\("([^"]+)"\)/,
							`UNI ${code}`
						);
			
						console.log("UNIQUE line changed to:", itemDisplayLine);
					} else {
						console.error(`Base "${baseName}" not found in bases.`);
					}
				} else {
					console.error(`Item "${itemName}" not found in any subcategory of equipment.`);
				}
			} else {
				// No UNIQUE(...) match found
			}

			let setmatch = itemDisplayLine.match(/SET\("([^"]+)"\)/);
			if (setmatch) {
				const itemName = setmatch[1]; // Extracted name ("Heavenly Garb")
				console.log("SET match found:", setmatch[0], ",", itemName);
			
				let item = null;
			
				// Search through all equipment subcategories
				for (const subcategory of Object.keys(equipment)) {
					item = equipment[subcategory].find(e => e.name === itemName);
					if (item) break; // Stop early if found
				}
			
				if (item) {
					console.log("Found SET item in subcategory:", item);
			
					// Normalize the base name
					const baseName = item.base.replace(/\s+/g, "_"); // "Light Plate" -> "Light_Plate"
					const base = bases[baseName];
			
					if (base) {
						const code = base.CODE; // Get the CODE ("ltp")
						console.log("SET item code found:", code);
			
						// Replace UNIQUE(...) correctly
						itemDisplayLine = itemDisplayLine.replace(
							/SET\("([^"]+)"\)/,
							`SET ${code}`
						);
			
						console.log("SET line changed to:", itemDisplayLine);
					} else {
						console.error(`Base "${baseName}" not found in bases.`);
					}
				} else {
					console.error(`Item "${itemName}" not found in any subcategory of equipment.`);
				}
			} else {
				// No SET(...) match found
			}

			// Replace generic quoted item names with their item/base CODE, if possible
			itemDisplayLine = itemDisplayLine.replace(/"([^"]+)"/g, (match, name) => {
				// Skip if already handled elsewhere (optional: add exclusions)
				if (name.startsWith('%') || name.endsWith('%')) return match;

				let foundCode = null;

				// Search for matching item name in equipment
				Object.keys(equipment).forEach(subcategory => {
					const item = equipment[subcategory].find(e => e.name === name);
					if (item) {
						// If item has a base and no CODE, try looking up code via base
						if (!item.CODE && item.base) {
							const baseName = item.base.replace(/\s+/g, "_");
							if (bases[baseName]) {
								foundCode = bases[baseName].CODE;
							}
						} else if (item.CODE) {
							foundCode = item.CODE;
						}
					}
				});

				// Only replace if we successfully found a code
				if (foundCode) {
					console.log(`Replaced "${name}" with code: ${foundCode}`);
					return foundCode;
				} else {
					return match; // Leave unchanged
				}
			});


//			console.warn("The final displayline before rule with tabs: " + itemDisplayLine)
            // Step 3: Update `rule_with_tabs` with the substituted line for further processing
//            rule_with_tabs = itemDisplayLine.split("­").join("•").split("\n");

            rule_with_tabs = itemDisplayLine.split("/")[0];
//			rule_with_tabs = itemDisplayLine;			
		console.log("Rule with tabs: "  + rule_with_tabs)
            // Process the updated `rule_with_tabs` string dynamically in subsequent logic
		}
// SKILL Fails after here		
		var index_with_tabs = rule_with_tabs.indexOf("ItemDisplay[");
		console.log("Index with tabs: " + index_with_tabs)
		var index_end = rule.indexOf("]:");
		
		if (settings.validation == 1 && errors < settings.max_errors) {
			if (!(rule_with_tabs.substring(0,rule_with_tabs.indexOf("ItemDisplayFilterName[]:")).length == 0)) {
				if (!(index >= 0 && rule_with_tabs.substring(0,index_with_tabs).length == 0) && rule_with_tabs.length > 0) { document.getElementById("o"+num).innerHTML += "#"+num+" Improper formatting on line "+line_num+" ... "+"<l style='color:#aaa'>"+file.split("­").join("•").split("\n")[line]+"</l><br>"; errors++; }	// displays an error if the line is not a rule and has other characters prior to any "/" characters
			}
		}
		if (index >= 0 && rule_with_tabs.substring(0,index_with_tabs).length == 0) {	// line begins with ItemDisplay[
			rules_checked += 1
			var match = false;
			var formula = "";
//			var conditions = rule.substring(0,index).concat(rule.substring(index+12)).split("]:")[0];
			var conditions = rule_with_tabs.substring(0,index_with_tabs).concat(rule_with_tabs.substring(index_with_tabs+12)).split("]:")[0];
//			console.log("condition: " + conditions)
// SKILL Fails before here
			while (conditions.includes("  ")) { conditions = conditions.split("  ").join(" "); }	// remove multiple spaces within conditions
			conditions = conditions.split("( ").join("(").split(" )").join(")")						// removes extra spaces within parentheses
//			var output = lines_with_tabs[line].substring(0,index).concat(lines_with_tabs[line].substring(index+12)).split("]:")[1];
			var output = rule_with_tabs.split("]:")[1];
			if (conditions[0] == " " || conditions[conditions.length-1] == " ") {
				//if (settings.validation == 1 && errors < settings.max_errors) { document.getElementById("o"+num).innerHTML += "#"+num+" Irregular formatting on line "+line_num+" ... "+"<l style='color:#aaa'>"+file.split("­").join("•").split("\n")[line]+"</l><br>"; errors++; }	// displays an error if the rule's conditions have space on either side (cosmetic only)
				conditions = conditions.trim()
//				console.log("condition: " + conditions)
			}
			// check duplicate conditions
			if (settings.validation == 1 && errors < settings.max_errors) {
				var duplicateConditions = false;
				var duplicateConditionsContinue = false;
				if (all_conditions.includes(conditions) == true) {
					duplicateConditions = true
					duplicateConditionsContinue = lines[all_line_nums[all_conditions.indexOf(conditions)]-1].includes("%CONTINUE%");
					// TODO: Check others if more than 2 duplicate rules
				}
				all_conditions[all_conditions.length] = conditions
				all_line_nums[all_line_nums.length] = line_num
				if (duplicateConditions == true) {
					if (duplicateConditionsContinue == true) {
						if (settings.version == 0) {
							document.getElementById("o"+num).innerHTML += "#"+num+" Inadvisable formatting (lines "+all_line_nums[all_conditions.indexOf(conditions)]+" and "+line_num+" have identical conditions) ... "+"<l style='color:#aaa'>"+file.split("­").join("•").split("\n")[line]+"</l><br>"; errors++;	// displays an error if the rule's conditions exactly match a previous line		// TODO: Also display for PD2 if the rules are adjacent (i.e. no reason not to just use 1 rule instead)
							if (notices.duplicates == 0) { document.getElementById("o4").innerHTML += "<br>When two rules have identical conditions, the first rule gets checked twice instead of both rules being checked. (Not simulated)" }
							notices.duplicates = 1
						}
					} else {
						document.getElementById("o"+num).innerHTML += "#"+num+" Inadvisable formatting (lines "+all_line_nums[all_conditions.indexOf(conditions)]+" and "+line_num+" have identical conditions) ... "+"<l style='color:#aaa'>"+file.split("­").join("•").split("\n")[line]+"</l><br>"; errors++;	// displays an error if the rule's conditions exactly match a previous line (inaccessible)
					}
				}
			}
			if (index_end > index+12 && rule.substring(0,index).length == 0) {
				conditions = conditions.split(",").join("‚")	// Refactors "MULTI" conditions since they use commas (uses the "Single low-9 quotation mark" instead of "comma")
				conditions = conditions.replace(/%NOTIFY.*?%/g, '');
//				conditions = conditions.replace(/%ITEMNAM*?%/g, '%NAME%');
//				conditions = conditions.replace(/%BASENAM*?%/g, '%NAME%');
				var match_override = false;
//				var cond_format = conditions.split("  ").join(" ").split("(").join(",(,").split(")").join(",),").split("!").join(",!,").split("<=").join(",≤,").split(">=").join(",≥,").split(">").join(",>,").split("<").join(",<,").split("=").join(",=,").split(" AND ").join(" ").split(" and ").join(" ").split(" OR ").join(",|,").split(" or ").join(",|,").split("+").join(",+,").split(" ").join(",&,").split(",,").join(",");
				var cond_format;

				// Initialize an empty array to store any untouched segments
				var untouchedSegments = [];

				// Step 1: Check for SET("...") or UNIQUE("...")
				let setMatch;
				while ((setMatch = conditions.match(/SET\("([^"]+)"\)/))) { // Extract all SET(...) instances
					untouchedSegments.push({ type: 'SET', value: setMatch[1] }); // Track type and value
					conditions = conditions.replace(setMatch[0], `SET_PLACEHOLDER_${untouchedSegments.length - 1}`); // Add unique placeholder
				}
				
				let uniqueMatch;
				while ((uniqueMatch = conditions.match(/UNIQUE\("([^"]+)"\)/))) { // Extract all UNIQUE(...) instances
					untouchedSegments.push({ type: 'UNIQUE', value: uniqueMatch[1] }); // Track type and value
					conditions = conditions.replace(uniqueMatch[0], `UNIQUE_PLACEHOLDER_${untouchedSegments.length - 1}`); // Add unique placeholder
				}
				
				// Step 2: Apply transformations to the remaining conditions
				cond_format = conditions.split("  ").join(" ")
					.split("(").join(",(,")
					.split(")").join(",),")
					.split("!").join(",!,")
					.split("<=").join(",≤,")
					.split(">=").join(",≥,")
					.split(">").join(",>,")
					.split("<").join(",<,")
					.split("=").join(",=,")
					.split(" AND ").join(" ")
					.split(" and ").join(" ")
					.split(" OR ").join(",|,")
					.split(" or ").join(",|,")
					.split("+").join(",+,")
					.split(" ").join(",&,")
					.split(",,").join(",");
				
				// Step 3: Reinsert untouched segments into the formatted string
				untouchedSegments.forEach((segment, index) => {
					const placeholder = segment.type === 'SET'
						? `SET_PLACEHOLDER_${index}`
						: `UNIQUE_PLACEHOLDER_${index}`;
					cond_format = cond_format.replace(placeholder, `"${segment.value}"`);
//					console.log(cond_format);
				});
				
				// Output
//				console.log(cond_format);


				var cond_list = cond_format.split(",");
				var neg_paren_close = 0;
				var c_falsify = false;
				var used_AND = 0;
				var used_OR = 0;
				var possible_logic_conflict = false;
				var unrecognized_list = [];
				var unrecognized_conditions = false;
				for (cond in cond_list) {
//					console.log("cond: " + cond)
					cond = Number(cond)
					var c = cond_list[cond];
					// TODO: Check whether the "BETEEN" operator is present and reconfigure it to use multiple conditions with ">" and "<" (may need a different solution for PREFIX/SUFFIX/AUTOMOD)
					var nonbool_conditions = ["GOLD","RUNE","GEM","GEMLEVEL","GEMTYPE","QTY","DEF","LVLREQ","PRICE","ALVL","CRAFTALVL","QLVL","ILVL","SOCK","ED","MAXDUR","AR","RES","FRES","CRES","LRES","PRES","FRW","IAS","FCR","FHR","FBR","MINDMG","MAXDMG","STR","DEX","LIFE","MANA","MFIND","GFIND","MAEK","DTM","REPLIFE","REPAIR","ARPER","FOOLS","ALLSK","QUEST","SYNTH","SPECIAL","UNIQUE","PLRCLASS"];
					if (c == "GEM") { c = "GEMLEVEL" }
					if (c == "RUNENUM" || c == "RUNENAME" || c == "RUNETIER") { c = "RUNE" }
					if (c == "STORAGE") { c = "" }
					if (c == "PLRCLASS" || c == "!PLRCLASS") { c = "" }
					
//					if (c == "PLRCLASS" || c == "!PLRCLASS" || c == "AMA" || c == "BAR" || c == "DRU" || c == "NEC" || c == "ASS" || c == "PAL" || c == "SOR") { c = "" }
//					if (c == "MAPTIER" || c == "MAP") { c = "" }
//					if (c == "SYNTH") { c = "UNI" }
					if (c === "QUEST" && equipment.quest.some(item => item.CODE === itemToCompare.CODE)) {
						c = itemToCompare.CODE;
					}
					if (c == "QUEST") { c = "" }
					if (c === "SPECIAL" && equipment.quest.some(item => item.CODE === itemToCompare.CODE)) {
						c = itemToCompare.CODE;
					}
					if (c == "SPECIAL") { c = "UNI" }
					// Named uniques
					if (c == "UNIQUE") {
						// Extract the name within the UNIQUE parentheses
						const nameMatch = itemDisplay.match(/UNIQUE\("([^"]+)"\)/);
						console.log("UNIQUE Name to match " + nameMatch)
						const variableName = nameMatch ? nameMatch[1] : null; // Dynamically captured name
						console.log("UNIQUE Name to match2 " + variableName)
					
						// Extract the optional code (e.g., "lst") after the name
						const codeMatch = itemDisplay.match(/\b([a-zA-Z0-9]+)\b(?=\]?$)/);
						console.log("UNIQUE Name to match3 " + codeMatch)
						const variableCode = codeMatch ? codeMatch[1] : null; // Dynamically captured code
						console.log("UNIQUE Name to match4 " + variableCode)

						// Search across all sections of equipment
						const matchingItem = Object.values(equipment).flat().find(item => 
							item.name == variableName && (!variableCode || item.CODE === variableCode)
						);
					
						// Update 'c' if a matching item is found
						if (matchingItem) {
							c = matchingItem.name;
						}
						else{ c = "" }
					}
																				
					var number = false;
					var value_is_negative = false;
					if (isNaN(Number(c)) == false) { cond_list[cond] = Number(c); number = true; }
					if (((c == "GEMLEVEL" || c == "GEMTYPE") && itemToCompare.type != "gem") || (c == "RUNE" && itemToCompare.type != "rune") || (c == "GOLD" && itemToCompare.CODE != "GOLD")) { c_falsify = true }	// TODO: Other codes may work similarly to this, rather than simply being set to 0 if they aren't recognized (example: in PD2, DIFFICULTY matches on every item if it is 0, 1, or 2) ...but is it really worth implementing invalid codes correctly?
					if (number == false && c != "(" && c != ")" && c != "≤" && c != "≥" && c != "<" && c != ">" && c != "=" && c != "|" && c != "&" && c != "+" && c != "!") {
						// check valid conditions
						if (settings.validation == 1 && errors < settings.max_errors) {
							var pod_conditions = false;
							var recognized = false;
							var cr = c;
							if (isNaN(Number(cr[0])) == false) { cr = "_"+cr }
							if (typeof(all_codes[cr]) != 'undefined') {
								if (all_codes[cr] == 3 || (settings.version == 0 && all_codes[cr] == 1) || (settings.version == 1 && all_codes[cr] == 2)) { recognized = true }
								if (settings.version == 0 && all_codes[cr] == 2) {
									if (notices.pd2_conditions == 0) { document.getElementById("o4").innerHTML += "<br>PD2 code(s) detected - the PD2 version of FilterBird can be enabled from the menu." }
									notices.pd2_conditions = 1
								}
								if (settings.version == 1 && all_codes[cr] == 1) { pod_conditions = true }
							}
							if (cr.substr(0,8) == "CHARSTAT" || cr.substr(0,8) == "ITEMSTAT") { if (Number(cr.slice(8)) >= 0 && Number(cr.slice(8)) <= 500) {
								if (settings.version == 0) { recognized = true }
								else { pod_conditions = true }
							} }
							if (cr.substr(0,4) == "STAT") {
								if (Number(cr.slice(4)) >= 0 && Number(cr.slice(4)) <= 504) {
									recognized = true;
									cond_list[cond] = `STAT(${Number(cr.slice(4))})`; // ✅ parentheses instead of plain number
									c = cond_list[cond];
								}
							}
							if (cr.substr(0,2) == "SK") { if (Number(cr.slice(2)) >= 0 && Number(cr.slice(2)) <= 500) {
								recognized = true
								cond_list[cond] = ("SK"+Number(cr.slice(2)))
								c = cond_list[cond]
							} }
							if (cr.substr(0,2) == "CHSK") { if (Number(cr.slice(2)) >= 0 && Number(cr.slice(2)) <= 500) {
								recognized = true
								cond_list[cond] = ("CHSK"+Number(cr.slice(2)))
								c = cond_list[cond]
							} }
							if (cr.substr(0,2) == "OS") { if (Number(cr.slice(2)) >= 0 && Number(cr.slice(2)) <= 500) {
								recognized = true
								cond_list[cond] = ("SK"+Number(cr.slice(2)))
								c = cond_list[cond]
							} }
							if (pod_conditions == true) {
								if (notices.pod_conditions == 0) { document.getElementById("o4").innerHTML += "<br>PoD code(s) detected - the PoD version of FilterBird can be enabled from the menu." }
								notices.pod_conditions = 1
							}
							if (recognized == false) {
								unrecognized_conditions = true
								if (unrecognized_list.includes(c) == false) { unrecognized_list.push(c) }
							}
							// TODO: Add notice for recognized/valid conditions that aren't fully supported? Or are those all just conditions that can't be added to selectable items? (e.g. CHSK codes for PD2)
						}
						// refactor conditions
						if (c == "DIFF") { c = "DIFFICULTY" }				// these could be disabled (i.e. set to 0) for PD2 or PoD, but that wouldn't produce correct behavior since a value of 0 is normal
						else {
							if (c.substr(0,8) == "CHARSTAT") { c = "invalid_"+c; itemToCompare[c] = 0; }
							if (c == "GEMLEVEL" && itemToCompare[c] > 3 && itemToCompare.CODE.length == 3) { itemToCompare[c] = 0 }
						}
						if (settings.version == 0 && c == "FILTERLVL") { c = "FILTLVL" }
						if (settings.version == 1 && c == "CLASS") { c = "CLAZ" }
						// set condition values
						if (c == "CLVL" || c == "DIFFICULTY" || c.substr(0,8) == "CHARSTAT") {
							if (typeof(character[c]) == 'undefined') { character[c] = 0 }
							else if (~~Number(character[c]) < 0) { value_is_negative = true }
						}
						else if (typeof(itemToCompare[c]) == 'undefined' && (c.substr(0,4) == "STAT" || c.substr(0,5) == "TABSK" || c.substr(0,4) == "CLSK" || c.substr(0,2) == "SK" || c.substr(0,2) == "CHSK" || c.substr(0,2) == "OS")) { itemToCompare[c] = 0 }
						else if (typeof(itemToCompare[c]) == 'undefined') {
							for (let i = 0; i < nonbool_conditions.length; i++) {
								if (c == nonbool_conditions[i]) { itemToCompare[c] = 0 }
							}
							if (typeof(itemToCompare[c]) == 'undefined') { itemToCompare[c] = false }
						}
						else if (~~Number(itemToCompare[c]) < 0) { value_is_negative = true }
						// add to formula
						if (c_falsify == true) { formula += "false " }
						else if (c == "CLVL" || c == "DIFFICULTY" || c.substr(0,8) == "CHARSTAT" || c == "AMAZON" || c == "ASSASSIN" || c == "BARBARIAN" || c == "DRUID" || c == "NECROMANCER" || c == "PALADIN" || c == "SORCERESS" || c == "SHOP" || c == "EQUIPPED" || c == "FILTLVL") {
							if (value_is_negative == true) { formula += (2000000000+Number(character[c]))+" " }			// converts negative values to their equivalent 'unsigned' value
							else { formula += character[c]+" " }
						}
						else {
							if (value_is_negative == true) { formula += (2000000000+Number(itemToCompare[c]))+" " }		// converts negative values to their equivalent 'unsigned' value
							else { formula += itemToCompare[c]+" " }
						}
					} else {
						if (c_falsify == true) { if (number == true) { c_falsify = false } }
						else if (c == "!") { formula += "!" }
						else if (c == "&") { formula += "&& "; used_AND++; }
						else if (c == "|") { formula += "|| "; used_OR++; }
						else if (c == "=") { formula += "== " }
						else if (c == "≤") { formula += "<= " }
						else if (c == "≥") { formula += ">= " }
						else {
							if (settings.validation == 1 && errors < settings.max_errors) { if (c == "(" || c == ")") { used_OR = 0; used_AND = 0; } }
							if (number == true) { if (Number(c) < 0) { value_is_negative = true } }
							if (value_is_negative == true) { formula += (2000000000+Number(c))+" " }					// converts negative values to their equivalent 'unsigned' value
							else { formula += c+" " }
						}
					}
					if (settings.validation == 1 && errors < settings.max_errors) { if (used_AND > 0 && used_OR > 0) { possible_logic_conflict = true } }
					// TODO: investigate how difficult it would be to check whether a rule includes mutually exclusive conditions (e.g. NMAG MAG, SUP INF, RW MAG, INF ETH, cap AXE, or multiple item codes)
					if (neg_paren_close > 0 && neg_paren_close == cond) { formula += ") "; neg_paren_close = 0; }
					if (c == "!" && cond_list.length > cond+3) { if ((isNaN(Number(cond_list[cond+1])) == false || isNaN(Number(cond_list[cond+3])) == false) && (cond_list[cond+2] == "=" || cond_list[cond+2] == ">" || cond_list[cond+2] == "<" || cond_list[cond+2] == "≤" || cond_list[cond+2] == "≥")) { formula += "( "; neg_paren_close = cond+3; } }
				}
				if (settings.validation == 1 && errors < settings.max_errors) {
					if (unrecognized_conditions == true) {
						// log unrecognized conditions to the console
						console.log("unrecognized conditions: ", unrecognized_list)
						var unrecognized_conditions_string = ": <l style='color:#c55'>"+unrecognized_list[0]+"</l>";
						var plural_s = "";
						if (unrecognized_list.length > 1) {
							plural_s = "s"
							for (let i = 1; i < unrecognized_list.length; i++) { unrecognized_conditions_string += ", <l style='color:#c55'>"+unrecognized_list[i]+"</l>" }
						}
						document.getElementById("o"+num).innerHTML += "#"+num+" Unrecognized condition"+plural_s+" on line "+line_num+unrecognized_conditions_string+" ... "+"<l style='color:#aaa'>"+file.split("\t").join(" ").split("­").join("•").split("\n")[line]+"</l><br>"; errors++;	// displays an error if the rule has any unrecognized/invalid conditions
					}
					if (possible_logic_conflict == true) { document.getElementById("o"+num).innerHTML += "#"+num+" Improper formatting on line "+line_num+": (logic operators AND/OR used together without parentheses) ... "+"<l style='color:#aaa'>"+file.split("\t").join(" ").split("­").join("•").split("\n")[line]+"</l><br>"; errors++; }	// displays an error if the rule uses OR and AND together without parentheses
				}
				match = eval(formula)
				//if (settings.validation == 1 && errors < settings.max_errors && unbounded_match_at_zero) { document.getElementById("o"+num).innerHTML += "#"+num+" Inadvisable formatting on line "+line_num+" (unbounded condition) ... "+"<l style='color:#aaa'>"+file.split("­").join("•").split("\n")[line]+"</l><br>"; errors++; }	// displays an error if the rule has unbounded conditions at zero	// TODO: Is this worth implementing? Impossible to know without seeing how the BH filter code functions in these cases
			} else {
				match = true
			}
			document.getElementById("o3").innerHTML += match
			
			//-----------------------------------------------------------------------------------------------------------
			// check output for invalid keywords		// TODO: reduce duplicated code
			if (settings.validation == 1 && errors < settings.max_errors) {
				var unrecognized_list = [];
				var unrecognized_keywords = false;
				var out_format = output.split("//")[0];
				
				// TODO: Rework this to check the conditions and ensure that it doesn't apply to identified items of magic rarity or higher
				// Checks name output (not description) for %NL% and displays an error if found
				//if (settings.version == 1) {
				//	if (out_format.includes("{") == true && out_format.indexOf("{") < out_format.lastIndexOf("}")) {
				//		var desc_output_temp = out_format.substring(out_format.indexOf("{"),out_format.indexOf("}")+1);
				//		var name_output_temp = out_format.replace(desc_output_temp,"");
				//		if (name_output_temp.includes("%NL%") == true) {
				//			document.getElementById("o"+num).innerHTML += "#"+num+" Invalid keyword on line "+line_num+": <l style='color:#cc5'>%NL%</l> (only useable in the item's description) ... "+"<l style='color:#aaa'>"+file.split("\t").join(" ").split("­").join("•").split("\n")[line]+"</l><br>"; errors++;	// displays an error if the rule includes any invalid uses of the %NL% keyword
				//		}
				//	}
				//}
				


				out_format = out_format.split(",").join("‾").split(" ").join(", ,").split("%CONTINUE%").join(",misc_CONTINUE,").split("%NAME%").join(",ref_NAME,").split("%ITEMNAME%").join(",ref_ITEMNAME,").split("%BASENAME%").join(",ref_BASENAME,").split("%WHITE%").join(",color_WHITE,").split("%GRAY%").join(",color_GRAY,").split("%BLUE%").join(",color_BLUE,").split("%YELLOW%").join(",color_YELLOW,").split("%GOLD%").join(",color_GOLD,").split("%GREEN%").join(",color_GREEN,").split("%BLACK%").join(",color_BLACK,").split("%TAN%").join(",color_TAN,").split("%PURPLE%").join(",color_PURPLE,").split("%ORANGE%").join(",color_ORANGE,").split("%RED%").join(",color_RED,").split("%PURPLE%").join(",color_PURPLE,").split("%COBALT%").join(",color_COBALT,").split("%PINK%").join(",color_PINK,").split("%ILVL%").join(",ref_ILVL,").split("%SOCKETS%").join(",ref_SOCK,").split("%PRICE%").join(",ref_PRICE,").split("%RUNENUM%").join(",ref_RUNE,").split("%RUNETIER%").join(",ref_RUNE,").split("%RUNENAME%").join(",ref_RUNENAME,").split("%GEMLEVEL%").join(",ref_GLEVEL,").split("%GEMTIER%").join(",ref_GLEVEL,").split("%GEMTYPE%").join(",ref_GTYPE,").split("%CODE%").join(",ref_CODE,").split("\t").join(",\t,").split("{").join(",{,").split("}").join(",},").split("‗").join(",‗,").replace(/%NOTIFY.*?%/g, "").replace(/%?STORAGE\([^)]*\)%?/gi, "").replace(/%?PLRCLASS\([^)]*\)%?/gi, "").replace(/%?!PLRCLASS\([^)]*\)%?/gi, "");
				// TODO: Change split/join replacements to use deliminator other than "_" between the identifying key and the keyword, so no exceptions need to be made when splitting off the keyword (e.g. for [DARK,GREEN] since it contains the deliminator)
				if (settings.version == 0) { out_format = out_format.split("%DGREEN%").join(",color_DGREEN,").split("%DPURPLE%").join(",color_DPURPLE,").split("%CLVL%").join(",ref_CLVL,") }
				else { out_format = out_format.split("%DGREEN%").join(",invalid_DGREEN,").split("%CLVL%").join(",invalid_CLVL,") }
				if (settings.version == 0) { out_format = out_format.split("%DARK_GREEN%").join(",color_DGREEN,").split("%QTY%").join(",ref_QUANTITY,").split("%RANGE%").join(",ref_range,").split("%WPNSPD%").join(",ref_baseSpeed,").split("%ALVL%").join(",ref_ALVL,").split("%NL%").join(",misc_NL,").split("%MAP%").join(",ignore_MAP,").split("MAPTIER").join(",ignore_MAP,").split("%NOTIFY-DEAD%").join(",ignore_NOTIFY-DEAD,").split("%LVLREQ%").join(",ref_reqlevel,").split("%CRAFTALVL%").join(",ref_CRAFTALVL,") }
				else { out_format = out_format.split("%MAP%").join(",ignore_MAP,").split("MAPTIER").join(",ignore_MAP,").split("%DARK_GREEN%").join(",color_DGREEN,").split("%NOTIFY-DEAD%").join(",ignore_NOTIFY-DEAD,") }		// TODO: would it be useful for 'known' keywords that don't do anything special in either PoD or PD2 (e.g. %LIGHT_GRAY%) to be treated differently?
				out_format = out_format.split("%LIGHT_GRAY%").join(",color_GRAY,").split("%CORAL%").join(",color_GRAY,").split("%SAGE%").join(",color_GRAY,").split("%TEAL%").join(",color_GRAY,")
//				if (settings.version == 0) { out_format = out_format.split("%QTY%").join(",ref_QUANTITY,").split("%RANGE%").join(",ref_range,").split("%WPNSPD%").join(",ref_baseSpeed,").split("%ALVL%").join(",ref_ALVL,").split("%NL%").join(",misc_NL,").split("%NOTIFY-ITEM%").join(",ignore_NOTIFY-ITEM,").split("%NOTIFY-WHITE%").join(",ignore_NOTIFY-WHITE,").split("%NOTIFY-GRAY%").join(",ignore_NOTIFY-GRAY,").split("%NOTIFY-BLUE%").join(",ignore_NOTIFY-BLUE,").split("%NOTIFY-YELLOW%").join(",ignore_NOTIFY-YELLOW,").split("%NOTIFY-TAN%").join(",ignore_NOTIFY-TAN,").split("%NOTIFY-GOLD%").join(",ignore_NOTIFY-GOLD,").split("%NOTIFY-GREEN%").join(",ignore_NOTIFY-GREEN,").split("%NOTIFY-DARK_GREEN%").join(",ignore_NOTIFY-DARK_GREEN,").split("%NOTIFY-BLACK%").join(",ignore_NOTIFY-BLACK,").split("%NOTIFY-PURPLE%").join(",ignore_NOTIFY-PURPLE,").split("%NOTIFY-RED%").join(",ignore_NOTIFY-RED,").split("%NOTIFY-ORANGE%").join(",ignore_NOTIFY-ORANGE,"),split("%NOTIFY(ITEM)%").join(",ignore_NOTIFY(ITEM,").split("%NOTIFY(WHITE)%").join(",ignore_NOTIFY(WHITE,").split("%NOTIFY(GRAY)%").join(",ignore_NOTIFY(GRAY,").split("%NOTIFY(BLUE)%").join(",ignore_NOTIFY(BLUE,").split("%NOTIFY(YELLOW)%").join(",ignore_NOTIFY(YELLOW,").split("%NOTIFY(TAN)%").join(",ignore_NOTIFY(TAN,").split("%NOTIFY(GOLD)%").join(",ignore_NOTIFY(GOLD,").split("%NOTIFY(GREEN)%").join(",ignore_NOTIFY(GREEN,").split("%NOTIFY(DARK_GREEN)%").join(",ignore_NOTIFY(DARK_GREEN,").split("%NOTIFY(BLACK)%").join(",ignore_NOTIFY(BLACK,").split("%NOTIFY(PURPLE)%").join(",ignore_NOTIFY(PURPLE,").split("%NOTIFY(RED)%").join(",ignore_NOTIFY(RED,").split("%NOTIFY(ORANGE)%").join(",ignore_NOTIFY(ORANGE,").split(/%NOTIFYS[^%]*%/g).join(",ignore_NOTIFY(ORANGE,")}
				if (settings.version == 0) { out_format = out_format.split("%LVLREQ%").join(",ref_reqlevel,").split("%CRAFTALVL%").join(",ref_CRAFTALVL,").split("%CLASS%").join(",ref_CLASS,").split("%CL%").join(",ref_CL,").split("%QUAL%").join(",ref_QUAL,").split("%QT%").join(",ref_QT,").split("%BASENAME%").join(",ref_BASENAME,")}	// TODO: organize keywords for different versions - these lines are a mess
				if (settings.version == 0) { out_format = out_format.split("%CLASS%").join(",invalid_CLASS,").split("%CL%").join(",invalid_CL,").split("%QUAL%").join(",invalid_QUAL,").split("%QT%").join(",invalid_QT,").split("%BASENAME%").join(",invalid_BASENAME,")}
				if (settings.version == 0) {
//					if (out_format.includes("QUEST")) {out_format = out_format.split("QUEST").join(",misc_QUEST")};
//					var notifs = ["%PX-","%DOT-","%MAP-","%BORDER-","%MAPICON(","%BORDER-","STORAGE("];
					var notifs = ["%PX-","%DOT-","%MAP-","%MAPICON(","STORAGE(","%NOTIFY(","PLRCLASS(","!PLRCLASS"];
					for (n in notifs) {									// TODO: implement more efficient way to split notification keywords
						if (out_format.includes(notifs[n]) || out_format.includes(notifs[n].toLowerCase())) {
							for (let a = 0; a < 16; a++) {
								var av = a.toString(16);
								for (let b = 0; b < 16; b++) {
									var bv = b.toString(16);
									out_format = out_format.split(notifs[n]+av+bv+"%").join(",ignore_notif,").split(notifs[n]+av.toUpperCase()+bv.toUpperCase()+"%").join(",ignore_notif,").split(notifs[n].toLowerCase()+av+bv+"%").join(",ignore_notif,").split(notifs[n].toLowerCase()+av.toUpperCase()+bv.toUpperCase()+"%").join(",ignore_notif,")
									//else { out_format = out_format.split(notifs[n]+av+bv+"%").join(",invalid_notif,").split(notifs[n]+av.toUpperCase()+bv.toUpperCase()+"%").join(",invalid_notif,").split(notifs[n].toLowerCase()+av+bv+"%").join(",invalid_notif,").split(notifs[n].toLowerCase()+av.toUpperCase()+bv.toUpperCase()+"%").join(",invalid_notif,") }
								}
							}
						}
					}
					//ignore PLRCLASS
//					if (out_format.includes("!PLRCLASS(") || out_format.includes("PLRCLASS(")) {
//						const plrclassPattern = /!?PLRCLASS\((.*?)\)/gi;
//						let match;
//						while ((match = plrclassPattern.exec(out_format)) !== null) {
//							let matchStr = match[0];
//							out_format = out_format.split(matchStr).join(",ignore_notification,");
//						}
//					}
					if (out_format.includes("%NOTIFY(") || out_format.includes("%notify(")) {
						const notifylassPattern = /%NOTIFY.*?%/g;
						let match;
						while ((match = notifyclassPattern.exec(out_format)) !== null) {
							let matchStr = match[0];
							out_format = out_format.split(matchStr).join(",ignore_notification,");
						}
					}
//					if (out_format.includes("%NOTIFY") || out_format.includes("%notify")) { for (let a = 0; a < 16; a++) {
//						var av = a.toString(16);
//						out_format = out_format.split("%NOTIFY"+av+"%").join(",ignore_notification,").split("%NOTIFY"+av.toUpperCase()+"%").join(",ignore_notification,").split("%notify"+av+"%").join(",ignore_notification,").split("%notify"+av.toUpperCase()+"%").join(",ignore_notification,")
//						//else { out_format = out_format.split("%NOTIFY-"+av+"%").join(",invalid_notification,").split("%NOTIFY-"+av.toUpperCase()+"%").join(",invalid_notification,").split("%notify-"+av+"%").join(",invalid_notification,").split("%notify-"+av.toUpperCase()+"%").join(",invalid_notification,") }
//					} }
					if (out_format.includes("STORAGE(") || out_format.includes("storage(")) {
						const storagePattern = /(?:%?)storage\([^)]*\)(?:%?)/gi;
						let match;
						while ((match = storagePattern.exec(out_format)) !== null) {
							let matchStr = match[0];
							out_format = out_format.split(matchStr).join(",ignore_notification,");
						}
					}
					if (out_format.includes("PLRCLASS(") || out_format.includes("plrclass(")) {
						const plrPattern = /(?:%?)plrclass\([^)]*\)(?:%?)/gi;
						let match;
						while ((match = plrPattern.exec(out_format)) !== null) {
							let matchStr = match[0];
							out_format = out_format.split(matchStr).join(",ignore_notification,");
						}
					}
					if (out_format.includes("UNIQUE(") || out_format.includes("unique(")) {
						const uniquePattern = /(?:%?)unique\([^)]*\)(?:%?)/gi;
						let match;
						while ((match = uniquePattern.exec(out_format)) !== null) {
							let matchStr = match[0];
							out_format = out_format.split(matchStr).join(",ignore_notification,");
						}
					}
					// This will ignore macros
					if (out_format.includes("%!"))  {
						const macroPattern = /%!.*?!%/g;
						let match;
						while ((match = macroPattern.exec(out_format)) !== null) {
							let matchStr = match[0];
							out_format = out_format.split(matchStr).join(",ignore_notification,");
						}
					}
//					if (out_format.includes("<<"))  {
//						const macroPattern = /<<.*?>>/g;
//						let match;
//						while ((match = macroPattern.exec(out_format)) !== null) {
//							let matchStr = match[0];
//							out_format = out_format.split(matchStr).join(",ignore_notification,");
//						}
//					}
// Regex for %BORDER(x)% or %BORDER(x,y)% (case-insensitive)
					const borderRegex = /%border\([^)]+\)%/gi;
					out_format = out_format.replace(borderRegex, (match, bordercolorIdxStr, borderwidthStr) => {
						let bordercolorIdx = parseInt(bordercolorIdxStr);
						let width = borderwidthStr ? parseInt(borderwidthStr) : 1;
						mappedborder = colorIndexMap[bordercolorIdx] || "#000000"; // fallback to black if undefined

//						console.log("border color log 1 is " + mappedborder);
						return mappedborder
					});
					// This ignores the border, need to remove this when html fixing happens
//					if (out_format.match(/%border\([^)]+\)%/i)) {
//						const mapiconPattern = /%border\(([^)]+)\)%/gi;
//						let match;
//						while ((match = mapiconPattern.exec(out_format)) !== null) {
//							let matchStr = match[0];
//							out_format = out_format.split(matchStr).join(",ignore_notification,");
//						}
//					}

					
					const bgroundRegex = /%bgcolor\((\d+)(?:,(\d+))?\)%/gi;
					out_format = out_format.replace(bgroundRegex, (match, colorIdxStr, widthStr) => {
						let colorIdx = parseInt(colorIdxStr);
						let width = widthStr ? parseInt(widthStr) : 1;
						mappedbgcolor = colorIndexMap[colorIdx] || "#000000"; // fallback to black if undefined

//						console.log("background color log 1 is " + mappedbgcolor);
						return mappedbgcolor
					});

					const bg2roundRegex = /BackgroundColor\s*=\s*(\d+)/gi;

					out_format = out_format.replace(bg2roundRegex, (match, colorIdxStr) => {
						let colorIdx = parseInt(colorIdxStr); // Parse the numeric value for color index
						let mappedbgcolor = colorIndexMap[colorIdx] || "#000000"; // Fallback to black if undefined
					
						console.log("Mapped background color line 950 is " + mappedbgcolor);
						return mappedbgcolor // Replace with the mapped color
					});
					
					// This ignores the bgcolor, need to remove this when html fixing happens
					if (out_format.match(/%bgcolor\((\d+)(?:,(\d+))?\)%/gi)) {
						console.log("Ignoring background color");
						const bgcolorPattern = /%bgcolor\((\d+)(?:,(\d+))?\)%/gi;
						let match;
						while ((match = bgcolorPattern.exec(out_format)) !== null) {
							let matchStr = match[0];
							out_format = out_format.split(matchStr).join(",ignore_notification,");
						}
					}
					if (out_format.match(/BackgroundColor\s*=\s*(\d+)/gi)) {
						console.log("Ignoring background2 color");
						const bgcolor2Pattern = /BackgroundColor\s*=\s*(\d+),/gi;
						let match;
						while ((match = bgcolor2Pattern.exec(out_format)) !== null) {
							let matchStr = match[0];
							out_format = out_format.split(matchStr).join(",ignore_notification,");
						}
					}

					// This ignores the bgcolor, need to remove this when html fixing happens
					if (out_format.match(/%bgcolor\((\d+)(?:,(\d+))?\)%/gi)) {
						const bgcolorPattern = /%bgcolor\((\d+)(?:,(\d+))?\)%/gi;
						let match;
						while ((match = bgcolorPattern.exec(out_format)) !== null) {
							let matchStr = match[0];
							out_format = out_format.split(matchStr).join(",ignore_notification,");
						}
					}

					if (out_format.match(/%mapicon\([^)]+\)%/i)) {
						const mapiconPattern = /%mapicon\(([^)]+)\)%/gi;
						let match;
						while ((match = mapiconPattern.exec(out_format)) !== null) {
							let matchStr = match[0];
							out_format = out_format.split(matchStr).join(",ignore_notification,");
						}
					}
					out_format = out_format.replace(/%mapicon\(\s*([0-9a-fA-F]{1,2})(?:\s*,\s*[0-9a-fA-F]{1,2})?\s*\)%/gi, ",ignore_notification,");

					if (out_format.match(/%bgcolor\([^)]+\)%/i)) {
						const mapiconPattern = /%bgcolor\(([^)]+)\)%/gi;
						let match;
						while ((match = mapiconPattern.exec(out_format)) !== null) {
							let matchStr = match[0];
							out_format = out_format.split(matchStr).join(",ignore_notification,");
						}
					}
//					out_format = out_format.replace(/%bgcolor\([^)]+\)%/i, "")
				}
				for (let lvl = 0; lvl <= 9; lvl++) {
					out_format = out_format.split("%TIER-"+lvl+"%").join(",ignore_TIER-"+lvl+",")
				}
				if (settings.version == 0) {
					for (let stat = 0; stat <= 500; stat++) {
//						if (typeof(itemToCompare["STAT"+stat]) != 'undefined') { out_format = out_format.split("%STAT"+stat+"%").join(",ref_STAT"+stat+",") }
//						if (typeof(itemToCompare["%STAT("+stat]) != 'undefined') { out_format = out_format.split("%STAT("+stat+")%").join(",ref_STAT"+stat+",") }
//						else { out_format = out_format.split("%STAT"+stat+"%").join(",0,") }
						// Ranges like %STAT(0,138)%
						out_format = out_format.replace(/%STAT\((\d+),\d+\)%/g, function(match, first) {
							const key = "STAT" + first;
							if (typeof(itemToCompare[key]) !== 'undefined') {
								return ",ref_" + key + ",";
							} else {
								return ",0,";
							}
						});
						
						// Single stat entries
//						for (let stat = 0; stat <= 500; stat++) {
							const tagFlat = "%STAT" + stat + "%";
							const tagParen = "%STAT(" + stat + ")%";
							const key = "STAT" + stat;
							const hasStat = typeof(itemToCompare[key]) !== 'undefined';

							out_format = out_format.split(tagFlat).join(hasStat ? ",ref_" + key + "," : ",0,");
							out_format = out_format.split(tagParen).join(hasStat ? ",ref_" + key + "," : ",0,");
//						}
						// Needs to be removed at a later date
						if (out_format.match(/%stat\([^)]+\)%/i)) {
							const mapiconPattern = /%stat\(([^)]+)\)%/gi;
							let match;
							while ((match = mapiconPattern.exec(out_format)) !== null) {
								let matchStr = match[0];
								out_format = out_format.split(matchStr).join(",ignore_notification,");
							}
						}

					}
					for (let skill = 0; skill <= 500; skill++) {
						const tag = "%SKILL(" + skill + ")%";
						if (typeof(itemToCompare["SKILL" + skill]) !== 'undefined') {
							out_format = out_format.split(tag).join(",ref_SKILL" + skill + ",");
						} else {
							out_format = out_format.split(tag).join(",0,");
						}
					}
									}
				// POST-SEASON-6 CHANGES: This section is my first editing of simulation.js since a long absence and may not account for everything
				if (settings.version == 0) {
					out_format = out_format.split("%SOCKETS%").join(",ref_SOCK,").split("%DEF%").join(",ref_DEF,").split("%ED%").join(",ref_ED,").split("%EDEF%").join(",ref_EDEF,").split("%EDAM%").join(",ref_EDAM,").split("%AR%").join(",ref_AR,").split("%RES%").join(",ref_RES,").split("%FRES%").join(",ref_FRES,").split("%CRES%").join(",ref_CRES,").split("%LRES%").join(",ref_LRES,").split("%PRES%").join(",ref_PRES,").split("%FRW%").join(",ref_FRW,").split("%IAS%").join(",ref_IAS,").split("%FCR%").join(",ref_FCR,").split("%FHR%").join(",ref_FHR,").split("%FBR%").join(",ref_FBR,").split("%MINDMG%").join(",ref_MINDMG,").split("%MAXDMG%").join(",ref_MAXDMG,").split("%STR%").join(",ref_STR,").split("%DEX%").join(",ref_DEX,").split("%LIFE%").join(",ref_LIFE,").split("%MANA%").join(",ref_MANA,").split("%MFIND%").join(",ref_MFIND,").split("%GFIND%").join(",ref_GFIND,").split("%MAEK%").join(",ref_MAEK,").split("%DTM%").join(",ref_DTM,").split("%REPLIFE%").join(",ref_REPLIFE,").split("%REPAIR%").join(",ref_REPAIR,").split("%ARPER%").join(",ref_ARPER,").split("%FOOLS%").join(",ref_FOOLS,").split("%%").join(",ref_,")
					for (let stat = 0; stat <= 504; stat++) {
						if (typeof(itemToCompare["STAT"+stat]) != 'undefined') { out_format = out_format.split("%STAT"+stat+"%").join(",ref_STAT"+stat+",");out_format = out_format.split("STAT"+stat+"").join(",ref_STAT"+stat+",") }
						else { out_format = out_format.split("%STAT"+stat+"%").join(",0,");out_format = out_format.split("STAT"+stat+"").join(",0,") }
						if (typeof(itemToCompare["CHARSTAT"+stat]) != 'undefined') { out_format = out_format.split("%CHARSTAT"+stat+"%").join(",ref_CHARSTAT"+stat+",") }
						else { out_format = out_format.split("%CHARSTAT"+stat+"%").join(",0,") }
					}
					for (let stat = 6; stat <= 384; stat++) {
						if (typeof(itemToCompare["SK"+stat]) != 'undefined') { out_format = out_format.split("%SK"+stat+"%").join(",ref_SK"+stat+",") }
						else { out_format = out_format.split("%SK"+stat+"%").join(",0,") }
						if (stat == 155) { stat = 220 }
						if (stat == 280) { stat = 363 }
					}
					for (let stat = 6; stat <= 500; stat++) {
						if (typeof(itemToCompare["CHSK"+stat]) != 'undefined') { out_format = out_format.split("CHSK"+stat).join(",ref_CHSK"+stat) }
						else { out_format = out_format.split("CHSK"+stat).join(",0,") }
					}
					for (let stat = 6; stat <= 384; stat++) {
						if (typeof(itemToCompare["OS"+stat]) != 'undefined') { out_format = out_format.split("OS"+stat).join(",ref_SK"+stat+",") }
						else { out_format = out_format.split("OS"+stat).join(",0,") }
						if (stat == 155) { stat = 220 }
						if (stat == 280) { stat = 363 }
					}
					for (let stat = 0; stat <= 50; stat++) {
						if (typeof(itemToCompare["TABSK"+stat]) != 'undefined') { out_format = out_format.split("%TABSK"+stat+"%").join(",ref_TABSK"+stat+",") }
						else { out_format = out_format.split("%TABSK"+stat+"%").join(",0,") }
						if (stat == 2 || stat == 10 || stat == 18 || stat == 26 || stat == 34 || stat == 42) { stat += 5 }
					}
					for (let stat = 0; stat <= 6; stat++) {
						if (typeof(itemToCompare["CLSK"+stat]) != 'undefined') { out_format = out_format.split("%CLSK"+stat+"%").join(",ref_CLSK"+stat+",") }
						else { out_format = out_format.split("%CLSK"+stat+"%").join(",0,") }
					}
				}
				var out_list = out_format.split(",,").join(",").split(",");
				for (out in out_list) {
					var o = out_list[out].split("‾").join(",");
					var key = o.split("_")[0];
					if (key == "misc" || key == "color" || key == "ref" || key == "ignore" || o == " " || o == "\t" || o == "‗") {
						// do nothing
					} else if (key == "invalid") {
						var uk = "%"+o.split("_")[1]+"%";
						if (uk == "%DARK.GREEN%") { uk = "%DARK_GREEN%" }
						unrecognized_keywords = true
						if (unrecognized_list.includes(uk) == false) { unrecognized_list.push(uk) }
						if (settings.version == 0) {
							if (notices.pd2_conditions == 0) { document.getElementById("o4").innerHTML += "<br>PD2 code(s) detected - the PD2 version of FilterBird can be enabled from the menu." }	// TODO: Also display notice for notification keywords (BORDER, MAP, DOT, PX, NOTIFY)
							notices.pd2_conditions = 1
						} else if (settings.version == 0) {
							if (notices.pod_conditions == 0) { document.getElementById("o4").innerHTML += "<br>PoD code(s) detected - the PoD version of FilterBird can be enabled from the menu." }
							notices.pod_conditions = 1
						}
					} else {
						if (o.indexOf("%") < o.lastIndexOf("%")) {
							var ok_list = o.substring(o.indexOf("%"),o.lastIndexOf("%")+1).split("%");
							var o_keyword = -1;
							for (ok in ok_list) {
								if (o_keyword == 1) {
									var uk = "%"+ok_list[ok]+"%";
									unrecognized_keywords = true
									if (unrecognized_list.includes(uk) == false) { unrecognized_list.push(uk) }
								}
								o_keyword *= -1
							}
							//if (ok == "%LIGHT_GRAY%" || ok == "CORAL" || ok == "SAGE" || ok == "TEAL") {
							//	if (notices.colors == 0) { document.getElementById("o4").innerHTML += "<br>Unsupported color keywords detected. Keywords such as "+ok+" just default to %GRAY% in PD2." }
							//	notices.colors = 1
							//}
						}
					}
				}
				if (unrecognized_keywords == true) {
					// log these unrecognized keywords to the console
					console.log("unrecognized keywords: ",unrecognized_list)
					var unrecognized_keywords_string = ": <l style='color:#cc5'>"+unrecognized_list[0]+"</l>";
					var plural_s = "";
					if (unrecognized_list.length > 1) {
						plural_s = "s"
						for (let i = 1; i < unrecognized_list.length; i++) { unrecognized_keywords_string += ", <l style='color:#cc5'>"+unrecognized_list[i]+"</l>" }
					}
					document.getElementById("o"+num).innerHTML += "#"+num+" Unrecognized keyword"+plural_s+" on line "+line_num+unrecognized_keywords_string+" ... "+"<l style='color:#aaa'>"+file.split("\t").join(" ").split("­").join("•").split("\n")[line]+"</l><br>"; errors++;	// displays an error if the rule has any unrecognized/invalid keywords
				}
			}
			//-----------------------------------------------------------------------------------------------------------
			
			if (match == true) {
				var desc_output_active = false;
				var desc_output_escape = false;
				var desc_output_temp = "";
				// Removes comments and leading/trailing tabs and spaces
				output = output.split("//")[0]
				var trailingTabs = false;
				for (let i = output.length-1; i > 0; i--) {
					if (output[i] == " " && trailingTabs == false) { output = output.substr(0,i) }
					else if (output[i] == "\t") { output = output.substr(0,i); trailingTabs = true; }
					else { i = 0 }
				}
				var leadingTabs = false;
				for (let i = 0; i < output.length; i=i) {
					if (output[i] == " " && leadingTabs == false) { output = output.substr(1) }
					else if (output[i] == "\t") { output = output.substr(1); leadingTabs = true; }
					else { i = output.length }
				}
				
				if (output.includes("{") == true && output.indexOf("{") < output.lastIndexOf("}")) {
					var out_temp = output.substring(output.indexOf("{"),output.length-1);
					out_temp = out_temp.substring(output.indexOf("}"),output.length-1);
					if (out_temp.includes("{") == true && out_temp.indexOf("{") < out_temp.lastIndexOf("}")) { desc_output_escape = true }
					desc_output_active = true
					desc_output = output.substring(output.indexOf("{"),output.indexOf("}")+1)
					output = output.replace(desc_output,"")
					desc_output = desc_output.substring(1,desc_output.length-1)
					if (desc_output.includes("%NAME%") == true) {
						desc_output_total = desc_output.split("%NAME%").join(desc_output_total)
					} else {
						if (desc_output_total != "" && desc_output != "" && output != "") { document.getElementById("o"+num).innerHTML += "#"+num+" Notice for line "+line_num+" (item's description overwritten)<br>" }	// displays a notice if the item's description gets overwritten (but not blanked)
						desc_output_total = desc_output
					}
					if (desc_output_escape == true) { desc_output_temp = desc_output }
				} else {
					if (desc_output_total != "" && output != "") { document.getElementById("o"+num).innerHTML += "#"+num+" Notice for line "+line_num+" (item's description overwritten)<br>" }	// displays a notice if the item's description gets overwritten (but not blanked) from lack of continuation
					desc_output_total = ""
				}
				
				if (output.includes("%NAME%") == true) {
					output_total = output.split("%NAME%").join(output_total)
				} else {
					if (output_total != name_saved && output != "") { document.getElementById("o"+num).innerHTML += "#"+num+" Notice for line "+line_num+" (item's name overwritten)<br>" }	// displays a notice if the item's title gets overwritten (but not blanked)		// TODO: Should this also apply if a previous rule simply displayed %NAME% and nothing else? (default is name_saved rather than nothing)
					output_total = output
				}
				if (output.includes("%CONTINUE%") == false) {
					done = true
					if (desc_output_active == true) {
						if (desc_output_total != "" && output_total == "") { document.getElementById("o"+num).innerHTML += "#"+num+" Notice for line "+line_num+" (item description on hidden item)<br>" }	// displays a notice if the item description isn't hidden, but the item is
					}
				} else {
					if (desc_output_escape == true) { output_total = "{"+desc_output_temp+"}"+output_total }	// TODO: implement differently? this may only work properly if {} is used to escape
					continued++
				}
				// TODO: Would it be useful to show a warning if %CONTINUE% is used on a hidden item?
				var rule_text = file.split("\t").join(" ").split("­").join("•").split("\n")[line];
				var output_text = "#"+num+" Match found at line "+line_num+" after checking "+rules_checked+" rules ... "+"<l style='color:#aaa'>"+rule_text+"</l>";
				var output_width = getTextWidth(output_text, "bold 12pt arial");
				if (settings.nowrap_width < output_width) { settings.nowrap_width = output_width }
				document.getElementById("o"+num).innerHTML += "#"+num+" Match found at line "+line_num+" after checking "+rules_checked+" rules ... "+"<l style='color:#aaa'>"+rule_text+"</l>"
				if (output == "") { document.getElementById("o"+num).innerHTML += " //hidden" }
				document.getElementById("o"+num).innerHTML += "<br>"
			}
		} else {
			document.getElementById("o3").innerHTML += "not a rule"
		}
		document.getElementById("o3").innerHTML = ""
	} }
	
	// All lines have been checked at this point
	if (done == false) { document.getElementById("o"+num).innerHTML += "#"+num+" No match found after checking all "+line_num+" lines ("+rules_checked+" rules) ... (default display)<br>" }
	//else { document.getElementById("o"+num).innerHTML = document.getElementById("o"+num).innerHTML.substring(0,document.getElementById("o"+num).innerHTML.length-4)+" ... ("+line_num+" of "+lines.length+" lines checked)<br>" }	// TODO: would it be useful to show how many total lines/rules there are?
	if (itemToCompare.ID == false && itemToCompare.always_id == false) { desc_output_total = "" }
	if (itemToCompare.CODE == "GOLD" && output_total != "") { output_total = itemToCompare.money+" Gold"; desc_output_total = ""; }
	
	if (((continued > 0 && done == true) || continued > 1) && (output_total != "" || desc_output_total != "")) {
		var out_name = output_total;
		var out_desc = desc_output_total;
		if (out_desc != "") { out_desc = "{"+out_desc+"}" }
		if (out_name != "") {
			if (out_name.charAt(0) == " ") { out_name = "&nbsp"+out_name.substr(1) }
			if (out_name.endsWith(" ") == true) { out_name = out_name.substring(0,out_name.length-1)+"&nbsp" }
		}
		out_name = out_name.replace(name_saved,"%NAME%").split("%CONTINUE%").join("").split("  ").join("&nbsp&nbsp").split(" &nbsp").join("&nbsp&nbsp").split("&nbsp ").join("&nbsp&nbsp")
		out_desc = out_desc.split("  ").join("&nbsp&nbsp").split(" &nbsp").join("&nbsp&nbsp").split("&nbsp ").join("&nbsp&nbsp")
		document.getElementById("o"+num).innerHTML += "#"+num+" Combined Output ... "+"<l style='color:#aaa'>"+"ItemDisplay[⍰]:"+out_name+out_desc+"</l><br>"
	}
	
	if (desc_output_total != "") { desc_output_total = "{%BLUE%"+desc_output_total+"}" }
	output_total = desc_output_total+"%"+getColor(itemToCompare)+"%"+output_total
	var description_braces = 0;
	var description_active = false;
	if (output_total.includes("{") == true && output_total.includes("}") == true) { if (output_total.indexOf("{") < output_total.lastIndexOf("}")) { description_active = true } }
	
	var out_format = output_total.split(",").join("‾").split(" ").join(", ,").split("%CONTINUE%").join(",misc_CONTINUE,").split("%NAME%").join(",ref_NAME,").split("%ITEMNAME%").join(",ref_ITEMNAME,").split("%BASENAME%").join(",ref_BASENAME,").split("%WHITE%").join(",color_WHITE,").split("%GRAY%").join(",color_GRAY,").split("%BLUE%").join(",color_BLUE,").split("%YELLOW%").join(",color_YELLOW,").split("%GOLD%").join(",color_GOLD,").split("%GREEN%").join(",color_GREEN,").split("%BLACK%").join(",color_BLACK,").split("%TAN%").join(",color_TAN,").split("%PURPLE%").join(",color_PURPLE,").split("%ORANGE%").join(",color_ORANGE,").split("%RED%").join(",color_RED,").split("%COBALT%").join(",color_COBALT,").split("%PINK%").join(",color_PINK,").split("%ILVL%").join(",ref_ILVL,").split("%SOCKETS%").join(",ref_SOCK,").split("%PRICE%").join(",ref_PRICE,").split("%RUNENUM%").join(",ref_RUNE,").split("%RUNETIER%").join(",ref_RUNE,").split("%RUNENAME%").join(",ref_RUNENAME,").split("%GEMLEVEL%").join(",ref_GLEVEL,").split("%GEMTYPE%").join(",ref_GTYPE,").split("%CODE%").join(",ref_CODE,").split("\t").join(",\t,").split("{").join(",{,").split("}").join(",},").split("‗").join(",‗,");
	if (settings.version == 0) { out_format = out_format.split("%DGREEN%").join(",color_DGREEN,").split("%DPURPLE%").join(",color_DPURPLE,").split("%DARK_GREEN%").join(",color_DGREEN,").split("%CLVL%").join(",ref_CLVL,").split("%NL%").join(",misc_NL,").split("%MAP%").join(",ignore_MAP,").split("MAPTIER").join(",ignore_MAP,").split("%NOTIFY-DEAD%").join(",ignore_NOTIFY-DEAD,") }
	if (settings.version == 0) { out_format = out_format.split("%DARK_GREEN%").join(",color_DGREEN,").split("%QTY%").join(",ref_QUANTITY,").split("%RANGE%").join(",ref_range,").split("%WPNSPD%").join(",ref_baseSpeed,").split("%ALVL%").join(",ref_ALVL,").split("%NL%").join(",misc_NL,").split("%MAP%").join(",ignore_MAP,").split("MAPTIER").join(",ignore_MAP,").split("%NOTIFY-DEAD%").join(",ignore_NOTIFY-DEAD,").split("%LVLREQ%").join(",ref_reqlevel,").split("%CRAFTALVL%").join(",ref_CRAFTALVL,") }
	if (settings.version == 0) { out_format = out_format.split("%LIGHT_GRAY%").join(",color_GRAY,").split("%CORAL%").join(",color_GRAY,").split("%SAGE%").join(",color_GRAY,").split("%TEAL%").join(",color_GRAY,") }
	if (settings.version == 0) { out_format = out_format.split("%QTY%").join(",ref_QUANTITY,").split("%RANGE%").join(",ref_range,").split("%WPNSPD%").join(",ref_baseSpeed,").split("%ALVL%").join(",ref_ALVL,").split("%NL%").join(",misc_NL,").split("%NOTIFY-ITEM%").join(",ignore_NOTIFY-ITEM,").split("%NOTIFY-WHITE%").join(",ignore_NOTIFY-WHITE,").split("%NOTIFY-GRAY%").join(",ignore_NOTIFY-GRAY,").split("%NOTIFY-BLUE%").join(",ignore_NOTIFY-BLUE,").split("%NOTIFY-YELLOW%").join(",ignore_NOTIFY-YELLOW,").split("%NOTIFY-TAN%").join(",ignore_NOTIFY-TAN,").split("%NOTIFY-GOLD%").join(",ignore_NOTIFY-GOLD,").split("%NOTIFY-GREEN%").join(",ignore_NOTIFY-GREEN,").split("%NOTIFY-DARK_GREEN%").join(",ignore_NOTIFY-DARK_GREEN,").split("%NOTIFY-BLACK%").join(",ignore_NOTIFY-BLACK,").split("%NOTIFY-PURPLE%").join(",ignore_NOTIFY-PURPLE,").split("%NOTIFY-RED%").join(",ignore_NOTIFY-RED,").split("%NOTIFY-ORANGE%").join(",ignore_NOTIFY-ORANGE,") }
	if (settings.version == 0) { out_format = out_format.split("%LVLREQ%").join(",ref_reqlevel,").split("%CRAFTALVL%").join(",ref_CRAFTALVL,").split("%CLASS%").join(",ref_CLASS,").split("%CL%").join(",ref_CL,").split("%QUAL%").join(",ref_QUAL,").split("%QT%").join(",ref_QT,").split("%BASENAME%").join(",ref_BASENAME,")}	// TODO: organize keywords for different versions - these lines are a mess
	//Add new keywords 
	if (settings.version == 0) { out_format = out_format}	// TODO: organize keywords for different versions - these lines are a mess
	if (settings.version == 0) {
		var notifs = ["%PX-","%DOT-","%MAP-","%BORDER-","%MAPICON(","%BORDER(","STORAGE(","%NOTIFY(","PLRCLASS","!PLRCLASS"];
		for (n in notifs) {
			if (out_format.includes(notifs[n]) || out_format.includes(notifs[n].toLowerCase())) {
				for (let a = 0; a < 16; a++) {
					var av = a.toString(16);
					for (let b = 0; b < 16; b++) {
						var bv = b.toString(16);
						out_format = out_format.split(notifs[n]+av+bv+"%").join(",ignore_notif,").split(notifs[n]+av.toUpperCase()+bv.toUpperCase()+"%").join(",ignore_notif,").split(notifs[n].toLowerCase()+av+bv+"%").join(",ignore_notif,").split(notifs[n].toLowerCase()+av.toUpperCase()+bv.toUpperCase()+"%").join(",ignore_notif,")
					}
				}
			}
		}
//		if (out_format.includes("%NOTIFY-") || out_format.includes("%notify-")) { for (let a = 0; a < 16; a++) {
//			var av = a.toString(16);
//			out_format = out_format.split("%NOTIFY-"+av+"%").join(",ignore_notification,").split("%NOTIFY-"+av.toUpperCase()+"%").join(",ignore_notification,").split("%notify-"+av+"%").join(",ignore_notification,").split("%notify-"+av.toUpperCase()+"%").join(",ignore_notification,")
//		} }
		if (out_format.includes("%NOTIFY(") || out_format.includes("%notify(")) { for (let a = 0; a < 16; a++) {
			var av = a.toString(16);
			out_format = out_format.split("%NOTIFY("+av+"%").join(",ignore_notification,").split("%NOTIFY("+av.toUpperCase()+"%").join(",ignore_notification,").split("%notify("+av+"%").join(",ignore_notification,").split("%notify("+av.toUpperCase()+"%").join(",ignore_notification,")
		} }
		//This gets rid of "notifyXX" in item name displays
		if (out_format.includes("%NOTIFY") || out_format.includes("%notify")) {
			const notifyPattern = /%NOTIFY.*?%/gi;
			let match;
			while ((match = notifyPattern.exec(out_format)) !== null) {
				let matchStr = match[0];
				out_format = out_format.split(matchStr).join(",ignore_notification,");
			}
		}
		if (out_format.includes("%BORDER") || out_format.includes("%border")) {
			const notifyPattern = /%BORDER.*?%/gi;
			let match;
			while ((match = notifyPattern.exec(out_format)) !== null) {
				let matchStr = match[0];
				out_format = out_format.split(matchStr).join(",ignore_notification,");
			}
		}
		if (out_format.includes("%bgcolor") || out_format.includes("%BGCOLOR")) {
			const notifyPattern = /%bgcolor.*?%/gi;
			let match;
			while ((match = notifyPattern.exec(out_format)) !== null) {
				let matchStr = match[0];
				out_format = out_format.split(matchStr).join(",ignore_notification,");
			}
		}
		// ignore plrclass
//		if (out_format.includes("PLRCLASS(") || out_format.includes("!PLRCLASS(")) {
//			const plrclassPattern = /!?PLRCLASS\((.*?)\)/gi;
//			let match;
//			while ((match = plrclassPattern.exec(out_format)) !== null) {
//				let matchStr = match[0];
//				out_format = out_format.split(matchStr).join(",ignore_notification,");
//			}
//		}
		if (out_format.includes("STORAGE(") || out_format.includes("storage(")) {
			const storagePattern = /(?:%?)storage\([^)]*\)(?:%?)/gi;
			let match;
			while ((match = storagePattern.exec(out_format)) !== null) {
				let matchStr = match[0];
				out_format = out_format.split(matchStr).join(",ignore_notification,");
			}
		}
//		if (out_format.includes("PLRCLASS(") || out_format.includes("plrclass(")) {
//			const plrPattern = /(?:%?)plrclass\([^)]*\)(?:%?)/gi;
//			let match;
//			while ((match = plrPattern.exec(out_format)) !== null) {
//				let matchStr = match[0];
//				out_format = out_format.split(matchStr).join(",ignore_notification,");
//			}
//		}
//		if (out_format.includes("%MAPICON(") || out_format.includes("%mapicon(")) { for (let a = 0; a < 500; a++) {
//			var av = a.toString(16);
//			out_format = out_format.split("%MAPICON("+av+")%").join(",ignore_notification,").split("%MAPICON("+av.toUpperCase()+")%").join(",ignore_notification,").split("%mapicon("+av+")%").join(",ignore_notification,").split("%mapicon("+av.toUpperCase()+")%").join(",ignore_notification,")
//			} 
//		}
		out_format = out_format.replace(/%MAPICON\(\s*([0-9a-fA-F]{1,2})(?:\s*,\s*[0-9a-fA-F]{1,2})?\s*\)%/gi, ",ignore_notification,");

//		out_format = out_format.replace(', ,', ', ')
	}
	for (let lvl = 0; lvl <= 9; lvl++) {
		out_format = out_format.split("%TIER-"+lvl+"%").join(",ignore_TIER-"+lvl+",")
	}
	if (settings.version == 0) {
		for (let stat = 0; stat <= 500; stat++) {
			if (typeof(itemToCompare["STAT"+stat]) != 'undefined') { out_format = out_format.split("%STAT"+stat+"%").join(",ref_STAT"+stat+",") }
			else { out_format = out_format.split("%STAT"+stat+"%").join(",0,") }
		}
	}
	// POST-SEASON-6 CHANGES: This section is my first editing of simulation.js since a long absence and may not account for everything
	if (settings.version == 0) {
		out_format = out_format.split("%SOCKETS%").join(",ref_SOCK,").split("%DEF%").join(",ref_DEF,").split("%ED%").join(",ref_ED,").split("%EDEF%").join(",ref_EDEF,").split("%EDAM%").join(",ref_EDAM,").split("%AR%").join(",ref_AR,").split("%RES%").join(",ref_RES,").split("%FRES%").join(",ref_FRES,").split("%CRES%").join(",ref_CRES,").split("%LRES%").join(",ref_LRES,").split("%PRES%").join(",ref_PRES,").split("%FRW%").join(",ref_FRW,").split("%IAS%").join(",ref_IAS,").split("%FCR%").join(",ref_FCR,").split("%FHR%").join(",ref_FHR,").split("%FBR%").join(",ref_FBR,").split("%MINDMG%").join(",ref_MINDMG,").split("%MAXDMG%").join(",ref_MAXDMG,").split("%STR%").join(",ref_STR,").split("%DEX%").join(",ref_DEX,").split("%LIFE%").join(",ref_LIFE,").split("%MANA%").join(",ref_MANA,").split("%MFIND%").join(",ref_MFIND,").split("%GFIND%").join(",ref_GFIND,").split("%MAEK%").join(",ref_MAEK,").split("%DTM%").join(",ref_DTM,").split("%REPLIFE%").join(",ref_REPLIFE,").split("%REPAIR%").join(",ref_REPAIR,").split("%ARPER%").join(",ref_ARPER,").split("%FOOLS%").join(",ref_FOOLS,").split("%%").join(",ref_,")
			for (let stat = 0; stat <= 504; stat++) {
			if (typeof(itemToCompare["STAT"+stat]) != 'undefined') { out_format = out_format.split("%STAT"+stat+"%").join(",ref_STAT"+stat+",") }
			else { out_format = out_format.split("%STAT"+stat+"%").join(",0,") }
			if (typeof(itemToCompare["CHARSTAT"+stat]) != 'undefined') { out_format = out_format.split("%CHARSTAT"+stat+"%").join(",ref_CHARSTAT"+stat+",") }
			else { out_format = out_format.split("%CHARSTAT"+stat+"%").join(",0,") }
		}
		for (let stat = 6; stat <= 384; stat++) {
			if (typeof(itemToCompare["SK"+stat]) != 'undefined') { out_format = out_format.split("%SK"+stat+"%").join(",ref_SK"+stat+",") }
			else { out_format = out_format.split("%SK"+stat+"%").join(",0,") }
			if (stat == 155) { stat = 220 }
			if (stat == 280) { stat = 363 }
		}
		for (let stat = 6; stat <= 500; stat++) {
			if (typeof(itemToCompare["CHSK"+stat]) != 'undefined') { out_format = out_format.split("CHSK"+stat).join(",ref_CHSK"+stat) }
			else { out_format = out_format.split("CHSK"+stat).join(",0,") }
		}
		for (let stat = 0; stat <= 50; stat++) {
			if (typeof(itemToCompare["TABSK"+stat]) != 'undefined') { out_format = out_format.split("%TABSK"+stat+"%").join(",ref_TABSK"+stat+",") }
			else { out_format = out_format.split("%TABSK"+stat+"%").join(",0,") }
			if (stat == 2 || stat == 10 || stat == 18 || stat == 26 || stat == 34 || stat == 42) { stat += 5 }
		}
		for (let stat = 0; stat <= 6; stat++) {
			if (typeof(itemToCompare["CLSK"+stat]) != 'undefined') { out_format = out_format.split("%CLSK"+stat+"%").join(",ref_CLSK"+stat+",") }
			else { out_format = out_format.split("%CLSK"+stat+"%").join(",0,") }
		}
	}
	var out_list = out_format.split(",,").join(",").split(",");
	if (out_list[0] == "") { out_list.shift() }
	if (out_list[out_list.length-1] == "") { out_list.pop() }
	var color = colors[getColor(itemToCompare)];
	var text_length = [0,0,0];	// name, description characters, description units
	for (out in out_list) {
		var o = out_list[out].split("‾").join(",");
		var temp = o;
		var key = o.split("_")[0];
		var blank = false;
		
		if (key == "misc" || key == "ignore") {
			blank = true
		} else if (key == "color") {
			blank = true
			color = colors[o.split("_")[1]]
			if (settings.validation == 1) { if (description_braces == 1) { text_length[2] += 3 } }
		} else if (key == "ref") {
			if (o == "ref_CLVL") { temp = character.CLVL }
			else if (o == "ref_NAME") { blank = true }
			else if (settings.version == 0 && o == "ref_RUNENAME" && itemToCompare.RUNE > 0) { color = colors["ORANGE"]; temp = itemToCompare.name.split(" ")[0]; }	// TODO: why isn't itemToCompare.RUNENAME setup by this point? (for stacked runes)
			else if (o == "ref_GLEVEL") {
				if (itemToCompare.type == "gem") {
					var g_level = ["NONE","Chipped","Flawed","Normal","Flawless","Perfect"];
					itemToCompare.GLEVEL = g_level[itemToCompare.GEMLEVEL]
					temp = itemToCompare[o.split("_")[1]]
				} else {
					blank = true
				}
			}
			else if (o == "ref_GTYPE") {
				if (itemToCompare.type == "gem") {
					var g_type = [0,"Amethyst","Diamond","Emerald","Ruby","Sapphire","Topaz","Skull"];
					itemToCompare.GTYPE = g_type[itemToCompare.GEMTYPE]
					temp = itemToCompare[o.split("_")[1]]
				} else {
					blank = true
				}
			}
			else if (o == "ref_reqlevel") { temp = ~~itemToCompare["req_level"] }
			else { temp = itemToCompare[o.split("_")[1]] }
		} else if (o == " " || o == "\t" || o == "‗") {
			blank = true
		} else {
			if (description_active == true) {
				if (o == "{" && description_braces == 0) { description_braces = description_braces+1; blank = true; }
				if (o == "}" && description_braces == 1) { description_braces = description_braces+1; blank = true; }
			}
		}
//		console.log("background color log 2 is "+ mappedbgcolor)
		//Add background bgcolor & border color here?
//		console.log("description_braces value: " + description_braces);
//		if (mappedbgcolor != "") {
//			console.log("Condition passed. mappedbgcolor: " + mappedbgcolor);
//		} else {
//			console.log("Condition failed. Mappedbgcolor is empty or undefined.");
//		}
		
		if (description_braces != 1) {
			if (o == "misc_NL" || o == "‗") { display += "<br>" }
			if (mappedbgcolor != "") {
//				console.log("background color log line 1360 is "+ mappedbgcolor)

				if (o == " ") {
					display += "<l style='color:Black; background-color:" + mappedbgcolor + "; border-color:" + mappedborder +"; '>_</l>";
				} else if (blank == false) {
					display += "<l style='color:" + color + "; background-color:" + mappedbgcolor + "; border-color:" + mappedborder +"'>" + temp + "</l>";
				}
				if (settings.validation == 1) {
					if (o == " ") { text_length[0]++ }
					else if (blank == false) { text_length[0] += ~~temp.length; }
				}
			}
			else {
				if (o == " ") { display += "<l style='color:Black; opacity:0%;'>_</l>" }
				else if (blank == false) { display += "<l style='color:"+color+"'>"+temp+"</l>" }
				if (settings.validation == 1) {
					if (o == " ") { text_length[0]++ }
					else if (blank == false) { text_length[0] += ~~temp.length; }
				}
			}
		} else {
			if (o == "misc_NL" || o == "‗") { description += "<br>" }
			if (mappedbgcolor != "") {
				console.log("background color log line 1385 is "+ mappedbgcolor)
				if (o == " ") { description += "<l style='color:Black; background-color:" + mappedbgcolor + "; border-color:" + mappedborder +"; '>_</l>";}
				else if (blank == false) { description += "<l style='color:" + color + "; background-color:" + mappedbgcolor + "; border-color:" + mappedborder +";'>" + temp + "</l>" }
			}
			else {
				if (o == " ") { description += "<l style='color:Black; opacity:0%;'>_</l>" }
				else if (blank == false) { description += "<l style='color:"+color+"'>"+temp+"</l>" }
			}
			if (settings.validation == 1) {
				if (o == "misc_NL" || o == "‗") { text_length[2]++ }
				if (o == " ") { text_length[1]++; text_length[2]++; }
				else if (blank == false) { text_length[1] += ~~temp.length; text_length[2] += ~~temp.length; }
			}
		}
		// This ignores the bgcolor, need to remove this when html fixing happens
		if (out_format.match(/%bgcolor\([^)]+\)%/i)) {
			const bgcolorPattern = /%bgcolor\(([^)]+)\)%/gi;
			let match;
			while ((match = bgcolorPattern.exec(out_format)) !== null) {
				let matchStr = match[0];
				out_format = out_format.split(matchStr).join(",ignore_notification,");
			}
		}
		if (out_format.match(/BackgroundColor\s*=\s*(\d+)/gi)) {
			const bg2colorPattern = /BackgroundColor\s*=\s*(\d+)/gi;
			let match;
			while ((match = bg2colorPattern.exec(out_format)) !== null) {
				let matchStr = match[0];
				out_format = out_format.split(matchStr).join(",ignore_notification,");
			}
		}
		
	}
	if (settings.validation == 1) {
		if (text_length[0] > 56) {
			document.getElementById("o"+num).innerHTML += "#"+num+" Warning: item name may be too long ("+text_length[0]+" characters)<br>"; errors++;	// displays an error if the item's name is too long to be shown in some circumstances
		}
		if (text_length[1] > 479 || text_length[2] > 379) {
			document.getElementById("o"+num).innerHTML += "#"+num+" Warning: item description may be too long ("+text_length[1]+" characters, "+text_length[2]+" units)<br>"; errors++;	// displays an error if the item's description is too long		// TODO: what is the actual limit? (doesn't seem to be 1 per Char, 1 per NL, and 3 per color)
		}
	}
	if (display == "" && character.FILTLVL == 0) { display = display_default }		// Displays as vanilla if hidden and FILTLVL = 0
	// Reverses order of lines
	if (display.includes("<br>") == true) {
		var display_multi = display.split("<br>");
		display = display_multi[display_multi.length-1]
		for (let d = display_multi.length-2; d >= 0; d--) { display = display + "<br>" + display_multi[d] }
		if (display_multi[0].length == 0) { display += "&nbsp;" }
	}
	if (description.includes("<br>") == true) {
		var description_multi = description.split("<br>");
		description = description_multi[description_multi.length-1]
		for (let d = description_multi.length-2; d >= 0; d--) { description = description + "<br>" + description_multi[d] }
		if (description_multi[0].length == 0) { description += "&nbsp;" }
	}
	if (display.includes("�") || display.includes("�")) { notices.encoding = 1 }
	if (errors >= settings.max_errors) { document.getElementById("o"+num).innerHTML += " ... There may be additional errors. The first "+settings.max_errors+" errors were displayed.<br>" }
	else if (settings.error_limit == 0 && errors >= 500) { document.getElementById("o"+num).innerHTML += " ... In total, "+errors+" errors were displayed.<br>" }
	document.getElementById("output_"+num).style.backgroundColor = mappedbgcolor
	document.getElementById("output_"+num).style.borderColor = mappedborder
	 

	return [display,description,mappedbgcolor,mappedborder]
}

// getColor - gets the default color for a given item
//	item: the item being compared
//	return: the item's default color
// ---------------------------------
function getColor(item) {
	var color = "WHITE";
	if (typeof(item.color) != 'undefined') { color = item.color }
	else if (item.MAG == true) { color = "BLUE" }
	else if (item.RARE == true) { color = "YELLOW" }
	else if (item.UNI == true) { color = "GOLD" }
	else if (item.SET == true) { color = "GREEN" }
	else if (item.NMAG == true && (item.ETH == true || item.SOCK != 0)) { color = "GRAY" }
	else if (item.CRAFT == true || item.rarity == "craft" || ((item.ARMOR == true || item.WEAPON == true || item.CODE == "rin" || item.CODE == "amu") && item.NMAG != true  && item.MAG != true  && item.RARE != true  && item.UNI != true  && item.SET != true)) { color = "ORANGE" }
	else if (item.SYNTH == true) { color = "GOLD" }
	return color
}

// equipmentHover - shows equipment info (on mouse-over)
//	num: filter number (1 or 2)
// ---------------------------------
function equipmentHover(num) {
	document.getElementById("tooltip_inventory").style.left = "0px"
	var name = document.getElementById("output_"+num).innerHTML;
	var main_affixes = ""
	var affixes = "";
	for (affix in itemToCompare) {
		if (typeof(stats[affix]) != 'undefined') { if (itemToCompare[affix] != unequipped[affix] && stats[affix] != unequipped[affix] && stats[affix] != 1 && affix != "velocity" && affix != "smite_min") {
			var affix_info = getAffixLine(affix);
			if (affix_info[1] != 0) {
				if (affix == "base_damage_min" || affix == "base_defense" || affix == "req_level" || affix == "req_strength" || affix == "req_dexterity" || affix == "durability" || affix == "baseSpeed" || affix == "range" || affix == "throw_min" || affix == "base_min_alternate" || affix == "block" || affix == "velocity" || affix == "QUANTITY" || affix == "relic_experience" || affix == "relic_density" || affix == "map_tier" || affix == "map_mf_gf" || affix == "description") { main_affixes += affix_info[0]+"<br>" }
				else { affixes += affix_info[0]+"<br>" }
			}
		} }
	}
	if (itemToCompare.RW == true) {
		var rw_name = itemToCompare.name.split(" ­ ")[0].split(" ").join("_").split("'").join("");
		if (rw_name == "Infinity") { rw_name = "infinity" }
		var runes = "";
		for (let i = 0; i < runewords[rw_name].runes.length; i++) { runes += runewords[rw_name].runes[i]; }
		name += "<br>"+"<l style='color:"+colors.GOLD+"'>'"+runes+"'</l>"
	}
	document.getElementById("item_name").innerHTML = name
	document.getElementById("item_name").style.color = document.getElementById("output_"+num).style.color
	document.getElementById("item_info").innerHTML = main_affixes
	document.getElementById("item_affixes").innerHTML = affixes
	document.getElementById("item_desc"+num).style.display = "block"
	if (main_affixes != "" || affixes != "" || document.getElementById("item_desc"+num).innerHTML != "") { document.getElementById("tooltip_inventory").style.display = "block" }
	
	var original_choices_height = 47; if (document.getElementById("original_choices").style.display == "none") { original_choices_height = 0 }
	var item = document.getElementById("output_"+num).getBoundingClientRect();
	var tooltip_width = document.getElementById("tooltip_inventory").getBoundingClientRect().width;
	var textbox_height = document.getElementById("filter_text_1").getBoundingClientRect().height + document.getElementById("filter_text_2").getBoundingClientRect().height
	var editing_height = document.getElementById("item_editing").getBoundingClientRect().height + document.getElementById("non_item_editing").getBoundingClientRect().height + original_choices_height
	var offset_x = Math.floor(item.left + item.width/2 - tooltip_width/2);
	var offset_y = Math.floor(63 + textbox_height + editing_height + 100*num + item.height/2);
	document.getElementById("tooltip_inventory").style.left = offset_x+"px"
	document.getElementById("tooltip_inventory").style.top = offset_y+"px"
	var extra_height = Math.max(0,(document.getElementById("tooltip_inventory").getBoundingClientRect().height - 50 - document.getElementById("output_processing_info").getBoundingClientRect().height))
	if (settings.num_filters == 1) { extra_height += 24 }
	document.getElementById("extra_space").style.height = extra_height+"px"
}

// equipmentOut - stops showing equipment info (mouse-over ends)
// ---------------------------------
function equipmentOut() {
	document.getElementById("tooltip_inventory").style.left = "820px"
	document.getElementById("tooltip_inventory").style.display = "none"
	document.getElementById("item_desc1").style.display = "none"
	document.getElementById("item_desc2").style.display = "none"
}

// getAffixLine - determines how an affix should be displayed
//	affix: name of the affix
//	return: the formatted affix line and combined value of affixes used
// ---------------------------------
function getAffixLine(affix) {
	var source = itemToCompare;
	var affix_line = "";
	var value = source[affix];
	var value_combined = ~~value;
	var halt = false;
	var both = 0;
	var stat = stats[affix];
	if (affix != "ctc" && affix != "cskill" && affix != "set_bonuses" && affix != "description") {
		if (stat.alt != null) {
			if (typeof(source[stat.index[0]]) != 'undefined' && typeof(source[stat.index[1]]) != 'undefined') { if (source[stat.index[0]] > 0 && source[stat.index[1]] > 0) { both = 1; if (stat.index[1] == affix) { halt = true } } }
			if (both == 0) { stat = null; stat = stats_alternate[affix]; }
		}
		for (let i = 0; i < stat.index.length; i++) {
			value = source[stat.index[i]]
			if (value == 'undefined') { value = 0 }
			if (isNaN(value) == false) { value_combined += value }
			var rounding = true;
			if (stat.mult != null) {
				if (stat.mult[i] != 1) {
					value *= character[stat.mult[i]]
					if (affix == "all_skills_per_level") { value = Math.ceil(value) }
				}
				else { rounding = false }
			}
			if (isNaN(value) == false && rounding == true) { value = Math.floor(Math.round(value)) }
			var affix_text = stat.format[i];
			if (value < 0 && affix_text[affix_text.length-1] == "+") { affix_text = affix_text.slice(0,affix_text.length-1) }
			affix_line += affix_text
			affix_line += value
		}
		var affix_text = stat.format[stat.index.length];
		//if (affix_text == " to Class Skills") { affix_text = " to "+character.class_name+" Skills" }
		affix_line += affix_text
		if (affix == "aura" && (source[affix] == "Lifted Spirit" || source[affix] == "Righteous Fire")) { affix_line = source[affix]+" Aura when Equipped" }
		if (halt == true) { value_combined = 0 }
	} else {
		affix_line == ""; value_combined = 1;
		if (affix == "ctc") {
			for (let i = 0; i < source[affix].length; i++) {
				var line = source[affix][i][0]+"% chance to cast level "+source[affix][i][1]+" "+source[affix][i][2]+" "+source[affix][i][3];
				affix_line += line
				if (i < source[affix].length-1) { affix_line += "<br>" }
			}
//		} else if (affix == "cskill" || affix == "charged") { //qord testing
		} else if (affix == "cskill") {
			for (let i = 0; i < source[affix].length; i++) {
				var line = "Level "+source[affix][i][0]+" "+source[affix][i][1]+" ("+source[affix][i][2]+" charges)";
				affix_line += line
				if (i < source[affix].length-1) { affix_line += "<br>" }
			}
		} else if (affix == "description") {
			affix_line += "<span style='color:WHITE'>"+value+"</span>"
		}
	}
	var result = [affix_line,value_combined];
	return result
}

// debug
function printAffixes() {
	document.getElementById("print").innerHTML = ""
	var output = "---------------------------<br>";
	//for (affix in itemCustom) {
	//	output += ".. "+affix+" "+itemCustom[affix]+"<br>"
	//}
	//output += "---------------------------<br>";
	for (affix in itemToCompare) {
		output += affix+" "+itemToCompare[affix]+"<br>"
	}
	output += "---------------------------<br>"
	for (affix in character) {
		output += affix+" "+character[affix]+"<br>"
	}
	output += "---------------------------<br>"
	output += "ID "+item_settings.ID+"<br>"
	for (affix in settings) {
		output += affix+" "+settings[affix]+"<br>"
	}
	for (affix in notices) {
		output += affix+" "+notices[affix]+"<br>"
	}
	output += "---------------------------<br>"
	document.getElementById("print").innerHTML += output
}

// testing...
function test() {
	document.getElementById("print").innerHTML = ""
	
	// without downloading the filter files with their original encoding, there may not be a way to do this
	/*var launcher_url = "https://raw.githubusercontent.com/Project-Diablo-2/LootFilters/main/filters.json";
	getRequest1(launcher_url);
	var str1 = "_¡_¢_£_¤_¥_¦_§_¨_©_ª_«_¬__®_¯_°_±_²_³_´_µ_¶_·_¸_¹_º_»_¼_½_¾_¿_À_Á_Â_Ã_Ä_Å_Æ_Ç_È_É_Ê_Ë_Ì_Í_Î_Ï_Ð_Ñ_Ò_Ó_Ô_Õ_Ö_×_Ø_Ù_Ú_Û_Ü_Ý_Þ_ß_à_á_â_ã_ä_å_æ_ç_è_é_ê_ë_ì_í_î_ï_ð_ñ_ò_ó_ô_õ_ö_÷_ø_ù_ú_û_ü_ý_þ_ÿ_";
	var str2 = "_­_×_¤_¹_²_³_½_";
	document.getElementById("print").innerHTML += unescape(encodeURIComponent(str1)) + "<br><br>"
	document.getElementById("print").innerHTML += unescape(encodeURIComponent(str2)) + "<br><br>"
	document.getElementById("print").innerHTML += str2.split("­").join("­").split("×").join("×").split("¤").join("¤").split("¹").join("¹").split("²").join("²").split("³").join("³").split("½").join("½") + "<br><br>"
	//	.split("­").join("*").split("×").join("x").split("¤").join("=").split("¹").join("1").split("²").join("2").split("³").join("3").split("½").join("%")
	*/
}

/*
// testing...
function getRequest1(url) {
	var request = makeHttpObject();
	request.open("GET", url, true);
	request.send(null);
	request.onreadystatechange = function() {
		if (request.readyState == 4) {
			var response_text = request.responseText
			launcher_text = "";
			for (let i = 0; i < response_text.length; i++) {
				launcher_text += response_text[i]
			}
			launcher_data = JSON.parse(launcher_text);
			getRequest2(launcher_data[2].url)	// TODO: select which author's github to browse (2 = BetweenWalls)
		}
	}
}

// testing...
function getRequest2(url) {
	var request = makeHttpObject();
	request.open("GET", url, true);
	request.send(null);
	request.onreadystatechange = function() {
		if (request.readyState == 4) {
			var response_text = request.responseText
			github_text = "";
			for (let i = 0; i < response_text.length; i++) {
				github_text += response_text[i]
			}
			github_data = JSON.parse(github_text);
			getRequest3(github_data[1].download_url)	// TODO: select which file to browse, ignoring non-filter files (1 = Feather loot.filter)
		}
	}
}

// testing...
function getRequest3(url) {
	var request = makeHttpObject();
	request.open("GET", url, true);
	request.send(null);
	request.onreadystatechange = function() {
		if (request.readyState == 4) {
			var response_text = request.responseText;
			filter_text = "";
			for (let i = 0; i < response_text.length; i++) {
				filter_text += response_text[i]
			}
			// filter text known...
			document.getElementById("print").innerHTML += launcher_text + "<br><br>"
			document.getElementById("print").innerHTML += github_text + "<br><br>"
			document.getElementById("filter_text_2").value = filter_text	// TODO: how to display characters correctly for ANSI encoded files?
			
			// these seem to be the functions PD2 uses for converting between ANSI and UTF-8... unfortunately, they don't work correctly for the characters we're interested in
			//	unescape(encodeURIComponent(s))
			//	decodeURIComponent(escape(s))
			
			// testing custom ANSI to UTF-8 conversion:
			
			var text1 = filter_text.substring(1,1000)
			//var text1 = filter_text.substring(696,706)
			//var text1 = filter_text.substring(686,694)
			
			//var encoder = new TextEncoder();
			//alert(encoder.encode(text1))
			//	(­×¤¹²³½)	32,40,239,191,189,215,164,239,191,189,239,191,189,239,191,189,239,191,189,41,13
			//	I encodi	73,32,101,110,99,111,100,105
			
			var encoding = "";
			var encoder = new TextEncoder();
			for (let i = 0; i < text1.length; i++) {
				
				var encoded_array = encoder.encode(text1[i])
				if (encoded_array.length > 1) {
					// TODO
					encoding += text1[i] + ": "
					encoding += escape(text1[i]) + " "
					for (let j = 0; j < encoded_array.length; j++) {
						encoding += encoded_array[j] + " "
					}
					encoding += "<br>"
					document.getElementById("print").innerHTML += "Ø"
				} else {
					document.getElementById("print").innerHTML += text1[i]
				}
				//var t1_bytes = text1[i].getBytes();
				//document.getElementById("print").innerHTML += t1_bytes
				
				//document.getElementById("print").innerHTML += unescape(encodeURIComponent(text1[i]))
			}
			//document.getElementById("print").innerHTML += text1 + "<br><br>"
			document.getElementById("print").innerHTML += "<br><br>" + encoding + "<br><br>"
		}
	}
}

// Makes a hypertext transfer protocol object
function makeHttpObject() {
	try {return new XMLHttpRequest();}
	catch (error) {}
	try {return new ActiveXObject("Msxml2.XMLHTTP");}
	catch (error) {}
	try {return new ActiveXObject("Microsoft.XMLHTTP");}
	catch (error) {}
	throw new Error("Could not create HTTP request object.");
}
*/














// character codes used by filters:
/*
CHARSTAT15	gold in stash
CHARSTAT14	gold on character
CHARSTAT70	quantity (quiver = 500 arrows, javelins & throwing weapons > 0)
CHARSTAT45	poison resist
CHARSTAT43	cold resist
CHARSTAT13	experience (0 for mules ...tied to character level)
*/

// changeBackground - 
// ---------------------------------
function changeBackground() {
	var r = settings.background + 1;
	if (r > 5) { r = 1 }
	var background = "./images/act_"+r+".png";
	document.getElementById("background_1").src = background
	document.getElementById("background_2").src = background
	settings.background = r
}

// toggleNonItemDetails - 
// ---------------------------------
function toggleNonItemDetails(checked)  {
	if (checked == true) { document.getElementById("non_item_editing").style.display = "block" }
	else { document.getElementById("non_item_editing").style.display = "none" }
}
// setCLVL2 - 
// ---------------------------------
function setCLVL2(value) {
	if (isNaN(value) == true || value < 1 || value > 99) { value = document.getElementById("dropdown_clvl").selectedIndex }
	document.getElementById("clvl").value = value
	document.getElementById("dropdown_clvl").value = value
	character.CLVL = Number(value)
	if (settings.version == 0) { itemCustom.CRAFTALVL = Math.floor(character.CLVL/2) + Math.floor(ilvl/2) }
	else {
		if (character.CHARSTAT14 > (character.CLVL * 10000)) {
			character.CHARSTAT14 = character.CLVL * 10000
			document.getElementById("gold_char").value = character.CHARSTAT14
		}
		if (value == 1) { character.CHARSTAT13 = 0 }
		else { character.CHARSTAT13 = 1000 }
	}
	simulate()
}
// setClass - 
// ---------------------------------
function setClass(value) {
	var classes = ["AMAZON", "ASSASSIN", "BARBARIAN", "DRUID", "NECROMANCER", "PALADIN", "SORCERESS"];
	for (let i = 0; i < classes.length; i++) { character[classes[i]] = false }
	character[value.toUpperCase()] = true
	simulate()
}
// setDifficulty - 
// ---------------------------------
function setDifficulty(selected) {
	if (Number(selected) < 3) {
		character.auto_difficulty = false
		character.DIFFICULTY = Number(selected)
	} else {
		character.auto_difficulty = true
		if (itemCustom.ILVL < 36) { character.DIFFICULTY = 0 }
		else if (itemCustom.ILVL > 66) { character.DIFFICULTY = 2 }
		else { character.DIFFICULTY = 1 }
	}
	simulate()
}
// setGoldStash - 
// ---------------------------------
function setGoldStash(value) {
	if (isNaN(value) == true || value < 0 || value > 2500000) { value = character.CHARSTAT15 }
	document.getElementById("gold_stash").value = Number(value)
	character.CHARSTAT15 = Number(value)
	simulate()
}
// setGoldChar - 
// ---------------------------------
function setGoldChar(value) {
	if (isNaN(value) == true || value < 0 || value > (character.CLVL * 10000)) {
		value = Number(character.CHARSTAT14);
		if (value > (character.CLVL * 10000)) { value = character.CLVL * 10000 };
	}
	document.getElementById("gold_char").value = Number(value)
	character.CHARSTAT14 = Number(value)
	simulate()
}
// setShop - handles 'shop' checkbox
// ---------------------------------
function setShop(checked) {
	character.SHOP = checked
	if (checked == true) { if (character.EQUIPPED == true) {
		document.getElementById("equipped").checked = false;
		character.EQUIPPED = false;
	} }
	simulate()
}
// setEquipped - handles 'equipped' checkbox
// ---------------------------------
function setEquipped(checked) {
	character.EQUIPPED = checked
	if (checked == true) { if (character.SHOP == true) {
		document.getElementById("shop").checked = false;
		character.SHOP = false;
	} }
	simulate()
}
// setFilterLevel - 
// ---------------------------------
function setFilterLevel(value) {
	if (isNaN(value) == true || value < 0 || value > 9) {
		value = Number(character.FILTLVL);
		if (value > 9) { value = 9 };
	}
	document.getElementById("filtlvl").value = Number(value)
	character.FILTLVL = Number(value)
	simulate()
}


// toggleOriginalChoices - 
// ---------------------------------
function toggleOriginalChoices(checked) {
	if (checked == true) { document.getElementById("original_choices").style.display = "block" }
	else { document.getElementById("original_choices").style.display = "none" }
}

// changeVersion - 
//	v: version (0 = PoD, 1 = PD2)
// ---------------------------------
function changeVersion(v) {
	var prev_version = settings.version;
	document.getElementById("version"+v).checked = true
	v = Number(v)
	settings.version = v
	if (settings.version == 1) {
		params.set('v','PD2')
		window.history.replaceState({}, '', `${location.pathname}?${params}`)
	}
	else {
		params.set('v','PoD')
		window.history.replaceState({}, '', `${location.pathname}`)
	}
	if (prev_version != v) {
		var already_reset = setPD2Codes();
		if (already_reset == false) { simulate() }
	}
}

// toggleAutoSimulation - 
// ---------------------------------
function toggleAutoSimulation(checked) {
	if (checked == true) { settings.auto_simulate = 1 }
	else { settings.auto_simulate = 0 }
	simulate()
}

// toggleConditionValidation - 
// ---------------------------------
function toggleConditionValidation(checked) {
	if (checked == true) {
		settings.validation = 1
		document.getElementById("show_error_limit").style.display = "block"
	} else {
		settings.validation = 0
		document.getElementById("show_error_limit").style.display = "none"
	}
	simulate()
}

// toggleErrorLimit - 
// ---------------------------------
function toggleErrorLimit(checked) {
	if (checked == true) {
		settings.error_limit = 1
		settings.max_errors = 50
	}
	else {
		settings.error_limit = 0
		settings.max_errors = 10000
	}
	simulate()
}

// toggleHorizontalScroll - 
// ---------------------------------
function toggleHorizontalScroll(checked) {
	if (checked == true) {
		settings.nowrap = true
		for (let num = 1; num <= settings.num_filters; num++) { document.getElementById("o"+num).style.width = settings.nowrap_width+"px" }
	}
	else {
		settings.nowrap = false
		for (let num = 1; num <= settings.num_filters; num++) { document.getElementById("o"+num).style.width = "auto" }
	}
}

// toggleMultipleFilters - 
// ---------------------------------
function toggleMultipleFilters(checked) {
	if (checked == true) {
		settings.num_filters = 2
		document.getElementById("filter_text_bar_2").style.display = "block"
		document.getElementById("filter_text_2").style.display = "inline"
		document.getElementById("output_area_2").style.display = "inline"
		document.getElementById("output_area_2").style = "height:100px; width:800px; position:relative;"
		document.getElementById("o2").style.display = "block"
		document.getElementById("multiple_spacing").innerHTML = "<br>"
	} else {
		settings.num_filters = 1
		document.getElementById("filter_text_bar_2").style.display = "none"
		document.getElementById("filter_text_2").style.display = "none"
		document.getElementById("output_area_2").style.display = "none"
		document.getElementById("o2").style.display = "none"
		document.getElementById("multiple_spacing").innerHTML = ""
	}
}

/**
  * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
  * 
  * @param {String} text The text to be rendered.
  * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
  * 
  * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
  */
function getTextWidth(text, font) {
  // re-use canvas object for better performance
  const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
  const context = canvas.getContext("2d");
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
}
function getCssStyle(element, prop) {
    return window.getComputedStyle(element, null).getPropertyValue(prop);
}
function getCanvasFontSize(el = document.body) {
  const fontWeight = getCssStyle(el, 'font-weight') || 'normal';
  const fontSize = getCssStyle(el, 'font-size') || '16px';
  const fontFamily = getCssStyle(el, 'font-family') || 'Times New Roman';
  
  return `${fontWeight} ${fontSize} ${fontFamily}`;
}
