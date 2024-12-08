# LooseKeyModifier
LooseKeyModifier for SPTarkov, Originally made by Kaeno 

A truly special thank you to Kaeno for originally making this mod, also thank you to Echo55 and Ru Kira for you help with teaching me the basics of Typescript, and helping me with updating the codebase.

Config Settings and what they do.


-- Loose Loot Keys --

relativeProbabilityThreshold : 3 Anything lower than relativeProbabilityThreshold Will be modified by the Multiplier below. Should probably leave this alone if you dont know what this means.

relativeProbabilitymultiplier: 20 Multiplier mentioned above

LooseKeyPileProbability: 0.10, This alters spawn point probabilites lower than this setting and leaving higher probabilities alone. (Loose Loot Spawn Point)


-- Loose Loot KeyCard --

AlterKeyCardProbability: true, If enabled keycard spawn probabilities will be changed

LooseKeycardProbability: 0.02 This alters spawn point probabilites lower than this setting and leaving higher probabilities alone. (Loose Loot Spawn Point)


-- Container Keys --

drawerStaticRelativeProbability: 1658 This value is based of the chance of the "Yotota Key" Spawning inside of a drawer anything below this value will get changed to the number. I have halved the value so keys are half as likely to spawn Yotota Key. Based off 3.7 loot values mileage may vary


jacketStaticRelativeProbability: 829 This value is based of the chance of the "Yotota Key" Spawning inside of a jacket anything below this value will get changed to the number. Based off 3.7 loot values mileage may vary


Due to the way the LooseLoot Generation happens on map start there is also a chance that it will never pick that spawnpoint pile even when lootPileProbability is at 1(100%) to get around this increase your loose loot map multiplier with ur aio of choice.


Slight oversight. If the staticRelativeProbabilty is too high keys that are usually really rare in some containers might become super common be careful adjusting this number. Consider lowering it slot to compensate.