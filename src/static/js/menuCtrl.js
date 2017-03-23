(function (window, angular, DI, undefined) {
    "use strict";

    DI.registerController('menuCtrl', [
        '$scope', 
        '$compile', 
        '$element', 
        function($scope, $compile, $element) {

        var self = this;

        self.isOpened = false;
        self.subClass = [];

        self.toggle = function __toggle() {
            self.isOpened = !(self.isOpened);
            if (self.isOpened) {
                self.subClass.forEach(function(el, idx) {
                    self.subClass[idx] = 'menu-btn-sub-open menu-btn-sub-' + (idx+1);
                });
            }
            else {
                self.close();
            }
        }
        self.close = function __close() {
            self.isOpened = false;
            self.subClass.forEach(function(el, idx) {
                self.subClass[idx] = undefined;
            });
        }


        $element.find('.menu-btn-sub').each(function(idx, el) {
            self.subClass[idx] = undefined;
            var $el = angular.element(el);
            $el.attr('ng-class', 'menu.subClass[' + idx + ']')
            $compile($el)($scope);
        })
    }]);

})(window, angular, window.DI)