import { Npc } from "./Npc";

/**
 * Keeps track of all the individual mobs in the game
 */
export class MobManager {
  mobs: Map<string, Npc>;
  constructor() {
    this.mobs = new Map();
  }

  /**
   * @param {Npc} mob
   */
  addMob(mob: Npc) {
    this.mobs.set(mob.uuid, mob);
  }

  /**
   * Completely obliterate a mob from the game, nuclear option
   * @param {Npc} mob
   */
  removeMob(mob: Npc) {
    mob.effects.clear();

    const sourceRoom = mob.sourceRoom;
    if (sourceRoom) {
      sourceRoom.area.removeNpc(mob);
      sourceRoom.removeNpc(mob, true);
    }

    const room = mob.room;
    if (room && room !== sourceRoom) {
      room.removeNpc(mob);
    }

    if (mob.equipment && mob.equipment.size) {
      mob.equipment.forEach((item, slot) => mob.unequip(slot));
    }
  
    if (mob.inventory && mob.inventory.size) {
      mob.inventory.forEach(item => item.__manager.remove(item));
    }

    mob.__pruned = true;
    mob.removeAllListeners();
    this.mobs.delete(mob.uuid);
  }
}