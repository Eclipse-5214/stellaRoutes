//borrowed from soopyV2

/*  ------------- Render Utilities --------------

    Utilities for rendering stuff

    ------------------- To Do -------------------

    - Nothing :D

    --------------------------------------------- */

if (!GlStateManager) {
    var GL11 = Java.type("org.lwjgl.opengl.GL11"); // Using var so it goes to global scope
    var GlStateManager = Java.type("net.minecraft.client.renderer.GlStateManager");
}

let ret = {
    /* accepts parameters
     * h  Object = {h:x, s:y, v:z}
     * OR
     * h, s, v
     */
    drawLine: function (x, y, z, x2, y2, z2, r, g, b, thickness = 1) {
        GL11.glBlendFunc(770, 771);
        GL11.glEnable(GL11.GL_BLEND);
        GL11.glLineWidth(thickness);
        GL11.glDisable(GL11.GL_TEXTURE_2D);
        GL11.glDepthMask(false);
        GlStateManager.func_179094_E();

        Tessellator.begin(GL11.GL_LINE_STRIP).colorize(r, g, b);

        Tessellator.pos(x, y, z);
        Tessellator.pos(x2, y2, z2);

        Tessellator.draw();

        GlStateManager.func_179121_F();
        GL11.glEnable(GL11.GL_TEXTURE_2D);
        GL11.glDepthMask(true);
        GL11.glDisable(GL11.GL_BLEND);
    },
    drawBoxAtBlock: function (x, y, z, colorR, colorG, colorB, w = 1, h = 1, a = 1) {
        GL11.glBlendFunc(770, 771);
        GL11.glEnable(GL11.GL_BLEND);
        GL11.glLineWidth(3);
        GL11.glDisable(GL11.GL_TEXTURE_2D);
        GL11.glDisable(GL11.GL_DEPTH_TEST);
        GL11.glDepthMask(false);
        Tessellator.pushMatrix();

        Tessellator.begin(GL11.GL_LINE_STRIP).colorize(colorR, colorG, colorB, a);

        Tessellator.pos(x + w, y + h, z + w);
        Tessellator.pos(x + w, y + h, z);
        Tessellator.pos(x, y + h, z);
        Tessellator.pos(x, y + h, z + w);
        Tessellator.pos(x + w, y + h, z + w);
        Tessellator.pos(x + w, y, z + w);
        Tessellator.pos(x + w, y, z);
        Tessellator.pos(x, y, z);
        Tessellator.pos(x, y, z + w);
        Tessellator.pos(x, y, z);
        Tessellator.pos(x, y + h, z);
        Tessellator.pos(x, y, z);
        Tessellator.pos(x + w, y, z);
        Tessellator.pos(x + w, y + h, z);
        Tessellator.pos(x + w, y, z);
        Tessellator.pos(x + w, y, z + w);
        Tessellator.pos(x, y, z + w);
        Tessellator.pos(x, y + h, z + w);
        Tessellator.pos(x + w, y + h, z + w);

        Tessellator.draw();

        Tessellator.popMatrix();
        GL11.glEnable(GL11.GL_TEXTURE_2D);
        GL11.glEnable(GL11.GL_DEPTH_TEST);
        GL11.glDepthMask(true);
        GL11.glDisable(GL11.GL_BLEND);
    },
    drawFilledBox: function (x, y, z, w, h, red, green, blue, alpha, phase) {
        // FROM RENDERUTILS
        GL11.glDisable(GL11.GL_CULL_FACE);
        if (phase) {
            GL11.glBlendFunc(770, 771);
            GL11.glEnable(GL11.GL_BLEND);
            GL11.glLineWidth(2.0);
            GL11.glDisable(GL11.GL_TEXTURE_2D);
            GL11.glDisable(GL11.GL_DEPTH_TEST);
            GL11.glDepthMask(false);
            GlStateManager.func_179094_E();
        } else {
            GL11.glDisable(GL11.GL_TEXTURE_2D);
            GL11.glBlendFunc(770, 771);
            GL11.glEnable(GL11.GL_BLEND);
            GL11.glLineWidth(2.0);
            GL11.glDepthMask(false);
            GlStateManager.func_179094_E();
        }

        w /= 2;

        Tessellator.begin(GL11.GL_QUADS, false);
        Tessellator.colorize(red, green, blue, alpha);

        Tessellator.translate(x, y, z)
            .pos(w, 0, w)
            .pos(w, 0, -w)
            .pos(-w, 0, -w)
            .pos(-w, 0, w)

            .pos(w, h, w)
            .pos(w, h, -w)
            .pos(-w, h, -w)
            .pos(-w, h, w)

            .pos(-w, h, w)
            .pos(-w, h, -w)
            .pos(-w, 0, -w)
            .pos(-w, 0, w)

            .pos(w, h, w)
            .pos(w, h, -w)
            .pos(w, 0, -w)
            .pos(w, 0, w)

            .pos(w, h, -w)
            .pos(-w, h, -w)
            .pos(-w, 0, -w)
            .pos(w, 0, -w)

            .pos(-w, h, w)
            .pos(w, h, w)
            .pos(w, 0, w)
            .pos(-w, 0, w)
            .draw();

        GL11.glEnable(GL11.GL_CULL_FACE);
        if (phase) {
            GlStateManager.func_179121_F();
            GL11.glEnable(GL11.GL_TEXTURE_2D);
            GL11.glEnable(GL11.GL_DEPTH_TEST);
            GL11.glDepthMask(true);
            GL11.glDisable(GL11.GL_BLEND);
        } else {
            GL11.glEnable(GL11.GL_TEXTURE_2D);
            GlStateManager.func_179121_F();
            GL11.glDepthMask(true);
            GL11.glDisable(GL11.GL_BLEND);
        }
    },
};

module.exports = ret;
