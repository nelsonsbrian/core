"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoMessageError = exports.NoRecipientError = exports.NoPartyError = exports.Channel = void 0;
const Broadcast_1 = require("./Broadcast");
const PartyAudience_1 = require("./PartyAudience");
const PrivateAudience_1 = require("./PrivateAudience");
const WorldAudience_1 = require("./WorldAudience");
/**
 * @property {ChannelAudience} audience People who receive messages from this channel
 * @property {string} name  Actual name of the channel the user will type
 * @property {string} color Default color. This is purely a helper if you're using default format methods
 * @property {PlayerRoles} minRequiredRole If set only players with the given role or greater can use the channel
 * @property {string} description
 * @property {{sender: function, target: function}} [formatter]
 * @property {boolean} eventOnly If true, only channel events will be fired in response to a message, without
 * explicitly sending the message to players
 */
class Channel {
    /**
     * @param {object}  config
     * @param {string} config.name Name of the channel
     * @param {ChannelAudience} config.audience
     * @param {string} [config.description]
     * @param {PlayerRoles} [config.minRequiredRole]
     * @param {string} [config.color]
     * @param {{sender: function, target: function}} [config.formatter]
     * @param {boolean} [config.eventOnly]
     */
    constructor(config) {
        if (!config.name) {
            throw new Error('Channels must have a name to be usable.');
        }
        if (!config.audience) {
            throw new Error(`Channel ${config.name} is missing a valid audience.`);
        }
        this.name = config.name;
        this.minRequiredRole =
            typeof config.minRequiredRole !== 'undefined'
                ? config.minRequiredRole
                : null;
        this.description = config.description;
        this.bundle = config.bundle || null; // for debugging purposes, which bundle it came from
        this.audience = config.audience || new WorldAudience_1.WorldAudience();
        this.color = config.color || null;
        this.aliases = config.aliases || null;
        this.formatter = config.formatter || {
            sender: this.formatToSender.bind(this),
            target: this.formatToReceipient.bind(this),
        };
        this.eventOnly = config.eventOnly || false;
    }
    /**
     * @param {GameState} state
     * @param {Player}    sender
     * @param {string}    message
     * @fires GameEntity#channelReceive
     * @fires GameEntity#channelSend
     */
    send(state, sender, message) {
        // If they don't include a message, explain how to use the channel.
        if (!message.length) {
            throw new NoMessageError();
        }
        if (!this.audience) {
            throw new Error(`Channel [${this.name} has invalid audience [${this.audience}]`);
        }
        this.audience.configure({ state, sender, message });
        const targets = this.audience.getBroadcastTargets();
        if (this.audience instanceof PartyAudience_1.PartyAudience && !sender.party) {
            throw new NoPartyError();
        }
        // Allow audience to change message e.g., strip target name.
        message = this.audience.alterMessage(message);
        // Send messages with Broadcast unless the channel is eventOnly.
        if (!this.eventOnly) {
            // Private channels also send the target player to the formatter
            if (this.audience instanceof PrivateAudience_1.PrivateAudience) {
                Broadcast_1.Broadcast.sayAt(sender, this.formatter.sender(sender, targets[0], message, this.colorify.bind(this)));
            }
            else {
                Broadcast_1.Broadcast.sayAt(sender, this.formatter.sender(sender, null, message, this.colorify.bind(this)));
            }
            if (!message.length) {
                throw new NoMessageError();
            }
            const target = targets[0];
            Broadcast_1.Broadcast.sayAt(sender, this.formatter.sender(sender, target, message, this.colorify.bind(this)));
        }
        else {
            Broadcast_1.Broadcast.sayAt(sender, this.formatter.sender(sender, null, message, this.colorify.bind(this)));
        }
        // send to audience targets
        Broadcast_1.Broadcast.sayAtFormatted(this.audience, message, (target, message) => {
            return this.formatter.target(sender, target, message, this.colorify.bind(this));
        });
        // strip color tags
        const rawMessage = message.replace(/\<\/?\w+?\>/gm, '');
        // Emit channel events
        /**
         * @event GameEntity#channelSend
         * @param {Channel} channel
         * @param {string} rawMessage
         */
        sender.emit('channelSend', this, rawMessage);
        for (const target of targets) {
            /**
             * Docs limit this to be for GameEntity (Area/Room/Item) but also applies
             * to NPC and Player
             *
             * @event GameEntity#channelReceive
             * @param {Channel} channel
             * @param {Character} sender
             * @param {string} rawMessage
             */
            target.emit('channelReceive', this, sender, rawMessage);
        }
    }
    describeSelf(sender) {
        Broadcast_1.Broadcast.sayAt(sender, `\r\nChannel: ${this.name}`);
        Broadcast_1.Broadcast.sayAt(sender, 'Syntax: ' + this.getUsage());
        if (this.description) {
            Broadcast_1.Broadcast.sayAt(sender, this.description);
        }
    }
    getUsage() {
        if (this.audience instanceof PrivateAudience_1.PrivateAudience) {
            return `${this.name} <target> [message]`;
        }
        return `${this.name} [message]`;
    }
    /**
     * How to render the message the player just sent to the channel
     * E.g., you may want "chat" to say "You chat, 'message here'"
     * @param {Player} sender
     * @param {Player} target
     * @param {string} message
     * @param {Function} colorify
     * @return {string}
     */
    formatToSender(sender, target, message, colorify) {
        return colorify(`[${this.name}] ${sender.name}: ${message}`);
    }
    /**
     * How to render the message to everyone else
     * E.g., you may want "chat" to say "Playername chats, 'message here'"
     * @param {Player} sender
     * @param {Player} target
     * @param {string} message
     * @param {Function} colorify
     * @return {string}
     */
    formatToReceipient(sender, target, message, colorify) {
        return this.formatToSender(sender, target, message, colorify);
    }
    colorify(message) {
        if (!this.color) {
            return message;
        }
        const colors = Array.isArray(this.color) ? this.color : [this.color];
        const open = colors.map((color) => `<${color}>`).join('');
        const close = colors
            .reverse()
            .map((color) => `</${color}>`)
            .join('');
        return open + message + close;
    }
}
exports.Channel = Channel;
class NoPartyError extends Error {
}
exports.NoPartyError = NoPartyError;
class NoRecipientError extends Error {
}
exports.NoRecipientError = NoRecipientError;
class NoMessageError extends Error {
}
exports.NoMessageError = NoMessageError;
