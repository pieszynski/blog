// Moduł DI
(function(window, angular){

  window.DI = new function(){
    var self = this;
    var actions = [];
    var app = angular.module('appRoot',[]);

    app.filter('_.str', function() {
      return function(str, fn, params){
        str = str || '';
        params = params || [];
        params.unshift(str);
        return fn ? _.str[fn].apply(this, params) : str;
      }
    })

    self.registerAction = function(action) {
      if ('function' !== typeof(action))
        return;

      actions.push(action);
    };

    self.registerController = function(name, ctrlDef) {
      app.controller(name, ctrlDef);
    }

    self.registerDirective = function(name, dirDef) {
      app.directive(name, dirDef);
    }

    self.invokeAll = function(){
      for(var f = 0; f < actions.length; f++) {
        actions[f]();
      }
    };
  }();

})(window,angular);

// Główny kontroler strony
(function(window, $, angular){
  window.DI.registerController('rootCtrl', function(){
    var self = this,
        blockTitleUpdate = false;

    self.pageTitle = undefined;

    self.setPageTitleOnce = function (title) {
      if (blockTitleUpdate)
        return;

      self.pageTitle = title;
      blockTitleUpdate = true;
    }

    window.DI.root = function() {
      return {
        setPageTitleOnce : self.setPageTitleOnce
      }
    }();
  });

})(window,jQuery,angular);

// dyrektywa daty powstania/edycji artykułu
(function(window){
  window.DI.registerDirective('topDate', function(){
    return {
      restrict : 'E',
      transclude : true,
      template : '<div class="top-date" ng-transclude></div>'
    }
  });
})(window);

// dyrektywa pokazywania zapytania po kliknięciu
(function(window, $) {

// użycie:
//  <quiz-remember
//      remember="tekst dodany po kliknięciu"
//      help="tekst ukrywający, dostępny do kliknięcia"
//      help-click="funkcja do wykonania po kliknięciu w link pomocy np. 'hello.clk()'"
//      m-over="akcja wykonywana na najechanie na całą kontrolkę"
//      m-leave="akcja wykonywana gdy mysz przestanie się znajdować nad kontrolką">
//  "Treść początkowa do której będzie doklejone na końcu pole 'help'e"
//  </quiz-remember>

  window.DI.registerDirective('quizRemember', function(){
    return {
      restrict : 'E',
      scope : {
        //clickAction : "=qrClick",
        helpClick : '&', // tożsame z '&helpClick' bo atrybut nazywa się tak samo jak klucz
        mouseOver : '&mOver',
        mouseLeave : '&mLeave'
      },
      transclude : true,
      controller : ['$scope', function($scope){
        $scope.remember = '';
        $scope.help = '[Nie pamiętam]';
        $scope.doShow = false;
        $scope.showResponse = function(){
          $scope.doShow = true;

          $scope.helpClick();
        }

      }],
      link: function(scope, element, attrs) {
        scope.remember = attrs.remember;
        if (attrs.help)
          scope.help = attrs.help;
      },
      template : '<span ng-mouseover="mouseOver()" ng-mouseleave="mouseLeave()"><span ng-transclude></span> <a ng-hide="doShow" ng-click="showResponse()">{{help}}</a><span ng-show="doShow">{{remember}}</span></span>'
    }
  });
})(window, jQuery);

(function(window){
  window.DI.registerDirective('imageInfo', function(){
    return {
      restrict:'E',
      scope: {},
      transclude: false,
      controller: ['$scope', function($scope){
        $scope.imgSrc = '';
        $scope.info = '';
      }],
      link: function(scope, element, attrs){
        scope.imgSrc = attrs.src || '';
        scope.info = attrs.info || '';

        // niestety nie można zostawić szablonu 'src="{{src}}"' bo przeglądarka
        // zaczyna automatycznie pobierać obraz z adresu zawierającego niepodmieniony literał '{{src}}'
        element.find('img').attr('src', scope.imgSrc);
      },
      template: '<div class="imageInfo"><div><img class="fit block" src="" alt="{{info}}" /></div><div class="imageDescription">{{info}}</div></div>'
    }
  });
})(window);

(function(window) {
  window.DI.registerDirective('nhref', function () {
    return {
      restrict: 'A',
      scope: {},
      transclude: false,
      link: function (scope, element, attrs) {
        var href = element.attr('nhref');
        element.attr('rel', 'nofollow').attr('target','_blank').attr('href', href);
      }
    }
  });
})(window);
