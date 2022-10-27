// ==UserScript==
// @name         HappachBooster
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  in case you are curious yet dont want to get banned
// @author       hellomotto
// @match        https://www.twitch.tv/*
// @grant        none
// ==/UserScript==

// for examples reuquests seee  - https://github.com/w3champions/twitch-extension/blob/cf5ba8139179cdc782bbea0e6e039d3efb1ad94f/src/utils/fetch.ts
(function() {
    'use strict';

    // Your code here...

    //new MutationObserver(function () {
    //alert("Mutated");
    //<h2 data-a-target="stream-title" class="tw-ellipsis tw-font-size-5 tw-line-clamp-2 tw-strong tw-word-break-word" title="Варкрафт!">Варкрафт!</h2>

    function setContent(content) {
        var nowPlayingDiv = document.createElement('div');
        var streamTitle = document.body.querySelector('h2');
        var originalTitle = streamTitle.innerHTML.split("<br>")[0];
        streamTitle.innerHTML = originalTitle +  "<br>" + content; // //No 1v1 match currently in progress
    }

    // wrap cache function
    var wrapCache = function(f, fKey){
        fKey = fKey || function(id){ return id; };
        var cache = {};

        return function(key){
            var _key = fKey(key);
            if (!cache[_key]){
                cache[_key] = f(key);
            };

            return cache[_key];
        };
    };

    function _fetchPlayerStats(battleTag) {
        var baseUrl = 'https://statistic-service.w3champions.com/api/players/';
        var url = baseUrl + encodeURIComponent(battleTag);
        console.log('[HTTP API REQUEST] '+url);
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", url, false);
        xmlhttp.send();
        // 4. Если код ответа сервера не 200, то это ошибка
        if (xmlhttp.status != 200) {
            // обработать ошибку
            console.log( '[ERROR HTTP API REQUEST] ' +  xmlhttp.status + ': ' + xmlhttp.statusText ); // пример вывода: 404: Not Found
            return undefined;

        } else {
            // вывести результат
            return JSON.parse(xmlhttp.responseText)['playerAkaData']['name']||undefined;// responseText -- текст ответа.
        }
    }

    // ------------------------------------------------------------------------
    function DEBUG(msg) {
        if (DEBUG_ON) console.log(msg);

    }
    // ------------------------------------------------------------------------

    // wrapping expensive. Кешируем запросы к базе данных aka
    var fetchPlayerStats = wrapCache(_fetchPlayerStats, JSON.stringify);

    function main() {
        var currentLocation = window.location.href;

        // check if the channel is known
        var DEBUG = true;
        var INFO = true;
        var USE_ICONS = true;
        var TWITCH_LOOKUP = true; // debug mode

        // ===================== SETTING END========================//
        var streamTitle = document.body.querySelector('h2');
        if (!streamTitle) return;

        var lastUpdate = 100;

        var pageSize = 300;
        var offset = 0;
        var gameMode = 1; // 1x1

        var knownPlayers = [
            //{aka : "Edo", twitch: "edoboii", w3cSmurfs : "EDOBOIEDOBOI#2276" }, //его добавили в базу незачем задавть вручную
            {aka: "Niklaus", twitch: "hailniklaus" , w3cSmurfs: "Philosopher#21505"},
            {aka: "Kaho", twitch: "hailniklaus" , w3cSmurfs: "DESTINY#514792"},
            {aka: "ice orc", twitch: undefined, w3cSmurfs: "抖音冰受受#5330"},
            {aka: "Mango", twitch: undefined, w3cSmurfs: "吃嘛嘛香#52792"},
            {aka : "Yange", twitch: "assassingo1", w3cSmurfs : "리쥬짱#3390"},
            {aka : "tbc_bm", twitch: undefined, w3cSmurfs : "VERGER#5185 吉吉猫#51117"}, 
            {aka : "DRagonbornBR", twitch : "Dragonborn_BR" , w3cSmurfs : "DOVAHKIIN#22289 DRAGONBORNBR#11769"},
            {aka : "Fish", twitch : undefined, w3cSmurfs : "FROGZ#11137"},
            {aka : "KUHHHdark", twitch : "kuhhhdark", w3cSmurfs : "KUHHHDARK#1588 UU99#1140"},
            {aka : "Hipposaur", twitch : "rhinosaurier", w3cSmurfs : " DERANGING#2574 HIPPOSAURIER#2643"},            
            {aka : "XlorD", twitch : "ixixlord", w3cSmurfs : "XLORD#2596"},
            {aka : "Sok", twitch: undefined, w3cSmurfs: "MOOSANGSUNG#1804 AFSOK#3881"},
            {aka : "EdGE", twitch : "edgewc3", w3cSmurfs : "DESERTSONG#11582 EDGE#12479"},
            {aka : "Starbuck", twitch : "starbuck", w3cSmurfs : "DRǃBUCKI#2383 STARBUCK#2732"},
            {aka : "Deuce", twitch : "dustdeuce", w3cSmurfs : "KINGDEUCE#11319"},
            {aka : "HoT", twitch : "hotwussy", w3cSmurfs : "HHH#2991"},
            { aka: "AraAraBRamSSSS", twitch : "araarabramss" , w3cSmurfs: "CUCARACHA#21207"},
            { aka: "VooDooSh", twitch : "voodoosh", w3cSmurfs: "VOODOOSOUL#2858"},
            { aka: "Eightyfour", twitch: "eightyfour_", w3cSmurfs: "EIGHTYFOUR#2111"},
            { aka: "Cechi", twitch: "cechi1", w3cSmurfs: "CECHI#21571"},
            { aka: "Vankor", twitch: "bowlsofsteel", w3cSmurfs: "BOWLSOFSTEEL#21421"},
            { aka: "Hitman", twitch: "hitmanstarcraft2", w3cSmurfs : "ETHEREAL#1992 LUDIQUE#11619"},
            { aka: "DV", twitch: "dv111",  w3cSmurfs : "EHRMANTRAUT#21519"},
            { aka: "SyDe", twitch: "syde_", w3cSmurfs : "SYDE#2753"},
            { aka: "Happy", twitch: "yesitshappy", w3cSmurfs : "HAPPY#2384 CACXA27#2425 CACXA26#2948"},
            { aka: "TGW", twitch: "sqktgw", w3cSmurfs : "РОЗОВЫЙПОНИ#228941 TGW#21272"},
            { aka: "Grubby", twitch: "followgrubby", w3cSmurfs : "GRUBBY#1278 APPLE#2653"},
            { aka: "Cash", twitch: "cashforking", w3cSmurfs : "SAVAGE#23325"},
            { aka: "Foggy", twitch: "foggywc3", w3cSmurfs: "SPXFOGGY#2799"},
            { aka: "Chiko", twitch: "elovesupreme", w3cSmurfs: "CHIQO#21759 SUN#23180"},
            { aka: "GunEgg", twitch: "gunegg1234", w3cSmurfs: "GUNEGG#3700"},
            { aka: "Crrpt", twitch: "crrpt86", w3cSmurfs: "KINGCRRPT#2278"},
            { aka: "Fly100%", twitch: undefined, w3cSmurfs: "FLYGOGOGO#4538"},            
            { aka: "Lin Guagua", twitch: undefined, w3cSmurfs: "WHO#51871 IN20220928#5839"},
            { aka: "TeRRoR", twitch: "goterror", w3cSmurfs: "GOTERROR#2505"},
            { aka: "Barren", twitch: "barrentv", w3cSmurfs: "BARREN#1153"},
            { aka: "Robinson", twitch: "1robinson", w3cSmurfs: "ROBINSON#21701"},
            //{ aka: "", twitch: "", w3cSmurfs: "TORIIDACTYL#1645"}
            { aka: "Duck", twitch: "reforgedente", w3cSmurfs: "ENTE#21775"},
            { aka: "Wiz", twitch: "wizdotaa2", w3cSmurfs: "WIZ#2704"},
            { aka: "Deathnote", twitch: "followdeathnote", w3cSmurfs: "ODINNSDAGR#2292"},
            { aka: "HoT", twitch: "hotwussy", w3cSmurfs: "HHH#2991"},
            { aka: "OrcWorker", twitch: undefined, w3cSmurfs: "CHARMANDER#11615"},
            { aka: "Luna", twitch: "aly_luna", w3cSmurfs: "ALYLUNA#3589"},
            { aka: "So.in", twitch: undefined, w3cSmurfs: "전소인#3190"},
            { aka: "Chaemiko", twitch: undefined, w3cSmurfs: "ZIZONHUMAN#3182"},
            { aka: "Divine", twitch: "dfpdivine2021", w3cSmurfs: "DFPDIVINE#1306"},
            { aka: "FranCesc", twitch: "francescscp", w3cSmurfs: "FRANCESC#21526"},
            { aka: "KroLu", twitch: "krolu_", w3cSmurfs: "LOSTHOPELFT#2202 ZYGM0O#2163"},
            // LUCIFER 2X:
            //{ aka: "Lucifer", twitch: "jwmichaelmn", w3cSmurfs: "JWMICHAELMN#3698"},
            { aka: "Lucifer", twitch: "vs_michael", w3cSmurfs: "VSMICHAEL#3369 JWMICHAELMN#3698  VSLUCHAEL#3146"},
            // LUCIFER 2x
            { aka: "JohnnyCage", twitch: "johnnycagetdk", w3cSmurfs: "BOYKA#22818"},
            { aka: "nuelltz", twitch: "nuelltz", w3cSmurfs: "MARSJOE#2633"},
            { aka: "Please", twitch: "please1989", w3cSmurfs: "L7PLEASE#2283"}
        ];

        var watchingPlayer = knownPlayers.find( function(player) { return currentLocation.endsWith(player.twitch) });

        if (!watchingPlayer) {
            // TODO: move this out of main function
            if (DEBUG) console.log('====== HappachBooster.exit() ==== ');
            //return;
        } else {
            if (DEBUG) console.log('[WATCHING]' + watchingPlayer.w3cSmurfs);
            var happachSmurfs = watchingPlayer.w3cSmurfs||undefined;
        }

        if (DEBUG) console.log('happachSmurfs', happachSmurfs);

        var xmlhttp = new XMLHttpRequest();

        var RACE = {0 : "Random", 1 : "Human", 2 : "Orc", 4: "Night Elf", 8 : "Undead"};

        var RACE_ICONS = {0 : '<img src="http://proplay.ru/images/demos/5.gif">', 1 : '<img src="http://proplay.ru/images/demos/rc4.gif">', 2 : '<img src="http://proplay.ru/images/demos/rc6.gif">', 4: '<img src="http://proplay.ru/images/demos/rc5.gif">', 8 : '<img src="http://proplay.ru/images/demos/rc7.gif">'};

        RACE_ICONS = {
            0 : '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAPCAMAAAA1b9QjAAABOFBMVEX///+SXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXieSXifYxIrYAAAAZ3RSTlMAAAEYR3hoiXUlEEY4j9kGkMd6SQJy8TBcfD3UMzv9W4D+2wvS8+ldIZ3XUGXjdrOYYWCD8Pbyw4aXS5avbiy//D9TJH9r2Eysbbvu5d5Ki1gfI+CxZrycn8ZB96JZcAO1fRehCAzMDvBXUwAAAM5JREFUeNo1yOk6AgEYhuF5ERpLiVFZUnYmRWTfZQ/Jvu+e8z8D38x1uX/ejiOpobEp0tzSGpVxbNy29g46Y3G6Et09wXj0JlOk+/oZGMwwZJMlB8MjGmVsHOI2E5NTMO3nZ4BCcdZmruQxvwDlRZa0vGKzuraONmAzypa2IzY7u3tU9jnQIca3cY+yHJ9wmq7CWebcJnZR47JO4EqJlI08n+sbuL3jXg+PwahALc+T6uSeXxSOSq9vVPXOx6fCMW4Fyl/fkv5HP8XfpBTOH7AgLTtaCxynAAAAAElFTkSuQmCC">',
            1 : '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAMAAAAMCGV4AAAApVBMVEUAAAAAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+MAn+P///8jxMnFAAAANXRSTlMAPK7xhW4R8l+JeUVZdoqeYIDeUa8HECgTwv5YkGTT5Pr7ogOyY37j5oFhDWq2P020OpqInEtTHsoAAACOSURBVHjaTcfpFoEAFEbR2zxrlpJCZChD+N7/1dyKOH/O2tQniBIkUaBPMsbkkQq+KT1VbbKmsnX80tkGTMt2Zo5tmTDYLjw/CCkMfA8uO4IXzxNKFrGHiJ1CypY55atMQsouAAzmF+zyzyXbXU/ebImq3b4+DD6ezlFF1LQX/8q+1fe2oaHu8aTnqyPuDS72Ftb82hUuAAAAAElFTkSuQmCC">',
            2 : '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAMAAAAMCGV4AAAA2FBMVEUAAAD///++FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSK+FSILGDa4AAAAR3RSTlMAADcxG2w4cgjh2KNDAcn4D1vozUsiTv1aSW9c6/L39jmciQm4yFOGVMLKB5bHxrqi09HQsCT0T+LnvvCTxPsoXoq36e21glfMH14AAACOSURBVHjaVcpXFoIwFEXRp6Ji72CJDbsiFizYu3f+MzIJH8Tzt9c65BemCClp0VhctZ5IptKKM1nk8gELRQAlfyhXyIDMrOq1OjXAmvBrtc0OURdBFhH1+hgMLYzGE0xnxLMBNofDgAWJlisHIrZ2pTfudie89w7Sx9P5wunZuErf7o/nC+/P19C4Qv/9AIKEGWkxgM5wAAAAAElFTkSuQmCC">',
            4: '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAMAAAAMCGV4AAAA3lBMVEX///8AAAAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkAAlkB3LgHXAAAASXRSTlMAAAFHSwJ5hSWcqiRWFhi/zR4KYxyUT9TdWnw0zydicheMsQ7w95iiQpD8Wwbz/hSw0PX4wczJUtH9m/r702RVZQnnEE02nqE+GSfGCAAAAJlJREFUeAE9x+eCwVAQxfGZ3c3qogjRgyR6L0QQnXn/F3Lnupwv//MDQN7P758mj/I/UUg5zIkQRbkxgHhCNKmn0iKZLEDOECdfMIsipTIAVqpYI7E6WqYm3Gi2bLZjuW0U7pBBct1enz0YktpozMYJTfXZfLGkFUqvN97W8d3d/vA2BiR3ROXTmWlfPsarT+QF+DXe7o+nPC8kQhfPqDaRTAAAAABJRU5ErkJggg==">',
            8 : '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAMAAAAMCGV4AAAA21BMVEX///8AAABmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINmJINHvhOcAAAASHRSTlMAAAE4c4YwzjLy0S3gtu3vt9tLxzn+RLwvsXjT13qqKtXo471xa6Pun293FUhfcKAl1JC6zyBNKFA3SkBJExZldvr2+MnQyxeOw3XXAAAAn0lEQVR42j3O5w6CQBBGUXZBuqKoWLFXLNh7Aev3/k/kLgTvrzmZZDKCQAihopSSRMomgVtWwFPk2KqGOE2NrCNJ5zZgpjMMVjYHg9lGntBC0aGkBJu5DFSqNdTdBtBkpi0AbasDoBvf7/UxGI4w9iaRiTcFbzYnsf3FcoX1xvETb3f7w/F0/vtyZa/f7omDEA/ziTCIzFfB6/1xv4T5B+myGrI/Z/uuAAAAAElFTkSuQmCC">'};

        //var url = "https://statistic-service.w3champions.com/api/matches/ongoing/";
        var url = `https://statistic-service.w3champions.com/api/matches/ongoing?offset=${offset}&pageSize=${pageSize}&gameMode=${gameMode}`;


        if (DEBUG | INFO) console.log('GET', url);

        xmlhttp.open("GET", url, true);
        xmlhttp.send();

        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var myArr = JSON.parse(this.responseText);

                if (myArr.count >= pageSize) console.log("Too many matches at the same time", myArr.count);

                var matches = myArr.matches;

                function getPlayer (match, team) {
                    return match.teams[team].players[0].battleTag.toUpperCase();
                };

                function isHappyMatch(match) {
                    //console.log(happachSmurfs, match.teams[0].players[0].battleTag.toUpperCase(),match.teams[1].players[0].battleTag.toUpperCase());
                    // Этот поиск может фейлится если одновременно играется более 200 матчей. Ну и поебать.
                    return happachSmurfs.includes( match.teams[0].players[0].battleTag.toUpperCase()) || happachSmurfs.includes(match.teams[1].players[0].battleTag.toUpperCase());
                }

                function playersWithThisTwitch(match) {
                    var thisTwitchChannel = window.location.href.split("/")[3].split("?")[0].toLowerCase();

                    var channel1 = match.teams[0].players[0].twitch||"#";
                    var channel2 = match.teams[1].players[0].twitch||"#";

                    return channel1.toLowerCase() == thisTwitchChannel ||  channel2.toLowerCase() == thisTwitchChannel;
                }

                if (happachSmurfs) {
                    var happachMatch = matches.find(isHappyMatch);
                    console.log('happachMatch', happachMatch);
                }

                if (DEBUG) console.log("window.location.href", window.location.href);

                var streamedMatch = matches.find(playersWithThisTwitch);

                if (happachMatch || streamedMatch) {
                    if (!happachMatch && streamedMatch) {
                        var happachMatch = streamedMatch;
                    }
                }


                if (!happachMatch) {
                    setContent("🔔 No 1v1 match currently in progress! 😭")
                    return;
                } else {
                    if (INFO) console.log(happachMatch)
                }

                function playerAkaByBattleTag(bt) {
                    for (var player of  knownPlayers) {
                        if (player.w3cSmurfs.includes(bt.toUpperCase())) {
                            if (player.aka.toUpperCase() == bt.toUpperCase().split('#')[0])  return undefined;
                            else return player.aka;// +'as'+ bt.split('#')[0];
                        }
                    }
                    return fetchPlayerStats(bt);//undefined;//bt.split('#')[0];
                }

                var player1 = {name : happachMatch.teams[0].players[0].name,
                               location :  happachMatch.teams[0].players[0].location,
                               race :  happachMatch.teams[0].players[0].race,
                               countryCode : happachMatch.teams[0].players[0].countryCode,
                               aka: playerAkaByBattleTag(happachMatch.teams[0].players[0].battleTag)};


                var player2 = {name : happachMatch.teams[1].players[0].name,
                               location :  happachMatch.teams[1].players[0].location,
                               race :  happachMatch.teams[1].players[0].race,
                               countryCode : happachMatch.teams[1].players[0].countryCode,
                               aka: playerAkaByBattleTag(happachMatch.teams[1].players[0].battleTag)};

                var nowPlayingDiv = document.createElement('div');

                if (USE_ICONS) {
                    var player1Name = (player1.aka && player1.aka.toLowerCase() != player1.name.toLowerCase())
                    ? '' + player1.aka + ''+ '<span class="tw-c-text-alt-2 tw-font-size-10" style="font-size: 10px;"> as '+player1.name+'</span>'
                    : player1.name;
                    var player2Name = (player2.aka && player2.aka.toLowerCase() != player2.name.toLowerCase())
                    ? '' + player2.aka + ''+ '<span class="tw-c-text-alt-2 tw-font-size-10" style="font-size: 10px;"> as '+player2.name+'</span>'
                    : player2.name;

                    var player1Flag = '<img src="https://flagcdn.com/w20/'+ (player1.location||player1.countryCode).toLowerCase() +'.png">';
                    var player2Flag = '<img src="https://flagcdn.com/w20/'+ (player2.location||player2.countryCode).toLowerCase() +'.png">';

                    //var player1Flag = '<img src="https://www.countryflags.io/'+ (player1.location||player1.countryCode) +'/flat/16.png">';
                    //var player2Flag = '<img src="https://www.countryflags.io/'+ (player2.location||player2.countryCode) +'/flat/16.png">';
                    var player1Race = RACE_ICONS[player1.race];
                    var player2Race = RACE_ICONS[player2.race];
                    //var tpl_VS = '<img src="https://w3champions.wc3.tools/prod/site/img/swords.0d444d5c.svg"  width="16" height="16">';
                    //..var tpl_VS = "⚔";
                    var tpl_VS = " ⚔️ ";
                } else {
                    var player1Name = (player1.aka && player1.aka.toLowerCase() != player1.name.toLowerCase())
                    ? '<span style="float: left;">' + player1.aka + '</span>'+ '<sub class="tw-c-text-alt-2 tw-flex tw-font-size-10" style="padding-top:5px;float:left;font-size: 10px;">as '+player1.name+'</sub>'
                    : player1.name;
                    var player2Name = (player2.aka && player2.aka.toLowerCase() != player2.name.toLowerCase())
                    ? '<span style="float: right;">' + player2.aka + '</span>'+ '<sub class="tw-c-text-alt-2 tw-flex tw-font-size-10" style="padding-top:5px;float:right;font-size: 10px;">as '+player2.name+'</sub>'
                    : player2.name;

                    var player1Flag = "["+player1.location+"]";//RACE[]
                    var player2Flag = "["+player2.location+"]";
                    var player1Race = "("+RACE[player1.race]+")";
                    var player2Race = "("+RACE[player2.race]+")";
                    var tpl_VS = "vs.";
                }

                var nowPlayin = "<div>"+player1Flag+ " " + player1Name + player1Race + "" + tpl_VS + ""+ player2Flag + " " + player2Name + player2Race + "</div>";
                nowPlayingDiv.innerHTML = nowPlayin;

                var originalTitle = streamTitle.innerHTML.split("<br>")[0];
                streamTitle.innerHTML = originalTitle +  "<br>" + nowPlayin;

                //console.log(nowPlayin);
            }// if status_OK
        };// readystate

    }

    var myVar = setInterval(main, 10000);
})();
