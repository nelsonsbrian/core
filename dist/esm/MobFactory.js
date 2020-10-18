import { EntityFactory } from './EntityFactory';
import { Npc } from './Npc';
/**
 * Stores definitions of npcs to allow for easy creation/cloning
 * @extends EntityFactory
 */
export class MobFactory extends EntityFactory {
    /**
     * Create a new instance of a given npc definition. Resulting npc will not
     * have its default inventory.  If you want to also populate its default
     * contents you must manually call `npc.hydrate(state)`
     *
     * @param {Area}   area
     * @param {string} entityRef
     * @return {Npc}
     */
    create(area, entityRef) {
        const npc = this.createByType(area, entityRef, Npc);
        npc.area = area;
        return npc;
    }
}
