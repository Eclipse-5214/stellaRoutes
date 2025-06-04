import { getRoomData } from "../../roomsAPI/utils/utils";
import { DataStore } from "../../tska/storage/DataStore";
import settings from "./config";

/*  ------------ Dungeon Utilities --------------

    Dungeon related utilites

    ------------------- To Do -------------------

    - Nothing :D

    --------------------------------------------- */

//load routes
export let defaultRoutes = FileLib.read("stellaRoutes", "data/routes/routes.json");
export let routes = FileLib.read("stellaRoutes", "data/routes/routes-" + Player.getName() + ".json");
export let customRoutes = FileLib.read("stellaRoutes", "data/routes/" + settings().customFileName);

//pulls route data for current room from the routes.json file
export const getRouteData = () => {
    let id = getRoomData().rid;
    if (!id) return;

    if (!settings.defaultRoutes) {
        if (!settings.customRoutes) {
            let routeData = routes ? Object.keys(routes) : null;
            if (routeData) {
                for (var i = 0; i < routeData.length; i++) {
                    if (routeData[i] === id) return Object.values(routes)[i];
                }
            }
        } else {
            let routeData = customRoutes ? Object.keys(customRoutes) : null;
            if (routeData) {
                for (var i = 0; i < routeData.length; i++) {
                    if (routeData[i] === id) return Object.values(routes)[i];
                }
            }
        }
    }

    let defaultRouteData = Object.keys(defaultRoutes);

    for (var i = 0; i < defaultRouteData.length; i++) {
        if (defaultRouteData[i] === id) return Object.values(routes)[i];
    }
    return null;
};
