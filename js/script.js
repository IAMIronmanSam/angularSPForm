var myappModule = angular.module('myApp', []);

myappModule.controller('formController',function formController($scope) {
      $scope.list = [];
      $scope.submit = function() {
        if ($scope.text) {
          $scope.list.push(this.text);
          $scope.text = '';
          console.log(this.text);
        }
      };
});