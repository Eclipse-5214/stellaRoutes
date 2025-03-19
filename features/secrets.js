import { getRoomData, getRealCoord } from "../../roomsAPI/utils/utils";
import { registerWhen } from "../../BloomCore/utils/Utils";
import { Render3D } from "../../tska/rendering/Render3D";
import Dungeon from "../../BloomCore/dungeons/Dungeon";
import settings from "../utils/config";

/*  ------------- Secret Waypoints --------------

    Draws goofy waypoints at secrets

    ------------------- To Do -------------------

    - Nothing :D

    --------------------------------------------- */

//variables
let lastRoomId = null;
let secretsData = null;

//gets current room data
registerWhen(
    register("step", () => {
        if (settings().secretWaypoints) {
            let roomId = getRoomData();
            if (!roomId) return;
            if (lastRoomId !== roomId) {
                lastRoomId = roomId;
                secretsData = getRoomData();
            }
        }
    }).setFps(5),
    () => settings().secretWaypoints
);

let colors = {
    chest: [settings().chestColor[0], settings().chestColor[1], settings().chestColor[2]],
    item: [settings().itemColor[0], settings().itemColor[1], settings().itemColor[2]],
    wither: [settings().witherColor[0], settings().witherColor[1], settings().witherColor[2]],
    bat: [settings().batColor[0], settings().batColor[1], settings().batColor[2]],
    redstone_key: [settings().redstoneColor[0], settings().redstoneColor[1], settings().redstoneColor[2]],
};

//desplays waypoints
registerWhen(
    register("renderWorld", () => {
        if (!Dungeon.inDungeon || Dungeon.bossEntry || !secretsData || !secretsData.secret_coords) return;
        Object.entries(secretsData.secret_coords).forEach(([type, secrets]) => {
            secrets.forEach((pos) => {
                const secretPos = getRealCoord(pos);
                if (!secretPos) return;
                let [x, y, z] = secretPos;
                let [r, g, b] = colors[type];

                if (settings().showWText) Render3D.renderString(type, x + 0.5, y + 1.5, z + 0.5, [0, 0, 0, 80], true, 0.03, false, true, true);
                if (settings().boxWSecrets) Render3D.outlineBlock(World.getBlockAt(x, y, z), r, g, b, 255, true);
            });
        });
    }),
    () => settings().secretWaypoints
);
