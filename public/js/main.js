var mainApp = angular.module('mainApp', []);
mainApp.controller('mainController', function($scope, $http) {
    $scope.updateItems = function(){
    	console.log('refreshing items!')
    	//this function forces a refresh. It'll be our main way of getting updates until we get the setTimeout working!
    	$http.get('/rfr').then(function(resp){
    		console.log(resp);
    	})
    }
});
