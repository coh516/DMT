

// this test case is really wrong
// the ui builder really should be consisting of node partial templates that loop into a UI


function testCase(uni) {
	var gids = []; 
	var gojs = [];

	var jobjects = [
	//{"UI":{"save/load dialogue":[{"row":{"label":[{"text":"save"}, {"events":"onClick"}]}}, {"row":{"label":[{"text":"load"}, {"events":"onClick"}]}}]}},
	    		{"UI":{"dialog":[{"view":"grid"},{"row":[{"label":[{"text":"save as"}]}, {"inputbox":[{"text":"enterSomeText"}]}, {"button":[{"type":"onSubmit"}]}]}]}},
	    	//	{"UI":{"dialog":[{"view":"grid"},{"row":[{"label":[{"text":"load"}]}, {"inputbox":[{"text":"enterSomeText"}]}, {"button":[{"type":"onSubmit"}]}]}]}},
	    		{"DB":{"internals":{"dialogs":["name", "timestamp", "graph"]}}},
			["timeStamp"],
			["serializeUniverse"],


			["acid1"],["acid2"],["acid3"],["acid4"],["acid5"],["acid6"]

	    ];
	for (var i =0; i < jobjects.length; i++ ) {
		gids[i] = uni.addGraph();
		// var json = {"UI":{"save/load dialogue":[{"label":[{"text":"save"}, {"events":"onClick"}]}, {"label":[{"text":"load"}, {"events":"onClick"}]}]}}
		//
		var json = jobjects[i];
		//var json = {"UI":{"save menu":["save", "load"]}}
		
		/*
		var json = {"UI":{"save/load dialogue":["save", "load"]}}
		var json = {"UI":{"save/load dialogue":["save", "load"]}}
		*/
	//	universes['ptr', uni.id, 
		graphLookup[gids[i]].setFromJSON(json);
	
		var gf = new gfx(uni.id, gids[i]);
		gf.moveTo(i*100, i*10);
		
		//gf.setXYZ();
		//gf.build();
		gf.build();
		gojs.push(gf);
	}
	gojs[0].moveTo(450, 20);
	gojs[3].moveTo(200, 300);

	gojs[4].moveTo(650, 500);
	gojs[5].moveTo(580, 450);
	gojs[6].moveTo(510, 480);
	gojs[7].moveTo(510, 350);
	gojs[8].moveTo(450, 350);
	gojs[9].moveTo(450, 400);


	var uiroot = [gids[0], 'item', 0, 'index', 0];
	var uisub = [gids[0], 'item', 0, 'item', 0, 'item', 1, 'item', 2, 'item', 0, 'item', 0, 'index', 0];
	var uitext = [gids[0], 'item', 0, 'item', 0, 'item', 1, 'item', 1, 'item', 0, 'item', 0, 'index', 0];


	var dbname = [gids[1], 'item', 0, 'item', 0, 'item', 0, 'item', 0, 'index', 0];
	var dbtimestamp =  [gids[1], 'item', 0, 'item', 0, 'item', 0, 'item', 1, 'index', 0];
	var dbgraph = [gids[1], 'item', 0, 'item', 0, 'item', 0, 'item', 2, 'index', 0];

	var timestamp = [gids[2], 'item', 0, 'index', 0];
	var su = [gids[3], 'item', 0, 'index', 0];


	var a1 = [gids[4], 'item', 0, 'index', 0];
	var a2 = [gids[5], 'item', 0, 'index', 0];
	var a3 = [gids[6], 'item', 0, 'index', 0];
	var a4 = [gids[7], 'item', 0, 'index', 0];
	var a5 = [gids[8], 'item', 0, 'index', 0];
	var a6 = [gids[9], 'item', 0, 'index', 0];
//	var a7 = [gids[10], 'item', 0, 'index', 0];



	var o = getObject([gids[0], 'item', 0, 'item', 0], graphLookup);
	o.layout = "grid";


	gfx.prototype.connect(uiroot, uisub);
	gfx.prototype.connect(uisub, uitext);
	gfx.prototype.connect(uitext, dbname);
	gfx.prototype.connect(uisub, timestamp);
	gfx.prototype.connect(timestamp, dbtimestamp);
	gfx.prototype.connect(uisub, su);
	gfx.prototype.connect(su, dbgraph);

	

	gfx.prototype.connect(a1, a2);
	gfx.prototype.connect(a2, a3);
	gfx.prototype.connect(a2, a4);
	gfx.prototype.connect(a4, a5);
	gfx.prototype.connect(a3, a6);
	gfx.prototype.connect(a3, a4);
	

}


function launch() {
//	alert("test..");
//		document.body.appendChild(canvas);
	
//	console.log = function() { };
	//test//

	var uni = new universe("ptr");
//	models[uni.id].type = "ptr";
// **todo**
//
//  it might be nice to automatically group elements...
//
//
//
	contextMenu.setup();
	stageMenu.setup();
	saveMenu.setup();	

	linkCurve.prototype.setup();

	events[uni.id] = nodeEvents; // should be instance of obj handle
	// universes["type"]["events"] 
	//
	testCase(uni);

}

