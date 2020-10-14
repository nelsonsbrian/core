import { ChannelAudience } from './ChannelAudience';
import { PlayerOrNpc } from './GameEntity';

/**
 * Audience class representing other players in the same group as the sender
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
export class PartyAudience extends ChannelAudience {
	getBroadcastTargets() {
		if (!this.sender.party) {
			return [];
		}

		return this.sender.party
			.getBroadcastTargets()
			.filter((player: PlayerOrNpc) => player !== this.sender);
	}
}
