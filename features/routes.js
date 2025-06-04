import { getRealCoord, getRoomWorldData, getRoomData, getRoomCoord, getCore } from "../../roomsAPI/utils/utils";
import { calcDistance, drawLineParticles } from "../utils/utils";
import { drawBoxAtBlock, drawFilledBox, drawLine } from "../utils/renderUtils";
import { getRouteData, routes } from "../utils/dutils";
import { registerWhen } from "../../BloomCore/utils/Utils";
import { Render3D } from "../../tska/rendering/Render3D";
import Dungeon from "../../BloomCore/dungeons/Dungeon";
import settings from "../utils/config";

/*  --------------- secret routes ---------------

    the main point of this mod

    ------------------- To Do -------------------

    - rendering multible steps at once (is this even nececary)
    - update keybinds without reload (far future)
    - differant route file switching

    --------------------------------------------- */

//item filtering
const EntityItem = Java.type("net.minecraft.entity.item.EntityItem");
const secretItems = new Set([
    "Healing VIII Splash Potion",
    "Healing Potion 8 Splash Potion",
    "Decoy",
    "Inflatable Jerry",
    "Spirit Leap",
    "Trap",
    "Training Weights",
    "Defuse Kit",
    "Dungeon Chest Key",
    "Treasure Talisman",
    "Revive Stone",
    "Architect's First Draft",
]);

//set keybinds
let nStep = new KeyBind("Next Step", settings().nextStep, "Eclipse Addons");
let lStep = new KeyBind("Last Step", settings().lastStep, "Eclipse Addons");
let rStep = new KeyBind("Reset Route", settings().resetStep, "Eclipse Addons");

//general variables
let lastRoomId = null;
let currRouteData = null;
let step = 0;

//recording variables
let route = {};
let recordingData = {
    locations: [],
    mines: [],
    etherwarps: [],
    tnts: [],
    interacts: [],
    secret: { type: null, location: null },
};
let playerloc = null;
let roomRID = null;
let recording = false;

//functions for rendering

//resets the rooms current route
function reset() {
    //resets route
    step = 0;
    currRouteData = getRouteData();
}

//functions for recording

//adds a recording point
function addPoint(realpos, type) {
    let pos = getRoomCoord(realpos);

    if (!pos) return;

    if (type === "location") {
        recordingData.locations.push(pos);
    }

    if (type === "etherwarp") {
        for (var i = 0; i < recordingData.etherwarps.length; i++) {
            let [x, y, z] = [recordingData.etherwarps[i][0], recordingData.etherwarps[i][1], recordingData.etherwarps[i][2]];
            if (x === pos[0] && y === pos[1] && z === pos[2]) return;
        }
        recordingData.etherwarps.push(pos);
    }

    if (type === "tnt") {
        for (var i = 0; i < recordingData.tnts.length; i++) {
            let [x, y, z] = [recordingData.tnts[i][0], recordingData.tnts[i][1], recordingData.tnts[i][2]];
            let distance = calcDistance(pos, [x, y, z]);

            if (distance < 25) return;
        }
        recordingData.tnts.push([Math.round(pos[0]), Math.round(pos[1]), Math.round(pos[2])]);
    }

    if (type === "mine") {
        for (var i = 0; i < recordingData.mines.length; i++) {
            let [x, y, z] = [recordingData.mines[i][0], recordingData.mines[i][1], recordingData.mines[i][2]];
            if (x === pos[0] && y === pos[1] && z === pos[2]) return;
        }
        recordingData.mines.push(pos);
    }

    if (type === "interact") {
        for (var i = 0; i < recordingData.interacts.length; i++) {
            let [x, y, z] = [recordingData.interacts[i][0], recordingData.interacts[i][1], recordingData.interacts[i][2]];
            if (x === pos[0] && y === pos[1] && z === pos[2]) return;
        }
        recordingData.interacts.push(pos);
    }

    if (type === "secretInteract") {
        if (Object.keys(route).length !== 0) {
            if (route[roomRID][step - 1].secret.type === "interact") {
                let [x, y, z] = route[roomRID][step - 1].secret.location;
                if (x === pos[0] && y === pos[1] && z === pos[2]) return;
            }
        }

        recordingData.secret.type = "interact";
        recordingData.secret.location = pos;
    }

    if (type === "secretItem") {
        recordingData.secret.type = "item";
        recordingData.secret.location = pos;
    }

    if (type === "secretBat") {
        recordingData.secret.type = "bat";
        recordingData.secret.location = pos;
    }
}

//stops the recording
function stopRecording() {
    recordingData = {
        locations: [],
        mines: [],
        etherwarps: [],
        tnts: [],
        interacts: [],
        secret: { type: null, location: null },
    };
    recording = false;
    playerloc = null;
    route = {};
    step = 0;
    ChatLib.chat("&aStopped Recording!");
}

//pushes current step to route
function pushToRoute() {
    if (!route[roomRID]) route[roomRID] = [recordingData];
    else route[roomRID].push(recordingData);
    recordingData = {
        locations: [],
        mines: [],
        etherwarps: [],
        tnts: [],
        interacts: [],
        secret: { type: null, location: null },
    };
    step++;
}

//saves the route to the routes file (eventually to a seperate routes file with the players name on it)
function saveRoute(force) {
    let routeData = routes
        ? Object.keys(routes)
        : {
              "#name": "Default secret routes",
              "#origin": "generated by Stella",
              Version: "1.0",
          };
    let rVersion = routes ? routes.Version : "1.0";

    if (!force) {
        if (routeData) {
            for (var i = 0; i < routeData.length; i++) {
                if (routeData[i] === roomRID) {
                    ChatLib.chat("&cError: Route already exists!");
                    let yes = new TextComponent("&eOverride? &l&aYes").setClick("run_command", "/route route_save_force");
                    yes.chat();
                    let no = new TextComponent("&eOverride? &l&cNo").setClick("run_command", "/route stop");
                    no.chat();
                    return;
                }
            }
        }
    }
    pushToRoute();
    routes[roomRID] = route[roomRID];

    let routesFormatted = JSON.stringify(routes, null, 0)
        .replace('"#name":"Default secret routes",', '\n    "#name": "Default secret routes",\n    ')
        .replace('"#origin":"generated by Eclipse Addons",', '"#origin": "generated by Eclipse Addons",\n    ')
        .replace('"Version":"' + rVersion + '",', '"Version":"' + rVersion + '",\n\n    ')
        .replace(/}}],/g, "}}],\n    ")
        .replace("}}]}", "}}]\n}");

    FileLib.write("stella", "data/dungeons/routes/routes-" + Player.getName + ".json", routesFormatted);
    if (force) ChatLib.chat("&aOverwritten!");
    else ChatLib.chat("&aSaved!");
    stopRecording();
    reset();
}

//more functions

//gets room data
register("step", () => {
    let roomId = getRoomData();
    if (!roomId) {
        currRouteData = null;
        return;
    }

    if (lastRoomId !== roomId) {
        lastRoomId = roomId;

        currRouteData = getRouteData();
        roomRID = getRoomData().rid;
        if (recording) {
            ChatLib.chat("&cError: Left current room!");
            stopRecording();
        }
        //if(currRouteData === null){ ChatLib.chat("No route data");}
        //if(currRoomData === null){ ChatLib.chat("No room data");}
        step = 0;
    }
}).setFps(5);

//draws boxes
registerWhen(
    register("renderWorld", () => {
        //route rendering
        if (!Dungeon.inDungeon) return;
        if (Dungeon.bossEntry) return;

        if (!recording) {
            if (!currRouteData) return;
            if (step < currRouteData.length || step >= 0) {
                Object.entries(currRouteData[step]).forEach(([type, points]) => {
                    if (type != "secret") {
                        let index = 0;
                        points.forEach((pos) => {
                            let [x, y, z] = getRealCoord(pos);

                            if (type === "locations" && settings().lineType !== 2) {
                                if (index === 0 && step === 0) {
                                    Render3D.renderString("Start", x + 0.5, y + 1.5, z + 0.5, [0, 0, 0, 80], true, 0.03, false, true, true);
                                }

                                if (index + 1 < currRouteData[step].locations.length) {
                                    let [x2, y2, z2] = getRealCoord(currRouteData[step].locations[index + 1]);
                                    let [r, g, b] = [settings().lineColor[0] / 255, settings().lineColor[1] / 255, settings().lineColor[2] / 255];

                                    if (settings().lineType === 1) {
                                        drawLine(x + 0.5, y + 0.5, z + 0.5, x2 + 0.5, y2 + 0.5, z2 + 0.5, r, g, b, settings().lineWidth);
                                    }
                                }
                            }

                            if (type === "mines") {
                                let [r, g, b] = [settings().mineColor[0] / 255, settings().mineColor[1] / 255, settings().mineColor[2] / 255];

                                drawBoxAtBlock(x, y, z, r, g, b, 1, 1);

                                if (index === 0) {
                                    if (settings().showText) Render3D.renderString("Break", x + 0.5, y + 0.6, z + 0.5, [0, 0, 0, 80], true, 0.03, false, true, true);
                                }
                            }

                            if (type === "etherwarps") {
                                let [r, g, b] = [settings().warpColor[0] / 255, settings().warpColor[1] / 255, settings().warpColor[2] / 255];

                                drawFilledBox(x + 0.5, y, z + 0.5, 1, 1, r, g, b, 30 / 255, false);
                                drawBoxAtBlock(x, y, z, r, g, b, 1, 1);
                                if (settings().showText) Render3D.renderString("Warp", x + 0.5, y + 0.6, z + 0.5, [0, 0, 0, 80], true, 0.03, false, true, true);
                            }

                            if (type === "tnts") {
                                let [r, g, b] = [settings().tntColor[0] / 255, settings().tntColor[1] / 255, settings().tntColor[2] / 255];

                                drawFilledBox(x + 0.5, y, z + 0.5, 1, 1, r, g, b, 30 / 255, false);
                                drawBoxAtBlock(x, y, z, r, g, b, 1, 1);
                                if (settings().showText) Render3D.renderString("BOOM", x + 0.5, y + 0.6, z + 0.5, [0, 0, 0, 80], true, 0.03, false, true, true);
                            }

                            if (type === "interacts") {
                                let [r, g, b] = [settings().clickColor[0] / 255, settings().clickColor[1] / 255, settings().clickColor[2] / 255];

                                drawFilledBox(x + 0.5, y, z + 0.5, 1, 1, r, g, b, 30 / 255, false);
                                drawBoxAtBlock(x, y, z, r, g, b, 1, 1);
                                if (settings().showText) Render3D.renderString("Click", x + 0.5, y + 0.6, z + 0.5, [0, 0, 0, 80], true, 0.03, false, true, true);
                            }

                            index++;
                        });
                    } else {
                        if (currRouteData[step].secret.type === null) return;
                        let [x, y, z] = getRealCoord(currRouteData[step].secret.location);
                        let [r, g, b] = [settings().secretColor[0] / 255, settings().secretColor[1] / 255, settings().secretColor[2] / 255];

                        if (settings().showText) Render3D.renderString(currRouteData[step].secret.type, x + 0.5, y + 0.6, z + 0.5, [0, 0, 0, 80], true, 0.03, false, true, true);
                        if (settings().boxSecrets) drawBoxAtBlock(x, y, z, r, g, b, 1, 1);
                    }
                });

                //bat detection
                if (currRouteData[step].secret.type === "bat") {
                    let pos = [Player.getX(), Player.getY(), Player.getZ()];
                    let secretPos = getRealCoord(currRouteData[step].secret.location);
                    let distance = calcDistance(pos, secretPos);

                    if (distance < 25) {
                        step++;
                    }
                }
            }
        }

        //rendering for routes being recorded
        if (recording) {
            if (!recordingData.locations) return;
            Object.entries(recordingData).forEach(([type, points]) => {
                if (type != "secret") {
                    let index = 0;
                    points.forEach((pos) => {
                        let [x, y, z] = getRealCoord(pos);

                        if (type === "locations") {
                            if (index === 0 && step === 0) {
                                Render3D.renderString("Start", x + 0.5, y + 1.5, z + 0.5, [0, 0, 0, 80], true, 0.03, false, true, true);
                            }

                            if (index + 1 < recordingData.locations.length) {
                                let [x2, y2, z2] = getRealCoord(recordingData.locations[index + 1]);
                                let [r, g, b] = [settings().lineColor[0] / 255, settings().lineColor[1] / 255, settings().lineColor[2] / 255];

                                if (settings().lineType === 1) {
                                    drawLine(x + 0.5, y + 0.5, z + 0.5, x2 + 0.5, y2 + 0.5, z2 + 0.5, r, g, b, settings().lineWidth);
                                }
                            }
                        }

                        if (type === "mines") {
                            let [r, g, b] = [settings().mineColor[0] / 255, settings().mineColor[1] / 255, settings().mineColor[2] / 255];

                            drawBoxAtBlock(x, y, z, r, g, b, 1, 1);

                            if (index === 0) {
                                if (settings().showText) Render3D.renderString("Break", x + 0.5, y + 0.6, z + 0.5, [0, 0, 0, 80], true, 0.03, false, true, true);
                            }
                        }

                        if (type === "etherwarps") {
                            let [r, g, b] = [settings().warpColor[0] / 255, settings().warpColor[1] / 255, settings().warpColor[2] / 255];

                            drawFilledBox(x + 0.5, y, z + 0.5, 1, 1, r, g, b, 30 / 255, false);
                            drawBoxAtBlock(x, y, z, r, g, b, 1, 1);
                            if (settings().showText) Render3D.renderString("Warp", x + 0.5, y + 0.6, z + 0.5, [0, 0, 0, 80], true, 0.03, false, true, true);
                        }

                        if (type === "tnts") {
                            let [r, g, b] = [settings().tntColor[0] / 255, settings().tntColor[1] / 255, settings().tntColor[2] / 255];

                            drawFilledBox(x + 0.5, y, z + 0.5, 1, 1, r, g, b, 30 / 255, false);
                            drawBoxAtBlock(x, y, z, r, g, b, 1, 1);
                            if (settings().showText) Render3D.renderString("BOOM", x + 0.5, y + 0.6, z + 0.5, [0, 0, 0, 80], true, 0.03, false, true, true);
                        }

                        if (type === "interacts") {
                            let [r, g, b] = [settings().clickColor[0] / 255, settings().clickColor[1] / 255, settings().clickColor[2] / 255];

                            drawFilledBox(x + 0.5, y, z + 0.5, 1, 1, r, g, b, 30 / 255, false);
                            drawBoxAtBlock(x, y, z, r, g, b, 1, 1);
                            if (settings().showText) Render3D.renderString("Click", x + 0.5, y + 0.6, z + 0.5, [0, 0, 0, 80], true, 0.03, false, true, true);
                        }

                        index++;
                    });
                } else {
                    if (Object.keys(route).length === 0) return;
                    let [x, y, z] = getRealCoord(route[roomRID][step - 1].secret.location);
                    let [r, g, b] = [settings().secretColor[0] / 255, settings().secretColor[1] / 255, settings().secretColor[2] / 255];

                    if (settings().showText) Render3D.renderString(route[roomRID][step - 1].secret.type, x + 0.5, y + 0.6, z + 0.5, [0, 0, 0, 80], true, 0.03, false, true, true);
                    if (settings().boxSecrets) drawBoxAtBlock(x, y, z, r, g, b, 1, 1);
                }
            });
        }
    }),
    () => settings().modEnabled
);

//draws particle lines
register("step", () => {
    if (!Dungeon.inDungeon) return;

    //normal line
    if (settings().modEnabled && settings().lineType === 0 && !recording) {
        if (!currRouteData) return;
        if (step < currRouteData.length || step >= 0) {
            for (var i = 0; i < currRouteData[step].locations.length; i++) {
                let [x, y, z] = getRealCoord(currRouteData[step].locations[i]);
                if (i + 1 < currRouteData[step].locations.length) {
                    let [x2, y2, z2] = getRealCoord(currRouteData[step].locations[i + 1]);
                    drawLineParticles([x + 1, y + 0.5, z + 1], [x2 + 1, y2 + 0.5, z2 + 1]);
                }
            }
        }
    }

    //recording line
    if (recording) {
        if (recordingData.locations === null) return;
        for (var i = 0; i < recordingData.locations.length; i++) {
            let [x, y, z] = getRealCoord(recordingData.locations[i]);

            if (i + 1 < recordingData.locations.length) {
                let [x2, y2, z2] = getRealCoord(recordingData.locations[i + 1]);

                if (settings().lineType === 0) drawLineParticles([x + 1, y + 0.5, z + 1], [x2 + 1, y2 + 0.5, z2 + 1]);
            }
        }
    }
}).setFps(5);

//draws recordsing line
register("step", () => {
    if (!recording) return;

    let loc = [Math.round(Player.getX() + 0.25) - 1, Math.round(Player.getY()), Math.round(Player.getZ() + 0.25) - 1];

    let distance = null;

    if (playerloc !== null) distance = calcDistance(loc, playerloc);

    if (distance > 4 || playerloc === null) {
        playerloc = loc;
        addPoint(loc, "location");
    }
}).setFps(2);

//checks if a player is opening current secret
registerWhen(
    register("playerInteract", (action) => {
        if (action.toString() !== "RIGHT_CLICK_BLOCK") return;
        if (!Dungeon.inDungeon) return;

        let block = Player.lookingAt();

        if (!block) return;
        if (!block?.type) return;
        if (block?.getID() === 0) return;

        let pos = [block?.getX(), block?.getY(), block?.getZ()];
        let id = block?.getType().getID();

        //normal interacts
        if (!recording) {
            if (!currRouteData) return;
            if (currRouteData[step].secret.type === null) return;
            if (currRouteData[step].secret.type !== "interact") return;
            if (step < currRouteData.length || step >= 0) {
                let secretPos = getRealCoord(currRouteData[step].secret.location);

                if (pos[0] === secretPos[0] && pos[1] === secretPos[1] && pos[2] === secretPos[2]) {
                    if (id === 54) {
                        // Chest
                        step++;
                    }
                    if (id === 146) {
                        // Trapped chest (mimic?)
                        step++;
                    }
                    if (id === 144) {
                        // Skull (wither ess or redstone key)
                        step++;
                    }
                }
            }
        }

        //recording interacts
        if (recording) {
            //ChatLib.chat("working");
            if (id === 54) {
                // Chest
                addPoint(pos, "secretInteract");
                pushToRoute();
            }

            if (id === 146) {
                // Trapped chest (mimic?)
                addPoint(pos, "secretInteract");
                pushToRoute();
            }

            if (id === 144) {
                // Skull (wither ess or redstone key)
                addPoint(pos, "secretInteract");
                pushToRoute();
            }

            if (id === 69) {
                // Lever
                addPoint(pos, "interact");
            }
        }
    }),
    () => settings().modEnabled
);

//adds points for varias actions
registerWhen(
    register("soundPlay", (pos, name) => {
        if (!Dungeon.inDungeon) return;

        let nameSplitted = name.split(".");

        if (name === "mob.enderdragon.hit") {
            //etherwarp
            let loc = [pos.x - 0.5, pos.y - 1, pos.z - 0.5];
            addPoint(loc, "etherwarp");
        }

        if (name === "random.explode") {
            //tnt
            let boom = ["boom TNT", "Explosive Bow"];
            if (!boom.some((i) => Player?.getHeldItem()?.getName()?.includes(i))) return;
            let loc = [pos.x - 0.5, pos.y - 0.5, pos.z - 0.5];
            addPoint(loc, "tnt");
        }

        if (nameSplitted[0] === "dig") {
            //mining block
            let loc = [pos.x - 0.5, pos.y - 0.5, pos.z - 0.5];
            addPoint(loc, "mine");
        }

        if (name === "mob.bat.death") {
            let loc = [Math.round(pos.x), Math.round(pos.y), Math.round(pos.z)];
            addPoint(loc, "secretBat");
            pushToRoute();
        }
    }),
    () => recording
);

//item detection (still need to tweak sense)

//borrowed from bettermap
let tempItemIdLocs = new Map();

register(net.minecraftforge.event.entity.EntityJoinWorldEvent, (event) => {
    if (event.entity instanceof EntityItem) {
        tempItemIdLocs.set(event.entity.func_145782_y(), event.entity);
    }
});

register("worldLoad", () => {
    tempItemIdLocs.clear();
});

//Thanks DocilElm for all your help with this

registerWhen(
    register("packetReceived", (packet) => {
        let entityID = packet.func_149354_c();

        if (!this.tempItemIdLocs.has(entityID)) return;

        if (!Dungeon.inDungeon) return;

        let entity = tempItemIdLocs.get(entityID);
        let name = entity.func_92059_d()?.func_82833_r();

        let e = new Entity(entity);
        let pos = [e.getX(), e.getY(), e.getZ()];

        if (!name || !secretItems.has(name.removeFormatting())) {
            return;
        }

        //normal item detection
        if (!recording) {
            if (!currRouteData) return;
            if (step < currRouteData.length) {
                if (currRouteData[step].secret.type === null) return;
                if (currRouteData[step].secret.type !== "item") return;

                let secretPos = getRealCoord(currRouteData[step].secret.location);
                let distance = calcDistance(pos, secretPos);

                //ChatLib.chat(distance);

                if (distance < 25) {
                    step++;
                }
            }
        }

        //recording item detection
        if (recording) {
            //ChatLib.chat("item picked up")
            let posRound = [Math.round(pos[0]), Math.round(pos[1]), Math.round(pos[2])];
            let playerPos = [Math.round(Player.getX() + 0.25) - 1, Math.round(Player.getY()), Math.round(Player.getZ() + 0.25) - 1];
            let pdistance = calcDistance(playerPos, posRound);

            //ChatLib.chat(JSON.stringify(posRound,undefined,2))
            if (Object.keys(route).length !== 0) {
                // ChatLib.chat("distance check")
                let secretPos = getRealCoord(route[roomRID][step - 1].secret.location);
                //ChatLib.chat(JSON.stringify(secretPos,undefined,2))
                let distance = calcDistance(posRound, secretPos);
                //ChatLib.chat(distance)

                if (distance > 25) {
                    if (pdistance > 25) addPoint(playerPos, "secretItem");
                    else addPoint(posRound, "secretItem");

                    pushToRoute();
                    //ChatLib.chat("item added!")
                }
            } else {
                if (pdistance > 25) addPoint(playerPos, "secretItem");
                else addPoint(posRound, "secretItem");

                pushToRoute();
                //ChatLib.chat("item added!")
            }
        }
    }).setFilteredClass(net.minecraft.network.play.server.S0DPacketCollectItem),
    () => settings().modEnabled
);

//keybind uses
nStep.registerKeyPress(() => {
    if (!Dungeon.inDungeon) {
        ChatLib.chat("&cError: Not in dungeon!");
        return;
    }
    if (recording) {
        ChatLib.chat("&cError: Recording!");
        return;
    }
    if (step === currRouteData.length - 1) {
        ChatLib.chat("&cError: On last step!");
        return;
    }

    step++;
    ChatLib.chat("&aShowing next step!");
});

lStep.registerKeyPress(() => {
    if (!Dungeon.inDungeon) {
        ChatLib.chat("&cError: Not in dungeon!");
        return;
    }
    if (recording) {
        ChatLib.chat("&cError: Recording!");
        return;
    }
    if (step === 0) {
        ChatLib.chat("&cError: On first step!");
        return;
    }
    step--;
    ChatLib.chat("&aShowing last step!");
});

rStep.registerKeyPress(() => {
    if (!Dungeon.inDungeon) {
        ChatLib.chat("&cError: Not in dungeon!");
        return;
    }
    if (recording) {
        ChatLib.chat("&cError: Recording!");
        return;
    }

    reset();
    ChatLib.chat("&aReset Route!");
});

//debug commands
register("command", (...args) => {
    if (args[0] === "next") step++;
    else if (args[0] === "back") step--;
    else if (args[0] === "reset") reset();
    else if (args[0] === "room") {
        ChatLib.chat(JSON.stringify(getRoomData(), undefined, 2));
        ChatLib.chat(JSON.stringify(getRoomWorldData(), undefined, 2));
        ChatLib.chat(JSON.stringify(getCore(), undefined, 2));
        ChatLib.chat(JSON.stringify(getRoomData().id, undefined, 2));
    } else if (args[0] === "route") {
        ChatLib.chat(JSON.stringify(getRouteData(), undefined, 2));
    } else if (args[0] === "help") {
        ChatLib.chat("&8&m-------------------------------------------------");
        ChatLib.chat("&6/srdb help &7Opens the Secret Routes Debug help menu!");
        ChatLib.chat("&6/srdb room &7Displays current room information!");
        ChatLib.chat("&6/srdb route &7Displays current secret route information!");
        ChatLib.chat("&6/srdb next &7Goes to the next route step!");
        ChatLib.chat("&6/srdb back &7Goes to the last route step!");
        ChatLib.chat("&6/srdb reset &7resets back to the first step!");
        ChatLib.chat("&8&m-------------------------------------------------");
    } else {
        ChatLib.chat("&cUnknown command. &7Try &6/srdb help &7for a list of commands");
    }
}).setName("srdb");

//route recording commands
register("command", (...args) => {
    if (args[0] === "record") {
        if (!Dungeon.inDungeon) {
            ChatLib.chat("&cError: Not in dungeon!");
            return;
        }
        if (recording) ChatLib.chat("&cError: Already recording!");
        if (!recording) {
            reset();
            recording = true;
            ChatLib.chat("&aRecording!");
        }
    } else if (args[0] === "stop") {
        if (!Dungeon.inDungeon) {
            ChatLib.chat("&cError: Not in dungeon!");
            return;
        }
        if (!recording) ChatLib.chat("&cError: Not recording!");
        if (recording) stopRecording();
    } else if (args[0] === "save") {
        if (!Dungeon.inDungeon) {
            ChatLib.chat("&cError: Not in dungeon!");
            return;
        }
        if (!recording) ChatLib.chat("&cError: Not recording!");
        if (recording) {
            saveRoute(false);
        }
    } else if (args[0] === "view") {
        if (!Dungeon.inDungeon) {
            ChatLib.chat("&cError: Not in dungeon!");
            return;
        }
        if (!recording) ChatLib.chat("&cError: Not recording!");
        if (recording) {
            ChatLib.chat(JSON.stringify(route, undefined, 2));
        }
    } else if (args[0] === "bat") {
        if (!Dungeon.inDungeon) {
            ChatLib.chat("&cError: Not in dungeon!");
            return;
        }
        if (!recording) ChatLib.chat("&cError: Not recording!");
        if (recording) {
            let pos = [Math.round(Player.getX() + 0.25) - 1, Math.round(Player.getY()), Math.round(Player.getZ() + 0.25) - 1];
            addPoint(pos, "secretBat");
            pushToRoute();
            ChatLib.chat("&aAdded bat");
        }
    } else if (args[0] === "route_save_force") {
        if (!Dungeon.inDungeon) {
            ChatLib.chat("&cError: Not in dungeon!");
            return;
        }
        if (!recording) ChatLib.chat("&cError: Not recording!");
        if (recording) {
            saveRoute(true);
        }
    } else if (args[0] === "help") {
        ChatLib.chat("&8&m-------------------------------------------------");
        ChatLib.chat("&6/route help &7Opens the Route Recording help menu!");
        ChatLib.chat("&6/route record &7Record a secret route!");
        ChatLib.chat("&6/route stop &7Stops recording a secret route!");
        ChatLib.chat("&6/route save &7Saves the recorded route!");
        ChatLib.chat("&6/route bat &7Adds a bat secret!");
        ChatLib.chat("&8&m-------------------------------------------------");
    } else {
        ChatLib.chat("&cUnknown command. &7Try &6/route help &7for a list of commands");
    }
}).setName("route");
