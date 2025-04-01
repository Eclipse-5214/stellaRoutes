const EnumParticleTypes = Java.type("net.minecraft.util.EnumParticleTypes");

/*  ------------- General Utilities -------------

    General skyblok utilities

    ------------------- To Do -------------------

    - Nothing :D

    --------------------------------------------- */

//calculates the distance between 2 points using the 3d distance formula
export const calcDistance = (p1, p2) => {
    var a = p2[0] - p1[0];
    var b = p2[1] - p1[1];
    var c = p2[2] - p1[2];

    let dist = a * a + b * b + c * c;

    if (dist < 0) {
        dist *= -1;
    }
    return dist;
};

//self explanitory
export function spawnParticleAtLocation(loc, velo, particle) {
    let particleType = EnumParticleTypes.valueOf(particle);
    let idField = particleType.getClass().getDeclaredField("field_179372_R");
    idField.setAccessible(true);
    let id = idField.get(particleType);

    Client.getMinecraft().field_71438_f.func_174974_b(
        id, // particleID
        true, // shouldIgnoreRange
        loc[0], // x
        loc[1], // y
        loc[2], // z
        velo[0], // speedX
        velo[1], // speedY
        velo[2] // speedZ
    );
}

//draws a linne of particles
export function drawLineParticles(loc1, loc2) {
    let distance = Math.hypot(...loc1.map((a, i) => a - loc2[i]));
    let maxPoints = Math.ceil(distance * 1);
    for (let i = 0; i < maxPoints; i++) {
        let actualI = i + Math.random();
        let a = actualI / maxPoints;
        let loc = [loc1[0] * a + loc2[0] * (1 - a) - 0.5, loc1[1] * a + loc2[1] * (1 - a) + 0.1, loc1[2] * a + loc2[2] * (1 - a) - 0.5];

        let a2 = (actualI + 0.02) / maxPoints;
        let loc3 = [loc1[0] * a2 + loc2[0] * (1 - a2) - 0.5, loc1[1] * a2 + loc2[1] * (1 - a2) + 0.1, loc1[2] * a2 + loc2[2] * (1 - a2) - 0.5];
        loc3 = loc3.map((a, i) => loc[i] - a);

        spawnParticleAtLocation(loc, loc3, "FLAME");
    }
}
