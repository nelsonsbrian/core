'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const Character_1 = require("./Character");
const CommandQueue_1 = require("./CommandQueue");
const Config_1 = require("./Config");
const Logger_1 = require("./Logger");
const PlayerRoles_1 = require("./PlayerRoles");
const QuestTracker_1 = require("./QuestTracker");
/**
 * @property {Account} account
 * @property {number}  experience current experience this level
 * @property {string}  password
 * @property {string}  prompt     default prompt string
 * @property {net.Socket} socket
 * @property {QuestTracker} questTracker
 * @property {Map<string,function ()>} extraPrompts Extra prompts to render after the default prompt
 * @property {{completed: Array, active: Array}} questData
 * @extends Character
 */
class Player extends Character_1.Character {
    constructor(data) {
        super(data);
        this.__hydrated = false;
        this.__pruned = false;
        this.account = data.account || null;
        this.experience = data.experience || 0;
        this.extraPrompts = new Map();
        this.password = data.password;
        this.prompt = data.prompt || '> ';
        this.socket = data.socket || null;
        const questData = Object.assign({
            completed: [],
            active: [],
        }, data.quests);
        this.questTracker = new QuestTracker_1.QuestTracker(this, questData.active, questData.completed);
        this.commandQueue = new CommandQueue_1.CommandQueue();
        this.role = data.role || PlayerRoles_1.PlayerRoles.PLAYER;
        // Default max inventory size config
        if (!isFinite(this.inventory.getMax())) {
            this.inventory.setMax(Config_1.Config.get('defaultMaxPlayerInventory', 20));
        }
    }
    /**
     * @see CommandQueue::enqueue
     */
    queueCommand(executable, lag) {
        const index = this.commandQueue.enqueue(executable, lag);
        this.emit('commandQueued', index);
    }
    /**
     * Proxy all events on the player to the quest tracker
     * @param {string} event
     * @param {...*}   args
     */
    emit(event, ...args) {
        if (this.__pruned || !this.__hydrated) {
            return false;
        }
        const result = super.emit(event, ...args);
        this.questTracker.emit(event, ...args);
        return result;
    }
    /**
     * Convert prompt tokens into actual data
     * @param {string} promptStr
     * @param {object} extraData Any extra data to give the prompt access to
     */
    interpolatePrompt(promptStr, extraData = {}) {
        let attributeData = {};
        for (const [attr, value] of this.attributes) {
            attributeData[attr] = {
                current: this.getAttribute(attr),
                max: this.getMaxAttribute(attr),
                base: this.getBaseAttribute(attr),
            };
        }
        const promptData = Object.assign(attributeData, extraData);
        let matches = null;
        while ((matches = promptStr.match(/%([a-z\.]+)%/))) {
            const token = matches[1];
            let promptValue = token
                .split('.')
                .reduce((obj, index) => obj && obj[index], promptData);
            if (promptValue === null || promptValue === undefined) {
                promptValue = 'invalid-token';
            }
            promptStr = promptStr.replace(matches[0], promptValue);
        }
        return promptStr;
    }
    /**
     * Add a line of text to be displayed immediately after the prompt when the prompt is displayed
     * @param {string}      id       Unique prompt id
     * @param {function ()} renderer Function to call to render the prompt string
     * @param {?boolean}    removeOnRender When true prompt will remove itself once rendered
     *    otherwise prompt will continue to be rendered until removed.
     */
    addPrompt(id, renderer, removeOnRender = false) {
        this.extraPrompts.set(id, { removeOnRender, renderer });
    }
    /**
     * @param {string} id
     */
    removePrompt(id) {
        this.extraPrompts.delete(id);
    }
    /**
     * @param {string} id
     * @return {boolean}
     */
    hasPrompt(id) {
        return this.extraPrompts.has(id);
    }
    /**
     * Move the player to the given room, emitting events appropriately
     * @param {Room} nextRoom
     * @param {function} onMoved Function to run after the player is moved to the next room but before enter events are fired
     * @fires Room#playerLeave
     * @fires Room#playerEnter
     * @fires Player#enterRoom
     */
    moveTo(nextRoom, onMoved = (_) => _) {
        const prevRoom = this.room;
        if (this.room && this.room !== nextRoom) {
            /**
             * @event Room#playerLeave
             * @param {Player} player
             * @param {Room} nextRoom
             */
            this.room.emit('playerLeave', this, nextRoom);
            this.room.removePlayer(this);
        }
        this.room = nextRoom;
        nextRoom.addPlayer(this);
        onMoved();
        /**
         * @event Room#playerEnter
         * @param {Player} player
         * @param {Room} prevRoom
         */
        nextRoom.emit('playerEnter', this, prevRoom);
        /**
         * @event Player#enterRoom
         * @param {Room} room
         */
        this.emit('enterRoom', nextRoom);
    }
    save(callback) {
        if (!this.__hydrated) {
            return;
        }
        this.emit('save', callback);
    }
    hydrate(state) {
        super.hydrate(state);
        // QuestTracker has to be hydrated before the rest otherwise events fired by the subsequent
        // hydration will be emitted onto unhydrated quest objects and error
        this.questTracker.hydrate(state);
        // Hydrate inventory
        this.inventory.hydrate(state, this);
        // Hydrate equipment
        // maybe refactor Equipment to be an object like Inventory?
        if (this.equipment && !(this.equipment instanceof Map)) {
            const eqDefs = this.equipment;
            this.equipment = new Map();
            for (const slot in eqDefs) {
                const itemDef = eqDefs[slot];
                try {
                    let newItem = state.ItemFactory.create(state.AreaManager.getArea(itemDef.area), itemDef.entityReference);
                    newItem.initializeInventoryFromSerialized(itemDef.inventory);
                    newItem.hydrate(state, itemDef);
                    state.ItemManager.add(newItem);
                    this.equip(newItem, slot);
                    /**
                     * @event Item#spawn
                     */
                    newItem.emit('spawn', { type: Player });
                }
                catch (e) {
                    Logger_1.Logger.error(e.message);
                }
            }
        }
        else {
            this.equipment = new Map();
        }
        if (typeof this.room === 'string') {
            let room = state.RoomManager.getRoom(this.room);
            if (!room) {
                Logger_1.Logger.error(`ERROR: Player ${this.name} was saved to invalid room ${this.room}.`);
                room = state.AreaManager.getPlaceholderArea().getRoomById('placeholder');
            }
            this.room = room;
            this.moveTo(room);
        }
    }
    serialize() {
        var _a;
        const account = ((_a = this.account) === null || _a === void 0 ? void 0 : _a.name) || '';
        const experience = this.experience;
        const inventory = this.inventory && this.inventory.serialize();
        const metadata = this.metadata || {};
        const password = this.password;
        const prompt = this.prompt;
        const quests = this.questTracker.serialize();
        const role = this.role;
        const data = Object.assign(super.serialize(), {
            account,
            experience,
            inventory,
            metadata,
            password,
            prompt,
            quests,
            role,
            _id: this.name,
        });
        if (this.equipment instanceof Map) {
            let eq = {};
            for (let [slot, item] of this.equipment) {
                eq[slot] = item.serialize();
            }
            data.equipment = eq;
        }
        else {
            data.equipment = null;
        }
        return data;
    }
}
exports.Player = Player;
