define(['services/logger', 'services/datacontext', 'services/session'],
    function (logger, datacontext, session) {

        // Cached copy of all house bin rotas
        var AllBinRotas = new ko.observableArray();
        var AllCleaningRotas = new ko.observableArray();

        var distinctCleaningGroups = new ko.observable();

        var houseTenants = new ko.observableArray();

        // Date used to calculate which bin rotas occur
        var CurrentBinDate = new ko.observable();
        var CurrentCleaningDate = new ko.observable();
        // Rota currently being viewed plus any that occur on same day
        var CurrentBinRotas = new ko.observableArray();
        var CurrentCleaningRotas = new ko.observableArray();
        // Tenants reponsible for putting out the bins
        var BinRotaTenants = new ko.observable();

        var vm = {
            activate: activate,
            title: 'Tasks',

            distinctCleaningGroups: distinctCleaningGroups,

            cleanStatusClicked: cleanStatusClicked,

            AllBinRotas: AllBinRotas,
            AllCleaningRotas: AllCleaningRotas,

            CurrentBinDate: CurrentBinDate,
            CurrentCleaningDate: CurrentCleaningDate,
            CurrentBinRotas: CurrentBinRotas,
            CurrentCleaningRotas: CurrentCleaningRotas,

            BinRotaTenants: BinRotaTenants,

            navPreviousCleaningRota: navPreviousCleaningRota,
            navNextCleaningRota: navNextCleaningRota,

            navPreviousBinRota: navPreviousBinRota,
            navNextBinRota: navNextBinRota
        };

        return vm;


        function activate() {

            configureMoment();

            CurrentBinDate(initCurrentDate(moment().format("L")));
            CurrentCleaningDate(initCurrentDate(moment().format("L")));

            return Q.all([refreshTenants(), refreshAllBinRotas(), refreshAllCleaningRotas()]).then(function () {
                getRotasByDate('bin', AllBinRotas(), CurrentBinDate().Date(), CurrentBinRotas);
                getRotasByDate('cleaning', AllCleaningRotas(), CurrentCleaningDate().Date(), CurrentCleaningRotas);

                refreshDistinctCleaningGroups();
                console.log("Distinct Groups: " + distinctCleaningGroups());

                if (AllBinRotas().length > 0 && CurrentBinRotas().length === 0)
                    navNextBinRota();

                if (AllCleaningRotas().length > 0 && CurrentCleaningRotas().length === 0)
                    navNextCleaningRota();

                logger.log('Tasks View Activated', null, 'tasks', true);
            });
        }

        function refreshTenants() {
            return datacontext.getTenants(houseTenants, session.sessionUser().HouseId());
        }

        function refreshDistinctCleaningGroups() {
            return distinctCleaningGroups(getDistinctCleaningRotaGroups(houseTenants()).length);
        }

        function refreshAllBinRotas() {
            return datacontext.getBinRotasByHouse(AllBinRotas, session.sessionUser().HouseId());
        }

        function refreshAllCleaningRotas() {
            return datacontext.getCleaningRotasByHouse(AllCleaningRotas, session.sessionUser().HouseId());
        }

        function initCurrentDate(date) {
            var myDate = moment(date);

            var obj = function () {
                this.Date = new ko.observable(myDate);
                this.RelativeDate = new ko.computed(getRelDate, this);
                this.NavDate = new ko.computed(getNavDate, this);

                function getRelDate() {
                    return moment(this.Date()).calendar(true);
                }
                function getNavDate() {
                    return moment(this.Date()).format('MMMM Do YYYY');
                }
            };

            return new obj();
        }

        function configureMoment() {

            if (!moment.fn.oldcalendar) {
                var oldcal = moment.langData()._calendar;
                var newcal = {
                    calendar: {
                        sameDay: '[Today]',
                        nextDay: '[Tomorrow]',
                        nextWeek: 'dddd',
                        lastDay: '[Yesterday]',
                        lastWeek: '[last] dddd',
                        nextMonth: 'whooo',
                        sameElse: 'MMMM Do'
                    }
                };

                moment.fn.oldcalendar = moment.fn.calendar;

                moment.fn.calendar = function (withoutTime) {
                    if (withoutTime) {
                        moment.lang("en", newcal);
                    } else {
                        moment.lang("en", oldcal);
                    }
                    return this.oldcalendar();
                }
            }
        }

        /**
        * Gets the bin rota(s) which occurs on the given date.
        * If more than one occurs, multiple bin rotas will be returned.
        */
        function getRotasByDate(rotaType, rotas, date, rotasObservable) {
            rotasObservable([]);

            ko.utils.arrayForEach(rotas, function (rota) {
                var diff = getDateDifference(rota.StartDate(), date);

                // If bin collection occurs on the navigated day
                if ((diff % rota.OccuranceDays()) === 0) {
                    setTaskTenants(rotaType, houseTenants(), rota, diff, date, rotasObservable().length);
                    rotasObservable.push(rota);
                }
            });
        }

        function getDateDifference(startDate, endDate) {
            var start = moment(startDate);
            var testDate = moment(endDate);
            return Math.abs(testDate.diff(start, 'days'));
        }


        // Increment the chosenGroupNum with modulus every time a bin rota
        // date comes around! When we invoke this method, we enter a 'date'
        // we KNOW a rota falls on.
        function getTaskTenantsForRota(rotaType, tenants, allRotas, date) {

            var distinctGroups = rotaType === 'bin' ? getDistinctBinRotaGroups(tenants) : getDistinctCleaningRotaGroups(tenants);

            var chosenGroupIndex = 0;

            var dateReached = false;

            // For each of the rotas, make an auxillery date so we can increment it
            $.each(allRotas, function (i, myRota) {
                myRota.AuxDate = new ko.observable(moment(myRota.StartDate()));
                myRota.GroupNum = new ko.observable();
            });

            // If incrementing the date of each rota by its occurance does not exeed the given date
            while (!dateReached) {

                $.each(allRotas, function (i, myRota) {
                    // Increment each rota by its occurance days
                    myRota.AuxDate(moment(myRota.AuxDate()).add('days', myRota.OccuranceDays()));

                    if (moment(myRota.AuxDate()).isBefore(moment(date))) {
                        // Increment the pointer of the chosen group
                        chosenGroupIndex = (chosenGroupIndex + 1) % distinctGroups.length;
                        myRota.GroupNum(distinctGroups[chosenGroupIndex]);
                        console.log(chosenGroupIndex);
                    } else {
                        dateReached = true;
                    }
                });
            }
        }

        function setTaskTenants(rotaType, tenants, rota, diff, date, occurances) {
            var distinctGroups = (rotaType === 'bin') ? getDistinctBinRotaGroups(tenants) : getDistinctCleaningRotaGroups(tenants);

            // Initialise default values
            rota.TaskTenants("Nobody Assigned");
            rota.RotaGroup(0);

            if (distinctGroups.length === 0)
                return;

            var totalOccurances = 0;

            // For each rota, add the number of occurances up until current date

            if (rotaType === 'bin') {
                $.each(AllBinRotas(), function (i, rota) {
                    totalOccurances += Math.floor(getDateDifference(rota.StartDate(), date) / rota.OccuranceDays());
                });

                totalOccurances += occurances;
            } else {
                $.each(AllCleaningRotas(), function (i, rota) {
                    totalOccurances += Math.floor(getDateDifference(rota.StartDate(), date) / rota.OccuranceDays());
                });

                totalOccurances += occurances;
            }

            // Modulus the answer by the number of distinct groups to assign

            var index = totalOccurances % distinctGroups.length;
            var selectedGroup = distinctGroups[index];

            var selectedTenantNames = '';

            var tenantsInGroup = $.grep(tenants, function (tenant) {
                if (rotaType === 'bin')
                    return tenant.UserSettings().BinCollectionRotaGroup() === selectedGroup;

                return tenant.UserSettings().CleaningRotaGroup() === selectedGroup;
            });

            $.each(tenantsInGroup, function (i, tenant) {
                if (i === 0) {
                    selectedTenantNames += tenant.FullName();
                    return;
                }

                selectedTenantNames += ("/" + tenant.FullName());
            });

            rota.TaskTenants(selectedTenantNames);
            rota.RotaGroup(selectedGroup);

            if (rotaType === 'cleaning') {
                console.log(rota.Name());

                // Search through logs until we find one which matches 
                $.each(rota.CleaningLogs(), function (i, log) {
                    var sameDate = moment(log.Date()).diff(date, 'days') === 0;
                    console.log("Log Date: " + log.Date() + " / Nav Date: " + moment(date).toString());
                    var sameGroup = rota.RotaGroup() === log.RotaGroup();

                    if (sameDate && sameGroup) {
                        console.log("Setting Cleaned!");

                        rota.Cleaned(true);
                        rota.Log(log);
                        return false; // Exits loop
                    } else {
                        rota.Log(null);
                        rota.Cleaned(false);
                    }
                });
            }
        }

        function getDistinctBinRotaGroups(tenantsList) {
            var groupNums = [];

            $.each(tenantsList, function (i, tenant) {
                var group = tenant.UserSettings().BinCollectionRotaGroup();
                if (group !== null && $.inArray(group, groupNums)) {
                    groupNums.push(group);
                }
            });

            return groupNums;
        }

        function getDistinctCleaningRotaGroups(tenantsList) {
            var groupNums = [];

            $.each(tenantsList, function (i, tenant) {
                var group = tenant.UserSettings().CleaningRotaGroup();
                if (group !== null && $.inArray(group, groupNums)) {
                    groupNums.push(group);
                }
            });

            return groupNums;
        }

        function navNextBinRota() {
            var binRotasByDate = new ko.observableArray();

            while (binRotasByDate().length == 0) {
                CurrentBinDate().Date(moment(CurrentBinDate().Date()).add('days', 1));
                getRotasByDate('bin', AllBinRotas(), CurrentBinDate().Date(), binRotasByDate);
            }

            CurrentBinRotas(binRotasByDate());
        }

        function navPreviousBinRota() {
            var binRotasByDate = new ko.observableArray();

            while (binRotasByDate().length == 0) {
                CurrentBinDate().Date(moment(CurrentBinDate().Date()).subtract('days', 1));
                getRotasByDate('bin', AllBinRotas(), CurrentBinDate().Date(), binRotasByDate);
            }

            CurrentBinRotas(binRotasByDate());
        }

        function cleanStatusClicked(data) {

            // TODO: Delete cleaning log when unchecked!!

            // If a log exists, delete it

            if (data.Cleaned()) {
                console.log(data);
                data.Log().entityAspect.setDeleted();
                data.Log(null);
                data.Cleaned(false);

                return datacontext.saveChanges().then(function () {
                    logger.logSuccess(data.Name() + " Un-Cleaned!", null, 'tasks', true);
                });
            }

            // Else create a log

            var log = datacontext.createCleaningRotaLog();
            log.Date(CurrentCleaningDate().Date().toString());
            console.log(CurrentCleaningDate().Date().toString());
            log.RotaGroup(data.RotaGroup());
            console.log(data.RotaGroup());
            log.CleaningRota(data);
            console.log(data);

            data.Cleaned(true);
            data.Log(log);

            datacontext.saveChanges().then(function () {
                logger.logSuccess(data.Name() + " Cleaned!", null, 'tasks', true);
            });
        }

        function navNextCleaningRota() {
            var cleaningRotasByDate = new ko.observableArray();

            while (cleaningRotasByDate().length == 0) {
                CurrentCleaningDate().Date(moment(CurrentCleaningDate().Date()).add('days', 1));
                getRotasByDate('cleaning', AllCleaningRotas(), CurrentCleaningDate().Date(), cleaningRotasByDate);
            }

            CurrentCleaningRotas(cleaningRotasByDate());
        }

        function navPreviousCleaningRota() {
            var cleaningRotasByDate = new ko.observableArray();

            while (cleaningRotasByDate().length == 0) {
                CurrentCleaningDate().Date(moment(CurrentCleaningDate().Date()).subtract('days', 1));
                getRotasByDate('cleaning', AllCleaningRotas(), CurrentCleaningDate().Date(), cleaningRotasByDate);
            }

            CurrentCleaningRotas(cleaningRotasByDate());
        }

    });