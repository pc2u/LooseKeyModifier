import {ItemHelper} from "@spt/helpers/ItemHelper";
import {ISpawnpoint} from "@spt/models/eft/common/ILooseLoot";
import {BaseClasses} from "@spt/models/enums/BaseClasses";
import type {IPostDBLoadMod} from "@spt/models/external/IPostDBLoadMod";
import {DatabaseServer} from "@spt/servers/DatabaseServer";
import {DependencyContainer} from "tsyringe";

import config from "../config/config.json";
import {IStaticLootDetails, ItemDistribution} from "@spt/models/eft/common/ILocation";
import {ILogger} from "@spt/models/spt/utils/ILogger";
import {LogTextColor} from "@spt/models/spt/logging/LogTextColor";

class Lkm implements IPostDBLoadMod {
    private static readonly DRAWER_ID = "578f87b7245977356274f2cd";
    private static readonly JACKET_ID = "578f8778245977358849a9b5";

    public postDBLoad(container: DependencyContainer): void {
        const databaseServer: DatabaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const logger = container.resolve<ILogger>("WinstonLogger");
        const itemHelper = container.resolve<ItemHelper>("ItemHelper");
        const database = databaseServer.getTables();
        const locations = database.locations;

        let count = 0;
        let looseCount = 0;
        let looseKCount = 0;

        for (const mapId in locations) {
            const staticLoot = locations[mapId]?.staticLoot;
            if (staticLoot) {
                count += this.updateStaticLoot(staticLoot, itemHelper);
            }

            const spawnPoints = locations[mapId]?.looseLoot?.spawnpoints;
            if (spawnPoints) {
                const {looseCount: lc, looseKCount: lkc} = this.updateLocationSpawnPoints(spawnPoints, itemHelper);
                looseCount += lc;
                looseKCount += lkc;
            }
        }

        this.logResults(logger, count, looseCount, looseKCount);
    }

    private updateLocationSpawnPoints(spawnPoints: ISpawnpoint[], itemHelper: ItemHelper) {
        let looseCount = 0;
        let looseKCount = 0;

        for (const spawnPoint of spawnPoints) {
            for (const item of spawnPoint.template.Items) {
                if (itemHelper.isOfBaseclass(item._tpl, BaseClasses.KEY_MECHANICAL)) {
                    looseCount += this.updateKeyProbability(spawnPoint, item);
                } else if (itemHelper.isOfBaseclass(item._tpl, BaseClasses.KEYCARD) && config.AlterKeyCardProbability) {
                    looseKCount += this.updateKeycardProbability(spawnPoint, item);
                }
            }
        }

        return {looseCount, looseKCount};
    }

    private updateKeyProbability(spawnPoint: ISpawnpoint, item: any): number {
        const matchingItem = spawnPoint.itemDistribution.find(x => x.composedKey.key === item._id);
        if (matchingItem) {
            if (spawnPoint.probability < config.LooseKeyPileProbability) {
                spawnPoint.probability = config.LooseKeyPileProbability;
            }
            if (matchingItem.relativeProbability < config.relativeProbabilityThreshold) {
                matchingItem.relativeProbability *= config.relativeProbabilitymultiplier;
            }
            return 1;
        }
        return 0;
    }

    private updateKeycardProbability(spawnPoint: ISpawnpoint, item: any): number {
        const matchingItem = spawnPoint.itemDistribution.find(x => x.composedKey.key === item._id);
        if (matchingItem) {
            if (spawnPoint.probability < config.LooseKeycardProbability) {
                spawnPoint.probability = config.LooseKeycardProbability;
                return 1;
            }
        }
        return 0;
    }

    private updateStaticLoot(staticLoot: Record<string, IStaticLootDetails>, itemHelper: ItemHelper): number {
        let count = 0;

        for (const staticName in staticLoot) {
            const staticy = staticLoot[staticName]?.itemDistribution;
            if (!staticy) continue;

            if (staticName === Lkm.DRAWER_ID) {
                count += this.updateStaticItemDistribution(staticy, itemHelper, config.drawerStaticRelativeProbability);
            } else if (staticName === Lkm.JACKET_ID) {
                count += this.updateStaticItemDistribution(staticy, itemHelper, config.jacketStaticRelativeProbability);
            }
        }

        return count;
    }

    private updateStaticItemDistribution(staticy: ItemDistribution[], itemHelper: ItemHelper, probability: number): number {
        let count = 0;

        for (const itemDistribution of staticy) {
            if (itemHelper.isOfBaseclass(itemDistribution.tpl, BaseClasses.KEY_MECHANICAL)) {
                const matchingItem = staticy.find(s => s.tpl === itemDistribution.tpl);
                if (matchingItem && itemDistribution.relativeProbability < probability) {
                    itemDistribution.relativeProbability = probability;
                    count++;
                }
            }
        }

        return count;
    }

    private logResults(logger: ILogger, staticCount: number, looseCount: number, looseKCount: number): void {
        if (looseCount === 0 && looseKCount === 0) {
            logger.logWithColor("No Items modified. Check config parameters", LogTextColor.RED);
        } else {
            logger.logWithColor(`Finished Altering ${staticCount} static loot positions`, LogTextColor.GREEN);
            logger.logWithColor(`Finished Altering ${looseCount} looseloot keys and ${looseKCount} looseloot keycards`, LogTextColor.GREEN);
        }
    }
}

module.exports = {mod: new Lkm()};