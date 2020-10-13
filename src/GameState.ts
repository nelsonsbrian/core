import { AccountManager } from "./AccountManager";
import { AreaFactory } from "./AreaFactory";
import { AreaManager } from "./AreaManager";
import { AttributeFactory } from "./AttributeFactory";
import { BehaviorManager } from "./BehaviorManager";
import { BundleManager } from "./BundleManager";
import { ChannelManager } from "./ChannelManager";
import { CommandManager } from "./CommandManager";
import { DataSourceRegistry } from "./DataSourceRegistry";
import { EffectFactory } from "./EffectFactory";
import { EntityLoaderRegistry } from "./EntityLoaderRegistry";
import { EventManager } from "./EventManager";
import { GameServer } from "./GameServer";
import { HelpManager } from "./HelpManager";
import { ItemFactory } from "./ItemFactory";
import { ItemManager } from "./ItemManager";
import { MobFactory } from "./MobFactory";
import { MobManager } from "./MobManager";
import { PartyManager } from "./PartyManager";
import { PlayerManager } from "./PlayerManager";
import { QuestFactory } from "./QuestFactory";
import { QuestGoalManager } from "./QuestGoalManager";
import { QuestRewardManager } from "./QuestRewardManager";
import { RoomFactory } from "./RoomFactory";
import { RoomManager } from "./RoomManager";
import { SkillManager } from "./SkillManager";

export class GameState {
  AccountManager: AccountManager;
  AreaBehaviorManager: BehaviorManager;
  AreaFactory: AreaFactory;
  AreaManager: AreaManager;
  AttributeFactory: AttributeFactory;
  ChannelManager: ChannelManager;
  CommandManager: CommandManager;
  EffectFactory: EffectFactory;
  HelpManager: HelpManager;
  InputEventManager: EventManager;
  ItemBehaviorManager: BehaviorManager;
  ItemFactory: ItemFactory;
  ItemManager: ItemManager;
  MobBehaviorManager: BehaviorManager;
  MobFactory: MobFactory;
  MobManager: MobManager;
  PartyManager: PartyManager;
  PlayerManager: PlayerManager;
  QuestFactory: QuestFactory;
  QuestGoalManager: QuestGoalManager;
  QuestRewardManager: QuestRewardManager;
  RoomBehaviorManager: BehaviorManager;
  RoomFactory: RoomFactory;
  RoomManager: RoomManager;
  SkillManager: SkillManager;
  SpellManager: SkillManager;
  ServerEventManager: EventManager;
  GameServer: GameServer;
  EntityLoaderRegistry: EntityLoaderRegistry;
  DataSourceRegistry: DataSourceRegistry;
  BundleManager: BundleManager;

  constructor(bundleManager: BundleManager) {
    this.AccountManager = new AccountManager();
    this.AreaBehaviorManager = new BehaviorManager();
    this.AreaFactory = new AreaFactory();
    this.AreaManager = new AreaManager();
    this.AttributeFactory = new AttributeFactory();
    this.ChannelManager = new ChannelManager();
    this.CommandManager = new CommandManager();
    this.EffectFactory = new EffectFactory();
    this.HelpManager = new HelpManager();
    this.InputEventManager = new EventManager();
    this.ItemBehaviorManager = new BehaviorManager();
    this.ItemFactory = new ItemFactory();
    this.ItemManager = new ItemManager();
    this.MobBehaviorManager = new BehaviorManager();
    this.MobFactory = new MobFactory();
    this.MobManager = new MobManager();
    this.PartyManager = new PartyManager();
    this.PlayerManager = new PlayerManager();
    this.QuestFactory = new QuestFactory();
    this.QuestGoalManager = new QuestGoalManager();
    this.QuestRewardManager = new QuestRewardManager();
    this.RoomBehaviorManager = new BehaviorManager();
    this.RoomFactory = new RoomFactory();
    this.RoomManager = new RoomManager();
    this.SkillManager = new SkillManager();
    this.SpellManager = new SkillManager();
    this.ServerEventManager = new EventManager();
    this.GameServer = new GameServer();
    this.EntityLoaderRegistry = new EntityLoaderRegistry();
    this.DataSourceRegistry = new DataSourceRegistry();
    this.BundleManager = bundleManager;
  }
}