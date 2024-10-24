

let body = document.getElementsByTagName("body")[0];
let city = document.getElementById("city");


let currentDayTemp = document.getElementById("currentDayTemp");
let currentDayMaxTemp = document.getElementById("currentDayMaxTemp");
let currentDayMinTemp = document.getElementById("currentDayMinTemp");

let windSpeed = document.getElementById("windSpeed");
let windDirection = document.getElementById("windDirection");

let humidity = document.getElementById("humidity");

let climat_condition = document.getElementById("climat-condition");

let tomorrow_condition = document.getElementById("tomorrowCondition");
let tomorrowMaxTemp = document.getElementById("tomorrowMaxTemp");
let tomorrowMinTemp = document.getElementById("tomorrowMinTemp");

let fleche_haut = document.getElementById("fleche-haut");
let fleche_bas = document.getElementById("fleche-bas");

let trueCity;

/**
 */


//récupération de l'heure pour passer du thème light au thème dark (voir ligne 159)
let hours = new Date().getHours();
const isDayTime = hours > 6 && hours < 19;



        // Step 2: Get city name 
        async function getCity() {
            if (navigator.geolocation) {
                return new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(async function(position) {
                        let lat = position.coords.latitude;
                        let lng = position.coords.longitude;
        
                        try {
                            const response = await fetch(`https://us1.locationiq.com/v1/reverse.php?key=pk.36679308395725b059c21bd90a327cbd&lat=${lat}&lon=${lng}&format=json`);
                            
                            if (!response.ok) {
                                throw new Error('Erreur lors de la récupération de la ville');
                            }
                            
                            let data = await response.json();
                            let trueCity = data.address.city;
                            console.log("trueCity variable value: " + trueCity);
                            
                            resolve(trueCity); // return de la ville trouvée
                        } catch (error) {
                            console.error("Erreur: ", error);
                        }
                    },
                    (error) => {
                        console.error("Erreur du service de Géolocalisation : ", error);
                    });
                });
            } else {
                console.log("Geolocation n'est pas supporté par ce navigateur.");
            }
        }
        
        getCity().then(city => {
            trueCity = city;
        }).catch(error => {
            console.error("Erreur : " + error);
        });
        



//fonction setTimeOut pour délayer l'exécution de cette portion de code.
//la fonction fetchTownInfo() cherchait à récupérer trop rapidement la valeur de la ville, qui n'avait pas le temps d'être récupérée par l'autre api
//donc j'ai dû délayer la fonction d'affichage pour laisser le temps à la fonction de récupération de la ville de travailler

setTimeout(() => {
    //remplacement de caractères spéciaux en caractères simples pour les noms de villes avec accents
    //l'API de récupération de ville affiche les noms de villes propres (ex: Angoulême)
    //mais l'API météo ne comprends que les noms de ville simples (ex: angouleme)
    function replaceCharacter() {

        if(trueCity === "Langon"){
            console.log("updating let variable trueCity from "+trueCity+" to Bordeaux");
            
            trueCity = "Bordeaux";
        }

        if(trueCity != null && trueCity.includes("ê")){
        newString = trueCity.replace(/ê/g, "e");
        trueCity = newString;
        console.log(newString);
        } else {
            return;
        }

    } 
    replaceCharacter();
    //requêtage par la méthode fetch() de l'API météo pour récupérer les informations sur la météo de la ville de l'utilisateur
    async function fetchTownInfo (){
        
        //vérification additionnelle de la valeur de la variable contenant le nom de la ville avant le requêtage
        //pour m'assurer que la valeur n'est pas null
        console.log("Last check city:"+trueCity);
        
        //requêtage de l'api
        const r = await fetch('https://www.prevision-meteo.ch/services/json/'+trueCity, {
            method: 'GET',
            headers: {
                "Accept": "application/json",
            }
        })
        if(r.ok){
            return r.json();
        }
        throw new Error('Connexion au serveur impossible')
    }

    //modification du DOM avec les informations récupérées depuis l'API
    fetchTownInfo().then(info => {
        city.innerHTML = info.city_info.name + ", " + info.city_info.country;

        climat_condition.innerHTML = info.current_condition.condition;

        currentDayTemp.innerHTML = info.current_condition.tmp + "°";

        let currentConditionImg = document.createElement("img");
        currentConditionImg.src = info.current_condition.icon;
        let climatConditionImg = document.getElementById("climat-condition-img")
        climatConditionImg.appendChild(currentConditionImg);

        windSpeed.innerHTML = info.current_condition.wnd_spd + "km/h";
        windDirection.innerHTML = info.current_condition.wnd_dir;
        humidity.innerHTML = info.current_condition.humidity;

        currentDayMaxTemp.innerHTML = info.fcst_day_0.tmax + "°";
        currentDayMinTemp.innerHTML = info.fcst_day_0.tmin + "°";

        //Récupération des infos du J+1 (lendemain)
        let tomorrowImg = document.createElement("img");
        tomorrowImg.src = info.fcst_day_1.icon;
        let tomorrowSrc = document.getElementById("tomorrowTempImg");
        tomorrowSrc.appendChild(tomorrowImg);

        tomorrow_condition.innerHTML = info.fcst_day_1.condition;
        tomorrowMaxTemp.innerHTML = info.fcst_day_1.tmax + "°";
        tomorrowMinTemp.innerHTML = info.fcst_day_1.tmin + "°";



        //méthode permettant de passer du dark mode (nuit) au light mode (jour)
        if(isDayTime === true){
            body.style.backgroundImage = 'url("./src/images/day_background.jpg")';
            body.classList.replace("text-white", "text-black");

            fleche_haut.src = "./src/images/icons/fleche-haut-noir.png";
            fleche_bas.src = "./src/images/icons/fleche-bas-noir.png";
            console.log("Il fait jour");
            
        } else {
            body.style.backgroundImage = 'url("./src/images/night_background.jpg")';
            body.classList.replace("text-black", "text-white");
            
            fleche_haut.src = "./src/images/icons/fleche-haut-blanc.png";
            fleche_bas.src = "./src/images/icons/fleche-bas-blanc.png";
            console.log("Il fait nuit");
        }


        //Affichage dynamique des informations des Prochains Jours en itérant la div parent des éléments 

        let nextDayContainer = document.getElementById("next-days");
        let nextDays = nextDayContainer.querySelectorAll("div");

            for (let i = 0; i < nextDays.length; i++) {

                switch (i) {
                    case 0:
                        let nextDayImg1 = document.createElement("img");
                        nextDayImg1.src = info.fcst_day_1.icon;
                        let nextDayImgSrc1 = document.getElementById("next-day-img-1");
                        nextDayImgSrc1.appendChild(nextDayImg1);

                        let nextDayName1 = document.getElementById("next-day-name-1");
                        nextDayName1.innerHTML = info.fcst_day_1.day_short;

                        let nextDayCondition1 = document.getElementById("next-day-condition-1");
                        nextDayCondition1.innerHTML = info.fcst_day_1.condition;

                        let nextdayTempMax1 = document.getElementById("next-day-tempMax-1");
                        nextdayTempMax1.innerHTML = info.fcst_day_1.tmax + "° Max.";
                        break;

                    case 1:
                        let nextDayImg2 = document.createElement("img");
                        nextDayImg2.src = info.fcst_day_2.icon;

                        let nextDayName2 = document.getElementById("next-day-name-2");
                        nextDayName2.innerHTML = info.fcst_day_2.day_short;

                        let nextDayImgSrc2 = document.getElementById("next-day-img-2");
                        nextDayImgSrc2.appendChild(nextDayImg2);

                        let nextDayCondition2 = document.getElementById("next-day-condition-2");
                        nextDayCondition2.innerHTML = info.fcst_day_2.condition;
                        let nextdayTempMax2 = document.getElementById("next-day-tempMax-2");
                        nextdayTempMax2.innerHTML = info.fcst_day_2.tmax + "° Max.";
                        break;

                    case 2:
                        let nextDayImg3 = document.createElement("img");
                        nextDayImg3.src = info.fcst_day_3.icon;

                        let nextDayName3 = document.getElementById("next-day-name-3");
                        nextDayName3.innerHTML = info.fcst_day_3.day_short;

                        let nextDayImgSrc3 = document.getElementById("next-day-img-3");
                        nextDayImgSrc3.appendChild(nextDayImg3);

                        let nextDayCondition3 = document.getElementById("next-day-condition-3");
                        nextDayCondition3.innerHTML = info.fcst_day_3.condition;
                        let nextdayTempMax3 = document.getElementById("next-day-tempMax-3");
                        nextdayTempMax3.innerHTML = info.fcst_day_3.tmax + "° Max.";
                        break;

                    case 3:
                        let nextDayImg4 = document.createElement("img");
                        nextDayImg4.src = info.fcst_day_4.icon;

                        let nextDayName4 = document.getElementById("next-day-name-4");
                        nextDayName4.innerHTML = info.fcst_day_4.day_short;

                        let nextDayImgSrc4 = document.getElementById("next-day-img-4");
                        nextDayImgSrc4.appendChild(nextDayImg4);

                        let nextDayCondition4 = document.getElementById("next-day-condition-4");
                        nextDayCondition4.innerHTML = info.fcst_day_4.condition;
                        let nextdayTempMax4 = document.getElementById("next-day-tempMax-4");
                        nextdayTempMax4.innerHTML = info.fcst_day_4.tmax + "° Max.";
                        break;

                    default:
                        break;
                }
            }
        }
    )
 //nbr de millisecondes de délai de la fonction setTimeOut()
}, 800)
