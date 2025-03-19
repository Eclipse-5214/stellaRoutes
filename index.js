import settings from "./utils/config";
import "./features/secrets";
import "./features/routes";

/*  ------------------- Index -------------------

    Core File    
    I tried to doccument how it works as best as I could

    ------------------- To Do -------------------

    - finish routes stuff

    --------------------------------------------- */

register("command", (...args) => {
    if (!args || !args.length || !args[0]) {
        return settings().getConfig().openGui();
    } else {
        ChatLib.chat("&cUnknown command. &7Try &6/sa help &7for a list of commands");
    }
})
    .setName("stellaroutes")
    .setAliases("sr", "str");
