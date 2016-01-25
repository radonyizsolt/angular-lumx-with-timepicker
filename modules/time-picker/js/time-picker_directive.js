/* global angular */
/* global moment */
/* global navigator */
'use strict'; // jshint ignore:line


angular.module('lumx.time-picker', [])
    .controller('lxTimePickerController', ['$scope', '$timeout', '$window', function($scope, $timeout, $window)
    {
        var self = this,
            activeLocale,
            $timePicker,
            $timePickerFilter,
            $timePickerContainer,
            $computedWindow;

        $scope.ctrlData = {
            isOpen: false
        };

        $scope.display = {
            hours: moment().format('HH'),
            minutes: moment().format('mm')
        };

        $scope.$watch('display', function(newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                var hours = parseInt(newValue.hours, 10), minutes = parseInt(newValue.minutes, 10);

                if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                    if (hours < 0 || hours > 23) {
                        $scope.display.hours = oldValue.hours;
                    }
                    if (minutes < 0 || minutes > 59) {
                        $scope.display.minutes = oldValue.minutes;
                    }
                } else {
                    $timeout(function() {
                        $scope.activeTime = moment($scope.selected.date).hours(hours).minutes(minutes);
                        $scope.selected.date = $scope.activeTime;
                        $scope.selected.model = $scope.activeTime.format('HH:mm');
                    }, 100);
                }
            }
        }, true);

        this.init = function(element, locale)
        {
            $timePicker = element.find('.lx-time-picker');
            $timePickerContainer = element;
            $computedWindow = angular.element($window);

            self.build(locale, false);
        };

        this.build = function(locale, isNewModel)
        {
            if (locale === activeLocale && !isNewModel)
            {
                return;
            }

            activeLocale = locale;

            moment.locale(activeLocale);

            if (angular.isDefined($scope.model))
            {
                if (typeof $scope.model === 'string' && /\d{2}:\d{2}/gi.test($scope.model))
                {
                    var time = $scope.model.split(':');
                    $scope.selected = {
                        model: moment().hours(time[0]).minutes(time[1]).format('HH:mm'),
                        date: moment().hours(time[0]).minutes(time[1])
                    };
                } else {
                    $scope.selected = {
                        model: moment($scope.model).format('HH:mm'),
                        date: $scope.model
                    };
                }
            }
            else
            {
                $scope.selected = {
                    model: undefined,
                    date: new Date()
                };
            }

            $scope.display = {
                hours: moment($scope.selected.date).format('HH'),
                minutes: moment($scope.selected.date).format('mm')
            };

            $scope.activeTime = moment($scope.selected.date);
            $scope.moment = moment;
        };

        $scope.previousHour = function()
        {
            $scope.activeTime = $scope.activeTime.add(-1, 'hour');
            generateTimetable();
        };

        $scope.nextHour = function()
        {
            $scope.activeTime = $scope.activeTime.add(1, 'hour');
            generateTimetable();
        };

        $scope.previousMinute = function()
        {
            $scope.activeTime = $scope.activeTime.add(-1, 'minute');
            generateTimetable();
        };

        $scope.nextMinute = function()
        {
            $scope.activeTime = $scope.activeTime.add(1, 'minute');
            generateTimetable();
        };

        $scope.openPicker = function()
        {

            if ($scope.ctrlData.isOpen) {
                return;
            }

            $scope.ctrlData.isOpen = true;

            $timeout(function() {
                $timePickerFilter = angular.element('<div/>', {
                    class: 'lx-time-filter'
                });

                $timePickerFilter
                    .appendTo('body')
                    .on('click', function()
                    {
                        $scope.closePicker();
                    });

                $timePicker
                    .appendTo('body')
                    .show();

                $timeout(function()
                {
                    $timePickerFilter.addClass('lx-time-filter--is-shown');
                    $timePicker.addClass('lx-time-picker--is-shown');
                }, 100);
            });
        };

        $scope.closePicker = function()
        {

            if (!$scope.ctrlData.isOpen) {
                return;
            }

            $timePickerFilter.removeClass('lx-time-filter--is-shown');
            $timePicker.removeClass('lx-time-picker--is-shown');

            $computedWindow.off('resize');

            $scope.model = $scope.activeTime.toDate();

            $timeout(function()
            {
                $timePickerFilter.remove();

                $timePicker
                    .hide()
                    .appendTo($timePickerContainer);

                $scope.ctrlData.isOpen = false;
            }, 600);
        };

        function generateTimetable() {
            $scope.selected.date = $scope.activeTime;
            $scope.selected.model = $scope.activeTime.format('HH:mm');

            $scope.display = {
                hours: moment($scope.selected.date).format('HH'),
                minutes: moment($scope.selected.date).format('mm')
            };
        }
    }])
    .directive('lxTimePicker', function()
    {
        return {
            restrict: 'AE',
            controller: 'lxTimePickerController',
            scope: {
                model: '=',
                label: '@',
                fixedLabel: '&',
                icon: '@'
            },
            templateUrl: 'time-picker.html',
            link: function(scope, element, attrs, ctrl)
            {
                ctrl.init(element, checkLocale(attrs.locale));

                attrs.$observe('locale', function()
                {
                    ctrl.build(checkLocale(attrs.locale), false);
                });

                scope.$watch('model', function (newVal)
                {
                    ctrl.build(checkLocale(attrs.locale), true);
                });

                attrs.$observe('allowClear', function(newValue)
                {
                    scope.allowClear = !!(angular.isDefined(newValue) && newValue === 'true');
                });

                function checkLocale(locale)
                {
                    if (!locale)
                    {
                        return (navigator.language !== null ? navigator.language : navigator.browserLanguage).split("_")[0].split("-")[0] || 'en';
                    }

                    return locale;
                }
            }
        };
    });
