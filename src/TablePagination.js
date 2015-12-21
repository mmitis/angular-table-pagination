/**
 * @name  Table Pagination Managment
 * Directive to create pagination under table (ajax)
 * @ngdoc directive
 * @requires $sce, $timeout
 * @restrict EA
 */
var tablePaginate = angular.module('tablePagination', []);


tablePaginate.directive('tablePagination', ['$sce', '$timeout', function($sce, $timeout) {
    'use strict';
    return {
        restrict: 'EA',
        replace: 'true',
        templateUrl: $sce.trustAsResourceUrl('/views/tablePagination.html'),
        scope : {
            // Metrics with basic data
            metrics : '=',
            //Function to run when the page or limit is changed
            reload : '='
        },

        link:function($scope){
            //Setup Variables
            $scope.settings =
            {
                visiblity        : true,
                num_rows         : [10,25,50,100],
                default_rows     : 25,
                pages            : 1,
                pages_arr        : 1,
                currentPage      : 0,
                max_pages        : 5,
                visiblity_paginate : true,
                showPage            : 1,
                changed : true
            };

            $scope.setLimit = 25;
            $scope.oldLimit = false;

            /**
             * Recalculate number of pages and the current page
             */

            $scope.$watch('metrics',function(newValue, oldValue){
                $scope.metrics = newValue;
                if($scope.settings.changed == true) {
                    $scope.recalculatePagination();
                }
            });
            $scope.recalculatePagination = function(){
                $scope.settings.visiblity_paginate = true;

                $scope.metrics.total = $scope.metrics.total == null ? 0 : $scope.metrics.total;
                $scope.metrics.limit = $scope.metrics.limit == null ? $scope.settings.default_rows : $scope.metrics.limit;

                if($scope.metrics.total > 0 || $scope.metrics.total == null)
                {
                    if($scope.metrics.total > $scope.metrics.limit )  {
                        //Number of pages
                        if($scope.metrics.limit === 0) {$scope.metrics.limit = 1}
                        $scope.settings.pages = Math.ceil($scope.metrics.total / ($scope.metrics.limit));
                        //Set current page
                        $scope.settings.currentPage = 0;
                    }
                    else {
                        $scope.settings.pages = 1;
                    }

                    //Recalculate array
                    $scope.settings.pages_arr = $scope.getPageArray($scope.settings.currentPage, $scope.settings.pages, $scope.settings.max_pages);
                    if(typeof $scope.reload == "function" &&  $scope.settings.changed == false && $scope.metrics.total != 0) {
                        console.log('reload', $scope.reload);
                        $scope.reload(function(){
                            //Force
                            $scope.metrics.limit = $scope.setLimit;
                            $scope.settings.pages = Math.ceil($scope.metrics.total / ($scope.metrics.limit));
                            $timeout(function(){
                                $scope.settings.pages_arr = $scope.getPageArray(0, $scope.settings.pages, $scope.settings.max_pages);
                            },1)
                        });
                       
                    }
                     $scope.settings.changed = false;
                }
                $scope.settings.pages_arr = $scope.getPageArray($scope.settings.currentPage, $scope.settings.pages, $scope.settings.max_pages);
            };
            /**
             * Click handler which change the current page to the selected
             * @param selectedPage - page we want to go
             */
            $scope.changePage = function(selectedPage){
                $scope.metrics.offset = (selectedPage ) * $scope.metrics.limit;
                $scope.settings.currentPage = selectedPage;
                $scope.settings.pages_arr = $scope.getPageArray($scope.settings.currentPage, $scope.settings.pages,  $scope.settings.max_pages);
                $scope.reload();
            };
            /**
             * Change to the previous page if possible
             */
            $scope.pagePrev = function (){
                if($scope.settings.currentPage > 0){
                    $scope.changePage($scope.settings.currentPage - 1);
                }
            };
            /**
             * Change to the next page if possible
             */
            $scope.pageNext = function(){
                if($scope.settings.currentPage < $scope.settings.pages-1){
                    $scope.changePage($scope.settings.currentPage + 1);
                }
            };
            $scope.pageFirst = function(){
                $scope.changePage(0);
            };
            $scope.pageLast = function(){
                $scope.changePage($scope.settings.pages-1);
            };

            /**
             * Change the current limit of the rows per page to the selected one
             * @param newLimit - new number of rows per page
             */
            $scope.changeLimit = function (newLimit){
                $scope.metrics.limit = newLimit;
                $scope.metrics.offset = 0;
                $scope.setLimit = newLimit;
                $scope.recalculatePagination();
            };

            /**
             * Helper for the ng-repeat which create necessary array with exact size
             * @param from - length of the array
             * @param to - length of the array
             * @returns {Array} - empty array with the selected length
             */
            $scope.getNumber = function(from,to) {
                var arr = [];
                for(var i = from; i < to; i++ ){
                    arr.push(i);
                }
                return arr;
            }
            $scope.getPageArray = function(current, pages, limit){
                if(pages <= 1 ){
                    return [0];
                }
                else if(pages < limit){
                    return $scope.getNumber(0, pages );
                }
                else if(current < limit/2)
                {
                    return $scope.getNumber(0, limit < pages ? limit : pages);
                }
                else if (pages - Math.ceil(limit/2) < current )
                {
                    return $scope.getNumber(pages-limit,pages);
                }
                else
                {
                    var from  = current - Math.ceil(limit/2)+1;
                    var to = current + Math.ceil(limit/2);
                    return $scope.getNumber(from,to);
                }
            };

            $scope.changePageByInput = function(){
                if($scope.settings.showPage > 0 && $scope.settings.showPage <= $scope.settings.pages)
                {
                    $scope.settings.currentPage = $scope.settings.showPage -1;
                    $scope.changePage($scope.settings.currentPage)
                }
            }
            $scope.changePageByInputOutBlur = function(){
                if($scope.settings.showPage <= 0 || $scope.settings.showPage > $scope.settings.pages)
                {
                    $scope.settings.showPage  = 1 + $scope.settings.currentPage;
                }
            }

            $scope.$watch('settings.currentPage',function(){
                $scope.settings.showPage = $scope.settings.currentPage +1;
            });

            $scope.recalculatePagination();

        }
    };
}]);
