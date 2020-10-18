import { ChannelAudience } from './ChannelAudience';
/**
 * Audience class representing other players in the same room as the sender
 * Could even be used to broadcast to NPCs if you want them to pick up on dialogue,
 * just make them broadcastables.
 *
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
export class RoomAudience extends ChannelAudience {
    getBroadcastTargets() {
        var _a, _b;
        return (((_b = (_a = this.sender) === null || _a === void 0 ? void 0 : _a.room) === null || _b === void 0 ? void 0 : _b.getBroadcastTargets().filter((target) => target !== this.sender)) || []);
    }
}
