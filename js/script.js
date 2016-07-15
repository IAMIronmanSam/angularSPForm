/*
 * Redistribution or use in source or binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions or the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions or the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 3. Neither the name Visage nor the names of its contributors may be used
 *    to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS or CONTRIBUTORS "AS IS"
 * or ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED or ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
var myappModule = angular.module('myApp', []);
var spForm = {};
spForm.util = {};
spForm.config ={
	list : "/sites/mydomain/_api/web/lists/GetByTitle('personDetails')/items",
};
myappModule.controller('formController',function formController($scope) {
      $scope.list = [];
      spForm.util.RESTListData(spForm.config.list);
      $scope.submit = function() {
      	var personID = spForm.util.getParameterByName('pid');
        if ($scope.profile) {
          console.log(JSON.stringify($scope.profile));
          spForm.CRUDItem($scope.profile,spForm.config.list,'create',personID);
        }
      };
});
spForm.CRUDItem = function(columnData,listName,action,itemID){
	var context = SP.ClientContext.get_current();
	var web = context.get_web();
	var list = web.get_lists();
    var targetList = list.getByTitle(listName);
    var item;
    switch(action){
		case 'create':    	
			var listItemCreation = new SP.ListItemCreationInformation();
	    	item = targetList.addItem(listItemCreation);
    	    for(var title in columnData){
		    	item.set_item(title,columnData[title]);
			}
		    item.update();
		    context.load(item);
	    break;
	    case 'update':
	    	item = targetList.getItemById(itemID);
	    	context.load(item);
	    	context.executeQueryAsync(function(){ 
	    	for(var title in columnData){
			    item.set_item(title,columnData[title]);
			}
			    item.update();
			    context.load(item);
			    context.executeQueryAsync(function(){
			    	console.log('updated successfully')
				},function(sender, args){
				    console.error("Something went wrong"+args.get_message());
				});
	    	},function(sender, args){ 
    			console.log("Something went wrong"+args.get_message());
    		});
	    break;
	    case 'delete':
	    	item = targetList.getItemById(itemID);
	    	item.deleteObject();
	    	context.executeQueryAsync(function(){
		    	console.log("Item Deleted successfully");
		   	},function(sender, args){ 
		    	console.log("Somethig went wrong: "+args.get_message());
		    });
	    break;
    }
    context.executeQueryAsync(function(){
    	console.log("Item created "+item.get_id());
   	},function(sender, args){ 
    	console.log("Somethig went wrong: "+args.get_message());
    });
};
spForm.util.RESTListData = function(listURL){
    jQuery.ajax({
        url: listURL,
        type: "get",
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (response) {
        	var rawData = response.d.results
        	var nextItemURL = response.d.__next; //If more than 100 items in a list
        	if(nextItemURL){
        	    RESTListData(nextDataURL);
        	} else {
        	    if(rawData.length != 0){
                    console.log(JSON.stringify(rawData));
                } else {
                    console.log("List is empty");
                }   
        	}
        },
        error: function (err) {
            console.error(JSON.parse(err.responseText).error.message.value);
        }
    });
  };
spForm.util.getParameterByName = function(name) {
	var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
	return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
};