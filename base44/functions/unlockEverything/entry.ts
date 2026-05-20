import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const payload = {
      owned_skins: [
        "classic_white","obsidian","gold","ice","wood","silver","galaxy","dragon_scale",
        "amethyst","moonstone","lava","tesla","teal_crackle","leather","fluorite",
        "aquamarine","aquamarine_light","labradorite","labradorite_polished","yellow_felt",
        "bullet_holes","pride","cash","ruby","crystal_cut","love_is_love","paper",
        "neon_grid","circuit_board","amber_wasp","toxic_plasma_v2","bloodstone","matrix",
        "snow_globe","blue_gel","plasma"
      ],
      owned_pips: ["classic_dots","square_pips","star_pips","heart_pips","diamond_pips"],
      owned_felts: [
        "classic_green","royal_blue","crimson_red","midnight_black","burgundy",
        "forest_pine","amethyst_purple","graphite","ocean_teal","sahara_sand"
      ],
      owned_badges: ["rookie","hot_hand","lucky_seven","high_roller","champion","legend","perfect_10k"],
      coins: 999999,
    };

    const updated = await base44.asServiceRole.entities.User.update(user.id, payload);

    return Response.json({ success: true, updated });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});