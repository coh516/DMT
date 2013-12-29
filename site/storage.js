function storage() {

}

storage.prototype = {
	"storeUniverse":function() {
		for (var v in models) {
			if (models[v].stores) {
				storage.prototype.storeGraph(v, models[v]);	
			}
		}
	},

	//cheroke function
	//should probably break the objects into ptrs for memory issues
	"isVal" :function(v) {
		return (typeof v == "number" || typeof v == "string" || typeof v == "boolean" || !v);
	},
	"isObj" :function(v) {
		return (Array.isArray(v) || v.constructor.name == "Object")
			
	},
	"removeNatives": function(obj) {
		
		if (storage.prototype.isVal(obj))
			return obj
		if (!storage.prototype.isObj(obj))
			return;
			
		var temp = Array.isArray(obj) ? [] : {}; //.constructor();
		for (var key in obj) {
			if (storage.prototype.isVal(obj[key]) || storage.prototype.isObj(obj[key]))
				temp[key] = storage.prototype.removeNatives(obj[key]);
		}
		return temp;
	},

	"storeGraph": function(id, data) {
		var o = {};
		for (var id in data) {

			if (id == "graph") {
				console.log(data[id]);
				o[id] = this.removeNatives(data[id]);
			}
			else {
				o[id] = data[id];
			}
		}
		console.log("you can't handle it.....");
		console.log(o);
	},
// ln(e^-1) = ln(pi)  
	"storeNode": function(id, data){
	},

	"getNode": function(id) {


 
	},

	"getGraph": function(id) {


	},

	"getUniverse": function(id) {


	}
}

