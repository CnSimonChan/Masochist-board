/**
 * Created by Don on 2/15/2015.
 */

function globalCtrl($rootScope, $scope, $http, $routeParams) {
    losses.global = $rootScope;
    $rootScope.reloadCate = loadCate;
    $rootScope.router = $routeParams;
    $rootScope.categories = {};

    function loadCate() {
        $http.get("api/?category")
            .success(function (response) {
                for (var i = 0; i < response.length; i++) {
                    $rootScope.categories[response[i].id] = response[i];
                }
                $rootScope.firstCategoryKey = Object.keys($scope.categories)[0];
                $rootScope.currentCategoryKey = Object.keys($scope.categories)[0];


                setTimeout(checkFunctionMenu, 300);
                setTimeout(function () {
                    sSelect('.post_category');
                    sSelect('.transport_category');
                }, 1000);
            });
    }

    $http({
        method: 'POST',
        url: 'api/?manage',
        data: $.param({'check': ''}),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function (response) {
        $rootScope.logined = (response.message);

        manageLoginProcess();
    });

    loadCate();
}

function postCtrl($http, $scope, $rootScope, $routeParams) {

    losses.scope.postCtrl = $scope;
    processPageElement($scope.router);

    $rootScope.canPost = 'show';

    var page = 1
        , loading = false;

    $scope.posts = [];

    function pushContent() {
        switchLoading(true);
        function getContent(apiRule) {
            if (!loading) {
                loading = true;
                $http.get(apiRule)
                    .success(function (response) {
                        page++;
                        if (response.length === 0) {
                            page--;
                        }

                        for (var i = 0; i <= response.length - 1; i++) {
                            $scope.posts.push(response[i]);
                        }

                        if (page == 2)
                            switchTitle();

                        loading = false;

                        switchLoading(false);
                    });
            }
        }

        if ($routeParams.categoryId) {
            getContent("api/?list&category=" + $routeParams.categoryId + "&page=" + page);
        } else if ($routeParams.searchKey) {
            getContent("api/?search=" + $routeParams.searchKey + "&page=" + page);
        } else if ($routeParams.postId) {
            getContent("api/?post&id=" + $routeParams.postId + "&page=" + page);
        } else {
            getContent("api/?list&page=" + page);
        }
    }

    function switchTitle() {
        var title;
        if ($routeParams.categoryId) {
            title = $scope.categories[$routeParams.categoryId].name + ' - ';
            $rootScope.currentCategoryKey = $routeParams.categoryId;
        } else if ($routeParams.searchKey) {
            title = "搜索：" + $routeParams.searchKey + ' - ';
            $rootScope.canPost = 'hide';
        } else if ($routeParams.postId) {
            title = $scope.posts[0].title + ' - ';
        } else {
            title = '';
            $rootScope.currentCategoryKey = $rootScope.firstCategoryKey;
        }

        $rootScope.title = title + 'Masochist-board';
    }

    $(window).off('scroll.globalScroll')
        .on('scroll.globalScroll', function () {
            if ($(document).scrollTop() + $(window).height() >= $(document).height()) {
                pushContent();
            }
        });

    pushContent();
}

function dialogCtrl($http, $scope) {
    $scope.groups = [];

    $http.get('dbs/emotions.json')
        .success(function (response) {
            for (var i in response) {            /*i是分组名*/
                var emojiCollection = [];
                for (var j in response[i]) {     /*j是替代文字*/
                    emojiCollection.push({
                        'name': response[i][j],
                        'value': 'sprite-' + j
                    })
                }
                $scope.groups.push({
                    'name': i,
                    'emoji': emojiCollection
                });
            }
        });
}

function manageCtrl($scope, $rootScope) {
    $rootScope.canPost = 'hide';
    losses.scope.manage = $scope;
}

function loginJumper($scope, $location) {
    if (!$scope.logined)
        $location.path('/manage/login').replace();
    else
        $location.path('/manage/status').replace();
}

function manageStarter($scope, $http, $routeParams, $rootScope, $location) {
    $rootScope.canPost = 'hide';
    if ($('#masochist-manage-style')[0])
        return true;

    var newStyleSheet = $('<link>')
        .attr('id', 'masochist-manage-style')
        .attr('type', 'text/css')
        .attr('rel', 'stylesheet')
        .attr('href', 'styles/manage.css');

    $('head').append(newStyleSheet);

    StyleFix.styleElement(newStyleSheet[0]);


    $scope.logout = function () {
        $http({
            method: 'POST',
            url: 'api/?manage',
            data: $.param({'action': 'logout'}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            if (response.code) {
                losses.global.logined = false;
                losses.global.$digest();
            }

            if (response.code == 200) {
                magicalLocation('#/');
            } else if (response.message) {
                publicWarning(response.message);
            } else {
                publicWarning(response);
            }
        })
    };

    if (!$scope.logined && $routeParams.manageAction !== 'login') {
        $location.path('/manage/login').replace();
    } else {
        if ($scope.logined && $routeParams.manageAction !== 'status') {
            $location.path('/manage/status').replace();
        } else {
            $http({
                method: 'POST',
                url: 'api/?manage',
                data: $.param({'system_info': ''}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (response) {
                $scope.systemInfo = response;
            });
        }
    }


}
