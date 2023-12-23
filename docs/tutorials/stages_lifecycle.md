GameStage has a lifecycle methods:

1. constructor() - the default class method, is called once right after stage has registered in the app with [System.registerStage]{@link System#registerStage}. \
Nothing special happens here.

2. register() - here {@link ISystem}, includes {@link SystemSettings} (systemSettings), {@link ISystemAudio}(audio) and {@link INetwork}(network) are attached to the {@link GameStage}. \
This is a place where assets should be added: {@tutorial assets_manager}, {@tutorial how_to_add_and_use_audio}

3. init() - is called after the [ISystem.startGameStage()]{@link ISystem#startGameStage} is called, this stage called only once pear game. Assets, which were added at the register(2) stage, will be already loaded and ready to be used here. \
   start() - is called right after init() the stage. If the stage will be stopped with the ISystem stopGameStage() and then restarted again it will be called without the init() on the second start.
4. stop() - is called after [ISystem.stopGameStage()]{@link ISystem#stopGameStage}  is called. Can be used for shutdown the stage, remove listeners etc.

All methods above can be overwritten.

 <img src="loading_stages.png">