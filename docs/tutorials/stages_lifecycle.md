The `GameStage` has a lifecycle methods:

1. **GameStage.constructor()** - This is the default class method, called once right after the stage has been registered in the app with [System.registerStage()]{@link System#registerStage}. \
Nothing special happens here.

2. **GameStage.register()** - In this method, {@link ISystem}, which includes {@link SystemSettings} (systemSettings), {@link ISystemAudio}(audio), and {@link INetwork}(network), are attached to the {@link GameStage}. This is the place where assets should be added (see {@tutorial assets_manager} and {@tutorial how_to_add_and_use_audio}).

3. **GameStage.init()** - This method is called after [ISystem.startGameStage()]{@link ISystem#startGameStage} is invoked. It is called only once per game. Assets that were added in the register() stage will already be loaded and ready to be used here. 

4. **GameStage.start()** - This method is called right after GameStage.init(). If the stage is stopped with ISystem.stopGameStage() and then restarted, it will be called again without invoking GameStage.init() on the second start.

5. **GameStage.stop()** - This method is called after [ISystem.stopGameStage()]{@link ISystem#stopGameStage} is invoked. It can be used to shut down the stage, remove listeners, etc.

All methods above can be overwritten.

<img src="lifecycle.png">