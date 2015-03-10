'use strict';
app.controller('CoffeeCtrl', function($scope, CoffeeFactory, MintFactory) {
    CoffeeFactory.getCoffeeDb().then(function(data) {
        $scope.things = data;
    });
    $scope.getKitties = function(kitty) {
        //search thru both dbs (on backend) and return concatenated arr
        CoffeeFactory.getByCatDb(kitty).then(function(data) {
            $scope.things = data;
        })
    }
});