import { getRoomData } from "../../roomsAPI/utils/utils";

/*  ------------ Dungeon Utilities --------------

    Dungeon related utilites

    ------------------- To Do -------------------

    - Nothing :D

    --------------------------------------------- */

//load routes
export let routes = JSON.parse(FileLib.read("stella", "data/dungeons/routes/routes.json"));

//pulls route data for current room from the routes.json file
export const getRouteData = () => {
    let id = getRoomData().rid;
    if (!id) return;

    let routeData = Object.keys(routes);
    for (var i = 0; i < routeData.length; i++) {
        if (routeData[i] === id) return Object.values(routes)[i];
    }

    return null;
};
