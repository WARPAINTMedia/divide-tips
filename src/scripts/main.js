/* global store, angular */
var STORE_KEY = 'divider.tips';
var STORE_TOTALS = 'divider.tips.totals';
// open the storage, or create an empty object
var globalItems = store.get(STORE_KEY) || [{
  name: 'Persons Name',
  hours: 0,
  split: 0
}];
var globalTotals = store.get(STORE_TOTALS) || {
  totalTips: 0,
  remainingMoney: 0,
  remainingHours: 1,
  totalHours: 1
};
if (globalItems.length > 1) {
  // remove the hashkey
  globalItems = globalItems.map(function(obj){
    delete obj['$$hashKey'];
    return obj;
  });
}
var angularapp = angular.module('tipDivider', []);
angularapp.controller('TipController', function($scope) {
  $scope.totalTips = globalTotals.totalTips;
  $scope.remainingMoney = globalTotals.remainingMoney;
  $scope.remainingHours = globalTotals.remainingHours;
  $scope.totalHours = globalTotals.totalHours;
  $scope.items = globalItems;
  $scope.updateTotals = function() {
    var hourly = ($scope.totalTips / $scope.totalHours).toFixed(2);
    var remainingMoney = $scope.totalTips;
    var remainingHours = $scope.totalHours;
    for(var item in $scope.items) {
      var split = (hourly * $scope.items[item].hours).toFixed(2);
      $scope.items[item].split = split;
      remainingMoney -= split;
      remainingHours -= $scope.items[item].hours;
    }
    $scope.remainingMoney = remainingMoney.toFixed(2);
    $scope.remainingHours = remainingHours;
    var items = $scope.items;
    store.set(STORE_KEY, items.map(function(obj){
      // return a new object with the props I want to save
      return {
        name: obj.name,
        hours: obj.hours
      };
    }));
    store.set(STORE_TOTALS, {
      totalTips : $scope.totalTips,
      remainingMoney : $scope.remainingMoney,
      remainingHours : $scope.remainingHours,
      totalHours : $scope.totalHours
    });
  };
  $scope.updateTotals();
  $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
    document.querySelector('tbody').classList.remove('loading');
  });
  $scope.clearStorage = function() {
    if (confirm('Clear the storage?')) {
      store.clear();
      window.location.reload();
    }
  };
});
angularapp.directive('onFinishRender', function ($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      if (scope.$last === true) {
        $timeout(function () {
          scope.$emit('ngRepeatFinished');
        });
      }
    }
  }
});
// a custom directive in order to pass raw attributes from the trigger elements
angularapp.directive('myAdd', function() {
  return function($scope, element) {
    element.bind('click', function() {
      var empty = false;
      Array.prototype.slice.call(document.querySelectorAll('#'+this.dataset.id+' input'), 0).forEach(function(item){
        if (!item.value) {
          empty = true;
        }
      });
      if (empty) {
        alert('Fields cannot be empty.');
        return;
      } else {
        var items = $scope.items;
        items.push({
          name: '',
          hours: 0,
          split: 0
        });
        store.set(STORE_KEY, items);
        $scope.$apply(function() {
          $scope.items = items;
        });
      }
    });
  };
});

angularapp.directive('myRemove', function() {
  return function($scope, element) {
    element.bind('click', function() {
      if(this.dataset.id === 'field-0') {
        alert('cannot delete first section');
        return;
      } else {
        var index = $scope.items.indexOf(this.dataset.id.split('-')[1]);
        var items = $scope.items;
        items.splice(index, 1);
        store.set(STORE_KEY, items);
        $scope.$apply(function() {
          $scope.items = items;
        });
      }
    });
  };
});
