import Settings from "../../Amaterasu/core/Settings";
import DefaultConfig from "../../Amaterasu/core/DefaultConfig";

/*  ------------------- Config ------------------

    Core Config

    ------------------- To Do -------------------

    - Make themeing work

    --------------------------------------------- */

//setup

//markdown stuff
const version = JSON.parse(FileLib.read("stellaRoutes", "metadata.json")).version;

//config
const defaultConf = new DefaultConfig("stellaRoutes", "data/settings.json")

    //general
    .addTextParagraph({
        category: "General",
        configName: "Info",
        title: `&6&l&dStella Routes`,
        description: "&bMade by NEXD_",
        centered: true,
        subcategory: "",
    })

    .addButton({
        category: "General",
        subcategory: "",
        configName: "MyDiscord",
        title: "Discord Server",
        description: "Join if you want to report a bug or want to make a suggestion", // The description for this [Button] to display in the [Theme]
        tags: ["discord"],
        onClick(setting) {
            ChatLib.command("ct copy coming soon", true);
            ChatLib.chat("&6Copied Discord Link!");
        },
    })

    .addButton({
        category: "General",
        subcategory: "",
        configName: "MyGithub",
        title: "Github",
        description: "The source code for all this :D",
        tags: ["github"],
        onClick(setting) {
            ChatLib.command("ct copy https://github.com/Eclipse-5214/stellaRoutes", true);
            ChatLib.chat("&6Copied Github Link!");
        },
    })

    //Secret routes

    //general options
    .addSwitch({
        configName: "modEnabled",
        title: "Render Routes",
        description: "Main toggle",
        category: "Routes",
        subcatagory: "General",
        value: true,
    })

    .addSwitch({
        configName: "boxSecrets",
        title: "Box Secrets",
        description: "Wether or not to box secrets",
        category: "Routes",
        subcatagory: "General",
        value: true,
    })

    .addSwitch({
        configName: "showText",
        title: "ShowText",
        description: "wether or not to show text",
        category: "Routes",
        subcatagory: "General",
        value: true,
    })

    //keybinds

    .addKeybind({
        category: "Routes",
        subcategory: "Keybinds",
        configName: "nextStep",
        title: "Next Step",
        description: "Goes to the next step",
        value: 27,
    })

    .addKeybind({
        category: "Routes",
        subcategory: "Keybinds",
        configName: "lastStep",
        title: "Last Step",
        description: "Goes back to the last step",
        value: 26,
    })

    .addKeybind({
        category: "Routes",
        subcategory: "Keybinds",
        configName: "resetStep",
        title: "Reset",
        description: "Resets the route",
        value: 43,
    })

    //line stuff
    .addDropDown({
        configName: "lineType",
        title: "Line Type",
        description: "Type of secret line",
        category: "Routes",
        subcategory: "Line",
        options: ["Fire Particles", "Lines", "None"],
        value: 0,
    })

    .addSlider({
        configName: "lineWidth",
        title: "Line width",
        description: "Line width (not for particles)",
        category: "Routes",
        subcategory: "Line",
        options: [1, 5],
        value: 2,
    })

    .addColorPicker({
        configName: "lineColor",
        title: "Line Color",
        description: "The color to use for the line.",
        category: "Routes",
        subcategory: "Line",
        value: [255, 0, 0, 255],
    })

    //boxcolors
    .addColorPicker({
        configName: "warpColor",
        title: "Etherwarp Color",
        description: "The color to use for the etherwarps.",
        category: "Routes",
        subcategory: "Colors",
        value: [0, 0, 255, 255],
    })

    .addColorPicker({
        configName: "mineColor",
        title: "Stonk Color",
        description: "The color to use for the ghost blocks.",
        category: "Routes",
        subcategory: "Colors",
        value: [255, 0, 255, 255],
    })

    .addColorPicker({
        configName: "tntColor",
        title: "Superboom Color",
        description: "The color to use for the Superbooms.",
        category: "Routes",
        subcategory: "Colors",
        value: [255, 0, 0, 255],
    })

    .addColorPicker({
        configName: "clickColor",
        title: "Lever Color",
        description: "The color to use for levers and other interactions.",
        category: "Routes",
        subcategory: "Colors",
        value: [255, 255, 0, 255],
    })

    .addColorPicker({
        configName: "secretColor",
        title: "Secret Color",
        description: "The color to use for Secrets.",
        category: "Routes",
        subcategory: "Colors",
        value: [0, 255, 0, 255],
    })

    //Secret waypoints

    //general
    .addSwitch({
        configName: "secretWaypoints",
        title: "Secret Waypoints",
        description: "Displays secret waypoints",
        category: "Waypoints",
        subcatagory: "General",
    })

    .addSwitch({
        configName: "boxWSecrets",
        title: "Box Secrets",
        description: "wether or not to box secrets",
        category: "Waypoints",
        subcatagory: "General",
        value: true,
    })

    .addSwitch({
        configName: "showWText",
        title: "ShowText",
        description: "wether or not to show text",
        category: "Waypoints",
        subcatagory: "General",
        value: true,
    })

    //colors

    .addColorPicker({
        configName: "chestColor",
        title: "Chest Color",
        description: "The color to use for chests.",
        category: "Waypoints",
        subcategory: "Colors",
        value: [0, 255, 0, 255],
    })

    .addColorPicker({
        configName: "witherColor",
        title: "Wither Essence Color",
        description: "The color to use for the wither essence.",
        category: "Waypoints",
        subcategory: "Colors",
        value: [255, 0, 255, 255],
    })

    .addColorPicker({
        configName: "itemColor",
        title: "Item Color",
        description: "The color to use for items.",
        category: "Waypoints",
        subcategory: "Colors",
        value: [0, 0, 255, 255],
    })

    .addColorPicker({
        configName: "batColor",
        title: "Bat Color",
        description: "The color to use for bats.",
        category: "Waypoints",
        subcategory: "Colors",
        value: [0, 255, 0, 255],
    })

    .addColorPicker({
        configName: "redstoneColor",
        title: "Redstone Key Color",
        description: "The color to use for the redstone keys.",
        category: "Waypoints",
        subcategory: "Colors",
        value: [255, 0, 0, 255],
    });

const config = new Settings("stellaRoutes", defaultConf, "data/ColorScheme.json").addMarkdown("Changelog", CHANGELOG).addMarkdown("Credits", CREDITS);
const currentScheme = "../../stella/data/ColorScheme.json";

config.setPos(config.settings.x, config.settings.y).setSize(config.settings.width, config.settings.height).setScheme(currentScheme).apply();

export default () => config.settings;
