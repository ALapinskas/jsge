ScreenPage has few different loading stages:

1. constructor() - the default class stage, is called once right after page has registered in the app with [System.registerPage]{@link System#registerPage}. \
Nothing special happens here.

2. register() - here {@link SystemInterface}, includes {@link SystemSettings} (systemSettings), {@link SystemAudioInterface}(audio) and {@link SystemSocketConnection}(network) are attached to the {@link ScreenPage}. \
This is a place where assets should be added: {@tutorial assets_manager}, {@tutorial how_to_add_and_use_audio}

3. init() - is called after the [SystemInterface.startScreenPage()]{@link SystemInterface#startScreenPage} is called, this stage called only once pear game. Assets, which were added at the register(2) stage, will be already loaded and ready to be used here. \
   start() - is called right after init() the stage. If the page will be stopped with the SystemInterface stopScreenPage() and then restarted again it will be called without the init() on the second start.
4. stop() - is called after [SystemInterface.stopScreenPage()]{@link SystemInterface#stopScreenPage}  is called. Can be used for shutdown the page, remove listeners etc.

All methods above can be overwritten.

 <img src="loading_stages.png">